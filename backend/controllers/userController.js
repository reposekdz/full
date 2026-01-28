const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const smsService = require('../services/smsService');

const router = express.Router();

// Get all users with pagination and filtering
router.get('/', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster')
], async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (role) {
      whereClause += ' AND r.name = ?';
      params.push(role);
    }

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status !== undefined) {
      whereClause += ' AND u.is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereClause}
    `, params);

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        password_hash: undefined // Don't send password hash
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user by ID
router.get('/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'teacher')
], async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    delete user.password_hash;

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new user
router.post('/', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('role_id').isInt().withMessage('Valid role ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      username, email, password, first_name, last_name, phone, address,
      date_of_birth, gender, role_id, student_id, parent_id
    } = req.body;

    // Check if username or email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Verify role exists
    const [roles] = await pool.execute('SELECT id FROM roles WHERE id = ?', [role_id]);
    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate student ID if not provided and role is student
    let finalStudentId = student_id;
    if (!finalStudentId && role_id) {
      const [roleInfo] = await pool.execute('SELECT name FROM roles WHERE id = ?', [role_id]);
      if (roleInfo[0]?.name === 'student') {
        const year = new Date().getFullYear();
        const [lastStudent] = await pool.execute(
          'SELECT student_id FROM users WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
          [`${year}%`]
        );
        
        let nextNumber = 1;
        if (lastStudent.length > 0) {
          const lastNumber = parseInt(lastStudent[0].student_id.slice(-4));
          nextNumber = lastNumber + 1;
        }
        
        finalStudentId = `${year}${nextNumber.toString().padStart(4, '0')}`;
      }
    }

    // Create user
    const [result] = await pool.execute(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, phone, address,
        date_of_birth, gender, role_id, student_id, parent_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username, email, hashedPassword, first_name, last_name, phone, address,
      date_of_birth, gender, role_id, finalStudentId, parent_id
    ]);

    // Send welcome message if user is a parent or student
    const [newUserInfo] = await pool.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `, [result.insertId]);

    if (newUserInfo.length > 0) {
      const newUser = newUserInfo[0];
      let welcomeMessage = '';

      if (newUser.role_name === 'parent' && phone) {
        welcomeMessage = `Muraho ${first_name} ${last_name}! Murakaza neza kuri Garden TVET School. Konti yanyu y'umubyeyi yafunguwe neza. Mushobora gukurikirana imyigire y'abana banyu hano.`;
      } else if (newUser.role_name === 'student' && phone) {
        welcomeMessage = `Muraho ${first_name}! Murakaza neza kuri Garden TVET School. Konti yanyu y'umunyeshuri yafunguwe neza. Student ID yanyu ni: ${finalStudentId}`;
      }

      if (welcomeMessage) {
        smsService.sendUniversalMessage(phone, welcomeMessage, 0, {
          type: 'account_creation',
          userId: result.insertId,
          role: newUser.role_name,
          preferredMethod: 'whatsapp'
        }).catch(err => console.error('Failed to send welcome message:', err));
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.insertId,
        username,
        email,
        first_name,
        last_name,
        role_id,
        student_id: finalStudentId
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user
router.put('/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      username, email, first_name, last_name, phone, address,
      date_of_birth, gender, role_id, is_active
    } = req.body;

    // Check if user exists
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate username/email (excluding current user)
    if (username || email) {
      const [duplicates] = await pool.execute(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', id]
      );

      if (duplicates.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
    }

    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (first_name) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (date_of_birth) {
      updates.push('date_of_birth = ?');
      values.push(date_of_birth);
    }
    if (gender) {
      updates.push('gender = ?');
      values.push(gender);
    }
    if (role_id) {
      updates.push('role_id = ?');
      values.push(role_id);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete user
router.delete('/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of current user
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all roles
router.get('/roles/list', [
  authenticateToken
], async (req, res) => {
  try {
    const [roles] = await pool.execute(
      'SELECT * FROM roles WHERE is_active = true ORDER BY name'
    );

    res.json({
      success: true,
      roles
    });

  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Reset user password
router.post('/:id/reset-password', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster'),
  body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { new_password } = req.body;

    // Check if user exists
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get students by class
router.get('/students/by-class/:classId', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'teacher')
], async (req, res) => {
  try {
    const { classId } = req.params;

    const [students] = await pool.execute(`
      SELECT u.*, e.enrollment_date, e.status as enrollment_status
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN roles r ON u.role_id = r.id
      WHERE e.class_id = ? AND r.name = 'student' AND u.is_active = true
      ORDER BY u.first_name, u.last_name
    `, [classId]);

    res.json({
      success: true,
      students: students.map(student => ({
        ...student,
        password_hash: undefined
      }))
    });

  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get teachers
router.get('/teachers/list', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster')
], async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('teacher', 'headmaster', 'director_study', 'director_discipline') 
      AND u.is_active = true
      ORDER BY u.first_name, u.last_name
    `);

    res.json({
      success: true,
      teachers: teachers.map(teacher => ({
        ...teacher,
        password_hash: undefined
      }))
    });

  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
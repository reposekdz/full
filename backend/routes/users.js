const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ================= PROFILE MANAGEMENT =================

// Update user profile (self-update)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone, email, current_password, new_password } = req.body;

    // Get current user data
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    let updateFields = [];
    let updateValues = [];

    // Update basic info
    if (first_name) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    // Handle password change
    if (new_password && current_password) {
      const passwordMatch = await bcrypt.compare(current_password, user.password_hash || user.password);
      if (!passwordMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(query, updateValues);

    // Also update admin_users table if user is admin
    if (['admin', 'super_admin', 'headmaster', 'director_study', 'director_discipline', 'accountant', 'stock_manager', 'patron', 'advisor'].includes(user.role)) {
      try {
        let adminUpdateFields = [];
        let adminUpdateValues = [];

        if (first_name) {
          adminUpdateFields.push('first_name = ?');
          adminUpdateValues.push(first_name);
        }
        if (last_name) {
          adminUpdateFields.push('last_name = ?');
          adminUpdateValues.push(last_name);
        }
        if (phone) {
          adminUpdateFields.push('phone = ?');
          adminUpdateValues.push(phone);
        }
        if (email) {
          adminUpdateFields.push('email = ?');
          adminUpdateValues.push(email);
        }
        if (new_password && current_password) {
          const hashedPassword = await bcrypt.hash(new_password, 10);
          adminUpdateFields.push('password = ?');
          adminUpdateValues.push(hashedPassword);
        }

        if (adminUpdateFields.length > 0) {
          adminUpdateFields.push('updated_at = CURRENT_TIMESTAMP');
          adminUpdateValues.push(user.email);

          const adminQuery = `UPDATE admin_users SET ${adminUpdateFields.join(', ')} WHERE email = ?`;
          await pool.execute(adminQuery, adminUpdateValues);
        }
      } catch (adminError) {
        console.log('Admin table update failed (non-critical):', adminError.message);
      }
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.execute(`
      SELECT id, username, email, first_name, last_name, phone, role, 
             date_of_birth, gender, address, profile_image, is_active, 
             created_at, updated_at
      FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    delete user.password_hash;
    delete user.password;

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ================= USER MANAGEMENT =================

// Get roles list
router.get('/roles/list', authenticateToken, async (req, res) => {
  try {
    const roles = [
      { id: 1, name: 'student', display_name: 'Student' },
      { id: 2, name: 'teacher', display_name: 'Teacher' },
      { id: 3, name: 'parent', display_name: 'Parent' },
      { id: 4, name: 'admin', display_name: 'Admin' },
      { id: 5, name: 'super_admin', display_name: 'Super Admin' },
      { id: 6, name: 'accountant', display_name: 'Accountant' },
      { id: 7, name: 'stock_manager', display_name: 'Stock Manager' },
      { id: 8, name: 'headmaster', display_name: 'Headmaster' },
      { id: 9, name: 'director_study', display_name: 'Director of Studies' },
      { id: 10, name: 'director_discipline', display_name: 'Director of Discipline' }
    ];

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

// Get all users
router.get('/', async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const [users] = await pool.execute(`
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.role_id,
        u.is_active, u.last_login, u.created_at, u.updated_at,
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM users');

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
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

// Create new user
router.post('/', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'headmaster'),
  body('username').optional(),
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

    const { username, email, first_name, last_name, password, phone, role_id, date_of_birth } = req.body;

    // Get role name from role_id
    const [roleResult] = await pool.execute('SELECT name FROM roles WHERE id = ?', [role_id]);
    if (roleResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role_id'
      });
    }
    const role = roleResult[0].name;

    const generatedUsername = username || email.split('@')[0];

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [generatedUsername, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password || 'password123', saltRounds);

    const [result] = await pool.execute(
      `INSERT INTO users (username, email, first_name, last_name, password_hash, phone, role, role_id, date_of_birth) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generatedUsername, email, first_name, last_name, password_hash, phone, role, role_id, date_of_birth]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.insertId,
        username: generatedUsername,
        email,
        first_name,
        last_name,
        phone,
        role
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
  requireRole('admin', 'super_admin', 'headmaster')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, phone, role_id, is_active, date_of_birth } = req.body;

    const [existingUser] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const roleMap = {
      1: 'student', 2: 'teacher', 3: 'parent', 4: 'admin', 5: 'super_admin',
      6: 'accountant', 7: 'stock_manager', 8: 'headmaster', 9: 'director_study', 10: 'director_discipline'
    };
    const role = role_id ? roleMap[role_id] : undefined;

    await pool.execute(`
      UPDATE users SET 
        email = COALESCE(?, email),
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        is_active = COALESCE(?, is_active),
        date_of_birth = COALESCE(?, date_of_birth),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [email, first_name, last_name, phone, role, is_active, date_of_birth, id]);

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
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    const [existingUser] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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

// Get all users (admin only) - legacy route
router.get('/admin/users', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        id, username, email, first_name, last_name, phone, role, 
        is_active, last_login, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get users by role
router.get('/admin/users/role/:role', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { role } = req.params;
    const [users] = await pool.execute(`
      SELECT 
        id, username, email, first_name, last_name, phone, 
        is_active, last_login, created_at
      FROM users 
      WHERE role = ? 
      ORDER BY first_name, last_name
    `, [role]);

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new user
router.post('/admin/users', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'parent', 'admin', 'super_admin', 'accountant', 'stock_manager', 'headmaster', 'director_study', 'director_discipline']).withMessage('Invalid role')
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

    const { username, email, first_name, last_name, password, phone, role } = req.body;

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

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      'INSERT INTO users (username, email, first_name, last_name, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, first_name, last_name, password_hash, phone, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.insertId,
        username,
        email,
        first_name,
        last_name,
        phone,
        role
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
router.put('/admin/users/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required')
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
    const { email, first_name, last_name, phone, role, is_active } = req.body;

    // Check if user exists
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await pool.execute(
      'UPDATE users SET email = ?, first_name = ?, last_name = ?, phone = ?, role = ?, is_active = ? WHERE id = ?',
      [email, first_name, last_name, phone, role, is_active, id]
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
router.delete('/admin/users/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin')
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

// Get user statistics
router.get('/admin/users/stats', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        role,
        COUNT(*) as count,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
      FROM users 
      GROUP BY role
    `);

    const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const [activeUsers] = await pool.execute('SELECT COUNT(*) as active FROM users WHERE is_active = 1');
    const [recentUsers] = await pool.execute(`
      SELECT COUNT(*) as recent 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.json({
      success: true,
      stats: {
        total: totalUsers[0].total,
        active: activeUsers[0].active,
        recent: recentUsers[0].recent,
        by_role: stats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
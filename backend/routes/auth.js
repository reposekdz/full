const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login for both admin_users and users tables
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { username, password } = req.body;
    let user = null;
    let isValidPassword = false;

    // First try admin_users table
    const [adminUsers] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (adminUsers.length > 0) {
      user = adminUsers[0];
      isValidPassword = await bcrypt.compare(password, user.password);
      
      if (isValidPassword) {
        const token = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        // Update last login
        await pool.execute(
          'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
          [user.id]
        );

        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            first_name: user.first_name || user.username,
            last_name: user.last_name || '',
            user_type: 'admin'
          }
        });
      }
    }

    // If not found in admin_users, try users table
    const [users] = await pool.execute(`
      SELECT u.*, COALESCE(r.name, u.role) as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE (u.username = ? OR u.email = ?) AND u.is_active = true
    `, [username, username]);

    if (users.length > 0) {
      user = users[0];
      isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (isValidPassword) {
        const token = jwt.sign(
          { userId: user.id, username: user.username, role: user.role_name },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        // Update last login
        await pool.execute(
          'UPDATE users SET last_login = NOW() WHERE id = ?',
          [user.id]
        );

        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role_name,
            first_name: user.first_name,
            last_name: user.last_name,
            student_id: user.student_id,
            user_type: 'user'
          }
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Enhanced Student Registration
router.post('/register/student', [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('date_of_birth').optional().isDate().withMessage('Valid date of birth required'),
  body('gender').optional().isIn(['Male', 'Female']).withMessage('Valid gender required'),
  body('trade_code').notEmpty().withMessage('Trade selection is required'),
  body('level_number').isInt().withMessage('Level number is required'),
  body('level_suffix').optional(),
  body('address').optional(),
  body('emergency_contact').optional(),
  body('medical_info').optional(),
  body('parent_info').optional()
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      date_of_birth,
      gender,
      trade_code,
      level_number,
      level_suffix,
      address,
      emergency_contact,
      medical_info,
      parent_info
    } = req.body;

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get student role ID
    const [studentRole] = await connection.execute(
      'SELECT id FROM roles WHERE name = "student"'
    );

    if (studentRole.length === 0) {
      throw new Error('Student role not found');
    }

    // Generate student ID
    const year = new Date().getFullYear();
    const tradePrefix = trade_code.toUpperCase();
    const levelSuffix = level_suffix ? `${level_number}${level_suffix}` : level_number;

    const [lastStudent] = await connection.execute(
      'SELECT student_id FROM users WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
      [`${year}${tradePrefix}${levelSuffix}%`]
    );

    let studentNumber = 1;
    if (lastStudent.length > 0) {
      const lastNumber = parseInt(lastStudent[0].student_id.slice(-3));
      studentNumber = lastNumber + 1;
    }

    const student_id = `${year}${tradePrefix}${levelSuffix}${studentNumber.toString().padStart(3, '0')}`;
    const username = student_id;

    // Create parent if provided
    let parent_id = null;
    if (parent_info && parent_info.first_name && parent_info.last_name) {
      const [parentRoleResult] = await connection.execute(
        'SELECT id FROM roles WHERE name = "parent"'
      );

      if (parentRoleResult.length > 0) {
        const [parentResult] = await connection.execute(`
          INSERT INTO users (
            username, email, password_hash, first_name, last_name,
            phone, role_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, true)
        `, [
          `parent_${Date.now()}`,
          parent_info.email || `${first_name.toLowerCase()}.parent@school.rw`,
          '$2a$10$defaulthash', // Default password hash
          parent_info.first_name,
          parent_info.last_name,
          parent_info.phone,
          parentRoleResult[0].id
        ]);

        parent_id = parentResult.insertId;
      }
    }

    // Create student
    const [studentResult] = await connection.execute(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name,
        phone, date_of_birth, gender, role_id, student_id, parent_id,
        address, emergency_contact, medical_info, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [
      username,
      email,
      hashedPassword,
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      studentRole[0].id,
      student_id,
      parent_id,
      address,
      emergency_contact,
      medical_info
    ]);

    const new_student_id = studentResult.insertId;

    // Get trade level and assign to appropriate class
    const [tradeLevelResult] = await connection.execute(`
      SELECT id FROM trade_levels
      WHERE trade_code = ? AND level_number = ?
      AND (level_suffix = ? OR (level_suffix IS NULL AND ? IS NULL))
    `, [trade_code, level_number, level_suffix, level_suffix]);

    if (tradeLevelResult.length > 0) {
      // Get current academic year
      const [academicYearResult] = await connection.execute(
        'SELECT id FROM academic_years WHERE is_active = true LIMIT 1'
      );

      if (academicYearResult.length > 0) {
        // Find available class or create new one
        const [classResult] = await connection.execute(`
          SELECT id, current_enrollment, capacity
          FROM trade_classes
          WHERE trade_level_id = ? AND academic_year_id = ? AND is_active = true
          AND current_enrollment < capacity
          ORDER BY current_enrollment ASC
          LIMIT 1
        `, [tradeLevelResult[0].id, academicYearResult[0].id]);

        let class_id;
        if (classResult.length > 0) {
          class_id = classResult[0].id;

          // Update enrollment count
          await connection.execute(`
            UPDATE trade_classes
            SET current_enrollment = current_enrollment + 1
            WHERE id = ?
          `, [class_id]);
        } else {
          // Create new class
          const classCount = await connection.execute(`
            SELECT COUNT(*) as count FROM trade_classes
            WHERE trade_level_id = ? AND academic_year_id = ?
          `, [tradeLevelResult[0].id, academicYearResult[0].id]);

          const classNumber = classCount[0][0].count + 1;
          const className = `Class ${classNumber}`;

          const [newClassResult] = await connection.execute(`
            INSERT INTO trade_classes (
              trade_level_id, academic_year_id, class_name, current_enrollment
            ) VALUES (?, ?, ?, 1)
          `, [tradeLevelResult[0].id, academicYearResult[0].id, className]);

          class_id = newClassResult.insertId;
        }

        // Enroll student in class
        await connection.execute(`
          INSERT INTO enrollments (
            student_id, class_id, academic_year_id, enrollment_date, status
          ) VALUES (?, ?, ?, CURDATE(), 'active')
        `, [new_student_id, class_id, academicYearResult[0].id]);

        // Initialize performance summary
        await connection.execute(`
          INSERT INTO student_performance_summary (
            student_id, trade_class_id, academic_year_id
          ) VALUES (?, ?, ?)
        `, [new_student_id, class_id, academicYearResult[0].id]);
      }
    }

    await connection.commit();

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { userId: new_student_id, username: username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Student registration successful',
      token,
      user: {
        id: new_student_id,
        username,
        email,
        first_name,
        last_name,
        student_id,
        role: 'student'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Enhanced Parent Registration
router.post('/register/parent', [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('address').optional(),
  body('occupation').optional(),
  body('relationship').optional().isIn(['father', 'mother', 'guardian']).withMessage('Valid relationship required'),
  body('children').optional().isArray().withMessage('Children must be an array')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      address,
      occupation,
      relationship,
      children
    } = req.body;

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get parent role ID
    const [parentRole] = await connection.execute(
      'SELECT id FROM roles WHERE name = "parent"'
    );

    if (parentRole.length === 0) {
      throw new Error('Parent role not found');
    }

    // Generate username
    const username = `parent_${Date.now()}`;

    // Create parent
    const [parentResult] = await connection.execute(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name,
        phone, address, role_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [
      username,
      email,
      hashedPassword,
      first_name,
      last_name,
      phone,
      address,
      parentRole[0].id
    ]);

    const parent_id = parentResult.insertId;

    // Link children if provided
    if (children && Array.isArray(children)) {
      for (const child of children) {
        if (child.student_id) {
          await connection.execute(
            'UPDATE users SET parent_id = ? WHERE student_id = ?',
            [parent_id, child.student_id]
          );
        }
      }
    }

    await connection.commit();

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { userId: parent_id, username: username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Parent registration successful',
      token,
      user: {
        id: parent_id,
        username,
        email,
        first_name,
        last_name,
        role: 'parent'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Parent registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get available trades for registration
router.get('/registration/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT
        tl.id,
        tl.trade_code,
        tl.trade_name,
        tl.level_number,
        tl.level_suffix,
        tl.full_name,
        tl.description,
        tl.capacity,
        COUNT(tc.id) as class_count
      FROM trade_levels tl
      LEFT JOIN trade_classes tc ON tl.id = tc.id
      WHERE tl.is_active = true
      GROUP BY tl.id
      ORDER BY tl.trade_code, tl.level_number, tl.level_suffix
    `);

    res.json({
      success: true,
      trades
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades'
    });
  }
});

// Check email availability
router.post('/check-email', [
  body('email').isEmail().withMessage('Valid email required')
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

    const { email } = req.body;

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    res.json({
      success: true,
      available: existingUsers.length === 0
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Register new user (legacy - kept for backward compatibility)
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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

    const { username, email, password, first_name, last_name, phone } = req.body;

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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get student role ID (default for registration)
    const [studentRole] = await pool.execute(
      'SELECT id FROM roles WHERE name = "student"'
    );

    if (studentRole.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Student role not found'
      });
    }

    // Generate student ID
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

    const student_id = `${year}${nextNumber.toString().padStart(4, '0')}`;

    // Create user
    const [result] = await pool.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, student_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [username, email, hashedPassword, first_name, last_name, phone, studentRole[0].id, student_id]);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: result.insertId,
        username,
        email,
        first_name,
        last_name,
        student_id
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user = null;

    // Try admin_users first
    const [adminUsers] = await pool.execute(
      'SELECT id, username, email, role, first_name, last_name FROM admin_users WHERE id = ?',
      [req.user.id]
    );

    if (adminUsers.length > 0) {
      user = {
        ...adminUsers[0],
        user_type: 'admin'
      };
    } else {
      // Try users table
      const [users] = await pool.execute(`
        SELECT u.*, COALESCE(r.name, u.role) as role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
      `, [req.user.id]);

      if (users.length > 0) {
        user = {
          ...users[0],
          role: users[0].role_name,
          user_type: 'user'
        };
        delete user.password_hash;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

// Update profile with password change capability
router.put('/profile', [
  authenticateToken,
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional(),
  body('address').optional(),
  body('current_password').optional(),
  body('new_password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

    const { email, first_name, last_name, phone, address, current_password, new_password } = req.body;
    const userId = req.user.id;
    const updateFields = [];
    const updateValues = [];

    // Check if user is admin or regular user
    const [adminUsers] = await pool.execute(
      'SELECT id, password FROM admin_users WHERE id = ?',
      [userId]
    );

    let updateTable = '';
    let passwordField = '';
    let currentHashedPassword = null;

    if (adminUsers.length > 0) {
      updateTable = 'admin_users';
      passwordField = 'password';
      currentHashedPassword = adminUsers[0].password;
    } else {
      const [users] = await pool.execute(
        'SELECT id, password_hash FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      updateTable = 'users';
      passwordField = 'password_hash';
      currentHashedPassword = users[0].password_hash;
    }

    // If changing password, verify current password first
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }

      const isValidPassword = await bcrypt.compare(current_password, currentHashedPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateFields.push(`${passwordField} = ?`);
      updateValues.push(hashedPassword);
    }

    // Build update query for other fields
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (first_name) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (phone && updateTable === 'users') {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (address && updateTable === 'users') {
      updateFields.push('address = ?');
      updateValues.push(address);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(userId);
    const query = `UPDATE ${updateTable} SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(query, updateValues);

    // Fetch updated user
    let user = null;
    if (updateTable === 'admin_users') {
      const [updatedAdmin] = await pool.execute(
        'SELECT id, username, email, role, first_name, last_name FROM admin_users WHERE id = ?',
        [userId]
      );
      user = {
        ...updatedAdmin[0],
        user_type: 'admin'
      };
    } else {
      const [updatedUser] = await pool.execute(`
        SELECT u.*, COALESCE(r.name, u.role) as role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
      `, [userId]);
      user = {
        ...updatedUser[0],
        role: updatedUser[0].role_name,
        user_type: 'user'
      };
      delete user.password_hash;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Change password
router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Check if user is admin or regular user
    const [adminUsers] = await pool.execute(
      'SELECT password FROM admin_users WHERE id = ?',
      [userId]
    );

    let currentHashedPassword = null;
    let updateTable = '';
    let passwordField = '';

    if (adminUsers.length > 0) {
      currentHashedPassword = adminUsers[0].password;
      updateTable = 'admin_users';
      passwordField = 'password';
    } else {
      const [users] = await pool.execute(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length > 0) {
        currentHashedPassword = users[0].password_hash;
        updateTable = 'users';
        passwordField = 'password_hash';
      }
    }

    if (!currentHashedPassword) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, currentHashedPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      `UPDATE ${updateTable} SET ${passwordField} = ? WHERE id = ?`,
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Student serial code login (serial_code + password)
router.post('/login/student', [
  body('serial_code').notEmpty().withMessage('Serial code is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { serial_code, password } = req.body;

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.student_id = ? AND r.name = 'student' AND u.is_active = true
    `, [serial_code]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid serial code or password'
      });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid serial code or password'
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Student login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        student_id: user.student_id,
        role: 'student',
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: 'student'
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Parent phone-based login (phone + password)
router.post('/login/parent', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { phone, password } = req.body;

    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.phone = ? AND r.name = 'parent' AND u.is_active = true
    `, [phone]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const [children] = await pool.execute(`
      SELECT COUNT(*) as child_count
      FROM parent_student WHERE parent_id = ?
    `, [user.id]);

    res.json({
      success: true,
      message: 'Parent login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: 'parent',
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: 'parent',
        linked_children: children[0].child_count
      }
    });

  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Parent phone-based registration (phone + password)
router.post('/register/parent-phone', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email required if provided'),
  body('address').optional()
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

    const { phone, password, first_name, last_name, email, address } = req.body;

    const [existingPhone] = await pool.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    if (email) {
      const [existingEmail] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [parentRole] = await pool.execute(
      'SELECT id FROM roles WHERE name = "parent"'
    );
    
    if (parentRole.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Parent role not found in system'
      });
    }

    const username = `parent_${phone.replace(/[^0-9]/g, '')}`;
    const parentEmail = email || `${username}@parent.gardentvet.com`;

    const [result] = await pool.execute(`
      INSERT INTO users (
        name, email, password, phone, role, is_active
      ) VALUES (?, ?, ?, ?, 'parent', true)
    `, [`${first_name} ${last_name}`, parentEmail, hashedPassword, phone]);

    const token = jwt.sign(
      { userId: result.insertId, username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Parent account created successfully',
      token,
      user: {
        id: result.insertId,
        username,
        email: parentEmail,
        phone,
        role: 'parent',
        first_name,
        last_name,
        user_type: 'parent'
      }
    });

  } catch (error) {
    console.error('Parent phone registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

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
            first_name: user.username,
            last_name: '',
            user_type: 'admin'
          }
        });
      }
    }

    // If not found in admin_users, try users table
    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
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

// Register new user
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
      'SELECT id, username, email, role FROM admin_users WHERE id = ?',
      [req.user.id]
    );

    if (adminUsers.length > 0) {
      user = {
        ...adminUsers[0],
        first_name: adminUsers[0].username,
        last_name: '',
        user_type: 'admin'
      };
    } else {
      // Try users table
      const [users] = await pool.execute(`
        SELECT u.*, r.name as role_name 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
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

module.exports = router;
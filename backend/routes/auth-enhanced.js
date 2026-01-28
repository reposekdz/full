const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

// Enhanced student registration with comprehensive token validation
router.post('/register/student/enhanced', [
  body('serial_code').notEmpty().withMessage('Serial code is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { serial_code, first_name, last_name, email, phone, password } = req.body;

    // Create default serial code if not exists
    const [existingCode] = await connection.execute(
      'SELECT * FROM student_serial_codes WHERE serial_code = ?',
      [serial_code]
    );

    if (existingCode.length === 0) {
      // Create default serial code
      await connection.execute(`
        INSERT INTO student_serial_codes (
          serial_code, trade_code, level_number, level_suffix, 
          status, is_used, created_at
        ) VALUES (?, 'GEN', 1, 'A', 'active', false, NOW())
      `, [serial_code]);
    }

    // Validate serial code
    const [serialCodeResult] = await connection.execute(
      `SELECT * FROM student_serial_codes 
       WHERE serial_code = ? AND status = 'active' AND is_used = false`,
      [serial_code]
    );

    if (serialCodeResult.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid or already used serial code'
      });
    }

    const serialCodeData = serialCodeResult[0];
    const trade_code = serialCodeData.trade_code || 'GEN';
    const level_number = serialCodeData.level_number || 1;
    const level_suffix = serialCodeData.level_suffix || 'A';

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get or create student role
    let [studentRole] = await connection.execute(
      'SELECT id FROM roles WHERE name = "student"'
    );

    if (studentRole.length === 0) {
      const [roleResult] = await connection.execute(
        'INSERT INTO roles (name, description) VALUES ("student", "Student role")'
      );
      studentRole = [{ id: roleResult.insertId }];
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
      const lastNumber = parseInt(lastStudent[0].student_id.slice(-3)) || 0;
      studentNumber = lastNumber + 1;
    }

    const student_id = `${year}${tradePrefix}${levelSuffix}${studentNumber.toString().padStart(3, '0')}`;
    const username = student_id;

    // Create student
    const [studentResult] = await connection.execute(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name,
        phone, role_id, student_id, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, NOW())
    `, [
      username, email, hashedPassword, first_name, last_name,
      phone, studentRole[0].id, student_id
    ]);

    const new_student_id = studentResult.insertId;

    // Create or get trade level
    let [tradeLevelResult] = await connection.execute(`
      SELECT id FROM trade_levels
      WHERE trade_code = ? AND level_number = ?
      AND (level_suffix = ? OR (level_suffix IS NULL AND ? IS NULL))
    `, [trade_code, level_number, level_suffix, level_suffix]);

    if (tradeLevelResult.length === 0) {
      const [newTradeLevel] = await connection.execute(`
        INSERT INTO trade_levels (
          trade_code, trade_name, level_number, level_suffix, 
          full_name, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, true, NOW())
      `, [
        trade_code, 
        `${trade_code} Trade`, 
        level_number, 
        level_suffix,
        `${trade_code} Level ${level_number}${level_suffix || ''}`
      ]);
      tradeLevelResult = [{ id: newTradeLevel.insertId }];
    }

    // Create or get academic year
    let [academicYearResult] = await connection.execute(
      'SELECT id FROM academic_years WHERE is_active = true LIMIT 1'
    );

    if (academicYearResult.length === 0) {
      const currentYear = new Date().getFullYear();
      const [newAcademicYear] = await connection.execute(`
        INSERT INTO academic_years (
          year_name, start_date, end_date, is_active, created_at
        ) VALUES (?, ?, ?, true, NOW())
      `, [
        `${currentYear}-${currentYear + 1}`,
        `${currentYear}-01-01`,
        `${currentYear + 1}-12-31`
      ]);
      academicYearResult = [{ id: newAcademicYear.insertId }];
    }

    // Create or get class
    let [classResult] = await connection.execute(`
      SELECT id, current_enrollment, capacity
      FROM trade_classes
      WHERE trade_level_id = ? AND academic_year_id = ? AND is_active = true
      AND (capacity IS NULL OR current_enrollment < capacity)
      ORDER BY current_enrollment ASC
      LIMIT 1
    `, [tradeLevelResult[0].id, academicYearResult[0].id]);

    let class_id;
    if (classResult.length > 0) {
      class_id = classResult[0].id;
      await connection.execute(`
        UPDATE trade_classes
        SET current_enrollment = COALESCE(current_enrollment, 0) + 1
        WHERE id = ?
      `, [class_id]);
    } else {
      const [classCount] = await connection.execute(`
        SELECT COUNT(*) as count FROM trade_classes
        WHERE trade_level_id = ? AND academic_year_id = ?
      `, [tradeLevelResult[0].id, academicYearResult[0].id]);

      const classNumber = classCount[0].count + 1;
      const className = `Class ${classNumber}`;

      const [newClassResult] = await connection.execute(`
        INSERT INTO trade_classes (
          trade_level_id, academic_year_id, class_name, 
          current_enrollment, capacity, is_active, created_at
        ) VALUES (?, ?, ?, 1, 30, true, NOW())
      `, [tradeLevelResult[0].id, academicYearResult[0].id, className]);

      class_id = newClassResult.insertId;
    }

    // Enroll student in class
    await connection.execute(`
      INSERT INTO enrollments (
        student_id, class_id, academic_year_id, enrollment_date, status, created_at
      ) VALUES (?, ?, ?, CURDATE(), 'active', NOW())
    `, [new_student_id, class_id, academicYearResult[0].id]);

    // Mark serial code as used
    await connection.execute(`
      UPDATE student_serial_codes
      SET is_used = true, 
          used_by = ?, 
          used_at = NOW(), 
          student_id = ?,
          status = 'used'
      WHERE serial_code = ?
    `, [new_student_id, new_student_id, serial_code]);

    await connection.commit();

    // Generate comprehensive JWT token
    const tokenPayload = {
      userId: new_student_id,
      username: username,
      role: 'student',
      student_id: student_id,
      email: email,
      first_name: first_name,
      last_name: last_name,
      trade_code: trade_code,
      level: `${level_number}${level_suffix || ''}`,
      class_id: class_id,
      permissions: ['view_profile', 'edit_profile', 'view_grades', 'submit_assignments'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (150 * 24 * 60 * 60) // 150 days
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRE || '150d' 
    });

    // Verify token immediately
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

    res.status(201).json({
      success: true,
      message: 'Student registration successful with enhanced token',
      token,
      token_verified: true,
      user: {
        id: new_student_id,
        username,
        email,
        first_name,
        last_name,
        student_id,
        role: 'student',
        trade_code,
        level: `${level_number}${level_suffix || ''}`,
        class_id,
        permissions: tokenPayload.permissions
      },
      token_info: {
        issued_at: new Date(verifiedToken.iat * 1000).toISOString(),
        expires_at: new Date(verifiedToken.exp * 1000).toISOString(),
        valid_for_days: 150
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Enhanced student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Enhanced token validation endpoint
router.post('/validate-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ? AND u.is_active = true
    `, [decoded.userId]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      message: 'Token is valid',
      token_valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role_name || decoded.role,
        student_id: user.student_id
      },
      token_info: {
        issued_at: new Date(decoded.iat * 1000).toISOString(),
        expires_at: new Date(decoded.exp * 1000).toISOString(),
        time_remaining: Math.max(0, decoded.exp - Math.floor(Date.now() / 1000)),
        permissions: decoded.permissions || []
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        token_valid: false,
        expired: true
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        token_valid: false,
        invalid: true
      });
    }

    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Token validation failed',
      error: error.message
    });
  }
});

module.exports = router;
/**
 * Parent Registration - FIXED & MINIMAL
 * Real data from global_student_sheets
 * No complex logic, just works
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendParentRegistrationSMS } = require('../services/parentNotificationService');

// POST /api/parent-registration/register - Simple parent registration
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !last_name || !phone || !password) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Uzuza amakuru yose: Izina, Telefoni, Password'
      });
    }

    // Check if phone exists
    const [existingPhone] = await connection.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Telefoni yarakoreshejwe. Injira gusa.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create username
    const username = `parent_${phone}`;
    const emailValue = email || `${phone}@parent.garden.rw`;

    // Get parent role_id from roles table (or use NULL if not exists)
    let parentRoleId = null;
    try {
      const [roleRows] = await connection.execute(
        'SELECT id FROM roles WHERE name = ? OR name = ?',
        ['parent', 'Parent']
      );
      if (roleRows.length > 0) {
        parentRoleId = roleRows[0].id;
      }
    } catch (err) {
      console.log('Roles table not found or error, using NULL for role_id');
    }

    // Insert parent - handle both with and without role_id
    if (parentRoleId) {
      const [result] = await connection.execute(`
        INSERT INTO users (
          username, first_name, last_name, email, phone, 
          password_hash, role, role_id, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'parent', ?, 1, NOW())
      `, [username, first_name, last_name, emailValue, phone, hashedPassword, parentRoleId]);
      var parentId = result.insertId;
    } else {
      const [result] = await connection.execute(`
        INSERT INTO users (
          username, first_name, last_name, email, phone, 
          password_hash, role, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'parent', 1, NOW())
      `, [username, first_name, last_name, emailValue, phone, hashedPassword]);
      var parentId = result.insertId;
    }

    await connection.commit();

    // Send welcome SMS automatically
    try {
      await sendParentRegistrationSMS(parentId);
      console.log('✅ Welcome SMS sent to new parent:', phone);
    } catch (smsError) {
      console.error('❌ Welcome SMS failed:', smsError);
    }

    // Generate token
    const token = jwt.sign(
      { userId: parentId, username, role: 'parent' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Konte yawe yarakozwe! Injira uhuze n\'umwana wawe.',
      token,
      user: {
        id: parentId,
        username,
        first_name,
        last_name,
        email: emailValue,
        phone,
        role: 'parent'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Parent registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Ikibazo cyabaye. Ongera ugerageze.'
    });
  } finally {
    connection.release();
  }
});

// POST /api/parent-registration/search-students - Search real students
router.post('/search-students', async (req, res) => {
  try {
    const { query, trade, level } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Andika nibura inyuguti 2'
      });
    }

    let sql = `
      SELECT 
        id,
        first_name as firstName,
        last_name as lastName,
        student_code as studentId,
        trade_code,
        trade_name as trade,
        level_number as levelNumber,
        CONCAT('Level ', level_number) as level,
        gender
      FROM global_student_sheets
      WHERE status = 'active'
        AND trade_code IN ('BDC', 'SOD', 'AUTO')
        AND (
          CONCAT(first_name, ' ', last_name) LIKE ?
          OR student_code LIKE ?
          OR first_name LIKE ?
          OR last_name LIKE ?
        )
    `;

    const params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    if (trade) {
      sql += ` AND trade_code = ?`;
      params.push(trade);
    }

    if (level) {
      sql += ` AND level_number = ?`;
      params.push(parseInt(level));
    }

    sql += ` ORDER BY first_name, last_name LIMIT 50`;

    const [students] = await pool.execute(sql, params);

    res.json({
      success: true,
      students,
      count: students.length
    });

  } catch (error) {
    console.error('Student search error:', error);
    res.status(500).json({
      success: false,
      message: 'Ikibazo cyabaye mu gushakisha',
      error: error.message
    });
  }
});

// POST /api/parent-registration/verify-student - Verify student exists
router.post('/verify-student', async (req, res) => {
  try {
    const { firstName, lastName, gender, level, trade } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Andika amazina y\'umwana'
      });
    }

    const [students] = await pool.execute(`
      SELECT 
        id, first_name, last_name, gender, 
        trade_name, level_number, student_code, status
      FROM global_student_sheets
      WHERE LOWER(first_name) = LOWER(?) 
        AND LOWER(last_name) = LOWER(?)
        AND status = 'active'
        AND trade_code IN ('BDC', 'SOD', 'AUTO')
      LIMIT 1
    `, [firstName.trim(), lastName.trim()]);

    if (students.length > 0) {
      return res.json({
        success: true,
        found: true,
        student: students[0],
        message: 'Umwana yabonetse!'
      });
    } else {
      return res.json({
        success: true,
        found: false,
        message: 'Umwana ntabonetse. Reba neza amazina.'
      });
    }
  } catch (error) {
    console.error('Verify student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikibazo cyabaye',
      error: error.message 
    });
  }
});

module.exports = router;

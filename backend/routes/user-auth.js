const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Student Registration
router.post('/student/register', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { first_name, last_name, email, phone, password, date_of_birth, gender, trade_code, level_number, address, emergency_contact } = req.body;
    
    const [existingUsers] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [studentRole] = await connection.execute('SELECT id FROM roles WHERE name = "student"');
    
    const year = new Date().getFullYear();
    const tradePrefix = trade_code.toUpperCase();
    const [lastStudent] = await connection.execute(
      'SELECT student_id FROM users WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
      [`${year}${tradePrefix}%`]
    );
    
    let studentNumber = 1;
    if (lastStudent.length > 0) {
      const lastNumber = parseInt(lastStudent[0].student_id.slice(-3));
      studentNumber = lastNumber + 1;
    }
    
    const student_id = `${tradePrefix}${studentNumber.toString().padStart(3, '0')}${year}`;
    const username = student_id;
    
    const [result] = await connection.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, date_of_birth, gender, role_id, student_id, address, emergency_contact, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [username, email, hashedPassword, first_name, last_name, phone, date_of_birth, gender, studentRole[0].id, student_id, address, emergency_contact]);
    
    await connection.commit();
    
    const token = jwt.sign(
      { userId: result.insertId, username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      message: 'Student registration successful',
      token,
      user: { id: result.insertId, username, email, first_name, last_name, student_id, role: 'student' }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// Student Login
router.post('/student/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE (u.username = ? OR u.email = ? OR u.student_id = ?) AND r.name = 'student' AND u.is_active = true
    `, [username, username, username]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'student',
        first_name: user.first_name,
        last_name: user.last_name,
        student_id: user.student_id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Parent Registration
router.post('/parent/register', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { first_name, last_name, email, phone, password, address, occupation, relationship } = req.body;
    
    const [existingUsers] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [parentRole] = await connection.execute('SELECT id FROM roles WHERE name = "parent"');
    
    const username = `parent_${Date.now()}`;
    
    const [result] = await connection.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, role_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [username, email, hashedPassword, first_name, last_name, phone, address, parentRole[0].id]);
    
    await connection.execute(`
      INSERT INTO parent_details (user_id, occupation, relationship)
      VALUES (?, ?, ?)
    `, [result.insertId, occupation, relationship]);
    
    await connection.commit();
    
    const token = jwt.sign(
      { userId: result.insertId, username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      message: 'Parent registration successful',
      token,
      user: { id: result.insertId, username, email, first_name, last_name, role: 'parent' }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// Parent Login
router.post('/parent/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE (u.email = ? OR u.phone = ?) AND r.name = 'parent' AND u.is_active = true
    `, [email, email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    const [children] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE parent_id = ?', [user.id]);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: 'parent',
        first_name: user.first_name,
        last_name: user.last_name,
        linked_children: children[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available trades for registration
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT trade_code, trade_name, description
      FROM trades
      WHERE is_active = true
      ORDER BY trade_code
    `);
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

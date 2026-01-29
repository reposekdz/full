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
      SELECT *
      FROM users
      WHERE (username = ? OR email = ? OR student_id = ?) AND role = 'student' AND is_active = true
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
    
    const { 
      first_name, last_name, email, phone, password, address, date_of_birth, gender, national_id,
      student_first_name, student_last_name, student_trade, student_level, student_id, relationship_type
    } = req.body;
    
    const [existingEmail] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const [existingPhone] = await connection.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existingPhone.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `parent_${Date.now()}`;
    
    const [result] = await connection.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, date_of_birth, gender, national_id, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'parent', true, NOW())
    `, [username, email, hashedPassword, first_name, last_name, phone, address, date_of_birth, gender, national_id]);
    
    const parentId = result.insertId;
    
    // Store student connection request
    if (student_first_name && student_last_name && student_trade && student_level) {
      await connection.execute(`
        INSERT INTO parent_student_requests (parent_id, student_first_name, student_last_name, student_trade, student_level, student_id, relationship_type, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `, [parentId, student_first_name, student_last_name, student_trade, student_level, student_id || null, relationship_type]);
    }
    
    await connection.commit();
    
    const token = jwt.sign(
      { userId: parentId, username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      message: 'Parent registration successful',
      token,
      user: { id: parentId, username, email, first_name, last_name, role: 'parent' }
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
    const { email, phone, password } = req.body;
    const identifier = email || phone;
    
    const [users] = await pool.execute(`
      SELECT *
      FROM users
      WHERE (email = ? OR phone = ?) AND role = 'parent' AND is_active = true
    `, [identifier, identifier]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    const [children] = await pool.execute('SELECT COUNT(*) as count FROM parent_student WHERE parent_id = ?', [user.id]);
    
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

// Get all parents
router.get('/parents', async (req, res) => {
  try {
    const [parents] = await pool.execute(`
      SELECT 
        id, username, email, phone, first_name, last_name, 
        address, is_active, created_at, last_login
      FROM users
      WHERE role = 'parent'
      ORDER BY created_at DESC
    `);
    res.json({ success: true, parents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

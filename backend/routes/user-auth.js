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
      students // Array of student objects: { first_name, last_name, trade, level, student_id, relationship_type }
    } = req.body;

    const emailVal = (email && String(email).trim()) || `parent_${Date.now()}@garden.school`;
    const [existingEmail] = await connection.execute('SELECT id FROM users WHERE email = ?', [emailVal]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Allow multiple parents with same phone? No, usually unique.
    const [existingPhone] = await connection.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existingPhone.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `parent_${Date.now()}`;

    // Get the parent role_id from roles table
    const [parentRole] = await connection.execute('SELECT id FROM roles WHERE name = "parent"');
    if (parentRole.length === 0) {
      return res.status(500).json({ success: false, message: 'Parent role not found in system' });
    }
    const parentRoleId = parentRole[0].id;

    const [result] = await connection.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, date_of_birth, gender, role, role_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'parent', ?, true, NOW())
    `, [username, emailVal, hashedPassword, first_name, last_name, phone, address || null, date_of_birth || null, gender || null, parentRoleId]);

    const parentId = result.insertId;

    // Handle Student Linking
    const studentList = Array.isArray(students) ? students :
      (req.body.student_first_name ? [{
        first_name: req.body.student_first_name,
        last_name: req.body.student_last_name,
        trade: req.body.student_trade,
        level: req.body.student_level,
        student_id: req.body.student_id,
        relationship_type: req.body.relationship_type
      }] : []);

    for (const student of studentList) {
      if (!student.first_name && !student.student_id) continue;

      let linkedStudentId = null;
      let status = 'pending';

      // Smart Linking: specific check if student_id is provided
      if (student.student_id) {
        const [foundStudent] = await connection.execute('SELECT id FROM users WHERE student_id = ? AND role = "student"', [student.student_id]);
        if (foundStudent.length > 0) {
          linkedStudentId = foundStudent[0].id;
          status = 'approved'; // Auto-approve if they know the exact ID (or keep pending for safety, but "Smart" implies auto)
          // For safety, let's keep it approved ONLY if they also match name roughly? 
          // For now, let's assume possessing the ID is enough proof or distinct enough.

          // Direct link in parent_student table
          await connection.execute(`
            INSERT INTO parent_student (parent_id, student_id, relationship_type, created_at)
            VALUES (?, ?, ?, NOW())
          `, [parentId, linkedStudentId, student.relationship_type || 'parent']);
        }
      }

      // Always create a request record for history/admin verification if needed
      await connection.execute(`
        INSERT INTO parent_student_requests (parent_id, student_first_name, student_last_name, student_trade, student_level, student_id, relationship_type, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        parentId,
        student.first_name || '',
        student.last_name || '',
        student.trade || '',
        student.level || '',
        student.student_id || null,
        student.relationship_type,
        status // 'approved' if linked, 'pending' otherwise
      ]);
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
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
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

// Change password (parent, student, all roles using users table)
const jwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

router.put('/change-password', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const [users] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const valid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.execute('UPDATE users SET password_hash = ?, updated_at = COALESCE(updated_at, NOW()) WHERE id = ?', [hashed, userId]);
    return res.json({
      success: true,
      message: 'Password changed successfully. You can sign in with your new password.'
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

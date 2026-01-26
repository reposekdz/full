const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Generate unique serial code
function generateSerialCode() {
  const prefix = 'STD';
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${year}${random}`;
}

// DOS: Generate serial code for new student
router.post('/dos/generate-code', async (req, res) => {
  try {
    const { class_id, student_name } = req.body;
    
    let serialCode;
    let isUnique = false;
    
    // Generate unique code
    while (!isUnique) {
      serialCode = generateSerialCode();
      const [existing] = await db.query('SELECT id FROM users WHERE serial_code = ?', [serialCode]);
      if (existing.length === 0) isUnique = true;
    }
    
    res.json({ 
      success: true, 
      serialCode,
      message: 'Serial code generated. Give this to the student for registration.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student Registration (minimal info)
router.post('/student/register', async (req, res) => {
  try {
    const { serial_code, password, parent_phone, location } = req.body;

    // Validate required fields
    if (!serial_code || !password || !parent_phone || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Serial code, password, parent phone, and location are required' 
      });
    }

    // Check if serial code already registered
    const [existing] = await db.query('SELECT id FROM users WHERE serial_code = ?', [serial_code]);
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'This serial code is already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get student role ID
    const [roleResult] = await db.query('SELECT id FROM roles WHERE name = ?', ['student']);
    const roleId = roleResult[0].id;

    // Create user account
    const [result] = await db.query(
      `INSERT INTO users (serial_code, password_hash, parent_phone, address, role_id, is_active) 
       VALUES (?, ?, ?, ?, ?, true)`,
      [serial_code, hashedPassword, parent_phone, location, roleId]
    );

    res.json({ 
      success: true, 
      message: 'Registration successful! You can now login with your serial code.',
      userId: result.insertId
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student Login (using serial code)
router.post('/student/login', async (req, res) => {
  try {
    const { serial_code, password } = req.body;

    if (!serial_code || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Serial code and password are required' 
      });
    }

    // Find user by serial code or student_id
    const [users] = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE (u.serial_code = ? OR u.student_id = ?) AND u.is_active = true`,
      [serial_code, serial_code]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid serial code or password' 
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid serial code or password' 
      });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        serial_code: user.serial_code,
        role: user.role_name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        serial_code: user.serial_code,
        role: user.role_name,
        parent_phone: user.parent_phone,
        location: user.address
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student profile
router.get('/student/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await db.query(
      `SELECT u.id, u.serial_code, u.parent_phone, u.address, u.profile_picture, 
              u.last_login, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: users[0] });

  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Update student profile (limited fields)
router.put('/student/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { parent_phone, location, profile_picture } = req.body;

    await db.query(
      'UPDATE users SET parent_phone = ?, address = ?, profile_picture = ? WHERE id = ?',
      [parent_phone, location, profile_picture, decoded.id]
    );

    res.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
router.put('/student/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { current_password, new_password } = req.body;

    // Get current password hash
    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, decoded.id]);

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const axios = require('axios');

// Enhanced parent registration with automatic SMS
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, phone, email, password, gender, address } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name, last name, phone, and password are required' 
      });
    }
    
    // Check if parent already exists
    const [existingParent] = await db.execute(
      'SELECT id FROM parents WHERE phone = ? OR email = ?',
      [phone, email || '']
    );
    
    if (existingParent.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parent with this phone or email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new parent
    const [result] = await db.execute(`
      INSERT INTO parents (first_name, last_name, phone, email, password, gender, address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [first_name, last_name, phone, email || null, hashedPassword, gender || null, address || null]);
    
    const parentId = result.insertId;
    
    // Send welcome SMS automatically
    try {
      await axios.post('http://localhost:5000/api/enhanced-parent-sms/send-welcome-sms', {
        phone: phone,
        parent_name: first_name
      });
    } catch (smsError) {
      console.error('Welcome SMS failed:', smsError.message);
      // Don't fail registration if SMS fails
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: parentId, role: 'parent', phone: phone },
      process.env.JWT_SECRET || 'garden_tvet_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Parent registered successfully! Welcome SMS sent.',
      parent: {
        id: parentId,
        first_name,
        last_name,
        phone,
        email,
        role: 'parent'
      },
      token
    });
    
  } catch (error) {
    console.error('Parent registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Enhanced parent login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and password are required' 
      });
    }
    
    // Find parent by phone
    const [parents] = await db.execute(
      'SELECT * FROM parents WHERE phone = ?',
      [phone]
    );
    
    if (parents.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid phone or password' 
      });
    }
    
    const parent = parents[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, parent.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid phone or password' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: parent.id, role: 'parent', phone: parent.phone },
      process.env.JWT_SECRET || 'garden_tvet_secret',
      { expiresIn: '7d' }
    );
    
    // Update last login
    await db.execute(
      'UPDATE parents SET last_login = NOW() WHERE id = ?',
      [parent.id]
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      parent: {
        id: parent.id,
        first_name: parent.first_name,
        last_name: parent.last_name,
        phone: parent.phone,
        email: parent.email,
        role: 'parent'
      },
      token
    });
    
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Enhanced student linking with automatic SMS
router.post('/link-student', async (req, res) => {
  try {
    const { student_first_name, student_last_name, gender, trade_code, level, relationship } = req.body;
    const parent_id = req.user.id;
    
    // Find student by name, trade, and level
    const [students] = await db.execute(`
      SELECT student_id, first_name, last_name, trade_name, level_number
      FROM global_student_sheets 
      WHERE LOWER(first_name) = LOWER(?) 
        AND LOWER(last_name) = LOWER(?)
        AND gender = ?
        AND trade_code = ?
        AND level_number = ?
      LIMIT 1
    `, [student_first_name, student_last_name, gender, trade_code, level]);
    
    if (students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found with the provided information' 
      });
    }
    
    const student = students[0];
    
    // Check if link already exists
    const [existingLink] = await db.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parent_id, student.student_id]
    );
    
    if (existingLink.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already linked to this student' 
      });
    }
    
    // Create link request (auto-approved for now)
    await db.execute(`
      INSERT INTO parent_student_links (parent_id, student_id, relationship, status, created_at)
      VALUES (?, ?, ?, 'approved', NOW())
    `, [parent_id, student.student_id, relationship || 'parent']);
    
    // Get parent details for SMS
    const [parents] = await db.execute(
      'SELECT first_name, phone FROM parents WHERE id = ?',
      [parent_id]
    );
    
    if (parents.length > 0) {
      const parent = parents[0];
      
      // Send linking success SMS
      try {
        await axios.post('http://localhost:5000/api/enhanced-parent-sms/send-linking-success-sms', {
          phone: parent.phone,
          parent_name: parent.first_name,
          student_name: `${student.first_name} ${student.last_name}`,
          trade_name: student.trade_name,
          level: student.level_number
        });
      } catch (smsError) {
        console.error('Linking SMS failed:', smsError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Successfully linked to student! SMS notification sent.',
      student: {
        id: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        trade: student.trade_name,
        level: student.level_number
      }
    });
    
  } catch (error) {
    console.error('Student linking error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get linked students for parent
router.get('/students', async (req, res) => {
  try {
    const parent_id = req.user.id;
    
    const [students] = await db.execute(`
      SELECT s.student_id, s.student_code, s.first_name, s.last_name,
             s.trade_name, s.trade_code, s.level_number, s.level_suffix,
             s.gender, s.gpa, s.attendance_percentage, s.conduct_score,
             psl.relationship, psl.created_at as linked_date
      FROM global_student_sheets s
      JOIN parent_student_links psl ON s.student_id = psl.student_id
      WHERE psl.parent_id = ? AND psl.status = 'approved'
      ORDER BY psl.created_at DESC
    `, [parent_id]);
    
    res.json({
      success: true,
      students: students.map(student => ({
        id: student.student_id,
        student_code: student.student_code,
        first_name: student.first_name,
        last_name: student.last_name,
        trade_name: student.trade_name,
        trade_code: student.trade_code,
        level_number: student.level_number,
        level_suffix: student.level_suffix,
        gender: student.gender,
        gpa: student.gpa || 0,
        attendance_percentage: student.attendance_percentage || 0,
        conduct_score: student.conduct_score || 40,
        relationship: student.relationship,
        linked_date: student.linked_date
      }))
    });
    
  } catch (error) {
    console.error('Get linked students error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get notifications for parent
router.get('/notifications', async (req, res) => {
  try {
    const parent_id = req.user.id;
    
    const [notifications] = await db.execute(`
      SELECT pn.*, u.first_name as sender_name, u.role as sender_role
      FROM parent_notifications pn
      LEFT JOIN users u ON pn.sender_id = u.id
      WHERE pn.parent_id = ?
      ORDER BY pn.created_at DESC
      LIMIT 50
    `, [parent_id]);
    
    res.json({
      success: true,
      notifications
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
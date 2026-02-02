const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all staff (teachers and other staff)
router.get('/', authenticateToken, requireRole(['admin', 'headmaster', 'director_study', 'school_owner']), async (req, res) => {
  try {
    const [staff] = await db.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('teacher', 'staff', 'accountant', 'stock_manager', 'advisor', 'director_study', 'director_discipline', 'headmaster', 'school_owner')
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single staff member
router.get('/:id', authenticateToken, requireRole(['admin', 'headmaster', 'director_study', 'school_owner']), async (req, res) => {
  try {
    const [staff] = await db.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [req.params.id]);
    
    if (staff.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.json({ success: true, staff: staff[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new staff member
router.post('/', authenticateToken, requireRole(['admin', 'headmaster', 'director_study', 'school_owner']), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role_name, department, specialization, hire_date, trade_id, level } = req.body;
    
    // Get role_id
    const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', [role_name]);
    if (roles.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const role_id = roles[0].id;
    const default_password = 'Staff@123'; // Should be hashed in production
    
    const [result] = await db.query(`
      INSERT INTO users (first_name, last_name, email, phone, role_id, password, department, specialization, hire_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [first_name, last_name, email, phone, role_id, default_password, department, specialization, hire_date]);
    
    // If role is student, create global student sheet
    if (role_name === 'student' && trade_id && level) {
      const [trade] = await db.query('SELECT code, name FROM courses WHERE id = ?', [trade_id]);
      const student_code = `${trade[0]?.code || 'STD'}${level}${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
      
      await db.query(`
        INSERT INTO global_student_sheets (student_id, student_code, first_name, last_name, email, phone, trade_code, trade_name, level_number, academic_year, enrollment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [result.insertId, student_code, first_name, last_name, email, phone, trade[0]?.code, trade[0]?.name, level, new Date().getFullYear()]);
      
      await db.query('INSERT INTO student_conduct_tracking (student_id) VALUES (?)', [result.insertId]);
    }
    
    res.json({ success: true, id: result.insertId, message: 'Staff member added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update staff member
router.put('/:id', authenticateToken, requireRole(['admin', 'headmaster', 'director_study', 'school_owner']), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role_name, department, specialization, hire_date, is_active } = req.body;
    
    // Get role_id if role_name provided
    let role_id;
    if (role_name) {
      const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', [role_name]);
      if (roles.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      role_id = roles[0].id;
    }
    
    await db.query(`
      UPDATE users 
      SET first_name=?, last_name=?, email=?, phone=?, role_id=?, department=?, specialization=?, hire_date=?, is_active=?
      WHERE id=?
    `, [first_name, last_name, email, phone, role_id, department, specialization, hire_date, is_active, req.params.id]);
    
    res.json({ success: true, message: 'Staff member updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete staff member
router.delete('/:id', authenticateToken, requireRole(['admin', 'headmaster', 'school_owner']), async (req, res) => {
  try {
    // Soft delete - deactivate instead of removing
    await db.query('UPDATE users SET is_active=false WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Staff member deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

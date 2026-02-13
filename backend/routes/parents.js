const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const smsService = require('../services/smsService');

const router = express.Router();

// Parent registration
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { email, password, first_name, last_name, phone, address, province_id, district_id, sector_id, cell_id, village_id } = req.body;

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [parentRole] = await pool.execute('SELECT id FROM roles WHERE name = "parent"');
    
    if (parentRole.length === 0) {
      return res.status(500).json({ success: false, message: 'Parent role not found' });
    }

    const username = email.split('@')[0] + '_parent';
    const [result] = await pool.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, province_id, district_id, sector_id, cell_id, village_id, role_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [username, email, hashedPassword, first_name, last_name, phone, address, province_id || null, district_id || null, sector_id || null, cell_id || null, village_id || null, parentRole[0].id]);

    const token = jwt.sign(
      { userId: result.insertId, username, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Send welcome message via WhatsApp/SMS
    const welcomeMessage = `Muraho ${first_name} ${last_name}! Murakaza neza kuri Garden TVET School. Konti yanyu y'umubyeyi yafunguwe neza. Mushobora gukurikirana imyigire y'abana banyu hano.`;
    
    smsService.sendUniversalMessage(phone, welcomeMessage, 0, {
      type: 'parent_registration',
      parentId: result.insertId,
      preferredMethod: 'whatsapp'
    }).catch(err => console.error('Failed to send welcome message:', err));

    res.status(201).json({
      success: true,
      message: 'Parent account created successfully',
      token,
      user: { id: result.insertId, username, email, role: 'parent', first_name, last_name }
    });
  } catch (error) {
    console.error('Parent registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get parent's children
router.get('/children', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [children] = await pool.execute(`
      SELECT s.*, c.name as class_name, co.name as course_name,
        (SELECT AVG(g.obtained_marks/g.max_marks * 100) 
         FROM grades g WHERE g.student_id = s.id) as average_grade,
        (SELECT COUNT(*) FROM attendance a 
         WHERE a.student_id = s.id AND a.status = 'present') as present_count,
        (SELECT COUNT(*) FROM attendance a 
         WHERE a.student_id = s.id) as total_attendance
      FROM parent_student ps
      JOIN users s ON ps.student_id = s.id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE ps.parent_id = ? AND s.is_active = true
      GROUP BY s.id
    `, [req.user.id]);

    res.json({ success: true, children });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Link child to parent
router.post('/link-child', [
  authenticateToken,
  requireRole('parent'),
  body('student_code').notEmpty().withMessage('Student code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { student_code, relationship } = req.body;

    const [students] = await pool.execute(
      'SELECT id FROM users WHERE student_id = ? AND role_id = (SELECT id FROM roles WHERE name = "student")',
      [student_code]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [req.user.id, students[0].id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Child already linked' });
    }

    await pool.execute(
      'INSERT INTO parent_student (parent_id, student_id, relationship) VALUES (?, ?, ?)',
      [req.user.id, students[0].id, relationship || 'parent']
    );

    // Send notification via WhatsApp/SMS
    const [parentInfo] = await pool.execute('SELECT phone, first_name FROM users WHERE id = ?', [req.user.id]);
    const [studentInfo] = await pool.execute('SELECT first_name, last_name FROM users WHERE id = ?', [students[0].id]);

    if (parentInfo.length > 0 && studentInfo.length > 0) {
      const linkMessage = `Muraho ${parentInfo[0].first_name}! Umwana wanyu ${studentInfo[0].first_name} ${studentInfo[0].last_name} bamaze kumuhuza na konti yanyu. Noneho mushobora kubona amanota n'imyitwarire bye kuri konti yanyu.`;

      smsService.sendUniversalMessage(parentInfo[0].phone, linkMessage, 0, {
        type: 'child_linking',
        parentId: req.user.id,
        studentId: students[0].id,
        preferredMethod: 'whatsapp'
      }).catch(err => console.error('Failed to send link message:', err));
    }

    res.json({ success: true, message: 'Child linked successfully' });
  } catch (error) {
    console.error('Link child error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get child grades
router.get('/children/:childId/grades', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { childId } = req.params;

    const [authorized] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [req.user.id, childId]
    );

    if (authorized.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [grades] = await pool.execute(`
      SELECT g.*, s.name as subject_name, s.code as subject_code,
        c.name as class_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN classes c ON g.class_id = c.id
      JOIN users t ON g.teacher_id = t.id
      WHERE g.student_id = ?
      ORDER BY g.assessment_date DESC
    `, [childId]);

    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get child grades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get child attendance
router.get('/children/:childId/attendance', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { childId } = req.params;

    const [authorized] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [req.user.id, childId]
    );

    if (authorized.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [attendance] = await pool.execute(`
      SELECT a.*, s.name as subject_name, c.name as class_name
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.attendance_date DESC
      LIMIT 100
    `, [childId]);

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get child fee summary
router.get('/children/:childId/fees', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { childId } = req.params;

    const [authorized] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [req.user.id, childId]
    );

    if (authorized.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [fees] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN p.payment_type = 'tuition' THEN p.amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN p.payment_type = 'tuition' AND p.status = 'pending' THEN p.amount ELSE 0 END), 0) as pending_amount,
        (SELECT fee_amount FROM courses c 
         JOIN classes cl ON c.id = cl.course_id 
         JOIN enrollments e ON cl.id = e.class_id 
         WHERE e.student_id = ? AND e.status = 'active' LIMIT 1) as total_fee
      FROM payments p
      WHERE p.student_id = ?
    `, [childId, childId]);

    res.json({ success: true, fees: fees[0] });
  } catch (error) {
    console.error('Get child fees error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update parent profile
router.put('/update', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    await pool.execute(`
      UPDATE users SET first_name = ?, email = ?, phone = ?, address = ?
      WHERE id = ?
    `, [name, email, phone, address, req.user.id]);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

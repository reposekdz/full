const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

// Middleware to verify parent token
const verifyParent = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'parent') return res.status(403).json({ success: false, message: 'Access denied' });

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get connected students
router.get('/students', verifyParent, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.student_id,
        t.name as trade_name, u.level,
        ps.relationship_type,
        (SELECT AVG(g.grade) FROM grades g WHERE g.student_id = u.id) as average_grade,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id AND a.status = 'present') * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id), 0) as attendance,
        (SELECT SUM(amount) FROM fees WHERE student_id = u.id AND status = 'pending') as fees_balance
      FROM parent_student ps
      JOIN users u ON ps.student_id = u.id
      LEFT JOIN trades t ON u.trade_code = t.code
      WHERE ps.parent_id = ? AND ps.status = 'active'
    `, [req.userId]);

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get connection requests
router.get('/connection-requests', verifyParent, async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT * FROM parent_student_requests
      WHERE parent_id = ?
      ORDER BY created_at DESC
    `, [req.userId]);

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student performance
router.get('/student/:studentId/performance', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify parent has access to this student
    const [access] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [req.userId, studentId]
    );

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [grades] = await pool.execute(`
      SELECT g.*, c.course_name, c.course_code
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?
      ORDER BY g.exam_date DESC
    `, [studentId]);

    res.json({ success: true, grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student attendance
router.get('/student/:studentId/attendance', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;

    const [access] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [req.userId, studentId]
    );

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [attendance] = await pool.execute(`
      SELECT a.*, c.course_name
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
      LIMIT 30
    `, [studentId]);

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student fees
router.get('/student/:studentId/fees', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;

    const [access] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [req.userId, studentId]
    );

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [fees] = await pool.execute(`
      SELECT * FROM fees
      WHERE student_id = ?
      ORDER BY due_date DESC
    `, [studentId]);

    res.json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message to teacher
router.post('/message', verifyParent, async (req, res) => {
  try {
    const { student_id, teacher_id, subject, message } = req.body;

    const [access] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [req.userId, student_id]
    );

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await pool.execute(`
      INSERT INTO messages (sender_id, receiver_id, subject, message, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [req.userId, teacher_id, subject, message]);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get messages
router.get('/messages', verifyParent, async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, 
        u1.first_name as sender_first_name, u1.last_name as sender_last_name,
        u2.first_name as receiver_first_name, u2.last_name as receiver_last_name
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at DESC
    `, [req.userId, req.userId]);

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get notifications
router.get('/notifications', verifyParent, async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [req.userId]);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

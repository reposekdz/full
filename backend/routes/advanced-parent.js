const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// File upload configuration
const storage = multer.diskStorage({
  destination: './uploads/parent/',
  filename: (req, file, cb) => {
    cb(null, `parent-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10000000 } });

// Middleware
const verifyParent = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'parent') return res.status(403).json({ success: false, message: 'Access denied' });
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// 1. Get Dashboard Overview
router.get('/dashboard', verifyParent, async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM parent_student WHERE parent_id = ? AND status = "active"', [req.userId]);
    const [messages] = await pool.execute('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read_status = 0', [req.userId]);
    const [notifications] = await pool.execute('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0', [req.userId]);
    const [fees] = await pool.execute('SELECT SUM(amount) as total FROM fees f JOIN parent_student ps ON f.student_id = ps.student_id WHERE ps.parent_id = ? AND f.status = "pending"', [req.userId]);
    
    res.json({
      success: true,
      data: {
        students: students[0].count,
        unread_messages: messages[0].count,
        unread_notifications: notifications[0].count,
        total_fees_due: fees[0].total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get All Students with Details
router.get('/students', verifyParent, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.student_id, u.date_of_birth,
        t.name, t.code, u.level,
        ps.relationship_type,
        (SELECT AVG(g.grade) FROM grades g WHERE g.student_id = u.id) as average_grade,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id AND a.status = 'present') * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id), 0) as attendance,
        (SELECT SUM(amount) FROM fees WHERE student_id = u.id AND status = 'pending') as fees_balance,
        (SELECT COUNT(*) FROM grades WHERE student_id = u.id) as total_exams,
        (SELECT COUNT(*) FROM behavior_records WHERE student_id = u.id AND type = 'positive') as positive_behavior,
        (SELECT COUNT(*) FROM behavior_records WHERE student_id = u.id AND type = 'negative') as negative_behavior
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

// 3. Get Student Performance Analytics
router.get('/student/:studentId/analytics', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, studentId]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const [grades] = await pool.execute(`
      SELECT c.course_name, AVG(g.grade) as avg_grade, COUNT(*) as exam_count,
      MAX(g.grade) as highest, MIN(g.grade) as lowest
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?
      GROUP BY c.id
    `, [studentId]);
    
    const [attendance] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
      FROM attendance
      WHERE student_id = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `, [studentId]);
    
    res.json({ success: true, grades, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Get Student Attendance Details
router.get('/student/:studentId/attendance', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, studentId]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    let query = `
      SELECT a.*, c.course_name, c.course_code
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ?
    `;
    const params = [studentId];
    
    if (startDate && endDate) {
      query += ' AND a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY a.date DESC LIMIT 100';
    
    const [attendance] = await pool.execute(query, params);
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Get Student Grades with Trends
router.get('/student/:studentId/grades', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, studentId]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const [grades] = await pool.execute(`
      SELECT g.*, c.course_name, c.course_code, c.credits,
      (SELECT AVG(grade) FROM grades WHERE course_id = g.course_id) as class_average
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

// 6. Get Student Fees Details
router.get('/student/:studentId/fees', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, studentId]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const [fees] = await pool.execute(`
      SELECT * FROM fees
      WHERE student_id = ?
      ORDER BY due_date DESC
    `, [studentId]);
    
    const [summary] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
        SUM(amount) as total_fees
      FROM fees
      WHERE student_id = ?
    `, [studentId]);
    
    res.json({ success: true, fees, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Get Student Behavior Records
router.get('/student/:studentId/behavior', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, studentId]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const [behavior] = await pool.execute(`
      SELECT br.*, u.first_name, u.last_name
      FROM behavior_records br
      JOIN users u ON br.recorded_by = u.id
      WHERE br.student_id = ?
      ORDER BY br.date DESC
      LIMIT 50
    `, [studentId]);
    
    res.json({ success: true, behavior });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Get Student Schedule
router.get('/student/:studentId/schedule', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, studentId]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const [schedule] = await pool.execute(`
      SELECT s.*, c.course_name, c.course_code, u.first_name, u.last_name
      FROM schedule s
      JOIN courses c ON s.course_id = c.id
      JOIN users u ON s.teacher_id = u.id
      WHERE s.class_id = (SELECT class_id FROM student_classes WHERE student_id = ?)
      ORDER BY s.day_of_week, s.start_time
    `, [studentId]);
    
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Get Student Homework
router.get('/student/:studentId/homework', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, studentId]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const [homework] = await pool.execute(`
      SELECT h.*, c.course_name, 
      (SELECT status FROM homework_submissions WHERE homework_id = h.id AND student_id = ?) as submission_status
      FROM homework h
      JOIN courses c ON h.course_id = c.id
      WHERE h.class_id = (SELECT class_id FROM student_classes WHERE student_id = ?)
      ORDER BY h.due_date DESC
      LIMIT 20
    `, [studentId, studentId]);
    
    res.json({ success: true, homework });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. Send Message to Teacher
router.post('/message/send', verifyParent, upload.array('attachments', 5), async (req, res) => {
  try {
    const { receiver_id, subject, message, student_id } = req.body;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, student_id]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const attachments = req.files ? req.files.map(f => f.filename).join(',') : null;
    
    await pool.execute(`
      INSERT INTO messages (sender_id, receiver_id, subject, message, attachments, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [req.userId, receiver_id, subject, message, attachments]);
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Get Messages
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
      LIMIT 50
    `, [req.userId, req.userId]);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. Get Notifications
router.get('/notifications', verifyParent, async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.userId]);
    
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 13. Mark Notification as Read
router.put('/notification/:id/read', verifyParent, async (req, res) => {
  try {
    await pool.execute('UPDATE notifications SET read_status = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 14. Download Student Report
router.get('/student/:studentId/report/download', verifyParent, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type } = req.query;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, studentId]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    // Generate report logic here
    res.json({ success: true, message: 'Report generation started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 15. Request Parent-Teacher Meeting
router.post('/meeting/request', verifyParent, async (req, res) => {
  try {
    const { student_id, teacher_id, preferred_date, preferred_time, reason } = req.body;
    
    const [access] = await pool.execute('SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ? AND status = "active"', [req.userId, student_id]);
    if (access.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    await pool.execute(`
      INSERT INTO meeting_requests (parent_id, student_id, teacher_id, preferred_date, preferred_time, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [req.userId, student_id, teacher_id, preferred_date, preferred_time, reason]);
    
    res.json({ success: true, message: 'Meeting request sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

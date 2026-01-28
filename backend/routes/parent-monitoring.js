const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all notifications for parent
router.get('/notifications', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT pn.*, u.first_name, u.last_name, u.student_id
      FROM parent_notifications pn
      JOIN users u ON pn.student_id = u.id
      WHERE pn.parent_id = ?
      ORDER BY pn.created_at DESC
    `, [req.user.id]);
    
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    await pool.execute(`UPDATE parent_notifications SET is_read = true WHERE id = ? AND parent_id = ?`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student complete details
router.get('/student/:id/complete', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [student] = await pool.execute(`SELECT * FROM users WHERE id = ? AND parent_id = ?`, [req.params.id, req.user.id]);
    if (student.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const [performance] = await pool.execute(`SELECT * FROM student_performance_tracking WHERE student_id = ? ORDER BY updated_at DESC LIMIT 1`, [req.params.id]);
    const [grades] = await pool.execute(`SELECT g.*, c.course_name FROM grades g JOIN courses c ON g.course_id = c.id WHERE g.student_id = ? ORDER BY g.created_at DESC`, [req.params.id]);
    const [attendance] = await pool.execute(`SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30`, [req.params.id]);
    const [discipline] = await pool.execute(`SELECT * FROM discipline_records WHERE student_id = ? ORDER BY incident_date DESC`, [req.params.id]);
    const [behavior] = await pool.execute(`SELECT * FROM student_behavior_log WHERE student_id = ? ORDER BY incident_date DESC LIMIT 20`, [req.params.id]);
    const [homework] = await pool.execute(`SELECT h.*, a.title FROM homework_submissions h JOIN assignments a ON h.assignment_id = a.id WHERE h.student_id = ? ORDER BY h.created_at DESC LIMIT 20`, [req.params.id]);
    const [medical] = await pool.execute(`SELECT * FROM student_medical_records WHERE student_id = ? ORDER BY visit_date DESC`, [req.params.id]);
    const [leaves] = await pool.execute(`SELECT * FROM student_leave_requests WHERE student_id = ? ORDER BY created_at DESC`, [req.params.id]);
    const [achievements] = await pool.execute(`SELECT * FROM student_achievements WHERE student_id = ? ORDER BY achievement_date DESC`, [req.params.id]);
    
    const [attendanceStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM attendance WHERE student_id = ?
    `, [req.params.id]);
    
    res.json({
      success: true,
      student: student[0],
      performance: performance[0] || {},
      grades,
      attendance,
      attendanceStats: attendanceStats[0],
      discipline,
      behavior,
      homework,
      medical,
      leaves,
      achievements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send notification to parent (DOD/DOS/Admin)
router.post('/notify', authenticateToken, requireRole('admin', 'dos', 'dod', 'headmaster'), async (req, res) => {
  try {
    const { student_id, notification_type, title, message, severity } = req.body;
    
    const [student] = await pool.execute(`SELECT parent_id FROM users WHERE id = ?`, [student_id]);
    if (student.length === 0 || !student[0].parent_id) {
      return res.status(404).json({ success: false, message: 'Student or parent not found' });
    }
    
    await pool.execute(`
      INSERT INTO parent_notifications (parent_id, student_id, notification_type, title, message, severity, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [student[0].parent_id, student_id, notification_type, title, message, severity, req.user.id]);
    
    res.json({ success: true, message: 'Notification sent to parent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record discipline and notify parent
router.post('/discipline', authenticateToken, requireRole('admin', 'dod', 'headmaster'), async (req, res) => {
  try {
    const { student_id, incident_type, description, severity, action_taken, incident_date } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO discipline_records (student_id, incident_type, description, severity, action_taken, recorded_by, incident_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [student_id, incident_type, description, severity, action_taken, req.user.id, incident_date]);
    
    const [student] = await pool.execute(`SELECT parent_id, first_name, last_name FROM users WHERE id = ?`, [student_id]);
    if (student[0].parent_id) {
      await pool.execute(`
        INSERT INTO parent_notifications (parent_id, student_id, notification_type, title, message, severity, created_by)
        VALUES (?, ?, 'discipline', ?, ?, ?, ?)
      `, [student[0].parent_id, student_id, `Discipline: ${incident_type}`, `${student[0].first_name} ${student[0].last_name}: ${description}`, severity === 'critical' ? 'critical' : 'warning', req.user.id]);
    }
    
    res.json({ success: true, recordId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record leave and notify parent
router.post('/leave', authenticateToken, requireRole('admin', 'dos', 'dod', 'teacher'), async (req, res) => {
  try {
    const { student_id, leave_type, reason, start_date, end_date } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO student_leave_requests (student_id, leave_type, reason, start_date, end_date, status, approved_by)
      VALUES (?, ?, ?, ?, ?, 'approved', ?)
    `, [student_id, leave_type, reason, start_date, end_date, req.user.id]);
    
    const [student] = await pool.execute(`SELECT parent_id, first_name, last_name FROM users WHERE id = ?`, [student_id]);
    if (student[0].parent_id) {
      const leaveMessages = {
        sick: 'Umwana wawe aravuye kwa muganga',
        home: 'Umwana wawe yemerewe gusubira murugo',
        hospital: 'Umwana wawe yajyanwe kwa muganga',
        emergency: 'Umwana wawe afite ikibazo cyihutirwa'
      };
      
      await pool.execute(`
        INSERT INTO parent_notifications (parent_id, student_id, notification_type, title, message, severity, created_by)
        VALUES (?, ?, 'leave', ?, ?, 'warning', ?)
      `, [student[0].parent_id, student_id, `Leave: ${leave_type}`, `${student[0].first_name} ${student[0].last_name}: ${leaveMessages[leave_type] || reason}`, req.user.id]);
      
      await pool.execute(`UPDATE student_leave_requests SET parent_notified = true WHERE id = ?`, [result.insertId]);
    }
    
    res.json({ success: true, leaveId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record medical visit and notify parent
router.post('/medical', authenticateToken, requireRole('admin', 'dos', 'dod'), async (req, res) => {
  try {
    const { student_id, record_type, description, treatment, prescribed_by, visit_date } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO student_medical_records (student_id, record_type, description, treatment, prescribed_by, visit_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [student_id, record_type, description, treatment, prescribed_by, visit_date]);
    
    const [student] = await pool.execute(`SELECT parent_id, first_name, last_name FROM users WHERE id = ?`, [student_id]);
    if (student[0].parent_id) {
      await pool.execute(`
        INSERT INTO parent_notifications (parent_id, student_id, notification_type, title, message, severity, created_by)
        VALUES (?, ?, 'medical', ?, ?, 'warning', ?)
      `, [student[0].parent_id, student_id, `Medical: ${record_type}`, `${student[0].first_name} ${student[0].last_name}: ${description}. Treatment: ${treatment}`, req.user.id]);
      
      await pool.execute(`UPDATE student_medical_records SET parent_notified = true WHERE id = ?`, [result.insertId]);
    }
    
    res.json({ success: true, recordId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update performance and notify parent
router.post('/performance', authenticateToken, requireRole('admin', 'dos', 'teacher'), async (req, res) => {
  try {
    const { student_id, academic_year_id, term, overall_grade, attendance_rate, behavior_score, participation_score, homework_completion_rate, class_rank, teacher_comments } = req.body;
    
    await pool.execute(`
      INSERT INTO student_performance_tracking (student_id, academic_year_id, term, overall_grade, attendance_rate, behavior_score, participation_score, homework_completion_rate, class_rank, teacher_comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE overall_grade = VALUES(overall_grade), attendance_rate = VALUES(attendance_rate), behavior_score = VALUES(behavior_score), participation_score = VALUES(participation_score), homework_completion_rate = VALUES(homework_completion_rate), class_rank = VALUES(class_rank), teacher_comments = VALUES(teacher_comments)
    `, [student_id, academic_year_id, term, overall_grade, attendance_rate, behavior_score, participation_score, homework_completion_rate, class_rank, teacher_comments]);
    
    const [student] = await pool.execute(`SELECT parent_id, first_name, last_name FROM users WHERE id = ?`, [student_id]);
    if (student[0].parent_id) {
      await pool.execute(`
        INSERT INTO parent_notifications (parent_id, student_id, notification_type, title, message, severity, created_by)
        VALUES (?, ?, 'performance', ?, ?, 'info', ?)
      `, [student[0].parent_id, student_id, `Performance Update: ${term}`, `${student[0].first_name} ${student[0].last_name}: Grade ${overall_grade}%, Rank ${class_rank}. ${teacher_comments}`, req.user.id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get grades for parent
router.get('/grades', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [grades] = await pool.execute(`
      SELECT g.*, c.course_name, u.first_name, u.last_name, u.student_id as student_code
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      JOIN users u ON g.student_id = u.id
      WHERE u.parent_id = ?
      ORDER BY g.created_at DESC
      LIMIT 100
    `, [req.user.id]);
    res.json({ success: true, grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance for parent
router.get('/attendance', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [attendance] = await pool.execute(`
      SELECT a.*, u.first_name, u.last_name, u.student_id as student_code
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE u.parent_id = ?
      ORDER BY a.date DESC
      LIMIT 100
    `, [req.user.id]);
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get behavior for parent
router.get('/behavior', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [behavior] = await pool.execute(`
      SELECT b.*, u.first_name, u.last_name, u.student_id as student_code
      FROM student_behavior_log b
      JOIN users u ON b.student_id = u.id
      WHERE u.parent_id = ?
      ORDER BY b.incident_date DESC
      LIMIT 50
    `, [req.user.id]);
    res.json({ success: true, behavior });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

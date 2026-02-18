// Enhanced Parent Dashboard - Full Child Monitoring Features
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== PARENT DASHBOARD OVERVIEW ====================

router.get('/dashboard', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

    // Get all connected children
    const [children] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.profile_image,
        gss.trade_name, gss.level_number, gss.gpa, 
        gss.attendance_percentage, gss.conduct_score,
        pc.can_view_marks, pc.can_view_attendance, pc.can_view_report_cards
      FROM parent_connections pc
      JOIN users u ON pc.student_id = u.id
      LEFT JOIN global_student_sheets gss ON u.id = gss.student_id
      WHERE pc.parent_id = ? AND pc.status = 'active'
    `, [parentId]);

    // Get recent notifications
    const [notifications] = await pool.execute(`
      SELECT * FROM notifications
      WHERE user_id = ? AND is_read = 0
      ORDER BY created_at DESC
      LIMIT 10
    `, [parentId]);

    // Get summary statistics
    const stats = {
      total_children: children.length,
      avg_gpa: children.reduce((sum, c) => sum + (c.gpa || 0), 0) / (children.length || 1),
      avg_attendance: children.reduce((sum, c) => sum + (c.attendance_percentage || 0), 0) / (children.length || 1),
      avg_conduct: children.reduce((sum, c) => sum + (c.conduct_score || 100), 0) / (children.length || 1)
    };

    res.json({
      success: true,
      dashboard: {
        children,
        notifications,
        stats
      }
    });
  } catch (error) {
    console.error('Parent dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CHILD DETAILS ====================

router.get('/children/:childId', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Verify parent has access to this child
    const [[connection]] = await pool.execute(`
      SELECT * FROM parent_connections
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, childId]);

    if (!connection) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get child profile
    const [[child]] = await pool.execute(`
      SELECT 
        u.*, gss.*,
        CONCAT(u.first_name, ' ', u.last_name) as full_name
      FROM users u
      LEFT JOIN global_student_sheets gss ON u.id = gss.student_id
      WHERE u.id = ?
    `, [childId]);

    res.json({
      success: true,
      child,
      permissions: {
        can_view_marks: connection.can_view_marks,
        can_view_attendance: connection.can_view_attendance,
        can_view_report_cards: connection.can_view_report_cards
      }
    });
  } catch (error) {
    console.error('Get child details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CHILD MARKS ====================

router.get('/children/:childId/marks', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;
    const { academic_year, term } = req.query;

    // Verify access
    const [[connection]] = await pool.execute(`
      SELECT can_view_marks FROM parent_connections
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, childId]);

    if (!connection || !connection.can_view_marks) {
      return res.status(403).json({ success: false, message: 'Access denied to view marks' });
    }

    let query = `
      SELECT * FROM student_marks
      WHERE student_id = ?
    `;
    const params = [childId];

    if (academic_year) {
      query += ` AND academic_year = ?`;
      params.push(academic_year);
    }
    if (term) {
      query += ` AND term = ?`;
      params.push(term);
    }

    query += ` ORDER BY created_at DESC`;

    const [marks] = await pool.execute(query, params);

    // Get statistics
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_subjects,
        ROUND(AVG(final_marks), 2) as average_marks,
        MAX(final_marks) as highest_mark,
        MIN(final_marks) as lowest_mark
      FROM student_marks
      WHERE student_id = ?
    `, [childId]);

    res.json({
      success: true,
      marks,
      statistics: stats || {}
    });
  } catch (error) {
    console.error('Get child marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CHILD ATTENDANCE ====================

router.get('/children/:childId/attendance', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;
    const { start_date, end_date } = req.query;

    // Verify access
    const [[connection]] = await pool.execute(`
      SELECT can_view_attendance FROM parent_connections
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, childId]);

    if (!connection || !connection.can_view_attendance) {
      return res.status(403).json({ success: false, message: 'Access denied to view attendance' });
    }

    let query = `
      SELECT * FROM student_attendance
      WHERE student_id = ?
    `;
    const params = [childId];

    if (start_date) {
      query += ` AND attendance_date >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND attendance_date <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY attendance_date DESC`;

    const [attendance] = await pool.execute(query, params);

    // Get summary
    const [[summary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance
      WHERE student_id = ?
    `, [childId]);

    res.json({
      success: true,
      attendance,
      summary: summary || {}
    });
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CHILD CONDUCT ====================

router.get('/children/:childId/conduct', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Verify access
    const [[connection]] = await pool.execute(`
      SELECT * FROM parent_connections
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, childId]);

    if (!connection) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [records] = await pool.execute(`
      SELECT * FROM student_conduct_records
      WHERE student_id = ?
      ORDER BY incident_date DESC
    `, [childId]);

    const [[summary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'minor' THEN 1 ELSE 0 END) as minor_incidents,
        SUM(CASE WHEN severity = 'major' THEN 1 ELSE 0 END) as major_incidents,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_incidents
      FROM student_conduct_records
      WHERE student_id = ?
    `, [childId]);

    res.json({
      success: true,
      records,
      summary: summary || {}
    });
  } catch (error) {
    console.error('Get child conduct error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CHILD REPORT CARDS ====================

router.get('/children/:childId/report-cards', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Verify access
    const [[connection]] = await pool.execute(`
      SELECT can_view_report_cards FROM parent_connections
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, childId]);

    if (!connection || !connection.can_view_report_cards) {
      return res.status(403).json({ success: false, message: 'Access denied to view report cards' });
    }

    const [reports] = await pool.execute(`
      SELECT * FROM report_cards
      WHERE student_id = ? AND status = 'published'
      ORDER BY academic_year DESC, term DESC
    `, [childId]);

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Get child report cards error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CHILD TIMETABLE ====================

router.get('/children/:childId/timetable', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Verify access
    const [[connection]] = await pool.execute(`
      SELECT * FROM parent_connections
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, childId]);

    if (!connection) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get child's trade and level
    const [[student]] = await pool.execute(`
      SELECT trade_code, level_number FROM global_student_sheets WHERE student_id = ?
    `, [childId]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get timetable
    const [timetable] = await pool.execute(`
      SELECT * FROM timetables
      WHERE trade_code = ? AND level_number = ?
      ORDER BY day_of_week, period_number
    `, [student.trade_code, student.level_number]);

    res.json({
      success: true,
      timetable
    });
  } catch (error) {
    console.error('Get child timetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CHILD EXAMS ====================

router.get('/children/:childId/exams', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Verify access
    const [[connection]] = await pool.execute(`
      SELECT * FROM parent_connections
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, childId]);

    if (!connection) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get child's trade and level
    const [[student]] = await pool.execute(`
      SELECT trade_code, level_number FROM global_student_sheets WHERE student_id = ?
    `, [childId]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get upcoming exams
    const [upcomingExams] = await pool.execute(`
      SELECT * FROM exams
      WHERE trade_code = ? AND level_number = ? AND exam_date >= CURDATE()
      ORDER BY exam_date, start_time
    `, [student.trade_code, student.level_number]);

    res.json({
      success: true,
      upcoming_exams: upcomingExams
    });
  } catch (error) {
    console.error('Get child exams error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SMS HISTORY ====================

router.get('/sms-history', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [messages] = await pool.execute(`
      SELECT * FROM sms_notifications
      WHERE recipient_id = ? OR recipient_type = 'parent'
      ORDER BY sent_at DESC
      LIMIT 50
    `, [parentId]);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get SMS history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CONTACT SCHOOL ====================

router.post('/contact-school', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { subject, message, recipient_role } = req.body;

    // Create message record
    const [result] = await pool.execute(`
      INSERT INTO messages (sender_id, recipient_role, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, 'sent', NOW())
    `, [parentId, recipient_role || 'admin', subject, message]);

    // Create notification for recipient
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      SELECT id, ?, ?, 'message', NOW()
      FROM users
      WHERE role = ? AND status = 'active'
    `, [subject, message, recipient_role || 'admin']);

    res.json({
      success: true,
      message: 'Message sent successfully',
      message_id: result.insertId
    });
  } catch (error) {
    console.error('Contact school error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

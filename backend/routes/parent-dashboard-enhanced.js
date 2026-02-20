// Enhanced Parent Dashboard - Full Child Monitoring Features
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== AUTO-FETCH STUDENT ====================

router.get('/student/auto-fetch', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

    // Get the first linked student with FULL data from global_student_sheets
    const [[student]] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name, 
        u.last_name, 
        u.profile_image,
        u.email,
        u.phone,
        gss.student_code,
        gss.trade_name, 
        gss.trade_code,
        gss.level_number,
        gss.level_suffix,
        gss.gpa, 
        gss.attendance_percentage, 
        gss.conduct_score,
        gss.conduct_grade,
        gss.academic_year,
        gss.status,
        gss.gender,
        gss.date_of_birth,
        gss.emergency_contact,
        gss.address,
        gss.class_name,
        pc.can_view_marks, 
        pc.can_view_attendance, 
        pc.can_view_report_cards,
        pc.can_view_discipline,
        pc.linked_at
      FROM parent_connections pc
      JOIN users u ON pc.student_id = u.id
      LEFT JOIN global_student_sheets gss ON u.student_id = gss.student_id OR u.id = gss.id
      WHERE pc.parent_id = ? AND pc.status = 'active'
      ORDER BY pc.linked_at DESC
      LIMIT 1
    `, [parentId]);

    if (!student) {
      return res.json({ 
        success: true, 
        student: null, 
        message: 'Nta mwana ufungiriwe' 
      });
    }

    // Get recent marks if allowed
    let recentMarks = [];
    if (student.can_view_marks) {
      const [marks] = await pool.execute(`
        SELECT sm.*, c.course_name, c.subject_code
        FROM student_marks sm
        LEFT JOIN courses c ON sm.course_code = c.course_code
        WHERE sm.student_id = ?
        ORDER BY sm.created_at DESC
        LIMIT 10
      `, [student.student_code || student.id]);
      recentMarks = marks;
    }

    // Get recent attendance if allowed
    let recentAttendance = [];
    if (student.can_view_attendance) {
      const [attendance] = await pool.execute(`
        SELECT * FROM student_attendance
        WHERE student_id = ?
        ORDER BY attendance_date DESC
        LIMIT 10
      `, [student.student_code || student.id]);
      recentAttendance = attendance;
    }

    res.json({
      success: true,
      student: {
        ...student,
        recentMarks,
        recentAttendance
      }
    });
  } catch (error) {
    console.error('Auto-fetch student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== OVERVIEW ====================

router.get('/overview', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

    // Get all connected children with FULL data from global_student_sheets
    const [children] = await pool.execute(`
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.profile_image,
        u.email,
        u.phone,
        gss.student_code,
        gss.trade_name, 
        gss.trade_code,
        gss.level_number, 
        gss.level_suffix,
        gss.gpa, 
        gss.attendance_percentage, 
        gss.conduct_score,
        gss.conduct_grade,
        gss.academic_year,
        gss.status,
        gss.gender,
        gss.date_of_birth,
        gss.emergency_contact,
        gss.address,
        pc.can_view_marks, 
        pc.can_view_attendance, 
        pc.can_view_report_cards,
        pc.can_view_discipline,
        pc.linked_at
      FROM parent_connections pc
      JOIN users u ON pc.student_id = u.id
      LEFT JOIN global_student_sheets gss ON u.student_id = gss.student_id OR u.id = gss.id
      WHERE pc.parent_id = ? AND pc.status = 'active'
    `, [parentId]);

    // Get summary statistics
    const stats = {
      total_children: children.length,
      avg_gpa: children.reduce((sum, c) => sum + (parseFloat(c.gpa) || 0), 0) / (children.length || 1),
      avg_attendance: children.reduce((sum, c) => sum + (parseFloat(c.attendance_percentage) || 0), 0) / (children.length || 1),
      avg_conduct: children.reduce((sum, c) => sum + (parseFloat(c.conduct_score) || 40), 0) / (children.length || 1),
      excellent_conduct: children.filter(c => (parseFloat(c.conduct_score) || 0) >= 30).length,
      good_attendance: children.filter(c => (parseFloat(c.attendance_percentage) || 0) >= 85).length
    };

    res.json({
      success: true,
      overview: {
        children,
        stats
      }
    });
  } catch (error) {
    console.error('Parent overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== NOTIFICATIONS ====================

router.get('/notifications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

    // Get recent notifications from parent_notifications table with student details
    const [notifications] = await pool.execute(`
      SELECT 
        pn.*,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        gss.level_number
      FROM parent_notifications pn
      LEFT JOIN global_student_sheets gss ON pn.student_id = gss.id
      WHERE pn.parent_id = ? 
      ORDER BY pn.created_at DESC
      LIMIT 30
    `, [parentId]);

    // Get unread count
    const [[unreadCount]] = await pool.execute(`
      SELECT COUNT(*) as count FROM parent_notifications
      WHERE parent_id = ? AND is_read = 0
    `, [parentId]);

    // Get notification stats
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN category = 'discipline' THEN 1 ELSE 0 END) as discipline,
        SUM(CASE WHEN category = 'attendance' THEN 1 ELSE 0 END) as attendance,
        SUM(CASE WHEN category = 'academic' THEN 1 ELSE 0 END) as academic,
        SUM(CASE WHEN category = 'payment' THEN 1 ELSE 0 END) as payment
      FROM parent_notifications
      WHERE parent_id = ?
    `, [parentId]);

    res.json({
      success: true,
      notifications,
      unread_count: unreadCount?.count || 0,
      stats: stats
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

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

    // Get parent phone
    const [[parent]] = await pool.execute(`
      SELECT phone FROM users WHERE id = ?
    `, [parentId]);

    // Get SMS notifications for this parent
    const [messages] = await pool.execute(`
      SELECT * FROM sms_notifications
      WHERE recipient_phone = ? OR recipient_id = ?
      ORDER BY sent_at DESC
      LIMIT 50
    `, [parent?.phone, parentId]);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get SMS history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REQUEST SMS NOTIFICATION ====================

router.post('/request-notification', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { notification_type, phone } = req.body;

    // Get parent info
    const [[parent]] = await pool.execute(`
      SELECT * FROM users WHERE id = ?
    `, [parentId]);

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Create notification request
    const requestId = `SMSREQ-${Date.now()}`;
    await pool.execute(`
      INSERT INTO sms_notifications (notification_id, recipient_id, recipient_phone, message, type, status, sent_at)
      VALUES (?, ?, ?, ?, ?, 'pending', NOW())
    `, [requestId, parentId, phone || parent.phone, `SMS notification request: ${notification_type}`, notification_type || 'general']);

    // Try to send SMS immediately (demo mode)
    try {
      const { sendSMS } = require('../services/africanTalkingService');
      const targetPhone = phone || parent.phone;
      const message = `Hello ${parent.first_name}, you have requested ${notification_type} notifications. You will receive SMS updates about your child's progress.`;
      await sendSMS(targetPhone, message);
    } catch (smsError) {
      console.log('SMS send failed (demo mode):', smsError.message);
    }

    res.json({
      success: true,
      message: 'SMS notification request submitted',
      request_id: requestId
    });
  } catch (error) {
    console.error('Request notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SMS BALANCE CHECK ====================

router.get('/sms-status', authenticateToken, requireRole(['parent', 'admin']), async (req, res) => {
  try {
    // Check SMS service status
    const { getBalance, isReady } = require('../services/africanTalkingService');
    
    const ready = isReady();
    let balance = null;
    
    if (ready) {
      const balanceResult = await getBalance();
      balance = balanceResult.balance;
    }

    res.json({
      success: true,
      sms_ready: ready,
      balance: balance,
      mode: ready ? 'production' : 'demo'
    });
  } catch (error) {
    console.error('Get SMS status error:', error);
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

// ==================== FULL CHILD CREDENTIALS ====================

router.get('/children/:childId/full-credentials', authenticateToken, requireRole(['parent']), async (req, res) => {
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

    // Get full student data
    const [[student]] = await pool.execute(`
      SELECT 
        u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
        u.gender, u.date_of_birth, u.address, u.profile_image,
        u.created_at as user_created_at,
        gss.*
      FROM users u
      LEFT JOIN global_student_sheets gss ON u.student_id = gss.student_id OR u.id = gss.id
      WHERE u.id = ?
    `, [childId]);

    // Get recent marks
    let marks = [];
    if (connection.can_view_marks) {
      const [recentMarks] = await pool.execute(`
        SELECT sm.*, c.course_name, c.subject_code
        FROM student_marks sm
        LEFT JOIN courses c ON sm.course_code = c.course_code
        WHERE sm.student_id = ?
        ORDER BY sm.created_at DESC
        LIMIT 20
      `, [childId]);
      marks = recentMarks;
    }

    // Get recent attendance
    let attendance = [];
    if (connection.can_view_attendance) {
      const [recentAttendance] = await pool.execute(`
        SELECT * FROM student_attendance
        WHERE student_id = ?
        ORDER BY attendance_date DESC
        LIMIT 30
      `, [childId]);
      attendance = recentAttendance;
    }

    // Get payments
    const [payments] = await pool.execute(`
      SELECT * FROM student_payments
      WHERE student_id = ?
      ORDER BY payment_date DESC
      LIMIT 10
    `, [childId]);

    // Get conduct records
    let conduct = [];
    if (connection.can_view_discipline) {
      const [conductRecords] = await pool.execute(`
        SELECT * FROM student_conduct_records
        WHERE student_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `, [childId]);
      conduct = conductRecords;
    }

    // Get notifications for this child
    const [notifications] = await pool.execute(`
      SELECT * FROM parent_notifications
      WHERE parent_id = ? AND student_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [parentId, childId]);

    // Calculate statistics
    const stats = {
      academic: {
        total_marks: marks.length,
        average_marks: marks.length > 0 ? (marks.reduce((sum, m) => sum + (parseFloat(m.final_marks) || 0), 0) / marks.length).toFixed(2) : 0,
        highest_marks: marks.length > 0 ? Math.max(...marks.map(m => parseFloat(m.final_marks) || 0)) : 0,
        lowest_marks: marks.length > 0 ? Math.min(...marks.map(m => parseFloat(m.final_marks) || 0)) : 0
      },
      attendance: {
        total_days: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        rate: attendance.length > 0 ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2) : 0
      },
      payments: {
        total: payments.length,
        total_paid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
        pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
      },
      conduct: {
        total_incidents: conduct.length,
        major: conduct.filter(c => c.severity === 'major').length,
        minor: conduct.filter(c => c.severity === 'minor').length,
        resolved: conduct.filter(c => c.status === 'resolved').length
      }
    };

    res.json({
      success: true,
      credentials: {
        // Basic Info
        basic: {
          id: student?.id,
          student_code: student?.student_code,
          username: student?.username,
          first_name: student?.first_name,
          last_name: student?.last_name,
          full_name: `${student?.first_name || ''} ${student?.last_name || ''}`.trim(),
          email: student?.email,
          phone: student?.phone,
          gender: student?.gender,
          date_of_birth: student?.date_of_birth,
          address: student?.address,
          profile_image: student?.profile_image,
          emergency_contact: student?.emergency_contact,
          registered_at: student?.user_created_at
        },
        // Academic Info
        academic: {
          trade_name: student?.trade_name,
          trade_code: student?.trade_code,
          level_number: student?.level_number,
          level_suffix: student?.level_suffix,
          class_name: student?.class_name,
          academic_year: student?.academic_year,
          status: student?.status,
          gpa: student?.gpa,
          attendance_percentage: student?.attendance_percentage,
          conduct_score: student?.conduct_score,
          conduct_grade: student?.conduct_grade
        },
        // Permissions
        permissions: {
          can_view_marks: connection.can_view_marks,
          can_view_attendance: connection.can_view_attendance,
          can_view_report_cards: connection.can_view_report_cards,
          can_view_discipline: connection.can_view_discipline,
          linked_at: connection.linked_at
        },
        // Data
        recent_marks: marks,
        recent_attendance: attendance,
        recent_payments: payments,
        recent_conduct: conduct,
        recent_notifications: notifications,
        // Statistics
        stats,
        // Quick links
        links: {
          marks: connection.can_view_marks ? `/api/parent-dashboard/children/${childId}/marks` : null,
          attendance: connection.can_view_attendance ? `/api/parent-dashboard/children/${childId}/attendance` : null,
          payments: `/api/parent-dashboard/children/${childId}/payments`,
          conduct: connection.can_view_discipline ? `/api/parent-dashboard/children/${childId}/conduct` : null,
          timetable: `/api/parent-dashboard/children/${childId}/timetable`,
          exams: connection.can_view_marks ? `/api/parent-dashboard/children/${childId}/exams` : null,
          report_cards: connection.can_view_report_cards ? `/api/parent-dashboard/children/${childId}/report-cards` : null
        }
      }
    });
  } catch (error) {
    console.error('Get full credentials error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

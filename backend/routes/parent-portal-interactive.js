const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get parent's linked children with full details
router.get('/my-children', async (req, res) => {
  try {
    const parentId = req.user?.id || req.query.parent_id;
    
    const [children] = await db.query(`
      SELECT 
        s.student_id, s.first_name, s.last_name, s.gender, s.date_of_birth,
        s.admission_number, s.phone, s.email, s.profile_image,
        t.trade_name, t.trade_code, l.level_number, l.level_name,
        pl.relationship, pl.is_primary_contact,
        (SELECT AVG(attendance_percentage) FROM attendance WHERE student_id = s.student_id) as avg_attendance,
        (SELECT conduct_score FROM student_conduct WHERE student_id = s.student_id ORDER BY last_updated DESC LIMIT 1) as conduct_score,
        (SELECT COUNT(*) FROM student_conduct_records WHERE student_id = s.student_id AND status = 'active') as active_incidents,
        (SELECT SUM(amount) FROM fees WHERE student_id = s.student_id) as total_fees,
        (SELECT SUM(amount_paid) FROM fee_payments WHERE student_id = s.student_id) as total_paid
      FROM parent_student_links pl
      JOIN students s ON pl.student_id = s.student_id
      LEFT JOIN trades t ON s.trade_code = t.trade_code
      LEFT JOIN levels l ON s.level_number = l.level_number
      WHERE pl.parent_id = ? AND pl.status = 'linked'
    `, [parentId]);
    
    res.json({ success: true, children });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child's conduct records
router.get('/conduct/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [records] = await db.query(`
      SELECT 
        scr.*, 
        CONCAT(staff.first_name, ' ', staff.last_name) as recorded_by_name,
        staff.role as staff_role
      FROM student_conduct_records scr
      LEFT JOIN users staff ON scr.recorded_by = staff.user_id
      WHERE scr.student_id = ? 
      ORDER BY scr.incident_date DESC
      LIMIT 50
    `, [studentId]);
    
    const [summary] = await db.query(`
      SELECT 
        conduct_score,
        total_incidents,
        minor_incidents,
        moderate_incidents,
        major_incidents,
        severe_incidents,
        last_updated
      FROM student_conduct
      WHERE student_id = ?
    `, [studentId]);
    
    res.json({ success: true, records, summary: summary[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child's attendance
router.get('/attendance/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        a.*,
        c.course_name,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM attendance a
      LEFT JOIN courses c ON a.course_id = c.course_id
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      WHERE a.student_id = ?
    `;
    
    const params = [studentId];
    if (startDate && endDate) {
      query += ` AND a.date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += ` ORDER BY a.date DESC LIMIT 100`;
    
    const [records] = await db.query(query, params);
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 2) as attendance_rate
      FROM attendance
      WHERE student_id = ?
    `, [studentId]);
    
    res.json({ success: true, records, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child's grades
router.get('/grades/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, year } = req.query;
    
    let query = `
      SELECT 
        g.*,
        c.course_name, c.course_code,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      JOIN courses c ON g.course_id = c.course_id
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      WHERE g.student_id = ?
    `;
    
    const params = [studentId];
    if (term) {
      query += ` AND g.term = ?`;
      params.push(term);
    }
    if (year) {
      query += ` AND g.year = ?`;
      params.push(year);
    }
    
    query += ` ORDER BY g.created_at DESC`;
    
    const [grades] = await db.query(query, params);
    
    const [summary] = await db.query(`
      SELECT 
        AVG(marks) as average_marks,
        MAX(marks) as highest_mark,
        MIN(marks) as lowest_mark,
        COUNT(*) as total_subjects
      FROM grades
      WHERE student_id = ?
    `, [studentId]);
    
    res.json({ success: true, grades, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child's fee status
router.get('/fees/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [fees] = await db.query(`
      SELECT * FROM fees 
      WHERE student_id = ? 
      ORDER BY due_date DESC
    `, [studentId]);
    
    const [payments] = await db.query(`
      SELECT * FROM fee_payments 
      WHERE student_id = ? 
      ORDER BY payment_date DESC
    `, [studentId]);
    
    const [summary] = await db.query(`
      SELECT 
        SUM(f.amount) as total_fees,
        COALESCE(SUM(fp.amount_paid), 0) as total_paid,
        (SUM(f.amount) - COALESCE(SUM(fp.amount_paid), 0)) as balance
      FROM fees f
      LEFT JOIN fee_payments fp ON f.student_id = fp.student_id
      WHERE f.student_id = ?
    `, [studentId]);
    
    res.json({ success: true, fees, payments, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child's assignments
router.get('/assignments/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [assignments] = await db.query(`
      SELECT 
        a.*,
        c.course_name,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        sub.submission_date, sub.marks_obtained, sub.feedback, sub.status as submission_status
      FROM assignments a
      JOIN courses c ON a.course_id = c.course_id
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      LEFT JOIN assignment_submissions sub ON a.assignment_id = sub.assignment_id AND sub.student_id = ?
      WHERE a.trade_code = (SELECT trade_code FROM students WHERE student_id = ?)
        AND a.level_number = (SELECT level_number FROM students WHERE student_id = ?)
      ORDER BY a.due_date DESC
      LIMIT 50
    `, [studentId, studentId, studentId]);
    
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child's timetable
router.get('/timetable/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [student] = await db.query(`
      SELECT trade_code, level_number FROM students WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [timetable] = await db.query(`
      SELECT 
        tt.*,
        c.course_name,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM timetable tt
      JOIN courses c ON tt.course_id = c.course_id
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      WHERE tt.trade_code = ? AND tt.level_number = ?
      ORDER BY 
        FIELD(tt.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        tt.start_time
    `, [student[0].trade_code, student[0].level_number]);
    
    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child's leave requests
router.get('/leave-requests/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [requests] = await db.query(`
      SELECT 
        lr.*,
        CONCAT(approved_by_user.first_name, ' ', approved_by_user.last_name) as approved_by_name
      FROM leave_requests lr
      LEFT JOIN users approved_by_user ON lr.approved_by = approved_by_user.user_id
      WHERE lr.student_id = ?
      ORDER BY lr.created_at DESC
    `, [studentId]);
    
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit leave request for child
router.post('/leave-request', async (req, res) => {
  try {
    const { student_id, leave_type, start_date, end_date, reason } = req.body;
    const parentId = req.user?.id || req.body.parent_id;
    
    // Verify parent-student link
    const [link] = await db.query(`
      SELECT * FROM parent_student_links 
      WHERE parent_id = ? AND student_id = ? AND status = 'linked'
    `, [parentId, student_id]);
    
    if (!link[0]) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const [result] = await db.query(`
      INSERT INTO leave_requests 
      (student_id, leave_type, start_date, end_date, reason, requested_by, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [student_id, leave_type, start_date, end_date, reason, parentId]);
    
    res.json({ success: true, request_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get notifications for parent
router.get('/notifications', async (req, res) => {
  try {
    const parentId = req.user?.id || req.query.parent_id;
    
    const [notifications] = await db.query(`
      SELECT 
        n.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name
      FROM parent_notifications n
      LEFT JOIN students s ON n.student_id = s.student_id
      WHERE n.parent_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [parentId]);
    
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query(`
      UPDATE parent_notifications 
      SET is_read = 1, read_at = NOW()
      WHERE notification_id = ?
    `, [id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get communication history
router.get('/communications/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [messages] = await db.query(`
      SELECT 
        m.*,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        sender.role as sender_role
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.user_id
      WHERE m.student_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [studentId]);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message to teacher/staff
router.post('/send-message', async (req, res) => {
  try {
    const { student_id, recipient_id, subject, message } = req.body;
    const parentId = req.user?.id || req.body.parent_id;
    
    const [result] = await db.query(`
      INSERT INTO messages 
      (sender_id, recipient_id, student_id, subject, message, status)
      VALUES (?, ?, ?, ?, ?, 'sent')
    `, [parentId, recipient_id, student_id, subject, message]);
    
    res.json({ success: true, message_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child's report cards
router.get('/report-cards/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [reports] = await db.query(`
      SELECT * FROM report_cards 
      WHERE student_id = ?
      ORDER BY year DESC, term DESC
    `, [studentId]);
    
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dashboard summary
router.get('/dashboard-summary', async (req, res) => {
  try {
    const parentId = req.user?.id || req.query.parent_id;
    
    const [children] = await db.query(`
      SELECT COUNT(*) as total_children
      FROM parent_student_links
      WHERE parent_id = ? AND status = 'linked'
    `, [parentId]);
    
    const [unreadNotifications] = await db.query(`
      SELECT COUNT(*) as unread_count
      FROM parent_notifications
      WHERE parent_id = ? AND is_read = 0
    `, [parentId]);
    
    const [pendingLeave] = await db.query(`
      SELECT COUNT(*) as pending_count
      FROM leave_requests lr
      JOIN parent_student_links psl ON lr.student_id = psl.student_id
      WHERE psl.parent_id = ? AND lr.status = 'pending'
    `, [parentId]);
    
    const [recentIncidents] = await db.query(`
      SELECT COUNT(*) as incident_count
      FROM student_conduct_records scr
      JOIN parent_student_links psl ON scr.student_id = psl.student_id
      WHERE psl.parent_id = ? 
        AND scr.incident_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND scr.status = 'active'
    `, [parentId]);
    
    res.json({
      success: true,
      summary: {
        total_children: children[0].total_children,
        unread_notifications: unreadNotifications[0].unread_count,
        pending_leave_requests: pendingLeave[0].pending_count,
        recent_incidents: recentIncidents[0].incident_count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

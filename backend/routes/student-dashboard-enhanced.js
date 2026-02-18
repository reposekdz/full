// Enhanced Student Dashboard - Full Features
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== STUDENT DASHBOARD OVERVIEW ====================

router.get('/dashboard', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Get student profile
    const [[profile]] = await pool.execute(`
      SELECT 
        gss.*,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.email, u.phone, u.profile_image
      FROM global_student_sheets gss
      JOIN users u ON gss.student_id = u.id
      WHERE gss.student_id = ?
    `, [studentId]);

    // Get attendance summary
    const [[attendance]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance
      WHERE student_id = ? AND attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [studentId]);

    // Get recent marks
    const [recentMarks] = await pool.execute(`
      SELECT 
        subject_code, subject_name, final_marks, quiz_marks, midterm_marks,
        term, academic_year, created_at
      FROM student_marks
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [studentId]);

    // Get conduct records
    const [[conduct]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'major' THEN 1 ELSE 0 END) as major_incidents,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_incidents
      FROM student_conduct_records
      WHERE student_id = ?
    `, [studentId]);

    // Get today's timetable
    const dayOfWeek = new Date().getDay();
    const [todaySchedule] = await pool.execute(`
      SELECT 
        period_number, subject_name, teacher_name, room_number, start_time, end_time
      FROM timetables
      WHERE trade_code = ? AND level_number = ? AND day_of_week = ?
      ORDER BY period_number
    `, [profile?.trade_code, profile?.level_number, dayOfWeek]);

    // Get upcoming exams
    const [upcomingExams] = await pool.execute(`
      SELECT 
        exam_name, subject, exam_date, start_time, duration, room
      FROM exams
      WHERE trade_code = ? AND level_number = ? AND exam_date >= CURDATE()
      ORDER BY exam_date, start_time
      LIMIT 5
    `, [profile?.trade_code, profile?.level_number]);

    // Get notifications
    const [notifications] = await pool.execute(`
      SELECT * FROM notifications
      WHERE user_id = ? AND is_read = 0
      ORDER BY created_at DESC
      LIMIT 5
    `, [studentId]);

    res.json({
      success: true,
      dashboard: {
        profile: profile || {},
        attendance: attendance || {},
        recent_marks: recentMarks || [],
        conduct: conduct || {},
        today_schedule: todaySchedule || [],
        upcoming_exams: upcomingExams || [],
        notifications: notifications || []
      }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== MARKS & GRADES ====================

router.get('/marks', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { academic_year, term } = req.query;

    let query = `
      SELECT 
        sm.*,
        ROUND((quiz_marks + midterm_marks + final_marks) / 3, 2) as average_marks
      FROM student_marks sm
      WHERE sm.student_id = ?
    `;
    const params = [studentId];

    if (academic_year) {
      query += ` AND sm.academic_year = ?`;
      params.push(academic_year);
    }
    if (term) {
      query += ` AND sm.term = ?`;
      params.push(term);
    }

    query += ` ORDER BY sm.created_at DESC`;

    const [marks] = await pool.execute(query, params);

    // Calculate statistics
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_subjects,
        ROUND(AVG(final_marks), 2) as average_marks,
        MAX(final_marks) as highest_mark,
        MIN(final_marks) as lowest_mark,
        SUM(CASE WHEN final_marks >= 50 THEN 1 ELSE 0 END) as passed_subjects
      FROM student_marks
      WHERE student_id = ?
    `, [studentId]);

    res.json({
      success: true,
      marks,
      statistics: stats || {}
    });
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ATTENDANCE ====================

router.get('/attendance', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        attendance_date, status, notes, marked_at
      FROM student_attendance
      WHERE student_id = ?
    `;
    const params = [studentId];

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
    `, [studentId]);

    res.json({
      success: true,
      attendance,
      summary: summary || {}
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TIMETABLE ====================

router.get('/timetable', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Get student's trade and level
    const [[student]] = await pool.execute(`
      SELECT trade_code, level_number FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get full week timetable
    const [timetable] = await pool.execute(`
      SELECT 
        day_of_week, period_number, subject_name, teacher_name, room_number, start_time, end_time
      FROM timetables
      WHERE trade_code = ? AND level_number = ?
      ORDER BY day_of_week, period_number
    `, [student.trade_code, student.level_number]);

    // Group by day
    const groupedTimetable = timetable.reduce((acc, period) => {
      if (!acc[period.day_of_week]) {
        acc[period.day_of_week] = [];
      }
      acc[period.day_of_week].push(period);
      return acc;
    }, {});

    res.json({
      success: true,
      timetable: groupedTimetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EXAMS ====================

router.get('/exams', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Get student's trade and level
    const [[student]] = await pool.execute(`
      SELECT trade_code, level_number FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get upcoming exams
    const [upcomingExams] = await pool.execute(`
      SELECT * FROM exams
      WHERE trade_code = ? AND level_number = ? AND exam_date >= CURDATE()
      ORDER BY exam_date, start_time
    `, [student.trade_code, student.level_number]);

    // Get past exams
    const [pastExams] = await pool.execute(`
      SELECT * FROM exams
      WHERE trade_code = ? AND level_number = ? AND exam_date < CURDATE()
      ORDER BY exam_date DESC
      LIMIT 10
    `, [student.trade_code, student.level_number]);

    res.json({
      success: true,
      upcoming_exams: upcomingExams || [],
      past_exams: pastExams || []
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CONDUCT RECORDS ====================

router.get('/conduct', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;

    const [records] = await pool.execute(`
      SELECT 
        incident_date, description, severity, status, handled_by, created_at
      FROM student_conduct_records
      WHERE student_id = ?
      ORDER BY incident_date DESC
    `, [studentId]);

    const [[summary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'minor' THEN 1 ELSE 0 END) as minor_incidents,
        SUM(CASE WHEN severity = 'major' THEN 1 ELSE 0 END) as major_incidents,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_incidents
      FROM student_conduct_records
      WHERE student_id = ?
    `, [studentId]);

    res.json({
      success: true,
      records: records || [],
      summary: summary || {}
    });
  } catch (error) {
    console.error('Get conduct error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REPORT CARDS ====================

router.get('/report-cards', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;

    const [reports] = await pool.execute(`
      SELECT * FROM report_cards
      WHERE student_id = ? AND status = 'published'
      ORDER BY academic_year DESC, term DESC
    `, [studentId]);

    res.json({
      success: true,
      reports: reports || []
    });
  } catch (error) {
    console.error('Get report cards error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== LEAVE REQUESTS ====================

router.get('/leave-requests', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;

    const [requests] = await pool.execute(`
      SELECT * FROM leave_requests
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [studentId]);

    res.json({
      success: true,
      requests: requests || []
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leave-requests', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { leave_type, start_date, end_date, reason } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', NOW())
    `, [studentId, leave_type, start_date, end_date, reason]);

    res.json({
      success: true,
      message: 'Leave request submitted successfully',
      request_id: result.insertId
    });
  } catch (error) {
    console.error('Submit leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PROFILE ====================

router.get('/profile', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.userId;

    const [[profile]] = await pool.execute(`
      SELECT 
        u.*,
        gss.trade_code, gss.trade_name, gss.level_number, gss.level_suffix,
        gss.gpa, gss.attendance_percentage, gss.conduct_score,
        sp.admission_number, sp.date_of_birth, sp.gender, sp.enrollment_date
      FROM users u
      LEFT JOIN global_student_sheets gss ON u.id = gss.student_id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `, [studentId]);

    // Get guardians
    const [guardians] = await pool.execute(`
      SELECT g.* FROM guardians g
      WHERE g.student_id = ?
    `, [studentId]);

    res.json({
      success: true,
      profile: profile || {},
      guardians: guardians || []
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

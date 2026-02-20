const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/parent-child-dashboard/:studentId - Get complete child dashboard data
router.get('/:studentId', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    const { studentId } = req.params;

    // Verify parent has access to this student
    const [access] = await pool.execute(`
      SELECT id FROM parent_student_links 
      WHERE parent_id = ? AND student_id = ? AND status = 'approved'
    `, [parentId, studentId]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Ntabwo ufite uburenganzira bwo kureba iyi myirondoro' });
    }

    // Get student basic info
    const [students] = await pool.execute(`
      SELECT 
        id, student_id, student_code, first_name, last_name,
        trade_code, trade_name, level_number, gender, 
        phone, email, status, date_of_birth, address
      FROM global_student_sheets
      WHERE id = ?
    `, [studentId]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Umunyeshuri ntabwo yabonetse' });
    }

    const student = students[0];

    // Get conduct records (discipline)
    const [conduct] = await pool.execute(`
      SELECT 
        id, incident_type, severity, description, 
        action_taken, conduct_points_deducted, new_conduct_score,
        removed_by_name, created_at
      FROM student_conduct_records
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [studentId]);

    // Get conduct summary
    const [conductSummary] = await pool.execute(`
      SELECT 
        COALESCE(conduct_score, 40) as current_score,
        40 as max_score,
        COALESCE(SUM(conduct_points_deducted), 0) as total_deducted,
        COUNT(*) as total_incidents
      FROM student_conduct_records
      WHERE student_id = ?
    `, [studentId]);

    // Get fees information
    const [fees] = await pool.execute(`
      SELECT 
        id, fee_type, amount, amount_paid, 
        (amount - COALESCE(amount_paid, 0)) as balance,
        due_date, status, term, academic_year
      FROM student_fees
      WHERE student_id = ?
      ORDER BY due_date DESC
    `, [studentId]);

    const [feesSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_fees,
        COALESCE(SUM(amount_paid), 0) as total_paid,
        COALESCE(SUM(amount - COALESCE(amount_paid, 0)), 0) as total_balance
      FROM student_fees
      WHERE student_id = ?
    `, [studentId]);

    // Get grades/performance
    const [grades] = await pool.execute(`
      SELECT 
        id, course_code, course_name, marks, max_marks,
        percentage, grade, term, academic_year, exam_type,
        recorded_at
      FROM student_grades
      WHERE student_id = ?
      ORDER BY recorded_at DESC
      LIMIT 50
    `, [studentId]);

    const [gradesSummary] = await pool.execute(`
      SELECT 
        COALESCE(AVG(percentage), 0) as average_percentage,
        COUNT(*) as total_exams,
        SUM(CASE WHEN grade IN ('A', 'B', 'C') THEN 1 ELSE 0 END) as passed_exams
      FROM student_grades
      WHERE student_id = ?
    `, [studentId]);

    // Get attendance
    const [attendance] = await pool.execute(`
      SELECT 
        id, date, status, course_code, course_name,
        marked_by, remarks, created_at
      FROM student_attendance
      WHERE student_id = ?
      ORDER BY date DESC
      LIMIT 30
    `, [studentId]);

    const [attendanceSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)), 2) as attendance_rate
      FROM student_attendance
      WHERE student_id = ?
    `, [studentId]);

    // Get assignments
    const [assignments] = await pool.execute(`
      SELECT 
        a.id, a.title, a.description, a.due_date,
        a.course_code, a.course_name, a.max_marks,
        s.submission_date, s.marks_obtained, s.status as submission_status,
        s.feedback
      FROM assignments a
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
      WHERE a.trade_code = ? AND a.level_number = ?
      ORDER BY a.due_date DESC
      LIMIT 20
    `, [studentId, student.trade_code, student.level_number]);

    const [assignmentsSummary] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT s.id) as submitted_assignments,
        SUM(CASE WHEN s.status = 'graded' THEN 1 ELSE 0 END) as graded_assignments,
        COALESCE(AVG(s.marks_obtained), 0) as average_marks
      FROM assignments a
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
      WHERE a.trade_code = ? AND a.level_number = ?
    `, [studentId, student.trade_code, student.level_number]);

    // Get leave records
    const [leaves] = await pool.execute(`
      SELECT 
        id, leave_type, reason, start_date, end_date,
        status, approved_by_name, approved_at, created_at
      FROM student_leaves
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [studentId]);

    // Get messages/notifications
    const [messages] = await pool.execute(`
      SELECT 
        id, title, message, type, priority,
        sent_by, sent_at, read_status
      FROM parent_messages
      WHERE parent_id = ? AND student_id = ?
      ORDER BY sent_at DESC
      LIMIT 20
    `, [parentId, studentId]);

    const [unreadCount] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM parent_messages
      WHERE parent_id = ? AND student_id = ? AND read_status = 'unread'
    `, [parentId, studentId]);

    // Get timetable
    const [timetable] = await pool.execute(`
      SELECT 
        id, day_of_week, period_number, start_time, end_time,
        course_code, course_name, teacher_name, room_number
      FROM timetable
      WHERE trade_code = ? AND level_number = ?
      ORDER BY 
        FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        period_number
    `, [student.trade_code, student.level_number]);

    // Get report cards
    const [reportCards] = await pool.execute(`
      SELECT 
        id, term, academic_year, total_marks, average_percentage,
        overall_grade, class_rank, total_students, remarks,
        generated_at
      FROM report_cards
      WHERE student_id = ?
      ORDER BY generated_at DESC
      LIMIT 5
    `, [studentId]);

    res.json({
      success: true,
      student: {
        ...student,
        full_name: `${student.first_name} ${student.last_name}`
      },
      conduct: {
        records: conduct,
        summary: conductSummary[0] || { current_score: 40, max_score: 40, total_deducted: 0, total_incidents: 0 }
      },
      fees: {
        records: fees,
        summary: feesSummary[0] || { total_fees: 0, total_paid: 0, total_balance: 0 }
      },
      performance: {
        grades: grades,
        summary: gradesSummary[0] || { average_percentage: 0, total_exams: 0, passed_exams: 0 }
      },
      attendance: {
        records: attendance,
        summary: attendanceSummary[0] || { total_days: 0, present_days: 0, absent_days: 0, late_days: 0, attendance_rate: 0 }
      },
      assignments: {
        records: assignments,
        summary: assignmentsSummary[0] || { total_assignments: 0, submitted_assignments: 0, graded_assignments: 0, average_marks: 0 }
      },
      leaves: leaves,
      messages: {
        records: messages,
        unread_count: unreadCount[0]?.count || 0
      },
      timetable: timetable,
      reportCards: reportCards
    });

  } catch (error) {
    console.error('Error fetching parent child dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/parent-child-dashboard/:studentId/mark-message-read - Mark message as read
router.post('/:studentId/mark-message-read/:messageId', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    const { messageId } = req.params;

    await pool.execute(`
      UPDATE parent_messages 
      SET read_status = 'read', read_at = NOW()
      WHERE id = ? AND parent_id = ?
    `, [messageId, parentId]);

    res.json({ success: true, message: 'Ubutumwa bwasomwe' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/parent-child-dashboard/:studentId/recent-activity - Get recent activity
router.get('/:studentId/recent-activity', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    const { studentId } = req.params;

    // Verify access
    const [access] = await pool.execute(`
      SELECT id FROM parent_student_links 
      WHERE parent_id = ? AND student_id = ? AND status = 'approved'
    `, [parentId, studentId]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Ntabwo ufite uburenganzira' });
    }

    const activities = [];

    // Recent conduct
    const [conduct] = await pool.execute(`
      SELECT 'conduct' as type, created_at, incident_type as title, description
      FROM student_conduct_records WHERE student_id = ?
      ORDER BY created_at DESC LIMIT 5
    `, [studentId]);

    // Recent grades
    const [grades] = await pool.execute(`
      SELECT 'grade' as type, recorded_at as created_at, 
        CONCAT(course_name, ' - ', grade) as title, 
        CONCAT('Amanota: ', marks, '/', max_marks) as description
      FROM student_grades WHERE student_id = ?
      ORDER BY recorded_at DESC LIMIT 5
    `, [studentId]);

    // Recent attendance
    const [attendance] = await pool.execute(`
      SELECT 'attendance' as type, created_at, 
        CONCAT('Kwitabira - ', status) as title,
        CONCAT(course_name, ' - ', date) as description
      FROM student_attendance WHERE student_id = ?
      ORDER BY created_at DESC LIMIT 5
    `, [studentId]);

    activities.push(...conduct, ...grades, ...attendance);
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, activities: activities.slice(0, 15) });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

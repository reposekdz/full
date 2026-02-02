const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ULTRA-COMPREHENSIVE PARENT PORTAL
 * Real-time student monitoring, payment management, communication hub
 * AI-powered insights, predictive analytics, mobile-first design
 */

// ============================================
// PARENT DASHBOARD - Real-Time Overview
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentPhone = req.user.phone || req.user.username;
    
    const [linkedStudents] = await pool.execute(`
      SELECT student_id, student_sheet_id FROM student_parents 
      WHERE phone = ? OR email = ?
    `, [parentPhone, req.user.email]);
    
    if (linkedStudents.length === 0) {
      return res.json({
        success: true,
        message: 'No students linked to this parent account',
        children: [],
        total_children: 0,
        needs_linking: true
      });
    }
    
    const [children] = await pool.execute(`
      SELECT DISTINCT gs.*, 
        tc.name as class_name,
        tc.level_number,
        t.name as trade_name,
        t.code as trade_code
      FROM global_student_sheets gs
      LEFT JOIN trade_classes tc ON gs.class_name = tc.name
      LEFT JOIN trades t ON gs.trade_code = t.code
      WHERE gs.student_id IN (
        SELECT student_id FROM student_parents WHERE phone = ? OR email = ?
      )
      AND gs.status = 'active'
    `, [parentPhone, req.user.email]);
    
    const childrenData = await Promise.all(children.map(async (child) => {
      const [todayAttendance] = await pool.execute(`
        SELECT status FROM student_attendance_records 
        WHERE student_id = ? AND attendance_date = CURDATE()
        ORDER BY marked_at DESC LIMIT 1
      `, [child.student_id]);
      
      const [thisWeekAttendance] = await pool.execute(`
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
        FROM student_attendance_records 
        WHERE student_id = ? AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      `, [child.student_id]);
      
      const [recentGrades] = await pool.execute(`
        SELECT subject_name, grade, percentage, term, academic_year, updated_at
        FROM student_subject_performance 
        WHERE student_id = ?
        ORDER BY updated_at DESC
        LIMIT 3
      `, [child.student_id]);
      
      const [upcomingAssignments] = await pool.execute(`
        SELECT a.title, a.subject, a.due_date, a.total_marks, 
          COALESCE(sub.marks_obtained, 0) as marks_obtained,
          COALESCE(sub.status, 'pending') as submission_status
        FROM assignments a
        LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
        WHERE a.status = 'active' 
          AND a.due_date >= CURDATE()
          AND (a.class_id = ? OR a.trade_code = ?)
        ORDER BY a.due_date ASC
        LIMIT 5
      `, [child.student_id, child.class_name, child.trade_code]);
      
      const [unreadMessages] = await pool.execute(`
        SELECT COUNT(*) as count FROM parent_notifications 
        WHERE student_id = ? AND is_read = false
      `, [child.student_id]);
      
      const [recentIncidents] = await pool.execute(`
        SELECT incident_type, severity, incident_date, description
        FROM student_discipline_records 
        WHERE student_id = ? AND incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY incident_date DESC
        LIMIT 3
      `, [child.student_id]);
      
      const [achievements] = await pool.execute(`
        SELECT achievement_type, title, description, date_awarded, points
        FROM student_achievements 
        WHERE student_id = ?
        ORDER BY date_awarded DESC
        LIMIT 5
      `, [child.student_id]);
      
      return {
        student: {
          id: child.student_id,
          code: child.student_code,
          name: `${child.first_name} ${child.last_name}`,
          class: child.class_name,
          trade: child.trade_name,
          level: child.level_number,
          profile_image: child.profile_image,
          status: child.status
        },
        today: {
          attendance: todayAttendance[0]?.status || 'not_marked',
          is_present: todayAttendance[0]?.status === 'present'
        },
        this_week: {
          attendance_rate: thisWeekAttendance[0].total_days > 0 
            ? ((thisWeekAttendance[0].present_days / thisWeekAttendance[0].total_days) * 100).toFixed(1)
            : 0,
          days_present: thisWeekAttendance[0].present_days,
          total_days: thisWeekAttendance[0].total_days
        },
        academic: {
          gpa: parseFloat(child.gpa || 0).toFixed(2),
          overall_grade: child.overall_grade,
          recent_grades: recentGrades,
          total_subjects: child.total_subjects || 0
        },
        assignments: {
          upcoming: upcomingAssignments,
          pending_count: upcomingAssignments.filter(a => a.submission_status === 'pending').length
        },
        discipline: {
          conduct_score: child.conduct_score || 100,
          conduct_grade: child.conduct_grade || 'A',
          recent_incidents: recentIncidents,
          total_incidents: child.total_incidents || 0
        },
        finance: {
          total_fees: parseFloat(child.total_fees || 0),
          paid_amount: parseFloat(child.paid_amount || 0),
          balance: parseFloat(child.balance || 0),
          payment_status: child.payment_status,
          last_payment_date: child.last_payment_date
        },
        notifications: {
          unread_count: unreadMessages[0].count
        },
        achievements: achievements
      };
    }));
    
    res.json({ success: true, children: childrenData, total_children: childrenData.length });
  } catch (error) {
    console.error('Parent Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT ACADEMIC PERFORMANCE
// ============================================
router.get('/students/:studentId/academics', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academic_year, term } = req.query;
    
    const [access] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND (phone = ? OR email = ?)
    `, [studentId, req.user.phone || req.user.username, req.user.email]);
    
    if (!access[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    let query = 'SELECT * FROM student_subject_performance WHERE student_id = ?';
    const params = [studentId];
    
    if (academic_year) { query += ' AND academic_year = ?'; params.push(academic_year); }
    if (term) { query += ' AND term = ?'; params.push(term); }
    
    query += ' ORDER BY term DESC, subject_name';
    
    const [subjects] = await pool.execute(query, params);
    
    const performance = {
      by_term: {},
      overall: {
        total_subjects: subjects.length,
        average_percentage: 0,
        average_gpa: 0,
        subjects_passed: 0,
        subjects_failed: 0
      }
    };
    
    subjects.forEach(subject => {
      if (!performance.by_term[subject.term]) {
        performance.by_term[subject.term] = {
          subjects: [],
          term_gpa: 0,
          term_average: 0
        };
      }
      performance.by_term[subject.term].subjects.push(subject);
    });
    
    Object.keys(performance.by_term).forEach(term => {
      const termSubjects = performance.by_term[term].subjects;
      performance.by_term[term].term_gpa = (termSubjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / termSubjects.length).toFixed(2);
      performance.by_term[term].term_average = (termSubjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / termSubjects.length).toFixed(2);
    });
    
    if (subjects.length > 0) {
      performance.overall.average_percentage = (subjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / subjects.length).toFixed(2);
      performance.overall.average_gpa = (subjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / subjects.length).toFixed(2);
      performance.overall.subjects_passed = subjects.filter(s => parseFloat(s.percentage) >= 60).length;
      performance.overall.subjects_failed = subjects.filter(s => parseFloat(s.percentage) < 60).length;
    }
    
    const [trends] = await pool.execute(`
      SELECT term, AVG(percentage) as avg_percentage, AVG(grade_points) as avg_gpa
      FROM student_subject_performance 
      WHERE student_id = ?
      GROUP BY term
      ORDER BY term
    `, [studentId]);
    
    res.json({ success: true, performance, trends, subjects });
  } catch (error) {
    console.error('Academic Performance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT ATTENDANCE TRACKING
// ============================================
router.get('/students/:studentId/attendance', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;
    
    const [access] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND (phone = ? OR email = ?)
    `, [studentId, req.user.phone || req.user.username, req.user.email]);
    
    if (!access[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    let query = 'SELECT * FROM student_attendance_records WHERE student_id = ?';
    const params = [studentId];
    
    if (month && year) {
      query += ' AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?';
      params.push(month, year);
    } else {
      query += ' AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }
    
    query += ' ORDER BY attendance_date DESC, period';
    
    const [records] = await pool.execute(query, params);
    
    const summary = {
      total_days: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
      sick: records.filter(r => r.status === 'sick').length,
      attendance_rate: 0
    };
    
    if (summary.total_days > 0) {
      summary.attendance_rate = ((summary.present / summary.total_days) * 100).toFixed(2);
    }
    
    const [monthlySummary] = await pool.execute(`
      SELECT month, year, total_days, present_days, absent_days, late_days, attendance_rate
      FROM student_attendance_summary 
      WHERE student_id = ?
      ORDER BY year DESC, month DESC
      LIMIT 12
    `, [studentId]);
    
    const [alerts] = await pool.execute(`
      SELECT attendance_date, status, remarks
      FROM student_attendance_records 
      WHERE student_id = ? AND status IN ('absent', 'late')
        AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY attendance_date DESC
    `, [studentId]);
    
    res.json({ success: true, summary, records, monthly_summary: monthlySummary, recent_alerts: alerts });
  } catch (error) {
    console.error('Attendance Tracking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FINANCIAL MANAGEMENT
// ============================================
router.get('/students/:studentId/finances', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND (phone = ? OR email = ?)
    `, [studentId, req.user.phone || req.user.username, req.user.email]);
    
    if (!access[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    const [student] = await pool.execute(`
      SELECT student_id, first_name, last_name, total_fees, paid_amount, balance, payment_status, last_payment_date
      FROM global_student_sheets 
      WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [payments] = await pool.execute(`
      SELECT * FROM student_payment_records 
      WHERE student_id = ?
      ORDER BY payment_date DESC
    `, [studentId]);
    
    const [feeStructure] = await pool.execute(`
      SELECT * FROM fee_items 
      WHERE student_id = ? OR student_id IS NULL
      ORDER BY category, item_name
    `, [studentId]);
    
    const summary = {
      total_fees: parseFloat(student[0].total_fees || 0),
      paid_amount: parseFloat(student[0].paid_amount || 0),
      balance: parseFloat(student[0].balance || 0),
      payment_status: student[0].payment_status,
      last_payment_date: student[0].last_payment_date,
      payment_percentage: 0,
      total_payments: payments.length
    };
    
    if (summary.total_fees > 0) {
      summary.payment_percentage = ((summary.paid_amount / summary.total_fees) * 100).toFixed(2);
    }
    
    const paymentHistory = payments.map(payment => ({
      id: payment.id,
      date: payment.payment_date,
      amount: parseFloat(payment.amount),
      type: payment.payment_type,
      method: payment.payment_method,
      receipt_number: payment.receipt_number,
      reference_number: payment.reference_number,
      term: payment.term,
      academic_year: payment.academic_year,
      status: payment.status,
      notes: payment.notes
    }));
    
    res.json({ 
      success: true, 
      student: student[0], 
      summary, 
      payment_history: paymentHistory,
      fee_structure: feeStructure 
    });
  } catch (error) {
    console.error('Financial Management Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/students/:studentId/submit-payment-proof', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { amount, payment_method, reference_number, payment_date, notes, proof_image } = req.body;
    
    const [access] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND (phone = ? OR email = ?)
    `, [studentId, req.user.phone || req.user.username, req.user.email]);
    
    if (!access[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO payment_proofs 
      (student_id, parent_id, parent_name, amount, payment_method, reference_number, payment_date, notes, proof_image, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [studentId, req.user.userId, req.user.name, amount, payment_method, reference_number, payment_date, notes, proof_image]);
    
    await pool.execute(`
      INSERT INTO parent_notifications 
      (parent_id, student_id, title, message, type, priority)
      VALUES (?, ?, 'Payment Proof Submitted', 'Your payment proof has been submitted and is pending verification.', 'payment', 'normal')
    `, [req.user.userId, studentId]);
    
    res.json({ 
      success: true, 
      message: 'Payment proof submitted successfully. It will be verified by the accountant.',
      proof_id: result.insertId 
    });
  } catch (error) {
    console.error('Payment Proof Submission Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DISCIPLINE & CONDUCT MONITORING
// ============================================
router.get('/students/:studentId/discipline', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND (phone = ? OR email = ?)
    `, [studentId, req.user.phone || req.user.username, req.user.email]);
    
    if (!access[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    const [student] = await pool.execute(`
      SELECT conduct_score, conduct_grade, total_incidents, critical_incidents, high_incidents, medium_incidents, low_incidents
      FROM global_student_sheets 
      WHERE student_id = ?
    `, [studentId]);
    
    const [incidents] = await pool.execute(`
      SELECT * FROM student_discipline_records 
      WHERE student_id = ?
      ORDER BY incident_date DESC
    `, [studentId]);
    
    const [conduct] = await pool.execute(`
      SELECT * FROM student_conduct_tracking 
      WHERE student_id = ?
    `, [studentId]);
    
    const summary = {
      conduct_score: student[0]?.conduct_score || 100,
      conduct_grade: student[0]?.conduct_grade || 'A',
      total_incidents: student[0]?.total_incidents || 0,
      by_severity: {
        critical: student[0]?.critical_incidents || 0,
        high: student[0]?.high_incidents || 0,
        medium: student[0]?.medium_incidents || 0,
        low: student[0]?.low_incidents || 0
      }
    };
    
    res.json({ success: true, summary, incidents, conduct_tracking: conduct[0] });
  } catch (error) {
    console.error('Discipline Monitoring Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ASSIGNMENTS & HOMEWORK
// ============================================
router.get('/students/:studentId/assignments', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;
    
    const [access] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND (phone = ? OR email = ?)
    `, [studentId, req.user.phone || req.user.username, req.user.email]);
    
    if (!access[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    const [student] = await pool.execute(`
      SELECT trade_code, class_name, level_number FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [assignments] = await pool.execute(`
      SELECT a.*, 
        COALESCE(sub.marks_obtained, 0) as marks_obtained,
        COALESCE(sub.status, 'pending') as submission_status,
        sub.submitted_at,
        sub.feedback
      FROM assignments a
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
      WHERE a.status = 'active'
        AND (a.class_id = ? OR a.trade_code = ?)
      ORDER BY a.due_date DESC
    `, [studentId, student[0].class_name, student[0].trade_code]);
    
    const categorized = {
      pending: assignments.filter(a => a.submission_status === 'pending' && new Date(a.due_date) >= new Date()),
      submitted: assignments.filter(a => a.submission_status === 'submitted'),
      graded: assignments.filter(a => a.submission_status === 'graded'),
      overdue: assignments.filter(a => a.submission_status === 'pending' && new Date(a.due_date) < new Date()),
      all: assignments
    };
    
    res.json({ success: true, assignments: status ? categorized[status] : categorized.all, categorized_counts: {
      pending: categorized.pending.length,
      submitted: categorized.submitted.length,
      graded: categorized.graded.length,
      overdue: categorized.overdue.length
    }});
  } catch (error) {
    console.error('Assignments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// COMMUNICATION - Messages & Notifications
// ============================================
router.get('/notifications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT * FROM parent_notifications 
      WHERE parent_id = ? OR parent_phone = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.userId, req.user.phone || req.user.username]);
    
    const [unreadCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM parent_notifications 
      WHERE (parent_id = ? OR parent_phone = ?) AND is_read = false
    `, [req.user.userId, req.user.phone || req.user.username]);
    
    res.json({ success: true, notifications, unread_count: unreadCount[0].count });
  } catch (error) {
    console.error('Notifications Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/notifications/:notificationId/read', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    await pool.execute(`
      UPDATE parent_notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = ? AND (parent_id = ? OR parent_phone = ?)
    `, [req.params.notificationId, req.user.userId, req.user.phone || req.user.username]);
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/messages/send', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { student_id, recipient_role, recipient_id, subject, message, priority } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO parent_messages 
      (parent_id, student_id, recipient_role, recipient_id, subject, message, priority, status, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', NOW())
    `, [req.user.userId, student_id, recipient_role, recipient_id, subject, message, priority || 'normal']);
    
    await pool.execute(`
      INSERT INTO notifications 
      (user_id, title, message, type, priority, related_id, related_type)
      VALUES (?, ?, ?, 'message', ?, ?, 'parent_message')
    `, [recipient_id, subject, `New message from parent: ${message.substring(0, 100)}...`, priority || 'normal', result.insertId]);
    
    res.json({ success: true, message: 'Message sent successfully', message_id: result.insertId });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/messages', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT pm.*, 
        u.first_name as recipient_first_name, 
        u.last_name as recipient_last_name,
        gs.first_name as student_first_name,
        gs.last_name as student_last_name
      FROM parent_messages pm
      LEFT JOIN users u ON pm.recipient_id = u.id
      LEFT JOIN global_student_sheets gs ON pm.student_id = gs.student_id
      WHERE pm.parent_id = ?
      ORDER BY pm.sent_at DESC
    `, [req.user.userId]);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Messages Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ACHIEVEMENTS & PROGRESS
// ============================================
router.get('/students/:studentId/achievements', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND (phone = ? OR email = ?)
    `, [studentId, req.user.phone || req.user.username, req.user.email]);
    
    if (!access[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    const [achievements] = await pool.execute(`
      SELECT * FROM student_achievements 
      WHERE student_id = ?
      ORDER BY date_awarded DESC
    `, [studentId]);
    
    const [badges] = await pool.execute(`
      SELECT * FROM student_badges 
      WHERE student_id = ?
      ORDER BY earned_date DESC
    `, [studentId]);
    
    const [competitions] = await pool.execute(`
      SELECT sc.*, c.name as competition_name, c.category, c.level
      FROM student_competitions sc
      JOIN competitions c ON sc.competition_id = c.id
      WHERE sc.student_id = ?
      ORDER BY sc.participation_date DESC
    `, [studentId]);
    
    const summary = {
      total_achievements: achievements.length,
      total_badges: badges.length,
      total_competitions: competitions.length,
      total_points: achievements.reduce((sum, a) => sum + (a.points || 0), 0)
    };
    
    res.json({ success: true, summary, achievements, badges, competitions });
  } catch (error) {
    console.error('Achievements Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TIMETABLE & SCHEDULE
// ============================================
router.get('/students/:studentId/timetable', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [access] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND (phone = ? OR email = ?)
    `, [studentId, req.user.phone || req.user.username, req.user.email]);
    
    if (!access[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this student' });
    }
    
    const [student] = await pool.execute(`
      SELECT trade_code, class_name, level_number FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [timetable] = await pool.execute(`
      SELECT * FROM timetable_entries 
      WHERE class_id = ? OR trade_code = ?
      ORDER BY day_of_week, start_time
    `, [student[0].class_name, student[0].trade_code]);
    
    const organized = {
      monday: timetable.filter(t => t.day_of_week === 'monday'),
      tuesday: timetable.filter(t => t.day_of_week === 'tuesday'),
      wednesday: timetable.filter(t => t.day_of_week === 'wednesday'),
      thursday: timetable.filter(t => t.day_of_week === 'thursday'),
      friday: timetable.filter(t => t.day_of_week === 'friday'),
      saturday: timetable.filter(t => t.day_of_week === 'saturday')
    };
    
    res.json({ success: true, timetable: organized, all_entries: timetable });
  } catch (error) {
    console.error('Timetable Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

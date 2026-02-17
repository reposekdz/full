const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ====================================
 * ULTRA-ADVANCED STUDENT PORTAL
 * ====================================
 * Powerful student features
 * - Self-enrollment system
 * - Performance checking (grades, marks, GPA)
 * - Attendance tracking
 * - Class ranking viewing
 * - Assignment submission
 * - Timetable access
 * - Payment status checking
 */

// =====================================
// STUDENT ENROLLMENT
// =====================================

// Get available trades and levels for enrollment
router.get('/enrollment/available-trades', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT 
        tl.*,
        c.name as course_name,
        c.fee_amount,
        c.duration_months,
        COUNT(DISTINCT gss.id) as current_enrollment,
        tl.capacity,
        (tl.capacity - COUNT(DISTINCT gss.id)) as available_slots
      FROM trades_levels tl
      LEFT JOIN courses c ON c.code = tl.trade_code
      LEFT JOIN global_student_sheets gss ON 
        tl.trade_code = gss.trade_code AND 
        tl.level_number = gss.level_number AND 
        tl.level_suffix = gss.level_suffix AND
        gss.status = 'active'
      WHERE tl.is_active = 1
      GROUP BY tl.id, c.name, c.fee_amount, c.duration_months
      HAVING available_slots > 0
      ORDER BY tl.trade_code, tl.level_number, tl.level_suffix
    `);
    
    res.json({
      success: true,
      trades: trades
    });
  } catch (error) {
    console.error('Get available trades error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit enrollment application
router.post('/enrollment/apply', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      trade_code,
      level_number,
      level_suffix,
      guardian_name,
      guardian_phone,
      guardian_email,
      previous_school,
      academic_year
    } = req.body;
    
    if (!trade_code || !level_number || !guardian_name || !guardian_phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const [existing] = await pool.execute(
      'SELECT id FROM global_student_sheets WHERE student_id = ? AND status IN ("active", "pending")',
      [studentId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active or pending enrollment' 
      });
    }
    
    const [user] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [studentId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const [tradeLevel] = await pool.execute(
      'SELECT * FROM trades_levels WHERE trade_code = ? AND level_number = ? AND level_suffix = ?',
      [trade_code, level_number, level_suffix || '']
    );
    
    if (tradeLevel.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade level not found' });
    }
    
    const studentCode = `${trade_code}${level_number}${level_suffix || ''}${Date.now().toString().slice(-6)}`;
    
    const [result] = await pool.execute(
      `INSERT INTO global_student_sheets (
        student_id, student_code, first_name, last_name, email, phone,
        gender, date_of_birth, trade_code, trade_name, level_number, level_suffix,
        guardian_name, guardian_phone, guardian_email, previous_school,
        academic_year, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        studentId, studentCode, user[0].first_name, user[0].last_name,
        user[0].email, user[0].phone, user[0].gender, user[0].date_of_birth,
        trade_code, tradeLevel[0].trade_name, level_number, level_suffix || '',
        guardian_name, guardian_phone, guardian_email, previous_school,
        academic_year || new Date().getFullYear()
      ]
    );
    
    await pool.execute(
      `INSERT INTO enrollment_applications (
        student_id, student_code, trade_code, level_number, level_suffix,
        application_status, application_date, guardian_name, guardian_phone
      ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), ?, ?)`,
      [studentId, studentCode, trade_code, level_number, level_suffix || '', guardian_name, guardian_phone]
    );
    
    res.json({
      success: true,
      message: 'Enrollment application submitted successfully',
      student_code: studentCode,
      sheet_id: result.insertId
    });
  } catch (error) {
    console.error('Enrollment application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check enrollment status
router.get('/enrollment/status', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const [enrollment] = await pool.execute(
      `SELECT 
        gss.*,
        ea.application_status,
        ea.application_date,
        ea.approved_at,
        ea.approved_by,
        ea.rejection_reason
      FROM global_student_sheets gss
      LEFT JOIN enrollment_applications ea ON gss.student_code = ea.student_code
      WHERE gss.student_id = ?
      ORDER BY gss.created_at DESC
      LIMIT 1`,
      [studentId]
    );
    
    if (enrollment.length === 0) {
      return res.json({
        success: true,
        enrolled: false,
        message: 'No enrollment found'
      });
    }
    
    res.json({
      success: true,
      enrolled: true,
      enrollment: enrollment[0]
    });
  } catch (error) {
    console.error('Check enrollment status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// PERFORMANCE CHECKING
// =====================================

// Get student performance overview
router.get('/performance/overview', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academic_year } = req.query;
    const year = academic_year || new Date().getFullYear();
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [studentId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active enrollment not found' });
    }
    
    const [marks] = await pool.execute(
      `SELECT 
        subject_name,
        SUM(marks) as total_marks,
        SUM(max_marks) as total_max_marks,
        AVG((marks / max_marks) * 100) as average_percentage,
        COUNT(*) as assessment_count
      FROM student_marks
      WHERE student_id = ? AND academic_year = ?
      GROUP BY subject_name
      ORDER BY subject_name`,
      [studentId, year]
    );
    
    const [attendance] = await pool.execute(
      `SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as attendance_percentage
      FROM student_attendance_records
      WHERE student_id = ? AND YEAR(attendance_date) = ?`,
      [studentId, year]
    );
    
    const [assignments] = await pool.execute(
      `SELECT 
        COUNT(*) as total_assignments,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_assignments,
        SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded_assignments,
        AVG(marks_obtained) as avg_marks
      FROM assignment_submissions
      WHERE student_id = ?`,
      [studentId]
    );
    
    const [ranking] = await pool.execute(
      `SELECT 
        (SELECT COUNT(*) + 1 
         FROM global_student_sheets gss2 
         WHERE gss2.trade_code = gss.trade_code 
         AND gss2.level_number = gss.level_number 
         AND gss2.level_suffix = gss.level_suffix 
         AND gss2.gpa > gss.gpa
         AND gss2.status = 'active') as class_rank,
        (SELECT COUNT(*) 
         FROM global_student_sheets gss3 
         WHERE gss3.trade_code = gss.trade_code 
         AND gss3.level_number = gss.level_number 
         AND gss3.level_suffix = gss.level_suffix
         AND gss3.status = 'active') as total_students_in_class
      FROM global_student_sheets gss
      WHERE gss.student_id = ?`,
      [studentId]
    );
    
    res.json({
      success: true,
      performance: {
        student_info: student[0],
        academic_performance: marks,
        attendance: attendance[0] || {},
        assignments: assignments[0] || {},
        ranking: ranking[0] || {}
      }
    });
  } catch (error) {
    console.error('Get performance overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get detailed grades and marks
router.get('/performance/grades', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { term, academic_year } = req.query;
    
    let query = `
      SELECT 
        sm.*,
        s.name as subject_full_name,
        (sm.marks / sm.max_marks) * 100 as percentage,
        CASE 
          WHEN (sm.marks / sm.max_marks) * 100 >= 90 THEN 'A+'
          WHEN (sm.marks / sm.max_marks) * 100 >= 85 THEN 'A'
          WHEN (sm.marks / sm.max_marks) * 100 >= 80 THEN 'A-'
          WHEN (sm.marks / sm.max_marks) * 100 >= 75 THEN 'B+'
          WHEN (sm.marks / sm.max_marks) * 100 >= 70 THEN 'B'
          WHEN (sm.marks / sm.max_marks) * 100 >= 65 THEN 'B-'
          WHEN (sm.marks / sm.max_marks) * 100 >= 60 THEN 'C+'
          WHEN (sm.marks / sm.max_marks) * 100 >= 55 THEN 'C'
          WHEN (sm.marks / sm.max_marks) * 100 >= 50 THEN 'C-'
          WHEN (sm.marks / sm.max_marks) * 100 >= 45 THEN 'D+'
          WHEN (sm.marks / sm.max_marks) * 100 >= 40 THEN 'D'
          ELSE 'F'
        END as grade
      FROM student_marks sm
      LEFT JOIN subjects s ON sm.subject_id = s.id
      WHERE sm.student_id = ?
    `;
    const params = [studentId];
    
    if (term) {
      query += ` AND sm.term = ?`;
      params.push(term);
    }
    
    if (academic_year) {
      query += ` AND sm.academic_year = ?`;
      params.push(academic_year);
    }
    
    query += ` ORDER BY sm.recorded_at DESC`;
    
    const [grades] = await pool.execute(query, params);
    
    let totalMarks = 0;
    let totalMaxMarks = 0;
    for (const grade of grades) {
      totalMarks += grade.marks || 0;
      totalMaxMarks += grade.max_marks || 100;
    }
    
    const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
    const gpa = calculateGPA(overallPercentage);
    
    res.json({
      success: true,
      grades: grades,
      summary: {
        total_marks: totalMarks,
        total_max_marks: totalMaxMarks,
        overall_percentage: overallPercentage.toFixed(2),
        gpa: gpa.toFixed(2),
        total_subjects: grades.length
      }
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get class ranking
router.get('/performance/ranking', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const [studentInfo] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [studentId]
    );
    
    if (studentInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Active enrollment not found' });
    }
    
    const student = studentInfo[0];
    
    const [rankings] = await pool.execute(
      `SELECT 
        student_code,
        CONCAT(first_name, ' ', last_name) as student_name,
        gpa,
        total_marks,
        overall_grade,
        attendance_percentage
      FROM global_student_sheets
      WHERE trade_code = ? AND level_number = ? AND level_suffix = ? AND status = 'active'
      ORDER BY gpa DESC, total_marks DESC`,
      [student.code, student.level_number, student.level_suffix || '']
    );
    
    let myRank = 0;
    for (let i = 0; i < rankings.length; i++) {
      rankings[i].rank = i + 1;
      if (rankings[i].student_code === student.student_code) {
        myRank = i + 1;
      }
    }
    
    res.json({
      success: true,
      my_rank: myRank,
      total_students: rankings.length,
      rankings: rankings,
      my_performance: rankings.find(r => r.student_code === student.student_code)
    });
  } catch (error) {
    console.error('Get ranking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// ATTENDANCE TRACKING
// =====================================

// Get attendance records
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { start_date, end_date, month } = req.query;
    
    let query = `
      SELECT * FROM student_attendance_records
      WHERE student_id = ?
    `;
    const params = [studentId];
    
    if (start_date && end_date) {
      query += ` AND attendance_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    } else if (month) {
      query += ` AND DATE_FORMAT(attendance_date, '%Y-%m') = ?`;
      params.push(month);
    }
    
    query += ` ORDER BY attendance_date DESC`;
    
    const [records] = await pool.execute(query, params);
    
    const summary = {
      total_days: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length
    };
    
    summary.attendance_rate = summary.total_days > 0 
      ? ((summary.present / summary.total_days) * 100).toFixed(2)
      : 0;
    
    res.json({
      success: true,
      attendance: records,
      summary: summary
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// TIMETABLE ACCESS
// =====================================

// Get student timetable
router.get('/timetable', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academic_year } = req.query;
    const year = academic_year || new Date().getFullYear();
    
    const [student] = await pool.execute(
      'SELECT trade_code, level_number, level_suffix FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [studentId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active enrollment not found' });
    }
    
    const [timetable] = await pool.execute(
      `SELECT * FROM timetables 
       WHERE trade_code = ? AND level_number = ? AND level_suffix = ? 
       AND academic_year = ? AND is_active = 1
       ORDER BY generated_at DESC
       LIMIT 1`,
      [student[0].trade_code, student[0].level_number, student[0].level_suffix || '', year]
    );
    
    if (timetable.length === 0) {
      return res.json({
        success: true,
        timetable: null,
        message: 'No timetable available yet'
      });
    }
    
    const [entries] = await pool.execute(
      `SELECT 
        te.*,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM timetable_entries te
      LEFT JOIN users u ON te.teacher_id = u.id
      WHERE te.timetable_id = ?
      ORDER BY 
        FIELD(te.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        te.period_number`,
      [timetable[0].id]
    );
    
    const scheduleByDay = {};
    for (const entry of entries) {
      if (!scheduleByDay[entry.day_of_week]) {
        scheduleByDay[entry.day_of_week] = [];
      }
      scheduleByDay[entry.day_of_week].push(entry);
    }
    
    res.json({
      success: true,
      timetable: timetable[0],
      schedule: scheduleByDay
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// PAYMENT STATUS
// =====================================

// Get payment status and history
router.get('/payments/status', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const [student] = await pool.execute(
      `SELECT 
        total_fees,
        paid_amount,
        balance,
        payment_status,
        last_payment_date,
        payment_deadline
      FROM global_student_sheets 
      WHERE student_id = ? AND status = 'active'`,
      [studentId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active enrollment not found' });
    }
    
    const [paymentHistory] = await pool.execute(
      `SELECT * FROM student_payment_records
       WHERE student_id = ?
       ORDER BY payment_date DESC`,
      [studentId]
    );
    
    const paymentInfo = student[0];
    const percentagePaid = paymentInfo.total_fees > 0 
      ? ((paymentInfo.paid_amount / paymentInfo.total_fees) * 100).toFixed(2)
      : 0;
    
    res.json({
      success: true,
      payment_status: {
        ...paymentInfo,
        percentage_paid: percentagePaid,
        is_overdue: paymentInfo.payment_deadline && new Date(paymentInfo.payment_deadline) < new Date()
      },
      payment_history: paymentHistory
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// ASSIGNMENTS
// =====================================

// Get student assignments
router.get('/assignments', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, subject_id } = req.query;
    
    let query = `
      SELECT 
        a.*,
        s.name as subject_name,
        CASE 
          WHEN asub.id IS NULL THEN 'not_submitted'
          ELSE asub.status
        END as submission_status,
        asub.marks_obtained,
        asub.submitted_at,
        asub.grade_letter,
        asub.teacher_feedback
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
      WHERE a.is_published = 1
    `;
    const params = [studentId];
    
    if (status) {
      if (status === 'not_submitted') {
        query += ` AND asub.id IS NULL`;
      } else {
        query += ` AND asub.status = ?`;
        params.push(status);
      }
    }
    
    if (subject_id) {
      query += ` AND a.subject_id = ?`;
      params.push(subject_id);
    }
    
    query += ` ORDER BY a.due_date ASC`;
    
    const [assignments] = await pool.execute(query, params);
    
    res.json({
      success: true,
      assignments: assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// HELPER FUNCTIONS
// =====================================

function calculateGPA(percentage) {
  if (percentage >= 90) return 4.0;
  if (percentage >= 85) return 3.85;
  if (percentage >= 80) return 3.7;
  if (percentage >= 75) return 3.5;
  if (percentage >= 70) return 3.3;
  if (percentage >= 65) return 3.0;
  if (percentage >= 60) return 2.7;
  if (percentage >= 55) return 2.3;
  if (percentage >= 50) return 2.0;
  if (percentage >= 45) return 1.7;
  if (percentage >= 40) return 1.3;
  return 0.0;
}

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ULTRA-COMPREHENSIVE STUDENT PORTAL
 * Complete learning management, assignments, grades, achievements
 * Real-time progress tracking, gamification, social learning features
 */

// ============================================
// STUDENT DASHBOARD - Personalized Overview
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    
    const [todaySchedule] = await pool.execute(`
      SELECT * FROM timetable_entries 
      WHERE (class_id = ? OR trade_code = ?) 
        AND day_of_week = LOWER(DAYNAME(CURDATE()))
      ORDER BY start_time
    `, [student[0].class_name, student[0].trade_code]);
    
    const [upcomingAssignments] = await pool.execute(`
      SELECT a.*, 
        COALESCE(sub.status, 'pending') as submission_status,
        sub.marks_obtained
      FROM assignments a
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
      WHERE a.status = 'active' 
        AND a.due_date >= CURDATE()
        AND (a.class_id = ? OR a.trade_code = ?)
      ORDER BY a.due_date ASC
      LIMIT 5
    `, [studentId, student[0].class_name, student[0].trade_code]);
    
    const [recentGrades] = await pool.execute(`
      SELECT subject_name, grade, percentage, term, academic_year, updated_at, teacher_name
      FROM student_subject_performance 
      WHERE student_id = ?
      ORDER BY updated_at DESC
      LIMIT 5
    `, [studentId]);
    
    const [thisWeekAttendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
      FROM student_attendance_records 
      WHERE student_id = ? AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `, [studentId]);
    
    const [unreadNotifications] = await pool.execute(`
      SELECT COUNT(*) as count FROM student_notifications 
      WHERE student_id = ? AND is_read = false
    `, [studentId]);
    
    const [achievements] = await pool.execute(`
      SELECT * FROM student_achievements 
      WHERE student_id = ?
      ORDER BY date_awarded DESC
      LIMIT 3
    `, [studentId]);
    
    const [leaderboardPosition] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) + 1 FROM global_student_sheets 
         WHERE trade_code = ? AND level_number = ? AND gpa > ?) as position,
        (SELECT COUNT(*) FROM global_student_sheets 
         WHERE trade_code = ? AND level_number = ? AND status = 'active') as total_students
    `, [student[0].trade_code, student[0].level_number, student[0].gpa, 
        student[0].trade_code, student[0].level_number]);
    
    res.json({
      success: true,
      student: {
        id: student[0].student_id,
        code: student[0].student_code,
        name: `${student[0].first_name} ${student[0].last_name}`,
        trade: student[0].trade_name,
        class: student[0].class_name,
        level: student[0].level_number,
        profile_image: student[0].profile_image
      },
      academic: {
        gpa: parseFloat(student[0].gpa || 0).toFixed(2),
        overall_grade: student[0].overall_grade,
        total_subjects: student[0].total_subjects || 0,
        recent_grades: recentGrades,
        class_rank: leaderboardPosition[0]?.position || 'N/A',
        total_classmates: leaderboardPosition[0]?.total_students || 0
      },
      attendance: {
        this_week: {
          total_days: thisWeekAttendance[0].total_days,
          present: thisWeekAttendance[0].present_days,
          absent: thisWeekAttendance[0].absent_days,
          rate: thisWeekAttendance[0].total_days > 0 
            ? ((thisWeekAttendance[0].present_days / thisWeekAttendance[0].total_days) * 100).toFixed(1)
            : 0
        },
        overall_rate: parseFloat(student[0].attendance_percentage || 0).toFixed(1)
      },
      assignments: {
        upcoming: upcomingAssignments,
        pending_count: upcomingAssignments.filter(a => a.submission_status === 'pending').length,
        overdue_count: 0
      },
      conduct: {
        score: student[0].conduct_score || 100,
        grade: student[0].conduct_grade || 'A',
        total_incidents: student[0].total_incidents || 0
      },
      today_schedule: todaySchedule,
      unread_notifications: unreadNotifications[0].count,
      recent_achievements: achievements
    });
  } catch (error) {
    console.error('Student Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ACADEMIC PERFORMANCE & GRADES
// ============================================
router.get('/grades', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { academic_year, term } = req.query;
    
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
        highest_grade: null,
        lowest_grade: null
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
      
      const sortedByPercentage = [...subjects].sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
      performance.overall.highest_grade = sortedByPercentage[0];
      performance.overall.lowest_grade = sortedByPercentage[sortedByPercentage.length - 1];
    }
    
    const [progressTrend] = await pool.execute(`
      SELECT term, academic_year, AVG(percentage) as avg_percentage, AVG(grade_points) as avg_gpa
      FROM student_subject_performance 
      WHERE student_id = ?
      GROUP BY term, academic_year
      ORDER BY academic_year, term
    `, [studentId]);
    
    res.json({ success: true, performance, subjects, progress_trend: progressTrend });
  } catch (error) {
    console.error('Grades Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ASSIGNMENTS & HOMEWORK
// ============================================
router.get('/assignments', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { status, subject } = req.query;
    
    const [student] = await pool.execute(`
      SELECT trade_code, class_name FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    let query = `
      SELECT a.*, 
        COALESCE(sub.marks_obtained, 0) as marks_obtained,
        COALESCE(sub.status, 'pending') as submission_status,
        sub.submitted_at,
        sub.feedback,
        sub.graded_at,
        sub.file_url
      FROM assignments a
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
      WHERE a.status = 'active'
        AND (a.class_id = ? OR a.trade_code = ?)
    `;
    const params = [studentId, student[0].class_name, student[0].trade_code];
    
    if (subject) { query += ' AND a.subject = ?'; params.push(subject); }
    
    query += ' ORDER BY a.due_date DESC';
    
    const [assignments] = await pool.execute(query, params);
    
    const categorized = {
      pending: assignments.filter(a => a.submission_status === 'pending' && new Date(a.due_date) >= new Date()),
      submitted: assignments.filter(a => a.submission_status === 'submitted'),
      graded: assignments.filter(a => a.submission_status === 'graded'),
      overdue: assignments.filter(a => a.submission_status === 'pending' && new Date(a.due_date) < new Date()),
      all: assignments
    };
    
    const summary = {
      total: assignments.length,
      pending: categorized.pending.length,
      submitted: categorized.submitted.length,
      graded: categorized.graded.length,
      overdue: categorized.overdue.length,
      average_score: 0
    };
    
    const gradedAssignments = categorized.graded.filter(a => a.marks_obtained > 0);
    if (gradedAssignments.length > 0) {
      const totalScore = gradedAssignments.reduce((sum, a) => sum + ((a.marks_obtained / a.total_marks) * 100), 0);
      summary.average_score = (totalScore / gradedAssignments.length).toFixed(2);
    }
    
    res.json({ 
      success: true, 
      summary,
      assignments: status && categorized[status] ? categorized[status] : assignments,
      categorized
    });
  } catch (error) {
    console.error('Assignments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/assignments/:assignmentId/submit', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { assignmentId } = req.params;
    const { file_url, content, notes } = req.body;
    
    const [assignment] = await pool.execute('SELECT * FROM assignments WHERE id = ?', [assignmentId]);
    if (!assignment[0]) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    if (new Date() > new Date(assignment[0].due_date)) {
      return res.status(400).json({ success: false, message: 'Assignment submission deadline has passed' });
    }
    
    const [existing] = await pool.execute(`
      SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?
    `, [assignmentId, studentId]);
    
    if (existing[0]) {
      await pool.execute(`
        UPDATE assignment_submissions 
        SET file_url = ?, content = ?, notes = ?, submitted_at = NOW(), status = 'submitted'
        WHERE id = ?
      `, [file_url, content, notes, existing[0].id]);
      
      res.json({ success: true, message: 'Assignment re-submitted successfully', submission_id: existing[0].id });
    } else {
      const [result] = await pool.execute(`
        INSERT INTO assignment_submissions 
        (assignment_id, student_id, file_url, content, notes, submitted_at, status)
        VALUES (?, ?, ?, ?, ?, NOW(), 'submitted')
      `, [assignmentId, studentId, file_url, content, notes]);
      
      res.json({ success: true, message: 'Assignment submitted successfully', submission_id: result.insertId });
    }
    
    await pool.execute(`
      INSERT INTO student_notifications 
      (student_id, title, message, type, priority)
      VALUES (?, 'Assignment Submitted', ?, 'assignment', 'normal')
    `, [studentId, `Your submission for "${assignment[0].title}" has been received.`]);
    
  } catch (error) {
    console.error('Assignment Submission Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ATTENDANCE TRACKING
// ============================================
router.get('/attendance', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { month, year } = req.query;
    
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
    
    res.json({ success: true, summary, records, monthly_summary: monthlySummary });
  } catch (error) {
    console.error('Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TIMETABLE & SCHEDULE
// ============================================
router.get('/timetable', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    const [student] = await pool.execute(`
      SELECT trade_code, class_name FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [timetable] = await pool.execute(`
      SELECT * FROM timetable_entries 
      WHERE class_id = ? OR trade_code = ?
      ORDER BY 
        FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'), 
        start_time
    `, [student[0].class_name, student[0].trade_code]);
    
    const organized = {
      monday: timetable.filter(t => t.day_of_week === 'monday'),
      tuesday: timetable.filter(t => t.day_of_week === 'tuesday'),
      wednesday: timetable.filter(t => t.day_of_week === 'wednesday'),
      thursday: timetable.filter(t => t.day_of_week === 'thursday'),
      friday: timetable.filter(t => t.day_of_week === 'friday'),
      saturday: timetable.filter(t => t.day_of_week === 'saturday')
    };
    
    const today = Object.keys(organized).find(day => 
      day === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    );
    
    res.json({ success: true, timetable: organized, today_schedule: organized[today] || [] });
  } catch (error) {
    console.error('Timetable Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ACHIEVEMENTS & GAMIFICATION
// ============================================
router.get('/achievements', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
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
    
    const [points] = await pool.execute(`
      SELECT 
        SUM(points) as total_points,
        COUNT(*) as total_achievements
      FROM student_achievements 
      WHERE student_id = ?
    `, [studentId]);
    
    const [ranking] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) + 1 
         FROM student_achievements sa2 
         JOIN global_student_sheets gs2 ON sa2.student_id = gs2.student_id
         WHERE gs2.trade_code = (SELECT trade_code FROM global_student_sheets WHERE student_id = ?)
         GROUP BY sa2.student_id
         HAVING SUM(sa2.points) > ?) as rank
    `, [studentId, points[0].total_points || 0]);
    
    const summary = {
      total_achievements: achievements.length,
      total_badges: badges.length,
      total_points: points[0].total_points || 0,
      class_rank: ranking[0]?.rank || 'N/A'
    };
    
    res.json({ success: true, summary, achievements, badges });
  } catch (error) {
    console.error('Achievements Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FINANCE - Fee Status
// ============================================
router.get('/fees', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    const [student] = await pool.execute(`
      SELECT total_fees, paid_amount, balance, payment_status, last_payment_date
      FROM global_student_sheets 
      WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [payments] = await pool.execute(`
      SELECT payment_date, amount, payment_type, payment_method, receipt_number, status
      FROM student_payment_records 
      WHERE student_id = ?
      ORDER BY payment_date DESC
    `, [studentId]);
    
    const summary = {
      total_fees: parseFloat(student[0].total_fees || 0),
      paid_amount: parseFloat(student[0].paid_amount || 0),
      balance: parseFloat(student[0].balance || 0),
      payment_status: student[0].payment_status,
      last_payment_date: student[0].last_payment_date,
      payment_percentage: 0
    };
    
    if (summary.total_fees > 0) {
      summary.payment_percentage = ((summary.paid_amount / summary.total_fees) * 100).toFixed(2);
    }
    
    res.json({ success: true, summary, payment_history: payments });
  } catch (error) {
    console.error('Fees Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// NOTIFICATIONS
// ============================================
router.get('/notifications', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    const [notifications] = await pool.execute(`
      SELECT * FROM student_notifications 
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [studentId]);
    
    const [unreadCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM student_notifications 
      WHERE student_id = ? AND is_read = false
    `, [studentId]);
    
    res.json({ success: true, notifications, unread_count: unreadCount[0].count });
  } catch (error) {
    console.error('Notifications Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/notifications/:notificationId/read', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    await pool.execute(`
      UPDATE student_notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = ? AND student_id = ?
    `, [req.params.notificationId, studentId]);
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// LEADERBOARD & RANKINGS
// ============================================
router.get('/leaderboard', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { scope } = req.query;
    
    const [student] = await pool.execute(`
      SELECT trade_code, level_number FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    let query = `
      SELECT student_id, first_name, last_name, gpa, overall_grade, trade_name, level_number
      FROM global_student_sheets 
      WHERE status = 'active'
    `;
    
    if (scope === 'class') {
      query += ' AND trade_code = ? AND level_number = ?';
      var params = [student[0].trade_code, student[0].level_number];
    } else if (scope === 'trade') {
      query += ' AND trade_code = ?';
      var params = [student[0].trade_code];
    } else {
      var params = [];
    }
    
    query += ' ORDER BY gpa DESC, overall_grade LIMIT 50';
    
    const [leaderboard] = await pool.execute(query, params);
    
    const myPosition = leaderboard.findIndex(s => s.student_id === studentId) + 1;
    
    res.json({ success: true, leaderboard, my_position: myPosition || 'N/A', total_students: leaderboard.length });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// LEARNING RESOURCES
// ============================================
router.get('/resources', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { subject, type } = req.query;
    
    const [student] = await pool.execute(`
      SELECT trade_code, class_name FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    let query = `
      SELECT * FROM learning_resources 
      WHERE (class_id = ? OR trade_code = ? OR access_level = 'public')
    `;
    const params = [student[0].class_name, student[0].trade_code];
    
    if (subject) { query += ' AND subject = ?'; params.push(subject); }
    if (type) { query += ' AND resource_type = ?'; params.push(type); }
    
    query += ' ORDER BY created_at DESC';
    
    const [resources] = await pool.execute(query, params);
    
    res.json({ success: true, resources, total: resources.length });
  } catch (error) {
    console.error('Resources Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PEER COLLABORATION
// ============================================
router.get('/study-groups', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    const [groups] = await pool.execute(`
      SELECT sg.*, sgm.role as my_role, sgm.joined_at
      FROM study_groups sg
      JOIN study_group_members sgm ON sg.id = sgm.group_id
      WHERE sgm.student_id = ? AND sg.status = 'active'
      ORDER BY sg.created_at DESC
    `, [studentId]);
    
    const [availableGroups] = await pool.execute(`
      SELECT sg.*, COUNT(sgm.id) as member_count
      FROM study_groups sg
      LEFT JOIN study_group_members sgm ON sg.id = sgm.group_id
      WHERE sg.status = 'active' AND sg.is_public = true
        AND sg.id NOT IN (SELECT group_id FROM study_group_members WHERE student_id = ?)
      GROUP BY sg.id
      ORDER BY sg.created_at DESC
      LIMIT 10
    `, [studentId]);
    
    res.json({ success: true, my_groups: groups, available_groups: availableGroups });
  } catch (error) {
    console.error('Study Groups Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADVANCED PERFORMANCE TRACKING & ANALYTICS
// ============================================
router.get('/performance/detailed-analytics', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    
    const [subjectPerformance] = await pool.execute(`
      SELECT 
        subject_name,
        subject_code,
        AVG(percentage) as avg_percentage,
        AVG(grade_points) as avg_gpa,
        COUNT(*) as assessments_taken,
        MAX(percentage) as best_score,
        MIN(percentage) as lowest_score,
        CASE 
          WHEN AVG(percentage) >= 90 THEN 'Excellent'
          WHEN AVG(percentage) >= 80 THEN 'Very Good'
          WHEN AVG(percentage) >= 70 THEN 'Good'
          WHEN AVG(percentage) >= 60 THEN 'Satisfactory'
          ELSE 'Needs Improvement'
        END as performance_level
      FROM student_subject_performance
      WHERE student_id = ?
      GROUP BY subject_name, subject_code
      ORDER BY avg_percentage DESC
    `, [studentId]);
    
    const [termProgress] = await pool.execute(`
      SELECT 
        academic_year,
        term,
        AVG(percentage) as term_avg,
        COUNT(DISTINCT subject_code) as subjects_count,
        SUM(CASE WHEN grade = 'A' THEN 1 ELSE 0 END) as a_grades,
        SUM(CASE WHEN grade = 'B' THEN 1 ELSE 0 END) as b_grades,
        SUM(CASE WHEN grade = 'C' THEN 1 ELSE 0 END) as c_grades,
        SUM(CASE WHEN grade IN ('D', 'F') THEN 1 ELSE 0 END) as failing_grades
      FROM student_subject_performance
      WHERE student_id = ?
      GROUP BY academic_year, term
      ORDER BY academic_year DESC, term DESC
    `, [studentId]);
    
    const [classRanking] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) + 1 FROM global_student_sheets 
         WHERE trade_code = ? AND level_number = ? AND gpa > ? AND status = 'active') as my_rank,
        (SELECT COUNT(*) FROM global_student_sheets 
         WHERE trade_code = ? AND level_number = ? AND status = 'active') as total_students,
        (SELECT AVG(gpa) FROM global_student_sheets 
         WHERE trade_code = ? AND level_number = ? AND status = 'active') as class_avg_gpa
    `, [student[0].trade_code, student[0].level_number, student[0].gpa,
        student[0].trade_code, student[0].level_number,
        student[0].trade_code, student[0].level_number]);
    
    const percentile = classRanking[0].total_students > 0 
      ? ((1 - (classRanking[0].my_rank - 1) / classRanking[0].total_students) * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      analytics: {
        overall: {
          gpa: parseFloat(student[0].gpa || 0).toFixed(2),
          rank: classRanking[0].my_rank,
          total_students: classRanking[0].total_students,
          percentile: percentile,
          class_average: parseFloat(classRanking[0].class_avg_gpa || 0).toFixed(2),
          performance_status: parseFloat(student[0].gpa) > parseFloat(classRanking[0].class_avg_gpa) ? 'Above Average' : 'Below Average'
        },
        subjects: subjectPerformance,
        term_progress: termProgress,
        strengths: subjectPerformance.filter(s => s.avg_percentage >= 80).map(s => s.subject_name),
        areas_for_improvement: subjectPerformance.filter(s => s.avg_percentage < 70).map(s => s.subject_name)
      }
    });
  } catch (error) {
    console.error('Performance Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/performance/progress-report', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { academic_year, term } = req.query;
    
    const [grades] = await pool.execute(`
      SELECT * FROM student_subject_performance 
      WHERE student_id = ? AND academic_year = ? AND term = ?
      ORDER BY subject_name
    `, [studentId, academic_year || new Date().getFullYear(), term || 'Term 1']);
    
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
      FROM student_attendance_records
      WHERE student_id = ? 
        AND YEAR(attendance_date) = ?
    `, [studentId, academic_year || new Date().getFullYear()]);
    
    const [conduct] = await pool.execute(`
      SELECT * FROM student_conduct_tracking 
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [studentId]);
    
    const totalMarks = grades.reduce((sum, g) => sum + parseFloat(g.total_marks || 0), 0);
    const maxMarks = grades.reduce((sum, g) => sum + (parseFloat(g.quiz_max || 20) + parseFloat(g.midterm_max || 30) + parseFloat(g.final_max || 50)), 0);
    const overallPercentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      progress_report: {
        academic: {
          subjects: grades,
          total_subjects: grades.length,
          overall_percentage: overallPercentage,
          average_gpa: grades.length > 0 
            ? (grades.reduce((sum, g) => sum + parseFloat(g.grade_points || 0), 0) / grades.length).toFixed(2)
            : 0
        },
        attendance: {
          ...attendance[0],
          attendance_rate: attendance[0].total_days > 0 
            ? ((attendance[0].present_days / attendance[0].total_days) * 100).toFixed(1)
            : 0
        },
        conduct: conduct[0] || { conduct_score: 100, conduct_grade: 'A' },
        generated_at: new Date(),
        academic_year: academic_year || new Date().getFullYear(),
        term: term || 'Term 1'
      }
    });
  } catch (error) {
    console.error('Progress Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GOAL SETTING & ACHIEVEMENT TRACKING
// ============================================
router.post('/goals/create', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { goal_type, title, description, target_value, target_date, subject_code } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO student_goals 
      (student_id, goal_type, title, description, target_value, target_date, subject_code, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `, [studentId, goal_type, title, description, target_value, target_date, subject_code]);
    
    res.json({
      success: true,
      message: 'Goal created successfully',
      goal_id: result.insertId
    });
  } catch (error) {
    console.error('Create Goal Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/goals/my-goals', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    const [goals] = await pool.execute(`
      SELECT 
        g.*,
        CASE 
          WHEN g.goal_type = 'gpa' THEN (SELECT gpa FROM global_student_sheets WHERE student_id = ?)
          WHEN g.goal_type = 'attendance' THEN (SELECT attendance_percentage FROM global_student_sheets WHERE student_id = ?)
          WHEN g.goal_type = 'subject_grade' THEN (SELECT AVG(percentage) FROM student_subject_performance WHERE student_id = ? AND subject_code = g.subject_code)
          ELSE 0
        END as current_value,
        CASE 
          WHEN g.target_date < CURDATE() AND g.status = 'active' THEN 'overdue'
          WHEN g.status = 'achieved' THEN 'achieved'
          ELSE 'in_progress'
        END as goal_status
      FROM student_goals g
      WHERE g.student_id = ?
      ORDER BY 
        CASE WHEN g.status = 'active' THEN 1 ELSE 2 END,
        g.target_date ASC
    `, [studentId, studentId, studentId, studentId]);
    
    res.json({ success: true, goals });
  } catch (error) {
    console.error('My Goals Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/goals/:goalId/update-progress', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { progress_notes, status } = req.body;
    
    const [goal] = await pool.execute(`
      SELECT * FROM student_goals WHERE id = ? AND student_id = ?
    `, [req.params.goalId, studentId]);
    
    if (!goal[0]) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    
    await pool.execute(`
      UPDATE student_goals 
      SET progress_notes = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [progress_notes, status || goal[0].status, req.params.goalId]);
    
    if (status === 'achieved') {
      await pool.execute(`
        INSERT INTO student_achievements 
        (student_id, achievement_type, title, description, date_awarded)
        VALUES (?, 'goal_achieved', ?, ?, CURDATE())
      `, [studentId, goal[0].title, `Achieved goal: ${goal[0].description}`]);
    }
    
    res.json({ success: true, message: 'Goal progress updated' });
  } catch (error) {
    console.error('Update Goal Progress Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CERTIFICATES & ACHIEVEMENTS
// ============================================
router.get('/achievements', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
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
    
    const [certificates] = await pool.execute(`
      SELECT * FROM student_certificates 
      WHERE student_id = ?
      ORDER BY issue_date DESC
    `, [studentId]);
    
    res.json({
      success: true,
      achievements: {
        awards: achievements,
        badges: badges,
        certificates: certificates,
        total_points: achievements.reduce((sum, a) => sum + (a.points || 0), 0)
      }
    });
  } catch (error) {
    console.error('Achievements Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CAREER PLANNING & GUIDANCE
// ============================================
router.get('/career/profile', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    
    const [careerProfile] = await pool.execute(`
      SELECT * FROM student_career_profiles WHERE student_id = ? OR student_sheet_id = ?
    `, [studentId, student[0].id]);
    
    const [counselingSessions] = await pool.execute(`
      SELECT * FROM counseling_sessions 
      WHERE student_id = ? OR student_sheet_id = ? OR student_code = ?
      ORDER BY session_date DESC
      LIMIT 5
    `, [studentId, student[0].id, student[0].student_code]);
    
    res.json({
      success: true,
      career_info: {
        profile: careerProfile[0] || null,
        trade: student[0].trade_name,
        level: student[0].level_number,
        counseling_sessions: counselingSessions
      }
    });
  } catch (error) {
    console.error('Career Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/career/update-interests', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.userId;
    const { career_interest, strengths, goals } = req.body;
    
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    
    const [existing] = await pool.execute(`
      SELECT id FROM student_career_profiles WHERE student_sheet_id = ?
    `, [student[0].id]);
    
    if (existing[0]) {
      await pool.execute(`
        UPDATE student_career_profiles 
        SET career_interest = ?, strengths = ?, goals = ?, updated_at = NOW()
        WHERE student_sheet_id = ?
      `, [career_interest, strengths, goals, student[0].id]);
    } else {
      await pool.execute(`
        INSERT INTO student_career_profiles 
        (student_sheet_id, student_code, career_interest, strengths, goals)
        VALUES (?, ?, ?, ?, ?)
      `, [student[0].id, student[0].student_code, career_interest, strengths, goals]);
    }
    
    res.json({ success: true, message: 'Career interests updated successfully' });
  } catch (error) {
    console.error('Update Career Interests Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { emitToStudent, emitToParent } = require('../services/socketService');

/**
 * ULTRA-COMPREHENSIVE TEACHER PORTAL
 * AI-powered grading, student insights, class management
 * Attendance tracking, assignment creation, performance analytics
 */

// ============================================
// TEACHER DASHBOARD
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    
    const [assignedClasses] = await pool.execute(`
      SELECT DISTINCT tc.*, t.name as trade_name
      FROM teacher_class_assignments tca
      JOIN trade_classes tc ON tca.class_id = tc.id
      JOIN trades t ON tc.trade_id = t.id
      WHERE tca.teacher_id = ? AND tca.status = 'active'
    `, [teacherId]);
    
    const [totalStudents] = await pool.execute(`
      SELECT COUNT(DISTINCT gs.student_id) as count
      FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
    `, [teacherId]);
    
    const [todayAttendance] = await pool.execute(`
      SELECT COUNT(DISTINCT student_id) as marked
      FROM student_attendance_records 
      WHERE attendance_date = CURDATE() 
        AND marked_by = ?
    `, [teacherId]);
    
    const [pendingAssignments] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM assignment_submissions 
      WHERE assignment_id IN (
        SELECT id FROM assignments WHERE teacher_id = ? AND status = 'active'
      ) AND status = 'submitted'
    `, [teacherId]);
    
    const [upcomingAssignments] = await pool.execute(`
      SELECT a.*, COUNT(sub.id) as submission_count
      FROM assignments a
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id
      WHERE a.teacher_id = ? 
        AND a.status = 'active'
        AND a.due_date >= CURDATE()
      GROUP BY a.id
      ORDER BY a.due_date ASC
      LIMIT 5
    `, [teacherId]);
    
    const [classPerformance] = await pool.execute(`
      SELECT 
        gs.class_name,
        COUNT(*) as student_count,
        AVG(gs.gpa) as avg_gpa,
        AVG(gs.attendance_percentage) as avg_attendance
      FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
      GROUP BY gs.class_name
    `, [teacherId]);
    
    res.json({
      success: true,
      dashboard: {
        assigned_classes: assignedClasses.length,
        total_students: totalStudents[0].count,
        today_attendance_marked: todayAttendance[0].marked,
        pending_submissions: pendingAssignments[0].count,
        upcoming_assignments: upcomingAssignments,
        class_performance: classPerformance
      }
    });
  } catch (error) {
    console.error('Teacher Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT MANAGEMENT - From Global Sheet
// ============================================
router.get('/students', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { class_name, search } = req.query;
    
    let query = `
      SELECT gs.* FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
    `;
    const params = [teacherId];
    
    if (class_name) { query += ' AND gs.class_name = ?'; params.push(class_name); }
    if (search) {
      query += ' AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY gs.class_name, gs.last_name, gs.first_name';
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    console.error('Students Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students/:studentId/profile', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [req.params.studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [subjects] = await pool.execute(`
      SELECT * FROM student_subject_performance 
      WHERE student_id = ?
      ORDER BY term DESC, subject_name
    `, [req.params.studentId]);
    
    const [attendance] = await pool.execute(`
      SELECT * FROM student_attendance_summary 
      WHERE student_id = ?
      ORDER BY year DESC, month DESC
      LIMIT 6
    `, [req.params.studentId]);
    
    const [recentAttendance] = await pool.execute(`
      SELECT * FROM student_attendance_records 
      WHERE student_id = ?
      ORDER BY attendance_date DESC
      LIMIT 10
    `, [req.params.studentId]);
    
    const [discipline] = await pool.execute(`
      SELECT * FROM student_discipline_records 
      WHERE student_id = ?
      ORDER BY incident_date DESC
      LIMIT 5
    `, [req.params.studentId]);
    
    res.json({
      success: true,
      student: student[0],
      academic: subjects,
      attendance_summary: attendance,
      recent_attendance: recentAttendance,
      discipline_records: discipline
    });
  } catch (error) {
    console.error('Student Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ATTENDANCE MANAGEMENT
// ============================================
router.post('/attendance/mark', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, attendance_date, status, subject, period, remarks } = req.body;
    
    const [student] = await pool.execute(`
      SELECT id FROM global_student_sheets WHERE student_id = ?
    `, [student_id]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    await pool.execute(`
      INSERT INTO student_attendance_records 
      (sheet_id, student_id, attendance_date, status, subject, period, marked_by, marked_by_name, marked_by_role, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status), 
        remarks = VALUES(remarks), 
        marked_at = NOW()
    `, [student[0].id, student_id, attendance_date, status, subject, period, req.user.userId, req.user.name, req.user.role, remarks]);
    
    const date = new Date(attendance_date);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    const [att] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM student_attendance_records 
      WHERE student_id = ? 
        AND MONTH(attendance_date) = ? 
        AND YEAR(attendance_date) = ?
    `, [student_id, date.getMonth() + 1, year]);
    
    const rate = att[0].total > 0 ? (att[0].present / att[0].total) * 100 : 100;
    
    await pool.execute(`
      INSERT INTO student_attendance_summary 
      (sheet_id, student_id, month, year, total_days, present_days, absent_days, late_days, attendance_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        total_days = VALUES(total_days),
        present_days = VALUES(present_days),
        absent_days = VALUES(absent_days),
        late_days = VALUES(late_days),
        attendance_rate = VALUES(attendance_rate)
    `, [student[0].id, student_id, month, year, att[0].total, att[0].present, att[0].absent, att[0].late, rate]);
    
    const [overall] = await pool.execute(`
      SELECT SUM(total_days) as total, SUM(present_days) as present
      FROM student_attendance_summary 
      WHERE student_id = ?
    `, [student_id]);
    
    const overallRate = overall[0].total > 0 ? (overall[0].present / overall[0].total) * 100 : 100;
    
    await pool.execute(`
      UPDATE global_student_sheets 
      SET attendance_percentage = ?
      WHERE student_id = ?
    `, [overallRate, student_id]);
    
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/attendance/bulk-mark', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { class_name, attendance_date, subject, period, student_statuses } = req.body;
    
    for (const record of student_statuses) {
      const [student] = await pool.execute(`
        SELECT id FROM global_student_sheets WHERE student_id = ?
      `, [record.student_id]);
      
      if (student[0]) {
        await pool.execute(`
          INSERT INTO student_attendance_records 
          (sheet_id, student_id, attendance_date, status, subject, period, marked_by, marked_by_name, marked_by_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            status = VALUES(status), 
            marked_at = NOW()
        `, [student[0].id, record.student_id, attendance_date, record.status, subject, period, req.user.userId, req.user.name, req.user.role]);
      }
    }
    
    res.json({ success: true, message: `Attendance marked for ${student_statuses.length} students` });
  } catch (error) {
    console.error('Bulk Mark Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GRADING & ASSESSMENT
// ============================================
router.post('/grades/record', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, remarks } = req.body;
    
    const [student] = await pool.execute(`
      SELECT id FROM global_student_sheets WHERE student_id = ?
    `, [student_id]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const total = parseFloat(quiz_marks || 0) + parseFloat(midterm_marks || 0) + parseFloat(final_marks || 0);
    const percentage = total;
    const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
    const points = percentage >= 90 ? 4.0 : percentage >= 80 ? 3.0 : percentage >= 70 ? 2.0 : percentage >= 60 ? 1.0 : 0.0;
    
    await pool.execute(`
      INSERT INTO student_subject_performance 
      (sheet_id, student_id, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, total_marks, percentage, grade, grade_points, teacher_id, teacher_name, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        quiz_marks = VALUES(quiz_marks),
        midterm_marks = VALUES(midterm_marks),
        final_marks = VALUES(final_marks),
        total_marks = VALUES(total_marks),
        percentage = VALUES(percentage),
        grade = VALUES(grade),
        grade_points = VALUES(grade_points),
        remarks = VALUES(remarks),
        updated_at = NOW()
    `, [student[0].id, student_id, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, total, percentage, grade, points, req.user.userId, req.user.name, remarks]);
    
    const [subjects] = await pool.execute(`
      SELECT * FROM student_subject_performance 
      WHERE student_id = ? AND term = ? AND academic_year = ?
    `, [student_id, term, academic_year]);
    
    if (subjects.length > 0) {
      const avgGpa = subjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / subjects.length;
      const avgPercentage = subjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / subjects.length;
      const overallGrade = avgPercentage >= 90 ? 'A' : avgPercentage >= 80 ? 'B' : avgPercentage >= 70 ? 'C' : avgPercentage >= 60 ? 'D' : 'F';
      
      await pool.execute(`
        UPDATE global_student_sheets 
        SET total_subjects = ?, gpa = ?, overall_grade = ?
        WHERE student_id = ?
      `, [subjects.length, avgGpa.toFixed(2), overallGrade, student_id]);
    }
    
    await pool.execute(`
      INSERT INTO student_notifications 
      (student_id, title, message, type, priority)
      VALUES (?, 'New Grade Posted', ?, 'grade', 'normal')
    `, [student_id, `Your grade for ${subject_name} has been posted: ${grade} (${percentage}%)`]);
    
    res.json({ success: true, message: 'Grade recorded successfully', grade, percentage, points });
  } catch (error) {
    console.error('Record Grade Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/grades/bulk-record', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { subject_code, subject_name, term, academic_year, student_grades } = req.body;
    
    for (const record of student_grades) {
      const [student] = await pool.execute(`
        SELECT id FROM global_student_sheets WHERE student_id = ?
      `, [record.student_id]);
      
      if (student[0]) {
        const total = parseFloat(record.quiz_marks || 0) + parseFloat(record.midterm_marks || 0) + parseFloat(record.final_marks || 0);
        const percentage = total;
        const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
        const points = percentage >= 90 ? 4.0 : percentage >= 80 ? 3.0 : percentage >= 70 ? 2.0 : percentage >= 60 ? 1.0 : 0.0;
        
        await pool.execute(`
          INSERT INTO student_subject_performance 
          (sheet_id, student_id, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, total_marks, percentage, grade, grade_points, teacher_id, teacher_name, remarks)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            quiz_marks = VALUES(quiz_marks),
            midterm_marks = VALUES(midterm_marks),
            final_marks = VALUES(final_marks),
            total_marks = VALUES(total_marks),
            percentage = VALUES(percentage),
            grade = VALUES(grade),
            grade_points = VALUES(grade_points),
            updated_at = NOW()
        `, [student[0].id, record.student_id, subject_code, subject_name, term, academic_year, record.quiz_marks, record.midterm_marks, record.final_marks, total, percentage, grade, points, req.user.userId, req.user.name, record.remarks]);
      }
    }
    
    res.json({ success: true, message: `Grades recorded for ${student_grades.length} students` });
  } catch (error) {
    console.error('Bulk Record Grades Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ASSIGNMENT MANAGEMENT
// ============================================
router.post('/assignments/create', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { title, description, subject, class_id, trade_code, due_date, total_marks, instructions, attachments } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO assignments 
      (teacher_id, teacher_name, title, description, subject, class_id, trade_code, due_date, total_marks, instructions, attachments, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [req.user.userId, req.user.name, title, description, subject, class_id, trade_code, due_date, total_marks, instructions, attachments]);
    
    const [students] = await pool.execute(`
      SELECT student_id FROM global_student_sheets 
      WHERE (class_name = ? OR trade_code = ?) AND status = 'active'
    `, [class_id, trade_code]);
    
    for (const student of students) {
      await pool.execute(`
        INSERT INTO student_notifications 
        (student_id, title, message, type, priority, related_id, related_type)
        VALUES (?, 'New Assignment', ?, 'assignment', 'high', ?, 'assignment')
      `, [student.student_id, `New assignment posted: ${title}. Due date: ${due_date}`, result.insertId]);
    }
    
    res.json({ success: true, message: 'Assignment created successfully', assignment_id: result.insertId, students_notified: students.length });
  } catch (error) {
    console.error('Create Assignment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/assignments', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin', 'dos']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { status } = req.query;
    
    let query = `
      SELECT a.*, 
        COUNT(sub.id) as total_submissions,
        COUNT(CASE WHEN sub.status = 'graded' THEN 1 END) as graded_submissions
      FROM assignments a
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id
      WHERE a.teacher_id = ?
    `;
    const params = [teacherId];
    
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    
    query += ' GROUP BY a.id ORDER BY a.created_at DESC';
    
    const [assignments] = await pool.execute(query, params);
    
    res.json({ success: true, assignments, total: assignments.length });
  } catch (error) {
    console.error('Assignments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/assignments/:assignmentId/submissions', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const [submissions] = await pool.execute(`
      SELECT sub.*, 
        gs.first_name, gs.last_name, gs.student_code, gs.class_name
      FROM assignment_submissions sub
      JOIN global_student_sheets gs ON sub.student_id = gs.student_id
      WHERE sub.assignment_id = ?
      ORDER BY sub.submitted_at DESC
    `, [req.params.assignmentId]);
    
    res.json({ success: true, submissions, total: submissions.length });
  } catch (error) {
    console.error('Submissions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/assignments/:assignmentId/submissions/:submissionId/grade', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { marks_obtained, feedback } = req.body;
    
    await pool.execute(`
      UPDATE assignment_submissions 
      SET marks_obtained = ?, feedback = ?, graded_by = ?, graded_at = NOW(), status = 'graded'
      WHERE id = ?
    `, [marks_obtained, feedback, req.user.userId, req.params.submissionId]);
    
    const [submission] = await pool.execute(`
      SELECT student_id FROM assignment_submissions WHERE id = ?
    `, [req.params.submissionId]);
    
    if (submission[0]) {
      await pool.execute(`
        INSERT INTO student_notifications 
        (student_id, title, message, type, priority)
        VALUES (?, 'Assignment Graded', ?, 'assignment', 'normal')
      `, [submission[0].student_id, `Your assignment has been graded. Score: ${marks_obtained}. ${feedback}`]);
    }
    
    res.json({ success: true, message: 'Assignment graded successfully' });
  } catch (error) {
    console.error('Grade Assignment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CLASS ANALYTICS
// ============================================
router.get('/analytics/class-performance', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin', 'dos']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { class_name, subject } = req.query;
    
    let query = `
      SELECT 
        gs.class_name,
        COUNT(*) as student_count,
        AVG(gs.gpa) as avg_gpa,
        AVG(gs.attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gs.gpa >= 3.5 THEN 1 END) as honors_students,
        COUNT(CASE WHEN gs.gpa < 2.0 THEN 1 END) as at_risk_students
      FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
    `;
    const params = [teacherId];
    
    if (class_name) { query += ' AND gs.class_name = ?'; params.push(class_name); }
    
    query += ' GROUP BY gs.class_name';
    
    const [performance] = await pool.execute(query, params);
    
    res.json({ success: true, analytics: performance });
  } catch (error) {
    console.error('Class Performance Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics/subject-performance', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin', 'dos']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { subject_code, term, academic_year } = req.query;
    
    let query = `
      SELECT 
        subject_name,
        COUNT(*) as student_count,
        AVG(percentage) as avg_percentage,
        AVG(grade_points) as avg_gpa,
        MIN(percentage) as lowest_score,
        MAX(percentage) as highest_score,
        COUNT(CASE WHEN grade = 'A' THEN 1 END) as a_grades,
        COUNT(CASE WHEN grade = 'B' THEN 1 END) as b_grades,
        COUNT(CASE WHEN grade = 'C' THEN 1 END) as c_grades,
        COUNT(CASE WHEN grade = 'D' THEN 1 END) as d_grades,
        COUNT(CASE WHEN grade = 'F' THEN 1 END) as f_grades
      FROM student_subject_performance
      WHERE teacher_id = ?
    `;
    const params = [teacherId];
    
    if (subject_code) { query += ' AND subject_code = ?'; params.push(subject_code); }
    if (term) { query += ' AND term = ?'; params.push(term); }
    if (academic_year) { query += ' AND academic_year = ?'; params.push(academic_year); }
    
    query += ' GROUP BY subject_name';
    
    const [performance] = await pool.execute(query, params);
    
    res.json({ success: true, analytics: performance });
  } catch (error) {
    console.error('Subject Performance Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ENHANCED HOMEWORK & QUIZ DISTRIBUTION
// ============================================
router.post('/homework/create', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { title, description, subject, class_name, trade_code, due_date, homework_type, instructions, attachments, total_marks } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO assignments 
      (teacher_id, teacher_name, title, description, subject, class_id, trade_code, due_date, total_marks, instructions, attachments, status, assignment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'homework')
    `, [req.user.userId, req.user.name, title, description, subject, class_name, trade_code, due_date, total_marks, instructions, JSON.stringify(attachments || [])]);
    
    let query = 'SELECT gs.* FROM global_student_sheets gs WHERE gs.status = "active"';
    const params = [];
    
    if (class_name) { query += ' AND gs.class_name = ?'; params.push(class_name); }
    else if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    
    const [students] = await pool.execute(query, params);
    
    for (const student of students) {
      await pool.execute(`
        INSERT INTO assignment_submissions 
        (assignment_id, student_sheet_id, student_id, status)
        VALUES (?, ?, ?, 'pending')
      `, [result.insertId, student.id, student.student_id]);
      
      const message = `New homework: ${title} for ${subject}. Due: ${due_date}`;
      
      await pool.execute(`
        INSERT INTO student_notifications 
        (student_id, title, message, type, priority, related_id, related_type)
        VALUES (?, 'New Homework', ?, 'homework', 'high', ?, 'assignment')
      `, [student.student_id, message, result.insertId]);
      
      emitToStudent(student.student_id, 'new_homework', {
        homework_id: result.insertId,
        title: title,
        subject: subject,
        due_date: due_date,
        teacher: req.user.name
      });
    }
    
    res.json({
      success: true,
      message: 'Homework created and distributed successfully',
      homework_id: result.insertId,
      students_notified: students.length
    });
  } catch (error) {
    console.error('Create Homework Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/quiz/create', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { title, description, subject, class_name, trade_code, quiz_date, duration_minutes, total_marks, questions, instructions } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO assignments 
      (teacher_id, teacher_name, title, description, subject, class_id, trade_code, due_date, total_marks, instructions, status, assignment_type, quiz_duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'quiz', ?)
    `, [req.user.userId, req.user.name, title, description, subject, class_name, trade_code, quiz_date, total_marks, JSON.stringify(questions || []), duration_minutes]);
    
    let query = 'SELECT gs.* FROM global_student_sheets gs WHERE gs.status = "active"';
    const params = [];
    
    if (class_name) { query += ' AND gs.class_name = ?'; params.push(class_name); }
    else if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    
    const [students] = await pool.execute(query, params);
    
    for (const student of students) {
      await pool.execute(`
        INSERT INTO assignment_submissions 
        (assignment_id, student_sheet_id, student_id, status)
        VALUES (?, ?, ?, 'pending')
      `, [result.insertId, student.id, student.student_id]);
      
      const message = `New quiz scheduled: ${title} for ${subject}. Date: ${quiz_date}. Duration: ${duration_minutes} minutes.`;
      
      await pool.execute(`
        INSERT INTO student_notifications 
        (student_id, title, message, type, priority, related_id, related_type)
        VALUES (?, 'New Quiz', ?, 'quiz', 'high', ?, 'assignment')
      `, [student.student_id, message, result.insertId]);
      
      emitToStudent(student.student_id, 'new_quiz', {
        quiz_id: result.insertId,
        title: title,
        subject: subject,
        quiz_date: quiz_date,
        duration: duration_minutes,
        total_marks: total_marks,
        teacher: req.user.name
      });
    }
    
    res.json({
      success: true,
      message: 'Quiz created and scheduled successfully',
      quiz_id: result.insertId,
      students_notified: students.length
    });
  } catch (error) {
    console.error('Create Quiz Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/work/assign-bulk', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { works } = req.body;
    
    const results = [];
    
    for (const work of works) {
      const { title, description, subject, class_name, trade_code, due_date, work_type, total_marks } = work;
      
      const [result] = await pool.execute(`
        INSERT INTO assignments 
        (teacher_id, teacher_name, title, description, subject, class_id, trade_code, due_date, total_marks, status, assignment_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `, [req.user.userId, req.user.name, title, description, subject, class_name, trade_code, due_date, total_marks, work_type]);
      
      let query = 'SELECT gs.* FROM global_student_sheets gs WHERE gs.status = "active"';
      const params = [];
      
      if (class_name) { query += ' AND gs.class_name = ?'; params.push(class_name); }
      else if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
      
      const [students] = await pool.execute(query, params);
      
      for (const student of students) {
        await pool.execute(`
          INSERT INTO assignment_submissions 
          (assignment_id, student_sheet_id, student_id, status)
          VALUES (?, ?, ?, 'pending')
        `, [result.insertId, student.id, student.student_id]);
        
        await pool.execute(`
          INSERT INTO student_notifications 
          (student_id, title, message, type, priority, related_id, related_type)
          VALUES (?, ?, ?, 'work', 'normal', ?, 'assignment')
        `, [student.student_id, `New ${work_type}: ${title}`, `${description}. Due: ${due_date}`, result.insertId]);
        
        emitToStudent(student.student_id, 'new_work', {
          work_id: result.insertId,
          title: title,
          type: work_type,
          subject: subject,
          due_date: due_date
        });
      }
      
      results.push({
        work_id: result.insertId,
        title: title,
        students_notified: students.length
      });
    }
    
    res.json({
      success: true,
      message: `${works.length} works assigned successfully`,
      results
    });
  } catch (error) {
    console.error('Bulk Assign Work Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/assignments/bulk-grade', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const { grades } = req.body;
    
    for (const gradeData of grades) {
      const { submission_id, student_id, marks_obtained, feedback } = gradeData;
      
      await pool.execute(`
        UPDATE assignment_submissions 
        SET marks_obtained = ?, feedback = ?, graded_by = ?, graded_at = NOW(), status = 'graded'
        WHERE id = ?
      `, [marks_obtained, feedback, req.user.userId, submission_id]);
      
      await pool.execute(`
        INSERT INTO student_notifications 
        (student_id, title, message, type, priority)
        VALUES (?, 'Work Graded', ?, 'grade', 'normal')
      `, [student_id, `Your work has been graded. Score: ${marks_obtained}. ${feedback}`]);
      
      emitToStudent(student_id, 'work_graded', {
        submission_id: submission_id,
        marks_obtained: marks_obtained,
        feedback: feedback
      });
    }
    
    res.json({
      success: true,
      message: `${grades.length} submissions graded successfully`
    });
  } catch (error) {
    console.error('Bulk Grade Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/assignments/pending-grading', authenticateToken, requireRole(['teacher', 'patron', 'matron']), async (req, res) => {
  try {
    const [submissions] = await pool.execute(`
      SELECT 
        sub.*, 
        a.title as assignment_title,
        a.subject,
        a.total_marks,
        a.assignment_type,
        gs.first_name,
        gs.last_name,
        gs.student_code,
        gs.class_name
      FROM assignment_submissions sub
      JOIN assignments a ON sub.assignment_id = a.id
      JOIN global_student_sheets gs ON sub.student_id = gs.student_id
      WHERE a.teacher_id = ? AND sub.status = 'submitted'
      ORDER BY sub.submitted_at ASC
    `, [req.user.userId]);
    
    res.json({
      success: true,
      pending_submissions: submissions,
      total: submissions.length
    });
  } catch (error) {
    console.error('Pending Grading Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/work-distribution/analytics', authenticateToken, requireRole(['teacher', 'patron', 'matron', 'admin', 'dos']), async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT a.id) as total_works_assigned,
        COUNT(DISTINCT CASE WHEN a.assignment_type = 'homework' THEN a.id END) as total_homework,
        COUNT(DISTINCT CASE WHEN a.assignment_type = 'quiz' THEN a.id END) as total_quizzes,
        COUNT(sub.id) as total_submissions,
        COUNT(CASE WHEN sub.status = 'graded' THEN 1 END) as graded_submissions,
        COUNT(CASE WHEN sub.status = 'submitted' THEN 1 END) as pending_grading,
        AVG(sub.marks_obtained) as avg_score
      FROM assignments a
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id
      WHERE a.teacher_id = ?
    `, [req.user.userId]);
    
    const [byClass] = await pool.execute(`
      SELECT 
        a.class_id as class_name,
        COUNT(DISTINCT a.id) as works_assigned,
        COUNT(sub.id) as submissions,
        AVG(sub.marks_obtained) as avg_score
      FROM assignments a
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id
      WHERE a.teacher_id = ?
      GROUP BY a.class_id
    `, [req.user.userId]);
    
    res.json({
      success: true,
      summary: summary[0],
      by_class: byClass
    });
  } catch (error) {
    console.error('Work Distribution Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

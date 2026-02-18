const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Roles that can access teacher portal
const TEACHER_ROLES = ['teacher', 'patron', 'matron', 'admin', 'headmaster', 'dos', 'dod'];

// ============================================
// COMPREHENSIVE TEACHER PORTAL API
// ============================================

// ============================================
// DASHBOARD & OVERVIEW
// ============================================

// Get comprehensive teacher dashboard
router.get('/dashboard', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    // Get assigned classes
    const [assignedClasses] = await pool.execute(`
      SELECT DISTINCT tc.*, t.name as trade_name, t.code as trade_code
      FROM teacher_class_assignments tca
      JOIN trade_classes tc ON tca.class_id = tc.id
      JOIN trades t ON tc.trade_id = t.id
      WHERE tca.teacher_id = ? AND tca.status = 'active'
      ORDER BY tc.name
    `, [teacherId]);
    
    // Get total students in assigned classes
    const [studentCount] = await pool.execute(`
      SELECT COUNT(DISTINCT gs.student_id) as count
      FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
    `, [teacherId]);
    
    // Get today's attendance count
    const [todayAttendance] = await pool.execute(`
      SELECT COUNT(DISTINCT student_id) as marked
      FROM student_attendance_records 
      WHERE attendance_date = CURDATE() 
        AND (marked_by = ? OR teacher_id = ?)
    `, [teacherId, teacherId]);
    
    // Get pending submissions
    const [pendingSubmissions] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM assignment_submissions 
      WHERE status = 'submitted'
        AND assignment_id IN (
          SELECT id FROM assignments WHERE teacher_id = ? AND status = 'active'
        )
    `, [teacherId]);
    
    // Get active quizzes count
    const [activeQuizzes] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM quizzes 
      WHERE teacher_id = ? AND status = 'active'
        AND (start_time IS NULL OR start_time <= NOW())
        AND (end_time IS NULL OR end_time >= NOW())
    `, [teacherId]);
    
    // Get recent incidents for teacher's classes
    const [recentIncidents] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM student_conduct_records scr
      WHERE scr.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      )
      AND DATE(scr.incident_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `, [teacherId]);
    
    // Get upcoming assignments
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
    
    // Get class performance summary
    const [classPerformance] = await pool.execute(`
      SELECT 
        gs.class_name,
        COUNT(*) as student_count,
        ROUND(AVG(gs.gpa), 2) as avg_gpa,
        ROUND(AVG(gs.attendance_percentage), 1) as avg_attendance
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
        total_students: studentCount[0].count,
        today_attendance_marked: todayAttendance[0].marked,
        pending_submissions: pendingSubmissions[0].count,
        active_quizzes: activeQuizzes[0].count,
        recent_incidents: recentIncidents[0].count,
        upcoming_assignments: upcomingAssignments,
        class_performance: classPerformance,
        assigned_classes_list: assignedClasses
      }
    });
  } catch (error) {
    console.error('Teacher Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT MANAGEMENT
// ============================================

// Get students for teacher's classes
router.get('/students', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { class_name, search, trade_code, level_number } = req.query;
    
    let query = `
      SELECT gs.* FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
    `;
    const params = [teacherId];
    
    if (class_name) { 
      query += ' AND gs.class_name = ?'; 
      params.push(class_name); 
    }
    if (trade_code) {
      query += ' AND gs.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND gs.level_number = ?';
      params.push(level_number);
    }
    if (search) {
      query += ' AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY gs.class_name, gs.last_name, gs.first_name LIMIT 100';
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    console.error('Students Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single student details
router.get('/students/:studentId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [req.params.studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get subject performance
    const [subjects] = await pool.execute(`
      SELECT * FROM student_subject_performance 
      WHERE student_id = ?
      ORDER BY term DESC, subject_name
      LIMIT 20
    `, [req.params.studentId]);
    
    // Get attendance summary
    const [attendance] = await pool.execute(`
      SELECT * FROM student_attendance_summary 
      WHERE student_id = ?
      ORDER BY month DESC
      LIMIT 12
    `, [req.params.studentId]);
    
    // Get conduct records
    const [conduct] = await pool.execute(`
      SELECT scr.*, dc.name as category_name, da.name as action_name
      FROM student_conduct_records scr
      LEFT JOIN discipline_categories dc ON scr.category_id = dc.id
      LEFT JOIN discipline_actions da ON scr.action_id = da.id
      WHERE scr.student_id = ?
      ORDER BY scr.incident_date DESC
      LIMIT 10
    `, [req.params.studentId]);
    
    // Get recent grades
    const [grades] = await pool.execute(`
      SELECT * FROM student_marks 
      WHERE student_id = ?
      ORDER BY exam_date DESC
      LIMIT 20
    `, [req.params.studentId]);
    
    res.json({ 
      success: true, 
      student: student[0],
      subjects,
      attendance,
      conduct,
      grades
    });
  } catch (error) {
    console.error('Student Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CLASS MANAGEMENT
// ============================================

// Get teacher's assigned classes with details
router.get('/classes', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    const [classes] = await pool.execute(`
      SELECT 
        tc.*, 
        t.name as trade_name, 
        t.code as trade_code,
        t.description as trade_description,
        (SELECT COUNT(*) FROM global_student_sheets gs WHERE gs.class_name = tc.name AND gs.status = 'active') as student_count,
        (SELECT COUNT(DISTINCT subject_id) FROM teacher_subjects WHERE class_id = tc.id AND teacher_id = ?) as subject_count
      FROM teacher_class_assignments tca
      JOIN trade_classes tc ON tca.class_id = tc.id
      JOIN trades t ON tc.trade_id = t.id
      WHERE tca.teacher_id = ? AND tca.status = 'active'
      ORDER BY tc.name
    `, [teacherId, teacherId]);
    
    res.json({ success: true, classes, total: classes.length });
  } catch (error) {
    console.error('Classes Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students in a specific class
router.get('/classes/:classId/students', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    // Verify teacher has access to this class
    const [assignment] = await pool.execute(`
      SELECT tc.* FROM teacher_class_assignments tca
      JOIN trade_classes tc ON tca.class_id = tc.id
      WHERE tca.teacher_id = ? AND tc.id = ? AND tca.status = 'active'
    `, [teacherId, req.params.classId]);
    
    if (!assignment[0]) {
      return res.status(403).json({ success: false, message: 'Access denied to this class' });
    }
    
    const [students] = await pool.execute(`
      SELECT * FROM global_student_sheets 
      WHERE class_name = ? AND status = 'active'
      ORDER BY last_name, first_name
    `, [assignment[0].name]);
    
    res.json({ 
      success: true, 
      students, 
      total: students.length,
      class: assignment[0]
    });
  } catch (error) {
    console.error('Class Students Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// COURSE MANAGEMENT
// ============================================

// Get courses for teacher's classes
router.get('/courses', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { class_id, trade_code } = req.query;
    
    let query = `
      SELECT DISTINCT 
        tc.*,
        t.name as trade_name,
        t.code as trade_code
      FROM teacher_subjects ts
      JOIN trade_courses tc ON ts.subject_id = tc.id
      JOIN trades t ON tc.trade_id = t.id
      WHERE ts.teacher_id = ?
    `;
    const params = [teacherId];
    
    if (class_id) {
      query += ' AND ts.class_id = ?';
      params.push(class_id);
    }
    if (trade_code) {
      query += ' AND t.code = ?';
      params.push(trade_code);
    }
    
    query += ' ORDER BY t.code, tc.course_name';
    
    const [courses] = await pool.execute(query, params);
    
    res.json({ success: true, courses, total: courses.length });
  } catch (error) {
    console.error('Courses Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all available courses
router.get('/courses/all', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    // Get teacher's assigned trades
    const [trades] = await pool.execute(`
      SELECT DISTINCT t.code
      FROM teacher_class_assignments tca
      JOIN trade_classes tc ON tca.class_id = tc.id
      JOIN trades t ON tc.trade_id = t.id
      WHERE tca.teacher_id = ? AND tca.status = 'active'
    `, [teacherId]);
    
    const tradeCodes = trades.map(t => t.code);
    
    if (tradeCodes.length === 0) {
      return res.json({ success: true, courses: [], total: 0 });
    }
    
    const placeholders = tradeCodes.map(() => '?').join(',');
    const [courses] = await pool.execute(`
      SELECT tc.*, t.name as trade_name, t.code as trade_code
      FROM trade_courses tc
      JOIN trades t ON tc.trade_id = t.id
      WHERE t.code IN (${placeholders})
      ORDER BY t.code, tc.level_number, tc.course_name
    `, tradeCodes);
    
    res.json({ success: true, courses, total: courses.length });
  } catch (error) {
    console.error('All Courses Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// QUIZ MANAGEMENT
// ============================================

// Get all quizzes
router.get('/quizzes', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { status, subject_id, class_id } = req.query;
    
    let query = `
      SELECT q.*, 
        s.name as subject_name,
        tc.name as class_name
      FROM quizzes q
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN trade_classes tc ON q.class_id = tc.id
      WHERE q.teacher_id = ?
    `;
    const params = [teacherId];
    
    if (status) {
      query += ' AND q.status = ?';
      params.push(status);
    }
    if (subject_id) {
      query += ' AND q.subject_id = ?';
      params.push(subject_id);
    }
    if (class_id) {
      query += ' AND q.class_id = ?';
      params.push(class_id);
    }
    
    query += ' ORDER BY q.created_at DESC';
    
    const [quizzes] = await pool.execute(query, params);
    
    res.json({ success: true, quizzes, total: quizzes.length });
  } catch (error) {
    console.error('Quizzes Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single quiz with questions
router.get('/quizzes/:quizId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    const [quizzes] = await pool.execute(`
      SELECT q.*, s.name as subject_name, tc.name as class_name
      FROM quizzes q
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN trade_classes tc ON q.class_id = tc.id
      WHERE q.id = ? AND q.teacher_id = ?
    `, [req.params.quizId, teacherId]);
    
    if (!quizzes[0]) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const [questions] = await pool.execute(`
      SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order
    `, [req.params.quizId]);
    
    // Parse options JSON
    const questionsWithOptions = questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
    }));
    
    // Get submission stats
    const [submissionStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_submissions,
        AVG(score) as average_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score
      FROM quiz_attempts WHERE quiz_id = ?
    `, [req.params.quizId]);
    
    res.json({ 
      success: true, 
      quiz: { ...quizzes[0], questions: questionsWithOptions },
      stats: submissionStats[0]
    });
  } catch (error) {
    console.error('Quiz Detail Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new quiz
router.post('/quizzes', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const {
      title, description, subject_id, class_id, trade_code, level_number,
      difficulty_level, time_limit, total_marks, passing_marks, instructions,
      start_time, end_time, randomize_questions, show_results_immediately,
      allow_review, max_attempts, questions
    } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO quizzes (title, description, teacher_id, subject_id, class_id, trade_code, level_number,
        difficulty_level, time_limit, total_marks, passing_marks, instructions,
        start_time, end_time, randomize_questions, show_results_immediately,
        allow_review, max_attempts, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [title, description, teacherId, subject_id, class_id, trade_code, level_number,
        difficulty_level || 'medium', time_limit || 30, total_marks || 100, passing_marks || 50, instructions,
        start_time, end_time, randomize_questions || false, show_results_immediately || true,
        allow_review || true, max_attempts || 3]
    );
    
    const quizId = result.insertId;
    
    // Add questions if provided
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pool.execute(
          `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, marks, explanation, question_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [quizId, q.question_text, q.question_type || 'multiple_choice', 
           JSON.stringify(q.options || []), q.correct_answer, q.marks || 10, q.explanation || '', i + 1]
        );
      }
    }
    
    res.status(201).json({ 
      success: true, 
      id: quizId, 
      message: 'Quiz created successfully' 
    });
  } catch (error) {
    console.error('Create Quiz Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update quiz
router.put('/quizzes/:quizId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const {
      title, description, subject_id, class_id, trade_code, level_number,
      difficulty_level, time_limit, total_marks, passing_marks, instructions,
      start_time, end_time, randomize_questions, show_results_immediately,
      allow_review, max_attempts, status
    } = req.body;
    
    // Verify ownership
    const [existing] = await pool.execute(
      'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
      [req.params.quizId, teacherId]
    );
    
    if (!existing[0]) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    await pool.execute(
      `UPDATE quizzes SET title = ?, description = ?, subject_id = ?, class_id = ?, trade_code = ?, level_number = ?,
        difficulty_level = ?, time_limit = ?, total_marks = ?, passing_marks = ?, instructions = ?,
        start_time = ?, end_time = ?, randomize_questions = ?, show_results_immediately = ?,
        allow_review = ?, max_attempts = ?, status = ? WHERE id = ?`,
      [title, description, subject_id, class_id, trade_code, level_number,
        difficulty_level, time_limit, total_marks, passing_marks, instructions,
        start_time, end_time, randomize_questions, show_results_immediately,
        allow_review, max_attempts, status, req.params.quizId]
    );
    
    res.json({ success: true, message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Update Quiz Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete quiz
router.delete('/quizzes/:quizId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    // Verify ownership
    const [existing] = await pool.execute(
      'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
      [req.params.quizId, teacherId]
    );
    
    if (!existing[0]) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // Delete questions first
    await pool.execute('DELETE FROM quiz_questions WHERE quiz_id = ?', [req.params.quizId]);
    await pool.execute('DELETE FROM quiz_attempts WHERE quiz_id = ?', [req.params.quizId]);
    await pool.execute('DELETE FROM quizzes WHERE id = ?', [req.params.quizId]);
    
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete Quiz Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add question to quiz
router.post('/quizzes/:quizId/questions', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { question_text, question_type, options, correct_answer, marks, explanation } = req.body;
    
    // Verify ownership
    const [existing] = await pool.execute(
      'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
      [req.params.quizId, teacherId]
    );
    
    if (!existing[0]) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // Get current max order
    const [maxOrder] = await pool.execute(
      'SELECT MAX(question_order) as max_order FROM quiz_questions WHERE quiz_id = ?',
      [req.params.quizId]
    );
    
    const newOrder = (maxOrder[0].max_order || 0) + 1;
    
    const [result] = await pool.execute(
      `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, marks, explanation, question_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.quizId, question_text, question_type || 'multiple_choice', 
       JSON.stringify(options || []), correct_answer, marks || 10, explanation || '', newOrder]
    );
    
    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      message: 'Question added successfully' 
    });
  } catch (error) {
    console.error('Add Question Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete question from quiz
router.delete('/quizzes/:quizId/questions/:questionId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    // Verify ownership
    const [quiz] = await pool.execute(
      'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
      [req.params.quizId, teacherId]
    );
    
    if (!quiz[0]) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    await pool.execute(
      'DELETE FROM quiz_questions WHERE id = ? AND quiz_id = ?',
      [req.params.questionId, req.params.quizId]
    );
    
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get quiz submissions
router.get('/quizzes/:quizId/submissions', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    // Verify ownership
    const [quiz] = await pool.execute(
      'SELECT id, title FROM quizzes WHERE id = ? AND teacher_id = ?',
      [req.params.quizId, teacherId]
    );
    
    if (!quiz[0]) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const [submissions] = await pool.execute(`
      SELECT qa.*, u.first_name, u.last_name, u.student_code
      FROM quiz_attempts qa
      JOIN users u ON qa.student_id = u.id
      WHERE qa.quiz_id = ?
      ORDER BY qa.submitted_at DESC
    `, [req.params.quizId]);
    
    res.json({ 
      success: true, 
      quiz_title: quiz[0].title,
      submissions,
      total: submissions.length
    });
  } catch (error) {
    console.error('Quiz Submissions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CONDUCT MANAGEMENT - REMOVE CONDUCT RECORDS
// ============================================

// Get students' conduct records for teacher's classes
router.get('/conduct', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { student_id, severity, status, date_from, date_to } = req.query;
    
    let query = `
      SELECT scr.*, 
        u.first_name, u.last_name, u.student_code,
        gs.class_name,
        dc.name as category_name, dc.color as category_color,
        da.name as action_name, da.action_type
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      LEFT JOIN global_student_sheets gs ON u.id = gs.student_id AND gs.status = 'active'
      LEFT JOIN discipline_categories dc ON scr.category_id = dc.id
      LEFT JOIN discipline_actions da ON scr.action_id = da.id
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      )
    `;
    const params = [teacherId];
    
    if (student_id) {
      query += ' AND scr.student_id = ?';
      params.push(student_id);
    }
    if (severity) {
      query += ' AND scr.severity = ?';
      params.push(severity);
    }
    if (status) {
      query += ' AND scr.status = ?';
      params.push(status);
    }
    if (date_from) {
      query += ' AND DATE(scr.incident_date) >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND DATE(scr.incident_date) <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY scr.incident_date DESC LIMIT 100';
    
    const [records] = await pool.execute(query, params);
    
    res.json({ success: true, records, total: records.length });
  } catch (error) {
    console.error('Conduct Records Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove/Delete a conduct record
router.delete('/conduct/:recordId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const recordId = req.params.recordId;
    
    // Verify teacher has access to this student's class
    const [record] = await pool.execute(`
      SELECT scr.*, gs.class_name
      FROM student_conduct_records scr
      LEFT JOIN global_student_sheets gs ON scr.student_id = gs.student_id AND gs.status = 'active'
      WHERE scr.id = ?
    `, [recordId]);
    
    if (!record[0]) {
      return res.status(404).json({ success: false, message: 'Conduct record not found' });
    }
    
    // Check if teacher has access to this class
    const [hasAccess] = await pool.execute(`
      SELECT tc.id FROM teacher_class_assignments tca
      JOIN trade_classes tc ON tca.class_id = tc.id
      WHERE tca.teacher_id = ? AND tc.name = ? AND tca.status = 'active'
    `, [teacherId, record[0].class_name]);
    
    // Teachers can only delete records they created, admins can delete any
    const isAdmin = req.user.role === 'admin' || req.user.role === 'headmaster';
    
    if (!hasAccess[0] && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied to this conduct record' });
    }
    
    // Delete the conduct record
    await pool.execute('DELETE FROM student_conduct_records WHERE id = ?', [recordId]);
    
    res.json({ success: true, message: 'Conduct record removed successfully' });
  } catch (error) {
    console.error('Remove Conduct Record Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk remove conduct records
router.post('/conduct/bulk-delete', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { record_ids } = req.body;
    
    if (!record_ids || !Array.isArray(record_ids) || record_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No record IDs provided' });
    }
    
    // Delete multiple records
    const placeholders = record_ids.map(() => '?').join(',');
    await pool.execute(`DELETE FROM student_conduct_records WHERE id IN (${placeholders})`, record_ids);
    
    res.json({ success: true, message: `${record_ids.length} conduct record(s) removed successfully` });
  } catch (error) {
    console.error('Bulk Remove Conduct Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new conduct record
router.post('/conduct', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { student_id, category_id, incident_date, incident_type, description, severity, action_id, status, follow_up_required, follow_up_date } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO student_conduct_records (student_id, category_id, reported_by, incident_date, incident_type, description, severity, action_id, status, follow_up_required, follow_up_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, category_id, teacherId, incident_date || new Date(), incident_type, description, severity || 'minor', action_id, status || 'pending', follow_up_required || false, follow_up_date]
    );
    
    res.status(201).json({ success: true, id: result.insertId, message: 'Conduct record created successfully' });
  } catch (error) {
    console.error('Create Conduct Record Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ATTENDANCE MANAGEMENT
// ============================================

// Get attendance records for teacher's classes
router.get('/attendance', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { class_name, date_from, date_to } = req.query;
    
    let query = `
      SELECT sar.*, u.first_name, u.last_name, u.student_code
      FROM student_attendance_records sar
      JOIN users u ON sar.student_id = u.id
      WHERE sar.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      )
    `;
    const params = [teacherId];
    
    if (class_name) {
      query += ' AND sar.class_name = ?';
      params.push(class_name);
    }
    if (date_from) {
      query += ' AND DATE(sar.attendance_date) >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND DATE(sar.attendance_date) <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY sar.attendance_date DESC, u.last_name LIMIT 500';
    
    const [records] = await pool.execute(query, params);
    
    res.json({ success: true, records, total: records.length });
  } catch (error) {
    console.error('Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark attendance for a class
router.post('/attendance/mark', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { class_name, date, records } = req.body;
    
    if (!class_name || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Class name and attendance records required' });
    }
    
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    for (const record of records) {
      const { student_id, status, remarks } = record;
      
      // Check if already marked
      const [existing] = await pool.execute(
        'SELECT id FROM student_attendance_records WHERE student_id = ? AND class_name = ? AND attendance_date = ?',
        [student_id, class_name, attendanceDate]
      );
      
      if (existing[0]) {
        // Update existing
        await pool.execute(
          'UPDATE student_attendance_records SET status = ?, remarks = ?, marked_by = ? WHERE id = ?',
          [status, remarks, teacherId, existing[0].id]
        );
      } else {
        // Insert new
        await pool.execute(
          `INSERT INTO student_attendance_records (student_id, class_name, attendance_date, status, remarks, marked_by, teacher_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [student_id, class_name, attendanceDate, status, remarks, teacherId, teacherId]
        );
      }
    }
    
    res.json({ success: true, message: `Attendance marked for ${records.length} students` });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance summary for a student
router.get('/attendance/student/:studentId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused,
        COUNT(*) as total
      FROM student_attendance_records 
      WHERE student_id = ?
    `, [req.params.studentId]);
    
    const [recent] = await pool.execute(`
      SELECT * FROM student_attendance_records 
      WHERE student_id = ?
      ORDER BY attendance_date DESC
      LIMIT 30
    `, [req.params.studentId]);
    
    res.json({ success: true, summary: summary[0], recent });
  } catch (error) {
    console.error('Student Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GRADEBOOK / MARKS MANAGEMENT
// ============================================

// Get subject columns for teacher's classes
router.get('/marks/columns', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { class_name } = req.query;
    
    let query = `
      SELECT * FROM subject_columns 
      WHERE class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      )
    `;
    const params = [teacherId];
    
    if (class_name) {
      query += ' AND class_name = ?';
      params.push(class_name);
    }
    
    query += ' ORDER BY exam_date DESC, subject_name';
    
    const [columns] = await pool.execute(query, params);
    
    res.json({ success: true, columns, total: columns.length });
  } catch (error) {
    console.error('Marks Columns Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new subject column
router.post('/marks/columns', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { subject_name, subject_code, max_marks, class_name, trade_code, level_number, term, academic_year, exam_type, exam_date, weight } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO subject_columns (subject_name, subject_code, max_marks, class_name, trade_code, level_number, term, academic_year, exam_type, exam_date, weight, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_name, subject_code, max_marks || 100, class_name, trade_code, level_number, term || 1, academic_year || new Date().getFullYear(), exam_type || 'exam', exam_date, weight || 1, teacherId]
    );
    
    res.status(201).json({ success: true, id: result.insertId, message: 'Subject column created successfully' });
  } catch (error) {
    console.error('Create Marks Column Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record marks for students
router.post('/marks/record', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { column_id, student_marks } = req.body;
    
    if (!column_id || !student_marks || !Array.isArray(student_marks)) {
      return res.status(400).json({ success: false, message: 'Column ID and student marks required' });
    }
    
    // Get column details
    const [column] = await pool.execute('SELECT * FROM subject_columns WHERE id = ?', [column_id]);
    if (!column[0]) {
      return res.status(404).json({ success: false, message: 'Subject column not found' });
    }
    
    let recordedCount = 0;
    for (const mark of student_marks) {
      const { student_id, marks, remarks } = mark;
      
      // Check if already exists
      const [existing] = await pool.execute(
        'SELECT id FROM student_marks WHERE student_id = ? AND column_id = ?',
        [student_id, column_id]
      );
      
      const grade = calculateGrade(marks, column[0].max_marks);
      
      if (existing[0]) {
        await pool.execute(
          'UPDATE student_marks SET marks = ?, grade = ?, remarks = ?, updated_by = ? WHERE id = ?',
          [marks, grade, remarks, teacherId, existing[0].id]
        );
      } else {
        await pool.execute(
          `INSERT INTO student_marks (student_id, column_id, marks, grade, remarks, recorded_by) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [student_id, column_id, marks, grade, remarks, teacherId]
        );
      }
      recordedCount++;
    }
    
    res.json({ success: true, message: `Marks recorded for ${recordedCount} students` });
  } catch (error) {
    console.error('Record Marks Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to calculate grade
function calculateGrade(marks, maxMarks) {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

// Get marks for a specific column
router.get('/marks/columns/:columnId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    const [column] = await pool.execute('SELECT * FROM subject_columns WHERE id = ?', [req.params.columnId]);
    if (!column[0]) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }
    
    const [marks] = await pool.execute(`
      SELECT sm.*, u.first_name, u.last_name, u.student_code
      FROM student_marks sm
      JOIN users u ON sm.student_id = u.id
      WHERE sm.column_id = ?
      ORDER BY u.last_name, u.first_name
    `, [req.params.columnId]);
    
    res.json({ success: true, column: column[0], marks, total: marks.length });
  } catch (error) {
    console.error('Get Marks Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ASSIGNMENTS MANAGEMENT
// ============================================

// Get all assignments
router.get('/assignments', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { status, class_name } = req.query;
    
    let query = `
      SELECT a.*, 
        (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count
      FROM assignments a
      WHERE a.teacher_id = ?
    `;
    const params = [teacherId];
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (class_name) {
      query += ' AND a.class_name = ?';
      params.push(class_name);
    }
    
    query += ' ORDER BY a.due_date DESC';
    
    const [assignments] = await pool.execute(query, params);
    
    res.json({ success: true, assignments, total: assignments.length });
  } catch (error) {
    console.error('Assignments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new assignment
router.post('/assignments', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { title, description, class_name, subject, total_marks, due_date, instructions, work_type } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO assignments (title, description, teacher_id, class_name, subject, total_marks, due_date, instructions, work_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [title, description, teacherId, class_name, subject, total_marks || 100, due_date, instructions, work_type || 'assignment']
    );
    
    res.status(201).json({ success: true, id: result.insertId, message: 'Assignment created successfully' });
  } catch (error) {
    console.error('Create Assignment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assignment submissions
router.get('/assignments/:assignmentId/submissions', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    const [assignment] = await pool.execute(
      'SELECT * FROM assignments WHERE id = ? AND teacher_id = ?', 
      [req.params.assignmentId, teacherId]
    );
    
    if (!assignment[0]) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    const [submissions] = await pool.execute(`
      SELECT ast.*, u.first_name, u.last_name, u.student_code
      FROM assignment_submissions ast
      JOIN users u ON ast.student_id = u.id
      WHERE ast.assignment_id = ?
      ORDER BY ast.submitted_at DESC
    `, [req.params.assignmentId]);
    
    res.json({ success: true, assignment: assignment[0], submissions, total: submissions.length });
  } catch (error) {
    console.error('Assignment Submissions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Grade assignment submission
router.put('/assignments/:assignmentId/submissions/:submissionId', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { marks_obtained, feedback, status } = req.body;
    
    // Verify ownership
    const [assignment] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?', 
      [req.params.assignmentId, teacherId]
    );
    
    if (!assignment[0]) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    await pool.execute(
      'UPDATE assignment_submissions SET marks_obtained = ?, feedback = ?, status = ?, graded_by = ?, graded_at = NOW() WHERE id = ?',
      [marks_obtained, feedback, status || 'graded', teacherId, req.params.submissionId]
    );
    
    res.json({ success: true, message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Grade Submission Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TIMETABLE
// ============================================

// Get teacher's timetable
router.get('/timetable', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    const [timetable] = await pool.execute(`
      SELECT * FROM teacher_timetable 
      WHERE teacher_id = ?
      ORDER BY day_of_week, period_number
    `, [teacherId]);
    
    res.json({ success: true, timetable, total: timetable.length });
  } catch (error) {
    console.error('Timetable Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STATISTICS & ANALYTICS
// ============================================

// Get comprehensive statistics
router.get('/statistics', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    // Students count
    const [studentStats] = await pool.execute(`
      SELECT COUNT(DISTINCT gs.student_id) as total
      FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
    `, [teacherId]);
    
    // Attendance rate
    const [attendanceStats] = await pool.execute(`
      SELECT 
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as attendance_rate
      FROM student_attendance_records
      WHERE class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `, [teacherId]);
    
    // Quiz completion
    const [quizStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_quizzes,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_quizzes,
        (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE teacher_id = ?)) as total_attempts
      FROM quizzes WHERE teacher_id = ?
    `, [teacherId, teacherId]);
    
    // Assignment completion
    const [assignmentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_assignments,
        (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE teacher_id = ?)) as total_submissions
      FROM assignments WHERE teacher_id = ?
    `, [teacherId, teacherId]);
    
    // Conduct incidents
    const [conductStats] = await pool.execute(`
      SELECT COUNT(*) as incidents
      FROM student_conduct_records
      WHERE class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `, [teacherId]);
    
    res.json({
      success: true,
      statistics: {
        students: studentStats[0].total,
        attendance_rate: attendanceStats[0].attendance_rate || 0,
        quizzes: {
          total: quizStats[0].total_quizzes,
          active: quizStats[0].active_quizzes,
          attempts: quizStats[0].total_attempts
        },
        assignments: {
          total: assignmentStats[0].total_assignments,
          submissions: assignmentStats[0].total_submissions
        },
        conduct_incidents: conductStats[0].incidents
      }
    });
  } catch (error) {
    console.error('Statistics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PROFILE
// ============================================

// Get teacher profile
router.get('/profile', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    const [teacher] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, role, photo_url FROM users WHERE id = ?', 
      [teacherId]
    );
    
    if (!teacher[0]) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    // Get assigned classes count
    const [classCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM teacher_class_assignments WHERE teacher_id = ? AND status = "active"',
      [teacherId]
    );
    
    res.json({ 
      success: true, 
      profile: { ...teacher[0], assigned_classes: classCount[0].count } 
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update teacher profile
router.put('/profile', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { first_name, last_name, phone, photo_url } = req.body;
    
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, photo_url = ? WHERE id = ?',
      [first_name, last_name, phone, photo_url, teacherId]
    );
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADVANCED ANALYTICS & REPORTS
// ============================================

// Get comprehensive analytics
router.get('/analytics', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { period = '30' } = req.query;
    
    // Student performance analytics
    const [performanceAnalytics] = await pool.execute(`
      SELECT 
        gs.class_name,
        COUNT(*) as total_students,
        ROUND(AVG(gs.gpa), 2) as avg_gpa,
        MIN(gs.gpa) as min_gpa,
        MAX(gs.gpa) as max_gpa,
        COUNT(CASE WHEN gs.gpa >= 3.5 THEN 1 END) as excellent_students,
        COUNT(CASE WHEN gs.gpa >= 2.5 AND gs.gpa < 3.5 THEN 1 END) as good_students,
        COUNT(CASE WHEN gs.gpa >= 1.5 AND gs.gpa < 2.5 THEN 1 END) as average_students,
        COUNT(CASE WHEN gs.gpa < 1.5 THEN 1 END) as struggling_students
      FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
      GROUP BY gs.class_name
    `, [teacherId]);
    
    // Attendance trends
    const [attendanceTrends] = await pool.execute(`
      SELECT 
        DATE(attendance_date) as date,
        COUNT(DISTINCT student_id) as total_students,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late
      FROM student_attendance_records
      WHERE teacher_id = ?
        AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(attendance_date)
      ORDER BY date
    `, [teacherId, period]);
    
    // Conduct analytics
    const [conductAnalytics] = await pool.execute(`
      SELECT 
        incident_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity
      FROM student_conduct_records
      WHERE class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      )
      GROUP BY incident_type
    `, [teacherId]);
    
    // Quiz performance analytics
    const [quizAnalytics] = await pool.execute(`
      SELECT 
        q.id,
        q.title,
        q.total_marks,
        COUNT(qs.id) as submissions,
        ROUND(AVG(qs.score), 2) as avg_score,
        MIN(qs.score) as min_score,
        MAX(qs.score) as max_score
      FROM quizzes q
      LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id
      WHERE q.teacher_id = ?
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT 10
    `, [teacherId]);
    
    // Top performing students
    const [topStudents] = await pool.execute(`
      SELECT 
        gs.student_id,
        gs.first_name,
        gs.last_name,
        gs.class_name,
        gs.gpa,
        gs.attendance_percentage
      FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
      ORDER BY gs.gpa DESC
      LIMIT 10
    `, [teacherId]);
    
    // Students needing attention (low attendance or grades)
    const [needsAttention] = await pool.execute(`
      SELECT 
        gs.student_id,
        gs.first_name,
        gs.last_name,
        gs.class_name,
        gs.gpa,
        gs.attendance_percentage
      FROM global_student_sheets gs
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      ) AND gs.status = 'active'
        AND (gs.gpa < 2.0 OR gs.attendance_percentage < 75)
      ORDER BY gs.gpa ASC, gs.attendance_percentage ASC
      LIMIT 20
    `, [teacherId]);
    
    res.json({
      success: true,
      analytics: {
        performance: performanceAnalytics,
        attendance_trends: attendanceTrends,
        conduct: conductAnalytics,
        quizzes: quizAnalytics,
        top_students: topStudents,
        needs_attention: needsAttention
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate reports
router.get('/reports', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { type = 'summary', class_name, start_date, end_date } = req.query;
    
    let reportData = {};
    
    switch (type) {
      case 'attendance':
        const [attendanceReport] = await pool.execute(`
          SELECT 
            sar.attendance_date,
            sar.student_id,
            gs.first_name,
            gs.last_name,
            gs.class_name,
            sar.status,
            sar.remarks
          FROM student_attendance_records sar
          JOIN global_student_sheets gs ON sar.student_id = gs.student_id
          WHERE sar.teacher_id = ?
            AND sar.class_name = IFNULL(?, sar.class_name)
            AND sar.attendance_date BETWEEN IFNULL(?, '2000-01-01') AND IFNULL(?, CURDATE())
          ORDER BY sar.attendance_date DESC, gs.last_name
          LIMIT 500
        `, [teacherId, class_name, start_date, end_date]);
        reportData = { attendance: attendanceReport };
        break;
        
      case 'grades':
        const [gradesReport] = await pool.execute(`
          SELECT 
            gs.student_id,
            gs.first_name,
            gs.last_name,
            gs.class_name,
            gs.gpa,
            gs.attendance_percentage
          FROM global_student_sheets gs
          WHERE gs.class_name = IFNULL(?, gs.class_name)
            AND gs.status = 'active'
          ORDER BY gs.gpa DESC
          LIMIT 500
        `, [class_name]);
        reportData = { grades: gradesReport };
        break;
        
      case 'conduct':
        const [conductReport] = await pool.execute(`
          SELECT 
            scr.*,
            gs.first_name,
            gs.last_name
          FROM student_conduct_records scr
          LEFT JOIN global_student_sheets gs ON scr.student_id = gs.student_id
          WHERE scr.class_name = IFNULL(?, scr.class_name)
            AND scr.incident_date BETWEEN IFNULL(?, '2000-01-01') AND IFNULL(?, CURDATE())
          ORDER BY scr.incident_date DESC
          LIMIT 500
        `, [class_name, start_date, end_date]);
        reportData = { conduct: conductReport };
        break;
        
      case 'summary':
      default:
        const [summaryReport] = await pool.execute(`
          SELECT 
            gs.class_name,
            COUNT(*) as student_count,
            ROUND(AVG(gs.gpa), 2) as avg_gpa,
            ROUND(AVG(gs.attendance_percentage), 1) as avg_attendance,
            COUNT(CASE WHEN gs.gpa >= 3.0 THEN 1 END) as passing
          FROM global_student_sheets gs
          WHERE gs.class_name IN (
            SELECT tc.name FROM trade_classes tc
            JOIN teacher_class_assignments tca ON tc.id = tca.class_id
            WHERE tca.teacher_id = ?
          ) AND gs.status = 'active'
          GROUP BY gs.class_name
        `, [teacherId]);
        reportData = { summary: summaryReport };
    }
    
    res.json({ success: true, report: reportData, type, generated_at: new Date() });
  } catch (error) {
    console.error('Reports Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PARENT COMMUNICATION
// ============================================

// Get parent contacts for students
router.get('/parents', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { student_id, class_name } = req.query;
    
    let query = `
      SELECT DISTINCT 
        p.id as parent_id,
        p.first_name as parent_first_name,
        p.last_name as parent_last_name,
        p.phone as parent_phone,
        p.email as parent_email,
        gs.student_id,
        gs.first_name as student_first_name,
        gs.last_name as student_last_name,
        gs.class_name
      FROM parent_student_links psl
      JOIN parents p ON psl.parent_id = p.id
      JOIN global_student_sheets gs ON psl.student_id = gs.student_id
      WHERE gs.class_name IN (
        SELECT tc.name FROM trade_classes tc
        JOIN teacher_class_assignments tca ON tc.id = tca.class_id
        WHERE tca.teacher_id = ? AND tca.status = 'active'
      )
    `;
    const params = [teacherId];
    
    if (student_id) {
      query += ' AND gs.student_id = ?';
      params.push(student_id);
    }
    if (class_name) {
      query += ' AND gs.class_name = ?';
      params.push(class_name);
    }
    
    query += ' ORDER BY gs.class_name, gs.last_name LIMIT 200';
    
    const [parents] = await pool.execute(query, params);
    
    res.json({ success: true, parents, total: parents.length });
  } catch (error) {
    console.error('Parents Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message to parent
router.post('/parents/message', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { parent_id, student_id, subject, message, priority = 'normal' } = req.body;
    
    // Store message in database
    const [result] = await pool.execute(`
      INSERT INTO teacher_parent_messages (teacher_id, parent_id, student_id, subject, message, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, 'sent')
    `, [teacherId, parent_id, student_id, subject, message, priority]);
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      message_id: result.insertId 
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// LESSON PLANS
// ============================================

// Get lesson plans
router.get('/lesson-plans', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { class_id, week_start } = req.query;
    
    let query = 'SELECT * FROM lesson_plans WHERE teacher_id = ?';
    const params = [teacherId];
    
    if (class_id) {
      query += ' AND class_id = ?';
      params.push(class_id);
    }
    if (week_start) {
      query += ' AND week_start = ?';
      params.push(week_start);
    }
    
    query += ' ORDER BY week_start DESC, class_id LIMIT 50';
    
    const [lessonPlans] = await pool.execute(query, params);
    
    res.json({ success: true, lesson_plans: lessonPlans });
  } catch (error) {
    console.error('Lesson Plans Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create lesson plan
router.post('/lesson-plans', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { class_id, week_start, subject, topics, objectives, activities, materials, notes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO lesson_plans (teacher_id, class_id, week_start, subject, topics, objectives, activities, materials, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `, [teacherId, class_id, week_start, subject, JSON.stringify(topics), JSON.stringify(objectives), JSON.stringify(activities), JSON.stringify(materials), notes]);
    
    res.json({ 
      success: true, 
      message: 'Lesson plan created successfully',
      plan_id: result.insertId 
    });
  } catch (error) {
    console.error('Create Lesson Plan Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// EXPORT DATA
// ============================================

// Export data to CSV
router.get('/export', authenticateToken, requireRole(...TEACHER_ROLES), async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    const { type = 'students', class_name, format = 'csv' } = req.query;
    
    let data = [];
    let headers = [];
    
    switch (type) {
      case 'students':
        const [students] = await pool.execute(`
          SELECT student_id, first_name, last_name, class_name, trade_code, gpa, attendance_percentage
          FROM global_student_sheets
          WHERE class_name = IFNULL(?, class_name)
            AND status = 'active'
          ORDER BY class_name, last_name
        `, [class_name]);
        data = students;
        headers = ['ID', 'First Name', 'Last Name', 'Class', 'Trade', 'GPA', 'Attendance %'];
        break;
        
      case 'attendance':
        const [attendance] = await pool.execute(`
          SELECT student_id, class_name, attendance_date, status, remarks
          FROM student_attendance_records
          WHERE teacher_id = ?
          ORDER BY attendance_date DESC
          LIMIT 1000
        `, [teacherId]);
        data = attendance;
        headers = ['Student ID', 'Class', 'Date', 'Status', 'Remarks'];
        break;
        
      default:
        data = [];
        headers = [];
    }
    
    if (format === 'csv') {
      const csv = [
        headers.join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
      res.send(csv);
    } else {
      res.json({ success: true, data, headers });
    }
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
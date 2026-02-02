const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ULTRA-COMPREHENSIVE DIRECTOR OF STUDIES (DOS) PORTAL
 * Curriculum management, academic planning, performance monitoring
 * Teacher oversight, course scheduling, examination coordination
 */

// ============================================
// DOS DASHBOARD
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [academicOverview] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT student_id) as total_students,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as honors_students,
        COUNT(CASE WHEN gpa < 2.0 THEN 1 END) as at_risk_students
      FROM global_student_sheets
      WHERE status = 'active'
    `);
    
    const [tradePerformance] = await pool.execute(`
      SELECT 
        trade_name,
        trade_code,
        COUNT(*) as student_count,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as top_performers
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_name, trade_code
      ORDER BY avg_gpa DESC
    `);
    
    const [levelPerformance] = await pool.execute(`
      SELECT 
        level_number,
        COUNT(*) as student_count,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY level_number
      ORDER BY level_number
    `);
    
    const [teacherStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as total_teachers,
        COUNT(DISTINCT tca.class_id) as classes_assigned
      FROM users u
      LEFT JOIN teacher_class_assignments tca ON u.id = tca.teacher_id AND tca.status = 'active'
      WHERE u.role = 'teacher' AND u.status = 'active'
    `);
    
    const [upcomingExams] = await pool.execute(`
      SELECT * FROM exams 
      WHERE exam_date >= CURDATE() AND status = 'scheduled'
      ORDER BY exam_date, start_time
      LIMIT 10
    `);
    
    const [activeAssignments] = await pool.execute(`
      SELECT COUNT(*) as count FROM assignments 
      WHERE status = 'active' AND due_date >= CURDATE()
    `);
    
    const [curriculumProgress] = await pool.execute(`
      SELECT 
        tc.name as class_name,
        tc.level_number,
        t.name as trade_name,
        COUNT(DISTINCT tcp.topic_id) as topics_covered,
        AVG(tcp.completion_percentage) as avg_completion
      FROM trade_classes tc
      JOIN trades t ON tc.trade_id = t.id
      LEFT JOIN teacher_curriculum_progress tcp ON tc.id = tcp.class_id
      GROUP BY tc.id, tc.name, tc.level_number, t.name
      ORDER BY avg_completion ASC
    `);
    
    res.json({
      success: true,
      dashboard: {
        academic_overview: academicOverview[0],
        trade_performance: tradePerformance,
        level_performance: levelPerformance,
        teacher_stats: teacherStats[0],
        upcoming_exams: upcomingExams,
        active_assignments: activeAssignments[0].count,
        curriculum_progress: curriculumProgress
      }
    });
  } catch (error) {
    console.error('DOS Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CURRICULUM MANAGEMENT
// ============================================
router.get('/curriculum/overview', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster', 'teacher']), async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;
    
    let query = `
      SELECT c.*, t.name as trade_name, l.name as level_name
      FROM curriculum c
      JOIN trades t ON c.trade_id = t.id
      LEFT JOIN levels l ON c.level_id = l.id
      WHERE 1=1
    `;
    const params = [];
    
    if (trade_code) { 
      query += ' AND t.code = ?'; 
      params.push(trade_code); 
    }
    if (level_number) { 
      query += ' AND l.level_number = ?'; 
      params.push(level_number); 
    }
    
    query += ' ORDER BY t.name, l.level_number, c.subject_name';
    
    const [curriculum] = await pool.execute(query, params);
    
    res.json({ success: true, curriculum, total: curriculum.length });
  } catch (error) {
    console.error('Curriculum Overview Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/curriculum/create', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const { trade_id, level_id, subject_name, subject_code, description, topics, learning_outcomes, assessment_methods, resources } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO curriculum 
      (trade_id, level_id, subject_name, subject_code, description, topics, learning_outcomes, assessment_methods, resources, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [trade_id, level_id, subject_name, subject_code, description, JSON.stringify(topics), learning_outcomes, assessment_methods, resources, req.user.userId]);
    
    res.json({ success: true, message: 'Curriculum created successfully', curriculum_id: result.insertId });
  } catch (error) {
    console.error('Create Curriculum Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/curriculum/:curriculumId', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const { subject_name, description, topics, learning_outcomes, assessment_methods, resources } = req.body;
    
    await pool.execute(`
      UPDATE curriculum 
      SET subject_name = ?, description = ?, topics = ?, learning_outcomes = ?, assessment_methods = ?, resources = ?, updated_at = NOW()
      WHERE id = ?
    `, [subject_name, description, JSON.stringify(topics), learning_outcomes, assessment_methods, resources, req.params.curriculumId]);
    
    res.json({ success: true, message: 'Curriculum updated successfully' });
  } catch (error) {
    console.error('Update Curriculum Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ACADEMIC PERFORMANCE MONITORING
// ============================================
router.get('/performance/by-trade', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { academic_year, term } = req.query;
    
    let query = `
      SELECT 
        gs.trade_name,
        gs.trade_code,
        gs.level_number,
        COUNT(DISTINCT gs.student_id) as student_count,
        AVG(ssp.percentage) as avg_percentage,
        AVG(ssp.grade_points) as avg_gpa,
        COUNT(CASE WHEN ssp.grade = 'A' THEN 1 END) as grade_a_count,
        COUNT(CASE WHEN ssp.grade = 'F' THEN 1 END) as grade_f_count
      FROM global_student_sheets gs
      LEFT JOIN student_subject_performance ssp ON gs.student_id = ssp.student_id
      WHERE gs.status = 'active'
    `;
    const params = [];
    
    if (academic_year) { query += ' AND ssp.academic_year = ?'; params.push(academic_year); }
    if (term) { query += ' AND ssp.term = ?'; params.push(term); }
    
    query += ' GROUP BY gs.trade_name, gs.trade_code, gs.level_number ORDER BY gs.trade_code, gs.level_number';
    
    const [performance] = await pool.execute(query, params);
    
    res.json({ success: true, performance, total: performance.length });
  } catch (error) {
    console.error('Performance By Trade Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/performance/by-subject', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, academic_year, term } = req.query;
    
    let query = `
      SELECT 
        ssp.subject_name,
        ssp.subject_code,
        COUNT(DISTINCT ssp.student_id) as student_count,
        AVG(ssp.percentage) as avg_percentage,
        AVG(ssp.grade_points) as avg_gpa,
        COUNT(CASE WHEN ssp.grade = 'A' THEN 1 END) as grade_a_count,
        COUNT(CASE WHEN ssp.grade = 'B' THEN 1 END) as grade_b_count,
        COUNT(CASE WHEN ssp.grade = 'C' THEN 1 END) as grade_c_count,
        COUNT(CASE WHEN ssp.grade = 'D' THEN 1 END) as grade_d_count,
        COUNT(CASE WHEN ssp.grade = 'F' THEN 1 END) as grade_f_count
      FROM student_subject_performance ssp
      JOIN global_student_sheets gs ON ssp.student_id = gs.student_id
      WHERE gs.status = 'active'
    `;
    const params = [];
    
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    if (academic_year) { query += ' AND ssp.academic_year = ?'; params.push(academic_year); }
    if (term) { query += ' AND ssp.term = ?'; params.push(term); }
    
    query += ' GROUP BY ssp.subject_name, ssp.subject_code ORDER BY avg_percentage DESC';
    
    const [performance] = await pool.execute(query, params);
    
    res.json({ success: true, subject_performance: performance, total: performance.length });
  } catch (error) {
    console.error('Performance By Subject Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/performance/top-performers', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, limit = 50 } = req.query;
    
    let query = `
      SELECT gs.*, 
        RANK() OVER (PARTITION BY gs.trade_code, gs.level_number ORDER BY gs.gpa DESC) as rank_in_class
      FROM global_student_sheets gs
      WHERE gs.status = 'active' AND gs.gpa IS NOT NULL
    `;
    const params = [];
    
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    
    query += ` ORDER BY gs.gpa DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [topPerformers] = await pool.execute(query, params);
    
    res.json({ success: true, top_performers: topPerformers, total: topPerformers.length });
  } catch (error) {
    console.error('Top Performers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TEACHER OVERSIGHT
// ============================================
router.get('/teachers/performance', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT tca.class_id) as classes_assigned,
        COUNT(DISTINCT a.id) as assignments_created,
        AVG(gs.gpa) as avg_student_gpa,
        AVG(gs.attendance_percentage) as avg_student_attendance
      FROM users u
      LEFT JOIN teacher_class_assignments tca ON u.id = tca.teacher_id AND tca.status = 'active'
      LEFT JOIN assignments a ON u.id = a.teacher_id
      LEFT JOIN global_student_sheets gs ON gs.class_name IN (
        SELECT tc.name FROM trade_classes tc WHERE tc.id IN (
          SELECT class_id FROM teacher_class_assignments WHERE teacher_id = u.id AND status = 'active'
        )
      )
      WHERE u.role = 'teacher' AND u.status = 'active'
      GROUP BY u.id, u.name, u.email
      ORDER BY avg_student_gpa DESC
    `);
    
    res.json({ success: true, teachers, total: teachers.length });
  } catch (error) {
    console.error('Teacher Performance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teachers/:teacherId/classes', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT tc.*, t.name as trade_name, tca.subject
      FROM teacher_class_assignments tca
      JOIN trade_classes tc ON tca.class_id = tc.id
      JOIN trades t ON tc.trade_id = t.id
      WHERE tca.teacher_id = ? AND tca.status = 'active'
      ORDER BY tc.level_number, tc.name
    `, [req.params.teacherId]);
    
    res.json({ success: true, classes, total: classes.length });
  } catch (error) {
    console.error('Teacher Classes Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// EXAMINATION COORDINATION
// ============================================
router.get('/exams/schedule', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster', 'teacher']), async (req, res) => {
  try {
    const { academic_year, term, exam_type } = req.query;
    
    let query = 'SELECT * FROM exams WHERE 1=1';
    const params = [];
    
    if (academic_year) { query += ' AND academic_year = ?'; params.push(academic_year); }
    if (term) { query += ' AND term = ?'; params.push(term); }
    if (exam_type) { query += ' AND exam_type = ?'; params.push(exam_type); }
    
    query += ' ORDER BY exam_date, start_time';
    
    const [exams] = await pool.execute(query, params);
    
    res.json({ success: true, exams, total: exams.length });
  } catch (error) {
    console.error('Exam Schedule Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/exams/schedule', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const { exam_name, exam_type, subject_name, subject_code, trade_code, level_number, exam_date, start_time, end_time, venue, total_marks, academic_year, term, instructions } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO exams 
      (exam_name, exam_type, subject_name, subject_code, trade_code, level_number, exam_date, start_time, end_time, venue, total_marks, academic_year, term, instructions, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)
    `, [exam_name, exam_type, subject_name, subject_code, trade_code, level_number, exam_date, start_time, end_time, venue, total_marks, academic_year, term, instructions, req.user.userId]);
    
    const [students] = await pool.execute(`
      SELECT student_id FROM global_student_sheets 
      WHERE trade_code = ? AND level_number = ? AND status = 'active'
    `, [trade_code, level_number]);
    
    for (const student of students) {
      await pool.execute(`
        INSERT INTO student_notifications (student_id, title, message, type, priority)
        VALUES (?, 'Exam Scheduled', ?, 'exam', 'high')
      `, [student.student_id, `${exam_name} has been scheduled for ${exam_date} at ${start_time} in ${venue}`]);
    }
    
    res.json({ success: true, message: 'Exam scheduled successfully', exam_id: result.insertId });
  } catch (error) {
    console.error('Schedule Exam Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ANALYTICS & REPORTS
// ============================================
router.get('/analytics/academic-trends', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [termlyPerformance] = await pool.execute(`
      SELECT 
        academic_year,
        term,
        AVG(percentage) as avg_percentage,
        AVG(grade_points) as avg_gpa,
        COUNT(DISTINCT student_id) as student_count
      FROM student_subject_performance
      GROUP BY academic_year, term
      ORDER BY academic_year DESC, term DESC
      LIMIT 10
    `);
    
    const [passRates] = await pool.execute(`
      SELECT 
        academic_year,
        term,
        subject_name,
        COUNT(*) as total_students,
        COUNT(CASE WHEN grade != 'F' THEN 1 END) as passed,
        ROUND((COUNT(CASE WHEN grade != 'F' THEN 1 END) / COUNT(*)) * 100, 2) as pass_rate
      FROM student_subject_performance
      GROUP BY academic_year, term, subject_name
      ORDER BY academic_year DESC, term DESC, pass_rate ASC
    `);
    
    res.json({
      success: true,
      analytics: {
        termly_performance: termlyPerformance,
        pass_rates: passRates
      }
    });
  } catch (error) {
    console.error('Academic Trends Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT ENROLLMENT TO GLOBAL SHEETS (BDC, SOD, AUT ONLY)
// ============================================
router.post('/students/enroll', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year, student_code, admission_date } = req.body;
    
    const allowedTrades = ['BDC', 'SOD', 'AUT'];
    if (!allowedTrades.includes(trade_code)) {
      return res.status(403).json({
        success: false,
        message: `DOS can only enroll students to BDC, SOD, or AUT trades. Trade code '${trade_code}' is not allowed.`
      });
    }
    
    const [existingStudent] = await pool.execute(
      'SELECT id FROM global_student_sheets WHERE student_code = ? OR (first_name = ? AND last_name = ? AND date_of_birth = ?)',
      [student_code, first_name, last_name, date_of_birth]
    );
    
    if (existingStudent[0]) {
      return res.status(400).json({ success: false, message: 'Student already exists in the system' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO global_student_sheets 
      (student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
       trade_code, trade_name, level_number, level_suffix, class_name, academic_year, 
       status, admission_date, created_by, created_by_name, created_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `, [student_code, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
        trade_code, trade_name, level_number, level_suffix, class_name, academic_year, 
        admission_date || new Date(), req.user.userId, req.user.name, req.user.role]);
    
    await pool.execute(`
      INSERT INTO student_conduct_tracking 
      (sheet_id, student_id, conduct_score, conduct_grade)
      VALUES (?, ?, 100, 'A')
    `, [result.insertId, student_code]);
    
    await pool.execute(`
      INSERT INTO system_activity_log 
      (user_id, user_name, action, details, created_at)
      VALUES (?, ?, 'student_enrolled_by_dos', ?, NOW())
    `, [req.user.userId, req.user.name, JSON.stringify({
      student_code: student_code,
      name: `${first_name} ${last_name}`,
      trade: trade_name,
      level: level_number
    })]);
    
    res.json({
      success: true,
      message: 'Student enrolled successfully',
      student_id: result.insertId,
      student_code: student_code
    });
  } catch (error) {
    console.error('DOS Student Enrollment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/students/bulk-enroll', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { students } = req.body;
    const allowedTrades = ['BDC', 'SOD', 'AUT'];
    
    const results = {
      enrolled: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    for (const student of students) {
      const { first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year, student_code } = student;
      
      if (!allowedTrades.includes(trade_code)) {
        results.skipped++;
        results.details.push({
          student_code: student_code,
          name: `${first_name} ${last_name}`,
          status: 'skipped',
          reason: `Trade ${trade_code} not allowed for DOS`
        });
        continue;
      }
      
      try {
        const [existing] = await pool.execute(
          'SELECT id FROM global_student_sheets WHERE student_code = ?',
          [student_code]
        );
        
        if (existing[0]) {
          results.failed++;
          results.details.push({
            student_code: student_code,
            name: `${first_name} ${last_name}`,
            status: 'failed',
            reason: 'Student code already exists'
          });
          continue;
        }
        
        const [result] = await pool.execute(`
          INSERT INTO global_student_sheets 
          (student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
           trade_code, trade_name, level_number, level_suffix, class_name, academic_year, 
           status, created_by, created_by_name, created_by_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
        `, [student_code, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
            trade_code, trade_name, level_number, level_suffix, class_name, academic_year, 
            req.user.userId, req.user.name, req.user.role]);
        
        await pool.execute(`
          INSERT INTO student_conduct_tracking 
          (sheet_id, student_id, conduct_score, conduct_grade)
          VALUES (?, ?, 100, 'A')
        `, [result.insertId, student_code]);
        
        results.enrolled++;
        results.details.push({
          student_code: student_code,
          name: `${first_name} ${last_name}`,
          trade: trade_code,
          status: 'enrolled',
          id: result.insertId
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          student_code: student_code,
          name: `${first_name} ${last_name}`,
          status: 'failed',
          reason: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `${results.enrolled} students enrolled, ${results.failed} failed, ${results.skipped} skipped (not allowed trades)`,
      results
    });
  } catch (error) {
    console.error('DOS Bulk Student Enrollment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/trades/allowed', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const allowedTrades = ['BDC', 'SOD', 'AUT'];
    
    const [trades] = await pool.execute(`
      SELECT * FROM trades WHERE code IN (?, ?, ?)
    `, allowedTrades);
    
    res.json({
      success: true,
      allowed_trades: trades,
      message: 'DOS can only enroll students to these trades'
    });
  } catch (error) {
    console.error('Allowed Trades Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TEACHER ASSIGNMENT TO LEVELS/TRADES
// ============================================
router.get('/teachers/all', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.status,
        COUNT(DISTINCT tca.id) as assignments_count
      FROM users u
      LEFT JOIN dos_teacher_class_assignments tca ON u.id = tca.teacher_id AND tca.is_active = TRUE
      WHERE u.role = 'teacher' AND u.status = 'active'
      GROUP BY u.id
      ORDER BY u.last_name, u.first_name
    `);
    
    res.json({ success: true, teachers, total: teachers.length });
  } catch (error) {
    console.error('Get All Teachers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/teachers/assign-to-class', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const { teacher_id, trade_code, level_number, class_name, role, academic_year } = req.body;
    
    const [teacher] = await pool.execute(`
      SELECT id, CONCAT(first_name, ' ', last_name) as name FROM users WHERE id = ? AND role = 'teacher'
    `, [teacher_id]);
    
    if (!teacher[0]) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    const [existing] = await pool.execute(`
      SELECT id FROM dos_teacher_class_assignments 
      WHERE teacher_id = ? AND trade_code = ? AND level_number = ? AND is_active = TRUE
    `, [teacher_id, trade_code, level_number]);
    
    if (existing[0]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher is already assigned to this class' 
      });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO dos_teacher_class_assignments 
      (teacher_id, teacher_name, trade_code, level_number, class_name, role, academic_year, assigned_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [teacher_id, teacher[0].name, trade_code, level_number, class_name, role || 'subject_teacher', 
        academic_year || new Date().getFullYear(), req.user.userId]);
    
    await pool.execute(`
      INSERT INTO system_activity_log 
      (user_id, user_name, action, details, created_at)
      VALUES (?, ?, 'teacher_assigned_to_class', ?, NOW())
    `, [req.user.userId, req.user.name, JSON.stringify({
      teacher: teacher[0].name,
      trade_code,
      level_number,
      class_name
    })]);
    
    res.json({ 
      success: true, 
      message: 'Teacher assigned successfully', 
      assignment_id: result.insertId 
    });
  } catch (error) {
    console.error('Assign Teacher Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teachers/assignments/:teacherId', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [assignments] = await pool.execute(`
      SELECT tca.*, 
        (SELECT COUNT(*) FROM global_student_sheets 
         WHERE trade_code = tca.trade_code AND level_number = tca.level_number AND status = 'active') as student_count
      FROM dos_teacher_class_assignments tca
      WHERE tca.teacher_id = ? AND tca.is_active = TRUE
      ORDER BY tca.academic_year DESC, tca.trade_code, tca.level_number
    `, [req.params.teacherId]);
    
    res.json({ success: true, assignments, total: assignments.length });
  } catch (error) {
    console.error('Get Teacher Assignments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/teachers/remove-assignment/:assignmentId', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const [assignment] = await pool.execute(`
      SELECT * FROM dos_teacher_class_assignments WHERE id = ?
    `, [req.params.assignmentId]);
    
    if (!assignment[0]) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    await pool.execute(`
      UPDATE dos_teacher_class_assignments 
      SET is_active = FALSE 
      WHERE id = ?
    `, [req.params.assignmentId]);
    
    await pool.execute(`
      INSERT INTO system_activity_log 
      (user_id, user_name, action, details, created_at)
      VALUES (?, ?, 'teacher_assignment_removed', ?, NOW())
    `, [req.user.userId, req.user.name, JSON.stringify({
      teacher: assignment[0].teacher_name,
      trade_code: assignment[0].trade_code,
      level_number: assignment[0].level_number
    })]);
    
    res.json({ success: true, message: 'Teacher assignment removed successfully' });
  } catch (error) {
    console.error('Remove Teacher Assignment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/classes/overview', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;
    
    let query = `
      SELECT 
        gs.trade_code,
        gs.trade_name,
        gs.level_number,
        gs.class_name,
        COUNT(DISTINCT gs.student_id) as student_count,
        AVG(gs.gpa) as avg_gpa,
        COUNT(DISTINCT tca.teacher_id) as teacher_count
      FROM global_student_sheets gs
      LEFT JOIN dos_teacher_class_assignments tca 
        ON gs.trade_code = tca.trade_code AND gs.level_number = tca.level_number AND tca.is_active = TRUE
      WHERE gs.status = 'active'
    `;
    const params = [];
    
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    
    query += ' GROUP BY gs.trade_code, gs.trade_name, gs.level_number, gs.class_name ORDER BY gs.trade_code, gs.level_number';
    
    const [classes] = await pool.execute(query, params);
    
    res.json({ success: true, classes, total: classes.length });
  } catch (error) {
    console.error('Classes Overview Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// COURSE MANAGEMENT FOR TRADES/LEVELS
// ============================================
router.post('/courses/add', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const { 
      trade_code, 
      level_number, 
      course_code, 
      course_name, 
      description, 
      credits, 
      hours_per_week, 
      is_mandatory 
    } = req.body;
    
    const [existingCourse] = await pool.execute(`
      SELECT id FROM trade_courses 
      WHERE course_code = ? AND trade_code = ? AND level_number = ?
    `, [course_code, trade_code, level_number]);
    
    if (existingCourse[0]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course with this code already exists for this trade/level' 
      });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO trade_courses 
      (trade_code, level_number, course_code, course_name, description, credits, hours_per_week, is_mandatory, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [trade_code, level_number, course_code, course_name, description, credits || 3, hours_per_week || 40, is_mandatory || true, req.user.userId]);
    
    await pool.execute(`
      INSERT INTO system_activity_log 
      (user_id, user_name, action, details, created_at)
      VALUES (?, ?, 'course_added', ?, NOW())
    `, [req.user.userId, req.user.name, JSON.stringify({
      course_code,
      course_name,
      trade_code,
      level_number
    })]);
    
    res.json({ 
      success: true, 
      message: 'Course added successfully', 
      course_id: result.insertId 
    });
  } catch (error) {
    console.error('Add Course Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/courses/by-trade-level', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster', 'teacher']), async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;
    
    let query = 'SELECT * FROM trade_courses WHERE 1=1';
    const params = [];
    
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND level_number = ?'; params.push(level_number); }
    
    query += ' ORDER BY trade_code, level_number, course_code';
    
    const [courses] = await pool.execute(query, params);
    
    res.json({ success: true, courses, total: courses.length });
  } catch (error) {
    console.error('Get Courses Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/courses/:courseId', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const { course_name, description, credits, hours_per_week, is_mandatory } = req.body;
    
    await pool.execute(`
      UPDATE trade_courses 
      SET course_name = ?, description = ?, credits = ?, hours_per_week = ?, is_mandatory = ?, updated_at = NOW()
      WHERE id = ?
    `, [course_name, description, credits, hours_per_week, is_mandatory, req.params.courseId]);
    
    res.json({ success: true, message: 'Course updated successfully' });
  } catch (error) {
    console.error('Update Course Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/courses/:courseId', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    await pool.execute(`
      DELETE FROM trade_courses WHERE id = ?
    `, [req.params.courseId]);
    
    res.json({ success: true, message: 'Course removed successfully' });
  } catch (error) {
    console.error('Remove Course Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// AUTO-CALCULATE GRADES & AUTO-RANKING
// ============================================
router.post('/grades/auto-calculate', authenticateToken, requireRole(['dos', 'patron', 'matron', 'teacher']), async (req, res) => {
  try {
    const { trade_code, level_number, academic_year, term } = req.body;
    
    const [students] = await pool.execute(`
      SELECT DISTINCT ssp.student_id
      FROM student_subject_performance ssp
      JOIN global_student_sheets gs ON ssp.student_id = gs.student_id
      WHERE gs.trade_code = ? AND gs.level_number = ? 
        AND ssp.academic_year = ? AND ssp.term = ?
        AND gs.status = 'active'
    `, [trade_code, level_number, academic_year, term]);
    
    let updated = 0;
    
    for (const student of students) {
      const [subjects] = await pool.execute(`
        SELECT * FROM student_subject_performance 
        WHERE student_id = ? AND academic_year = ? AND term = ?
      `, [student.student_id, academic_year, term]);
      
      let totalGradePoints = 0;
      let totalSubjects = subjects.length;
      
      for (const subject of subjects) {
        const totalMarks = parseFloat(subject.quiz_marks || 0) + parseFloat(subject.midterm_marks || 0) + parseFloat(subject.final_marks || 0);
        const maxMarks = parseFloat(subject.quiz_max || 20) + parseFloat(subject.midterm_max || 30) + parseFloat(subject.final_max || 50);
        const percentage = (totalMarks / maxMarks) * 100;
        
        let grade, gradePoints;
        if (percentage >= 90) { grade = 'A'; gradePoints = 4.0; }
        else if (percentage >= 80) { grade = 'B'; gradePoints = 3.0; }
        else if (percentage >= 70) { grade = 'C'; gradePoints = 2.0; }
        else if (percentage >= 60) { grade = 'D'; gradePoints = 1.0; }
        else { grade = 'F'; gradePoints = 0.0; }
        
        await pool.execute(`
          UPDATE student_subject_performance 
          SET total_marks = ?, percentage = ?, grade = ?, grade_points = ?, updated_at = NOW()
          WHERE id = ?
        `, [totalMarks, percentage.toFixed(2), grade, gradePoints, subject.id]);
        
        totalGradePoints += gradePoints;
      }
      
      const gpa = totalSubjects > 0 ? (totalGradePoints / totalSubjects).toFixed(2) : 0;
      
      await pool.execute(`
        UPDATE global_student_sheets 
        SET gpa = ?, total_subjects = ?, updated_at = NOW()
        WHERE student_id = ?
      `, [gpa, totalSubjects, student.student_id]);
      
      updated++;
    }
    
    res.json({ 
      success: true, 
      message: `Grades calculated for ${updated} students`,
      updated_count: updated
    });
  } catch (error) {
    console.error('Auto Calculate Grades Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/students/auto-rank', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const { trade_code, level_number, academic_year } = req.body;
    
    const [students] = await pool.execute(`
      SELECT 
        id,
        student_id,
        student_code,
        CONCAT(first_name, ' ', last_name) as name,
        gpa,
        RANK() OVER (ORDER BY gpa DESC) as overall_rank
      FROM global_student_sheets
      WHERE trade_code = ? AND level_number = ? AND status = 'active' AND gpa IS NOT NULL
      ORDER BY gpa DESC
    `, [trade_code, level_number]);
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rank = i + 1;
      
      await pool.execute(`
        UPDATE global_student_sheets 
        SET class_rank = ?, updated_at = NOW()
        WHERE id = ?
      `, [rank, student.id]);
    }
    
    res.json({ 
      success: true, 
      message: `Ranked ${students.length} students`,
      rankings: students.map((s, idx) => ({
        rank: idx + 1,
        student_code: s.student_code,
        name: s.name,
        gpa: s.gpa
      }))
    });
  } catch (error) {
    console.error('Auto Rank Students Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// COMPREHENSIVE REPORT GENERATION
// ============================================
router.get('/reports/student-performance', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, academic_year, term } = req.query;
    
    let query = `
      SELECT 
        gs.student_id,
        gs.student_code,
        CONCAT(gs.first_name, ' ', gs.last_name) as student_name,
        gs.trade_code,
        gs.trade_name,
        gs.level_number,
        gs.class_name,
        gs.gpa,
        gs.attendance_percentage,
        gs.conduct_score,
        gs.class_rank,
        COUNT(DISTINCT ssp.id) as subjects_taken,
        AVG(ssp.percentage) as avg_percentage,
        GROUP_CONCAT(CONCAT(ssp.subject_name, ': ', ssp.grade) SEPARATOR ', ') as subject_grades
      FROM global_student_sheets gs
      LEFT JOIN student_subject_performance ssp 
        ON gs.student_id = ssp.student_id 
        AND ssp.academic_year = ? 
        AND ssp.term = ?
      WHERE gs.status = 'active'
    `;
    const params = [academic_year || new Date().getFullYear(), term || 'Term 1'];
    
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    
    query += ' GROUP BY gs.student_id ORDER BY gs.gpa DESC, gs.class_rank ASC';
    
    const [students] = await pool.execute(query, params);
    
    const summary = {
      total_students: students.length,
      avg_gpa: students.reduce((sum, s) => sum + parseFloat(s.gpa || 0), 0) / students.length || 0,
      avg_attendance: students.reduce((sum, s) => sum + parseFloat(s.attendance_percentage || 0), 0) / students.length || 0,
      avg_conduct: students.reduce((sum, s) => sum + parseFloat(s.conduct_score || 0), 0) / students.length || 0,
      top_performer: students[0] || null,
      students_with_honors: students.filter(s => parseFloat(s.gpa) >= 3.5).length,
      students_at_risk: students.filter(s => parseFloat(s.gpa) < 2.0).length
    };
    
    res.json({ 
      success: true, 
      report: {
        summary,
        students,
        generated_at: new Date(),
        generated_by: req.user.name,
        parameters: { trade_code, level_number, academic_year, term }
      }
    });
  } catch (error) {
    console.error('Student Performance Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/subject-analysis', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, academic_year, term } = req.query;
    
    let query = `
      SELECT 
        ssp.subject_code,
        ssp.subject_name,
        COUNT(DISTINCT ssp.student_id) as student_count,
        AVG(ssp.percentage) as avg_percentage,
        AVG(ssp.grade_points) as avg_gpa,
        MIN(ssp.percentage) as min_score,
        MAX(ssp.percentage) as max_score,
        COUNT(CASE WHEN ssp.grade = 'A' THEN 1 END) as grade_a,
        COUNT(CASE WHEN ssp.grade = 'B' THEN 1 END) as grade_b,
        COUNT(CASE WHEN ssp.grade = 'C' THEN 1 END) as grade_c,
        COUNT(CASE WHEN ssp.grade = 'D' THEN 1 END) as grade_d,
        COUNT(CASE WHEN ssp.grade = 'F' THEN 1 END) as grade_f,
        ROUND((COUNT(CASE WHEN ssp.grade != 'F' THEN 1 END) / COUNT(*)) * 100, 2) as pass_rate
      FROM student_subject_performance ssp
      JOIN global_student_sheets gs ON ssp.student_id = gs.student_id
      WHERE gs.status = 'active' AND ssp.academic_year = ? AND ssp.term = ?
    `;
    const params = [academic_year || new Date().getFullYear(), term || 'Term 1'];
    
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    
    query += ' GROUP BY ssp.subject_code, ssp.subject_name ORDER BY avg_percentage DESC';
    
    const [subjects] = await pool.execute(query, params);
    
    res.json({ 
      success: true, 
      subject_analysis: subjects,
      total_subjects: subjects.length
    });
  } catch (error) {
    console.error('Subject Analysis Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// AUTO-TIMETABLE GENERATION (12 hours, 40 minutes)
// ============================================
router.post('/timetable/auto-generate', authenticateToken, requireRole(['dos', 'patron', 'matron']), async (req, res) => {
  try {
    const { 
      trade_code, 
      level_number, 
      academic_year, 
      term, 
      start_time = '08:00:00', 
      days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    } = req.body;
    
    const [courses] = await pool.execute(`
      SELECT * FROM trade_courses 
      WHERE trade_code = ? AND level_number = ? AND is_mandatory = TRUE
      ORDER BY course_code
    `, [trade_code, level_number]);
    
    if (courses.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No courses found for this trade/level' 
      });
    }
    
    const [teachers] = await pool.execute(`
      SELECT DISTINCT teacher_id, teacher_name 
      FROM dos_teacher_class_assignments 
      WHERE trade_code = ? AND level_number = ? AND is_active = TRUE
    `, [trade_code, level_number]);
    
    if (teachers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No teachers assigned to this class. Please assign teachers first.' 
      });
    }
    
    const periodDuration = 40;
    const breakDuration = 20;
    const totalMinutesPerDay = 12 * 60;
    const periodsPerDay = Math.floor(totalMinutesPerDay / (periodDuration + breakDuration));
    
    const [timetableResult] = await pool.execute(`
      INSERT INTO dos_timetables 
      (timetable_name, trade_code, level_number, academic_year, term, status, created_by)
      VALUES (?, ?, ?, ?, ?, 'draft', ?)
    `, [`${trade_code} Level ${level_number} - ${term} ${academic_year}`, 
        trade_code, level_number, academic_year, term, req.user.userId]);
    
    const timetableId = timetableResult.insertId;
    let courseIndex = 0;
    const slots = [];
    
    for (const day of days) {
      let currentTime = start_time;
      
      for (let period = 1; period <= periodsPerDay; period++) {
        if (period === 4) {
          const [hours, minutes] = currentTime.split(':');
          const breakEndMinutes = parseInt(minutes) + breakDuration;
          currentTime = `${hours}:${breakEndMinutes.toString().padStart(2, '0')}:00`;
          continue;
        }
        
        const course = courses[courseIndex % courses.length];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        
        const [hours, minutes] = currentTime.split(':');
        const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const endMinutes = startMinutes + periodDuration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}:00`;
        
        await pool.execute(`
          INSERT INTO dos_timetable_slots 
          (timetable_id, day_of_week, period_number, start_time, end_time, 
           course_code, course_name, teacher_id, teacher_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [timetableId, day, period, currentTime, endTime, 
            course.course_code, course.course_name, teacher.teacher_id, teacher.teacher_name]);
        
        slots.push({
          day,
          period,
          time: `${currentTime} - ${endTime}`,
          course: course.course_name,
          teacher: teacher.teacher_name
        });
        
        currentTime = endTime;
        courseIndex++;
      }
    }
    
    await pool.execute(`
      UPDATE dos_timetables SET status = 'active' WHERE id = ?
    `, [timetableId]);
    
    res.json({ 
      success: true, 
      message: 'Timetable generated successfully',
      timetable_id: timetableId,
      slots_created: slots.length,
      preview: slots.slice(0, 10)
    });
  } catch (error) {
    console.error('Auto Generate Timetable Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/timetable/view/:timetableId', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster', 'teacher', 'student']), async (req, res) => {
  try {
    const [timetable] = await pool.execute(`
      SELECT * FROM dos_timetables WHERE id = ?
    `, [req.params.timetableId]);
    
    if (!timetable[0]) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }
    
    const [slots] = await pool.execute(`
      SELECT * FROM dos_timetable_slots 
      WHERE timetable_id = ?
      ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), period_number
    `, [req.params.timetableId]);
    
    const organized = {};
    slots.forEach(slot => {
      if (!organized[slot.day_of_week]) {
        organized[slot.day_of_week] = [];
      }
      organized[slot.day_of_week].push(slot);
    });
    
    res.json({ 
      success: true, 
      timetable: timetable[0],
      slots: organized,
      total_slots: slots.length
    });
  } catch (error) {
    console.error('View Timetable Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/timetable/by-class', authenticateToken, requireRole(['dos', 'patron', 'matron', 'admin', 'headmaster', 'teacher', 'student']), async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;
    
    const [timetables] = await pool.execute(`
      SELECT * FROM dos_timetables 
      WHERE trade_code = ? AND level_number = ? AND status = 'active'
      ORDER BY created_at DESC
    `, [trade_code, level_number]);
    
    res.json({ success: true, timetables, total: timetables.length });
  } catch (error) {
    console.error('Get Timetables Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

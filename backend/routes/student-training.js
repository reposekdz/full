const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * STUDENT TRAINING MANAGEMENT API
 * Complete training program, module, session, and assessment management
 */

// ============================================
// TRAINING PROGRAMS
// ============================================

// Get all training programs
router.get('/programs', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level, status } = req.query;
    
    let query = `
      SELECT stp.*, 
             COUNT(DISTINCT tm.id) as total_modules,
             COUNT(DISTINCT ste.id) as enrolled_students
      FROM student_training_programs stp
      LEFT JOIN training_modules tm ON stp.id = tm.program_id
      LEFT JOIN student_training_enrollments ste ON stp.id = ste.program_id
      WHERE 1=1
    `;
    const params = [];
    
    if (trade_code) {
      query += ' AND stp.trade_code = ?';
      params.push(trade_code);
    }
    if (level) {
      query += ' AND stp.level_number = ?';
      params.push(level);
    }
    if (status) {
      query += ' AND stp.status = ?';
      params.push(status);
    }
    
    query += ' GROUP BY stp.id ORDER BY stp.created_at DESC';
    
    const [programs] = await pool.execute(query, params);
    
    res.json({ success: true, programs });
  } catch (error) {
    console.error('Get Programs Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single training program
router.get('/programs/:programId', authenticateToken, async (req, res) => {
  try {
    const { programId } = req.params;
    
    const [programs] = await pool.execute(
      'SELECT * FROM student_training_programs WHERE id = ?',
      [programId]
    );
    
    if (programs.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    const [modules] = await pool.execute(
      'SELECT * FROM training_modules WHERE program_id = ? ORDER BY sequence_order',
      [programId]
    );
    
    const [enrollments] = await pool.execute(
      'SELECT COUNT(*) as count FROM student_training_enrollments WHERE program_id = ? AND status IN ("enrolled", "in_progress")',
      [programId]
    );
    
    res.json({
      success: true,
      program: programs[0],
      modules,
      enrolled_students: enrollments[0]?.count || 0
    });
  } catch (error) {
    console.error('Get Program Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create training program
router.post('/programs', authenticateToken, requireRole(['admin', 'dod', 'dos']), async (req, res) => {
  try {
    const {
      program_code, program_name, description, trade_code,
      level_number, duration_weeks, start_date, end_date
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO student_training_programs 
      (program_code, program_name, description, trade_code, level_number, duration_weeks, start_date, end_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [program_code, program_name, description, trade_code, level_number || 1, duration_weeks, start_date, end_date, req.user.id]);
    
    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      program_id: result.insertId
    });
  } catch (error) {
    console.error('Create Program Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TRAINING MODULES
// ============================================

// Get modules for a program
router.get('/programs/:programId/modules', authenticateToken, async (req, res) => {
  try {
    const { programId } = req.params;
    
    const [modules] = await pool.execute(`
      SELECT tm.*,
             COUNT(ts.id) as total_sessions,
             COUNT(DISTINCT tr.id) as total_resources
      FROM training_modules tm
      LEFT JOIN training_sessions ts ON tm.id = ts.module_id
      LEFT JOIN training_resources tr ON tm.id = tr.module_id
      WHERE tm.program_id = ?
      GROUP BY tm.id
      ORDER BY tm.sequence_order
    `, [programId]);
    
    res.json({ success: true, modules });
  } catch (error) {
    console.error('Get Modules Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create module
router.post('/modules', authenticateToken, requireRole(['admin', 'dod', 'dos']), async (req, res) => {
  try {
    const { program_id, module_code, module_name, description, sequence_order, duration_hours, passing_score } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO training_modules 
      (program_id, module_code, module_name, description, sequence_order, duration_hours, passing_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [program_id, module_code, module_name, description, sequence_order || 1, duration_hours, passing_score || 60]);
    
    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      module_id: result.insertId
    });
  } catch (error) {
    console.error('Create Module Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TRAINING SESSIONS
// ============================================

// Get sessions for a module
router.get('/modules/:moduleId/sessions', authenticateToken, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const [sessions] = await pool.execute(`
      SELECT ts.*,
             CONCAT(u.first_name, ' ', u.last_name) as instructor_name
      FROM training_sessions ts
      LEFT JOIN users u ON ts.instructor_id = u.id
      WHERE ts.module_id = ?
      ORDER BY ts.scheduled_date, ts.scheduled_time
    `, [moduleId]);
    
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create session
router.post('/sessions', authenticateToken, requireRole(['admin', 'dod', 'dos', 'teacher']), async (req, res) => {
  try {
    const {
      module_id, session_code, session_title, description, session_type,
      scheduled_date, scheduled_time, duration_minutes, instructor_id, location, max_participants
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO training_sessions 
      (module_id, session_code, session_title, description, session_type, scheduled_date, scheduled_time, duration_minutes, instructor_id, location, max_participants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [module_id, session_code, session_title, description, session_type || 'theory', scheduled_date, scheduled_time, duration_minutes || 60, instructor_id, location, max_participants]);
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session_id: result.insertId
    });
  } catch (error) {
    console.error('Create Session Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT ENROLLMENTS
// ============================================

// Get student enrollments
router.get('/enrollments', authenticateToken, async (req, res) => {
  try {
    const { student_id, program_id, status } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT ste.*, 
             stp.program_name, stp.program_code, stp.trade_code,
             gs.first_name, gs.last_name, gs.student_code
      FROM student_training_enrollments ste
      JOIN student_training_programs stp ON ste.program_id = stp.id
      JOIN global_student_sheets gs ON ste.student_id = gs.student_id
      WHERE 1=1
    `;
    const params = [];
    
    // Students can only see their own enrollments
    if (req.user.role === 'student') {
      query += ' AND ste.student_id = ?';
      params.push(userId);
    } else if (student_id) {
      query += ' AND ste.student_id = ?';
      params.push(student_id);
    }
    
    if (program_id) {
      query += ' AND ste.program_id = ?';
      params.push(program_id);
    }
    if (status) {
      query += ' AND ste.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ste.created_at DESC';
    
    const [enrollments] = await pool.execute(query, params);
    
    res.json({ success: true, enrollments });
  } catch (error) {
    console.error('Get Enrollments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enroll student in program
router.post('/enroll', authenticateToken, requireRole(['admin', 'dod', 'dos', 'teacher']), async (req, res) => {
  try {
    const { student_id, program_id, notes } = req.body;
    
    // Check if already enrolled
    const [existing] = await pool.execute(
      'SELECT id FROM student_training_enrollments WHERE student_id = ? AND program_id = ?',
      [student_id, program_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student already enrolled in this program' });
    }
    
    // Get program details
    const [programs] = await pool.execute(
      'SELECT * FROM student_training_programs WHERE id = ?',
      [program_id]
    );
    
    if (programs.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    const expectedCompletion = new Date();
    expectedCompletion.setDate(expectedCompletion.getDate() + (programs[0].duration_weeks * 7));
    
    const [result] = await pool.execute(`
      INSERT INTO student_training_enrollments 
      (student_id, program_id, enrollment_date, expected_completion_date, enrolled_by, notes)
      VALUES (?, ?, CURDATE(), ?, ?, ?)
    `, [student_id, program_id, expectedCompletion, req.user.id, notes]);
    
    // Create module progress records for all modules
    const [modules] = await pool.execute(
      'SELECT id FROM training_modules WHERE program_id = ?',
      [program_id]
    );
    
    for (const module of modules) {
      await pool.execute(`
        INSERT INTO student_module_progress (enrollment_id, module_id, status)
        VALUES (?, ?, 'not_started')
      `, [result.insertId, module.id]);
    }
    
    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      enrollment_id: result.insertId
    });
  } catch (error) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT TRAINING DASHBOARD
// ============================================

router.get('/student/:studentId/dashboard', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check authorization
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Get student info
    const [students] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ?',
      [studentId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = students[0];
    
    // Get enrollments with progress
    const [enrollments] = await pool.execute(`
      SELECT ste.*, 
             stp.program_name, stp.program_code, stp.trade_code,
             (SELECT COUNT(*) FROM training_modules WHERE program_id = stp.id) as total_modules,
             (SELECT COUNT(*) FROM student_module_progress WHERE enrollment_id = ste.id AND status = 'completed') as completed_modules
      FROM student_training_enrollments ste
      JOIN student_training_programs stp ON ste.program_id = stp.id
      WHERE ste.student_id = ?
      ORDER BY ste.created_at DESC
    `, [studentId]);
    
    // Get upcoming sessions
    const [upcomingSessions] = await pool.execute(`
      SELECT ts.*, tm.module_name, stp.program_name
      FROM training_sessions ts
      JOIN training_modules tm ON ts.module_id = tm.id
      JOIN student_training_programs stp ON tm.program_id = stp.id
      WHERE ts.scheduled_date >= CURDATE() AND ts.status = 'scheduled'
        AND ts.module_id IN (
          SELECT tm.id FROM training_modules tm 
          JOIN student_training_enrollments ste ON tm.program_id = ste.program_id
          WHERE ste.student_id = ?
        )
      ORDER BY ts.scheduled_date, ts.scheduled_time
      LIMIT 10
    `, [studentId]);
    
    // Get recent assessment results
    const [assessmentResults] = await pool.execute(`
      SELECT ar.*, ta.title as assessment_title, tm.module_name
      FROM assessment_results ar
      JOIN training_assessments ta ON ar.assessment_id = ta.id
      JOIN training_modules tm ON ta.module_id = tm.id
      JOIN student_module_progress smp ON ar.enrollment_id = smp.enrollment_id
      WHERE smp.student_id = ?
      ORDER BY ar.created_at DESC
      LIMIT 10
    `, [studentId]);
    
    // Calculate overall stats
    const stats = {
      total_programs: enrollments.length,
      active_enrollments: enrollments.filter(e => ['enrolled', 'in_progress'].includes(e.status)).length,
      completed_enrollments: enrollments.filter(e => e.status === 'completed').length,
      total_progress: enrollments.length > 0 
        ? (enrollments.reduce((sum, e) => sum + parseFloat(e.progress_percentage || 0), 0) / enrollments.length).toFixed(2)
        : 0
    };
    
    res.json({
      success: true,
      student: {
        id: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        code: student.student_code,
        trade: student.code,
        level: student.level_number
      },
      stats,
      enrollments,
      upcoming_sessions: upcomingSessions,
      recent_assessments: assessmentResults
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT MODULE PROGRESS
// ============================================

router.get('/enrollments/:enrollmentId/progress', authenticateToken, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    const [progress] = await pool.execute(`
      SELECT tmp.*, 
             tm.module_name, tm.module_code, tm.sequence_order, tm.duration_hours, tm.passing_score,
             (SELECT COUNT(*) FROM training_sessions WHERE module_id = tm.id) as total_sessions,
             (SELECT COUNT(*) FROM student_session_attendance WHERE enrollment_id = tmp.enrollment_id AND session_id IN (SELECT id FROM training_sessions WHERE module_id = tm.id) AND attendance_status = 'present') as attended_sessions,
             (SELECT COUNT(*) FROM training_resources WHERE module_id = tm.id) as total_resources
      FROM student_module_progress tmp
      JOIN training_modules tm ON tmp.module_id = tm.id
      WHERE tmp.enrollment_id = ?
      ORDER BY tm.sequence_order
    `, [enrollmentId]);
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Get Progress Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update module progress
router.put('/progress/:progressId', authenticateToken, async (req, res) => {
  try {
    const { progressId } = req.params;
    const { status, score, instructor_notes } = req.body;
    
    await pool.execute(`
      UPDATE student_module_progress 
      SET status = ?, score = ?, instructor_notes = ?,
          ${status === 'completed' ? 'completion_date = CURDATE(), completed_at = NOW()' : ''}
      WHERE id = ?
    `, [status, score, instructor_notes, progressId]);
    
    // Update enrollment progress
    const [progressRecords] = await pool.execute(
      'SELECT * FROM student_module_progress WHERE enrollment_id = (SELECT enrollment_id FROM student_module_progress WHERE id = ?)',
      [progressId]
    );
    
    const [enrollment] = await pool.execute(
      'SELECT program_id FROM student_module_progress WHERE id = ?',
      [progressId]
    );
    
    if (enrollment.length > 0) {
      const totalModules = progressRecords.length;
      const completedModules = progressRecords.filter(p => p.status === 'completed').length;
      const avgScore = progressRecords.filter(p => p.score).reduce((sum, p) => sum + parseFloat(p.score), 0) / progressRecords.filter(p => p.score).length || 0;
      
      await pool.execute(`
        UPDATE student_training_enrollments 
        SET progress_percentage = ?, overall_grade = ?,
            status = CASE WHEN ? = total_modules THEN 'completed' ELSE 'in_progress' END,
            actual_completion_date = CASE WHEN ? = total_modules THEN CURDATE() ELSE NULL END
        WHERE id = ?
      `, [(completedModules / totalModules) * 100, avgScore, completedModules, completedModules, enrollment[0].enrollment_id || enrollment[0].id]);
    }
    
    res.json({ success: true, message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Update Progress Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ASSESSMENTS
// ============================================

// Get assessments for enrollment
router.get('/enrollments/:enrollmentId/assessments', authenticateToken, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    // Get program_id from enrollment
    const [enrollments] = await pool.execute(
      'SELECT program_id FROM student_training_enrollments WHERE id = ?',
      [enrollmentId]
    );
    
    if (enrollments.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    const [assessments] = await pool.execute(`
      SELECT ta.*, tm.module_name,
             ar.score, ar.percentage, ar.grade, ar.passed, ar.attempt_number, ar.feedback as result_feedback,
             (SELECT COUNT(*) FROM assessment_results WHERE assessment_id = ta.id AND enrollment_id = ?) as attempts_made
      FROM training_assessments ta
      JOIN training_modules tm ON ta.module_id = tm.id
      LEFT JOIN assessment_results ar ON ta.id = ar.assessment_id AND ar.enrollment_id = ?
      WHERE tm.program_id = ? AND ta.status = 'published'
      ORDER BY ta.due_date ASC
    `, [enrollmentId, enrollmentId, enrollments[0].program_id]);
    
    res.json({ success: true, assessments });
  } catch (error) {
    console.error('Get Assessments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit assessment
router.post('/assessments/:assessmentId/submit', authenticateToken, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { enrollment_id, score, answers, time_spent } = req.body;
    
    // Get assessment details
    const [assessments] = await pool.execute(
      'SELECT * FROM training_assessments WHERE id = ?',
      [assessmentId]
    );
    
    if (assessments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    const assessment = assessments[0];
    
    // Check attempt count
    const [existingAttempts] = await pool.execute(
      'SELECT COUNT(*) as count FROM assessment_results WHERE assessment_id = ? AND enrollment_id = ?',
      [assessmentId, enrollment_id]
    );
    
    if (existingAttempts[0].count >= assessment.max_attempts) {
      return res.status(400).json({ success: false, message: 'Maximum attempts reached' });
    }
    
    const percentage = (score / assessment.total_marks) * 100;
    const passed = percentage >= assessment.passing_marks;
    
    // Determine grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    
    const attemptNumber = existingAttempts[0].count + 1;
    
    const [result] = await pool.execute(`
      INSERT INTO assessment_results 
      (assessment_id, enrollment_id, attempt_number, score, percentage, grade, passed, time_spent_minutes, answers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [assessmentId, enrollment_id, attemptNumber, score, percentage, grade, passed, time_spent, JSON.stringify(answers)]);
    
    res.status(201).json({
      success: true,
      message: 'Assessment submitted successfully',
      result: {
        score,
        percentage: percentage.toFixed(2),
        grade,
        passed,
        attempt: attemptNumber
      }
    });
  } catch (error) {
    console.error('Submit Assessment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TRAINING RESOURCES
// ============================================

router.get('/modules/:moduleId/resources', authenticateToken, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const [resources] = await pool.execute(`
      SELECT * FROM training_resources 
      WHERE module_id = ?
      ORDER BY sequence_order
    `, [moduleId]);
    
    res.json({ success: true, resources });
  } catch (error) {
    console.error('Get Resources Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// INSTRUCTOR METHODS
// ============================================

// Get instructor dashboard
router.get('/instructor/dashboard', authenticateToken, requireRole(['admin', 'dod', 'dos', 'teacher']), async (req, res) => {
  try {
    const instructorId = req.user.id;
    
    // Get sessions assigned to instructor
    const [sessions] = await pool.execute(`
      SELECT ts.*, tm.module_name, stp.program_name
      FROM training_sessions ts
      JOIN training_modules tm ON ts.module_id = tm.id
      JOIN student_training_programs stp ON tm.program_id = stp.id
      WHERE ts.instructor_id = ? OR ts.created_by = ?
      ORDER BY ts.scheduled_date DESC
      LIMIT 20
    `, [instructorId, instructorId]);
    
    // Get students enrolled in instructor's programs
    const [students] = await pool.execute(`
      SELECT DISTINCT gs.*, stp.program_name,
             (SELECT COUNT(*) FROM student_training_enrollments WHERE student_id = gs.student_id AND status = 'completed') as completed_programs
      FROM global_student_sheets gs
      JOIN student_training_enrollments ste ON gs.student_id = ste.student_id
      JOIN student_training_programs stp ON ste.program_id = stp.id
      WHERE stp.id IN (
        SELECT DISTINCT stp2.id FROM student_training_programs stp2
        JOIN training_modules tm ON stp2.id = tm.program_id
        JOIN training_sessions ts ON tm.id = ts.module_id
        WHERE ts.instructor_id = ? OR ts.created_by = ?
      )
      LIMIT 50
    `, [instructorId, instructorId]);
    
    res.json({
      success: true,
      stats: {
        total_sessions: sessions.length,
        upcoming_sessions: sessions.filter(s => s.status === 'scheduled').length,
        total_students: students.length
      },
      sessions,
      students
    });
  } catch (error) {
    console.error('Instructor Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

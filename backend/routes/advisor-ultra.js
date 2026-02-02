const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ULTRA-COMPREHENSIVE ADVISOR PORTAL
 * Student counseling, career guidance, performance analytics
 * Mental health tracking, intervention systems, college placement
 */

// ============================================
// ADVISOR DASHBOARD
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['advisor', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const advisorId = req.user.userId;
    
    const [assignedStudents] = await pool.execute(`
      SELECT COUNT(*) as total FROM global_student_sheets 
      WHERE advisor_id = ? AND status = 'active'
    `, [advisorId]);
    
    const [activeCases] = await pool.execute(`
      SELECT COUNT(*) as count FROM counseling_sessions 
      WHERE counselor_id = ? AND status = 'active'
    `, [advisorId]);
    
    const [upcomingSessions] = await pool.execute(`
      SELECT cs.*, gs.first_name, gs.last_name, gs.student_code
      FROM counseling_sessions cs
      JOIN global_student_sheets gs ON cs.student_id = gs.student_id
      WHERE cs.counselor_id = ? 
        AND cs.session_date >= CURDATE()
        AND cs.status = 'scheduled'
      ORDER BY cs.session_date, cs.session_time
      LIMIT 10
    `, [advisorId]);
    
    const [recentSessions] = await pool.execute(`
      SELECT cs.*, gs.first_name, gs.last_name, gs.student_code
      FROM counseling_sessions cs
      JOIN global_student_sheets gs ON cs.student_id = gs.student_id
      WHERE cs.counselor_id = ? 
      ORDER BY cs.session_date DESC, cs.session_time DESC
      LIMIT 5
    `, [advisorId]);
    
    const [atRiskStudents] = await pool.execute(`
      SELECT gs.*, 
        (SELECT COUNT(*) FROM student_discipline_records WHERE student_id = gs.student_id AND incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_incidents
      FROM global_student_sheets gs
      WHERE gs.advisor_id = ? AND gs.status = 'active'
        AND (gs.gpa < 2.0 OR gs.attendance_percentage < 75 OR gs.conduct_score < 60)
      ORDER BY gs.gpa ASC, gs.attendance_percentage ASC
      LIMIT 20
    `, [advisorId]);
    
    const [careerInterests] = await pool.execute(`
      SELECT career_interest, COUNT(*) as student_count
      FROM student_career_profiles
      WHERE advisor_id = ?
      GROUP BY career_interest
      ORDER BY student_count DESC
      LIMIT 10
    `, [advisorId]);
    
    res.json({
      success: true,
      dashboard: {
        assigned_students: assignedStudents[0].total,
        active_cases: activeCases[0].count,
        upcoming_sessions: upcomingSessions,
        recent_sessions: recentSessions,
        at_risk_students: atRiskStudents,
        career_interests: careerInterests
      }
    });
  } catch (error) {
    console.error('Advisor Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT COUNSELING & SESSIONS
// ============================================
router.get('/students', authenticateToken, requireRole(['advisor', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const advisorId = req.user.userId;
    const { status, risk_level, search } = req.query;
    
    let query = `
      SELECT gs.*, 
        (SELECT COUNT(*) FROM counseling_sessions WHERE student_id = gs.student_id AND counselor_id = ?) as session_count,
        (SELECT session_date FROM counseling_sessions WHERE student_id = gs.student_id AND counselor_id = ? ORDER BY session_date DESC LIMIT 1) as last_session_date
      FROM global_student_sheets gs
      WHERE gs.advisor_id = ?
    `;
    const params = [advisorId, advisorId, advisorId];
    
    if (status) { query += ' AND gs.status = ?'; params.push(status); }
    if (risk_level === 'high') { query += ' AND (gs.gpa < 2.0 OR gs.attendance_percentage < 70)'; }
    if (risk_level === 'medium') { query += ' AND (gs.gpa BETWEEN 2.0 AND 2.5 OR gs.attendance_percentage BETWEEN 70 AND 80)'; }
    if (search) {
      query += ' AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY gs.last_name, gs.first_name';
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    console.error('Advisor Students Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sessions/schedule', authenticateToken, requireRole(['advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, session_date, session_time, session_type, topic, notes } = req.body;
    
    const [student] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id = ?', [student_id]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [result] = await pool.execute(`
      INSERT INTO counseling_sessions 
      (student_id, counselor_id, counselor_name, session_date, session_time, session_type, topic, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `, [student_id, req.user.userId, req.user.name, session_date, session_time, session_type, topic, notes]);
    
    await pool.execute(`
      INSERT INTO student_notifications (student_id, title, message, type, priority)
      VALUES (?, 'Counseling Session Scheduled', ?, 'counseling', 'medium')
    `, [student_id, `You have a counseling session scheduled for ${session_date} at ${session_time} regarding ${topic}`]);
    
    res.json({ success: true, message: 'Session scheduled successfully', session_id: result.insertId });
  } catch (error) {
    console.error('Schedule Session Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/sessions/:sessionId/complete', authenticateToken, requireRole(['advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const { outcome, action_taken, follow_up_required, follow_up_date, session_notes } = req.body;
    
    await pool.execute(`
      UPDATE counseling_sessions 
      SET status = 'completed',
          outcome = ?,
          action_taken = ?,
          follow_up_required = ?,
          follow_up_date = ?,
          session_notes = ?,
          completed_at = NOW()
      WHERE id = ?
    `, [outcome, action_taken, follow_up_required, follow_up_date, session_notes, req.params.sessionId]);
    
    res.json({ success: true, message: 'Session marked as completed' });
  } catch (error) {
    console.error('Complete Session Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sessions/student/:studentId', authenticateToken, requireRole(['advisor', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [sessions] = await pool.execute(`
      SELECT * FROM counseling_sessions 
      WHERE student_id = ?
      ORDER BY session_date DESC, session_time DESC
    `, [req.params.studentId]);
    
    res.json({ success: true, sessions, total: sessions.length });
  } catch (error) {
    console.error('Student Sessions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CAREER GUIDANCE & PLANNING
// ============================================
router.get('/career-profiles/:studentId', authenticateToken, requireRole(['advisor', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [profile] = await pool.execute(`
      SELECT * FROM student_career_profiles 
      WHERE student_id = ?
    `, [req.params.studentId]);
    
    res.json({ success: true, profile: profile[0] || null });
  } catch (error) {
    console.error('Career Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/career-profiles/update', authenticateToken, requireRole(['advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, career_interest, strengths, weaknesses, aptitude_test_results, recommended_paths, goals, action_plan } = req.body;
    
    const [existing] = await pool.execute('SELECT id FROM student_career_profiles WHERE student_id = ?', [student_id]);
    
    if (existing[0]) {
      await pool.execute(`
        UPDATE student_career_profiles 
        SET career_interest = ?, strengths = ?, weaknesses = ?, aptitude_test_results = ?, 
            recommended_paths = ?, goals = ?, action_plan = ?, advisor_id = ?, updated_at = NOW()
        WHERE student_id = ?
      `, [career_interest, strengths, weaknesses, aptitude_test_results, recommended_paths, goals, action_plan, req.user.userId, student_id]);
    } else {
      await pool.execute(`
        INSERT INTO student_career_profiles 
        (student_id, career_interest, strengths, weaknesses, aptitude_test_results, recommended_paths, goals, action_plan, advisor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [student_id, career_interest, strengths, weaknesses, aptitude_test_results, recommended_paths, goals, action_plan, req.user.userId]);
    }
    
    res.json({ success: true, message: 'Career profile updated successfully' });
  } catch (error) {
    console.error('Update Career Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// MENTAL HEALTH & WELLBEING
// ============================================
router.post('/wellbeing/assessment', authenticateToken, requireRole(['advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, assessment_type, stress_level, anxiety_level, depression_indicators, notes, recommended_actions } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO student_wellbeing_assessments 
      (student_id, counselor_id, assessment_type, stress_level, anxiety_level, depression_indicators, notes, recommended_actions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, req.user.userId, assessment_type, stress_level, anxiety_level, depression_indicators, notes, recommended_actions]);
    
    if (stress_level >= 8 || anxiety_level >= 8 || depression_indicators === true) {
      await pool.execute(`
        INSERT INTO student_notifications (student_id, title, message, type, priority)
        VALUES (?, 'Follow-up Required', 'Your counselor would like to schedule a follow-up session. Please check your counseling schedule.', 'counseling', 'high')
      `, [student_id]);
    }
    
    res.json({ success: true, message: 'Assessment recorded successfully', assessment_id: result.insertId });
  } catch (error) {
    console.error('Wellbeing Assessment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/wellbeing/student/:studentId', authenticateToken, requireRole(['advisor', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [assessments] = await pool.execute(`
      SELECT * FROM student_wellbeing_assessments 
      WHERE student_id = ?
      ORDER BY assessment_date DESC
    `, [req.params.studentId]);
    
    res.json({ success: true, assessments, total: assessments.length });
  } catch (error) {
    console.error('Student Wellbeing Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// INTERVENTION TRACKING
// ============================================
router.post('/interventions/create', authenticateToken, requireRole(['advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, intervention_type, reason, description, target_outcomes, start_date, expected_end_date, stakeholders } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO student_interventions 
      (student_id, counselor_id, intervention_type, reason, description, target_outcomes, start_date, expected_end_date, stakeholders, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [student_id, req.user.userId, intervention_type, reason, description, target_outcomes, start_date, expected_end_date, stakeholders]);
    
    await pool.execute(`
      INSERT INTO student_notifications (student_id, title, message, type, priority)
      VALUES (?, 'Support Program Initiated', ?, 'counseling', 'medium')
    `, [student_id, `A support intervention has been initiated to help you with ${intervention_type}. Your advisor will guide you through the process.`]);
    
    res.json({ success: true, message: 'Intervention created successfully', intervention_id: result.insertId });
  } catch (error) {
    console.error('Create Intervention Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/interventions/:interventionId/progress', authenticateToken, requireRole(['advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const { progress_notes, effectiveness_rating, challenges, next_steps } = req.body;
    
    await pool.execute(`
      INSERT INTO intervention_progress_notes 
      (intervention_id, counselor_id, progress_notes, effectiveness_rating, challenges, next_steps)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.params.interventionId, req.user.userId, progress_notes, effectiveness_rating, challenges, next_steps]);
    
    res.json({ success: true, message: 'Progress notes added successfully' });
  } catch (error) {
    console.error('Intervention Progress Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/interventions/student/:studentId', authenticateToken, requireRole(['advisor', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [interventions] = await pool.execute(`
      SELECT * FROM student_interventions 
      WHERE student_id = ?
      ORDER BY start_date DESC
    `, [req.params.studentId]);
    
    res.json({ success: true, interventions, total: interventions.length });
  } catch (error) {
    console.error('Student Interventions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ANALYTICS & REPORTS
// ============================================
router.get('/analytics/student-insights/:studentId', authenticateToken, requireRole(['advisor', 'patron', 'matron']), async (req, res) => {
  try {
    const [student] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id = ?', [req.params.studentId]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [academicTrend] = await pool.execute(`
      SELECT term, academic_year, AVG(percentage) as avg_percentage, AVG(grade_points) as avg_gpa
      FROM student_subject_performance
      WHERE student_id = ?
      GROUP BY term, academic_year
      ORDER BY academic_year, term
    `, [req.params.studentId]);
    
    const [attendanceTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(attendance_date, '%Y-%m') as month,
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_rate
      FROM student_attendance_records
      WHERE student_id = ?
      GROUP BY DATE_FORMAT(attendance_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `, [req.params.studentId]);
    
    const [disciplineHistory] = await pool.execute(`
      SELECT * FROM student_discipline_records 
      WHERE student_id = ?
      ORDER BY incident_date DESC
    `, [req.params.studentId]);
    
    const [sessionsSummary] = await pool.execute(`
      SELECT COUNT(*) as total_sessions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN follow_up_required = true THEN 1 END) as follow_ups_needed
      FROM counseling_sessions
      WHERE student_id = ?
    `, [req.params.studentId]);
    
    res.json({
      success: true,
      insights: {
        student: student[0],
        academic_trend: academicTrend,
        attendance_trend: attendanceTrend,
        discipline_history: disciplineHistory,
        counseling_summary: sessionsSummary[0]
      }
    });
  } catch (error) {
    console.error('Student Insights Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

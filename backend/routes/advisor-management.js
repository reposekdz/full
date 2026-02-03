const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ====================================
 * ADVISOR MANAGEMENT SYSTEM
 * ====================================
 * Comprehensive student counseling and academic advising
 * - Counseling sessions tracking
 * - Student meetings and interventions
 * - Academic progress monitoring
 * - Mental health support tracking
 * - Career guidance
 * - Parent collaboration
 */

// =====================================
// DASHBOARD
// =====================================

router.get('/dashboard', authenticateToken, requireRole(['advisor', 'admin']), async (req, res) => {
  try {
    const [sessionStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN session_type = 'counseling' THEN 1 END) as counseling_sessions,
        COUNT(CASE WHEN session_type = 'academic' THEN 1 END) as academic_sessions,
        COUNT(CASE WHEN session_type = 'career' THEN 1 END) as career_sessions,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_sessions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions
      FROM advisor_sessions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    const [studentStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT student_id) as students_counseled,
        AVG(CASE WHEN session_outcome_rating > 0 THEN session_outcome_rating END) as avg_outcome_rating
      FROM advisor_sessions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);
    
    const [interventionStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_interventions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_interventions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_interventions,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority
      FROM student_interventions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
    `);
    
    const [upcomingSessions] = await pool.execute(`
      SELECT 
        ase.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number
      FROM advisor_sessions ase
      JOIN global_student_sheets gss ON ase.student_id = gss.student_id
      WHERE ase.status = 'scheduled' AND ase.session_date >= CURDATE()
      ORDER BY ase.session_date, ase.session_time
      LIMIT 10
    `);
    
    const [recentSessions] = await pool.execute(`
      SELECT 
        ase.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number
      FROM advisor_sessions ase
      JOIN global_student_sheets gss ON ase.student_id = gss.student_id
      WHERE ase.status = 'completed'
      ORDER BY ase.session_date DESC, ase.created_at DESC
      LIMIT 10
    `);
    
    const [activeInterventions] = await pool.execute(`
      SELECT 
        si.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number
      FROM student_interventions si
      JOIN global_student_sheets gss ON si.student_id = gss.student_id
      WHERE si.status = 'active'
      ORDER BY FIELD(si.priority, 'high', 'medium', 'low'), si.created_at DESC
      LIMIT 15
    `);
    
    res.json({
      success: true,
      dashboard: {
        sessions: sessionStats[0],
        students: studentStats[0],
        interventions: interventionStats[0],
        upcoming_sessions: upcomingSessions,
        recent_sessions: recentSessions,
        active_interventions: activeInterventions
      }
    });
  } catch (error) {
    console.error('Advisor dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// COUNSELING SESSIONS
// =====================================

router.get('/sessions', authenticateToken, requireRole(['advisor', 'admin']), async (req, res) => {
  try {
    const { student_id, session_type, status, from_date, to_date } = req.query;
    
    let query = `
      SELECT 
        ase.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        gss.guardian_phone,
        u.first_name as advisor_first_name,
        u.last_name as advisor_last_name
      FROM advisor_sessions ase
      JOIN global_student_sheets gss ON ase.student_id = gss.student_id
      LEFT JOIN users u ON ase.advisor_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ` AND ase.student_id = ?`;
      params.push(student_id);
    }
    if (session_type) {
      query += ` AND ase.session_type = ?`;
      params.push(session_type);
    }
    if (status) {
      query += ` AND ase.status = ?`;
      params.push(status);
    }
    if (from_date) {
      query += ` AND ase.session_date >= ?`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND ase.session_date <= ?`;
      params.push(to_date);
    }
    
    query += ` ORDER BY ase.session_date DESC, ase.created_at DESC LIMIT 100`;
    
    const [sessions] = await pool.execute(query, params);
    
    res.json({
      success: true,
      sessions: sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sessions', authenticateToken, requireRole(['advisor', 'admin']), async (req, res) => {
  try {
    const {
      student_id,
      session_type,
      session_date,
      session_time,
      purpose,
      concerns,
      location
    } = req.body;
    
    if (!student_id || !session_type || !session_date || !purpose) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO advisor_sessions (
        student_id, advisor_id, session_type, session_date, session_time,
        purpose, concerns, location, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())`,
      [student_id, req.user.id, session_type, session_date, session_time, purpose, concerns, location]
    );
    
    res.json({
      success: true,
      message: 'Session scheduled successfully',
      session_id: result.insertId
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/sessions/:id', authenticateToken, requireRole(['advisor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      session_notes,
      action_items,
      follow_up_required,
      follow_up_date,
      session_outcome_rating,
      parent_notified
    } = req.body;
    
    const [result] = await pool.execute(
      `UPDATE advisor_sessions 
       SET status = ?, session_notes = ?, action_items = ?,
           follow_up_required = ?, follow_up_date = ?, session_outcome_rating = ?,
           parent_notified = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, session_notes, action_items, follow_up_required, follow_up_date, 
       session_outcome_rating, parent_notified, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    res.json({
      success: true,
      message: 'Session updated successfully'
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/sessions/:id', authenticateToken, requireRole(['advisor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM advisor_sessions WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// STUDENT INTERVENTIONS
// =====================================

router.get('/interventions', authenticateToken, requireRole(['advisor', 'admin', 'teacher']), async (req, res) => {
  try {
    const { student_id, status, priority, intervention_type } = req.query;
    
    let query = `
      SELECT 
        si.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM student_interventions si
      JOIN global_student_sheets gss ON si.student_id = gss.student_id
      LEFT JOIN users u ON si.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ` AND si.student_id = ?`;
      params.push(student_id);
    }
    if (status) {
      query += ` AND si.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND si.priority = ?`;
      params.push(priority);
    }
    if (intervention_type) {
      query += ` AND si.intervention_type = ?`;
      params.push(intervention_type);
    }
    
    query += ` ORDER BY FIELD(si.priority, 'high', 'medium', 'low'), si.created_at DESC LIMIT 100`;
    
    const [interventions] = await pool.execute(query, params);
    
    res.json({
      success: true,
      interventions: interventions
    });
  } catch (error) {
    console.error('Get interventions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/interventions', authenticateToken, requireRole(['advisor', 'admin', 'teacher']), async (req, res) => {
  try {
    const {
      student_id,
      intervention_type,
      concern_area,
      description,
      priority,
      planned_actions,
      target_date
    } = req.body;
    
    if (!student_id || !intervention_type || !concern_area || !description || !priority) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO student_interventions (
        student_id, intervention_type, concern_area, description,
        priority, planned_actions, target_date, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW())`,
      [student_id, intervention_type, concern_area, description, priority, planned_actions, target_date, req.user.id]
    );
    
    if (student[0].guardian_phone) {
      const message = `Dear ${student[0].guardian_name || 'Parent/Guardian'},\n\n` +
        `An intervention plan has been created for ${student[0].first_name} ${student[0].last_name}.\n` +
        `Type: ${intervention_type}\n` +
        `Concern: ${concern_area}\n` +
        `Priority: ${priority}\n\n` +
        `The school advisor will contact you soon for collaboration.`;
      
      try {
        const smsService = require('../services/smsService');
        await smsService.sendSMS(student[0].guardian_phone, message);
        
        await pool.execute(
          `INSERT INTO parent_notifications (
            student_id, notification_type, message, sent_to,
            sent_via, sent_by, sent_at
          ) VALUES (?, 'intervention', ?, ?, 'sms', ?, NOW())`,
          [student_id, message, student[0].guardian_phone, req.user.id]
        );
      } catch (err) {
        console.error('SMS notification error:', err);
      }
    }
    
    res.json({
      success: true,
      message: 'Intervention created successfully',
      intervention_id: result.insertId
    });
  } catch (error) {
    console.error('Create intervention error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/interventions/:id', authenticateToken, requireRole(['advisor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      progress_notes,
      outcome,
      effectiveness_rating
    } = req.body;
    
    const [result] = await pool.execute(
      `UPDATE student_interventions 
       SET status = ?, progress_notes = ?, outcome = ?, effectiveness_rating = ?,
           completed_by = ?, completed_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [status, progress_notes, outcome, effectiveness_rating, req.user.id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Intervention not found' });
    }
    
    res.json({
      success: true,
      message: 'Intervention updated successfully'
    });
  } catch (error) {
    console.error('Update intervention error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// STUDENT ACADEMIC TRACKING
// =====================================

router.get('/students/:student_id/profile', authenticateToken, requireRole(['advisor', 'admin']), async (req, res) => {
  try {
    const { student_id } = req.params;
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ?',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [sessions] = await pool.execute(
      `SELECT * FROM advisor_sessions 
       WHERE student_id = ? 
       ORDER BY session_date DESC, created_at DESC 
       LIMIT 10`,
      [student_id]
    );
    
    const [interventions] = await pool.execute(
      `SELECT * FROM student_interventions 
       WHERE student_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [student_id]
    );
    
    const [disciplineRecords] = await pool.execute(
      `SELECT * FROM discipline_records 
       WHERE student_id = ? 
       ORDER BY incident_date DESC 
       LIMIT 5`,
      [student_id]
    );
    
    const [conductRecords] = await pool.execute(
      `SELECT * FROM student_conduct 
       WHERE student_id = ? 
       ORDER BY academic_year DESC, term DESC 
       LIMIT 5`,
      [student_id]
    );
    
    res.json({
      success: true,
      profile: {
        student: student[0],
        sessions: sessions,
        interventions: interventions,
        discipline_records: disciplineRecords,
        conduct_records: conductRecords
      }
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// REPORTS AND ANALYTICS
// =====================================

router.get('/reports/student-summary/:student_id', authenticateToken, requireRole(['advisor', 'admin']), async (req, res) => {
  try {
    const { student_id } = req.params;
    
    const [sessionSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN session_type = 'counseling' THEN 1 END) as counseling_count,
        COUNT(CASE WHEN session_type = 'academic' THEN 1 END) as academic_count,
        COUNT(CASE WHEN session_type = 'career' THEN 1 END) as career_count,
        AVG(CASE WHEN session_outcome_rating > 0 THEN session_outcome_rating END) as avg_rating
      FROM advisor_sessions
      WHERE student_id = ?
    `, [student_id]);
    
    const [interventionSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_interventions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        AVG(CASE WHEN effectiveness_rating > 0 THEN effectiveness_rating END) as avg_effectiveness
      FROM student_interventions
      WHERE student_id = ?
    `, [student_id]);
    
    res.json({
      success: true,
      summary: {
        sessions: sessionSummary[0],
        interventions: interventionSummary[0]
      }
    });
  } catch (error) {
    console.error('Get student summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

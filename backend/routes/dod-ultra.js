const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ULTRA-COMPREHENSIVE DIRECTOR OF DISCIPLINE (DOD) PORTAL
 * Behavior tracking, intervention systems, restorative justice
 * Incident management, conduct monitoring, parent communication
 * 
 * NOTE: This portal works SPECIFICALLY with patron and matron roles
 * as per user requirements
 */

// ============================================
// DOD DASHBOARD (Shared with Patron & Matron)
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['dod', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [disciplineOverview] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_incidents,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_incidents,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_incidents,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_incidents,
        COUNT(CASE WHEN incident_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as this_week,
        COUNT(CASE WHEN incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as this_month
      FROM student_discipline_records
    `);
    
    const [todayIncidents] = await pool.execute(`
      SELECT sdr.*, gs.first_name, gs.last_name, gs.student_code, gs.class_name, gs.trade_name
      FROM student_discipline_records sdr
      JOIN global_student_sheets gs ON sdr.student_id = gs.student_id
      WHERE DATE(sdr.incident_date) = CURDATE()
      ORDER BY sdr.severity DESC, sdr.incident_time DESC
    `);
    
    const [repeatOffenders] = await pool.execute(`
      SELECT 
        gs.student_id,
        gs.student_code,
        gs.first_name,
        gs.last_name,
        gs.class_name,
        gs.trade_name,
        gs.conduct_score,
        COUNT(sdr.id) as incident_count,
        MAX(sdr.incident_date) as last_incident
      FROM global_student_sheets gs
      JOIN student_discipline_records sdr ON gs.student_id = sdr.student_id
      WHERE sdr.incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY gs.student_id
      HAVING incident_count >= 3
      ORDER BY incident_count DESC, gs.conduct_score ASC
      LIMIT 20
    `);
    
    const [conductDistribution] = await pool.execute(`
      SELECT 
        CASE 
          WHEN conduct_score >= 90 THEN 'Excellent (90-100)'
          WHEN conduct_score >= 75 THEN 'Good (75-89)'
          WHEN conduct_score >= 60 THEN 'Fair (60-74)'
          ELSE 'Poor (<60)'
        END as conduct_category,
        COUNT(*) as student_count
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY conduct_category
      ORDER BY MIN(conduct_score) DESC
    `);
    
    const [incidentTypes] = await pool.execute(`
      SELECT 
        incident_type,
        COUNT(*) as count,
        COUNT(CASE WHEN incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as recent_count
      FROM student_discipline_records
      GROUP BY incident_type
      ORDER BY count DESC
      LIMIT 10
    `);
    
    const [pendingActions] = await pool.execute(`
      SELECT COUNT(*) as count FROM student_discipline_records 
      WHERE resolution_status = 'pending' OR resolution_status = 'in_progress'
    `);
    
    res.json({
      success: true,
      dashboard: {
        overview: disciplineOverview[0],
        today_incidents: todayIncidents,
        repeat_offenders: repeatOffenders,
        conduct_distribution: conductDistribution,
        incident_types: incidentTypes,
        pending_actions: pendingActions[0].count
      }
    });
  } catch (error) {
    console.error('DOD Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// INCIDENT MANAGEMENT (Global Student Sheet Integration)
// ============================================
router.get('/incidents', authenticateToken, requireRole(['dod', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { severity, incident_type, status, start_date, end_date, trade_code, student_id } = req.query;
    
    let query = `
      SELECT sdr.*, gs.first_name, gs.last_name, gs.student_code, gs.class_name, gs.trade_name, gs.level_number
      FROM student_discipline_records sdr
      JOIN global_student_sheets gs ON sdr.student_id = gs.student_id
      WHERE 1=1
    `;
    const params = [];
    
    if (severity) { query += ' AND sdr.severity = ?'; params.push(severity); }
    if (incident_type) { query += ' AND sdr.incident_type = ?'; params.push(incident_type); }
    if (status) { query += ' AND sdr.resolution_status = ?'; params.push(status); }
    if (start_date && end_date) { 
      query += ' AND sdr.incident_date BETWEEN ? AND ?'; 
      params.push(start_date, end_date); 
    }
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (student_id) { query += ' AND sdr.student_id = ?'; params.push(student_id); }
    
    query += ' ORDER BY sdr.incident_date DESC, sdr.incident_time DESC LIMIT 100';
    
    const [incidents] = await pool.execute(query, params);
    
    res.json({ success: true, incidents, total: incidents.length });
  } catch (error) {
    console.error('Incidents Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/incidents/record', authenticateToken, requireRole(['dod', 'patron', 'matron', 'teacher', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { student_id, incident_type, severity, incident_date, incident_time, location, description, witnesses, immediate_action } = req.body;
    
    const [student] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id = ?', [student_id]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found in global student sheet' });
    
    const [result] = await pool.execute(`
      INSERT INTO student_discipline_records 
      (student_id, incident_type, severity, incident_date, incident_time, location, description, witnesses, immediate_action, reported_by, reported_by_name, resolution_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [student_id, incident_type, severity, incident_date, incident_time, location, description, witnesses, immediate_action, req.user.userId, req.user.name]);
    
    const severityPoints = { 'low': 2, 'medium': 5, 'high': 10, 'critical': 20 };
    const points = severityPoints[severity] || 5;
    
    const [incidents] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low
      FROM student_discipline_records 
      WHERE student_id = ?
    `, [student_id]);
    
    const conductScore = Math.max(0, 100 - 
      (incidents[0].critical * 20) - 
      (incidents[0].high * 10) - 
      (incidents[0].medium * 5) - 
      (incidents[0].low * 2)
    );
    
    const conductGrade = conductScore >= 90 ? 'A' : conductScore >= 80 ? 'B' : conductScore >= 70 ? 'C' : conductScore >= 60 ? 'D' : 'F';
    const conductStatus = conductScore >= 90 ? 'excellent' : conductScore >= 75 ? 'good' : conductScore >= 60 ? 'fair' : 'poor';
    
    await pool.execute(`
      UPDATE global_student_sheets 
      SET conduct_score = ?, conduct_grade = ?, conduct_status = ?, last_updated = NOW()
      WHERE student_id = ?
    `, [conductScore, conductGrade, conductStatus, student_id]);
    
    await pool.execute(`
      INSERT INTO student_notifications (student_id, title, message, type, priority)
      VALUES (?, 'Discipline Incident Recorded', ?, 'discipline', 'high')
    `, [student_id, `An incident has been recorded: ${incident_type}. Please maintain good conduct.`]);
    
    await pool.execute(`
      INSERT INTO parent_notifications (student_id, title, message, type, priority)
      VALUES (?, 'Discipline Alert', ?, 'discipline', 'high')
    `, [student_id, `Your child ${student[0].first_name} ${student[0].last_name} was involved in a ${severity} severity incident: ${incident_type} on ${incident_date}. Please contact the school.`]);
    
    res.json({ 
      success: true, 
      message: 'Incident recorded and conduct score updated', 
      incident_id: result.insertId,
      new_conduct_score: conductScore
    });
  } catch (error) {
    console.error('Record Incident Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/incidents/:incidentId/resolve', authenticateToken, requireRole(['dod', 'patron', 'matron']), async (req, res) => {
  try {
    const { resolution, action_taken, parents_notified, follow_up_required, follow_up_date, resolution_notes, send_sms_to_parents } = req.body;
    
    // First get the incident details to find the student
    const [incident] = await pool.execute(`
      SELECT sdr.*, gs.first_name, gs.last_name, gs.guardian_phone, gs.parent_phone
      FROM student_discipline_records sdr
      LEFT JOIN global_student_sheets gs ON sdr.student_id = gs.student_id
      WHERE sdr.id = ?
    `, [req.params.incidentId]);
    
    if (!incident[0]) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    
    await pool.execute(`
      UPDATE student_discipline_records 
      SET resolution = ?,
          action_taken = ?,
          parents_notified = ?,
          follow_up_required = ?,
          follow_up_date = ?,
          resolution_notes = ?,
          resolution_status = 'resolved',
          resolved_by = ?,
          resolved_at = NOW()
      WHERE id = ?
    `, [resolution, action_taken, parents_notified, follow_up_required, follow_up_date, resolution_notes, req.user.userId, req.params.incidentId]);
    
    // Send SMS to parents if requested
    if (send_sms_to_parents && incident[0].guardian_phone) {
      const studentName = `${incident[0].first_name} ${incident[0].last_name}`;
      const message = `Dear Parent/Guardian,\n\nGood news! The disciplinary action for ${studentName} has been resolved.\n\nResolution: ${resolution}\n\nThank you for your cooperation.\n- G.S RUHONGA SECONDARY SCHOOL`;
      
      try {
        // Insert into SMS queue
        await pool.execute(`
          INSERT INTO sms_queue (phone, message, status, created_at)
          VALUES (?, ?, 'pending', NOW())
        `, [incident[0].guardian_phone, message]);
        
        console.log(`SMS queued for parent: ${incident[0].guardian_phone}`);
      } catch (smsError) {
        console.error('SMS queue error:', smsError);
      }
    }
    
    res.json({ success: true, message: 'Incident resolved successfully', sms_sent: !!send_sms_to_parents });
  } catch (error) {
    console.error('Resolve Incident Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT CONDUCT TRACKING
// ============================================
router.get('/conduct/student/:studentId', authenticateToken, requireRole(['dod', 'patron', 'matron', 'admin', 'headmaster', 'teacher', 'advisor']), async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [req.params.studentId]);
    
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [incidents] = await pool.execute(`
      SELECT * FROM student_discipline_records 
      WHERE student_id = ?
      ORDER BY incident_date DESC, incident_time DESC
    `, [req.params.studentId]);
    
    const [incidentSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_count,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_count,
        COUNT(CASE WHEN incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as recent_incidents
      FROM student_discipline_records 
      WHERE student_id = ?
    `, [req.params.studentId]);
    
    res.json({
      success: true,
      student_info: {
        student_id: student[0].student_id,
        name: `${student[0].first_name} ${student[0].last_name}`,
        student_code: student[0].student_code,
        class: student[0].class_name,
        trade: student[0].trade_name,
        conduct_score: student[0].conduct_score,
        conduct_grade: student[0].conduct_grade,
        conduct_status: student[0].conduct_status
      },
      incidents: incidents,
      summary: incidentSummary[0]
    });
  } catch (error) {
    console.error('Student Conduct Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/conduct/rankings', authenticateToken, requireRole(['dod', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, limit = 50 } = req.query;
    
    let query = `
      SELECT student_id, student_code, first_name, last_name, class_name, trade_name, conduct_score, conduct_grade, conduct_status
      FROM global_student_sheets
      WHERE status = 'active' AND conduct_score IS NOT NULL
    `;
    const params = [];
    
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND level_number = ?'; params.push(level_number); }
    
    query += ' ORDER BY conduct_score DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [rankings] = await pool.execute(query, params);
    
    res.json({ success: true, rankings, total: rankings.length });
  } catch (error) {
    console.error('Conduct Rankings Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// BEHAVIOR INTERVENTION PROGRAMS
// ============================================
router.post('/interventions/create', authenticateToken, requireRole(['dod', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, program_name, intervention_type, reason, goals, strategies, duration_weeks, start_date, stakeholders } = req.body;
    
    const [student] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id = ?', [student_id]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [result] = await pool.execute(`
      INSERT INTO behavior_intervention_programs 
      (student_id, program_name, intervention_type, reason, goals, strategies, duration_weeks, start_date, stakeholders, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [student_id, program_name, intervention_type, reason, goals, strategies, duration_weeks, start_date, stakeholders, req.user.userId]);
    
    await pool.execute(`
      INSERT INTO student_notifications (student_id, title, message, type, priority)
      VALUES (?, 'Behavior Support Program', ?, 'discipline', 'medium')
    `, [student_id, `You have been enrolled in ${program_name} to support your behavioral development.`]);
    
    res.json({ success: true, message: 'Intervention program created', program_id: result.insertId });
  } catch (error) {
    console.error('Create Intervention Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/interventions/:programId/progress', authenticateToken, requireRole(['dod', 'patron', 'matron']), async (req, res) => {
  try {
    const { progress_notes, behavior_change, effectiveness, challenges, adjustments } = req.body;
    
    await pool.execute(`
      INSERT INTO intervention_progress_tracking 
      (program_id, progress_notes, behavior_change, effectiveness, challenges, adjustments, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [req.params.programId, progress_notes, behavior_change, effectiveness, challenges, adjustments, req.user.userId]);
    
    res.json({ success: true, message: 'Progress recorded successfully' });
  } catch (error) {
    console.error('Intervention Progress Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/interventions/student/:studentId', authenticateToken, requireRole(['dod', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [programs] = await pool.execute(`
      SELECT * FROM behavior_intervention_programs 
      WHERE student_id = ?
      ORDER BY start_date DESC
    `, [req.params.studentId]);
    
    res.json({ success: true, programs, total: programs.length });
  } catch (error) {
    console.error('Student Interventions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PARENT COMMUNICATION (Patron/Matron Integration)
// ============================================
router.post('/parent-communication/send', authenticateToken, requireRole(['dod', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, subject, message, urgency, requires_response } = req.body;
    
    const [student] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id = ?', [student_id]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [result] = await pool.execute(`
      INSERT INTO parent_communications 
      (student_id, sender_id, sender_name, sender_role, subject, message, urgency, requires_response, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent')
    `, [student_id, req.user.userId, req.user.name, req.user.role, subject, message, urgency, requires_response]);
    
    await pool.execute(`
      INSERT INTO parent_notifications (student_id, title, message, type, priority)
      VALUES (?, ?, ?, 'communication', ?)
    `, [student_id, subject, message, urgency]);
    
    res.json({ success: true, message: 'Communication sent to parent', communication_id: result.insertId });
  } catch (error) {
    console.error('Parent Communication Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ANALYTICS & REPORTS
// ============================================
router.get('/analytics/trends', authenticateToken, requireRole(['dod', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [monthlyTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(incident_date, '%Y-%m') as month,
        COUNT(*) as incident_count,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_count,
        COUNT(DISTINCT student_id) as students_involved
      FROM student_discipline_records
      WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(incident_date, '%Y-%m')
      ORDER BY month DESC
    `);
    
    const [incidentsByTrade] = await pool.execute(`
      SELECT 
        gs.trade_name,
        gs.trade_code,
        COUNT(sdr.id) as incident_count,
        COUNT(DISTINCT sdr.student_id) as students_with_incidents,
        AVG(gs.conduct_score) as avg_conduct_score
      FROM global_student_sheets gs
      LEFT JOIN student_discipline_records sdr ON gs.student_id = sdr.student_id
      WHERE gs.status = 'active'
      GROUP BY gs.trade_name, gs.trade_code
      ORDER BY incident_count DESC
    `);
    
    const [resolutionEffectiveness] = await pool.execute(`
      SELECT 
        resolution_status,
        COUNT(*) as count,
        AVG(DATEDIFF(resolved_at, incident_date)) as avg_resolution_days
      FROM student_discipline_records
      WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY resolution_status
    `);
    
    res.json({
      success: true,
      analytics: {
        monthly_trends: monthlyTrends,
        incidents_by_trade: incidentsByTrade,
        resolution_effectiveness: resolutionEffectiveness
      }
    });
  } catch (error) {
    console.error('Discipline Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADVANCED STUDENT SEARCHING (DOD, Patron, Matron)
// ============================================
const { sendUniversalMessage } = require('../services/smsService');

router.get('/students/advanced-search', authenticateToken, requireRole(['dod', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      search_term,
      trade_code,
      level_number,
      conduct_min,
      conduct_max,
      incident_count_min,
      has_recent_incidents,
      sort_by = 'conduct_score',
      order = 'ASC',
      limit = 50,
      offset = 0
    } = req.query;
    
    let query = `
      SELECT 
        gs.*,
        COUNT(DISTINCT dr.id) as total_incidents,
        COUNT(DISTINCT CASE WHEN dr.incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN dr.id END) as recent_incidents,
        MAX(dr.incident_date) as last_incident_date,
        (SELECT COUNT(*) FROM behavior_intervention_programs 
         WHERE student_sheet_id = gs.id AND status = 'active') as active_interventions,
        CASE 
          WHEN gs.conduct_score >= 90 THEN 'Excellent'
          WHEN gs.conduct_score >= 75 THEN 'Good'
          WHEN gs.conduct_score >= 60 THEN 'Fair'
          ELSE 'Poor'
        END as conduct_category
      FROM global_student_sheets gs
      LEFT JOIN student_discipline_records dr ON gs.student_id = dr.student_id
      WHERE gs.status = 'active'
    `;
    const params = [];
    
    if (search_term) {
      query += ` AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_code LIKE ?)`;
      const term = `%${search_term}%`;
      params.push(term, term, term);
    }
    
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    if (conduct_min) { query += ' AND gs.conduct_score >= ?'; params.push(conduct_min); }
    if (conduct_max) { query += ' AND gs.conduct_score <= ?'; params.push(conduct_max); }
    
    query += ' GROUP BY gs.id';
    
    if (incident_count_min) {
      query += ' HAVING total_incidents >= ?';
      params.push(incident_count_min);
    }
    
    if (has_recent_incidents === 'true') {
      query += incident_count_min ? ' AND recent_incidents > 0' : ' HAVING recent_incidents > 0';
    }
    
    query += ` ORDER BY ${sort_by} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [students] = await pool.execute(query, params);
    
    let countQuery = `
      SELECT COUNT(DISTINCT gs.id) as total
      FROM global_student_sheets gs
      LEFT JOIN student_discipline_records dr ON gs.student_id = dr.student_id
      WHERE gs.status = 'active'
    `;
    const countParams = [];
    
    if (search_term) {
      countQuery += ` AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_code LIKE ?)`;
      const term = `%${search_term}%`;
      countParams.push(term, term, term);
    }
    if (trade_code) { countQuery += ' AND gs.trade_code = ?'; countParams.push(trade_code); }
    if (level_number) { countQuery += ' AND gs.level_number = ?'; countParams.push(level_number); }
    if (conduct_min) { countQuery += ' AND gs.conduct_score >= ?'; countParams.push(conduct_min); }
    if (conduct_max) { countQuery += ' AND gs.conduct_score <= ?'; countParams.push(conduct_max); }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      students,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + students.length) < countResult[0].total
      }
    });
  } catch (error) {
    console.error('Advanced Student Search Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students/:studentId/behavior-profile', authenticateToken, requireRole(['dod', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ? OR id = ?
    `, [req.params.studentId, req.params.studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const studentId = student[0].student_id;
    
    const [incidents] = await pool.execute(`
      SELECT * FROM student_discipline_records
      WHERE student_id = ?
      ORDER BY incident_date DESC, incident_time DESC
    `, [studentId]);
    
    const [interventions] = await pool.execute(`
      SELECT * FROM behavior_intervention_programs
      WHERE student_sheet_id = ? OR student_code = ?
      ORDER BY created_at DESC
    `, [student[0].id, student[0].student_code]);
    
    const [conductHistory] = await pool.execute(`
      SELECT * FROM student_conduct_tracking
      WHERE student_id = ? OR sheet_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [studentId, student[0].id]);
    
    const [parents] = await pool.execute(`
      SELECT * FROM student_parents
      WHERE student_id = ? OR student_sheet_id = ?
    `, [studentId, student[0].id]);
    
    const incidentStats = {
      total: incidents.length,
      critical: incidents.filter(i => i.severity === 'critical').length,
      high: incidents.filter(i => i.severity === 'high').length,
      medium: incidents.filter(i => i.severity === 'medium').length,
      low: incidents.filter(i => i.severity === 'low').length,
      last_30_days: incidents.filter(i => new Date(i.incident_date) >= new Date(Date.now() - 30*24*60*60*1000)).length,
      resolved: incidents.filter(i => i.resolution_status === 'resolved').length,
      pending: incidents.filter(i => i.resolution_status === 'pending').length
    };
    
    res.json({
      success: true,
      behavior_profile: {
        student: student[0],
        incidents: incidents.slice(0, 10),
        incident_stats: incidentStats,
        interventions: interventions,
        conduct_history: conductHistory,
        parent_contacts: parents
      }
    });
  } catch (error) {
    console.error('Behavior Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PARENT COMMUNICATION (DOD, Patron, Matron)
// ============================================
router.post('/students/:studentId/contact-parent', authenticateToken, requireRole(['dod', 'patron', 'matron']), async (req, res) => {
  try {
    const { message, reason, notification_type } = req.body;
    
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ? OR id = ?
    `, [req.params.studentId, req.params.studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [parents] = await pool.execute(`
      SELECT * FROM student_parents 
      WHERE (student_id = ? OR student_sheet_id = ?) AND is_primary = true
    `, [student[0].student_id, student[0].id]);
    
    if (!parents[0] || !parents[0].phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'No primary parent contact found' 
      });
    }
    
    const fullMessage = `Dear ${parents[0].parent_name}, regarding ${student[0].first_name} ${student[0].last_name} (${student[0].student_code}): ${message}`;
    
    const smsResult = await sendUniversalMessage(
      parents[0].phone,
      fullMessage,
      req.user.userId,
      {
        type: 'discipline_notification',
        student_id: student[0].student_code,
        reason: reason
      }
    );
    
    if (smsResult.success) {
      await pool.execute(`
        INSERT INTO parent_notifications 
        (student_sheet_id, student_code, parent_phone, title, message, type, priority, sent_by, sent_by_role)
        VALUES (?, ?, ?, ?, ?, ?, 'high', ?, ?)
      `, [student[0].id, student[0].student_code, parents[0].phone, 
          `Discipline Notification: ${reason}`, fullMessage, 
          notification_type || 'discipline', req.user.userId, req.user.role]);
      
      await pool.execute(`
        INSERT INTO system_activity_log 
        (user_id, user_name, action, details, created_at)
        VALUES (?, ?, 'parent_contacted_discipline', ?, NOW())
      `, [req.user.userId, req.user.name, JSON.stringify({
        student_code: student[0].student_code,
        student_name: `${student[0].first_name} ${student[0].last_name}`,
        parent_phone: parents[0].phone,
        reason: reason
      })]);
      
      res.json({
        success: true,
        message: 'Parent contacted successfully',
        method: smsResult.method
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message to parent',
        error: smsResult.error
      });
    }
  } catch (error) {
    console.error('Contact Parent Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/students/bulk-parent-notification', authenticateToken, requireRole(['dod', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_ids, message, reason, notification_type } = req.body;
    
    const results = {
      total: student_ids.length,
      sent: 0,
      failed: 0,
      details: []
    };
    
    for (const studentId of student_ids) {
      try {
        const [student] = await pool.execute(`
          SELECT * FROM global_student_sheets WHERE student_id = ? OR id = ?
        `, [studentId, studentId]);
        
        if (!student[0]) {
          results.failed++;
          results.details.push({
            student_id: studentId,
            status: 'failed',
            reason: 'Student not found'
          });
          continue;
        }
        
        const [parents] = await pool.execute(`
          SELECT * FROM student_parents 
          WHERE (student_id = ? OR student_sheet_id = ?) AND is_primary = true
        `, [student[0].student_id, student[0].id]);
        
        if (!parents[0] || !parents[0].phone) {
          results.failed++;
          results.details.push({
            student_code: student[0].student_code,
            student_name: `${student[0].first_name} ${student[0].last_name}`,
            status: 'failed',
            reason: 'No parent contact'
          });
          continue;
        }
        
        const fullMessage = `Dear ${parents[0].parent_name}, regarding ${student[0].first_name} ${student[0].last_name} (${student[0].student_code}): ${message}`;
        
        const smsResult = await sendUniversalMessage(
          parents[0].phone,
          fullMessage,
          req.user.userId,
          {
            type: 'bulk_discipline_notification',
            student_id: student[0].student_code,
            reason: reason
          }
        );
        
        if (smsResult.success) {
          await pool.execute(`
            INSERT INTO parent_notifications 
            (student_sheet_id, student_code, parent_phone, title, message, type, priority, sent_by, sent_by_role)
            VALUES (?, ?, ?, ?, ?, ?, 'high', ?, ?)
          `, [student[0].id, student[0].student_code, parents[0].phone, 
              `Bulk Notification: ${reason}`, fullMessage, 
              notification_type || 'discipline', req.user.userId, req.user.role]);
          
          results.sent++;
          results.details.push({
            student_code: student[0].student_code,
            student_name: `${student[0].first_name} ${student[0].last_name}`,
            parent_phone: parents[0].phone,
            status: 'sent',
            method: smsResult.method
          });
        } else {
          results.failed++;
          results.details.push({
            student_code: student[0].student_code,
            student_name: `${student[0].first_name} ${student[0].last_name}`,
            status: 'failed',
            reason: smsResult.error
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          student_id: studentId,
          status: 'failed',
          reason: error.message
        });
      }
    }
    
    await pool.execute(`
      INSERT INTO system_activity_log 
      (user_id, user_name, action, details, created_at)
      VALUES (?, ?, 'bulk_parent_notification_sent', ?, NOW())
    `, [req.user.userId, req.user.name, JSON.stringify(results)]);
    
    res.json({
      success: true,
      message: `Sent ${results.sent} notifications, ${results.failed} failed`,
      results
    });
  } catch (error) {
    console.error('Bulk Parent Notification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

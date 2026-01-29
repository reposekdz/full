const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/discipline/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Roles that can access discipline management
const DISCIPLINE_ROLES = ['dod', 'matron', 'patron', 'admin'];

// ==========================================
// DASHBOARD & OVERVIEW
// ==========================================

router.get('/overview', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const [totalIncidents] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records 
      WHERE DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [activeWarnings] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records 
      WHERE status = 'active' AND severity IN ('minor', 'moderate')
    `);
    
    const [suspensions] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records scr
      JOIN discipline_actions da ON scr.action_id = da.id
      WHERE da.action_type = 'suspension' AND scr.status = 'active'
    `);
    
    const [pendingFollowUps] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_conduct_records 
      WHERE follow_up_required = TRUE AND follow_up_date <= CURDATE() AND status = 'active'
    `);
    
    const [recentIncidents] = await pool.execute(`
      SELECT scr.*, u.first_name, u.last_name, u.student_id, 
        tc.class_name, dc.name as category_name, da.name as action_name,
        reporter.first_name as reporter_first, reporter.last_name as reporter_last
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN discipline_categories dc ON scr.category_id = dc.id
      LEFT JOIN discipline_actions da ON scr.action_id = da.id
      LEFT JOIN users reporter ON scr.reported_by = reporter.id
      ORDER BY scr.incident_date DESC
      LIMIT 20
    `);
    
    const [severityStats] = await pool.execute(`
      SELECT severity, COUNT(*) as count
      FROM student_conduct_records
      WHERE DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY severity
    `);
    
    const [monthlyTrend] = await pool.execute(`
      SELECT DATE_FORMAT(incident_date, '%Y-%m') as month, COUNT(*) as count
      FROM student_conduct_records
      WHERE DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month
    `);
    
    res.json({
      success: true,
      data: {
        total_incidents_30days: totalIncidents[0].total,
        active_warnings: activeWarnings[0].total,
        active_suspensions: suspensions[0].total,
        pending_followups: pendingFollowUps[0].total,
        recent_incidents: recentIncidents,
        severity_stats: severityStats,
        monthly_trend: monthlyTrend
      }
    });
  } catch (error) {
    console.error('DOD overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT MANAGEMENT
// ==========================================

router.get('/students', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { severity, status, class_id } = req.query;
    
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.student_id, u.phone, u.email,
        tc.class_name, tl.trade_name, tl.level_number,
        (SELECT COUNT(*) FROM student_conduct_records WHERE student_id = u.id) as total_incidents,
        (SELECT COUNT(*) FROM student_conduct_records WHERE student_id = u.id AND DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_incidents,
        (SELECT SUM(points) FROM student_behavior_points WHERE student_id = u.id AND point_type = 'negative') as negative_points,
        (SELECT SUM(points) FROM student_behavior_points WHERE student_id = u.id AND point_type = 'positive') as positive_points,
        (SELECT incident_date FROM student_conduct_records WHERE student_id = u.id ORDER BY incident_date DESC LIMIT 1) as last_incident
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.role = 'student' AND u.is_active = TRUE
    `;
    
    const params = [];
    if (class_id) {
      query += ' AND tc.id = ?';
      params.push(class_id);
    }
    
    query += ' ORDER BY recent_incidents DESC, total_incidents DESC';
    
    const [students] = await pool.execute(query, params);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students/:id/history', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [records] = await pool.execute(`
      SELECT scr.*, dc.name as category_name, da.name as action_name, da.action_type,
        reporter.first_name as reporter_first, reporter.last_name as reporter_last,
        handler.first_name as handler_first, handler.last_name as handler_last
      FROM student_conduct_records scr
      LEFT JOIN discipline_categories dc ON scr.category_id = dc.id
      LEFT JOIN discipline_actions da ON scr.action_id = da.id
      LEFT JOIN users reporter ON scr.reported_by = reporter.id
      LEFT JOIN users handler ON scr.handled_by = handler.id
      WHERE scr.student_id = ?
      ORDER BY scr.incident_date DESC
    `, [id]);
    
    const [behaviorPoints] = await pool.execute(`
      SELECT sbp.*, u.first_name, u.last_name
      FROM student_behavior_points sbp
      LEFT JOIN users u ON sbp.awarded_by = u.id
      WHERE sbp.student_id = ?
      ORDER BY sbp.created_at DESC
    `, [id]);
    
    const [counselingSessions] = await pool.execute(`
      SELECT scs.*, u.first_name as counselor_first, u.last_name as counselor_last
      FROM student_counseling_sessions scs
      JOIN users u ON scs.counselor_id = u.id
      WHERE scs.student_id = ?
      ORDER BY scs.session_date DESC
    `, [id]);
    
    res.json({ success: true, records, behavior_points: behaviorPoints, counseling_sessions: counselingSessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// CONDUCT RECORDS
// ==========================================

router.post('/incidents/create', authenticateToken, requireRole(...DISCIPLINE_ROLES), upload.array('attachments', 5), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { 
      student_id, incident_type, category_id, description, location, 
      severity, action_id, action_taken, action_start_date, action_end_date,
      parent_notified, follow_up_required, follow_up_date, reported_by 
    } = req.body;
    
    const handlerId = req.user.id;
    const attachments = req.files ? req.files.map(f => f.filename) : [];
    
    const [result] = await connection.execute(`
      INSERT INTO student_conduct_records (
        student_id, incident_type, category_id, description, location, severity,
        reported_by, handled_by, action_id, action_taken, action_start_date, action_end_date,
        parent_notified, follow_up_required, follow_up_date, status, attachments, incident_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW())
    `, [
      student_id, incident_type, category_id, description, location, severity || 'moderate',
      reported_by || handlerId, handlerId, action_id, action_taken, action_start_date, action_end_date,
      parent_notified || false, follow_up_required || false, follow_up_date, JSON.stringify(attachments)
    ]);
    
    // Add negative behavior points
    const pointsMap = { minor: 5, moderate: 10, major: 20, severe: 30 };
    await connection.execute(`
      INSERT INTO student_behavior_points (student_id, points, point_type, reason, awarded_by, conduct_record_id)
      VALUES (?, ?, 'negative', ?, ?, ?)
    `, [student_id, pointsMap[severity] || 10, `Incident: ${incident_type}`, handlerId, result.insertId]);
    
    // Send parent notification if required
    if (parent_notified) {
      const [student] = await connection.execute('SELECT first_name, last_name FROM users WHERE id = ?', [student_id]);
      const studentName = `${student[0].first_name} ${student[0].last_name}`;
      
      await connection.execute(`
        INSERT INTO parent_notifications (student_id, notification_type, subject, message, sent_by, conduct_record_id)
        VALUES (?, 'discipline', ?, ?, ?, ?)
      `, [
        student_id, 
        `Discipline Notice - ${incident_type}`,
        `Dear Parent, ${studentName} was involved in a ${severity} incident: ${description}. Action taken: ${action_taken}`,
        handlerId,
        result.insertId
      ]);
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Incident recorded successfully', incident_id: result.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

router.put('/incidents/:id/update', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes, follow_up_notes } = req.body;
    
    const updates = [];
    const params = [];
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'resolved') {
        updates.push('resolved_date = NOW()');
      }
    }
    if (resolution_notes) {
      updates.push('resolution_notes = ?');
      params.push(resolution_notes);
    }
    if (follow_up_notes) {
      updates.push('follow_up_notes = ?');
      params.push(follow_up_notes);
    }
    
    params.push(id);
    
    await pool.execute(`UPDATE student_conduct_records SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Incident updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/incidents/:id', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    await pool.execute('UPDATE student_conduct_records SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
    res.json({ success: true, message: 'Incident cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// BEHAVIOR POINTS
// ==========================================

router.post('/behavior-points/award', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { student_id, points, point_type, reason } = req.body;
    const awardedBy = req.user.id;
    
    await pool.execute(`
      INSERT INTO student_behavior_points (student_id, points, point_type, reason, awarded_by)
      VALUES (?, ?, ?, ?, ?)
    `, [student_id, points, point_type, reason, awardedBy]);
    
    res.json({ success: true, message: 'Behavior points awarded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/behavior-points/leaderboard', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const [positive] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, tc.class_name,
        SUM(sbp.points) as total_points
      FROM student_behavior_points sbp
      JOIN users u ON sbp.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE sbp.point_type = 'positive'
      GROUP BY u.id
      ORDER BY total_points DESC
      LIMIT 20
    `);
    
    const [negative] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, tc.class_name,
        SUM(sbp.points) as total_points
      FROM student_behavior_points sbp
      JOIN users u ON sbp.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE sbp.point_type = 'negative'
      GROUP BY u.id
      ORDER BY total_points DESC
      LIMIT 20
    `);
    
    res.json({ success: true, positive_leaderboard: positive, negative_leaderboard: negative });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// DORMITORY INSPECTIONS
// ==========================================

router.post('/inspections/create', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { 
      dormitory_name, room_number, inspection_date, inspection_time,
      cleanliness_score, organization_score, discipline_score,
      issues_found, recommendations, students_present, status, follow_up_required, follow_up_date
    } = req.body;
    
    const inspectorId = req.user.id;
    const totalScore = (cleanliness_score || 0) + (organization_score || 0) + (discipline_score || 0);
    
    const [result] = await pool.execute(`
      INSERT INTO dormitory_inspections (
        dormitory_name, room_number, inspection_date, inspection_time, inspector_id,
        cleanliness_score, organization_score, discipline_score, total_score,
        issues_found, recommendations, students_present, status, follow_up_required, follow_up_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      dormitory_name, room_number, inspection_date, inspection_time, inspectorId,
      cleanliness_score, organization_score, discipline_score, totalScore,
      issues_found, recommendations, JSON.stringify(students_present), status, follow_up_required, follow_up_date
    ]);
    
    res.json({ success: true, message: 'Inspection recorded successfully', inspection_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inspections', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { dormitory, status, start_date, end_date } = req.query;
    
    let query = `
      SELECT di.*, u.first_name, u.last_name
      FROM dormitory_inspections di
      JOIN users u ON di.inspector_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (dormitory) {
      query += ' AND di.dormitory_name = ?';
      params.push(dormitory);
    }
    if (status) {
      query += ' AND di.status = ?';
      params.push(status);
    }
    if (start_date) {
      query += ' AND di.inspection_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND di.inspection_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY di.inspection_date DESC, di.inspection_time DESC';
    
    const [inspections] = await pool.execute(query, params);
    res.json({ success: true, inspections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// COUNSELING SESSIONS
// ==========================================

router.post('/counseling/schedule', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { student_id, session_date, session_type, reason, notes } = req.body;
    const counselorId = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO student_counseling_sessions (student_id, counselor_id, session_date, session_type, reason, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
    `, [student_id, counselorId, session_date, session_type || 'individual', reason, notes]);
    
    res.json({ success: true, message: 'Counseling session scheduled', session_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/counseling/:id/complete', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, recommendations, follow_up_required, follow_up_date } = req.body;
    
    await pool.execute(`
      UPDATE student_counseling_sessions 
      SET status = 'completed', notes = ?, recommendations = ?, follow_up_required = ?, follow_up_date = ?
      WHERE id = ?
    `, [notes, recommendations, follow_up_required, follow_up_date, id]);
    
    res.json({ success: true, message: 'Session completed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/counseling/sessions', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { student_id, status } = req.query;
    
    let query = `
      SELECT scs.*, 
        s.first_name as student_first, s.last_name as student_last, s.student_id as student_number,
        c.first_name as counselor_first, c.last_name as counselor_last
      FROM student_counseling_sessions scs
      JOIN users s ON scs.student_id = s.id
      JOIN users c ON scs.counselor_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ' AND scs.student_id = ?';
      params.push(student_id);
    }
    if (status) {
      query += ' AND scs.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY scs.session_date DESC';
    
    const [sessions] = await pool.execute(query, params);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PARENT NOTIFICATIONS
// ==========================================

router.post('/notifications/send', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { student_id, parent_id, notification_type, subject, message, delivery_method, conduct_record_id } = req.body;
    const sentBy = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO parent_notifications (student_id, parent_id, notification_type, subject, message, sent_by, delivery_method, conduct_record_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, parent_id, notification_type, subject, message, sentBy, delivery_method || 'sms', conduct_record_id]);
    
    res.json({ success: true, message: 'Notification sent successfully', notification_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/notifications', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { student_id, delivery_status } = req.query;
    
    let query = `
      SELECT pn.*, 
        s.first_name as student_first, s.last_name as student_last,
        sender.first_name as sender_first, sender.last_name as sender_last
      FROM parent_notifications pn
      JOIN users s ON pn.student_id = s.id
      JOIN users sender ON pn.sent_by = sender.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ' AND pn.student_id = ?';
      params.push(student_id);
    }
    if (delivery_status) {
      query += ' AND pn.delivery_status = ?';
      params.push(delivery_status);
    }
    
    query += ' ORDER BY pn.sent_date DESC';
    
    const [notifications] = await pool.execute(query, params);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// REPORTS & STATISTICS
// ==========================================

router.get('/reports/statistics', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [byCategory] = await pool.execute(`
      SELECT dc.name, dc.severity_level, COUNT(*) as count
      FROM student_conduct_records scr
      JOIN discipline_categories dc ON scr.category_id = dc.id
      WHERE scr.incident_date BETWEEN ? AND ?
      GROUP BY dc.id
      ORDER BY count DESC
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    const [byAction] = await pool.execute(`
      SELECT da.name, da.action_type, COUNT(*) as count
      FROM student_conduct_records scr
      JOIN discipline_actions da ON scr.action_id = da.id
      WHERE scr.incident_date BETWEEN ? AND ?
      GROUP BY da.id
      ORDER BY count DESC
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    const [bySeverity] = await pool.execute(`
      SELECT severity, COUNT(*) as count
      FROM student_conduct_records
      WHERE incident_date BETWEEN ? AND ?
      GROUP BY severity
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    const [byClass] = await pool.execute(`
      SELECT tc.class_name, tl.trade_name, COUNT(*) as count
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE scr.incident_date BETWEEN ? AND ?
      GROUP BY tc.id
      ORDER BY count DESC
    `, [start_date || '2024-01-01', end_date || new Date()]);
    
    res.json({ 
      success: true, 
      statistics: { 
        by_category: byCategory, 
        by_action: byAction, 
        by_severity: bySeverity,
        by_class: byClass
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/repeat-offenders', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const [offenders] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, tc.class_name,
        COUNT(*) as total_incidents,
        SUM(CASE WHEN scr.severity = 'severe' THEN 1 ELSE 0 END) as severe_incidents,
        SUM(CASE WHEN scr.severity = 'major' THEN 1 ELSE 0 END) as major_incidents,
        MAX(scr.incident_date) as last_incident
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE scr.incident_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY u.id
      HAVING total_incidents >= 3
      ORDER BY total_incidents DESC, severe_incidents DESC
    `);
    
    res.json({ success: true, repeat_offenders: offenders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// CATEGORIES & ACTIONS MANAGEMENT
// ==========================================

router.get('/categories', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT * FROM discipline_categories WHERE is_active = TRUE ORDER BY severity_level, name');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/actions', authenticateToken, requireRole(...DISCIPLINE_ROLES), async (req, res) => {
  try {
    const [actions] = await pool.execute('SELECT * FROM discipline_actions WHERE is_active = TRUE ORDER BY action_type, name');
    res.json({ success: true, actions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

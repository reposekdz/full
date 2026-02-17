const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET comprehensive dashboard with analytics
router.get('/dashboard/comprehensive', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const advisorId = req.user.id;
    
    const [profile] = await pool.execute('SELECT * FROM advisor_profiles WHERE user_id = ?', [advisorId]);
    const [totalStudents] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const [consultationsToday] = await pool.execute('SELECT COUNT(*) as count FROM advisor_consultations WHERE advisor_id = ? AND DATE(session_date) = CURDATE()', [profile[0]?.id]);
    const [pendingConsultations] = await pool.execute('SELECT COUNT(*) as count FROM advisor_consultations WHERE advisor_id = ? AND status = "scheduled"', [profile[0]?.id]);
    const [totalContacts] = await pool.execute('SELECT COUNT(*) as count FROM advisor_contacts WHERE advisor_id = ? AND status = "active"', [profile[0]?.id]);
    const [recentConsultations] = await pool.execute(`
      SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as student_name, u.student_id
      FROM advisor_consultations c
      JOIN users u ON c.student_id = u.id
      WHERE c.advisor_id = ?
      ORDER BY c.session_date DESC LIMIT 10
    `, [profile[0]?.id]);
    const [upcomingConsultations] = await pool.execute(`
      SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as student_name, u.student_id
      FROM advisor_consultations c
      JOIN users u ON c.student_id = u.id
      WHERE c.advisor_id = ? AND c.session_date > NOW() AND c.status = "scheduled"
      ORDER BY c.session_date ASC LIMIT 10
    `, [profile[0]?.id]);
    const [consultationStats] = await pool.execute(`
      SELECT consultation_type, COUNT(*) as count
      FROM advisor_consultations
      WHERE advisor_id = ? AND MONTH(session_date) = MONTH(CURDATE())
      GROUP BY consultation_type
    `, [profile[0]?.id]);

    res.json({
      success: true,
      profile: profile[0],
      stats: {
        totalStudents: totalStudents[0].count,
        consultationsToday: consultationsToday[0].count,
        pendingConsultations: pendingConsultations[0].count,
        totalContacts: totalContacts[0].count
      },
      recentConsultations,
      upcomingConsultations,
      consultationStats
    });
  } catch (error) {
    console.error('Error fetching advisor dashboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
});

// GET all contacts with filtering
router.get('/contacts', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { type, priority, status, search } = req.query;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    
    let query = 'SELECT * FROM advisor_contacts WHERE advisor_id = ?';
    const params = [profile[0].id];
    
    if (type) {
      query += ' AND contact_type = ?';
      params.push(type);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (contact_name LIKE ? OR contact_email LIKE ? OR contact_phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY priority DESC, last_contact_date DESC';
    
    const [contacts] = await pool.execute(query, params);
    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Error fetching contacts' });
  }
});

// POST create new contact
router.post('/contacts', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    const { contact_type, contact_name, contact_email, contact_phone, organization, position, relationship, priority, tags, notes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_contacts (advisor_id, contact_type, contact_name, contact_email, contact_phone, organization, position, relationship, priority, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [profile[0].id, contact_type, contact_name, contact_email, contact_phone, organization, position, relationship, priority, tags, notes]);
    
    res.json({ success: true, contactId: result.insertId });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, message: 'Error creating contact' });
  }
});

// PUT update contact
router.put('/contacts/:id', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    await pool.execute(`UPDATE advisor_contacts SET ${fields} WHERE id = ?`, values);
    res.json({ success: true, message: 'Contact updated successfully' });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Error updating contact' });
  }
});

// GET contact interactions
router.get('/contacts/:id/interactions', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [interactions] = await pool.execute(`
      SELECT * FROM advisor_contact_interactions
      WHERE contact_id = ?
      ORDER BY interaction_date DESC
    `, [id]);
    
    res.json({ success: true, interactions });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ success: false, message: 'Error fetching interactions' });
  }
});

// POST log contact interaction
router.post('/contacts/:id/interactions', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    const { interaction_type, subject, description, outcome, duration_minutes, follow_up_required, follow_up_notes, interaction_date } = req.body;
    
    await pool.execute(`
      INSERT INTO advisor_contact_interactions (contact_id, advisor_id, interaction_type, subject, description, outcome, duration_minutes, follow_up_required, follow_up_notes, interaction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, profile[0].id, interaction_type, subject, description, outcome, duration_minutes, follow_up_required, follow_up_notes, interaction_date]);
    
    await pool.execute('UPDATE advisor_contacts SET last_contact_date = ?, total_interactions = total_interactions + 1 WHERE id = ?', [interaction_date, id]);
    
    res.json({ success: true, message: 'Interaction logged successfully' });
  } catch (error) {
    console.error('Error logging interaction:', error);
    res.status(500).json({ success: false, message: 'Error logging interaction' });
  }
});

// GET all consultations
router.get('/consultations', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    
    let query = `
      SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as student_name, u.student_id, u.email, u.phone
      FROM advisor_consultations c
      JOIN users u ON c.student_id = u.id
      WHERE c.advisor_id = ?
    `;
    const params = [profile[0].id];
    
    if (type) {
      query += ' AND c.consultation_type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    if (startDate) {
      query += ' AND c.session_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND c.session_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY c.session_date DESC';
    
    const [consultations] = await pool.execute(query, params);
    res.json({ success: true, consultations });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ success: false, message: 'Error fetching consultations' });
  }
});

// POST create consultation
router.post('/consultations', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    const { student_id, consultation_type, session_date, duration_minutes, location, mode, priority, subject, description, notes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_consultations (advisor_id, student_id, consultation_type, session_date, duration_minutes, location, mode, priority, subject, description, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [profile[0].id, student_id, consultation_type, session_date, duration_minutes, location, mode, priority, subject, description, notes]);
    
    res.json({ success: true, consultationId: result.insertId });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ success: false, message: 'Error creating consultation' });
  }
});

// PUT update consultation
router.put('/consultations/:id', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    await pool.execute(`UPDATE advisor_consultations SET ${fields} WHERE id = ?`, values);
    res.json({ success: true, message: 'Consultation updated successfully' });
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({ success: false, message: 'Error updating consultation' });
  }
});

// GET student tracking data
router.get('/students/tracking', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { student_id, startDate, endDate } = req.query;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    
    let query = `
      SELECT t.*, CONCAT(u.first_name, ' ', u.last_name) as student_name, u.student_id
      FROM advisor_student_tracking t
      JOIN users u ON t.student_id = u.id
      WHERE t.advisor_id = ?
    `;
    const params = [profile[0].id];
    
    if (student_id) {
      query += ' AND t.student_id = ?';
      params.push(student_id);
    }
    if (startDate) {
      query += ' AND t.tracking_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND t.tracking_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY t.tracking_date DESC';
    
    const [tracking] = await pool.execute(query, params);
    res.json({ success: true, tracking });
  } catch (error) {
    console.error('Error fetching student tracking:', error);
    res.status(500).json({ success: false, message: 'Error fetching tracking data' });
  }
});

// POST student tracking entry
router.post('/students/tracking', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    const { student_id, tracking_date, academic_performance, attendance_rate, behavior_rating, engagement_level, concerns, strengths, goals, interventions, parent_involvement, notes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_student_tracking (advisor_id, student_id, tracking_date, academic_performance, attendance_rate, behavior_rating, engagement_level, concerns, strengths, goals, interventions, parent_involvement, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [profile[0].id, student_id, tracking_date, academic_performance, attendance_rate, behavior_rating, engagement_level, concerns, strengths, goals, interventions, parent_involvement, notes]);
    
    res.json({ success: true, trackingId: result.insertId });
  } catch (error) {
    console.error('Error creating tracking entry:', error);
    res.status(500).json({ success: false, message: 'Error creating tracking entry' });
  }
});

// GET student sheets access
router.get('/students/:studentId/sheets', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    
    const [student] = await pool.execute('SELECT * FROM users WHERE id = ?', [studentId]);
    const [grades] = await pool.execute(`
      SELECT g.*, s.subject_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN users t ON g.teacher_id = t.id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC
    `, [studentId]);
    const [attendance] = await pool.execute('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30', [studentId]);
    const [behavior] = await pool.execute('SELECT * FROM discipline_records WHERE student_id = ? ORDER BY incident_date DESC', [studentId]);
    
    await pool.execute(`
      INSERT INTO advisor_student_sheet_access (advisor_id, student_id, access_type, access_reason, access_date)
      VALUES (?, ?, 'view', 'Regular monitoring', NOW())
    `, [profile[0].id, studentId]);
    
    res.json({ success: true, student: student[0], grades, attendance, behavior });
  } catch (error) {
    console.error('Error fetching student sheets:', error);
    res.status(500).json({ success: false, message: 'Error fetching student data' });
  }
});

// GET analytics data
router.get('/analytics', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { metric_type, startDate, endDate } = req.query;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    
    let query = 'SELECT * FROM advisor_analytics_data WHERE advisor_id = ?';
    const params = [profile[0].id];
    
    if (metric_type) {
      query += ' AND metric_type = ?';
      params.push(metric_type);
    }
    if (startDate) {
      query += ' AND collection_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND collection_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY collection_date DESC';
    
    const [analytics] = await pool.execute(query, params);
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

// GET school initiatives
router.get('/initiatives', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { category, status } = req.query;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    
    let query = 'SELECT * FROM advisor_school_initiatives WHERE advisor_id = ?';
    const params = [profile[0].id];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [initiatives] = await pool.execute(query, params);
    res.json({ success: true, initiatives });
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    res.status(500).json({ success: false, message: 'Error fetching initiatives' });
  }
});

// POST create initiative
router.post('/initiatives', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    const { initiative_name, category, description, objectives, target_audience, start_date, end_date, budget, funding_source, stakeholders } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_school_initiatives (advisor_id, initiative_name, category, description, objectives, target_audience, start_date, end_date, budget, funding_source, stakeholders)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [profile[0].id, initiative_name, category, description, objectives, target_audience, start_date, end_date, budget, funding_source, stakeholders]);
    
    res.json({ success: true, initiativeId: result.insertId });
  } catch (error) {
    console.error('Error creating initiative:', error);
    res.status(500).json({ success: false, message: 'Error creating initiative' });
  }
});

// GET recommendations
router.get('/recommendations', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { type, status, priority } = req.query;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    
    let query = 'SELECT * FROM advisor_recommendations WHERE advisor_id = ?';
    const params = [profile[0].id];
    
    if (type) {
      query += ' AND recommendation_type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY priority DESC, created_at DESC';
    
    const [recommendations] = await pool.execute(query, params);
    res.json({ success: true, recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, message: 'Error fetching recommendations' });
  }
});

// POST create recommendation
router.post('/recommendations', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    const { recommendation_type, title, description, rationale, expected_impact, implementation_plan, estimated_cost, priority, target_department } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO advisor_recommendations (advisor_id, recommendation_type, title, description, rationale, expected_impact, implementation_plan, estimated_cost, priority, target_department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [profile[0].id, recommendation_type, title, description, rationale, expected_impact, implementation_plan, estimated_cost, priority, target_department]);
    
    res.json({ success: true, recommendationId: result.insertId });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ success: false, message: 'Error creating recommendation' });
  }
});

// GET reports
router.get('/reports', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { type, status } = req.query;
    const [profile] = await pool.execute('SELECT id FROM advisor_profiles WHERE user_id = ?', [req.user.id]);
    
    let query = 'SELECT * FROM advisor_reports WHERE advisor_id = ?';
    const params = [profile[0].id];
    
    if (type) {
      query += ' AND report_type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [reports] = await pool.execute(query, params);
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

// GET all students with comprehensive data
router.get('/students/all', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { trade, level, search } = req.query;
    
    let query = `
      SELECT u.*, t.name, l.level_name,
        (SELECT AVG(g.marks) FROM grades g WHERE g.student_id = u.id) as avg_grade,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id AND a.status = 'present') as attendance_count
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN trade_levels l ON u.level_id = l.id
      WHERE u.role = 'student'
    `;
    const params = [];
    
    if (trade) {
      query += ' AND u.trade_id = ?';
      params.push(trade);
    }
    if (level) {
      query += ' AND u.level_id = ?';
      params.push(level);
    }
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY u.first_name, u.last_name';
    
    const [students] = await pool.execute(query, params);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

module.exports = router;

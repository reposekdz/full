// DOD (Director of Discipline) Management Routes - Full Feature Set with Real Database
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== INCIDENTS ====================

// GET all incidents
router.get('/incidents', authenticateToken, async (req, res) => {
  try {
    const { student_id, incident_type, severity, status, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*,
        s.first_name as student_first_name, s.last_name as student_last_name, s.username as student_username,
        sp.admission_number,
        r.first_name as reported_by_first_name, r.last_name as reported_by_last_name,
        t.code, t.name
      FROM discipline_incidents i
      LEFT JOIN users s ON i.student_id = s.id
      LEFT JOIN student_profiles sp ON s.id = sp.user_id
      LEFT JOIN users r ON i.reported_by = r.id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
      LEFT JOIN trades t ON e.trade_code = t.code
      WHERE 1=1
    `;
    const params = [];

    if (student_id) { query += ` AND i.student_id = ?`; params.push(student_id); }
    if (incident_type) { query += ` AND i.incident_type = ?`; params.push(incident_type); }
    if (severity) { query += ` AND i.severity = ?`; params.push(severity); }
    if (status) { query += ` AND i.status = ?`; params.push(status); }
    if (start_date) { query += ` AND i.incident_date >= ?`; params.push(start_date); }
    if (end_date) { query += ` AND i.incident_date <= ?`; params.push(end_date); }

    query += ` ORDER BY i.incident_date DESC, i.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [incidents] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM discipline_incidents i WHERE 1=1` +
      (student_id ? ` AND i.student_id = '${student_id}'` : '') +
      (incident_type ? ` AND i.incident_type = '${incident_type}'` : '') +
      (severity ? ` AND i.severity = '${severity}'` : '') +
      (status ? ` AND i.status = '${status}'` : ''),
      []
    );

    res.json({ success: true, incidents, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ success: false, message: 'Error fetching incidents', error: error.message });
  }
});

// POST create new incident
router.post('/incidents', authenticateToken, async (req, res) => {
  try {
    const { student_id, incident_type, severity, description, location, witnesses, actions_taken, incident_date, reported_by } = req.body;

    const incidentId = `INC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    await pool.execute(`
      INSERT INTO discipline_incidents (
        incident_id, student_id, incident_type, severity, description, location, 
        witnesses, actions_taken, incident_date, reported_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      incidentId, student_id, incident_type, severity, description, location || null,
      witnesses || null, actions_taken || null, incident_date || new Date(), reported_by || req.user?.id
    ]);

    const [[created]] = await pool.execute('SELECT * FROM discipline_incidents WHERE incident_id = ?', [incidentId]);

    res.json({ success: true, message: 'Incident reported successfully', incident: created });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ success: false, message: 'Error creating incident', error: error.message });
  }
});

// PUT update incident
router.put('/incidents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { incident_type, severity, description, location, witnesses, actions_taken, status, resolution_notes } = req.body;

    await pool.execute(`
      UPDATE discipline_incidents SET 
        incident_type = ?, severity = ?, description = ?, location = ?,
        witnesses = ?, actions_taken = ?, status = ?, resolution_notes = ?, updated_at = NOW()
      WHERE id = ?
    `, [incident_type, severity, description, location || null, witnesses || null, actions_taken || null, status, resolution_notes || null, id]);

    const [[updated]] = await pool.execute('SELECT * FROM discipline_incidents WHERE id = ?', [id]);

    res.json({ success: true, message: 'Incident updated successfully', incident: updated });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ success: false, message: 'Error updating incident', error: error.message });
  }
});

// ==================== LEAVE REQUESTS ====================

// GET leave requests
router.get('/leaves', authenticateToken, async (req, res) => {
  try {
    const { student_id, leave_type, status, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.*,
        s.first_name as student_first_name, s.last_name as student_last_name, s.username as student_username,
        sp.admission_number,
        t.code, t.name
      FROM leave_requests l
      LEFT JOIN users s ON l.student_id = s.id
      LEFT JOIN student_profiles sp ON s.id = sp.user_id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
      LEFT JOIN trades t ON e.trade_code = t.code
      WHERE 1=1
    `;
    const params = [];

    if (student_id) { query += ` AND l.student_id = ?`; params.push(student_id); }
    if (leave_type) { query += ` AND l.leave_type = ?`; params.push(leave_type); }
    if (status) { query += ` AND l.status = ?`; params.push(status); }
    if (start_date) { query += ` AND l.start_date >= ?`; params.push(start_date); }
    if (end_date) { query += ` AND l.end_date <= ?`; params.push(end_date); }

    query += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [leaves] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM leave_requests l WHERE 1=1` +
      (student_id ? ` AND l.student_id = '${student_id}'` : '') +
      (leave_type ? ` AND l.leave_type = '${leave_type}'` : '') +
      (status ? ` AND l.status = '${status}'` : ''),
      []
    );

    res.json({ success: true, leaves, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching leave requests', error: error.message });
  }
});

// POST create leave request
router.post('/leaves', authenticateToken, async (req, res) => {
  try {
    const { student_id, leave_type, start_date, end_date, reason, supporting_document } = req.body;

    await pool.execute(`
      INSERT INTO leave_requests (
        student_id, leave_type, start_date, end_date, reason, supporting_document, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [student_id, leave_type, start_date, end_date, reason, supporting_document || null]);

    const [[created]] = await pool.execute(
      'SELECT * FROM leave_requests WHERE student_id = ? AND created_at >= NOW() - INTERVAL 1 MINUTE ORDER BY created_at DESC LIMIT 1',
      [student_id]
    );

    res.json({ success: true, message: 'Leave request submitted successfully', leave: created });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ success: false, message: 'Error creating leave request', error: error.message });
  }
});

// PUT approve/reject leave
router.put('/leaves/:id/decision', authenticateToken, requireRole('director_discipline', 'matron', 'patron', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, decision_notes, decision_by } = req.body;

    await pool.execute(`
      UPDATE leave_requests SET 
        status = ?, decision_notes = ?, decision_by = ?, decided_at = NOW()
      WHERE id = ?
    `, [status, decision_notes || null, decision_by || req.user?.id, id]);

    const [[updated]] = await pool.execute('SELECT * FROM leave_requests WHERE id = ?', [id]);

    res.json({ success: true, message: `Leave ${status} successfully`, leave: updated });
  } catch (error) {
    console.error('Error processing leave request:', error);
    res.status(500).json({ success: false, message: 'Error processing leave request', error: error.message });
  }
});

// ==================== CONDUCT RECORDS ====================

// GET conduct records
router.get('/conduct', authenticateToken, async (req, res) => {
  try {
    const { student_id, academic_year, term, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cr.*,
        s.first_name as student_first_name, s.last_name as student_last_name, s.username as student_username,
        sp.admission_number
      FROM conduct_records cr
      LEFT JOIN users s ON cr.student_id = s.id
      LEFT JOIN student_profiles sp ON s.id = sp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) { query += ` AND cr.student_id = ?`; params.push(student_id); }
    if (academic_year) { query += ` AND cr.academic_year = ?`; params.push(academic_year); }
    if (term) { query += ` AND cr.term = ?`; params.push(term); }

    query += ` ORDER BY cr.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [records] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM conduct_records cr WHERE 1=1` +
      (student_id ? ` AND cr.student_id = '${student_id}'` : ''),
      []
    );

    res.json({ success: true, records, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching conduct records:', error);
    res.status(500).json({ success: false, message: 'Error fetching conduct records', error: error.message });
  }
});

// POST create conduct record
router.post('/conduct', authenticateToken, async (req, res) => {
  try {
    const { student_id, academic_year, term, conduct_grade, teacher_remarks, dos_remarks, points } = req.body;

    await pool.execute(`
      INSERT INTO conduct_records (
        student_id, academic_year, term, conduct_grade, teacher_remarks, dos_remarks, points, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [student_id, academic_year, term, conduct_grade, teacher_remarks || null, dos_remarks || null, points || 0]);

    const [[created]] = await pool.execute(
      'SELECT * FROM conduct_records WHERE student_id = ? AND academic_year = ? AND term = ? ORDER BY created_at DESC LIMIT 1',
      [student_id, academic_year, term]
    );

    res.json({ success: true, message: 'Conduct record created successfully', record: created });
  } catch (error) {
    console.error('Error creating conduct record:', error);
    res.status(500).json({ success: false, message: 'Error creating conduct record', error: error.message });
  }
});

// ==================== COUNSELING SESSIONS ====================

// GET counseling sessions
router.get('/counseling', authenticateToken, async (req, res) => {
  try {
    const { student_id, counselor_id, session_type, status, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cs.*,
        s.first_name as student_first_name, s.last_name as student_last_name,
        c.first_name as counselor_first_name, c.last_name as counselor_last_name
      FROM counseling_sessions cs
      LEFT JOIN users s ON cs.student_id = s.id
      LEFT JOIN users c ON cs.counselor_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) { query += ` AND cs.student_id = ?`; params.push(student_id); }
    if (counselor_id) { query += ` AND cs.counselor_id = ?`; params.push(counselor_id); }
    if (session_type) { query += ` AND cs.session_type = ?`; params.push(session_type); }
    if (status) { query += ` AND cs.status = ?`; params.push(status); }
    if (start_date) { query += ` AND cs.session_date >= ?`; params.push(start_date); }
    if (end_date) { query += ` AND cs.session_date <= ?`; params.push(end_date); }

    query += ` ORDER BY cs.session_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [sessions] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM counseling_sessions cs WHERE 1=1` +
      (student_id ? ` AND cs.student_id = '${student_id}'` : ''),
      []
    );

    res.json({ success: true, sessions, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching counseling sessions:', error);
    res.status(500).json({ success: false, message: 'Error fetching counseling sessions', error: error.message });
  }
});

// POST schedule counseling
router.post('/counseling', authenticateToken, async (req, res) => {
  try {
    const { student_id, counselor_id, session_type, session_date, session_time, location, topic, notes } = req.body;

    await pool.execute(`
      INSERT INTO counseling_sessions (
        student_id, counselor_id, session_type, session_date, session_time, location, topic, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())
    `, [student_id, counselor_id, session_type, session_date, session_time, location || null, topic || null, notes || null]);

    const [[created]] = await pool.execute(
      'SELECT * FROM counseling_sessions WHERE student_id = ? AND session_date = ? ORDER BY created_at DESC LIMIT 1',
      [student_id, session_date]
    );

    res.json({ success: true, message: 'Counseling session scheduled successfully', session: created });
  } catch (error) {
    console.error('Error scheduling counseling:', error);
    res.status(500).json({ success: false, message: 'Error scheduling counseling', error: error.message });
  }
});

// PUT complete counseling
router.put('/counseling/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { outcomes, follow_up_required, follow_up_date, recommendations } = req.body;

    await pool.execute(`
      UPDATE counseling_sessions SET 
        status = 'completed', outcomes = ?, follow_up_required = ?, 
        follow_up_date = ?, recommendations = ?, completed_at = NOW()
      WHERE id = ?
    `, [outcomes || null, follow_up_required ? 1 : 0, follow_up_date || null, recommendations || null, id]);

    const [[updated]] = await pool.execute('SELECT * FROM counseling_sessions WHERE id = ?', [id]);

    res.json({ success: true, message: 'Counseling session completed', session: updated });
  } catch (error) {
    console.error('Error completing counseling:', error);
    res.status(500).json({ success: false, message: 'Error completing counseling', error: error.message });
  }
});

// ==================== TIMETABLE ====================

// GET timetable
router.get('/timetable', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, day_of_week, teacher_id } = req.query;

    let query = `
      SELECT t.*,
        tc.trade_code, tc.trade_name, tc.level_number, tc.level_suffix,
        c.name as course_name, c.code as course_code,
        u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM timetable t
      LEFT JOIN trade_classes tc ON t.class_id = tc.id
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN users u ON t.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (trade_code) { query += ` AND tc.trade_code = ?`; params.push(trade_code); }
    if (level_number) { query += ` AND tc.level_number = ?`; params.push(parseInt(level_number)); }
    if (day_of_week) { query += ` AND t.day_of_week = ?`; params.push(day_of_week); }
    if (teacher_id) { query += ` AND t.teacher_id = ?`; params.push(teacher_id); }

    query += ` ORDER BY t.period_number, t.day_of_week`;

    const [timetable] = await pool.execute(query, params);

    // Group by day
    const grouped = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => { grouped[day] = []; });
    
    timetable.forEach(slot => {
      if (grouped[slot.day_of_week]) {
        grouped[slot.day_of_week].push(slot);
      }
    });

    res.json({ success: true, timetable: grouped, raw: timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: 'Error fetching timetable', error: error.message });
  }
});

// ==================== STUDENTS ====================

// GET students for discipline
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { search, trade_code, level_number, status = 'active', page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.is_active,
        sp.admission_number, sp.date_of_birth, sp.gender,
        t.code, t.name,
        e.level_number, e.level_suffix,
        (SELECT COUNT(*) FROM discipline_incidents di WHERE di.student_id = u.id) as incident_count,
        (SELECT COUNT(*) FROM attendances a WHERE a.student_id = u.id AND a.status = 'absent' AND a.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as absence_count
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trades t ON e.trade_code = t.code
      WHERE u.role = 'student'
    `;
    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR sp.admission_number LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    if (trade_code) {
      query += ` AND e.trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND e.level_number = ?`;
      params.push(parseInt(level_number));
    }
    if (status === 'active') {
      query += ` AND u.is_active = 1`;
    }

    query += ` ORDER BY u.last_name, u.first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role = 'student'` +
      (status === 'active' ? ` AND u.is_active = 1` : ''),
      []
    );

    res.json({ success: true, students, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Error fetching students', error: error.message });
  }
});

// ==================== REPORTS ====================

// GET discipline statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, trade_code } = req.query;

    let incidentQuery = `SELECT COUNT(*) as total, severity FROM discipline_incidents WHERE 1=1`;
    const params = [];
    if (start_date) { incidentQuery += ` AND incident_date >= ?`; params.push(start_date); }
    if (end_date) { incidentQuery += ` AND incident_date <= ?`; params.push(end_date); }
    incidentQuery += ` GROUP BY severity`;

    const [incidentStats] = await pool.execute(incidentQuery, params);

    const [pendingLeaves] = await pool.execute(
      `SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'` +
      (start_date ? ` AND created_at >= '${start_date}'` : ''),
      []
    );

    const [totalStudents] = await pool.execute(
      `SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1`,
      []
    );

    const [recentIncidents] = await pool.execute(
      `SELECT COUNT(*) as count FROM discipline_incidents WHERE created_at >= NOW() - INTERVAL 7 DAY`,
      []
    );

    res.json({
      success: true,
      stats: {
        incidentsBySeverity: incidentStats,
        pendingLeaves: pendingLeaves[0]?.count || 0,
        totalStudents: totalStudents[0]?.count || 0,
        recentIncidents: recentIncidents[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
});

// GET incident types
router.get('/incident-types', authenticateToken, async (req, res) => {
  try {
    const types = [
      'Late Arrival', 'Absence Without Notice', 'Uniform Violation', 'Property Damage',
      'Fighting', 'Bullying', 'Cheating', 'Disruptive Behavior', ' substance Abuse',
      'Theft', 'Harassment', 'Weapon Possession', 'Other'
    ];
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching incident types' });
  }
});

// GET leave types
router.get('/leave-types', authenticateToken, async (req, res) => {
  try {
    const types = ['Sick Leave', 'Family Emergency', 'Personal Leave', 'Religious Holiday', 'Other'];
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leave types' });
  }
});

// ==================== GLOBAL STUDENT SHEETS COLUMNS ====================

// GET custom columns for role
router.get('/student-sheets/columns', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    
    const query = `
      SELECT * FROM global_sheet_columns 
      WHERE role = ? OR role = 'all' OR role IS NULL
      ORDER BY display_order ASC
    `;
    const [columns] = await pool.execute(query, [role]);

    res.json({ success: true, columns });
  } catch (error) {
    console.error('Error fetching columns:', error);
    res.status(500).json({ success: false, message: 'Error fetching columns', error: error.message });
  }
});

// POST add custom column for role
router.post('/student-sheets/columns', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { column_name, display_name, column_type, width, visible, display_order } = req.body;
    const { role } = req.user;

    await pool.execute(`
      INSERT INTO global_sheet_columns (role, column_name, display_name, column_type, width, visible, display_order, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [role, column_name, display_name, column_type || 'text', width || 100, visible !== false ? 1 : 0, display_order || 0, req.user?.name]);

    res.json({ success: true, message: 'Column added successfully' });
  } catch (error) {
    console.error('Error adding column:', error);
    res.status(500).json({ success: false, message: 'Error adding column', error: error.message });
  }
});

// GET global student sheets data
router.get('/student-sheets', authenticateToken, async (req, res) => {
  try {
    const { search, trade_code, level_number, status, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.is_active,
        sp.admission_number, sp.date_of_birth, sp.gender, sp.address,
        t.code, t.name,
        e.level_number, e.level_suffix,
        (SELECT COUNT(*) FROM discipline_incidents di WHERE di.student_id = u.id AND di.status = 'pending') as pending_incidents,
        (SELECT COUNT(*) FROM attendances a WHERE a.student_id = u.id AND a.status = 'absent') as total_absences
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trades t ON e.trade_code = t.code
      WHERE u.role = 'student'
    `;
    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR sp.admission_number LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    if (trade_code) {
      query += ` AND e.trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND e.level_number = ?`;
      params.push(parseInt(level_number));
    }
    if (status === 'active') {
      query += ` AND u.is_active = 1`;
    }

    query += ` ORDER BY u.last_name, u.first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role = 'student'` +
      (status === 'active' ? ` AND u.is_active = 1` : ''),
      []
    );

    res.json({ success: true, students, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching student sheets:', error);
    res.status(500).json({ success: false, message: 'Error fetching student sheets', error: error.message });
  }
});

// ==================== PARENT NOTIFICATIONS ====================

// GET parent notifications
router.get('/parent-notifications', authenticateToken, async (req, res) => {
  try {
    const { student_id, notification_type, sent, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT pn.*,
        s.first_name as student_first_name, s.last_name as student_last_name,
        p.first_name as parent_first_name, p.last_name as parent_last_name, p.phone as parent_phone
      FROM parent_notifications pn
      LEFT JOIN users s ON pn.student_id = s.id
      LEFT JOIN users p ON pn.parent_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) { query += ` AND pn.student_id = ?`; params.push(student_id); }
    if (notification_type) { query += ` AND pn.notification_type = ?`; params.push(notification_type); }
    if (sent === 'true') { query += ` AND pn.sent_at IS NOT NULL`; }
    if (sent === 'false') { query += ` AND pn.sent_at IS NULL`; }

    query += ` ORDER BY pn.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [notifications] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM parent_notifications pn WHERE 1=1` +
      (student_id ? ` AND pn.student_id = '${student_id}'` : ''),
      []
    );

    res.json({ success: true, notifications, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching parent notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching parent notifications', error: error.message });
  }
});

// POST send parent notification
router.post('/parent-notifications/send', authenticateToken, async (req, res) => {
  try {
    const { student_id, parent_id, notification_type, subject, message, send_sms, send_email } = req.body;

    const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    await pool.execute(`
      INSERT INTO parent_notifications (
        notification_id, student_id, parent_id, notification_type, subject, message, 
        send_sms, send_email, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [notificationId, student_id, parent_id, notification_type, subject, message, send_sms ? 1 : 0, send_email ? 1 : 0]);

    // In production, send actual SMS/email here
    await pool.execute(`
      UPDATE parent_notifications SET status = 'sent', sent_at = NOW() WHERE id = ?
    `, [notificationId]);

    res.json({ success: true, message: 'Notification sent successfully', notification_id: notificationId });
  } catch (error) {
    console.error('Error sending parent notification:', error);
    res.status(500).json({ success: false, message: 'Error sending parent notification', error: error.message });
  }
});

// ============================================
// SOD - STUDENTS OF DISCIPLINE
// ============================================

// Get SOD students (Students of Discipline)
router.get('/sod-students', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const { status, level, trade, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT
        gs.student_id,
        gs.first_name,
        gs.last_name,
        gs.gender,
        gs.class_name,
        gs.trade_code,
        gs.trade_name,
        gs.level_number,
        gs.phone,
        gs.gpa,
        gs.attendance_percentage,
        gs.status as student_status,
        COUNT(DISTINCT scr.id) as total_incidents,
        MAX(scr.incident_date) as last_incident_date,
        MAX(CASE WHEN scr.severity = 'high' OR scr.severity = 'critical' THEN 1 ELSE 0 END) as has_critical,
        sod.status as sod_status,
        sod.admission_date as sod_admission_date,
        sod.notes as sod_notes
      FROM global_student_sheets gs
      LEFT JOIN student_conduct_records scr ON gs.student_id = scr.student_id
      LEFT JOIN sod_students sod ON gs.student_id = sod.student_id
      WHERE gs.status = 'active'
    `;
    const params = [];

    // Filter for SOD students
    query += ` AND (sod.status = 'active' OR sod.status = 'monitoring' OR COUNT(DISTINCT scr.id) >= 3)`;

    if (status) {
      query += ` AND sod.status = ?`;
      params.push(status);
    }
    if (level) {
      query += ` AND gs.level_number = ?`;
      params.push(level);
    }
    if (trade) {
      query += ` AND gs.trade_code = ?`;
      params.push(trade);
    }
    if (search) {
      query += ` AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_code LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` GROUP BY gs.student_id, sod.status, sod.admission_date, sod.notes`;
    query += ` ORDER BY has_critical DESC, total_incidents DESC, gs.last_name`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    res.json({ success: true, students, total: students.length });
  } catch (error) {
    console.error('Error fetching SOD students:', error);
    res.status(500).json({ success: false, message: 'Error fetching SOD students', error: error.message });
  }
});

// Add student to SOD (Students of Discipline)
router.post('/sod-students', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { student_id, notes, status = 'active' } = req.body;

    // Check if already in SOD
    const [existing] = await pool.execute('SELECT * FROM sod_students WHERE student_id = ?', [student_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student is already in SOD program' });
    }

    await pool.execute(`
      INSERT INTO sod_students (student_id, admission_date, status, notes, added_by)
      VALUES (?, NOW(), ?, ?, ?)
    `, [student_id, status, notes, req.user?.id || req.user?.userId]);

    res.json({ success: true, message: 'Student added to SOD program successfully' });
  } catch (error) {
    console.error('Error adding student to SOD:', error);
    res.status(500).json({ success: false, message: 'Error adding student to SOD', error: error.message });
  }
});

// Update SOD student status
router.put('/sod-students/:studentId', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, notes } = req.body;

    await pool.execute(`
      UPDATE sod_students SET status = ?, notes = ?, updated_at = NOW()
      WHERE student_id = ?
    `, [status, notes, studentId]);

    res.json({ success: true, message: 'SOD student status updated successfully' });
  } catch (error) {
    console.error('Error updating SOD student:', error);
    res.status(500).json({ success: false, message: 'Error updating SOD student', error: error.message });
  }
});

// Remove student from SOD
router.delete('/sod-students/:studentId', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { studentId } = req.params;

    await pool.execute('DELETE FROM sod_students WHERE student_id = ?', [studentId]);

    res.json({ success: true, message: 'Student removed from SOD program successfully' });
  } catch (error) {
    console.error('Error removing student from SOD:', error);
    res.status(500).json({ success: false, message: 'Error removing student from SOD', error: error.message });
  }
});

// ============================================
// REMOVE CONDUCT RECORDS
// ============================================

// Remove conduct record with reason
router.delete('/conduct/:recordId/remove', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const { recordId } = req.params;
    const { removal_reason, removal_type, notes, removed_by } = req.body;

    // Valid removal types
    const validTypes = ['leave', 'sick', 'lesson_cancelled', 'exonerated', 'appealed', 'time_expired', 'administrative'];
    if (!validTypes.includes(removal_type)) {
      return res.status(400).json({ success: false, message: 'Invalid removal type' });
    }

    // Get the original record
    const [record] = await pool.execute('SELECT * FROM student_conduct_records WHERE id = ?', [recordId]);
    if (record.length === 0) {
      return res.status(404).json({ success: false, message: 'Conduct record not found' });
    }

    // Archive the removal
    await pool.execute(`
      INSERT INTO conduct_removals (
        record_id, student_id, original_incident_type, original_severity,
        removal_reason, removal_type, notes, removed_by, removed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      recordId,
      record[0].student_id,
      record[0].incident_type,
      record[0].severity,
      removal_reason,
      removal_type,
      notes,
      removed_by || req.user?.id || req.user?.userId
    ]);

    // Delete the original record
    await pool.execute('DELETE FROM student_conduct_records WHERE id = ?', [recordId]);

    res.json({ success: true, message: 'Conduct record removed successfully', removal_type });
  } catch (error) {
    console.error('Error removing conduct record:', error);
    res.status(500).json({ success: false, message: 'Error removing conduct record', error: error.message });
  }
});

// Get removal history
router.get('/conduct-removals', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const { student_id, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cr.*, gs.first_name, gs.last_name, gs.class_name,
        u.first_name as removed_by_name, u.last_name as removed_by_lastname
      FROM conduct_removals cr
      LEFT JOIN global_student_sheets gs ON cr.student_id = gs.student_id
      LEFT JOIN users u ON cr.removed_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ` AND cr.student_id = ?`;
      params.push(student_id);
    }
    if (start_date) {
      query += ` AND cr.removed_at >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND cr.removed_at <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY cr.removed_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [removals] = await pool.execute(query, params);

    res.json({ success: true, removals, total: removals.length });
  } catch (error) {
    console.error('Error fetching removal history:', error);
    res.status(500).json({ success: false, message: 'Error fetching removal history', error: error.message });
  }
});

// ============================================
// PARENT-STUDENT LINKING
// ============================================

// Link parent to student
router.post('/link-parent', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos', 'patron'), async (req, res) => {
  try {
    const { student_id, parent_id, relationship = 'parent', auto_sms = true, one_parent_one_child = false } = req.body;

    // Check if one-parent-one-child mode is enabled
    if (one_parent_one_child) {
      // Remove any existing links for this parent
      await pool.execute('DELETE FROM parent_student_links WHERE parent_id = ?', [parent_id]);
    }

    // Check if link already exists
    const [existing] = await pool.execute(
      'SELECT * FROM parent_student_links WHERE student_id = ? AND parent_id = ?',
      [student_id, parent_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'This parent is already linked to this student' });
    }

    // Get parent and student info for SMS
    let studentName = '';
    let parentPhone = '';
    
    if (auto_sms) {
      const [studentResult] = await pool.execute(
        'SELECT first_name, last_name FROM global_student_sheets WHERE id = ?',
        [student_id]
      );
      const [parentResult] = await pool.execute(
        'SELECT first_name, last_name, phone FROM users WHERE id = ?',
        [parent_id]
      );
      
      if (studentResult.length > 0) {
        studentName = `${studentResult[0].first_name} ${studentResult[0].last_name}`;
      }
      if (parentResult.length > 0) {
        parentPhone = parentResult[0].phone;
      }
    }

    await pool.execute(`
      INSERT INTO parent_student_links (parent_id, student_id, relationship, linked_by, linked_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [parent_id, student_id, relationship, req.user?.id || req.user?.userId]);

    // Send auto SMS to parent if enabled
    if (auto_sms && parentPhone) {
      try {
        const message = `Garden TVET: Ubu mubyeyi wa ${studentName} washatse kuri sisitemu. uzabona amakuru y'umwana wawe ukoresheje iyi phone. Murakoze!`;
        await pool.execute(
          `INSERT INTO sms_queue (phone_number, message, status, priority, created_at) VALUES (?, ?, 'pending', 'high', NOW())`,
          [parentPhone, message]
        );
      } catch (smsError) {
        console.error('Auto SMS error:', smsError);
      }
    }

    res.json({ success: true, message: 'Parent linked to student successfully' + (auto_sms ? ' and SMS notification sent' : '') });
  } catch (error) {
    console.error('Error linking parent:', error);
    res.status(500).json({ success: false, message: 'Error linking parent', error: error.message });
  }
});

// Unlink parent from student
router.delete('/link-parent', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos', 'patron'), async (req, res) => {
  try {
    const { student_id, parent_id } = req.body;

    await pool.execute(
      'DELETE FROM parent_student_links WHERE student_id = ? AND parent_id = ?',
      [student_id, parent_id]
    );

    res.json({ success: true, message: 'Parent unlinked from student successfully' });
  } catch (error) {
    console.error('Error unlinking parent:', error);
    res.status(500).json({ success: false, message: 'Error unlinking parent', error: error.message });
  }
});

// Get parent links for a student
router.get('/student-parents/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const [links] = await pool.execute(`
      SELECT psl.*, p.first_name as parent_first_name, p.last_name as parent_last_name,
        p.phone as parent_phone, p.email as parent_email
      FROM parent_student_links psl
      JOIN parents p ON psl.parent_id = p.id
      WHERE psl.student_id = ?
    `, [studentId]);

    res.json({ success: true, links });
  } catch (error) {
    console.error('Error fetching parent links:', error);
    res.status(500).json({ success: false, message: 'Error fetching parent links', error: error.message });
  }
});

// ============================================
// SMS NOTIFICATIONS VIA AFRICAN TALKING
// ============================================

// Send SMS to parent via African Talking
router.post('/sms/send', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos', 'patron', 'teacher'), async (req, res) => {
  try {
    const { parent_id, student_id, message, priority = 'normal' } = req.body;

    // Get parent phone number
    let phone = '';
    if (parent_id) {
      const [parent] = await pool.execute('SELECT phone FROM parents WHERE id = ?', [parent_id]);
      if (parent.length === 0) {
        return res.status(404).json({ success: false, message: 'Parent not found' });
      }
      phone = parent[0].phone;
    } else if (student_id) {
      // Get linked parents
      const [links] = await pool.execute(
        'SELECT p.phone FROM parents p JOIN parent_student_links psl ON p.id = psl.parent_id WHERE psl.student_id = ?',
        [student_id]
      );
      if (links.length === 0) {
        return res.status(404).json({ success: false, message: 'No parent linked to this student' });
      }
      phone = links[0].phone;
    } else {
      return res.status(400).json({ success: false, message: 'Either parent_id or student_id is required' });
    }

    // Format phone number (add country code if not present)
    let formattedPhone = phone.replace(/\s/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+250' + formattedPhone.substring(1);
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    // Send SMS via African Talking API
    const axios = require('axios');
    const AFRICAN_TALKING_API_KEY = process.env.AFRICAN_TALKING_API_KEY || 'atsk_test_key';
    const AFRICAN_TALKING_USERNAME = process.env.AFRICAN_TALKING_USERNAME || 'sandbox';

    try {
      const smsResponse = await axios.post(
        'https://api.africastalking.com/version1/messaging',
        new URLSearchParams({
          username: AFRICAN_TALKING_USERNAME,
          to: formattedPhone,
          message: message
        }),
        {
          headers: {
            'apiKey': AFRICAN_TALKING_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Log the SMS
      await pool.execute(`
        INSERT INTO sms_notifications (parent_id, student_id, phone, message, status, sent_via, priority, sent_at)
        VALUES (?, ?, ?, ?, 'sent', 'african_talking', ?, NOW())
      `, [parent_id || null, student_id || null, formattedPhone, message, priority]);

      res.json({ 
        success: true, 
        message: 'SMS sent successfully',
        sms_response: smsResponse.data
      });
    } catch (smsError) {
      // If African Talking fails, store for retry
      console.error('African Talking SMS Error:', smsError.message);
      
      await pool.execute(`
        INSERT INTO sms_notifications (parent_id, student_id, phone, message, status, sent_via, priority, error_message, created_at)
        VALUES (?, ?, ?, ?, 'failed', 'african_talking', ?, ?, NOW())
      `, [parent_id || null, student_id || null, formattedPhone, message, priority, smsError.message]);

      res.status(500).json({ 
        success: false, 
        message: 'Failed to send SMS via African Talking',
        error: smsError.message 
      });
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, message: 'Error sending SMS', error: error.message });
  }
});

// Get SMS history
router.get('/sms/history', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const { parent_id, student_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sms.*, 
        p.first_name as parent_first_name, p.last_name as parent_last_name,
        gs.first_name as student_first_name, gs.last_name as student_last_name
      FROM sms_notifications sms
      LEFT JOIN parents p ON sms.parent_id = p.id
      LEFT JOIN global_student_sheets gs ON sms.student_id = gs.student_id
      WHERE 1=1
    `;
    const params = [];

    if (parent_id) {
      query += ` AND sms.parent_id = ?`;
      params.push(parent_id);
    }
    if (student_id) {
      query += ` AND sms.student_id = ?`;
      params.push(student_id);
    }
    if (status) {
      query += ` AND sms.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY sms.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [history] = await pool.execute(query, params);

    res.json({ success: true, history, total: history.length });
  } catch (error) {
    console.error('Error fetching SMS history:', error);
    res.status(500).json({ success: false, message: 'Error fetching SMS history', error: error.message });
  }
});

// Bulk SMS to multiple parents
router.post('/sms/bulk', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { parent_ids, student_ids, message, priority = 'normal' } = req.body;

    if (!message || (!parent_ids?.length && !student_ids?.length)) {
      return res.status(400).json({ success: false, message: 'Message and at least one recipient required' });
    }

    // Get all phone numbers
    let phones = [];

    if (parent_ids?.length) {
      const [parents] = await pool.execute(
        `SELECT phone FROM parents WHERE id IN (${parent_ids.map(() => '?').join(',')})`,
        parent_ids
      );
      phones = parents.map((p) => p.phone);
    }

    if (student_ids?.length) {
      const [links] = await pool.execute(
        `SELECT DISTINCT p.phone FROM parents p 
         JOIN parent_student_links psl ON p.id = psl.parent_id 
         WHERE psl.student_id IN (${student_ids.map(() => '?').join(',')})`,
        student_ids
      );
      phones = [...phones, ...links.map((l) => l.phone)];
    }

    // Remove duplicates
    phones = [...new Set(phones)];

    // Format all phone numbers
    const formattedPhones = phones.map((phone) => {
      let formatted = phone.replace(/\s/g, '');
      if (!formatted.startsWith('+')) {
        if (formatted.startsWith('0')) {
          formatted = '+250' + formatted.substring(1);
        } else {
          formatted = '+' + formatted;
        }
      }
      return formatted;
    });

    // Send bulk SMS via African Talking
    const axios = require('axios');
    const AFRICAN_TALKING_API_KEY = process.env.AFRICAN_TALKING_API_KEY || 'atsk_test_key';
    const AFRICAN_TALKING_USERNAME = process.env.AFRICAN_TALKING_USERNAME || 'sandbox';

    let sentCount = 0;
    let failedCount = 0;

    for (const phone of formattedPhones) {
      try {
        await axios.post(
          'https://api.africastalking.com/version1/messaging',
          new URLSearchParams({
            username: AFRICAN_TALKING_USERNAME,
            to: phone,
            message: message
          }),
          {
            headers: {
              'apiKey': AFRICAN_TALKING_API_KEY,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        sentCount++;
      } catch (err) {
        failedCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `SMS sent: ${sentCount} successful, ${failedCount} failed`,
      sent_count: sentCount,
      failed_count: failedCount
    });
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    res.status(500).json({ success: false, message: 'Error sending bulk SMS', error: error.message });
  }
});

module.exports = router;

// GET all registered parents (not just linked ones)
router.get('/all-parents', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos', 'patron', 'matron'), async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.gender,
        u.province, u.district, u.sector,
        (SELECT COUNT(*) FROM parent_student_links WHERE parent_id = u.id) as linked_children_count,
        (SELECT GROUP_CONCAT(CONCAT(gss.first_name, ' ', gss.last_name) SEPARATOR ', ') 
         FROM parent_student_links psl 
         JOIN global_student_sheets gss ON psl.student_id = gss.id 
         WHERE psl.parent_id = u.id AND psl.status = 'approved') as linked_children_names
      FROM users u
      WHERE u.role = 'parent'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY u.first_name, u.last_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [parents] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = \'parent\'';
    const [total] = await pool.execute(countQuery);
    
    res.json({ success: true, parents, total: total[0].total });
  } catch (error) {
    console.error('Error fetching all parents:', error);
    res.status(500).json({ success: false, message: 'Error fetching parents' });
  }
});

// POST Give Lesson - Record lessons given to absent students
router.post('/give-lesson', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos', 'teacher'), async (req, res) => {
  try {
    const { student_id, subject, lesson_date, lesson_topics, duration_hours, notes, send_notification = true } = req.body;
    
    if (!student_id || !subject || !lesson_date) {
      return res.status(400).json({ success: false, message: 'Student, subject, and date are required' });
    }
    
    // Insert lesson record
    const [result] = await pool.execute(
      `INSERT INTO student_lessons (student_id, subject, lesson_date, lesson_topics, duration_hours, notes, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [student_id, subject, lesson_date, lesson_topics || '', duration_hours || 1, notes || '', req.user?.userId || req.user?.id]
    );
    
    // Get student and parent info
    let parentPhone = '';
    let studentName = '';
    
    if (send_notification) {
      const [studentResult] = await pool.execute(
        `SELECT gss.first_name, gss.last_name, u.phone 
         FROM global_student_sheets gss 
         LEFT JOIN parent_student_links psl ON gss.id = psl.student_id AND psl.status = 'approved'
         LEFT JOIN users u ON psl.parent_id = u.id
         WHERE gss.id = ?`, 
        [student_id]
      );
      
      if (studentResult.length > 0) {
        studentName = `${studentResult[0].first_name} ${studentResult[0].last_name}`;
        parentPhone = studentResult[0].phone;
      }
    }
    
    // Send notification to parent
    if (send_notification && parentPhone) {
      try {
        const message = `Garden TVET: Umwana ${studentName} yahawe ikiganiro cya ${subject} tariki ${lesson_date}. Mugaragire ko yigeze aha. Murakoze!`;
        await pool.execute(
          `INSERT INTO sms_queue (phone_number, message, status, priority, created_at) VALUES (?, ?, 'pending', 'normal', NOW())`,
          [parentPhone, message]
        );
      } catch (smsError) {
        console.error('SMS notification error:', smsError);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Lesson recorded successfully' + (send_notification && parentPhone ? ' and parent notified' : ''),
      lesson_id: result.insertId
    });
  } catch (error) {
    console.error('Error giving lesson:', error);
    res.status(500).json({ success: false, message: 'Error recording lesson' });
  }
});

// GET lessons for a student
router.get('/student-lessons/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 20 } = req.query;
    
    const [lessons] = await pool.execute(
      `SELECT sl.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM student_lessons sl
       LEFT JOIN users u ON sl.created_by = u.id
       WHERE sl.student_id = ?
       ORDER BY sl.lesson_date DESC
       LIMIT ?`,
      [studentId, parseInt(limit)]
    );
    
    res.json({ success: true, lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ success: false, message: 'Error fetching lessons' });
  }
});

// GET all lessons (for DOD dashboard)
router.get('/all-lessons', authenticateToken, requireRole('director_discipline', 'admin', 'headmaster', 'dos', 'teacher'), async (req, res) => {
  try {
    const { limit = 50, offset = 0, student_id, date_from, date_to } = req.query;
    
    let query = `
      SELECT sl.*, gss.first_name, gss.last_name, gss.student_code, gss.trade_name,
             u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM student_lessons sl
      JOIN global_student_sheets gss ON sl.student_id = gss.id
      LEFT JOIN users u ON sl.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (student_id) {
      query += ' AND sl.student_id = ?';
      params.push(parseInt(student_id));
    }
    
    if (date_from) {
      query += ' AND sl.lesson_date >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND sl.lesson_date <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY sl.lesson_date DESC, sl.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [lessons] = await pool.execute(query, params);
    
    res.json({ success: true, lessons });
  } catch (error) {
    console.error('Error fetching all lessons:', error);
    res.status(500).json({ success: false, message: 'Error fetching lessons' });
  }
});

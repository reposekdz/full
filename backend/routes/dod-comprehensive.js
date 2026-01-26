const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET Dashboard Stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [stats] = await db.pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM dod_notifications WHERE is_read = 0 AND target_role = 'director_discipline') as ubutumwa_bushya,
        (SELECT COUNT(*) FROM exam_monitoring WHERE status = 'biteguwe') as ibizamini_bitegerejwe,
        (SELECT COUNT(*) FROM system_alerts WHERE is_active = 1) as ibimenyetso_bya_sisiteme,
        (SELECT COUNT(*) FROM discipline_cases WHERE status = 'gishya') as amakosa_mashya,
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student')) as abanyeshuri_bose
    `);
    
    res.json({ success: true, stats: stats[0] || { ubutumwa_bushya: 0, ibizamini_bitegerejwe: 0, ibimenyetso_bya_sisiteme: 0, amakosa_mashya: 0, abanyeshuri_bose: 0 } });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.json({ success: true, stats: { ubutumwa_bushya: 0, ibizamini_bitegerejwe: 0, ibimenyetso_bya_sisiteme: 0, amakosa_mashya: 0, abanyeshuri_bose: 0 } });
  }
});

// GET Recent Activities
router.get('/activities/recent', async (req, res) => {
  try {
    const [activities] = await db.pool.query(`
      SELECT * FROM dod_activity_log 
      ORDER BY created_at DESC LIMIT 10
    `);
    
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Track Activity
router.post('/activities/track', async (req, res) => {
  try {
    const { user_id, action, module, details } = req.body;
    
    await db.pool.query(`
      INSERT INTO dod_activity_log (user_id, action, module, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [user_id, action, module, JSON.stringify(details), req.ip]);
    
    res.json({ success: true, message: 'Igikorwa cyanditswe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET All Notifications
router.get('/notifications', async (req, res) => {
  try {
    const { is_read, type } = req.query;
    
    let query = 'SELECT * FROM dod_notifications WHERE target_role = "director_discipline"';
    const params = [];
    
    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }
    
    if (type) {
      query += ' AND notification_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const [notifications] = await db.pool.query(query, params);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Mark Notification as Read
router.post('/notifications/:id/read', async (req, res) => {
  try {
    await db.pool.query('UPDATE dod_notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Ubutumwa bwasomwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Create Notification
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, notification_type, priority, target_user, target_role } = req.body;
    
    const [result] = await db.pool.query(`
      INSERT INTO dod_notifications (title, message, notification_type, priority, target_user, target_role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [title, message, notification_type, priority, target_user, target_role]);
    
    res.json({ success: true, id: result.insertId, message: 'Ubutumwa bwohererejwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET All Discipline Cases
router.get('/discipline/cases', async (req, res) => {
  try {
    const { status, severity } = req.query;
    
    let query = `
      SELECT dc.*, CONCAT(u.first_name, ' ', u.last_name) as student_name, u.student_id as student_number
      FROM discipline_cases dc
      LEFT JOIN users u ON dc.student_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND dc.status = ?';
      params.push(status);
    }
    
    if (severity) {
      query += ' AND dc.severity = ?';
      params.push(severity);
    }
    
    query += ' ORDER BY dc.created_at DESC';
    
    const [cases] = await db.pool.query(query, params);
    res.json({ success: true, cases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Create Discipline Case
router.post('/discipline/cases', async (req, res) => {
  try {
    const { student_id, case_type, description, severity, reported_by } = req.body;
    
    const [result] = await db.pool.query(`
      INSERT INTO discipline_cases (student_id, case_type, description, severity, reported_by, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'gishya', NOW())
    `, [student_id, case_type, description, severity, reported_by]);
    
    await db.pool.query(`
      INSERT INTO dod_notifications (title, message, notification_type, priority, target_role, created_at)
      VALUES ('Ikosa rishya', ?, 'ikosa', 'byingenzi', 'director_discipline', NOW())
    `, [`Ikosa rishya ryatanzwe: ${description.substring(0, 50)}...`]);
    
    res.json({ success: true, id: result.insertId, message: 'Ikosa ryanditswe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT Update Discipline Case
router.put('/discipline/cases/:id', async (req, res) => {
  try {
    const { status, action_taken, handled_by, parent_notified } = req.body;
    
    await db.pool.query(`
      UPDATE discipline_cases 
      SET status = ?, action_taken = ?, handled_by = ?, parent_notified = ?,
          resolved_at = IF(? = 'byakemuwe', NOW(), resolved_at)
      WHERE id = ?
    `, [status, action_taken, handled_by, parent_notified, status, req.params.id]);
    
    res.json({ success: true, message: 'Ikosa ryavuguruwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Behavior Points
router.get('/behavior/points', async (req, res) => {
  try {
    const { student_id } = req.query;
    
    let query = `
      SELECT bp.*, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM behavior_points bp
      LEFT JOIN users u ON bp.student_id = u.id
    `;
    const params = [];
    
    if (student_id) {
      query += ' WHERE bp.student_id = ?';
      params.push(student_id);
    }
    
    query += ' ORDER BY bp.created_at DESC';
    
    const [points] = await db.pool.query(query, params);
    res.json({ success: true, points });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Award Behavior Points
router.post('/behavior/points', async (req, res) => {
  try {
    const { student_id, points, reason, point_type, awarded_by } = req.body;
    
    const [result] = await db.pool.query(`
      INSERT INTO behavior_points (student_id, points, reason, point_type, awarded_by, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [student_id, points, reason, point_type, awarded_by]);
    
    res.json({ success: true, id: result.insertId, message: 'Amanota yatanzwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Exam Monitoring
router.get('/exams/monitoring', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM exam_monitoring';
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY exam_date ASC';
    
    const [exams] = await db.pool.query(query, params);
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Create Exam Monitoring
router.post('/exams/monitoring', async (req, res) => {
  try {
    const { exam_name, exam_date, location, supervisor_id, students_count } = req.body;
    
    const [result] = await db.pool.query(`
      INSERT INTO exam_monitoring (exam_name, exam_date, location, supervisor_id, students_count, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'biteguwe', NOW())
    `, [exam_name, exam_date, location, supervisor_id, students_count]);
    
    res.json({ success: true, id: result.insertId, message: 'Ikizamini cyanditswe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT Update Exam Status
router.put('/exams/monitoring/:id', async (req, res) => {
  try {
    const { status, issues_reported, notes } = req.body;
    
    await db.pool.query(`
      UPDATE exam_monitoring 
      SET status = ?, issues_reported = ?, notes = ?
      WHERE id = ?
    `, [status, issues_reported, notes, req.params.id]);
    
    res.json({ success: true, message: 'Ikizamini cyavuguruwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Punishments
router.get('/punishments', async (req, res) => {
  try {
    const { case_id, status } = req.query;
    let query = 'SELECT p.*, dc.description as case_description FROM punishments p LEFT JOIN discipline_cases dc ON p.case_id = dc.id WHERE 1=1';
    const params = [];
    if (case_id) { query += ' AND p.case_id = ?'; params.push(case_id); }
    if (status) { query += ' AND p.status = ?'; params.push(status); }
    query += ' ORDER BY p.created_at DESC';
    const [punishments] = await db.pool.query(query, params);
    res.json({ success: true, punishments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Create Punishment
router.post('/punishments', async (req, res) => {
  try {
    const { case_id, punishment_type, description, start_date, end_date } = req.body;
    const [result] = await db.pool.query(`
      INSERT INTO punishments (case_id, punishment_type, description, start_date, end_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'bitegerejwe', NOW())
    `, [case_id, punishment_type, description, start_date, end_date]);
    res.json({ success: true, id: result.insertId, message: 'Igihano cyatanzwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Parent Notifications
router.get('/parent-notifications', async (req, res) => {
  try {
    const [notifications] = await db.pool.query(`
      SELECT pn.*, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM parent_notifications pn
      LEFT JOIN users u ON pn.student_id = u.id
      ORDER BY pn.created_at DESC LIMIT 50
    `);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Send Parent Notification
router.post('/parent-notifications', async (req, res) => {
  try {
    const { student_id, message, notification_method } = req.body;
    const [result] = await db.pool.query(`
      INSERT INTO parent_notifications (student_id, message, notification_method, sent_at, created_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `, [student_id, message, notification_method]);
    res.json({ success: true, id: result.insertId, message: 'Ubutumwa bwohererejwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Dashboard Analytics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const [casesByType] = await db.pool.query(`
      SELECT case_type, COUNT(*) as count FROM discipline_cases GROUP BY case_type
    `);
    const [casesByStatus] = await db.pool.query(`
      SELECT status, COUNT(*) as count FROM discipline_cases GROUP BY status
    `);
    const [pointsByType] = await db.pool.query(`
      SELECT point_type, SUM(points) as total FROM behavior_points GROUP BY point_type
    `);
    const [examsByStatus] = await db.pool.query(`
      SELECT status, COUNT(*) as count FROM exam_monitoring GROUP BY status
    `);
    res.json({ success: true, analytics: { casesByType, casesByStatus, pointsByType, examsByStatus } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Bulk Actions
router.post('/discipline/bulk-action', async (req, res) => {
  try {
    const { case_ids, action, data } = req.body;
    
    if (action === 'update_status') {
      await db.pool.query('UPDATE discipline_cases SET status = ? WHERE id IN (?)', [data.status, case_ids]);
    } else if (action === 'assign_handler') {
      await db.pool.query('UPDATE discipline_cases SET handled_by = ? WHERE id IN (?)', [data.handler_id, case_ids]);
    } else if (action === 'notify_parents') {
      for (const caseId of case_ids) {
        const [caseData] = await db.pool.query('SELECT student_id, description FROM discipline_cases WHERE id = ?', [caseId]);
        if (caseData.length > 0) {
          await db.pool.query(`
            INSERT INTO parent_notifications (student_id, message, notification_method, sent_at, created_at)
            VALUES (?, ?, 'sms', NOW(), NOW())
          `, [caseData[0].student_id, `Ikosa: ${caseData[0].description.substring(0, 100)}`]);
        }
      }
    }
    
    res.json({ success: true, message: 'Ibikorwa byakozwe' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Case Details with History
router.get('/discipline/cases/:id/details', async (req, res) => {
  try {
    const [caseData] = await db.pool.query(`
      SELECT dc.*, CONCAT(u.first_name, ' ', u.last_name) as student_name, u.student_id as student_number, t.name as trade_name
      FROM discipline_cases dc
      LEFT JOIN users u ON dc.student_id = u.id
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE dc.id = ?
    `, [req.params.id]);
    
    const [punishments] = await db.pool.query('SELECT * FROM punishments WHERE case_id = ?', [req.params.id]);
    const [notifications] = await db.pool.query('SELECT * FROM parent_notifications WHERE student_id = (SELECT student_id FROM discipline_cases WHERE id = ?)', [req.params.id]);
    
    res.json({ success: true, case: caseData[0], punishments, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Reports
router.get('/reports/generate', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [discipline] = await db.pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count, case_type
      FROM discipline_cases
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at), case_type
    `, [start_date, end_date]);

    const [behavior] = await db.pool.query(`
      SELECT DATE(created_at) as date, SUM(points) as total, point_type
      FROM behavior_points
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at), point_type
    `, [start_date, end_date]);

    const [exams] = await db.pool.query(`
      SELECT DATE(exam_date) as date, COUNT(*) as count, status
      FROM exam_monitoring
      WHERE exam_date BETWEEN ? AND ?
      GROUP BY DATE(exam_date), status
    `, [start_date, end_date]);

    res.json({ success: true, reports: { discipline, behavior, exams } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET System Alerts
router.get('/system/alerts', async (req, res) => {
  try {
    const [alerts] = await db.pool.query(`
      SELECT * FROM system_alerts 
      WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY severity DESC, created_at DESC
    `);
    
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET System Health
router.get('/system/health', async (req, res) => {
  try {
    const [health] = await db.pool.query(`
      SELECT 
        'Birakora' as status,
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student')) as total_students,
        (SELECT COUNT(*) FROM discipline_cases WHERE status != 'byakemuwe') as active_cases,
        (SELECT COUNT(*) FROM exam_monitoring WHERE status = 'biteguwe') as upcoming_exams
    `);
    
    res.json({ success: true, health: health[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Students List
router.get('/students', async (req, res) => {
  try {
    const { search, trade_id, status } = req.query;
    
    let query = `
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.student_id, 
        t.name as trade_name,
        (SELECT COUNT(*) FROM discipline_cases WHERE student_id = u.id) as total_cases,
        (SELECT SUM(points) FROM behavior_points WHERE student_id = u.id AND point_type = 'amanota_meza') as good_points,
        (SELECT SUM(points) FROM behavior_points WHERE student_id = u.id AND point_type = 'amanota_mabi') as bad_points
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
    `;
    const params = [];
    
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (trade_id) {
      query += ' AND u.trade_id = ?';
      params.push(trade_id);
    }
    
    if (status) {
      query += ' AND u.is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }
    
    query += ' ORDER BY u.first_name ASC';
    
    const [students] = await db.pool.query(query, params);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Students error:', error);
    res.json({ success: true, students: [] });
  }
});

// GET Students Sheets with Filters
router.get('/students/sheets', async (req, res) => {
  try {
    const { trade_id, level } = req.query;
    
    let query = `
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.student_id, u.level, u.class, 
        COALESCE(t.name, '') as trade_name, COALESCE(t.code, '') as trade_code,
        (SELECT COUNT(*) FROM discipline_cases WHERE student_id = u.id) as total_cases,
        (SELECT SUM(points) FROM behavior_points WHERE student_id = u.id AND point_type = 'amanota_meza') as good_points
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
    `;
    const params = [];
    
    if (trade_id) {
      query += ' AND u.trade_id = ?';
      params.push(trade_id);
    }
    
    if (level) {
      query += ' AND u.level = ?';
      params.push(level);
    }
    
    query += ' ORDER BY u.first_name ASC';
    
    const [students] = await db.pool.query(query, params);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
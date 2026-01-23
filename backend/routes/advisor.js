const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ============ PARENTS MANAGEMENT ============

// Get all parents with statistics
router.get('/parents', async (req, res) => {
  try {
    const [parents] = await pool.query(`
      SELECT p.*, 
        COUNT(DISTINCT sp.student_id) as total_children,
        COUNT(DISTINCT pc.id) as total_communications,
        COUNT(DISTINCT pm.id) as total_meetings
      FROM parents p
      LEFT JOIN student_parents sp ON p.id = sp.parent_id
      LEFT JOIN parent_communications pc ON p.id = pc.parent_id
      LEFT JOIN parent_meetings pm ON p.id = pm.parent_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(parents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single parent with full details
router.get('/parents/:id', async (req, res) => {
  try {
    const [parent] = await pool.query('SELECT * FROM parents WHERE id = ?', [req.params.id]);
    const [children] = await pool.query(`
      SELECT sp.*, s.first_name, s.last_name, s.student_code, s.class
      FROM student_parents sp
      LEFT JOIN students s ON sp.student_id = s.id
      WHERE sp.parent_id = ?
    `, [req.params.id]);
    const [communications] = await pool.query(`
      SELECT * FROM parent_communications WHERE parent_id = ? ORDER BY created_at DESC LIMIT 10
    `, [req.params.id]);
    const [meetings] = await pool.query(`
      SELECT * FROM parent_meetings WHERE parent_id = ? ORDER BY meeting_date DESC LIMIT 10
    `, [req.params.id]);
    
    res.json({ ...parent[0], children, communications, meetings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create parent
router.post('/parents', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO parents SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update parent
router.put('/parents/:id', async (req, res) => {
  try {
    await pool.query('UPDATE parents SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete parent
router.delete('/parents/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM parents WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ COMMUNICATIONS ============

// Get all communications
router.get('/communications', async (req, res) => {
  try {
    const [communications] = await pool.query(`
      SELECT pc.*, p.first_name, p.last_name, p.phone, p.email
      FROM parent_communications pc
      JOIN parents p ON pc.parent_id = p.id
      ORDER BY pc.created_at DESC
    `);
    res.json(communications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create communication
router.post('/communications', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO parent_communications SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update communication
router.put('/communications/:id', async (req, res) => {
  try {
    await pool.query('UPDATE parent_communications SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete communication
router.delete('/communications/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM parent_communications WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MEETINGS ============

// Get all meetings
router.get('/meetings', async (req, res) => {
  try {
    const [meetings] = await pool.query(`
      SELECT pm.*, p.first_name, p.last_name, p.phone
      FROM parent_meetings pm
      JOIN parents p ON pm.parent_id = p.id
      ORDER BY pm.meeting_date DESC
    `);
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create meeting
router.post('/meetings', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO parent_meetings SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update meeting
router.put('/meetings/:id', async (req, res) => {
  try {
    await pool.query('UPDATE parent_meetings SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete meeting
router.delete('/meetings/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM parent_meetings WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ BEHAVIOR RECORDS ============

// Get all behavior records
router.get('/behavior', async (req, res) => {
  try {
    const [records] = await pool.query(`
      SELECT sb.*, s.first_name, s.last_name, s.student_code
      FROM student_behavior sb
      LEFT JOIN students s ON sb.student_id = s.id
      ORDER BY sb.incident_date DESC
    `);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create behavior record
router.post('/behavior', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO student_behavior SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update behavior record
router.put('/behavior/:id', async (req, res) => {
  try {
    await pool.query('UPDATE student_behavior SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ COUNSELING SESSIONS ============

// Get all counseling sessions
router.get('/counseling', async (req, res) => {
  try {
    const [sessions] = await pool.query(`
      SELECT cs.*, s.first_name, s.last_name, s.student_code
      FROM counseling_sessions cs
      LEFT JOIN students s ON cs.student_id = s.id
      ORDER BY cs.session_date DESC
    `);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create counseling session
router.post('/counseling', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO counseling_sessions SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update counseling session
router.put('/counseling/:id', async (req, res) => {
  try {
    await pool.query('UPDATE counseling_sessions SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HOME VISITS ============

// Get all home visits
router.get('/home-visits', async (req, res) => {
  try {
    const [visits] = await pool.query(`
      SELECT hv.*, s.first_name, s.last_name, s.student_code
      FROM home_visits hv
      LEFT JOIN students s ON hv.student_id = s.id
      ORDER BY hv.visit_date DESC
    `);
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create home visit
router.post('/home-visits', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO home_visits SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update home visit
router.put('/home-visits/:id', async (req, res) => {
  try {
    await pool.query('UPDATE home_visits SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ATTENDANCE ============

// Get attendance records
router.get('/attendance', async (req, res) => {
  try {
    const { date, student_id } = req.query;
    let query = `
      SELECT sa.*, s.first_name, s.last_name, s.student_code, s.class
      FROM student_attendance sa
      LEFT JOIN students s ON sa.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    
    if (date) {
      query += ' AND sa.attendance_date = ?';
      params.push(date);
    }
    if (student_id) {
      query += ' AND sa.student_id = ?';
      params.push(student_id);
    }
    
    query += ' ORDER BY sa.attendance_date DESC, s.last_name ASC';
    
    const [records] = await pool.query(query, params);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create attendance record
router.post('/attendance', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO student_attendance SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update attendance
router.put('/attendance/:id', async (req, res) => {
  try {
    await pool.query('UPDATE student_attendance SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ACADEMIC PROGRESS ============

// Get academic progress
router.get('/academic-progress', async (req, res) => {
  try {
    const [records] = await pool.query(`
      SELECT ap.*, s.first_name, s.last_name, s.student_code, c.name as course_name
      FROM academic_progress ap
      LEFT JOIN students s ON ap.student_id = s.id
      LEFT JOIN courses c ON ap.course_id = c.id
      ORDER BY ap.academic_year DESC, ap.term DESC
    `);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create progress record
router.post('/academic-progress', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO academic_progress SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update progress record
router.put('/academic-progress/:id', async (req, res) => {
  try {
    await pool.query('UPDATE academic_progress SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PARENT FEEDBACK ============

// Get all feedback
router.get('/feedback', async (req, res) => {
  try {
    const [feedback] = await pool.query(`
      SELECT pf.*, p.first_name, p.last_name, p.phone
      FROM parent_feedback pf
      JOIN parents p ON pf.parent_id = p.id
      ORDER BY pf.created_at DESC
    `);
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create feedback
router.post('/feedback', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO parent_feedback SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update feedback
router.put('/feedback/:id', async (req, res) => {
  try {
    await pool.query('UPDATE parent_feedback SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADVISOR TASKS ============

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const [tasks] = await pool.query(`
      SELECT at.*, 
        s.first_name as student_first_name, s.last_name as student_last_name,
        p.first_name as parent_first_name, p.last_name as parent_last_name
      FROM advisor_tasks at
      LEFT JOIN students s ON at.related_student_id = s.id
      LEFT JOIN parents p ON at.related_parent_id = p.id
      ORDER BY at.due_date ASC, at.priority DESC
    `);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/tasks', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO advisor_tasks SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/tasks/:id', async (req, res) => {
  try {
    await pool.query('UPDATE advisor_tasks SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM advisor_tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DASHBOARD STATISTICS ============

router.get('/stats', async (req, res) => {
  try {
    const [totalParents] = await pool.query('SELECT COUNT(*) as count FROM parents WHERE status = "active"');
    const [totalCommunications] = await pool.query('SELECT COUNT(*) as count FROM parent_communications WHERE DATE(created_at) = CURDATE()');
    const [pendingMeetings] = await pool.query('SELECT COUNT(*) as count FROM parent_meetings WHERE status = "scheduled" AND meeting_date >= NOW()');
    const [pendingTasks] = await pool.query('SELECT COUNT(*) as count FROM advisor_tasks WHERE status = "pending"');
    const [behaviorIssues] = await pool.query('SELECT COUNT(*) as count FROM student_behavior WHERE behavior_type = "negative" AND resolved = false');
    const [pendingFeedback] = await pool.query('SELECT COUNT(*) as count FROM parent_feedback WHERE status != "resolved"');
    const [todayAttendance] = await pool.query('SELECT COUNT(*) as count FROM student_attendance WHERE attendance_date = CURDATE()');
    const [absentToday] = await pool.query('SELECT COUNT(*) as count FROM student_attendance WHERE attendance_date = CURDATE() AND status IN ("absent", "sick")');
    
    res.json({
      totalParents: totalParents[0].count,
      todayCommunications: totalCommunications[0].count,
      upcomingMeetings: pendingMeetings[0].count,
      pendingTasks: pendingTasks[0].count,
      behaviorIssues: behaviorIssues[0].count,
      pendingFeedback: pendingFeedback[0].count,
      todayAttendance: todayAttendance[0].count,
      absentToday: absentToday[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EMERGENCY CONTACTS ============

// Get emergency contacts
router.get('/emergency-contacts/:studentId', async (req, res) => {
  try {
    const [contacts] = await pool.query(`
      SELECT * FROM emergency_contacts 
      WHERE student_id = ? 
      ORDER BY priority_order ASC
    `, [req.params.studentId]);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create emergency contact
router.post('/emergency-contacts', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO emergency_contacts SET ?', [req.body]);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update emergency contact
router.put('/emergency-contacts/:id', async (req, res) => {
  try {
    await pool.query('UPDATE emergency_contacts SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

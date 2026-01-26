const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { student_id, counselor_id, session_type, category, follow_up_required, page = 1, limit = 50, search } = req.query;
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

    if (req.user.role === 'student') {
      query += ' AND cs.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND cs.student_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    } else if (student_id) {
      query += ' AND cs.student_id = ?';
      params.push(student_id);
    }

    if (counselor_id) {
      query += ' AND cs.counselor_id = ?';
      params.push(counselor_id);
    }
    if (session_type) {
      query += ' AND cs.session_type = ?';
      params.push(session_type);
    }
    if (category) {
      query += ' AND cs.category = ?';
      params.push(category);
    }
    if (follow_up_required !== undefined) {
      query += ' AND cs.follow_up_required = ?';
      params.push(follow_up_required === 'true' ? 1 : 0);
    }
    if (search) {
      query += ` AND (cs.title_en LIKE ? OR cs.title_rw LIKE ? OR cs.description_en LIKE ? OR cs.description_rw LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace(
      'SELECT cs.*, s.first_name as student_first_name, s.last_name as student_last_name, c.first_name as counselor_first_name, c.last_name as counselor_last_name',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY cs.session_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [sessions] = await pool.query(query, params);

    res.json({
      success: true,
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get counseling sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch counseling sessions', error: error.message });
  }
});

router.get('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT cs.*, 
        s.first_name as student_first_name, s.last_name as student_last_name, s.email as student_email,
        c.first_name as counselor_first_name, c.last_name as counselor_last_name, c.email as counselor_email
      FROM counseling_sessions cs
      LEFT JOIN users s ON cs.student_id = s.id
      LEFT JOIN users c ON cs.counselor_id = c.id
      WHERE cs.id = ?
    `;
    const params = [id];

    if (req.user.role === 'student') {
      query += ' AND cs.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND cs.student_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    }

    const [sessions] = await pool.query(query, params);

    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Counseling session not found' });
    }

    res.json({ success: true, session: sessions[0] });
  } catch (error) {
    console.error('Get counseling session error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch counseling session', error: error.message });
  }
});

router.post('/sessions', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const {
      student_id, counselor_id, session_type, category,
      title_rw, title_en, description_rw, description_en,
      session_date, duration_minutes, location,
      concerns_rw, concerns_en, interventions_rw, interventions_en,
      outcomes_rw, outcomes_en, follow_up_required, follow_up_date
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO counseling_sessions 
       (student_id, counselor_id, session_type, category, title_rw, title_en, 
        description_rw, description_en, session_date, duration_minutes, location,
        concerns_rw, concerns_en, interventions_rw, interventions_en,
        outcomes_rw, outcomes_en, follow_up_required, follow_up_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, counselor_id || req.user.id, session_type, category,
       title_rw, title_en, description_rw, description_en,
       session_date, duration_minutes, location,
       concerns_rw, concerns_en, interventions_rw, interventions_en,
       outcomes_rw, outcomes_en, follow_up_required ? 1 : 0, follow_up_date, 'scheduled']
    );

    res.status(201).json({ success: true, message: 'Counseling session created', id: result.insertId });
  } catch (error) {
    console.error('Create counseling session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create counseling session', error: error.message });
  }
});

router.put('/sessions/:id', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_id, counselor_id, session_type, category,
      title_rw, title_en, description_rw, description_en,
      session_date, duration_minutes, location,
      concerns_rw, concerns_en, interventions_rw, interventions_en,
      outcomes_rw, outcomes_en, follow_up_required, follow_up_date, status
    } = req.body;

    await pool.query(
      `UPDATE counseling_sessions 
       SET student_id = ?, counselor_id = ?, session_type = ?, category = ?,
           title_rw = ?, title_en = ?, description_rw = ?, description_en = ?,
           session_date = ?, duration_minutes = ?, location = ?,
           concerns_rw = ?, concerns_en = ?, interventions_rw = ?, interventions_en = ?,
           outcomes_rw = ?, outcomes_en = ?, follow_up_required = ?, follow_up_date = ?, status = ?
       WHERE id = ?`,
      [student_id, counselor_id, session_type, category,
       title_rw, title_en, description_rw, description_en,
       session_date, duration_minutes, location,
       concerns_rw, concerns_en, interventions_rw, interventions_en,
       outcomes_rw, outcomes_en, follow_up_required ? 1 : 0, follow_up_date, status, id]
    );

    res.json({ success: true, message: 'Counseling session updated successfully' });
  } catch (error) {
    console.error('Update counseling session error:', error);
    res.status(500).json({ success: false, message: 'Failed to update counseling session', error: error.message });
  }
});

router.delete('/sessions/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM counseling_sessions WHERE id = ?', [id]);
    res.json({ success: true, message: 'Counseling session deleted successfully' });
  } catch (error) {
    console.error('Delete counseling session error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete counseling session', error: error.message });
  }
});

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const params = [];
    let dateFilter = '';

    if (start_date && end_date) {
      dateFilter = ' AND session_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const [totalSessions] = await pool.query(
      `SELECT COUNT(*) as total FROM counseling_sessions WHERE 1=1${dateFilter}`,
      params
    );

    const [byCategory] = await pool.query(
      `SELECT category, COUNT(*) as count FROM counseling_sessions WHERE 1=1${dateFilter} GROUP BY category`,
      params
    );

    const [bySessionType] = await pool.query(
      `SELECT session_type, COUNT(*) as count FROM counseling_sessions WHERE 1=1${dateFilter} GROUP BY session_type`,
      params
    );

    const [followUpRequired] = await pool.query(
      `SELECT COUNT(*) as count FROM counseling_sessions WHERE follow_up_required = 1${dateFilter}`,
      params
    );

    const [avgDuration] = await pool.query(
      `SELECT AVG(duration_minutes) as avg_duration FROM counseling_sessions WHERE 1=1${dateFilter}`,
      params
    );

    const [topCounselors] = await pool.query(
      `SELECT cs.counselor_id, u.first_name, u.last_name, COUNT(*) as session_count
       FROM counseling_sessions cs
       LEFT JOIN users u ON cs.counselor_id = u.id
       WHERE 1=1${dateFilter}
       GROUP BY cs.counselor_id
       ORDER BY session_count DESC
       LIMIT 10`,
      params
    );

    res.json({
      success: true,
      analytics: {
        total_sessions: totalSessions[0].total,
        by_category: byCategory,
        by_session_type: bySessionType,
        follow_up_required: followUpRequired[0].count,
        avg_duration_minutes: Math.round(avgDuration[0].avg_duration || 0),
        top_counselors: topCounselors
      }
    });
  } catch (error) {
    console.error('Get counseling analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

module.exports = router;

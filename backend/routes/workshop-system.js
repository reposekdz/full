const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/workshops', async (req, res) => {
  try {
    const { status, target_audience, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM workshops WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (target_audience) {
      query += ' AND target_audience LIKE ?';
      params.push(`%${target_audience}%`);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR facilitator LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY start_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [workshops] = await pool.query(query, params);

    for (let workshop of workshops) {
      const [[{ participant_count }]] = await pool.query(
        `SELECT COUNT(*) as participant_count 
         FROM workshop_registrations 
         WHERE workshop_id = ? AND status = 'confirmed'`,
        [workshop.id]
      );
      workshop.current_participants = participant_count;
    }

    res.json({
      success: true,
      workshops,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get workshops error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workshops', error: error.message });
  }
});

router.get('/workshops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [workshops] = await pool.query('SELECT * FROM workshops WHERE id = ?', [id]);

    if (workshops.length === 0) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    const [registrations] = await pool.query(
      `SELECT wr.*, u.first_name, u.last_name, u.email
       FROM workshop_registrations wr
       LEFT JOIN users u ON wr.user_id = u.id
       WHERE wr.workshop_id = ?`,
      [id]
    );

    res.json({
      success: true,
      workshop: {
        ...workshops[0],
        registrations,
        current_participants: registrations.filter(r => r.status === 'confirmed').length
      }
    });
  } catch (error) {
    console.error('Get workshop error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workshop', error: error.message });
  }
});

router.post('/workshops', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const {
      title, description, facilitator, start_date, end_date,
      venue, target_audience, max_participants
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO workshops 
       (title, description, facilitator, start_date, end_date, venue, 
        target_audience, max_participants, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [title, description, facilitator, start_date, end_date, venue,
       target_audience, max_participants]
    );

    res.status(201).json({ success: true, message: 'Workshop created', id: result.insertId });
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(500).json({ success: false, message: 'Failed to create workshop', error: error.message });
  }
});

router.put('/workshops/:id', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, facilitator, start_date, end_date,
      venue, target_audience, max_participants, status
    } = req.body;

    await pool.query(
      `UPDATE workshops 
       SET title = ?, description = ?, facilitator = ?, start_date = ?, end_date = ?,
           venue = ?, target_audience = ?, max_participants = ?, status = ?
       WHERE id = ?`,
      [title, description, facilitator, start_date, end_date, venue,
       target_audience, max_participants, status, id]
    );

    res.json({ success: true, message: 'Workshop updated successfully' });
  } catch (error) {
    console.error('Update workshop error:', error);
    res.status(500).json({ success: false, message: 'Failed to update workshop', error: error.message });
  }
});

router.delete('/workshops/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;

    const [[{ registration_count }]] = await pool.query(
      'SELECT COUNT(*) as registration_count FROM workshop_registrations WHERE workshop_id = ?',
      [id]
    );

    if (registration_count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete workshop with existing registrations. Cancel it instead.'
      });
    }

    await pool.query('DELETE FROM workshops WHERE id = ?', [id]);
    res.json({ success: true, message: 'Workshop deleted successfully' });
  } catch (error) {
    console.error('Delete workshop error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete workshop', error: error.message });
  }
});

router.get('/registrations', authenticateToken, async (req, res) => {
  try {
    const { workshop_id, user_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT wr.*, 
        w.title as workshop_title, w.start_date, w.end_date, w.venue,
        u.first_name, u.last_name, u.email
      FROM workshop_registrations wr
      LEFT JOIN workshops w ON wr.workshop_id = w.id
      LEFT JOIN users u ON wr.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' AND wr.user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND wr.user_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    } else {
      if (workshop_id) {
        query += ' AND wr.workshop_id = ?';
        params.push(workshop_id);
      }
      if (user_id) {
        query += ' AND wr.user_id = ?';
        params.push(user_id);
      }
    }

    if (status) {
      query += ' AND wr.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(
      'SELECT wr.*, w.title as workshop_title, w.start_date, w.end_date, w.venue, u.first_name, u.last_name, u.email',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY wr.registration_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [registrations] = await pool.query(query, params);

    res.json({
      success: true,
      registrations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get workshop registrations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
  }
});

router.post('/registrations', authenticateToken, async (req, res) => {
  try {
    const { workshop_id } = req.body;
    const user_id = req.user.id;

    const [[workshop]] = await pool.query(
      'SELECT max_participants, status FROM workshops WHERE id = ?',
      [workshop_id]
    );

    if (!workshop || workshop.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Workshop not available' });
    }

    const [[{ participant_count }]] = await pool.query(
      `SELECT COUNT(*) as participant_count 
       FROM workshop_registrations 
       WHERE workshop_id = ? AND status = 'confirmed'`,
      [workshop_id]
    );

    if (participant_count >= workshop.max_participants) {
      return res.status(400).json({ success: false, message: 'Workshop is full' });
    }

    const [[existingRegistration]] = await pool.query(
      'SELECT id FROM workshop_registrations WHERE workshop_id = ? AND user_id = ?',
      [workshop_id, user_id]
    );

    if (existingRegistration) {
      return res.status(400).json({ success: false, message: 'Already registered for this workshop' });
    }

    const [result] = await pool.query(
      `INSERT INTO workshop_registrations (workshop_id, user_id, registration_date, status) 
       VALUES (?, ?, NOW(), 'confirmed')`,
      [workshop_id, user_id]
    );

    res.status(201).json({ success: true, message: 'Registered successfully', id: result.insertId });
  } catch (error) {
    console.error('Create workshop registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to register', error: error.message });
  }
});

router.delete('/registrations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [[registration]] = await pool.query(
      'SELECT user_id, workshop_id FROM workshop_registrations WHERE id = ?',
      [id]
    );

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (req.user.role === 'student' && registration.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [[workshop]] = await pool.query(
      'SELECT start_date FROM workshops WHERE id = ?',
      [registration.workshop_id]
    );

    const hoursUntilStart = (new Date(workshop.start_date) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilStart < 24 && req.user.role === 'student') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration less than 24 hours before workshop start'
      });
    }

    await pool.query('UPDATE workshop_registrations SET status = ? WHERE id = ?', ['cancelled', id]);
    res.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel workshop registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel registration', error: error.message });
  }
});

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const params = [];
    let dateFilter = '';

    if (start_date && end_date) {
      dateFilter = ' AND start_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const [totalWorkshops] = await pool.query(
      `SELECT COUNT(*) as total FROM workshops WHERE 1=1${dateFilter}`,
      params
    );

    const [byStatus] = await pool.query(
      `SELECT status, COUNT(*) as count FROM workshops WHERE 1=1${dateFilter} GROUP BY status`,
      params
    );

    const [totalRegistrations] = await pool.query(
      `SELECT COUNT(*) as total 
       FROM workshop_registrations wr
       JOIN workshops w ON wr.workshop_id = w.id
       WHERE 1=1${dateFilter}`,
      params
    );

    const [avgParticipation] = await pool.query(
      `SELECT AVG(participant_count) as avg_participants
       FROM (
         SELECT w.id, COUNT(wr.id) as participant_count
         FROM workshops w
         LEFT JOIN workshop_registrations wr ON w.id = wr.workshop_id AND wr.status = 'confirmed'
         WHERE 1=1${dateFilter}
         GROUP BY w.id
       ) as subquery`,
      params
    );

    const [popularWorkshops] = await pool.query(
      `SELECT w.id, w.title, w.facilitator, COUNT(wr.id) as registration_count
       FROM workshops w
       LEFT JOIN workshop_registrations wr ON w.id = wr.workshop_id
       WHERE 1=1${dateFilter}
       GROUP BY w.id
       ORDER BY registration_count DESC
       LIMIT 10`,
      params
    );

    const [monthlyTrends] = await pool.query(
      `SELECT DATE_FORMAT(start_date, '%Y-%m') as month, COUNT(*) as count
       FROM workshops
       WHERE 1=1${dateFilter}
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`,
      params
    );

    res.json({
      success: true,
      analytics: {
        total_workshops: totalWorkshops[0].total,
        by_status: byStatus,
        total_registrations: totalRegistrations[0].total,
        avg_participants: Math.round(avgParticipation[0].avg_participants || 0),
        popular_workshops: popularWorkshops,
        monthly_trends: monthlyTrends
      }
    });
  } catch (error) {
    console.error('Get workshop analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

module.exports = router;

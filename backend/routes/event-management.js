const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const upload = multer({ dest: 'uploads/events/' });

router.get('/events', async (req, res) => {
  try {
    const { type, status, upcoming } = req.query;
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND event_type = ?';
      params.push(type);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (upcoming === 'true') {
      query += ' AND event_date >= CURDATE()';
    }
    
    query += ' ORDER BY event_date DESC';
    
    const [events] = await pool.execute(query, params);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const [events] = await pool.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const [attendees] = await pool.execute(`
      SELECT ea.*, u.first_name, u.last_name, u.email
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = ?
    `, [req.params.id]);
    
    res.json({ success: true, event: events[0], attendees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/events', upload.single('image'), async (req, res) => {
  try {
    const { title, description, event_type, event_date, start_time, end_time, location, max_attendees, organizer_id } = req.body;
    const image_url = req.file ? `/uploads/events/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO events (title, description, event_type, event_date, start_time, end_time, location, max_attendees, organizer_id, image_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())`,
      [title, description, event_type, event_date, start_time, end_time, location, max_attendees, organizer_id, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/events/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, event_type, event_date, start_time, end_time, location, max_attendees, status } = req.body;
    
    let query = `UPDATE events SET title = ?, description = ?, event_type = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, max_attendees = ?, status = ?`;
    const params = [title, description, event_type, event_date, start_time, end_time, location, max_attendees, status];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/events/${req.file.filename}`);
    }
    
    query += ', updated_at = NOW() WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await pool.execute('UPDATE events SET status = "cancelled" WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/events/:id/register', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const [events] = await pool.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const event = events[0];
    
    const [existingRegistration] = await pool.execute(
      'SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?',
      [req.params.id, user_id]
    );
    
    if (existingRegistration.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }
    
    const [attendeeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ?',
      [req.params.id]
    );
    
    if (event.max_attendees && attendeeCount[0].count >= event.max_attendees) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO event_attendees (event_id, user_id, registration_date, status)
       VALUES (?, ?, NOW(), 'registered')`,
      [req.params.id, user_id]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/events/:id/attendees/:userId', async (req, res) => {
  try {
    const { status } = req.body;
    
    await pool.execute(
      'UPDATE event_attendees SET status = ?, updated_at = NOW() WHERE event_id = ? AND user_id = ?',
      [status, req.params.id, req.params.userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/event-types', async (req, res) => {
  try {
    const [types] = await pool.execute(`
      SELECT 
        event_type,
        COUNT(*) as event_count
      FROM events
      GROUP BY event_type
      ORDER BY event_count DESC
    `);
    
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/event-calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const [events] = await pool.execute(`
      SELECT * FROM events 
      WHERE MONTH(event_date) = ? AND YEAR(event_date) = ?
      AND status != 'cancelled'
      ORDER BY event_date, start_time
    `, [month || new Date().getMonth() + 1, year || new Date().getFullYear()]);
    
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/event-feedback', async (req, res) => {
  try {
    const { event_id, user_id, rating, comments } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO event_feedback (event_id, user_id, rating, comments, feedback_date, created_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [event_id, user_id, rating, comments]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/event-feedback/:eventId', async (req, res) => {
  try {
    const [feedback] = await pool.execute(`
      SELECT ef.*, u.first_name, u.last_name
      FROM event_feedback ef
      JOIN users u ON ef.user_id = u.id
      WHERE ef.event_id = ?
      ORDER BY ef.feedback_date DESC
    `, [req.params.eventId]);
    
    const [stats] = await pool.execute(`
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_feedback
      FROM event_feedback
      WHERE event_id = ?
    `, [req.params.eventId]);
    
    res.json({ success: true, feedback, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-events', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    const [events] = await pool.execute(`
      SELECT e.*, ea.status as registration_status
      FROM events e
      JOIN event_attendees ea ON e.id = ea.event_id
      WHERE ea.user_id = ?
      ORDER BY e.event_date DESC
    `, [user_id]);
    
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/event-statistics', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_events,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_events,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_events,
        COUNT(CASE WHEN event_date >= CURDATE() THEN 1 END) as upcoming_events
      FROM events
    `);
    
    const [attendance] = await pool.execute(`
      SELECT 
        e.title,
        e.max_attendees,
        COUNT(ea.id) as registered_count,
        COUNT(CASE WHEN ea.status = 'attended' THEN 1 END) as attended_count
      FROM events e
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      WHERE e.status = 'completed'
      GROUP BY e.id, e.title, e.max_attendees
      ORDER BY attended_count DESC
      LIMIT 10
    `);
    
    res.json({ success: true, stats: stats[0], topEvents: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/event-reminders', async (req, res) => {
  try {
    const [upcomingEvents] = await pool.execute(`
      SELECT e.*, COUNT(ea.id) as attendee_count
      FROM events e
      LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.status = 'registered'
      WHERE e.event_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      AND e.status = 'scheduled'
      GROUP BY e.id
    `);
    
    res.json({ success: true, events: upcomingEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/event-attendees/:eventId/export', async (req, res) => {
  try {
    const [attendees] = await pool.execute(`
      SELECT 
        u.student_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        ea.registration_date,
        ea.status
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = ?
      ORDER BY ea.registration_date
    `, [req.params.eventId]);
    
    res.json({ success: true, attendees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/event-announcements', async (req, res) => {
  try {
    const { event_id, title, message, target_audience } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO event_announcements (event_id, title, message, target_audience, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [event_id, title, message, target_audience]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/event-announcements/:eventId', async (req, res) => {
  try {
    const [announcements] = await pool.execute(
      'SELECT * FROM event_announcements WHERE event_id = ? ORDER BY created_at DESC',
      [req.params.eventId]
    );
    
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/event-checkin', async (req, res) => {
  try {
    const { event_id, user_id } = req.body;
    
    await pool.execute(
      `UPDATE event_attendees 
       SET status = 'attended', check_in_time = NOW() 
       WHERE event_id = ? AND user_id = ?`,
      [event_id, user_id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/event-certificates', async (req, res) => {
  try {
    const { event_id } = req.query;
    
    const [certificates] = await pool.execute(`
      SELECT ec.*, u.first_name, u.last_name, e.title as event_title
      FROM event_certificates ec
      JOIN users u ON ec.user_id = u.id
      JOIN events e ON ec.event_id = e.id
      WHERE ec.event_id = ?
    `, [event_id]);
    
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/event-certificates', async (req, res) => {
  try {
    const { event_id, user_id, certificate_url } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO event_certificates (event_id, user_id, certificate_url, issue_date, created_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [event_id, user_id, certificate_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/events/'),
  filename: (req, file, cb) => cb(null, `event_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get all events
router.get('/', authenticate, async (req, res) => {
  try {
    const { event_type, status, upcoming } = req.query;
    let query = 'SELECT e.*, u.name as organizer_name FROM events e LEFT JOIN users u ON e.organizer_id = u.id WHERE 1=1';
    const params = [];
    
    if (event_type) {
      query += ' AND e.event_type = ?';
      params.push(event_type);
    }
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (upcoming === 'true') {
      query += ' AND e.event_date >= CURDATE()';
    }
    
    query += ' ORDER BY e.event_date ASC';
    const [events] = await db.query(query, params);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get event by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, u.name as organizer_name 
      FROM events e 
      LEFT JOIN users u ON e.organizer_id = u.id 
      WHERE e.id = ?
    `, [req.params.id]);
    
    if (!events.length) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const [participants] = await db.query(`
      SELECT ep.*, u.name as participant_name, u.email 
      FROM event_participants ep 
      JOIN users u ON ep.user_id = u.id 
      WHERE ep.event_id = ?
    `, [req.params.id]);
    
    res.json({ success: true, event: { ...events[0], participants } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create event (Admin/Organizer)
router.post('/', authenticate, authorize(['admin', 'teacher', 'dos']), upload.single('banner'), async (req, res) => {
  try {
    const { title, description, event_type, event_date, start_time, end_time, venue, max_participants, registration_deadline, fees, requirements, agenda, target_audience } = req.body;
    const banner = req.file ? `/uploads/events/${req.file.filename}` : null;
    
    const [result] = await db.query(
      `INSERT INTO events (title, description, event_type, event_date, start_time, end_time, venue, max_participants, registration_deadline, fees, requirements, agenda, target_audience, organizer_id, banner, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
      [title, description, event_type, event_date, start_time, end_time, venue, max_participants, registration_deadline, fees, requirements, agenda, target_audience, req.user.id, banner]
    );
    
    res.status(201).json({ success: true, id: result.insertId, message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update event
router.put('/:id', authenticate, authorize(['admin', 'teacher', 'dos']), upload.single('banner'), async (req, res) => {
  try {
    const { title, description, event_type, event_date, start_time, end_time, venue, max_participants, registration_deadline, fees, requirements, agenda, target_audience, status } = req.body;
    const banner = req.file ? `/uploads/events/${req.file.filename}` : null;
    
    let query = 'UPDATE events SET title = ?, description = ?, event_type = ?, event_date = ?, start_time = ?, end_time = ?, venue = ?, max_participants = ?, registration_deadline = ?, fees = ?, requirements = ?, agenda = ?, target_audience = ?, status = ?';
    const params = [title, description, event_type, event_date, start_time, end_time, venue, max_participants, registration_deadline, fees, requirements, agenda, target_audience, status];
    
    if (banner) {
      query += ', banner = ?';
      params.push(banner);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.query(query, params);
    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete event
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM event_participants WHERE event_id = ?', [req.params.id]);
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register for event
router.post('/:id/register', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const { additional_info } = req.body;
    
    const [event] = await db.query('SELECT * FROM events WHERE id = ? AND status = "upcoming"', [eventId]);
    if (!event.length) {
      return res.status(404).json({ success: false, message: 'Event not found or not available' });
    }
    
    if (new Date() > new Date(event[0].registration_deadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }
    
    const [existing] = await db.query('SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?', [eventId, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }
    
    const [participants] = await db.query('SELECT COUNT(*) as count FROM event_participants WHERE event_id = ? AND status = "confirmed"', [eventId]);
    if (event[0].max_participants && participants[0].count >= event[0].max_participants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    
    const [result] = await db.query(
      'INSERT INTO event_participants (event_id, user_id, additional_info, registration_fee, status) VALUES (?, ?, ?, ?, "confirmed")',
      [eventId, userId, additional_info, event[0].fees || 0]
    );
    
    res.status(201).json({ success: true, registrationId: result.insertId, message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel registration
router.delete('/:id/register', authenticate, async (req, res) => {
  try {
    await db.query('UPDATE event_participants SET status = "cancelled" WHERE event_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my registered events
router.get('/my/registrations', authenticate, async (req, res) => {
  try {
    const [registrations] = await db.query(`
      SELECT ep.*, e.title, e.event_type, e.event_date, e.start_time, e.venue, e.banner 
      FROM event_participants ep 
      JOIN events e ON ep.event_id = e.id 
      WHERE ep.user_id = ? 
      ORDER BY e.event_date DESC
    `, [req.user.id]);
    
    res.json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark attendance (Admin/Organizer)
router.post('/:id/attendance', authenticate, authorize(['admin', 'teacher', 'dos']), async (req, res) => {
  try {
    const { user_id, attended, attendance_time } = req.body;
    
    await db.query(
      'UPDATE event_participants SET attended = ?, attendance_time = ? WHERE event_id = ? AND user_id = ?',
      [attended, attendance_time || new Date(), req.params.id, user_id]
    );
    
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get event analytics
router.get('/:id/analytics', authenticate, authorize(['admin', 'teacher', 'dos']), async (req, res) => {
  try {
    const [event] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event.length) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_registrations,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN attended = true THEN 1 ELSE 0 END) as attended,
        SUM(registration_fee) as total_revenue
      FROM event_participants 
      WHERE event_id = ?
    `, [req.params.id]);
    
    res.json({ success: true, analytics: { ...event[0], ...stats[0] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

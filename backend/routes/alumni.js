const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Register alumni
router.post('/register', async (req, res) => {
  try {
    const { student_id, graduation_year, current_occupation, company, position, email, phone, address, linkedin, achievements } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO alumni (student_id, graduation_year, current_occupation, company, position, email, phone, address, linkedin, achievements) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, graduation_year, current_occupation, company, position, email, phone, address, linkedin, JSON.stringify(achievements)]
    );
    
    res.json({ success: true, alumni_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get alumni directory
router.get('/directory', async (req, res) => {
  try {
    const { search, graduation_year, occupation, company } = req.query;
    let query = `SELECT a.*, s.first_name, s.last_name, s.photo FROM alumni a JOIN students s ON a.student_id = s.id WHERE 1=1`;
    const params = [];
    
    if (search) {
      query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR a.company LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (graduation_year) {
      query += ' AND a.graduation_year = ?';
      params.push(graduation_year);
    }
    if (occupation) {
      query += ' AND a.current_occupation LIKE ?';
      params.push(`%${occupation}%`);
    }
    if (company) {
      query += ' AND a.company LIKE ?';
      params.push(`%${company}%`);
    }
    
    query += ' ORDER BY a.graduation_year DESC';
    const [alumni] = await db.query(query, params);
    res.json({ success: true, alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get alumni profile
router.get('/:id', async (req, res) => {
  try {
    const [alumni] = await db.query(
      `SELECT a.*, s.first_name, s.last_name, s.photo, s.student_code 
       FROM alumni a 
       JOIN students s ON a.student_id = s.id 
       WHERE a.id = ?`,
      [req.params.id]
    );
    
    if (alumni.length === 0) return res.status(404).json({ success: false, message: 'Alumni not found' });
    
    res.json({ success: true, alumni: alumni[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update alumni profile
router.put('/:id', async (req, res) => {
  try {
    const { current_occupation, company, position, email, phone, address, linkedin, achievements } = req.body;
    
    await db.query(
      `UPDATE alumni SET current_occupation = ?, company = ?, position = ?, email = ?, phone = ?, address = ?, linkedin = ?, achievements = ? WHERE id = ?`,
      [current_occupation, company, position, email, phone, address, linkedin, JSON.stringify(achievements), req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alumni events
router.post('/events', async (req, res) => {
  try {
    const { title, description, event_date, event_time, location, organizer_id, max_attendees } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO alumni_events (title, description, event_date, event_time, location, organizer_id, max_attendees) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, event_date, event_time, location, organizer_id, max_attendees]
    );
    
    res.json({ success: true, event_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/events/list', async (req, res) => {
  try {
    const { upcoming } = req.query;
    let query = 'SELECT * FROM alumni_events';
    
    if (upcoming === 'true') {
      query += ' WHERE event_date >= CURDATE()';
    }
    
    query += ' ORDER BY event_date DESC';
    const [events] = await db.query(query);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Event registration
router.post('/events/:eventId/register', async (req, res) => {
  try {
    const { alumni_id } = req.body;
    
    // Check capacity
    const [event] = await db.query('SELECT max_attendees FROM alumni_events WHERE id = ?', [req.params.eventId]);
    const [count] = await db.query('SELECT COUNT(*) as count FROM alumni_event_registrations WHERE event_id = ?', [req.params.eventId]);
    
    if (event[0].max_attendees && count[0].count >= event[0].max_attendees) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    
    await db.query(
      'INSERT INTO alumni_event_registrations (event_id, alumni_id) VALUES (?, ?)',
      [req.params.eventId, alumni_id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Job postings
router.post('/jobs', async (req, res) => {
  try {
    const { title, company, description, requirements, location, salary_range, posted_by, application_url } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO alumni_jobs (title, company, description, requirements, location, salary_range, posted_by, application_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, company, description, requirements, location, salary_range, posted_by, application_url]
    );
    
    res.json({ success: true, job_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/jobs/list', async (req, res) => {
  try {
    const [jobs] = await db.query('SELECT * FROM alumni_jobs WHERE status = ? ORDER BY created_at DESC', ['active']);
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [total] = await db.query('SELECT COUNT(*) as count FROM alumni');
    const [byYear] = await db.query('SELECT graduation_year, COUNT(*) as count FROM alumni GROUP BY graduation_year ORDER BY graduation_year DESC');
    const [byOccupation] = await db.query('SELECT current_occupation, COUNT(*) as count FROM alumni GROUP BY current_occupation ORDER BY count DESC LIMIT 10');
    const [employed] = await db.query('SELECT COUNT(*) as count FROM alumni WHERE current_occupation IS NOT NULL AND current_occupation != ""');
    
    res.json({ 
      success: true, 
      stats: {
        total: total[0].count,
        employed: employed[0].count,
        byYear,
        topOccupations: byOccupation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

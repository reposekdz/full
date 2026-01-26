const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== ALUMNI ====================

router.get('/alumni', async (req, res) => {
  try {
    const { graduation_year, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
        u.first_name, u.last_name, u.email as user_email, u.profile_image
      FROM alumni a
      LEFT JOIN users u ON a.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (graduation_year) {
      query += ' AND a.graduation_year = ?';
      params.push(graduation_year);
    }
    if (search) {
      query += ` AND (a.current_occupation LIKE ? OR a.company LIKE ? OR 
                 u.first_name LIKE ? OR u.last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT a.*, u.first_name, u.last_name, u.email as user_email, u.profile_image',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY a.graduation_year DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [alumni] = await pool.query(query, params);

    res.json({
      success: true,
      alumni,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get alumni error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch alumni', error: error.message });
  }
});

router.get('/alumni/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [alumni] = await pool.query(`
      SELECT a.*, 
        u.first_name, u.last_name, u.email as user_email, u.profile_image, u.phone
      FROM alumni a
      LEFT JOIN users u ON a.student_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (alumni.length === 0) {
      return res.status(404).json({ success: false, message: 'Alumni not found' });
    }

    res.json({ success: true, alumni: alumni[0] });
  } catch (error) {
    console.error('Get alumni error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch alumni', error: error.message });
  }
});

router.post('/alumni', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const {
      student_id, graduation_year, current_occupation, company, position,
      email, phone, address, linkedin, achievements
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO alumni 
       (student_id, graduation_year, current_occupation, company, position, email, phone, address, linkedin, achievements) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, graduation_year, current_occupation, company, position, email, phone, address, linkedin, 
       JSON.stringify(achievements)]
    );

    res.status(201).json({ success: true, message: 'Alumni record created', id: result.insertId });
  } catch (error) {
    console.error('Create alumni error:', error);
    res.status(500).json({ success: false, message: 'Failed to create alumni record', error: error.message });
  }
});

router.put('/alumni/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      graduation_year, current_occupation, company, position,
      email, phone, address, linkedin, achievements
    } = req.body;

    await pool.query(
      `UPDATE alumni 
       SET graduation_year = ?, current_occupation = ?, company = ?, position = ?,
           email = ?, phone = ?, address = ?, linkedin = ?, achievements = ?
       WHERE id = ?`,
      [graduation_year, current_occupation, company, position, email, phone, address, linkedin,
       JSON.stringify(achievements), id]
    );

    res.json({ success: true, message: 'Alumni record updated' });
  } catch (error) {
    console.error('Update alumni error:', error);
    res.status(500).json({ success: false, message: 'Failed to update alumni record', error: error.message });
  }
});

router.delete('/alumni/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM alumni WHERE id = ?', [id]);
    res.json({ success: true, message: 'Alumni record deleted' });
  } catch (error) {
    console.error('Delete alumni error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete alumni record', error: error.message });
  }
});

// ==================== ALUMNI EVENTS ====================

router.get('/events', async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    let query = `
      SELECT e.*,
        u.first_name as organizer_first_name, u.last_name as organizer_last_name,
        (SELECT COUNT(*) FROM alumni_event_registrations WHERE event_id = e.id) as registered_count
      FROM alumni_events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (upcoming === 'true') {
      query += ' AND e.event_date >= CURDATE()';
    }

    query += ' ORDER BY e.event_date DESC';
    const [events] = await pool.query(query, params);

    res.json({ success: true, events });
  } catch (error) {
    console.error('Get alumni events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await pool.query(`
      SELECT e.*,
        u.first_name as organizer_first_name, u.last_name as organizer_last_name,
        (SELECT COUNT(*) FROM alumni_event_registrations WHERE event_id = e.id) as registered_count
      FROM alumni_events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `, [id]);

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get registrations
    const [registrations] = await pool.query(`
      SELECT r.*, a.*, u.first_name, u.last_name
      FROM alumni_event_registrations r
      JOIN alumni a ON r.alumni_id = a.id
      LEFT JOIN users u ON a.student_id = u.id
      WHERE r.event_id = ?
      ORDER BY r.registered_at DESC
    `, [id]);

    res.json({
      success: true,
      event: events[0],
      registrations
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch event', error: error.message });
  }
});

router.post('/events', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { title, description, event_date, event_time, location, max_attendees, status } = req.body;
    const organizer_id = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO alumni_events 
       (title, description, event_date, event_time, location, organizer_id, max_attendees, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, event_time, location, organizer_id, max_attendees, status || 'upcoming']
    );

    res.status(201).json({ success: true, message: 'Event created', id: result.insertId });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
});

router.put('/events/:id', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, event_time, location, max_attendees, status } = req.body;

    await pool.query(
      `UPDATE alumni_events 
       SET title = ?, description = ?, event_date = ?, event_time = ?, location = ?, max_attendees = ?, status = ?
       WHERE id = ?`,
      [title, description, event_date, event_time, location, max_attendees, status, id]
    );

    res.json({ success: true, message: 'Event updated' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
});

router.delete('/events/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete registrations first
    await pool.query('DELETE FROM alumni_event_registrations WHERE event_id = ?', [id]);
    await pool.query('DELETE FROM alumni_events WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
});

// ==================== EVENT REGISTRATIONS ====================

router.post('/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { alumni_id } = req.body;

    // Check if event exists and has capacity
    const [events] = await pool.query('SELECT * FROM alumni_events WHERE id = ?', [id]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = events[0];
    if (event.max_attendees) {
      const [[{ count }]] = await pool.query(
        'SELECT COUNT(*) as count FROM alumni_event_registrations WHERE event_id = ?',
        [id]
      );
      if (count >= event.max_attendees) {
        return res.status(400).json({ success: false, message: 'Event is full' });
      }
    }

    // Check if already registered
    const [existing] = await pool.query(
      'SELECT id FROM alumni_event_registrations WHERE event_id = ? AND alumni_id = ?',
      [id, alumni_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    const [result] = await pool.query(
      'INSERT INTO alumni_event_registrations (event_id, alumni_id) VALUES (?, ?)',
      [id, alumni_id]
    );

    res.status(201).json({ success: true, message: 'Registered successfully', id: result.insertId });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ success: false, message: 'Failed to register', error: error.message });
  }
});

router.delete('/events/:eventId/registrations/:registrationId', authenticateToken, async (req, res) => {
  try {
    const { registrationId } = req.params;
    await pool.query('DELETE FROM alumni_event_registrations WHERE id = ?', [registrationId]);
    res.json({ success: true, message: 'Registration cancelled' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel registration', error: error.message });
  }
});

// ==================== ALUMNI JOBS ====================

router.get('/jobs', async (req, res) => {
  try {
    const { status, location, search } = req.query;

    let query = `
      SELECT j.*, u.first_name as posted_by_first_name, u.last_name as posted_by_last_name
      FROM alumni_jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND j.status = ?';
      params.push(status);
    }
    if (location) {
      query += ' AND j.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (search) {
      query += ' AND (j.title LIKE ? OR j.company LIKE ? OR j.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY j.created_at DESC';
    const [jobs] = await pool.query(query, params);

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs', error: error.message });
  }
});

router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await pool.query(`
      SELECT j.*, u.first_name as posted_by_first_name, u.last_name as posted_by_last_name
      FROM alumni_jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.id = ?
    `, [id]);

    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job: jobs[0] });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job', error: error.message });
  }
});

router.post('/jobs', authenticateToken, async (req, res) => {
  try {
    const { title, company, description, requirements, location, salary_range, application_url, status } = req.body;
    const posted_by = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO alumni_jobs 
       (title, company, description, requirements, location, salary_range, posted_by, application_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, description, requirements, location, salary_range, posted_by, application_url, status || 'active']
    );

    res.status(201).json({ success: true, message: 'Job posted', id: result.insertId });
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ success: false, message: 'Failed to post job', error: error.message });
  }
});

router.put('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, description, requirements, location, salary_range, application_url, status } = req.body;

    await pool.query(
      `UPDATE alumni_jobs 
       SET title = ?, company = ?, description = ?, requirements = ?, location = ?, 
           salary_range = ?, application_url = ?, status = ?
       WHERE id = ?`,
      [title, company, description, requirements, location, salary_range, application_url, status, id]
    );

    res.json({ success: true, message: 'Job updated' });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ success: false, message: 'Failed to update job', error: error.message });
  }
});

router.delete('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM alumni_jobs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job', error: error.message });
  }
});

// ==================== ALUMNI ANALYTICS ====================

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    // Alumni by graduation year
    const [byYear] = await pool.query(`
      SELECT graduation_year, COUNT(*) as count
      FROM alumni
      GROUP BY graduation_year
      ORDER BY graduation_year DESC
    `);

    // Top companies
    const [topCompanies] = await pool.query(`
      SELECT company, COUNT(*) as count
      FROM alumni
      WHERE company IS NOT NULL AND company != ''
      GROUP BY company
      ORDER BY count DESC
      LIMIT 10
    `);

    // Employment status
    const [employment] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN current_occupation IS NOT NULL AND current_occupation != '' THEN 1 END) as employed,
        COUNT(CASE WHEN current_occupation IS NULL OR current_occupation = '' THEN 1 END) as not_employed,
        COUNT(*) as total
      FROM alumni
    `);

    // Upcoming events
    const [[upcomingEvents]] = await pool.query(`
      SELECT COUNT(*) as count
      FROM alumni_events
      WHERE event_date >= CURDATE() AND status != 'cancelled'
    `);

    // Active jobs
    const [[activeJobs]] = await pool.query(`
      SELECT COUNT(*) as count
      FROM alumni_jobs
      WHERE status = 'active'
    `);

    res.json({
      success: true,
      analytics: {
        byGraduationYear: byYear,
        topCompanies,
        employment: employment[0],
        upcomingEvents: upcomingEvents.count,
        activeJobs: activeJobs.count
      }
    });
  } catch (error) {
    console.error('Alumni analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

module.exports = router;

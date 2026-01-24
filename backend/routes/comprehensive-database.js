const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== ACADEMIC CALENDAR ====================

router.get('/academic-calendar', authenticateToken, async (req, res) => {
  try {
    const { academic_year, event_type, month } = req.query;
    let query = 'SELECT * FROM academic_calendar WHERE 1=1';
    const params = [];

    if (academic_year) {
      query += ' AND academic_year = ?';
      params.push(academic_year);
    }
    if (event_type) {
      query += ' AND event_type = ?';
      params.push(event_type);
    }
    if (month) {
      query += ' AND MONTH(event_date) = ?';
      params.push(month);
    }

    query += ' ORDER BY event_date';
    const [events] = await pool.execute(query, params);
    res.json({ success: true, events });
  } catch (error) {
    console.error('Get academic calendar error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar' });
  }
});

router.post('/academic-calendar', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { title, description, event_date, event_type, academic_year, start_time, end_time } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO academic_calendar (title, description, event_date, event_type, academic_year, start_time, end_time, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, event_date, event_type, academic_year, start_time, end_time, req.user.id]);

    res.json({ success: true, message: 'Calendar event created', id: result.insertId });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

router.put('/academic-calendar/:id', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, event_type, start_time, end_time } = req.body;

    const [result] = await pool.execute(`
      UPDATE academic_calendar SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        event_date = COALESCE(?, event_date),
        event_type = COALESCE(?, event_type),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time)
      WHERE id = ?
    `, [title, description, event_date, event_type, start_time, end_time, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event updated' });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

router.delete('/academic-calendar/:id', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM academic_calendar WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

// ==================== ACADEMIC YEARS ====================

router.get('/academic-years', authenticateToken, async (req, res) => {
  try {
    const { is_current } = req.query;
    let query = 'SELECT * FROM academic_years';
    const params = [];

    if (is_current === 'true') {
      query += ' WHERE is_current = 1';
    }

    query += ' ORDER BY start_date DESC';
    const [years] = await pool.execute(query, params);
    res.json({ success: true, years });
  } catch (error) {
    console.error('Get academic years error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch academic years' });
  }
});

router.post('/academic-years', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { name, start_date, end_date, is_current } = req.body;

    if (is_current) {
      await pool.execute('UPDATE academic_years SET is_current = 0');
    }

    const [result] = await pool.execute(`
      INSERT INTO academic_years (name, start_date, end_date, is_current)
      VALUES (?, ?, ?, ?)
    `, [name, start_date, end_date, is_current || 0]);

    res.json({ success: true, message: 'Academic year created', id: result.insertId });
  } catch (error) {
    console.error('Create academic year error:', error);
    res.status(500).json({ success: false, message: 'Failed to create academic year' });
  }
});

// ==================== ACHIEVEMENTS & BADGES ====================

router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const { student_id, category, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, u.first_name, u.last_name, u.email,
        CONCAT(t.first_name, ' ', t.last_name) as awarded_by_name
      FROM achievements a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN users t ON a.awarded_by = t.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }
    if (category) {
      query += ' AND a.category = ?';
      params.push(category);
    }

    query += ' ORDER BY a.achievement_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [achievements] = await pool.execute(query, params);
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements' });
  }
});

router.post('/achievements', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { student_id, title, description, category, achievement_date, certificate_url } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO achievements (student_id, title, description, category, achievement_date, certificate_url, awarded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [student_id, title, description, category, achievement_date, certificate_url, req.user.id]);

    res.json({ success: true, message: 'Achievement created', id: result.insertId });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ success: false, message: 'Failed to create achievement' });
  }
});

router.get('/badges', authenticateToken, async (req, res) => {
  try {
    const [badges] = await pool.execute('SELECT * FROM badges ORDER BY points_required ASC');
    res.json({ success: true, badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
});

router.get('/student-badges/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;

    const [studentBadges] = await pool.execute(`
      SELECT sb.*, b.name, b.description, b.icon_url, b.points_required
      FROM student_badges sb
      JOIN badges b ON sb.badge_id = b.id
      WHERE sb.student_id = ?
      ORDER BY sb.earned_date DESC
    `, [student_id]);

    res.json({ success: true, badges: studentBadges });
  } catch (error) {
    console.error('Get student badges error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student badges' });
  }
});

router.post('/award-badge', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { student_id, badge_id } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM student_badges WHERE student_id = ? AND badge_id = ?',
      [student_id, badge_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Badge already awarded' });
    }

    const [result] = await pool.execute(`
      INSERT INTO student_badges (student_id, badge_id, earned_date, awarded_by)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?)
    `, [student_id, badge_id, req.user.id]);

    res.json({ success: true, message: 'Badge awarded', id: result.insertId });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ success: false, message: 'Failed to award badge' });
  }
});

// ==================== ANNOUNCEMENTS ====================

router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const { target_audience, is_active, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as author_name,
        (SELECT COUNT(*) FROM announcement_attachments WHERE announcement_id = a.id) as attachment_count
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (target_audience) {
      query += ' AND a.target_audience = ?';
      params.push(target_audience);
    }
    if (is_active !== undefined) {
      query += ' AND a.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY a.priority DESC, a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [announcements] = await pool.execute(query, params);
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
});

router.post('/announcements', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { title, content, target_audience, priority, expires_at, is_active } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO announcements (title, content, target_audience, priority, expires_at, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, content, target_audience, priority || 0, expires_at, is_active !== false ? 1 : 0, req.user.id]);

    res.json({ success: true, message: 'Announcement created', id: result.insertId });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
});

router.put('/announcements/:id', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, target_audience, priority, expires_at, is_active } = req.body;

    const [result] = await pool.execute(`
      UPDATE announcements SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        target_audience = COALESCE(?, target_audience),
        priority = COALESCE(?, priority),
        expires_at = COALESCE(?, expires_at),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [title, content, target_audience, priority, expires_at, is_active, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, message: 'Announcement updated' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ success: false, message: 'Failed to update announcement' });
  }
});

router.delete('/announcements/:id', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM announcements WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
});

// ==================== CLUBS ====================

router.get('/clubs', authenticateToken, async (req, res) => {
  try {
    const { category, is_active } = req.query;
    let query = `
      SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as coordinator_name,
        (SELECT COUNT(*) FROM club_members WHERE club_id = c.id AND status = 'active') as member_count
      FROM clubs c
      LEFT JOIN users u ON c.coordinator_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND c.category = ?';
      params.push(category);
    }
    if (is_active !== undefined) {
      query += ' AND c.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY c.name';
    const [clubs] = await pool.execute(query, params);
    res.json({ success: true, clubs });
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch clubs' });
  }
});

router.post('/clubs', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { name, description, category, coordinator_id, meeting_schedule, max_members } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO clubs (name, description, category, coordinator_id, meeting_schedule, max_members, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [name, description, category, coordinator_id, meeting_schedule, max_members]);

    res.json({ success: true, message: 'Club created', id: result.insertId });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({ success: false, message: 'Failed to create club' });
  }
});

router.get('/clubs/:id/members', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await pool.execute(`
      SELECT cm.*, u.first_name, u.last_name, u.email
      FROM club_members cm
      JOIN users u ON cm.student_id = u.id
      WHERE cm.club_id = ?
      ORDER BY cm.joined_date DESC
    `, [id]);

    res.json({ success: true, members });
  } catch (error) {
    console.error('Get club members error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch members' });
  }
});

router.post('/clubs/:id/join', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params;

    const [club] = await pool.execute('SELECT * FROM clubs WHERE id = ? AND is_active = 1', [id]);
    if (club.length === 0) {
      return res.status(404).json({ success: false, message: 'Club not found or inactive' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM club_members WHERE club_id = ? AND student_id = ?',
      [id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    if (club[0].max_members) {
      const [[{ count }]] = await pool.execute(
        'SELECT COUNT(*) as count FROM club_members WHERE club_id = ? AND status = "active"',
        [id]
      );

      if (count >= club[0].max_members) {
        return res.status(400).json({ success: false, message: 'Club is full' });
      }
    }

    const [result] = await pool.execute(`
      INSERT INTO club_members (club_id, student_id, status, joined_date)
      VALUES (?, ?, 'active', CURRENT_TIMESTAMP)
    `, [id, req.user.id]);

    res.json({ success: true, message: 'Joined club successfully', id: result.insertId });
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({ success: false, message: 'Failed to join club' });
  }
});

// ==================== COUNSELING SESSIONS ====================

router.get('/counseling-sessions', authenticateToken, async (req, res) => {
  try {
    const { student_id, counselor_id, session_type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cs.*, 
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        CONCAT(c.first_name, ' ', c.last_name) as counselor_name
      FROM counseling_sessions cs
      JOIN users s ON cs.student_id = s.id
      JOIN users c ON cs.counselor_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
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

    query += ' ORDER BY cs.session_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [sessions] = await pool.execute(query, params);
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Get counseling sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

router.post('/counseling-sessions', authenticateToken, requireRole('admin', 'teacher', 'super_admin'), async (req, res) => {
  try {
    const { student_id, session_date, session_type, notes, action_items, follow_up_required } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO counseling_sessions (student_id, counselor_id, session_date, session_type, notes, action_items, follow_up_required)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [student_id, req.user.id, session_date, session_type, notes, action_items, follow_up_required || 0]);

    res.json({ success: true, message: 'Counseling session recorded', id: result.insertId });
  } catch (error) {
    console.error('Create counseling session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

// ==================== EVENTS ====================

router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { event_type, status, upcoming, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
      FROM events e
      WHERE 1=1
    `;
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

    query += ' ORDER BY e.event_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [events] = await pool.execute(query, params);
    res.json({ success: true, events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

router.post('/events', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { title, description, event_type, event_date, start_time, end_time, location, max_participants, registration_deadline } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO events (title, description, event_type, event_date, start_time, end_time, location, max_participants, registration_deadline, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)
    `, [title, description, event_type, event_date, start_time, end_time, location, max_participants, registration_deadline, req.user.id]);

    res.json({ success: true, message: 'Event created', id: result.insertId });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

router.post('/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [event] = await pool.execute('SELECT * FROM events WHERE id = ?', [id]);
    if (event.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event[0].max_participants) {
      const [[{ count }]] = await pool.execute(
        'SELECT COUNT(*) as count FROM event_participants WHERE event_id = ? AND status = "registered"',
        [id]
      );

      if (count >= event[0].max_participants) {
        return res.status(400).json({ success: false, message: 'Event is full' });
      }
    }

    const [existing] = await pool.execute(
      'SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    const [result] = await pool.execute(`
      INSERT INTO event_participants (event_id, user_id, status, registered_at)
      VALUES (?, ?, 'registered', CURRENT_TIMESTAMP)
    `, [id, req.user.id]);

    res.json({ success: true, message: 'Registered for event', id: result.insertId });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ success: false, message: 'Failed to register' });
  }
});

// ==================== LEARNING MATERIALS ====================

router.get('/learning-materials', authenticateToken, async (req, res) => {
  try {
    const { subject_id, class_id, material_type, uploaded_by, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lm.*, 
        s.name as subject_name,
        tc.name as class_name,
        CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name,
        (SELECT COUNT(*) FROM material_downloads WHERE material_id = lm.id) as download_count,
        (SELECT AVG(rating) FROM material_ratings WHERE material_id = lm.id) as avg_rating,
        (SELECT COUNT(*) FROM material_ratings WHERE material_id = lm.id) as rating_count
      FROM learning_materials lm
      LEFT JOIN subjects s ON lm.subject_id = s.id
      LEFT JOIN trade_classes tc ON lm.class_id = tc.id
      LEFT JOIN users u ON lm.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (subject_id) {
      query += ' AND lm.subject_id = ?';
      params.push(subject_id);
    }
    if (class_id) {
      query += ' AND lm.class_id = ?';
      params.push(class_id);
    }
    if (material_type) {
      query += ' AND lm.material_type = ?';
      params.push(material_type);
    }
    if (uploaded_by) {
      query += ' AND lm.uploaded_by = ?';
      params.push(uploaded_by);
    }

    query += ' ORDER BY lm.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [materials] = await pool.execute(query, params);
    res.json({ success: true, materials, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get learning materials error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch materials' });
  }
});

router.post('/learning-materials', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { title, description, subject_id, class_id, material_type, file_url, file_size, tags } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO learning_materials (title, description, subject_id, class_id, material_type, file_url, file_size, tags, uploaded_by, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [title, description, subject_id, class_id, material_type, file_url, file_size, tags, req.user.id]);

    res.json({ success: true, message: 'Learning material created', id: result.insertId });
  } catch (error) {
    console.error('Create learning material error:', error);
    res.status(500).json({ success: false, message: 'Failed to create material' });
  }
});

router.post('/learning-materials/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(`
      INSERT INTO material_downloads (material_id, user_id, download_date)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [id, req.user.id]);

    const [[material]] = await pool.execute('SELECT file_url FROM learning_materials WHERE id = ?', [id]);
    res.json({ success: true, file_url: material.file_url });
  } catch (error) {
    console.error('Download material error:', error);
    res.status(500).json({ success: false, message: 'Failed to download material' });
  }
});

router.post('/learning-materials/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    await pool.execute(`
      INSERT INTO material_ratings (material_id, user_id, rating, review, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review)
    `, [id, req.user.id, rating, review]);

    res.json({ success: true, message: 'Rating submitted' });
  } catch (error) {
    console.error('Rate material error:', error);
    res.status(500).json({ success: false, message: 'Failed to rate material' });
  }
});

// ==================== WORKSHOPS ====================

router.get('/workshops', authenticateToken, async (req, res) => {
  try {
    const { status, category, upcoming, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT w.*, 
        CONCAT(f.first_name, ' ', f.last_name) as facilitator_name,
        (SELECT COUNT(*) FROM workshop_participants WHERE workshop_id = w.id) as participant_count,
        (SELECT COUNT(*) FROM workshop_participants WHERE workshop_id = w.id AND attendance_status = 'present') as attended_count
      FROM workshops w
      LEFT JOIN users f ON w.facilitator_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND w.status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND w.category = ?';
      params.push(category);
    }
    if (upcoming === 'true') {
      query += ' AND w.workshop_date >= CURDATE()';
    }

    query += ' ORDER BY w.workshop_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [workshops] = await pool.execute(query, params);
    res.json({ success: true, workshops, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get workshops error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workshops' });
  }
});

router.post('/workshops', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { title, description, category, workshop_date, start_time, end_time, venue, max_participants, facilitator_id, objectives, prerequisites } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO workshops (title, description, category, workshop_date, start_time, end_time, venue, max_participants, facilitator_id, objectives, prerequisites, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)
    `, [title, description, category, workshop_date, start_time, end_time, venue, max_participants, facilitator_id, objectives, prerequisites, req.user.id]);

    res.json({ success: true, message: 'Workshop created', id: result.insertId });
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(500).json({ success: false, message: 'Failed to create workshop' });
  }
});

router.post('/workshops/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [[workshop]] = await pool.execute('SELECT * FROM workshops WHERE id = ?', [id]);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    if (workshop.max_participants) {
      const [[{ count }]] = await pool.execute(
        'SELECT COUNT(*) as count FROM workshop_participants WHERE workshop_id = ? AND status = "registered"',
        [id]
      );

      if (count >= workshop.max_participants) {
        return res.status(400).json({ success: false, message: 'Workshop is full' });
      }
    }

    const [existing] = await pool.execute(
      'SELECT id FROM workshop_participants WHERE workshop_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    const [result] = await pool.execute(`
      INSERT INTO workshop_participants (workshop_id, user_id, status, registered_at)
      VALUES (?, ?, 'registered', CURRENT_TIMESTAMP)
    `, [id, req.user.id]);

    res.json({ success: true, message: 'Registered for workshop', id: result.insertId });
  } catch (error) {
    console.error('Register for workshop error:', error);
    res.status(500).json({ success: false, message: 'Failed to register' });
  }
});

router.post('/workshops/:id/attendance', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { attendance_records } = req.body;

    for (const record of attendance_records) {
      await pool.execute(`
        UPDATE workshop_participants 
        SET attendance_status = ?, feedback = ?, certificate_issued = ?
        WHERE workshop_id = ? AND user_id = ?
      `, [record.attendance_status, record.feedback, record.certificate_issued || 0, id, record.user_id]);
    }

    res.json({ success: true, message: 'Attendance recorded' });
  } catch (error) {
    console.error('Record workshop attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to record attendance' });
  }
});

// ==================== DISCUSSION FORUMS ====================

router.get('/forums', authenticateToken, async (req, res) => {
  try {
    const { category, is_active } = req.query;
    let query = `
      SELECT f.*, 
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        (SELECT COUNT(*) FROM forum_threads WHERE forum_id = f.id) as thread_count,
        (SELECT COUNT(*) FROM forum_posts fp JOIN forum_threads ft ON fp.thread_id = ft.id WHERE ft.forum_id = f.id) as post_count
      FROM forums f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND f.category = ?';
      params.push(category);
    }
    if (is_active !== undefined) {
      query += ' AND f.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY f.display_order, f.name';
    const [forums] = await pool.execute(query, params);
    res.json({ success: true, forums });
  } catch (error) {
    console.error('Get forums error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch forums' });
  }
});

router.post('/forums', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { name, description, category, display_order, access_level } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO forums (name, description, category, display_order, access_level, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `, [name, description, category, display_order || 0, access_level || 'all', req.user.id]);

    res.json({ success: true, message: 'Forum created', id: result.insertId });
  } catch (error) {
    console.error('Create forum error:', error);
    res.status(500).json({ success: false, message: 'Failed to create forum' });
  }
});

router.get('/forums/:id/threads', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_pinned, is_locked, page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ft.*, 
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        (SELECT COUNT(*) FROM forum_posts WHERE thread_id = ft.id) as reply_count,
        (SELECT COUNT(*) FROM thread_views WHERE thread_id = ft.id) as view_count
      FROM forum_threads ft
      LEFT JOIN users u ON ft.created_by = u.id
      WHERE ft.forum_id = ?
    `;
    const params = [id];

    if (is_pinned !== undefined) {
      query += ' AND ft.is_pinned = ?';
      params.push(is_pinned === 'true' ? 1 : 0);
    }
    if (is_locked !== undefined) {
      query += ' AND ft.is_locked = ?';
      params.push(is_locked === 'true' ? 1 : 0);
    }

    query += ' ORDER BY ft.is_pinned DESC, ft.last_activity DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [threads] = await pool.execute(query, params);
    res.json({ success: true, threads, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get forum threads error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch threads' });
  }
});

router.post('/forums/:id/threads', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO forum_threads (forum_id, title, content, tags, created_by, last_activity)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [id, title, content, tags, req.user.id]);

    res.json({ success: true, message: 'Thread created', id: result.insertId });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ success: false, message: 'Failed to create thread' });
  }
});

router.get('/threads/:id/posts', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    await pool.execute(`
      INSERT INTO thread_views (thread_id, user_id, viewed_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP
    `, [id, req.user.id]);

    const [posts] = await pool.execute(`
      SELECT fp.*, 
        CONCAT(u.first_name, ' ', u.last_name) as author_name,
        u.role as author_role,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = fp.id) as like_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = fp.id AND user_id = ?) as user_liked
      FROM forum_posts fp
      LEFT JOIN users u ON fp.created_by = u.id
      WHERE fp.thread_id = ?
      ORDER BY fp.created_at ASC
      LIMIT ? OFFSET ?
    `, [req.user.id, id, parseInt(limit), offset]);

    res.json({ success: true, posts, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get thread posts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

router.post('/threads/:id/posts', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    const [[thread]] = await pool.execute('SELECT is_locked FROM forum_threads WHERE id = ?', [id]);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }
    if (thread.is_locked) {
      return res.status(400).json({ success: false, message: 'Thread is locked' });
    }

    const [result] = await pool.execute(`
      INSERT INTO forum_posts (thread_id, content, attachments, created_by)
      VALUES (?, ?, ?, ?)
    `, [id, content, attachments, req.user.id]);

    await pool.execute('UPDATE forum_threads SET last_activity = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ success: true, message: 'Post created', id: result.insertId });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length > 0) {
      await pool.execute('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [id, req.user.id]);
      return res.json({ success: true, message: 'Like removed' });
    }

    await pool.execute(`
      INSERT INTO post_likes (post_id, user_id, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [id, req.user.id]);

    res.json({ success: true, message: 'Post liked' });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, message: 'Failed to like post' });
  }
});

// ==================== MEDIA LIBRARY ====================

router.get('/media-library', authenticateToken, async (req, res) => {
  try {
    const { media_type, category, uploaded_by, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ml.*, 
        CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name,
        (SELECT COUNT(*) FROM media_usage WHERE media_id = ml.id) as usage_count
      FROM media_library ml
      LEFT JOIN users u ON ml.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (media_type) {
      query += ' AND ml.media_type = ?';
      params.push(media_type);
    }
    if (category) {
      query += ' AND ml.category = ?';
      params.push(category);
    }
    if (uploaded_by) {
      query += ' AND ml.uploaded_by = ?';
      params.push(uploaded_by);
    }

    query += ' ORDER BY ml.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [media] = await pool.execute(query, params);
    res.json({ success: true, media, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get media library error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

router.post('/media-library', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { title, description, media_type, category, file_url, file_size, thumbnail_url, duration, tags } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO media_library (title, description, media_type, category, file_url, file_size, thumbnail_url, duration, tags, uploaded_by, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [title, description, media_type, category, file_url, file_size, thumbnail_url, duration, tags, req.user.id]);

    res.json({ success: true, message: 'Media uploaded', id: result.insertId });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload media' });
  }
});

router.post('/media-library/:id/track-usage', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { context_type, context_id } = req.body;

    await pool.execute(`
      INSERT INTO media_usage (media_id, user_id, context_type, context_id, used_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [id, req.user.id, context_type, context_id]);

    res.json({ success: true, message: 'Usage tracked' });
  } catch (error) {
    console.error('Track media usage error:', error);
    res.status(500).json({ success: false, message: 'Failed to track usage' });
  }
});

// ==================== BUDGETS & FINANCIAL PLANNING ====================

router.get('/budgets', authenticateToken, requireRole('admin', 'super_admin', 'accountant', 'headmaster'), async (req, res) => {
  try {
    const { fiscal_year, department, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, 
        (SELECT SUM(actual_amount) FROM budget_line_items WHERE budget_id = b.id) as total_spent,
        (b.total_amount - COALESCE((SELECT SUM(actual_amount) FROM budget_line_items WHERE budget_id = b.id), 0)) as remaining,
        CONCAT(u.first_name, ' ', u.last_name) as prepared_by_name
      FROM budgets b
      LEFT JOIN users u ON b.prepared_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (fiscal_year) {
      query += ' AND b.fiscal_year = ?';
      params.push(fiscal_year);
    }
    if (department) {
      query += ' AND b.department = ?';
      params.push(department);
    }
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.fiscal_year DESC, b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [budgets] = await pool.execute(query, params);
    res.json({ success: true, budgets, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budgets' });
  }
});

router.post('/budgets', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { name, description, fiscal_year, department, total_amount, start_date, end_date } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO budgets (name, description, fiscal_year, department, total_amount, start_date, end_date, status, prepared_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)
    `, [name, description, fiscal_year, department, total_amount, start_date, end_date, req.user.id]);

    res.json({ success: true, message: 'Budget created', id: result.insertId });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ success: false, message: 'Failed to create budget' });
  }
});

router.get('/budgets/:id/line-items', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.execute(`
      SELECT bli.*, 
        (bli.allocated_amount - COALESCE(bli.actual_amount, 0)) as remaining,
        CASE 
          WHEN bli.actual_amount > bli.allocated_amount THEN 'over_budget'
          WHEN bli.actual_amount >= bli.allocated_amount * 0.9 THEN 'near_limit'
          ELSE 'on_track'
        END as budget_status
      FROM budget_line_items bli
      WHERE bli.budget_id = ?
      ORDER BY bli.category, bli.item_name
    `, [id]);

    res.json({ success: true, items });
  } catch (error) {
    console.error('Get budget line items error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch line items' });
  }
});

router.post('/budgets/:id/line-items', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, item_name, description, allocated_amount, actual_amount, notes } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO budget_line_items (budget_id, category, item_name, description, allocated_amount, actual_amount, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, category, item_name, description, allocated_amount, actual_amount || 0, notes]);

    res.json({ success: true, message: 'Line item added', id: result.insertId });
  } catch (error) {
    console.error('Add budget line item error:', error);
    res.status(500).json({ success: false, message: 'Failed to add line item' });
  }
});

router.put('/budgets/:id/status', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_notes } = req.body;

    await pool.execute(`
      UPDATE budgets SET status = ?, approval_notes = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, approval_notes, req.user.id, id]);

    res.json({ success: true, message: 'Budget status updated' });
  } catch (error) {
    console.error('Update budget status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// ==================== INVOICES ====================

router.get('/invoices', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { student_id, status, invoice_type, overdue, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email as student_email,
        (i.total_amount - COALESCE(i.paid_amount, 0)) as balance,
        CASE 
          WHEN i.due_date < CURDATE() AND i.status != 'paid' THEN 1
          ELSE 0
        END as is_overdue
      FROM invoices i
      JOIN users u ON i.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND i.student_id = ?';
      params.push(student_id);
    }
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    if (invoice_type) {
      query += ' AND i.invoice_type = ?';
      params.push(invoice_type);
    }
    if (overdue === 'true') {
      query += ' AND i.due_date < CURDATE() AND i.status != "paid"';
    }

    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [invoices] = await pool.execute(query, params);

    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total FROM invoices WHERE 1=1
      ${student_id ? 'AND student_id = ?' : ''}
      ${status ? 'AND status = ?' : ''}
    `, params.filter((_, i) => i < params.length - 2));

    res.json({ success: true, invoices, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

router.post('/invoices', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { student_id, invoice_type, total_amount, due_date, description, items } = req.body;

    const invoice_number = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO invoices (invoice_number, student_id, invoice_type, total_amount, paid_amount, due_date, description, status, issued_by)
      VALUES (?, ?, ?, ?, 0, ?, ?, 'pending', ?)
    `, [invoice_number, student_id, invoice_type, total_amount, due_date, description, req.user.id]);

    if (items && items.length > 0) {
      for (const item of items) {
        await pool.execute(`
          INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [result.insertId, item.item_name, item.description, item.quantity, item.unit_price, item.total_price]);
      }
    }

    res.json({ success: true, message: 'Invoice created', id: result.insertId, invoice_number });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
});

router.post('/invoices/:id/payment', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method, payment_date, reference_number, notes } = req.body;

    const [[invoice]] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const new_paid_amount = parseFloat(invoice.paid_amount) + parseFloat(amount);
    const status = new_paid_amount >= parseFloat(invoice.total_amount) ? 'paid' : 'partial';

    await pool.execute(`
      UPDATE invoices SET paid_amount = ?, status = ?, last_payment_date = ?
      WHERE id = ?
    `, [new_paid_amount, status, payment_date || new Date().toISOString().split('T')[0], id]);

    await pool.execute(`
      INSERT INTO invoice_payments (invoice_id, amount, payment_method, payment_date, reference_number, notes, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, amount, payment_method, payment_date, reference_number, notes, req.user.id]);

    res.json({ success: true, message: 'Payment recorded', new_balance: invoice.total_amount - new_paid_amount });
  } catch (error) {
    console.error('Record invoice payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
});

// ==================== EXPENSES ====================

router.get('/expenses', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { category, status, date_from, date_to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, 
        CONCAT(u.first_name, ' ', u.last_name) as submitted_by_name,
        CONCAT(a.first_name, ' ', a.last_name) as approved_by_name
      FROM expenses e
      LEFT JOIN users u ON e.submitted_by = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND e.category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (date_from) {
      query += ' AND e.expense_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND e.expense_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY e.expense_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [expenses] = await pool.execute(query, params);
    res.json({ success: true, expenses, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
});

router.post('/expenses', authenticateToken, requireRole('admin', 'super_admin', 'accountant', 'teacher'), async (req, res) => {
  try {
    const { category, description, amount, expense_date, payment_method, vendor, receipt_url, budget_line_id } = req.body;

    const expense_code = `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO expenses (expense_code, category, description, amount, expense_date, payment_method, vendor, receipt_url, budget_line_id, status, submitted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [expense_code, category, description, amount, expense_date, payment_method, vendor, receipt_url, budget_line_id, req.user.id]);

    res.json({ success: true, message: 'Expense submitted', id: result.insertId, expense_code });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to create expense' });
  }
});

router.put('/expenses/:id/approve', authenticateToken, requireRole('admin', 'super_admin', 'accountant', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_notes } = req.body;

    await pool.execute(`
      UPDATE expenses SET status = ?, approval_notes = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, approval_notes, req.user.id, id]);

    if (status === 'approved') {
      const [[expense]] = await pool.execute('SELECT budget_line_id, amount FROM expenses WHERE id = ?', [id]);
      if (expense.budget_line_id) {
        await pool.execute(`
          UPDATE budget_line_items 
          SET actual_amount = COALESCE(actual_amount, 0) + ?
          WHERE id = ?
        `, [expense.amount, expense.budget_line_id]);
      }
    }

    res.json({ success: true, message: 'Expense status updated' });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve expense' });
  }
});

router.get('/expenses/statistics', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { fiscal_year, month } = req.query;

    let query = 'SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE status = "approved"';
    const params = [];

    if (fiscal_year) {
      query += ' AND YEAR(expense_date) = ?';
      params.push(fiscal_year);
    }
    if (month) {
      query += ' AND MONTH(expense_date) = ?';
      params.push(month);
    }

    query += ' GROUP BY category';

    const [byCategory] = await pool.execute(query, params);

    const [[totals]] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_approved,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
        COUNT(*) as total_expenses
      FROM expenses
      ${fiscal_year ? 'WHERE YEAR(expense_date) = ?' : ''}
    `, fiscal_year ? [fiscal_year] : []);

    res.json({ success: true, statistics: { by_category: byCategory, totals } });
  } catch (error) {
    console.error('Get expense statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ==================== EMERGENCY CONTACTS ====================

router.get('/emergency-contacts/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;

    const [contacts] = await pool.execute(`
      SELECT * FROM emergency_contacts
      WHERE student_id = ?
      ORDER BY priority ASC, is_primary DESC
    `, [student_id]);

    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

router.post('/emergency-contacts', authenticateToken, async (req, res) => {
  try {
    const { student_id, contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary, priority, medical_authorization } = req.body;

    if (is_primary) {
      await pool.execute('UPDATE emergency_contacts SET is_primary = 0 WHERE student_id = ?', [student_id]);
    }

    const [result] = await pool.execute(`
      INSERT INTO emergency_contacts (student_id, contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary, priority, medical_authorization)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary || 0, priority || 1, medical_authorization || 0]);

    res.json({ success: true, message: 'Emergency contact added', id: result.insertId });
  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to add contact' });
  }
});

router.put('/emergency-contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary, priority, medical_authorization } = req.body;

    if (is_primary) {
      const [[contact]] = await pool.execute('SELECT student_id FROM emergency_contacts WHERE id = ?', [id]);
      await pool.execute('UPDATE emergency_contacts SET is_primary = 0 WHERE student_id = ?', [contact.student_id]);
    }

    await pool.execute(`
      UPDATE emergency_contacts SET
        contact_name = COALESCE(?, contact_name),
        relationship = COALESCE(?, relationship),
        phone_primary = COALESCE(?, phone_primary),
        phone_secondary = COALESCE(?, phone_secondary),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        is_primary = COALESCE(?, is_primary),
        priority = COALESCE(?, priority),
        medical_authorization = COALESCE(?, medical_authorization)
      WHERE id = ?
    `, [contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary, priority, medical_authorization, id]);

    res.json({ success: true, message: 'Emergency contact updated' });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
});

// ==================== TRANSPORT ROUTES ====================

router.get('/transport-routes', authenticateToken, async (req, res) => {
  try {
    const { status, route_type } = req.query;
    let query = `
      SELECT tr.*, 
        CONCAT(d.first_name, ' ', d.last_name) as driver_name,
        d.phone as driver_phone,
        (SELECT COUNT(*) FROM route_assignments WHERE route_id = tr.id AND status = 'active') as student_count
      FROM transport_routes tr
      LEFT JOIN users d ON tr.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND tr.status = ?';
      params.push(status);
    }
    if (route_type) {
      query += ' AND tr.route_type = ?';
      params.push(route_type);
    }

    query += ' ORDER BY tr.route_name';
    const [routes] = await pool.execute(query, params);
    res.json({ success: true, routes });
  } catch (error) {
    console.error('Get transport routes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch routes' });
  }
});

router.post('/transport-routes', authenticateToken, requireRole('admin', 'super_admin', 'transport_manager'), async (req, res) => {
  try {
    const { route_name, route_code, route_type, description, driver_id, vehicle_number, vehicle_capacity, start_location, end_location, stops, departure_time, arrival_time, fare_amount } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO transport_routes (route_name, route_code, route_type, description, driver_id, vehicle_number, vehicle_capacity, start_location, end_location, stops, departure_time, arrival_time, fare_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [route_name, route_code, route_type, description, driver_id, vehicle_number, vehicle_capacity, start_location, end_location, stops, departure_time, arrival_time, fare_amount]);

    res.json({ success: true, message: 'Transport route created', id: result.insertId });
  } catch (error) {
    console.error('Create transport route error:', error);
    res.status(500).json({ success: false, message: 'Failed to create route' });
  }
});

router.get('/transport-routes/:id/assignments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [assignments] = await pool.execute(`
      SELECT ra.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email as student_email,
        sp.phone as student_phone
      FROM route_assignments ra
      JOIN users u ON ra.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE ra.route_id = ?
      ORDER BY ra.pickup_stop_order
    `, [id]);

    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Get route assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
});

router.post('/transport-routes/:id/assign', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, pickup_location, drop_location, pickup_stop_order, academic_year, term } = req.body;

    const [[route]] = await pool.execute('SELECT vehicle_capacity FROM transport_routes WHERE id = ?', [id]);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM route_assignments WHERE route_id = ? AND status = "active"',
      [id]
    );

    if (count >= route.vehicle_capacity) {
      return res.status(400).json({ success: false, message: 'Route is at full capacity' });
    }

    const [result] = await pool.execute(`
      INSERT INTO route_assignments (route_id, student_id, pickup_location, drop_location, pickup_stop_order, academic_year, term, status, assigned_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURDATE())
    `, [id, student_id, pickup_location, drop_location, pickup_stop_order, academic_year, term]);

    res.json({ success: true, message: 'Student assigned to route', id: result.insertId });
  } catch (error) {
    console.error('Assign to route error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign student' });
  }
});

router.post('/transport-attendance', authenticateToken, requireRole('admin', 'super_admin', 'driver'), async (req, res) => {
  try {
    const { route_id, student_id, attendance_date, trip_type, status, pickup_time, drop_time, notes } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO transport_attendance (route_id, student_id, attendance_date, trip_type, status, pickup_time, drop_time, notes, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [route_id, student_id, attendance_date, trip_type, status, pickup_time, drop_time, notes, req.user.id]);

    res.json({ success: true, message: 'Transport attendance recorded', id: result.insertId });
  } catch (error) {
    console.error('Record transport attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to record attendance' });
  }
});

// ==================== HOSTEL MANAGEMENT ====================

router.get('/hostels', authenticateToken, async (req, res) => {
  try {
    const { status, hostel_type } = req.query;
    let query = `
      SELECT h.*, 
        CONCAT(w.first_name, ' ', w.last_name) as warden_name,
        w.phone as warden_phone,
        (SELECT COUNT(*) FROM hostel_rooms WHERE hostel_id = h.id) as total_rooms,
        (SELECT SUM(capacity) FROM hostel_rooms WHERE hostel_id = h.id) as total_capacity,
        (SELECT COUNT(*) FROM hostel_allocations WHERE hostel_id = h.id AND status = 'active') as current_occupancy
      FROM hostels h
      LEFT JOIN users w ON h.warden_id = w.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND h.status = ?';
      params.push(status);
    }
    if (hostel_type) {
      query += ' AND h.hostel_type = ?';
      params.push(hostel_type);
    }

    query += ' ORDER BY h.hostel_name';
    const [hostels] = await pool.execute(query, params);
    res.json({ success: true, hostels });
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hostels' });
  }
});

router.post('/hostels', authenticateToken, requireRole('admin', 'super_admin', 'hostel_manager'), async (req, res) => {
  try {
    const { hostel_name, hostel_type, address, warden_id, phone, email, total_floors, amenities, rules } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO hostels (hostel_name, hostel_type, address, warden_id, phone, email, total_floors, amenities, rules, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [hostel_name, hostel_type, address, warden_id, phone, email, total_floors, amenities, rules]);

    res.json({ success: true, message: 'Hostel created', id: result.insertId });
  } catch (error) {
    console.error('Create hostel error:', error);
    res.status(500).json({ success: false, message: 'Failed to create hostel' });
  }
});

router.get('/hostels/:id/rooms', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { floor, status, room_type } = req.query;

    let query = `
      SELECT hr.*, 
        (SELECT COUNT(*) FROM hostel_allocations WHERE room_id = hr.id AND status = 'active') as current_occupancy,
        (hr.capacity - (SELECT COUNT(*) FROM hostel_allocations WHERE room_id = hr.id AND status = 'active')) as available_beds
      FROM hostel_rooms hr
      WHERE hr.hostel_id = ?
    `;
    const params = [id];

    if (floor) {
      query += ' AND hr.floor = ?';
      params.push(floor);
    }
    if (status) {
      query += ' AND hr.status = ?';
      params.push(status);
    }
    if (room_type) {
      query += ' AND hr.room_type = ?';
      params.push(room_type);
    }

    query += ' ORDER BY hr.floor, hr.room_number';
    const [rooms] = await pool.execute(query, params);
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Get hostel rooms error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms' });
  }
});

router.post('/hostel-rooms', authenticateToken, requireRole('admin', 'super_admin', 'hostel_manager'), async (req, res) => {
  try {
    const { hostel_id, room_number, floor, room_type, capacity, amenities, monthly_fee } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO hostel_rooms (hostel_id, room_number, floor, room_type, capacity, amenities, monthly_fee, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'available')
    `, [hostel_id, room_number, floor, room_type, capacity, amenities, monthly_fee]);

    res.json({ success: true, message: 'Room created', id: result.insertId });
  } catch (error) {
    console.error('Create hostel room error:', error);
    res.status(500).json({ success: false, message: 'Failed to create room' });
  }
});

router.get('/hostel-allocations', authenticateToken, async (req, res) => {
  try {
    const { hostel_id, student_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ha.*, 
        h.hostel_name,
        hr.room_number,
        hr.floor,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email as student_email,
        sp.phone as student_phone
      FROM hostel_allocations ha
      JOIN hostels h ON ha.hostel_id = h.id
      JOIN hostel_rooms hr ON ha.room_id = hr.id
      JOIN users u ON ha.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (hostel_id) {
      query += ' AND ha.hostel_id = ?';
      params.push(hostel_id);
    }
    if (student_id) {
      query += ' AND ha.student_id = ?';
      params.push(student_id);
    }
    if (status) {
      query += ' AND ha.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ha.allocated_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [allocations] = await pool.execute(query, params);
    res.json({ success: true, allocations, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get hostel allocations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch allocations' });
  }
});

router.post('/hostel-allocations', authenticateToken, requireRole('admin', 'super_admin', 'hostel_manager'), async (req, res) => {
  try {
    const { hostel_id, room_id, student_id, bed_number, allocated_date, academic_year, term } = req.body;

    const [[room]] = await pool.execute('SELECT capacity FROM hostel_rooms WHERE id = ?', [room_id]);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM hostel_allocations WHERE room_id = ? AND status = "active"',
      [room_id]
    );

    if (count >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room is at full capacity' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM hostel_allocations WHERE student_id = ? AND status = "active"',
      [student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student already has an active allocation' });
    }

    const [result] = await pool.execute(`
      INSERT INTO hostel_allocations (hostel_id, room_id, student_id, bed_number, allocated_date, academic_year, term, status, allocated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `, [hostel_id, room_id, student_id, bed_number, allocated_date, academic_year, term, req.user.id]);

    res.json({ success: true, message: 'Student allocated to hostel', id: result.insertId });
  } catch (error) {
    console.error('Allocate hostel error:', error);
    res.status(500).json({ success: false, message: 'Failed to allocate' });
  }
});

router.post('/hostel-complaints', authenticateToken, async (req, res) => {
  try {
    const { hostel_id, room_id, complaint_type, description, priority } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO hostel_complaints (hostel_id, room_id, student_id, complaint_type, description, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `, [hostel_id, room_id, req.user.id, complaint_type, description, priority || 'medium']);

    res.json({ success: true, message: 'Complaint submitted', id: result.insertId });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit complaint' });
  }
});

router.put('/hostel-complaints/:id', authenticateToken, requireRole('admin', 'super_admin', 'hostel_manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes, resolved_by } = req.body;

    await pool.execute(`
      UPDATE hostel_complaints 
      SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, resolution_notes, resolved_by || req.user.id, id]);

    res.json({ success: true, message: 'Complaint status updated' });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
});

router.post('/hostel-visitors', authenticateToken, requireRole('admin', 'super_admin', 'hostel_manager', 'security'), async (req, res) => {
  try {
    const { hostel_id, student_id, visitor_name, visitor_phone, visitor_relation, purpose, check_in_time, check_out_time, id_proof_type, id_proof_number } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO hostel_visitors (hostel_id, student_id, visitor_name, visitor_phone, visitor_relation, purpose, check_in_time, check_out_time, id_proof_type, id_proof_number, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [hostel_id, student_id, visitor_name, visitor_phone, visitor_relation, purpose, check_in_time, check_out_time, id_proof_type, id_proof_number, req.user.id]);

    res.json({ success: true, message: 'Visitor recorded', id: result.insertId });
  } catch (error) {
    console.error('Record visitor error:', error);
    res.status(500).json({ success: false, message: 'Failed to record visitor' });
  }
});

// ==================== LIBRARY ADVANCED ====================

router.get('/library/books', authenticateToken, async (req, res) => {
  try {
    const { category, author, isbn, status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lb.*, 
        (lb.total_copies - COALESCE((SELECT COUNT(*) FROM library_issues WHERE book_id = lb.id AND status = 'issued'), 0)) as available_copies,
        (SELECT COUNT(*) FROM library_reservations WHERE book_id = lb.id AND status = 'active') as reservation_count
      FROM library_books lb
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND lb.category = ?';
      params.push(category);
    }
    if (author) {
      query += ' AND lb.author LIKE ?';
      params.push(`%${author}%`);
    }
    if (isbn) {
      query += ' AND lb.isbn = ?';
      params.push(isbn);
    }
    if (status) {
      query += ' AND lb.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (lb.title LIKE ? OR lb.author LIKE ? OR lb.isbn LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY lb.title LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [books] = await pool.execute(query, params);
    res.json({ success: true, books, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get library books error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch books' });
  }
});

router.post('/library/books', authenticateToken, requireRole('admin', 'super_admin', 'librarian'), async (req, res) => {
  try {
    const { title, author, isbn, publisher, publication_year, category, total_copies, location, description, tags } = req.body;

    const accession_number = `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO library_books (accession_number, title, author, isbn, publisher, publication_year, category, total_copies, location, description, tags, status, added_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)
    `, [accession_number, title, author, isbn, publisher, publication_year, category, total_copies, location, description, tags, req.user.id]);

    res.json({ success: true, message: 'Book added', id: result.insertId, accession_number });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ success: false, message: 'Failed to add book' });
  }
});

router.get('/library/issues', authenticateToken, async (req, res) => {
  try {
    const { user_id, book_id, status, overdue, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT li.*, 
        lb.title as book_title,
        lb.author as book_author,
        lb.isbn,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        CONCAT(i.first_name, ' ', i.last_name) as issued_by_name,
        DATEDIFF(CURDATE(), li.due_date) as days_overdue
      FROM library_issues li
      JOIN library_books lb ON li.book_id = lb.id
      JOIN users u ON li.user_id = u.id
      LEFT JOIN users i ON li.issued_by = i.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND li.user_id = ?';
      params.push(user_id);
    }
    if (book_id) {
      query += ' AND li.book_id = ?';
      params.push(book_id);
    }
    if (status) {
      query += ' AND li.status = ?';
      params.push(status);
    }
    if (overdue === 'true') {
      query += ' AND li.due_date < CURDATE() AND li.status = "issued"';
    }

    query += ' ORDER BY li.issue_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [issues] = await pool.execute(query, params);
    res.json({ success: true, issues, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get library issues error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch issues' });
  }
});

router.post('/library/issue', authenticateToken, requireRole('admin', 'super_admin', 'librarian'), async (req, res) => {
  try {
    const { user_id, book_id, issue_date, due_date } = req.body;

    const [[book]] = await pool.execute('SELECT total_copies FROM library_books WHERE id = ?', [book_id]);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const [[{ issued_count }]] = await pool.execute(
      'SELECT COUNT(*) as issued_count FROM library_issues WHERE book_id = ? AND status = "issued"',
      [book_id]
    );

    if (issued_count >= book.total_copies) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    const [[{ user_issues }]] = await pool.execute(
      'SELECT COUNT(*) as user_issues FROM library_issues WHERE user_id = ? AND status = "issued"',
      [user_id]
    );

    if (user_issues >= 5) {
      return res.status(400).json({ success: false, message: 'User has reached maximum issue limit' });
    }

    const [result] = await pool.execute(`
      INSERT INTO library_issues (user_id, book_id, issue_date, due_date, status, issued_by)
      VALUES (?, ?, ?, ?, 'issued', ?)
    `, [user_id, book_id, issue_date, due_date, req.user.id]);

    res.json({ success: true, message: 'Book issued', id: result.insertId });
  } catch (error) {
    console.error('Issue book error:', error);
    res.status(500).json({ success: false, message: 'Failed to issue book' });
  }
});

router.post('/library/return/:issue_id', authenticateToken, requireRole('admin', 'super_admin', 'librarian'), async (req, res) => {
  try {
    const { issue_id } = req.params;
    const { return_date, condition, fine_amount, notes } = req.body;

    const [[issue]] = await pool.execute('SELECT * FROM library_issues WHERE id = ?', [issue_id]);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue record not found' });
    }

    await pool.execute(`
      UPDATE library_issues 
      SET status = 'returned', return_date = ?, condition = ?, fine_amount = ?, return_notes = ?, returned_to = ?
      WHERE id = ?
    `, [return_date, condition, fine_amount || 0, notes, req.user.id, issue_id]);

    res.json({ success: true, message: 'Book returned', fine_amount });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ success: false, message: 'Failed to return book' });
  }
});

router.post('/library/reservations', authenticateToken, async (req, res) => {
  try {
    const { book_id } = req.body;

    const [[book]] = await pool.execute(`
      SELECT lb.*, 
        (lb.total_copies - COALESCE((SELECT COUNT(*) FROM library_issues WHERE book_id = lb.id AND status = 'issued'), 0)) as available_copies
      FROM library_books lb WHERE lb.id = ?
    `, [book_id]);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.available_copies > 0) {
      return res.status(400).json({ success: false, message: 'Book is available, please issue directly' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM library_reservations WHERE book_id = ? AND user_id = ? AND status = "active"',
      [book_id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already reserved' });
    }

    const [result] = await pool.execute(`
      INSERT INTO library_reservations (book_id, user_id, reservation_date, status)
      VALUES (?, ?, CURDATE(), 'active')
    `, [book_id, req.user.id]);

    res.json({ success: true, message: 'Book reserved', id: result.insertId });
  } catch (error) {
    console.error('Reserve book error:', error);
    res.status(500).json({ success: false, message: 'Failed to reserve book' });
  }
});

router.get('/library/statistics', authenticateToken, requireRole('admin', 'super_admin', 'librarian'), async (req, res) => {
  try {
    const [[totals]] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM library_books) as total_books,
        (SELECT SUM(total_copies) FROM library_books) as total_copies,
        (SELECT COUNT(*) FROM library_issues WHERE status = 'issued') as currently_issued,
        (SELECT COUNT(*) FROM library_issues WHERE status = 'issued' AND due_date < CURDATE()) as overdue_books,
        (SELECT COUNT(*) FROM library_reservations WHERE status = 'active') as active_reservations
    `);

    const [byCategory] = await pool.execute(`
      SELECT category, COUNT(*) as book_count, SUM(total_copies) as copy_count
      FROM library_books
      GROUP BY category
      ORDER BY book_count DESC
    `);

    const [popularBooks] = await pool.execute(`
      SELECT lb.title, lb.author, COUNT(li.id) as issue_count
      FROM library_books lb
      JOIN library_issues li ON lb.id = li.book_id
      GROUP BY lb.id
      ORDER BY issue_count DESC
      LIMIT 10
    `);

    res.json({ success: true, statistics: { totals, by_category: byCategory, popular_books: popularBooks } });
  } catch (error) {
    console.error('Get library statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ==================== EXAM RESULTS ANALYTICS ====================

router.get('/exam-analytics/overview', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study', 'teacher'), async (req, res) => {
  try {
    const { exam_id, class_id, subject_id, academic_year, term } = req.query;

    let query = `
      SELECT 
        AVG(g.percentage) as average_percentage,
        MAX(g.percentage) as highest_percentage,
        MIN(g.percentage) as lowest_percentage,
        COUNT(*) as total_students,
        SUM(CASE WHEN g.grade = 'A' THEN 1 ELSE 0 END) as grade_a_count,
        SUM(CASE WHEN g.grade = 'B' THEN 1 ELSE 0 END) as grade_b_count,
        SUM(CASE WHEN g.grade = 'C' THEN 1 ELSE 0 END) as grade_c_count,
        SUM(CASE WHEN g.grade = 'D' THEN 1 ELSE 0 END) as grade_d_count,
        SUM(CASE WHEN g.grade = 'F' THEN 1 ELSE 0 END) as grade_f_count,
        SUM(CASE WHEN g.percentage >= 50 THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN g.percentage < 50 THEN 1 ELSE 0 END) as fail_count
      FROM grades g
      WHERE 1=1
    `;
    const params = [];

    if (exam_id) {
      query += ' AND g.exam_id = ?';
      params.push(exam_id);
    }
    if (class_id) {
      query += ' AND g.class_id = ?';
      params.push(class_id);
    }
    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (academic_year) {
      query += ' AND g.academic_year = ?';
      params.push(academic_year);
    }
    if (term) {
      query += ' AND g.term = ?';
      params.push(term);
    }

    const [[overview]] = await pool.execute(query, params);

    if (overview.total_students > 0) {
      overview.pass_percentage = ((overview.pass_count / overview.total_students) * 100).toFixed(2);
      overview.fail_percentage = ((overview.fail_count / overview.total_students) * 100).toFixed(2);
    }

    res.json({ success: true, analytics: overview });
  } catch (error) {
    console.error('Get exam analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

router.get('/exam-analytics/by-subject', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { class_id, academic_year, term } = req.query;

    let query = `
      SELECT 
        s.name as subject_name,
        s.code as subject_code,
        COUNT(g.id) as student_count,
        AVG(g.percentage) as average_percentage,
        MAX(g.percentage) as highest_percentage,
        MIN(g.percentage) as lowest_percentage,
        SUM(CASE WHEN g.percentage >= 50 THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN g.percentage < 50 THEN 1 ELSE 0 END) as fail_count
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ' AND g.class_id = ?';
      params.push(class_id);
    }
    if (academic_year) {
      query += ' AND g.academic_year = ?';
      params.push(academic_year);
    }
    if (term) {
      query += ' AND g.term = ?';
      params.push(term);
    }

    query += ' GROUP BY s.id ORDER BY average_percentage DESC';

    const [subjects] = await pool.execute(query, params);

    subjects.forEach(subject => {
      if (subject.student_count > 0) {
        subject.pass_percentage = ((subject.pass_count / subject.student_count) * 100).toFixed(2);
      }
    });

    res.json({ success: true, subject_analytics: subjects });
  } catch (error) {
    console.error('Get subject analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subject analytics' });
  }
});

router.get('/exam-analytics/top-performers', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { class_id, subject_id, academic_year, term, limit = 10 } = req.query;

    let query = `
      SELECT 
        u.id as student_id,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email,
        tc.name as class_name,
        AVG(g.percentage) as average_percentage,
        COUNT(DISTINCT g.subject_id) as subjects_taken
      FROM grades g
      JOIN users u ON g.student_id = u.id
      LEFT JOIN trade_classes tc ON g.class_id = tc.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ' AND g.class_id = ?';
      params.push(class_id);
    }
    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (academic_year) {
      query += ' AND g.academic_year = ?';
      params.push(academic_year);
    }
    if (term) {
      query += ' AND g.term = ?';
      params.push(term);
    }

    query += ' GROUP BY u.id ORDER BY average_percentage DESC LIMIT ?';
    params.push(parseInt(limit));

    const [topPerformers] = await pool.execute(query, params);

    res.json({ success: true, top_performers: topPerformers });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch top performers' });
  }
});

router.get('/exam-analytics/performance-trends', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { student_id, subject_id, academic_year } = req.query;

    let query = `
      SELECT 
        g.term,
        g.assessment_type,
        g.assessment_date,
        AVG(g.percentage) as average_percentage,
        g.grade,
        s.name as subject_name
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND g.student_id = ?';
      params.push(student_id);
    }
    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (academic_year) {
      query += ' AND g.academic_year = ?';
      params.push(academic_year);
    }

    query += ' GROUP BY g.term, g.assessment_type, g.subject_id ORDER BY g.assessment_date';

    const [trends] = await pool.execute(query, params);

    res.json({ success: true, performance_trends: trends });
  } catch (error) {
    console.error('Get performance trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trends' });
  }
});

// ==================== ASSIGNMENT ANALYTICS ====================

router.get('/assignment-analytics/overview', authenticateToken, requireRole('admin', 'super_admin', 'teacher', 'headmaster'), async (req, res) => {
  try {
    const { teacher_id, class_id, subject_id, date_from, date_to } = req.query;

    let query = `
      SELECT 
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT asub.id) as total_submissions,
        AVG(asub.score) as average_score,
        SUM(CASE WHEN asub.status = 'submitted' THEN 1 ELSE 0 END) as submitted_count,
        SUM(CASE WHEN asub.status = 'graded' THEN 1 ELSE 0 END) as graded_count,
        SUM(CASE WHEN asub.status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN asub.submission_date > a.due_date THEN 1 ELSE 0 END) as overdue_count
      FROM assignments a
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
      WHERE 1=1
    `;
    const params = [];

    if (teacher_id) {
      query += ' AND a.teacher_id = ?';
      params.push(teacher_id);
    }
    if (class_id) {
      query += ' AND a.class_id = ?';
      params.push(class_id);
    }
    if (subject_id) {
      query += ' AND a.subject_id = ?';
      params.push(subject_id);
    }
    if (date_from) {
      query += ' AND a.assigned_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND a.assigned_date <= ?';
      params.push(date_to);
    }

    const [[overview]] = await pool.execute(query, params);

    res.json({ success: true, analytics: overview });
  } catch (error) {
    console.error('Get assignment analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

router.get('/assignment-analytics/submission-rates', authenticateToken, requireRole('admin', 'super_admin', 'teacher', 'headmaster'), async (req, res) => {
  try {
    const { class_id, subject_id, academic_year } = req.query;

    let query = `
      SELECT 
        a.id as assignment_id,
        a.title as assignment_title,
        a.due_date,
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(DISTINCT asub.student_id) as submitted_count,
        (COUNT(DISTINCT asub.student_id) / COUNT(DISTINCT e.student_id) * 100) as submission_rate
      FROM assignments a
      JOIN enrollments e ON a.class_id = e.class_id AND e.status = 'active'
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ' AND a.class_id = ?';
      params.push(class_id);
    }
    if (subject_id) {
      query += ' AND a.subject_id = ?';
      params.push(subject_id);
    }
    if (academic_year) {
      query += ' AND a.academic_year = ?';
      params.push(academic_year);
    }

    query += ' GROUP BY a.id ORDER BY a.due_date DESC';

    const [rates] = await pool.execute(query, params);

    res.json({ success: true, submission_rates: rates });
  } catch (error) {
    console.error('Get submission rates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submission rates' });
  }
});

// ==================== STUDENT BEHAVIOR TRACKING ====================

router.get('/behavior-records', authenticateToken, async (req, res) => {
  try {
    const { student_id, behavior_type, severity, date_from, date_to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT br.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        CONCAT(r.first_name, ' ', r.last_name) as recorded_by_name,
        tc.name as class_name
      FROM behavior_records br
      JOIN users u ON br.student_id = u.id
      LEFT JOIN users r ON br.recorded_by = r.id
      LEFT JOIN enrollments e ON br.student_id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND br.student_id = ?';
      params.push(student_id);
    }
    if (behavior_type) {
      query += ' AND br.behavior_type = ?';
      params.push(behavior_type);
    }
    if (severity) {
      query += ' AND br.severity = ?';
      params.push(severity);
    }
    if (date_from) {
      query += ' AND br.incident_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND br.incident_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY br.incident_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [records] = await pool.execute(query, params);
    res.json({ success: true, behavior_records: records, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get behavior records error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch behavior records' });
  }
});

router.post('/behavior-records', authenticateToken, requireRole('admin', 'super_admin', 'teacher', 'headmaster', 'director_discipline'), async (req, res) => {
  try {
    const { student_id, behavior_type, severity, incident_date, description, location, witnesses, action_taken, follow_up_required } = req.body;

    const behavior_code = `BHV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO behavior_records (behavior_code, student_id, behavior_type, severity, incident_date, description, location, witnesses, action_taken, follow_up_required, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [behavior_code, student_id, behavior_type, severity, incident_date, description, location, witnesses, action_taken, follow_up_required || 0, req.user.id]);

    if (severity === 'high' || severity === 'critical') {
      await pool.execute(`
        INSERT INTO notifications (user_id, title, message, type, related_id, related_type, is_read)
        VALUES (?, 'Critical Behavior Incident', 'A critical behavior incident has been recorded', 'behavior', ?, 'behavior_record', 0)
      `, [student_id, result.insertId]);
    }

    res.json({ success: true, message: 'Behavior record created', id: result.insertId, behavior_code });
  } catch (error) {
    console.error('Create behavior record error:', error);
    res.status(500).json({ success: false, message: 'Failed to create record' });
  }
});

router.get('/behavior-analytics/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;
    const { academic_year } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN behavior_type = 'positive' THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN behavior_type = 'negative' THEN 1 ELSE 0 END) as negative_count,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_severity
      FROM behavior_records
      WHERE student_id = ?
    `;
    const params = [student_id];

    if (academic_year) {
      query += ' AND academic_year = ?';
      params.push(academic_year);
    }

    const [[analytics]] = await pool.execute(query, params);

    const [recentIncidents] = await pool.execute(`
      SELECT incident_date, behavior_type, severity, description
      FROM behavior_records
      WHERE student_id = ?
      ORDER BY incident_date DESC
      LIMIT 5
    `, [student_id]);

    res.json({ success: true, analytics, recent_incidents: recentIncidents });
  } catch (error) {
    console.error('Get behavior analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// ==================== LEAVE REQUESTS ====================

router.get('/leave-requests', authenticateToken, async (req, res) => {
  try {
    const { user_id, leave_type, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lr.*, 
        CONCAT(u.first_name, ' ', u.last_name) as applicant_name,
        u.role as applicant_role,
        CONCAT(a.first_name, ' ', a.last_name) as approved_by_name,
        DATEDIFF(lr.end_date, lr.start_date) + 1 as total_days
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN users a ON lr.approved_by = a.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND lr.user_id = ?';
      params.push(user_id);
    }
    if (leave_type) {
      query += ' AND lr.leave_type = ?';
      params.push(leave_type);
    }
    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY lr.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [requests] = await pool.execute(query, params);
    res.json({ success: true, leave_requests: requests, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
});

router.post('/leave-requests', authenticateToken, async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason, attachment_url } = req.body;

    const leave_code = `LV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO leave_requests (leave_code, user_id, leave_type, start_date, end_date, reason, attachment_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [leave_code, req.user.id, leave_type, start_date, end_date, reason, attachment_url]);

    res.json({ success: true, message: 'Leave request submitted', id: result.insertId, leave_code });
  } catch (error) {
    console.error('Submit leave request error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit request' });
  }
});

router.put('/leave-requests/:id/approve', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'hr_manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_notes } = req.body;

    await pool.execute(`
      UPDATE leave_requests 
      SET status = ?, approval_notes = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, approval_notes, req.user.id, id]);

    const [[request]] = await pool.execute('SELECT user_id, leave_code FROM leave_requests WHERE id = ?', [id]);

    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_id, related_type, is_read)
      VALUES (?, 'Leave Request ${status}', 'Your leave request ${request.leave_code} has been ${status}', 'leave', ?, 'leave_request', 0)
    `, [request.user_id, id]);

    res.json({ success: true, message: 'Leave request updated' });
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve request' });
  }
});

// ==================== SALARY PAYMENTS ====================

router.get('/salary-payments', authenticateToken, requireRole('admin', 'super_admin', 'accountant', 'hr_manager'), async (req, res) => {
  try {
    const { employee_id, payment_month, payment_year, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sp.*, 
        CONCAT(u.first_name, ' ', u.last_name) as employee_name,
        u.email as employee_email,
        u.role as employee_role,
        CONCAT(p.first_name, ' ', p.last_name) as processed_by_name
      FROM salary_payments sp
      JOIN users u ON sp.employee_id = u.id
      LEFT JOIN users p ON sp.processed_by = p.id
      WHERE 1=1
    `;
    const params = [];

    if (employee_id) {
      query += ' AND sp.employee_id = ?';
      params.push(employee_id);
    }
    if (payment_month) {
      query += ' AND sp.payment_month = ?';
      params.push(payment_month);
    }
    if (payment_year) {
      query += ' AND sp.payment_year = ?';
      params.push(payment_year);
    }
    if (status) {
      query += ' AND sp.status = ?';
      params.push(status);
    }

    query += ' ORDER BY sp.payment_year DESC, sp.payment_month DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [payments] = await pool.execute(query, params);
    res.json({ success: true, salary_payments: payments, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get salary payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch salary payments' });
  }
});

router.post('/salary-payments', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { employee_id, payment_month, payment_year, basic_salary, allowances, deductions, net_salary, payment_date, payment_method, reference_number, notes } = req.body;

    const payment_code = `SAL-${payment_year}-${payment_month}-${Date.now()}`;

    const [existing] = await pool.execute(
      'SELECT id FROM salary_payments WHERE employee_id = ? AND payment_month = ? AND payment_year = ?',
      [employee_id, payment_month, payment_year]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Salary already processed for this month' });
    }

    const [result] = await pool.execute(`
      INSERT INTO salary_payments (payment_code, employee_id, payment_month, payment_year, basic_salary, allowances, deductions, net_salary, payment_date, payment_method, reference_number, notes, status, processed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)
    `, [payment_code, employee_id, payment_month, payment_year, basic_salary, allowances || 0, deductions || 0, net_salary, payment_date, payment_method, reference_number, notes, req.user.id]);

    res.json({ success: true, message: 'Salary payment recorded', id: result.insertId, payment_code });
  } catch (error) {
    console.error('Record salary payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
});

router.get('/salary-payments/statistics', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { payment_year } = req.query;

    let query = `
      SELECT 
        payment_month,
        COUNT(*) as employee_count,
        SUM(basic_salary) as total_basic,
        SUM(allowances) as total_allowances,
        SUM(deductions) as total_deductions,
        SUM(net_salary) as total_net
      FROM salary_payments
      WHERE status = 'paid'
    `;
    const params = [];

    if (payment_year) {
      query += ' AND payment_year = ?';
      params.push(payment_year);
    }

    query += ' GROUP BY payment_month ORDER BY payment_month';

    const [byMonth] = await pool.execute(query, params);

    const [[totals]] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT employee_id) as total_employees,
        SUM(net_salary) as total_disbursed,
        AVG(net_salary) as average_salary
      FROM salary_payments
      WHERE status = 'paid' ${payment_year ? 'AND payment_year = ?' : ''}
    `, payment_year ? [payment_year] : []);

    res.json({ success: true, statistics: { by_month: byMonth, totals } });
  } catch (error) {
    console.error('Get salary statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ==================== KNOWLEDGE BASE ====================

router.get('/knowledge-base/articles', authenticateToken, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT kb.*, 
        CONCAT(u.first_name, ' ', u.last_name) as author_name,
        (SELECT COUNT(*) FROM knowledge_base_ratings WHERE article_id = kb.id) as rating_count,
        (SELECT AVG(rating) FROM knowledge_base_ratings WHERE article_id = kb.id) as avg_rating,
        (SELECT COUNT(*) FROM knowledge_base_views WHERE article_id = kb.id) as view_count
      FROM knowledge_base kb
      LEFT JOIN users u ON kb.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND kb.category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND kb.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (kb.title LIKE ? OR kb.content LIKE ? OR kb.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY kb.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [articles] = await pool.execute(query, params);
    res.json({ success: true, articles, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get KB articles error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch articles' });
  }
});

router.post('/knowledge-base/articles', authenticateToken, requireRole('admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const { title, content, category, tags, status, is_featured } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO knowledge_base (title, content, category, tags, status, is_featured, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, content, category, tags, status || 'draft', is_featured || 0, req.user.id]);

    res.json({ success: true, message: 'Article created', id: result.insertId });
  } catch (error) {
    console.error('Create KB article error:', error);
    res.status(500).json({ success: false, message: 'Failed to create article' });
  }
});

router.get('/knowledge-base/articles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(`
      INSERT INTO knowledge_base_views (article_id, user_id, viewed_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [id, req.user.id]);

    const [[article]] = await pool.execute(`
      SELECT kb.*, 
        CONCAT(u.first_name, ' ', u.last_name) as author_name,
        (SELECT AVG(rating) FROM knowledge_base_ratings WHERE article_id = kb.id) as avg_rating
      FROM knowledge_base kb
      LEFT JOIN users u ON kb.author_id = u.id
      WHERE kb.id = ?
    `, [id]);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.json({ success: true, article });
  } catch (error) {
    console.error('Get KB article error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch article' });
  }
});

router.post('/knowledge-base/articles/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    await pool.execute(`
      INSERT INTO knowledge_base_ratings (article_id, user_id, rating, comment, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)
    `, [id, req.user.id, rating, comment]);

    res.json({ success: true, message: 'Rating submitted' });
  } catch (error) {
    console.error('Rate KB article error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit rating' });
  }
});

// ==================== NOTIFICATIONS ====================

router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { is_read, type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT n.*
      FROM notifications n
      WHERE n.user_id = ?
    `;
    const params = [req.user.id];

    if (is_read !== undefined) {
      query += ' AND n.is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }
    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [notifications] = await pool.execute(query, params);

    const [[{ unread_count }]] = await pool.execute(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    res.json({ success: true, notifications, unread_count, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.post('/notifications', authenticateToken, requireRole('admin', 'super_admin', 'teacher', 'headmaster'), async (req, res) => {
  try {
    const { user_id, title, message, type, related_id, related_type } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_id, related_type, is_read)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [user_id, title, message, type, related_id, related_type]);

    res.json({ success: true, message: 'Notification created', id: result.insertId });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

router.put('/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

// ==================== ADMISSIONS ====================

router.get('/admissions/applications', authenticateToken, requireRole('admin', 'super_admin', 'admission_officer'), async (req, res) => {
  try {
    const { status, academic_year, program, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*,
        (SELECT COUNT(*) FROM admission_interviews WHERE application_id = a.id) as interview_count
      FROM admission_applications a
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (academic_year) {
      query += ' AND a.academic_year = ?';
      params.push(academic_year);
    }
    if (program) {
      query += ' AND a.program_applied = ?';
      params.push(program);
    }

    query += ' ORDER BY a.application_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [applications] = await pool.execute(query, params);
    res.json({ success: true, applications, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

router.post('/admissions/applications', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, program_applied, academic_year, previous_school, grades, documents } = req.body;

    const application_number = `ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO admission_applications (application_number, first_name, last_name, email, phone, date_of_birth, gender, address, program_applied, academic_year, previous_school, grades, documents, status, application_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_DATE)
    `, [application_number, first_name, last_name, email, phone, date_of_birth, gender, address, program_applied, academic_year, previous_school, grades, documents]);

    res.json({ success: true, message: 'Application submitted', id: result.insertId, application_number });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});

router.put('/admissions/applications/:id/status', authenticateToken, requireRole('admin', 'super_admin', 'admission_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const [result] = await pool.execute(`
      UPDATE admission_applications SET
        status = ?,
        rejection_reason = ?,
        reviewed_by = ?,
        reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, rejection_reason, req.user.id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: 'Application status updated' });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

router.post('/admissions/interviews', authenticateToken, requireRole('admin', 'super_admin', 'admission_officer'), async (req, res) => {
  try {
    const { application_id, interview_date, interview_time, interviewer_id, mode, location, notes } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO admission_interviews (application_id, interview_date, interview_time, interviewer_id, mode, location, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `, [application_id, interview_date, interview_time, interviewer_id, mode, location, notes]);

    res.json({ success: true, message: 'Interview scheduled', id: result.insertId });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule interview' });
  }
});

router.put('/admissions/interviews/:id/result', authenticateToken, requireRole('admin', 'super_admin', 'admission_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, score, feedback, recommendation } = req.body;

    const [result] = await pool.execute(`
      UPDATE admission_interviews SET
        status = ?,
        score = ?,
        feedback = ?,
        recommendation = ?
      WHERE id = ?
    `, [status, score, feedback, recommendation, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, message: 'Interview result recorded' });
  } catch (error) {
    console.error('Record interview result error:', error);
    res.status(500).json({ success: false, message: 'Failed to record result' });
  }
});

// ==================== EXAMINATION SCHEDULING ====================

router.get('/exam-schedules', authenticateToken, async (req, res) => {
  try {
    const { academic_year, term, exam_type, class_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT es.*, 
        e.name as exam_name,
        s.name as subject_name,
        tc.name as class_name,
        eh.hall_name,
        CONCAT(i.first_name, ' ', i.last_name) as invigilator_name
      FROM exam_schedules es
      JOIN exams e ON es.exam_id = e.id
      JOIN subjects s ON es.subject_id = s.id
      LEFT JOIN trade_classes tc ON es.class_id = tc.id
      LEFT JOIN exam_halls eh ON es.hall_id = eh.id
      LEFT JOIN users i ON es.invigilator_id = i.id
      WHERE 1=1
    `;
    const params = [];

    if (academic_year) {
      query += ' AND es.academic_year = ?';
      params.push(academic_year);
    }
    if (term) {
      query += ' AND es.term = ?';
      params.push(term);
    }
    if (exam_type) {
      query += ' AND e.exam_type = ?';
      params.push(exam_type);
    }
    if (class_id) {
      query += ' AND es.class_id = ?';
      params.push(class_id);
    }

    query += ' ORDER BY es.exam_date, es.start_time LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [schedules] = await pool.execute(query, params);
    res.json({ success: true, exam_schedules: schedules, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get exam schedules error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exam schedules' });
  }
});

router.post('/exam-schedules', authenticateToken, requireRole('admin', 'super_admin', 'director_study'), async (req, res) => {
  try {
    const { exam_id, subject_id, class_id, exam_date, start_time, end_time, hall_id, invigilator_id, max_students, academic_year, term } = req.body;

    const [[hall]] = await pool.execute('SELECT capacity FROM exam_halls WHERE id = ?', [hall_id]);
    if (hall && max_students > hall.capacity) {
      return res.status(400).json({ success: false, message: 'Max students exceeds hall capacity' });
    }

    const [result] = await pool.execute(`
      INSERT INTO exam_schedules (exam_id, subject_id, class_id, exam_date, start_time, end_time, hall_id, invigilator_id, max_students, academic_year, term, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [exam_id, subject_id, class_id, exam_date, start_time, end_time, hall_id, invigilator_id, max_students, academic_year, term, req.user.id]);

    res.json({ success: true, message: 'Exam scheduled', id: result.insertId });
  } catch (error) {
    console.error('Create exam schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to create schedule' });
  }
});

router.get('/exam-halls', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM exam_halls WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY hall_name';
    const [halls] = await pool.execute(query, params);
    res.json({ success: true, exam_halls: halls });
  } catch (error) {
    console.error('Get exam halls error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exam halls' });
  }
});

router.post('/exam-seating', authenticateToken, requireRole('admin', 'super_admin', 'director_study'), async (req, res) => {
  try {
    const { schedule_id, student_id, seat_number } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM exam_seating WHERE schedule_id = ? AND seat_number = ?',
      [schedule_id, seat_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Seat already assigned' });
    }

    const [result] = await pool.execute(`
      INSERT INTO exam_seating (schedule_id, student_id, seat_number)
      VALUES (?, ?, ?)
    `, [schedule_id, student_id, seat_number]);

    res.json({ success: true, message: 'Seat assigned', id: result.insertId });
  } catch (error) {
    console.error('Assign seat error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign seat' });
  }
});

// ==================== CERTIFICATES ====================

router.get('/certificates', authenticateToken, async (req, res) => {
  try {
    const { student_id, certificate_type, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email as student_email,
        CONCAT(i.first_name, ' ', i.last_name) as issued_by_name
      FROM certificates c
      JOIN users u ON c.student_id = u.id
      LEFT JOIN users i ON c.issued_by = i.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND c.student_id = ?';
      params.push(student_id);
    }
    if (certificate_type) {
      query += ' AND c.certificate_type = ?';
      params.push(certificate_type);
    }
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.issue_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [certificates] = await pool.execute(query, params);
    res.json({ success: true, certificates, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
  }
});

router.post('/certificates', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { student_id, certificate_type, certificate_number, issue_date, valid_until, description, template_id } = req.body;

    const verification_code = `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const [result] = await pool.execute(`
      INSERT INTO certificates (student_id, certificate_type, certificate_number, issue_date, valid_until, description, template_id, verification_code, status, issued_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `, [student_id, certificate_type, certificate_number, issue_date, valid_until, description, template_id, verification_code, req.user.id]);

    res.json({ success: true, message: 'Certificate issued', id: result.insertId, verification_code });
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to issue certificate' });
  }
});

router.get('/certificates/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const [[certificate]] = await pool.execute(`
      SELECT c.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.date_of_birth
      FROM certificates c
      JOIN users u ON c.student_id = u.id
      WHERE c.verification_code = ? AND c.status = 'active'
    `, [code]);

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
    }

    if (certificate.valid_until && new Date(certificate.valid_until) < new Date()) {
      return res.json({ success: false, message: 'Certificate has expired', certificate });
    }

    res.json({ success: true, certificate, message: 'Certificate is valid' });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify certificate' });
  }
});

router.get('/certificate-templates', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const [templates] = await pool.execute('SELECT * FROM certificate_templates WHERE is_active = 1 ORDER BY name');
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Get certificate templates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

// ==================== ALUMNI ====================

router.get('/alumni', authenticateToken, async (req, res) => {
  try {
    const { graduation_year, program, employment_status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.email, u.phone
      FROM alumni a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (graduation_year) {
      query += ' AND a.graduation_year = ?';
      params.push(graduation_year);
    }
    if (program) {
      query += ' AND a.program = ?';
      params.push(program);
    }
    if (employment_status) {
      query += ' AND a.employment_status = ?';
      params.push(employment_status);
    }

    query += ' ORDER BY a.graduation_year DESC, u.last_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [alumni] = await pool.execute(query, params);
    res.json({ success: true, alumni, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get alumni error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch alumni' });
  }
});

router.post('/alumni', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { user_id, graduation_year, program, current_occupation, employer, employment_status, linkedin_url, achievements } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO alumni (user_id, graduation_year, program, current_occupation, employer, employment_status, linkedin_url, achievements)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [user_id, graduation_year, program, current_occupation, employer, employment_status, linkedin_url, achievements]);

    res.json({ success: true, message: 'Alumni record created', id: result.insertId });
  } catch (error) {
    console.error('Create alumni record error:', error);
    res.status(500).json({ success: false, message: 'Failed to create alumni record' });
  }
});

router.get('/alumni-events', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ae.*,
        (SELECT COUNT(*) FROM alumni_event_registrations WHERE event_id = ae.id) as registration_count
      FROM alumni_events ae
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND ae.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ae.event_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [events] = await pool.execute(query, params);
    res.json({ success: true, events, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get alumni events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

router.post('/alumni-events/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { guest_count, dietary_requirements, comments } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM alumni_event_registrations WHERE event_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    const [result] = await pool.execute(`
      INSERT INTO alumni_event_registrations (event_id, user_id, guest_count, dietary_requirements, comments, registration_date, status)
      VALUES (?, ?, ?, ?, ?, CURRENT_DATE, 'confirmed')
    `, [id, req.user.id, guest_count || 0, dietary_requirements, comments]);

    res.json({ success: true, message: 'Successfully registered for event', id: result.insertId });
  } catch (error) {
    console.error('Register for alumni event error:', error);
    res.status(500).json({ success: false, message: 'Failed to register' });
  }
});

router.get('/alumni-donations', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { donor_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ad.*, 
        CONCAT(u.first_name, ' ', u.last_name) as donor_name,
        u.email as donor_email
      FROM alumni_donations ad
      JOIN users u ON ad.donor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (donor_id) {
      query += ' AND ad.donor_id = ?';
      params.push(donor_id);
    }

    query += ' ORDER BY ad.donation_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [donations] = await pool.execute(query, params);

    const [[{ total_donations }]] = await pool.execute(
      'SELECT SUM(amount) as total_donations FROM alumni_donations'
    );

    res.json({ success: true, donations, total_donations, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get alumni donations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donations' });
  }
});

// ==================== PARENT PORTAL ADVANCED ====================

router.get('/parent/meetings', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT pm.*, 
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        CONCAT(s.first_name, ' ', s.last_name) as student_name
      FROM parent_meetings pm
      JOIN users t ON pm.teacher_id = t.id
      JOIN users s ON pm.student_id = s.id
      JOIN parent_student_links psl ON pm.student_id = psl.student_id
      WHERE psl.parent_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND pm.status = ?';
      params.push(status);
    }

    query += ' ORDER BY pm.meeting_date DESC, pm.meeting_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [meetings] = await pool.execute(query, params);
    res.json({ success: true, meetings, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get parent meetings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch meetings' });
  }
});

router.post('/parent/meeting-request', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { teacher_id, student_id, preferred_date, preferred_time, purpose, notes } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO parent_meetings (teacher_id, parent_id, student_id, preferred_date, preferred_time, purpose, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'requested')
    `, [teacher_id, req.user.id, student_id, preferred_date, preferred_time, purpose, notes]);

    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_id, related_type, is_read)
      VALUES (?, 'New Meeting Request', 'A parent has requested a meeting', 'meeting', ?, 'parent_meeting', 0)
    `, [teacher_id, result.insertId]);

    res.json({ success: true, message: 'Meeting request submitted', id: result.insertId });
  } catch (error) {
    console.error('Request meeting error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit request' });
  }
});

router.get('/parent/student-reports/:student_id', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { student_id } = req.params;
    const { academic_year, term } = req.query;

    const [access] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [req.user.id, student_id]
    );

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = `
      SELECT sr.*, 
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        s.name as subject_name
      FROM student_reports sr
      JOIN users t ON sr.teacher_id = t.id
      JOIN subjects s ON sr.subject_id = s.id
      WHERE sr.student_id = ?
    `;
    const params = [student_id];

    if (academic_year) {
      query += ' AND sr.academic_year = ?';
      params.push(academic_year);
    }
    if (term) {
      query += ' AND sr.term = ?';
      params.push(term);
    }

    query += ' ORDER BY sr.created_at DESC';
    const [reports] = await pool.execute(query, params);
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

router.get('/parent/fee-tracking/:student_id', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { student_id } = req.params;

    const [access] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [req.user.id, student_id]
    );

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [[summary]] = await pool.execute(`
      SELECT 
        SUM(amount) as total_paid,
        COUNT(*) as payment_count
      FROM payments
      WHERE student_id = ? AND status = 'completed'
    `, [student_id]);

    const [payments] = await pool.execute(`
      SELECT p.*
      FROM payments p
      WHERE p.student_id = ?
      ORDER BY p.payment_date DESC
      LIMIT 20
    `, [student_id]);

    const [pending_invoices] = await pool.execute(`
      SELECT i.*
      FROM invoices i
      WHERE i.student_id = ? AND i.status IN ('pending', 'overdue')
      ORDER BY i.due_date
    `, [student_id]);

    res.json({ success: true, summary, recent_payments: payments, pending_invoices });
  } catch (error) {
    console.error('Get fee tracking error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee information' });
  }
});

// ==================== SMS/EMAIL INTEGRATION ====================

router.get('/communication/templates', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { type, category } = req.query;
    let query = 'SELECT * FROM communication_templates WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY name';
    const [templates] = await pool.execute(query, params);
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

router.post('/communication/templates', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { name, type, category, subject, body, variables, is_active } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO communication_templates (name, type, category, subject, body, variables, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, type, category, subject, body, variables, is_active !== false ? 1 : 0, req.user.id]);

    res.json({ success: true, message: 'Template created', id: result.insertId });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

router.post('/communication/send-bulk', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { template_id, recipient_type, recipient_ids, type, subject, message, schedule_time } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO bulk_communications (template_id, recipient_type, recipient_ids, type, subject, message, schedule_time, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'queued', ?)
    `, [template_id, recipient_type, JSON.stringify(recipient_ids), type, subject, message, schedule_time, req.user.id]);

    res.json({ success: true, message: 'Bulk communication queued', id: result.insertId });
  } catch (error) {
    console.error('Send bulk communication error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue communication' });
  }
});

router.get('/communication/delivery-log', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { bulk_id, status, type, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cdl.*, 
        CONCAT(u.first_name, ' ', u.last_name) as recipient_name,
        u.email, u.phone
      FROM communication_delivery_log cdl
      LEFT JOIN users u ON cdl.recipient_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (bulk_id) {
      query += ' AND cdl.bulk_communication_id = ?';
      params.push(bulk_id);
    }
    if (status) {
      query += ' AND cdl.status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND cdl.type = ?';
      params.push(type);
    }

    query += ' ORDER BY cdl.sent_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [logs] = await pool.execute(query, params);
    res.json({ success: true, delivery_logs: logs, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get delivery log error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery logs' });
  }
});

// ==================== ADVANCED REPORTING ====================

router.get('/reports/custom', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { report_type, created_by, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cr.*, 
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM custom_reports cr
      LEFT JOIN users u ON cr.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (report_type) {
      query += ' AND cr.report_type = ?';
      params.push(report_type);
    }
    if (created_by) {
      query += ' AND cr.created_by = ?';
      params.push(created_by);
    }

    query += ' ORDER BY cr.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [reports] = await pool.execute(query, params);
    res.json({ success: true, custom_reports: reports, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get custom reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

router.post('/reports/custom', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { name, description, report_type, filters, columns, schedule, format } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO custom_reports (name, description, report_type, filters, columns, schedule, format, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [name, description, report_type, JSON.stringify(filters), JSON.stringify(columns), schedule, format, req.user.id]);

    res.json({ success: true, message: 'Custom report created', id: result.insertId });
  } catch (error) {
    console.error('Create custom report error:', error);
    res.status(500).json({ success: false, message: 'Failed to create report' });
  }
});

router.post('/reports/export', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { report_type, filters, format, email_to } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO report_exports (report_type, filters, format, email_to, status, requested_by, requested_at)
      VALUES (?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP)
    `, [report_type, JSON.stringify(filters), format, email_to, req.user.id]);

    res.json({ success: true, message: 'Export queued for processing', id: result.insertId });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue export' });
  }
});

router.get('/reports/scheduled', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { is_active } = req.query;
    let query = `
      SELECT sr.*, 
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM scheduled_reports sr
      LEFT JOIN users u ON sr.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (is_active !== undefined) {
      query += ' AND sr.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY sr.next_run_date';
    const [scheduled] = await pool.execute(query, params);
    res.json({ success: true, scheduled_reports: scheduled });
  } catch (error) {
    console.error('Get scheduled reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scheduled reports' });
  }
});

// ==================== DASHBOARD ANALYTICS ====================

router.get('/analytics/dashboard', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { academic_year, term } = req.query;

    const [[studentStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_students
      FROM users WHERE role = 'student'
    `);

    const [[teacherStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_teachers,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_teachers
      FROM users WHERE role = 'teacher'
    `);

    let attendanceQuery = `
      SELECT 
        AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_rate,
        COUNT(*) as total_records
      FROM attendance
      WHERE 1=1
    `;
    const attendanceParams = [];
    if (academic_year) {
      attendanceQuery += ' AND academic_year = ?';
      attendanceParams.push(academic_year);
    }
    if (term) {
      attendanceQuery += ' AND term = ?';
      attendanceParams.push(term);
    }
    const [[attendanceStats]] = await pool.execute(attendanceQuery, attendanceParams);

    const [[financeStats]] = await pool.execute(`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as payment_count,
        AVG(amount) as average_payment
      FROM payments WHERE status = 'completed'
    `);

    let gradeQuery = `
      SELECT 
        AVG(percentage) as average_grade,
        SUM(CASE WHEN percentage >= 50 THEN 1 ELSE 0 END) as pass_count,
        COUNT(*) as total_grades
      FROM grades
      WHERE 1=1
    `;
    const gradeParams = [];
    if (academic_year) {
      gradeQuery += ' AND academic_year = ?';
      gradeParams.push(academic_year);
    }
    if (term) {
      gradeQuery += ' AND term = ?';
      gradeParams.push(term);
    }
    const [[gradeStats]] = await pool.execute(gradeQuery, gradeParams);

    res.json({
      success: true,
      dashboard: {
        students: studentStats,
        teachers: teacherStats,
        attendance: attendanceStats,
        finance: financeStats,
        academic: gradeStats
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard analytics' });
  }
});

router.get('/analytics/trends', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { metric, period, academic_year } = req.query;

    let dateGrouping = 'DATE(created_at)';
    if (period === 'weekly') dateGrouping = 'YEARWEEK(created_at)';
    if (period === 'monthly') dateGrouping = 'DATE_FORMAT(created_at, "%Y-%m")';

    let query = '';
    const params = [];

    if (metric === 'enrollment') {
      query = `
        SELECT ${dateGrouping} as period, COUNT(*) as count
        FROM enrollments
        WHERE 1=1
      `;
      if (academic_year) {
        query += ' AND academic_year = ?';
        params.push(academic_year);
      }
      query += ` GROUP BY ${dateGrouping} ORDER BY period DESC LIMIT 30`;
    } else if (metric === 'attendance') {
      query = `
        SELECT DATE(date) as period, 
          AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100 as percentage
        FROM attendance
        WHERE 1=1
      `;
      if (academic_year) {
        query += ' AND academic_year = ?';
        params.push(academic_year);
      }
      query += ' GROUP BY DATE(date) ORDER BY period DESC LIMIT 30';
    } else if (metric === 'revenue') {
      query = `
        SELECT DATE(payment_date) as period, SUM(amount) as total
        FROM payments
        WHERE status = 'completed'
        GROUP BY DATE(payment_date) ORDER BY period DESC LIMIT 30
      `;
    }

    const [trends] = await pool.execute(query, params);
    res.json({ success: true, trends });
  } catch (error) {
    console.error('Get trend analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trends' });
  }
});

router.get('/analytics/kpis', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { academic_year, term } = req.query;
    const params = academic_year ? [academic_year] : [];
    const termParams = term ? [term] : [];

    const [[studentRetention]] = await pool.execute(`
      SELECT 
        (COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.student_id END) / 
         COUNT(DISTINCT e.student_id)) * 100 as retention_rate
      FROM enrollments e
      ${academic_year ? 'WHERE e.academic_year = ?' : ''}
    `, params);

    const [[teacherStudentRatio]] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT CASE WHEN role = 'student' THEN id END) / 
        NULLIF(COUNT(DISTINCT CASE WHEN role = 'teacher' THEN id END), 0) as ratio
      FROM users
      WHERE is_active = 1
    `);

    let avgAttendanceQuery = `
      SELECT AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100 as avg_attendance
      FROM attendance
      WHERE 1=1
    `;
    if (academic_year) {
      avgAttendanceQuery += ' AND academic_year = ?';
    }
    if (term) {
      avgAttendanceQuery += ' AND term = ?';
    }
    const attendanceQueryParams = [...params, ...termParams];
    const [[avgAttendance]] = await pool.execute(avgAttendanceQuery, attendanceQueryParams);

    const [[feeCollection]] = await pool.execute(`
      SELECT 
        SUM(amount) as collected,
        (SUM(amount) / NULLIF((SELECT SUM(total_amount) FROM budgets WHERE fiscal_year = YEAR(CURDATE())), 0)) * 100 as collection_rate
      FROM payments
      WHERE status = 'completed'
    `);

    res.json({
      success: true,
      kpis: {
        student_retention_rate: studentRetention.retention_rate || 0,
        teacher_student_ratio: teacherStudentRatio.ratio || 0,
        average_attendance: avgAttendance.avg_attendance || 0,
        fee_collection_rate: feeCollection.collection_rate || 0,
        total_collected: feeCollection.collected || 0
      }
    });
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch KPIs' });
  }
});

// ==================== HEALTH RECORDS ====================

router.get('/health-records/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;

    const [[healthRecord]] = await pool.execute(`
      SELECT hr.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.date_of_birth,
        (SELECT COUNT(*) FROM health_immunizations WHERE student_id = hr.student_id) as immunization_count,
        (SELECT COUNT(*) FROM health_checkups WHERE student_id = hr.student_id) as checkup_count
      FROM health_records hr
      JOIN users u ON hr.student_id = u.id
      WHERE hr.student_id = ?
    `, [student_id]);

    if (!healthRecord) {
      return res.status(404).json({ success: false, message: 'Health record not found' });
    }

    const [allergies] = await pool.execute(
      'SELECT * FROM health_allergies WHERE student_id = ? ORDER BY severity DESC',
      [student_id]
    );

    const [medications] = await pool.execute(
      'SELECT * FROM health_medications WHERE student_id = ? AND is_active = 1 ORDER BY medication_name',
      [student_id]
    );

    const [immunizations] = await pool.execute(
      'SELECT * FROM health_immunizations WHERE student_id = ? ORDER BY date_administered DESC',
      [student_id]
    );

    res.json({ 
      success: true, 
      health_record: healthRecord,
      allergies,
      medications,
      immunizations
    });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch health record' });
  }
});

router.post('/health-records', authenticateToken, requireRole('admin', 'super_admin', 'nurse'), async (req, res) => {
  try {
    const { student_id, blood_group, height, weight, emergency_contact, emergency_phone, medical_conditions, doctor_name, doctor_phone, insurance_provider, insurance_number } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO health_records (student_id, blood_group, height, weight, emergency_contact, emergency_phone, medical_conditions, doctor_name, doctor_phone, insurance_provider, insurance_number, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        blood_group = VALUES(blood_group),
        height = VALUES(height),
        weight = VALUES(weight),
        emergency_contact = VALUES(emergency_contact),
        emergency_phone = VALUES(emergency_phone),
        medical_conditions = VALUES(medical_conditions),
        doctor_name = VALUES(doctor_name),
        doctor_phone = VALUES(doctor_phone),
        insurance_provider = VALUES(insurance_provider),
        insurance_number = VALUES(insurance_number),
        last_updated = CURRENT_TIMESTAMP
    `, [student_id, blood_group, height, weight, emergency_contact, emergency_phone, medical_conditions, doctor_name, doctor_phone, insurance_provider, insurance_number]);

    res.json({ success: true, message: 'Health record updated', id: result.insertId });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({ success: false, message: 'Failed to update health record' });
  }
});

router.post('/health-checkups', authenticateToken, requireRole('admin', 'super_admin', 'nurse'), async (req, res) => {
  try {
    const { student_id, checkup_date, height, weight, blood_pressure, temperature, pulse_rate, vision_test, hearing_test, dental_checkup, findings, recommendations, checked_by } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO health_checkups (student_id, checkup_date, height, weight, blood_pressure, temperature, pulse_rate, vision_test, hearing_test, dental_checkup, findings, recommendations, checked_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, checkup_date, height, weight, blood_pressure, temperature, pulse_rate, vision_test, hearing_test, dental_checkup, findings, recommendations, checked_by || req.user.id]);

    res.json({ success: true, message: 'Health checkup recorded', id: result.insertId });
  } catch (error) {
    console.error('Record health checkup error:', error);
    res.status(500).json({ success: false, message: 'Failed to record checkup' });
  }
});

router.post('/health-allergies', authenticateToken, requireRole('admin', 'super_admin', 'nurse'), async (req, res) => {
  try {
    const { student_id, allergy_name, allergy_type, severity, symptoms, treatment, notes } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO health_allergies (student_id, allergy_name, allergy_type, severity, symptoms, treatment, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [student_id, allergy_name, allergy_type, severity, symptoms, treatment, notes]);

    res.json({ success: true, message: 'Allergy recorded', id: result.insertId });
  } catch (error) {
    console.error('Record allergy error:', error);
    res.status(500).json({ success: false, message: 'Failed to record allergy' });
  }
});

// ==================== CAREER GUIDANCE ====================

router.get('/career-guidance/sessions', authenticateToken, async (req, res) => {
  try {
    const { student_id, counselor_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cgs.*, 
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        CONCAT(c.first_name, ' ', c.last_name) as counselor_name
      FROM career_guidance_sessions cgs
      JOIN users s ON cgs.student_id = s.id
      LEFT JOIN users c ON cgs.counselor_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND cgs.student_id = ?';
      params.push(student_id);
    }
    if (counselor_id) {
      query += ' AND cgs.counselor_id = ?';
      params.push(counselor_id);
    }
    if (status) {
      query += ' AND cgs.status = ?';
      params.push(status);
    }

    query += ' ORDER BY cgs.session_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [sessions] = await pool.execute(query, params);
    res.json({ success: true, sessions, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get career sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

router.post('/career-guidance/sessions', authenticateToken, requireRole('admin', 'super_admin', 'counselor'), async (req, res) => {
  try {
    const { student_id, session_date, session_time, topics_discussed, career_interests, aptitude_results, recommendations, action_plan, next_steps } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO career_guidance_sessions (student_id, counselor_id, session_date, session_time, topics_discussed, career_interests, aptitude_results, recommendations, action_plan, next_steps, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `, [student_id, req.user.id, session_date, session_time, topics_discussed, career_interests, aptitude_results, recommendations, action_plan, next_steps]);

    res.json({ success: true, message: 'Career guidance session recorded', id: result.insertId });
  } catch (error) {
    console.error('Record career session error:', error);
    res.status(500).json({ success: false, message: 'Failed to record session' });
  }
});

router.get('/career-paths', authenticateToken, async (req, res) => {
  try {
    const { category, education_level } = req.query;
    let query = 'SELECT * FROM career_paths WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (education_level) {
      query += ' AND required_education = ?';
      params.push(education_level);
    }

    query += ' ORDER BY career_name';
    const [careers] = await pool.execute(query, params);
    res.json({ success: true, career_paths: careers });
  } catch (error) {
    console.error('Get career paths error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch career paths' });
  }
});

router.post('/aptitude-tests', authenticateToken, async (req, res) => {
  try {
    const { test_name, test_date, category, questions, duration_minutes } = req.body;

    const test_code = `APT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO aptitude_tests (test_code, test_name, test_date, category, questions, duration_minutes, created_by, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [test_code, test_name, test_date, category, JSON.stringify(questions), duration_minutes, req.user.id]);

    res.json({ success: true, message: 'Aptitude test created', id: result.insertId, test_code });
  } catch (error) {
    console.error('Create aptitude test error:', error);
    res.status(500).json({ success: false, message: 'Failed to create test' });
  }
});

router.post('/aptitude-test-results', authenticateToken, async (req, res) => {
  try {
    const { test_id, answers, test_duration } = req.body;

    const [[test]] = await pool.execute('SELECT questions FROM aptitude_tests WHERE id = ?', [test_id]);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const questions = JSON.parse(test.questions);
    let score = 0;
    let correct_answers = 0;

    answers.forEach((answer, index) => {
      if (questions[index] && questions[index].correct_answer === answer) {
        correct_answers++;
        score += questions[index].points || 1;
      }
    });

    const percentage = (correct_answers / questions.length) * 100;

    const [result] = await pool.execute(`
      INSERT INTO aptitude_test_results (test_id, student_id, answers, score, percentage, correct_answers, total_questions, test_duration, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [test_id, req.user.id, JSON.stringify(answers), score, percentage, correct_answers, questions.length, test_duration]);

    res.json({ 
      success: true, 
      message: 'Test submitted', 
      id: result.insertId,
      results: { score, percentage, correct_answers, total_questions: questions.length }
    });
  } catch (error) {
    console.error('Submit aptitude test error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit test' });
  }
});

// ==================== RESOURCE BOOKING ====================

router.get('/resources', authenticateToken, async (req, res) => {
  try {
    const { resource_type, status, location } = req.query;
    let query = `
      SELECT r.*,
        (SELECT COUNT(*) FROM resource_bookings WHERE resource_id = r.id AND status = 'confirmed' AND booking_date >= CURDATE()) as upcoming_bookings
      FROM resources r
      WHERE 1=1
    `;
    const params = [];

    if (resource_type) {
      query += ' AND r.resource_type = ?';
      params.push(resource_type);
    }
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    if (location) {
      query += ' AND r.location LIKE ?';
      params.push(`%${location}%`);
    }

    query += ' ORDER BY r.resource_name';
    const [resources] = await pool.execute(query, params);
    res.json({ success: true, resources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
});

router.post('/resources', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { resource_name, resource_type, description, capacity, location, amenities, hourly_rate, is_bookable } = req.body;

    const resource_code = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO resources (resource_code, resource_name, resource_type, description, capacity, location, amenities, hourly_rate, is_bookable, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `, [resource_code, resource_name, resource_type, description, capacity, location, amenities, hourly_rate, is_bookable !== false ? 1 : 0]);

    res.json({ success: true, message: 'Resource created', id: result.insertId, resource_code });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ success: false, message: 'Failed to create resource' });
  }
});

router.get('/resource-bookings', authenticateToken, async (req, res) => {
  try {
    const { resource_id, booked_by, status, date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT rb.*, 
        r.resource_name, r.resource_type, r.location,
        CONCAT(u.first_name, ' ', u.last_name) as booked_by_name
      FROM resource_bookings rb
      JOIN resources r ON rb.resource_id = r.id
      JOIN users u ON rb.booked_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (resource_id) {
      query += ' AND rb.resource_id = ?';
      params.push(resource_id);
    }
    if (booked_by) {
      query += ' AND rb.booked_by = ?';
      params.push(booked_by);
    }
    if (status) {
      query += ' AND rb.status = ?';
      params.push(status);
    }
    if (date) {
      query += ' AND rb.booking_date = ?';
      params.push(date);
    }

    query += ' ORDER BY rb.booking_date DESC, rb.start_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [bookings] = await pool.execute(query, params);
    res.json({ success: true, bookings, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

router.post('/resource-bookings', authenticateToken, async (req, res) => {
  try {
    const { resource_id, booking_date, start_time, end_time, purpose, attendees_count, setup_requirements } = req.body;

    const [conflicts] = await pool.execute(`
      SELECT id FROM resource_bookings 
      WHERE resource_id = ? 
        AND booking_date = ? 
        AND status IN ('confirmed', 'pending')
        AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
    `, [resource_id, booking_date, start_time, start_time, end_time, end_time]);

    if (conflicts.length > 0) {
      return res.status(400).json({ success: false, message: 'Resource already booked for this time slot' });
    }

    const booking_code = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO resource_bookings (booking_code, resource_id, booked_by, booking_date, start_time, end_time, purpose, attendees_count, setup_requirements, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `, [booking_code, resource_id, req.user.id, booking_date, start_time, end_time, purpose, attendees_count, setup_requirements]);

    res.json({ success: true, message: 'Resource booked successfully', id: result.insertId, booking_code });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// ==================== MAINTENANCE REQUESTS ====================

router.get('/maintenance-requests', authenticateToken, async (req, res) => {
  try {
    const { status, priority, category, assigned_to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT mr.*, 
        CONCAT(r.first_name, ' ', r.last_name) as requested_by_name,
        CONCAT(a.first_name, ' ', a.last_name) as assigned_to_name
      FROM maintenance_requests mr
      JOIN users r ON mr.requested_by = r.id
      LEFT JOIN users a ON mr.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND mr.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND mr.priority = ?';
      params.push(priority);
    }
    if (category) {
      query += ' AND mr.category = ?';
      params.push(category);
    }
    if (assigned_to) {
      query += ' AND mr.assigned_to = ?';
      params.push(assigned_to);
    }

    query += ' ORDER BY FIELD(mr.priority, "critical", "high", "medium", "low"), mr.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [requests] = await pool.execute(query, params);
    res.json({ success: true, maintenance_requests: requests, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
});

router.post('/maintenance-requests', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, location, priority, urgency_notes, photos } = req.body;

    const request_code = `MNT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO maintenance_requests (request_code, title, description, category, location, priority, urgency_notes, photos, status, requested_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [request_code, title, description, category, location, priority, urgency_notes, photos, req.user.id]);

    res.json({ success: true, message: 'Maintenance request submitted', id: result.insertId, request_code });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit request' });
  }
});

router.put('/maintenance-requests/:id/assign', authenticateToken, requireRole('admin', 'super_admin', 'maintenance_manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, estimated_cost, estimated_completion } = req.body;

    const [result] = await pool.execute(`
      UPDATE maintenance_requests SET
        assigned_to = ?,
        estimated_cost = ?,
        estimated_completion = ?,
        status = 'assigned'
      WHERE id = ?
    `, [assigned_to, estimated_cost, estimated_completion, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_id, related_type, is_read)
      VALUES (?, 'Maintenance Task Assigned', 'You have been assigned a maintenance task', 'maintenance', ?, 'maintenance_request', 0)
    `, [assigned_to, id]);

    res.json({ success: true, message: 'Request assigned successfully' });
  } catch (error) {
    console.error('Assign maintenance request error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign request' });
  }
});

router.put('/maintenance-requests/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { work_done, actual_cost, completion_notes, completion_photos } = req.body;

    const [result] = await pool.execute(`
      UPDATE maintenance_requests SET
        work_done = ?,
        actual_cost = ?,
        completion_notes = ?,
        completion_photos = ?,
        completed_at = CURRENT_TIMESTAMP,
        status = 'completed'
      WHERE id = ?
    `, [work_done, actual_cost, completion_notes, completion_photos, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, message: 'Request marked as completed' });
  } catch (error) {
    console.error('Complete maintenance request error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete request' });
  }
});

// ==================== VISITOR MANAGEMENT ====================

router.get('/visitors', authenticateToken, requireRole('admin', 'super_admin', 'security'), async (req, res) => {
  try {
    const { status, visitor_type, date, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT v.*, 
        CONCAT(h.first_name, ' ', h.last_name) as host_name,
        CONCAT(ci.first_name, ' ', ci.last_name) as checked_in_by_name,
        CONCAT(co.first_name, ' ', co.last_name) as checked_out_by_name
      FROM visitors v
      LEFT JOIN users h ON v.host_id = h.id
      LEFT JOIN users ci ON v.checked_in_by = ci.id
      LEFT JOIN users co ON v.checked_out_by = co.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND v.status = ?';
      params.push(status);
    }
    if (visitor_type) {
      query += ' AND v.visitor_type = ?';
      params.push(visitor_type);
    }
    if (date) {
      query += ' AND DATE(v.check_in_time) = ?';
      params.push(date);
    }

    query += ' ORDER BY v.check_in_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [visitors] = await pool.execute(query, params);
    res.json({ success: true, visitors, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visitors' });
  }
});

router.post('/visitors/check-in', authenticateToken, requireRole('admin', 'super_admin', 'security'), async (req, res) => {
  try {
    const { visitor_name, visitor_phone, visitor_email, id_type, id_number, visitor_type, host_id, purpose, vehicle_number, items_carried } = req.body;

    const visitor_code = `VIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO visitors (visitor_code, visitor_name, visitor_phone, visitor_email, id_type, id_number, visitor_type, host_id, purpose, vehicle_number, items_carried, check_in_time, checked_in_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'checked_in')
    `, [visitor_code, visitor_name, visitor_phone, visitor_email, id_type, id_number, visitor_type, host_id, purpose, vehicle_number, items_carried, req.user.id]);

    if (host_id) {
      await pool.execute(`
        INSERT INTO notifications (user_id, title, message, type, related_id, related_type, is_read)
        VALUES (?, 'Visitor Arrival', CONCAT('Visitor ', ?, ' has arrived to see you'), 'visitor', ?, 'visitor', 0)
      `, [host_id, visitor_name, result.insertId]);
    }

    res.json({ success: true, message: 'Visitor checked in', id: result.insertId, visitor_code });
  } catch (error) {
    console.error('Check in visitor error:', error);
    res.status(500).json({ success: false, message: 'Failed to check in visitor' });
  }
});

router.put('/visitors/:id/check-out', authenticateToken, requireRole('admin', 'super_admin', 'security'), async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, rating } = req.body;

    const [result] = await pool.execute(`
      UPDATE visitors SET
        check_out_time = CURRENT_TIMESTAMP,
        checked_out_by = ?,
        feedback = ?,
        rating = ?,
        status = 'checked_out'
      WHERE id = ?
    `, [req.user.id, feedback, rating, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.json({ success: true, message: 'Visitor checked out' });
  } catch (error) {
    console.error('Check out visitor error:', error);
    res.status(500).json({ success: false, message: 'Failed to check out visitor' });
  }
});

router.get('/visitors/statistics', authenticateToken, requireRole('admin', 'super_admin', 'security'), async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateFilter = '1=1';
    const params = [];
    if (date_from && date_to) {
      dateFilter = 'DATE(check_in_time) BETWEEN ? AND ?';
      params.push(date_from, date_to);
    }

    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_visitors,
        SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as current_visitors,
        SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as departed_visitors,
        AVG(rating) as average_rating
      FROM visitors
      WHERE ${dateFilter}
    `, params);

    const [byType] = await pool.execute(`
      SELECT visitor_type, COUNT(*) as count
      FROM visitors
      WHERE ${dateFilter}
      GROUP BY visitor_type
    `, params);

    res.json({ success: true, statistics: stats, by_type: byType });
  } catch (error) {
    console.error('Get visitor statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ==================== GATE PASS SYSTEM ====================

router.get('/gate-passes', authenticateToken, async (req, res) => {
  try {
    const { student_id, status, date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT gp.*, 
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        CONCAT(a.first_name, ' ', a.last_name) as approved_by_name,
        CONCAT(gi.first_name, ' ', gi.last_name) as gate_in_by_name,
        CONCAT(go.first_name, ' ', go.last_name) as gate_out_by_name
      FROM gate_passes gp
      JOIN users s ON gp.student_id = s.id
      LEFT JOIN users a ON gp.approved_by = a.id
      LEFT JOIN users gi ON gp.gate_in_by = gi.id
      LEFT JOIN users go ON gp.gate_out_by = go.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND gp.student_id = ?';
      params.push(student_id);
    }
    if (status) {
      query += ' AND gp.status = ?';
      params.push(status);
    }
    if (date) {
      query += ' AND DATE(gp.exit_date) = ?';
      params.push(date);
    }

    query += ' ORDER BY gp.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [passes] = await pool.execute(query, params);
    res.json({ success: true, gate_passes: passes, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get gate passes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gate passes' });
  }
});

router.post('/gate-passes', authenticateToken, async (req, res) => {
  try {
    const { exit_date, exit_time, expected_return_time, reason, destination, guardian_contact, emergency_contact } = req.body;

    const pass_number = `GP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(`
      INSERT INTO gate_passes (pass_number, student_id, exit_date, exit_time, expected_return_time, reason, destination, guardian_contact, emergency_contact, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [pass_number, req.user.id, exit_date, exit_time, expected_return_time, reason, destination, guardian_contact, emergency_contact]);

    res.json({ success: true, message: 'Gate pass requested', id: result.insertId, pass_number });
  } catch (error) {
    console.error('Request gate pass error:', error);
    res.status(500).json({ success: false, message: 'Failed to request gate pass' });
  }
});

router.put('/gate-passes/:id/approve', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'security'), async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_notes } = req.body;

    const [result] = await pool.execute(`
      UPDATE gate_passes SET
        status = 'approved',
        approved_by = ?,
        approved_at = CURRENT_TIMESTAMP,
        approval_notes = ?
      WHERE id = ?
    `, [req.user.id, approval_notes, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }

    const [[pass]] = await pool.execute('SELECT student_id FROM gate_passes WHERE id = ?', [id]);
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_id, related_type, is_read)
      VALUES (?, 'Gate Pass Approved', 'Your gate pass request has been approved', 'gate_pass', ?, 'gate_pass', 0)
    `, [pass.student_id, id]);

    res.json({ success: true, message: 'Gate pass approved' });
  } catch (error) {
    console.error('Approve gate pass error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve gate pass' });
  }
});

router.put('/gate-passes/:id/exit', authenticateToken, requireRole('admin', 'super_admin', 'security'), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      UPDATE gate_passes SET
        actual_exit_time = CURRENT_TIMESTAMP,
        gate_out_by = ?,
        status = 'exited'
      WHERE id = ?
    `, [req.user.id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }

    res.json({ success: true, message: 'Student exited' });
  } catch (error) {
    console.error('Record exit error:', error);
    res.status(500).json({ success: false, message: 'Failed to record exit' });
  }
});

router.put('/gate-passes/:id/return', authenticateToken, requireRole('admin', 'super_admin', 'security'), async (req, res) => {
  try {
    const { id } = req.params;
    const { return_notes } = req.body;

    const [result] = await pool.execute(`
      UPDATE gate_passes SET
        actual_return_time = CURRENT_TIMESTAMP,
        gate_in_by = ?,
        return_notes = ?,
        status = 'returned'
      WHERE id = ?
    `, [req.user.id, return_notes, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }

    res.json({ success: true, message: 'Student returned' });
  } catch (error) {
    console.error('Record return error:', error);
    res.status(500).json({ success: false, message: 'Failed to record return' });
  }
});

// ==================== STUDENT PORTFOLIOS ====================

router.get('/student-portfolios/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;

    const [[portfolio]] = await pool.execute(`
      SELECT sp.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email
      FROM student_portfolios sp
      JOIN users u ON sp.student_id = u.id
      WHERE sp.student_id = ?
    `, [student_id]);

    const [projects] = await pool.execute(
      'SELECT * FROM portfolio_projects WHERE student_id = ? ORDER BY completion_date DESC',
      [student_id]
    );

    const [skills] = await pool.execute(
      'SELECT * FROM portfolio_skills WHERE student_id = ? ORDER BY proficiency_level DESC',
      [student_id]
    );

    const [certifications] = await pool.execute(
      'SELECT * FROM portfolio_certifications WHERE student_id = ? ORDER BY issue_date DESC',
      [student_id]
    );

    const [documents] = await pool.execute(
      'SELECT * FROM portfolio_documents WHERE student_id = ? ORDER BY uploaded_at DESC',
      [student_id]
    );

    res.json({ 
      success: true, 
      portfolio: portfolio || {},
      projects,
      skills,
      certifications,
      documents
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch portfolio' });
  }
});

router.post('/portfolio-projects', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, technologies, start_date, completion_date, project_url, github_url, screenshots, role, outcomes } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO portfolio_projects (student_id, title, description, category, technologies, start_date, completion_date, project_url, github_url, screenshots, role, outcomes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, title, description, category, technologies, start_date, completion_date, project_url, github_url, screenshots, role, outcomes]);

    res.json({ success: true, message: 'Project added to portfolio', id: result.insertId });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ success: false, message: 'Failed to add project' });
  }
});

router.post('/portfolio-skills', authenticateToken, async (req, res) => {
  try {
    const { skill_name, category, proficiency_level, years_experience, verified_by, endorsements } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO portfolio_skills (student_id, skill_name, category, proficiency_level, years_experience, verified_by, endorsements)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        proficiency_level = VALUES(proficiency_level),
        years_experience = VALUES(years_experience),
        endorsements = VALUES(endorsements)
    `, [req.user.id, skill_name, category, proficiency_level, years_experience, verified_by, endorsements || 0]);

    res.json({ success: true, message: 'Skill added to portfolio', id: result.insertId });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ success: false, message: 'Failed to add skill' });
  }
});

router.post('/portfolio-certifications', authenticateToken, async (req, res) => {
  try {
    const { certification_name, issuing_organization, issue_date, expiry_date, credential_id, credential_url, description } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO portfolio_certifications (student_id, certification_name, issuing_organization, issue_date, expiry_date, credential_id, credential_url, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, certification_name, issuing_organization, issue_date, expiry_date, credential_id, credential_url, description]);

    res.json({ success: true, message: 'Certification added to portfolio', id: result.insertId });
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({ success: false, message: 'Failed to add certification' });
  }
});

module.exports = router;

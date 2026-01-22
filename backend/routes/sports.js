const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ===== SPORTS TEAMS =====

// Get all sports teams
router.get('/teams', async (req, res) => {
  try {
    const { sport_type, is_active } = req.query;
    
    let query = `
      SELECT st.*, 
        u.first_name as coach_first_name, 
        u.last_name as coach_last_name,
        (SELECT COUNT(*) FROM sports_achievements WHERE team_id = st.id) as achievements_count
      FROM sports_teams st
      LEFT JOIN users u ON st.coach_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (sport_type) {
      query += ' AND st.sport_type = ?';
      params.push(sport_type);
    }
    if (is_active !== undefined) {
      query += ' AND st.is_active = ?';
      params.push(is_active === 'true');
    }

    query += ' ORDER BY st.team_name';

    const [teams] = await pool.query(query, params);
    res.json({ success: true, teams });
  } catch (error) {
    console.error('Error fetching sports teams:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sports teams' });
  }
});

// Get sports team by ID
router.get('/teams/:id', async (req, res) => {
  try {
    const [teams] = await pool.query(`
      SELECT st.*, 
        u.first_name as coach_first_name, 
        u.last_name as coach_last_name,
        u.profile_image as coach_image
      FROM sports_teams st
      LEFT JOIN users u ON st.coach_id = u.id
      WHERE st.id = ?
    `, [req.params.id]);

    if (teams.length === 0) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const [achievements] = await pool.query(`
      SELECT * FROM sports_achievements 
      WHERE team_id = ?
      ORDER BY achievement_date DESC
    `, [req.params.id]);

    res.json({ 
      success: true, 
      team: {
        ...teams[0],
        achievements
      }
    });
  } catch (error) {
    console.error('Error fetching sports team:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sports team' });
  }
});

// Create sports team
router.post('/teams', authenticateToken, async (req, res) => {
  try {
    const { team_name, sport_type, coach_id, description, image_url } = req.body;

    const [result] = await pool.query(`
      INSERT INTO sports_teams (team_name, sport_type, coach_id, description, image_url)
      VALUES (?, ?, ?, ?, ?)
    `, [team_name, sport_type, coach_id, description, image_url]);

    res.json({ success: true, message: 'Sports team created successfully', teamId: result.insertId });
  } catch (error) {
    console.error('Error creating sports team:', error);
    res.status(500).json({ success: false, message: 'Failed to create sports team' });
  }
});

// Update sports team
router.put('/teams/:id', authenticateToken, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    const allowedFields = ['team_name', 'sport_type', 'coach_id', 'description', 'image_url', 'is_active'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE sports_teams SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Sports team updated successfully' });
  } catch (error) {
    console.error('Error updating sports team:', error);
    res.status(500).json({ success: false, message: 'Failed to update sports team' });
  }
});

// Delete sports team
router.delete('/teams/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE sports_teams SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Sports team deleted successfully' });
  } catch (error) {
    console.error('Error deleting sports team:', error);
    res.status(500).json({ success: false, message: 'Failed to delete sports team' });
  }
});

// ===== SPORTS EVENTS =====

// Get all sports events
router.get('/events', async (req, res) => {
  try {
    const { status, event_type, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM sports_events WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (event_type) {
      query += ' AND event_type = ?';
      params.push(event_type);
    }
    if (start_date) {
      query += ' AND event_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND event_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY event_date DESC';

    const [events] = await pool.query(query, params);
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching sports events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sports events' });
  }
});

// Get sports event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const [events] = await pool.query('SELECT * FROM sports_events WHERE id = ?', [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const [achievements] = await pool.query(`
      SELECT sa.*, 
        u.first_name, u.last_name, u.student_code,
        st.team_name
      FROM sports_achievements sa
      LEFT JOIN users u ON sa.student_id = u.id
      LEFT JOIN sports_teams st ON sa.team_id = st.id
      WHERE sa.event_id = ?
      ORDER BY sa.achievement_date DESC
    `, [req.params.id]);

    res.json({ 
      success: true, 
      event: {
        ...events[0],
        achievements
      }
    });
  } catch (error) {
    console.error('Error fetching sports event:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sports event' });
  }
});

// Create sports event
router.post('/events', authenticateToken, async (req, res) => {
  try {
    const { event_name, event_type, event_date, location, description, image_url, status } = req.body;

    const [result] = await pool.query(`
      INSERT INTO sports_events (event_name, event_type, event_date, location, description, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [event_name, event_type, event_date, location, description, image_url, status || 'upcoming']);

    res.json({ success: true, message: 'Sports event created successfully', eventId: result.insertId });
  } catch (error) {
    console.error('Error creating sports event:', error);
    res.status(500).json({ success: false, message: 'Failed to create sports event' });
  }
});

// Update sports event
router.put('/events/:id', authenticateToken, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    const allowedFields = ['event_name', 'event_type', 'event_date', 'location', 'description', 'image_url', 'status'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE sports_events SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Sports event updated successfully' });
  } catch (error) {
    console.error('Error updating sports event:', error);
    res.status(500).json({ success: false, message: 'Failed to update sports event' });
  }
});

// Delete sports event
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM sports_events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Sports event deleted successfully' });
  } catch (error) {
    console.error('Error deleting sports event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete sports event' });
  }
});

// ===== SPORTS ACHIEVEMENTS =====

// Get all sports achievements
router.get('/achievements', async (req, res) => {
  try {
    const { student_id, team_id, event_id } = req.query;
    
    let query = `
      SELECT sa.*, 
        u.first_name, u.last_name, u.student_code, u.profile_image,
        st.team_name,
        se.event_name
      FROM sports_achievements sa
      LEFT JOIN users u ON sa.student_id = u.id
      LEFT JOIN sports_teams st ON sa.team_id = st.id
      LEFT JOIN sports_events se ON sa.event_id = se.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND sa.student_id = ?';
      params.push(student_id);
    }
    if (team_id) {
      query += ' AND sa.team_id = ?';
      params.push(team_id);
    }
    if (event_id) {
      query += ' AND sa.event_id = ?';
      params.push(event_id);
    }

    query += ' ORDER BY sa.achievement_date DESC';

    const [achievements] = await pool.query(query, params);
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error fetching sports achievements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sports achievements' });
  }
});

// Create sports achievement
router.post('/achievements', authenticateToken, async (req, res) => {
  try {
    const { title, description, achievement_date, student_id, team_id, event_id, position, image_url } = req.body;

    const [result] = await pool.query(`
      INSERT INTO sports_achievements (title, description, achievement_date, student_id, team_id, event_id, position, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, achievement_date, student_id, team_id, event_id, position, image_url]);

    // Create notification for student if specified
    if (student_id) {
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'success', '/sports/achievements')
      `, [student_id, 'New Achievement!', `Congratulations! You have a new sports achievement: ${title}`]);
    }

    res.json({ success: true, message: 'Sports achievement created successfully', achievementId: result.insertId });
  } catch (error) {
    console.error('Error creating sports achievement:', error);
    res.status(500).json({ success: false, message: 'Failed to create sports achievement' });
  }
});

// Update sports achievement
router.put('/achievements/:id', authenticateToken, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    const allowedFields = ['title', 'description', 'achievement_date', 'student_id', 'team_id', 'event_id', 'position', 'image_url'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE sports_achievements SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Sports achievement updated successfully' });
  } catch (error) {
    console.error('Error updating sports achievement:', error);
    res.status(500).json({ success: false, message: 'Failed to update sports achievement' });
  }
});

// Delete sports achievement
router.delete('/achievements/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM sports_achievements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Sports achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting sports achievement:', error);
    res.status(500).json({ success: false, message: 'Failed to delete sports achievement' });
  }
});

module.exports = router;

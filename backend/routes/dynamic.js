const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'event_images' ? 'uploads/events/' : 'uploads/media/';
    cb(null, folder);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only images allowed'));
  }
});

// Get features
router.get('/features', async (req, res) => {
  try {
    const [features] = await pool.execute(`
      SELECT * FROM features WHERE is_active = 1 ORDER BY display_order ASC
    `);
    res.json({ success: true, features });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/features', upload.single('icon'), async (req, res) => {
  try {
    const { title, description, display_order } = req.body;
    const icon = req.file ? `/uploads/media/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO features (title, description, icon, display_order, is_active) VALUES (?, ?, ?, ?, 1)`,
      [title, description, icon, display_order || 0]
    );
    res.json({ success: true, featureId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/features/:id', upload.single('icon'), async (req, res) => {
  try {
    const { title, description, display_order, is_active } = req.body;
    let query = `UPDATE features SET title = ?, description = ?, display_order = ?, is_active = ?`;
    const params = [title, description, display_order, is_active ? 1 : 0];
    
    if (req.file) {
      query += `, icon = ?`;
      params.push(`/uploads/media/${req.file.filename}`);
    }
    
    query += ` WHERE id = ?`;
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/features/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM features WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get events
router.get('/events', async (req, res) => {
  try {
    const { status, type, limit = 20 } = req.query;
    let query = `
      SELECT e.*, COUNT(DISTINCT ei.id) as image_count
      FROM events e
      LEFT JOIN event_images ei ON e.id = ei.event_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status === 'upcoming') {
      query += ` AND e.start_date >= CURDATE()`;
    } else if (status === 'past') {
      query += ` AND e.end_date < CURDATE()`;
    } else if (status) {
      query += ` AND e.status = ?`;
      params.push(status);
    }
    
    if (type) {
      query += ` AND e.type = ?`;
      params.push(type);
    }
    
    query += ` GROUP BY e.id ORDER BY e.start_date DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [events] = await pool.execute(query, params);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/events', upload.array('event_images', 10), async (req, res) => {
  try {
    const { title, description, type, start_date, end_date, venue, organizer } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO events (title, description, type, start_date, end_date, venue, organizer, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [title, description, type, start_date, end_date, venue, organizer]
    );
    
    if (req.files?.length) {
      const imagePromises = req.files.map((file, index) => 
        pool.execute(
          `INSERT INTO event_images (event_id, image_url, is_primary) VALUES (?, ?, ?)`,
          [result.insertId, `/uploads/events/${file.filename}`, index === 0 ? 1 : 0]
        )
      );
      await Promise.all(imagePromises);
    }
    
    res.json({ success: true, eventId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const { title, description, start_date, end_date, venue, status } = req.body;
    await pool.execute(
      `UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, venue = ?, status = ? WHERE id = ?`,
      [title, description, start_date, end_date, venue, status, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM event_images WHERE event_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sports categories
router.get('/sports/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT sport_type as name, COUNT(*) as team_count
      FROM teams
      WHERE status = 'active'
      GROUP BY sport_type
    `);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sports matches
router.get('/sports/matches', async (req, res) => {
  try {
    const { status, limit = 10 } = req.query;
    let query = `
      SELECT m.*, t1.name as home_team, t2.name as away_team
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status === 'upcoming') {
      query += ` AND m.match_date >= CURDATE() AND m.status = 'scheduled'`;
    } else if (status) {
      query += ` AND m.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY m.match_date DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [matches] = await pool.execute(query, params);
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sports achievements
router.get('/sports/achievements', async (req, res) => {
  try {
    const { featured, limit = 10 } = req.query;
    let query = `SELECT * FROM trophies WHERE 1=1`;
    const params = [];
    
    query += ` ORDER BY year DESC, date_won DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [achievements] = await pool.execute(query, params);
    res.json({ success: true, achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get announcements
router.get('/announcements', async (req, res) => {
  try {
    const { target_audience, active } = req.query;
    let query = `SELECT * FROM announcements WHERE 1=1`;
    const params = [];
    
    if (target_audience) {
      query += ` AND target_audience = ?`;
      params.push(target_audience);
    }
    
    if (active === 'true') {
      query += ` AND start_date <= NOW() AND end_date >= NOW()`;
    }
    
    query += ` ORDER BY priority DESC, created_at DESC LIMIT 20`;
    const [announcements] = await pool.execute(query, params);
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

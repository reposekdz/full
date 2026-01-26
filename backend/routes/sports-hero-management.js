const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/sports/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Sports Teams CRUD
router.get('/sports/teams', authenticateToken, async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT * FROM sport_teams WHERE is_active = true ORDER BY created_at DESC');
    res.json({ success: true, items: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sports/teams', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { name, sport_type, coach, players_count } = req.body;
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO sport_teams (name, sport_type, coach, players_count, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, sport_type, coach, players_count, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/sports/teams/:id', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sport_type, coach, players_count } = req.body;
    
    let query = 'UPDATE sport_teams SET name = ?, sport_type = ?, coach = ?, players_count = ?';
    const params = [name, sport_type, coach, players_count];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/sports/teams/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE sport_teams SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Players CRUD
router.get('/sports/players', authenticateToken, async (req, res) => {
  try {
    const [players] = await pool.query('SELECT * FROM sport_players WHERE is_active = true ORDER BY created_at DESC');
    res.json({ success: true, items: players });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sports/players', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { name, position, jersey_number, team } = req.body;
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO sport_players (name, position, jersey_number, team, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, position, jersey_number, team, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/sports/players/:id', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, jersey_number, team } = req.body;
    
    let query = 'UPDATE sport_players SET name = ?, position = ?, jersey_number = ?, team = ?';
    const params = [name, position, jersey_number, team];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/sports/players/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE sport_players SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Coaches CRUD
router.get('/sports/coaches', authenticateToken, async (req, res) => {
  try {
    const [coaches] = await pool.query('SELECT * FROM sport_coaches WHERE is_active = true ORDER BY created_at DESC');
    res.json({ success: true, items: coaches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sports/coaches', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { name, sport, experience, phone } = req.body;
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO sport_coaches (name, sport, experience, phone, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, sport, experience, phone, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/sports/coaches/:id', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sport, experience, phone } = req.body;
    
    let query = 'UPDATE sport_coaches SET name = ?, sport = ?, experience = ?, phone = ?';
    const params = [name, sport, experience, phone];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/sports/coaches/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE sport_coaches SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Achievements CRUD
router.get('/sports/achievements', authenticateToken, async (req, res) => {
  try {
    const [achievements] = await pool.query('SELECT * FROM sport_achievements WHERE is_active = true ORDER BY date DESC');
    res.json({ success: true, items: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sports/achievements', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { title, sport, date, description } = req.body;
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO sport_achievements (title, sport, date, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, sport, date, description, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/sports/achievements/:id', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { id } = req.params;
    const { title, sport, date, description } = req.body;
    
    let query = 'UPDATE sport_achievements SET title = ?, sport = ?, date = ?, description = ?';
    const params = [title, sport, date, description];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/sports/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/sports/achievements/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE sport_achievements SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Hero Section CRUD
router.get('/hero', async (req, res) => {
  try {
    const [slides] = await pool.query('SELECT * FROM hero_slides WHERE is_active = true ORDER BY sort_order');
    res.json({ success: true, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/hero', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { title, subtitle, button_text, button_link, sort_order } = req.body;
    const image_url = req.file ? `/uploads/hero/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO hero_slides (title, subtitle, button_text, button_link, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, subtitle, button_text, button_link, image_url, sort_order || 0]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/hero/:id', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, button_text, button_link, sort_order } = req.body;
    
    let query = 'UPDATE hero_slides SET title = ?, subtitle = ?, button_text = ?, button_link = ?, sort_order = ?';
    const params = [title, subtitle, button_text, button_link, sort_order || 0];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/hero/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/hero/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE hero_slides SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

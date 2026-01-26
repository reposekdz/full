const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'general';
    cb(null, `uploads/${type}/`);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Get content by type
router.get('/content/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const [items] = await pool.query(
      'SELECT * FROM content_items WHERE type = ? AND is_active = true ORDER BY sort_order, created_at DESC',
      [type]
    );
    res.json({ success: true, items });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create content
router.post('/content', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { type, title, description, data } = req.body;
    const image_url = req.file ? `/uploads/${type}/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO content_items (type, title, description, image_url, data) VALUES (?, ?, ?, ?, ?)',
      [type, title, description, image_url, data]
    );
    
    res.json({ success: true, id: result.insertId, message: 'Content created successfully' });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update content
router.put('/content/:id', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description, data } = req.body;
    
    let query = 'UPDATE content_items SET title = ?, description = ?, data = ?';
    const params = [title, description, data];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/${type}/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    res.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete content
router.delete('/content/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE content_items SET is_active = false WHERE id = ?', [id]);
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all sports
router.get('/sports', async (req, res) => {
  try {
    const [sports] = await pool.query(`
      SELECT s.*, COUNT(DISTINCT st.id) as teams_count, COUNT(DISTINCT sp.id) as players_count
      FROM sports s
      LEFT JOIN sport_teams st ON s.id = st.sport_id
      LEFT JOIN sport_players sp ON st.id = sp.team_id
      WHERE s.is_active = true
      GROUP BY s.id
      ORDER BY s.name
    `);
    res.json({ success: true, sports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update sport
router.post('/sports', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { name, description, coach, players_count } = req.body;
    const image_url = req.file ? `/uploads/sports/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO sports (name, description, coach, image_url) VALUES (?, ?, ?, ?)',
      [name, description, coach, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all leadership
router.get('/leadership', async (req, res) => {
  try {
    const [leaders] = await pool.query(`
      SELECT * FROM leadership WHERE is_active = true ORDER BY sort_order, name
    `);
    res.json({ success: true, leaders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update leadership
router.post('/leadership', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { name, position, email, phone, bio } = req.body;
    const image_url = req.file ? `/uploads/leadership/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO leadership (name, position, email, phone, bio, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, position, email, phone, bio, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all trades
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT t.*, COUNT(DISTINCT tl.id) as levels_count, COUNT(DISTINCT tc.id) as classes_count
      FROM trades t
      LEFT JOIN trade_levels tl ON t.code = tl.trade_code
      LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.name
    `);
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update trade
router.post('/trades', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { code, name, description, duration, capacity } = req.body;
    const image_url = req.file ? `/uploads/trades/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO trades (code, name, description, duration, capacity, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [code, name, description, duration, capacity, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all developers
router.get('/developers', async (req, res) => {
  try {
    const [developers] = await pool.query(`
      SELECT * FROM developers WHERE is_active = true ORDER BY sort_order, name
    `);
    res.json({ success: true, developers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update developer
router.post('/developers', [authenticateToken, upload.single('image')], async (req, res) => {
  try {
    const { name, role, bio, github, linkedin, twitter } = req.body;
    const image_url = req.file ? `/uploads/developers/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      'INSERT INTO developers (name, role, bio, github, linkedin, twitter, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, role, bio, github, linkedin, twitter, image_url]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

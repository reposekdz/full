const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get news
router.get('/news', async (req, res) => {
  try {
    const [news] = await pool.execute(`
      SELECT * FROM news WHERE is_published = true 
      ORDER BY published_at DESC LIMIT 10
    `);
    res.json({ success: true, news });
  } catch (error) {
    res.json({ success: true, news: [] });
  }
});

// Get slides
router.get('/slides', async (req, res) => {
  try {
    const [slides] = await pool.execute(`
      SELECT * FROM carousel_slides WHERE is_active = true 
      ORDER BY sort_order ASC
    `);
    res.json({ success: true, slides });
  } catch (error) {
    res.json({ success: true, slides: [] });
  }
});

// Create slide (Admin only)
router.post('/slides', authenticateToken, async (req, res) => {
  try {
    const { title, title_rw, description, description_rw, image_url, trade_code, sort_order } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO carousel_slides (title, title_rw, description, description_rw, image_url, trade_code, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, true)
    `, [title, title_rw, description, description_rw, image_url, trade_code, sort_order || 0]);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update slide (Admin only)
router.put('/slides/:id', authenticateToken, async (req, res) => {
  try {
    const { title, title_rw, description, description_rw, image_url, trade_code, sort_order, is_active } = req.body;
    await pool.execute(`
      UPDATE carousel_slides 
      SET title = ?, title_rw = ?, description = ?, description_rw = ?, image_url = ?, trade_code = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `, [title, title_rw, description, description_rw, image_url, trade_code, sort_order, is_active, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete slide (Admin only)
router.delete('/slides/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM carousel_slides WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trades
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT * FROM trades WHERE is_active = true
    `);
    res.json({ success: true, trades });
  } catch (error) {
    res.json({ success: true, trades: [] });
  }
});

// Get testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [testimonials] = await pool.execute(`
      SELECT * FROM testimonials WHERE is_published = true 
      ORDER BY created_at DESC LIMIT 10
    `);
    res.json({ success: true, testimonials });
  } catch (error) {
    res.json({ success: true, testimonials: [] });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "student")');
    const [teachers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "teacher")');
    const [courses] = await pool.execute('SELECT COUNT(*) as count FROM courses WHERE is_active = true');
    
    res.json({
      success: true,
      stats: {
        students: students[0].count,
        teachers: teachers[0].count,
        courses: courses[0].count,
        graduates: 500
      }
    });
  } catch (error) {
    res.json({ success: true, stats: { students: 0, teachers: 0, courses: 0, graduates: 0 } });
  }
});

// Get achievements
router.get('/achievements', async (req, res) => {
  try {
    const [achievements] = await pool.execute(`
      SELECT * FROM achievements WHERE is_featured = true 
      ORDER BY achievement_date DESC LIMIT 10
    `);
    res.json({ success: true, achievements });
  } catch (error) {
    res.json({ success: true, achievements: [] });
  }
});

// Admin CRUD operations
router.post('/news', authenticateToken, async (req, res) => {
  try {
    const { title, content, image_url, category } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO news (title, content, image_url, category, author_id, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, true, NOW())
    `, [title, content, image_url, category, req.user.id]);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/news/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, image_url, category } = req.body;
    await pool.execute(`
      UPDATE news SET title = ?, content = ?, image_url = ?, category = ?
      WHERE id = ?
    `, [title, content, image_url, category, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/news/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

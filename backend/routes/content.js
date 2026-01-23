const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get news articles
router.get('/news', async (req, res) => {
  try {
    const [articles] = await pool.query(`
      SELECT 
        id, title, description, content, image_url, author, category,
        DATE_FORMAT(date_published, '%Y-%m-%d') as publish_date,
        is_featured, is_active
      FROM news_articles 
      WHERE is_active = true 
      ORDER BY date_published DESC, sort_order ASC
      LIMIT 10
    `);
    res.json({ success: true, articles });
  } catch (error) {
    console.error('News error:', error);
    res.json({ success: true, articles: [] });
  }
});

// Get slides
router.get('/slides', async (req, res) => {
  try {
    const [slides] = await pool.query(`
      SELECT * FROM slides WHERE is_active = true 
      ORDER BY sort_order ASC
    `);
    res.json({ success: true, slides });
  } catch (error) {
    console.error('Slides error:', error);
    res.json({ success: true, slides: [] });
  }
});

// Get testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [testimonials] = await pool.query(`
      SELECT * FROM testimonials WHERE is_active = true 
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 10
    `);
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Testimonials error:', error);
    res.json({ success: true, testimonials: [] });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT * FROM school_stats WHERE is_active = true 
      ORDER BY sort_order ASC
    `);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.json({ success: true, stats: [] });
  }
});

// Get achievements
router.get('/achievements', async (req, res) => {
  try {
    const [achievements] = await pool.query(`
      SELECT * FROM achievements WHERE is_active = true 
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 10
    `);
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Achievements error:', error);
    res.json({ success: true, achievements: [] });
  }
});

// Get trades/courses
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT id, name, description, code, duration_months, fee_amount, is_active
      FROM courses WHERE is_active = true 
      ORDER BY name ASC
    `);
    res.json({ success: true, trades });
  } catch (error) {
    console.error('Trades error:', error);
    res.json({ success: true, trades: [] });
  }
});

// Admin CRUD operations for news
router.post('/news', authenticateToken, async (req, res) => {
  try {
    const { title, description, content, image_url, author, category } = req.body;
    const [result] = await pool.query(`
      INSERT INTO news_articles (title, description, content, image_url, author, category, date_published, is_active)
      VALUES (?, ?, ?, ?, ?, ?, CURDATE(), true)
    `, [title, description, content, image_url, author, category]);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/news/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, content, image_url, author, category, is_active } = req.body;
    await pool.query(`
      UPDATE news_articles 
      SET title = ?, description = ?, content = ?, image_url = ?, author = ?, category = ?, is_active = ?
      WHERE id = ?
    `, [title, description, content, image_url, author, category, is_active, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/news/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM news_articles WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin CRUD for slides
router.post('/slides', authenticateToken, async (req, res) => {
  try {
    const { title, subtitle, description, image_url, button_text, button_link, sort_order } = req.body;
    const [result] = await pool.query(`
      INSERT INTO slides (title, subtitle, description, image_url, button_text, button_link, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, true)
    `, [title, subtitle, description, image_url, button_text, button_link, sort_order || 0]);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/slides/:id', authenticateToken, async (req, res) => {
  try {
    const { title, subtitle, description, image_url, button_text, button_link, sort_order, is_active } = req.body;
    await pool.query(`
      UPDATE slides 
      SET title = ?, subtitle = ?, description = ?, image_url = ?, button_text = ?, button_link = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `, [title, subtitle, description, image_url, button_text, button_link, sort_order, is_active, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/slides/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM slides WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

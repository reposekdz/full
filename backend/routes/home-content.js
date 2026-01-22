const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all home page stats (calculated from database)
router.get('/stats', async (req, res) => {
  try {
    const [students] = await db.query('SELECT COUNT(*) as count FROM students');
    const [teachers] = await db.query('SELECT COUNT(*) as count FROM teachers');
    const [courses] = await db.query('SELECT COUNT(*) as count FROM courses');
    const [trades] = await db.query('SELECT COUNT(*) as count FROM trades');
    const [sports] = await db.query('SELECT COUNT(*) as count FROM sports_teams');
    const [achievements] = await db.query('SELECT COUNT(*) as count FROM achievements');

    res.json({
      success: true,
      stats: {
        students: students[0].count || 0,
        teachers: teachers[0].count || 0,
        courses: courses[0].count || 0,
        trades: trades[0].count || 0,
        sports: sports[0].count || 0,
        achievements: achievements[0].count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get hero slides
router.get('/hero-slides', async (req, res) => {
  try {
    const [slides] = await db.query('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY display_order');
    res.json({ success: true, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create hero slide (Admin only)
router.post('/hero-slides', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { title_en, title_rw, subtitle_en, subtitle_rw, image_url, cta_text, cta_link, display_order } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO hero_slides (title_en, title_rw, subtitle_en, subtitle_rw, image_url, cta_text, cta_link, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title_en, title_rw, subtitle_en, subtitle_rw, image_url, cta_text, cta_link, display_order || 0]
    );

    res.json({ success: true, message: 'Hero slide created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update hero slide
router.put('/hero-slides/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { title_en, title_rw, subtitle_en, subtitle_rw, image_url, cta_text, cta_link, display_order, is_active } = req.body;
    
    await db.query(
      'UPDATE hero_slides SET title_en=?, title_rw=?, subtitle_en=?, subtitle_rw=?, image_url=?, cta_text=?, cta_link=?, display_order=?, is_active=? WHERE id=?',
      [title_en, title_rw, subtitle_en, subtitle_rw, image_url, cta_text, cta_link, display_order, is_active, req.params.id]
    );

    res.json({ success: true, message: 'Hero slide updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete hero slide
router.delete('/hero-slides/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM hero_slides WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Hero slide deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get features
router.get('/features', async (req, res) => {
  try {
    const [features] = await db.query('SELECT * FROM home_features WHERE is_active = 1 ORDER BY display_order');
    res.json({ success: true, features });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create feature
router.post('/features', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { title_en, title_rw, description_en, description_rw, icon, color, display_order } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO home_features (title_en, title_rw, description_en, description_rw, icon, color, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title_en, title_rw, description_en, description_rw, icon, color, display_order || 0]
    );

    res.json({ success: true, message: 'Feature created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update feature
router.put('/features/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { title_en, title_rw, description_en, description_rw, icon, color, display_order, is_active } = req.body;
    
    await db.query(
      'UPDATE home_features SET title_en=?, title_rw=?, description_en=?, description_rw=?, icon=?, color=?, display_order=?, is_active=? WHERE id=?',
      [title_en, title_rw, description_en, description_rw, icon, color, display_order, is_active, req.params.id]
    );

    res.json({ success: true, message: 'Feature updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete feature
router.delete('/features/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM home_features WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Feature deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [testimonials] = await db.query('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY display_order');
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create testimonial
router.post('/testimonials', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { name, role, message_en, message_rw, avatar_url, rating, display_order } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO testimonials (name, role, message_en, message_rw, avatar_url, rating, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, role, message_en, message_rw, avatar_url, rating || 5, display_order || 0]
    );

    res.json({ success: true, message: 'Testimonial created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update testimonial
router.put('/testimonials/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { name, role, message_en, message_rw, avatar_url, rating, display_order, is_active } = req.body;
    
    await db.query(
      'UPDATE testimonials SET name=?, role=?, message_en=?, message_rw=?, avatar_url=?, rating=?, display_order=?, is_active=? WHERE id=?',
      [name, role, message_en, message_rw, avatar_url, rating, display_order, is_active, req.params.id]
    );

    res.json({ success: true, message: 'Testimonial updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete testimonial
router.delete('/testimonials/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get announcements
router.get('/announcements', async (req, res) => {
  try {
    const [announcements] = await db.query(
      'SELECT * FROM announcements WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 5'
    );
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create announcement
router.post('/announcements', authenticateToken, requireRole(['admin', 'headmaster', 'dos', 'dod']), async (req, res) => {
  try {
    const { title_en, title_rw, content_en, content_rw, type, priority, expires_at } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO announcements (title_en, title_rw, content_en, content_rw, type, priority, expires_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title_en, title_rw, content_en, content_rw, type || 'general', priority || 'normal', expires_at, req.user.id]
    );

    res.json({ success: true, message: 'Announcement created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update announcement
router.put('/announcements/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos', 'dod']), async (req, res) => {
  try {
    const { title_en, title_rw, content_en, content_rw, type, priority, expires_at, is_active } = req.body;
    
    await db.query(
      'UPDATE announcements SET title_en=?, title_rw=?, content_en=?, content_rw=?, type=?, priority=?, expires_at=?, is_active=? WHERE id=?',
      [title_en, title_rw, content_en, content_rw, type, priority, expires_at, is_active, req.params.id]
    );

    res.json({ success: true, message: 'Announcement updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete announcement
router.delete('/announcements/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.upload_type || 'general';
    cb(null, `uploads/${type}/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images allowed'));
  }
});

// Dashboard Stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "student")');
    const [teachers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "teacher")');
    const [courses] = await pool.execute('SELECT COUNT(*) as count FROM courses');
    const [news] = await pool.execute('SELECT COUNT(*) as count FROM news');
    const [tickets] = await pool.execute('SELECT COUNT(*) as count FROM support_tickets WHERE status != "closed"');
    
    res.json({
      success: true,
      stats: {
        totalUsers: users[0].count,
        students: students[0].count,
        teachers: teachers[0].count,
        courses: courses[0].count,
        news: news[0].count,
        openTickets: tickets[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== CAROUSEL/HERO SLIDES MANAGEMENT =====
router.get('/carousel', authenticateToken, async (req, res) => {
  try {
    const [slides] = await pool.execute('SELECT * FROM hero_slides ORDER BY display_order ASC');
    res.json({ success: true, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/carousel', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, button_text, button_link, display_order } = req.body;
    const image_url = req.file ? `/uploads/carousel/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO hero_slides (title, subtitle, image_url, button_text, button_link, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, true)
    `, [title, subtitle, image_url, button_text, button_link, display_order || 0]);
    
    res.json({ success: true, id: result.insertId, image_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/carousel/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, button_text, button_link, display_order, is_active } = req.body;
    let query = 'UPDATE hero_slides SET title = ?, subtitle = ?, button_text = ?, button_link = ?, display_order = ?, is_active = ?';
    const params = [title, subtitle, button_text, button_link, display_order, is_active];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/carousel/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/carousel/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM hero_slides WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== TRADES MANAGEMENT WITH IMAGES =====
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute('SELECT * FROM trades');
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/trades', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { trade_code, trade_name, description } = req.body;
    const image_url = req.file ? `/uploads/trades/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO trades (trade_code, trade_name, description, image_url, is_active)
      VALUES (?, ?, ?, ?, true)
    `, [trade_code, trade_name, description, image_url]);
    
    res.json({ success: true, id: result.insertId, image_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/trades/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { trade_name, description, is_active } = req.body;
    let query = 'UPDATE trades SET trade_name = ?, description = ?, is_active = ?';
    const params = [trade_name, description, is_active];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/trades/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== GALLERY MANAGEMENT =====
router.get('/gallery', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM gallery WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    const [images] = await pool.execute(query, params);
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/gallery', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const uploadedImages = [];
    
    for (const file of req.files) {
      const image_url = `/uploads/gallery/${file.filename}`;
      const [result] = await pool.execute(`
        INSERT INTO gallery (title, description, category, image_url, uploaded_by)
        VALUES (?, ?, ?, ?, ?)
      `, [title, description, category, image_url, req.user.id]);
      
      uploadedImages.push({ id: result.insertId, image_url });
    }
    
    res.json({ success: true, images: uploadedImages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/gallery/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== NEWS MANAGEMENT =====
router.get('/news', authenticateToken, async (req, res) => {
  try {
    const [news] = await pool.execute('SELECT * FROM news ORDER BY created_at DESC');
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/news', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const image_url = req.file ? `/uploads/news/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO news (title, content, image_url, category, author_id, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, true, NOW())
    `, [title, content, image_url, category, req.user.id]);
    
    res.json({ success: true, id: result.insertId, image_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/news/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, is_published } = req.body;
    let query = 'UPDATE news SET title = ?, content = ?, category = ?, is_published = ?';
    const params = [title, content, category, is_published];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/news/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
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

// ===== USER MANAGEMENT =====
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `
      SELECT u.*, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (role) {
      query += ' AND r.name = ?';
      params.push(role);
    }
    
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY u.created_at DESC';
    const [users] = await pool.execute(query, params);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/status', authenticateToken, async (req, res) => {
  try {
    const { is_active } = req.body;
    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== SYSTEM SETTINGS =====
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const [settings] = await pool.execute('SELECT * FROM system_settings');
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { key, value } = req.body;
    await pool.execute(`
      INSERT INTO system_settings (setting_key, setting_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE setting_value = ?
    `, [key, value, value]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

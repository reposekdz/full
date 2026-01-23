const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/system/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// GET all components
router.get('/components', async (req, res) => {
  try {
    const [components] = await pool.query('SELECT * FROM system_components WHERE is_active = true ORDER BY category, component_name');
    res.json(components);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET component by ID
router.get('/components/:id', async (req, res) => {
  try {
    const [components] = await pool.query('SELECT * FROM system_components WHERE id = ?', [req.params.id]);
    if (components.length === 0) return res.status(404).json({ error: 'Component not found' });
    
    const [images] = await pool.query('SELECT * FROM system_images WHERE component_name = ? AND is_active = true', [components[0].component_name]);
    const [content] = await pool.query('SELECT * FROM system_content WHERE component_name = ? AND is_active = true', [components[0].component_name]);
    
    res.json({ ...components[0], images, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create/update component
router.post('/components', async (req, res) => {
  try {
    const { component_name, display_name, category, description, config } = req.body;
    
    await pool.query(`
      INSERT INTO system_components (component_name, display_name, category, description, config)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE display_name = ?, category = ?, description = ?, config = ?
    `, [component_name, display_name, category, description, JSON.stringify(config), display_name, category, description, JSON.stringify(config)]);
    
    res.json({ message: 'Component saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all images
router.get('/images', async (req, res) => {
  try {
    const { component_name, category } = req.query;
    let query = 'SELECT * FROM system_images WHERE is_active = true';
    const params = [];
    
    if (component_name) {
      query += ' AND component_name = ?';
      params.push(component_name);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY component_name, image_key';
    
    const [images] = await pool.query(query, params);
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST upload image
router.post('/images', upload.single('image'), async (req, res) => {
  try {
    const { component_name, image_key, alt_text, description, category } = req.body;
    const image_url = req.file ? `/uploads/system/${req.file.filename}` : null;
    
    await pool.query(`
      INSERT INTO system_images (component_name, image_key, image_url, alt_text, description, category)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE image_url = ?, alt_text = ?, description = ?, category = ?
    `, [component_name, image_key, image_url, alt_text, description, category, image_url, alt_text, description, category]);
    
    res.json({ message: 'Image uploaded successfully', image_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE image
router.delete('/images/:id', async (req, res) => {
  try {
    await pool.query('UPDATE system_images SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all content
router.get('/content', async (req, res) => {
  try {
    const { component_name, category } = req.query;
    let query = 'SELECT * FROM system_content WHERE is_active = true';
    const params = [];
    
    if (component_name) {
      query += ' AND component_name = ?';
      params.push(component_name);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY component_name, content_key';
    
    const [content] = await pool.query(query, params);
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create/update content
router.post('/content', async (req, res) => {
  try {
    const { component_name, content_key, content_rw, content_en, content_type, category } = req.body;
    
    await pool.query(`
      INSERT INTO system_content (component_name, content_key, content_rw, content_en, content_type, category)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE content_rw = ?, content_en = ?, content_type = ?, category = ?
    `, [component_name, content_key, content_rw, content_en, content_type, category, content_rw, content_en, content_type, category]);
    
    res.json({ message: 'Content saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE content
router.delete('/content/:id', async (req, res) => {
  try {
    await pool.query('UPDATE system_content SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all settings
router.get('/settings', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM system_settings WHERE is_active = true';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY category, setting_key';
    
    const [settings] = await pool.query(query, params);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create/update setting
router.post('/settings', async (req, res) => {
  try {
    const { setting_key, setting_value, setting_type, category, description } = req.body;
    
    await pool.query(`
      INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE setting_value = ?, setting_type = ?, category = ?, description = ?
    `, [setting_key, setting_value, setting_type, category, description, setting_value, setting_type, category, description]);
    
    res.json({ message: 'Setting saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET update history
router.get('/history', async (req, res) => {
  try {
    const [history] = await pool.query('SELECT * FROM system_update_history ORDER BY created_at DESC LIMIT 100');
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST log update
router.post('/history', async (req, res) => {
  try {
    const { update_type, component_name, update_description, updated_by, old_value, new_value } = req.body;
    
    await pool.query(`
      INSERT INTO system_update_history (update_type, component_name, update_description, updated_by, old_value, new_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [update_type, component_name, update_description, updated_by, old_value, new_value]);
    
    res.json({ message: 'Update logged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

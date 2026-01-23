const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Configure multer for gallery uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/gallery';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `gallery-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

// Get all gallery images
router.get('/images', async (req, res) => {
  try {
    const [images] = await db.query(`
      SELECT * FROM gallery_images 
      WHERE is_active = true 
      ORDER BY sort_order ASC, created_at DESC
    `);
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get gallery stats
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN category = 'campus' THEN 1 ELSE 0 END) as campus,
        SUM(CASE WHEN category = 'classroom' THEN 1 ELSE 0 END) as classroom,
        SUM(CASE WHEN category = 'lab' THEN 1 ELSE 0 END) as lab,
        SUM(CASE WHEN category = 'sports' THEN 1 ELSE 0 END) as sports,
        SUM(CASE WHEN category = 'events' THEN 1 ELSE 0 END) as events
      FROM gallery_images WHERE is_active = true
    `);
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all images
router.get('/admin/images', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const [images] = await db.query('SELECT * FROM gallery_images ORDER BY created_at DESC');
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Upload image
router.post('/admin/upload', authenticateToken, requireRole(['admin', 'headmaster']), upload.single('image'), async (req, res) => {
  try {
    const { title, title_rw, description, description_rw, category, sort_order } = req.body;
    const image_url = `/uploads/gallery/${req.file.filename}`;
    
    const [result] = await db.query(
      'INSERT INTO gallery_images (title, title_rw, description, description_rw, category, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, title_rw, description, description_rw, category, image_url, sort_order || 0]
    );
    
    res.json({ success: true, id: result.insertId, image_url, message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update image
router.put('/admin/images/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { title, title_rw, description, description_rw, category, is_active, sort_order } = req.body;
    await db.query(
      'UPDATE gallery_images SET title=?, title_rw=?, description=?, description_rw=?, category=?, is_active=?, sort_order=? WHERE id=?',
      [title, title_rw, description, description_rw, category, is_active, sort_order, req.params.id]
    );
    res.json({ success: true, message: 'Image updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete image
router.delete('/admin/images/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const [image] = await db.query('SELECT image_url FROM gallery_images WHERE id=?', [req.params.id]);
    if (image[0]?.image_url) {
      const filePath = path.join(__dirname, '..', image[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query('DELETE FROM gallery_images WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

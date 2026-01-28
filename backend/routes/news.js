const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/news/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Get all news articles
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit = 50 } = req.query;
    let query = 'SELECT * FROM news_articles WHERE is_active = true';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (featured === 'true') {
      query += ' AND is_featured = true';
    }
    query += ' ORDER BY date_published DESC, created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [articles] = await db.execute(query, params);
    res.json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single news article
router.get('/:id', async (req, res) => {
  try {
    const [articles] = await db.execute(
      'SELECT * FROM news_articles WHERE id = ? AND is_active = true',
      [req.params.id]
    );
    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, article: articles[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new article
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, author, category, is_featured } = req.body;
    const image_url = req.file ? `/uploads/news/${req.file.filename}` : null;
    
    const [result] = await db.execute(
      `INSERT INTO news_articles (title, description, content, image_url, author, category, is_featured, date_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [title || 'Untitled', description || '', content || '', image_url, author || 'Admin', category || 'General', is_featured === 'true']
    );
    
    res.json({ success: true, id: result.insertId, message: 'Article created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update article
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, author, category, is_featured } = req.body;
    let query = 'UPDATE news_articles SET title = ?, description = ?, content = ?, author = ?, category = ?, is_featured = ?';
    const params = [title, description, content, author, category, is_featured === 'true'];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/news/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.execute(query, params);
    res.json({ success: true, message: 'Article updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete article (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('UPDATE news_articles SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track article view
router.post('/:id/view', async (req, res) => {
  try {
    await db.execute(
      'UPDATE news_articles SET views = COALESCE(views, 0) + 1 WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like article
router.post('/:id/like', async (req, res) => {
  try {
    await db.execute(
      'UPDATE news_articles SET likes = COALESCE(likes, 0) + 1 WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

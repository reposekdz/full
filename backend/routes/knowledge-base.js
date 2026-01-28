const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/knowledge'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get all articles with search and filter
router.get('/articles', async (req, res) => {
  try {
    const { search, category, tag } = req.query;
    let query = 'SELECT * FROM knowledge_articles WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }
    
    query += ' ORDER BY views DESC, created_at DESC';
    const [articles] = await pool.execute(query, params);
    res.json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single article
router.get('/articles/:id', async (req, res) => {
  try {
    const [articles] = await pool.execute('SELECT * FROM knowledge_articles WHERE id = ?', [req.params.id]);
    if (articles.length === 0) return res.status(404).json({ success: false, message: 'Article not found' });
    
    await pool.execute('UPDATE knowledge_articles SET views = views + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, article: articles[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create article
router.post('/articles', upload.single('attachment'), async (req, res) => {
  try {
    const { title, content, category, tags, author_id } = req.body;
    const attachment = req.file ? req.file.filename : null;
    
    const [result] = await pool.execute(
      'INSERT INTO knowledge_articles (title, content, category, tags, attachment, author_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title || 'Untitled', content || '', category || 'General', tags || '', attachment, author_id || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update article
router.put('/articles/:id', upload.single('attachment'), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const attachment = req.file ? req.file.filename : null;
    
    let query = 'UPDATE knowledge_articles SET title = ?, content = ?, category = ?, tags = ?';
    const params = [title, content, category, tags];
    
    if (attachment) {
      query += ', attachment = ?';
      params.push(attachment);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete article
router.delete('/articles/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM knowledge_articles WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT DISTINCT category, COUNT(*) as count FROM knowledge_articles GROUP BY category');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

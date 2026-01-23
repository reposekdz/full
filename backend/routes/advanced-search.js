const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Global search with advanced filtering
router.get('/global', async (req, res) => {
  try {
    const { q, type, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: [], message: 'Query too short' });
    }

    const searchTerm = `%${q}%`;
    const results = {};

    // Search students
    if (!type || type === 'students') {
      const [students] = await db.query(`
        SELECT id, serial_code, first_name, last_name, email, phone, location, 'student' as type
        FROM users 
        WHERE role_id = (SELECT id FROM roles WHERE name = 'student')
        AND (first_name LIKE ? OR last_name LIKE ? OR serial_code LIKE ? OR email LIKE ?)
        AND is_active = true
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]);
      results.students = students;
    }

    // Search teachers
    if (!type || type === 'teachers') {
      const [teachers] = await db.query(`
        SELECT id, username, email, phone, 'teacher' as type
        FROM users 
        WHERE role_id = (SELECT id FROM roles WHERE name = 'teacher')
        AND (username LIKE ? OR email LIKE ? OR phone LIKE ?)
        AND is_active = true
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, parseInt(limit)]);
      results.teachers = teachers;
    }

    // Search courses
    if (!type || type === 'courses') {
      const [courses] = await db.query(`
        SELECT id, name, code, description, 'course' as type
        FROM courses 
        WHERE (name LIKE ? OR code LIKE ? OR description LIKE ?)
        AND is_active = true
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, parseInt(limit)]);
      results.courses = courses;
    }

    // Search news
    if (!type || type === 'news') {
      const [news] = await db.query(`
        SELECT id, title, description, category, 'news' as type
        FROM news_articles 
        WHERE (title LIKE ? OR description LIKE ? OR content LIKE ?)
        AND is_active = true
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, parseInt(limit)]);
      results.news = news;
    }

    // Search gallery
    if (!type || type === 'gallery') {
      const [gallery] = await db.query(`
        SELECT id, title, title_rw, description, category, image_url, 'gallery' as type
        FROM gallery_images 
        WHERE (title LIKE ? OR title_rw LIKE ? OR description LIKE ?)
        AND is_active = true
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, parseInt(limit)]);
      results.gallery = gallery;
    }

    // Log search
    await db.query(
      'INSERT INTO search_logs (search_query, search_type, results_count, ip_address) VALUES (?, ?, ?, ?)',
      [q, type || 'global', Object.values(results).flat().length, req.ip]
    );

    res.json({ success: true, results, query: q, total: Object.values(results).flat().length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const searchTerm = `${q}%`;
    const [suggestions] = await db.query(`
      SELECT DISTINCT search_query, COUNT(*) as count
      FROM search_logs
      WHERE search_query LIKE ?
      GROUP BY search_query
      ORDER BY count DESC
      LIMIT 10
    `, [searchTerm]);

    res.json({ success: true, suggestions: suggestions.map(s => s.search_query) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Popular searches
router.get('/popular', async (req, res) => {
  try {
    const [popular] = await db.query(`
      SELECT search_query, COUNT(*) as count
      FROM search_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY search_query
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json({ success: true, popular });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Auto-suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const like = `%${q}%`;
    const suggestions = new Set();

    // Get trade names
    const [trades] = await pool.query(
      'SELECT name, name_rw FROM trades WHERE name LIKE ? OR name_rw LIKE ? LIMIT 5',
      [like, like]
    );
    trades.forEach(t => {
      if (t.name) suggestions.add(t.name);
      if (t.name_rw) suggestions.add(t.name_rw);
    });

    // Get course names
    const [courses] = await pool.query(
      'SELECT DISTINCT course_name FROM trade_courses WHERE course_name LIKE ? LIMIT 5',
      [like]
    );
    courses.forEach(c => suggestions.add(c.course_name));

    // Get common search terms
    const commonTerms = ['Level 3', 'Level 4', 'Level 5', 'Software', 'Building', 'Automotive', 'Construction'];
    commonTerms.forEach(term => {
      if (term.toLowerCase().includes(q.toLowerCase())) {
        suggestions.add(term);
      }
    });

    res.json({
      success: true,
      suggestions: Array.from(suggestions).slice(0, 10)
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Comprehensive search endpoint
router.get('/comprehensive', async (req, res) => {
  try {
    const { q, type, limit = 50 } = req.query;
    if (!q) {
      return res.json({ success: true, results: [] });
    }

    const like = `%${q}%`;
    const results = {
      trades: [],
      courses: [],
      students: [],
      teachers: [],
      news: []
    };

    // Search trades
    if (!type || type === 'all' || type === 'trade') {
      const [trades] = await pool.query(
        `SELECT * FROM trades 
         WHERE name LIKE ? OR name_rw LIKE ? OR description LIKE ? OR description_rw LIKE ? OR code LIKE ?
         LIMIT ?`,
        [like, like, like, like, like, parseInt(limit)]
      );
      results.trades = trades;
    }

    // Search courses
    if (!type || type === 'all' || type === 'course') {
      const [courses] = await pool.query(
        `SELECT tc.*, t.name as trade_name, t.code as trade_code
         FROM trade_courses tc
         LEFT JOIN trades t ON tc.trade_code = t.code
         WHERE tc.course_name LIKE ? OR tc.description LIKE ? OR tc.course_code LIKE ?
         LIMIT ?`,
        [like, like, like, parseInt(limit)]
      );
      results.courses = courses;
    }

    // Search students
    if (!type || type === 'all' || type === 'student') {
      try {
        const [students] = await pool.query(
          `SELECT s.*, t.name as trade_name 
           FROM students s
           LEFT JOIN trades t ON s.trade_code = t.code
           WHERE s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_code LIKE ?
           LIMIT ?`,
          [like, like, like, parseInt(limit)]
        );
        results.students = students;
      } catch (e) {
        results.students = [];
      }
    }

    // Search teachers
    if (!type || type === 'all' || type === 'teacher') {
      try {
        const [teachers] = await pool.query(
          `SELECT * FROM teachers 
           WHERE name LIKE ? OR email LIKE ? OR subject LIKE ?
           LIMIT ?`,
          [like, like, like, parseInt(limit)]
        );
        results.teachers = teachers;
      } catch (e) {
        results.teachers = [];
      }
    }

    // Search news
    if (!type || type === 'all' || type === 'news') {
      try {
        const [news] = await pool.query(
          `SELECT * FROM news_articles 
           WHERE title LIKE ? OR content LIKE ? OR category LIKE ?
           LIMIT ?`,
          [like, like, like, parseInt(limit)]
        );
        results.news = news;
      } catch (e) {
        results.news = [];
      }
    }

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    res.json({
      success: true,
      results,
      stats: {
        total: totalResults,
        trades: results.trades.length,
        courses: results.courses.length,
        students: results.students.length,
        teachers: results.teachers.length,
        news: results.news.length
      }
    });
  } catch (error) {
    console.error('Comprehensive search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Quick search (fast, limited results)
router.get('/quick', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, results: [] });
    }

    const like = `%${q}%`;
    const results = [];

    // Quick search across main entities
    const [trades] = await pool.query(
      'SELECT id, code, name, name_rw, "trade" as type FROM trades WHERE name LIKE ? OR name_rw LIKE ? OR code LIKE ? LIMIT 5',
      [like, like, like]
    );

    const [courses] = await pool.query(
      'SELECT id, course_code as code, course_name as name, trade_code, "course" as type FROM trade_courses WHERE course_name LIKE ? LIMIT 5',
      [like]
    );

    results.push(...trades, ...courses);

    res.json({
      success: true,
      results: results.slice(0, 10)
    });
  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { q } = req.query;
    const like = q ? `%${q}%` : '%';

    let results = [];

    switch (category.toLowerCase()) {
      case 'trades':
        const [trades] = await pool.query(
          'SELECT * FROM trades WHERE name LIKE ? OR name_rw LIKE ? OR code LIKE ?',
          [like, like, like]
        );
        results = trades;
        break;

      case 'courses':
        const [courses] = await pool.query(
          `SELECT tc.*, t.name as trade_name 
           FROM trade_courses tc
           LEFT JOIN trades t ON tc.trade_code = t.code
           WHERE tc.course_name LIKE ? OR tc.description LIKE ?`,
          [like, like]
        );
        results = courses;
        break;

      case 'students':
        const [students] = await pool.query(
          `SELECT s.*, t.name as trade_name 
           FROM students s
           LEFT JOIN trades t ON s.trade_code = t.code
           WHERE s.first_name LIKE ? OR s.last_name LIKE ?`,
          [like, like]
        );
        results = students;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    res.json({
      success: true,
      category,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Category search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Advanced search with filters
router.post('/advanced', async (req, res) => {
  try {
    const { query, filters = {}, sort = 'relevance', limit = 50 } = req.body;

    if (!query) {
      return res.json({ success: true, results: [] });
    }

    const like = `%${query}%`;
    let results = [];

    // Build dynamic query based on filters
    let whereConditions = [];
    let params = [];

    if (filters.type) {
      whereConditions.push('type = ?');
      params.push(filters.type);
    }

    if (filters.level) {
      whereConditions.push('level_number = ?');
      params.push(filters.level);
    }

    if (filters.trade_code) {
      whereConditions.push('trade_code = ?');
      params.push(filters.trade_code);
    }

    // Search with filters
    const [searchResults] = await pool.query(
      `SELECT * FROM (
        SELECT id, code, name, name_rw, description, 'trade' as type, NULL as level_number, code as trade_code FROM trades
        UNION ALL
        SELECT id, course_code as code, course_name as name, NULL as name_rw, description, 'course' as type, level_number, trade_code FROM trade_courses
      ) as combined
      WHERE (name LIKE ? OR name_rw LIKE ? OR description LIKE ? OR code LIKE ?)
      ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''}
      LIMIT ?`,
      [like, like, like, like, ...params, parseInt(limit)]
    );

    results = searchResults;

    // Apply sorting
    if (sort === 'name') {
      results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sort === 'recent') {
      results.reverse();
    }

    res.json({
      success: true,
      results,
      count: results.length,
      filters,
      sort
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

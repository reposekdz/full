const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get students with filters (trade, level, etc)
router.get('/students', async (req, res) => {
  try {
    const { trade_code, level_number, search, status = 'active', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    // Use simpler query - only select columns that exist
    let query = `
      SELECT id, student_id, first_name, last_name, gender, 
             level_number, trade_code, trade_name, 
             status, email, phone
      FROM global_student_sheets 
      WHERE 1=1
    `;
    const params = [];

    if (trade_code && trade_code !== 'all') {
      query += ' AND trade_code = ?';
      params.push(trade_code);
    }
    if (level_number && level_number !== 'all') {
      query += ' AND level_number = ?';
      params.push(parseInt(level_number));
    }
    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY last_name, first_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM global_student_sheets WHERE 1=1';
    const countParams = [];
    if (trade_code && trade_code !== 'all') {
      countQuery += ' AND trade_code = ?';
      countParams.push(trade_code);
    }
    if (level_number && level_number !== 'all') {
      countQuery += ' AND level_number = ?';
      countParams.push(parseInt(level_number));
    }
    
    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      students,
      total,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Comprehensive Search API - searches across all entities using basic columns
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;
    
    if (!q || q.length < 1) {
      return res.json({ success: true, results: {}, totalResults: 0 });
    }

    const searchTerm = `%${q}%`;
    const results = {};
    let totalResults = 0;

    // CRITICAL DATA EXCLUDED: Students, Parents, Staff are NOT searchable from header
    // These contain sensitive personal information and should only be accessed through authenticated dashboards

    // Search Trades
    if (type === 'all' || type === 'trades') {
      try {
        const [trades] = await pool.execute(
          `SELECT id, code as trade_code, name as trade_name, description, is_active
           FROM trades 
           WHERE name LIKE ? OR code LIKE ? OR description LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, parseInt(limit)]
        );
        results.trades = trades.map(t => ({ ...t, type: 'trade' }));
        totalResults += trades.length;
      } catch (e) {
        console.error('Trade search error:', e);
        results.trades = [];
      }
    }

    // Search News/Articles
    if (type === 'all' || type === 'news') {
      try {
        const [news] = await pool.execute(
          `SELECT id, title, description, category, is_active as status, created_at
           FROM news_articles 
           WHERE title LIKE ? OR description LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, parseInt(limit)]
        );
        results.news = news.map(n => ({ ...n, type: 'news' }));
        totalResults += news.length;
      } catch (e) {
        console.error('News search error:', e);
        results.news = [];
      }
    }

    // Search Events
    if (type === 'all' || type === 'events') {
      try {
        const [events] = await pool.execute(
          `SELECT id, title, event_date, location as venue, event_type, status
           FROM events 
           WHERE title LIKE ? OR location LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, parseInt(limit)]
        );
        results.events = events.map(e => ({ ...e, type: 'event' }));
        totalResults += events.length;
      } catch (e) {
        console.error('Event search error:', e);
        results.events = [];
      }
    }

    // Search Leadership
    if (type === 'all' || type === 'leadership') {
      try {
        const [leadership] = await pool.execute(
          `SELECT id, name, position, position_rw, phone, email, is_active
           FROM leadership 
           WHERE name LIKE ? OR position LIKE ? OR position_rw LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, parseInt(limit)]
        );
        results.leadership = leadership.map(l => ({ ...l, type: 'leadership' }));
        totalResults += leadership.length;
      } catch (e) {
        console.error('Leadership search error:', e);
        results.leadership = [];
      }
    }

    // CRITICAL DATA EXCLUDED: Payments contain sensitive financial information

    // Search Sports
    if (type === 'all' || type === 'sports') {
      try {
        const [sports] = await pool.execute(
          `SELECT id, name as sport_name, category, season, status
           FROM sports 
           WHERE name LIKE ? OR category LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, parseInt(limit)]
        );
        results.sports = sports.map(s => ({ ...s, type: 'sport' }));
        totalResults += sports.length;
      } catch (e) {
        console.error('Sports search error:', e);
        results.sports = [];
      }
    }

    // CRITICAL DATA EXCLUDED: Applications contain personal student information

    res.json({
      success: true,
      results,
      totalResults,
      query: q
    });
  } catch (error) {
    console.error('Comprehensive search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 1) {
      return res.json({ success: true, suggestions: [] });
    }

    const searchTerm = `%${q}%`;
    const suggestions = [];

    // CRITICAL DATA EXCLUDED: No student or staff suggestions in public search

    // Get trade suggestions
    try {
      const [trades] = await pool.execute(
        `SELECT CONCAT(name, ' (', code, ')') as label, 'trade' as type
         FROM trades 
         WHERE name LIKE ? OR code LIKE ?
         LIMIT 5`,
        [searchTerm, searchTerm]
      );
      suggestions.push(...trades);
    } catch (e) {}

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get popular searches
router.get('/popular', async (req, res) => {
  try {
    // Return safe popular searches - no critical data
    const popular = [
      { search_query: 'sports', count: 100 },
      { search_query: 'trades', count: 90 },
      { search_query: 'leadership', count: 70 },
      { search_query: 'news', count: 60 },
      { search_query: 'events', count: 50 }
    ];
    
    res.json({ success: true, popular });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

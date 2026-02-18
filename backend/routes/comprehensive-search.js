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

    // Search Students - using basic columns
    if (type === 'all' || type === 'students') {
      try {
        const [students] = await pool.execute(
          `SELECT id, student_id, first_name, last_name, gender, level_number, trade_code, trade_name, status, email, phone
           FROM global_student_sheets 
           WHERE first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ? OR email LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
        );
        results.students = students.map(s => ({ ...s, type: 'student' }));
        totalResults += students.length;
      } catch (e) {
        console.error('Student search error:', e);
        results.students = [];
      }
    }

    // Search Parents - using parent_connections table
    if (type === 'all' || type === 'parents') {
      try {
        const [parents] = await pool.execute(
          `SELECT id, student_id, parent_name, parent_phone, phone, relationship, status
           FROM parent_connections 
           WHERE parent_name LIKE ? OR parent_phone LIKE ? OR phone LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, parseInt(limit)]
        );
        results.parents = parents.map(p => ({ ...p, type: 'parent' }));
        totalResults += parents.length;
      } catch (e) {
        console.error('Parent search error:', e);
        results.parents = [];
      }
    }

    // Search Staff/Teachers - using users table
    if (type === 'all' || type === 'staff') {
      try {
        const [staff] = await pool.execute(
          `SELECT id, username, first_name, last_name, email, phone, role, status
           FROM users 
           WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
        );
        results.staff = staff.map(s => ({ ...s, type: 'staff' }));
        totalResults += staff.length;
      } catch (e) {
        console.error('Staff search error:', e);
        results.staff = [];
      }
    }

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
          `SELECT id, title, summary, category, status, created_at
           FROM news 
           WHERE title LIKE ? OR summary LIKE ?
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
          `SELECT id, name, title as position, title_rw, phone, email, is_active
           FROM leadership 
           WHERE name LIKE ? OR title LIKE ? OR title_rw LIKE ?
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

    // Search Payments (using student_fees or other payment tables)
    if (type === 'all' || type === 'payments') {
      try {
        const [payments] = await pool.execute(
          `SELECT id, reference_no as reference_number, student_name, amount, payment_method, status, payment_date
           FROM student_fees 
           WHERE reference_no LIKE ? OR student_name LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, parseInt(limit)]
        );
        results.payments = payments.map(p => ({ ...p, type: 'payment' }));
        totalResults += payments.length;
      } catch (e) {
        console.error('Payment search error:', e);
        results.payments = [];
      }
    }

    // Search Sports
    if (type === 'all' || type === 'sports') {
      try {
        const [sports] = await pool.execute(
          `SELECT id, sport_name, category, season, status
           FROM sports 
           WHERE sport_name LIKE ? OR category LIKE ?
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

    // Search Applications
    if (type === 'all' || type === 'applications') {
      try {
        const [applications] = await pool.execute(
          `SELECT id, application_no as application_number, first_name, last_name, trade_applied as desired_trade, status, application_date
           FROM student_applications 
           WHERE first_name LIKE ? OR last_name LIKE ? OR application_no LIKE ?
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, parseInt(limit)]
        );
        results.applications = applications.map(a => ({ ...a, type: 'application' }));
        totalResults += applications.length;
      } catch (e) {
        console.error('Application search error:', e);
        results.applications = [];
      }
    }

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

    // Get student suggestions
    try {
      const [students] = await pool.execute(
        `SELECT CONCAT(first_name, ' ', last_name, ' - ', student_id) as label, 'student' as type
         FROM global_student_sheets 
         WHERE first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ?
         LIMIT 5`,
        [searchTerm, searchTerm, searchTerm]
      );
      suggestions.push(...students);
    } catch (e) {}

    // Get staff suggestions
    try {
      const [staff] = await pool.execute(
        `SELECT CONCAT(first_name, ' ', last_name, ' - ', role) as label, 'staff' as type
         FROM users 
         WHERE first_name LIKE ? OR last_name LIKE ?
         LIMIT 5`,
        [searchTerm, searchTerm]
      );
      suggestions.push(...staff);
    } catch (e) {}

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
    // Return some default popular searches
    const popular = [
      { search_query: 'student', count: 100 },
      { search_query: 'payment', count: 80 },
      { search_query: 'grade', count: 60 },
      { search_query: 'attendance', count: 50 },
      { search_query: 'exam', count: 40 }
    ];
    
    res.json({ success: true, popular });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

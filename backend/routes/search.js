const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Global search endpoint
router.get('/global', async (req, res) => {
  try {
    const { q, type, sort = 'relevance', limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: [], total: 0 });
    }

    const searchTerm = `%${q.trim()}%`;
    const results = [];

    // Search in different tables based on type filter
    const searchTypes = type ? [type] : ['courses', 'trades', 'news', 'sports', 'leadership', 'gallery'];

    for (const searchType of searchTypes) {
      let query, params;

      switch (searchType) {
        case 'courses':
          query = `SELECT id, name as title, description, 'course' as type, created_at 
                   FROM courses WHERE name LIKE ? OR description LIKE ? LIMIT ?`;
          params = [searchTerm, searchTerm, parseInt(limit)];
          break;

        case 'trades':
          query = `SELECT id, name as title, description, image_url, 'trade' as type, created_at 
                   FROM trades WHERE name LIKE ? OR description LIKE ? LIMIT ?`;
          params = [searchTerm, searchTerm, parseInt(limit)];
          break;

        case 'news':
          query = `SELECT id, title, content as description, image_url, category, views, 'news' as type, created_at 
                   FROM news_articles WHERE title LIKE ? OR content LIKE ? LIMIT ?`;
          params = [searchTerm, searchTerm, parseInt(limit)];
          break;

        case 'sports':
          query = `SELECT id, name as title, description, image_url, 'sport' as type, created_at 
                   FROM sports WHERE name LIKE ? OR description LIKE ? LIMIT ?`;
          params = [searchTerm, searchTerm, parseInt(limit)];
          break;

        case 'leadership':
          query = `SELECT id, name as title, role, department as description, image_url, email, phone, 'leader' as type, created_at 
                   FROM leadership WHERE name LIKE ? OR role LIKE ? OR department LIKE ? LIMIT ?`;
          params = [searchTerm, searchTerm, searchTerm, parseInt(limit)];
          break;

        case 'gallery':
          query = `SELECT id, title, description, image_url, category, 'gallery' as type, created_at 
                   FROM gallery WHERE title LIKE ? OR description LIKE ? LIMIT ?`;
          params = [searchTerm, searchTerm, parseInt(limit)];
          break;
      }

      if (query) {
        const [rows] = await db.execute(query, params);
        results.push(...rows);
      }
    }

    // Sort results
    if (sort === 'date') {
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'name') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Track search
    await db.execute(
      'INSERT INTO search_history (query, results_count, created_at) VALUES (?, ?, NOW())',
      [q, results.length]
    ).catch(() => {});

    res.json({
      success: true,
      results: results.slice(0, parseInt(limit)),
      total: results.length,
      query: q
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// Get trending searches
router.get('/trending', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT query, COUNT(*) as count 
      FROM search_history 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY query 
      ORDER BY count DESC 
      LIMIT 10
    `);
    res.json({ success: true, trending: rows });
  } catch (error) {
    res.json({ success: true, trending: [] });
  }
});

// Get search history
router.get('/history', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DISTINCT query, MAX(created_at) as last_searched 
      FROM search_history 
      GROUP BY query 
      ORDER BY last_searched DESC 
      LIMIT 10
    `);
    res.json({ success: true, history: rows });
  } catch (error) {
    res.json({ success: true, history: [] });
  }
});

// Quick search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const searchTerm = `${q}%`;
    const suggestions = [];

    // Get suggestions from different sources
    const [courses] = await db.execute(
      'SELECT DISTINCT name FROM courses WHERE name LIKE ? LIMIT 3',
      [searchTerm]
    );
    const [trades] = await db.execute(
      'SELECT DISTINCT name FROM trades WHERE name LIKE ? LIMIT 3',
      [searchTerm]
    );
    const [news] = await db.execute(
      'SELECT DISTINCT title as name FROM news_articles WHERE title LIKE ? LIMIT 3',
      [searchTerm]
    );

    suggestions.push(...courses.map(c => c.name));
    suggestions.push(...trades.map(t => t.name));
    suggestions.push(...news.map(n => n.name));

    res.json({ success: true, suggestions: [...new Set(suggestions)].slice(0, 8) });
  } catch (error) {
    res.json({ success: true, suggestions: [] });
  }
});

// Search analytics
router.get('/analytics', async (req, res) => {
  try {
    const [totalSearches] = await db.execute(
      'SELECT COUNT(*) as count FROM search_history WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    const [topQueries] = await db.execute(`
      SELECT query, COUNT(*) as count 
      FROM search_history 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY query 
      ORDER BY count DESC 
      LIMIT 5
    `);
    const [noResults] = await db.execute(
      'SELECT COUNT(*) as count FROM search_history WHERE results_count = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    res.json({
      success: true,
      analytics: {
        totalSearches: totalSearches[0].count,
        topQueries: topQueries,
        noResultsCount: noResults[0].count
      }
    });
  } catch (error) {
    res.json({ success: true, analytics: { totalSearches: 0, topQueries: [], noResultsCount: 0 } });
  }
});

module.exports = router;
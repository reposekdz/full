const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get popular/trending searches
router.get('/popular', async (req, res) => {
  try {
    const popularSearches = [
      { id: 1, term: 'Software Development', count: 245, category: 'trades' },
      { id: 2, term: 'Automotive', count: 189, category: 'trades' },
      { id: 3, term: 'Football Team', count: 156, category: 'sports' },
      { id: 4, term: 'School News', count: 134, category: 'news' },
      { id: 5, term: 'Electrical', count: 98, category: 'trades' }
    ];
    
    res.json({ success: true, data: popularSearches });
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch popular searches' });
  }
});

// Global search endpoint
router.get('/', async (req, res) => {
  try {
    const { q, type, sort } = req.query;
    
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const results = [];
    const searchTerm = `%${q}%`;

    // Search trades
    if (!type || type === 'trades') {
      const [trades] = await db.query(
        'SELECT trade_code as id, trade_name as title, "trades" as type, description FROM trades WHERE trade_name LIKE ? LIMIT 5',
        [searchTerm]
      );
      results.push(...trades);
    }

    // Search news
    if (!type || type === 'news') {
      const [news] = await db.query(
        'SELECT id, title, "news" as type, category FROM news_articles WHERE title LIKE ? LIMIT 5',
        [searchTerm]
      );
      results.push(...news);
    }

    // Search sports
    if (!type || type === 'sports') {
      const [sports] = await db.query(
        'SELECT id, team_name as title, "sports" as type, sport_type FROM sports_teams WHERE team_name LIKE ? LIMIT 5',
        [searchTerm]
      );
      results.push(...sports);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

module.exports = router;

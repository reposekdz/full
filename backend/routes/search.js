const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Global search endpoint (public - excludes sensitive data)
router.get('/', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: {}, totalResults: 0 });
    }

    const searchTerm = `%${q}%`;
    const results = {
      courses: [],
      assignments: [],
      exams: [],
      trades: [],
      sports: [],
      notifications: [],
      news: [],
      gallery: []
    };

    // Search courses
    if (!type || type === 'courses') {
      const [courses] = await db.query(
        `SELECT id, code, name, description, 'course' as type 
         FROM trade_courses WHERE name LIKE ? OR code LIKE ? OR description LIKE ? 
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.courses = courses;
    }

    // Search assignments (public ones only)
    if (!type || type === 'assignments') {
      const [assignments] = await db.query(
        `SELECT id, title, description, due_date, 'assignment' as type 
         FROM assignments WHERE is_published = true AND (title LIKE ? OR description LIKE ?) 
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.assignments = assignments;
    }

    // Search exams
    if (!type || type === 'exams') {
      const [exams] = await db.query(
        `SELECT id, title, exam_date, exam_type, 'exam' as type 
         FROM exams WHERE title LIKE ? OR exam_type LIKE ? 
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.exams = exams;
    }

    // Search trades
    if (!type || type === 'trades') {
      const [trades] = await db.query(
        `SELECT id, code, name_rw, name_en, description_rw, description_en, 'trade' as type 
         FROM trades WHERE name_rw LIKE ? OR name_en LIKE ? OR code LIKE ? OR description_rw LIKE ? OR description_en LIKE ?
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.trades = trades;
    }

    // Search sports teams
    if (!type || type === 'sports') {
      const [sports] = await db.query(
        `SELECT id, name, sport_type, coach, 'sport' as type 
         FROM teams WHERE name LIKE ? OR sport_type LIKE ? OR coach LIKE ? 
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.sports = sports;
    }

    // Search notifications (public ones only)
    if (!type || type === 'notifications') {
      const [notifications] = await db.query(
        `SELECT id, title, message, type, created_at, 'notification' as type 
         FROM notifications WHERE is_public = true AND (title LIKE ? OR message LIKE ?) 
         ORDER BY created_at DESC LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.notifications = notifications;
    }

    // Search news articles
    if (!type || type === 'news') {
      try {
        const [news] = await db.query(
          `SELECT id, title, description, category, created_at, 'news' as type 
           FROM news_articles WHERE (title LIKE ? OR description LIKE ? OR content LIKE ?) AND is_active = true
           ORDER BY created_at DESC LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, parseInt(limit)]
        );
        results.news = news;
      } catch (err) {
        console.log('News table not available');
      }
    }

    // Search gallery
    if (!type || type === 'gallery') {
      try {
        const [gallery] = await db.query(
          `SELECT id, title, title_rw, description, category, image_url, 'gallery' as type 
           FROM gallery_images WHERE (title LIKE ? OR title_rw LIKE ? OR description LIKE ?) AND is_active = true
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, parseInt(limit)]
        );
        results.gallery = gallery;
      } catch (err) {
        console.log('Gallery table not available');
      }
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    // Log search for analytics
    try {
      await db.query(
        'INSERT INTO search_logs (search_query, search_type, results_count, ip_address) VALUES (?, ?, ?, ?)',
        [q, type || 'all', totalResults, req.ip]
      );
    } catch (err) {
      console.log('Search logging not available');
    }

    res.json({
      success: true,
      query: q,
      totalResults,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

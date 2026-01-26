const express = require('express');
const router = express.Router();
const db = require('../config/database');

// UNIFIED DASHBOARD - All systems integrated
router.get('/dashboard/unified', async (req, res) => {
  try {
    const [stats] = await db.pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE status = 'active') as total_students,
        (SELECT COUNT(*) FROM staff WHERE status = 'active') as total_staff,
        (SELECT COUNT(*) FROM trades) as total_trades,
        (SELECT COUNT(*) FROM sports) as total_sports,
        (SELECT COUNT(*) FROM news_articles WHERE status = 'published') as total_news,
        (SELECT COUNT(*) FROM support_tickets WHERE status != 'closed') as open_tickets,
        (SELECT COUNT(*) FROM admissions WHERE status = 'pending') as pending_admissions,
        (SELECT SUM(amount) FROM payments WHERE status = 'completed' AND DATE(created_at) = CURDATE()) as today_revenue
    `);
    
    const [recentActivities] = await db.pool.query(`
      (SELECT 'news' as type, title as name, created_at FROM news_articles ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'admission' as type, CONCAT(first_name, ' ', last_name) as name, created_at FROM admissions ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'ticket' as type, subject as name, created_at FROM support_tickets ORDER BY created_at DESC LIMIT 5)
      ORDER BY created_at DESC LIMIT 15
    `);

    res.json({ success: true, stats: stats[0], recentActivities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SEARCH INTEGRATION - Global search across all modules
router.get('/search/global', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    const results = { trades: [], sports: [], news: [], staff: [], students: [], courses: [] };

    if (!type || type === 'trades') {
      const [trades] = await db.pool.query(`
        SELECT id, title, title_rw, description, image, 'trade' as type 
        FROM trades WHERE title LIKE ? OR description LIKE ? LIMIT ?
      `, [`%${q}%`, `%${q}%`, parseInt(limit)]);
      results.trades = trades;
    }

    if (!type || type === 'sports') {
      const [sports] = await db.pool.query(`
        SELECT id, name, name_rw, description, image, 'sport' as type 
        FROM sports WHERE name LIKE ? OR description LIKE ? LIMIT ?
      `, [`%${q}%`, `%${q}%`, parseInt(limit)]);
      results.sports = sports;
    }

    if (!type || type === 'news') {
      const [news] = await db.pool.query(`
        SELECT id, title, excerpt, featured_image, 'news' as type 
        FROM news_articles WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ?) LIMIT ?
      `, [`%${q}%`, `%${q}%`, parseInt(limit)]);
      results.news = news;
    }

    if (!type || type === 'staff') {
      const [staff] = await db.pool.query(`
        SELECT id, name, email, role, image, 'staff' as type 
        FROM staff WHERE status = 'active' AND (name LIKE ? OR email LIKE ?) LIMIT ?
      `, [`%${q}%`, `%${q}%`, parseInt(limit)]);
      results.staff = staff;
    }

    res.json({ success: true, results, total: Object.values(results).flat().length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ANALYTICS INTEGRATION - Cross-module analytics
router.get('/analytics/comprehensive', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const [enrollment] = await db.pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) 
      GROUP BY DATE(created_at) ORDER BY date
    `, [period]);

    const [revenue] = await db.pool.query(`
      SELECT DATE(created_at) as date, SUM(amount) as total 
      FROM payments WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) 
      GROUP BY DATE(created_at) ORDER BY date
    `, [period]);

    const [attendance] = await db.pool.query(`
      SELECT DATE(date) as date, 
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
      FROM attendance WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY) 
      GROUP BY DATE(date) ORDER BY date
    `, [period]);

    const [performance] = await db.pool.query(`
      SELECT t.name as trade, AVG(g.score) as avg_score 
      FROM grades g 
      JOIN students s ON g.student_id = s.id 
      JOIN trades t ON s.trade_id = t.id 
      WHERE g.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) 
      GROUP BY t.id, t.name
    `, [period]);

    res.json({ success: true, analytics: { enrollment, revenue, attendance, performance } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NOTIFICATION INTEGRATION - Unified notifications
router.get('/notifications/unified', async (req, res) => {
  try {
    const { user_id, role, unread_only } = req.query;
    
    let query = `
      SELECT n.*, u.name as sender_name 
      FROM notifications n 
      LEFT JOIN users u ON n.sender_id = u.id 
      WHERE n.recipient_id = ?
    `;
    const params = [user_id];

    if (role) {
      query += ' OR n.recipient_role = ?';
      params.push(role);
    }

    if (unread_only === 'true') {
      query += ' AND n.read_status = 0';
    }

    query += ' ORDER BY n.created_at DESC LIMIT 50';

    const [notifications] = await db.pool.query(query, params);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CONTENT INTEGRATION - Unified content management
router.get('/content/unified', async (req, res) => {
  try {
    const [hero] = await db.pool.query('SELECT * FROM hero_sections WHERE active = 1 ORDER BY display_order');
    const [news] = await db.pool.query('SELECT * FROM news_articles WHERE status = "published" ORDER BY created_at DESC LIMIT 6');
    const [trades] = await db.pool.query('SELECT * FROM trades WHERE status = "active" ORDER BY display_order');
    const [sports] = await db.pool.query('SELECT * FROM sports WHERE active = 1 ORDER BY name');
    const [services] = await db.pool.query('SELECT * FROM services WHERE active = 1 ORDER BY display_order');
    const [leadership] = await db.pool.query('SELECT * FROM leadership WHERE active = 1 ORDER BY display_order');
    const [gallery] = await db.pool.query('SELECT * FROM gallery WHERE active = 1 ORDER BY created_at DESC LIMIT 12');

    res.json({ success: true, content: { hero, news, trades, sports, services, leadership, gallery } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// USER ACTIVITY TRACKING
router.post('/activity/track', async (req, res) => {
  try {
    const { user_id, action, module, details } = req.body;
    
    await db.pool.query(`
      INSERT INTO user_activities (user_id, action, module, details, ip_address, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [user_id, action, module, JSON.stringify(details), req.ip]);

    res.json({ success: true, message: 'Activity tracked' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// QUICK ACTIONS - Common operations across modules
router.post('/quick-actions/execute', async (req, res) => {
  try {
    const { action, data } = req.body;

    switch (action) {
      case 'send_notification':
        await db.pool.query(`
          INSERT INTO notifications (recipient_id, title, message, type, created_at) 
          VALUES (?, ?, ?, ?, NOW())
        `, [data.recipient_id, data.title, data.message, data.type]);
        break;

      case 'create_announcement':
        await db.pool.query(`
          INSERT INTO announcements (title, content, target_role, priority, created_at) 
          VALUES (?, ?, ?, ?, NOW())
        `, [data.title, data.content, data.target_role, data.priority]);
        break;

      case 'schedule_event':
        await db.pool.query(`
          INSERT INTO events (title, description, start_date, end_date, location, created_at) 
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [data.title, data.description, data.start_date, data.end_date, data.location]);
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    res.json({ success: true, message: 'Action executed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// REPORTS INTEGRATION - Generate comprehensive reports
router.get('/reports/generate', async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;

    let report = {};

    if (type === 'academic') {
      const [grades] = await db.pool.query(`
        SELECT t.name as trade, AVG(g.score) as avg_score, COUNT(DISTINCT g.student_id) as student_count
        FROM grades g
        JOIN students s ON g.student_id = s.id
        JOIN trades t ON s.trade_id = t.id
        WHERE g.created_at BETWEEN ? AND ?
        GROUP BY t.id, t.name
      `, [start_date, end_date]);
      report.grades = grades;
    }

    if (type === 'financial') {
      const [payments] = await db.pool.query(`
        SELECT DATE(created_at) as date, SUM(amount) as total, COUNT(*) as count
        FROM payments
        WHERE status = 'completed' AND created_at BETWEEN ? AND ?
        GROUP BY DATE(created_at)
      `, [start_date, end_date]);
      report.payments = payments;
    }

    if (type === 'attendance') {
      const [attendance] = await db.pool.query(`
        SELECT DATE(date) as date,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
        FROM attendance
        WHERE date BETWEEN ? AND ?
        GROUP BY DATE(date)
      `, [start_date, end_date]);
      report.attendance = attendance;
    }

    res.json({ success: true, report, generated_at: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SYSTEM HEALTH CHECK
router.get('/system/health', async (req, res) => {
  try {
    const [dbStatus] = await db.pool.query('SELECT 1 as status');
    const [tables] = await db.pool.query('SHOW TABLES');
    
    const health = {
      database: dbStatus.length > 0 ? 'healthy' : 'unhealthy',
      tables_count: tables.length,
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    res.json({ success: true, health });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Shortcut endpoints for testing
router.get('/search', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    const results = { trades: [], sports: [], news: [], staff: [] };

    if (!type || type === 'trades') {
      const [trades] = await db.pool.query(`
        SELECT id, name, code, description, 'trade' as type 
        FROM trades WHERE name LIKE ? OR description LIKE ? LIMIT ?
      `, [`%${q}%`, `%${q}%`, parseInt(limit)]);
      results.trades = trades;
    }

    if (!type || type === 'sports') {
      const [sports] = await db.pool.query(`
        SELECT id, name, description, 'sport' as type 
        FROM sports WHERE name LIKE ? OR description LIKE ? LIMIT ?
      `, [`%${q}%`, `%${q}%`, parseInt(limit)]);
      results.sports = sports;
    }

    res.json({ success: true, results, total: Object.values(results).flat().length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    res.json({ success: true, analytics: { message: 'Analytics endpoint working' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    res.json({ success: true, notifications: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

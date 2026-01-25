const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all trades with courses and classes
router.get('/all', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT t.*, 
        COUNT(DISTINCT tc.id) as course_count,
        COUNT(DISTINCT ti.id) as instructor_count,
        SUM(tc.credits) as total_credits
      FROM trades t
      LEFT JOIN trade_courses tc ON t.id = tc.trade_id AND tc.is_active = true
      LEFT JOIN trade_instructors ti ON t.id = ti.trade_id AND ti.is_active = true
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.code
    `);

    for (let trade of trades) {
      const [courses] = await pool.query(`
        SELECT * FROM trade_courses 
        WHERE trade_id = ? AND is_active = true 
        ORDER BY code
      `, [trade.id]);

      const [classes] = await pool.query(`
        SELECT c.*, co.name as course_name, co.code as course_code
        FROM classes c
        LEFT JOIN courses co ON c.course_id = co.id
        WHERE c.is_active = true
        ORDER BY c.name
      `);

      trade.courses = courses;
      trade.classes = classes;
    }

    res.json({ success: true, trades, total: trades.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single trade with all details
router.get('/:code', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT t.*,
        COUNT(DISTINCT tc.id) as course_count,
        COUNT(DISTINCT ti.id) as instructor_count,
        SUM(tc.credits) as total_credits
      FROM trades t
      LEFT JOIN trade_courses tc ON t.id = tc.trade_id AND tc.is_active = true
      LEFT JOIN trade_instructors ti ON t.id = ti.trade_id AND ti.is_active = true
      WHERE t.code = ? AND t.is_active = true
      GROUP BY t.id
    `, [req.params.code.toUpperCase()]);

    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const trade = trades[0];

    const [courses] = await pool.query(`
      SELECT * FROM trade_courses 
      WHERE trade_id = ? AND is_active = true 
      ORDER BY code
    `, [trade.id]);

    const [instructors] = await pool.query(`
      SELECT * FROM trade_instructors 
      WHERE trade_id = ? AND is_active = true 
      ORDER BY name
    `, [trade.id]);

    const [classes] = await pool.query(`
      SELECT c.*, co.name as course_name, co.code as course_code
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE c.is_active = true
      ORDER BY c.name
    `);

    res.json({
      success: true,
      trade,
      courses,
      instructors,
      classes,
      statistics: {
        totalCourses: courses.length,
        totalInstructors: instructors.length,
        totalClasses: classes.length,
        totalCredits: trade.total_credits || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get courses for a trade
router.get('/:code/courses', async (req, res) => {
  try {
    const [trades] = await pool.query('SELECT id FROM trades WHERE code = ? AND is_active = true', [req.params.code.toUpperCase()]);
    
    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const [courses] = await pool.query(`
      SELECT * FROM trade_courses 
      WHERE trade_id = ? AND is_active = true 
      ORDER BY code
    `, [trades[0].id]);

    res.json({ success: true, courses, total: courses.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get classes for a trade
router.get('/:code/classes', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.*, co.name as course_name, co.code as course_code
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE c.is_active = true
      ORDER BY c.name
    `);

    res.json({ success: true, classes, total: classes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get instructors for a trade
router.get('/:code/instructors', async (req, res) => {
  try {
    const [trades] = await pool.query('SELECT id FROM trades WHERE code = ? AND is_active = true', [req.params.code.toUpperCase()]);
    
    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const [instructors] = await pool.query(`
      SELECT * FROM trade_instructors 
      WHERE trade_id = ? AND is_active = true 
      ORDER BY name
    `, [trades[0].id]);

    res.json({ success: true, instructors, total: instructors.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search across trades, courses, and classes
router.get('/search/query', async (req, res) => {
  try {
    const { q, type } = req.query;
    const searchTerm = `%${q}%`;

    let results = { trades: [], courses: [], classes: [] };

    if (!type || type === 'trades') {
      const [trades] = await pool.query(`
        SELECT * FROM trades 
        WHERE (name LIKE ? OR name_rw LIKE ? OR code LIKE ? OR description LIKE ?) 
        AND is_active = true
        LIMIT 10
      `, [searchTerm, searchTerm, searchTerm, searchTerm]);
      results.trades = trades;
    }

    if (!type || type === 'courses') {
      const [courses] = await pool.query(`
        SELECT tc.*, t.code as trade_code, t.name as trade_name
        FROM trade_courses tc
        LEFT JOIN trades t ON tc.trade_id = t.id
        WHERE (tc.name LIKE ? OR tc.name_rw LIKE ? OR tc.code LIKE ?) 
        AND tc.is_active = true
        LIMIT 10
      `, [searchTerm, searchTerm, searchTerm]);
      results.courses = courses;
    }

    if (!type || type === 'classes') {
      const [classes] = await pool.query(`
        SELECT c.*, co.name as course_name, co.code as course_code
        FROM classes c
        LEFT JOIN courses co ON c.course_id = co.id
        WHERE (c.name LIKE ? OR co.name LIKE ?) 
        AND c.is_active = true
        LIMIT 10
      `, [searchTerm, searchTerm]);
      results.classes = classes;
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get comprehensive statistics
router.get('/statistics/all', async (req, res) => {
  try {
    const [tradeStats] = await pool.query('SELECT COUNT(*) as total FROM trades WHERE is_active = true');
    const [courseStats] = await pool.query('SELECT COUNT(*) as total, SUM(credits) as total_credits FROM trade_courses WHERE is_active = true');
    const [classStats] = await pool.query('SELECT COUNT(*) as total FROM classes WHERE is_active = true');
    const [instructorStats] = await pool.query('SELECT COUNT(*) as total FROM trade_instructors WHERE is_active = true');

    const [byLevel] = await pool.query(`
      SELECT 
        SUBSTRING(code, 2, 1) as level,
        COUNT(*) as trade_count
      FROM trades 
      WHERE is_active = true
      GROUP BY level
    `);

    res.json({
      success: true,
      statistics: {
        totalTrades: tradeStats[0].total,
        totalCourses: courseStats[0].total,
        totalClasses: classStats[0].total,
        totalInstructors: instructorStats[0].total,
        totalCredits: courseStats[0].total_credits || 0,
        byLevel
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create trade
router.post('/create', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { code, name, name_rw, description, description_rw, duration_years } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO trades (code, name, name_rw, description, description_rw, duration_years) VALUES (?, ?, ?, ?, ?, ?)',
      [code.toUpperCase(), name, name_rw, description, description_rw, duration_years]
    );

    res.json({ success: true, message: 'Trade created', tradeId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add course to trade
router.post('/:code/courses', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [trades] = await pool.query('SELECT id FROM trades WHERE code = ? AND is_active = true', [req.params.code.toUpperCase()]);
    
    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const { code, name, name_rw, credits } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO trade_courses (trade_id, code, name, name_rw, credits) VALUES (?, ?, ?, ?, ?)',
      [trades[0].id, code, name, name_rw, credits]
    );

    res.json({ success: true, message: 'Course added', courseId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update trade
router.put('/:code', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, name_rw, description, description_rw, duration_years } = req.body;
    
    await pool.query(
      'UPDATE trades SET name=?, name_rw=?, description=?, description_rw=?, duration_years=? WHERE code=?',
      [name, name_rw, description, description_rw, duration_years, req.params.code.toUpperCase()]
    );

    res.json({ success: true, message: 'Trade updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

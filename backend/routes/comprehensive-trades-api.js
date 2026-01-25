const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all trades with full statistics
router.get('/all', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT t.*, 
        COUNT(DISTINCT ti.id) as instructor_count,
        COUNT(DISTINCT tc.id) as course_count,
        COALESCE(SUM(tc.credits), 0) as total_credits,
        COALESCE(SUM(tc.hours), 0) as total_hours
      FROM trades t
      LEFT JOIN trade_instructors ti ON t.id = ti.trade_id AND ti.is_active = true
      LEFT JOIN trade_courses tc ON t.id = tc.trade_id AND tc.is_active = true
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.code
    `);
    
    const enhancedTrades = trades.map(trade => ({
      id: trade.code.toLowerCase(),
      code: trade.code,
      name: trade.name,
      name_rw: trade.name_rw,
      description: trade.description,
      description_rw: trade.description_rw,
      duration_years: trade.duration_years,
      total_students: trade.total_students || 0,
      total_instructors: trade.instructor_count,
      course_count: trade.course_count,
      total_credits: trade.total_credits,
      total_hours: trade.total_hours,
      image_url: `/uploads/trades/${trade.code.toLowerCase()}.jpg`
    }));
    
    res.json({ success: true, trades: enhancedTrades, total: enhancedTrades.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trade by code with full details
router.get('/code/:code', async (req, res) => {
  try {
    const [trades] = await pool.query(
      'SELECT * FROM trades WHERE code = ? AND is_active = true',
      [req.params.code.toUpperCase()]
    );
    
    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const trade = trades[0];
    const [courses] = await pool.query(
      'SELECT * FROM trade_courses WHERE trade_id = ? AND is_active = true ORDER BY code',
      [trade.id]
    );
    
    const [instructors] = await pool.query(
      'SELECT * FROM trade_instructors WHERE trade_id = ? AND is_active = true ORDER BY name',
      [trade.id]
    );

    const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
    const totalHours = courses.reduce((sum, c) => sum + (c.hours || 0), 0);

    res.json({
      success: true,
      trade: {
        ...trade,
        totalCredits,
        totalHours
      },
      courses,
      instructors,
      statistics: {
        totalCourses: courses.length,
        totalInstructors: instructors.length,
        totalCredits,
        totalHours
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get courses by trade
router.get('/:code/courses', async (req, res) => {
  try {
    const [trades] = await pool.query(
      'SELECT id FROM trades WHERE code = ? AND is_active = true',
      [req.params.code.toUpperCase()]
    );
    
    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const [courses] = await pool.query(
      'SELECT * FROM trade_courses WHERE trade_id = ? AND is_active = true ORDER BY code',
      [trades[0].id]
    );

    res.json({ success: true, courses, total: courses.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get instructors by trade
router.get('/:code/instructors', async (req, res) => {
  try {
    const [trades] = await pool.query(
      'SELECT id FROM trades WHERE code = ? AND is_active = true',
      [req.params.code.toUpperCase()]
    );
    
    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const [instructors] = await pool.query(
      'SELECT * FROM trade_instructors WHERE trade_id = ? AND is_active = true ORDER BY name',
      [trades[0].id]
    );

    res.json({ success: true, instructors, total: instructors.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search trades
router.get('/search', async (req, res) => {
  try {
    const { q, level } = req.query;
    let query = 'SELECT * FROM trades WHERE is_active = true';
    const params = [];

    if (q) {
      query += ' AND (name LIKE ? OR name_rw LIKE ? OR description LIKE ? OR code LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (level) {
      query += ' AND code LIKE ?';
      params.push(`${level}%`);
    }

    query += ' ORDER BY code';

    const [trades] = await pool.query(query, params);
    res.json({ success: true, trades, total: trades.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add new trade
router.post('/admin', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { code, name, name_rw, description, description_rw, duration_years } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO trades (code, name, name_rw, description, description_rw, duration_years) VALUES (?, ?, ?, ?, ?, ?)',
      [code, name, name_rw, description, description_rw, duration_years]
    );

    res.json({ success: true, message: 'Trade created', tradeId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update trade
router.put('/admin/:code', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, name_rw, description, description_rw, duration_years, total_students } = req.body;
    
    await pool.query(
      'UPDATE trades SET name=?, name_rw=?, description=?, description_rw=?, duration_years=?, total_students=? WHERE code=?',
      [name, name_rw, description, description_rw, duration_years, total_students, req.params.code.toUpperCase()]
    );

    res.json({ success: true, message: 'Trade updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add course to trade
router.post('/admin/:code/courses', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [trades] = await pool.query('SELECT id FROM trades WHERE code = ?', [req.params.code.toUpperCase()]);
    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const { code, name, name_rw, description, description_rw } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO trade_courses (trade_id, code, name, name_rw, description, description_rw) VALUES (?, ?, ?, ?, ?, ?)',
      [trades[0].id, code, name, name_rw, description, description_rw]
    );

    res.json({ success: true, message: 'Course added', courseId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add instructor to trade
router.post('/admin/:code/instructors', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [trades] = await pool.query('SELECT id FROM trades WHERE code = ?', [req.params.code.toUpperCase()]);
    if (trades.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const { name, name_rw, email, phone, specialization, qualification, experience_years } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO trade_instructors (trade_id, name, name_rw, email, phone, specialization, qualification, experience_years) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [trades[0].id, name, name_rw, email, phone, specialization, qualification, experience_years]
    );

    res.json({ success: true, message: 'Instructor added', instructorId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get statistics
router.get('/statistics', async (req, res) => {
  try {
    const [tradeCount] = await pool.query('SELECT COUNT(*) as count FROM trades WHERE is_active = true');
    const [courseCount] = await pool.query('SELECT COUNT(*) as count FROM trade_courses WHERE is_active = true');
    const [instructorCount] = await pool.query('SELECT COUNT(*) as count FROM trade_instructors WHERE is_active = true');
    const [studentCount] = await pool.query('SELECT SUM(total_students) as count FROM trades WHERE is_active = true');

    res.json({
      success: true,
      statistics: {
        totalTrades: tradeCount[0].count,
        totalCourses: courseCount[0].count,
        totalInstructors: instructorCount[0].count,
        totalStudents: studentCount[0].count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

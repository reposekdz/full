const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all trades with statistics
router.get('/all', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT t.*, 
        COUNT(DISTINCT ti.id) as instructor_count,
        COUNT(DISTINCT tc.id) as course_count
      FROM trades t
      LEFT JOIN trade_instructors ti ON t.id = ti.trade_id AND ti.is_active = true
      LEFT JOIN trade_courses tc ON t.id = tc.trade_id AND tc.is_active = true
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.level, t.code
    `);
    
    const enhancedTrades = trades.map(trade => ({
      ...trade,
      id: trade.code.toLowerCase(),
      title: trade.name,
      image_url: `/uploads/trades/${trade.code.toLowerCase()}.jpg`,
      description_en: trade.description,
      description_rw: trade.description_rw,
      student_count: trade.total_students || 0
    }));
    
    res.json({ success: true, trades: enhancedTrades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trades by level
router.get('/level/:level', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT t.*, 
        COUNT(DISTINCT ti.id) as instructor_count,
        COUNT(DISTINCT tc.id) as course_count
      FROM trades t
      LEFT JOIN trade_instructors ti ON t.id = ti.trade_id AND ti.is_active = true
      LEFT JOIN trade_courses tc ON t.id = tc.trade_id AND tc.is_active = true
      WHERE t.is_active = true AND t.level = ?
      GROUP BY t.id
      ORDER BY t.code
    `, [req.params.level]);
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single trade with full details
router.get('/:id', async (req, res) => {
  try {
    const [trades] = await pool.query('SELECT * FROM trades WHERE id = ? AND is_active = true', [req.params.id]);
    if (trades.length === 0) return res.status(404).json({ success: false, message: 'Trade not found' });

    const [instructors] = await pool.query(
      'SELECT * FROM trade_instructors WHERE trade_id = ? AND is_active = true ORDER BY name', 
      [req.params.id]
    );
    
    const [courses] = await pool.query(
      'SELECT * FROM trade_courses WHERE trade_id = ? AND is_active = true ORDER BY code', 
      [req.params.id]
    );

    // Calculate total credits and hours
    const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
    const totalHours = courses.reduce((sum, course) => sum + (course.hours || 0), 0);

    res.json({
      success: true,
      trade: {
        ...trades[0],
        totalCredits,
        totalHours
      },
      instructors,
      courses,
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

// Get trade by code
router.get('/code/:code', async (req, res) => {
  try {
    const [trades] = await pool.query('SELECT * FROM trades WHERE code = ? AND is_active = true', [req.params.code]);
    if (trades.length === 0) return res.status(404).json({ success: false, message: 'Trade not found' });

    const tradeId = trades[0].id;
    const [instructors] = await pool.query(
      'SELECT * FROM trade_instructors WHERE trade_id = ? AND is_active = true ORDER BY name', 
      [tradeId]
    );
    
    const [courses] = await pool.query(
      'SELECT * FROM trade_courses WHERE trade_id = ? AND is_active = true ORDER BY code', 
      [tradeId]
    );

    const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
    const totalHours = courses.reduce((sum, course) => sum + (course.hours || 0), 0);

    res.json({
      success: true,
      trade: {
        ...trades[0],
        totalCredits,
        totalHours
      },
      instructors,
      courses,
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

// Get all courses for a trade
router.get('/:id/courses', async (req, res) => {
  try {
    const [courses] = await pool.query(
      'SELECT * FROM trade_courses WHERE trade_id = ? AND is_active = true ORDER BY code',
      [req.params.id]
    );
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all instructors for a trade
router.get('/:id/instructors', async (req, res) => {
  try {
    const [instructors] = await pool.query(
      'SELECT * FROM trade_instructors WHERE trade_id = ? AND is_active = true ORDER BY name',
      [req.params.id]
    );
    res.json({ success: true, instructors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update trade
router.put('/admin/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, name_rw, description, description_rw, duration_years, total_students, total_instructors } = req.body;
    await pool.query(
      'UPDATE trades SET name=?, name_rw=?, description=?, description_rw=?, duration_years=?, total_students=?, total_instructors=? WHERE id=?',
      [name, name_rw, description, description_rw, duration_years, total_students, total_instructors, req.params.id]
    );
    res.json({ success: true, message: 'Trade updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add course to trade
router.post('/admin/:id/courses', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { code, name, name_rw, description, description_rw, credits, hours, semester } = req.body;
    const [result] = await pool.query(
      `INSERT INTO trade_courses (trade_id, code, name, name_rw, description, description_rw, credits, hours, semester) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, code, name, name_rw, description, description_rw, credits, hours, semester]
    );
    res.json({ success: true, message: 'Course added successfully', courseId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update course
router.put('/admin/courses/:courseId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, name_rw, description, description_rw, credits, hours, semester } = req.body;
    await pool.query(
      'UPDATE trade_courses SET name=?, name_rw=?, description=?, description_rw=?, credits=?, hours=?, semester=? WHERE id=?',
      [name, name_rw, description, description_rw, credits, hours, semester, req.params.courseId]
    );
    res.json({ success: true, message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add instructor to trade
router.post('/admin/:id/instructors', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, name_rw, email, phone, specialization, qualification, experience_years, photo_url } = req.body;
    const [result] = await pool.query(
      `INSERT INTO trade_instructors (trade_id, name, name_rw, email, phone, specialization, qualification, experience_years, photo_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, name, name_rw, email, phone, specialization, qualification, experience_years, photo_url]
    );
    res.json({ success: true, message: 'Instructor added successfully', instructorId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

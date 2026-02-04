const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all trades with statistics
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT t.*, 
        COUNT(DISTINCT ti.id) as instructor_count,
        COUNT(DISTINCT tc.id) as course_count
      FROM trades t
      LEFT JOIN trade_instructors ti ON t.id = ti.trade_id
      LEFT JOIN trade_courses tc ON t.id = tc.trade_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (
        t.code LIKE ? OR t.name LIKE ? OR t.name_rw LIKE ? OR
        t.description LIKE ? OR t.description_rw LIKE ?
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    query += `
      GROUP BY t.id
      ORDER BY t.code
    `;

    const [trades] = await pool.query(query, params);

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

// Search trades + courses (and classes when available)
router.get('/search/query', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) {
      return res.json({ success: true, results: { trades: [], courses: [], classes: [] } });
    }

    const like = `%${q}%`;

    const [trades] = await pool.query(
      `
        SELECT *
        FROM trades
        WHERE code LIKE ? OR name LIKE ? OR name_rw LIKE ? OR description LIKE ? OR description_rw LIKE ?
        ORDER BY code
        LIMIT 50
      `,
      [like, like, like, like, like]
    );

    const [courses] = await pool.query(
      `
        SELECT 
          tc.*,
          t.code as trade_code,
          t.name as trade_name
        FROM trade_courses tc
        JOIN trades t ON tc.trade_id = t.id
        WHERE tc.code LIKE ? OR tc.name LIKE ? OR tc.name_rw LIKE ? OR tc.description LIKE ? OR tc.description_rw LIKE ?
        ORDER BY t.code, tc.code
        LIMIT 100
      `,
      [like, like, like, like, like]
    );

    // Classes schema differs across deployments; return best-effort results when possible.
    let classes = [];
    try {
      const [rows] = await pool.query(
        `
          SELECT id, name, class_name, level
          FROM trade_classes
          WHERE name LIKE ? OR class_name LIKE ? OR level LIKE ?
          ORDER BY name
          LIMIT 50
        `,
        [like, like, like]
      );

      classes = rows.map((r) => ({
        name: r.name || r.class_name,
        course_name: r.class_name || '',
        course_code: r.level || ''
      }));
    } catch (e) {
      classes = [];
    }

    res.json({ success: true, results: { trades, courses, classes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT t.*, 
        COUNT(DISTINCT ti.id) as instructor_count,
        COUNT(DISTINCT tc.id) as course_count
      FROM trades t
      LEFT JOIN trade_instructors ti ON t.id = ti.trade_id
      LEFT JOIN trade_courses tc ON t.id = tc.trade_id
      GROUP BY t.id
      ORDER BY t.code
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
      LEFT JOIN trade_instructors ti ON t.id = ti.trade_id
      LEFT JOIN trade_courses tc ON t.id = tc.trade_id
      WHERE t.level = ?
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
    const [trades] = await pool.query('SELECT * FROM trades WHERE id = ?', [req.params.id]);
    if (trades.length === 0) return res.status(404).json({ success: false, message: 'Trade not found' });

    const [instructors] = await pool.query(
      `SELECT 
        ti.*,
        COALESCE(ti.photo_url, '/uploads/teachers/default.jpg') as image_url,
        ti.email,
        ti.phone,
        ti.specialization,
        ti.qualification,
        ti.experience_years
      FROM trade_instructors ti 
      WHERE ti.trade_id = ? 
      ORDER BY ti.name`, 
      [req.params.id]
    );
    
    const [courses] = await pool.query(
      'SELECT * FROM trade_courses WHERE trade_id = ? ORDER BY code', 
      [req.params.id]
    );

    const [students] = await pool.query(
      'SELECT * FROM trade_students WHERE trade_id = ? AND is_active = true ORDER BY created_at DESC LIMIT 50',
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
      students,
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
    const [trades] = await pool.query('SELECT * FROM trades WHERE code = ?', [req.params.code]);
    if (trades.length === 0) return res.status(404).json({ success: false, message: 'Trade not found' });

    const tradeId = trades[0].id;
    const [instructors] = await pool.query(
      `SELECT 
        ti.*,
        COALESCE(ti.photo_url, '/uploads/teachers/default.jpg') as image_url,
        ti.email,
        ti.phone,
        ti.specialization,
        ti.qualification,
        ti.experience_years
      FROM trade_instructors ti 
      WHERE ti.trade_id = ? 
      ORDER BY ti.name`, 
      [tradeId]
    );
    
    const [courses] = await pool.query(
      'SELECT * FROM trade_courses WHERE trade_id = ? ORDER BY code', 
      [tradeId]
    );

    const [students] = await pool.query(
      'SELECT * FROM trade_students WHERE trade_id = ? AND is_active = true ORDER BY created_at DESC LIMIT 50',
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
      students,
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
      'SELECT * FROM trade_courses WHERE trade_id = ? ORDER BY code',
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
      `SELECT 
        ti.*,
        COALESCE(ti.photo_url, '/uploads/teachers/default.jpg') as image_url,
        ti.email,
        ti.phone,
        ti.specialization,
        ti.qualification,
        ti.experience_years
      FROM trade_instructors ti 
      WHERE ti.trade_id = ? 
      ORDER BY ti.name`,
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

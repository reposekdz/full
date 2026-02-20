const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get courses for timetable generation (real courses from trade_courses table)
router.get('/data/:trade/:level', authenticateToken, async (req, res) => {
  try {
    const { trade, level } = req.params;

    const [courses] = await pool.execute(`
      SELECT id, course_name as name, credits
      FROM trade_courses
      WHERE trade_code = ? AND level_number = ? AND is_active = 1
      ORDER BY course_name
    `, [trade, level]);

    const [teachers] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      WHERE u.role = 'teacher' AND u.is_active = 1
    `);

    res.json({ success: true, courses, teachers });
  } catch (error) {
    console.error('Get timetable data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

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
      ORDER BY t.id
    `);
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [trades] = await pool.query('SELECT * FROM trades WHERE id = ? AND is_active = true', [req.params.id]);
    if (trades.length === 0) return res.status(404).json({ success: false, message: 'Trade not found' });

    const [instructors] = await pool.query('SELECT * FROM trade_instructors WHERE trade_id = ? AND is_active = true', [req.params.id]);
    const [courses] = await pool.query('SELECT * FROM trade_courses WHERE trade_id = ? AND is_active = true ORDER BY level, code', [req.params.id]);

    res.json({
      success: true,
      trade: trades[0],
      instructors,
      courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

module.exports = router;

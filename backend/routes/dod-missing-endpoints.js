const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get conduct records
router.get('/conduct', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const [records] = await db.execute(`
      SELECT 
        scr.*,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
      FROM student_conduct_records scr
      LEFT JOIN global_student_sheets gss ON scr.student_id = gss.id
      LEFT JOIN users u ON scr.recorded_by = u.id
      ORDER BY scr.incident_date DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, records });
  } catch (error) {
    console.error('Get conduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conduct records' });
  }
});

// Get SOD students
router.get('/sod-students', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT * FROM global_student_sheets
      WHERE trade_code = 'SOD'
      ORDER BY level_number, last_name, first_name
    `);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get SOD students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch SOD students' });
  }
});

// Get all lessons
router.get('/all-lessons', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const [lessons] = await db.execute(`
      SELECT * FROM lessons
      ORDER BY created_at DESC
    `);

    res.json({ success: true, lessons });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
  }
});

// Get SMS history
router.get('/sms/history', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const [messages] = await db.execute(`
      SELECT * FROM sms_logs
      ORDER BY created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get SMS history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch SMS history' });
  }
});

module.exports = router;

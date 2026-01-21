const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all students with filters
router.get('/students', authenticateToken, requireRole('director_study', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { trade, level, search, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT u.*, r.name as role_name,
        (SELECT AVG(g.obtained_marks/g.max_marks * 100) FROM grades g WHERE g.student_id = u.id) as average_grade,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id AND a.status = 'present') as present_count,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id) as total_attendance
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'student' AND u.is_active = true
    `;
    const params = [];

    if (trade) {
      query += ' AND u.student_id LIKE ?';
      params.push(`%${trade}%`);
    }
    if (level) {
      query += ' AND u.student_id LIKE ?';
      params.push(`%${level}%`);
    }
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.last_name, u.first_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [students] = await pool.execute(query, params);
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE r.name = "student" AND u.is_active = true');

    res.json({ success: true, data: { students, total: total[0].count } });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Assign teacher to class
router.post('/assign-teacher', [
  authenticateToken,
  requireRole('director_study', 'admin', 'super_admin'),
  body('teacher_id').isInt().withMessage('Valid teacher ID required'),
  body('class_id').isInt().withMessage('Valid class ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { teacher_id, class_id } = req.body;

    await pool.execute('UPDATE classes SET teacher_id = ? WHERE id = ?', [teacher_id, class_id]);

    res.json({ success: true, message: 'Teacher assigned successfully' });
  } catch (error) {
    console.error('Assign teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create/Update timetable
router.post('/timetable', [
  authenticateToken,
  requireRole('director_study', 'admin', 'super_admin'),
  body('class_id').isInt().withMessage('Valid class ID required'),
  body('subject_id').isInt().withMessage('Valid subject ID required'),
  body('teacher_id').isInt().withMessage('Valid teacher ID required'),
  body('day_of_week').notEmpty().withMessage('Day of week required'),
  body('start_time').notEmpty().withMessage('Start time required'),
  body('end_time').notEmpty().withMessage('End time required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE teacher_id = ?, start_time = ?, end_time = ?, room_number = ?
    `, [class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number, teacher_id, start_time, end_time, room_number]);

    res.json({ success: true, message: 'Timetable updated successfully', id: result.insertId });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get performance analytics
router.get('/analytics/performance', authenticateToken, requireRole('director_study', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { trade, level, period = 'month' } = req.query;

    const [overallStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as total_students,
        AVG(g.obtained_marks/g.max_marks * 100) as average_performance,
        COUNT(DISTINCT g.id) as total_assessments,
        (SELECT COUNT(*) FROM attendance WHERE status = 'present') / (SELECT COUNT(*) FROM attendance) * 100 as attendance_rate
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN grades g ON u.id = g.student_id
      WHERE r.name = 'student' AND u.is_active = true
    `);

    const [tradePerformance] = await pool.execute(`
      SELECT 
        SUBSTRING(u.student_id, 5, 3) as trade_code,
        COUNT(DISTINCT u.id) as student_count,
        AVG(g.obtained_marks/g.max_marks * 100) as average_grade
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN grades g ON u.id = g.student_id
      WHERE r.name = 'student' AND u.is_active = true
      GROUP BY trade_code
    `);

    const [levelPerformance] = await pool.execute(`
      SELECT 
        SUBSTRING(u.student_id, 8, 2) as level,
        COUNT(DISTINCT u.id) as student_count,
        AVG(g.obtained_marks/g.max_marks * 100) as average_grade
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN grades g ON u.id = g.student_id
      WHERE r.name = 'student' AND u.is_active = true
      GROUP BY level
    `);

    res.json({
      success: true,
      analytics: {
        overall: overallStats[0],
        by_trade: tradePerformance,
        by_level: levelPerformance
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all trades with levels
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT DISTINCT
        SUBSTRING(student_id, 5, 3) as trade_code,
        SUBSTRING(student_id, 8, 2) as level,
        COUNT(*) as student_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'student' AND u.is_active = true AND student_id IS NOT NULL
      GROUP BY trade_code, level
      ORDER BY trade_code, level
    `);

    res.json({ success: true, trades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get DOS dashboard statistics
router.get('/dashboard-stats', authenticateToken, requireRole('director_study', 'admin', 'super_admin'), async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'student' AND u.is_active = true) as total_students,
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'teacher' AND u.is_active = true) as total_teachers,
        (SELECT COUNT(*) FROM classes WHERE is_active = true) as total_classes,
        (SELECT AVG(obtained_marks/max_marks * 100) FROM grades) as average_performance,
        (SELECT COUNT(*) FROM timetable) as timetable_entries
    `);

    res.json({ success: true, statistics: stats[0] });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

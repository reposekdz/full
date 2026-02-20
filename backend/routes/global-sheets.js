const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all students from global_student_sheets
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { trade, level, search, page = 1, limit = 1000 } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `SELECT * FROM global_student_sheets WHERE status = 'active'`;
    const params = [];
    
    if (trade && trade !== 'ALL') {
      sql += ` AND trade_code = ?`;
      params.push(trade);
    }
    
    if (level && level !== 'ALL') {
      sql += ` AND level_number = ?`;
      params.push(level);
    }
    
    if (search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ` ORDER BY trade_code, level_number, last_name, first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [students] = await pool.execute(sql, params);
    
    res.json({ success: true, students, count: students.length });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student by ID
router.get('/students/:id', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [req.params.id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.json({ success: true, student: students[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students by trade and level
router.get('/students/trade/:trade/level/:level', authenticateToken, async (req, res) => {
  try {
    const { trade, level } = req.params;
    
    const [students] = await pool.execute(
      `SELECT * FROM global_student_sheets 
       WHERE trade_code = ? AND level_number = ? AND status = 'active'
       ORDER BY last_name, first_name`,
      [trade, level]
    );
    
    res.json({ success: true, students, count: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all trades
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute(
      `SELECT DISTINCT trade_code, trade_name 
       FROM global_student_sheets 
       WHERE status = 'active' 
       ORDER BY trade_code`
    );
    
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all levels
router.get('/levels', authenticateToken, async (req, res) => {
  try {
    const [levels] = await pool.execute(
      `SELECT DISTINCT level_number, level_suffix, level_name 
       FROM global_student_sheets 
       WHERE status = 'active' 
       ORDER BY level_number`
    );
    
    res.json({ success: true, levels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(DISTINCT trade_code) as total_trades,
        COUNT(DISTINCT level_number) as total_levels,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female_count,
        AVG(gpa) as average_gpa,
        AVG(attendance_percentage) as average_attendance
      FROM global_student_sheets 
      WHERE status = 'active'
    `);
    
    const [tradeStats] = await pool.execute(`
      SELECT trade_code, trade_name, COUNT(*) as count
      FROM global_student_sheets 
      WHERE status = 'active'
      GROUP BY trade_code, trade_name
      ORDER BY count DESC
    `);
    
    const [levelStats] = await pool.execute(`
      SELECT level_number, level_name, COUNT(*) as count
      FROM global_student_sheets 
      WHERE status = 'active'
      GROUP BY level_number, level_name
      ORDER BY level_number
    `);
    
    res.json({ 
      success: true, 
      statistics: stats,
      trade_statistics: tradeStats,
      level_statistics: levelStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

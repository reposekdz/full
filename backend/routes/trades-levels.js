const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all trades from database
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT DISTINCT code, name
      FROM courses 
      WHERE code IS NOT NULL AND code != ''
      ORDER BY code
    `);
    
    const formattedTrades = trades.map(trade => ({
      trade_code: trade.code,
      trade_name: trade.name,
      trade_name_rw: trade.name // Add Kinyarwanda name (same for now)
    }));
    
    res.json({ success: true, trades: formattedTrades });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
});

// Get levels for a specific trade - AUT has 3, 4A, 4B, 5A, 5B; others have 3, 4, 5
router.get('/trades/:tradeCode/levels', async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    let levels;
    if (tradeCode === 'AUTO' || tradeCode === 'AUT') {
      levels = [
        { level_number: 3, level_suffix: '', level_display: '3' },
        { level_number: 4, level_suffix: 'A', level_display: '4A' },
        { level_number: 4, level_suffix: 'B', level_display: '4B' },
        { level_number: 5, level_suffix: 'A', level_display: '5A' },
        { level_number: 5, level_suffix: 'B', level_display: '5B' }
      ];
    } else {
      levels = [
        { level_number: 3, level_suffix: '', level_display: '3' },
        { level_number: 4, level_suffix: '', level_display: '4' },
        { level_number: 5, level_suffix: '', level_display: '5' }
      ];
    }
    
    res.json({ success: true, levels });
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch levels' });
  }
});

// Get courses for specific trade and level
router.get('/trades/:tradeCode/levels/:level/courses', async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    const [courses] = await pool.query(`
      SELECT id, code as trade_code, name as course_name
      FROM courses 
      WHERE code = ?
      ORDER BY name
    `, [tradeCode]);
    
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.json({ success: true, courses: [] });
  }
});

// Get students by trade and level
router.get('/trades/:tradeCode/levels/:level/students', async (req, res) => {
  try {
    const { tradeCode, level } = req.params;
    const levelNumber = parseInt(level);
    const levelSuffix = level.replace(/\d+/, '') || '';
    
    const [students] = await pool.query(`
      SELECT s.id, s.student_code, s.first_name, s.last_name, s.email, s.trade_code, s.level_number, s.level_suffix,
             CONCAT(s.first_name, ' ', s.last_name) as full_name
      FROM students s
      WHERE s.trade_code = ? AND s.level_number = ? AND COALESCE(s.level_suffix, '') = ?
      ORDER BY s.first_name, s.last_name
    `, [tradeCode, levelNumber, levelSuffix]);
    
    res.json({ success: true, students, count: students.length });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.json({ success: true, students: [], count: 0 });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GLOBAL TRADES CONFIGURATION - ONLY 3 TRADES EXIST
const GLOBAL_TRADES = [
  { code: 'BDC', name: 'Building and Construction', name_rw: 'Kubaka' },
  { code: 'SOD', name: 'Software Development', name_rw: 'Gutegura Porogaramu' },
  { code: 'AUT', name: 'Automotive Technology', name_rw: 'Ikoranabuhanga rya Modoka' }
];

// Get all trades - Returns only BDC, SOD, AUT
router.get('/trades', async (req, res) => {
  try {
    const formattedTrades = GLOBAL_TRADES.map(trade => ({
      trade_code: trade.code,
      trade_name: trade.name,
      trade_name_rw: trade.name_rw
    }));
    
    res.json({ success: true, trades: formattedTrades });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
});

// Get levels for a specific trade - AUT has 3, 4A, 4B, 5A, 5B; BDC and SOD have 3, 4, 5
router.get('/trades/:tradeCode/levels', async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    // Validate trade code
    if (!['BDC', 'SOD', 'AUT'].includes(tradeCode)) {
      return res.status(400).json({ success: false, message: 'Invalid trade code. Only BDC, SOD, AUT are supported.' });
    }
    
    let levels;
    if (tradeCode === 'AUT') {
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
    const { tradeCode, level } = req.params;
    
    // Validate trade code
    if (!['BDC', 'SOD', 'AUT'].includes(tradeCode)) {
      return res.json({ success: true, courses: [] });
    }
    
    const [courses] = await pool.query(`
      SELECT id, code as trade_code, name as course_name, name as course_name_rw
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

// Get students by trade and level - GLOBAL STUDENT SHEETS
router.get('/trades/:tradeCode/levels/:level/students', async (req, res) => {
  try {
    const { tradeCode, level } = req.params;
    
    // Validate trade code
    if (!['BDC', 'SOD', 'AUT'].includes(tradeCode)) {
      return res.json({ success: true, students: [], count: 0 });
    }
    
    // Parse level (e.g., "4A" -> number: 4, suffix: "A")
    const levelMatch = level.match(/^(\d+)([A-Z]?)$/);
    if (!levelMatch) {
      return res.json({ success: true, students: [], count: 0 });
    }
    
    const levelNumber = parseInt(levelMatch[1]);
    const levelSuffix = levelMatch[2] || '';
    
    // Try global_students table first
    let [students] = await pool.query(`
      SELECT 
        id, 
        student_id as student_code, 
        first_name, 
        last_name, 
        email,
        current_trade as trade_code,
        current_level as level_number,
        '' as level_suffix,
        CONCAT(first_name, ' ', last_name) as full_name,
        gender,
        date_of_birth,
        phone,
        conduct_score,
        attendance_percentage
      FROM global_students
      WHERE current_trade = ? AND current_level = ?
      ORDER BY first_name, last_name
    `, [tradeCode, levelNumber]);
    
    // If no students found, try students table
    if (students.length === 0) {
      [students] = await pool.query(`
        SELECT 
          s.id, 
          s.student_code, 
          s.first_name, 
          s.last_name, 
          s.email, 
          s.trade_code, 
          s.level_number, 
          COALESCE(s.level_suffix, '') as level_suffix,
          CONCAT(s.first_name, ' ', s.last_name) as full_name,
          s.gender,
          s.date_of_birth,
          s.phone
        FROM students s
        WHERE s.trade_code = ? AND s.level_number = ? AND COALESCE(s.level_suffix, '') = ?
        ORDER BY s.first_name, s.last_name
      `, [tradeCode, levelNumber, levelSuffix]);
    }
    
    res.json({ success: true, students, count: students.length });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.json({ success: true, students: [], count: 0 });
  }
});

// Get all students for a trade (all levels)
router.get('/trades/:tradeCode/students', async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    // Validate trade code
    if (!['BDC', 'SOD', 'AUT'].includes(tradeCode)) {
      return res.json({ success: true, students: [], count: 0 });
    }
    
    const [students] = await pool.query(`
      SELECT 
        id, 
        student_id as student_code, 
        first_name, 
        last_name, 
        email,
        current_trade as trade_code,
        current_level as level_number,
        CONCAT(first_name, ' ', last_name) as full_name,
        gender,
        conduct_score,
        attendance_percentage
      FROM global_students
      WHERE current_trade = ?
      ORDER BY current_level, first_name, last_name
    `, [tradeCode]);
    
    res.json({ success: true, students, count: students.length });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.json({ success: true, students: [], count: 0 });
  }
});

// Get statistics for all trades
router.get('/stats', async (req, res) => {
  try {
    const stats = [];
    
    for (const trade of GLOBAL_TRADES) {
      const [result] = await pool.query(`
        SELECT COUNT(*) as total_students
        FROM global_students
        WHERE current_trade = ?
      `, [trade.code]);
      
      stats.push({
        trade_code: trade.code,
        trade_name: trade.name,
        trade_name_rw: trade.name_rw,
        total_students: result[0].total_students || 0
      });
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;

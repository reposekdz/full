const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get columns for a specific trade and level
router.get('/columns', authenticateToken, async (req, res) => {
  try {
    const { trade, level } = req.query;
    
    // Check if custom columns table exists, if not return standard columns
    try {
      const [customColumns] = await pool.execute(`
        SELECT column_name, column_label, max_marks, weight 
        FROM global_student_sheets_custom_columns 
        WHERE is_active = TRUE 
        AND (trade_code IS NULL OR trade_code = ?) 
        AND (level_number IS NULL OR level_number = ?)
        ORDER BY created_at ASC
      `, [trade || null, level || null]);
      
      if (customColumns.length > 0) {
        return res.json({ success: true, columns: customColumns });
      }
    } catch (tableError) {
      console.log('Custom columns table not found, using standard columns');
    }
    
    // Return standard columns for global_student_sheets
    const columns = [
      { column_name: 'student_code', column_label: 'Student Code', max_marks: null, weight: null },
      { column_name: 'first_name', column_label: 'First Name', max_marks: null, weight: null },
      { column_name: 'last_name', column_label: 'Last Name', max_marks: null, weight: null },
      { column_name: 'gender', column_label: 'Gender', max_marks: null, weight: null },
      { column_name: 'trade_code', column_label: 'Trade', max_marks: null, weight: null },
      { column_name: 'level_number', column_label: 'Level', max_marks: null, weight: null },
      { column_name: 'conduct_score', column_label: 'Conduct Score', max_marks: 40, weight: null },
      { column_name: 'attendance_percentage', column_label: 'Attendance %', max_marks: 100, weight: null }
    ];

    res.json({ success: true, columns });
  } catch (error) {
    console.error('Get columns error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students for a specific trade and level
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { trade, level } = req.query;
    
    let query = `
      SELECT 
        u.id as student_id,
        u.serial_code as student_code,
        u.first_name,
        u.last_name,
        u.gender,
        u.phone,
        u.trade_code,
        u.level as level_number,
        COALESCE(u.conduct_score, 40) as conduct_score,
        COALESCE(u.attendance_percentage, 0) as attendance_percentage,
        u.status
      FROM users u
      WHERE u.role = 'student' AND u.status = 'active'
    `;
    
    const params = [];
    
    if (trade) {
      query += ' AND u.trade_code = ?';
      params.push(trade);
    }
    
    if (level) {
      query += ' AND u.level = ?';
      params.push(level);
    }
    
    query += ' ORDER BY u.last_name, u.first_name';
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student
router.put('/update-student', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'dos', 'teacher']), async (req, res) => {
  try {
    const { studentId, updates } = req.body;

    if (!studentId || !updates) {
      return res.status(400).json({ success: false, message: 'Student ID and updates required' });
    }

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), studentId];

    await pool.execute(`
      UPDATE users
      SET ${fields}
      WHERE id = ? AND role = 'student'
    `, values);

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
});

// Get trades and levels
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT DISTINCT trade_code, trade_name 
      FROM users 
      WHERE role = 'student' AND trade_code IS NOT NULL
      ORDER BY trade_code
    `);
    
    res.json({ success: true, trades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/levels/:tradeCode', authenticateToken, async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    const [levels] = await pool.execute(`
      SELECT DISTINCT level as level_number
      FROM users 
      WHERE role = 'student' AND trade_code = ? AND level IS NOT NULL
      ORDER BY level
    `, [tradeCode]);
    
    const levelNumbers = levels.map(l => l.level_number);
    
    res.json({ success: true, levels: levelNumbers.length > 0 ? levelNumbers : [3, 4, 5] });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({ success: false, message: error.message, levels: [3, 4, 5] });
  }
});

module.exports = router;

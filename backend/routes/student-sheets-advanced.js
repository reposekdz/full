const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get students by trade and level (for forms/selectors)
router.get('/students', async (req, res) => {
  try {
    const { trade, level } = req.query;
    
    if (!trade || !level) {
      return res.status(400).json({ success: false, error: 'Trade and level are required' });
    }

    // Parse level (e.g., "4A" -> number: 4, suffix: "A")
    const levelNumber = parseInt(level);
    const levelSuffix = level.toString().replace(/\d+/, '') || '';

    // Get students from Global Student Sheets
    const [students] = await db.query(
      `SELECT 
        s.id,
        s.student_code,
        s.user_id,
        s.trade_code,
        s.level_number,
        s.level_suffix,
        s.status,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        CONCAT(s.level_number, COALESCE(s.level_suffix, '')) as level_display
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.trade_code = ? 
         AND s.level_number = ? 
         AND s.level_suffix = ?
         AND s.status = 'active'
       ORDER BY u.first_name, u.last_name`,
      [trade, levelNumber, levelSuffix]
    );

    res.json({ success: true, students, count: students.length });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sheet with all students and custom columns
router.get('/sheets/:tradeCode/:levelNumber', async (req, res) => {
  try {
    const { tradeCode, levelNumber } = req.params;
    const { level_suffix } = req.query;

    // Get students
    const [students] = await db.query(
      `SELECT s.*, u.username, u.first_name, u.last_name 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.trade_code = ? AND s.level_number = ? AND s.level_suffix = ?`,
      [tradeCode, levelNumber, level_suffix || '']
    );

    // Get custom columns
    const [columns] = await db.query(
      `SELECT * FROM student_custom_columns 
       WHERE trade_code = ? AND level_number = ? AND level_suffix = ? 
       ORDER BY display_order, id`,
      [tradeCode, levelNumber, level_suffix || '']
    );

    // Get all custom values
    const [values] = await db.query(
      `SELECT student_id, column_id, column_value 
       FROM student_custom_values 
       WHERE student_id IN (?)`,
      [students.map(s => s.id)]
    );

    // Organize values by student
    const studentValues = {};
    values.forEach(v => {
      if (!studentValues[v.student_id]) studentValues[v.student_id] = {};
      studentValues[v.student_id][v.column_id] = v.column_value;
    });

    // Attach values to students
    students.forEach(s => {
      s.custom_values = studentValues[s.id] || {};
    });

    res.json({ success: true, students, columns });
  } catch (error) {
    console.error('Error loading sheet:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add custom column
router.post('/columns', async (req, res) => {
  try {
    const { trade_code, level_number, level_suffix, column_name, column_type, formula, calculation_type, default_value, display_order } = req.body;

    const [result] = await db.query(
      `INSERT INTO student_custom_columns 
       (trade_code, level_number, level_suffix, column_name, column_type, formula, calculation_type, default_value, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [trade_code, level_number, level_suffix || '', column_name, column_type, formula || null, calculation_type || 'none', default_value || null, display_order || 0]
    );

    res.json({ success: true, columnId: result.insertId });
  } catch (error) {
    console.error('Error adding column:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update cell value
router.put('/students/:studentId/columns/:columnId', async (req, res) => {
  try {
    const { studentId, columnId } = req.params;
    const { column_value } = req.body;

    await db.query(
      `INSERT INTO student_custom_values (student_id, column_id, column_value) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE column_value = ?`,
      [studentId, columnId, column_value, column_value]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating cell:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete column
router.delete('/columns/:columnId', async (req, res) => {
  try {
    const { columnId } = req.params;

    await db.query('DELETE FROM student_custom_values WHERE column_id = ?', [columnId]);
    await db.query('DELETE FROM student_custom_columns WHERE id = ?', [columnId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk update values
router.post('/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body; // [{studentId, columnId, value}]

    const promises = updates.map(u =>
      db.query(
        `INSERT INTO student_custom_values (student_id, column_id, column_value) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE column_value = ?`,
        [u.studentId, u.columnId, u.value, u.value]
      )
    );

    await Promise.all(promises);
    res.json({ success: true });
  } catch (error) {
    console.error('Error bulk updating:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get column statistics
router.get('/columns/:columnId/stats', async (req, res) => {
  try {
    const { columnId } = req.params;

    const [values] = await db.query(
      `SELECT column_value FROM student_custom_values WHERE column_id = ?`,
      [columnId]
    );

    const numbers = values.map(v => parseFloat(v.column_value)).filter(n => !isNaN(n));
    
    const stats = {
      count: numbers.length,
      sum: numbers.reduce((a, b) => a + b, 0),
      avg: numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0,
      min: numbers.length ? Math.min(...numbers) : 0,
      max: numbers.length ? Math.max(...numbers) : 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all students with marks (Global Sheets)
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { trade, level } = req.query;
    
    let query = `
      SELECT 
        u.id as student_id,
        u.first_name,
        u.last_name,
        u.serial_code as student_code,
        u.trade_code,
        u.level as level_number,
        u.level_suffix,
        u.gender,
        u.phone,
        u.email,
        u.status
      FROM users u
      WHERE u.role = 'student' AND u.status = 'active'
    `;
    
    const params = [];
    if (trade && trade !== 'ALL') {
      query += ' AND u.trade_code = ?';
      params.push(trade);
    }
    if (level && level !== 'ALL') {
      query += ' AND u.level = ?';
      params.push(level);
    }
    
    query += ' ORDER BY u.last_name, u.first_name';
    
    const [students] = await pool.execute(query, params);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.json({ success: true, students: [] });
  }
});

// Get custom columns for marks
router.get('/columns', authenticateToken, async (req, res) => {
  try {
    const { trade, level, year, term } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentTerm = term || 1;
    
    let query = `
      SELECT * FROM global_student_sheets_custom_columns 
      WHERE is_active = TRUE
        AND (trade_code IS NULL OR trade_code = ? OR ? = 'ALL')
        AND (level_number IS NULL OR level_number = ? OR ? = 'ALL')
        AND (academic_year IS NULL OR academic_year = ?)
        AND (term IS NULL OR term = ?)
      ORDER BY created_at ASC
    `;
    
    const [columns] = await pool.execute(query, [trade, trade, level, level, currentYear, currentTerm]);
    res.json({ success: true, columns });
  } catch (error) {
    console.error('Get columns error:', error);
    res.json({ success: true, columns: [] });
  }
});

// Add new column
router.post('/columns/add', authenticateToken, async (req, res) => {
  try {
    const { column_name, assessment_type, max_marks, weight, trade_code, level_number, academic_year, term, course_name } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO global_student_sheets_custom_columns 
      (column_name, assessment_type, max_marks, weight, trade_code, level_number, academic_year, term, course_name, created_by, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [column_name, assessment_type || 'test', max_marks, weight, trade_code === 'ALL' ? null : trade_code, level_number === 'ALL' ? null : level_number, academic_year, term, course_name || '', req.user.id]);
    
    res.json({ success: true, message: 'Column added', columnId: result.insertId });
  } catch (error) {
    console.error('Add column error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete column
router.delete('/columns/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE global_student_sheets_custom_columns SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Column deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get marks for students
router.get('/marks', authenticateToken, async (req, res) => {
  try {
    const { trade, level, year, term } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentTerm = term || 1;
    
    let query = `
      SELECT sm.*, u.trade_code, u.level as level_number
      FROM student_marks sm
      JOIN users u ON sm.student_id = u.id
      WHERE sm.academic_year = ? AND sm.term = ?
        AND (u.trade_code = ? OR ? = 'ALL')
        AND (u.level = ? OR ? = 'ALL')
    `;
    
    const [marks] = await pool.execute(query, [currentYear, currentTerm, trade, trade, level, level]);
    res.json({ success: true, marks });
  } catch (error) {
    console.error('Get marks error:', error);
    res.json({ success: true, marks: [] });
  }
});

// Save marks (bulk)
router.post('/marks/save', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { marks, year, term } = req.body;
    const currentYear = year || new Date().getFullYear();
    const currentTerm = term || 1;
    
    for (const mark of marks) {
      await connection.execute(`
        INSERT INTO student_marks (student_id, column_id, marks, academic_year, term, updated_by, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          marks = VALUES(marks),
          updated_by = VALUES(updated_by),
          updated_at = NOW()
      `, [mark.student_id, mark.column_id, mark.marks, currentYear, currentTerm, req.user.id]);
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Marks saved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Save marks error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;

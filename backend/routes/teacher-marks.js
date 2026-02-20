const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Save marks (bulk)
router.post('/save', authenticateToken, requireRole('teacher', 'admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { columns, marks, trade, level, assessment_type = 'exam', term = 'Term 1' } = req.body;
    const teacher_id = req.user.userId;
    
    if (!columns || !marks) {
      return res.status(400).json({ success: false, message: 'Columns and marks required' });
    }
    
    // Save each student's marks
    for (const studentMark of marks) {
      const { student_id, ...markData } = studentMark;
      
      // Calculate total and percentage
      let total = 0;
      let maxTotal = 0;
      
      columns.forEach(col => {
        const mark = Number(markData[col.id]) || 0;
        total += (mark / col.maxMarks) * col.weight;
        maxTotal += col.weight;
      });
      
      const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
      
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B';
      else if (percentage >= 70) grade = 'C';
      else if (percentage >= 60) grade = 'D';
      else if (percentage >= 50) grade = 'E';
      
      // Check if record exists
      const [existing] = await pool.execute(
        `SELECT id FROM teacher_marks 
         WHERE student_id = ? AND teacher_id = ? AND trade_code = ? AND level_number = ? AND term = ?`,
        [student_id, teacher_id, trade, level, term]
      );
      
      if (existing.length > 0) {
        // Update existing
        await pool.execute(
          `UPDATE teacher_marks 
           SET marks_data = ?, total_marks = ?, percentage = ?, grade = ?, columns_data = ?, updated_at = NOW()
           WHERE id = ?`,
          [JSON.stringify(markData), total, percentage, grade, JSON.stringify(columns), existing[0].id]
        );
      } else {
        // Insert new
        await pool.execute(
          `INSERT INTO teacher_marks 
           (student_id, teacher_id, trade_code, level_number, term, assessment_type, marks_data, columns_data, total_marks, percentage, grade)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [student_id, teacher_id, trade, level, term, assessment_type, JSON.stringify(markData), JSON.stringify(columns), total, percentage, grade]
        );
      }
    }
    
    res.json({ success: true, message: 'Marks saved successfully', count: marks.length });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get marks by trade and level
router.get('/marks', authenticateToken, async (req, res) => {
  try {
    const { trade, level, term = 'Term 1' } = req.query;
    const teacher_id = req.user.userId;
    
    let sql = `
      SELECT tm.*, gss.student_code, gss.first_name, gss.last_name, gss.trade_name, gss.level_name
      FROM teacher_marks tm
      JOIN global_student_sheets gss ON tm.student_id = gss.id
      WHERE tm.teacher_id = ?
    `;
    const params = [teacher_id];
    
    if (trade && trade !== 'ALL') {
      sql += ` AND tm.trade_code = ?`;
      params.push(trade);
    }
    
    if (level && level !== 'ALL') {
      sql += ` AND tm.level_number = ?`;
      params.push(level);
    }
    
    if (term) {
      sql += ` AND tm.term = ?`;
      params.push(term);
    }
    
    sql += ` ORDER BY gss.last_name, gss.first_name`;
    
    const [marks] = await pool.execute(sql, params);
    
    // Parse JSON data
    const parsedMarks = marks.map(m => ({
      ...m,
      marks_data: JSON.parse(m.marks_data || '{}'),
      columns_data: JSON.parse(m.columns_data || '[]')
    }));
    
    res.json({ success: true, marks: parsedMarks });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get marks for specific student
router.get('/marks/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [marks] = await pool.execute(
      `SELECT tm.*, gss.student_code, gss.first_name, gss.last_name, gss.trade_name, gss.level_name,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM teacher_marks tm
       JOIN global_student_sheets gss ON tm.student_id = gss.id
       JOIN users u ON tm.teacher_id = u.id
       WHERE tm.student_id = ?
       ORDER BY tm.created_at DESC`,
      [studentId]
    );
    
    const parsedMarks = marks.map(m => ({
      ...m,
      marks_data: JSON.parse(m.marks_data || '{}'),
      columns_data: JSON.parse(m.columns_data || '[]')
    }));
    
    res.json({ success: true, marks: parsedMarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete marks
router.delete('/marks/:id', authenticateToken, requireRole('teacher', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.userId;
    
    const [result] = await pool.execute(
      'DELETE FROM teacher_marks WHERE id = ? AND teacher_id = ?',
      [id, teacher_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Marks not found' });
    }
    
    res.json({ success: true, message: 'Marks deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher statistics
router.get('/statistics', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const teacher_id = req.user.userId;
    
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT student_id) as total_students_graded,
        COUNT(DISTINCT trade_code) as trades_taught,
        COUNT(DISTINCT level_number) as levels_taught,
        AVG(percentage) as average_percentage,
        SUM(CASE WHEN grade IN ('A', 'B', 'C') THEN 1 ELSE 0 END) as passing_students,
        COUNT(*) as total_assessments
      FROM teacher_marks
      WHERE teacher_id = ?
    `, [teacher_id]);
    
    const [tradeBreakdown] = await pool.execute(`
      SELECT trade_code, COUNT(*) as count, AVG(percentage) as avg_percentage
      FROM teacher_marks
      WHERE teacher_id = ?
      GROUP BY trade_code
    `, [teacher_id]);
    
    res.json({ 
      success: true, 
      statistics: stats,
      trade_breakdown: tradeBreakdown
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Submit grade
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, subject_id, class_id, academic_year_id, exam_type, obtained_marks, max_marks, remarks } = req.body;
    const graded_by = req.user.id;

    const percentage = (obtained_marks / max_marks) * 100;
    let grade_letter = 'F';
    
    if (percentage >= 90) grade_letter = 'A';
    else if (percentage >= 80) grade_letter = 'B';
    else if (percentage >= 70) grade_letter = 'C';
    else if (percentage >= 60) grade_letter = 'D';
    else if (percentage >= 50) grade_letter = 'E';

    const [result] = await pool.query(`
      INSERT INTO grades (student_id, subject_id, class_id, academic_year_id, exam_type, obtained_marks, max_marks, grade_letter, remarks, graded_by, graded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [student_id, subject_id, class_id, academic_year_id, exam_type, obtained_marks, max_marks, grade_letter, remarks, graded_by]);

    res.json({ success: true, message: 'Grade submitted successfully', gradeId: result.insertId });
  } catch (error) {
    console.error('Error submitting grade:', error);
    res.status(500).json({ success: false, message: 'Failed to submit grade' });
  }
});

// Bulk submit grades
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { grades } = req.body;
    const graded_by = req.user.id;

    const values = grades.map(g => {
      const percentage = (g.obtained_marks / g.max_marks) * 100;
      let grade_letter = 'F';
      
      if (percentage >= 90) grade_letter = 'A';
      else if (percentage >= 80) grade_letter = 'B';
      else if (percentage >= 70) grade_letter = 'C';
      else if (percentage >= 60) grade_letter = 'D';
      else if (percentage >= 50) grade_letter = 'E';

      return [
        g.student_id, g.subject_id, g.class_id, g.academic_year_id, g.exam_type,
        g.obtained_marks, g.max_marks, grade_letter, g.remarks || null, graded_by
      ];
    });

    await pool.query(`
      INSERT INTO grades (student_id, subject_id, class_id, academic_year_id, exam_type, obtained_marks, max_marks, grade_letter, remarks, graded_by, graded_at)
      VALUES ?
    `, [values.map(v => [...v, new Date()])]);

    res.json({ success: true, message: 'Grades submitted successfully' });
  } catch (error) {
    console.error('Error submitting bulk grades:', error);
    res.status(500).json({ success: false, message: 'Failed to submit grades' });
  }
});

// Get grades
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, subject_id, class_id, academic_year_id, exam_type } = req.query;
    
    let query = `
      SELECT g.*, 
        u.first_name, u.last_name, u.student_code,
        s.name as subject_name, s.code as subject_code,
        c.class_name,
        ay.year_name,
        t.first_name as graded_by_first_name, t.last_name as graded_by_last_name
      FROM grades g
      JOIN users u ON g.student_id = u.id
      JOIN subjects s ON g.subject_id = s.id
      JOIN classes c ON g.class_id = c.id
      JOIN academic_years ay ON g.academic_year_id = ay.id
      LEFT JOIN users t ON g.graded_by = t.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND g.student_id = ?';
      params.push(student_id);
    }
    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (class_id) {
      query += ' AND g.class_id = ?';
      params.push(class_id);
    }
    if (academic_year_id) {
      query += ' AND g.academic_year_id = ?';
      params.push(academic_year_id);
    }
    if (exam_type) {
      query += ' AND g.exam_type = ?';
      params.push(exam_type);
    }

    query += ' ORDER BY g.graded_at DESC';

    const [grades] = await pool.query(query, params);
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch grades' });
  }
});

// Get student performance summary
router.get('/student-summary/:studentId', authenticateToken, async (req, res) => {
  try {
    const { academic_year_id } = req.query;
    const studentId = req.params.studentId;

    let query = `
      SELECT 
        s.name as subject_name,
        s.code as subject_code,
        AVG((g.obtained_marks / g.max_marks) * 100) as average_percentage,
        COUNT(*) as total_assessments,
        MAX(g.grade_letter) as best_grade,
        MIN(g.grade_letter) as lowest_grade
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ?
    `;
    const params = [studentId];

    if (academic_year_id) {
      query += ' AND g.academic_year_id = ?';
      params.push(academic_year_id);
    }

    query += ' GROUP BY g.subject_id ORDER BY average_percentage DESC';

    const [summary] = await pool.query(query, params);

    const [overall] = await pool.query(`
      SELECT 
        AVG((obtained_marks / max_marks) * 100) as overall_average,
        COUNT(*) as total_assessments
      FROM grades
      WHERE student_id = ?
      ${academic_year_id ? 'AND academic_year_id = ?' : ''}
    `, academic_year_id ? [studentId, academic_year_id] : [studentId]);

    res.json({ 
      success: true, 
      summary,
      overall: overall[0]
    });
  } catch (error) {
    console.error('Error fetching student summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// Get class performance
router.get('/class-performance/:classId', authenticateToken, async (req, res) => {
  try {
    const { subject_id, academic_year_id } = req.query;
    const classId = req.params.classId;

    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.student_code,
        AVG((g.obtained_marks / g.max_marks) * 100) as average_percentage,
        COUNT(*) as total_assessments
      FROM grades g
      JOIN users u ON g.student_id = u.id
      WHERE g.class_id = ?
    `;
    const params = [classId];

    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (academic_year_id) {
      query += ' AND g.academic_year_id = ?';
      params.push(academic_year_id);
    }

    query += ' GROUP BY g.student_id ORDER BY average_percentage DESC';

    const [performance] = await pool.query(query, params);

    res.json({ success: true, performance });
  } catch (error) {
    console.error('Error fetching class performance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch performance' });
  }
});

// Update grade
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { obtained_marks, max_marks, remarks } = req.body;

    const percentage = (obtained_marks / max_marks) * 100;
    let grade_letter = 'F';
    
    if (percentage >= 90) grade_letter = 'A';
    else if (percentage >= 80) grade_letter = 'B';
    else if (percentage >= 70) grade_letter = 'C';
    else if (percentage >= 60) grade_letter = 'D';
    else if (percentage >= 50) grade_letter = 'E';

    await pool.query(`
      UPDATE grades 
      SET obtained_marks = ?, max_marks = ?, grade_letter = ?, remarks = ?
      WHERE id = ?
    `, [obtained_marks, max_marks, grade_letter, remarks, req.params.id]);

    res.json({ success: true, message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ success: false, message: 'Failed to update grade' });
  }
});

// Delete grade
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM grades WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ success: false, message: 'Failed to delete grade' });
  }
});

// Get grade analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { class_id, subject_id, academic_year_id, trade, level } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as total_grades,
        AVG((obtained_marks / max_marks) * 100) as average_percentage,
        MAX((obtained_marks / max_marks) * 100) as highest_percentage,
        MIN((obtained_marks / max_marks) * 100) as lowest_percentage,
        SUM(CASE WHEN grade_letter = 'A' THEN 1 ELSE 0 END) as grade_a_count,
        SUM(CASE WHEN grade_letter = 'B' THEN 1 ELSE 0 END) as grade_b_count,
        SUM(CASE WHEN grade_letter = 'C' THEN 1 ELSE 0 END) as grade_c_count,
        SUM(CASE WHEN grade_letter = 'D' THEN 1 ELSE 0 END) as grade_d_count,
        SUM(CASE WHEN grade_letter = 'E' THEN 1 ELSE 0 END) as grade_e_count,
        SUM(CASE WHEN grade_letter = 'F' THEN 1 ELSE 0 END) as grade_f_count
      FROM grades g
      JOIN users u ON g.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ' AND g.class_id = ?';
      params.push(class_id);
    }
    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (academic_year_id) {
      query += ' AND g.academic_year_id = ?';
      params.push(academic_year_id);
    }
    if (trade) {
      query += ' AND u.trade = ?';
      params.push(trade);
    }
    if (level) {
      query += ' AND u.level = ?';
      params.push(level);
    }

    const [analytics] = await pool.query(query, params);
    res.json({ success: true, analytics: analytics[0] });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

module.exports = router;

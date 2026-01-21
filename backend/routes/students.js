const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get student dashboard data
router.get('/dashboard', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const [enrollments] = await pool.execute(`
      SELECT e.*, c.name as class_name, co.name as course_name, co.code as course_code,
        ay.name as academic_year_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN academic_years ay ON e.academic_year_id = ay.id
      LEFT JOIN users t ON c.teacher_id = t.id
      WHERE e.student_id = ? AND e.status = 'active'
    `, [req.user.id]);

    const [grades] = await pool.execute(`
      SELECT g.*, s.name as subject_name, s.code as subject_code,
        c.name as class_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN classes c ON g.class_id = c.id
      JOIN users t ON g.teacher_id = t.id
      WHERE g.student_id = ?
      ORDER BY g.assessment_date DESC
      LIMIT 10
    `, [req.user.id]);

    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM attendance
      WHERE student_id = ?
    `, [req.user.id]);

    const [avgGrade] = await pool.execute(`
      SELECT AVG(obtained_marks/max_marks * 100) as average
      FROM grades
      WHERE student_id = ?
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        enrollments,
        recent_grades: grades,
        attendance: attendance[0],
        average_grade: avgGrade[0].average || 0
      }
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student grades
router.get('/grades', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { subject_id, class_id } = req.query;
    let query = `
      SELECT g.*, s.name as subject_name, s.code as subject_code,
        c.name as class_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN classes c ON g.class_id = c.id
      JOIN users t ON g.teacher_id = t.id
      WHERE g.student_id = ?
    `;
    const params = [req.user.id];

    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (class_id) {
      query += ' AND g.class_id = ?';
      params.push(class_id);
    }

    query += ' ORDER BY g.assessment_date DESC';

    const [grades] = await pool.execute(query, params);
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student attendance
router.get('/attendance', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
      SELECT a.*, s.name as subject_name, c.name as class_name,
        CONCAT(t.first_name, ' ', t.last_name) as marked_by_name
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes c ON a.class_id = c.id
      JOIN users t ON a.marked_by = t.id
      WHERE a.student_id = ?
    `;
    const params = [req.user.id];

    if (start_date) {
      query += ' AND a.attendance_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND a.attendance_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY a.attendance_date DESC';

    const [attendance] = await pool.execute(query, params);
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student timetable
router.get('/timetable', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const [timetable] = await pool.execute(`
      SELECT t.*, s.name as subject_name, s.code as subject_code,
        c.name as class_name, CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        t.room_number
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes c ON t.class_id = c.id
      LEFT JOIN users u ON t.teacher_id = u.id
      WHERE t.class_id IN (
        SELECT class_id FROM enrollments WHERE student_id = ? AND status = 'active'
      )
      ORDER BY 
        FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        t.start_time
    `, [req.user.id]);

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Get student timetable error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student performance summary
router.get('/performance', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const [subjectPerformance] = await pool.execute(`
      SELECT s.name as subject_name, s.code as subject_code,
        COUNT(g.id) as total_assessments,
        AVG(g.obtained_marks/g.max_marks * 100) as average_percentage,
        MAX(g.obtained_marks/g.max_marks * 100) as highest_percentage,
        MIN(g.obtained_marks/g.max_marks * 100) as lowest_percentage
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ?
      GROUP BY s.id
      ORDER BY average_percentage DESC
    `, [req.user.id]);

    const [monthlyPerformance] = await pool.execute(`
      SELECT 
        DATE_FORMAT(assessment_date, '%Y-%m') as month,
        AVG(obtained_marks/max_marks * 100) as average_percentage,
        COUNT(*) as assessment_count
      FROM grades
      WHERE student_id = ?
      GROUP BY DATE_FORMAT(assessment_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [req.user.id]);

    res.json({
      success: true,
      performance: {
        by_subject: subjectPerformance,
        by_month: monthlyPerformance
      }
    });
  } catch (error) {
    console.error('Get student performance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

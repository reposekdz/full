const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get teacher stats
router.get('/stats', async (req, res) => {
  try {
    const teacherId = req.user?.id;
    
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE teacher_id = ?) as total_students,
        (SELECT COUNT(*) FROM courses WHERE teacher_id = ?) as total_courses,
        (SELECT COUNT(*) FROM assignments WHERE teacher_id = ?) as total_assignments,
        (SELECT AVG(marks) FROM grades WHERE teacher_id = ?) as avg_performance
    `, [teacherId, teacherId, teacherId, teacherId]);
    
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher's students
router.get('/students', async (req, res) => {
  try {
    const teacherId = req.user?.id;
    
    const [students] = await db.query(`
      SELECT 
        s.*,
        t.trade_name,
        l.level_name,
        AVG(a.status = 'present') * 100 as attendance_rate,
        AVG(g.marks) as avg_grade
      FROM students s
      LEFT JOIN trades t ON s.trade_code = t.trade_code
      LEFT JOIN levels l ON s.level_number = l.level_number
      LEFT JOIN attendance a ON s.student_id = a.student_id
      LEFT JOIN grades g ON s.student_id = g.student_id
      WHERE s.teacher_id = ?
      GROUP BY s.student_id
    `, [teacherId]);
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher's courses
router.get('/courses', async (req, res) => {
  try {
    const teacherId = req.user?.id;
    
    const [courses] = await db.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT s.student_id) as student_count
      FROM courses c
      LEFT JOIN students s ON c.trade_code = s.trade_code AND c.level_number = s.level_number
      WHERE c.teacher_id = ?
      GROUP BY c.course_id
    `, [teacherId]);
    
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

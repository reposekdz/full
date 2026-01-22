const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Student Performance Analytics
router.get('/performance/:userId', async (req, res) => {
  try {
    const [performance] = await pool.execute(`
      SELECT 
        AVG(g.grade) as avg_grade,
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT CASE WHEN a.status = 'submitted' THEN a.id END) as submitted_assignments,
        COUNT(DISTINCT qa.id) as total_quizzes,
        AVG(qa.score) as avg_quiz_score,
        COUNT(DISTINCT att.id) as total_attendance,
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) as present_count
      FROM users u
      LEFT JOIN grades g ON u.id = g.student_id
      LEFT JOIN assignments a ON u.id = a.student_id
      LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
      LEFT JOIN attendance att ON u.id = att.student_id
      WHERE u.id = ?
    `, [req.params.userId]);
    
    const [gradeHistory] = await pool.execute(`
      SELECT c.name as course_name, g.grade, g.created_at
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC
      LIMIT 20
    `, [req.params.userId]);
    
    res.json({ success: true, performance: performance[0], gradeHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Class Analytics
router.get('/class/:classId', async (req, res) => {
  try {
    const [analytics] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT e.student_id) as total_students,
        AVG(g.grade) as class_average,
        MAX(g.grade) as highest_grade,
        MIN(g.grade) as lowest_grade,
        COUNT(DISTINCT a.id) as total_assignments,
        AVG(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_rate
      FROM classes c
      LEFT JOIN enrollments e ON c.id = e.class_id
      LEFT JOIN grades g ON e.student_id = g.student_id
      LEFT JOIN assignments a ON c.id = a.class_id
      LEFT JOIN attendance att ON e.student_id = att.student_id
      WHERE c.id = ?
    `, [req.params.classId]);
    
    const [topStudents] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, AVG(g.grade) as avg_grade
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      LEFT JOIN grades g ON u.id = g.student_id
      WHERE e.class_id = ?
      GROUP BY u.id
      ORDER BY avg_grade DESC
      LIMIT 10
    `, [req.params.classId]);
    
    res.json({ success: true, analytics: analytics[0], topStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Teacher Analytics
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const [analytics] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT e.student_id) as total_students,
        AVG(g.grade) as avg_student_grade,
        COUNT(DISTINCT a.id) as assignments_created,
        COUNT(DISTINCT q.id) as quizzes_created
      FROM teachers t
      LEFT JOIN courses c ON t.id = c.teacher_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN grades g ON c.id = g.course_id
      LEFT JOIN assignments a ON c.id = a.course_id
      LEFT JOIN quizzes q ON c.id = q.course_id
      WHERE t.id = ?
    `, [req.params.teacherId]);
    
    const [coursePerformance] = await pool.execute(`
      SELECT c.name, COUNT(DISTINCT e.student_id) as students, AVG(g.grade) as avg_grade
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN grades g ON c.id = g.course_id
      WHERE c.teacher_id = ?
      GROUP BY c.id
    `, [req.params.teacherId]);
    
    res.json({ success: true, analytics: analytics[0], coursePerformance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// School-wide Analytics
router.get('/school', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student' AND status = 'active') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher' AND status = 'active') as total_teachers,
        (SELECT COUNT(*) FROM courses WHERE status = 'active') as total_courses,
        (SELECT COUNT(*) FROM classes WHERE status = 'active') as total_classes,
        (SELECT AVG(grade) FROM grades WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as avg_grade_30days,
        (SELECT COUNT(*) FROM enrollments WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_enrollments_30days
    `);
    
    const [enrollmentTrend] = await pool.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM enrollments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    res.json({ success: true, stats: stats[0], enrollmentTrend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Engagement Metrics
router.get('/engagement/:userId', async (req, res) => {
  try {
    const [engagement] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT DATE(al.created_at)) as active_days,
        COUNT(DISTINCT a.id) as assignments_submitted,
        COUNT(DISTINCT qa.id) as quizzes_taken,
        COUNT(DISTINCT gp.id) as forum_posts,
        COUNT(DISTINCT gpc.id) as forum_comments,
        MAX(al.created_at) as last_active
      FROM users u
      LEFT JOIN activity_log al ON u.id = al.user_id
      LEFT JOIN assignments a ON u.id = a.student_id AND a.status = 'submitted'
      LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
      LEFT JOIN group_posts gp ON u.id = gp.user_id
      LEFT JOIN group_post_comments gpc ON u.id = gpc.user_id
      WHERE u.id = ? AND al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [req.params.userId]);
    
    res.json({ success: true, engagement: engagement[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

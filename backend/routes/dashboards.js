const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Student Dashboard with Trade Courses
router.get('/student', authenticateToken, async (req, res) => {
  try {
    // Get student's trade classes and enrollments
    const [enrollments] = await pool.execute(`
      SELECT e.*, tc.name as class_name, tc.trade_code, tc.level_number, tc.level_suffix,
             t.name as trade_name, t.description as trade_description,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM enrollments e
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trades t ON tc.trade_code = t.code
      LEFT JOIN users u ON tc.teacher_id = u.id
      WHERE e.student_id = ? AND e.status = 'active'
    `, [req.user.id]);

    // Get recent grades
    const [grades] = await pool.execute(`
      SELECT g.*, s.name as subject_name, CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN users u ON g.teacher_id = u.id
      WHERE g.student_id = ?
      ORDER BY g.assessment_date DESC
      LIMIT 10
    `, [req.user.id]);

    // Get attendance summary
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM attendance
      WHERE student_id = ?
    `, [req.user.id]);

    // Get average grade
    const [avgGrade] = await pool.execute(`
      SELECT AVG(obtained_marks/max_marks * 100) as average
      FROM grades
      WHERE student_id = ?
    `, [req.user.id]);

    // Get pending assignments
    const [assignments] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM assignments a
      WHERE a.class_id IN (SELECT class_id FROM enrollments WHERE student_id = ? AND status = 'active')
      AND a.due_date >= CURDATE()
    `, [req.user.id]);
    
    res.json({
      success: true,
      data: {
        enrollments,
        recent_grades: grades,
        attendance: attendance[0],
        average_grade: avgGrade[0].average || 0,
        pending_assignments: assignments[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Teacher Dashboard with Trade Classes
router.get('/teacher', authenticateToken, async (req, res) => {
  try {
    // Get teacher's trade classes
    const [classes] = await pool.execute(`
      SELECT tc.*, t.name as trade_name, t.description,
             (SELECT COUNT(*) FROM enrollments WHERE class_id = tc.id AND status = 'active') as student_count
      FROM trade_classes tc
      JOIN trades t ON tc.trade_code = t.code
      WHERE tc.teacher_id = ?
    `, [req.user.id]);

    // Get total students
    const [students] = await pool.execute(`
      SELECT COUNT(DISTINCT e.student_id) as count
      FROM enrollments e
      JOIN trade_classes tc ON e.class_id = tc.id
      WHERE tc.teacher_id = ? AND e.status = 'active'
    `, [req.user.id]);

    // Get assignments
    const [assignments] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM assignments a
      JOIN trade_classes tc ON a.class_id = tc.id
      WHERE tc.teacher_id = ?
    `, [req.user.id]);

    // Get recent grades
    const [recentGrades] = await pool.execute(`
      SELECT g.*, s.name as subject_name, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      JOIN users u ON g.student_id = u.id
      WHERE g.teacher_id = ?
      ORDER BY g.assessment_date DESC
      LIMIT 10
    `, [req.user.id]);
    
    res.json({
      success: true,
      data: {
        classes,
        total_students: students[0].count,
        total_assignments: assignments[0].count,
        recent_grades: recentGrades
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Parent Dashboard
router.get('/parent', authenticateToken, async (req, res) => {
  try {
    const [children] = await pool.execute(`SELECT * FROM users WHERE parent_id = ?`, [req.user.id]);
    const childrenData = [];
    
    for (const child of children) {
      const [grades] = await pool.execute(`SELECT AVG(score) as avg FROM grades WHERE student_id = ?`, [child.id]);
      const [attendance] = await pool.execute(`SELECT COUNT(*) as present FROM attendance WHERE student_id = ? AND status = 'present'`, [child.id]);
      childrenData.push({
        id: child.id,
        name: `${child.first_name} ${child.last_name}`,
        averageGrade: grades[0].avg || 0,
        attendance: attendance[0].present
      });
    }
    
    res.json({ success: true, children: childrenData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Dashboard
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'student'`);
    const [teachers] = await pool.execute(`SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'teacher'`);
    const [courses] = await pool.execute(`SELECT COUNT(*) as count FROM courses WHERE is_active = true`);
    const [tickets] = await pool.execute(`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'open'`);
    
    res.json({
      success: true,
      dashboard: {
        totalStudents: students[0].count,
        totalTeachers: teachers[0].count,
        activeCourses: courses[0].count,
        openTickets: tickets[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DOS Dashboard with Trade Courses
router.get('/dos', authenticateToken, async (req, res) => {
  try {
    // Get all trade classes
    const [tradeClasses] = await pool.execute(`
      SELECT tc.*, t.name as trade_name, t.description,
             (SELECT COUNT(*) FROM enrollments WHERE class_id = tc.id AND status = 'active') as student_count,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM trade_classes tc
      JOIN trades t ON tc.trade_code = t.code
      LEFT JOIN users u ON tc.teacher_id = u.id
      ORDER BY t.name, tc.level_number
    `);

    // Get all trades
    const [trades] = await pool.execute(`
      SELECT t.*, 
             (SELECT COUNT(*) FROM trade_classes WHERE trade_code = t.code) as class_count,
             (SELECT COUNT(DISTINCT e.student_id) 
              FROM enrollments e 
              JOIN trade_classes tc ON e.class_id = tc.id 
              WHERE tc.trade_code = t.code AND e.status = 'active') as student_count
      FROM trades t
      WHERE t.is_active = true
    `);

    // Get enrollment statistics
    const [enrollments] = await pool.execute(`
      SELECT COUNT(*) as count FROM enrollments WHERE status = 'active'
    `);

    // Get performance by trade
    const [performance] = await pool.execute(`
      SELECT tc.trade_code, t.name as trade_name,
             AVG(g.obtained_marks/g.max_marks * 100) as average_performance,
             COUNT(DISTINCT g.student_id) as student_count
      FROM grades g
      JOIN enrollments e ON g.student_id = e.student_id
      JOIN trade_classes tc ON e.class_id = tc.id
      JOIN trades t ON tc.trade_code = t.code
      WHERE e.status = 'active'
      GROUP BY tc.trade_code, t.name
    `);

    // Get attendance statistics
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as attendance_rate
      FROM attendance
      WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    res.json({
      success: true,
      data: {
        trade_classes: tradeClasses,
        trades,
        total_enrollments: enrollments[0].count,
        performance_by_trade: performance,
        attendance_stats: attendance[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

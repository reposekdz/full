const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Student Dashboard
router.get('/student', authenticateToken, async (req, res) => {
  try {
    const [courses] = await pool.execute(`SELECT COUNT(*) as count FROM enrollments WHERE student_id = ?`, [req.user.id]);
    const [assignments] = await pool.execute(`SELECT COUNT(*) as count FROM assignments WHERE student_id = ? AND status = 'pending'`, [req.user.id]);
    const [grades] = await pool.execute(`SELECT AVG(score) as avg FROM grades WHERE student_id = ?`, [req.user.id]);
    const [attendance] = await pool.execute(`SELECT COUNT(*) as present FROM attendance WHERE student_id = ? AND status = 'present'`, [req.user.id]);
    
    res.json({
      success: true,
      dashboard: {
        courses: courses[0].count,
        pendingAssignments: assignments[0].count,
        averageGrade: grades[0].avg || 0,
        attendanceRate: attendance[0].present
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Teacher Dashboard
router.get('/teacher', authenticateToken, async (req, res) => {
  try {
    const [courses] = await pool.execute(`SELECT COUNT(*) as count FROM courses WHERE instructor_id = ?`, [req.user.id]);
    const [students] = await pool.execute(`SELECT COUNT(DISTINCT student_id) as count FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.instructor_id = ?`, [req.user.id]);
    const [assignments] = await pool.execute(`SELECT COUNT(*) as count FROM assignments a JOIN courses c ON a.course_id = c.id WHERE c.instructor_id = ?`, [req.user.id]);
    
    res.json({
      success: true,
      dashboard: {
        courses: courses[0].count,
        students: students[0].count,
        assignments: assignments[0].count
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

// DOS Dashboard
router.get('/dos', authenticateToken, async (req, res) => {
  try {
    const [courses] = await pool.execute(`SELECT COUNT(*) as count FROM courses`);
    const [enrollments] = await pool.execute(`SELECT COUNT(*) as count FROM enrollments WHERE status = 'active'`);
    const [performance] = await pool.execute(`SELECT AVG(score) as avg FROM grades`);
    
    res.json({
      success: true,
      dashboard: {
        totalCourses: courses[0].count,
        activeEnrollments: enrollments[0].count,
        averagePerformance: performance[0].avg || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Parent requests to link with student
router.post('/link-request', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { student_name, student_class, trade, year, student_code } = req.body;
    
    const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await pool.execute(`
      INSERT INTO parent_student_links (parent_id, student_code, student_name, student_class, trade, year, link_code, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [req.user.id, student_code, student_name, student_class, trade, year, linkCode]);
    
    res.json({ success: true, message: 'Link request submitted. Waiting for approval.', linkCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get parent's link requests
router.get('/my-requests', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT psl.*, u.first_name, u.last_name, u.student_id
      FROM parent_student_links psl
      LEFT JOIN users u ON psl.linked_student_id = u.id
      WHERE psl.parent_id = ?
      ORDER BY psl.requested_at DESC
    `, [req.user.id]);
    
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get pending link requests (DOS/DOD/Headmaster)
router.get('/pending', authenticateToken, requireRole('dos', 'dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT psl.*, p.first_name as parent_first_name, p.last_name as parent_last_name, p.email as parent_email
      FROM parent_student_links psl
      JOIN users p ON psl.parent_id = p.id
      WHERE psl.status = 'pending'
      ORDER BY psl.requested_at DESC
    `);
    
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve link request
router.post('/approve/:id', authenticateToken, requireRole('dos', 'dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [linkRequest] = await pool.execute(`SELECT * FROM parent_student_links WHERE id = ?`, [id]);
    if (linkRequest.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    const request = linkRequest[0];
    const [students] = await pool.execute(`SELECT id FROM users WHERE student_id = ? OR serial_code = ?`, [request.student_code, request.student_code]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    await pool.execute(`
      UPDATE parent_student_links 
      SET status = 'approved', linked_student_id = ?, approved_at = NOW(), approved_by = ?
      WHERE id = ?
    `, [students[0].id, req.user.id, id]);
    
    await pool.execute(`UPDATE users SET parent_id = ? WHERE id = ?`, [request.parent_id, students[0].id]);
    
    res.json({ success: true, message: 'Link approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject link request
router.post('/reject/:id', authenticateToken, requireRole('dos', 'dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    await pool.execute(`UPDATE parent_student_links SET status = 'rejected' WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Link rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get linked children details for parent
router.get('/my-children', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [children] = await pool.execute(`
      SELECT u.*, tl.trade_name, tl.level_number
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.parent_id = ?
      GROUP BY u.id
    `, [req.user.id]);
    
    const childrenData = [];
    for (const child of children) {
      const [grades] = await pool.execute(`SELECT AVG(score) as avg FROM grades WHERE student_id = ?`, [child.id]);
      const [attendance] = await pool.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
        FROM attendance WHERE student_id = ?
      `, [child.id]);
      const [discipline] = await pool.execute(`SELECT * FROM discipline_records WHERE student_id = ? ORDER BY incident_date DESC LIMIT 5`, [child.id]);
      const [achievements] = await pool.execute(`SELECT * FROM student_achievements WHERE student_id = ? ORDER BY achievement_date DESC LIMIT 10`, [child.id]);
      
      childrenData.push({
        ...child,
        averageGrade: grades[0].avg || 0,
        attendanceRate: attendance[0].total > 0 ? (attendance[0].present / attendance[0].total * 100).toFixed(1) : 0,
        totalClasses: attendance[0].total,
        presentClasses: attendance[0].present,
        disciplineRecords: discipline,
        achievements: achievements
      });
    }
    
    res.json({ success: true, children: childrenData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get child detailed report
router.get('/child/:id/report', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const [child] = await pool.execute(`SELECT * FROM users WHERE id = ? AND parent_id = ?`, [req.params.id, req.user.id]);
    if (child.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const [grades] = await pool.execute(`
      SELECT g.*, c.course_name, e.exam_name
      FROM grades g
      LEFT JOIN courses c ON g.course_id = c.id
      LEFT JOIN exams e ON g.exam_id = e.id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC
    `, [req.params.id]);
    
    const [attendance] = await pool.execute(`
      SELECT a.*, c.course_name
      FROM attendance a
      LEFT JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
      LIMIT 50
    `, [req.params.id]);
    
    const [discipline] = await pool.execute(`SELECT * FROM discipline_records WHERE student_id = ? ORDER BY incident_date DESC`, [req.params.id]);
    const [achievements] = await pool.execute(`SELECT * FROM student_achievements WHERE student_id = ? ORDER BY achievement_date DESC`, [req.params.id]);
    
    res.json({ success: true, student: child[0], grades, attendance, discipline, achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

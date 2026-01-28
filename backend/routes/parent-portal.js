const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==========================================
// PARENT PORTAL - STUDENT MONITORING
// ==========================================

/**
 * Get Parent's Children (Students linked to this parent)
 */
router.get('/my-children', [authenticateToken, requireRole('parent', 'super_admin', 'admin')], async (req, res) => {
  try {
    const parentId = req.user.id; // From JWT

    const [children] = await pool.query(`
      SELECT u.id, u.student_id, u.serial_code, CONCAT(u.first_name, ' ', u.last_name) as name,
             u.profile_picture, c.name as class_name, c.level, c.section
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN classes c ON e.class_id = c.id
      WHERE u.parent_id = ?
    `, [parentId]);

    res.json({ success: true, children });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Comprehensive Child Data (Only if linked to parent)
 */
router.get('/child-full-report/:studentId', [authenticateToken, requireRole('parent', 'super_admin', 'admin')], async (req, res) => {
  try {
    const parentId = req.user.id;
    const { studentId } = req.params;

    // 1. Security Check: Is this student linked to the parent?
    const [[linkCheck]] = await pool.query('SELECT id FROM users WHERE id = ? AND parent_id = ?', [studentId, parentId]);
    if (!linkCheck && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: This is not your child.' });
    }

    // 2. Get Academic Performance (Grades)
    const [grades] = await pool.query(`
      SELECT g.*, s.name as subject_name 
      FROM grades g 
      JOIN subjects s ON g.subject_id = s.id 
      WHERE g.student_id = ? 
      ORDER BY g.assessment_date DESC
    `, [studentId]);

    // 3. Get Attendance
    const [attendance] = await pool.query(`
      SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30
    `, [studentId]);

    // 4. Get Finance / Fees
    const [fees] = await pool.query(`
      SELECT * FROM fee_payments WHERE student_id = ? ORDER BY payment_date DESC
    `, [studentId]);

    // 5. Get Discipline Records
    const [discipline] = await pool.query(`
      SELECT * FROM punishments WHERE student_id = ? ORDER BY created_at DESC
    `, [studentId]);

    // 6. Get Notifications for this student/parent
    const [notifications] = await pool.query(`
      SELECT * FROM parent_notifications 
      WHERE student_id = ? 
      ORDER BY created_at DESC LIMIT 10
    `, [studentId]);

    res.json({
      success: true,
      data: {
        grades,
        attendance,
        fees,
        discipline,
        notifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Send Message to School/Teacher (Parent Feedback)
 */
router.post('/send-feedback', [authenticateToken, requireRole('parent')], async (req, res) => {
  try {
    const { message, category, student_id } = req.body;
    const parentId = req.user.id;

    await pool.query(`
      INSERT INTO messaging (sender_id, receiver_id, content, subject, created_at)
      VALUES (?, (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin') LIMIT 1), ?, ?, NOW())
    `, [parentId, message, `Parent Feedback - Child ID: ${student_id}`]);

    res.json({ success: true, message: 'Your message has been sent to school administration.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

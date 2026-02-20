const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/parent-portal/student/:studentId/attendance
router.get('/student/:studentId/attendance', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id || req.user.userId;

    // Verify parent has access to this student
    const [link] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [parentId, studentId]
    );

    if (link.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get attendance records
    const [attendance] = await pool.execute(`
      SELECT 
        id,
        date,
        status,
        remarks,
        created_at
      FROM attendance
      WHERE student_id = ?
      ORDER BY date DESC
      LIMIT 100
    `, [studentId]);

    res.json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: error.message, attendance: [] });
  }
});

// GET /api/parent-portal/student/:studentId/conduct
router.get('/student/:studentId/conduct', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id || req.user.userId;

    // Verify parent has access
    const [link] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [parentId, studentId]
    );

    if (link.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get conduct records from student_conduct_records table
    const [conduct] = await pool.execute(`
      SELECT 
        id,
        incident_type,
        severity,
        description,
        action_taken,
        conduct_points_deducted,
        new_conduct_score,
        removed_by_name,
        created_at
      FROM student_conduct_records
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [studentId]);

    res.json({
      success: true,
      conduct
    });
  } catch (error) {
    console.error('Error fetching conduct:', error);
    res.status(500).json({ success: false, message: error.message, conduct: [] });
  }
});

// GET /api/parent-portal/student/:studentId/grades
router.get('/student/:studentId/grades', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id || req.user.userId;

    // Verify parent has access
    const [link] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [parentId, studentId]
    );

    if (link.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get grades from marks table
    const [grades] = await pool.execute(`
      SELECT 
        m.id,
        m.subject,
        m.marks,
        m.grade,
        m.term,
        m.academic_year,
        m.created_at
      FROM marks m
      WHERE m.student_id = ?
      ORDER BY m.created_at DESC
      LIMIT 100
    `, [studentId]);

    res.json({
      success: true,
      grades
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ success: false, message: error.message, grades: [] });
  }
});

// GET /api/parent-portal/student/:studentId/comments
router.get('/student/:studentId/comments', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id || req.user.userId;

    // Verify parent has access
    const [link] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [parentId, studentId]
    );

    if (link.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get teacher comments
    const [comments] = await pool.execute(`
      SELECT 
        tc.id,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        tc.subject,
        tc.comment,
        tc.created_at
      FROM teacher_comments tc
      LEFT JOIN users u ON tc.teacher_id = u.id
      WHERE tc.student_id = ?
      ORDER BY tc.created_at DESC
      LIMIT 50
    `, [studentId]);

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: error.message, comments: [] });
  }
});

// GET /api/parent-portal/student/:studentId/fees
router.get('/student/:studentId/fees', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id || req.user.userId;

    // Verify parent has access
    const [link] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [parentId, studentId]
    );

    if (link.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get fee information
    const [fees] = await pool.execute(`
      SELECT 
        total_fees,
        paid_amount,
        balance,
        last_payment_date,
        payment_status
      FROM student_fees
      WHERE student_id = ?
      LIMIT 1
    `, [studentId]);

    // Get payment history
    const [payments] = await pool.execute(`
      SELECT 
        id,
        amount,
        payment_date,
        payment_method,
        reference_number,
        created_at
      FROM fee_payments
      WHERE student_id = ?
      ORDER BY payment_date DESC
      LIMIT 20
    `, [studentId]);

    res.json({
      success: true,
      fees: fees[0] || { total_fees: 0, paid_amount: 0, balance: 0 },
      payments
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

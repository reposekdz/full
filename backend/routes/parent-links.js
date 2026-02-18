const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/parent-links/students - Get linked students for a parent
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    
    // Get linked students
    const [students] = await pool.execute(`
      SELECT 
        gss.id,
        gss.student_id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        gss.trade_code,
        gss.trade_name,
        gss.level_number,
        gss.gender,
        gss.status,
        gss.enrollment_status as status
      FROM global_student_sheets gss
      JOIN parent_student_links psl ON gss.student_id = psl.student_id
      WHERE psl.parent_id = ? AND psl.status = 'active'
    `, [parentId]);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching linked students:', error);
    res.status(500).json({ success: false, message: error.message, students: [] });
  }
});

// POST /api/parent-links/link-student - Link a student to a parent
router.post('/link-student', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    const { 
      student_first_name, 
      student_last_name, 
      trade_code, 
      level, 
      gender, 
      student_id,
      relationship 
    } = req.body;

    if (!student_first_name || !student_last_name || !trade_code || !level || !relationship) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    const levelNum = parseInt(level.replace('Level ', '')) || parseInt(level);

    // Try to find the student
    const [students] = await pool.execute(`
      SELECT id, student_id FROM global_student_sheets 
      WHERE LOWER(first_name) = LOWER(?) 
        AND LOWER(last_name) = LOWER(?)
        AND trade_code = ?
        AND level_number = ?
        AND (status = 'active' OR enrollment_status = 'active')
      LIMIT 1
    `, [student_first_name, student_last_name, trade_code, levelNum]);

    if (students.length === 0) {
      // Create a request for linking instead
      const [result] = await pool.execute(`
        INSERT INTO parent_student_link_requests 
        (parent_id, student_first_name, student_last_name, trade_code, level_number, gender, student_id, relationship, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `, [parentId, student_first_name, student_last_name, trade_code, levelNum, gender, student_id, relationship]);

      return res.json({
        success: true,
        message: 'Link request submitted! Waiting for school approval.',
        request_id: result.insertId
      });
    }

    // Link the student
    const studentDbId = students[0].student_id;
    
    // Check if already linked
    const [existing] = await pool.execute(`
      SELECT id FROM parent_student_links 
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, studentDbId]);

    if (existing.length > 0) {
      return res.json({
        success: false,
        message: 'Student is already linked to your account'
      });
    }

    // Create the link
    await pool.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, can_view_marks, can_view_attendance, can_view_discipline, can_view_fees, can_receive_sms, status, linked_by, linked_at)
      VALUES (?, ?, 1, 1, 1, 1, 1, 'active', ?, NOW())
    `, [parentId, studentDbId, req.user.name || 'Parent']);

    res.json({
      success: true,
      message: 'Student linked successfully! 🎉'
    });
  } catch (error) {
    console.error('Error linking student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/parent-links/requests - Get link requests (for admin/dos/dod)
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT * FROM parent_student_link_requests 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `);

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: error.message, requests: [] });
  }
});

// PUT /api/parent-links/requests/:id/approve - Approve a link request
router.put('/requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, parent_id } = req.body;

    // Create the link
    await pool.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, can_view_marks, can_view_attendance, can_view_discipline, can_view_fees, can_receive_sms, status, linked_by, linked_at)
      VALUES (?, ?, 1, 1, 1, 1, 1, 'active', ?, NOW())
    `, [parent_id, student_id, req.user.name || 'Admin']);

    // Update request status
    await pool.execute(`
      UPDATE parent_student_link_requests SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?
    `, [req.user.name || 'Admin', id]);

    res.json({ success: true, message: 'Link approved successfully!' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

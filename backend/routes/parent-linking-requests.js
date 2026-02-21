// Parent Linking Request System - No Student Code Required
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== SUBMIT LINKING REQUEST ====================
router.post('/submit-request', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { child_first_name, child_last_name, child_gender, trade_code, level_number, relationship, notes } = req.body;

    if (!child_first_name || !child_last_name || !child_gender || !trade_code || !level_number) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // Search for matching students in global_student_sheets
    const [matchingStudents] = await pool.execute(`
      SELECT id, student_code, first_name, last_name, trade_name, trade_code, level_number, gender, profile_image
      FROM global_student_sheets
      WHERE LOWER(first_name) = LOWER(?) 
        AND LOWER(last_name) = LOWER(?)
        AND gender = ?
        AND trade_code = ?
        AND level_number = ?
        AND status = 'active'
    `, [child_first_name, child_last_name, child_gender, trade_code, level_number]);

    if (matchingStudents.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No student found matching the provided information. Please verify the details.' 
      });
    }

    // If multiple matches, take the first one (or you can return all for parent to choose)
    const student = matchingStudents[0];

    // Check if already linked or pending
    const [[existing]] = await pool.execute(`
      SELECT id, status FROM parent_linking_requests
      WHERE parent_id = ? AND student_id = ?
      ORDER BY created_at DESC LIMIT 1
    `, [parentId, student.id]);

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'You already have a pending request for this student' });
      }
      if (existing.status === 'approved') {
        return res.status(400).json({ success: false, message: 'You are already linked to this student' });
      }
    }

    // Create linking request
    const requestId = `LR${Date.now()}`;
    await pool.execute(`
      INSERT INTO parent_linking_requests 
      (request_id, parent_id, student_id, child_first_name, child_last_name, 
       child_gender, trade_code, level_number, relationship, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [requestId, parentId, student.id, child_first_name, child_last_name, 
        child_gender, trade_code, level_number, relationship || 'parent', notes || '']);

    // Notify staff (DOS, Headmaster, Admin)
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      SELECT id, 'New Parent Linking Request', 
             CONCAT('Parent requests to link with student: ', ?, ' ', ?), 
             'parent_link_request', NOW()
      FROM users
      WHERE role IN ('dos', 'headmaster', 'admin') AND status = 'active'
    `, [child_first_name, child_last_name]);

    res.json({
      success: true,
      message: 'Linking request submitted successfully! Please wait for staff approval.',
      request_id: requestId,
      matched_student: {
        name: `${student.first_name} ${student.last_name}`,
        trade: student.trade_name,
        level: student.level_number,
        student_code: student.student_code
      }
    });
  } catch (error) {
    console.error('Submit linking request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET MY REQUESTS ====================
router.get('/my-requests', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [requests] = await pool.execute(`
      SELECT 
        plr.*,
        gss.student_code, gss.first_name as student_first_name, 
        gss.last_name as student_last_name, gss.trade_name, 
        gss.profile_image, gss.class_name,
        u.first_name as approved_by_first_name, u.last_name as approved_by_last_name
      FROM parent_linking_requests plr
      LEFT JOIN global_student_sheets gss ON plr.student_id = gss.id
      LEFT JOIN users u ON plr.approved_by = u.id
      WHERE plr.parent_id = ?
      ORDER BY plr.created_at DESC
    `, [parentId]);

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET PENDING REQUESTS (STAFF) ====================
router.get('/pending', authenticateToken, requireRole(['dos', 'headmaster', 'admin']), async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT 
        plr.*,
        gss.student_code, gss.first_name as student_first_name, 
        gss.last_name as student_last_name, gss.trade_name, gss.level_number,
        gss.profile_image, gss.class_name, gss.gender,
        p.first_name as parent_first_name, p.last_name as parent_last_name,
        p.email as parent_email, p.phone as parent_phone
      FROM parent_linking_requests plr
      LEFT JOIN global_student_sheets gss ON plr.student_id = gss.id
      LEFT JOIN users p ON plr.parent_id = p.id
      WHERE plr.status = 'pending'
      ORDER BY plr.created_at DESC
    `);

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== APPROVE REQUEST (STAFF) ====================
router.post('/approve/:requestId', authenticateToken, requireRole(['dos', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const staffId = req.user.userId;
    const { can_view_marks = true, can_view_attendance = true, can_view_report_cards = true, can_view_discipline = true } = req.body;

    // Get request details
    const [[request]] = await pool.execute(`
      SELECT * FROM parent_linking_requests WHERE id = ? AND status = 'pending'
    `, [requestId]);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Update request status
      await pool.execute(`
        UPDATE parent_linking_requests 
        SET status = 'approved', approved_by = ?, approved_at = NOW()
        WHERE id = ?
      `, [staffId, requestId]);

      // Create parent connection
      await pool.execute(`
        INSERT INTO parent_connections 
        (parent_id, student_id, can_view_marks, can_view_attendance, 
         can_view_report_cards, can_view_discipline, status, linked_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [request.parent_id, request.student_id, can_view_marks, can_view_attendance, 
          can_view_report_cards, can_view_discipline]);

      // Notify parent
      await pool.execute(`
        INSERT INTO parent_notifications 
        (parent_id, student_id, title, message, category, created_at)
        VALUES (?, ?, 'Linking Request Approved', 
                'Your request to link with your child has been approved. You can now view their information.', 
                'system', NOW())
      `, [request.parent_id, request.student_id]);

      // Commit transaction
      await pool.execute('COMMIT');

      res.json({
        success: true,
        message: 'Linking request approved successfully',
        parent_notified: true
      });
    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REJECT REQUEST (STAFF) ====================
router.post('/reject/:requestId', authenticateToken, requireRole(['dos', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const staffId = req.user.userId;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const [[request]] = await pool.execute(`
      SELECT * FROM parent_linking_requests WHERE id = ? AND status = 'pending'
    `, [requestId]);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }

    await pool.execute(`
      UPDATE parent_linking_requests 
      SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ?
      WHERE id = ?
    `, [staffId, rejection_reason, requestId]);

    // Notify parent
    await pool.execute(`
      INSERT INTO parent_notifications 
      (parent_id, student_id, title, message, category, created_at)
      VALUES (?, ?, 'Linking Request Rejected', 
              CONCAT('Your linking request was rejected. Reason: ', ?), 
              'system', NOW())
    `, [request.parent_id, request.student_id, rejection_reason]);

    res.json({
      success: true,
      message: 'Linking request rejected',
      parent_notified: true
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET AVAILABLE TRADES ====================
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT DISTINCT trade_code, trade_name 
      FROM global_student_sheets 
      WHERE status = 'active'
      ORDER BY trade_name
    `);

    res.json({ success: true, trades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET AVAILABLE LEVELS ====================
router.get('/levels', async (req, res) => {
  try {
    const { trade_code } = req.query;

    let query = `
      SELECT DISTINCT level_number 
      FROM global_student_sheets 
      WHERE status = 'active'
    `;
    const params = [];

    if (trade_code) {
      query += ` AND trade_code = ?`;
      params.push(trade_code);
    }

    query += ` ORDER BY level_number`;

    const [levels] = await pool.execute(query, params);

    res.json({ success: true, levels: levels.map(l => l.level_number) });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

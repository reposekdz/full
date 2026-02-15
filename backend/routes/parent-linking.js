// Parent Linking & Access Control Routes - Complete System with Verification Codes
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

// ==================== UTILITY FUNCTIONS ====================

// Generate verification code
const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character code
};

// Send SMS notification (placeholder - integrate with actual SMS service)
const sendVerificationSMS = async (phone, code, studentName) => {
  // In production, integrate with African Talking or other SMS service
  console.log(`[SMS] Sending verification code ${code} to ${phone} for linking with ${studentName}`);
  return { success: true, messageId: `SMS-${Date.now()}` };
};

// ==================== ROLE-BASED APPROVAL PERMISSIONS ====================
const APPROVER_ROLES = ['admin', 'headmaster', 'dod', 'director_study', 'director_discipline', 'accountant', 'advisor', 'patron', 'matron'];

const canApproveRequests = (userRole) => {
  return APPROVER_ROLES.includes(userRole);
};

// ==================== PARENT VERIFICATION CODES ====================

// POST request verification code (parent requests to link)
router.post('/request-verification', async (req, res) => {
  try {
    const { 
      parent_name, parent_phone, parent_email,
      student_first_name, student_last_name, student_trade, student_level,
      student_id_code, relationship, message 
    } = req.body;

    // Check for existing pending request
    const [existing] = await pool.execute(
      `SELECT * FROM parent_student_requests 
       WHERE parent_phone = ? AND status = 'pending' 
       AND student_first_name = ? AND student_last_name = ?`,
      [parent_phone, student_first_name, student_last_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A pending request already exists for this student' 
      });
    }

    // Generate verification code
    const verification_code = generateVerificationCode();
    
    // Try to find the student
    let foundStudentId = null;
    let foundStudentCode = null;
    
    if (student_id_code) {
      const [students] = await pool.execute(
        'SELECT id, student_code FROM global_student_sheets WHERE student_id = ? OR student_code = ?',
        [student_id_code, student_id_code]
      );
      if (students.length > 0) {
        foundStudentId = students[0].id;
        foundStudentCode = students[0].student_code;
      }
    }

    // Create the verification code request
    const [result] = await pool.execute(
      `INSERT INTO parent_verification_codes (
        parent_phone, parent_name, parent_email,
        student_first_name, student_last_name, student_trade, student_level,
        student_id, student_code, relationship_type, message,
        verification_code, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        parent_phone, parent_name, parent_email || null,
        student_first_name, student_last_name, student_trade || null, student_level || null,
        foundStudentId, foundStudentCode, relationship || 'guardian', message || null,
        verification_code
      ]
    );

    // Send verification SMS
    await sendVerificationSMS(
      parent_phone, 
      verification_code, 
      `${student_first_name} ${student_last_name}`
    );

    res.json({
      success: true,
      message: 'Verification code sent to your phone. Please enter it to complete your request.',
      request_id: result.insertId,
      expires_in: '24 hours'
    });
  } catch (error) {
    console.error('Error requesting verification:', error);
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
});

// POST verify code and submit request
router.post('/verify-and-submit', async (req, res) => {
  try {
    const { parent_phone, verification_code, request_id } = req.body;

    // Find the verification request
    const [requests] = await pool.execute(
      'SELECT * FROM parent_verification_codes WHERE id = ? AND verification_code = ?',
      [request_id, verification_code.toUpperCase()]
    );

    if (requests.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    const verification = requests[0];

    if (verification.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Request has already been ${verification.status}` 
      });
    }

    // Check if code expired (24 hours)
    const createdAt = new Date(verification.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      await pool.execute(
        'UPDATE parent_verification_codes SET status = ? WHERE id = ?',
        ['expired', request_id]
      );
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    // Mark as verified
    await pool.execute(
      'UPDATE parent_verification_codes SET status = ?, verified_at = NOW() WHERE id = ?',
      ['verified', request_id]
    );

    // Now submit as a proper linking request for approval
    const [submitResult] = await pool.execute(
      `INSERT INTO parent_student_requests (
        parent_id, parent_name, parent_phone, parent_email,
        student_first_name, student_last_name, student_trade, student_level,
        student_id, student_code, relationship_type, message, status, created_at,
        verified_by_parent, verification_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 1, ?)`,
      [
        verification.parent_id || null, verification.parent_name, verification.parent_phone, verification.parent_email,
        verification.student_first_name, verification.student_last_name, 
        verification.student_trade, verification.student_level,
        verification.student_id, verification.student_code, 
        verification.relationship_type, verification.message,
        request_id
      ]
    );

    res.json({
      success: true,
      message: 'Verification successful! Your request has been submitted for approval.',
      request_id: submitResult.insertId
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ success: false, message: 'Error verifying code' });
  }
});

// POST resend verification code
router.post('/resend-verification', async (req, res) => {
  try {
    const { request_id, parent_phone } = req.body;

    const [requests] = await pool.execute(
      'SELECT * FROM parent_verification_codes WHERE id = ? AND status = ?',
      [request_id, 'pending']
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    const verification = requests[0];
    const newCode = generateVerificationCode();

    await pool.execute(
      'UPDATE parent_verification_codes SET verification_code = ?, created_at = NOW() WHERE id = ?',
      [newCode, request_id]
    );

    await sendVerificationSMS(
      parent_phone, 
      newCode, 
      `${verification.student_first_name} ${verification.student_last_name}`
    );

    res.json({
      success: true,
      message: 'New verification code sent to your phone'
    });
  } catch (error) {
    console.error('Error resending verification:', error);
    res.status(500).json({ success: false, message: 'Error resending code' });
  }
});

// ==================== PARENT CONNECTIONS ====================

// GET all parent connections (for admin/staff)
router.get('/connections', authenticateToken, async (req, res) => {
  try {
    const { student_id, parent_phone, status, search } = req.query;
    
    let query = `
      SELECT pc.*, 
             gss.first_name as student_first_name, gss.last_name as student_name, gss.student_code,
             u.name as parent_user_name, u.email as parent_user_email
      FROM parent_connections pc
      LEFT JOIN global_student_sheets gss ON pc.student_id = gss.id
      LEFT JOIN users u ON pc.parent_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ' AND pc.student_id = ?';
      params.push(student_id);
    }
    if (parent_phone) {
      query += ' AND pc.parent_phone LIKE ?';
      params.push(`%${parent_phone}%`);
    }
    if (status) {
      query += ' AND pc.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR pc.parent_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY pc.created_at DESC';
    
    const [connections] = await pool.execute(query, params);
    
    res.json({
      success: true,
      connections,
      total: connections.length
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ success: false, message: 'Error fetching connections' });
  }
});

// GET parent dashboard - get all linked children with full information
router.get('/parent-dashboard/:parentPhone', async (req, res) => {
  try {
    const { parentPhone } = req.params;
    
    // Find parent by phone
    const [parents] = await pool.execute(
      'SELECT id, name, email, phone FROM users WHERE phone = ? AND role = "parent"',
      [parentPhone]
    );
    
    if (parents.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }
    
    const parent = parents[0];
    
    // Get all connected students
    const [connections] = await pool.execute(
      `SELECT pc.*, 
              gss.id as sheet_id, gss.student_id as student_number, gss.student_code, 
              gss.first_name, gss.last_name, gss.middle_name, gss.trade_code, gss.level_number,
              gss.profile_image, gss.gender, gss.date_of_birth
       FROM parent_connections pc
       LEFT JOIN global_student_sheets gss ON pc.student_id = gss.id
       WHERE pc.parent_phone = ? AND pc.status = 'active'
       ORDER BY pc.created_at DESC`,
      [parentPhone]
    );
    
    // Get detailed information for each child
    const children = await Promise.all(connections.map(async (conn) => {
      const sheetId = conn.sheet_id;
      
      // Get attendance summary
      const [attendance] = await pool.execute(
        `SELECT 
           COUNT(*) as total_days,
           SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
           SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
           SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
         FROM student_attendance_records 
         WHERE sheet_id = ? AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
        [sheetId]
      );
      
      // Get latest marks
      const [marks] = await pool.execute(
        `SELECT * FROM student_marks 
         WHERE student_id = (SELECT student_id FROM global_student_sheets WHERE id = ?)
         ORDER BY created_at DESC LIMIT 5`,
        [sheetId]
      );
      
      // Get discipline records
      const [discipline] = await pool.execute(
        `SELECT COUNT(*) as total_incidents, SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_incidents
         FROM student_discipline_records 
         WHERE sheet_id = ? AND status = 'active'`,
        [sheetId]
      );
      
      // Get payment status
      const [payments] = await pool.execute(
        `SELECT SUM(amount) as total_paid, COUNT(*) as payment_count
         FROM student_payment_records 
         WHERE sheet_id = ? AND status = 'completed'`,
        [sheetId]
      );
      
      return {
        connection: {
          id: conn.id,
          connection_id: conn.connection_id || `PC-${conn.id}`,
          relationship: conn.relationship,
          permissions: {
            view_marks: conn.can_view_marks,
            view_attendance: conn.can_view_attendance,
            view_discipline: conn.can_view_discipline,
            view_report_cards: conn.can_view_report_cards,
            view_fees: conn.can_view_fees,
            receive_notifications: conn.can_receive_notifications
          },
          approved_by: conn.approved_by,
          approved_by_role: conn.approved_by_role,
          approved_at: conn.created_at
        },
        student: {
          sheet_id: sheetId,
          student_number: conn.student_number,
          student_code: conn.student_code,
          first_name: conn.first_name,
          last_name: conn.last_name,
          middle_name: conn.middle_name,
          full_name: `${conn.first_name} ${conn.last_name}`,
          trade: conn.trade_code,
          level: conn.level_number,
          profile_image: conn.profile_image,
          gender: conn.gender,
          date_of_birth: conn.date_of_birth
        },
        attendance: attendance[0] || { total_days: 0, present_days: 0, absent_days: 0, late_days: 0 },
        recent_marks: marks,
        discipline: discipline[0] || { total_incidents: 0, critical_incidents: 0 },
        payments: payments[0] || { total_paid: 0, payment_count: 0 }
      };
    }));
    
    res.json({
      success: true,
      parent: {
        id: parent.id,
        name: parent.name,
        phone: parent.phone,
        email: parent.email,
        children_count: children.length
      },
      children,
      verified: true
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching parent dashboard' });
  }
});

// ==================== LINKING REQUESTS ====================

// GET pending requests count for dashboard
router.get('/pending-count', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (!canApproveRequests(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const [[{ count }]] = await pool.execute(
      "SELECT COUNT(*) as count FROM parent_student_requests WHERE status = 'pending'"
    );
    
    res.json({
      success: true,
      pendingCount: count,
      role: userRole,
      canApprove: true
    });
  } catch (error) {
    console.error('Error fetching pending count:', error);
    res.status(500).json({ success: false, message: 'Error fetching count' });
  }
});

// GET all pending requests (for dashboard display)
router.get('/pending-requests', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (!canApproveRequests(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view pending requests' 
      });
    }
    
    const [requests] = await pool.execute(
      `SELECT psr.*, 
              gss.student_code, gss.trade_code, gss.level_number,
              CONCAT(u.first_name, ' ', u.last_name) as parent_name,
              u.phone as parent_phone,
              u.email as parent_email
       FROM parent_student_requests psr
       LEFT JOIN users u ON psr.parent_id = u.id
       LEFT JOIN global_student_sheets gss ON psr.student_id = gss.id
       WHERE psr.status = 'pending'
       ORDER BY psr.created_at DESC LIMIT 50`
    );
    
    res.json({
      success: true,
      requests,
      role: userRole,
      canApprove: true
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
});

// GET linking requests (for admin/staff)
router.get('/linking-requests', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const userRole = req.user?.role;
    
    if (!canApproveRequests(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view linking requests' 
      });
    }
    
    let query = `SELECT psr.*,
                  CONCAT(u.first_name, ' ', u.last_name) as parent_name,
                  u.phone as parent_phone,
                  u.email as parent_email
                  FROM parent_student_requests psr
                  LEFT JOIN users u ON psr.parent_id = u.id
                  WHERE 1=1`;
    const params = [];
    
    if (status) {
      query += ' AND psr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY psr.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const [requests] = await pool.execute(query, params);
    
    const [[{ total }]] = await pool.execute(
      status
        ? 'SELECT COUNT(*) as total FROM parent_student_requests WHERE status = ?'
        : 'SELECT COUNT(*) as total FROM parent_student_requests',
      status ? [status] : []
    );
    
    res.json({
      success: true,
      requests,
      userRole,
      canApprove: canApproveRequests(userRole),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching linking requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
});

// PUT approve/reject linking request
router.put('/linking-requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;
    
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userName = req.user?.name;
    
    if (!canApproveRequests(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to process linking requests' 
      });
    }
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const [requests] = await pool.execute('SELECT * FROM parent_student_requests WHERE id = ?', [id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    const reqData = requests[0];
    
    if (reqData.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Request has already been ${reqData.status}` 
      });
    }
    
    // Update the request
    await pool.execute(
      `UPDATE parent_student_requests 
       SET status = ?, reviewed_by = ?, reviewed_by_name = ?,
           reviewed_by_role = ?, reviewed_at = NOW(), review_note = ? 
       WHERE id = ?`,
      [status, userId, userName, userRole, note, id]
    );
    
    if (action === 'approve') {
      // Create the connection
      await pool.execute(
        `INSERT INTO parent_connections (
          parent_id, parent_name, parent_phone, parent_email,
          student_id, student_name, relationship,
          can_view_marks, can_view_attendance, can_view_discipline,
          can_view_report_cards, can_view_fees, can_receive_notifications,
          status, created_at, approved_by, approved_by_role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 0, 1, 1, 1, 'active', NOW(), ?, ?)`,
        [
          reqData.parent_id, reqData.parent_name, reqData.parent_phone, reqData.parent_email,
          reqData.student_id, `${reqData.student_first_name} ${reqData.student_last_name}`,
          reqData.relationship_type,
          userName, userRole
        ]
      );
      
      // Create notification for parent
      await pool.execute(
        `INSERT INTO parent_notifications (
          parent_phone, title, message, urgency, is_read, created_at
        ) VALUES (?, ?, ?, 'normal', 0, NOW())`,
        [
          reqData.parent_phone,
          'Parent Linking Approved - Access Granted',
          `Your request to link with student ${reqData.student_first_name} ${reqData.student_last_name} has been approved by ${userName} (${userRole.replace('_', ' ')}). You now have access to view your child's information.`
        ]
      );
    } else {
      await pool.execute(
        `INSERT INTO parent_notifications (
          parent_phone, title, message, urgency, is_read, created_at
        ) VALUES (?, ?, ?, 'low', 0, NOW())`,
        [
          reqData.parent_phone,
          'Parent Linking Request Not Approved',
          `Your request to link with student ${reqData.student_first_name} ${reqData.student_last_name} was not approved. ${note ? 'Reason: ' + note : ''}`
        ]
      );
    }
    
    res.json({
      success: true,
      message: `Request ${status} successfully`,
      approvedBy: userName,
      approvedByRole: userRole
    });
  } catch (error) {
    console.error('Error processing linking request:', error);
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
});

// POST bulk approve requests
router.post('/bulk-approve', authenticateToken, async (req, res) => {
  try {
    const { request_ids } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userName = req.user?.name;
    
    if (!['admin', 'headmaster'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only administrators and headmasters can bulk approve requests' 
      });
    }
    
    if (!Array.isArray(request_ids) || request_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No request IDs provided' });
    }
    
    let approved = 0;
    let skipped = 0;
    
    for (const reqId of request_ids) {
      const [requests] = await pool.execute(
        "SELECT * FROM parent_student_requests WHERE id = ? AND status = 'pending'",
        [reqId]
      );
      
      if (requests.length > 0) {
        const reqData = requests[0];
        
        await pool.execute(
          `UPDATE parent_student_requests 
           SET status = 'approved', reviewed_by = ?, reviewed_by_name = ?,
               reviewed_by_role = ?, reviewed_at = NOW(), review_note = 'Bulk approved'
           WHERE id = ?`,
          [userId, userName, userRole, reqId]
        );
        
        await pool.execute(
          `INSERT INTO parent_connections (
            parent_id, parent_name, parent_phone, parent_email,
            student_id, student_name, relationship,
            can_view_marks, can_view_attendance, can_view_discipline,
            can_view_report_cards, can_view_fees, can_receive_notifications,
            status, created_at, approved_by, approved_by_role
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 0, 1, 1, 1, 'active', NOW(), ?, ?)`,
          [
            reqData.parent_id, reqData.parent_name, reqData.parent_phone, reqData.parent_email,
            reqData.student_id, `${reqData.student_first_name} ${reqData.student_last_name}`,
            reqData.relationship_type,
            userName, userRole
          ]
        );
        
        await pool.execute(
          `INSERT INTO parent_notifications (
            parent_phone, title, message, urgency, is_read, created_at
          ) VALUES (?, ?, ?, 'normal', 0, NOW())`,
          [
            reqData.parent_phone,
            'Parent Linking Approved',
            `Your request to link with student ${reqData.student_first_name} ${reqData.student_last_name} has been approved.`
          ]
        );
        
        approved++;
      } else {
        skipped++;
      }
    }
    
    res.json({
      success: true,
      message: `Successfully approved ${approved} requests, skipped ${skipped}`,
      approved,
      skipped
    });
  } catch (error) {
    console.error('Error in bulk approval:', error);
    res.status(500).json({ success: false, message: 'Error processing bulk approval' });
  }
});

// ==================== PARENT MESSAGES ====================

router.get('/messages/:parentPhone', async (req, res) => {
  try {
    const { parentPhone } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const [messages] = await pool.execute(
      `SELECT * FROM parent_communications 
       WHERE parent_phone = ?
       ORDER BY sent_at DESC LIMIT ? OFFSET ?`,
      [parentPhone, parseInt(limit), offset]
    );
    
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) as total FROM parent_communications WHERE parent_phone = ?',
      [parentPhone]
    );
    
    res.json({
      success: true,
      messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
});

router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { parent_phone, student_sheet_id, subject, message_body, urgency, category } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO parent_communications (
        student_sheet_id, sender_id, sender_name, sender_role,
        parent_phone, subject, message_body, urgency, category, status, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', NOW())`,
      [
        student_sheet_id || null,
        req.user?.id,
        req.user?.name || 'System',
        req.user?.role || 'staff',
        parent_phone,
        subject,
        message_body,
        urgency || 'normal',
        category || 'general'
      ]
    );
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      message_id: result.insertId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

// ==================== PARENT NOTIFICATIONS ====================

router.get('/notifications/:parentPhone', async (req, res) => {
  try {
    const { parentPhone } = req.params;
    
    const [notifications] = await pool.execute(
      `SELECT * FROM parent_notifications 
       WHERE parent_phone = ?
       ORDER BY created_at DESC LIMIT 50`,
      [parentPhone]
    );
    
    const [[{ unread_count }]] = await pool.execute(
      'SELECT COUNT(*) as unread_count FROM parent_notifications WHERE parent_phone = ? AND is_read = 0',
      [parentPhone]
    );
    
    res.json({
      success: true,
      notifications,
      unread_count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE parent_notifications SET is_read = 1 WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
});

// ==================== EXPORT ROUTES ====================

router.get('/export/connections', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (!['admin', 'headmaster', 'accountant'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to export data' 
      });
    }
    
    const [connections] = await pool.execute(
      `SELECT pc.connection_id, pc.parent_name, pc.parent_phone, pc.parent_email,
              gss.student_code, gss.first_name, gss.last_name, gss.trade_code, gss.level_number,
              pc.relationship, pc.status, pc.created_at, pc.approved_by, pc.approved_by_role
       FROM parent_connections pc
       LEFT JOIN global_student_sheets gss ON pc.student_id = gss.id
       ORDER BY pc.created_at DESC`
    );
    
    res.json({
      success: true,
      connections,
      exportedBy: req.user?.name,
      exportedByRole: userRole,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting connections:', error);
    res.status(500).json({ success: false, message: 'Error exporting data' });
  }
});

module.exports = router;

// Parent Linking & Access Control Routes - Database Connected Version
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ==================== ROLE-BASED APPROVAL PERMISSIONS ====================
// Roles that can approve parent linking requests
const APPROVER_ROLES = ['admin', 'headmaster', 'dod', 'accountant', 'patron', 'matron'];

// Check if user has approval permissions
const canApproveRequests = (userRole) => {
  return APPROVER_ROLES.includes(userRole);
};

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
          }
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
      children
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching parent dashboard' });
  }
});

// GET student data for parent (with permission check)
router.get('/student-data/:studentId/:parentPhone', async (req, res) => {
  try {
    const { studentId, parentPhone } = req.params;
    
    // Verify connection exists and is active
    const [connections] = await pool.execute(
      `SELECT pc.*, gss.first_name, gss.last_name, gss.student_code, gss.trade_code, gss.level_number
       FROM parent_connections pc
       LEFT JOIN global_student_sheets gss ON pc.student_id = gss.id
       WHERE pc.student_id = ? AND pc.parent_phone = ? AND pc.status = 'active'`,
      [studentId, parentPhone]
    );
    
    if (connections.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied - No active connection' });
    }
    
    const connection = connections[0];
    
    // Get comprehensive student data based on permissions
    const result = {
      success: true,
      permissions: {
        view_marks: connection.can_view_marks,
        view_attendance: connection.can_view_attendance,
        view_discipline: connection.can_view_discipline,
        view_report_cards: connection.can_view_report_cards,
        view_fees: connection.can_view_fees,
        view_assignments: connection.can_view_assignments
      },
      basic_info: {
        student_id: studentId,
        student_code: connection.student_code,
        name: `${connection.first_name} ${connection.last_name}`,
        trade: connection.trade_code,
        level: connection.level_number
      }
    };
    
    // Fetch additional data based on permissions
    if (connection.can_view_marks) {
      const [marks] = await pool.execute(
        `SELECT sm.*, tc.name as class_name 
         FROM student_marks sm
         LEFT JOIN trade_classes tc ON sm.class_id = tc.id
         WHERE sm.student_id = (SELECT student_id FROM global_student_sheets WHERE id = ?)
         ORDER BY sm.created_at DESC LIMIT 20`,
        [studentId]
      );
      result.marks = marks;
    }
    
    if (connection.can_view_attendance) {
      const [attendance] = await pool.execute(
        `SELECT * FROM student_attendance_records 
         WHERE sheet_id = ? 
         ORDER BY attendance_date DESC LIMIT 30`,
        [studentId]
      );
      result.attendance = attendance;
    }
    
    if (connection.can_view_discipline) {
      const [discipline] = await pool.execute(
        `SELECT * FROM student_discipline_records 
         WHERE sheet_id = ? AND status = 'active'
         ORDER BY incident_date DESC`,
        [studentId]
      );
      result.discipline_records = discipline;
    }
    
    if (connection.can_view_fees) {
      const [fees] = await pool.execute(
        `SELECT * FROM student_payment_records 
         WHERE sheet_id = ?
         ORDER BY payment_date DESC`,
        [studentId]
      );
      result.fees = fees;
    }
    
    if (connection.can_view_assignments) {
      const [assignments] = await pool.execute(
        `SELECT sa.*, tc.name as class_name
         FROM student_assignments sa
         LEFT JOIN trade_classes tc ON sa.class_id = tc.id
         WHERE sa.student_id = (SELECT student_id FROM global_student_sheets WHERE id = ?)
         AND sa.status = 'published'
         ORDER BY sa.created_at DESC`,
        [studentId]
      );
      result.assignments = assignments;
    }
    
    // Update last accessed
    await pool.execute(
      'UPDATE parent_connections SET last_accessed_at = NOW() WHERE student_id = ? AND parent_phone = ?',
      [studentId, parentPhone]
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ success: false, message: 'Error fetching student data' });
  }
});

// ==================== LINKING REQUESTS ====================

// POST submit linking request (parent applies to link with a student)
router.post('/request-linking', async (req, res) => {
  try {
    const { 
      parent_name, parent_phone, parent_email, parent_id,
      student_first_name, student_last_name, student_trade, student_level,
      student_id_code, relationship, message 
    } = req.body;
    
    // Check for existing pending request
    const [existing] = await pool.execute(
      `SELECT * FROM parent_student_requests 
       WHERE parent_phone = ? AND status = 'pending' 
       AND (student_first_name = ? AND student_last_name = ?)`,
      [parent_phone, student_first_name, student_last_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A pending request already exists for this student' 
      });
    }
    
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
    
    const [result] = await pool.execute(
      `INSERT INTO parent_student_requests (
        parent_id, parent_name, parent_phone, parent_email,
        student_first_name, student_last_name, student_trade, student_level,
        student_id, student_code, relationship_type, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        parent_id || null, parent_name, parent_phone, parent_email,
        student_first_name, student_last_name, student_trade, student_level,
        foundStudentId, foundStudentCode, relationship || 'guardian', message || null
      ]
    );
    
    res.json({
      success: true,
      message: 'Linking request submitted successfully',
      request_id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting linking request:', error);
    res.status(500).json({ success: false, message: 'Error submitting request' });
  }
});

// GET linking requests - role-based filtering
router.get('/linking-requests', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    
    // Check role permissions
    if (!canApproveRequests(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view linking requests' 
      });
    }
    
    let query = 'SELECT * FROM parent_student_requests WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [requests] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM parent_student_requests';
    const countParams = status ? [status] : [];
    if (status) countQuery += ' WHERE status = ?';
    const [[{ total }]] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      requests,
      userRole: userRole,
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

// GET pending requests count for dashboard
router.get('/pending-count', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    // Check if user can see pending requests
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
              gss.student_code, gss.trade_code, gss.level_number
       FROM parent_student_requests psr
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

// PUT approve/reject linking request - role-based with audit trail
router.put('/linking-requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body; // action: 'approve' or 'reject'
    
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userName = req.user?.name;
    
    // Check role permissions
    if (!canApproveRequests(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to process linking requests' 
      });
    }
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    // Get request details first
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
    
    // Update the request with approver info
    await pool.execute(
      `UPDATE parent_student_requests 
       SET status = ?, 
           reviewed_by = ?, 
           reviewed_by_name = ?,
           reviewed_by_role = ?,
           reviewed_at = NOW(), 
           review_note = ? 
       WHERE id = ?`,
      [status, userId, userName, userRole, note, id]
    );
    
    if (action === 'approve') {
      // Create the connection with default permissions
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
          'Parent Linking Approved',
          `Your request to link with student ${reqData.student_first_name} ${reqData.student_last_name} has been approved by the ${userRole.replace('_', ' ')}.`
        ]
      );
    } else {
      // Create notification for parent about rejection
      await pool.execute(
        `INSERT INTO parent_notifications (
          parent_phone, title, message, urgency, is_read, created_at
        ) VALUES (?, ?, ?, 'low', 0, NOW())`,
        [
          reqData.parent_phone,
          'Parent Linking Request Rejected',
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

// POST bulk approve requests (for admin/headmaster)
router.post('/bulk-approve', authenticateToken, async (req, res) => {
  try {
    const { request_ids } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userName = req.user?.name;
    
    // Only admin and headmaster can bulk approve
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
        
        // Update request
        await pool.execute(
          `UPDATE parent_student_requests 
           SET status = 'approved', reviewed_by = ?, reviewed_by_name = ?,
               reviewed_by_role = ?, reviewed_at = NOW(), review_note = 'Bulk approved'
           WHERE id = ?`,
          [userId, userName, userRole, reqId]
        );
        
        // Create connection
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
        
        // Create notification
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

// GET parent messages
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

// POST send message to parent
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

// GET parent notifications
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

// Mark notification as read
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

// ==================== HELP REQUESTS ====================

// GET parent help requests
router.get('/help-requests/:parentPhone', async (req, res) => {
  try {
    const { parentPhone } = req.params;
    
    const [requests] = await pool.execute(
      `SELECT * FROM parent_help_requests 
       WHERE parent_phone = ?
       ORDER BY created_at DESC`,
      [parentPhone]
    );
    
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
});

// POST submit help request
router.post('/help-requests', async (req, res) => {
  try {
    const { parent_phone, student_sheet_id, category, subject, message, urgency } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO parent_help_requests (
        parent_phone, student_sheet_id, category, subject, message, urgency, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        parent_phone,
        student_sheet_id || null,
        category || 'general',
        subject,
        message,
        urgency || 'normal'
      ]
    );
    
    res.json({
      success: true,
      message: 'Help request submitted successfully',
      request_id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting help request:', error);
    res.status(500).json({ success: false, message: 'Error submitting request' });
  }
});

// ==================== EXPORT ROUTES ====================

// Export parent connections (for admin reporting)
router.get('/export/connections', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    // Only admin, headmaster, and accountant can export
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

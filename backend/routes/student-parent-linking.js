const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

/**
 * STUDENT-PARENT LINKING API
 * Complete student-parent linking with verification and access control
 */

const generateLinkCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// ============================================
// PARENT SIDE - REQUEST LINKING
// ============================================

// Parent requests to link with student
router.post('/request-link', async (req, res) => {
  try {
    const {
      parent_phone, parent_name, parent_email,
      student_first_name, student_last_name, student_code,
      student_trade, student_level, relationship_type
    } = req.body;
    
    // Check for existing pending request
    const [existing] = await pool.execute(
      `SELECT id FROM parent_verification_requests 
       WHERE parent_phone = ? AND request_status = 'pending' 
       AND student_first_name = ? AND student_last_name = ?`,
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
    
    if (student_code) {
      const [students] = await pool.execute(
        'SELECT student_id, student_code FROM global_student_sheets WHERE student_id = ? OR student_code = ?',
        [student_code, student_code]
      );
      if (students.length > 0) {
        foundStudentId = students[0].student_id;
        foundStudentCode = students[0].student_code;
      }
    }
    
    const verificationCode = generateLinkCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // Check if parent profile exists
    const [parentProfiles] = await pool.execute(
      'SELECT parent_id FROM parent_profiles WHERE phone = ?',
      [parent_phone]
    );
    
    const parentId = parentProfiles.length > 0 ? parentProfiles[0].parent_id : null;
    
    const [result] = await pool.execute(`
      INSERT INTO parent_verification_requests 
      (parent_phone, parent_email, parent_name, student_id, student_name, student_code, 
       student_trade, student_level, relationship_type, verification_code, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parent_phone, parent_email, parent_name,
      foundStudentId, `${student_first_name} ${student_last_name}`, foundStudentCode,
      student_trade, student_level, relationship_type || 'guardian',
      verificationCode, expiresAt
    ]);
    
    // In production, send SMS with verification code
    console.log(`[SMS] Verification code ${verificationCode} sent to ${parent_phone}`);
    
    res.json({
      success: true,
      message: 'Verification code sent to your phone. Please enter it to complete the request.',
      request_id: result.insertId,
      expires_in: '48 hours'
    });
  } catch (error) {
    console.error('Request Link Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify and complete linking request
router.post('/verify-link', async (req, res) => {
  try {
    const { request_id, verification_code } = req.body;
    
    const [requests] = await pool.execute(
      'SELECT * FROM parent_verification_requests WHERE id = ? AND verification_code = ?',
      [request_id, verification_code]
    );
    
    if (requests.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    
    const request = requests[0];
    
    if (new Date(request.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }
    
    if (request.request_status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request has already been ${request.request_status}` });
    }
    
    // Update verification status
    await pool.execute(
      'UPDATE parent_verification_requests SET verification_status = ?, request_status = ? WHERE id = ?',
      ['verified', 'pending', request_id]
    );
    
    res.json({
      success: true,
      message: 'Verification successful! Your request has been submitted for school approval.',
      student_name: request.student_name
    });
  } catch (error) {
    console.error('Verify Link Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADMIN SIDE - APPROVE/REJECT REQUESTS
// ============================================

// Get pending linking requests
router.get('/pending-requests', authenticateToken, requireRole(['admin', 'dod', 'dos', 'matron', 'patron']), async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    
    const [requests] = await pool.execute(`
      SELECT pvr.*, gss.trade_code, gss.level_number
      FROM parent_verification_requests pvr
      LEFT JOIN global_student_sheets gss ON pvr.student_id = gss.student_id
      WHERE pvr.request_status = ?
      ORDER BY pvr.created_at DESC
      LIMIT ? OFFSET ?
    `, [status, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]);
    
    const [[{ total }]] = await pool.execute(
      "SELECT COUNT(*) as total FROM parent_verification_requests WHERE request_status = ?",
      [status]
    );
    
    res.json({
      success: true,
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Pending Requests Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve linking request
router.post('/approve/:requestId', authenticateToken, requireRole(['admin', 'dod', 'dos', 'matron', 'patron']), async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const [requests] = await pool.execute(
      'SELECT * FROM parent_verification_requests WHERE id = ?',
      [requestId]
    );
    
    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    const request = requests[0];
    
    // Get or create parent profile
    let [parentProfiles] = await pool.execute(
      'SELECT parent_id FROM parent_profiles WHERE phone = ?',
      [request.parent_phone]
    );
    
    let parentId;
    
    if (parentProfiles.length === 0) {
      // Create new parent profile
      parentId = 'PAR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      await pool.execute(`
        INSERT INTO parent_profiles (parent_id, first_name, last_name, phone, email, relationship_to_student)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [parentId, request.parent_name.split(' ')[0], request.parent_name.split(' ').slice(1).join(' ') || '', request.parent_phone, request.parent_email, request.relationship_type]);
    } else {
      parentId = parentProfiles[0].parent_id;
    }
    
    // Create the link
    await pool.execute(`
      INSERT INTO student_parent_links 
      (student_id, parent_id, relationship_type, is_primary, link_status, approved_by, approved_at)
      VALUES (?, ?, ?, ?, 'active', ?, NOW())
    `, [request.student_id, parentId, request.relationship_type, request.is_primary || false, req.user.id]);
    
    // Update request status
    await pool.execute(
      'UPDATE parent_verification_requests SET request_status = ?, admin_notes = ?, approved_by = ? WHERE id = ?',
      ['approved', 'Approved by ' + req.user.role, req.user.id, requestId]
    );
    
    res.json({
      success: true,
      message: 'Parent linking request approved successfully',
      parent_id: parentId,
      student_id: request.student_id
    });
  } catch (error) {
    console.error('Approve Request Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject linking request
router.post('/reject/:requestId', authenticateToken, requireRole(['admin', 'dod', 'dos', 'matron', 'patron']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    await pool.execute(`
      UPDATE parent_verification_requests 
      SET request_status = ?, admin_notes = ?
      WHERE id = ?
    `, ['rejected', reason || 'Rejected by administrator', requestId]);
    
    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    console.error('Reject Request Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DIRECT LINKING (BY ADMIN/STAFF)
// ============================================

// Grant parent access directly
router.post('/grant-access', authenticateToken, requireRole(['admin', 'dod', 'dos', 'matron', 'patron']), async (req, res) => {
  try {
    const {
      student_id, parent_phone, parent_name, parent_email,
      relationship_type, is_primary, is_emergency_contact,
      can_view_grades, can_view_attendance, can_view_discipline, can_view_fees,
      can_receive_notifications, can_receive_sms, can_receive_email, can_receive_whatsapp
    } = req.body;
    
    // Check if student exists
    const [students] = await pool.execute(
      'SELECT student_id FROM global_student_sheets WHERE student_id = ?',
      [student_id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get or create parent profile
    let [parentProfiles] = await pool.execute(
      'SELECT parent_id FROM parent_profiles WHERE phone = ?',
      [parent_phone]
    );
    
    let parentId;
    
    if (parentProfiles.length === 0) {
      parentId = 'PAR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const names = parent_name.split(' ');
      await pool.execute(`
        INSERT INTO parent_profiles (parent_id, first_name, last_name, phone, email)
        VALUES (?, ?, ?, ?, ?)
      `, [parentId, names[0], names.slice(1).join(' ') || '', parent_phone, parent_email]);
    } else {
      parentId = parentProfiles[0].parent_id;
    }
    
    // Check if link already exists
    const [existingLinks] = await pool.execute(
      'SELECT id FROM student_parent_links WHERE student_id = ? AND parent_id = ?',
      [student_id, parentId]
    );
    
    if (existingLinks.length > 0) {
      // Update existing link
      await pool.execute(`
        UPDATE student_parent_links 
        SET relationship_type = ?, is_primary = ?, is_emergency_contact = ?,
            can_view_grades = ?, can_view_attendance = ?, can_view_discipline = ?,
            can_view_fees = ?, can_receive_notifications = ?, can_receive_sms = ?,
            can_receive_email = ?, can_receive_whatsapp = ?, link_status = 'active',
            approved_by = ?, approved_at = NOW()
        WHERE student_id = ? AND parent_id = ?
      `, [
        relationship_type || 'guardian', is_primary || false, is_emergency_contact || false,
        can_view_grades !== false, can_view_attendance !== false, can_view_discipline !== false,
        can_view_fees !== false, can_receive_notifications !== false, can_receive_sms !== false,
        can_receive_email !== false, can_receive_whatsapp === true,
        req.user.id, student_id, parentId
      ]);
      
      return res.json({ success: true, message: 'Parent access updated successfully', link_id: existingLinks[0].id });
    }
    
    // Create new link
    const [result] = await pool.execute(`
      INSERT INTO student_parent_links 
      (student_id, parent_id, relationship_type, is_primary, is_emergency_contact,
       can_view_grades, can_view_attendance, can_view_discipline, can_view_fees,
       can_receive_notifications, can_receive_sms, can_receive_email, can_receive_whatsapp,
       link_status, linked_by, linked_by_role, approved_by, approved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, NOW())
    `, [
      student_id, parentId, relationship_type || 'guardian', is_primary || false, is_emergency_contact || false,
      can_view_grades !== false, can_view_attendance !== false, can_view_discipline !== false,
      can_view_fees !== false, can_receive_notifications !== false, can_receive_sms !== false,
      can_receive_email !== false, can_receive_whatsapp === true,
      req.user.id, req.user.role, req.user.id
    ]);
    
    res.json({
      success: true,
      message: 'Parent access granted successfully',
      link_id: result.insertId,
      parent_id: parentId
    });
  } catch (error) {
    console.error('Grant Access Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// QUERY FUNCTIONS
// ============================================

// Get all parent connections for a student
router.get('/student/:studentId/parents', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Students can view their own parents
    // Staff can view parents if they have access
    const [links] = await pool.execute(`
      SELECT spl.*, 
             pp.first_name, pp.last_name, pp.phone, pp.email, pp.whatsapp_number,
             pp.relationship_to_student, pp.preferred_language
      FROM student_parent_links spl
      JOIN parent_profiles pp ON spl.parent_id = pp.parent_id
      WHERE spl.student_id = ? AND spl.link_status = 'active'
      ORDER BY spl.is_primary DESC, spl.emergency_priority ASC
    `, [studentId]);
    
    res.json({
      success: true,
      parents: links.map(link => ({
        link_id: link.id,
        parent: {
          id: link.parent_id,
          name: `${link.first_name} ${link.last_name}`,
          phone: link.phone,
          email: link.email,
          whatsapp: link.whatsapp_number
        },
        relationship: link.relationship_type,
        is_primary: link.is_primary,
        is_emergency_contact: link.is_emergency_contact,
        permissions: {
          view_grades: link.can_view_grants,
          view_attendance: link.can_view_attendance,
          view_discipline: link.can_view_discipline,
          view_fees: link.can_view_fees,
          receive_notifications: link.can_receive_notifications
        },
        approved_at: link.approved_at,
        linked_at: link.created_at
      }))
    });
  } catch (error) {
    console.error('Get Student Parents Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all children for a parent
router.get('/parent/:parentId/children', authenticateToken, async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // Verify parent access
    if (req.user.role === 'parent' && req.user.parentId !== parentId && req.user.username !== parentId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const [links] = await pool.execute(`
      SELECT spl.*, 
             gs.student_id, gs.student_code, gs.first_name, gs.last_name,
             gs.trade_code, gs.level_number, gs.gpa, gs.attendance_percentage
      FROM student_parent_links spl
      JOIN global_student_sheets gs ON spl.student_id = gs.student_id
      WHERE spl.parent_id = ? AND spl.link_status = 'active'
    `, [parentId]);
    
    res.json({
      success: true,
      children: links.map(link => ({
        link_id: link.id,
        student: {
          id: link.student_id,
          code: link.student_code,
          name: `${link.first_name} ${link.last_name}`,
          trade: link.trade_code,
          level: link.level_number
        },
        relationship: link.relationship_type,
        permissions: {
          view_grades: link.can_view_grades,
          view_attendance: link.can_view_attendance,
          view_discipline: link.can_view_discipline,
          view_fees: link.can_view_fees
        }
      }))
    });
  } catch (error) {
    console.error('Get Parent Children Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// UPDATE/REVOKE FUNCTIONS
// ============================================

// Update parent access
router.put('/connections/:linkId', authenticateToken, requireRole(['admin', 'dod', 'dos', 'matron', 'patron']), async (req, res) => {
  try {
    const { linkId } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'relationship_type', 'is_primary', 'is_emergency_contact',
      'can_view_grades', 'can_view_attendance', 'can_view_discipline', 'can_view_fees',
      'can_receive_notifications', 'can_receive_sms', 'can_receive_email', 'can_receive_whatsapp'
    ];
    
    const setClause = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = ?`);
        values.push(field.startsWith('can_') ? updates[field] !== false : updates[field]);
      }
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    
    setClause.push('updated_at = NOW()');
    values.push(linkId);
    
    await pool.execute(
      `UPDATE student_parent_links SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ success: true, message: 'Parent access updated successfully' });
  } catch (error) {
    console.error('Update Connection Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Revoke parent access
router.post('/revoke/:linkId', authenticateToken, requireRole(['admin', 'dod', 'dos', 'matron', 'patron']), async (req, res) => {
  try {
    const { linkId } = req.params;
    const { reason } = req.body;
    
    await pool.execute(`
      UPDATE student_parent_links 
      SET link_status = 'revoked', revocation_reason = ?, revoked_by = ?, revoked_at = NOW()
      WHERE id = ?
    `, [reason || 'Revoked by administrator', req.user.id, linkId]);
    
    res.json({ success: true, message: 'Parent access revoked successfully' });
  } catch (error) {
    console.error('Revoke Access Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all connections (for admin dashboard)
router.get('/connections', authenticateToken, requireRole(['admin', 'dod', 'dos', 'matron', 'patron']), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    
    let query = `
      SELECT spl.*, 
             gs.first_name as student_first_name, gs.last_name as student_name, gs.student_code,
             pp.first_name as parent_first_name, pp.last_name as parent_name, pp.phone as parent_phone
      FROM student_parent_links spl
      LEFT JOIN global_student_sheets gs ON spl.student_id = gs.student_id
      LEFT JOIN parent_profiles pp ON spl.parent_id = pp.parent_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND spl.link_status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR pp.first_name LIKE ? OR pp.last_name LIKE ? OR pp.phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY spl.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const [connections] = await pool.execute(query, params);
    
    res.json({ success: true, connections });
  } catch (error) {
    console.error('Get Connections Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

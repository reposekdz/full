// ═══════════════════════════════════════════════════════════════════════════
// PARENT-CHILD LINKING SYSTEM - COMPREHENSIVE API
// ═══════════════════════════════════════════════════════════════════════════
// Features:
// 1. Parent submits linking request (no student code required)
// 2. DOD views all pending applications
// 3. DOD approves/rejects from global sheets
// 4. Parent gets full access to child data after approval
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendSMS } = require('../utils/smsService');
const { 
  sendLinkApprovalSMS, 
  sendApplicationSubmittedSMS, 
  sendApplicationRejectedSMS 
} = require('../services/parentNotificationService');

// ═══════════════════════════════════════════════════════════════════════════
// PARENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Submit Linking Application ────────────────────────────────────────────
router.post('/submit-application', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const {
      child_first_name,
      child_last_name,
      child_gender,
      child_trade_code,
      child_level_number,
      relationship = 'parent',
      notes = ''
    } = req.body;

    // Validation
    if (!child_first_name || !child_last_name || !child_gender || !child_trade_code || !child_level_number) {
      return res.status(400).json({
        success: false,
        message: 'Uzuza amakuru yose: izina, irindi zina, igitsina, umwuga, n\'urwego'
      });
    }

    // Check for duplicate application
    const [[existing]] = await pool.execute(`
      SELECT id FROM parent_linking_applications
      WHERE parent_id = ? 
      AND LOWER(child_first_name) = LOWER(?)
      AND LOWER(child_last_name) = LOWER(?)
      AND child_trade_code = ?
      AND child_level_number = ?
      AND status IN ('pending', 'approved')
      LIMIT 1
    `, [parentId, child_first_name, child_last_name, child_trade_code, child_level_number]);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Warasabye guhuza n\'uyu mwana. Tegereza inyemezwa.'
      });
    }

    // Call stored procedure
    const [result] = await pool.execute(
      `CALL sp_submit_parent_linking_application(?, ?, ?, ?, ?, ?, ?, ?, @app_id, @student_id, @status)`,
      [parentId, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, relationship, notes]
    );

    // Get output parameters
    const [[output]] = await pool.execute('SELECT @app_id as application_id, @student_id as matched_student_id, @status as status');

    if (output.status === 'no_match') {
      // Add to waiting list instead of showing error
      await pool.execute(`
        INSERT INTO parent_waiting_list (parent_id, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, relationship, notes, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting', NOW())
      `, [parentId, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, relationship, notes]);

      return res.json({
        success: true,
        status: 'waiting',
        message: 'Student not found in current records. Your request has been added to the waiting list. You will be notified when the student is enrolled.',
        application_id: output.application_id,
        waiting_list: true
      });
    }

    // Notify DOD/DOS/Headmaster
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      SELECT id, 'New Parent Linking Request', 
             CONCAT('Parent requests to link with student: ', ?, ' ', ?), 
             'parent_link_request', NOW()
      FROM users
      WHERE role IN ('dod', 'dos', 'headmaster', 'admin') AND status = 'active'
    `, [child_first_name, child_last_name]);

    // Send comprehensive SMS to parent confirming application submission
    try {
      await sendApplicationSubmittedSMS(parentId, child_first_name + ' ' + child_last_name, output.application_id);
      console.log('✅ Application submitted SMS sent to parent');
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError);
    }

    res.json({
      success: true,
      message: 'Application submitted successfully! Please wait for staff approval.',
      application_id: output.application_id,
      matched_student_id: output.matched_student_id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get My Waiting List Applications ──────────────────────────────────────
router.get('/my-waiting-list', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [waitingList] = await pool.execute(`
      SELECT 
        pwl.*,
        CASE 
          WHEN pwl.status = 'waiting' THEN 'Tegereza'
          WHEN pwl.status = 'matched' THEN 'Hasanze'
          WHEN pwl.status = 'expired' THEN 'Byarangiye'
          ELSE pwl.status
        END as status_kinyarwanda
      FROM parent_waiting_list pwl
      WHERE pwl.parent_id = ?
      ORDER BY pwl.created_at DESC
    `, [parentId]);

    res.json({
      success: true,
      waiting_list: waitingList,
      total: waitingList.length,
      waiting: waitingList.filter(w => w.status === 'waiting').length,
      matched: waitingList.filter(w => w.status === 'matched').length
    });
  } catch (error) {
    console.error('Get waiting list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Advanced Student Search for Waiting List ─────────────────────────────
router.post('/search-students-advanced', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { search_term, trade_code, level_number, gender } = req.body;

    let query = `
      SELECT 
        id, student_code, first_name, last_name, 
        CONCAT(first_name, ' ', last_name) as full_name,
        trade_name, trade_code, level_number, gender,
        profile_image, class_name
      FROM global_student_sheets
      WHERE 1=1
    `;
    const params = [];

    if (search_term) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ?)`;
      params.push(`%${search_term}%`, `%${search_term}%`, `%${search_term}%`);
    }
    if (trade_code) {
      query += ` AND trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND level_number = ?`;
      params.push(level_number);
    }
    if (gender) {
      query += ` AND gender = ?`;
      params.push(gender);
    }

    query += ` ORDER BY first_name, last_name LIMIT 50`;

    const [students] = await pool.execute(query, params);

    res.json({
      success: true,
      students,
      total: students.length
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Submit Direct Linking Request (from search) ──────────────────────────
router.post('/submit-direct-linking', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const {
      student_id,
      relationship = 'parent',
      notes = ''
    } = req.body;

    // Get student details
    const [[student]] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE id = ?
    `, [student_id]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if already linked or requested
    const [[existing]] = await pool.execute(`
      SELECT * FROM parent_linking_applications 
      WHERE parent_id = ? AND matched_student_id = ? AND status IN ('pending', 'approved')
    `, [parentId, student_id]);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have a request for this student'
      });
    }

    // Create application
    const [result] = await pool.execute(`
      INSERT INTO parent_linking_applications 
      (parent_id, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, 
       relationship, notes, matched_student_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [parentId, student.first_name, student.last_name, student.gender, student.trade_code, student.level_number, relationship, notes, student_id]);

    // Notify staff
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      SELECT id, 'New Parent Linking Request', 
             CONCAT('Parent requests to link with student: ', ?, ' ', ?, ' (', ?, ')')  , 
             'parent_link_request', NOW()
      FROM users
      WHERE role IN ('dod', 'dos', 'headmaster', 'admin') AND status = 'active'
    `, [student.first_name, student.last_name, student.student_code]);

    // Send comprehensive SMS to parent
    try {
      await sendApplicationSubmittedSMS(parentId, student.first_name + ' ' + student.last_name, result.insertId);
      console.log('✅ Direct linking SMS sent to parent');
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError);
    }

    res.json({
      success: true,
      message: 'Linking request submitted successfully!',
      application_id: result.insertId,
      student: student
    });
  } catch (error) {
    console.error('Direct linking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/my-applications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [applications] = await pool.execute(`
      SELECT 
        pla.*,
        gss.student_code,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        gss.level_number,
        gss.class_name,
        gss.profile_image,
        CASE 
          WHEN pla.status = 'pending' THEN 'Tegereza'
          WHEN pla.status = 'approved' THEN 'Byemejwe'
          WHEN pla.status = 'rejected' THEN 'Byanze'
          ELSE pla.status
        END as status_kinyarwanda
      FROM parent_linking_applications pla
      LEFT JOIN global_student_sheets gss ON pla.matched_student_id = gss.id
      WHERE pla.parent_id = ?
      ORDER BY pla.created_at DESC
    `, [parentId]);

    res.json({
      success: true,
      applications,
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Delete Application (Parent can delete their own pending application) ────
router.delete('/delete-application/:applicationId', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this application and it's pending
    const [[app]] = await pool.execute(`
      SELECT * FROM parent_linking_applications 
      WHERE id = ? AND parent_id = ? AND status = 'pending'
    `, [applicationId, parentId]);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or cannot be deleted'
      });
    }

    // Delete the application
    await pool.execute(`
      DELETE FROM parent_linking_applications WHERE id = ?
    `, [applicationId]);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get My Linked Children ────────────────────────────────────────────────
router.get('/my-children', authenticateToken, requireRole(['parent']), async (req, res) => {
  const parentId = req.user.userId;
  
  try {
    const [children] = await pool.execute(`
      SELECT 
        pcl.*,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        gss.trade_name,
        gss.trade_code,
        gss.level_number,
        gss.class_name,
        gss.gender,
        gss.phone,
        gss.email,
        gss.conduct_score,
        gss.overall_attendance_percentage,
        gss.profile_image,
        gss.date_of_birth,
        gss.address
      FROM parent_child_links pcl
      INNER JOIN global_student_sheets gss ON pcl.student_id = gss.id
      WHERE pcl.parent_id = ? AND pcl.status = 'active'
      ORDER BY gss.first_name, gss.last_name
    `, [parentId]);

    return res.status(200).json({
      success: true,
      children: children || [],
      total: (children || []).length
    });
  } catch (error) {
    console.error('Get my children error:', error.message);
    return res.status(200).json({
      success: true,
      children: [],
      total: 0
    });
  }
});

// ─── Get Child Full Data ───────────────────────────────────────────────────
router.get('/child/:studentId/full-data', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { studentId } = req.params;

    // Verify parent has access to this child
    const [[link]] = await pool.execute(`
      SELECT * FROM parent_child_links
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, studentId]);

    if (!link) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this student\'s data'
      });
    }

    // Get student basic info
    const [[student]] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE id = ?
    `, [studentId]);

    // Get discipline records (if permission granted)
    let discipline = [];
    if (link.can_view_discipline) {
      [discipline] = await pool.execute(`
        SELECT * FROM student_conduct_records
        WHERE student_id = ?
        ORDER BY incident_date DESC
        LIMIT 20
      `, [studentId]);
    }

    // Get attendance (if permission granted)
    let attendance = [];
    if (link.can_view_attendance) {
      [attendance] = await pool.execute(`
        SELECT * FROM attendance
        WHERE student_id = ?
        ORDER BY date DESC
        LIMIT 30
      `, [studentId]);
    }

    // Get marks (if permission granted)
    let marks = [];
    if (link.can_view_marks) {
      [marks] = await pool.execute(`
        SELECT * FROM marks
        WHERE student_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `, [studentId]);
    }

    // Get fees (if permission granted)
    let fees = null;
    if (link.can_view_fees) {
      [[fees]] = await pool.execute(`
        SELECT 
          SUM(amount) as total_fees,
          SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid,
          SUM(CASE WHEN payment_status != 'paid' THEN amount ELSE 0 END) as balance
        FROM student_fees
        WHERE student_id = ?
      `, [studentId]);
    }

    // Get messages (if permission granted)
    let messages = [];
    if (link.can_view_messages) {
      [messages] = await pool.execute(`
        SELECT * FROM parent_messages
        WHERE student_id = ? AND parent_id = ?
        ORDER BY created_at DESC
        LIMIT 20
      `, [studentId, parentId]);
    }

    // Get assignments (if permission granted)
    let assignments = [];
    if (link.can_view_assignments) {
      [assignments] = await pool.execute(`
        SELECT * FROM assignments
        WHERE student_id = ?
        ORDER BY due_date DESC
        LIMIT 20
      `, [studentId]);
    }

    // Update last accessed
    await pool.execute(`
      UPDATE parent_child_links
      SET last_accessed_at = NOW()
      WHERE id = ?
    `, [link.id]);

    res.json({
      success: true,
      student,
      discipline,
      attendance,
      marks,
      fees,
      messages,
      assignments,
      permissions: {
        can_view_marks: link.can_view_marks,
        can_view_attendance: link.can_view_attendance,
        can_view_discipline: link.can_view_discipline,
        can_view_conduct: link.can_view_conduct,
        can_view_fees: link.can_view_fees,
        can_view_messages: link.can_view_messages,
        can_view_timetable: link.can_view_timetable,
        can_view_assignments: link.can_view_assignments,
        can_view_report_cards: link.can_view_report_cards,
        can_make_payments: link.can_make_payments
      }
    });
  } catch (error) {
    console.error('Get child full data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get Available Trades ──────────────────────────────────────────────────
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT DISTINCT trade_code, trade_name
      FROM global_student_sheets
      WHERE status = 'active' AND trade_code IS NOT NULL AND trade_name IS NOT NULL
      ORDER BY trade_name
    `);

    res.json({ success: true, trades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get Available Levels ──────────────────────────────────────────────────
router.get('/levels', async (req, res) => {
  try {
    const { trade_code } = req.query;

    let query = `
      SELECT DISTINCT level_number
      FROM global_student_sheets
      WHERE status = 'active' AND level_number IS NOT NULL
    `;
    const params = [];

    if (trade_code) {
      query += ` AND trade_code = ?`;
      params.push(trade_code);
    }

    // Only show levels 3 and 4
    query += ` AND level_number >= 3 AND level_number <= 4`;
    query += ` ORDER BY level_number`;

    const [levels] = await pool.execute(query, params);

    res.json({
      success: true,
      levels: levels.map(l => l.level_number)
    });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DOD/STAFF ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Get All Pending Applications ──────────────────────────────────────────
router.get('/pending-applications', authenticateToken, requireRole(['dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin']), async (req, res) => {
  try {
    // Check if table exists first
    const [tables] = await pool.execute(`
      SHOW TABLES LIKE 'parent_linking_applications'
    `);

    if (tables.length === 0) {
      // Table doesn't exist, return empty array
      return res.json({
        success: true,
        applications: [],
        total: 0
      });
    }

    const [applications] = await pool.execute(`
      SELECT 
        pla.*,
        gss.student_code,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        gss.level_number,
        gss.class_name,
        gss.profile_image,
        u.first_name as parent_first_name,
        u.last_name as parent_last_name,
        u.email as parent_email,
        u.phone as parent_phone
      FROM parent_linking_applications pla
      LEFT JOIN global_student_sheets gss ON pla.matched_student_id = gss.id
      LEFT JOIN users u ON pla.parent_id = u.id
      WHERE pla.status = 'pending'
      ORDER BY pla.created_at DESC
    `);

    res.json({
      success: true,
      applications,
      total: applications.length
    });
  } catch (error) {
    console.error('Get pending applications error:', error);
    // Return empty array instead of error to prevent frontend crash
    res.json({
      success: true,
      applications: [],
      total: 0,
      error: error.message
    });
  }
});

// ─── Get All Applications (with filters) ───────────────────────────────────
router.get('/all-applications', authenticateToken, requireRole(['dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { status, trade_code, level_number, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        pla.*,
        gss.student_code,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        gss.level_number,
        gss.class_name,
        gss.profile_image,
        u.first_name as parent_user_first_name,
        u.last_name as parent_user_last_name,
        u.email as parent_user_email,
        u.phone as parent_user_phone
      FROM parent_linking_applications pla
      LEFT JOIN global_student_sheets gss ON pla.matched_student_id = gss.id
      LEFT JOIN users u ON pla.parent_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND pla.status = ?`;
      params.push(status);
    }

    if (trade_code) {
      query += ` AND pla.child_trade_code = ?`;
      params.push(trade_code);
    }

    if (level_number) {
      query += ` AND pla.child_level_number = ?`;
      params.push(parseInt(level_number));
    }

    query += ` ORDER BY pla.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [applications] = await pool.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM parent_linking_applications WHERE 1=1`;
    const countParams = [];

    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    if (trade_code) {
      countQuery += ` AND child_trade_code = ?`;
      countParams.push(trade_code);
    }

    if (level_number) {
      countQuery += ` AND child_level_number = ?`;
      countParams.push(parseInt(level_number));
    }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      applications,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Approve Application ───────────────────────────────────────────────────
router.post('/approve/:applicationId', authenticateToken, requireRole(['dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const staffId = req.user.userId;
    const staffName = `${req.user.first_name} ${req.user.last_name}`;
    const staffRole = req.user.role;

    // Get application details first
    const [[app]] = await pool.execute(`
      SELECT pla.*, gss.first_name, gss.last_name, gss.student_code, gss.trade_name, gss.level_number
      FROM parent_linking_applications pla
      LEFT JOIN global_student_sheets gss ON pla.matched_student_id = gss.id
      WHERE pla.id = ?
    `, [applicationId]);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Call stored procedure
    await pool.execute(
      `CALL sp_approve_parent_linking_application(?, ?, ?, ?, @link_id, @success)`,
      [parseInt(applicationId), staffId, staffName, staffRole]
    );

    // Get output parameters
    const [[output]] = await pool.execute('SELECT @link_id as link_id, @success as success');

    if (!output.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to approve application. Application may not exist or already processed.'
      });
    }

    // Notify parent in database
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      VALUES (?, 'Linking Request Approved', 
              CONCAT('Your request to link with ', ?, ' ', ?, ' has been approved. You can now view their information.'),
              'parent_link_approved', NOW())
    `, [app.parent_id, app.first_name, app.last_name]);

    // Send comprehensive SMS to parent confirming approval
    try {
      await sendLinkApprovalSMS(app.parent_id, app.matched_student_id, applicationId);
      console.log('✅ Link approval SMS sent to parent');
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError);
    }

    res.json({
      success: true,
      message: 'Application approved successfully! Parent notified via SMS.',
      link_id: output.link_id,
      sms_sent: parentUser && parentUser.phone ? true : false,
      student_info: {
        name: `${app.first_name} ${app.last_name}`,
        code: app.student_code,
        trade: app.trade_name,
        level: app.level_number
      }
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Reject Application ────────────────────────────────────────────────────
router.post('/reject/:applicationId', authenticateToken, requireRole(['dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { rejection_reason } = req.body;
    const staffId = req.user.userId;
    const staffName = `${req.user.first_name} ${req.user.last_name}`;
    const staffRole = req.user.role;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Call stored procedure
    await pool.execute(
      `CALL sp_reject_parent_linking_application(?, ?, ?, ?, ?, @success)`,
      [parseInt(applicationId), staffId, staffName, staffRole, rejection_reason]
    );

    // Get output parameter
    const [[output]] = await pool.execute('SELECT @success as success');

    if (!output.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to reject application. Application may not exist or already processed.'
      });
    }

    // Get application details for notification
    const [[app]] = await pool.execute(`
      SELECT * FROM parent_linking_applications WHERE id = ?
    `, [applicationId]);

    // Notify parent
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      VALUES (?, 'Linking Request Rejected', 
              CONCAT('Your linking request was rejected. Reason: ', ?),
              'parent_link_rejected', NOW())
    `, [app.parent_id, rejection_reason]);

    // Send comprehensive SMS to parent about rejection
    try {
      await sendApplicationRejectedSMS(app.parent_id, app.child_first_name + ' ' + app.child_last_name, rejection_reason, applicationId);
      console.log('✅ Rejection SMS sent to parent');
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError);
    }

    res.json({
      success: true,
      message: 'Application rejected successfully. Parent has been notified.'
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get Application Details ───────────────────────────────────────────────
router.get('/application/:applicationId', authenticateToken, requireRole(['dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin', 'parent']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const [[application]] = await pool.execute(`
      SELECT 
        pla.*,
        gss.student_code,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        gss.level_number,
        gss.class_name,
        gss.profile_image,
        gss.phone as student_phone,
        gss.email as student_email,
        u.first_name as parent_user_first_name,
        u.last_name as parent_user_last_name,
        u.email as parent_user_email,
        u.phone as parent_user_phone
      FROM parent_linking_applications pla
      LEFT JOIN global_student_sheets gss ON pla.matched_student_id = gss.id
      LEFT JOIN users u ON pla.parent_id = u.id
      WHERE pla.id = ?
    `, [applicationId]);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // If parent, verify they own this application
    if (userRole === 'parent' && application.parent_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get Statistics ────────────────────────────────────────────────────────
router.get('/statistics', authenticateToken, requireRole(['dod', 'director_discipline', 'dos', 'director_study', 'headmaster', 'admin']), async (req, res) => {
  try {
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN matched_student_id IS NOT NULL THEN 1 ELSE 0 END) as matched,
        SUM(CASE WHEN matched_student_id IS NULL THEN 1 ELSE 0 END) as unmatched
      FROM parent_linking_applications
    `);

    const [[linkStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_links,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_links,
        COUNT(DISTINCT parent_id) as unique_parents,
        COUNT(DISTINCT student_id) as unique_students
      FROM parent_child_links
    `);

    res.json({
      success: true,
      applications: stats,
      links: linkStats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

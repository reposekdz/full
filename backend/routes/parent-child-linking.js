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

    // Call stored procedure
    const [result] = await pool.execute(
      `CALL sp_submit_parent_linking_application(?, ?, ?, ?, ?, ?, ?, ?, @app_id, @student_id, @status)`,
      [parentId, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, relationship, notes]
    );

    // Get output parameters
    const [[output]] = await pool.execute('SELECT @app_id as application_id, @student_id as matched_student_id, @status as status');

    if (output.status === 'no_match') {
      return res.status(404).json({
        success: false,
        message: 'No student found matching the provided information. Please verify the details and try again.',
        application_id: output.application_id
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

    // Send SMS to parent confirming application submission
    const [[parentUser]] = await pool.execute('SELECT phone FROM users WHERE id = ?', [parentId]);
    if (parentUser && parentUser.phone) {
      await sendSMS(
        parentUser.phone,
        `Garden TVET: Icyifuzo cyo guhuza umwana ${child_first_name} ${child_last_name} cyoherejwe neza. Tegereza inyemezwa y'abakozi b'ishuri.`
      );
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

// ─── Get My Applications ───────────────────────────────────────────────────
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

// ─── Get My Linked Children ────────────────────────────────────────────────
router.get('/my-children', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.userId;

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

    res.json({
      success: true,
      children,
      total: children.length
    });
  } catch (error) {
    console.error('Get my children error:', error);
    res.status(500).json({ success: false, message: error.message });
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

    // Get application details for notification
    const [[app]] = await pool.execute(`
      SELECT pla.*, gss.first_name, gss.last_name
      FROM parent_linking_applications pla
      LEFT JOIN global_student_sheets gss ON pla.matched_student_id = gss.id
      WHERE pla.id = ?
    `, [applicationId]);

    // Notify parent
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      VALUES (?, 'Linking Request Approved', 
              CONCAT('Your request to link with ', ?, ' ', ?, ' has been approved. You can now view their information.'),
              'parent_link_approved', NOW())
    `, [app.parent_id, app.first_name, app.last_name]);

    // Send SMS to parent confirming approval
    const [[parentUser]] = await pool.execute('SELECT phone FROM users WHERE id = ?', [app.parent_id]);
    if (parentUser && parentUser.phone) {
      await sendSMS(
        parentUser.phone,
        `Garden TVET: Icyifuzo cyo guhuza umwana ${app.first_name} ${app.last_name} cyemejwe! Ubu ushobora kureba amakuru yabo yose.`
      );
    }

    res.json({
      success: true,
      message: 'Application approved successfully! Parent can now access child data.',
      link_id: output.link_id
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

    // Send SMS to parent about rejection
    const [[parentUser]] = await pool.execute('SELECT phone FROM users WHERE id = ?', [app.parent_id]);
    if (parentUser && parentUser.phone) {
      await sendSMS(
        parentUser.phone,
        `Garden TVET: Icyifuzo cyo guhuza umwana cyanze. Impamvu: ${rejection_reason}`
      );
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

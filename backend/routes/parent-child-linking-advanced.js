const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all applications (DOD/Admin)
router.get('/all-applications', authenticateToken, requireRole(['dod', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [applications] = await db.execute(`
      SELECT 
        pla.*,
        CONCAT(u.first_name, ' ', u.last_name) as parent_name,
        u.phone as parent_phone,
        u.email as parent_email,
        gss.id as matched_student_id,
        CONCAT(gss.first_name, ' ', gss.last_name) as matched_student_name,
        gss.student_code as matched_student_code,
        gss.conduct_score,
        gss.attendance_percentage,
        reviewer.username as reviewed_by_name
      FROM parent_linking_applications pla
      LEFT JOIN users u ON pla.parent_id = u.id
      LEFT JOIN global_student_sheets gss ON 
        gss.first_name = pla.child_first_name AND
        gss.last_name = pla.child_last_name AND
        gss.gender = pla.child_gender AND
        gss.trade_code = pla.child_trade_code AND
        gss.level_number = pla.child_level_number
      LEFT JOIN users reviewer ON pla.reviewed_by = reviewer.id
      ORDER BY 
        CASE pla.status 
          WHEN 'pending' THEN 1 
          WHEN 'approved' THEN 2 
          WHEN 'rejected' THEN 3 
        END,
        pla.submitted_at DESC
    `);

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// Get pending applications
router.get('/pending-applications', authenticateToken, requireRole(['dod', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [applications] = await db.execute(`
      SELECT 
        pla.*,
        CONCAT(u.first_name, ' ', u.last_name) as parent_name,
        u.phone as parent_phone,
        u.email as parent_email,
        gss.id as matched_student_id,
        CONCAT(gss.first_name, ' ', gss.last_name) as matched_student_name,
        gss.student_code as matched_student_code
      FROM parent_linking_applications pla
      LEFT JOIN users u ON pla.parent_id = u.id
      LEFT JOIN global_student_sheets gss ON 
        gss.first_name = pla.child_first_name AND
        gss.last_name = pla.child_last_name AND
        gss.gender = pla.child_gender AND
        gss.trade_code = pla.child_trade_code AND
        gss.level_number = pla.child_level_number
      WHERE pla.status = 'pending'
      ORDER BY pla.submitted_at DESC
    `);

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending applications' });
  }
});

// Approve application
router.post('/approve/:applicationId', authenticateToken, requireRole(['dod', 'admin', 'headmaster']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { applicationId } = req.params;
    const reviewerId = req.user.id;

    // Get application details
    const [applications] = await connection.execute(
      'SELECT * FROM parent_linking_applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const application = applications[0];

    if (application.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Application already processed' });
    }

    // Find matching student
    const [students] = await connection.execute(`
      SELECT id, student_code, CONCAT(first_name, ' ', last_name) as full_name
      FROM global_student_sheets
      WHERE first_name = ? AND last_name = ? AND gender = ? 
        AND trade_code = ? AND level_number = ?
      LIMIT 1
    `, [
      application.child_first_name,
      application.child_last_name,
      application.child_gender,
      application.child_trade_code,
      application.child_level_number
    ]);

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'No matching student found' });
    }

    const student = students[0];

    // Check if link already exists
    const [existingLinks] = await connection.execute(
      'SELECT id FROM parent_child_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [application.parent_id, student.id]
    );

    if (existingLinks.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Parent already linked to this student' });
    }

    // Update application status
    await connection.execute(
      'UPDATE parent_linking_applications SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      ['approved', reviewerId, applicationId]
    );

    // Create parent-child link
    await connection.execute(`
      INSERT INTO parent_child_links 
      (parent_id, student_id, linked_by, linked_at, status, permissions)
      VALUES (?, ?, ?, NOW(), 'active', ?)
    `, [
      application.parent_id,
      student.id,
      reviewerId,
      JSON.stringify({
        view_grades: true,
        view_attendance: true,
        view_conduct: true,
        view_fees: true,
        view_messages: true,
        view_assignments: true,
        view_timetable: true,
        view_reports: true
      })
    ]);

    // Log audit trail
    await connection.execute(`
      INSERT INTO parent_linking_audit_log 
      (application_id, action, performed_by, details)
      VALUES (?, 'approved', ?, ?)
    `, [
      applicationId,
      reviewerId,
      JSON.stringify({ student_id: student.id, student_code: student.student_code })
    ]);

    // Send SMS notification (if SMS system is available)
    try {
      const [parentInfo] = await connection.execute(
        'SELECT phone, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?',
        [application.parent_id]
      );

      if (parentInfo.length > 0 && parentInfo[0].phone) {
        // SMS notification logic here
        console.log(`SMS: Parent ${parentInfo[0].name} approved for student ${student.full_name}`);
      }
    } catch (smsError) {
      console.error('SMS notification error:', smsError);
      // Don't fail the approval if SMS fails
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Application approved successfully',
      link: { parent_id: application.parent_id, student_id: student.id }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error approving application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve application' });
  } finally {
    connection.release();
  }
});

// Reject application
router.post('/reject/:applicationId', authenticateToken, requireRole(['dod', 'admin', 'headmaster']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { applicationId } = req.params;
    const { reason } = req.body;
    const reviewerId = req.user.id;

    if (!reason || reason.trim() === '') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    // Get application details
    const [applications] = await connection.execute(
      'SELECT * FROM parent_linking_applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const application = applications[0];

    if (application.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Application already processed' });
    }

    // Update application status
    await connection.execute(
      'UPDATE parent_linking_applications SET status = ?, reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ? WHERE id = ?',
      ['rejected', reviewerId, reason, applicationId]
    );

    // Log audit trail
    await connection.execute(`
      INSERT INTO parent_linking_audit_log 
      (application_id, action, performed_by, details)
      VALUES (?, 'rejected', ?, ?)
    `, [
      applicationId,
      reviewerId,
      JSON.stringify({ reason })
    ]);

    // Send SMS notification
    try {
      const [parentInfo] = await connection.execute(
        'SELECT phone, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?',
        [application.parent_id]
      );

      if (parentInfo.length > 0 && parentInfo[0].phone) {
        console.log(`SMS: Parent ${parentInfo[0].name} application rejected. Reason: ${reason}`);
      }
    } catch (smsError) {
      console.error('SMS notification error:', smsError);
    }

    await connection.commit();

    res.json({ success: true, message: 'Application rejected successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error rejecting application:', error);
    res.status(500).json({ success: false, message: 'Failed to reject application' });
  } finally {
    connection.release();
  }
});

// Get statistics
router.get('/statistics', authenticateToken, requireRole(['dod', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        COUNT(DISTINCT parent_id) as unique_parents,
        COUNT(DISTINCT CASE WHEN status = 'approved' THEN parent_id END) as linked_parents
      FROM parent_linking_applications
    `);

    const [activeLinks] = await db.execute(`
      SELECT COUNT(*) as count FROM parent_child_links WHERE status = 'active'
    `);

    res.json({
      success: true,
      statistics: {
        ...stats[0],
        active_links: activeLinks[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Get students with link status
router.get('/students-with-links', authenticateToken, requireRole(['dod', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;

    let query = `
      SELECT 
        gss.*,
        COUNT(DISTINCT pcl.id) as linked_parents_count,
        COUNT(DISTINCT CASE WHEN pla.status = 'pending' THEN pla.id END) as pending_requests_count
      FROM global_student_sheets gss
      LEFT JOIN parent_child_links pcl ON gss.id = pcl.student_id AND pcl.status = 'active'
      LEFT JOIN parent_linking_applications pla ON 
        gss.first_name = pla.child_first_name AND
        gss.last_name = pla.child_last_name AND
        gss.trade_code = pla.child_trade_code AND
        gss.level_number = pla.child_level_number AND
        pla.status = 'pending'
      WHERE 1=1
    `;

    const params = [];

    if (trade_code) {
      query += ' AND gss.trade_code = ?';
      params.push(trade_code);
    }

    if (level_number) {
      query += ' AND gss.level_number = ?';
      params.push(level_number);
    }

    query += ' GROUP BY gss.id ORDER BY gss.last_name, gss.first_name';

    const [students] = await db.execute(query, params);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Bulk approve applications
router.post('/bulk-approve', authenticateToken, requireRole(['dod', 'admin', 'headmaster']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { applicationIds } = req.body;
    const reviewerId = req.user.id;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'No applications selected' });
    }

    const results = { approved: 0, failed: 0, errors: [] };

    for (const appId of applicationIds) {
      try {
        // Get application
        const [apps] = await connection.execute(
          'SELECT * FROM parent_linking_applications WHERE id = ? AND status = "pending"',
          [appId]
        );

        if (apps.length === 0) continue;

        const app = apps[0];

        // Find student
        const [students] = await connection.execute(`
          SELECT id FROM global_student_sheets
          WHERE first_name = ? AND last_name = ? AND gender = ? 
            AND trade_code = ? AND level_number = ?
          LIMIT 1
        `, [app.child_first_name, app.child_last_name, app.child_gender, app.child_trade_code, app.child_level_number]);

        if (students.length === 0) {
          results.failed++;
          results.errors.push(`No student found for application ${appId}`);
          continue;
        }

        // Update application
        await connection.execute(
          'UPDATE parent_linking_applications SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
          ['approved', reviewerId, appId]
        );

        // Create link
        await connection.execute(`
          INSERT INTO parent_child_links (parent_id, student_id, linked_by, linked_at, status, permissions)
          VALUES (?, ?, ?, NOW(), 'active', ?)
        `, [app.parent_id, students[0].id, reviewerId, JSON.stringify({ view_grades: true, view_attendance: true, view_conduct: true, view_fees: true })]);

        results.approved++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error processing application ${appId}: ${err.message}`);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Bulk approval completed: ${results.approved} approved, ${results.failed} failed`,
      results
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in bulk approve:', error);
    res.status(500).json({ success: false, message: 'Bulk approval failed' });
  } finally {
    connection.release();
  }
});

// Get application history/audit log
router.get('/audit-log/:applicationId', authenticateToken, requireRole(['dod', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { applicationId } = req.params;

    const [logs] = await db.execute(`
      SELECT 
        pal.*,
        CONCAT(u.first_name, ' ', u.last_name) as performed_by_name,
        u.role as performed_by_role
      FROM parent_linking_audit_log pal
      LEFT JOIN users u ON pal.performed_by = u.id
      WHERE pal.application_id = ?
      ORDER BY pal.created_at DESC
    `, [applicationId]);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit log' });
  }
});

module.exports = router;

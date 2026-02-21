const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all applications (DOD/Admin)
router.get('/all-applications', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
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
router.get('/pending-applications', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const [applications] = await db.execute(`
      SELECT 
        pla.*,
        CONCAT(u.first_name, ' ', u.last_name) as parent_full_name,
        u.phone as parent_phone,
        u.email as parent_email,
        u.address as parent_address,
        CONCAT(pla.child_first_name, ' ', pla.child_last_name) as child_full_name,
        gss.id as matched_student_id,
        CONCAT(gss.first_name, ' ', gss.last_name) as matched_student_name,
        gss.student_code as matched_student_code,
        gss.trade_code,
        gss.level_number,
        gss.gender as student_gender
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
router.post('/approve/:applicationId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
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

    // Send SMS notification
    try {
      const [parentInfo] = await connection.execute(
        'SELECT phone, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?',
        [application.parent_id]
      );

      if (parentInfo.length > 0 && parentInfo[0].phone) {
        const smsMessage = `🎓 MURAKAZA NEZA KURI GARDEN TVET SCHOOL! 🎓\n\nMwaramutse ${parentInfo[0].name},\n\nIcyifuzo cyanyu cyo guhuza umwana ${student.full_name} (${student.student_code}) cyemejwe!\n\n✅ AMAKURU Y'UMWANA:\n- Amazina: ${student.full_name}\n- Kode: ${student.student_code}\n- Urwego: Level ${application.child_level_number}\n- Umwuga: ${application.child_trade_code}\n\n📱 IBYIZA BY'IKORANABUHANGA:\nMushobora kugera kuri konti yanyu kugirango murebe:\n✓ Amanota n'ibisubizo by'umwana\n✓ Kwitabira amasomo (attendance)\n✓ Imyitwarire (40/40 conduct system)\n✓ Amafaranga n'ibiciro\n✓ Ubutumwa bw'abarimu\n✓ Ibikorwa by'ishuri\n✓ Raporo z'umwana\n✓ Ibihe by'amasomo\n\n🔔 UBUTUMWA BWIHUSE:\nMuzahabwa ubutumwa bwihuse igihe:\n- Umwana afite ikibazo cy'imyitwarire\n- Amanota mashya yashyizwe\n- Amafaranga akenewe\n- Hari ubutumwa bw'ishuri\n\n📞 TWANDIKIRE:\nTel: +250 788 123 456\nEmail: info@gardentvet.rw\n\nMurakoze guhitamo Garden TVET School!\n\nIgihe: ${new Date().toLocaleString('rw-RW')}\n\n- Garden TVET School`;
        
        await connection.execute(
          'INSERT INTO sms_logs (phone, message, status, provider, sender_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [parentInfo[0].phone, smsMessage, 'sent', 'africastalking', 'GARDEN TVET', new Date()]
        );
        
        console.log(`📱 Welcome SMS sent to ${parentInfo[0].name} at ${parentInfo[0].phone}`);
      }
    } catch (smsError) {
      console.error('SMS notification error:', smsError);
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
router.post('/reject/:applicationId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
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
        const smsMessage = `Mwaramutse ${parentInfo[0].name},\n\nIcyifuzo cyanyu cyo guhuza umwana ${application.child_first_name} ${application.child_last_name} cyanze.\n\nImpamvu: ${reason}\n\nMushobora kongera gusaba nyuma y'igihe runaka.\n\nIgihe: ${new Date().toLocaleString('rw-RW')}\n\n- Garden TVET School\nTel: +250 788 123 456`;
        
        await connection.execute(
          'INSERT INTO sms_logs (phone, message, status, provider, sender_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [parentInfo[0].phone, smsMessage, 'sent', 'africastalking', 'GARDEN TVET', new Date()]
        );
        
        console.log(`📱 Rejection SMS sent to ${parentInfo[0].name} at ${parentInfo[0].phone}`);
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
router.get('/statistics', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
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
router.get('/students-with-links', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
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
router.post('/bulk-approve', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
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
router.get('/audit-log/:applicationId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
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

// Delete application (DOD only)
router.delete('/delete/:applicationId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { applicationId } = req.params;
    const deletedBy = req.user.id;

    // Get application details before deletion
    const [applications] = await connection.execute(
      'SELECT * FROM parent_linking_applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const application = applications[0];

    // Log deletion in audit trail
    await connection.execute(`
      INSERT INTO parent_linking_audit_log 
      (application_id, action, performed_by, details)
      VALUES (?, 'deleted', ?, ?)
    `, [
      applicationId,
      deletedBy,
      JSON.stringify({ 
        deleted_application: {
          parent_id: application.parent_id,
          child_name: `${application.child_first_name} ${application.child_last_name}`,
          status: application.status,
          submitted_at: application.submitted_at
        }
      })
    ]);

    // Delete the application
    await connection.execute(
      'DELETE FROM parent_linking_applications WHERE id = ?',
      [applicationId]
    );

    await connection.commit();

    res.json({ 
      success: true, 
      message: 'Application deleted successfully',
      deleted_id: applicationId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting application:', error);
    res.status(500).json({ success: false, message: 'Failed to delete application' });
  } finally {
    connection.release();
  }
});

// Bulk delete applications
router.post('/bulk-delete', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { applicationIds } = req.body;
    const deletedBy = req.user.id;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'No applications selected' });
    }

    const results = { deleted: 0, failed: 0 };

    for (const appId of applicationIds) {
      try {
        // Log deletion
        await connection.execute(`
          INSERT INTO parent_linking_audit_log 
          (application_id, action, performed_by, details)
          VALUES (?, 'deleted', ?, ?)
        `, [appId, deletedBy, JSON.stringify({ bulk_delete: true })]);

        // Delete application
        const [result] = await connection.execute(
          'DELETE FROM parent_linking_applications WHERE id = ?',
          [appId]
        );

        if (result.affectedRows > 0) {
          results.deleted++;
        } else {
          results.failed++;
        }
      } catch (err) {
        results.failed++;
        console.error(`Error deleting application ${appId}:`, err);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Bulk delete completed: ${results.deleted} deleted, ${results.failed} failed`,
      results
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in bulk delete:', error);
    res.status(500).json({ success: false, message: 'Bulk delete failed' });
  } finally {
    connection.release();
  }
});

// Get all parent users
router.get('/all-parents', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const [parents] = await db.execute(`
      SELECT 
        u.id,
        u.username,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.email,
        u.phone,
        u.address,
        u.created_at,
        u.last_login,
        COUNT(DISTINCT pcl.id) as linked_children_count,
        COUNT(DISTINCT pla.id) as total_applications,
        COUNT(DISTINCT CASE WHEN pla.status = 'pending' THEN pla.id END) as pending_applications
      FROM users u
      LEFT JOIN parent_child_links pcl ON u.id = pcl.parent_id AND pcl.status = 'active'
      LEFT JOIN parent_linking_applications pla ON u.id = pla.parent_id
      WHERE u.role = 'parent'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ success: true, parents });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch parents' });
  }
});

// Get parent details with children
router.get('/parent-details/:parentId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { parentId } = req.params;

    // Get parent info
    const [parents] = await db.execute(`
      SELECT 
        u.id,
        u.username,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.address,
        u.created_at,
        u.last_login
      FROM users u
      WHERE u.id = ? AND u.role = 'parent'
    `, [parentId]);

    if (parents.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Get linked children
    const [children] = await db.execute(`
      SELECT 
        gss.*,
        pcl.linked_at,
        pcl.permissions,
        CONCAT(linker.first_name, ' ', linker.last_name) as linked_by_name
      FROM parent_child_links pcl
      JOIN global_student_sheets gss ON pcl.student_id = gss.id
      LEFT JOIN users linker ON pcl.linked_by = linker.id
      WHERE pcl.parent_id = ? AND pcl.status = 'active'
    `, [parentId]);

    // Get applications
    const [applications] = await db.execute(`
      SELECT 
        pla.*,
        CONCAT(pla.child_first_name, ' ', pla.child_last_name) as child_full_name
      FROM parent_linking_applications pla
      WHERE pla.parent_id = ?
      ORDER BY pla.submitted_at DESC
    `, [parentId]);

    res.json({
      success: true,
      parent: parents[0],
      children,
      applications
    });
  } catch (error) {
    console.error('Error fetching parent details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch parent details' });
  }
});

// Delete parent account
router.delete('/delete-parent/:parentId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { parentId } = req.params;
    const deletedBy = req.user.id;

    // Check if parent exists
    const [parents] = await connection.execute(
      'SELECT * FROM users WHERE id = ? AND role = "parent"',
      [parentId]
    );

    if (parents.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Delete parent-child links
    await connection.execute(
      'DELETE FROM parent_child_links WHERE parent_id = ?',
      [parentId]
    );

    // Delete applications
    await connection.execute(
      'DELETE FROM parent_linking_applications WHERE parent_id = ?',
      [parentId]
    );

    // Delete parent user
    await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [parentId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Parent account deleted successfully',
      deleted_id: parentId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting parent:', error);
    res.status(500).json({ success: false, message: 'Failed to delete parent account' });
  } finally {
    connection.release();
  }
});

// Smart match - Find matching parents for a student
router.get('/smart-match/:studentId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student details
    const [students] = await db.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    // Find pending applications for this student
    const [applications] = await db.execute(`
      SELECT 
        pla.*,
        CONCAT(u.first_name, ' ', u.last_name) as parent_full_name,
        u.phone as parent_phone,
        u.email as parent_email
      FROM parent_linking_applications pla
      JOIN users u ON pla.parent_id = u.id
      WHERE pla.child_first_name = ? 
        AND pla.child_last_name = ?
        AND pla.child_gender = ?
        AND pla.child_trade_code = ?
        AND pla.child_level_number = ?
        AND pla.status = 'pending'
      ORDER BY pla.submitted_at DESC
    `, [
      student.first_name,
      student.last_name,
      student.gender,
      student.trade_code,
      student.level_number
    ]);

    res.json({
      success: true,
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        code: student.student_code,
        trade: student.trade_code,
        level: student.level_number
      },
      matching_applications: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ success: false, message: 'Failed to find matches' });
  }
});

// Quick link - Directly link parent to student (bypass application)
router.post('/quick-link', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { parentId, studentId } = req.body;
    const linkedBy = req.user.id;

    if (!parentId || !studentId) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Parent ID and Student ID required' });
    }

    // Verify parent exists
    const [parents] = await connection.execute(
      'SELECT * FROM users WHERE id = ? AND role = "parent"',
      [parentId]
    );

    if (parents.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Verify student exists
    const [students] = await connection.execute(
      'SELECT * FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if link already exists
    const [existingLinks] = await connection.execute(
      'SELECT id FROM parent_child_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [parentId, studentId]
    );

    if (existingLinks.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Parent already linked to this student' });
    }

    // Create link
    await connection.execute(`
      INSERT INTO parent_child_links 
      (parent_id, student_id, linked_by, linked_at, status, permissions)
      VALUES (?, ?, ?, NOW(), 'active', ?)
    `, [
      parentId,
      studentId,
      linkedBy,
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

    // Send welcome SMS
    try {
      const parent = parents[0];
      const student = students[0];

      if (parent.phone) {
        const smsMessage = `🎓 MURAKAZA NEZA KURI GARDEN TVET SCHOOL! 🎓\n\nMwaramutse ${parent.first_name} ${parent.last_name},\n\nMwahurijwe n'umwana ${student.first_name} ${student.last_name} (${student.student_code})!\n\n✅ AMAKURU Y'UMWANA:\n- Amazina: ${student.first_name} ${student.last_name}\n- Kode: ${student.student_code}\n- Urwego: Level ${student.level_number}\n- Umwuga: ${student.trade_code}\n\n📱 IBYIZA BY'IKORANABUHANGA:\nMushobora kugera kuri konti yanyu kugirango murebe:\n✓ Amanota n'ibisubizo by'umwana\n✓ Kwitabira amasomo (attendance)\n✓ Imyitwarire (40/40 conduct system)\n✓ Amafaranga n'ibiciro\n✓ Ubutumwa bw'abarimu\n✓ Ibikorwa by'ishuri\n✓ Raporo z'umwana\n✓ Ibihe by'amasomo\n\n🔔 UBUTUMWA BWIHUSE:\nMuzahabwa ubutumwa bwihuse igihe:\n- Umwana afite ikibazo cy'imyitwarire\n- Amanota mashya yashyizwe\n- Amafaranga akenewe\n- Hari ubutumwa bw'ishuri\n\n📞 TWANDIKIRE:\nTel: +250 788 123 456\nEmail: info@gardentvet.rw\n\nMurakoze guhitamo Garden TVET School!\n\nIgihe: ${new Date().toLocaleString('rw-RW')}\n\n- Garden TVET School`;
        
        await connection.execute(
          'INSERT INTO sms_logs (phone, message, status, provider, sender_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [parent.phone, smsMessage, 'sent', 'africastalking', 'GARDEN TVET', new Date()]
        );
      }
    } catch (smsError) {
      console.error('SMS error:', smsError);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Parent linked successfully',
      link: { parent_id: parentId, student_id: studentId }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating quick link:', error);
    res.status(500).json({ success: false, message: 'Failed to create link' });
  } finally {
    connection.release();
  }
});

// Send custom message to parent (DOD)
router.post('/send-message', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { parentId, studentId, message, messageType } = req.body;
    const sentBy = req.user.id;

    if (!parentId || !message) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Parent ID and message are required' });
    }

    // Get parent info
    const [parents] = await connection.execute(
      'SELECT id, phone, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ? AND role = "parent"',
      [parentId]
    );

    if (parents.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const parent = parents[0];

    if (!parent.phone) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Parent has no phone number' });
    }

    // Get student info if provided
    let studentInfo = null;
    if (studentId) {
      const [students] = await connection.execute(
        'SELECT id, student_code, CONCAT(first_name, " ", last_name) as name, trade_code, level_number FROM global_student_sheets WHERE id = ?',
        [studentId]
      );
      if (students.length > 0) {
        studentInfo = students[0];
      }
    }

    // Build SMS message
    let smsMessage = `🎓 GARDEN TVET SCHOOL 🎓\n\nMwaramutse ${parent.name},\n\n${message}`;

    if (studentInfo) {
      smsMessage += `\n\n📚 Umwana: ${studentInfo.name}\n📝 Kode: ${studentInfo.student_code}\n🎯 Umwuga: ${studentInfo.trade_code} - Level ${studentInfo.level_number}`;
    }

    smsMessage += `\n\n📞 Hamagara: +250 788 123 456\n📧 Email: info@gardentvet.rw\n\nIgihe: ${new Date().toLocaleString('rw-RW')}\n\n- Garden TVET School`;

    // Send SMS
    await connection.execute(
      'INSERT INTO sms_logs (phone, message, status, provider, sender_id, event_type, student_id, parent_id, sent_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [parent.phone, smsMessage, 'sent', 'africastalking', 'GARDEN TVET', messageType || 'custom', studentId, parentId, sentBy]
    );

    // Log in message history
    await connection.execute(
      'INSERT INTO parent_message_history (parent_id, student_id, message, sent_by, sent_at, message_type) VALUES (?, ?, ?, ?, NOW(), ?)',
      [parentId, studentId, message, sentBy, messageType || 'custom']
    );

    await connection.commit();

    console.log(`📱 Custom SMS sent to ${parent.name} (${parent.phone})`);

    res.json({
      success: true,
      message: 'SMS sent successfully',
      recipient: parent.name,
      phone: parent.phone
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  } finally {
    connection.release();
  }
});

// Bulk send message to multiple parents
router.post('/bulk-send-message', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { parentIds, message, messageType } = req.body;
    const sentBy = req.user.id;

    if (!Array.isArray(parentIds) || parentIds.length === 0 || !message) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Parent IDs and message are required' });
    }

    const results = { sent: 0, failed: 0, errors: [] };

    for (const parentId of parentIds) {
      try {
        const [parents] = await connection.execute(
          'SELECT id, phone, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ? AND role = "parent"',
          [parentId]
        );

        if (parents.length === 0 || !parents[0].phone) {
          results.failed++;
          results.errors.push(`Parent ${parentId} not found or has no phone`);
          continue;
        }

        const parent = parents[0];
        const smsMessage = `🎓 GARDEN TVET SCHOOL 🎓\n\nMwaramutse ${parent.name},\n\n${message}\n\n📞 Hamagara: +250 788 123 456\n📧 Email: info@gardentvet.rw\n\nIgihe: ${new Date().toLocaleString('rw-RW')}\n\n- Garden TVET School`;

        await connection.execute(
          'INSERT INTO sms_logs (phone, message, status, provider, sender_id, event_type, parent_id, sent_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
          [parent.phone, smsMessage, 'sent', 'africastalking', 'GARDEN TVET', messageType || 'bulk', parentId, sentBy]
        );

        await connection.execute(
          'INSERT INTO parent_message_history (parent_id, message, sent_by, sent_at, message_type) VALUES (?, ?, ?, NOW(), ?)',
          [parentId, message, sentBy, messageType || 'bulk']
        );

        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error sending to parent ${parentId}: ${err.message}`);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Bulk SMS completed: ${results.sent} sent, ${results.failed} failed`,
      results
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in bulk send:', error);
    res.status(500).json({ success: false, message: 'Bulk send failed' });
  } finally {
    connection.release();
  }
});

// Delete/Unlink parent-child link (DOD)
router.delete('/unlink/:linkId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { linkId } = req.params;
    const deletedBy = req.user.id;

    // Get link details before deletion
    const [links] = await connection.execute(`
      SELECT 
        pcl.*,
        CONCAT(u.first_name, ' ', u.last_name) as parent_name,
        u.phone as parent_phone,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.student_code
      FROM parent_child_links pcl
      JOIN users u ON pcl.parent_id = u.id
      JOIN global_student_sheets gss ON pcl.student_id = gss.id
      WHERE pcl.id = ?
    `, [linkId]);

    if (links.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    const link = links[0];

    // Send notification SMS to parent
    if (link.parent_phone) {
      const smsMessage = `🎓 GARDEN TVET SCHOOL 🎓\n\nMwaramutse ${link.parent_name},\n\n⚠️ ITANGAZO RIKOMEYE\n\nGuhuza kwawe n'umwana ${link.student_name} (${link.student_code}) byakuweho.\n\nImpamvu: Guhindura amakuru cyangwa icyifuzo cy'ishuri.\n\nNiba hari ikibazo, mwongere muhamagare ishuri.\n\n📞 Hamagara: +250 788 123 456\n📧 Email: info@gardentvet.rw\n\nIgihe: ${new Date().toLocaleString('rw-RW')}\n\n- Garden TVET School`;

      await connection.execute(
        'INSERT INTO sms_logs (phone, message, status, provider, sender_id, event_type, student_id, parent_id, sent_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [link.parent_phone, smsMessage, 'sent', 'africastalking', 'GARDEN TVET', 'unlink', link.student_id, link.parent_id, deletedBy]
      );
    }

    // Delete the link
    await connection.execute(
      'DELETE FROM parent_child_links WHERE id = ?',
      [linkId]
    );

    // Log in audit trail
    await connection.execute(
      'INSERT INTO parent_linking_audit_log (action, performed_by, details) VALUES (?, ?, ?)',
      ['unlink', deletedBy, JSON.stringify({ link_id: linkId, parent_name: link.parent_name, student_name: link.student_name })]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Parent-child link removed successfully',
      deleted_link: {
        parent: link.parent_name,
        student: link.student_name
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error unlinking:', error);
    res.status(500).json({ success: false, message: 'Failed to remove link' });
  } finally {
    connection.release();
  }
});

// Bulk unlink multiple parent-child links
router.post('/bulk-unlink', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { linkIds } = req.body;
    const deletedBy = req.user.id;

    if (!Array.isArray(linkIds) || linkIds.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'No links selected' });
    }

    const results = { unlinked: 0, failed: 0 };

    for (const linkId of linkIds) {
      try {
        const [result] = await connection.execute(
          'DELETE FROM parent_child_links WHERE id = ?',
          [linkId]
        );

        if (result.affectedRows > 0) {
          results.unlinked++;
          await connection.execute(
            'INSERT INTO parent_linking_audit_log (action, performed_by, details) VALUES (?, ?, ?)',
            ['bulk_unlink', deletedBy, JSON.stringify({ link_id: linkId })]
          );
        } else {
          results.failed++;
        }
      } catch (err) {
        results.failed++;
        console.error(`Error unlinking ${linkId}:`, err);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Bulk unlink completed: ${results.unlinked} unlinked, ${results.failed} failed`,
      results
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in bulk unlink:', error);
    res.status(500).json({ success: false, message: 'Bulk unlink failed' });
  } finally {
    connection.release();
  }
});

// Get message history for a parent
router.get('/message-history/:parentId', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { parentId } = req.params;

    const [messages] = await db.execute(`
      SELECT 
        pmh.*,
        CONCAT(u.first_name, ' ', u.last_name) as sent_by_name,
        u.role as sent_by_role,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.student_code
      FROM parent_message_history pmh
      LEFT JOIN users u ON pmh.sent_by = u.id
      LEFT JOIN global_student_sheets gss ON pmh.student_id = gss.id
      WHERE pmh.parent_id = ?
      ORDER BY pmh.sent_at DESC
      LIMIT 50
    `, [parentId]);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch message history' });
  }
});

// Get all active parent-child links
router.get('/all-links', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const [links] = await db.execute(`
      SELECT 
        pcl.id as link_id,
        pcl.linked_at,
        pcl.relationship_type,
        u.id as parent_id,
        CONCAT(u.first_name, ' ', u.last_name) as parent_name,
        u.phone as parent_phone,
        u.email as parent_email,
        gss.id as student_id,
        gss.student_code,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.trade_code,
        gss.level_number,
        gss.conduct_score,
        gss.attendance_percentage,
        CONCAT(linker.first_name, ' ', linker.last_name) as linked_by_name
      FROM parent_child_links pcl
      JOIN users u ON pcl.parent_id = u.id
      JOIN global_student_sheets gss ON pcl.student_id = gss.id
      LEFT JOIN users linker ON pcl.linked_by = linker.id
      WHERE pcl.status = 'active'
      ORDER BY pcl.linked_at DESC
    `);

    res.json({ success: true, links, count: links.length });
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch links' });
  }
});

// Get my children (for logged-in parent)
router.get('/my-children', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId || req.user.id;

    const [children] = await db.execute(`
      SELECT 
        gss.id,
        gss.student_id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        gss.email,
        gss.phone,
        gss.gender,
        gss.trade_code,
        gss.trade_name,
        gss.level_number,
        gss.level_suffix,
        gss.class_name,
        gss.conduct_score,
        gss.attendance_percentage,
        gss.enrollment_status,
        pcl.relationship_type,
        pcl.linked_at,
        pcl.status as link_status
      FROM parent_child_links pcl
      INNER JOIN global_student_sheets gss ON pcl.student_id = gss.id
      WHERE pcl.parent_id = ? AND pcl.status = 'active'
      ORDER BY gss.first_name, gss.last_name
    `, [parentId]);

    res.json({
      success: true,
      children,
      count: children.length
    });
  } catch (error) {
    console.error('Get my children error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch children',
      error: error.message
    });
  }
});

// Submit application (for parent to link with child)
router.post('/submit-application', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const parentId = req.user.userId || req.user.id;
    const {
      child_first_name,
      child_last_name,
      child_gender,
      child_trade_code,
      child_level_number,
      relationship_type
    } = req.body;

    if (!child_first_name || !child_last_name || !child_gender || !child_trade_code || !child_level_number) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if application already exists
    const [existing] = await connection.execute(`
      SELECT id FROM parent_linking_applications 
      WHERE parent_id = ? AND child_first_name = ? AND child_last_name = ? 
        AND child_trade_code = ? AND child_level_number = ? AND status = 'pending'
    `, [parentId, child_first_name, child_last_name, child_trade_code, child_level_number]);

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Application already submitted and pending' });
    }

    // Create application
    await connection.execute(`
      INSERT INTO parent_linking_applications 
      (parent_id, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, relationship_type, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [parentId, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, relationship_type || 'parent']);

    await connection.commit();

    res.json({
      success: true,
      message: 'Application submitted successfully. Waiting for approval.'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;

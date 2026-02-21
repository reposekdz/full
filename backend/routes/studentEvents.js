const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const parentNotificationService = require('../services/parentNotificationService');

// Remove conduct points (DOD/Patron/Matron)
router.post('/conduct/remove', authenticateToken, requireRole(['dod', 'director_discipline', 'patron', 'matron', 'admin']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, points_removed, reason, incident_type } = req.body;
    const removed_by = req.user.id;

    // Get current conduct score
    const [students] = await connection.execute(
      'SELECT id, conduct_score, CONCAT(first_name, " ", last_name) as full_name FROM global_student_sheets WHERE id = ?',
      [student_id]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];
    const current_score = student.conduct_score || 40;
    const new_score = Math.max(0, current_score - points_removed);
    
    // Calculate grade
    let grade = 'F';
    if (new_score >= 36) grade = 'A';
    else if (new_score >= 32) grade = 'B';
    else if (new_score >= 28) grade = 'C';
    else if (new_score >= 24) grade = 'D';

    // Update conduct score
    await connection.execute(
      'UPDATE global_student_sheets SET conduct_score = ? WHERE id = ?',
      [new_score, student_id]
    );

    // Record conduct incident
    await connection.execute(`
      INSERT INTO student_conduct_records 
      (student_id, incident_type, description, severity, points_deducted, recorded_by, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [student_id, incident_type || 'misconduct', reason, 'moderate', points_removed, removed_by]);

    // Get staff name
    const [staff] = await connection.execute(
      'SELECT CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?',
      [removed_by]
    );

    await connection.commit();

    // Send SMS to all linked parents
    const smsResult = await parentNotificationService.notifyConductRemoval(student_id, {
      points_removed,
      remaining_score: new_score,
      grade,
      reason,
      removed_by: staff[0]?.name || 'Staff'
    });

    console.log(`📱 Conduct removal SMS sent to ${smsResult.sent}/${smsResult.total} parents`);

    res.json({
      success: true,
      message: 'Conduct removed and parents notified',
      data: {
        student_name: student.full_name,
        previous_score: current_score,
        new_score,
        grade,
        parents_notified: smsResult.sent
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error removing conduct:', error);
    res.status(500).json({ success: false, message: 'Failed to remove conduct' });
  } finally {
    connection.release();
  }
});

// Approve leave request (DOD/Patron/Matron)
router.post('/leave/approve', authenticateToken, requireRole(['dod', 'director_discipline', 'patron', 'matron', 'admin']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { leave_id } = req.body;
    const approved_by = req.user.id;

    // Get leave request details
    const [leaves] = await connection.execute(`
      SELECT lr.*, gss.id as student_id, CONCAT(gss.first_name, " ", gss.last_name) as student_name,
             DATEDIFF(lr.end_date, lr.start_date) + 1 as days
      FROM leave_requests lr
      JOIN global_student_sheets gss ON lr.student_id = gss.id
      WHERE lr.id = ?
    `, [leave_id]);

    if (leaves.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const leave = leaves[0];

    // Update leave status
    await connection.execute(
      'UPDATE leave_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
      ['approved', approved_by, leave_id]
    );

    // Get staff name
    const [staff] = await connection.execute(
      'SELECT CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?',
      [approved_by]
    );

    await connection.commit();

    // Send SMS to all linked parents
    const smsResult = await parentNotificationService.notifyLeaveApproval(leave.student_id, {
      start_date: new Date(leave.start_date).toLocaleDateString(),
      end_date: new Date(leave.end_date).toLocaleDateString(),
      days: leave.days,
      reason: leave.reason,
      approved_by: staff[0]?.name || 'Staff'
    });

    console.log(`📱 Leave approval SMS sent to ${smsResult.sent}/${smsResult.total} parents`);

    res.json({
      success: true,
      message: 'Leave approved and parents notified',
      data: {
        student_name: leave.student_name,
        leave_dates: `${leave.start_date} to ${leave.end_date}`,
        parents_notified: smsResult.sent
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error approving leave:', error);
    res.status(500).json({ success: false, message: 'Failed to approve leave' });
  } finally {
    connection.release();
  }
});

// Mark student as sick (DOD/Patron/Matron/Nurse)
router.post('/health/sick', authenticateToken, requireRole(['dod', 'director_discipline', 'patron', 'matron', 'nurse', 'admin']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, description, action_taken, severity } = req.body;
    const recorded_by = req.user.id;

    // Get student details
    const [students] = await connection.execute(
      'SELECT id, CONCAT(first_name, " ", last_name) as full_name FROM global_student_sheets WHERE id = ?',
      [student_id]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    // Record health incident
    await connection.execute(`
      INSERT INTO student_health_records 
      (student_id, incident_type, description, severity, action_taken, recorded_by, recorded_at)
      VALUES (?, 'sick', ?, ?, ?, ?, NOW())
    `, [student_id, description, severity || 'moderate', action_taken || 'Sent to clinic', recorded_by]);

    await connection.commit();

    // Send SMS to all linked parents
    const smsResult = await parentNotificationService.notifySickAbsent(student_id, {
      status: 'sick',
      date: new Date().toLocaleDateString(),
      description,
      action_taken: action_taken || 'Sent to clinic'
    });

    console.log(`📱 Sick alert SMS sent to ${smsResult.sent}/${smsResult.total} parents`);

    res.json({
      success: true,
      message: 'Health record created and parents notified',
      data: {
        student_name: student.full_name,
        parents_notified: smsResult.sent
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error recording sick student:', error);
    res.status(500).json({ success: false, message: 'Failed to record health incident' });
  } finally {
    connection.release();
  }
});

// Mark student as absent
router.post('/attendance/absent', authenticateToken, requireRole(['dod', 'director_discipline', 'patron', 'matron', 'teacher', 'admin']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, date, reason } = req.body;
    const recorded_by = req.user.id;

    // Get student details
    const [students] = await connection.execute(
      'SELECT id, CONCAT(first_name, " ", last_name) as full_name FROM global_student_sheets WHERE id = ?',
      [student_id]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    // Record absence
    await connection.execute(`
      INSERT INTO student_attendance 
      (student_id, date, status, reason, recorded_by, recorded_at)
      VALUES (?, ?, 'absent', ?, ?, NOW())
    `, [student_id, date || new Date().toISOString().split('T')[0], reason, recorded_by]);

    await connection.commit();

    // Send SMS to all linked parents
    const smsResult = await parentNotificationService.notifySickAbsent(student_id, {
      status: 'absent',
      date: date || new Date().toLocaleDateString(),
      description: reason || 'No reason provided',
      action_taken: 'Marked as absent'
    });

    console.log(`📱 Absent alert SMS sent to ${smsResult.sent}/${smsResult.total} parents`);

    res.json({
      success: true,
      message: 'Absence recorded and parents notified',
      data: {
        student_name: student.full_name,
        parents_notified: smsResult.sent
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error recording absence:', error);
    res.status(500).json({ success: false, message: 'Failed to record absence' });
  } finally {
    connection.release();
  }
});

// Get parent notifications (for parent dashboard)
router.get('/parent/notifications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parent_id = req.user.id;

    // Get all SMS notifications for this parent
    const [notifications] = await db.execute(`
      SELECT 
        sl.*,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number
      FROM sms_logs sl
      LEFT JOIN global_student_sheets gss ON sl.student_id = gss.id
      WHERE sl.parent_id = ?
      ORDER BY sl.created_at DESC
      LIMIT 100
    `, [parent_id]);

    res.json({
      success: true,
      notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Error fetching parent notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Get student events for parent (conduct, leave, health, attendance)
router.get('/parent/student-events/:studentId', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const parent_id = req.user.id;

    // Verify parent is linked to this student
    const [links] = await db.execute(
      'SELECT id FROM parent_child_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [parent_id, studentId]
    );

    if (links.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
    }

    // Get conduct records
    const [conduct] = await db.execute(`
      SELECT 
        scr.*,
        CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name,
        gss.conduct_score as current_score
      FROM student_conduct_records scr
      LEFT JOIN users u ON scr.recorded_by = u.id
      LEFT JOIN global_student_sheets gss ON scr.student_id = gss.id
      WHERE scr.student_id = ?
      ORDER BY scr.recorded_at DESC
      LIMIT 50
    `, [studentId]);

    // Get leave requests
    const [leaves] = await db.execute(`
      SELECT 
        lr.*,
        CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name
      FROM leave_requests lr
      LEFT JOIN users approver ON lr.approved_by = approver.id
      WHERE lr.student_id = ?
      ORDER BY lr.created_at DESC
      LIMIT 50
    `, [studentId]);

    // Get health records
    const [health] = await db.execute(`
      SELECT 
        shr.*,
        CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
      FROM student_health_records shr
      LEFT JOIN users u ON shr.recorded_by = u.id
      WHERE shr.student_id = ?
      ORDER BY shr.recorded_at DESC
      LIMIT 50
    `, [studentId]);

    // Get attendance records
    const [attendance] = await db.execute(`
      SELECT 
        sa.*,
        CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
      FROM student_attendance sa
      LEFT JOIN users u ON sa.recorded_by = u.id
      WHERE sa.student_id = ? AND sa.status = 'absent'
      ORDER BY sa.date DESC
      LIMIT 50
    `, [studentId]);

    res.json({
      success: true,
      events: {
        conduct,
        leaves,
        health,
        attendance
      }
    });

  } catch (error) {
    console.error('Error fetching student events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student events' });
  }
});

module.exports = router;

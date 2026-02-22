// ═══════════════════════════════════════════════════════════════════════════
// SMS API ROUTES - FRONTEND INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
// All SMS notification endpoints for frontend calls
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  sendParentRegistrationSMS,
  sendLinkApprovalSMS,
  sendManualLinkSMS,
  sendConductRemovalSMS,
  sendLeaveApprovalSMS,
  getSMSStats,
  retryFailedSMS
} = require('../services/parentNotificationService');
const {
  sendAttendanceAlertSMS,
  sendGradeUpdateSMS,
  sendFeeReminderSMS,
  sendSchoolAnnouncementSMS
} = require('../services/studentActivityNotifications');

// ═══════════════════════════════════════════════════════════════════════════
// PARENT REGISTRATION & LINKING SMS
// ═══════════════════════════════════════════════════════════════════════════

// Send welcome SMS to new parent
router.post('/welcome', authenticateToken, async (req, res) => {
  try {
    const { parentId } = req.body;
    const result = await sendParentRegistrationSMS(parentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send link approval SMS
router.post('/link-approval', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { parentId, studentId, applicationId } = req.body;
    const result = await sendLinkApprovalSMS(parentId, studentId, applicationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send manual link SMS
router.post('/manual-link', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { parentId, studentId, isNewParent } = req.body;
    const result = await sendManualLinkSMS(parentId, studentId, isNewParent);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT ACTIVITY SMS NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Send conduct removal SMS
router.post('/conduct-removal', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin', 'matron', 'patron']), async (req, res) => {
  try {
    const { studentId, conductType, pointsDeducted, newScore, description, removedBy } = req.body;
    const result = await sendConductRemovalSMS(studentId, conductType, pointsDeducted, newScore, description, removedBy || req.user.first_name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send leave approval SMS
router.post('/leave-approval', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin', 'matron', 'patron']), async (req, res) => {
  try {
    const { studentId, leaveType, reason, startTime, endTime, approvedBy } = req.body;
    const result = await sendLeaveApprovalSMS(studentId, leaveType, reason, startTime, endTime, approvedBy || req.user.first_name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send attendance alert SMS
router.post('/attendance-alert', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin', 'teacher']), async (req, res) => {
  try {
    const { studentId, attendanceType, date, reason } = req.body;
    const result = await sendAttendanceAlertSMS(studentId, attendanceType, date, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send grade update SMS
router.post('/grade-update', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin', 'teacher']), async (req, res) => {
  try {
    const { studentId, examType, subject, score, grade, totalMarks } = req.body;
    const result = await sendGradeUpdateSMS(studentId, examType, subject, score, grade, totalMarks);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send fee reminder SMS
router.post('/fee-reminder', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin', 'accountant']), async (req, res) => {
  try {
    const { studentId, amountDue, dueDate, feeType } = req.body;
    const result = await sendFeeReminderSMS(studentId, amountDue, dueDate, feeType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send school announcement SMS
router.post('/school-announcement', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { studentIds, title, message, priority } = req.body;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Student IDs array is required' });
    }

    const results = [];
    let totalParentsNotified = 0;

    for (const studentId of studentIds) {
      const result = await sendSchoolAnnouncementSMS(studentId, title, message, priority);
      if (result.success) {
        results.push(result);
        totalParentsNotified += result.parentsNotified || 0;
      }
    }

    res.json({
      success: true,
      message: `Announcement sent to ${totalParentsNotified} parents`,
      parentsNotified: totalParentsNotified,
      studentsProcessed: studentIds.length,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BULK SMS OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Send bulk SMS to multiple students
router.post('/bulk', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { studentIds, title, message, priority = 'normal' } = req.body;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Student IDs array is required' });
    }

    const results = [];
    let totalParentsNotified = 0;

    for (const studentId of studentIds) {
      const result = await sendSchoolAnnouncementSMS(studentId, title, message, priority);
      if (result.success) {
        results.push(result);
        totalParentsNotified += result.parentsNotified || 0;
      }
    }

    res.json({
      success: true,
      message: `Bulk SMS sent to ${totalParentsNotified} parents`,
      parentsNotified: totalParentsNotified,
      studentsProcessed: studentIds.length,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SMS STATISTICS & MONITORING
// ═══════════════════════════════════════════════════════════════════════════

// Get SMS statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const result = await getSMSStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get SMS history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const { limit = 50, offset = 0, type, status } = req.query;
    
    let query = `
      SELECT pnl.*, u.first_name as parent_name, gss.first_name as student_name, gss.last_name as student_lastname
      FROM parent_notifications_log pnl
      LEFT JOIN users u ON pnl.parent_id = u.id
      LEFT JOIN global_student_sheets gss ON pnl.student_id = gss.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ` AND pnl.notification_type = ?`;
      params.push(type);
    }

    if (status) {
      query += ` AND pnl.delivery_status = ?`;
      params.push(status);
    }

    query += ` ORDER BY pnl.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [history] = await pool.execute(query, params);

    res.json({
      success: true,
      history,
      total: history.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Retry failed SMS
router.post('/retry-failed', authenticateToken, requireRole(['dod', 'dos', 'headmaster', 'admin']), async (req, res) => {
  try {
    const { limit = 10 } = req.body;
    const result = await retryFailedSMS(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// REAL-TIME SMS STATUS
// ═══════════════════════════════════════════════════════════════════════════

// Get real-time SMS queue status
router.get('/queue-status', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_queued,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM sms_queue
      WHERE DATE(created_at) = CURDATE()
    `);

    const [[notificationStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_notifications,
        SUM(CASE WHEN delivery_status = 'sent' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END) as failed_notifications
      FROM parent_notifications_log
      WHERE DATE(created_at) = CURDATE()
    `);

    res.json({
      success: true,
      queue: stats,
      notifications: notificationStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
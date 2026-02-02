const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// COMPREHENSIVE PARENT PORTAL SYSTEM
// Real-time monitoring, payments, communication
// ========================================

// Parent Dashboard - Overview
router.get('/dashboard', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.id;

    // Get all linked children
    const [children] = await db.query(`
      SELECT sp.*, gs.*,
             tc.name as class_name
      FROM student_parents sp
      INNER JOIN global_students gs ON sp.student_id = gs.id
      LEFT JOIN trade_classes tc ON gs.current_class_id = tc.id
      WHERE sp.phone = ? AND sp.is_active = true
    `, [req.user.phone]);

    const childrenData = await Promise.all(children.map(async (child) => {
      // Get recent attendance
      const [attendance] = await db.query(`
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
          SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days
        FROM student_attendance
        WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `, [child.student_id]);

      // Get recent grades
      const [grades] = await db.query(`
        SELECT subject_name, grade, percentage, points
        FROM student_academic_records
        WHERE student_id = ?
        ORDER BY assessment_date DESC
        LIMIT 5
      `, [child.student_id]);

      // Get unread notifications
      const [notifications] = await db.query(`
        SELECT COUNT(*) as unread_count
        FROM parent_notifications
        WHERE parent_id = ? AND student_id = ? AND is_read = false
      `, [child.id, child.student_id]);

      // Get fee balance
      const feeBalance = child.fee_balance || 0;

      // Get recent discipline incidents
      const [discipline] = await db.query(`
        SELECT COUNT(*) as incident_count
        FROM student_discipline_records
        WHERE student_id = ? AND incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `, [child.student_id]);

      return {
        student: {
          id: child.student_id,
          name: child.full_name,
          admission_number: child.admission_number,
          class: child.class_name,
          profile_image: child.profile_image
        },
        attendance: attendance[0],
        recentGrades: grades,
        unreadNotifications: notifications[0].unread_count,
        feeBalance,
        recentIncidents: discipline[0].incident_count
      };
    }));

    res.json({
      success: true,
      children: childrenData
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
  }
});

// Get child's detailed academic performance
router.get('/students/:studentId/academics', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academic_year, term } = req.query;

    // Verify parent has access to this student
    const [access] = await db.query(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND phone = ? AND is_active = true AND can_view_grades = true
    `, [studentId, req.user.phone]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = `
      SELECT * FROM student_academic_records
      WHERE student_id = ?
    `;
    const params = [studentId];

    if (academic_year) {
      query += ` AND academic_year = ?`;
      params.push(academic_year);
    }

    if (term) {
      query += ` AND term = ?`;
      params.push(term);
    }

    query += ` ORDER BY assessment_date DESC`;

    const [records] = await db.query(query, params);

    // Calculate summary
    const summary = {
      totalSubjects: records.length,
      averagePercentage: records.length > 0 ? 
        (records.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / records.length).toFixed(2) : 0,
      averagePoints: records.length > 0 ? 
        (records.reduce((sum, r) => sum + parseFloat(r.points), 0) / records.length).toFixed(2) : 0,
      gradeDistribution: {}
    };

    records.forEach(r => {
      summary.gradeDistribution[r.grade] = (summary.gradeDistribution[r.grade] || 0) + 1;
    });

    res.json({
      success: true,
      records,
      summary
    });
  } catch (error) {
    console.error('Error fetching academic records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch academic records', error: error.message });
  }
});

// Get child's attendance
router.get('/students/:studentId/attendance', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { start_date, end_date } = req.query;

    // Verify access
    const [access] = await db.query(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND phone = ? AND is_active = true AND can_view_attendance = true
    `, [studentId, req.user.phone]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = `
      SELECT sa.*, s.name as subject_name
      FROM student_attendance sa
      LEFT JOIN subjects s ON sa.subject_id = s.id
      WHERE sa.student_id = ?
    `;
    const params = [studentId];

    if (start_date) {
      query += ` AND sa.date >= ?`;
      params.push(start_date);
    } else {
      query += ` AND sa.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
    }

    if (end_date) {
      query += ` AND sa.date <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY sa.date DESC, sa.period_number ASC`;

    const [attendance] = await db.query(query, params);

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'Present').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      late: attendance.filter(a => a.status === 'Late').length,
      excused: attendance.filter(a => a.status === 'Excused').length,
      attendanceRate: 0
    };

    stats.attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      attendance,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
});

// Get child's discipline records
router.get('/students/:studentId/discipline', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify access
    const [access] = await db.query(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND phone = ? AND is_active = true
    `, [studentId, req.user.phone]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [records] = await db.query(`
      SELECT sdr.*, u.name as reported_by_name
      FROM student_discipline_records sdr
      LEFT JOIN users u ON sdr.reported_by = u.id
      WHERE sdr.student_id = ?
      ORDER BY sdr.incident_date DESC
    `, [studentId]);

    res.json({ success: true, disciplineRecords: records });
  } catch (error) {
    console.error('Error fetching discipline records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discipline records', error: error.message });
  }
});

// Get fee payment history
router.get('/students/:studentId/fees', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify access
    const [access] = await db.query(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND phone = ? AND is_active = true
    `, [studentId, req.user.phone]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get student fee info
    const [student] = await db.query(`
      SELECT fee_balance, total_fees_paid FROM global_students WHERE id = ?
    `, [studentId]);

    // Get payment history
    const [payments] = await db.query(`
      SELECT * FROM student_fee_payments
      WHERE student_id = ? AND approval_status = 'Approved'
      ORDER BY payment_date DESC
    `, [studentId]);

    res.json({
      success: true,
      feeBalance: student[0].fee_balance,
      totalPaid: student[0].total_fees_paid,
      payments
    });
  } catch (error) {
    console.error('Error fetching fee information:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee information', error: error.message });
  }
});

// Initiate mobile money payment
router.post('/payments/initiate', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { student_id, amount, phone, payment_method, fee_type, description } = req.body;

    // Verify access
    const [access] = await db.query(`
      SELECT id FROM student_parents 
      WHERE student_id = ? AND phone = ? AND is_active = true AND can_make_payments = true
    `, [student_id, req.user.phone]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Payment access denied' });
    }

    const parentId = access[0].id;

    // Create payment request
    const [result] = await db.query(`
      INSERT INTO parent_payment_requests (
        parent_id, student_id, request_type, amount_requested,
        description, payment_method, mobile_money_phone,
        mobile_money_provider, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Initiated')
    `, [
      parentId, student_id, fee_type, amount, description || null,
      payment_method, phone, payment_method
    ]);

    // In production, integrate with MTN Mobile Money or Airtel Money API here
    // For now, we'll simulate the payment initiation

    res.status(201).json({
      success: true,
      message: 'Payment initiated. Please complete the transaction on your phone.',
      paymentRequestId: result.insertId,
      instructions: `Dial *182*7*1# and enter the amount ${amount} RWF to complete the payment.`
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment', error: error.message });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { student_id, is_read, notification_type, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT pn.*, gs.full_name as student_name
      FROM parent_notifications pn
      INNER JOIN global_students gs ON pn.student_id = gs.id
      INNER JOIN student_parents sp ON sp.student_id = pn.student_id
      WHERE sp.phone = ? AND sp.is_active = true
    `;
    const params = [req.user.phone];

    if (student_id) {
      query += ` AND pn.student_id = ?`;
      params.push(student_id);
    }

    if (is_read !== undefined) {
      query += ` AND pn.is_read = ?`;
      params.push(is_read === 'true');
    }

    if (notification_type) {
      query += ` AND pn.notification_type = ?`;
      params.push(notification_type);
    }

    query += ` ORDER BY pn.created_at DESC`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [notifications] = await db.query(query, params);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`
      UPDATE parent_notifications
      SET is_read = true, read_at = NOW()
      WHERE id = ? AND parent_id IN (
        SELECT id FROM student_parents WHERE phone = ?
      )
    `, [id, req.user.phone]);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification', error: error.message });
  }
});

// Send message to teacher/admin
router.post('/communications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { student_id, recipient_type, recipient_id, subject, message, priority } = req.body;

    // Verify access
    const [access] = await db.query(`
      SELECT id FROM student_parents 
      WHERE student_id = ? AND phone = ? AND is_active = true AND can_communicate_teachers = true
    `, [student_id, req.user.phone]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Communication access denied' });
    }

    const parentId = access[0].id;

    const [result] = await db.query(`
      INSERT INTO parent_student_communications (
        parent_id, student_id, recipient_type, recipient_id,
        subject, message, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Sent')
    `, [
      parentId, student_id, recipient_type, recipient_id || null,
      subject, message, priority || 'Normal'
    ]);

    // Notify recipient if specific recipient_id is provided
    if (recipient_id) {
      await db.query(`
        INSERT INTO student_notifications (
          student_id, notification_type, title, message,
          priority, sender_id, sender_role, related_record_type,
          related_record_id
        ) VALUES (?, 'Message', ?, ?, ?, ?, 'Parent', 'parent_communication', ?)
      `, [
        recipient_id, subject, message, priority || 'Normal',
        req.user.id, result.insertId
      ]);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      communicationId: result.insertId
    });
  } catch (error) {
    console.error('Error sending communication:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
});

// Get communications history
router.get('/communications', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { student_id, status } = req.query;

    let query = `
      SELECT psc.*, gs.full_name as student_name, u.name as responder_name
      FROM parent_student_communications psc
      INNER JOIN global_students gs ON psc.student_id = gs.id
      INNER JOIN student_parents sp ON sp.student_id = psc.student_id
      LEFT JOIN users u ON psc.responded_by = u.id
      WHERE sp.phone = ? AND sp.is_active = true
    `;
    const params = [req.user.phone];

    if (student_id) {
      query += ` AND psc.student_id = ?`;
      params.push(student_id);
    }

    if (status) {
      query += ` AND psc.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY psc.created_at DESC`;

    const [communications] = await db.query(query, params);

    res.json({ success: true, communications });
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch communications', error: error.message });
  }
});

// Get child's activities and achievements
router.get('/students/:studentId/activities', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify access
    const [access] = await db.query(`
      SELECT * FROM student_parents 
      WHERE student_id = ? AND phone = ? AND is_active = true
    `, [studentId, req.user.phone]);

    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [activities] = await db.query(`
      SELECT * FROM student_activities
      WHERE student_id = ?
      ORDER BY start_date DESC
    `, [studentId]);

    const [achievements] = await db.query(`
      SELECT * FROM student_achievements
      WHERE student_id = ?
      ORDER BY awarded_date DESC
    `, [studentId]);

    res.json({
      success: true,
      activities,
      achievements
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message });
  }
});

module.exports = router;

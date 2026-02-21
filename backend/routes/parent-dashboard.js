const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Helper function to verify parent-student link
const verifyParentStudentLink = async (parentId, studentId) => {
  const [links] = await pool.execute(
    `SELECT psl.id FROM parent_student_links psl 
     JOIN global_student_sheets gss ON psl.student_id = gss.id 
     WHERE psl.parent_id = ? AND gss.id = ? AND psl.status IN ('approved', 'pending')`,
    [parentId, studentId]
  );
  return links.length > 0;
};

// Get parent profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [parents] = await pool.execute(
      `SELECT id, username, first_name, last_name, email, phone, gender, 
              province, district, sector, address, created_at, last_login, is_active
       FROM users WHERE id = ? AND role = 'parent'`,
      [parentId]
    );

    if (parents.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const parent = parents[0];

    const [links] = await pool.execute(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
              SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM parent_student_links WHERE parent_id = ?`,
      [parentId]
    );

    res.json({
      success: true,
      profile: {
        ...parent,
        total_children: links[0].total || 0,
        approved_children: links[0].approved || 0,
        pending_children: links[0].pending || 0
      }
    });
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get parent dashboard overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [students] = await pool.execute(`
      SELECT 
        gss.id, gss.student_code, gss.first_name, gss.last_name,
        gss.trade_name, gss.level_number, gss.gpa, gss.attendance_percentage,
        gss.balance as pending_fees, gss.gender,
        psl.relationship_type, psl.status as link_status
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status IN ('approved', 'pending')
    `, [parentId]);

    if (students.length === 0) {
      return res.json({
        success: true,
        stats: { total_children: 0, average_grade: 0, attendance_rate: 0, pending_fees: 0 },
        children: []
      });
    }

    const totalChildren = students.length;
    const averageGrade = (students.reduce((sum, s) => sum + (parseFloat(s.gpa) || 0), 0) / totalChildren).toFixed(2);
    const attendanceRate = (students.reduce((sum, s) => sum + (parseFloat(s.attendance_percentage) || 0), 0) / totalChildren).toFixed(1);
    const pendingFees = students.reduce((sum, s) => sum + (parseFloat(s.pending_fees) || 0), 0);

    const children = students.map(s => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      student_code: s.student_code,
      class_name: `${s.trade_name} Level ${s.level_number}`,
      average_grade: s.gpa || 'N/A',
      attendance: s.attendance_percentage || 0,
      pending_fees: s.pending_fees || 0,
      relationship: s.relationship_type,
      link_status: s.link_status
    }));

    res.json({
      success: true,
      stats: { total_children: totalChildren, average_grade: averageGrade, attendance_rate: attendanceRate, pending_fees: pendingFees },
      children
    });
  } catch (error) {
    console.error('Error fetching parent overview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get children list
router.get('/children', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [students] = await pool.execute(`
      SELECT 
        gss.id, gss.student_code, gss.first_name, gss.last_name,
        gss.trade_name, gss.trade_code, gss.level_number,
        gss.gpa, gss.attendance_percentage, gss.balance as pending_fees,
        gss.gender, gss.date_of_birth,
        psl.relationship_type, psl.status as link_status, psl.linked_at
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status IN ('approved', 'pending')
      ORDER BY psl.status, psl.linked_at DESC
    `, [parentId]);

    res.json({
      success: true,
      children: students.map(s => ({
        id: s.id,
        student_code: s.student_code,
        name: `${s.first_name} ${s.last_name}`,
        class_name: `${s.trade_name} Level ${s.level_number}`,
        trade: s.trade_name,
        trade_code: s.trade_code,
        level: s.level_number,
        average_grade: s.gpa || 'N/A',
        attendance: s.attendance_percentage || 0,
        pending_fees: s.pending_fees || 0,
        gender: s.gender,
        date_of_birth: s.date_of_birth,
        relationship: s.relationship_type,
        link_status: s.link_status,
        linked_at: s.linked_at
      }))
    });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single child dashboard
router.get('/child/:studentId/dashboard', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [students] = await pool.execute(`
      SELECT gss.*, psl.relationship_type, psl.status as link_status
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND gss.id = ?
    `, [parentId, studentId]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student: students[0] });
  } catch (error) {
    console.error('Error fetching child dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Auto-fetch student
router.get('/student/auto-fetch', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [students] = await pool.execute(`
      SELECT 
        gss.id, gss.student_code, gss.first_name, gss.last_name,
        gss.trade_name, gss.level_number
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status IN ('approved', 'pending')
      LIMIT 1
    `, [parentId]);

    if (students.length === 0) {
      return res.json({ success: false, message: 'No linked students found' });
    }

    res.json({ success: true, student: students[0] });
  } catch (error) {
    console.error('Error auto-fetching student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student grades
router.get('/student/:studentId/grades', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Return empty array for now - grades table may not exist
    res.json({ success: true, grades: [], summary: { total_grades: 0, average_score: 0 } });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student attendance
router.get('/student/:studentId/attendance', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Return empty data for now
    res.json({ success: true, attendance: { present: 0, absent: 0, late: 0, total: 0 }, monthly_trend: [] });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student fees
router.get('/student/:studentId/fees', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [student] = await pool.execute(
      'SELECT balance, total_fees FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const totalFees = parseFloat(student[0].total_fees) || 0;
    const balance = parseFloat(student[0].balance) || 0;
    const paid = totalFees - balance;

    res.json({
      success: true,
      fees: {
        total_fees: totalFees,
        paid: paid,
        balance: balance,
        payment_status: balance === 0 ? 'Paid' : balance < totalFees ? 'Partial' : 'Unpaid'
      },
      transactions: []
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student conduct
router.get('/student/:studentId/conduct', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [student] = await pool.execute(
      'SELECT conduct_score FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    const conductScore = student[0]?.conduct_score || 40;
    const grade = conductScore >= 36 ? 'A' : conductScore >= 32 ? 'B' : conductScore >= 28 ? 'C' : conductScore >= 24 ? 'D' : 'F';

    const [records] = await pool.execute(
      `SELECT incident_type, description, points_deducted, severity, incident_date, removed_by
       FROM student_conduct_records WHERE student_id = ? ORDER BY incident_date DESC LIMIT 10`,
      [studentId]
    );

    res.json({
      success: true,
      conduct: {
        score: conductScore,
        max_score: 40,
        grade: grade,
        percentage: ((conductScore / 40) * 100).toFixed(1)
      },
      records: records
    });
  } catch (error) {
    console.error('Error fetching conduct:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send message to staff
router.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { recipient_role, subject, message, student_id } = req.body;
    const parentId = req.user.userId;

    if (!recipient_role || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (student_id) {
      const isLinked = await verifyParentStudentLink(parentId, student_id);
      if (!isLinked) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO parent_messages (parent_id, recipient_role, student_id, subject, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'sent', NOW())`,
      [parentId, recipient_role, student_id || null, subject, message]
    );

    res.json({ success: true, message: 'Message sent successfully', message_id: result.insertId });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get parent messages
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [messages] = await pool.execute(
      `SELECT id, recipient_role, student_id, subject, message, status, created_at, read_at
       FROM parent_messages WHERE parent_id = ? ORDER BY created_at DESC LIMIT 50`,
      [parentId]
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get parent activity feed
router.get('/activity/feed', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { limit = 20 } = req.query;

    const [activities] = await pool.execute(
      `SELECT pa.*, gss.first_name, gss.last_name, gss.student_code
       FROM parent_activities pa
       LEFT JOIN global_student_sheets gss ON pa.student_id = gss.id
       WHERE pa.parent_id = ?
       ORDER BY pa.created_at DESC LIMIT ?`,
      [parentId, parseInt(limit)]
    );

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get notifications
router.get('/activity/notifications', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [notifications] = await pool.execute(
      `SELECT pn.*, gss.first_name, gss.last_name
       FROM parent_notifications pn
       LEFT JOIN global_student_sheets gss ON pn.student_id = gss.id
       WHERE pn.parent_id = ?
       ORDER BY pn.created_at DESC LIMIT 30`,
      [parentId]
    );

    const unreadCount = notifications.filter(n => !n.read_at).length;

    res.json({ success: true, notifications, unread_count: unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/activity/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user.userId;

    await pool.execute(
      'UPDATE parent_notifications SET read_at = NOW() WHERE id = ? AND parent_id = ?',
      [id, parentId]
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get activity stats
router.get('/activity/stats', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [stats] = await pool.execute(
      `SELECT 
         COUNT(DISTINCT student_id) as children_count,
         COUNT(*) as total_activities,
         SUM(CASE WHEN activity_type = 'conduct_update' THEN 1 ELSE 0 END) as conduct_updates,
         SUM(CASE WHEN activity_type = 'grade_update' THEN 1 ELSE 0 END) as grade_updates,
         SUM(CASE WHEN activity_type = 'attendance_alert' THEN 1 ELSE 0 END) as attendance_alerts
       FROM parent_activities WHERE parent_id = ?`,
      [parentId]
    );

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Initiate payment
router.post('/payments/initiate', authenticateToken, async (req, res) => {
  try {
    const { student_id, amount, payment_method, phone_number } = req.body;
    const parentId = req.user.userId;

    if (!student_id || !amount || !payment_method) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const isLinked = await verifyParentStudentLink(parentId, student_id);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const [result] = await pool.execute(
      `INSERT INTO payment_transactions 
       (transaction_id, student_id, parent_id, amount, payment_method, phone_number, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [transactionId, student_id, parentId, amount, payment_method, phone_number || null]
    );

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      transaction_id: transactionId,
      payment_id: result.insertId,
      status: 'pending',
      instructions: payment_method === 'momo' 
        ? `Dial *182*7*1# and enter ${amount} RWF to complete payment`
        : 'Follow payment instructions sent to your phone'
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payment history
router.get('/payments/history', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [payments] = await pool.execute(
      `SELECT pt.*, gss.first_name, gss.last_name, gss.student_code
       FROM payment_transactions pt
       JOIN global_student_sheets gss ON pt.student_id = gss.id
       WHERE pt.parent_id = ?
       ORDER BY pt.created_at DESC LIMIT 50`,
      [parentId]
    );

    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({ success: true, payments, total_paid: totalPaid });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;zed' });
    }

    // Get from global_student_sheets
    const [students] = await pool.execute(
      'SELECT total_fees, paid_fees, balance FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    const student = students[0] || {};
    res.json({
      success: true,
      fees: {
        total: student.total_fees || 0,
        paid: student.paid_fees || 0,
        balance: student.balance || 0
      },
      fee_breakdown: [],
      recent_payments: []
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get messages
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, messages: [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, notifications: [] });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json({ success: true, notifications: [] });
  }
});

// Send message
router.post('/message/send', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student assignments
router.get('/student/:studentId/assignments', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, assignments: [], stats: { total: 0, submitted: 0, pending: 0, late: 0 } });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student timetable
router.get('/student/:studentId/timetable', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, timetable: [], timetable_by_day: {} });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student teachers
router.get('/student/:studentId/teachers', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, teachers: [] });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student exams
router.get('/student/:studentId/exams', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, exams: [], upcoming_exams: [] });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get parent dashboard overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    // Get linked students from parent_student_links table
    const [students] = await pool.execute(`
      SELECT 
        gss.id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        gss.trade_name,
        gss.level_number,
        gss.gpa,
        gss.attendance_percentage,
        gss.balance as pending_fees,
        gss.gender
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status IN ('approved', 'pending')
    `, [parentId]);

    // Calculate stats
    const stats = {
      total_children: students.length,
      average_grade: students.length > 0
        ? (students.reduce((sum, s) => sum + (parseFloat(s.gpa) || 0), 0) / students.length).toFixed(2)
        : 0,
      attendance_rate: students.length > 0
        ? (students.reduce((sum, s) => sum + (parseFloat(s.attendance_percentage) || 0), 0) / students.length).toFixed(1)
        : 0,
      pending_fees: students.reduce((sum, s) => sum + (parseFloat(s.pending_fees) || 0), 0)
    };

    // Format children for display
    const children = students.map(s => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      student_code: s.student_code,
      class_name: `${s.trade_name} Level ${s.level_number}`,
      average_grade: s.gpa || 'N/A',
      attendance: s.attendance_percentage || 0,
      pending_fees: s.pending_fees || 0
    }));

    res.json({
      success: true,
      stats,
      children
    });
  } catch (error) {
    console.error('Error fetching parent overview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get children list for parent
router.get('/children', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [students] = await pool.execute(`
      SELECT 
        gss.id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        gss.trade_name,
        gss.level_number,
        gss.gpa,
        gss.attendance_percentage,
        gss.balance as pending_fees,
        gss.gender,
        gss.trade_code,
        psl.relationship_type,
        psl.status as link_status
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status IN ('approved', 'pending')
    `, [parentId]);

    res.json({
      success: true,
      children: students.map(s => ({
        id: s.id,
        student_code: s.student_code,
        name: `${s.first_name} ${s.last_name}`,
        class_name: `${s.trade_name} Level ${s.level_number}`,
        trade: s.trade_name,
        level: s.level_number,
        average_grade: s.gpa || 'N/A',
        attendance: s.attendance_percentage || 0,
        pending_fees: s.pending_fees || 0,
        gender: s.gender,
        relationship: s.relationship_type,
        link_status: s.link_status
      }))
    });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student linked to parent (one student only)
router.get('/student', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    // First try parent_student_links table (new linking system)
    const [linkedStudents] = await pool.execute(`
      SELECT 
        gss.id, gss.first_name, gss.last_name, gss.student_code, 
        gss.trade_name, gss.trade_code, gss.level_number, gss.gender,
        gss.gpa, gss.attendance_percentage, gss.balance,
        psl.status as link_status
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status IN ('approved', 'pending') AND gss.status = 'active'
      LIMIT 1
    `, [parentId]);

    if (linkedStudents.length > 0) {
      const s = linkedStudents[0];
      return res.json({
        success: true,
        student: {
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          student_code: s.student_code,
          trade: s.trade_name,
          trade_code: s.trade_code,
          level: s.level_number,
          gender: s.gender,
          gpa: s.gpa,
          attendance_percentage: s.attendance_percentage,
          balance: s.balance,
          link_status: s.link_status
        }
      });
    }

    // Fallback to parent_student table (legacy)
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.student_id,
        gss.trade_id, gss.level, t.name
      FROM parent_student ps
      JOIN users u ON ps.student_id = u.id
      LEFT JOIN global_student_sheets gss ON u.student_id = gss.student_code
      LEFT JOIN trades t ON gss.trade_id = t.id
      WHERE ps.parent_id = ? AND u.is_active = true
      LIMIT 1
    `, [parentId]);

    if (students.length === 0) {
      return res.json({ success: false, message: 'No student linked to this parent' });
    }

    res.json({ success: true, student: students[0] });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student grades
router.get('/student/:studentId/grades', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student
    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [grades] = await pool.execute(`
      SELECT 
        g.id, g.score, g.grade, g.exam_date, g.remarks,
        s.subject_name as subject,
        et.exam_type_name as exam_type
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN exam_types et ON g.exam_type_id = et.id
      WHERE g.student_id = ?
      ORDER BY g.exam_date DESC
      LIMIT 20
    `, [studentId]);

    res.json({ success: true, grades });
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

    // Verify parent owns this student
    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [attendance] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        COUNT(*) as total
      FROM attendance
      WHERE student_id = ?
    `, [studentId]);

    res.json({
      success: true,
      attendance: attendance[0] || { present: 0, absent: 0, late: 0, total: 0 }
    });
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

    // Verify parent owns this student
    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [fees] = await pool.execute(`
      SELECT 
        SUM(amount) as total,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as balance
      FROM student_fees
      WHERE student_id = ?
    `, [studentId]);

    res.json({
      success: true,
      fees: fees[0] || { total: 0, paid: 0, balance: 0 }
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get parent messages
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [messages] = await pool.execute(`
      SELECT 
        m.id, m.message, m.created_at as time,
        CONCAT(u.first_name, ' ', u.last_name) as sender
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.recipient_id = ? AND m.recipient_type = 'parent'
      ORDER BY m.created_at DESC
      LIMIT 10
    `, [parentId]);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get parent notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [notifications] = await pool.execute(`
      SELECT id, message, created_at as time, is_read
      FROM notifications
      WHERE user_id = ? AND user_type = 'parent'
      ORDER BY created_at DESC
      LIMIT 10
    `, [parentId]);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send message to teacher
router.post('/message/send', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { recipientId, message } = req.body;

    await pool.execute(`
      INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, message)
      VALUES (?, 'parent', ?, 'teacher', ?)
    `, [parentId, recipientId, message]);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student report card
router.get('/student/:studentId/report-card', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [grades] = await pool.execute(`
      SELECT 
        s.subject_name, g.score, g.grade, g.remarks,
        et.exam_type_name, g.exam_date
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN exam_types et ON g.exam_type_id = et.id
      WHERE g.student_id = ?
      ORDER BY g.exam_date DESC
    `, [studentId]);

    const [student] = await pool.execute(
      'SELECT first_name, last_name, student_id FROM users WHERE id = ?',
      [studentId]
    );

    res.json({ success: true, reportCard: { student: student[0], grades } });
  } catch (error) {
    console.error('Error fetching report card:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student assignments
router.get('/student/:studentId/assignments', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [assignments] = await pool.execute(`
      SELECT 
        a.id, a.title, a.description, a.due_date, a.status,
        s.subject_name, a.score, a.submitted_at
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE a.student_id = ?
      ORDER BY a.due_date DESC
      LIMIT 20
    `, [studentId]);

    res.json({ success: true, assignments });
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

    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [timetable] = await pool.execute(`
      SELECT 
        t.id, t.day_of_week, t.start_time, t.end_time,
        s.subject_name, CONCAT(u.first_name, ' ', u.last_name) as teacher,
        t.room
      FROM timetable t
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.teacher_id = u.id
      WHERE t.class_id = (SELECT class_id FROM enrollments WHERE student_id = ? LIMIT 1)
      ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), t.start_time
    `, [studentId]);

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student behavior/discipline records
router.get('/student/:studentId/behavior', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [behavior] = await pool.execute(`
      SELECT 
        d.id, d.incident_type, d.description, d.action_taken,
        d.incident_date, d.severity,
        CONCAT(u.first_name, ' ', u.last_name) as reported_by
      FROM discipline_records d
      LEFT JOIN users u ON d.reported_by = u.id
      WHERE d.student_id = ?
      ORDER BY d.incident_date DESC
      LIMIT 10
    `, [studentId]);

    res.json({ success: true, behavior });
  } catch (error) {
    console.error('Error fetching behavior:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student attendance details
router.get('/student/:studentId/attendance-details', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [attendance] = await pool.execute(`
      SELECT 
        a.id, a.date, a.status, a.remarks,
        s.subject_name,
        CONCAT(u.first_name, ' ', u.last_name) as marked_by
      FROM attendance a
      LEFT JOIN subjects s ON a.subject_id = s.id
      LEFT JOIN users u ON a.marked_by = u.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
      LIMIT 30
    `, [studentId]);

    res.json({ success: true, attendanceDetails: attendance });
  } catch (error) {
    console.error('Error fetching attendance details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get teachers list for messaging
router.get('/student/:studentId/teachers', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [teachers] = await pool.execute(`
      SELECT DISTINCT
        u.id, u.first_name, u.last_name, u.email, u.phone,
        s.subject_name
      FROM users u
      JOIN timetable t ON u.id = t.teacher_id
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.class_id = (SELECT class_id FROM enrollments WHERE student_id = ? LIMIT 1)
      AND u.role = 'teacher'
    `, [studentId]);

    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all messages with conversation threads
router.get('/messages/all', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [messages] = await pool.execute(`
      SELECT 
        m.id, m.message, m.created_at, m.is_read,
        m.sender_type, m.recipient_type,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      WHERE (m.sender_id = ? AND m.sender_type = 'parent') 
         OR (m.recipient_id = ? AND m.recipient_type = 'parent')
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [parentId, parentId]);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user.userId;

    await pool.execute(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ? AND user_type = "parent"',
      [id, parentId]
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student exam schedule
router.get('/student/:studentId/exams', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    const [verify] = await pool.execute(
      'SELECT id FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [exams] = await pool.execute(`
      SELECT 
        e.id, e.exam_name, e.exam_date, e.start_time, e.end_time,
        s.subject_name, e.room, e.duration, e.total_marks
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      WHERE e.class_id = (SELECT class_id FROM enrollments WHERE student_id = ? LIMIT 1)
      AND e.exam_date >= CURDATE()
      ORDER BY e.exam_date, e.start_time
    `, [studentId]);

    res.json({ success: true, exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send SMS notification
router.post('/sms/send', authenticateToken, async (req, res) => {
  try {
    const { phone, message } = req.body;
    const smsService = require('../services/smsService');

    await smsService.sendUniversalMessage(phone, message, 0, {
      type: 'parent_notification',
      userId: req.user.userId
    });

    res.json({ success: true, message: 'SMS sent' });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Request student linking help
router.post('/request-linking', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { student_name, message, preferred_contact } = req.body;

    if (!student_name || !message) {
      return res.status(400).json({ success: false, message: 'Uzuza ibibazwa byose' });
    }

    // Get parent info
    const [parent] = await pool.execute(
      'SELECT first_name, last_name, email, phone FROM users WHERE id = ?',
      [parentId]
    );

    if (parent.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const parentInfo = parent[0];

    // Insert into parent_linking_requests table
    const [result] = await pool.execute(
      'INSERT INTO parent_linking_requests (parent_id, student_name, message, preferred_contact, status, created_at) VALUES (?, ?, ?, ?, "pending", NOW())',
      [parentId, student_name, message, preferred_contact]
    );

    // Create notification for admin, headmaster, and director_study
    const notificationMessage = `STUDENT LINKING REQUEST - Parent: ${parentInfo.first_name} ${parentInfo.last_name} (${parentInfo.email}, ${parentInfo.phone}) - Student Name: ${student_name} - Message: ${message} - Preferred Contact: ${preferred_contact}`;

    // Get admin, headmaster, and director_study users
    const [admins] = await pool.execute(
      "SELECT id FROM users WHERE role IN ('admin', 'headmaster', 'director_study') AND is_active = true"
    );

    // Insert notifications for all admins
    for (const admin of admins) {
      await pool.execute(
        'INSERT INTO notifications (user_id, user_type, message, created_at) VALUES (?, ?, ?, NOW())',
        [admin.id, 'admin', notificationMessage]
      );
    }

    res.json({
      success: true,
      message: 'Ubutumwa bwawe bwoherejwe neza. Uzasubizwa vuba.'
    });
  } catch (error) {
    console.error('Error requesting linking:', error);
    res.status(500).json({ success: false, message: 'Byanze kohereza. Gerageza ukundi.' });
  }
});

module.exports = router;

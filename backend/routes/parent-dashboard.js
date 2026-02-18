const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Helper function to verify parent-student link using the new parent_student_links table
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

    // Get linked students count
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
        id: parent.id,
        first_name: parent.first_name,
        last_name: parent.last_name,
        email: parent.email,
        phone: parent.phone,
        gender: parent.gender,
        province: parent.province,
        district: parent.district,
        sector: parent.sector,
        address: parent.address,
        created_at: parent.created_at,
        last_login: parent.last_login,
        is_active: parent.is_active,
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

// Get parent dashboard overview - ENHANCED with real data
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    // Get linked students from parent_student_links table (new system)
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
        psl.relationship_type,
        psl.status as link_status
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status IN ('approved', 'pending')
    `, [parentId]);

    if (students.length === 0) {
      return res.json({
        success: true,
        stats: {
          total_children: 0,
          average_grade: 0,
          attendance_rate: 0,
          pending_fees: 0,
          total_assignments: 0,
          upcoming_exams: 0,
          recent_behaviors: 0
        },
        children: []
      });
    }

    // Calculate stats
    const totalChildren = students.length;
    const averageGrade = totalChildren > 0
      ? (students.reduce((sum, s) => sum + (parseFloat(s.gpa) || 0), 0) / totalChildren).toFixed(2)
      : 0;
    const attendanceRate = totalChildren > 0
      ? (students.reduce((sum, s) => sum + (parseFloat(s.attendance_percentage) || 0), 0) / totalChildren).toFixed(1)
      : 0;
    const pendingFees = students.reduce((sum, s) => sum + (parseFloat(s.pending_fees) || 0), 0);

    // Get additional real-time stats
    const studentIds = students.map(s => s.id);

    // Get upcoming assignments count
    const [assignmentsResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM assignments 
       WHERE student_id IN (${studentIds.map(() => '?').join(',')}) 
       AND status = 'pending' AND due_date >= CURDATE()`,
      studentIds
    );

    // Get upcoming exams count
    const [examsResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM exams 
       WHERE class_id IN (SELECT class_id FROM enrollments WHERE student_id IN (${studentIds.map(() => '?').join(',')}))
       AND exam_date >= CURDATE()`,
      [...studentIds, ...studentIds]
    );

    // Get recent behavior incidents
    const [behaviorResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM discipline_records 
       WHERE student_id IN (${studentIds.map(() => '?').join(',')}) 
       AND incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      studentIds
    );

    // Format children for display
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

    // Get notifications count
    const [notificationsResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM notifications 
       WHERE user_id = ? AND user_type = 'parent' AND is_read = 0`,
      [parentId]
    );

    res.json({
      success: true,
      stats: {
        total_children: totalChildren,
        average_grade: averageGrade,
        attendance_rate: attendanceRate,
        pending_fees: pendingFees,
        total_assignments: assignmentsResult[0]?.total || 0,
        upcoming_exams: examsResult[0]?.total || 0,
        recent_behaviors: behaviorResult[0]?.total || 0,
        unread_notifications: notificationsResult[0]?.total || 0
      },
      children
    });
  } catch (error) {
    console.error('Error fetching parent overview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get children list for parent - ENHANCED
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
        gss.trade_code,
        gss.level_number,
        gss.gpa,
        gss.attendance_percentage,
        gss.balance as pending_fees,
        gss.gender,
        gss.date_of_birth,
        gss.emergency_contact,
        gss.emergency_phone,
        psl.relationship_type,
        psl.status as link_status,
        psl.linked_at
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
        emergency_contact: s.emergency_contact,
        emergency_phone: s.emergency_phone,
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

// Get single child detailed dashboard - NEW ENDPOINT
router.get('/child/:studentId/dashboard', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized - Student not linked to this parent' });
    }

    // Get student details
    const [students] = await pool.execute(`
      SELECT gss.*, psl.relationship_type, psl.status as link_status
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE gss.id = ? AND psl.parent_id = ?
    `, [studentId, parentId]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    // Get recent grades
    const [grades] = await pool.execute(`
      SELECT g.id, g.score, g.grade, g.exam_date, g.remarks,
             s.subject_name as subject, et.exam_type_name as exam_type
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN exam_types et ON g.exam_type_id = et.id
      WHERE g.student_id = ?
      ORDER BY g.exam_date DESC
      LIMIT 10
    `, [studentId]);

    // Get attendance summary
    const [attendance] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        COUNT(*) as total
      FROM attendance
      WHERE student_id = ?
    `, [studentId]);

    // Get fee summary
    const [fees] = await pool.execute(`
      SELECT 
        SUM(amount) as total,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as balance
      FROM student_fees
      WHERE student_id = ?
    `, [studentId]);

    // Get pending assignments
    const [assignments] = await pool.execute(`
      SELECT a.id, a.title, a.description, a.due_date, a.status, a.score,
             s.subject_name
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE a.student_id = ? AND a.status = 'pending' AND a.due_date >= CURDATE()
      ORDER BY a.due_date
      LIMIT 5
    `, [studentId]);

    // Get upcoming exams
    const [exams] = await pool.execute(`
      SELECT e.id, e.exam_name, e.exam_date, e.start_time, e.end_time, s.subject_name
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      WHERE e.student_id = ? AND e.exam_date >= CURDATE()
      ORDER BY e.exam_date
      LIMIT 5
    `, [studentId]);

    // Get recent behavior records
    const [behaviors] = await pool.execute(`
      SELECT d.id, d.incident_type, d.description, d.severity, d.incident_date
      FROM discipline_records d
      WHERE d.student_id = ?
      ORDER BY d.incident_date DESC
      LIMIT 5
    `, [studentId]);

    res.json({
      success: true,
      student: {
        id: student.id,
        student_code: student.student_code,
        first_name: student.first_name,
        last_name: student.last_name,
        trade_name: student.trade_name,
        trade_code: student.trade_code,
        level_number: student.level_number,
        gpa: student.gpa,
        attendance_percentage: student.attendance_percentage,
        balance: student.balance,
        gender: student.gender,
        relationship: student.relationship_type,
        link_status: student.link_status
      },
      grades: grades,
      attendance: attendance[0] || { present: 0, absent: 0, late: 0, total: 0 },
      fees: fees[0] || { total: 0, paid: 0, balance: 0 },
      assignments: assignments,
      upcoming_exams: exams,
      behaviors: behaviors
    });
  } catch (error) {
    console.error('Error fetching child dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student linked to parent (one student only) - FIXED to use new parent_student_links table
router.get('/student', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    // First try parent_student_links table (new linking system)
    const [linkedStudents] = await pool.execute(`
      SELECT 
        gss.id, gss.first_name, gss.last_name, gss.student_code, 
        gss.trade_name, gss.trade_code, gss.level_number, gss.gender,
        gss.gpa, gss.attendance_percentage, gss.balance,
        gss.date_of_birth, gss.emergency_contact, gss.emergency_phone,
        psl.status as link_status, psl.relationship_type
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status IN ('approved', 'pending') AND gss.status = 'active'
      ORDER BY psl.status DESC, psl.linked_at DESC
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
          date_of_birth: s.date_of_birth,
          emergency_contact: s.emergency_contact,
          emergency_phone: s.emergency_phone,
          link_status: s.link_status,
          relationship: s.relationship_type
        }
      });
    }

    // Fallback to legacy parent_student table
    try {
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

      if (students.length > 0) {
        return res.json({ success: true, student: students[0] });
      }
    } catch (legacyError) {
      console.log('Legacy table not available');
    }

    res.json({ success: false, message: 'No student linked to this parent' });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student grades - ENHANCED with new linking table
router.get('/student/:studentId/grades', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
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
      LIMIT 50
    `, [studentId]);

    // Get grade summary
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_grades,
        AVG(g.score) as average_score,
        MAX(g.score) as highest_score,
        MIN(g.score) as lowest_score,
        SUM(CASE WHEN g.score >= 70 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN g.score >= 50 AND g.score < 70 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN g.score < 50 THEN 1 ELSE 0 END) as needs_improvement
      FROM grades g
      WHERE g.student_id = ?
    `, [studentId]);

    res.json({ success: true, grades, summary: summary[0] });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student attendance - ENHANCED
router.get('/student/:studentId/attendance', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
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

    // Get monthly attendance trend
    const [monthlyTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        COUNT(*) as total
      FROM attendance
      WHERE student_id = ?
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `, [studentId]);

    res.json({
      success: true,
      attendance: attendance[0] || { present: 0, absent: 0, late: 0, total: 0 },
      monthly_trend: monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student fees - ENHANCED
router.get('/student/:studentId/fees', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Get fee summary
    const [fees] = await pool.execute(`
      SELECT 
        SUM(amount) as total,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as balance
      FROM student_fees
      WHERE student_id = ?
    `, [studentId]);

    // Get fee breakdown by type
    const [feeBreakdown] = await pool.execute(`
      SELECT 
        fee_type,
        SUM(amount) as amount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
      FROM student_fees
      WHERE student_id = ?
      GROUP BY fee_type
    `, [studentId]);

    // Get recent payments
    const [payments] = await pool.execute(`
      SELECT * FROM payments 
      WHERE student_id = ?
      ORDER BY payment_date DESC
      LIMIT 10
    `, [studentId]);

    res.json({
      success: true,
      fees: fees[0] || { total: 0, paid: 0, balance: 0 },
      fee_breakdown: feeBreakdown,
      recent_payments: payments
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

// Get student report card - ENHANCED
router.get('/student/:studentId/report-card', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
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

    // Get overall GPA
    const [gpaResult] = await pool.execute(
      'SELECT AVG(score) as gpa FROM grades WHERE student_id = ?',
      [studentId]
    );

    res.json({
      success: true,
      reportCard: {
        student: student[0],
        grades,
        gpa: gpaResult[0]?.gpa || 0
      }
    });
  } catch (error) {
    console.error('Error fetching report card:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student assignments - ENHANCED
router.get('/student/:studentId/assignments', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [assignments] = await pool.execute(`
      SELECT 
        a.id, a.title, a.description, a.due_date, a.status,
        s.subject_name, a.score, a.submitted_at, a.max_score
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE a.student_id = ?
      ORDER BY a.due_date DESC
      LIMIT 50
    `, [studentId]);

    // Get assignment statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        AVG(score) as average_score
      FROM assignments
      WHERE student_id = ?
    `, [studentId]);

    res.json({ success: true, assignments, stats: stats[0] });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student timetable - ENHANCED
router.get('/student/:studentId/timetable', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
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
      ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), t.start_time
    `, [studentId]);

    // Group by day
    const timetableByDay = {};
    timetable.forEach(t => {
      if (!timetableByDay[t.day_of_week]) {
        timetableByDay[t.day_of_week] = [];
      }
      timetableByDay[t.day_of_week].push(t);
    });

    res.json({ success: true, timetable, timetable_by_day: timetableByDay });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student behavior/discipline records - ENHANCED
router.get('/student/:studentId/behavior', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
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
      LIMIT 20
    `, [studentId]);

    // Get behavior summary
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity
      FROM discipline_records
      WHERE student_id = ?
    `, [studentId]);

    res.json({ success: true, behavior, summary: summary[0] });
  } catch (error) {
    console.error('Error fetching behavior:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student attendance details - ENHANCED
router.get('/student/:studentId/attendance-details', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
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
      LIMIT 60
    `, [studentId]);

    res.json({ success: true, attendanceDetails: attendance });
  } catch (error) {
    console.error('Error fetching attendance details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get teachers list for messaging - ENHANCED
router.get('/student/:studentId/teachers', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [teachers] = await pool.execute(`
      SELECT DISTINCT
        u.id, u.first_name, u.last_name, u.email, u.phone,
        s.subject_name,
        GROUP_CONCAT(DISTINCT t.day_of_week ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday') SEPARATOR ', ') as teaching_days
      FROM users u
      JOIN timetable t ON u.id = t.teacher_id
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.class_id = (SELECT class_id FROM enrollments WHERE student_id = ? LIMIT 1)
      AND u.role = 'teacher'
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, s.subject_name
    `, [studentId]);

    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all messages with conversation threads - ENHANCED
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
      LIMIT 100
    `, [parentId, parentId]);

    // Get unread count
    const [unreadCount] = await pool.execute(
      `SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND recipient_type = 'parent' AND is_read = 0`,
      [parentId]
    );

    res.json({ success: true, messages, unread_count: unreadCount[0]?.count || 0 });
  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get parent notifications - ENHANCED
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const [notifications] = await pool.execute(`
      SELECT id, message, created_at, is_read, notification_type
      FROM notifications
      WHERE user_id = ? AND user_type = 'parent'
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [parentId, parseInt(limit), parseInt(offset)]);

    // Get unread count
    const [unreadCount] = await pool.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND user_type = 'parent' AND is_read = 0`,
      [parentId]
    );

    // Get notification types summary
    const [typeSummary] = await pool.execute(
      `SELECT notification_type, COUNT(*) as count FROM notifications WHERE user_id = ? AND user_type = 'parent' AND is_read = 0 GROUP BY notification_type`,
      [parentId]
    );

    res.json({
      success: true,
      notifications,
      unread_count: unreadCount[0]?.count || 0,
      type_summary: typeSummary
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user.userId;

    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND user_type = "parent"',
      [id, parentId]
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_type = "parent"',
      [parentId]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student exam schedule - ENHANCED
router.get('/student/:studentId/exams', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student using new linking table
    const isLinked = await verifyParentStudentLink(parentId, studentId);
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [exams] = await pool.execute(`
      SELECT 
        e.id, e.exam_name, e.exam_date, e.start_time, e.end_time,
        s.subject_name, e.room, e.duration, e.total_marks
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      WHERE e.student_id = ?
      ORDER BY e.exam_date DESC
      LIMIT 30
    `, [studentId]);

    // Get upcoming exams
    const [upcomingExams] = await pool.execute(`
      SELECT 
        e.id, e.exam_name, e.exam_date, e.start_time, e.end_time,
        s.subject_name, e.room, e.duration, e.total_marks
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      WHERE e.student_id = ? AND e.exam_date >= CURDATE()
      ORDER BY e.exam_date, e.start_time
      LIMIT 10
    `, [studentId]);

    res.json({ success: true, exams, upcoming_exams: upcomingExams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send SMS notification - ENHANCED
router.post('/sms/send', authenticateToken, async (req, res) => {
  try {
    const { phone, message } = req.body;
    const smsService = require('../services/smsService');

    await smsService.sendUniversalMessage(phone, message, 0, {
      type: 'parent_notification',
      userId: req.user.userId
    });

    res.json({ success: true, message: 'SMS sent successfully' });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Request student linking help - ENHANCED
router.post('/request-linking', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { student_name, message, preferred_contact, student_code, level, trade } = req.body;

    if (!student_name || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
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
      `INSERT INTO parent_linking_requests 
       (parent_id, student_name, student_code, level, trade, message, preferred_contact, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [parentId, student_name, student_code || null, level || null, trade || null, message, preferred_contact]
    );

    // Create notification for admin, headmaster, and director_study
    const notificationMessage = `STUDENT LINKING REQUEST - Parent: ${parentInfo.first_name} ${parentInfo.last_name} (${parentInfo.email}, ${parentInfo.phone}) - Student Name: ${student_name}${student_code ? ' (Code: ' + student_code + ')' : ''} - Message: ${message} - Preferred Contact: ${preferred_contact}`;

    // Get admin, headmaster, and director_study users
    const [admins] = await pool.execute(
      "SELECT id FROM users WHERE role IN ('admin', 'headmaster', 'director_study') AND is_active = 1"
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
      message: 'Your request has been submitted. You will be contacted soon.',
      request_id: result.insertId
    });
  } catch (error) {
    console.error('Error requesting linking:', error);
    res.status(500).json({ success: false, message: 'Failed to submit request. Please try again.' });
  }
});

// Get parent linking requests status
router.get('/my-linking-requests', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    const [requests] = await pool.execute(
      `SELECT * FROM parent_linking_requests WHERE parent_id = ? ORDER BY created_at DESC`,
      [parentId]
    );

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching linking requests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get quick stats for parent - NEW ENDPOINT
router.get('/quick-stats', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId;

    // Get linked students
    const [students] = await pool.execute(
      `SELECT COUNT(*) as count FROM parent_student_links WHERE parent_id = ? AND status = 'approved'`,
      [parentId]
    );

    // Get unread notifications
    const [notifications] = await pool.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND user_type = 'parent' AND is_read = 0`,
      [parentId]
    );

    // Get unread messages
    const [messages] = await pool.execute(
      `SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND recipient_type = 'parent' AND is_read = 0`,
      [parentId]
    );

    // Get pending assignments across all children
    const [assignments] = await pool.execute(
      `SELECT COUNT(*) as count FROM assignments 
       WHERE student_id IN (SELECT student_id FROM parent_student_links WHERE parent_id = ? AND status = 'approved')
       AND status = 'pending' AND due_date >= CURDATE()`,
      [parentId]
    );

    // Get upcoming exams
    const [exams] = await pool.execute(
      `SELECT COUNT(*) as count FROM exams 
       WHERE student_id IN (SELECT student_id FROM parent_student_links WHERE parent_id = ? AND status = 'approved')
       AND exam_date >= CURDATE() AND exam_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
      [parentId]
    );

    res.json({
      success: true,
      stats: {
        linked_children: students[0]?.count || 0,
        unread_notifications: notifications[0]?.count || 0,
        unread_messages: messages[0]?.count || 0,
        pending_assignments: assignments[0]?.count || 0,
        upcoming_exams: exams[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

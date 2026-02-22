const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get parent's full dashboard data for all linked children - COMPLETE ACCESS
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId || req.user.id;

    // Get all linked children with full details
    const [children] = await db.execute(`
      SELECT 
        gss.*,
        pcl.relationship_type,
        pcl.linked_at,
        pcl.permissions
      FROM parent_child_links pcl
      INNER JOIN global_student_sheets gss ON pcl.student_id = gss.id
      WHERE pcl.parent_id = ? AND pcl.status = 'active'
      ORDER BY gss.first_name, gss.last_name
    `, [parentId]);

    if (children.length === 0) {
      return res.json({ success: true, children: [], message: 'No linked children found' });
    }

    // Get comprehensive data for each child
    const childrenData = await Promise.all(children.map(async (child) => {
      const studentId = child.id;

      // Conduct records
      const [conduct] = await db.execute(`
        SELECT * FROM student_conduct_records
        WHERE student_id = ?
        ORDER BY incident_date DESC
        LIMIT 50
      `, [studentId]);

      // Attendance
      const [attendance] = await db.execute(`
        SELECT * FROM attendance
        WHERE student_id = ?
        ORDER BY date DESC
        LIMIT 90
      `, [studentId]);

      // Grades
      const [grades] = await db.execute(`
        SELECT g.*, s.subject_name, s.subject_code, t.first_name as teacher_first_name, t.last_name as teacher_last_name
        FROM grades g
        LEFT JOIN subjects s ON g.subject_id = s.subject_id
        LEFT JOIN teachers t ON g.teacher_id = t.teacher_id
        WHERE g.student_id = ?
        ORDER BY g.created_at DESC
      `, [studentId]);

      // Fees with payment history
      const [fees] = await db.execute(`
        SELECT sf.*, fp.payment_date, fp.amount as payment_amount, fp.payment_method, fp.receipt_number
        FROM student_fees sf
        LEFT JOIN fee_payments fp ON sf.fee_id = fp.fee_id
        WHERE sf.student_id = ?
        ORDER BY sf.created_at DESC
      `, [studentId]);

      // Assignments
      const [assignments] = await db.execute(`
        SELECT a.*, s.subject_name, sa.submission_date, sa.score, sa.feedback
        FROM assignments a
        LEFT JOIN subjects s ON a.subject_id = s.subject_id
        LEFT JOIN student_assignments sa ON a.assignment_id = sa.assignment_id AND sa.student_id = ?
        WHERE a.class_id = (SELECT class_id FROM enrollments WHERE student_id = ? AND status = 'active' LIMIT 1)
        ORDER BY a.due_date DESC
        LIMIT 30
      `, [studentId, studentId]);

      // Leave requests
      const [leaves] = await db.execute(`
        SELECT lr.*, u.first_name as approved_by_first_name, u.last_name as approved_by_last_name
        FROM leave_requests lr
        LEFT JOIN users u ON lr.approved_by = u.user_id
        WHERE lr.student_id = ?
        ORDER BY lr.created_at DESC
        LIMIT 20
      `, [studentId]);

      // Messages from staff
      const [messages] = await db.execute(`
        SELECT pm.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.role as sender_role
        FROM parent_messages pm
        LEFT JOIN users u ON pm.sender_id = u.user_id
        WHERE pm.parent_id = ? AND (pm.student_id = ? OR pm.student_id IS NULL)
        ORDER BY pm.created_at DESC
        LIMIT 50
      `, [parentId, studentId]);

      // Timetable
      const [timetable] = await db.execute(`
        SELECT tt.*, s.subject_name, t.first_name as teacher_first_name, t.last_name as teacher_last_name
        FROM timetable tt
        LEFT JOIN subjects s ON tt.subject_id = s.subject_id
        LEFT JOIN teachers t ON tt.teacher_id = t.teacher_id
        WHERE tt.class_id = (SELECT class_id FROM enrollments WHERE student_id = ? AND status = 'active' LIMIT 1)
        ORDER BY FIELD(tt.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), tt.period
      `, [studentId]);

      // Exam schedule
      const [exams] = await db.execute(`
        SELECT e.*, s.subject_name
        FROM exams e
        LEFT JOIN subjects s ON e.subject_id = s.subject_id
        WHERE e.class_id = (SELECT class_id FROM enrollments WHERE student_id = ? AND status = 'active' LIMIT 1)
        AND e.exam_date >= CURDATE()
        ORDER BY e.exam_date, e.start_time
        LIMIT 20
      `, [studentId]);

      return {
        student: child,
        conduct: {
          records: conduct,
          current_score: child.conduct_score || 40,
          grade: child.conduct_score >= 36 ? 'A' : child.conduct_score >= 32 ? 'B' : child.conduct_score >= 28 ? 'C' : child.conduct_score >= 24 ? 'D' : 'F',
          total_incidents: conduct.length,
          total_points_lost: conduct.reduce((sum, c) => sum + (c.conduct_points_deducted || 0), 0)
        },
        attendance: {
          records: attendance,
          percentage: child.attendance_percentage || 0,
          present_days: attendance.filter(a => a.status === 'present').length,
          absent_days: attendance.filter(a => a.status === 'absent').length,
          late_days: attendance.filter(a => a.status === 'late').length
        },
        grades: {
          records: grades,
          average: grades.length > 0 ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length : 0,
          gpa: grades.length > 0 ? grades.reduce((sum, g) => sum + (g.grade_points || 0), 0) / grades.length : 0
        },
        fees: {
          records: fees,
          total: child.total_fees || 0,
          paid: child.paid_fees || 0,
          balance: child.balance || 0,
          payment_status: child.payment_status || 'pending'
        },
        assignments: {
          records: assignments,
          pending: assignments.filter(a => !a.submission_date).length,
          completed: assignments.filter(a => a.submission_date).length,
          average_score: assignments.filter(a => a.score).length > 0 ? assignments.filter(a => a.score).reduce((sum, a) => sum + a.score, 0) / assignments.filter(a => a.score).length : 0
        },
        leaves: {
          records: leaves,
          pending: leaves.filter(l => l.status === 'pending').length,
          approved: leaves.filter(l => l.status === 'approved').length,
          rejected: leaves.filter(l => l.status === 'rejected').length
        },
        messages: {
          records: messages,
          unread: messages.filter(m => !m.read_at).length,
          total: messages.length
        },
        timetable: timetable,
        exams: exams
      };
    }));

    res.json({ success: true, children: childrenData, count: childrenData.length });

  } catch (error) {
    console.error('Parent dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data', error: error.message });
  }
});

// Get specific child's detailed data
router.get('/child/:studentId', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId || req.user.id;
    const { studentId } = req.params;

    // Verify parent has access to this child
    const [links] = await db.execute(`
      SELECT * FROM parent_child_links
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, studentId]);

    if (links.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this student'
      });
    }

    // Get full student data
    const [students] = await db.execute(`
      SELECT * FROM global_student_sheets WHERE id = ?
    `, [studentId]);

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = students[0];

    // Get all related data
    const [conduct] = await db.execute(`
      SELECT * FROM student_conduct_records
      WHERE student_id = ?
      ORDER BY incident_date DESC
    `, [studentId]);

    const [attendance] = await db.execute(`
      SELECT * FROM attendance
      WHERE student_id = ?
      ORDER BY date DESC
    `, [studentId]);

    const [grades] = await db.execute(`
      SELECT * FROM grades
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [studentId]);

    const [fees] = await db.execute(`
      SELECT * FROM student_fees
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [studentId]);

    const [assignments] = await db.execute(`
      SELECT * FROM assignments
      WHERE student_id = ?
      ORDER BY due_date DESC
    `, [studentId]);

    const [leaves] = await db.execute(`
      SELECT * FROM leave_requests
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [studentId]);

    res.json({
      success: true,
      student,
      conduct,
      attendance,
      grades,
      fees,
      assignments,
      leaves
    });

  } catch (error) {
    console.error('Get child data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch child data',
      error: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get parent's full dashboard data for all linked children
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
      return res.json({
        success: true,
        children: [],
        message: 'No linked children found'
      });
    }

    // Get comprehensive data for each child
    const childrenData = await Promise.all(children.map(async (child) => {
      const studentId = child.id;

      // Get conduct records
      const [conduct] = await db.execute(`
        SELECT * FROM student_conduct_records
        WHERE student_id = ?
        ORDER BY incident_date DESC
        LIMIT 10
      `, [studentId]);

      // Get attendance
      const [attendance] = await db.execute(`
        SELECT * FROM attendance
        WHERE student_id = ?
        ORDER BY date DESC
        LIMIT 30
      `, [studentId]);

      // Get grades
      const [grades] = await db.execute(`
        SELECT * FROM grades
        WHERE student_id = ?
        ORDER BY created_at DESC
      `, [studentId]);

      // Get fees
      const [fees] = await db.execute(`
        SELECT * FROM student_fees
        WHERE student_id = ?
        ORDER BY created_at DESC
      `, [studentId]);

      // Get assignments
      const [assignments] = await db.execute(`
        SELECT * FROM assignments
        WHERE student_id = ?
        ORDER BY due_date DESC
        LIMIT 20
      `, [studentId]);

      // Get leave requests
      const [leaves] = await db.execute(`
        SELECT * FROM leave_requests
        WHERE student_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `, [studentId]);

      // Get messages
      const [messages] = await db.execute(`
        SELECT * FROM parent_messages
        WHERE parent_id = ? AND student_id = ?
        ORDER BY created_at DESC
        LIMIT 20
      `, [parentId, studentId]);

      // Get timetable
      const [timetable] = await db.execute(`
        SELECT * FROM timetable
        WHERE class_id = (SELECT class_id FROM enrollments WHERE student_id = ? AND status = 'active' LIMIT 1)
      `, [studentId]);

      return {
        student: child,
        conduct: {
          records: conduct,
          current_score: child.conduct_score || 40,
          grade: child.conduct_score >= 36 ? 'A' : child.conduct_score >= 32 ? 'B' : child.conduct_score >= 28 ? 'C' : child.conduct_score >= 24 ? 'D' : 'F'
        },
        attendance: {
          records: attendance,
          percentage: child.attendance_percentage || 0,
          present_days: attendance.filter(a => a.status === 'present').length,
          absent_days: attendance.filter(a => a.status === 'absent').length
        },
        grades: {
          records: grades,
          average: grades.length > 0 ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length : 0
        },
        fees: {
          records: fees,
          total: fees.reduce((sum, f) => sum + (f.amount || 0), 0),
          paid: fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0),
          balance: fees.reduce((sum, f) => sum + ((f.amount || 0) - (f.paid_amount || 0)), 0)
        },
        assignments: {
          records: assignments,
          pending: assignments.filter(a => a.status === 'pending').length,
          completed: assignments.filter(a => a.status === 'completed').length
        },
        leaves: {
          records: leaves,
          pending: leaves.filter(l => l.status === 'pending').length,
          approved: leaves.filter(l => l.status === 'approved').length
        },
        messages: {
          records: messages,
          unread: messages.filter(m => !m.read_at).length
        },
        timetable: timetable
      };
    }));

    res.json({
      success: true,
      children: childrenData,
      count: childrenData.length
    });

  } catch (error) {
    console.error('Parent dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
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

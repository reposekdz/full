const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get student activity updates (Performance, Attendance, Exams, Conduct)
router.get('/student/:studentId/activity-updates', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student
    const [links] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [parentId, studentId]
    );

    if (links.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updates = [];

    // 1. Performance Updates (Recent Grades - last 7 days)
    const [recentGrades] = await pool.execute(`
      SELECT 'performance' as type, subject, score, max_score, grade, exam_date as date, created_at
      FROM grades
      WHERE student_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY created_at DESC
      LIMIT 5
    `, [studentId]);

    recentGrades.forEach(g => {
      updates.push({
        type: 'performance',
        title: `New Grade: ${g.subject}`,
        description: `Score: ${g.score}/${g.max_score} (${g.grade})`,
        date: g.created_at,
        data: g
      });
    });

    // 2. Attendance Updates (Recent absences/lates - last 7 days)
    const [recentAttendance] = await pool.execute(`
      SELECT 'attendance' as type, date, status, subject, notes, created_at
      FROM attendance
      WHERE student_id = ? AND status IN ('absent', 'late') AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY date DESC
      LIMIT 5
    `, [studentId]);

    recentAttendance.forEach(a => {
      updates.push({
        type: 'attendance',
        title: `Attendance: ${a.status}`,
        description: `${a.date}${a.subject ? ` - ${a.subject}` : ''}`,
        date: a.created_at || a.date,
        data: a
      });
    });

    // 3. Exam Updates (Upcoming exams - next 14 days)
    const [upcomingExams] = await pool.execute(`
      SELECT 'exam' as type, subject, exam_date, start_time, venue, exam_type, created_at
      FROM exams
      WHERE class_id IN (SELECT class_id FROM enrollments WHERE student_id = ?)
        AND exam_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
      ORDER BY exam_date ASC
      LIMIT 5
    `, [studentId]);

    upcomingExams.forEach(e => {
      updates.push({
        type: 'exam',
        title: `Upcoming Exam: ${e.subject}`,
        description: `${e.exam_date} at ${e.start_time} - ${e.venue}`,
        date: e.created_at,
        data: e
      });
    });

    // 4. Conduct Updates (Recent discipline records - last 30 days)
    const [recentConduct] = await pool.execute(`
      SELECT 'conduct' as type, incident_type, severity, description, 
             conduct_points_deducted, new_conduct_score, created_at, removed_by_name
      FROM student_conduct_records
      WHERE student_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY created_at DESC
      LIMIT 5
    `, [studentId]);

    recentConduct.forEach(c => {
      updates.push({
        type: 'conduct',
        title: `Conduct: ${c.incident_type}`,
        description: `${c.severity} - ${c.conduct_points_deducted} points deducted. New score: ${c.new_conduct_score}/40`,
        date: c.created_at,
        data: c
      });
    });

    // Sort all updates by date (most recent first)
    updates.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get summary counts
    const [conductSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(conduct_points_deducted) as total_points_lost,
        (SELECT conduct_score FROM global_student_sheets WHERE id = ?) as current_score
      FROM student_conduct_records
      WHERE student_id = ?
    `, [studentId, studentId]);

    res.json({
      success: true,
      updates: updates.slice(0, 20), // Limit to 20 most recent
      summary: {
        performance: recentGrades.length,
        attendance: recentAttendance.length,
        exams: upcomingExams.length,
        conduct: recentConduct.length,
        conduct_details: conductSummary[0] || { total_incidents: 0, total_points_lost: 0, current_score: 40 }
      }
    });
  } catch (error) {
    console.error('Error fetching activity updates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get detailed conduct history
router.get('/student/:studentId/conduct-details', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.userId;

    // Verify parent owns this student
    const [links] = await pool.execute(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "approved"',
      [parentId, studentId]
    );

    if (links.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Get all conduct records
    const [records] = await pool.execute(`
      SELECT 
        id, incident_type, severity, description, action_taken,
        conduct_points_deducted, new_conduct_score, removed_by_name,
        created_at, incident_date
      FROM student_conduct_records
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [studentId]);

    // Get current conduct score
    const [student] = await pool.execute(
      'SELECT conduct_score FROM global_student_sheets WHERE id = ?',
      [studentId]
    );

    res.json({
      success: true,
      current_score: student[0]?.conduct_score || 40,
      total_incidents: records.length,
      total_points_lost: records.reduce((sum, r) => sum + (r.conduct_points_deducted || 0), 0),
      records
    });
  } catch (error) {
    console.error('Error fetching conduct details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

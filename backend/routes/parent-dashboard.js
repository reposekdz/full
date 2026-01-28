const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get parent's linked children
router.get('/my-children', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [children] = await db.query(`
      SELECT s.*, u.name, u.email, tc.name as trade_name, tc.level,
             (SELECT COUNT(*) FROM student_medals WHERE student_id = s.user_id) as total_medals,
             (SELECT COALESCE(SUM(points), 0) FROM student_points WHERE student_id = s.user_id) as total_points
      FROM parent_student_links psl
      JOIN students s ON psl.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN trade_classes tc ON s.trade_id = tc.id
      WHERE psl.parent_id = ? AND psl.is_active = true
    `, [req.user.id]);
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child's complete academic performance
router.get('/child/:studentId/academics', authenticate, authorize(['parent']), async (req, res) => {
  try {
    // Verify parent-child link
    const [link] = await db.query('SELECT * FROM parent_student_links WHERE parent_id = ? AND student_id = ?', [req.user.id, req.params.studentId]);
    if (!link.length) return res.status(403).json({ error: 'Access denied' });

    const [performance] = await db.query(`
      SELECT ap.*, s.name as subject_name, tc.name as class_name
      FROM academic_performance ap
      JOIN subjects s ON ap.subject_id = s.id
      LEFT JOIN trade_classes tc ON ap.class_id = tc.id
      WHERE ap.student_id = ?
      ORDER BY ap.term DESC, s.name
    `, [req.params.studentId]);

    const [summary] = await db.query(`
      SELECT 
        AVG(quiz_marks + midterm_marks + final_marks) as average_marks,
        COUNT(*) as total_subjects,
        AVG(CASE 
          WHEN (quiz_marks + midterm_marks + final_marks) >= 90 THEN 4.0
          WHEN (quiz_marks + midterm_marks + final_marks) >= 80 THEN 3.0
          WHEN (quiz_marks + midterm_marks + final_marks) >= 70 THEN 2.0
          WHEN (quiz_marks + midterm_marks + final_marks) >= 60 THEN 1.0
          ELSE 0.0
        END) as gpa
      FROM academic_performance
      WHERE student_id = ?
    `, [req.params.studentId]);

    res.json({ performance, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child's attendance
router.get('/child/:studentId/attendance', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [link] = await db.query('SELECT * FROM parent_student_links WHERE parent_id = ? AND student_id = ?', [req.user.id, req.params.studentId]);
    if (!link.length) return res.status(403).json({ error: 'Access denied' });

    const [attendance] = await db.query(`
      SELECT sa.*, s.name as subject_name
      FROM student_attendance sa
      LEFT JOIN subjects s ON sa.subject_id = s.id
      WHERE sa.student_id = ?
      ORDER BY sa.date DESC
      LIMIT 100
    `, [req.params.studentId]);

    const [summary] = await db.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
      FROM student_attendance
      WHERE student_id = ?
    `, [req.params.studentId]);

    res.json({ attendance, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child's discipline records
router.get('/child/:studentId/discipline', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [link] = await db.query('SELECT * FROM parent_student_links WHERE parent_id = ? AND student_id = ?', [req.user.id, req.params.studentId]);
    if (!link.length) return res.status(403).json({ error: 'Access denied' });

    const [records] = await db.query(`
      SELECT dr.*, u.name as reported_by_name
      FROM discipline_records dr
      LEFT JOIN users u ON dr.reported_by = u.id
      WHERE dr.student_id = ?
      ORDER BY dr.incident_date DESC
    `, [req.params.studentId]);

    const [conduct] = await db.query(`
      SELECT conduct_score, last_updated
      FROM student_conduct_tracking
      WHERE student_id = ?
      ORDER BY last_updated DESC
      LIMIT 1
    `, [req.params.studentId]);

    res.json({ records, conduct_score: conduct[0]?.conduct_score || 100 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child's fee payments
router.get('/child/:studentId/fees', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [link] = await db.query('SELECT * FROM parent_student_links WHERE parent_id = ? AND student_id = ?', [req.user.id, req.params.studentId]);
    if (!link.length) return res.status(403).json({ error: 'Access denied' });

    const [payments] = await db.query(`
      SELECT * FROM fee_payments
      WHERE student_id = ?
      ORDER BY payment_date DESC
    `, [req.params.studentId]);

    const [summary] = await db.query(`
      SELECT 
        COALESCE(SUM(amount_paid), 0) as total_paid,
        COALESCE(SUM(balance), 0) as total_balance
      FROM fee_payments
      WHERE student_id = ?
    `, [req.params.studentId]);

    res.json({ payments, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child's competitions
router.get('/child/:studentId/competitions', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [link] = await db.query('SELECT * FROM parent_student_links WHERE parent_id = ? AND student_id = ?', [req.user.id, req.params.studentId]);
    if (!link.length) return res.status(403).json({ error: 'Access denied' });

    const [competitions] = await db.query(`
      SELECT cp.*, c.title, c.description, cc.name as category_name
      FROM competition_participants cp
      JOIN competitions c ON cp.competition_id = c.id
      LEFT JOIN competition_categories cc ON c.category_id = cc.id
      WHERE cp.student_id = ?
      ORDER BY cp.joined_at DESC
    `, [req.params.studentId]);

    const [medals] = await db.query(`
      SELECT medal_type, COUNT(*) as count
      FROM student_medals
      WHERE student_id = ?
      GROUP BY medal_type
    `, [req.params.studentId]);

    res.json({ competitions, medals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child's assignments
router.get('/child/:studentId/assignments', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [link] = await db.query('SELECT * FROM parent_student_links WHERE parent_id = ? AND student_id = ?', [req.user.id, req.params.studentId]);
    if (!link.length) return res.status(403).json({ error: 'Access denied' });

    const [assignments] = await db.query(`
      SELECT a.*, asub.marks_obtained, asub.status as submission_status, s.name as subject_name
      FROM assignments a
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE a.trade_class_id IN (SELECT trade_id FROM students WHERE user_id = ?)
      ORDER BY a.due_date DESC
      LIMIT 50
    `, [req.params.studentId, req.params.studentId]);

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child's complete dashboard
router.get('/child/:studentId/dashboard', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [link] = await db.query('SELECT * FROM parent_student_links WHERE parent_id = ? AND student_id = ?', [req.user.id, req.params.studentId]);
    if (!link.length) return res.status(403).json({ error: 'Access denied' });

    const [student] = await db.query(`
      SELECT s.*, u.name, u.email, tc.name as trade_name, tc.level
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN trade_classes tc ON s.trade_id = tc.id
      WHERE s.user_id = ?
    `, [req.params.studentId]);

    const [academics] = await db.query(`
      SELECT AVG(quiz_marks + midterm_marks + final_marks) as average_marks
      FROM academic_performance WHERE student_id = ?
    `, [req.params.studentId]);

    const [attendance] = await db.query(`
      SELECT 
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as percentage
      FROM student_attendance WHERE student_id = ?
    `, [req.params.studentId]);

    const [conduct] = await db.query(`
      SELECT conduct_score FROM student_conduct_tracking WHERE student_id = ? ORDER BY last_updated DESC LIMIT 1
    `, [req.params.studentId]);

    const [fees] = await db.query(`
      SELECT COALESCE(SUM(balance), 0) as balance FROM fee_payments WHERE student_id = ?
    `, [req.params.studentId]);

    const [medals] = await db.query(`
      SELECT 
        COUNT(CASE WHEN medal_type = 'diamond' THEN 1 END) as diamond,
        COUNT(CASE WHEN medal_type = 'gold' THEN 1 END) as gold,
        COUNT(CASE WHEN medal_type = 'silver' THEN 1 END) as silver,
        COUNT(CASE WHEN medal_type = 'bronze' THEN 1 END) as bronze
      FROM student_medals WHERE student_id = ?
    `, [req.params.studentId]);

    res.json({
      student: student[0],
      average_marks: academics[0]?.average_marks || 0,
      attendance_percentage: attendance[0]?.percentage || 0,
      conduct_score: conduct[0]?.conduct_score || 100,
      fee_balance: fees[0]?.balance || 0,
      medals: medals[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parent notifications
router.get('/notifications', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [notifications] = await db.query(`
      SELECT pn.*, s.student_code, u.name as student_name
      FROM parent_notifications pn
      JOIN students s ON pn.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      WHERE pn.parent_id = ?
      ORDER BY pn.created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parent overview
router.get('/overview', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [parent] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const [children] = await db.query(`
      SELECT s.*, u.name, u.email, tc.name as class_name,
             (SELECT AVG(quiz_marks + midterm_marks + final_marks) FROM academic_performance WHERE student_id = s.user_id) as average_grade,
             (SELECT ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) FROM student_attendance WHERE student_id = s.user_id) as attendance_rate
      FROM parent_student_links psl
      JOIN students s ON psl.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN trade_classes tc ON s.trade_id = tc.id
      WHERE psl.parent_id = ? AND psl.is_active = true
    `, [req.user.id]);
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT s.user_id) as total_children,
        AVG((SELECT AVG(quiz_marks + midterm_marks + final_marks) FROM academic_performance WHERE student_id = s.user_id)) as average_grade,
        AVG((SELECT ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) FROM student_attendance WHERE student_id = s.user_id)) as attendance_rate,
        SUM((SELECT COALESCE(SUM(balance), 0) FROM fee_payments WHERE student_id = s.user_id)) as pending_fees
      FROM parent_student_links psl
      JOIN students s ON psl.student_id = s.user_id
      WHERE psl.parent_id = ? AND psl.is_active = true
    `, [req.user.id]);

    res.json({ success: true, parent: parent[0], children, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get children list
router.get('/children', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const [children] = await db.query(`
      SELECT s.*, u.name, u.email, tc.name as class_name,
             (SELECT AVG(quiz_marks + midterm_marks + final_marks) FROM academic_performance WHERE student_id = s.user_id) as average_grade,
             (SELECT ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) FROM student_attendance WHERE student_id = s.user_id) as attendance_rate
      FROM parent_student_links psl
      JOIN students s ON psl.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN trade_classes tc ON s.trade_id = tc.id
      WHERE psl.parent_id = ? AND psl.is_active = true
    `, [req.user.id]);
    res.json({ success: true, children });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get parent's children
router.get('/:parentId/children', async (req, res) => {
  try {
    const [children] = await db.query(`
      SELECT s.id, s.student_id, 
             CONCAT(s.first_name, ' ', s.last_name) as name,
             s.grade, c.name as class_name, s.email, s.phone
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.parent_id = ?
    `, [req.params.parentId]);

    res.json({ success: true, children });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get child dashboard data
router.get('/child/:childId/dashboard', async (req, res) => {
  try {
    const [student] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.childId]);
    if (!student || student.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const [marks] = await db.query(`
      SELECT AVG(quiz_marks + midterm_marks + final_marks) as average_marks,
             COUNT(DISTINCT subject_id) as total_subjects
      FROM grades WHERE student_id = ?
    `, [req.params.childId]);

    const [attendance] = await db.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
      FROM attendance WHERE student_id = ?
    `, [req.params.childId]);

    const attendancePercentage = attendance[0].total_days > 0 
      ? ((attendance[0].present_days / attendance[0].total_days) * 100).toFixed(1)
      : 0;

    const [conduct] = await db.query(`
      SELECT conduct_score FROM discipline_records 
      WHERE student_id = ? ORDER BY created_at DESC LIMIT 1
    `, [req.params.childId]);

    const [fees] = await db.query(`
      SELECT 
        SUM(amount) as total_amount,
        SUM(amount_paid) as total_paid,
        SUM(balance) as total_balance
      FROM student_payments WHERE student_id = ?
    `, [req.params.childId]);

    const [classInfo] = await db.query(`
      SELECT c.name as class_name, c.level,
             CONCAT(t.first_name, ' ', t.last_name) as class_teacher
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = ?
    `, [student[0].class_id]);

    const [rank] = await db.query(`
      SELECT COUNT(*) + 1 as class_rank
      FROM (
        SELECT student_id, AVG(quiz_marks + midterm_marks + final_marks) as avg
        FROM grades WHERE student_id IN (
          SELECT id FROM students WHERE class_id = ?
        )
        GROUP BY student_id
        HAVING avg > (
          SELECT AVG(quiz_marks + midterm_marks + final_marks)
          FROM grades WHERE student_id = ?
        )
      ) as rankings
    `, [student[0].class_id, req.params.childId]);

    const data = {
      student_id: student[0].student_id,
      name: `${student[0].first_name} ${student[0].last_name}`,
      email: student[0].email,
      phone: student[0].phone,
      grade: student[0].grade,
      average_marks: marks[0].average_marks || 0,
      attendance_percentage: attendancePercentage,
      total_days: attendance[0].total_days || 0,
      present_days: attendance[0].present_days || 0,
      absent_days: attendance[0].absent_days || 0,
      late_days: attendance[0].late_days || 0,
      conduct_score: conduct[0]?.conduct_score || 100,
      fee_total: fees[0].total_amount || 0,
      fee_paid: fees[0].total_paid || 0,
      fee_balance: fees[0].total_balance || 0,
      class_name: classInfo[0]?.class_name || 'N/A',
      class_level: classInfo[0]?.level || 'N/A',
      class_teacher: classInfo[0]?.class_teacher || 'N/A',
      total_subjects: marks[0].total_subjects || 0,
      class_rank: rank[0].class_rank || 'N/A'
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get child academics
router.get('/child/:childId/academics', async (req, res) => {
  try {
    const [grades] = await db.query(`
      SELECT g.*, s.name as subject_name, s.code as subject_code,
             (g.quiz_marks + g.midterm_marks + g.final_marks) as total_marks
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ?
      ORDER BY g.term DESC, s.name ASC
    `, [req.params.childId]);

    const [summary] = await db.query(`
      SELECT 
        AVG(quiz_marks + midterm_marks + final_marks) as average_marks,
        COUNT(DISTINCT subject_id) as total_subjects,
        COUNT(DISTINCT term) as total_terms,
        MAX(quiz_marks + midterm_marks + final_marks) as highest_mark,
        MIN(quiz_marks + midterm_marks + final_marks) as lowest_mark
      FROM grades WHERE student_id = ?
    `, [req.params.childId]);

    res.json({ success: true, data: { grades, summary: summary[0] } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get child attendance
router.get('/child/:childId/attendance', async (req, res) => {
  try {
    const [attendance] = await db.query(`
      SELECT a.*, s.name as subject_name
      FROM attendance a
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
      LIMIT 100
    `, [req.params.childId]);

    const [summary] = await db.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as attendance_rate
      FROM attendance WHERE student_id = ?
    `, [req.params.childId]);

    res.json({ success: true, data: { attendance, summary: summary[0] } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get child discipline
router.get('/child/:childId/discipline', async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT * FROM discipline_records
      WHERE student_id = ?
      ORDER BY incident_date DESC
      LIMIT 50
    `, [req.params.childId]);

    const [summary] = await db.query(`
      SELECT 
        conduct_score,
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_severity
      FROM discipline_records
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [req.params.childId]);

    res.json({ success: true, data: { records, summary: summary[0] || { conduct_score: 100, total_incidents: 0 } } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get child fees
router.get('/child/:childId/fees', async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT * FROM student_payments
      WHERE student_id = ?
      ORDER BY payment_date DESC
    `, [req.params.childId]);

    const [summary] = await db.query(`
      SELECT 
        SUM(amount) as total_amount,
        SUM(amount_paid) as total_paid,
        SUM(balance) as total_balance,
        COUNT(*) as total_transactions
      FROM student_payments WHERE student_id = ?
    `, [req.params.childId]);

    res.json({ success: true, data: { payments, summary: summary[0] } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

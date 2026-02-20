const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get linked student dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.userId || req.user.id;

    // Get linked student
    const [students] = await pool.execute(`
      SELECT gss.* 
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status = 'active'
      LIMIT 1
    `, [parentId]);

    if (students.length === 0) {
      return res.json({ success: false, message: 'No linked student found' });
    }

    const student = students[0];

    // Get conduct/discipline records
    const [conduct] = await pool.execute(`
      SELECT * FROM discipline_records 
      WHERE student_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [student.id]);

    // Get marks/grades
    const [marks] = await pool.execute(`
      SELECT * FROM student_marks 
      WHERE student_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [student.id]);

    // Get attendance
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
      FROM student_attendance 
      WHERE student_id = ?
    `, [student.id]);

    // Get fees/balance
    const [fees] = await pool.execute(`
      SELECT 
        SUM(amount) as total_fees,
        SUM(paid_amount) as paid_amount,
        SUM(amount - paid_amount) as balance
      FROM student_fees 
      WHERE student_id = ?
    `, [student.id]);

    res.json({
      success: true,
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        student_code: student.student_code,
        trade_name: student.trade_name,
        level_number: student.level_number,
        gpa: student.gpa,
        conduct_score: student.conduct_score,
        attendance_percentage: student.attendance_percentage
      },
      conduct: conduct,
      marks: marks,
      attendance: attendance[0] || { total_days: 0, present_days: 0, absent_days: 0 },
      fees: fees[0] || { total_fees: 0, paid_amount: 0, balance: 0 }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

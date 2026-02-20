const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET comprehensive advisor dashboard - ADVANCED with global_student_sheets
router.get('/dashboard/kinyarwanda', authenticateToken, requireRole(['advisor', 'admin', 'headmaster']), async (req, res) => {
  try {
    const advisorId = req.user.userId || req.user.id;
    
    // Get advisor's assigned students from global_student_sheets
    const [myStudents] = await pool.execute(`
      SELECT 
        gss.*,
        u.username,
        u.email,
        u.phone,
        u.is_active
      FROM global_student_sheets gss
      LEFT JOIN users u ON gss.student_id = u.student_id OR gss.id = u.id
      WHERE gss.status = 'active'
      ORDER BY gss.first_name, gss.last_name
      LIMIT 100
    `);

    // Get all students for overview (from global_student_sheets)
    const [allStudents] = await pool.execute(`
      SELECT 
        gss.*,
        COALESCE(gss.gpa, 0) as gpa,
        COALESCE(gss.attendance_percentage, 0) as attendance,
        COALESCE(gss.conduct_score, 40) as conduct
      FROM global_student_sheets gss
      WHERE gss.status = 'active'
    `);

    // Get students by trade
    const [byTrade] = await pool.execute(`
      SELECT 
        trade_name,
        trade_code,
        COUNT(*) as count,
        AVG(COALESCE(gpa, 0)) as avg_gpa,
        AVG(COALESCE(attendance_percentage, 0)) as avg_attendance
      FROM global_student_sheets
      WHERE status = 'active' AND trade_name IS NOT NULL
      GROUP BY trade_name, trade_code
      ORDER BY count DESC
    `);

    // Get students by level
    const [byLevel] = await pool.execute(`
      SELECT 
        level_number,
        COUNT(*) as count,
        AVG(COALESCE(gpa, 0)) as avg_gpa
      FROM global_student_sheets
      WHERE status = 'active' AND level_number IS NOT NULL
      GROUP BY level_number
      ORDER BY level_number
    `);

    // Get high performers (GPA >= 3.0)
    const [highPerformers] = await pool.execute(`
      SELECT 
        id, first_name, last_name, trade_name, level_number, gpa
      FROM global_student_sheets
      WHERE status = 'active' AND gpa >= 3.0
      ORDER BY gpa DESC
      LIMIT 10
    `);

    // Get at-risk students (low attendance or conduct)
    const [atRisk] = await pool.execute(`
      SELECT 
        id, first_name, last_name, trade_name, level_number, 
        attendance_percentage, conduct_score
      FROM global_student_sheets
      WHERE status = 'active' 
        AND (attendance_percentage < 75 OR conduct_score < 20)
      ORDER BY attendance_percentage ASC, conduct_score ASC
      LIMIT 20
    `);

    // Get recent attendance records
    const [recentAttendance] = await pool.execute(`
      SELECT 
        a.*,
        gss.first_name,
        gss.last_name,
        gss.trade_name
      FROM student_attendance a
      LEFT JOIN global_student_sheets gss ON a.student_id = gss.student_id
      ORDER BY a.attendance_date DESC
      LIMIT 50
    `);

    // Get recent grades/marks
    const [recentGrades] = await pool.execute(`
      SELECT 
        m.*,
        gss.first_name,
        gss.last_name,
        gss.trade_name,
        c.course_name
      FROM student_marks m
      LEFT JOIN global_student_sheets gss ON m.student_id = gss.student_id
      LEFT JOIN courses c ON m.course_code = c.course_code
      ORDER BY m.created_at DESC
      LIMIT 50
    `);

    // Get conduct/discipline records
    const [conductRecords] = await pool.execute(`
      SELECT 
        cr.*,
        gss.first_name,
        gss.last_name,
        gss.trade_name
      FROM student_conduct_records cr
      LEFT JOIN global_student_sheets gss ON cr.student_id = gss.student_id
      ORDER BY cr.created_at DESC
      LIMIT 30
    `);

    // Get pending leave requests
    const [leaveRequests] = await pool.execute(`
      SELECT 
        sl.*,
        gss.first_name,
        gss.last_name,
        gss.trade_name
      FROM student_leaves sl
      LEFT JOIN global_student_sheets gss ON sl.student_id = gss.student_id
      WHERE sl.status = 'pending'
      ORDER BY sl.start_date ASC
      LIMIT 20
    `);

    // Statistics summary
    const stats = {
      total_students: allStudents.length,
      total_trades: byTrade.length,
      avg_gpa: allStudents.reduce((sum, s) => sum + (parseFloat(s.gpa) || 0), 0) / (allStudents.length || 1),
      avg_attendance: allStudents.reduce((sum, s) => sum + (parseFloat(s.attendance) || 0), 0) / (allStudents.length || 1),
      avg_conduct: allStudents.reduce((sum, s) => sum + (parseFloat(s.conduct) || 40), 0) / (allStudents.length || 1),
      high_performers: highPerformers.length,
      at_risk: atRisk.length,
      pending_leaves: leaveRequests.length
    };

    res.json({
      success: true,
      advisor: {
        id: advisorId,
        name: req.user.name || req.user.username || 'Advisor'
      },
      students: myStudents,
      all_students: allStudents,
      stats,
      by_trade: byTrade,
      by_level: byLevel,
      high_performers: highPerformers,
      at_risk_students: atRisk,
      recent_attendance: recentAttendance,
      recent_grades: recentGrades,
      conduct_records: conductRecords,
      leave_requests: leaveRequests
    });
  } catch (error) {
    console.error('Advisor dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
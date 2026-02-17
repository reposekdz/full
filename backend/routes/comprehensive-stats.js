const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// DOS Statistics - Enhanced with Real Data
router.get('/dos', authenticateToken, async (req, res) => {
  try {
    // Academic stats from global_student_sheets
    const [academic_stats] = await pool.execute(`
      SELECT 'total_students' as stat_name, COUNT(*) as stat_value FROM global_student_sheets WHERE status = 'active'
      UNION ALL
      SELECT 'total_teachers' as stat_name, COUNT(*) as stat_value FROM users WHERE role = 'teacher' AND is_active = 1
      UNION ALL
      SELECT 'active_timetables' as stat_name, COUNT(*) as stat_value FROM timetables WHERE is_active = 1
      UNION ALL
      SELECT 'reports_generated' as stat_name, COUNT(*) as stat_value FROM report_cards WHERE status = 'generated'
      UNION ALL
      SELECT 'pending_exams' as stat_name, COUNT(*) as stat_value FROM exams WHERE status = 'scheduled' AND exam_date >= CURDATE()
      UNION ALL
      SELECT 'sod_students' as stat_name, COUNT(*) as stat_value FROM global_student_sheets WHERE trade_code = 'SOD' AND status = 'active'
      UNION ALL
      SELECT 'bdc_students' as stat_name, COUNT(*) as stat_value FROM global_student_sheets WHERE trade_code = 'BDC' AND status = 'active'
      UNION ALL
      SELECT 'aut_students' as stat_name, COUNT(*) as stat_value FROM global_student_sheets WHERE trade_code = 'AUT' AND status = 'active'
    `).catch(() => [[{ stat_name: 'total_students', stat_value: 0 }]]);

    // Performance data
    const [performance] = await pool.execute(`
      SELECT 
        trade_code,
        trade_name,
        level_number,
        AVG(gpa) as avg_gpa,
        AVG(average_marks) as avg_marks,
        COUNT(*) as student_count
      FROM global_student_sheets
      WHERE status = 'active' AND trade_code IS NOT NULL
      GROUP BY trade_code, trade_name, level_number
      ORDER BY trade_code, level_number
    `).catch(() => [[]]);

    // Attendance data
    const [attendance] = await pool.execute(`
      SELECT 
        attendance_status,
        COUNT(*) as count
      FROM student_attendance_records
      WHERE DATE(attendance_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY attendance_status
    `).catch(() => [[]]);

    // Recent activities
    const [recent_activities] = await pool.execute(`
      SELECT 
        'Grade Entry' as action,
        'Academic' as category,
        CONCAT(u.first_name, ' ', u.last_name) as user,
        DATE_FORMAT(g.created_at, '%Y-%m-%d %H:%i') as time
      FROM grades g
      JOIN users u ON g.recorded_by = u.id
      ORDER BY g.created_at DESC LIMIT 5
    `).catch(() => [[]]);

    // Students by level
    const [students_by_level] = await pool.execute(`
      SELECT 
        level_number,
        COUNT(*) as count
      FROM global_student_sheets
      WHERE status = 'active' AND level_number IS NOT NULL
      GROUP BY level_number
      ORDER BY level_number
    `).catch(() => [[]]);

    // Fee collection stats
    const [fee_stats] = await pool.execute(`
      SELECT 
        SUM(total_fees) as total_expected,
        SUM(paid_amount) as total_collected,
        SUM(balance) as total_outstanding,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as fully_paid_count,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_paid_count,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_count
      FROM global_student_sheets
      WHERE status = 'active'
    `).catch(() => [[{ total_expected: 0, total_collected: 0, total_outstanding: 0 }]]);

    // Discipline stats
    const [discipline_stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low
      FROM student_discipline_records
      WHERE DATE(incident_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `).catch(() => [[{ total_incidents: 0 }]]);

    res.json({
      success: true,
      data: {
        academic_stats,
        performance,
        attendance,
        recent_activities,
        students_by_level,
        fee_stats: fee_stats[0],
        discipline_stats: discipline_stats[0]
      }
    });
  } catch (error) {
    console.error('DOS stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Advisor Statistics
router.get('/advisor', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
                (SELECT COUNT(*) FROM student_conduct_records WHERE status = 'active') as active_cases,
                (SELECT COUNT(*) FROM student_leave_requests WHERE status = 'pending') as pending_meetings
        `).catch(() => [[{ total_students: 0, active_cases: 0, pending_meetings: 0 }]]);

    const [recent_activity] = await pool.execute(`
            SELECT b.*, u.first_name, u.last_name, u.student_id as student_code
            FROM student_conduct_records b
            JOIN users u ON b.student_id = u.id
            ORDER BY b.created_at DESC LIMIT 5
        `).catch(() => [[]]);

    res.json({
      success: true,
      data: {
        total_students: stats[0].total_students || 0,
        active_cases: stats[0].active_cases || 0,
        pending_meetings: stats[0].pending_meetings || 0,
        recent_activity: recent_activity.map(a => ({
          ...a,
          title: a.incident_type || 'Discipline Entry',
          priority: a.severity || 'medium'
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/advisor/students', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
            SELECT u.*, 
                   (SELECT COUNT(*) FROM student_conduct_records WHERE student_id = u.id) as recent_incidents,
                   (SELECT AVG(CAST(cv.column_value AS DECIMAL(10,2))) 
                    FROM student_sheet_custom_values cv
                    JOIN student_sheets s ON cv.sheet_id = s.id
                    WHERE s.student_id = u.id AND cv.column_value REGEXP '^[0-9]+(\\.[0-9]+)?$') as avg_grade
            FROM users u WHERE u.role = 'student' LIMIT 50
        `).catch(() => [[]]);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/advisor/meetings', authenticateToken, async (req, res) => {
  try {
    const [meetings] = await pool.execute(`
            SELECT m.*, u.first_name, u.last_name 
            FROM student_leave_requests m
            JOIN users u ON m.student_id = u.id
            WHERE m.status = 'pending'
            ORDER BY m.created_at DESC
        `).catch(() => [[]]);
    res.json({
      success: true, meetings: meetings.map(m => ({
        ...m,
        meeting_date: m.start_date,
        meeting_time: '08:00',
        purpose: m.reason || 'Leave Request',
        location: 'Administration Office'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Headmaster Statistics
router.get('/headmaster', authenticateToken, async (req, res) => {
  try {
    const [academic_stats] = await pool.execute(`
            SELECT 'total_students' as stat_name, COUNT(*) as stat_value FROM users WHERE role = 'student'
            UNION ALL
            SELECT 'avg_performance' as stat_name, COALESCE(AVG(CAST(column_value AS DECIMAL(10,2))), 0) as stat_value 
            FROM student_sheet_custom_values WHERE column_value REGEXP '^[0-9]+(\\.[0-9]+)?$'
        `).catch(() => [[{ stat_name: 'total_students', stat_value: 0 }, { stat_name: 'avg_performance', stat_value: 0 }]]);

    const [hr_stats] = await pool.execute(`
            SELECT 'total_teachers' as stat_name, COUNT(*) as stat_value FROM users WHERE role = 'teacher'
            UNION ALL
            SELECT 'total_staff' as stat_name, COUNT(*) as stat_value FROM users WHERE role NOT IN ('student', 'parent')
        `);

    const [finance_stats] = await pool.execute(`
            SELECT 'total_collections' as stat_name, COALESCE(SUM(amount), 0) as stat_value FROM payments
        `);

    const [stock_stats] = await pool.execute(`
            SELECT 'low_stock_items' as stat_name, COUNT(*) as stat_value FROM stock_items WHERE quantity <= reorder_level
        `);

    const [discipline_stats] = await pool.execute(`
            SELECT 'pending_leaves' as stat_name, COUNT(*) as stat_value FROM student_leave_requests WHERE status = 'pending'
        `);

    res.json({
      success: true,
      data: {
        academic_stats,
        hr_stats,
        finance_stats,
        stock_stats,
        discipline_stats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stock Manager Statistics
router.get('/stock', authenticateToken, async (req, res) => {
  try {
    const [totals] = await pool.execute(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity * unit_price) as total_value
            FROM stock_items
        `);

    const [alerts] = await pool.execute(`
            SELECT 
                COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_count,
                COUNT(CASE WHEN quantity > 0 AND quantity <= reorder_level THEN 1 END) as low_stock_count
            FROM stock_items
        `);

    res.json({
      success: true,
      totals: totals[0],
      alerts: alerts[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

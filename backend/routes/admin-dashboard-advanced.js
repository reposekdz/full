const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ==================== DASHBOARD OVERVIEW ====================

// Get comprehensive dashboard statistics
router.get('/overview', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (timeframe === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (timeframe === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (timeframe === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (timeframe === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    
    // Get total counts
    const [[studentStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_this_period
      FROM global_student_sheets
    `, [startDate]);
    
    const [[teacherStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_this_period
      FROM teachers
    `, [startDate]);
    
    const [[staffStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_this_period
      FROM staff
    `, [startDate]);
    
    const [[parentStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM parents
    `);
    
    // Financial statistics
    const [[financialStats]] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_payments,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as overdue_payments,
        COUNT(CASE WHEN status = 'paid' AND payment_date >= ? THEN 1 END) as payments_this_period
      FROM fee_payments
    `, [startDate]);
    
    // Attendance statistics
    const [[attendanceStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance
      WHERE attendance_date >= ?
    `, [startDate]);
    
    // Academic performance
    const [[academicStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_marks,
        ROUND(AVG(final_marks), 2) as average_score,
        MAX(final_marks) as highest_score,
        MIN(final_marks) as lowest_score,
        SUM(CASE WHEN final_marks >= 90 THEN 1 ELSE 0 END) as grade_a,
        SUM(CASE WHEN final_marks >= 80 AND final_marks < 90 THEN 1 ELSE 0 END) as grade_b,
        SUM(CASE WHEN final_marks >= 70 AND final_marks < 80 THEN 1 ELSE 0 END) as grade_c,
        SUM(CASE WHEN final_marks >= 60 AND final_marks < 70 THEN 1 ELSE 0 END) as grade_d,
        SUM(CASE WHEN final_marks < 60 THEN 1 ELSE 0 END) as grade_f
      FROM student_marks
      WHERE created_at >= ?
    `, [startDate]);
    
    // Stock alerts
    const [stockAlerts] = await pool.execute(`
      SELECT 
        COUNT(*) as total_alerts,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN quantity <= reorder_level AND quantity > 0 THEN 1 ELSE 0 END) as low_stock
      FROM stock_items
    `);
    
    // Recent activities
    const [recentActivities] = await pool.execute(`
      (SELECT 'student_enrollment' as type, CONCAT(first_name, ' ', last_name) as description, created_at 
       FROM global_student_sheets ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'payment' as type, CONCAT('Payment of ', amount, ' RWF') as description, payment_date as created_at 
       FROM fee_payments WHERE status = 'paid' ORDER BY payment_date DESC LIMIT 5)
      UNION ALL
      (SELECT 'attendance' as type, CONCAT('Attendance marked for ', attendance_date) as description, created_at 
       FROM student_attendance ORDER BY created_at DESC LIMIT 5)
      ORDER BY created_at DESC LIMIT 15
    `);
    
    res.json({
      success: true,
      timeframe,
      statistics: {
        students: studentStats,
        teachers: teacherStats,
        staff: staffStats,
        parents: parentStats,
        financial: financialStats,
        attendance: attendanceStats,
        academic: academicStats,
        stock: stockAlerts[0] || { total_alerts: 0, out_of_stock: 0, low_stock: 0 }
      },
      recentActivities
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ANALYTICS & REPORTS ====================

// Get enrollment trends
router.get('/analytics/enrollment-trends', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { period = 'monthly', months = 12 } = req.query;
    
    let groupBy, dateFormat;
    if (period === 'daily') {
      groupBy = 'DATE(created_at)';
      dateFormat = '%Y-%m-%d';
    } else if (period === 'weekly') {
      groupBy = 'YEARWEEK(created_at)';
      dateFormat = '%Y-W%v';
    } else {
      groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
      dateFormat = '%Y-%m';
    }
    
    const [trends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as enrollments,
        trade_code,
        trade_name
      FROM global_student_sheets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY period, trade_code, trade_name
      ORDER BY period DESC
    `, [dateFormat, parseInt(months)]);
    
    const [totalTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as total_enrollments
      FROM global_student_sheets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY period
      ORDER BY period DESC
    `, [dateFormat, parseInt(months)]);
    
    res.json({ success: true, trends, totalTrends });
  } catch (error) {
    console.error('Enrollment trends error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get financial analytics
router.get('/analytics/financial', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Revenue trends
    const [revenueTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        SUM(amount) as total_revenue,
        COUNT(*) as payment_count,
        AVG(amount) as average_payment
      FROM fee_payments
      WHERE status = 'paid'
        AND payment_date BETWEEN ? AND ?
      GROUP BY month
      ORDER BY month
    `, [startDate || '2020-01-01', endDate || new Date()]);
    
    // Payment status breakdown
    const [paymentBreakdown] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM fee_payments
      WHERE payment_date BETWEEN ? AND ?
      GROUP BY status
    `, [startDate || '2020-01-01', endDate || new Date()]);
    
    // Fee category analysis
    const [categoryAnalysis] = await pool.execute(`
      SELECT 
        fee_type,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM fee_payments
      WHERE status = 'paid'
        AND payment_date BETWEEN ? AND ?
      GROUP BY fee_type
    `, [startDate || '2020-01-01', endDate || new Date()]);
    
    // Outstanding payments by trade
    const [outstandingByTrade] = await pool.execute(`
      SELECT 
        s.trade_name,
        COUNT(DISTINCT s.id) as student_count,
        SUM(CASE WHEN fp.status = 'pending' THEN fp.amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN fp.status = 'overdue' THEN fp.amount ELSE 0 END) as overdue_amount
      FROM global_student_sheets s
      LEFT JOIN fee_payments fp ON s.student_id = fp.student_id
      WHERE fp.status IN ('pending', 'overdue')
      GROUP BY s.trade_name
    `);
    
    // Monthly comparison
    const [monthlyComparison] = await pool.execute(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as collected,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue
      FROM fee_payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month
    `);
    
    res.json({
      success: true,
      analytics: {
        revenueTrends,
        paymentBreakdown,
        categoryAnalysis,
        outstandingByTrade,
        monthlyComparison
      }
    });
  } catch (error) {
    console.error('Financial analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get academic performance analytics
router.get('/analytics/academic-performance', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { academicYear, term, tradeCode } = req.query;
    
    let conditions = [];
    let params = [];
    
    if (academicYear) {
      conditions.push('academic_year = ?');
      params.push(academicYear);
    }
    if (term) {
      conditions.push('term = ?');
      params.push(term);
    }
    if (tradeCode) {
      conditions.push('s.trade_code = ?');
      params.push(tradeCode);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    // Overall performance by trade
    const [performanceByTrade] = await pool.execute(`
      SELECT 
        s.trade_code,
        s.trade_name,
        COUNT(DISTINCT s.id) as student_count,
        ROUND(AVG(sm.final_marks), 2) as average_score,
        MAX(sm.final_marks) as highest_score,
        MIN(sm.final_marks) as lowest_score,
        SUM(CASE WHEN sm.final_marks >= 90 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN sm.final_marks >= 70 AND sm.final_marks < 90 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN sm.final_marks >= 50 AND sm.final_marks < 70 THEN 1 ELSE 0 END) as average,
        SUM(CASE WHEN sm.final_marks < 50 THEN 1 ELSE 0 END) as poor
      FROM global_student_sheets s
      LEFT JOIN student_marks sm ON s.student_id = sm.student_id
      ${whereClause}
      GROUP BY s.trade_code, s.trade_name
    `, params);
    
    // Subject-wise performance
    const [subjectPerformance] = await pool.execute(`
      SELECT 
        subject_code,
        subject_name,
        COUNT(*) as attempt_count,
        ROUND(AVG(final_marks), 2) as average_marks,
        MAX(final_marks) as highest_marks,
        MIN(final_marks) as lowest_marks,
        SUM(CASE WHEN final_marks >= 50 THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN final_marks < 50 THEN 1 ELSE 0 END) as fail_count,
        ROUND(SUM(CASE WHEN final_marks >= 50 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate
      FROM student_marks
      ${whereClause}
      GROUP BY subject_code, subject_name
      ORDER BY average_marks DESC
    `, params);
    
    // Level-wise performance
    const [levelPerformance] = await pool.execute(`
      SELECT 
        s.level_number,
        COUNT(DISTINCT s.id) as student_count,
        ROUND(AVG(sm.final_marks), 2) as average_score,
        SUM(CASE WHEN sm.final_marks >= 50 THEN 1 ELSE 0 END) as pass_count,
        ROUND(SUM(CASE WHEN sm.final_marks >= 50 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate
      FROM global_student_sheets s
      LEFT JOIN student_marks sm ON s.student_id = sm.student_id
      ${whereClause}
      GROUP BY s.level_number
      ORDER BY s.level_number
    `, params);
    
    // Top performers
    const [topPerformers] = await pool.execute(`
      SELECT 
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.trade_name,
        s.level_number,
        ROUND(AVG(sm.final_marks), 2) as average_marks,
        COUNT(sm.id) as subject_count
      FROM global_student_sheets s
      JOIN student_marks sm ON s.student_id = sm.student_id
      ${whereClause}
      GROUP BY s.student_id, student_name, s.trade_name, s.level_number
      HAVING average_marks >= 80
      ORDER BY average_marks DESC
      LIMIT 20
    `, params);
    
    res.json({
      success: true,
      analytics: {
        performanceByTrade,
        subjectPerformance,
        levelPerformance,
        topPerformers
      }
    });
  } catch (error) {
    console.error('Academic analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance analytics
router.get('/analytics/attendance', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { startDate, endDate, tradeCode } = req.query;
    
    let conditions = ['sa.attendance_date BETWEEN ? AND ?'];
    let params = [startDate || '2020-01-01', endDate || new Date()];
    
    if (tradeCode) {
      conditions.push('s.trade_code = ?');
      params.push(tradeCode);
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    
    // Daily attendance trends
    const [dailyTrends] = await pool.execute(`
      SELECT 
        DATE(sa.attendance_date) as date,
        COUNT(*) as total_records,
        SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN sa.status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN sa.status = 'late' THEN 1 ELSE 0 END) as late,
        ROUND(SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance sa
      JOIN global_student_sheets s ON sa.student_id = s.student_id
      ${whereClause}
      GROUP BY date
      ORDER BY date
    `, params);
    
    // Attendance by trade
    const [tradeAttendance] = await pool.execute(`
      SELECT 
        s.trade_code,
        s.trade_name,
        COUNT(*) as total_records,
        SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN sa.status = 'absent' THEN 1 ELSE 0 END) as absent,
        ROUND(SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance sa
      JOIN global_student_sheets s ON sa.student_id = s.student_id
      ${whereClause}
      GROUP BY s.trade_code, s.trade_name
      ORDER BY attendance_rate DESC
    `, params);
    
    // Low attendance students
    const [lowAttendanceStudents] = await pool.execute(`
      SELECT 
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.trade_name,
        s.level_number,
        COUNT(*) as total_days,
        SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN sa.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        ROUND(SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance sa
      JOIN global_student_sheets s ON sa.student_id = s.student_id
      ${whereClause}
      GROUP BY s.student_id, student_name, s.trade_name, s.level_number
      HAVING attendance_rate < 75
      ORDER BY attendance_rate ASC
      LIMIT 50
    `, params);
    
    res.json({
      success: true,
      analytics: {
        dailyTrends,
        tradeAttendance,
        lowAttendanceStudents
      }
    });
  } catch (error) {
    console.error('Attendance analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with advanced filtering
router.get('/users', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let conditions = [];
    let params = [];
    
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [users] = await pool.execute(`
      SELECT id, username, email, first_name, last_name, role, status, created_at, last_login
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `, params);
    
    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user status
router.put('/users/:id/status', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    
    res.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SYSTEM SETTINGS ====================

// Get all system settings
router.get('/settings', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT * FROM system_settings ORDER BY category, setting_key
    `);
    
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});
    
    res.json({ success: true, settings: grouped });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update system setting
router.put('/settings/:key', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await pool.execute(`
      UPDATE system_settings 
      SET setting_value = ?, updated_at = NOW() 
      WHERE setting_key = ?
    `, [value, key]);
    
    res.json({ success: true, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ACTIVITY LOGS ====================

// Get system activity logs
router.get('/logs', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { action, userId, startDate, endDate, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    let conditions = [];
    let params = [];
    
    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }
    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    if (startDate) {
      conditions.push('created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('created_at <= ?');
      params.push(endDate);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [logs] = await pool.execute(`
      SELECT al.*, u.username, u.first_name, u.last_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total FROM activity_logs ${whereClause}
    `, params);
    
    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== BULK OPERATIONS ====================

// Bulk delete users
router.post('/users/bulk-delete', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid user IDs' });
    }
    
    const placeholders = userIds.map(() => '?').join(',');
    await pool.execute(`DELETE FROM users WHERE id IN (${placeholders})`, userIds);
    
    res.json({ success: true, message: `${userIds.length} users deleted successfully` });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update user status
router.post('/users/bulk-status', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { userIds, status } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid user IDs' });
    }
    
    const placeholders = userIds.map(() => '?').join(',');
    await pool.execute(`UPDATE users SET status = ? WHERE id IN (${placeholders})`, [status, ...userIds]);
    
    res.json({ success: true, message: `${userIds.length} users updated successfully` });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

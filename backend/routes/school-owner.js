const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * SCHOOL OWNER COMPREHENSIVE PORTAL
 * Supreme access to all system data:
 * - Complete Financial Management & Analytics
 * - School-wide Performance Metrics
 * - Stock & Inventory Management
 * - Real-time System Analytics
 * - All Staff & Student Data
 */

// ============================================
// SUPREME DASHBOARD - Complete Overview
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['school_owner']), async (req, res) => {
  try {
    // Financial Overview
    const [financialData] = await pool.execute(`
      SELECT 
        SUM(total_fees) as total_expected_revenue,
        SUM(paid_amount) as total_collected,
        SUM(balance) as total_outstanding,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as fully_paid_students,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_paid_students,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_students
      FROM global_student_sheets WHERE status = 'active'
    `);

    const [expenses] = await pool.execute(`
      SELECT SUM(amount) as total_expenses, COUNT(*) as expense_count
      FROM expenses WHERE YEAR(expense_date) = YEAR(CURDATE())
    `);

    const [salaries] = await pool.execute(`
      SELECT SUM(amount) as total_salaries, COUNT(DISTINCT user_id) as staff_count
      FROM salaries WHERE YEAR(payment_date) = YEAR(CURDATE()) AND status = 'paid'
    `);

    // Academic Performance
    const [academicData] = await pool.execute(`
      SELECT 
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as honors_students,
        COUNT(CASE WHEN gpa < 2.0 THEN 1 END) as at_risk_students,
        COUNT(*) as total_students
      FROM global_student_sheets WHERE status = 'active'
    `);

    const [tradePerformance] = await pool.execute(`
      SELECT 
        trade_code,
        trade_name,
        COUNT(*) as student_count,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance
      FROM global_student_sheets 
      WHERE status = 'active'
      GROUP BY trade_code, trade_name
      ORDER BY avg_gpa DESC
    `);

    // Stock & Inventory
    const [stockData] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity * unit_price) as total_value,
        COUNT(CASE WHEN quantity <= reorder_level THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock
      FROM stock_items
    `);

    // Staff Analytics
    const [staffData] = await pool.execute(`
      SELECT 
        r.name as role,
        COUNT(*) as count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.is_active = true AND r.name != 'student'
      GROUP BY r.name
    `);

    // Discipline & Conduct
    const [disciplineData] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        AVG(CASE WHEN conduct_score IS NOT NULL THEN conduct_score END) as avg_conduct_score
      FROM student_discipline_records
      WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    // Recent Activities
    const [recentPayments] = await pool.execute(`
      SELECT pr.*, gs.first_name, gs.last_name, gs.student_code
      FROM student_payment_records pr
      JOIN global_student_sheets gs ON pr.student_id = gs.student_id
      ORDER BY pr.payment_date DESC LIMIT 10
    `);

    const [recentExpenses] = await pool.execute(`
      SELECT * FROM expenses ORDER BY expense_date DESC LIMIT 10
    `);

    const net_profit = (financialData[0].total_collected || 0) - 
                       (expenses[0].total_expenses || 0) - 
                       (salaries[0].total_salaries || 0);

    res.json({
      success: true,
      dashboard: {
        financial: {
          revenue: {
            expected: financialData[0].total_expected_revenue || 0,
            collected: financialData[0].total_collected || 0,
            outstanding: financialData[0].total_outstanding || 0,
            collection_rate: ((financialData[0].total_collected / financialData[0].total_expected_revenue) * 100).toFixed(2)
          },
          expenses: {
            total: expenses[0].total_expenses || 0,
            count: expenses[0].expense_count || 0
          },
          salaries: {
            total: salaries[0].total_salaries || 0,
            staff_count: salaries[0].staff_count || 0
          },
          profit: {
            net: net_profit,
            margin: ((net_profit / financialData[0].total_collected) * 100).toFixed(2)
          },
          payment_status: {
            fully_paid: financialData[0].fully_paid_students || 0,
            partial: financialData[0].partial_paid_students || 0,
            unpaid: financialData[0].unpaid_students || 0
          }
        },
        academic: {
          students: {
            total: academicData[0].total_students || 0,
            honors: academicData[0].honors_students || 0,
            at_risk: academicData[0].at_risk_students || 0
          },
          performance: {
            avg_gpa: parseFloat(academicData[0].avg_gpa || 0).toFixed(2),
            avg_attendance: parseFloat(academicData[0].avg_attendance || 0).toFixed(2)
          },
          by_trade: tradePerformance
        },
        stock: {
          total_items: stockData[0].total_items || 0,
          total_value: stockData[0].total_value || 0,
          low_stock: stockData[0].low_stock_items || 0,
          out_of_stock: stockData[0].out_of_stock || 0
        },
        staff: staffData,
        discipline: {
          total_incidents: disciplineData[0].total_incidents || 0,
          high_severity: disciplineData[0].high_severity || 0,
          resolved: disciplineData[0].resolved || 0,
          avg_conduct: parseFloat(disciplineData[0].avg_conduct_score || 0).toFixed(2)
        },
        recent_activities: {
          payments: recentPayments,
          expenses: recentExpenses
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FINANCIAL ANALYTICS - Deep Dive
// ============================================
router.get('/finances/analytics', authenticateToken, requireRole(['school_owner']), async (req, res) => {
  try {
    const { start_date, end_date, trade_code } = req.query;
    
    // Revenue by Trade
    let query = `
      SELECT 
        trade_code,
        trade_name,
        COUNT(*) as student_count,
        SUM(total_fees) as expected_revenue,
        SUM(paid_amount) as collected_revenue,
        SUM(balance) as outstanding,
        (SUM(paid_amount) / SUM(total_fees) * 100) as collection_rate
      FROM global_student_sheets
      WHERE status = 'active'
    `;
    const params = [];
    
    if (trade_code) {
      query += ' AND trade_code = ?';
      params.push(trade_code);
    }
    
    query += ' GROUP BY trade_code, trade_name ORDER BY collected_revenue DESC';
    const [revenueByTrade] = await pool.execute(query, params);

    // Monthly Revenue Trend
    const [monthlyRevenue] = await pool.execute(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        SUM(amount) as total_collected,
        COUNT(*) as payment_count
      FROM student_payment_records
      WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month
    `);

    // Expense Breakdown
    const [expensesByCategory] = await pool.execute(`
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as avg_amount
      FROM expenses
      WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY category
      ORDER BY total DESC
    `);

    // Payment Methods Analysis
    const [paymentMethods] = await pool.execute(`
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM student_payment_records
      WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY payment_method
    `);

    res.json({
      success: true,
      analytics: {
        revenue_by_trade: revenueByTrade,
        monthly_trend: monthlyRevenue,
        expenses_breakdown: expensesByCategory,
        payment_methods: paymentMethods
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PERFORMANCE ANALYTICS - School-wide
// ============================================
router.get('/performance/analytics', authenticateToken, requireRole(['school_owner']), async (req, res) => {
  try {
    // Overall Performance Metrics
    const [overallMetrics] = await pool.execute(`
      SELECT 
        AVG(gpa) as avg_gpa,
        MAX(gpa) as highest_gpa,
        MIN(gpa) as lowest_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as honors_count,
        COUNT(CASE WHEN gpa >= 3.0 AND gpa < 3.5 THEN 1 END) as good_standing,
        COUNT(CASE WHEN gpa >= 2.0 AND gpa < 3.0 THEN 1 END) as satisfactory,
        COUNT(CASE WHEN gpa < 2.0 THEN 1 END) as at_risk
      FROM global_student_sheets WHERE status = 'active'
    `);

    // Performance by Trade
    const [tradePerformance] = await pool.execute(`
      SELECT 
        trade_code,
        trade_name,
        level_number,
        COUNT(*) as students,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        AVG(conduct_score) as avg_conduct
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code, trade_name, level_number
      ORDER BY trade_code, level_number
    `);

    // Top Performers
    const [topStudents] = await pool.execute(`
      SELECT 
        student_code,
        first_name,
        last_name,
        trade_name,
        level_number,
        gpa,
        attendance_percentage,
        conduct_score
      FROM global_student_sheets
      WHERE status = 'active'
      ORDER BY gpa DESC
      LIMIT 20
    `);

    // Subject Performance
    const [subjectPerformance] = await pool.execute(`
      SELECT 
        subject_name,
        COUNT(DISTINCT student_id) as student_count,
        AVG(marks) as avg_marks,
        AVG(grade_point) as avg_grade_point
      FROM student_subject_performance
      GROUP BY subject_name
      ORDER BY avg_marks DESC
    `);

    // Attendance Trends
    const [attendanceTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(attendance_date, '%Y-%m') as month,
        COUNT(DISTINCT student_id) as unique_students,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100) as attendance_rate
      FROM student_attendance_records
      WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(attendance_date, '%Y-%m')
      ORDER BY month
    `);

    res.json({
      success: true,
      performance: {
        overall: overallMetrics[0],
        by_trade: tradePerformance,
        top_performers: topStudents,
        subjects: subjectPerformance,
        attendance_trends: attendanceTrends
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STOCK MANAGEMENT - Complete Overview
// ============================================
router.get('/stock/analytics', authenticateToken, requireRole(['school_owner']), async (req, res) => {
  try {
    // Stock Summary
    const [stockSummary] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value,
        COUNT(CASE WHEN quantity <= reorder_level THEN 1 END) as low_stock_count
      FROM stock_items
      GROUP BY category
      ORDER BY total_value DESC
    `);

    // Recent Stock Movements
    const [stockMovements] = await pool.execute(`
      SELECT 
        sm.*,
        si.item_name,
        si.category,
        u.first_name,
        u.last_name
      FROM stock_movements sm
      JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.recorded_by = u.id
      ORDER BY sm.movement_date DESC
      LIMIT 50
    `);

    // Low Stock Alerts
    const [lowStock] = await pool.execute(`
      SELECT * FROM stock_items
      WHERE quantity <= reorder_level
      ORDER BY quantity ASC
    `);

    // Stock Value Trend
    const [valueTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(movement_date, '%Y-%m') as month,
        SUM(CASE WHEN movement_type = 'in' THEN quantity * unit_price ELSE 0 END) as stock_in_value,
        SUM(CASE WHEN movement_type = 'out' THEN quantity * unit_price ELSE 0 END) as stock_out_value
      FROM stock_movements sm
      JOIN stock_items si ON sm.item_id = si.id
      WHERE movement_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(movement_date, '%Y-%m')
      ORDER BY month
    `);

    res.json({
      success: true,
      stock: {
        summary: stockSummary,
        recent_movements: stockMovements,
        low_stock_alerts: lowStock,
        value_trend: valueTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SYSTEM ANALYTICS - Real-time Insights
// ============================================
router.get('/system/analytics', authenticateToken, requireRole(['school_owner']), async (req, res) => {
  try {
    // User Activity
    const [userActivity] = await pool.execute(`
      SELECT 
        r.name as role,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT CASE WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN u.id END) as active_today,
        COUNT(DISTINCT CASE WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN u.id END) as active_week
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.is_active = true
      GROUP BY r.name
    `);

    // Database Statistics
    const [dbStats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM global_student_sheets WHERE status = 'active') as total_students,
        (SELECT COUNT(*) FROM student_payment_records) as total_payments,
        (SELECT COUNT(*) FROM student_attendance_records) as total_attendance_records,
        (SELECT COUNT(*) FROM assignments) as total_assignments,
        (SELECT COUNT(*) FROM news_articles) as total_news,
        (SELECT COUNT(*) FROM notifications) as total_notifications
    `);

    // System Health
    const [systemHealth] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM student_payment_records WHERE status = 'pending') as pending_payments,
        (SELECT COUNT(*) FROM assignments WHERE status = 'active' AND due_date < CURDATE()) as overdue_assignments,
        (SELECT COUNT(*) FROM stock_items WHERE quantity <= reorder_level) as low_stock_items,
        (SELECT COUNT(*) FROM discipline_incidents WHERE status = 'open') as open_incidents,
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'open') as open_tickets
    `);

    res.json({
      success: true,
      system: {
        user_activity: userActivity,
        database_stats: dbStats[0],
        health_indicators: systemHealth[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// COMPREHENSIVE REPORTS
// ============================================
router.get('/reports/comprehensive', authenticateToken, requireRole(['school_owner']), async (req, res) => {
  try {
    const { report_type, start_date, end_date } = req.query;

    let reportData = {};

    if (report_type === 'financial' || !report_type) {
      const [financial] = await pool.execute(`
        SELECT 
          'Revenue' as category,
          SUM(paid_amount) as amount,
          COUNT(*) as transaction_count
        FROM student_payment_records
        WHERE payment_date BETWEEN COALESCE(?, DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) AND COALESCE(?, CURDATE())
        UNION ALL
        SELECT 
          'Expenses' as category,
          SUM(amount) as amount,
          COUNT(*) as transaction_count
        FROM expenses
        WHERE expense_date BETWEEN COALESCE(?, DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) AND COALESCE(?, CURDATE())
        UNION ALL
        SELECT 
          'Salaries' as category,
          SUM(amount) as amount,
          COUNT(*) as transaction_count
        FROM salaries
        WHERE payment_date BETWEEN COALESCE(?, DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) AND COALESCE(?, CURDATE())
      `, [start_date, end_date, start_date, end_date, start_date, end_date]);
      
      reportData.financial = financial;
    }

    if (report_type === 'academic' || !report_type) {
      const [academic] = await pool.execute(`
        SELECT 
          trade_code,
          trade_name,
          COUNT(*) as total_students,
          AVG(gpa) as avg_gpa,
          AVG(attendance_percentage) as avg_attendance,
          COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as honors_students
        FROM global_student_sheets
        WHERE status = 'active'
        GROUP BY trade_code, trade_name
      `);
      
      reportData.academic = academic;
    }

    res.json({
      success: true,
      report: reportData,
      generated_at: new Date(),
      parameters: { report_type, start_date, end_date }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ALL STUDENTS - Complete Access
// ============================================
router.get('/students/all', authenticateToken, requireRole(['school_owner']), async (req, res) => {
  try {
    const { trade_code, level_number, payment_status, search, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM global_student_sheets WHERE 1=1';
    const params = [];
    
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND level_number = ?'; params.push(level_number); }
    if (payment_status) { query += ' AND payment_status = ?'; params.push(payment_status); }
    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY trade_code, level_number, last_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [students] = await pool.execute(query, params);
    
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM global_student_sheets WHERE status = "active"');
    
    res.json({
      success: true,
      students,
      pagination: {
        total: total[0].count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + students.length) < total[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ALL STAFF - Complete Access
// ============================================
router.get('/staff/all', authenticateToken, requireRole(['school_owner']), async (req, res) => {
  try {
    const [staff] = await pool.execute(`
      SELECT 
        u.*,
        r.name as role_name,
        r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name != 'student' AND u.is_active = true
      ORDER BY r.name, u.last_name, u.first_name
    `);

    const [staffSummary] = await pool.execute(`
      SELECT 
        r.name as role,
        COUNT(*) as count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name != 'student' AND u.is_active = true
      GROUP BY r.name
    `);

    res.json({
      success: true,
      staff,
      summary: staffSummary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

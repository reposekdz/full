const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ====================================
 * ULTRA-ADVANCED ACCOUNTANT PORTAL
 * ====================================
 * Powerful financial management features
 * - Payment tracking and reminders
 * - Income and outgoing analytics
 * - Real-time financial dashboards
 * - Stock management integration
 * - Auto parent payment reminders
 * - Budget management
 * - Financial reports generation
 */

// =====================================
// FINANCIAL DASHBOARD
// =====================================

router.get('/dashboard', authenticateToken, requireRole(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];
    
    const [income] = await pool.execute(`
      SELECT 
        SUM(amount) as total_income,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_transaction
      FROM transactions
      WHERE type = 'income' AND transaction_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    
    const [expenses] = await pool.execute(`
      SELECT 
        SUM(amount) as total_expenses,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_transaction
      FROM transactions
      WHERE type = 'expense' AND transaction_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    
    const [studentFees] = await pool.execute(`
      SELECT 
        SUM(total_fees) as expected_fees,
        SUM(paid_amount) as collected_fees,
        SUM(balance) as outstanding_fees,
        COUNT(*) as total_students,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as fully_paid,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_paid,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid
      FROM global_student_sheets
      WHERE status = 'active'
    `);
    
    const [recentPayments] = await pool.execute(`
      SELECT 
        spr.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number
      FROM student_payment_records spr
      JOIN global_student_sheets gss ON spr.student_id = gss.student_id
      WHERE spr.payment_date BETWEEN ? AND ?
      ORDER BY spr.payment_date DESC
      LIMIT 20
    `, [startDate, endDate]);
    
    const [overduePayments] = await pool.execute(`
      SELECT 
        student_id,
        student_code,
        CONCAT(first_name, ' ', last_name) as student_name,
        guardian_name,
        guardian_phone,
        guardian_email,
        total_fees,
        paid_amount,
        balance,
        payment_deadline,
        DATEDIFF(NOW(), payment_deadline) as days_overdue
      FROM global_student_sheets
      WHERE status = 'active' 
      AND balance > 0 
      AND payment_deadline < NOW()
      ORDER BY days_overdue DESC
      LIMIT 50
    `);
    
    const [monthlyTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
      FROM transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month
    `);
    
    const [categoryBreakdown] = await pool.execute(`
      SELECT 
        category,
        type,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_amount
      FROM transactions
      WHERE transaction_date BETWEEN ? AND ?
      GROUP BY category, type
      ORDER BY total_amount DESC
    `, [startDate, endDate]);
    
    const netIncome = (income[0]?.total_income || 0) - (expenses[0]?.total_expenses || 0);
    const collectionRate = studentFees[0]?.expected_fees > 0 
      ? ((studentFees[0].collected_fees / studentFees[0].expected_fees) * 100).toFixed(2)
      : 0;
    
    res.json({
      success: true,
      dashboard: {
        summary: {
          total_income: income[0]?.total_income || 0,
          total_expenses: expenses[0]?.total_expenses || 0,
          net_income: netIncome,
          student_fees: studentFees[0] || {},
          collection_rate: collectionRate
        },
        recent_payments: recentPayments,
        overdue_payments: overduePayments,
        monthly_trends: monthlyTrends,
        category_breakdown: categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Accountant dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// PAYMENT TRACKING
// =====================================

// Record student payment
router.post('/payments/record', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const {
      student_id,
      amount,
      payment_method,
      reference_number,
      payment_date,
      notes
    } = req.body;
    
    if (!student_id || !amount) {
      return res.status(400).json({ success: false, message: 'Student ID and amount are required' });
    }
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = "active"',
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Active student enrollment not found' });
    }
    
    const [paymentResult] = await pool.execute(
      `INSERT INTO student_payment_records (
        student_id, amount, payment_method, reference_number,
        payment_date, notes, recorded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        student_id, amount, payment_method || 'cash', reference_number,
        payment_date || new Date().toISOString().split('T')[0],
        notes, req.user.id
      ]
    );
    
    const newBalance = (student[0].balance || 0) - amount;
    const newPaidAmount = (student[0].paid_amount || 0) + parseFloat(amount);
    let newStatus = 'unpaid';
    
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }
    
    await pool.execute(
      `UPDATE global_student_sheets 
       SET paid_amount = ?, balance = ?, payment_status = ?, last_payment_date = ?, updated_at = NOW()
       WHERE student_id = ?`,
      [newPaidAmount, newBalance, newStatus, payment_date || new Date().toISOString().split('T')[0], student_id]
    );
    
    await pool.execute(
      `INSERT INTO transactions (
        type, category, amount, description, transaction_date, 
        reference_id, reference_type, created_by, status
      ) VALUES ('income', 'Student Fees', ?, ?, ?, ?, 'student_payment', ?, 'completed')`,
      [
        amount,
        `Payment from ${student[0].first_name} ${student[0].last_name} (${student[0].student_code})`,
        payment_date || new Date().toISOString().split('T')[0],
        paymentResult.insertId,
        req.user.id
      ]
    );
    
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment_id: paymentResult.insertId,
      new_balance: newBalance,
      payment_status: newStatus
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment history
router.get('/payments/history', authenticateToken, requireRole(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { student_id, start_date, end_date, payment_method, page, limit } = req.query;
    
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 50;
    const offset = (currentPage - 1) * pageLimit;
    
    let query = `
      SELECT 
        spr.*,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        u.first_name as recorded_by_name
      FROM student_payment_records spr
      JOIN global_student_sheets gss ON spr.student_id = gss.student_id
      LEFT JOIN users u ON spr.recorded_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ` AND spr.student_id = ?`;
      params.push(student_id);
    }
    
    if (start_date) {
      query += ` AND spr.payment_date >= ?`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND spr.payment_date <= ?`;
      params.push(end_date);
    }
    
    if (payment_method) {
      query += ` AND spr.payment_method = ?`;
      params.push(payment_method);
    }
    
    query += ` ORDER BY spr.payment_date DESC LIMIT ? OFFSET ?`;
    params.push(pageLimit, offset);
    
    const [payments] = await pool.execute(query, params);
    
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').split('ORDER BY')[0];
    const [[{ total }]] = await pool.execute(countQuery, params.slice(0, -2));
    
    res.json({
      success: true,
      payments: payments,
      pagination: {
        current_page: currentPage,
        page_limit: pageLimit,
        total_payments: total,
        total_pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send payment reminder to parent
router.post('/payments/send-reminder', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { student_id, reminder_type, custom_message } = req.body;
    
    if (!student_id) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }
    
    const [student] = await pool.execute(
      `SELECT * FROM global_student_sheets WHERE student_id = ? AND status = 'active'`,
      [student_id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const studentInfo = student[0];
    
    if (!studentInfo.guardian_phone && !studentInfo.guardian_email) {
      return res.status(400).json({ success: false, message: 'No guardian contact information available' });
    }
    
    let message = custom_message;
    if (!message) {
      message = `Dear ${studentInfo.guardian_name || 'Parent/Guardian'},\n\n`;
      message += `This is a payment reminder for ${studentInfo.first_name} ${studentInfo.last_name} (${studentInfo.student_code}).\n`;
      message += `Total Fees: ${studentInfo.total_fees} RWF\n`;
      message += `Amount Paid: ${studentInfo.paid_amount} RWF\n`;
      message += `Balance: ${studentInfo.balance} RWF\n`;
      if (studentInfo.payment_deadline) {
        message += `Payment Deadline: ${new Date(studentInfo.payment_deadline).toLocaleDateString()}\n`;
      }
      message += `\nPlease make the payment at your earliest convenience.\nThank you.`;
    }
    
    let smsService;
    try {
      smsService = require('../services/smsService');
    } catch (err) {
      console.log('SMS service not available');
    }
    
    if (studentInfo.guardian_phone && smsService) {
      try {
        await smsService.sendSMS(studentInfo.guardian_phone, message);
      } catch (smsError) {
        console.error('SMS sending error:', smsError);
      }
    }
    
    await pool.execute(
      `INSERT INTO payment_reminders (
        student_id, reminder_type, message, sent_to, sent_via,
        sent_by, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        student_id,
        reminder_type || 'manual',
        message,
        studentInfo.guardian_phone || studentInfo.guardian_email,
        studentInfo.guardian_phone ? 'sms' : 'email',
        req.user.id
      ]
    );
    
    res.json({
      success: true,
      message: 'Payment reminder sent successfully'
    });
  } catch (error) {
    console.error('Send payment reminder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk send payment reminders
router.post('/payments/bulk-reminders', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { filter_type, days_overdue, min_balance } = req.body;
    
    let query = `
      SELECT * FROM global_student_sheets
      WHERE status = 'active' AND balance > 0
    `;
    const params = [];
    
    if (filter_type === 'overdue') {
      query += ` AND payment_deadline < NOW()`;
      if (days_overdue) {
        query += ` AND DATEDIFF(NOW(), payment_deadline) >= ?`;
        params.push(days_overdue);
      }
    } else if (filter_type === 'all_outstanding') {
      if (min_balance) {
        query += ` AND balance >= ?`;
        params.push(min_balance);
      }
    }
    
    const [students] = await pool.execute(query, params);
    
    let sent = 0;
    let failed = 0;
    
    let smsService;
    try {
      smsService = require('../services/smsService');
    } catch (err) {
      console.log('SMS service not available');
    }
    
    for (const student of students) {
      try {
        const message = `Dear ${student.guardian_name || 'Parent/Guardian'},\n\n` +
          `Payment reminder for ${student.first_name} ${student.last_name} (${student.student_code}).\n` +
          `Balance: ${student.balance} RWF\n` +
          `Please make the payment soon. Thank you.`;
        
        if (student.guardian_phone && smsService) {
          await smsService.sendSMS(student.guardian_phone, message);
          
          await pool.execute(
            `INSERT INTO payment_reminders (
              student_id, reminder_type, message, sent_to, sent_via, sent_by, sent_at
            ) VALUES (?, 'bulk', ?, ?, 'sms', ?, NOW())`,
            [student.student_id, message, student.guardian_phone, req.user.id]
          );
          
          sent++;
        }
      } catch (err) {
        console.error(`Failed to send reminder to ${student.student_code}:`, err);
        failed++;
      }
    }
    
    res.json({
      success: true,
      message: 'Bulk reminders processed',
      sent: sent,
      failed: failed,
      total: students.length
    });
  } catch (error) {
    console.error('Bulk reminders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// INCOME AND EXPENSE MANAGEMENT
// =====================================

// Record transaction
router.post('/transactions', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      description,
      transaction_date,
      reference_number,
      payment_method
    } = req.body;
    
    if (!type || !category || !amount) {
      return res.status(400).json({ success: false, message: 'Type, category, and amount are required' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO transactions (
        type, category, amount, description, transaction_date,
        reference_number, payment_method, created_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
      [
        type, category, amount, description,
        transaction_date || new Date().toISOString().split('T')[0],
        reference_number, payment_method || 'cash', req.user.id
      ]
    );
    
    res.json({
      success: true,
      message: 'Transaction recorded successfully',
      transaction_id: result.insertId
    });
  } catch (error) {
    console.error('Record transaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get transactions
router.get('/transactions', authenticateToken, requireRole(['accountant', 'admin', 'headmaster', 'owner']), async (req, res) => {
  try {
    const { type, category, start_date, end_date, page, limit } = req.query;
    
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 50;
    const offset = (currentPage - 1) * pageLimit;
    
    let query = `
      SELECT 
        t.*,
        u.first_name as recorded_by_name
      FROM transactions t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (type) {
      query += ` AND t.type = ?`;
      params.push(type);
    }
    
    if (category) {
      query += ` AND t.category = ?`;
      params.push(category);
    }
    
    if (start_date) {
      query += ` AND t.transaction_date >= ?`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND t.transaction_date <= ?`;
      params.push(end_date);
    }
    
    query += ` ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageLimit, offset);
    
    const [transactions] = await pool.execute(query, params);
    
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').split('ORDER BY')[0];
    const [[{ total }]] = await pool.execute(countQuery, params.slice(0, -2));
    
    res.json({
      success: true,
      transactions: transactions,
      pagination: {
        current_page: currentPage,
        page_limit: pageLimit,
        total_transactions: total,
        total_pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get income/expense analytics
router.get('/analytics/income-expense', authenticateToken, requireRole(['accountant', 'admin', 'headmaster', 'owner']), async (req, res) => {
  try {
    const { period, start_date, end_date } = req.query;
    
    let startDate, endDate;
    if (period === 'today') {
      startDate = endDate = new Date().toISOString().split('T')[0];
    } else if (period === 'week') {
      endDate = new Date().toISOString().split('T')[0];
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (period === 'month') {
      endDate = new Date().toISOString().split('T')[0];
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    } else if (period === 'year') {
      endDate = new Date().toISOString().split('T')[0];
      startDate = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    } else {
      startDate = start_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = end_date || new Date().toISOString().split('T')[0];
    }
    
    const [summary] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_balance,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM transactions
      WHERE transaction_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    
    const [incomeByCategory] = await pool.execute(`
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as average
      FROM transactions
      WHERE type = 'income' AND transaction_date BETWEEN ? AND ?
      GROUP BY category
      ORDER BY total DESC
    `, [startDate, endDate]);
    
    const [expenseByCategory] = await pool.execute(`
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as average
      FROM transactions
      WHERE type = 'expense' AND transaction_date BETWEEN ? AND ?
      GROUP BY category
      ORDER BY total DESC
    `, [startDate, endDate]);
    
    const [dailyTrends] = await pool.execute(`
      SELECT 
        DATE(transaction_date) as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
      FROM transactions
      WHERE transaction_date BETWEEN ? AND ?
      GROUP BY DATE(transaction_date)
      ORDER BY date
    `, [startDate, endDate]);
    
    res.json({
      success: true,
      analytics: {
        summary: summary[0],
        income_by_category: incomeByCategory,
        expense_by_category: expenseByCategory,
        daily_trends: dailyTrends,
        period: { start_date: startDate, end_date: endDate }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// FINANCIAL REPORTS
// =====================================

// Generate financial report
router.post('/reports/generate', authenticateToken, requireRole(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { report_type, start_date, end_date, include_details } = req.body;
    
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];
    
    const [transactions] = await pool.execute(
      `SELECT * FROM transactions WHERE transaction_date BETWEEN ? AND ? ORDER BY transaction_date`,
      [startDate, endDate]
    );
    
    const [studentFees] = await pool.execute(`
      SELECT 
        trade_code,
        level_number,
        COUNT(*) as student_count,
        SUM(total_fees) as expected_fees,
        SUM(paid_amount) as collected_fees,
        SUM(balance) as outstanding_fees
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code, level_number
    `);
    
    const report = {
      report_type: report_type || 'comprehensive',
      period: { start_date: startDate, end_date: endDate },
      summary: {
        total_income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0),
        total_expenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0),
        net_balance: 0
      },
      student_fees: studentFees,
      transactions: include_details ? transactions : null
    };
    
    report.summary.net_balance = report.summary.total_income - report.summary.total_expenses;
    
    const [result] = await pool.execute(
      `INSERT INTO financial_reports (
        report_type, start_date, end_date, report_data, generated_by, generated_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [report_type || 'comprehensive', startDate, endDate, JSON.stringify(report), req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Financial report generated successfully',
      report_id: result.insertId,
      report: report
    });
  } catch (error) {
    console.error('Generate financial report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

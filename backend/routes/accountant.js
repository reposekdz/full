const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { notifyFeePayment } = require('../utils/parentNotifications');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [totalIncome] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as total FROM fee_payments WHERE status = "completed" AND YEAR(payment_date) = YEAR(CURDATE())');
    const [totalExpenses] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status = "paid" AND YEAR(expense_date) = YEAR(CURDATE())');
    const [pendingPayments] = await pool.execute('SELECT COUNT(*) as count FROM fee_payments WHERE status = "pending"');
    const [overdueInvoices] = await pool.execute('SELECT COUNT(*) as count FROM invoices WHERE status = "overdue"');
    const [monthlyIncome] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as total FROM fee_payments WHERE status = "completed" AND MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE())');
    const [monthlyExpenses] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status = "paid" AND MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())');

    res.json({
      success: true,
      stats: {
        totalIncome: totalIncome[0].total,
        totalExpenses: totalExpenses[0].total,
        netBalance: totalIncome[0].total - totalExpenses[0].total,
        pendingPayments: pendingPayments[0].count,
        overdueInvoices: overdueInvoices[0].count,
        monthlyIncome: monthlyIncome[0].total,
        monthlyExpenses: monthlyExpenses[0].total,
        monthlyNet: monthlyIncome[0].total - monthlyExpenses[0].total
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
});

// Fee Payments CRUD
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const { status, payment_type, start_date, end_date } = req.query;
    let query = 'SELECT * FROM fee_payments WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (payment_type) { query += ' AND payment_type = ?'; params.push(payment_type); }
    if (start_date) { query += ' AND payment_date >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND payment_date <= ?'; params.push(end_date); }

    query += ' ORDER BY payment_date DESC';
    const [payments] = await pool.execute(query, params);
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

router.post('/payments', authenticateToken, async (req, res) => {
  try {
    const { student_id, amount, payment_type, payment_method, reference_number, notes } = req.body;
    const [student] = await pool.execute('SELECT student_code, name FROM students WHERE id = ?', [student_id]);
    
    const [result] = await pool.execute(
      'INSERT INTO fee_payments (student_id, student_code, student_name, amount, payment_type, payment_method, reference_number, status, processed_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, "completed", ?, ?)',
      [student_id, student[0]?.student_code, student[0]?.name, amount, payment_type, payment_method, reference_number, req.user.userId, notes]
    );

    // Notify parents
    notifyFeePayment(student_id, { amount, payment_type }).catch(err => 
      console.error('Failed to notify parent of fee payment:', err)
    );

    res.json({ success: true, message: 'Payment recorded', paymentId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
});

router.put('/payments/:id', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    await pool.execute('UPDATE fee_payments SET status = ?, notes = ? WHERE id = ?', [status, notes, req.params.id]);
    res.json({ success: true, message: 'Payment updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update payment' });
  }
});

// Invoices CRUD
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [invoices] = await pool.execute(query, params);
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

router.post('/invoices', authenticateToken, async (req, res) => {
  try {
    const { student_id, total_amount, due_date } = req.body;
    const [student] = await pool.execute('SELECT student_code, name FROM students WHERE id = ?', [student_id]);
    const invoiceNumber = `INV${Date.now()}`;
    
    const [result] = await pool.execute(
      'INSERT INTO invoices (invoice_number, student_id, student_code, student_name, total_amount, balance, due_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, "sent", ?)',
      [invoiceNumber, student_id, student[0]?.student_code, student[0]?.name, total_amount, total_amount, due_date, req.user.userId]
    );
    res.json({ success: true, message: 'Invoice created', invoiceId: result.insertId, invoiceNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
});

router.put('/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const { paid_amount, status } = req.body;
    const [invoice] = await pool.execute('SELECT total_amount FROM invoices WHERE id = ?', [req.params.id]);
    const balance = invoice[0].total_amount - paid_amount;
    await pool.execute('UPDATE invoices SET paid_amount = ?, balance = ?, status = ? WHERE id = ?', [paid_amount, balance, status, req.params.id]);
    res.json({ success: true, message: 'Invoice updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update invoice' });
  }
});

// Budgets CRUD
router.get('/budgets', authenticateToken, async (req, res) => {
  try {
    const [budgets] = await pool.execute('SELECT * FROM budgets ORDER BY created_at DESC');
    res.json({ success: true, budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch budgets' });
  }
});

router.post('/budgets', authenticateToken, async (req, res) => {
  try {
    const { category, allocated_amount, fiscal_year } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO budgets (category, allocated_amount, remaining_amount, fiscal_year, created_by) VALUES (?, ?, ?, ?, ?)',
      [category, allocated_amount, allocated_amount, fiscal_year, req.user.userId]
    );
    res.json({ success: true, message: 'Budget created', budgetId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create budget' });
  }
});

router.put('/budgets/:id', authenticateToken, async (req, res) => {
  try {
    const { allocated_amount, spent_amount } = req.body;
    const remaining = allocated_amount - spent_amount;
    const status = remaining < 0 ? 'exceeded' : remaining === 0 ? 'completed' : 'active';
    await pool.execute('UPDATE budgets SET allocated_amount = ?, spent_amount = ?, remaining_amount = ?, status = ? WHERE id = ?', 
      [allocated_amount, spent_amount, remaining, status, req.params.id]);
    res.json({ success: true, message: 'Budget updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update budget' });
  }
});

// Expenses CRUD
router.get('/expenses', authenticateToken, async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY expense_date DESC';
    const [expenses] = await pool.execute(query, params);
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
});

router.post('/expenses', authenticateToken, async (req, res) => {
  try {
    const { category, description, amount, expense_date, payment_method, reference_number } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO expenses (category, description, amount, expense_date, payment_method, reference_number, processed_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, "pending")',
      [category, description, amount, expense_date, payment_method, reference_number, req.user.userId]
    );
    res.json({ success: true, message: 'Expense recorded', expenseId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record expense' });
  }
});

router.put('/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE expenses SET status = ?, approved_by = ? WHERE id = ?', [status, req.user.userId, req.params.id]);
    res.json({ success: true, message: 'Expense updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
});

// Salary Payments
router.get('/salaries', authenticateToken, async (req, res) => {
  try {
    const [salaries] = await pool.execute('SELECT * FROM salary_payments ORDER BY created_at DESC');
    res.json({ success: true, salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch salaries' });
  }
});

router.post('/salaries', authenticateToken, async (req, res) => {
  try {
    const { staff_id, basic_salary, allowances, deductions, payment_month } = req.body;
    const [staff] = await pool.execute('SELECT name FROM users WHERE id = ?', [staff_id]);
    const net_salary = basic_salary + allowances - deductions;
    
    const [result] = await pool.execute(
      'INSERT INTO salary_payments (staff_id, staff_name, basic_salary, allowances, deductions, net_salary, payment_month, processed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [staff_id, staff[0]?.name, basic_salary, allowances, deductions, net_salary, payment_month, req.user.userId]
    );
    res.json({ success: true, message: 'Salary recorded', salaryId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record salary' });
  }
});

// Financial Reports
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const { report_type, start_date, end_date } = req.query;
    
    const [income] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM fee_payments WHERE status = "completed" AND payment_date BETWEEN ? AND ?',
      [start_date || '2024-01-01', end_date || '2024-12-31']
    );
    
    const [expenses] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status = "paid" AND expense_date BETWEEN ? AND ?',
      [start_date || '2024-01-01', end_date || '2024-12-31']
    );
    
    const net_balance = income[0].total - expenses[0].total;
    
    res.json({
      success: true,
      report: {
        total_income: income[0].total,
        total_expense: expenses[0].total,
        net_balance,
        period: `${start_date || '2024-01-01'} to ${end_date || '2024-12-31'}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

// Analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const [incomeByType] = await pool.execute(`
      SELECT payment_type, COALESCE(SUM(amount), 0) as total 
      FROM fee_payments WHERE status = "completed" 
      GROUP BY payment_type
    `);
    
    const [expenseByCategory] = await pool.execute(`
      SELECT category, COALESCE(SUM(amount), 0) as total 
      FROM expenses WHERE status = "paid" 
      GROUP BY category
    `);
    
    const [monthlyTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        COALESCE(SUM(amount), 0) as income
      FROM fee_payments 
      WHERE status = "completed" AND payment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month
    `);
    
    res.json({
      success: true,
      analytics: {
        incomeByType,
        expenseByCategory,
        monthlyTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// Student fee balance
router.get('/student/:studentId/balance', authenticateToken, async (req, res) => {
  try {
    const [paid] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM fee_payments WHERE student_id = ? AND status = "completed"',
      [req.params.studentId]
    );
    const [invoiced] = await pool.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE student_id = ?',
      [req.params.studentId]
    );
    const balance = invoiced[0].total - paid[0].total;
    res.json({ success: true, paid: paid[0].total, invoiced: invoiced[0].total, balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch balance' });
  }
});

// Payment history
router.get('/student/:studentId/payments', authenticateToken, async (req, res) => {
  try {
    const [payments] = await pool.execute(
      'SELECT * FROM fee_payments WHERE student_id = ? ORDER BY payment_date DESC',
      [req.params.studentId]
    );
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Delete payment
router.delete('/payments/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM fee_payments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete payment' });
  }
});

// Delete invoice
router.delete('/invoices/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete invoice' });
  }
});

// Delete budget
router.delete('/budgets/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM budgets WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete budget' });
  }
});

// Delete expense
router.delete('/expenses/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
});

// Cash flow report
router.get('/reports/cashflow', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [income] = await pool.execute(
      'SELECT DATE(payment_date) as date, SUM(amount) as amount FROM fee_payments WHERE status = "completed" AND payment_date BETWEEN ? AND ? GROUP BY date ORDER BY date',
      [start_date || '2024-01-01', end_date || '2024-12-31']
    );
    const [expenses] = await pool.execute(
      'SELECT DATE(expense_date) as date, SUM(amount) as amount FROM expenses WHERE status = "paid" AND expense_date BETWEEN ? AND ? GROUP BY date ORDER BY date',
      [start_date || '2024-01-01', end_date || '2024-12-31']
    );
    res.json({ success: true, cashflow: { income, expenses } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate cashflow' });
  }
});

module.exports = router;

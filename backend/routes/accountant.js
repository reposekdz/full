const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { notifyFeePayment } = require('../utils/parentNotifications');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Check if amount column exists, fallback to paid_amount or total_amount
    const [totalIncome] = await pool.execute(`
      SELECT COALESCE(SUM(COALESCE(amount, paid_amount, 0)), 0) as total 
      FROM fee_payments 
      WHERE status = "completed" AND YEAR(payment_date) = YEAR(CURDATE())
    `).catch(() => [[{ total: 0 }]]);

    const [totalExpenses] = await pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM expenses 
      WHERE status = "paid" AND YEAR(expense_date) = YEAR(CURDATE())
    `).catch(() => [[{ total: 0 }]]);

    const [pendingPayments] = await pool.execute(
      'SELECT COUNT(*) as count FROM fee_payments WHERE status = "pending"'
    ).catch(() => [[{ count: 0 }]]);

    const [overdueInvoices] = await pool.execute(
      'SELECT COUNT(*) as count FROM invoices WHERE status = "overdue"'
    ).catch(() => [[{ count: 0 }]]);

    const [monthlyIncome] = await pool.execute(`
      SELECT COALESCE(SUM(COALESCE(amount, paid_amount, 0)), 0) as total 
      FROM fee_payments 
      WHERE status = "completed" 
        AND MONTH(payment_date) = MONTH(CURDATE()) 
        AND YEAR(payment_date) = YEAR(CURDATE())
    `).catch(() => [[{ total: 0 }]]);

    const [monthlyExpenses] = await pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM expenses 
      WHERE status = "paid" 
        AND MONTH(expense_date) = MONTH(CURDATE()) 
        AND YEAR(expense_date) = YEAR(CURDATE())
    `).catch(() => [[{ total: 0 }]]);

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

// Get all students with optional filters (Level 4 SOD, etc.)
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, status, search, page = 1, limit = 50 } = req.query;
    let query = `
      SELECT 
        gss.id,
        gss.student_id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        gss.gender,
        gss.email,
        gss.phone,
        gss.trade_code,
        gss.trade_name,
        gss.level_number,
        gss.gpa,
        gss.attendance_percentage,
        gss.total_fees,
        gss.paid_amount,
        gss.balance,
        gss.payment_status,
        gss.status,
        gss.created_at
      FROM global_student_sheets gss
      WHERE 1=1
    `;
    const params = [];

    if (trade_code) {
      query += ' AND gss.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND gss.level_number = ?';
      params.push(parseInt(level_number));
    }
    if (status) {
      query += ' AND gss.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY gss.first_name, gss.last_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [students] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM global_student_sheets gss WHERE 1=1';
    const countParams = [];
    if (trade_code) { countQuery += ' AND gss.trade_code = ?'; countParams.push(trade_code); }
    if (level_number) { countQuery += ' AND gss.level_number = ?'; countParams.push(parseInt(level_number)); }
    if (status) { countQuery += ' AND gss.status = ?'; countParams.push(status); }
    if (search) { countQuery += ' AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    const [total] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      students,
      total: total[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(total[0].total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Get specific student by ID
router.get('/students/:id', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE id = ?
    `, [req.params.id]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get payment history
    const [payments] = await pool.execute(`
      SELECT * FROM fee_payments 
      WHERE student_code = ? 
      ORDER BY payment_date DESC LIMIT 20
    `, [students[0].student_code]);

    // Get linked parent
    const [links] = await pool.execute(`
      SELECT p.*, psl.relationship_type, psl.status as link_status
      FROM parent_student_links psl
      JOIN users p ON psl.parent_id = p.id
      WHERE psl.student_id = ? AND psl.status IN ('approved', 'pending')
    `, [req.params.id]);

    res.json({
      success: true,
      student: students[0],
      payments,
      parents: links
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student' });
  }
});

// Get fee summary by trade and level
router.get('/fee-summary', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;

    let query = `
      SELECT 
        gss.trade_code,
        gss.trade_name,
        gss.level_number,
        COUNT(*) as total_students,
        SUM(gss.total_fees) as total_fees,
        SUM(gss.paid_amount) as total_paid,
        SUM(gss.balance) as total_balance,
        SUM(CASE WHEN gss.payment_status = 'paid' THEN 1 ELSE 0 END) as fully_paid,
        SUM(CASE WHEN gss.payment_status = 'partial' THEN 1 ELSE 0 END) as partial_paid,
        SUM(CASE WHEN gss.payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid
      FROM global_student_sheets gss
      WHERE gss.status = 'active'
    `;
    const params = [];

    if (trade_code) {
      query += ' AND gss.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND gss.level_number = ?';
      params.push(parseInt(level_number));
    }

    query += ' GROUP BY gss.trade_code, gss.trade_name, gss.level_number ORDER BY gss.trade_code, gss.level_number';

    const [summary] = await pool.execute(query, params);

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Fee summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee summary' });
  }
});

// Record payment for student
router.post('/record-payment', authenticateToken, async (req, res) => {
  try {
    const { student_id, amount, payment_type, payment_method, reference_number, notes, academic_year } = req.body;

    // Get student info
    const [students] = await pool.execute('SELECT * FROM global_student_sheets WHERE id = ?', [student_id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    // Insert payment
    const [result] = await pool.execute(`
      INSERT INTO fee_payments 
      (student_id, student_code, student_name, amount, payment_type, payment_method, reference_number, status, processed_by, notes, academic_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
    `, [
      student_id,
      student.student_code,
      `${student.first_name} ${student.last_name}`,
      amount,
      payment_type || 'tuition',
      payment_method || 'cash',
      reference_number || `REF-${Date.now()}`,
      req.user.userId,
      notes || '',
      academic_year || new Date().getFullYear()
    ]);

    // Update student paid amount and balance
    const newPaid = parseFloat(student.paid_amount || 0) + parseFloat(amount);
    const newBalance = parseFloat(student.total_fees || 0) - newPaid;
    const newStatus = newBalance <= 0 ? 'paid' : newBalance < parseFloat(student.total_fees || 0) ? 'partial' : 'unpaid';

    await pool.execute(`
      UPDATE global_student_sheets 
      SET paid_amount = ?, balance = ?, payment_status = ?
      WHERE id = ?
    `, [newPaid, newBalance, newStatus, student_id]);

    // Notify parent
    notifyFeePayment(student_id, { amount, payment_type }).catch(err =>
      console.error('Failed to notify parent:', err)
    );

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      paymentId: result.insertId,
      newBalance,
      paymentStatus: newStatus
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
});

// Get trades and levels for filtering
router.get('/trades-levels', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT DISTINCT trade_code, trade_name 
      FROM global_student_sheets 
      WHERE trade_code IS NOT NULL AND trade_code != ''
      ORDER BY trade_code
    `);

    const [levels] = await pool.execute(`
      SELECT DISTINCT level_number 
      FROM global_student_sheets 
      WHERE level_number IS NOT NULL
      ORDER BY level_number
    `);

    res.json({
      success: true,
      trades: trades.map(t => ({ code: t.trade_code, name: t.trade_name })),
      levels: levels.map(l => l.level_number)
    });
  } catch (error) {
    console.error('Trades/levels error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trades/levels' });
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

// Get stock expenses for accountant
router.get('/stock-expenses', authenticateToken, async (req, res) => {
  try {
    const [stockExpenses] = await pool.execute(`
      SELECT 
        st.id,
        st.transaction_date,
        st.transaction_type,
        si.item_name,
        si.category,
        st.quantity,
        st.unit_price,
        st.total_value,
        st.reference_number,
        st.department,
        u.first_name as issued_by_name,
        u.last_name as issued_by_lastname
      FROM stock_transactions st
      LEFT JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN users u ON st.issued_by = u.id
      WHERE st.transaction_type IN ('purchase', 'damage', 'loss')
      ORDER BY st.transaction_date DESC
      LIMIT 100
    `);

    const [summary] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'purchase' THEN total_value ELSE 0 END) as total_purchases,
        SUM(CASE WHEN transaction_type = 'damage' THEN total_value ELSE 0 END) as total_damages,
        SUM(CASE WHEN transaction_type = 'loss' THEN total_value ELSE 0 END) as total_losses,
        SUM(total_value) as total_stock_expenses
      FROM stock_transactions
      WHERE transaction_type IN ('purchase', 'damage', 'loss')
        AND YEAR(transaction_date) = YEAR(CURDATE())
    `);

    res.json({ success: true, stockExpenses, summary: summary[0] });
  } catch (error) {
    console.error('Stock expenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock expenses' });
  }
});

// Get global students with financial data from global_student_sheets
router.get('/students-financial', authenticateToken, async (req, res) => {
  try {
    const { trade, level, payment_status, search } = req.query;

    let query = `
      SELECT 
        gss.id,
        gss.student_id,
        gss.student_code,
        gss.first_name,
        gss.last_name,
        gss.email,
        gss.phone,
        gss.gender,
        gss.trade_code,
        gss.trade_name,
        gss.level_number,
        gss.class_name,
        gss.status,
        gss.total_fees,
        gss.paid_amount,
        gss.balance,
        gss.payment_status,
        gss.academic_year,
        gss.attendance_percentage,
        gss.conduct_grade,
        gss.gpa
      FROM global_student_sheets gss
      WHERE gss.status = 'active'
    `;

    const params = [];
    if (trade) { query += ' AND gss.trade_code = ?'; params.push(trade); }
    if (level) { query += ' AND gss.level_number = ?'; params.push(level); }
    if (payment_status) { query += ' AND gss.payment_status = ?'; params.push(payment_status); }
    if (search) {
      query += ' AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY gss.trade_code, gss.level_number, gss.first_name, gss.last_name';

    const [students] = await pool.execute(query, params);

    // Add payment status and percentage
    const studentsWithStatus = students.map(s => ({
      ...s,
      payment_status_display: s.payment_status || (s.balance === 0 ? 'paid' : s.paid_amount === 0 ? 'unpaid' : 'partial'),
      percentage_paid: s.total_fees > 0 ? Math.round((s.paid_amount / s.total_fees) * 100) : 0
    }));

    // Filter by payment status if requested
    const filtered = payment_status
      ? studentsWithStatus.filter(s => s.payment_status_display === payment_status)
      : studentsWithStatus;

    res.json({ success: true, students: filtered, count: filtered.length });
  } catch (error) {
    console.error('Students financial error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Create custom financial column for student
router.post('/students/:studentId/custom-fee', authenticateToken, async (req, res) => {
  try {
    const { fee_type, amount, due_date, description } = req.body;
    const studentId = req.params.studentId;

    const [student] = await pool.execute(
      'SELECT student_code, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?',
      [studentId]
    );

    if (!student.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const invoiceNumber = `INV${Date.now()}`;
    const [result] = await pool.execute(
      `INSERT INTO invoices (
        invoice_number, student_id, student_code, student_name,
        total_amount, balance, due_date, status, created_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', ?, ?)`,
      [
        invoiceNumber,
        studentId,
        student[0].student_code,
        student[0].name,
        amount,
        amount,
        due_date,
        req.user.userId,
        `${fee_type}: ${description || ''}`
      ]
    );

    res.json({
      success: true,
      message: 'Custom fee created',
      invoiceId: result.insertId,
      invoiceNumber
    });
  } catch (error) {
    console.error('Custom fee error:', error);
    res.status(500).json({ success: false, message: 'Failed to create custom fee' });
  }
});

// Bulk update fees
router.post('/students/bulk-fees', authenticateToken, async (req, res) => {
  try {
    const { student_ids, fee_type, amount, due_date, description } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Student IDs required' });
    }

    const results = [];
    for (const studentId of student_ids) {
      const [student] = await pool.execute(
        'SELECT student_code, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?',
        [studentId]
      );

      if (student.length) {
        const invoiceNumber = `INV${Date.now()}_${studentId}`;
        const [result] = await pool.execute(
          `INSERT INTO invoices (
            invoice_number, student_id, student_code, student_name,
            total_amount, balance, due_date, status, created_by, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', ?, ?)`,
          [
            invoiceNumber,
            studentId,
            student[0].student_code,
            student[0].name,
            amount,
            amount,
            due_date,
            req.user.userId,
            `${fee_type}: ${description || ''}`
          ]
        );
        results.push({ studentId, invoiceId: result.insertId, invoiceNumber });
      }
    }

    res.json({
      success: true,
      message: `Fees created for ${results.length} students`,
      results
    });
  } catch (error) {
    console.error('Bulk fees error:', error);
    res.status(500).json({ success: false, message: 'Failed to create bulk fees' });
  }
});

// Get available trades and levels for filtering
router.get('/trades-levels', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT DISTINCT trade_code, trade_name 
      FROM global_student_sheets 
      WHERE trade_code IS NOT NULL AND trade_code != ''
      ORDER BY trade_code
    `);

    const [levels] = await pool.execute(`
      SELECT DISTINCT level_number 
      FROM global_student_sheets 
      WHERE level_number IS NOT NULL
      ORDER BY level_number
    `);

    res.json({
      success: true,
      trades: trades.map(t => ({ code: t.code, name: t.name || t.code })),
      levels: levels.map(l => l.level_number)
    });
  } catch (error) {
    console.error('Trades/levels error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trades/levels' });
  }
});

// Forced Password Change for Staff
router.post('/force-password-change', authenticateToken, async (req, res) => {
  try {
    const { user_id, new_password, force_change } = req.body;

    if (!user_id || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new password are required'
      });
    }

    // Check if the requesting user has permission (admin or accountant)
    if (!['admin', 'accountant'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Get user info
    const [user] = await pool.execute(
      'SELECT id, username, email, role, first_name, last_name FROM users WHERE id = ?',
      [user_id]
    );

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
      [hashedPassword, user_id]
    );

    // Log the action
    await pool.execute(`
      INSERT INTO activity_logs (user_id, action, description, created_at)
      VALUES (?, 'password_change', ?, NOW())
    `, [req.user.userId, `Password force changed for user ${user[0].username} by ${req.user.username || req.user.userId}`]);

    res.json({
      success: true,
      message: `Password updated successfully for ${user[0].first_name} ${user[0].last_name}`,
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        role: user[0].role
      }
    });
  } catch (error) {
    console.error('Force password change error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// Get staff list for password management
router.get('/staff-list', authenticateToken, async (req, res) => {
  try {
    const [staff] = await pool.execute(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active,
        u.last_login,
        u.created_at,
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.role IN ('admin', 'accountant', 'teacher', 'dos', 'dod', 'headmaster', 'patron', 'matron')
      ORDER BY u.role, u.first_name, u.last_name
    `);

    res.json({ success: true, staff });
  } catch (error) {
    console.error('Staff list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff list' });
  }
});

// Force email change for staff
router.post('/force-email-change', authenticateToken, async (req, res) => {
  try {
    const { user_id, new_email } = req.body;

    if (!user_id || !new_email) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new email are required'
      });
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [new_email, user_id]
    );

    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use by another account'
      });
    }

    // Update email
    await pool.execute(
      'UPDATE users SET email = ?, email_verified = 0 WHERE id = ?',
      [new_email, user_id]
    );

    // Get user info for response
    const [user] = await pool.execute(
      'SELECT username, first_name, last_name FROM users WHERE id = ?',
      [user_id]
    );

    res.json({
      success: true,
      message: `Email updated successfully for ${user[0]?.first_name} ${user[0]?.last_name}`
    });
  } catch (error) {
    console.error('Force email change error:', error);
    res.status(500).json({ success: false, message: 'Failed to change email' });
  }
});

module.exports = router;

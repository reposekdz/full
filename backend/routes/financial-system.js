const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/budgets', authenticateToken, requireRole('admin', 'headmaster', 'accountant'), async (req, res) => {
  try {
    const { fiscal_year, status, category, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, u.first_name as creator_first_name, u.last_name as creator_last_name
      FROM budgets b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (fiscal_year) {
      query += ' AND b.fiscal_year = ?';
      params.push(fiscal_year);
    }
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND b.category = ?';
      params.push(category);
    }

    const countQuery = query.replace(
      'SELECT b.*, u.first_name as creator_first_name, u.last_name as creator_last_name',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY b.fiscal_year DESC, b.category LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [budgets] = await pool.query(query, params);

    res.json({
      success: true,
      budgets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budgets', error: error.message });
  }
});

router.post('/budgets', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { category, allocated_amount, fiscal_year } = req.body;

    const [result] = await pool.query(
      `INSERT INTO budgets (category, allocated_amount, spent_amount, remaining_amount, fiscal_year, status, created_by) 
       VALUES (?, ?, 0, ?, ?, 'active', ?)`,
      [category, allocated_amount, allocated_amount, fiscal_year, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Budget created', id: result.insertId });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ success: false, message: 'Failed to create budget', error: error.message });
  }
});

router.put('/budgets/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, allocated_amount, fiscal_year, status } = req.body;

    const [[budget]] = await pool.query('SELECT spent_amount FROM budgets WHERE id = ?', [id]);
    const remaining = allocated_amount - budget.spent_amount;

    await pool.query(
      'UPDATE budgets SET category = ?, allocated_amount = ?, remaining_amount = ?, fiscal_year = ?, status = ? WHERE id = ?',
      [category, allocated_amount, remaining, fiscal_year, status, id]
    );

    res.json({ success: true, message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ success: false, message: 'Failed to update budget', error: error.message });
  }
});

router.get('/expenses', authenticateToken, requireRole('admin', 'headmaster', 'accountant'), async (req, res) => {
  try {
    const { category, status, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, 
        a.first_name as approver_first_name, a.last_name as approver_last_name,
        p.first_name as processor_first_name, p.last_name as processor_last_name
      FROM expenses e
      LEFT JOIN users a ON e.approved_by = a.id
      LEFT JOIN users p ON e.processed_by = p.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND e.category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (start_date && end_date) {
      query += ' AND e.expense_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const countQuery = query.replace(
      'SELECT e.*, a.first_name as approver_first_name, a.last_name as approver_last_name, p.first_name as processor_first_name, p.last_name as processor_last_name',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY e.expense_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [expenses] = await pool.query(query, params);

    res.json({
      success: true,
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expenses', error: error.message });
  }
});

router.post('/expenses', authenticateToken, requireRole('admin', 'headmaster', 'accountant'), async (req, res) => {
  try {
    const {
      category, description, amount, expense_date,
      payment_method, reference_number
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO expenses 
       (category, description, amount, expense_date, payment_method, reference_number, status, processed_by) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [category, description, amount, expense_date, payment_method, reference_number, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Expense recorded', id: result.insertId });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to record expense', error: error.message });
  }
});

router.put('/expenses/:id/approve', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;

    const [[expense]] = await pool.query('SELECT category, amount FROM expenses WHERE id = ?', [id]);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await pool.query('BEGIN');

    await pool.query(
      'UPDATE expenses SET status = ?, approved_by = ? WHERE id = ?',
      ['approved', req.user.id, id]
    );

    const [[budget]] = await pool.query(
      'SELECT id, spent_amount, remaining_amount FROM budgets WHERE category = ? AND status = "active" LIMIT 1',
      [expense.category]
    );

    if (budget) {
      await pool.query(
        'UPDATE budgets SET spent_amount = spent_amount + ?, remaining_amount = remaining_amount - ? WHERE id = ?',
        [expense.amount, expense.amount, budget.id]
      );
    }

    await pool.query('COMMIT');

    res.json({ success: true, message: 'Expense approved' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Approve expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve expense', error: error.message });
  }
});

router.put('/expenses/:id/reject', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE expenses SET status = ?, approved_by = ? WHERE id = ?',
      ['rejected', req.user.id, id]
    );

    res.json({ success: true, message: 'Expense rejected' });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject expense', error: error.message });
  }
});

router.get('/fee-payments', authenticateToken, async (req, res) => {
  try {
    const { student_id, status, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT fp.*, 
        s.first_name as student_first_name, s.last_name as student_last_name,
        fs.fee_type, fs.amount as fee_amount,
        r.first_name as receiver_first_name, r.last_name as receiver_last_name
      FROM fee_payments fp
      LEFT JOIN users s ON fp.student_id = s.id
      LEFT JOIN fee_structure fs ON fp.fee_structure_id = fs.id
      LEFT JOIN users r ON fp.received_by = r.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' AND fp.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND fp.student_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    } else if (student_id) {
      query += ' AND fp.student_id = ?';
      params.push(student_id);
    }

    if (status) {
      query += ' AND fp.status = ?';
      params.push(status);
    }
    if (start_date && end_date) {
      query += ' AND fp.payment_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const countQuery = query.replace(
      'SELECT fp.*, s.first_name as student_first_name, s.last_name as student_last_name, fs.fee_type, fs.amount as fee_amount, r.first_name as receiver_first_name, r.last_name as receiver_last_name',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY fp.payment_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [payments] = await pool.query(query, params);

    res.json({
      success: true,
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get fee payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee payments', error: error.message });
  }
});

router.post('/fee-payments', authenticateToken, requireRole('admin', 'headmaster', 'accountant'), async (req, res) => {
  try {
    const {
      student_id, fee_structure_id, amount_paid, payment_date,
      payment_method, transaction_reference, notes
    } = req.body;

    const receiptNumber = `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.query(
      `INSERT INTO fee_payments 
       (student_id, fee_structure_id, amount_paid, payment_date, payment_method, 
        transaction_reference, receipt_number, status, received_by, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
      [student_id, fee_structure_id, amount_paid, payment_date, payment_method,
       transaction_reference, receiptNumber, req.user.id, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      id: result.insertId,
      receipt_number: receiptNumber
    });
  } catch (error) {
    console.error('Create fee payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  }
});

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster', 'accountant'), async (req, res) => {
  try {
    const { start_date, end_date, fiscal_year } = req.query;
    const params = [];
    let dateFilter = '';
    let fiscalFilter = '';

    if (start_date && end_date) {
      dateFilter = ' AND payment_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    if (fiscal_year) {
      fiscalFilter = ' AND fiscal_year = ?';
    }

    const [totalBudget] = await pool.query(
      `SELECT SUM(allocated_amount) as total, SUM(spent_amount) as spent, SUM(remaining_amount) as remaining
       FROM budgets WHERE status = 'active'${fiscalFilter}`,
      fiscal_year ? [fiscal_year] : []
    );

    const [budgetByCategory] = await pool.query(
      `SELECT category, allocated_amount, spent_amount, remaining_amount
       FROM budgets WHERE status = 'active'${fiscalFilter}`,
      fiscal_year ? [fiscal_year] : []
    );

    const dateParams = [];
    if (start_date && end_date) {
      dateParams.push(start_date, end_date);
    }

    const [totalExpenses] = await pool.query(
      `SELECT COUNT(*) as count, SUM(amount) as total
       FROM expenses WHERE status = 'paid'${dateFilter}`,
      dateParams
    );

    const [expensesByCategory] = await pool.query(
      `SELECT category, COUNT(*) as count, SUM(amount) as total
       FROM expenses WHERE status = 'paid'${dateFilter}
       GROUP BY category`,
      dateParams
    );

    const [totalFeePayments] = await pool.query(
      `SELECT COUNT(*) as count, SUM(amount_paid) as total
       FROM fee_payments WHERE status = 'completed'${dateFilter}`,
      dateParams
    );

    const [feePaymentsByMethod] = await pool.query(
      `SELECT payment_method, COUNT(*) as count, SUM(amount_paid) as total
       FROM fee_payments WHERE status = 'completed'${dateFilter}
       GROUP BY payment_method`,
      dateParams
    );

    const [monthlyRevenue] = await pool.query(
      `SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(amount_paid) as revenue
       FROM fee_payments WHERE status = 'completed'${dateFilter}
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`,
      dateParams
    );

    const [pendingExpenses] = await pool.query(
      'SELECT COUNT(*) as count, SUM(amount) as total FROM expenses WHERE status = "pending"'
    );

    res.json({
      success: true,
      analytics: {
        budget: {
          total_allocated: totalBudget[0].total || 0,
          total_spent: totalBudget[0].spent || 0,
          total_remaining: totalBudget[0].remaining || 0,
          by_category: budgetByCategory
        },
        expenses: {
          total_count: totalExpenses[0].count,
          total_amount: totalExpenses[0].total || 0,
          by_category: expensesByCategory,
          pending_count: pendingExpenses[0].count,
          pending_amount: pendingExpenses[0].total || 0
        },
        fee_payments: {
          total_count: totalFeePayments[0].count,
          total_amount: totalFeePayments[0].total || 0,
          by_payment_method: feePaymentsByMethod,
          monthly_revenue: monthlyRevenue
        }
      }
    });
  } catch (error) {
    console.error('Get financial analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

router.get('/dashboard', authenticateToken, requireRole('admin', 'headmaster', 'accountant'), async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [monthlyRevenue] = await pool.query(
      `SELECT SUM(amount_paid) as revenue FROM fee_payments 
       WHERE status = 'completed' AND DATE_FORMAT(payment_date, '%Y-%m') = ?`,
      [currentMonth]
    );

    const [monthlyExpenses] = await pool.query(
      `SELECT SUM(amount) as expenses FROM expenses 
       WHERE status = 'paid' AND DATE_FORMAT(expense_date, '%Y-%m') = ?`,
      [currentMonth]
    );

    const [pendingApprovals] = await pool.query(
      'SELECT COUNT(*) as count FROM expenses WHERE status = "pending"'
    );

    const [activeBudgets] = await pool.query(
      `SELECT COUNT(*) as count, SUM(remaining_amount) as remaining 
       FROM budgets WHERE status = 'active'`
    );

    const [recentPayments] = await pool.query(
      `SELECT fp.*, s.first_name, s.last_name, fs.fee_type
       FROM fee_payments fp
       LEFT JOIN users s ON fp.student_id = s.id
       LEFT JOIN fee_structure fs ON fp.fee_structure_id = fs.id
       WHERE fp.status = 'completed'
       ORDER BY fp.payment_date DESC
       LIMIT 10`
    );

    const [budgetUtilization] = await pool.query(
      `SELECT category, allocated_amount, spent_amount,
        ROUND((spent_amount / allocated_amount) * 100, 2) as utilization_percentage
       FROM budgets 
       WHERE status = 'active'
       ORDER BY utilization_percentage DESC`
    );

    res.json({
      success: true,
      dashboard: {
        monthly_revenue: monthlyRevenue[0].revenue || 0,
        monthly_expenses: monthlyExpenses[0].expenses || 0,
        net_income: (monthlyRevenue[0].revenue || 0) - (monthlyExpenses[0].expenses || 0),
        pending_approvals: pendingApprovals[0].count,
        active_budgets: activeBudgets[0].count,
        budget_remaining: activeBudgets[0].remaining || 0,
        recent_payments: recentPayments,
        budget_utilization: budgetUtilization
      }
    });
  } catch (error) {
    console.error('Get financial dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
  }
});

module.exports = router;

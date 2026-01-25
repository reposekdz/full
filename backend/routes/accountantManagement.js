const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Budgets APIs
router.get('/budgets', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [budgets] = await db.query(`
      SELECT b.*, 
             COALESCE((SELECT SUM(amount) FROM expenses WHERE category = b.category AND YEAR(expense_date) = SUBSTRING(b.fiscal_year, 1, 4)), 0) as spent_amount
      FROM budgets b
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, budgets });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/budgets', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { category, allocated_amount, fiscal_year, description } = req.body;
  try {
    await db.query(
      'INSERT INTO budgets (category, allocated_amount, fiscal_year, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [category, allocated_amount, fiscal_year, description, req.user.id]
    );
    res.json({ success: true, message: 'Budget created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

router.get('/budget-categories', authenticateToken, async (req, res) => {
  try {
    const categories = [
      { id: 1, name: 'Amashuri' },
      { id: 2, name: 'Ibikoresho' },
      { id: 3, name: 'Imishahara' },
      { id: 4, name: 'Ibikorwa' },
      { id: 5, name: 'Ubwubatsi' },
      { id: 6, name: 'Ikoranabuhanga' },
      { id: 7, name: 'Siporo' },
      { id: 8, name: 'Ibindi' }
    ];
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Salaries APIs
router.get('/salaries', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [salaries] = await db.query(`
      SELECT s.*, u.first_name as staff_name, u.role as position
      FROM salaries s
      LEFT JOIN users u ON s.staff_id = u.id
      ORDER BY s.payment_date DESC
    `);
    res.json({ success: true, salaries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch salaries' });
  }
});

router.post('/salaries', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { staff_id, amount, month, year, status } = req.body;
  try {
    await db.query(
      'INSERT INTO salaries (staff_id, amount, month, year, status, payment_date, processed_by) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
      [staff_id, amount, month, year, status || 'paid', req.user.id]
    );
    res.json({ success: true, message: 'Salary recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record salary' });
  }
});

// Transactions APIs
router.get('/transactions', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { type, start_date, end_date } = req.query;
  try {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    
    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }
    if (start_date) {
      query += ' AND transaction_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND transaction_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY transaction_date DESC';
    
    const [transactions] = await db.query(query, params);
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/transactions', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  const { type, category, amount, description, transaction_date } = req.body;
  try {
    await db.query(
      'INSERT INTO transactions (type, category, amount, description, transaction_date, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [type, category, amount, description, transaction_date || new Date(), req.user.id, 'completed']
    );
    res.json({ success: true, message: 'Transaction recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// Financial Reports APIs
router.get('/reports', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { period, year } = req.query;
  try {
    const [income] = await db.query(`
      SELECT SUM(amount) as total FROM transactions 
      WHERE type = 'income' AND YEAR(transaction_date) = ?
    `, [year]);
    
    const [expenses] = await db.query(`
      SELECT SUM(amount) as total FROM transactions 
      WHERE type = 'expense' AND YEAR(transaction_date) = ?
    `, [year]);
    
    const [expensesByCategory] = await db.query(`
      SELECT category, SUM(amount) as amount,
             ROUND((SUM(amount) / (SELECT SUM(amount) FROM transactions WHERE type = 'expense' AND YEAR(transaction_date) = ?)) * 100, 2) as percentage
      FROM transactions
      WHERE type = 'expense' AND YEAR(transaction_date) = ?
      GROUP BY category
      ORDER BY amount DESC
    `, [year, year]);
    
    const [incomeBySource] = await db.query(`
      SELECT category as source, SUM(amount) as amount,
             ROUND((SUM(amount) / (SELECT SUM(amount) FROM transactions WHERE type = 'income' AND YEAR(transaction_date) = ?)) * 100, 2) as percentage
      FROM transactions
      WHERE type = 'income' AND YEAR(transaction_date) = ?
      GROUP BY category
      ORDER BY amount DESC
    `, [year, year]);
    
    const totalIncome = income[0].total || 0;
    const totalExpenses = expenses[0].total || 0;
    const profit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    
    res.json({
      success: true,
      reports: {
        totalIncome,
        totalExpenses,
        profit,
        profitMargin,
        expensesByCategory,
        incomeBySource
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
});

router.get('/reports/download', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { type, period, year } = req.query;
  try {
    // Generate PDF report (simplified - would use a PDF library in production)
    const reportData = `Financial Report - ${type} - ${period} - ${year}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report.pdf`);
    res.send(reportData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download report' });
  }
});

module.exports = router;

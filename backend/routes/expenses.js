const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/expenses/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, start_date, end_date, budget_id } = req.query;
    let query = `
      SELECT e.*, 
             u.username as recorded_by_name,
             b.category as budget_category
      FROM expenses e
      LEFT JOIN users u ON e.recorded_by = u.id
      LEFT JOIN budgets b ON e.budget_id = b.id
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      query += ' AND e.category = ?';
      params.push(category);
    }
    
    if (start_date) {
      query += ' AND e.expense_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND e.expense_date <= ?';
      params.push(end_date);
    }
    
    if (budget_id) {
      query += ' AND e.budget_id = ?';
      params.push(budget_id);
    }
    
    query += ' ORDER BY e.expense_date DESC';
    
    const [expenses] = await pool.execute(query, params);
    
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
});

// Get expense summary
router.get('/summary/overview', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE expense_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = 'WHERE expense_date >= ?';
      params.push(start_date);
    } else if (end_date) {
      dateFilter = 'WHERE expense_date <= ?';
      params.push(end_date);
    }
    
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        MAX(amount) as max_expense,
        MIN(amount) as min_expense
      FROM expenses
      ${dateFilter}
    `, params);
    
    const [byCategory] = await pool.execute(`
      SELECT category, 
             COUNT(*) as count,
             SUM(amount) as total
      FROM expenses
      ${dateFilter}
      GROUP BY category
      ORDER BY total DESC
    `, params);
    
    const [monthly] = await pool.execute(`
      SELECT 
        DATE_FORMAT(expense_date, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(amount) as total
      FROM expenses
      ${dateFilter}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `, params);
    
    res.json({ 
      success: true, 
      data: { 
        summary: summary[0], 
        byCategory, 
        monthly 
      } 
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense summary' });
  }
});

// Get expense by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [expense] = await pool.execute(`
      SELECT e.*, 
             u.username as recorded_by_name,
             b.category as budget_category,
             b.allocated_amount as budget_allocated
      FROM expenses e
      LEFT JOIN users u ON e.recorded_by = u.id
      LEFT JOIN budgets b ON e.budget_id = b.id
      WHERE e.id = ?
    `, [req.params.id]);
    
    if (expense.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    res.json({ success: true, data: expense[0] });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense' });
  }
});

// Create expense
router.post('/', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    const { category, amount, description, budget_id, expense_date, vendor, payment_method, reference_number } = req.body;
    const receipt_url = req.file ? `/uploads/expenses/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO expenses 
      (category, amount, description, budget_id, expense_date, vendor, payment_method, reference_number, receipt_url, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [category, amount, description, budget_id, expense_date || new Date(), vendor, payment_method, reference_number, receipt_url, req.user.id]);
    
    // Update budget if budget_id is provided
    if (budget_id) {
      const [budget] = await pool.execute('SELECT * FROM budgets WHERE id = ?', [budget_id]);
      
      if (budget.length > 0) {
        const newSpent = parseFloat(budget[0].spent_amount) + parseFloat(amount);
        const newRemaining = parseFloat(budget[0].allocated_amount) - newSpent;
        let newStatus = 'active';
        
        if (newRemaining < 0) {
          newStatus = 'exceeded';
        } else if (newRemaining === 0) {
          newStatus = 'completed';
        }
        
        await pool.execute(`
          UPDATE budgets 
          SET spent_amount = ?, remaining_amount = ?, status = ?
          WHERE id = ?
        `, [newSpent, newRemaining, newStatus, budget_id]);
      }
    }
    
    res.json({ success: true, message: 'Expense created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    const { category, amount, description, budget_id, expense_date, vendor, payment_method, reference_number } = req.body;
    
    // Get old expense to update budget
    const [oldExpense] = await pool.execute('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    
    if (oldExpense.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    let query = `
      UPDATE expenses 
      SET category = ?, amount = ?, description = ?, budget_id = ?, 
          expense_date = ?, vendor = ?, payment_method = ?, reference_number = ?
    `;
    const params = [category, amount, description, budget_id, expense_date, vendor, payment_method, reference_number];
    
    if (req.file) {
      query += ', receipt_url = ?';
      params.push(`/uploads/expenses/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    // Update old budget
    if (oldExpense[0].budget_id) {
      const [oldBudget] = await pool.execute('SELECT * FROM budgets WHERE id = ?', [oldExpense[0].budget_id]);
      if (oldBudget.length > 0) {
        const newSpent = parseFloat(oldBudget[0].spent_amount) - parseFloat(oldExpense[0].amount);
        const newRemaining = parseFloat(oldBudget[0].allocated_amount) - newSpent;
        
        await pool.execute(
          'UPDATE budgets SET spent_amount = ?, remaining_amount = ? WHERE id = ?',
          [newSpent, newRemaining, oldExpense[0].budget_id]
        );
      }
    }
    
    // Update new budget
    if (budget_id) {
      const [newBudget] = await pool.execute('SELECT * FROM budgets WHERE id = ?', [budget_id]);
      if (newBudget.length > 0) {
        const newSpent = parseFloat(newBudget[0].spent_amount) + parseFloat(amount);
        const newRemaining = parseFloat(newBudget[0].allocated_amount) - newSpent;
        let newStatus = 'active';
        
        if (newRemaining < 0) {
          newStatus = 'exceeded';
        } else if (newRemaining === 0) {
          newStatus = 'completed';
        }
        
        await pool.execute(
          'UPDATE budgets SET spent_amount = ?, remaining_amount = ?, status = ? WHERE id = ?',
          [newSpent, newRemaining, newStatus, budget_id]
        );
      }
    }
    
    res.json({ success: true, message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [expense] = await pool.execute('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    
    if (expense.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    // Update budget
    if (expense[0].budget_id) {
      const [budget] = await pool.execute('SELECT * FROM budgets WHERE id = ?', [expense[0].budget_id]);
      if (budget.length > 0) {
        const newSpent = parseFloat(budget[0].spent_amount) - parseFloat(expense[0].amount);
        const newRemaining = parseFloat(budget[0].allocated_amount) - newSpent;
        
        await pool.execute(
          'UPDATE budgets SET spent_amount = ?, remaining_amount = ? WHERE id = ?',
          [newSpent, newRemaining, expense[0].budget_id]
        );
      }
    }
    
    await pool.execute('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
});

module.exports = router;

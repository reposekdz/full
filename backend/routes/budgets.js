const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all budgets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { fiscal_year, status } = req.query;
    let query = 'SELECT * FROM budgets WHERE 1=1';
    const params = [];
    
    if (fiscal_year) {
      query += ' AND fiscal_year = ?';
      params.push(fiscal_year);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [budgets] = await pool.execute(query, params);
    
    res.json({ success: true, data: budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budgets' });
  }
});

// Get budget by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [budget] = await pool.execute('SELECT * FROM budgets WHERE id = ?', [req.params.id]);
    
    if (budget.length === 0) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    
    res.json({ success: true, data: budget[0] });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget' });
  }
});

// Get budget summary
router.get('/summary/overview', authenticateToken, async (req, res) => {
  try {
    const { fiscal_year } = req.query;
    
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_budgets,
        SUM(allocated_amount) as total_allocated,
        SUM(spent_amount) as total_spent,
        SUM(remaining_amount) as total_remaining,
        SUM(CASE WHEN status = 'exceeded' THEN 1 ELSE 0 END) as exceeded_count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM budgets
      WHERE fiscal_year = ?
    `, [fiscal_year || new Date().getFullYear()]);
    
    const [categories] = await pool.execute(`
      SELECT category, 
             SUM(allocated_amount) as allocated,
             SUM(spent_amount) as spent,
             SUM(remaining_amount) as remaining,
             status
      FROM budgets
      WHERE fiscal_year = ?
      GROUP BY category, status
    `, [fiscal_year || new Date().getFullYear()]);
    
    res.json({ success: true, data: { summary: summary[0], categories } });
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget summary' });
  }
});

// Create budget
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { category, allocated_amount, fiscal_year, created_by } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO budgets 
      (category, allocated_amount, spent_amount, remaining_amount, fiscal_year, status, created_by)
      VALUES (?, ?, 0, ?, ?, 'active', ?)
    `, [category, allocated_amount, allocated_amount, fiscal_year, created_by || req.user.id]);
    
    res.json({ success: true, message: 'Budget created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ success: false, message: 'Failed to create budget' });
  }
});

// Update budget
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { category, allocated_amount, spent_amount, fiscal_year } = req.body;
    
    const remaining_amount = allocated_amount - (spent_amount || 0);
    let status = 'active';
    
    if (remaining_amount < 0) {
      status = 'exceeded';
    } else if (remaining_amount === 0) {
      status = 'completed';
    }
    
    await pool.execute(`
      UPDATE budgets 
      SET category = ?, allocated_amount = ?, spent_amount = ?, 
          remaining_amount = ?, fiscal_year = ?, status = ?
      WHERE id = ?
    `, [category, allocated_amount, spent_amount, remaining_amount, fiscal_year, status, req.params.id]);
    
    res.json({ success: true, message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ success: false, message: 'Failed to update budget' });
  }
});

// Record expense against budget
router.post('/:id/expense', authenticateToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    const [budget] = await pool.execute('SELECT * FROM budgets WHERE id = ?', [req.params.id]);
    
    if (budget.length === 0) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    
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
    `, [newSpent, newRemaining, newStatus, req.params.id]);
    
    // Record in expenses table
    await pool.execute(`
      INSERT INTO expenses (category, amount, description, budget_id, recorded_by, expense_date)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [budget[0].category, amount, description, req.params.id, req.user.id]);
    
    res.json({ success: true, message: 'Expense recorded successfully' });
  } catch (error) {
    console.error('Error recording expense:', error);
    res.status(500).json({ success: false, message: 'Failed to record expense' });
  }
});

// Delete budget
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM budgets WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ success: false, message: 'Failed to delete budget' });
  }
});

module.exports = router;

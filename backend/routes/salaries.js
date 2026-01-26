const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all salaries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { staff_id, payment_status } = req.query;
    let query = `
      SELECT s.*, 
             st.first_name, st.last_name, st.employee_id, st.position,
             (SELECT COUNT(*) FROM salary_payments WHERE salary_id = s.id) as payment_count
      FROM salaries s
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE 1=1
    `;
    const params = [];
    
    if (staff_id) {
      query += ' AND s.staff_id = ?';
      params.push(staff_id);
    }
    
    if (payment_status) {
      query += ' AND s.payment_status = ?';
      params.push(payment_status);
    }
    
    query += ' ORDER BY s.effective_date DESC';
    
    const [salaries] = await pool.execute(query, params);
    
    res.json({ success: true, data: salaries });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch salaries' });
  }
});

// Get salary by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [salary] = await pool.execute(`
      SELECT s.*, 
             st.first_name, st.last_name, st.employee_id, st.position, st.email
      FROM salaries s
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (salary.length === 0) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    // Get payment history
    const [payments] = await pool.execute(`
      SELECT * FROM salary_payments 
      WHERE salary_id = ?
      ORDER BY payment_date DESC
    `, [req.params.id]);
    
    res.json({ 
      success: true, 
      data: { 
        ...salary[0], 
        payments 
      } 
    });
  } catch (error) {
    console.error('Error fetching salary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch salary' });
  }
});

// Get staff salary info
router.get('/staff/:staffId', authenticateToken, async (req, res) => {
  try {
    const [salaries] = await pool.execute(`
      SELECT s.*, 
             (SELECT SUM(amount_paid) FROM salary_payments WHERE salary_id = s.id) as total_paid
      FROM salaries s
      WHERE s.staff_id = ?
      ORDER BY s.effective_date DESC
    `, [req.params.staffId]);
    
    res.json({ success: true, data: salaries });
  } catch (error) {
    console.error('Error fetching staff salaries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff salaries' });
  }
});

// Get salary summary
router.get('/summary/overview', authenticateToken, async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT staff_id) as total_staff,
        SUM(basic_salary) as total_basic_salary,
        SUM(allowances) as total_allowances,
        SUM(deductions) as total_deductions,
        SUM(net_salary) as total_net_salary
      FROM salaries
      WHERE payment_status = 'active'
    `);
    
    const [byDepartment] = await pool.execute(`
      SELECT 
        st.department,
        COUNT(*) as staff_count,
        SUM(s.net_salary) as total_payroll
      FROM salaries s
      JOIN staff st ON s.staff_id = st.id
      WHERE s.payment_status = 'active'
      GROUP BY st.department
    `);
    
    const [pendingPayments] = await pool.execute(`
      SELECT COUNT(*) as pending_count,
             SUM(amount_due) as pending_amount
      FROM salary_payments
      WHERE payment_status = 'pending'
    `);
    
    res.json({ 
      success: true, 
      data: { 
        summary: summary[0], 
        byDepartment,
        pending: pendingPayments[0]
      } 
    });
  } catch (error) {
    console.error('Error fetching salary summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch salary summary' });
  }
});

// Create salary
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { staff_id, basic_salary, allowances, deductions, net_salary, currency, payment_frequency, effective_date, payment_method, bank_account, notes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO salaries 
      (staff_id, basic_salary, allowances, deductions, net_salary, currency, payment_frequency, effective_date, payment_method, bank_account, notes, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [staff_id, basic_salary, allowances || 0, deductions || 0, net_salary, currency || 'RWF', payment_frequency || 'monthly', effective_date, payment_method, bank_account, notes]);
    
    res.json({ success: true, message: 'Salary created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating salary:', error);
    res.status(500).json({ success: false, message: 'Failed to create salary' });
  }
});

// Update salary
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { basic_salary, allowances, deductions, net_salary, currency, payment_frequency, effective_date, payment_method, bank_account, notes, payment_status } = req.body;
    
    await pool.execute(`
      UPDATE salaries 
      SET basic_salary = ?, allowances = ?, deductions = ?, net_salary = ?, 
          currency = ?, payment_frequency = ?, effective_date = ?, 
          payment_method = ?, bank_account = ?, notes = ?, payment_status = ?
      WHERE id = ?
    `, [basic_salary, allowances, deductions, net_salary, currency, payment_frequency, effective_date, payment_method, bank_account, notes, payment_status, req.params.id]);
    
    res.json({ success: true, message: 'Salary updated successfully' });
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ success: false, message: 'Failed to update salary' });
  }
});

// Process salary payment
router.post('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { amount_paid, payment_date, payment_method, reference_number, notes } = req.body;
    
    const [salary] = await pool.execute('SELECT * FROM salaries WHERE id = ?', [req.params.id]);
    
    if (salary.length === 0) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO salary_payments 
      (salary_id, staff_id, amount_due, amount_paid, payment_date, payment_method, reference_number, payment_status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    `, [req.params.id, salary[0].staff_id, salary[0].net_salary, amount_paid, payment_date || new Date(), payment_method, reference_number, notes]);
    
    res.json({ success: true, message: 'Payment recorded successfully', id: result.insertId });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
});

// Delete salary
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM salary_payments WHERE salary_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM salaries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Salary record deleted successfully' });
  } catch (error) {
    console.error('Error deleting salary:', error);
    res.status(500).json({ success: false, message: 'Failed to delete salary' });
  }
});

module.exports = router;

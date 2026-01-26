const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, student_id, start_date, end_date } = req.query;
    let query = `
      SELECT i.*, 
             s.first_name, s.last_name, s.student_code,
             cl.name as class_name
      FROM invoices i
      LEFT JOIN students s ON i.student_id = s.id
      LEFT JOIN classes cl ON s.class_id = cl.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    if (student_id) {
      query += ' AND i.student_id = ?';
      params.push(student_id);
    }
    
    if (start_date) {
      query += ' AND i.invoice_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND i.invoice_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY i.invoice_date DESC';
    
    const [invoices] = await pool.execute(query, params);
    
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [invoice] = await pool.execute(`
      SELECT i.*, 
             s.first_name, s.last_name, s.student_code, s.email,
             cl.name as class_name,
             p.first_name as parent_first_name, p.last_name as parent_last_name, p.phone as parent_phone
      FROM invoices i
      LEFT JOIN students s ON i.student_id = s.id
      LEFT JOIN classes cl ON s.class_id = cl.id
      LEFT JOIN parent_student ps ON s.id = ps.student_id
      LEFT JOIN parents p ON ps.parent_id = p.id
      WHERE i.id = ?
      LIMIT 1
    `, [req.params.id]);
    
    if (invoice.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Get payments for this invoice
    const [payments] = await pool.execute(`
      SELECT * FROM payments 
      WHERE invoice_id = ?
      ORDER BY payment_date DESC
    `, [req.params.id]);
    
    res.json({ 
      success: true, 
      data: { 
        ...invoice[0], 
        payments 
      } 
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
  }
});

// Get student invoices
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const [invoices] = await pool.execute(`
      SELECT i.*,
             (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id) as total_paid
      FROM invoices i
      WHERE i.student_id = ?
      ORDER BY i.invoice_date DESC
    `, [req.params.studentId]);
    
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching student invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student invoices' });
  }
});

// Get invoice summary
router.get('/summary/overview', authenticateToken, async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_billed,
        SUM(amount_paid) as total_paid,
        SUM(balance) as total_outstanding,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
      FROM invoices
    `);
    
    const [monthly] = await pool.execute(`
      SELECT 
        DATE_FORMAT(invoice_date, '%Y-%m') as month,
        COUNT(*) as invoice_count,
        SUM(total_amount) as total_amount,
        SUM(amount_paid) as total_paid
      FROM invoices
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    
    res.json({ 
      success: true, 
      data: { 
        summary: summary[0], 
        monthly 
      } 
    });
  } catch (error) {
    console.error('Error fetching invoice summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice summary' });
  }
});

// Create invoice
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, invoice_number, invoice_date, due_date, description, items, subtotal, tax_amount, discount_amount, total_amount, notes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO invoices 
      (student_id, invoice_number, invoice_date, due_date, description, items, subtotal, tax_amount, discount_amount, total_amount, amount_paid, balance, status, notes, generated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'pending', ?, ?)
    `, [student_id, invoice_number, invoice_date, due_date, description, JSON.stringify(items), subtotal, tax_amount || 0, discount_amount || 0, total_amount, total_amount, notes, req.user.id]);
    
    res.json({ success: true, message: 'Invoice created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { invoice_date, due_date, description, items, subtotal, tax_amount, discount_amount, total_amount, notes, status } = req.body;
    
    const balance = total_amount - (req.body.amount_paid || 0);
    
    await pool.execute(`
      UPDATE invoices 
      SET invoice_date = ?, due_date = ?, description = ?, items = ?, 
          subtotal = ?, tax_amount = ?, discount_amount = ?, total_amount = ?, 
          balance = ?, notes = ?, status = ?
      WHERE id = ?
    `, [invoice_date, due_date, description, JSON.stringify(items), subtotal, tax_amount, discount_amount, total_amount, balance, notes, status, req.params.id]);
    
    res.json({ success: true, message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to update invoice' });
  }
});

// Record payment
router.post('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const { amount, payment_method, reference_number, payment_date, notes } = req.body;
    
    const [invoice] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    
    if (invoice.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Record payment
    const [paymentResult] = await pool.execute(`
      INSERT INTO payments 
      (invoice_id, student_id, amount, payment_method, reference_number, payment_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)
    `, [req.params.id, invoice[0].student_id, amount, payment_method, reference_number, payment_date || new Date(), notes]);
    
    // Update invoice
    const newAmountPaid = parseFloat(invoice[0].amount_paid) + parseFloat(amount);
    const newBalance = parseFloat(invoice[0].total_amount) - newAmountPaid;
    let newStatus = 'partial';
    
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (newBalance === parseFloat(invoice[0].total_amount)) {
      newStatus = 'pending';
    }
    
    await pool.execute(`
      UPDATE invoices 
      SET amount_paid = ?, balance = ?, status = ?
      WHERE id = ?
    `, [newAmountPaid, newBalance, newStatus, req.params.id]);
    
    res.json({ success: true, message: 'Payment recorded successfully', paymentId: paymentResult.insertId });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
});

// Mark as paid
router.patch('/:id/mark-paid', authenticateToken, async (req, res) => {
  try {
    const [invoice] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    
    if (invoice.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    await pool.execute(`
      UPDATE invoices 
      SET amount_paid = total_amount, balance = 0, status = 'paid'
      WHERE id = ?
    `, [req.params.id]);
    
    res.json({ success: true, message: 'Invoice marked as paid successfully' });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ success: false, message: 'Failed to mark invoice as paid' });
  }
});

// Cancel invoice
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE invoices SET status = "cancelled" WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Invoice cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel invoice' });
  }
});

// Delete invoice
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM payments WHERE invoice_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to delete invoice' });
  }
});

module.exports = router;

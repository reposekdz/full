const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all payments
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const { student_id, payment_type, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, 
        u.first_name, u.last_name, u.email,
        r.first_name as received_by_name, r.last_name as received_by_lastname
      FROM payments p
      LEFT JOIN users u ON p.student_id = u.id
      LEFT JOIN users r ON p.received_by = r.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND p.student_id = ?';
      params.push(student_id);
    }
    if (payment_type) {
      query += ' AND p.payment_type = ?';
      params.push(payment_type);
    }
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.payment_date DESC, p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [payments] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM payments p WHERE 1=1';
    const countParams = [];
    if (student_id) {
      countQuery += ' AND p.student_id = ?';
      countParams.push(student_id);
    }
    if (payment_type) {
      countQuery += ' AND p.payment_type = ?';
      countParams.push(payment_type);
    }
    if (status) {
      countQuery += ' AND p.status = ?';
      countParams.push(status);
    }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

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
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// Get payment by ID
router.get('/payments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await pool.execute(`
      SELECT p.*, 
        u.first_name, u.last_name, u.email, u.phone,
        r.first_name as received_by_name, r.last_name as received_by_lastname
      FROM payments p
      LEFT JOIN users u ON p.student_id = u.id
      LEFT JOIN users r ON p.received_by = r.id
      WHERE p.id = ?
    `, [id]);

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: payments[0]
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
});

// Create new payment
router.post('/payments', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'accountant', 'headmaster')
], async (req, res) => {
  try {
    const {
      student_id,
      payment_type,
      amount,
      payment_method,
      payment_date,
      academic_year,
      term,
      reference_number,
      description,
      notes
    } = req.body;

    if (!student_id || !amount || !payment_date) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, amount, and payment date are required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO payments (
        student_id, payment_type, amount, payment_method, payment_date,
        academic_year, term, reference_number, description, status, received_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)
    `, [
      student_id,
      payment_type || 'tuition',
      amount,
      payment_method || 'cash',
      payment_date,
      academic_year || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      term || '1',
      reference_number || `PAY${Date.now()}`,
      description,
      req.user.id,
      notes
    ]);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment: {
        id: result.insertId,
        student_id,
        amount,
        payment_date,
        reference_number
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Reference number already exists' : 'Failed to record payment'
    });
  }
});

// Update payment
router.put('/payments/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'accountant', 'headmaster')
], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      payment_type,
      amount,
      payment_method,
      payment_date,
      academic_year,
      term,
      description,
      status,
      notes
    } = req.body;

    const [result] = await pool.execute(`
      UPDATE payments SET
        payment_type = COALESCE(?, payment_type),
        amount = COALESCE(?, amount),
        payment_method = COALESCE(?, payment_method),
        payment_date = COALESCE(?, payment_date),
        academic_year = COALESCE(?, academic_year),
        term = COALESCE(?, term),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [payment_type, amount, payment_method, payment_date, academic_year, term, description, status, notes, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment'
    });
  }
});

// Delete payment
router.delete('/payments/:id', [
  authenticateToken,
  requireRole('admin', 'super_admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM payments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment'
    });
  }
});

// Get student fee summary
router.get('/students/:id/fee-summary', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [summary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_paid,
        COUNT(*) as payment_count,
        MAX(payment_date) as last_payment_date
      FROM payments
      WHERE student_id = ? AND status = 'completed'
    `, [id]);

    const [payments] = await pool.execute(`
      SELECT payment_type, SUM(amount) as amount
      FROM payments
      WHERE student_id = ? AND status = 'completed'
      GROUP BY payment_type
    `, [id]);

    res.json({
      success: true,
      summary: summary[0],
      breakdown: payments
    });
  } catch (error) {
    console.error('Get fee summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee summary'
    });
  }
});

// Get payment statistics
router.get('/stats', [
  authenticateToken,
  requireRole('admin', 'super_admin', 'accountant', 'headmaster')
], async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];
    if (start_date && end_date) {
      dateFilter = 'WHERE payment_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as average_amount,
        payment_type,
        payment_method
      FROM payments
      ${dateFilter}
      GROUP BY payment_type, payment_method
    `, params);

    const [[totals]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(amount), 0) as total_revenue
      FROM payments
      ${dateFilter}
    `, params);

    res.json({
      success: true,
      stats,
      totals
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
});

module.exports = router;

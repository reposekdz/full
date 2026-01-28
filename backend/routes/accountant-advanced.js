const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get Students with Payment Status
router.get('/students-payment-status', async (req, res) => {
  try {
    const { class_id, academic_year_id, term } = req.query;
    
    let query = `
      SELECT u.id, u.student_id, u.serial_code, CONCAT(u.first_name, ' ', u.last_name) as name,
        f.total_amount, f.paid_amount, f.remaining_amount, f.status, f.transaction_code, f.updated_at
      FROM users u
      LEFT JOIN fee_payments f ON u.id = f.student_id AND f.academic_year_id = ? AND f.term = ?
      JOIN enrollments e ON u.id = e.student_id
      WHERE e.class_id = ?
      ORDER BY u.last_name ASC
    `;
    
    const [rows] = await pool.query(query, [academic_year_id, term, class_id]);
    res.json({ success: true, students: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update/Mark Payment
router.post('/mark-payment', async (req, res) => {
  try {
    const { student_id, academic_year_id, term, total_amount, paid_amount, transaction_code } = req.body;
    
    const remaining_amount = total_amount - paid_amount;
    let status = 'unpaid';
    if (remaining_amount <= 0) status = 'paid';
    else if (paid_amount > 0) status = 'partially_paid';

    // Check if record exists
    const [existing] = await pool.query('SELECT id FROM fee_payments WHERE student_id = ? AND academic_year_id = ? AND term = ?', [student_id, academic_year_id, term]);

    if (existing.length > 0) {
      await pool.query(`
        UPDATE fee_payments SET 
          total_amount = ?, paid_amount = ?, remaining_amount = ?, status = ?, transaction_code = ?
        WHERE id = ?
      `, [total_amount, paid_amount, remaining_amount, status, transaction_code, existing[0].id]);
    } else {
      await pool.query(`
        INSERT INTO fee_payments (student_id, academic_year_id, term, total_amount, paid_amount, remaining_amount, status, transaction_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [student_id, academic_year_id, term, total_amount, paid_amount, remaining_amount, status, transaction_code]);
    }

    res.json({ success: true, message: 'Ibwishyu byashyizweho neza' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Payment Analytics
router.get('/analytics', async (req, res) => {
  try {
    const { academic_year_id, term } = req.query;

    const [[stats]] = await pool.query(`
      SELECT 
        SUM(total_amount) as expected_total,
        SUM(paid_amount) as collected_total,
        SUM(remaining_amount) as outstanding_total,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as fully_paid_count,
        COUNT(CASE WHEN status = 'partially_paid' THEN 1 END) as partially_paid_count,
        COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid_count
      FROM fee_payments
      WHERE academic_year_id = ? AND term = ?
    `, [academic_year_id, term]);

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get payment analytics
router.get('/analytics', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [topPayers] = await db.query(`
      SELECT s.id, s.first_name, s.last_name, s.serial_code, s.trade_code,
             COALESCE(SUM(p.amount), 0) as total_paid,
             COALESCE(sf.total_fees, 0) as total_fees,
             COUNT(p.id) as payment_count,
             MAX(p.payment_date) as last_payment_date
      FROM students s
      LEFT JOIN payments p ON s.id = p.student_id
      LEFT JOIN student_fees sf ON s.id = sf.student_id
      GROUP BY s.id
      HAVING total_paid > 0
      ORDER BY total_paid DESC
      LIMIT 10
    `);

    const [paymentsByTrade] = await db.query(`
      SELECT s.trade_code, 
             COUNT(DISTINCT s.id) as total_students,
             SUM(COALESCE(sf.total_fees, 0)) as total_expected,
             SUM(COALESCE(p.amount, 0)) as total_collected,
             SUM(COALESCE(sf.total_fees, 0)) - SUM(COALESCE(p.amount, 0)) as total_remaining
      FROM students s
      LEFT JOIN student_fees sf ON s.id = sf.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      GROUP BY s.trade_code
    `);

    const [paymentsByMonth] = await db.query(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m') as month,
             COUNT(*) as payment_count,
             SUM(amount) as total_amount
      FROM payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month DESC
    `);

    const [paymentMethods] = await db.query(`
      SELECT payment_method, COUNT(*) as count, SUM(amount) as total
      FROM payments
      GROUP BY payment_method
    `);

    const [defaulters] = await db.query(`
      SELECT s.id, s.first_name, s.last_name, s.serial_code, s.trade_code,
             COALESCE(sf.total_fees, 0) - COALESCE(SUM(p.amount), 0) as amount_due,
             DATEDIFF(NOW(), MAX(p.payment_date)) as days_since_payment
      FROM students s
      LEFT JOIN student_fees sf ON s.id = sf.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      GROUP BY s.id
      HAVING amount_due > 0
      ORDER BY amount_due DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      analytics: {
        topPayers,
        paymentsByTrade,
        paymentsByMonth,
        paymentMethods,
        defaulters
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Update student fees
router.post('/update-fees', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { student_id, total_fees, academic_year } = req.body;
  
  try {
    await db.query(`
      INSERT INTO student_fees (student_id, total_fees, academic_year)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE total_fees = ?
    `, [student_id, total_fees, academic_year || '2024-2025', total_fees]);
    
    res.json({ success: true, message: 'Fees updated successfully' });
  } catch (error) {
    console.error('Error updating fees:', error);
    res.status(500).json({ error: 'Failed to update fees' });
  }
});

// Bulk update fees
router.post('/bulk-update-fees', authenticateToken, authorizeRoles(['accountant', 'admin', 'headmaster']), async (req, res) => {
  const { trade_code, level_number, total_fees, academic_year } = req.body;
  
  try {
    const [students] = await db.query(
      'SELECT id FROM students WHERE trade_code = ? AND level_number = ?',
      [trade_code, level_number]
    );
    
    for (const student of students) {
      await db.query(`
        INSERT INTO student_fees (student_id, total_fees, academic_year)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE total_fees = ?
      `, [student.id, total_fees, academic_year || '2024-2025', total_fees]);
    }
    
    res.json({ success: true, message: `Updated fees for ${students.length} students` });
  } catch (error) {
    console.error('Error bulk updating fees:', error);
    res.status(500).json({ error: 'Failed to bulk update fees' });
  }
});

module.exports = router;

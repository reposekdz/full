const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const checkPaymentPermission = async (req, res, next) => {
  const allowedRoles = ['accountant', 'teacher', 'admin', 'headmaster', 'director_study', 'parent'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

// GET /students - Get all students with payment info from global_student_sheets
router.get('/students', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.student_code,
        s.trade_code as trade,
        s.level_number as level,
        COALESCE(f.total_fees, 0) as total_fees,
        COALESCE(f.paid_amount, 0) as paid_amount,
        COALESCE(f.balance, 0) as balance,
        COALESCE(f.payment_method, 'not_set') as payment_method,
        f.last_payment_date,
        f.term,
        f.academic_year,
        COALESCE(f.status, 'pending') as status,
        p.phone as parent_phone,
        p.email as parent_email
      FROM global_student_sheets s
      LEFT JOIN student_fees f ON s.student_id = f.student_id AND f.term = 'Term 1' AND f.academic_year = '2024'
      LEFT JOIN parent_child_links pcl ON s.student_id = pcl.student_id
      LEFT JOIN users p ON pcl.parent_id = p.id
      WHERE s.status = 'active'
      ORDER BY s.trade_code, s.level_number, s.last_name, s.first_name
    `);

    res.json({ success: true, payments: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /record - Record a payment (UPDATE existing, never create new)
router.post('/record', authenticateToken, checkPaymentPermission, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, amount, payment_method, reference, term } = req.body;

    // Insert payment transaction
    await connection.execute(`
      INSERT INTO payment_transactions (
        student_id, amount, payment_method, reference, term, recorded_by, transaction_date
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [student_id, amount, payment_method, reference, term || 'Term 1', req.user.id]);

    // UPDATE existing student fees (never create new)
    const [updateResult] = await connection.execute(`
      UPDATE student_fees 
      SET paid_amount = paid_amount + ?,
          balance = total_fees - (paid_amount + ?),
          last_payment_date = NOW(),
          payment_method = ?,
          status = CASE 
            WHEN (paid_amount + ?) >= total_fees THEN 'paid'
            WHEN (paid_amount + ?) > 0 THEN 'partial'
            ELSE 'pending'
          END,
          updated_at = NOW()
      WHERE student_id = ? AND term = ? AND academic_year = '2024'
    `, [amount, amount, payment_method, amount, amount, student_id, term || 'Term 1']);

    // Also update global_student_sheets payment info
    await connection.execute(`
      UPDATE global_student_sheets
      SET paid_amount = COALESCE(paid_amount, 0) + ?,
          balance = COALESCE(total_fees, 0) - (COALESCE(paid_amount, 0) + ?),
          payment_status = CASE 
            WHEN (COALESCE(paid_amount, 0) + ?) >= COALESCE(total_fees, 0) THEN 'paid'
            WHEN (COALESCE(paid_amount, 0) + ?) > 0 THEN 'partial'
            ELSE 'unpaid'
          END
      WHERE student_id = ?
    `, [amount, amount, amount, amount, student_id]);

    // Get student and parent info for SMS
    const [student] = await connection.execute(`
      SELECT s.first_name, s.last_name, p.phone
      FROM global_student_sheets s
      LEFT JOIN parent_child_links pcl ON s.student_id = pcl.student_id
      LEFT JOIN users p ON pcl.parent_id = p.id
      WHERE s.student_id = ?
    `, [student_id]);

    if (student[0]?.phone) {
      const message = `Mwiriwe! Kwishyura kw'umwana wanyu ${student[0].first_name} ${student[0].last_name} kwakirijwe. Amafaranga: ${amount} RWF. Uburyo: ${payment_method}. Murakoze - Garden TVET`;
      
      await connection.execute(`
        INSERT INTO sms_queue (phone_number, message, message_type, priority)
        VALUES (?, ?, 'payment_confirmation', 'high')
      `, [student[0].phone, message]);
    }

    await connection.commit();
    res.json({ success: true, message: 'Payment recorded successfully', affectedRows: updateResult.affectedRows });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// POST /send-reminder - Send payment reminder SMS
router.post('/send-reminder', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const { student_id } = req.body;

    const [student] = await pool.execute(`
      SELECT 
        s.first_name, s.last_name,
        COALESCE(f.balance, 0) as balance,
        f.due_date,
        p.phone
      FROM global_student_sheets s
      LEFT JOIN student_fees f ON s.student_id = f.student_id
      LEFT JOIN parent_child_links pcl ON s.student_id = pcl.student_id
      LEFT JOIN users p ON pcl.parent_id = p.id
      WHERE s.student_id = ?
    `, [student_id]);

    if (!student[0]?.phone) {
      return res.status(404).json({ success: false, message: 'Parent phone not found' });
    }

    const message = `Mwiriwe! Ikwibutso: Umwana wanyu ${student[0].first_name} ${student[0].last_name} afite ideni ry'ishuri: ${student[0].balance.toLocaleString()} RWF. Murakoze - Garden TVET`;

    await pool.execute(`
      INSERT INTO sms_queue (phone_number, message, message_type, priority)
      VALUES (?, ?, 'payment_reminder', 'high')
    `, [student[0].phone, message]);

    await pool.execute(`
      INSERT INTO payment_reminders_log (student_id, parent_phone, message, sent_by, reminder_type)
      VALUES (?, ?, ?, ?, 'manual')
    `, [student_id, student[0].phone, message, req.user.id]);

    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /bulk-reminder - Send bulk payment reminders
router.post('/bulk-reminder', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const { student_ids } = req.body;

    const [students] = await pool.execute(`
      SELECT 
        s.student_id, s.first_name, s.last_name,
        COALESCE(f.balance, 0) as balance,
        p.phone
      FROM global_student_sheets s
      LEFT JOIN student_fees f ON s.student_id = f.student_id
      LEFT JOIN parent_child_links pcl ON s.student_id = pcl.student_id
      LEFT JOIN users p ON pcl.parent_id = p.id
      WHERE s.student_id IN (?) AND p.phone IS NOT NULL
    `, [student_ids]);

    for (const student of students) {
      const message = `Mwiriwe! Ikwibutso: Umwana wanyu ${student.first_name} ${student.last_name} afite ideni ry'ishuri: ${student.balance.toLocaleString()} RWF. Murakoze - Garden TVET`;

      await pool.execute(`
        INSERT INTO sms_queue (phone_number, message, message_type, priority)
        VALUES (?, ?, 'payment_reminder', 'normal')
      `, [student.phone, message]);

      await pool.execute(`
        INSERT INTO payment_reminders_log (student_id, parent_phone, message, sent_by, reminder_type)
        VALUES (?, ?, ?, ?, 'bulk')
      `, [student.student_id, student.phone, message, req.user.id]);
    }

    res.json({ success: true, message: `Reminders sent to ${students.length} parents` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /stats - Get payment statistics
router.get('/stats', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT s.student_id) as total_students,
        SUM(COALESCE(f.total_fees, 0)) as total_expected,
        SUM(COALESCE(f.paid_amount, 0)) as total_collected,
        SUM(COALESCE(f.balance, 0)) as total_balance,
        SUM(CASE WHEN f.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN f.status = 'overdue' OR (f.due_date < CURDATE() AND f.balance > 0) THEN 1 ELSE 0 END) as overdue_count
      FROM global_student_sheets s
      LEFT JOIN student_fees f ON s.student_id = f.student_id
      WHERE s.status = 'active'
    `);

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /history/:studentId - Get payment history
router.get('/history/:studentId', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const [history] = await pool.execute(`
      SELECT 
        id, amount, payment_method, reference, transaction_date as date, term, status
      FROM payment_transactions
      WHERE student_id = ?
      ORDER BY transaction_date DESC
    `, [req.params.studentId]);

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /analytics - Advanced analytics dashboard
router.get('/analytics', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const [collectionRate] = await pool.execute(`
      SELECT ROUND((SUM(paid_amount) / NULLIF(SUM(total_fees), 0)) * 100, 2) as rate
      FROM student_fees WHERE academic_year = '2024'
    `);

    const [monthlyTrend] = await pool.execute(`
      SELECT MONTH(transaction_date) as month, SUM(amount) as total, COUNT(*) as count
      FROM payment_transactions WHERE YEAR(transaction_date) = YEAR(CURDATE())
      GROUP BY MONTH(transaction_date) ORDER BY month
    `);

    const [paymentMethods] = await pool.execute(`
      SELECT payment_method, SUM(amount) as total, COUNT(*) as count
      FROM payment_transactions GROUP BY payment_method
    `);

    const [topPayers] = await pool.execute(`
      SELECT s.student_id, s.first_name, s.last_name, s.student_code, f.paid_amount
      FROM global_student_sheets s
      JOIN student_fees f ON s.student_id = f.student_id
      ORDER BY f.paid_amount DESC LIMIT 10
    `);

    const [recentPayments] = await pool.execute(`
      SELECT pt.*, s.first_name, s.last_name, s.student_code
      FROM payment_transactions pt
      JOIN global_student_sheets s ON pt.student_id = s.student_id
      ORDER BY pt.transaction_date DESC LIMIT 20
    `);

    res.json({
      success: true,
      analytics: {
        collection_rate: collectionRate[0]?.rate || 0,
        monthly_trend: monthlyTrend,
        payment_methods: paymentMethods,
        top_payers: topPayers,
        recent_payments: recentPayments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /installment - Create installment plan
router.post('/installment', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const { student_id, total_amount, installments, start_date } = req.body;
    const installment_amount = total_amount / installments;

    for (let i = 0; i < installments; i++) {
      const due_date = new Date(start_date);
      due_date.setMonth(due_date.getMonth() + i);

      await pool.execute(`
        INSERT INTO payment_installments (student_id, amount, due_date, installment_number)
        VALUES (?, ?, ?, ?)
      `, [student_id, installment_amount, due_date, i + 1]);
    }

    res.json({ success: true, message: 'Installment plan created' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /waive - Waive fees
router.post('/waive', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const { student_id, amount, reason } = req.body;

    await pool.execute(`
      UPDATE student_fees SET total_fees = total_fees - ?, balance = balance - ?
      WHERE student_id = ? AND term = 'Term 1' AND academic_year = '2024'
    `, [amount, amount, student_id]);

    await pool.execute(`
      INSERT INTO fee_waivers (student_id, amount, reason, waived_by)
      VALUES (?, ?, ?, ?)
    `, [student_id, amount, reason, req.user.id]);

    res.json({ success: true, message: 'Fee waived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /receipt/:transactionId - Generate receipt
router.get('/receipt/:transactionId', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const [transaction] = await pool.execute(`
      SELECT pt.*, s.first_name, s.last_name, s.student_code, s.trade_code, s.level_number
      FROM payment_transactions pt
      JOIN global_student_sheets s ON pt.student_id = s.student_id
      WHERE pt.id = ?
    `, [req.params.transactionId]);

    if (transaction.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const receipt_number = `RCP-${Date.now()}-${transaction[0].id}`;
    
    await pool.execute(`
      INSERT INTO payment_receipts (transaction_id, receipt_number)
      VALUES (?, ?)
    `, [req.params.transactionId, receipt_number]);

    res.json({ success: true, receipt: { ...transaction[0], receipt_number } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /export - Export to Excel/CSV
router.get('/export', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const [data] = await pool.execute(`
      SELECT 
        s.student_code, s.first_name, s.last_name, s.trade_code, s.level_number,
        f.total_fees, f.paid_amount, f.balance, f.status, f.last_payment_date
      FROM global_student_sheets s
      LEFT JOIN student_fees f ON s.student_id = f.student_id
      WHERE s.status = 'active'
      ORDER BY s.trade_code, s.level_number, s.last_name
    `);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /dashboard - Comprehensive dashboard
router.get('/dashboard', authenticateToken, checkPaymentPermission, async (req, res) => {
  try {
    const [overview] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT s.student_id) as total_students,
        SUM(COALESCE(f.total_fees, 0)) as total_expected,
        SUM(COALESCE(f.paid_amount, 0)) as total_collected,
        SUM(COALESCE(f.balance, 0)) as total_balance,
        SUM(CASE WHEN f.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN f.status = 'overdue' OR (f.due_date < CURDATE() AND f.balance > 0) THEN 1 ELSE 0 END) as overdue_count
      FROM global_student_sheets s
      LEFT JOIN student_fees f ON s.student_id = f.student_id
      WHERE s.status = 'active'
    `);

    const [todayPayments] = await pool.execute(`
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM payment_transactions WHERE DATE(transaction_date) = CURDATE()
    `);

    const [weekPayments] = await pool.execute(`
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM payment_transactions WHERE YEARWEEK(transaction_date) = YEARWEEK(CURDATE())
    `);

    const [monthPayments] = await pool.execute(`
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM payment_transactions
      WHERE MONTH(transaction_date) = MONTH(CURDATE()) AND YEAR(transaction_date) = YEAR(CURDATE())
    `);

    res.json({
      success: true,
      dashboard: {
        overview: overview[0],
        today: todayPayments[0],
        week: weekPayments[0],
        month: monthPayments[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

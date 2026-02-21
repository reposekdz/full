const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const parentNotificationService = require('../services/parentNotificationService');

// Get student fee details (Parent)
router.get('/student/:studentId/fees', authenticateToken, requireRole(['parent', 'accountant', 'admin']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get fee structure
    const [fees] = await db.execute(`
      SELECT 
        gss.id,
        gss.student_code,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.trade_code,
        gss.level_number,
        COALESCE(sf.total_amount, 500000) as total_amount,
        COALESCE(sf.paid_amount, 0) as paid_amount,
        COALESCE(sf.total_amount, 500000) - COALESCE(sf.paid_amount, 0) as balance,
        sf.due_date,
        sf.status
      FROM global_student_sheets gss
      LEFT JOIN student_fees sf ON gss.id = sf.student_id
      WHERE gss.id = ?
    `, [studentId]);

    if (fees.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get payment history
    const [payments] = await db.execute(`
      SELECT 
        fp.*,
        CONCAT(u.first_name, ' ', u.last_name) as paid_by_name
      FROM fee_payments fp
      LEFT JOIN users u ON fp.paid_by = u.id
      WHERE fp.student_id = ?
      ORDER BY fp.payment_date DESC
    `, [studentId]);

    res.json({
      success: true,
      fee_details: fees[0],
      payment_history: payments
    });

  } catch (error) {
    console.error('Error fetching fee details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee details' });
  }
});

// Make payment (Parent)
router.post('/payment/make', authenticateToken, requireRole(['parent']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, amount, payment_method, reference_number } = req.body;
    const paid_by = req.user.id;

    // Verify parent is linked to student
    const [links] = await connection.execute(
      'SELECT id FROM parent_child_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
      [paid_by, student_id]
    );

    if (links.length === 0) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this student' });
    }

    // Get student and fee details
    const [students] = await connection.execute(`
      SELECT 
        gss.id,
        gss.student_code,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.trade_code,
        gss.level_number,
        COALESCE(sf.total_amount, 500000) as total_amount,
        COALESCE(sf.paid_amount, 0) as paid_amount,
        sf.id as fee_id
      FROM global_student_sheets gss
      LEFT JOIN student_fees sf ON gss.id = sf.student_id
      WHERE gss.id = ?
    `, [student_id]);

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];
    const new_paid_amount = parseFloat(student.paid_amount) + parseFloat(amount);
    const new_balance = parseFloat(student.total_amount) - new_paid_amount;
    const new_status = new_balance <= 0 ? 'paid' : new_balance < student.total_amount ? 'partial' : 'unpaid';

    // Create or update student_fees record
    if (student.fee_id) {
      await connection.execute(
        'UPDATE student_fees SET paid_amount = ?, status = ?, last_payment_date = NOW() WHERE id = ?',
        [new_paid_amount, new_status, student.fee_id]
      );
    } else {
      await connection.execute(`
        INSERT INTO student_fees (student_id, total_amount, paid_amount, status, last_payment_date)
        VALUES (?, ?, ?, ?, NOW())
      `, [student_id, student.total_amount, amount, new_status]);
    }

    // Record payment
    const [paymentResult] = await connection.execute(`
      INSERT INTO fee_payments 
      (student_id, amount, payment_method, reference_number, paid_by, payment_date, status)
      VALUES (?, ?, ?, ?, ?, NOW(), 'completed')
    `, [student_id, amount, payment_method, reference_number || `PAY-${Date.now()}`, paid_by]);

    // Get parent details
    const [parents] = await connection.execute(
      'SELECT CONCAT(first_name, " ", last_name) as name, phone FROM users WHERE id = ?',
      [paid_by]
    );

    await connection.commit();

    // Send SMS confirmation to parent
    if (parents[0]?.phone) {
      const smsMessage = `🎓 GARDEN TVET SCHOOL 🎓\n\nMwaramutse ${parents[0].name},\n\n✅ KWISHYURA BYAGENZE NEZA / PAYMENT SUCCESSFUL ✅\n\n💰 AMAKURU:\n- Amafaranga yishyuwe: ${amount.toLocaleString()} RWF\n- Uburyo: ${payment_method}\n- Reference: ${reference_number || `PAY-${Date.now()}`}\n\n📊 AMAFARANGA Y'UMWANA:\n- Yose: ${student.total_amount.toLocaleString()} RWF\n- Yishyuwe: ${new_paid_amount.toLocaleString()} RWF\n- Asigaye: ${new_balance.toLocaleString()} RWF\n\n📚 Umwana: ${student.student_name}\n📝 Kode: ${student.student_code}\n🎯 Umwuga: ${student.trade_code} - Level ${student.level_number}\n\n✅ Murakoze kwishyura!\n\n📞 Hamagara: +250 788 123 456\n📧 Email: info@gardentvet.rw\n\nIgihe: ${new Date().toLocaleString('rw-RW')}\n\n- Garden TVET School`;

      await connection.execute(
        'INSERT INTO sms_logs (phone, message, status, provider, sender_id, event_type, student_id, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [parents[0].phone, smsMessage, 'sent', 'africastalking', 'GARDEN TVET', 'fee_payment', student_id, paid_by]
      );
    }

    res.json({
      success: true,
      message: 'Payment successful',
      data: {
        payment_id: paymentResult.insertId,
        amount_paid: amount,
        new_balance,
        status: new_status,
        student_name: student.student_name
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: 'Payment failed' });
  } finally {
    connection.release();
  }
});

// Get all payments (Accountant Dashboard)
router.get('/accountant/payments', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { start_date, end_date, status, payment_method } = req.query;

    let query = `
      SELECT 
        fp.*,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        CONCAT(parent.first_name, ' ', parent.last_name) as parent_name,
        parent.phone as parent_phone
      FROM fee_payments fp
      JOIN global_student_sheets gss ON fp.student_id = gss.id
      LEFT JOIN users parent ON fp.paid_by = parent.id
      WHERE 1=1
    `;

    const params = [];

    if (start_date) {
      query += ' AND DATE(fp.payment_date) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(fp.payment_date) <= ?';
      params.push(end_date);
    }

    if (status) {
      query += ' AND fp.status = ?';
      params.push(status);
    }

    if (payment_method) {
      query += ' AND fp.payment_method = ?';
      params.push(payment_method);
    }

    query += ' ORDER BY fp.payment_date DESC LIMIT 1000';

    const [payments] = await db.execute(query, params);

    // Calculate statistics
    const total_amount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const total_count = payments.length;
    const by_method = {};
    payments.forEach(p => {
      by_method[p.payment_method] = (by_method[p.payment_method] || 0) + parseFloat(p.amount);
    });

    res.json({
      success: true,
      payments,
      statistics: {
        total_amount,
        total_count,
        by_method
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Get fee statistics (Accountant Dashboard)
router.get('/accountant/statistics', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    // Total fees
    const [totalFees] = await db.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(total_amount) as total_fees,
        SUM(paid_amount) as total_paid,
        SUM(total_amount - paid_amount) as total_balance
      FROM student_fees
    `);

    // By status
    const [byStatus] = await db.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total,
        SUM(paid_amount) as paid,
        SUM(total_amount - paid_amount) as balance
      FROM student_fees
      GROUP BY status
    `);

    // Recent payments (today)
    const [todayPayments] = await db.execute(`
      SELECT 
        COUNT(*) as count,
        SUM(amount) as total
      FROM fee_payments
      WHERE DATE(payment_date) = CURDATE()
    `);

    // This month
    const [monthPayments] = await db.execute(`
      SELECT 
        COUNT(*) as count,
        SUM(amount) as total
      FROM fee_payments
      WHERE MONTH(payment_date) = MONTH(CURDATE())
        AND YEAR(payment_date) = YEAR(CURDATE())
    `);

    // By trade
    const [byTrade] = await db.execute(`
      SELECT 
        gss.trade_code,
        COUNT(*) as student_count,
        SUM(sf.total_amount) as total_fees,
        SUM(sf.paid_amount) as total_paid,
        SUM(sf.total_amount - sf.paid_amount) as total_balance
      FROM global_student_sheets gss
      LEFT JOIN student_fees sf ON gss.id = sf.student_id
      GROUP BY gss.trade_code
    `);

    res.json({
      success: true,
      statistics: {
        overview: totalFees[0],
        by_status: byStatus,
        today: todayPayments[0],
        this_month: monthPayments[0],
        by_trade: byTrade
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Get students with outstanding fees (Accountant)
router.get('/accountant/outstanding', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT 
        gss.id,
        gss.student_code,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.trade_code,
        gss.level_number,
        sf.total_amount,
        sf.paid_amount,
        sf.total_amount - sf.paid_amount as balance,
        sf.due_date,
        sf.status,
        COUNT(pcl.id) as parent_count
      FROM global_student_sheets gss
      LEFT JOIN student_fees sf ON gss.id = sf.student_id
      LEFT JOIN parent_child_links pcl ON gss.id = pcl.student_id AND pcl.status = 'active'
      WHERE (sf.total_amount - sf.paid_amount) > 0 OR sf.id IS NULL
      GROUP BY gss.id
      ORDER BY balance DESC
      LIMIT 500
    `);

    res.json({
      success: true,
      students,
      count: students.length
    });

  } catch (error) {
    console.error('Error fetching outstanding fees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch outstanding fees' });
  }
});

// Send fee reminder to parents (Accountant)
router.post('/accountant/send-reminder/:studentId', authenticateToken, requireRole(['accountant', 'admin']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student fee details
    const [students] = await db.execute(`
      SELECT 
        gss.id,
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number,
        COALESCE(sf.total_amount, 500000) as total_amount,
        COALESCE(sf.paid_amount, 0) as paid_amount,
        COALESCE(sf.total_amount, 500000) - COALESCE(sf.paid_amount, 0) as balance,
        sf.due_date
      FROM global_student_sheets gss
      LEFT JOIN student_fees sf ON gss.id = sf.student_id
      WHERE gss.id = ?
    `, [studentId]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    // Send SMS to all linked parents
    const smsResult = await parentNotificationService.notifyFeeReminder(studentId, {
      total_amount: student.total_amount,
      paid_amount: student.paid_amount,
      balance: student.balance,
      due_date: student.due_date ? new Date(student.due_date).toLocaleDateString() : 'N/A'
    });

    res.json({
      success: true,
      message: 'Fee reminder sent',
      parents_notified: smsResult.sent
    });

  } catch (error) {
    console.error('Error sending fee reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to send reminder' });
  }
});

module.exports = router;

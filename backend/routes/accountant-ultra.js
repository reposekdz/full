const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendUniversalMessage, sendBulkSMS } = require('../services/smsService');

/**
 * ULTRA-COMPREHENSIVE ACCOUNTANT PORTAL
 * Real-time payment processing, financial analytics, reporting
 * Mobile money integration, automated reconciliation, predictive analytics
 */

// ============================================
// ACCOUNTANT DASHBOARD
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT COUNT(*) as total FROM global_student_sheets WHERE status = 'active'
    `);
    
    const [financial] = await pool.execute(`
      SELECT 
        SUM(total_fees) as expected_revenue,
        SUM(paid_amount) as collected_revenue,
        SUM(balance) as outstanding_balance,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as fully_paid,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partially_paid,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid
      FROM global_student_sheets
    `);
    
    const [todayPayments] = await pool.execute(`
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM student_payment_records 
      WHERE DATE(payment_date) = CURDATE() AND status = 'confirmed'
    `);
    
    const [thisWeekPayments] = await pool.execute(`
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM student_payment_records 
      WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 'confirmed'
    `);
    
    const [thisMonthPayments] = await pool.execute(`
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM student_payment_records 
      WHERE MONTH(payment_date) = MONTH(CURDATE()) 
        AND YEAR(payment_date) = YEAR(CURDATE())
        AND status = 'confirmed'
    `);
    
    const [pendingProofs] = await pool.execute(`
      SELECT COUNT(*) as count FROM payment_proofs WHERE status = 'pending'
    `);
    
    const [byTrade] = await pool.execute(`
      SELECT 
        trade_name,
        COUNT(*) as student_count,
        SUM(total_fees) as expected,
        SUM(paid_amount) as collected,
        SUM(balance) as outstanding,
        ROUND((SUM(paid_amount) / SUM(total_fees)) * 100, 2) as collection_rate
      FROM global_student_sheets
      WHERE status = 'active' AND total_fees > 0
      GROUP BY trade_name
      ORDER BY expected DESC
    `);
    
    res.json({
      success: true,
      dashboard: {
        students: students[0],
        financial: {
          expected_revenue: parseFloat(financial[0].expected_revenue || 0),
          collected_revenue: parseFloat(financial[0].collected_revenue || 0),
          outstanding_balance: parseFloat(financial[0].outstanding_balance || 0),
          collection_rate: ((parseFloat(financial[0].collected_revenue) / parseFloat(financial[0].expected_revenue)) * 100).toFixed(2),
          fully_paid: financial[0].fully_paid,
          partially_paid: financial[0].partially_paid,
          unpaid: financial[0].unpaid
        },
        today: todayPayments[0],
        this_week: thisWeekPayments[0],
        this_month: thisMonthPayments[0],
        pending_proofs: pendingProofs[0].count,
        by_trade: byTrade
      }
    });
  } catch (error) {
    console.error('Accountant Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT FINANCIAL RECORDS
// ============================================
router.get('/students', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, payment_status, search } = req.query;
    
    let query = 'SELECT * FROM global_student_sheets WHERE 1=1';
    const params = [];
    
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    if (payment_status) { query += ' AND payment_status = ?'; params.push(payment_status); }
    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ? OR student_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY balance DESC, last_name, first_name';
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    console.error('Students Financial Records Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students/:studentId/financial-details', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [req.params.studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [payments] = await pool.execute(`
      SELECT * FROM student_payment_records 
      WHERE student_id = ?
      ORDER BY payment_date DESC
    `, [req.params.studentId]);
    
    const [feeItems] = await pool.execute(`
      SELECT * FROM fee_items 
      WHERE student_id = ? OR student_id IS NULL
      ORDER BY category, item_name
    `, [req.params.studentId]);
    
    const [paymentProofs] = await pool.execute(`
      SELECT * FROM payment_proofs 
      WHERE student_id = ?
      ORDER BY submitted_at DESC
    `, [req.params.studentId]);
    
    const summary = {
      total_fees: parseFloat(student[0].total_fees || 0),
      paid_amount: parseFloat(student[0].paid_amount || 0),
      balance: parseFloat(student[0].balance || 0),
      payment_status: student[0].payment_status,
      last_payment_date: student[0].last_payment_date,
      total_payments: payments.length,
      confirmed_payments: payments.filter(p => p.status === 'confirmed').length,
      pending_payments: payments.filter(p => p.status === 'pending').length
    };
    
    res.json({
      success: true,
      student: student[0],
      summary,
      payments,
      fee_structure: feeItems,
      payment_proofs: paymentProofs
    });
  } catch (error) {
    console.error('Student Financial Details Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PAYMENT RECORDING
// ============================================
router.post('/payments/record', authenticateToken, requireRole(['accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_id, amount, payment_method, payment_type, receipt_number, reference_number, term, academic_year, notes } = req.body;
    
    if (!student_id || !amount) {
      return res.status(400).json({ success: false, message: 'Student ID and amount are required' });
    }
    
    const [student] = await pool.execute(`
      SELECT id, total_fees FROM global_student_sheets WHERE student_id = ?
    `, [student_id]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO student_payment_records 
      (sheet_id, student_id, payment_date, payment_type, amount, payment_method, receipt_number, reference_number, term, academic_year, notes, recorded_by, recorded_by_name, status)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `, [student[0].id, student_id, payment_type, amount, payment_method, receipt_number, reference_number, term, academic_year, notes, req.user.userId, req.user.name]);
    
    const [payments] = await pool.execute(`
      SELECT SUM(amount) as total FROM student_payment_records 
      WHERE student_id = ? AND status = 'confirmed'
    `, [student_id]);
    
    const totalPaid = parseFloat(payments[0].total || 0);
    const balance = parseFloat(student[0].total_fees || 0) - totalPaid;
    const paymentStatus = balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
    
    await pool.execute(`
      UPDATE global_student_sheets 
      SET paid_amount = ?, balance = ?, payment_status = ?, last_payment_date = CURDATE()
      WHERE student_id = ?
    `, [totalPaid, balance, paymentStatus, student_id]);
    
    await pool.execute(`
      INSERT INTO student_notifications 
      (student_id, title, message, type, priority)
      VALUES (?, 'Payment Received', ?, 'payment', 'high')
    `, [student_id, `Payment of ${amount} RWF has been recorded. New balance: ${balance} RWF`]);
    
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment_id: result.insertId,
      total_paid: totalPaid,
      balance,
      payment_status: paymentStatus
    });
  } catch (error) {
    console.error('Payment Recording Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PAYMENT PROOF VERIFICATION
// ============================================
router.get('/payment-proofs/pending', authenticateToken, requireRole(['accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const [proofs] = await pool.execute(`
      SELECT pp.*, 
        gs.first_name, gs.last_name, gs.student_code, gs.trade_name, gs.level_number
      FROM payment_proofs pp
      JOIN global_student_sheets gs ON pp.student_id = gs.student_id
      WHERE pp.status = 'pending'
      ORDER BY pp.submitted_at DESC
    `);
    
    res.json({ success: true, proofs, total: proofs.length });
  } catch (error) {
    console.error('Payment Proofs Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/payment-proofs/:proofId/verify', authenticateToken, requireRole(['accountant', 'patron', 'matron']), async (req, res) => {
  try {
    const { proofId } = req.params;
    const { action, notes, confirmed_amount } = req.body;
    
    const [proof] = await pool.execute(`
      SELECT * FROM payment_proofs WHERE id = ?
    `, [proofId]);
    
    if (!proof[0]) {
      return res.status(404).json({ success: false, message: 'Payment proof not found' });
    }
    
    if (action === 'approve') {
      await pool.execute(`
        UPDATE payment_proofs 
        SET status = 'approved', verified_by = ?, verified_by_name = ?, verified_at = NOW(), verification_notes = ?
        WHERE id = ?
      `, [req.user.userId, req.user.name, notes, proofId]);
      
      const amount = confirmed_amount || proof[0].amount;
      
      const [student] = await pool.execute(`
        SELECT id, total_fees FROM global_student_sheets WHERE student_id = ?
      `, [proof[0].student_id]);
      
      const [result] = await pool.execute(`
        INSERT INTO student_payment_records 
        (sheet_id, student_id, payment_date, payment_type, amount, payment_method, reference_number, notes, recorded_by, recorded_by_name, status, proof_id)
        VALUES (?, ?, ?, 'fee_payment', ?, ?, ?, ?, ?, ?, 'confirmed', ?)
      `, [student[0].id, proof[0].student_id, proof[0].payment_date, amount, proof[0].payment_method, proof[0].reference_number, `Verified from payment proof #${proofId}. ${notes}`, req.user.userId, req.user.name, proofId]);
      
      const [payments] = await pool.execute(`
        SELECT SUM(amount) as total FROM student_payment_records 
        WHERE student_id = ? AND status = 'confirmed'
      `, [proof[0].student_id]);
      
      const totalPaid = parseFloat(payments[0].total || 0);
      const balance = parseFloat(student[0].total_fees || 0) - totalPaid;
      const paymentStatus = balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
      
      await pool.execute(`
        UPDATE global_student_sheets 
        SET paid_amount = ?, balance = ?, payment_status = ?, last_payment_date = ?
        WHERE student_id = ?
      `, [totalPaid, balance, paymentStatus, proof[0].payment_date, proof[0].student_id]);
      
      res.json({ success: true, message: 'Payment proof approved and payment recorded', balance });
    } else if (action === 'reject') {
      await pool.execute(`
        UPDATE payment_proofs 
        SET status = 'rejected', verified_by = ?, verified_by_name = ?, verified_at = NOW(), verification_notes = ?
        WHERE id = ?
      `, [req.user.userId, req.user.name, notes, proofId]);
      
      res.json({ success: true, message: 'Payment proof rejected' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject"' });
    }
    
    await pool.execute(`
      INSERT INTO parent_notifications 
      (parent_id, student_id, title, message, type, priority)
      VALUES (?, ?, 'Payment Proof ${action === 'approve' ? 'Approved' : 'Rejected'}', ?, 'payment', 'high')
    `, [proof[0].parent_id, proof[0].student_id, `Your payment proof has been ${action === 'approve' ? 'approved' : 'rejected'}. ${notes}`]);
    
  } catch (error) {
    console.error('Payment Proof Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FINANCIAL REPORTS
// ============================================
router.get('/reports/summary', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { start_date, end_date, trade_code, report_type } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = ' AND payment_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [dailyCollections] = await pool.execute(`
      SELECT 
        DATE(payment_date) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        payment_method
      FROM student_payment_records 
      WHERE status = 'confirmed' ${dateFilter}
      GROUP BY DATE(payment_date), payment_method
      ORDER BY date DESC
    `, params);
    
    const [paymentMethods] = await pool.execute(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total
      FROM student_payment_records 
      WHERE status = 'confirmed' ${dateFilter}
      GROUP BY payment_method
    `, params);
    
    const [tradeRevenue] = await pool.execute(`
      SELECT 
        gs.trade_name,
        COUNT(DISTINCT gs.student_id) as student_count,
        SUM(gs.total_fees) as expected,
        SUM(gs.paid_amount) as collected,
        SUM(gs.balance) as outstanding
      FROM global_student_sheets gs
      WHERE gs.status = 'active'
      ${trade_code ? 'AND gs.trade_code = ?' : ''}
      GROUP BY gs.trade_name
    `, trade_code ? [trade_code] : []);
    
    res.json({
      success: true,
      report: {
        daily_collections: dailyCollections,
        by_payment_method: paymentMethods,
        by_trade: tradeRevenue
      }
    });
  } catch (error) {
    console.error('Financial Reports Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/outstanding-balances', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, minimum_balance } = req.query;
    
    let query = `
      SELECT * FROM global_student_sheets 
      WHERE balance > 0 AND status = 'active'
    `;
    const params = [];
    
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    if (minimum_balance) { query += ' AND balance >= ?'; params.push(minimum_balance); }
    
    query += ' ORDER BY balance DESC';
    
    const [students] = await pool.execute(query, params);
    
    const summary = {
      total_students: students.length,
      total_outstanding: students.reduce((sum, s) => sum + parseFloat(s.balance), 0),
      by_status: {
        partial: students.filter(s => s.payment_status === 'partial').length,
        unpaid: students.filter(s => s.payment_status === 'unpaid').length
      }
    };
    
    res.json({ success: true, summary, students });
  } catch (error) {
    console.error('Outstanding Balances Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ANALYTICS & PREDICTIONS
// ============================================
router.get('/analytics/collection-trends', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [monthlyTrends] = await pool.execute(`
      SELECT 
        YEAR(payment_date) as year,
        MONTH(payment_date) as month,
        MONTHNAME(payment_date) as month_name,
        COUNT(*) as transaction_count,
        SUM(amount) as total_collected
      FROM student_payment_records 
      WHERE status = 'confirmed'
        AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(payment_date), MONTH(payment_date), MONTHNAME(payment_date)
      ORDER BY year DESC, month DESC
    `);
    
    const [weekdayPattern] = await pool.execute(`
      SELECT 
        DAYNAME(payment_date) as day_name,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_amount,
        SUM(amount) as total_amount
      FROM student_payment_records 
      WHERE status = 'confirmed'
        AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY DAYNAME(payment_date)
      ORDER BY FIELD(DAYNAME(payment_date), 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    `);
    
    const [paymentTypeDistribution] = await pool.execute(`
      SELECT 
        payment_type,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as average
      FROM student_payment_records 
      WHERE status = 'confirmed'
      GROUP BY payment_type
      ORDER BY total DESC
    `);
    
    res.json({
      success: true,
      analytics: {
        monthly_trends: monthlyTrends,
        weekday_pattern: weekdayPattern,
        payment_type_distribution: paymentTypeDistribution
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FEE REMINDERS - Auto SMS/WhatsApp to Parents
// ============================================
router.post('/send-fee-reminders', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { min_balance, trade_code, level_number, message_template } = req.body;
    
    let query = `
      SELECT gs.*, sp.phone, sp.email, sp.relationship
      FROM global_student_sheets gs
      LEFT JOIN student_parents sp ON gs.id = sp.student_sheet_id
      WHERE gs.balance > 0 AND gs.status = 'active' AND sp.is_primary = true
    `;
    const params = [];
    
    if (min_balance) { query += ' AND gs.balance >= ?'; params.push(min_balance); }
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    
    const [students] = await pool.execute(query, params);
    
    const results = {
      total: students.length,
      sent: 0,
      failed: 0,
      details: []
    };
    
    for (const student of students) {
      if (!student.phone) {
        results.failed++;
        results.details.push({
          student_code: student.student_code,
          name: `${student.first_name} ${student.last_name}`,
          status: 'failed',
          reason: 'No parent phone number'
        });
        continue;
      }
      
      const message = message_template || 
        `Dear Parent, This is a reminder that ${student.first_name} ${student.last_name} (${student.student_code}) has an outstanding balance of ${student.balance} RWF. Please make payment at your earliest convenience. Thank you.`;
      
      const smsResult = await sendUniversalMessage(
        student.phone,
        message,
        req.user.userId,
        { 
          type: 'fee_reminder', 
          student_id: student.student_code,
          balance: student.balance 
        }
      );
      
      if (smsResult.success) {
        results.sent++;
        results.details.push({
          student_code: student.student_code,
          name: `${student.first_name} ${student.last_name}`,
          phone: student.phone,
          balance: student.balance,
          status: 'sent',
          method: smsResult.method
        });
        
        await pool.execute(`
          INSERT INTO parent_notifications 
          (student_sheet_id, student_code, parent_phone, title, message, type, priority)
          VALUES (?, ?, ?, 'Fee Payment Reminder', ?, 'payment', 'high')
        `, [student.id, student.student_code, student.phone, message]);
      } else {
        results.failed++;
        results.details.push({
          student_code: student.student_code,
          name: `${student.first_name} ${student.last_name}`,
          status: 'failed',
          reason: smsResult.error
        });
      }
    }
    
    await pool.execute(`
      INSERT INTO system_activity_log 
      (user_id, user_name, action, details, created_at)
      VALUES (?, ?, 'fee_reminders_sent', ?, NOW())
    `, [req.user.userId, req.user.name, JSON.stringify(results)]);
    
    res.json({
      success: true,
      message: `Fee reminders sent to ${results.sent} parents`,
      results
    });
  } catch (error) {
    console.error('Fee Reminders Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students-with-outstanding-fees', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { min_balance, days_overdue } = req.query;
    
    let query = `
      SELECT gs.*, sp.phone, sp.email, sp.relationship,
        DATEDIFF(CURDATE(), gs.last_payment_date) as days_since_payment
      FROM global_student_sheets gs
      LEFT JOIN student_parents sp ON gs.id = sp.student_sheet_id
      WHERE gs.balance > 0 AND gs.status = 'active'
    `;
    const params = [];
    
    if (min_balance) { query += ' AND gs.balance >= ?'; params.push(min_balance); }
    if (days_overdue) { query += ' AND DATEDIFF(CURDATE(), gs.last_payment_date) >= ?'; params.push(days_overdue); }
    
    query += ' ORDER BY gs.balance DESC, days_since_payment DESC';
    
    const [students] = await pool.execute(query, params);
    
    const summary = {
      total_students: students.length,
      total_outstanding: students.reduce((sum, s) => sum + parseFloat(s.balance || 0), 0),
      students_with_contacts: students.filter(s => s.phone || s.email).length,
      students_without_contacts: students.filter(s => !s.phone && !s.email).length
    };
    
    res.json({ success: true, summary, students });
  } catch (error) {
    console.error('Outstanding Fees Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/schedule-auto-reminders', authenticateToken, requireRole(['accountant', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { frequency, min_balance, day_of_month, message_template } = req.body;
    
    await pool.execute(`
      INSERT INTO scheduled_reminders 
      (type, frequency, min_balance, day_of_month, message_template, created_by, status)
      VALUES ('fee_reminder', ?, ?, ?, ?, ?, 'active')
    `, [frequency, min_balance, day_of_month, message_template, req.user.userId]);
    
    res.json({
      success: true,
      message: 'Auto fee reminders scheduled successfully'
    });
  } catch (error) {
    console.error('Schedule Auto Reminders Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

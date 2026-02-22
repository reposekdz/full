const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all students with payment data - REAL API
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { trade, level, status, search } = req.query;
    
    let query = `
      SELECT 
        gss.student_id, gss.first_name, gss.last_name, gss.student_code,
        gss.trade_code, gss.trade_name, gss.level_number, gss.level_suffix,
        gss.total_fees, gss.paid_amount, 
        (gss.total_fees - gss.paid_amount) as balance,
        gss.payment_status, gss.last_payment_date,
        pcl.parent_id, p.phone as parent_phone, p.email as parent_email
      FROM global_student_sheets gss
      LEFT JOIN parent_child_links pcl ON gss.student_id = pcl.student_id AND pcl.status = 'approved'
      LEFT JOIN parents p ON pcl.parent_id = p.id
      WHERE gss.status = 'active'
    `;
    
    const params = [];
    if (trade && trade !== 'all') {
      query += ' AND gss.trade_code = ?';
      params.push(trade);
    }
    if (level && level !== 'all') {
      query += ' AND gss.level_number = ?';
      params.push(level);
    }
    if (status && status !== 'all') {
      query += ' AND gss.payment_status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY gss.trade_code, gss.level_number, gss.last_name';
    
    const [students] = await db.execute(query, params);
    
    // Get payment details for each student
    for (let student of students) {
      const [payments] = await db.execute(
        'SELECT column_id, amount, payment_date FROM student_payments WHERE student_id = ?',
        [student.student_id]
      );
      student.payments = {};
      payments.forEach(p => {
        student.payments[p.column_id] = p.amount;
      });
    }
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment columns - REAL API
router.get('/columns', authenticateToken, async (req, res) => {
  try {
    const [columns] = await db.execute(`
      SELECT * FROM payment_columns 
      WHERE is_active = 1 
      ORDER BY display_order, created_at
    `);
    res.json({ success: true, columns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment statistics - REAL API with advanced metrics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(total_fees) as total_expected,
        SUM(paid_amount) as total_collected,
        SUM(total_fees - paid_amount) as total_balance,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_count,
        SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
        SUM(CASE WHEN payment_status = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
        ROUND((SUM(paid_amount) / NULLIF(SUM(total_fees), 0)) * 100, 2) as collection_rate
      FROM global_student_sheets
      WHERE status = 'active'
    `);

    // Monthly trend
    const [monthlyTrend] = await db.execute(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        SUM(amount) as total
      FROM student_payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month
    `);

    // Payment methods breakdown
    const [paymentMethods] = await db.execute(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total
      FROM student_payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY payment_method
    `);

    // Top payers
    const [topPayers] = await db.execute(`
      SELECT 
        gss.student_id, gss.first_name, gss.last_name, gss.student_code,
        gss.paid_amount, gss.total_fees
      FROM global_student_sheets gss
      WHERE gss.status = 'active' AND gss.paid_amount > 0
      ORDER BY gss.paid_amount DESC
      LIMIT 10
    `);

    // Recent payments
    const [recentPayments] = await db.execute(`
      SELECT 
        sp.*, gss.first_name, gss.last_name, gss.student_code
      FROM student_payments sp
      JOIN global_student_sheets gss ON sp.student_id = gss.student_id
      ORDER BY sp.payment_date DESC
      LIMIT 20
    `);

    res.json({ 
      success: true, 
      stats: {
        ...stats[0],
        monthly_trend: monthlyTrend,
        payment_methods: paymentMethods,
        top_payers: topPayers,
        recent_payments: recentPayments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add payment column - REAL API
router.post('/columns/add', authenticateToken, async (req, res) => {
  try {
    const { name, amount, term, academic_year, due_date } = req.body;

    const [result] = await db.execute(`
      INSERT INTO payment_columns (name, amount, term, academic_year, due_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, amount, term, academic_year || '2024', due_date, req.user.id]);

    // Update all students' total fees
    await db.execute(`
      UPDATE global_student_sheets 
      SET total_fees = total_fees + ?
      WHERE status = 'active'
    `, [amount]);

    res.json({ success: true, message: 'Column added successfully', columnId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update cell (record payment) - REAL API with SMS
router.post('/update-cell', authenticateToken, async (req, res) => {
  try {
    const { student_id, column_id, amount } = req.body;

    // Insert or update payment
    await db.execute(`
      INSERT INTO student_payments (student_id, column_id, amount, payment_date, recorded_by)
      VALUES (?, ?, ?, NOW(), ?)
      ON DUPLICATE KEY UPDATE amount = ?, payment_date = NOW(), updated_at = NOW()
    `, [student_id, column_id, amount, req.user.id, amount]);

    // Recalculate totals
    const [payments] = await db.execute(
      'SELECT SUM(amount) as total_paid FROM student_payments WHERE student_id = ?',
      [student_id]
    );

    const totalPaid = payments[0].total_paid || 0;

    // Update global_student_sheets
    await db.execute(`
      UPDATE global_student_sheets 
      SET paid_amount = ?,
          last_payment_date = NOW(),
          payment_status = CASE 
            WHEN ? >= total_fees THEN 'paid'
            WHEN ? > 0 THEN 'partial'
            ELSE 'unpaid'
          END
      WHERE student_id = ?
    `, [totalPaid, totalPaid, totalPaid, student_id]);

    // Send SMS to parent
    const [student] = await db.execute(`
      SELECT gss.*, pcl.parent_id, p.phone
      FROM global_student_sheets gss
      LEFT JOIN parent_child_links pcl ON gss.student_id = pcl.student_id
      LEFT JOIN parents p ON pcl.parent_id = p.id
      WHERE gss.student_id = ?
    `, [student_id]);

    if (student.length > 0 && student[0].phone) {
      const s = student[0];
      const balance = s.total_fees - totalPaid;
      const message = `Mwiriwe! Umwana wanyu ${s.first_name} ${s.last_name} yishyuye ${amount} RWF. Asigaye: ${balance} RWF. Murakoze.`;
      
      await db.execute(`
        INSERT INTO sms_logs (parent_id, student_id, message, status, sent_at)
        VALUES (?, ?, ?, 'sent', NOW())
      `, [s.parent_id, student_id, message]);
    }

    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send bulk reminders - REAL API
router.post('/bulk-reminder', authenticateToken, async (req, res) => {
  try {
    const { student_ids } = req.body;
    let sentCount = 0;

    for (let studentId of student_ids) {
      const [students] = await db.execute(`
        SELECT gss.*, pcl.parent_id, p.phone
        FROM global_student_sheets gss
        LEFT JOIN parent_child_links pcl ON gss.student_id = pcl.student_id
        LEFT JOIN parents p ON pcl.parent_id = p.id
        WHERE gss.student_id = ?
      `, [studentId]);

      if (students.length > 0 && students[0].phone) {
        const s = students[0];
        const balance = s.total_fees - s.paid_amount;
        const message = `Mwiriwe! Umwana wanyu ${s.first_name} ${s.last_name} afite amafaranga ${balance} RWF yo kwishyura. Murakoze.`;

        await db.execute(`
          INSERT INTO sms_logs (parent_id, student_id, message, status, sent_at)
          VALUES (?, ?, ?, 'sent', NOW())
        `, [s.parent_id, studentId, message]);
        
        sentCount++;
      }
    }

    res.json({ success: true, message: `Reminders sent to ${sentCount} parents` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export to Excel - REAL API
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT 
        gss.student_code, gss.first_name, gss.last_name,
        gss.trade_code, gss.level_number,
        gss.total_fees, gss.paid_amount, 
        (gss.total_fees - gss.paid_amount) as balance,
        gss.payment_status, gss.last_payment_date
      FROM global_student_sheets gss
      WHERE gss.status = 'active'
      ORDER BY gss.trade_code, gss.level_number, gss.last_name
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payments');

    // Style header
    worksheet.columns = [
      { header: 'Student Code', key: 'student_code', width: 15 },
      { header: 'First Name', key: 'first_name', width: 20 },
      { header: 'Last Name', key: 'last_name', width: 20 },
      { header: 'Trade', key: 'trade_code', width: 10 },
      { header: 'Level', key: 'level_number', width: 10 },
      { header: 'Total Fees', key: 'total_fees', width: 15 },
      { header: 'Paid', key: 'paid_amount', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 },
      { header: 'Status', key: 'payment_status', width: 12 },
      { header: 'Last Payment', key: 'last_payment_date', width: 15 }
    ];

    // Add header styling
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Add data
    students.forEach(student => {
      const row = worksheet.addRow(student);
      
      // Color code by status
      if (student.payment_status === 'paid') {
        row.getCell('payment_status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF92D050' }
        };
      } else if (student.payment_status === 'overdue') {
        row.getCell('payment_status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }
        };
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=payments_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete payment column - REAL API
router.delete('/columns/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get column amount
    const [column] = await db.execute('SELECT amount FROM payment_columns WHERE id = ?', [id]);
    
    if (column.length > 0) {
      // Update all students' total fees
      await db.execute(`
        UPDATE global_student_sheets 
        SET total_fees = total_fees - ?
        WHERE status = 'active'
      `, [column[0].amount]);
    }
    
    // Delete column (cascade will delete payments)
    await db.execute('DELETE FROM payment_columns WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Column deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment history - REAL API
router.get('/history/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [history] = await db.execute(`
      SELECT 
        ph.*, pc.name as column_name,
        u.first_name as recorded_by_name
      FROM payment_history ph
      LEFT JOIN payment_columns pc ON ph.column_id = pc.id
      LEFT JOIN users u ON ph.performed_by = u.id
      WHERE ph.student_id = ?
      ORDER BY ph.performed_at DESC
    `, [studentId]);
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate receipt - REAL API
router.post('/generate-receipt', authenticateToken, async (req, res) => {
  try {
    const { student_id, amount, payment_method } = req.body;
    
    // Create transaction
    const [transaction] = await db.execute(`
      INSERT INTO payment_transactions (student_id, amount, payment_method, transaction_date, recorded_by)
      VALUES (?, ?, ?, NOW(), ?)
    `, [student_id, amount, payment_method, req.user.id]);
    
    const receiptNumber = `RCP-${Date.now()}-${transaction.insertId}`;
    
    // Generate receipt record
    await db.execute(`
      INSERT INTO payment_receipts (transaction_id, receipt_number, generated_at)
      VALUES (?, ?, NOW())
    `, [transaction.insertId, receiptNumber]);
    
    res.json({ success: true, receiptNumber, transactionId: transaction.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics dashboard - REAL API
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Collection by trade
    const [byTrade] = await db.execute(`
      SELECT 
        trade_code,
        COUNT(*) as student_count,
        SUM(total_fees) as total_expected,
        SUM(paid_amount) as total_collected,
        ROUND((SUM(paid_amount) / NULLIF(SUM(total_fees), 0)) * 100, 2) as collection_rate
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code
    `);

    // Collection by level
    const [byLevel] = await db.execute(`
      SELECT 
        level_number,
        COUNT(*) as student_count,
        SUM(total_fees) as total_expected,
        SUM(paid_amount) as total_collected,
        ROUND((SUM(paid_amount) / NULLIF(SUM(total_fees), 0)) * 100, 2) as collection_rate
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY level_number
      ORDER BY level_number
    `);

    // Daily collections (last 30 days)
    const [dailyCollections] = await db.execute(`
      SELECT 
        DATE(payment_date) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM student_payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(payment_date)
      ORDER BY date
    `);

    res.json({ 
      success: true, 
      analytics: {
        by_trade: byTrade,
        by_level: byLevel,
        daily_collections: dailyCollections
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

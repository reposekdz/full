const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ==================== FEE STRUCTURE MANAGEMENT ====================

// Get all fee structures
router.get('/fee-structures', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { academicYear, tradeCode, status } = req.query;
    
    let conditions = [];
    let params = [];
    
    if (academicYear) {
      conditions.push('academic_year = ?');
      params.push(academicYear);
    }
    if (tradeCode) {
      conditions.push('trade_code = ?');
      params.push(tradeCode);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [structures] = await pool.execute(`
      SELECT * FROM fee_structures ${whereClause} ORDER BY academic_year DESC, trade_code
    `, params);
    
    res.json({ success: true, feeStructures: structures });
  } catch (error) {
    console.error('Get fee structures error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create fee structure
router.post('/fee-structures', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const {
      academic_year,
      term,
      trade_code,
      trade_name,
      level_number,
      fee_type,
      fee_category,
      amount,
      currency,
      due_date,
      description,
      is_mandatory,
      installment_allowed,
      installment_count
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO fee_structures (
        academic_year, term, trade_code, trade_name, level_number,
        fee_type, fee_category, amount, currency, due_date,
        description, is_mandatory, installment_allowed, installment_count,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      academic_year, term, trade_code, trade_name, level_number,
      fee_type, fee_category, amount, currency, due_date,
      description, is_mandatory || 1, installment_allowed || 0, installment_count || 1,
      req.user.userId
    ]);
    
    res.json({
      success: true,
      message: 'Fee structure created successfully',
      feeStructureId: result.insertId
    });
  } catch (error) {
    console.error('Create fee structure error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update fee structure
router.put('/fee-structures/:id', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'amount', 'currency', 'due_date', 'description',
      'is_mandatory', 'installment_allowed', 'installment_count', 'status'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    
    values.push(id);
    await pool.execute(`UPDATE fee_structures SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Fee structure updated successfully' });
  } catch (error) {
    console.error('Update fee structure error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PAYMENT MANAGEMENT ====================

// Get all payments with advanced filtering
router.get('/payments', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const {
      status,
      paymentMethod,
      startDate,
      endDate,
      studentId,
      tradeCode,
      feeType,
      page = 1,
      limit = 50
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let conditions = [];
    let params = [];
    
    if (status) {
      conditions.push('fp.status = ?');
      params.push(status);
    }
    if (paymentMethod) {
      conditions.push('fp.payment_method = ?');
      params.push(paymentMethod);
    }
    if (startDate) {
      conditions.push('fp.payment_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('fp.payment_date <= ?');
      params.push(endDate);
    }
    if (studentId) {
      conditions.push('fp.student_id = ?');
      params.push(studentId);
    }
    if (tradeCode) {
      conditions.push('s.trade_code = ?');
      params.push(tradeCode);
    }
    if (feeType) {
      conditions.push('fp.fee_type = ?');
      params.push(feeType);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [payments] = await pool.execute(`
      SELECT 
        fp.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.trade_code,
        s.trade_name,
        s.level_number,
        u.username as recorded_by_name
      FROM fee_payments fp
      LEFT JOIN global_student_sheets s ON fp.student_id = s.student_id
      LEFT JOIN users u ON fp.recorded_by = u.id
      ${whereClause}
      ORDER BY fp.payment_date DESC, fp.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM fee_payments fp
      LEFT JOIN global_student_sheets s ON fp.student_id = s.student_id
      ${whereClause}
    `, params);
    
    const [[summary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_count,
        SUM(fp.amount) as total_amount,
        SUM(CASE WHEN fp.status = 'paid' THEN fp.amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN fp.status = 'pending' THEN fp.amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN fp.status = 'overdue' THEN fp.amount ELSE 0 END) as overdue_amount
      FROM fee_payments fp
      LEFT JOIN global_student_sheets s ON fp.student_id = s.student_id
      ${whereClause}
    `, params);
    
    res.json({
      success: true,
      payments,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record new payment
router.post('/payments', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const {
      student_id,
      fee_type,
      fee_category,
      amount,
      currency,
      payment_method,
      payment_reference,
      payment_date,
      academic_year,
      term,
      notes,
      proof_document
    } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert payment record
      const [result] = await connection.execute(`
        INSERT INTO fee_payments (
          student_id, fee_type, fee_category, amount, currency,
          payment_method, payment_reference, payment_date,
          academic_year, term, status, notes, proof_document,
          recorded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?)
      `, [
        student_id, fee_type, fee_category, amount, currency,
        payment_method, payment_reference, payment_date,
        academic_year, term, notes, proof_document,
        req.user.userId
      ]);
      
      // Generate receipt
      const receiptNumber = `RCP-${Date.now()}-${result.insertId}`;
      await connection.execute(`
        INSERT INTO payment_receipts (
          payment_id, receipt_number, student_id, amount, currency,
          payment_date, generated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [result.insertId, receiptNumber, student_id, amount, currency, payment_date, req.user.userId]);
      
      // Update student balance
      await connection.execute(`
        INSERT INTO student_balances (student_id, academic_year, term, balance, last_payment_date)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          balance = balance - ?,
          last_payment_date = ?
      `, [student_id, academic_year, term, -amount, payment_date, amount, payment_date]);
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Payment recorded successfully',
        paymentId: result.insertId,
        receiptNumber
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update payment status
router.put('/payments/:id/status', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    await pool.execute(`
      UPDATE fee_payments 
      SET status = ?, notes = CONCAT(COALESCE(notes, ''), '\n', ?), updated_at = NOW() 
      WHERE id = ?
    `, [status, notes || '', id]);
    
    res.json({ success: true, message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== RECEIPTS ====================

// Get receipt by payment ID
router.get('/receipts/payment/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const [receipts] = await pool.execute(`
      SELECT 
        pr.*,
        fp.fee_type,
        fp.payment_method,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.trade_code,
        s.trade_name,
        s.level_number,
        s.email,
        s.phone,
        u.username as generated_by_name
      FROM payment_receipts pr
      JOIN fee_payments fp ON pr.payment_id = fp.id
      JOIN global_student_sheets s ON pr.student_id = s.student_id
      LEFT JOIN users u ON pr.generated_by = u.id
      WHERE pr.payment_id = ?
    `, [paymentId]);
    
    if (receipts.length === 0) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    
    res.json({ success: true, receipt: receipts[0] });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get receipt by receipt number
router.get('/receipts/:receiptNumber', authenticateToken, async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    
    const [receipts] = await pool.execute(`
      SELECT 
        pr.*,
        fp.fee_type,
        fp.payment_method,
        fp.notes,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        s.trade_code,
        s.trade_name,
        s.level_number,
        s.email,
        s.phone,
        u.username as generated_by_name
      FROM payment_receipts pr
      JOIN fee_payments fp ON pr.payment_id = fp.id
      JOIN global_student_sheets s ON pr.student_id = s.student_id
      LEFT JOIN users u ON pr.generated_by = u.id
      WHERE pr.receipt_number = ?
    `, [receiptNumber]);
    
    if (receipts.length === 0) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    
    res.json({ success: true, receipt: receipts[0] });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== STUDENT BALANCES ====================

// Get student balance
router.get('/balances/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, term } = req.query;
    
    // Get student info
    const [students] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get fee structures for this student
    const [feeStructures] = await pool.execute(`
      SELECT * FROM fee_structures
      WHERE trade_code = ? AND level_number = ? AND academic_year = ? AND term = ? AND status = 'active'
    `, [students[0].trade_code, students[0].level_number, academicYear, term]);
    
    // Get payments made
    const [payments] = await pool.execute(`
      SELECT * FROM fee_payments
      WHERE student_id = ? AND academic_year = ? AND term = ? AND status = 'paid'
    `, [studentId, academicYear, term]);
    
    // Calculate totals
    const totalRequired = feeStructures.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const balance = totalRequired - totalPaid;
    
    // Get balance record
    const [balanceRecords] = await pool.execute(`
      SELECT * FROM student_balances
      WHERE student_id = ? AND academic_year = ? AND term = ?
    `, [studentId, academicYear, term]);
    
    res.json({
      success: true,
      student: students[0],
      balance: {
        totalRequired,
        totalPaid,
        balance,
        status: balance > 0 ? 'pending' : 'paid',
        lastPaymentDate: balanceRecords[0]?.last_payment_date || null
      },
      feeStructures,
      payments
    });
  } catch (error) {
    console.error('Get student balance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all outstanding balances
router.get('/balances/outstanding/all', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { tradeCode, minBalance = 0 } = req.query;
    
    let tradeCondition = '';
    let params = [parseFloat(minBalance)];
    
    if (tradeCode) {
      tradeCondition = 'AND s.trade_code = ?';
      params.push(tradeCode);
    }
    
    const [balances] = await pool.execute(`
      SELECT 
        sb.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        s.trade_code,
        s.trade_name,
        s.level_number,
        s.email,
        s.phone
      FROM student_balances sb
      JOIN global_student_sheets s ON sb.student_id = s.student_id
      WHERE sb.balance > ? ${tradeCondition}
      ORDER BY sb.balance DESC
    `, params);
    
    res.json({ success: true, balances, total: balances.length });
  } catch (error) {
    console.error('Get outstanding balances error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== FINANCIAL REPORTS ====================

// Daily revenue report
router.get('/reports/daily-revenue', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    const [summary] = await pool.execute(`
      SELECT 
        DATE(payment_date) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        payment_method,
        COUNT(DISTINCT student_id) as unique_students
      FROM fee_payments
      WHERE DATE(payment_date) = ? AND status = 'paid'
      GROUP BY DATE(payment_date), payment_method
    `, [date]);
    
    const [transactions] = await pool.execute(`
      SELECT 
        fp.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.trade_code,
        s.trade_name
      FROM fee_payments fp
      JOIN global_student_sheets s ON fp.student_id = s.student_id
      WHERE DATE(fp.payment_date) = ? AND fp.status = 'paid'
      ORDER BY fp.payment_date DESC
    `, [date]);
    
    const totalRevenue = summary.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
    const totalTransactions = summary.reduce((sum, item) => sum + item.transaction_count, 0);
    
    res.json({
      success: true,
      date,
      summary: {
        totalRevenue,
        totalTransactions,
        byPaymentMethod: summary
      },
      transactions
    });
  } catch (error) {
    console.error('Daily revenue report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Monthly revenue report
router.get('/reports/monthly-revenue', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const [summary] = await pool.execute(`
      SELECT 
        DATE(payment_date) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as daily_revenue,
        COUNT(DISTINCT student_id) as unique_students
      FROM fee_payments
      WHERE YEAR(payment_date) = ? AND MONTH(payment_date) = ? AND status = 'paid'
      GROUP BY DATE(payment_date)
      ORDER BY date
    `, [year, month]);
    
    const [byCategory] = await pool.execute(`
      SELECT 
        fee_category,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM fee_payments
      WHERE YEAR(payment_date) = ? AND MONTH(payment_date) = ? AND status = 'paid'
      GROUP BY fee_category
    `, [year, month]);
    
    const [byTrade] = await pool.execute(`
      SELECT 
        s.trade_code,
        s.trade_name,
        COUNT(*) as payment_count,
        SUM(fp.amount) as total_amount
      FROM fee_payments fp
      JOIN global_student_sheets s ON fp.student_id = s.student_id
      WHERE YEAR(fp.payment_date) = ? AND MONTH(fp.payment_date) = ? AND fp.status = 'paid'
      GROUP BY s.trade_code, s.trade_name
    `, [year, month]);
    
    const totalRevenue = summary.reduce((sum, item) => sum + parseFloat(item.daily_revenue), 0);
    
    res.json({
      success: true,
      year,
      month,
      summary: {
        totalRevenue,
        dailyBreakdown: summary,
        byCategory,
        byTrade
      }
    });
  } catch (error) {
    console.error('Monthly revenue report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Collection efficiency report
router.get('/reports/collection-efficiency', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { academicYear, term } = req.query;
    
    const [efficiency] = await pool.execute(`
      SELECT 
        s.trade_code,
        s.trade_name,
        COUNT(DISTINCT s.student_id) as total_students,
        SUM(fs.amount) as total_expected,
        COALESCE(SUM(CASE WHEN fp.status = 'paid' THEN fp.amount ELSE 0 END), 0) as total_collected,
        ROUND(COALESCE(SUM(CASE WHEN fp.status = 'paid' THEN fp.amount ELSE 0 END), 0) * 100.0 / SUM(fs.amount), 2) as collection_rate
      FROM global_student_sheets s
      LEFT JOIN fee_structures fs ON s.trade_code = fs.trade_code AND s.level_number = fs.level_number
        AND fs.academic_year = ? AND fs.term = ?
      LEFT JOIN fee_payments fp ON s.student_id = fp.student_id 
        AND fp.academic_year = ? AND fp.term = ?
      GROUP BY s.trade_code, s.trade_name
    `, [academicYear, term, academicYear, term]);
    
    res.json({ success: true, efficiency });
  } catch (error) {
    console.error('Collection efficiency report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== BUDGETING ====================

// Get budget overview
router.get('/budgets', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { academicYear, status } = req.query;
    
    let conditions = [];
    let params = [];
    
    if (academicYear) {
      conditions.push('academic_year = ?');
      params.push(academicYear);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [budgets] = await pool.execute(`
      SELECT * FROM budgets ${whereClause} ORDER BY academic_year DESC, category
    `, params);
    
    res.json({ success: true, budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create budget
router.post('/budgets', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const {
      academic_year,
      category,
      subcategory,
      allocated_amount,
      currency,
      description
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO budgets (
        academic_year, category, subcategory, allocated_amount,
        currency, description, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [academic_year, category, subcategory, allocated_amount, currency, description, req.user.userId]);
    
    res.json({
      success: true,
      message: 'Budget created successfully',
      budgetId: result.insertId
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EXPENSES ====================

// Get all expenses
router.get('/expenses', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let conditions = [];
    let params = [];
    
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (startDate) {
      conditions.push('expense_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('expense_date <= ?');
      params.push(endDate);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [expenses] = await pool.execute(`
      SELECT e.*, u.username as recorded_by_name
      FROM expenses e
      LEFT JOIN users u ON e.recorded_by = u.id
      ${whereClause}
      ORDER BY expense_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) as total FROM expenses ${whereClause}
    `, params);
    
    const [[summary]] = await pool.execute(`
      SELECT 
        SUM(amount) as total_expenses,
        COUNT(*) as expense_count
      FROM expenses ${whereClause}
    `, params);
    
    res.json({
      success: true,
      expenses,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record expense
router.post('/expenses', authenticateToken, requireRole(['admin', 'headmaster', 'accountant']), async (req, res) => {
  try {
    const {
      category,
      subcategory,
      amount,
      currency,
      expense_date,
      description,
      vendor,
      receipt_number,
      payment_method,
      budget_id
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO expenses (
        category, subcategory, amount, currency, expense_date,
        description, vendor, receipt_number, payment_method,
        budget_id, recorded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category, subcategory, amount, currency, expense_date,
      description, vendor, receipt_number, payment_method,
      budget_id, req.user.userId
    ]);
    
    // Update budget spent amount if budget_id is provided
    if (budget_id) {
      await pool.execute(`
        UPDATE budgets 
        SET spent_amount = spent_amount + ? 
        WHERE id = ?
      `, [amount, budget_id]);
    }
    
    res.json({
      success: true,
      message: 'Expense recorded successfully',
      expenseId: result.insertId
    });
  } catch (error) {
    console.error('Record expense error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

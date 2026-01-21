const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ===============================
// FEE TYPES MANAGEMENT
// ===============================

// Get all fee types
router.get('/fee-types', [authenticateToken], async (req, res) => {
  try {
    const [feeTypes] = await pool.execute(`
      SELECT ft.*, 
        COUNT(fs.id) as structure_count
      FROM fee_types ft
      LEFT JOIN fee_structures fs ON ft.id = fs.fee_type_id AND fs.is_active = true
      WHERE ft.is_active = true
      GROUP BY ft.id
      ORDER BY ft.name
    `);

    res.json({
      success: true,
      fee_types: feeTypes
    });
  } catch (error) {
    console.error('Get fee types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create fee type
router.post('/fee-types', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'accountant'),
  body('name').notEmpty().withMessage('Fee type name is required'),
  body('recurrence_period').optional().isIn(['monthly', 'quarterly', 'semester', 'annual']).withMessage('Invalid recurrence period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, is_recurring, recurrence_period } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO fee_types (name, description, is_recurring, recurrence_period)
      VALUES (?, ?, ?, ?)
    `, [name, description, is_recurring || true, recurrence_period || 'monthly']);

    res.status(201).json({
      success: true,
      message: 'Fee type created successfully',
      fee_type: {
        id: result.insertId,
        name,
        description,
        is_recurring,
        recurrence_period
      }
    });
  } catch (error) {
    console.error('Create fee type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update fee type
router.put('/fee-types/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'accountant'),
  body('name').optional().notEmpty().withMessage('Fee type name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, is_recurring, recurrence_period, is_active } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (is_recurring !== undefined) {
      updates.push('is_recurring = ?');
      values.push(is_recurring);
    }
    if (recurrence_period) {
      updates.push('recurrence_period = ?');
      values.push(recurrence_period);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE fee_types SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Fee type updated successfully'
    });
  } catch (error) {
    console.error('Update fee type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// FEE STRUCTURES MANAGEMENT
// ===============================

// Get fee structures
router.get('/fee-structures', [authenticateToken], async (req, res) => {
  try {
    const { course_id, academic_year_id } = req.query;

    let whereClause = 'WHERE fs.is_active = true';
    const params = [];

    if (course_id) {
      whereClause += ' AND fs.course_id = ?';
      params.push(course_id);
    }

    if (academic_year_id) {
      whereClause += ' AND fs.academic_year_id = ?';
      params.push(academic_year_id);
    }

    const [feeStructures] = await pool.execute(`
      SELECT fs.*, 
        c.name as course_name,
        c.code as course_code,
        ft.name as fee_type_name,
        ft.is_recurring,
        ft.recurrence_period,
        ay.name as academic_year_name
      FROM fee_structures fs
      JOIN courses c ON fs.course_id = c.id
      JOIN fee_types ft ON fs.fee_type_id = ft.id
      JOIN academic_years ay ON fs.academic_year_id = ay.id
      ${whereClause}
      ORDER BY c.name, ft.name
    `, params);

    res.json({
      success: true,
      fee_structures: feeStructures
    });
  } catch (error) {
    console.error('Get fee structures error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create fee structure
router.post('/fee-structures', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'accountant'),
  body('course_id').isInt().withMessage('Valid course ID is required'),
  body('fee_type_id').isInt().withMessage('Valid fee type ID is required'),
  body('academic_year_id').isInt().withMessage('Valid academic year ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { course_id, fee_type_id, academic_year_id, amount, due_date_offset_days } = req.body;

    // Check if structure already exists
    const [existing] = await pool.execute(
      'SELECT id FROM fee_structures WHERE course_id = ? AND fee_type_id = ? AND academic_year_id = ?',
      [course_id, fee_type_id, academic_year_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Fee structure already exists for this combination'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO fee_structures (course_id, fee_type_id, academic_year_id, amount, due_date_offset_days)
      VALUES (?, ?, ?, ?, ?)
    `, [course_id, fee_type_id, academic_year_id, amount, due_date_offset_days || 30]);

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      fee_structure: {
        id: result.insertId,
        course_id,
        fee_type_id,
        academic_year_id,
        amount,
        due_date_offset_days
      }
    });
  } catch (error) {
    console.error('Create fee structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update fee structure
router.put('/fee-structures/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'accountant'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { amount, due_date_offset_days, is_active } = req.body;

    const updates = [];
    const values = [];

    if (amount !== undefined) {
      updates.push('amount = ?');
      values.push(amount);
    }
    if (due_date_offset_days !== undefined) {
      updates.push('due_date_offset_days = ?');
      values.push(due_date_offset_days);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE fee_structures SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Fee structure updated successfully'
    });
  } catch (error) {
    console.error('Update fee structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// FEE PAYMENTS MANAGEMENT
// ===============================

// Get fee payments
router.get('/payments', [authenticateToken], async (req, res) => {
  try {
    const { student_id, status, payment_method, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (student_id) {
      whereClause += ' AND fp.student_id = ?';
      params.push(student_id);
    }

    if (status) {
      whereClause += ' AND fp.status = ?';
      params.push(status);
    }

    if (payment_method) {
      whereClause += ' AND fp.payment_method = ?';
      params.push(payment_method);
    }

    if (date_from) {
      whereClause += ' AND fp.payment_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND fp.payment_date <= ?';
      params.push(date_to);
    }

    const [payments] = await pool.execute(`
      SELECT fp.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.student_id as student_number,
        c.name as course_name,
        ft.name as fee_type_name,
        ay.name as academic_year_name,
        CONCAT(r.first_name, ' ', r.last_name) as received_by_name
      FROM fee_payments fp
      JOIN users u ON fp.student_id = u.id
      JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      JOIN courses c ON fs.course_id = c.id
      JOIN fee_types ft ON fs.fee_type_id = ft.id
      JOIN academic_years ay ON fs.academic_year_id = ay.id
      JOIN users r ON fp.received_by = r.id
      ${whereClause}
      ORDER BY fp.payment_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM fee_payments fp
      JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      ${whereClause}
    `, params);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create fee payment
router.post('/payments', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'accountant'),
  body('student_id').isInt().withMessage('Valid student ID is required'),
  body('fee_structure_id').isInt().withMessage('Valid fee structure ID is required'),
  body('amount_paid').isFloat({ min: 0 }).withMessage('Amount paid must be a positive number'),
  body('payment_method').isIn(['cash', 'bank_transfer', 'mobile_money', 'card']).withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      student_id, fee_structure_id, amount_paid, payment_method,
      transaction_reference, payment_date, notes
    } = req.body;

    // Generate receipt number
    const year = new Date().getFullYear();
    const [lastReceipt] = await pool.execute(
      'SELECT receipt_number FROM fee_payments WHERE receipt_number LIKE ? ORDER BY receipt_number DESC LIMIT 1',
      [`RCP${year}%`]
    );

    let nextNumber = 1;
    if (lastReceipt.length > 0) {
      const lastNumber = parseInt(lastReceipt[0].receipt_number.slice(-6));
      nextNumber = lastNumber + 1;
    }

    const receipt_number = `RCP${year}${nextNumber.toString().padStart(6, '0')}`;

    const [result] = await pool.execute(`
      INSERT INTO fee_payments (
        student_id, fee_structure_id, amount_paid, payment_date, payment_method,
        transaction_reference, receipt_number, received_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, fee_structure_id, amount_paid,
      payment_date || new Date().toISOString().split('T')[0],
      payment_method, transaction_reference, receipt_number, req.user.id, notes
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment: {
        id: result.insertId,
        student_id,
        fee_structure_id,
        amount_paid,
        payment_method,
        receipt_number,
        transaction_reference
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update payment status
router.put('/payments/:id/status', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'accountant'),
  body('status').isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    await pool.execute(
      'UPDATE fee_payments SET status = ?, notes = ? WHERE id = ?',
      [status, notes, id]
    );

    res.json({
      success: true,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get student fee summary
router.get('/students/:studentId/fee-summary', [authenticateToken], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academic_year_id } = req.query;

    let whereClause = 'WHERE fs.is_active = true';
    const params = [studentId];

    if (academic_year_id) {
      whereClause += ' AND fs.academic_year_id = ?';
      params.push(academic_year_id);
    }

    // Get student's enrolled courses and their fee structures
    const [feeStructures] = await pool.execute(`
      SELECT fs.*, ft.name as fee_type_name, c.name as course_name,
        ay.name as academic_year_name,
        COALESCE(SUM(fp.amount_paid), 0) as total_paid,
        (fs.amount - COALESCE(SUM(fp.amount_paid), 0)) as balance
      FROM fee_structures fs
      JOIN fee_types ft ON fs.fee_type_id = ft.id
      JOIN courses c ON fs.course_id = c.id
      JOIN academic_years ay ON fs.academic_year_id = ay.id
      JOIN enrollments e ON fs.course_id = e.class_id
      LEFT JOIN fee_payments fp ON fs.id = fp.fee_structure_id AND fp.student_id = ? AND fp.status = 'completed'
      ${whereClause} AND e.student_id = ? AND e.status = 'active'
      GROUP BY fs.id
      ORDER BY c.name, ft.name
    `, [...params, studentId]);

    // Get payment history
    const [paymentHistory] = await pool.execute(`
      SELECT fp.*, ft.name as fee_type_name, c.name as course_name
      FROM fee_payments fp
      JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      JOIN fee_types ft ON fs.fee_type_id = ft.id
      JOIN courses c ON fs.course_id = c.id
      WHERE fp.student_id = ?
      ORDER BY fp.payment_date DESC
      LIMIT 10
    `, [studentId]);

    const totalAmount = feeStructures.reduce((sum, fs) => sum + parseFloat(fs.amount), 0);
    const totalPaid = feeStructures.reduce((sum, fs) => sum + parseFloat(fs.total_paid), 0);
    const totalBalance = totalAmount - totalPaid;

    res.json({
      success: true,
      summary: {
        total_amount: totalAmount,
        total_paid: totalPaid,
        total_balance: totalBalance,
        fee_structures: feeStructures,
        recent_payments: paymentHistory
      }
    });
  } catch (error) {
    console.error('Get student fee summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get financial reports
router.get('/reports/summary', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'accountant')
], async (req, res) => {
  try {
    const { date_from, date_to, academic_year_id } = req.query;

    let whereClause = 'WHERE fp.status = "completed"';
    const params = [];

    if (date_from) {
      whereClause += ' AND fp.payment_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND fp.payment_date <= ?';
      params.push(date_to);
    }

    if (academic_year_id) {
      whereClause += ' AND fs.academic_year_id = ?';
      params.push(academic_year_id);
    }

    // Total collections
    const [totalCollections] = await pool.execute(`
      SELECT 
        SUM(fp.amount_paid) as total_amount,
        COUNT(fp.id) as total_transactions,
        COUNT(DISTINCT fp.student_id) as unique_students
      FROM fee_payments fp
      JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      ${whereClause}
    `, params);

    // Collections by payment method
    const [collectionsByMethod] = await pool.execute(`
      SELECT 
        fp.payment_method,
        SUM(fp.amount_paid) as total_amount,
        COUNT(fp.id) as transaction_count
      FROM fee_payments fp
      JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      ${whereClause}
      GROUP BY fp.payment_method
      ORDER BY total_amount DESC
    `, params);

    // Collections by fee type
    const [collectionsByFeeType] = await pool.execute(`
      SELECT 
        ft.name as fee_type_name,
        SUM(fp.amount_paid) as total_amount,
        COUNT(fp.id) as transaction_count
      FROM fee_payments fp
      JOIN fee_structures fs ON fp.fee_structure_id = fs.id
      JOIN fee_types ft ON fs.fee_type_id = ft.id
      ${whereClause}
      GROUP BY ft.id
      ORDER BY total_amount DESC
    `, params);

    // Outstanding balances
    const [outstandingBalances] = await pool.execute(`
      SELECT 
        c.name as course_name,
        ft.name as fee_type_name,
        SUM(fs.amount) as total_expected,
        COALESCE(SUM(fp.amount_paid), 0) as total_paid,
        (SUM(fs.amount) - COALESCE(SUM(fp.amount_paid), 0)) as outstanding_balance
      FROM fee_structures fs
      JOIN courses c ON fs.course_id = c.id
      JOIN fee_types ft ON fs.fee_type_id = ft.id
      LEFT JOIN fee_payments fp ON fs.id = fp.fee_structure_id AND fp.status = 'completed'
      WHERE fs.is_active = true
      ${academic_year_id ? 'AND fs.academic_year_id = ?' : ''}
      GROUP BY fs.course_id, fs.fee_type_id
      HAVING outstanding_balance > 0
      ORDER BY outstanding_balance DESC
    `, academic_year_id ? [academic_year_id] : []);

    res.json({
      success: true,
      report: {
        total_collections: totalCollections[0],
        collections_by_method: collectionsByMethod,
        collections_by_fee_type: collectionsByFeeType,
        outstanding_balances: outstandingBalances
      }
    });
  } catch (error) {
    console.error('Get financial reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
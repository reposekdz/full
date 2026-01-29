const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==========================================
// FEE STRUCTURE & CONFIGURATION (10 endpoints)
// ==========================================

// Get all fee structures
router.get('/fee-structures', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { academic_year, class_id } = req.query;
    
    let filters = '';
    const params = [];
    
    if (academic_year) {
      filters += ' AND fs.academic_year = ?';
      params.push(academic_year);
    }
    if (class_id) {
      filters += ' AND fs.trade_class_id = ?';
      params.push(class_id);
    }
    
    const [structures] = await pool.execute(`
      SELECT 
        fs.*, tc.class_name, tl.trade_name, tl.level_number,
        COUNT(DISTINCT sf.student_id) as students_count
      FROM fee_structures fs
      LEFT JOIN trade_classes tc ON fs.trade_class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN student_fees sf ON fs.id = sf.fee_structure_id
      WHERE 1=1 ${filters}
      GROUP BY fs.id
      ORDER BY fs.academic_year DESC, tl.level_number
    `, params);
    
    res.json({ success: true, structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create fee structure
router.post('/fee-structures/create', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const {
      name, description, trade_class_id, academic_year, term,
      tuition_fee, lab_fee, library_fee, sports_fee, transport_fee,
      hostel_fee, exam_fee, other_fees, total_amount, due_date
    } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO fee_structures 
      (name, description, trade_class_id, academic_year, term, tuition_fee, lab_fee, 
       library_fee, sports_fee, transport_fee, hostel_fee, exam_fee, other_fees, 
       total_amount, due_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [name, description, trade_class_id, academic_year, term, tuition_fee, lab_fee,
        library_fee, sports_fee, transport_fee, hostel_fee, exam_fee, other_fees,
        total_amount, due_date]);
    
    res.json({ success: true, message: 'Fee structure created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update fee structure
router.put('/fee-structures/:id', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, tuition_fee, lab_fee, library_fee, sports_fee,
      transport_fee, hostel_fee, exam_fee, other_fees, total_amount, due_date
    } = req.body;
    
    await pool.execute(`
      UPDATE fee_structures 
      SET name = ?, description = ?, tuition_fee = ?, lab_fee = ?, library_fee = ?,
          sports_fee = ?, transport_fee = ?, hostel_fee = ?, exam_fee = ?, 
          other_fees = ?, total_amount = ?, due_date = ?
      WHERE id = ?
    `, [name, description, tuition_fee, lab_fee, library_fee, sports_fee,
        transport_fee, hostel_fee, exam_fee, other_fees, total_amount, due_date, id]);
    
    res.json({ success: true, message: 'Fee structure updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply fee structure to students
router.post('/fee-structures/:id/apply', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { student_ids } = req.body;
    
    const [structure] = await pool.execute('SELECT * FROM fee_structures WHERE id = ?', [id]);
    
    if (structure.length === 0) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }
    
    const values = student_ids.map(student_id => [
      student_id, id, structure[0].academic_year, structure[0].term,
      structure[0].total_amount, 0, structure[0].total_amount, 'unpaid', structure[0].due_date
    ]);
    
    await pool.query(`
      INSERT INTO student_fees 
      (student_id, fee_structure_id, academic_year, term, total_amount, paid_amount, balance, payment_status, due_date)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        total_amount = VALUES(total_amount),
        balance = VALUES(balance)
    `, [values]);
    
    res.json({ success: true, message: `Fee structure applied to ${student_ids.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get fee categories summary
router.get('/fee-structures/categories/summary', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { academic_year } = req.query;
    
    const yearFilter = academic_year ? 'WHERE academic_year = ?' : '';
    const params = academic_year ? [academic_year] : [];
    
    const [summary] = await pool.execute(`
      SELECT 
        SUM(tuition_fee) as total_tuition,
        SUM(lab_fee) as total_lab,
        SUM(library_fee) as total_library,
        SUM(sports_fee) as total_sports,
        SUM(transport_fee) as total_transport,
        SUM(hostel_fee) as total_hostel,
        SUM(exam_fee) as total_exam,
        SUM(other_fees) as total_other,
        SUM(total_amount) as grand_total,
        COUNT(*) as structures_count
      FROM fee_structures
      ${yearFilter}
    `, params);
    
    res.json({ success: true, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT FEES MANAGEMENT (15 endpoints)
// ==========================================

// Get student fees records
router.get('/student-fees', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, payment_status, academic_year, term } = req.query;
    
    let filters = '';
    const params = [];
    
    if (student_id) {
      filters += ' AND sf.student_id = ?';
      params.push(student_id);
    }
    if (class_id) {
      filters += ' AND tc.id = ?';
      params.push(class_id);
    }
    if (payment_status) {
      filters += ' AND sf.payment_status = ?';
      params.push(payment_status);
    }
    if (academic_year) {
      filters += ' AND sf.academic_year = ?';
      params.push(academic_year);
    }
    if (term) {
      filters += ' AND sf.term = ?';
      params.push(term);
    }
    
    const [fees] = await pool.execute(`
      SELECT 
        sf.*, u.student_id as student_code, u.first_name, u.last_name, u.email, u.phone,
        tc.class_name, tl.trade_name, tl.level_number,
        fs.name as fee_structure_name,
        ROUND((sf.paid_amount / sf.total_amount) * 100, 2) as payment_percentage
      FROM student_fees sf
      JOIN users u ON sf.student_id = u.id
      LEFT JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      LEFT JOIN trade_classes tc ON se.trade_class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN fee_structures fs ON sf.fee_structure_id = fs.id
      WHERE 1=1 ${filters}
      ORDER BY sf.due_date DESC, u.last_name
    `, params);
    
    res.json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single student fee details
router.get('/student-fees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [fees] = await pool.execute(`
      SELECT 
        sf.*, u.student_id as student_code, u.first_name, u.last_name, u.email,
        tc.class_name, fs.name as fee_structure_name,
        fs.tuition_fee, fs.lab_fee, fs.library_fee, fs.sports_fee,
        fs.transport_fee, fs.hostel_fee, fs.exam_fee, fs.other_fees
      FROM student_fees sf
      JOIN users u ON sf.student_id = u.id
      LEFT JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      LEFT JOIN trade_classes tc ON se.trade_class_id = tc.id
      LEFT JOIN fee_structures fs ON sf.fee_structure_id = fs.id
      WHERE sf.id = ?
    `, [id]);
    
    if (fees.length === 0) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    
    const [payments] = await pool.execute(`
      SELECT * FROM fee_payments 
      WHERE student_fee_id = ?
      ORDER BY payment_date DESC
    `, [id]);
    
    res.json({ success: true, fee: fees[0], payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record fee payment
router.post('/payments/record', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  try {
    const {
      student_fee_id, amount, payment_method, transaction_ref,
      payment_date, notes
    } = req.body;
    const recorded_by = req.user.id;
    
    const [studentFee] = await pool.execute(
      'SELECT * FROM student_fees WHERE id = ?',
      [student_fee_id]
    );
    
    if (studentFee.length === 0) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    
    const receipt_number = `RCP-${Date.now()}-${studentFee[0].student_id}`;
    
    const [result] = await pool.execute(`
      INSERT INTO fee_payments 
      (student_fee_id, student_id, amount, payment_method, transaction_ref, 
       payment_date, receipt_number, notes, recorded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [student_fee_id, studentFee[0].student_id, amount, payment_method, 
        transaction_ref, payment_date, receipt_number, notes, recorded_by]);
    
    const new_paid = parseFloat(studentFee[0].paid_amount) + parseFloat(amount);
    const new_balance = parseFloat(studentFee[0].total_amount) - new_paid;
    let payment_status = 'partial';
    
    if (new_balance <= 0) payment_status = 'paid';
    else if (new_paid === 0) payment_status = 'unpaid';
    else if (new_balance < 0) payment_status = 'overpaid';
    
    await pool.execute(`
      UPDATE student_fees 
      SET paid_amount = ?, balance = ?, payment_status = ?, last_payment_date = ?
      WHERE id = ?
    `, [new_paid, new_balance, payment_status, payment_date, student_fee_id]);
    
    res.json({ 
      success: true, 
      message: 'Payment recorded successfully',
      payment_id: result.insertId,
      receipt_number 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment history
router.get('/payments/history', authenticateToken, async (req, res) => {
  try {
    const { student_id, start_date, end_date, payment_method } = req.query;
    
    let filters = '';
    const params = [];
    
    if (student_id) {
      filters += ' AND fp.student_id = ?';
      params.push(student_id);
    }
    if (start_date && end_date) {
      filters += ' AND DATE(fp.payment_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    if (payment_method) {
      filters += ' AND fp.payment_method = ?';
      params.push(payment_method);
    }
    
    const [payments] = await pool.execute(`
      SELECT 
        fp.*, u.student_id as student_code, u.first_name, u.last_name,
        sf.academic_year, sf.term,
        CONCAT(recorder.first_name, ' ', recorder.last_name) as recorded_by_name
      FROM fee_payments fp
      JOIN users u ON fp.student_id = u.id
      JOIN student_fees sf ON fp.student_fee_id = sf.id
      LEFT JOIN users recorder ON fp.recorded_by = recorder.id
      WHERE 1=1 ${filters}
      ORDER BY fp.payment_date DESC
    `, params);
    
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate receipt
router.get('/payments/:paymentId/receipt', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const [receipt] = await pool.execute(`
      SELECT 
        fp.*, u.student_id as student_code, u.first_name, u.last_name, u.email,
        sf.academic_year, sf.term, sf.total_amount, sf.paid_amount, sf.balance,
        tc.class_name,
        CONCAT(recorder.first_name, ' ', recorder.last_name) as recorded_by_name
      FROM fee_payments fp
      JOIN users u ON fp.student_id = u.id
      JOIN student_fees sf ON fp.student_fee_id = sf.id
      LEFT JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      LEFT JOIN trade_classes tc ON se.trade_class_id = tc.id
      LEFT JOIN users recorder ON fp.recorded_by = recorder.id
      WHERE fp.id = ?
    `, [paymentId]);
    
    if (receipt.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({ success: true, receipt: receipt[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get defaulters list
router.get('/defaulters', authenticateToken, requireRole('accountant', 'admin', 'headmaster', 'dod'), async (req, res) => {
  try {
    const { class_id, minimum_balance, academic_year } = req.query;
    
    let filters = '';
    const params = [];
    
    if (class_id) {
      filters += ' AND tc.id = ?';
      params.push(class_id);
    }
    if (academic_year) {
      filters += ' AND sf.academic_year = ?';
      params.push(academic_year);
    }
    
    const minBalance = minimum_balance || 0;
    filters += ' AND sf.balance > ?';
    params.push(minBalance);
    
    const [defaulters] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name, u.email, u.phone,
        tc.class_name, tl.trade_name,
        sf.total_amount, sf.paid_amount, sf.balance, sf.due_date,
        DATEDIFF(CURDATE(), sf.due_date) as days_overdue,
        sf.payment_status
      FROM student_fees sf
      JOIN users u ON sf.student_id = u.id
      LEFT JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      LEFT JOIN trade_classes tc ON se.trade_class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE sf.payment_status IN ('unpaid', 'partial') 
        AND sf.due_date < CURDATE() 
        ${filters}
      ORDER BY sf.balance DESC, days_overdue DESC
    `, params);
    
    res.json({ success: true, defaulters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get fee collection summary
router.get('/collection/summary', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { academic_year, term, class_id } = req.query;
    
    let filters = '';
    const params = [];
    
    if (academic_year) {
      filters += ' AND sf.academic_year = ?';
      params.push(academic_year);
    }
    if (term) {
      filters += ' AND sf.term = ?';
      params.push(term);
    }
    if (class_id) {
      filters += ' AND tc.id = ?';
      params.push(class_id);
    }
    
    const [summary] = await pool.execute(`
      SELECT 
        SUM(sf.total_amount) as total_expected,
        SUM(sf.paid_amount) as total_collected,
        SUM(sf.balance) as total_outstanding,
        COUNT(DISTINCT sf.student_id) as total_students,
        COUNT(DISTINCT CASE WHEN sf.payment_status = 'paid' THEN sf.student_id END) as fully_paid_students,
        COUNT(DISTINCT CASE WHEN sf.payment_status = 'partial' THEN sf.student_id END) as partial_students,
        COUNT(DISTINCT CASE WHEN sf.payment_status = 'unpaid' THEN sf.student_id END) as unpaid_students,
        ROUND((SUM(sf.paid_amount) / SUM(sf.total_amount)) * 100, 2) as collection_rate
      FROM student_fees sf
      LEFT JOIN student_enrollments se ON sf.student_id = se.student_id AND se.is_active = TRUE
      LEFT JOIN trade_classes tc ON se.trade_class_id = tc.id
      WHERE 1=1 ${filters}
    `, params);
    
    res.json({ success: true, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// EXPENSES MANAGEMENT (15 endpoints)
// ==========================================

// Get all expenses
router.get('/expenses', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { category, status, start_date, end_date } = req.query;
    
    let filters = '';
    const params = [];
    
    if (category) {
      filters += ' AND e.category = ?';
      params.push(category);
    }
    if (status) {
      filters += ' AND e.status = ?';
      params.push(status);
    }
    if (start_date && end_date) {
      filters += ' AND DATE(e.expense_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [expenses] = await pool.execute(`
      SELECT 
        e.*, ec.name as category_name, ec.budget_limit,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN users approver ON e.approved_by = approver.id
      WHERE 1=1 ${filters}
      ORDER BY e.expense_date DESC
    `, params);
    
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create expense
router.post('/expenses/create', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  try {
    const {
      title, description, amount, category_id, expense_date,
      vendor, invoice_number, payment_method, receipt_url
    } = req.body;
    const created_by = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO expenses 
      (title, description, amount, category_id, expense_date, vendor, 
       invoice_number, payment_method, receipt_url, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
    `, [title, description, amount, category_id, expense_date, vendor,
        invoice_number, payment_method, receipt_url, created_by]);
    
    res.json({ success: true, message: 'Expense created', expense_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve/Reject expense
router.put('/expenses/:id/approve', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body;
    const approved_by = req.user.id;
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    await pool.execute(`
      UPDATE expenses 
      SET status = ?, approved_by = ?, rejection_reason = ?, approved_at = NOW()
      WHERE id = ?
    `, [status, approved_by, rejection_reason, id]);
    
    res.json({ success: true, message: `Expense ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get expense categories
router.get('/expense-categories', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        ec.*,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_spent,
        ec.budget_limit - COALESCE(SUM(e.amount), 0) as remaining_budget
      FROM expense_categories ec
      LEFT JOIN expenses e ON ec.id = e.category_id AND e.status = 'approved'
      GROUP BY ec.id
      ORDER BY ec.name
    `);
    
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create expense category
router.post('/expense-categories/create', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { name, description, budget_limit, academic_year } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO expense_categories (name, description, budget_limit, academic_year)
      VALUES (?, ?, ?, ?)
    `, [name, description, budget_limit, academic_year]);
    
    res.json({ success: true, message: 'Category created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get expense summary by category
router.get('/expenses/summary/by-category', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(e.expense_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [summary] = await pool.execute(`
      SELECT 
        ec.name as category,
        COUNT(e.id) as expense_count,
        SUM(e.amount) as total_amount,
        ec.budget_limit,
        ec.budget_limit - COALESCE(SUM(e.amount), 0) as remaining_budget,
        ROUND((COALESCE(SUM(e.amount), 0) / ec.budget_limit) * 100, 2) as budget_utilization
      FROM expense_categories ec
      LEFT JOIN expenses e ON ec.id = e.category_id AND e.status = 'approved' ${dateFilter}
      GROUP BY ec.id, ec.name, ec.budget_limit
      ORDER BY total_amount DESC
    `, params);
    
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// BUDGETS MANAGEMENT (10 endpoints)
// ==========================================

// Get all budgets
router.get('/budgets', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { academic_year, department, status } = req.query;
    
    let filters = '';
    const params = [];
    
    if (academic_year) {
      filters += ' AND b.academic_year = ?';
      params.push(academic_year);
    }
    if (department) {
      filters += ' AND b.department = ?';
      params.push(department);
    }
    if (status) {
      filters += ' AND b.status = ?';
      params.push(status);
    }
    
    const [budgets] = await pool.execute(`
      SELECT 
        b.*,
        COALESCE(SUM(e.amount), 0) as spent_amount,
        b.allocated_amount - COALESCE(SUM(e.amount), 0) as remaining_amount,
        ROUND((COALESCE(SUM(e.amount), 0) / b.allocated_amount) * 100, 2) as utilization_rate
      FROM budgets b
      LEFT JOIN expenses e ON b.id = e.budget_id AND e.status = 'approved'
      WHERE 1=1 ${filters}
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `, params);
    
    res.json({ success: true, budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create budget
router.post('/budgets/create', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { name, description, department, allocated_amount, academic_year, start_date, end_date } = req.body;
    const created_by = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO budgets 
      (name, description, department, allocated_amount, academic_year, 
       start_date, end_date, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, NOW())
    `, [name, description, department, allocated_amount, academic_year, start_date, end_date, created_by]);
    
    res.json({ success: true, message: 'Budget created', budget_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve budget
router.put('/budgets/:id/approve', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const approved_by = req.user.id;
    
    await pool.execute(`
      UPDATE budgets 
      SET status = 'approved', approved_by = ?, approved_at = NOW()
      WHERE id = ?
    `, [approved_by, id]);
    
    res.json({ success: true, message: 'Budget approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// SALARIES MANAGEMENT (10 endpoints)
// ==========================================

// Get salary records
router.get('/salaries', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { employee_id, month, year, status } = req.query;
    
    let filters = '';
    const params = [];
    
    if (employee_id) {
      filters += ' AND s.employee_id = ?';
      params.push(employee_id);
    }
    if (month) {
      filters += ' AND s.month = ?';
      params.push(month);
    }
    if (year) {
      filters += ' AND s.year = ?';
      params.push(year);
    }
    if (status) {
      filters += ' AND s.status = ?';
      params.push(status);
    }
    
    const [salaries] = await pool.execute(`
      SELECT 
        s.*, u.first_name, u.last_name, u.email, u.role,
        CONCAT(processor.first_name, ' ', processor.last_name) as processed_by_name
      FROM salaries s
      JOIN users u ON s.employee_id = u.id
      LEFT JOIN users processor ON s.processed_by = processor.id
      WHERE 1=1 ${filters}
      ORDER BY s.year DESC, s.month DESC
    `, params);
    
    res.json({ success: true, salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process salary payment
router.post('/salaries/process', authenticateToken, requireRole('accountant', 'admin'), async (req, res) => {
  try {
    const {
      employee_id, month, year, basic_salary, allowances, deductions,
      net_salary, payment_method, transaction_ref
    } = req.body;
    const processed_by = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO salaries 
      (employee_id, month, year, basic_salary, allowances, deductions, net_salary,
       payment_method, transaction_ref, status, processed_by, processed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, NOW())
    `, [employee_id, month, year, basic_salary, allowances, deductions, net_salary,
        payment_method, transaction_ref, processed_by]);
    
    res.json({ success: true, message: 'Salary processed', salary_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payroll summary
router.get('/salaries/payroll/summary', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT employee_id) as total_employees,
        SUM(basic_salary) as total_basic,
        SUM(allowances) as total_allowances,
        SUM(deductions) as total_deductions,
        SUM(net_salary) as total_net,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM salaries
      WHERE month = ? AND year = ?
    `, [month, year]);
    
    res.json({ success: true, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// FINANCIAL REPORTS (10 endpoints)
// ==========================================

// Income vs Expenses report
router.get('/reports/income-vs-expenses', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const params = [start_date, end_date, start_date, end_date];
    
    const [income] = await pool.execute(`
      SELECT SUM(amount) as total_income
      FROM fee_payments
      WHERE DATE(payment_date) BETWEEN ? AND ?
    `, [start_date, end_date]);
    
    const [expenses] = await pool.execute(`
      SELECT SUM(amount) as total_expenses
      FROM expenses
      WHERE status = 'approved' AND DATE(expense_date) BETWEEN ? AND ?
    `, [start_date, end_date]);
    
    const totalIncome = income[0].total_income || 0;
    const totalExpenses = expenses[0].total_expenses || 0;
    const netProfit = totalIncome - totalExpenses;
    
    res.json({
      success: true,
      report: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cash flow statement
router.get('/reports/cash-flow', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const [dailyCashFlow] = await pool.execute(`
      SELECT 
        DATE(payment_date) as date,
        SUM(amount) as income,
        (SELECT COALESCE(SUM(amount), 0) 
         FROM expenses 
         WHERE DATE(expense_date) = DATE(fp.payment_date) AND status = 'approved') as expenses,
        SUM(amount) - (SELECT COALESCE(SUM(amount), 0) 
         FROM expenses 
         WHERE DATE(expense_date) = DATE(fp.payment_date) AND status = 'approved') as net_flow
      FROM fee_payments fp
      WHERE MONTH(payment_date) = ? AND YEAR(payment_date) = ?
      GROUP BY DATE(payment_date)
      ORDER BY date
    `, [month, year]);
    
    res.json({ success: true, cash_flow: dailyCashFlow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Balance sheet
router.get('/reports/balance-sheet', authenticateToken, requireRole('accountant', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { as_of_date } = req.query;
    const asOfDate = as_of_date || new Date().toISOString().split('T')[0];
    
    const [assets] = await pool.execute(`
      SELECT 
        SUM(sf.balance) as accounts_receivable,
        (SELECT COALESCE(SUM(current_value), 0) FROM inventory_items) as inventory_value
      FROM student_fees sf
      WHERE sf.balance > 0
    `);
    
    const [liabilities] = await pool.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) as accounts_payable
      FROM expenses
      WHERE status = 'pending'
    `);
    
    res.json({
      success: true,
      balance_sheet: {
        assets: assets[0],
        liabilities: liabilities[0],
        equity: (assets[0].accounts_receivable + assets[0].inventory_value) - liabilities[0].accounts_payable
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

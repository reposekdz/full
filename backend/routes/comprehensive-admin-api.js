const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ============================================
// COMPREHENSIVE ADMIN API - Full Features
// ============================================

// GET Dashboard Stats
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Student stats
    const [studentStats] = await db.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_students,
        COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_students,
        COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_students
      FROM students
    `);

    // Staff stats
    const [staffStats] = await db.query(`
      SELECT 
        COUNT(*) as total_staff,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff
      FROM staff
    `);

    // Financial stats
    const [financialStats] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_expenses,
        (SELECT COALESCE(SUM(amount), 0) FROM fees) as expected_fees
      FROM fee_payments fp
      LEFT JOIN expenses e ON 1=1
    `);

    // Recent payments
    const [recentPayments] = await db.query(`
      SELECT fp.*, s.first_name, s.last_name, s.student_id
      FROM fee_payments fp
      LEFT JOIN students s ON fp.student_id = s.id
      ORDER BY fp.payment_date DESC
      LIMIT 10
    `);

    // Trade distribution
    const [tradeDistribution] = await db.query(`
      SELECT trade, COUNT(*) as count 
      FROM students 
      WHERE trade IS NOT NULL 
      GROUP BY trade
      ORDER BY count DESC
    `);

    // Level distribution
    const [levelDistribution] = await db.query(`
      SELECT level, COUNT(*) as count 
      FROM students 
      WHERE level IS NOT NULL 
      GROUP BY level
      ORDER BY level
    `);

    res.json({
      success: true,
      stats: {
        students: studentStats[0],
        staff: staffStats[0],
        financial: {
          total_income: financialStats[0]?.total_income || 0,
          total_expenses: financialStats[0]?.total_expenses || 0,
          expected_fees: financialStats[0]?.expected_fees || 0,
          balance: (financialStats[0]?.total_income || 0) - (financialStats[0]?.total_expenses || 0)
        },
        recent_payments: recentPayments,
        trade_distribution: tradeDistribution,
        level_distribution: levelDistribution
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET All Students with full details
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { page = 1, limit = 50, trade, level, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (trade) {
      whereConditions.push('(trade_code = ? OR trade_name = ?)');
      params.push(trade, trade);
    }
    if (level) {
      whereConditions.push('level_number = ?');
      params.push(parseInt(level));
    }
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ? OR student_code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Use global_student_sheets instead of students table
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM global_student_sheets ${whereClause}`, params);
    const total = countResult[0].total;

    const [students] = await db.query(`
      SELECT * FROM global_student_sheets
      ${whereClause}
      ORDER BY last_name, first_name
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Single Student
router.get('/students/:id', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;

    const [students] = await db.query(`
      SELECT s.*,
        (SELECT COALESCE(SUM(amount), 0) FROM fees WHERE student_id = s.id) as total_fees,
        (SELECT COALESCE(SUM(amount), 0) FROM fee_payments WHERE student_id = s.id AND status = 'completed') as total_paid
      FROM students s
      WHERE s.id = ?
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get fee history
    const [feeHistory] = await db.query(`
      SELECT * FROM fee_payments WHERE student_id = ? ORDER BY payment_date DESC
    `, [id]);

    // Get grades
    const [grades] = await db.query(`
      SELECT g.*, c.course_name FROM grades g
      LEFT JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC
    `, [id]);

    // Get attendance
    const [attendance] = await db.query(`
      SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30
    `, [id]);

    res.json({
      success: true,
      student: students[0],
      fee_history: feeHistory,
      grades: grades,
      attendance: attendance
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// CREATE Student
router.post('/students', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const student = req.body;

    // Generate student ID if not provided
    if (!student.student_id) {
      const year = new Date().getFullYear();
      const [count] = await db.query('SELECT COUNT(*) as count FROM students');
      student.student_id = `STU${year}${(count[0].count + 1).toString().padStart(4, '0')}`;
    }

    const fields = Object.keys(student);
    const values = Object.values(student);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await db.query(
      `INSERT INTO students (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student_id: result.insertId
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// UPDATE Student
router.put('/students/:id', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.password;
    delete updates.created_at;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');

    await db.query(
      `UPDATE students SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE Student
router.delete('/students/:id', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'super_admin', 'school_owner'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;

    await db.query('DELETE FROM students WHERE id = ?', [id]);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET All Staff
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { page = 1, limit = 50, department, role } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (department) {
      whereConditions.push('department = ?');
      params.push(department);
    }
    if (role) {
      whereConditions.push('role = ?');
      params.push(role);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM staff ${whereClause}`, params);
    const total = countResult[0].total;

    const [staff] = await db.query(`
      SELECT * FROM staff ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      staff,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// CREATE Staff
router.post('/staff', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'super_admin', 'school_owner'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const staff = req.body;

    const fields = Object.keys(staff);
    const values = Object.values(staff);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await db.query(
      `INSERT INTO staff (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      staff_id: result.insertId
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// UPDATE Staff
router.put('/staff/:id', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'super_admin', 'school_owner'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.password;
    delete updates.created_at;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map(f => `${f} = ?`).join(', ');

    await db.query(
      `UPDATE staff SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    res.json({ success: true, message: 'Staff updated successfully' });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Fees
router.get('/fees', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { page = 1, limit = 50, student_id, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (student_id) {
      whereConditions.push('student_id = ?');
      params.push(student_id);
    }
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [fees] = await db.query(`
      SELECT f.*, s.first_name, s.last_name, s.student_id
      FROM fees f
      LEFT JOIN students s ON f.student_id = s.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({ success: true, fees });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// CREATE Fee
router.post('/fees', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const fee = req.body;

    const fields = Object.keys(fee);
    const values = Object.values(fee);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await db.query(
      `INSERT INTO fees (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      fee_id: result.insertId
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Payments
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { page = 1, limit = 50, student_id, status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (student_id) {
      whereConditions.push('student_id = ?');
      params.push(student_id);
    }
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    if (start_date) {
      whereConditions.push('payment_date >= ?');
      params.push(start_date);
    }
    if (end_date) {
      whereConditions.push('payment_date <= ?');
      params.push(end_date);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [payments] = await db.query(`
      SELECT fp.*, s.first_name, s.last_name, s.student_id
      FROM fee_payments fp
      LEFT JOIN students s ON fp.student_id = s.id
      ${whereClause}
      ORDER BY fp.payment_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get totals
    const [totals] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_completed,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
        COUNT(*) as total_payments
      FROM fee_payments fp
    `);

    res.json({
      success: true,
      payments,
      totals: totals[0]
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// CREATE Payment
router.post('/payments', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payment = req.body;

    const fields = Object.keys(payment);
    const values = Object.values(payment);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await db.query(
      `INSERT INTO fee_payments (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment_id: result.insertId
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Expenses
router.get('/expenses', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { page = 1, limit = 50, category, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [expenses] = await db.query(`
      SELECT * FROM expenses ${whereClause} ORDER BY expense_date DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get totals
    const [totals] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
        COUNT(*) as total_expenses
      FROM expenses
    `);

    res.json({
      success: true,
      expenses,
      totals: totals[0]
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// CREATE Expense
router.post('/expenses', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const expense = req.body;

    const fields = Object.keys(expense);
    const values = Object.values(expense);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await db.query(
      `INSERT INTO expenses (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense_id: result.insertId
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Reports/Analytics
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { type = 'overview', start_date, end_date } = req.query;

    let dateFilter = '';
    let params = [];

    if (start_date && end_date) {
      dateFilter = 'WHERE payment_date BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    // Payment trends
    const [paymentTrends] = await db.query(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total
      FROM fee_payments ${dateFilter}
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month
    `, params);

    // Expense trends
    const [expenseTrends] = await db.query(`
      SELECT 
        DATE_FORMAT(expense_date, '%Y-%m') as month,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total
      FROM expenses ${dateFilter}
      GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
      ORDER BY month
    `, params);

    // Trade performance
    const [tradePerformance] = await db.query(`
      SELECT 
        trade,
        COUNT(*) as student_count,
        COALESCE(SUM((SELECT SUM(amount) FROM fee_payments WHERE student_id = students.id AND status = 'completed')), 0) as total_paid
      FROM students
      WHERE trade IS NOT NULL
      GROUP BY trade
      ORDER BY student_count DESC
    `);

    res.json({
      success: true,
      reports: {
        payment_trends: paymentTrends,
        expense_trends: expenseTrends,
        trade_performance: tradePerformance
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Parents
router.get('/parents', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [parents] = await db.query(`
      SELECT * FROM parents ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get linked students for each parent
    for (let parent of parents) {
      const [linkedStudents] = await db.query(`
        SELECT s.id, s.student_id, s.first_name, s.last_name, s.trade, s.level
        FROM students s
        JOIN parent_students ps ON s.id = ps.student_id
        WHERE ps.parent_id = ?
      `, [parent.id]);
      parent.linked_students = linkedStudents;
    }

    res.json({ success: true, parents });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Students by Level and Trade (e.g., Level 4 SOD)
router.get('/students/level-trade', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner', 'dos', 'dod', 'headmaster'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { level, trade } = req.query;

    let whereConditions = [];
    let params = [];

    if (level) {
      whereConditions.push('level = ?');
      params.push(level);
    }
    if (trade) {
      whereConditions.push('trade = ?');
      params.push(trade);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [students] = await db.query(`
      SELECT s.*,
        (SELECT COALESCE(SUM(amount), 0) FROM fees WHERE student_id = s.id) as total_fees,
        (SELECT COALESCE(SUM(amount), 0) FROM fee_payments WHERE student_id = s.id AND status = 'completed') as total_paid,
        (SELECT COALESCE(SUM(amount), 0) FROM fees WHERE student_id = s.id) - 
        (SELECT COALESCE(SUM(amount), 0) FROM fee_payments WHERE student_id = s.id AND status = 'completed') as balance
      FROM students s
      ${whereClause}
      ORDER BY s.last_name, s.first_name
    `, params);

    res.json({ 
      success: true, 
      students,
      count: students.length,
      level: level,
      trade: trade
    });
  } catch (error) {
    console.error('Get students by level/trade error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Dashboard summary for Level 4 SOD
router.get('/dashboard/sod-level4', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get students from global_student_sheets table with level filter
    const levelFilter = req.query.level || 'Level 4';
    let students = [];
    try {
      let [studentsResult] = await db.query(`
        SELECT * FROM global_student_sheets 
        WHERE level_number = 4
        ORDER BY last_name, first_name
        LIMIT 100
      `);
      
      console.log('global_student_sheets Level 4 found:', studentsResult.length);
      students = studentsResult;
      
      // If empty, get all students
      if (students.length === 0) {
        [studentsResult] = await db.query(`
          SELECT * FROM global_student_sheets 
          ORDER BY id DESC LIMIT 100
        `);
        console.log('global_student_sheets all found:', studentsResult.length);
        students = studentsResult;
      }
    } catch (e) {
      console.error('Error getting students:', e);
    }

    // Add computed fields
    const studentsWithPayment = students.map(s => ({
      ...s,
      student_id: s.student_code || s.student_id,
      first_name: s.first_name,
      last_name: s.last_name,
      gender: s.gender,
      level: s.level_name || s.level_number || s.level,
      trade: s.trade_name || s.trade,
      total_fees: s.total_fees || s.fee_balance || 0,
      total_paid: s.total_fees_paid || s.paid_amount || 0,
      balance: s.balance || s.fee_balance || 0,
      payment_status: (s.payment_status === 'paid' || s.balance <= 0) ? 'paid' : 
                      (s.payment_status === 'unpaid' || s.balance > 0) ? 'unpaid' : 'partial'
    }));

    // Calculate totals
    const totalFees = students.reduce((sum, s) => sum + (s.total_fees || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + (s.total_paid || 0), 0);
    const totalBalance = totalFees - totalPaid;
    const paidStudents = students.filter(s => (s.total_fees || 0) - (s.total_paid || 0) <= 0).length;
    const unpaidStudents = students.filter(s => s.total_paid === 0).length;
    const partialStudents = students.filter(s => s.total_paid > 0 && (s.total_fees || 0) - s.total_paid > 0).length;

    res.json({
      success: true,
      summary: {
        total_students: students.length,
        total_fees: totalFees,
        total_paid: totalPaid,
        balance: totalBalance,
        paid_students: paidStudents,
        unpaid_students: unpaidStudents,
        partial_students: partialStudents
      },
      students: students.map(s => ({
        ...s,
        balance: (s.total_fees || 0) - (s.total_paid || 0),
        payment_status: (s.total_fees || 0) - (s.total_paid || 0) <= 0 ? 'paid' : 
                        s.total_paid === 0 ? 'unpaid' : 'partial'
      }))
    });
  } catch (error) {
    console.error('Get SOD Level 4 dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Export Level 4 SOD to Excel
router.get('/export/sod-level4', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Try exact match first, then partial match
    let students = [];
    try {
      let [studentsResult] = await db.query(`
        SELECT s.*,
          (SELECT COALESCE(SUM(amount), 0) FROM fees WHERE student_id = s.id) as total_fees,
          (SELECT COALESCE(SUM(amount), 0) FROM fee_payments WHERE student_id = s.id AND status = 'completed') as total_paid
        FROM students s
        WHERE (s.level = 'Level 4' OR s.level = '4' OR s.level LIKE '%4%') AND (s.trade = 'SOD' OR s.trade LIKE '%SOD%' OR s.trade LIKE '%Social%')
        ORDER BY s.last_name, s.first_name
      `);
      students = studentsResult;
      
      // If no students found with Level 4, get all SOD students
      if (students.length === 0) {
        [studentsResult] = await db.query(`
          SELECT s.*,
            (SELECT COALESCE(SUM(amount), 0) FROM fees WHERE student_id = s.id) as total_fees,
            (SELECT COALESCE(SUM(amount), 0) FROM fee_payments WHERE student_id = s.id AND status = 'completed') as total_paid
          FROM students s
          WHERE s.trade LIKE '%SOD%' OR s.trade LIKE '%Social%'
          ORDER BY s.level, s.last_name, s.first_name
        `);
        students = studentsResult;
      }

      // If still no students, get ALL students to debug
      if (students.length === 0) {
        [studentsResult] = await db.query(`
          SELECT s.*,
            (SELECT COALESCE(SUM(amount), 0) FROM fees WHERE student_id = s.id) as total_fees,
            (SELECT COALESCE(SUM(amount), 0) FROM fee_payments WHERE student_id = s.id AND status = 'completed') as total_paid
          FROM students s
          ORDER BY s.id DESC
          LIMIT 50
        `);
        students = studentsResult;
        console.log('DEBUG: No SOD students found, returning all students. Count:', students.length);
      }
    } catch (queryError) {
      console.error('Query error:', queryError);
    }

    // Format for Excel
    const excelData = students.map(s => ({
      'Student ID': s.student_id,
      'First Name': s.first_name,
      'Last Name': s.last_name,
      'Email': s.email,
      'Phone': s.phone,
      'Gender': s.gender,
      'Trade': s.trade,
      'Level': s.level,
      'Academic Year': s.academic_year,
      'Status': s.status,
      'Province': s.province,
      'District': s.district,
      'Guardian Name': s.guardian_name,
      'Guardian Phone': s.guardian_phone,
      'Total Fees': s.total_fees || 0,
      'Total Paid': s.total_paid || 0,
      'Balance': (s.total_fees || 0) - (s.total_paid || 0),
      'Payment Status': (s.total_fees || 0) - (s.total_paid || 0) <= 0 ? 'PAID' : 
                        s.total_paid === 0 ? 'UNPAID' : 'PARTIAL'
    }));

    res.json({
      success: true,
      data: excelData,
      count: excelData.length,
      format: 'excel-ready'
    });
  } catch (error) {
    console.error('Export SOD Level 4 error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Export Students to Excel
router.get('/export/students', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { trade, level, status } = req.query;

    let whereConditions = [];
    let params = [];

    if (trade) {
      whereConditions.push('s.trade = ?');
      params.push(trade);
    }
    if (level) {
      whereConditions.push('s.level = ?');
      params.push(level);
    }
    if (status) {
      whereConditions.push('s.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [students] = await db.query(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.gender,
        s.trade,
        s.level,
        s.academic_year,
        s.status,
        s.enrollment_date,
        s.province,
        s.district,
        s.guardian_name,
        s.guardian_phone,
        COALESCE((SELECT SUM(amount) FROM fees WHERE student_id = s.id), 0) as total_fees,
        COALESCE((SELECT SUM(amount) FROM fee_payments WHERE student_id = s.id AND status = 'completed'), 0) as total_paid
      FROM students s
      ${whereClause}
      ORDER BY s.trade, s.level, s.last_name
    `, params);

    // Format for Excel
    const excelData = students.map(s => ({
      'Student ID': s.student_id,
      'First Name': s.first_name,
      'Last Name': s.last_name,
      'Email': s.email,
      'Phone': s.phone,
      'Gender': s.gender,
      'Trade': s.trade,
      'Level': s.level,
      'Academic Year': s.academic_year,
      'Status': s.status,
      'Enrollment Date': s.enrollment_date,
      'Province': s.province,
      'District': s.district,
      'Guardian Name': s.guardian_name,
      'Guardian Phone': s.guardian_phone,
      'Total Fees': s.total_fees,
      'Total Paid': s.total_paid,
      'Balance': s.total_fees - s.total_paid
    }));

    res.json({
      success: true,
      data: excelData,
      count: excelData.length,
      format: 'excel-ready'
    });
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Search Students - for parent linking
router.get('/search-students', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, gender, level, trade } = req.query;
    
    let query = `SELECT * FROM global_student_sheets WHERE 1=1`;
    const params = [];
    
    if (firstName) {
      query += ` AND first_name LIKE ?`;
      params.push(`%${firstName}%`);
    }
    if (lastName) {
      query += ` AND last_name LIKE ?`;
      params.push(`%${lastName}%`);
    }
    if (gender) {
      query += ` AND gender = ?`;
      params.push(gender);
    }
    if (level) {
      query += ` AND level_number = ?`;
      params.push(parseInt(level));
    }
    if (trade) {
      query += ` AND (trade_name LIKE ? OR trade_code LIKE ?)`;
      params.push(`%${trade}%`, `%${trade}%`);
    }
    
    query += ` LIMIT 50`;
    
    const [students] = await db.query(query, params);
    
    res.json({
      success: true,
      students: students
    });
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============================================
// TERMS MANAGEMENT (Rwanda 3 Terms)
// ============================================

// GET all terms
router.get('/terms', authenticateToken, async (req, res) => {
  try {
    const { academic_year } = req.query;
    let query = 'SELECT * FROM academic_terms';
    let params = [];
    
    if (academic_year) {
      query += ' WHERE academic_year = ?';
      params.push(academic_year);
    }
    query += ' ORDER BY term_number';
    
    const [terms] = await db.query(query, params);
    res.json({ success: true, terms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET current term
router.get('/terms/current', authenticateToken, async (req, res) => {
  try {
    const [terms] = await db.query('SELECT * FROM academic_terms WHERE is_current = TRUE OR status = "active" ORDER BY term_number LIMIT 1');
    res.json({ success: true, term: terms[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE term
router.post('/terms', authenticateToken, requireRole(['admin', 'super_admin', 'school_owner']), async (req, res) => {
  try {
    const { term_number, term_name, start_date, end_date, academic_year } = req.body;
    
    // Set other terms to not current
    await db.query('UPDATE academic_terms SET is_current = FALSE');
    
    const [result] = await db.query(
      'INSERT INTO academic_terms (term_number, term_name, start_date, end_date, academic_year, is_current, status) VALUES (?, ?, ?, ?, ?, TRUE, "active")',
      [term_number, term_name, start_date, end_date, academic_year]
    );
    
    res.json({ success: true, message: 'Term created successfully', term_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE term
router.put('/terms/:id', authenticateToken, requireRole(['admin', 'super_admin', 'school_owner']), async (req, res) => {
  try {
    const { term_name, start_date, end_date, status, is_current } = req.body;
    
    if (is_current) {
      await db.query('UPDATE academic_terms SET is_current = FALSE');
    }
    
    await db.query(
      'UPDATE academic_terms SET term_name = ?, start_date = ?, end_date = ?, status = ?, is_current = ? WHERE id = ?',
      [term_name, start_date, end_date, status, is_current || false, req.params.id]
    );
    
    res.json({ success: true, message: 'Term updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FEE STRUCTURE MANAGEMENT
// ============================================

// GET fee categories
router.get('/fee-categories', authenticateToken, async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM fee_categories WHERE is_active = TRUE');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE fee structure
router.post('/fee-structures', authenticateToken, requireRole(['admin', 'super_admin', 'accountant', 'school_owner']), async (req, res) => {
  try {
    const { academic_year, term_id, category_id, amount, level, trade, due_date, description } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO fee_structures (academic_year, term_id, category_id, amount, level, trade, due_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [academic_year, term_id, category_id, amount, level, trade, due_date, description]
    );
    
    res.json({ success: true, message: 'Fee structure created', fee_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET fee structures
router.get('/fee-structures', authenticateToken, async (req, res) => {
  try {
    const { academic_year, term_id } = req.query;
    let query = `
      SELECT fs.*, fc.name as category_name, at.term_name 
      FROM fee_structures fs
      LEFT JOIN fee_categories fc ON fs.category_id = fc.id
      LEFT JOIN academic_terms at ON fs.term_id = at.id
      WHERE fs.is_active = TRUE
    `;
    let params = [];
    
    if (academic_year) {
      query += ' AND fs.academic_year = ?';
      params.push(academic_year);
    }
    if (term_id) {
      query += ' AND fs.term_id = ?';
      params.push(term_id);
    }
    
    query += ' ORDER BY at.term_number, fc.name';
    
    const [structures] = await db.query(query, params);
    res.json({ success: true, structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT FEES MANAGEMENT
// ============================================

// GET student fees
router.get('/student-fees/:studentId', authenticateToken, async (req, res) => {
  try {
    const { academic_year, term_id } = req.query;
    let query = 'SELECT * FROM student_fees WHERE student_id = ?';
    let params = [req.params.studentId];
    
    if (academic_year) {
      query += ' AND academic_year = ?';
      params.push(academic_year);
    }
    if (term_id) {
      query += ' AND term_id = ?';
      params.push(term_id);
    }
    
    const [fees] = await db.query(query, params);
    res.json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE student fees from fee structure
router.post('/student-fees/generate', authenticateToken, requireRole(['admin', 'super_admin', 'accountant', 'school_owner']), async (req, res) => {
  try {
    const { academic_year, term_id, level, trade } = req.body;
    
    // Get fee structures for this term/academic year
    let feeQuery = 'SELECT * FROM fee_structures WHERE academic_year = ? AND term_id = ? AND is_active = TRUE';
    let feeParams = [academic_year, term_id];
    
    if (level) {
      feeQuery += ' AND (level = ? OR level IS NULL)';
      feeParams.push(level);
    }
    if (trade) {
      feeQuery += ' AND (trade = ? OR trade IS NULL)';
      feeParams.push(trade);
    }
    
    const [feeStructures] = await db.query(feeQuery, feeParams);
    
    // Get students
    const [students] = await db.query(
      'SELECT student_id FROM global_student_sheets WHERE status = "active"' + 
      (level ? ' AND level_number = ?' : '') +
      (trade ? ' AND (trade_code = ? OR trade_name = ?)' : ''),
      level ? [parseInt(level)] : []
    );
    
    let created = 0;
    for (const student of students) {
      for (const fee of feeStructures) {
        await db.query(
          'INSERT INTO student_fees (student_id, academic_year, term_id, category_id, amount, due_date, status) VALUES (?, ?, ?, ?, ?, ?, "pending")',
          [student.student_id, academic_year, term_id, fee.category_id, fee.amount, fee.due_date]
        );
        created++;
      }
    }
    
    res.json({ success: true, message: `Created ${created} student fees` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// RECORD PAYMENT
router.post('/payments', authenticateToken, requireRole(['admin', 'super_admin', 'accountant', 'school_owner']), async (req, res) => {
  try {
    const { student_id, academic_year, term_id, amount, payment_method, transaction_ref, payment_date, notes } = req.body;
    
    // Insert payment
    const [paymentResult] = await db.query(
      'INSERT INTO student_payments (student_id, academic_year, term_id, amount, payment_method, transaction_ref, payment_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, academic_year, term_id, amount, payment_method, transaction_ref, payment_date, notes]
    );
    
    // Update student fees status
    const [unpaidFees] = await db.query(
      'SELECT * FROM student_fees WHERE student_id = ? AND academic_year = ? AND term_id = ? AND status IN ("pending", "partial") ORDER BY due_date',
      [student_id, academic_year, term_id]
    );
    
    let remainingAmount = amount;
    for (const fee of unpaidFees) {
      if (remainingAmount <= 0) break;
      
      const paidAmount = Math.min(remainingAmount, fee.amount);
      
      // Get current paid amount for this fee
      const [payments] = await db.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM student_payments WHERE student_id = ? AND term_id = ? AND status = "completed"',
        [student_id, term_id]
      );
      
      const newStatus = (payments[0].total + paidAmount) >= fee.amount ? 'paid' : 'partial';
      
      await db.query(
        'UPDATE student_fees SET status = ? WHERE id = ?',
        [newStatus, fee.id]
      );
      
      remainingAmount -= paidAmount;
    }
    
    res.json({ success: true, message: 'Payment recorded successfully', payment_id: paymentResult.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET student payments
router.get('/payments/:studentId', authenticateToken, async (req, res) => {
  try {
    const { academic_year, term_id } = req.query;
    let query = 'SELECT * FROM student_payments WHERE student_id = ? AND status = "completed"';
    let params = [req.params.studentId];
    
    if (academic_year) {
      query += ' AND academic_year = ?';
      params.push(academic_year);
    }
    if (term_id) {
      query += ' AND term_id = ?';
      params.push(term_id);
    }
    
    query += ' ORDER BY payment_date DESC';
    
    const [payments] = await db.query(query, params);
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET fee summary for student
router.get('/student-fees-summary/:studentId', authenticateToken, async (req, res) => {
  try {
    const { academic_year } = req.query;
    const studentId = req.params.studentId;
    
    // Get all fees for student
    let query = `SELECT sf.*, fc.name as category_name, at.term_name, at.term_number 
      FROM student_fees sf 
      LEFT JOIN fee_categories fc ON sf.category_id = fc.id 
      LEFT JOIN academic_terms at ON sf.term_id = at.id 
      WHERE sf.student_id = ?`;
    let params = [studentId];
    
    if (academic_year) {
      query += ' AND sf.academic_year = ?';
      params.push(academic_year);
    }
    query += ' ORDER BY at.term_number, fc.name';
    
    const [fees] = await db.query(query, params);
    
    // Get payments
    const [payments] = await db.query(
      'SELECT term_id, SUM(amount) as total_paid FROM student_payments WHERE student_id = ? AND status = "completed" GROUP BY term_id',
      [studentId]
    );
    
    const paymentByTerm = {};
    payments.forEach(p => {
      paymentByTerm[p.term_id] = parseFloat(p.total_paid);
    });
    
    // Calculate totals
    let totalFees = 0;
    let totalPaid = 0;
    fees.forEach(fee => {
      totalFees += parseFloat(fee.amount);
      totalPaid += paymentByTerm[fee.term_id] || 0;
    });
    
    res.json({
      success: true,
      summary: {
        total_fees: totalFees,
        total_paid: totalPaid,
        balance: totalFees - totalPaid,
        fees_by_term: fees,
        payments_by_term: paymentByTerm
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// POST Change User Password (Admin/Accountant can change any user password)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'accountant', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { userId, newPassword, forceChange } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'User ID and new password required' });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and force change flag
    await db.query(
      `UPDATE users SET password = ?, force_password_change = ? WHERE id = ?`,
      [hashedPassword, forceChange ? 1 : 0, userId]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET Staff with password change status
router.get('/staff/password-status', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [staff] = await db.query(`
      SELECT id, first_name, last_name, email, role, force_password_change, last_login
      FROM users
      WHERE role IN ('accountant', 'admin', 'super_admin', 'school_owner', 'dos', 'dod', 'headmaster', 'teacher')
      ORDER BY role, last_name
    `);

    res.json({ success: true, staff });
  } catch (error) {
    console.error('Get staff password status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST Force password change for a staff member
router.post('/staff/force-password-change', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' });
    }

    await db.query(
      'UPDATE users SET force_password_change = 1 WHERE id = ?',
      [staffId]
    );

    res.json({ success: true, message: 'Password change forced successfully' });
  } catch (error) {
    console.error('Force password change error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST Reset password for a staff member
router.post('/staff/reset-password', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'super_admin', 'school_owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { staffId, newPassword } = req.body;
    if (!staffId || !newPassword) {
      return res.status(400).json({ success: false, message: 'Staff ID and new password are required' });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ?, force_password_change = 0 WHERE id = ?',
      [hashedPassword, staffId]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;

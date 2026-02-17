/**
 * ========================================================
 * COMPREHENSIVE ROLE-BASED API FOR ALL 8 ROLES
 * ========================================================
 * This API provides complete functionality for:
 * - Admin: Full system management
 * - Accountant: Complete financial management
 * - Teacher: Full academic management
 * - Advisor: Comprehensive counseling
 * - DOS: Student affairs management
 * - DOD: Discipline management
 * - Headmaster: Leadership & strategic management
 * - Stock Manager: Inventory management
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Role definitions
const ROLES = {
  ADMIN: ['admin'],
  ACCOUNTANT: ['accountant', 'admin', 'headmaster'],
  TEACHER: ['teacher', 'admin', 'dos'],
  ADVISOR: ['advisor', 'admin', 'counselor'],
  DOS: ['director_study', 'admin', 'headmaster'],
  DOD: ['director_discipline', 'matron', 'patron', 'admin'],
  HEADMASTER: ['headmaster', 'admin', 'owner'],
  STOCK_MANAGER: ['stock_manager', 'admin', 'headmaster']
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const formatCurrency = (amount) => new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  return 'F';
};

// ============================================================
// COMMON DASHBOARD (Available to all authenticated users)
// ============================================================

router.get('/common/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Get basic stats based on role
    const [[{ totalStudents }]] = await pool.execute('SELECT COUNT(*) as total FROM global_student_sheets WHERE status = ?', ['active']);
    const [[{ totalStaff }]] = await pool.execute('SELECT COUNT(*) as total FROM staff WHERE status = ?', ['active']);
    const [[{ totalTeachers }]] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = ?', ['teacher']);

    res.json({
      success: true,
      dashboard: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        quickStats: {
          totalStudents,
          totalStaff,
          totalTeachers
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Common dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ADMIN DASHBOARD API
// ============================================================

router.get('/admin/dashboard', authenticateToken, requireRole(...ROLES.ADMIN), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Get comprehensive admin stats
    const [[studentStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_students
      FROM global_student_sheets
    `);

    const [[staffStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_staff
      FROM staff
    `);

    const [[revenueStats]] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
      FROM transactions
      WHERE transaction_date >= ?
    `, [startOfMonth]);

    const [[courseStats]] = await pool.execute('SELECT COUNT(*) as total FROM courses');

    const [[stockStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity * unit_price) as total_value
      FROM stock_items
    `);

    const [[recentActivities]] = await pool.execute(`
      SELECT * FROM system_logs 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    const [[pendingApprovals]] = await pool.execute(`
      SELECT COUNT(*) as total FROM approval_requests WHERE status = 'pending'
    `);

    res.json({
      success: true,
      dashboard: {
        students: studentStats,
        staff: staffStats,
        revenue: {
          ...revenueStats,
          net_income: (revenueStats.total_income || 0) - (revenueStats.total_expenses || 0)
        },
        courses: courseStats,
        stock: stockStats,
        pendingApprovals: pendingApprovals,
        recentActivities,
        systemHealth: {
          server: 'online',
          database: 'connected',
          api: 'active'
        }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/admin/users', authenticateToken, requireRole(...ROLES.ADMIN), async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (status) {
      query += ' AND is_active = ?';
      params.push(status === 'active');
    }
    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await pool.execute(query, params);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admin/users', authenticateToken, requireRole(...ROLES.ADMIN), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role, password } = req.body;

    // Get the role_id from roles table
    const [roleResult] = await pool.execute('SELECT id FROM roles WHERE name = ?', [role]);
    if (roleResult.length === 0) {
      return res.status(400).json({ success: false, message: `Role '${role}' not found in system` });
    }
    const roleId = roleResult[0].id;

    const [result] = await pool.execute(`
      INSERT INTO users (first_name, last_name, email, phone, role, role_id, password, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `, [first_name, last_name, email, phone, role, roleId, password || 'default123']);

    res.json({
      success: true,
      message: 'User created successfully',
      user_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/admin/users/:id', authenticateToken, requireRole(...ROLES.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, role, is_active } = req.body;

    await pool.execute(`
      UPDATE users SET first_name=?, last_name=?, email=?, phone=?, role=?, is_active=?, updated_at=NOW()
      WHERE id=?
    `, [first_name, last_name, email, phone, role, is_active, id]);

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/admin/users/:id', authenticateToken, requireRole(...ROLES.ADMIN), async (req, res) => {
  try {
    await pool.execute('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ACCOUNTANT DASHBOARD API
// ============================================================

router.get('/accountant/dashboard', authenticateToken, requireRole(...ROLES.ACCOUNTANT), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    // Income stats
    const [[incomeStats]] = await pool.execute(`
      SELECT 
        SUM(amount) as total_income,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_transaction
      FROM transactions
      WHERE type = 'income' AND transaction_date BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Expense stats
    const [[expenseStats]] = await pool.execute(`
      SELECT 
        SUM(amount) as total_expenses,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_transaction
      FROM transactions
      WHERE type = 'expense' AND transaction_date BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Student fees
    const [[feeStats]] = await pool.execute(`
      SELECT 
        SUM(total_fees) as expected_fees,
        SUM(paid_amount) as collected_fees,
        SUM(balance) as outstanding_fees,
        COUNT(*) as total_students,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as fully_paid,
        SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_paid,
        SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid
      FROM global_student_sheets
      WHERE status = 'active'
    `);

    // Recent payments
    const [[recentPayments]] = await pool.execute(`
      SELECT spr.*, gss.first_name, gss.last_name, gss.student_code
      FROM student_payment_records spr
      JOIN global_student_sheets gss ON spr.student_id = gss.student_id
      ORDER BY spr.payment_date DESC
      LIMIT 20
    `);

    // Monthly trends
    const [[monthlyTrends]] = await pool.execute(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month
    `);

    // Overdue payments
    const [[overduePayments]] = await pool.execute(`
      SELECT 
        student_id, CONCAT(first_name, ' ', last_name) as student_name,
        total_fees, paid_amount, balance, payment_deadline,
        DATEDIFF(NOW(), payment_deadline) as days_overdue
      FROM global_student_sheets
      WHERE status = 'active' AND balance > 0 AND payment_deadline < NOW()
      ORDER BY days_overdue DESC
      LIMIT 20
    `);

    const netIncome = (incomeStats.total_income || 0) - (expenseStats.total_expenses || 0);
    const collectionRate = feeStats.expected_fees > 0
      ? ((feeStats.collected_fees / feeStats.expected_fees) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      dashboard: {
        summary: {
          total_income: incomeStats.total_income || 0,
          total_expenses: expenseStats.total_expenses || 0,
          net_income: netIncome,
          student_fees: feeStats,
          collection_rate: collectionRate
        },
        recent_payments: recentPayments,
        overdue_payments: overduePayments,
        monthly_trends: monthlyTrends
      }
    });
  } catch (error) {
    console.error('Accountant dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/accountant/payments/record', authenticateToken, requireRole(...ROLES.ACCOUNTANT), async (req, res) => {
  try {
    const { student_id, amount, payment_method, reference_number, payment_date, notes } = req.body;

    if (!student_id || !amount) {
      return res.status(400).json({ success: false, message: 'Student ID and amount are required' });
    }

    // Get student
    const [[student]] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ? AND status = ?',
      [student_id, 'active']
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Active student not found' });
    }

    // Record payment
    const [paymentResult] = await pool.execute(`
      INSERT INTO student_payment_records (
        student_id, amount, payment_method, reference_number, payment_date, notes, recorded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [student_id, amount, payment_method || 'cash', reference_number, payment_date || new Date().toISOString().split('T')[0], notes, req.user.id]);

    // Update student balance
    const newBalance = (student.balance || 0) - amount;
    const newPaidAmount = (student.paid_amount || 0) + parseFloat(amount);
    const newStatus = newBalance <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'unpaid';

    await pool.execute(`
      UPDATE global_student_sheets 
      SET paid_amount = ?, balance = ?, payment_status = ?, last_payment_date = ?, updated_at = NOW()
      WHERE student_id = ?
    `, [newPaidAmount, newBalance, newStatus, payment_date || new Date().toISOString().split('T')[0], student_id]);

    // Record transaction
    await pool.execute(`
      INSERT INTO transactions (type, category, amount, description, transaction_date, reference_id, reference_type, created_by, status)
      VALUES ('income', 'Student Fees', ?, ?, ?, ?, 'student_payment', ?, 'completed')
    `, [
      amount,
      `Payment from ${student.first_name} ${student.last_name}`,
      payment_date || new Date().toISOString().split('T')[0],
      paymentResult.insertId,
      req.user.id
    ]);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment_id: paymentResult.insertId,
      new_balance: newBalance,
      payment_status: newStatus
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/accountant/transactions', authenticateToken, requireRole(...ROLES.ACCOUNTANT), async (req, res) => {
  try {
    const { type, category, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (start_date) {
      query += ' AND transaction_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND transaction_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY transaction_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [transactions] = await pool.execute(query, params);

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/accountant/transactions', authenticateToken, requireRole(...ROLES.ACCOUNTANT), async (req, res) => {
  try {
    const { type, category, amount, description, transaction_date, reference_number, payment_method } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO transactions (type, category, amount, description, transaction_date, reference_number, payment_method, created_by, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())
    `, [type, category, amount, description, transaction_date || new Date().toISOString().split('T')[0], reference_number, payment_method || 'cash', req.user.id]);

    res.json({
      success: true,
      message: 'Transaction recorded successfully',
      transaction_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/accountant/payments/reminder', authenticateToken, requireRole(...ROLES.ACCOUNTANT), async (req, res) => {
  try {
    const { student_id, custom_message } = req.body;

    const [[student]] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ?',
      [student_id]
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const message = custom_message || `Dear ${student.guardian_name || 'Parent/Guardian'},\n\nThis is a payment reminder for ${student.first_name} ${student.last_name}.\n\nBalance: ${student.balance} RWF\n\nPlease make the payment soon.\nThank you.`;

    // Log reminder
    await pool.execute(`
      INSERT INTO payment_reminders (student_id, reminder_type, message, sent_to, sent_via, sent_by, sent_at)
      VALUES (?, 'manual', ?, ?, 'sms', ?, NOW())
    `, [student_id, message, student.guardian_phone, req.user.id]);

    res.json({
      success: true,
      message: 'Payment reminder sent successfully',
      reminder_id: `REM-${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// TEACHER DASHBOARD API
// ============================================================

router.get('/teacher/dashboard', authenticateToken, requireRole(...ROLES.TEACHER), async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get teacher's classes
    const [[classes]] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      LEFT JOIN class_enrollments e ON c.id = e.class_id
      WHERE c.teacher_id = ? AND c.status = 'active'
      GROUP BY c.id
    `, [teacherId]);

    // Get pending assignments
    const [[pendingGrading]] = await pool.execute(`
      SELECT COUNT(*) as pending_count
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE a.teacher_id = ? AND asub.status = 'submitted' AND asub.grade IS NULL
    `, [teacherId]);

    // Get today's schedule
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const [[todaySchedule]] = await pool.execute(`
      SELECT t.*, c.class_name, c.class_code
      FROM timetable t
      JOIN classes c ON t.class_id = c.id
      WHERE t.teacher_id = ? AND t.day_of_week = ?
      ORDER BY t.start_time
    `, [teacherId, today]);

    // Get recent activities
    const [[recentActivities]] = await pool.execute(`
      (SELECT 'assignment' as type, title as description, created_at 
       FROM assignments WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'grading' as type, CONCAT('Graded: ', a.title) as description, graded_at as created_at
       FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       WHERE a.teacher_id = ? AND asub.graded_at IS NOT NULL
       ORDER BY asub.graded_at DESC LIMIT 5)
      ORDER BY created_at DESC LIMIT 10
    `, [teacherId, teacherId]);

    res.json({
      success: true,
      dashboard: {
        classes,
        todaySchedule,
        pendingGrading: pendingGrading.pending_count,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teacher/classes', authenticateToken, requireRole(...ROLES.TEACHER), async (req, res) => {
  try {
    const teacherId = req.user.id;

    const [classes] = await pool.execute(`
      SELECT 
        c.*,
        s.subject_name,
        COUNT(DISTINCT ce.student_id) as student_count
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
      WHERE c.teacher_id = ? AND c.status = 'active'
      GROUP BY c.id
      ORDER BY c.class_code
    `, [teacherId]);

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teacher/classes/:classId/students', authenticateToken, requireRole(...ROLES.TEACHER), async (req, res) => {
  try {
    const { classId } = req.params;

    const [students] = await pool.execute(`
      SELECT 
        s.*,
        CONCAT(s.first_name, ' ', s.last_name) as full_name,
        ROUND(AVG(sm.final_marks), 2) as average_marks
      FROM global_student_sheets s
      JOIN class_enrollments ce ON s.student_id = ce.student_id
      LEFT JOIN student_marks sm ON s.student_id = sm.student_id AND sm.class_id = ?
      WHERE ce.class_id = ?
      GROUP BY s.id
      ORDER BY s.last_name, s.first_name
    `, [classId, classId]);

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/teacher/attendance', authenticateToken, requireRole(...ROLES.TEACHER), async (req, res) => {
  try {
    const { class_id, attendance_date, attendance_records } = req.body;
    const teacherId = req.user.id;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const record of attendance_records) {
        const [existing] = await connection.execute(`
          SELECT id FROM student_attendance 
          WHERE student_id = ? AND class_id = ? AND attendance_date = ?
        `, [record.student_id, class_id, attendance_date]);

        if (existing.length > 0) {
          await connection.execute(`
            UPDATE student_attendance 
            SET status = ?, notes = ?, updated_at = NOW() 
            WHERE id = ?
          `, [record.status, record.notes || null, existing[0].id]);
        } else {
          await connection.execute(`
            INSERT INTO student_attendance (student_id, class_id, teacher_id, attendance_date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [record.student_id, class_id, teacherId, attendance_date, record.status, record.notes || null]);
        }
      }

      await connection.commit();
      res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/teacher/marks', authenticateToken, requireRole(...ROLES.TEACHER), async (req, res) => {
  try {
    const { student_id, class_id, quiz_marks, midterm_marks, final_marks, remarks } = req.body;
    const teacherId = req.user.id;

    const total_marks = (quiz_marks || 0) + (midterm_marks || 0) + (final_marks || 0);
    const percentage = total_marks; // Assuming max is 100
    const grade = calculateGrade(percentage);

    const [existing] = await pool.execute(`
      SELECT id FROM student_marks 
      WHERE student_id = ? AND class_id = ?
    `, [student_id, class_id]);

    if (existing.length > 0) {
      await pool.execute(`
        UPDATE student_marks 
        SET quiz_marks = ?, midterm_marks = ?, final_marks = ?, total_marks = ?, grade = ?, remarks = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
      `, [quiz_marks, midterm_marks, final_marks, total_marks, grade, remarks, teacherId, existing[0].id]);

      res.json({ success: true, message: 'Marks updated successfully' });
    } else {
      await pool.execute(`
        INSERT INTO student_marks (student_id, class_id, quiz_marks, midterm_marks, final_marks, total_marks, grade, remarks, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [student_id, class_id, quiz_marks, midterm_marks, final_marks, total_marks, grade, remarks, teacherId]);

      res.json({ success: true, message: 'Marks recorded successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ADVISOR DASHBOARD API
// ============================================================

router.get('/advisor/dashboard', authenticateToken, requireRole(...ROLES.ADVISOR), async (req, res) => {
  try {
    const advisorId = req.user.id;

    // Get advised students
    const [[studentStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students
      FROM advised_students
      WHERE advisor_id = ?
    `, [advisorId]);

    // Get active cases
    const [[activeCases]] = await pool.execute(`
      SELECT COUNT(*) as total FROM student_cases
      WHERE advisor_id = ? AND status = 'open'
    `, [advisorId]);

    // Get scheduled meetings
    const [[upcomingMeetings]] = await pool.execute(`
      SELECT COUNT(*) as total FROM advisor_meetings
      WHERE advisor_id = ? AND meeting_date >= CURDATE() AND status = 'scheduled'
    `, [advisorId]);

    // Get recent activities
    const [[recentActivities]] = await pool.execute(`
      SELECT * FROM advisor_case_activities
      WHERE advisor_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [advisorId]);

    // Get students needing attention
    const [[atRiskStudents]] = await pool.execute(`
      SELECT 
        s.student_id, s.first_name, s.last_name, s.trade_name,
        AVG(sm.final_marks) as avg_marks,
        COUNT(sa.id) as absent_count
      FROM global_student_sheets s
      LEFT JOIN student_marks sm ON s.student_id = sm.student_id
      LEFT JOIN student_attendance sa ON s.student_id = sa.student_id AND sa.status = 'absent'
      WHERE s.status = 'active'
      GROUP BY s.student_id
      HAVING avg_marks < 60 OR absent_count > 5
      LIMIT 10
    `);

    res.json({
      success: true,
      dashboard: {
        studentStats,
        activeCases,
        upcomingMeetings,
        recentActivities,
        atRiskStudents
      }
    });
  } catch (error) {
    console.error('Advisor dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/advisor/students', authenticateToken, requireRole(...ROLES.ADVISOR), async (req, res) => {
  try {
    const { search, trade, status } = req.query;

    let query = `
      SELECT DISTINCT s.*, t.name,
        (SELECT COUNT(*) FROM student_cases WHERE student_id = s.student_id AND status = 'open') as active_cases
      FROM global_student_sheets s
      LEFT JOIN trades t ON s.trade_code = t.code
      WHERE s.status = 'active'
    `;
    const params = [];

    if (search) {
      query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (trade) {
      query += ' AND s.trade_code = ?';
      params.push(trade);
    }

    query += ' ORDER BY s.last_name LIMIT 100';

    const [students] = await pool.execute(query, params);

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/advisor/cases', authenticateToken, requireRole(...ROLES.ADVISOR), async (req, res) => {
  try {
    const { student_id, case_type, title, description, priority } = req.body;
    const advisorId = req.user.id;

    const [result] = await pool.execute(`
      INSERT INTO student_cases (student_id, advisor_id, case_type, title, description, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'open', NOW())
    `, [student_id, advisorId, case_type, title, description, priority || 'medium']);

    // Log activity
    await pool.execute(`
      INSERT INTO advisor_case_activities (case_id, advisor_id, activity_type, description, created_at)
      VALUES (?, ?, 'case_created', ?, NOW())
    `, [result.insertId, advisorId, `Case created: ${title}`]);

    res.json({
      success: true,
      message: 'Case created successfully',
      case_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/advisor/meetings', authenticateToken, requireRole(...ROLES.ADVISOR), async (req, res) => {
  try {
    const { student_id, meeting_date, meeting_time, purpose, location } = req.body;
    const advisorId = req.user.id;

    const [result] = await pool.execute(`
      INSERT INTO advisor_meetings (advisor_id, student_id, meeting_date, meeting_time, purpose, location, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW())
    `, [advisorId, student_id, meeting_date, meeting_time, purpose, location || 'Advisor Office']);

    res.json({
      success: true,
      message: 'Meeting scheduled successfully',
      meeting_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/advisor/cases/:studentId', authenticateToken, requireRole(...ROLES.ADVISOR), async (req, res) => {
  try {
    const { studentId } = req.params;

    const [cases] = await pool.execute(`
      SELECT * FROM student_cases
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [studentId]);

    const [meetings] = await pool.execute(`
      SELECT * FROM advisor_meetings
      WHERE student_id = ?
      ORDER BY meeting_date DESC
    `, [studentId]);

    res.json({ success: true, cases, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// DOS DASHBOARD API
// ============================================================

router.get('/dos/dashboard', authenticateToken, requireRole(...ROLES.DOS), async (req, res) => {
  try {
    // Get student statistics
    const [[studentStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students
      FROM global_student_sheets
    `);

    // Get teacher statistics
    const [[teacherStats]] = await pool.execute(`
      SELECT COUNT(*) as total_teachers FROM users WHERE role = 'teacher'
    `);

    // Get course statistics
    const [[courseStats]] = await pool.execute('SELECT COUNT(*) as total_courses FROM courses');

    // Get enrollment statistics
    const [[enrollmentStats]] = await pool.execute(`
      SELECT 
        trade_code,
        level_number,
        COUNT(*) as student_count
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code, level_number
    `);

    // Get recent enrollments
    const [[recentEnrollments]] = await pool.execute(`
      SELECT * FROM enrollments
      ORDER BY enrollment_date DESC
      LIMIT 20
    `);

    // Get pending approvals
    const [[pendingApprovals]] = await pool.execute(`
      SELECT COUNT(*) as total FROM enrollment_requests WHERE status = 'pending'
    `);

    res.json({
      success: true,
      dashboard: {
        students: studentStats,
        teachers: teacherStats,
        courses: courseStats,
        enrollments: enrollmentStats,
        recentEnrollments,
        pendingApprovals
      }
    });
  } catch (error) {
    console.error('DOS dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dos/students', authenticateToken, requireRole(...ROLES.DOS), async (req, res) => {
  try {
    const { search, trade, level, status = 'active', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, t.name
      FROM global_student_sheets s
      LEFT JOIN trades t ON s.trade_code = t.code
      WHERE s.status = ?
    `;
    const params = [status];

    if (search) {
      query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (trade) {
      query += ' AND s.trade_code = ?';
      params.push(trade);
    }
    if (level) {
      query += ' AND s.level_number = ?';
      params.push(parseInt(level));
    }

    query += ' ORDER BY s.last_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/dos/enrollments', authenticateToken, requireRole(...ROLES.DOS), async (req, res) => {
  try {
    const { student_id, trade_code, level_number, level_suffix, academic_year, enrollment_date } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO enrollments (student_id, trade_code, level_number, level_suffix, academic_year, enrollment_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [student_id, trade_code, level_number, level_suffix, academic_year || new Date().getFullYear(), enrollment_date || new Date().toISOString().split('T')[0]]);

    res.json({
      success: true,
      message: 'Student enrolled successfully',
      enrollment_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dos/trades-levels', authenticateToken, requireRole(...ROLES.DOS), async (req, res) => {
  try {
    const [trades] = await pool.execute('SELECT trade_code, trade_name FROM trades WHERE is_active = 1 ORDER BY trade_name');
    const [levels] = await pool.execute('SELECT DISTINCT level_number FROM enrollments WHERE status = "active" ORDER BY level_number');

    res.json({ success: true, trades, levels: levels.map(l => l.level_number) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// DOD DASHBOARD API
// ============================================================

router.get('/dod/dashboard', authenticateToken, requireRole(...ROLES.DOD), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get incident statistics
    const [[incidentStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN DATE(incident_date) = ? THEN 1 ELSE 0 END) as today_incidents,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_incidents
      FROM student_conduct_records
    `, [today]);

    // Get leave statistics
    const [[leaveStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_leaves,
        SUM(CASE WHEN status = 'active' AND end_date >= ? THEN 1 ELSE 0 END) as active_leaves
      FROM student_leaves
    `, [today]);

    // Get counseling statistics
    const [[counselingStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN session_date >= ? THEN 1 ELSE 0 END) as upcoming_sessions
      FROM student_counseling_sessions
    `, [today]);

    // Get recent incidents
    const [[recentIncidents]] = await pool.execute(`
      SELECT scr.*, u.first_name, u.last_name, u.student_code
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      ORDER BY scr.incident_date DESC
      LIMIT 20
    `);

    // Get students with warnings
    const [[studentsWithWarnings]] = await pool.execute(`
      SELECT COUNT(DISTINCT student_id) as total FROM student_conduct_records WHERE status = 'active'
    `);

    res.json({
      success: true,
      dashboard: {
        incidents: incidentStats,
        leaves: leaveStats,
        counseling: counselingStats,
        recentIncidents,
        studentsWithWarnings
      }
    });
  } catch (error) {
    console.error('DOD dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/dod/incidents', authenticateToken, requireRole(...ROLES.DOD), async (req, res) => {
  try {
    const { student_id, incident_type, severity, description, location, action_taken, parent_notified } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO student_conduct_records (
        student_id, incident_type, severity, description, location, action_taken,
        parent_notified, status, incident_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [student_id, incident_type, severity || 'moderate', description, location, action_taken, parent_notified || false]);

    res.json({
      success: true,
      message: 'Incident recorded successfully',
      incident_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/dod/leaves', authenticateToken, requireRole(...ROLES.DOD), async (req, res) => {
  try {
    const { student_id, leave_type, start_date, end_date, reason, approved_by } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO student_leaves (
        student_id, leave_type, start_date, end_date, reason, approved_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'approved')
    `, [student_id, leave_type, start_date, end_date, reason, approved_by || req.user.name]);

    res.json({
      success: true,
      message: 'Leave granted successfully',
      leave_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/dod/counseling', authenticateToken, requireRole(...ROLES.DOD), async (req, res) => {
  try {
    const { student_id, session_type, notes, scheduled_date } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO student_counseling_sessions (
        student_id, counselor_id, session_type, notes, session_date, status
      ) VALUES (?, ?, ?, ?, ?, 'scheduled')
    `, [student_id, req.user.id, session_type || 'individual', notes, scheduled_date || new Date().toISOString().split('T')[0]]);

    res.json({
      success: true,
      message: 'Counseling session scheduled',
      session_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dod/students', authenticateToken, requireRole(...ROLES.DOD), async (req, res) => {
  try {
    const { search, trade } = req.query;

    let query = `
      SELECT DISTINCT
        s.student_id as id,
        s.first_name,
        s.last_name,
        s.student_code,
        s.trade_code,
        (SELECT COUNT(*) FROM student_conduct_records WHERE student_id = s.student_id) as incident_count,
        (SELECT incident_date FROM student_conduct_records WHERE student_id = s.student_id ORDER BY incident_date DESC LIMIT 1) as last_incident
      FROM global_student_sheets s
      WHERE s.status = 'active'
    `;
    const params = [];

    if (search) {
      query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (trade) {
      query += ' AND s.trade_code = ?';
      params.push(trade);
    }

    query += ' ORDER BY incident_count DESC LIMIT 100';

    const [students] = await pool.execute(query, params);

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// HEADMASTER DASHBOARD API
// ============================================================

router.get('/headmaster/dashboard', authenticateToken, requireRole(...ROLES.HEADMASTER), async (req, res) => {
  try {
    // Get comprehensive school statistics
    const [[studentStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students
      FROM global_student_sheets
    `);

    const [[staffStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as teachers
      FROM users WHERE is_active = 1
    `);

    const [[financialStats]] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
      FROM transactions
      WHERE YEAR(transaction_date) = YEAR(CURDATE())
    `);

    const [[attendanceStats]] = await pool.execute(`
      SELECT 
        ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 2) as avg_attendance
      FROM student_attendance
      WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    const [[performanceStats]] = await pool.execute(`
      SELECT 
        ROUND(AVG(total_marks), 2) as avg_marks
      FROM student_marks
    `);

    const [[departmentStats]] = await pool.execute(`
      SELECT 
        trade_code,
        COUNT(*) as student_count,
        ROUND(AVG(total_marks), 2) as avg_marks
      FROM global_student_sheets
      GROUP BY trade_code
    `);

    const [[upcomingEvents]] = await pool.execute(`
      SELECT * FROM school_events
      WHERE event_date >= CURDATE()
      ORDER BY event_date
      LIMIT 5
    `);

    const netIncome = (financialStats.total_income || 0) - (financialStats.total_expenses || 0);

    res.json({
      success: true,
      dashboard: {
        students: studentStats,
        staff: staffStats,
        finances: {
          ...financialStats,
          net_income: netIncome
        },
        attendance: attendanceStats,
        performance: performanceStats,
        departments: departmentStats,
        upcomingEvents,
        systemStatus: {
          server: 'online',
          database: 'connected',
          api: 'active'
        }
      }
    });
  } catch (error) {
    console.error('Headmaster dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/headmaster/analytics', authenticateToken, requireRole(...ROLES.HEADMASTER), async (req, res) => {
  try {
    const { period = 'year' } = req.query;

    // Monthly trends
    const [monthlyTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as student_count
      FROM global_student_sheets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    // Performance by department
    const [performanceByDept] = await pool.execute(`
      SELECT 
        trade_code,
        ROUND(AVG(total_marks), 2) as avg_marks,
        COUNT(*) as student_count
      FROM global_student_sheets
      GROUP BY trade_code
      ORDER BY avg_marks DESC
    `);

    // Attendance trends
    const [attendanceTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(attendance_date, '%Y-%m-%d') as date,
        ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 2) as attendance_rate
      FROM student_attendance
      WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(attendance_date, '%Y-%m-%d')
      ORDER BY date
    `);

    // Financial trends
    const [financialTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month
    `);

    res.json({
      success: true,
      analytics: {
        monthlyTrends,
        performanceByDept,
        attendanceTrends,
        financialTrends
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/headmaster/reports', authenticateToken, requireRole(...ROLES.HEADMASTER), async (req, res) => {
  try {
    const { type = 'comprehensive', start_date, end_date } = req.query;

    let reportData = {};

    if (type === 'comprehensive' || type === 'students') {
      const [studentData] = await pool.execute(`
        SELECT 
          trade_code,
          level_number,
          COUNT(*) as student_count,
          ROUND(AVG(total_marks), 2) as avg_marks
        FROM global_student_sheets
        GROUP BY trade_code, level_number
      `);
      reportData.students = studentData;
    }

    if (type === 'comprehensive' || type === 'financial') {
      const [financialData] = await pool.execute(`
        SELECT 
          category,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM transactions
        GROUP BY category
      `);
      reportData.financial = financialData;
    }

    if (type === 'comprehensive' || type === 'attendance') {
      const [attendanceData] = await pool.execute(`
        SELECT 
          trade_code,
          ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 2) as attendance_rate
        FROM global_student_sheets
        GROUP BY trade_code
      `);
      reportData.attendance = attendanceData;
    }

    res.json({
      success: true,
      report: {
        type,
        period: { start_date, end_date },
        generated_at: new Date().toISOString(),
        data: reportData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// STOCK MANAGER DASHBOARD API
// ============================================================

router.get('/stock/dashboard', authenticateToken, requireRole(...ROLES.STOCK_MANAGER), async (req, res) => {
  try {
    // Get inventory statistics
    const [[itemStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN quantity <= reorder_level AND quantity > 0 THEN 1 ELSE 0 END) as low_stock
      FROM stock_items
    `);

    // Get recent transactions
    const [[recentTransactions]] = await pool.execute(`
      SELECT st.*, si.item_name, si.item_code
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      ORDER BY st.transaction_date DESC
      LIMIT 20
    `);

    // Get low stock items
    const [[lowStockItems]] = await pool.execute(`
      SELECT * FROM stock_items
      WHERE quantity <= reorder_level AND quantity > 0
      ORDER BY quantity ASC
      LIMIT 20
    `);

    // Get items by category
    const [[categoryBreakdown]] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as category_value
      FROM stock_items
      GROUP BY category
    `);

    // Get pending purchase orders
    const [[pendingOrders]] = await pool.execute(`
      SELECT COUNT(*) as total FROM purchase_orders WHERE status = 'pending'
    `);

    res.json({
      success: true,
      dashboard: {
        items: itemStats,
        recentTransactions,
        lowStockItems,
        categoryBreakdown,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Stock dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stock/items', authenticateToken, requireRole(...ROLES.STOCK_MANAGER), async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM stock_items WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status === 'low_stock') {
      query += ' AND quantity <= reorder_level AND quantity > 0';
    } else if (status === 'out_of_stock') {
      query += ' AND quantity = 0';
    }
    if (search) {
      query += ' AND (item_name LIKE ? OR item_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY item_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [items] = await pool.execute(query, params);

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/stock/items', authenticateToken, requireRole(...ROLES.STOCK_MANAGER), async (req, res) => {
  try {
    const { item_name, item_code, category, description, quantity, unit, unit_price, reorder_level, location, supplier, supplier_contact } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO stock_items (
        item_name, item_code, category, description, quantity, unit, unit_price, reorder_level, location, supplier, supplier_contact, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [item_name, item_code, category, description, quantity || 0, unit || 'pcs', unit_price || 0, reorder_level || 10, location, supplier, supplier_contact]);

    res.json({
      success: true,
      message: 'Item added successfully',
      item_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/stock/items/:id', authenticateToken, requireRole(...ROLES.STOCK_MANAGER), async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, category, description, quantity, unit, unit_price, reorder_level, location, supplier, supplier_contact } = req.body;

    await pool.execute(`
      UPDATE stock_items 
      SET item_name=?, category=?, description=?, quantity=?, unit=?, unit_price=?, reorder_level=?, location=?, supplier=?, supplier_contact=?, updated_at=NOW()
      WHERE id=?
    `, [item_name, category, description, quantity, unit, unit_price, reorder_level, location, supplier, supplier_contact, id]);

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/stock/transactions', authenticateToken, requireRole(...ROLES.STOCK_MANAGER), async (req, res) => {
  try {
    const { item_id, transaction_type, quantity, unit_price, reference_number, issued_to, department, notes } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current quantity
      const [[currentItem]] = await connection.execute('SELECT quantity, item_name FROM stock_items WHERE id = ?', [item_id]);

      if (!currentItem) {
        throw new Error('Item not found');
      }

      let newQuantity = currentItem.quantity;

      if (transaction_type === 'purchase') {
        newQuantity += quantity;
      } else if (transaction_type === 'issue' || transaction_type === 'usage') {
        newQuantity -= quantity;
        if (newQuantity < 0) newQuantity = 0;
      } else if (transaction_type === 'return') {
        newQuantity += quantity;
      }

      // Record transaction
      const [result] = await connection.execute(`
        INSERT INTO stock_transactions (
          item_id, transaction_type, quantity, unit_price, reference_number, issued_to, department, notes, transaction_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [item_id, transaction_type, quantity, unit_price, reference_number, issued_to, department, notes]);

      // Update quantity
      await connection.execute('UPDATE stock_items SET quantity = ?, updated_at = NOW() WHERE id = ?', [newQuantity, item_id]);

      await connection.commit();

      res.json({
        success: true,
        message: 'Transaction recorded successfully',
        transaction_id: result.insertId,
        new_quantity: newQuantity
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stock/transactions', authenticateToken, requireRole(...ROLES.STOCK_MANAGER), async (req, res) => {
  try {
    const { item_id, type, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT st.*, si.item_name, si.item_code
      FROM stock_transactions st
      JOIN stock_items si ON st.item_id = si.id
      WHERE 1=1
    `;
    const params = [];

    if (item_id) {
      query += ' AND st.item_id = ?';
      params.push(item_id);
    }
    if (type) {
      query += ' AND st.transaction_type = ?';
      params.push(type);
    }
    if (start_date) {
      query += ' AND st.transaction_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND st.transaction_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY st.transaction_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [transactions] = await pool.execute(query, params);

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stock/categories', authenticateToken, requireRole(...ROLES.STOCK_MANAGER), async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT DISTINCT category FROM stock_items WHERE category IS NOT NULL ORDER BY category');

    res.json({ success: true, categories: categories.map(c => c.category) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;

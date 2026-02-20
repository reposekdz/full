const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all students with payment info (Global Sheet - Shared with DOD)
router.get('/global-students', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { trade, level, search, payment_status, limit = 200 } = req.query;
    
    let query = `
      SELECT 
        id as student_id, student_id as admission_number, first_name, last_name, gender,
        date_of_birth, phone, email, address,
        trade_name, trade_code, level_number, level_name,
        conduct_score, attendance_percentage,
        total_fees, paid_amount as total_paid, balance,
        payment_status,
        total_incidents as conduct_incidents,
        0 as linked_parents_count,
        created_at as enrollment_date, status
      FROM global_student_sheets
      WHERE 1=1
    `;
    
    const params = [];
    if (trade && trade !== 'all') {
      query += ` AND trade_code = ?`;
      params.push(trade);
    }
    if (level) {
      query += ` AND level_number = ?`;
      params.push(parseInt(level));
    }
    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (payment_status && payment_status !== 'all') {
      query += ` AND payment_status = ?`;
      params.push(payment_status);
    }
    
    query += ` ORDER BY last_name, first_name LIMIT ?`;
    params.push(parseInt(limit));
    
    const [students] = await db.query(query, params);
    
    // Get real trades and levels from database
    const [trades] = await db.query('SELECT DISTINCT trade_code, trade_name FROM global_student_sheets WHERE trade_code IS NOT NULL ORDER BY trade_name');
    const [levels] = await db.query('SELECT DISTINCT level_number, level_name FROM global_student_sheets WHERE level_number IS NOT NULL ORDER BY level_number');
    
    res.json({ success: true, students, count: students.length, trades, levels });
  } catch (error) {
    console.error('Error fetching global students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new student
router.post('/students', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { first_name, last_name, gender, date_of_birth, phone, email, address, trade_code, level_number } = req.body;
    
    // Get trade_id and level_id
    const [trades] = await db.query('SELECT trade_id FROM trades WHERE trade_code = ?', [trade_code]);
    const [levels] = await db.query('SELECT level_id FROM levels WHERE level_number = ?', [level_number]);
    
    if (!trades.length || !levels.length) {
      return res.status(400).json({ success: false, error: 'Invalid trade or level' });
    }
    
    // Generate admission number
    const year = new Date().getFullYear();
    const [lastStudent] = await db.query('SELECT admission_number FROM students ORDER BY student_id DESC LIMIT 1');
    let nextNum = 1;
    if (lastStudent.length > 0) {
      const lastNum = parseInt(lastStudent[0].admission_number.split('/')[1]);
      nextNum = lastNum + 1;
    }
    const admission_number = `${year}/${String(nextNum).padStart(4, '0')}`;
    
    const [result] = await db.query(
      `INSERT INTO students (admission_number, first_name, last_name, gender, date_of_birth, phone, email, address, trade_id, level_id, enrollment_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'active')`,
      [admission_number, first_name, last_name, gender, date_of_birth, phone, email, address, trades[0].trade_id, levels[0].level_id]
    );
    
    res.json({ success: true, student_id: result.insertId, admission_number });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update student
router.put('/students/:id', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, gender, date_of_birth, phone, email, address, trade_code, level_number, status } = req.body;
    
    let query = 'UPDATE students SET ';
    const params = [];
    const updates = [];
    
    if (first_name) { updates.push('first_name = ?'); params.push(first_name); }
    if (last_name) { updates.push('last_name = ?'); params.push(last_name); }
    if (gender) { updates.push('gender = ?'); params.push(gender); }
    if (date_of_birth) { updates.push('date_of_birth = ?'); params.push(date_of_birth); }
    if (phone) { updates.push('phone = ?'); params.push(phone); }
    if (email) { updates.push('email = ?'); params.push(email); }
    if (address) { updates.push('address = ?'); params.push(address); }
    if (status) { updates.push('status = ?'); params.push(status); }
    
    if (trade_code) {
      const [trades] = await db.query('SELECT trade_id FROM trades WHERE trade_code = ?', [trade_code]);
      if (trades.length) { updates.push('trade_id = ?'); params.push(trades[0].trade_id); }
    }
    
    if (level_number) {
      const [levels] = await db.query('SELECT level_id FROM levels WHERE level_number = ?', [level_number]);
      if (levels.length) { updates.push('level_id = ?'); params.push(levels[0].level_id); }
    }
    
    query += updates.join(', ') + ' WHERE student_id = ?';
    params.push(id);
    
    await db.query(query, params);
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete student
router.delete('/students/:id', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM students WHERE student_id = ?', [id]);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student fees
router.get('/students/:id/fees', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [fees] = await db.query(
      `SELECT f.*, ft.fee_type_name, ft.description 
       FROM fees f
       LEFT JOIN fee_types ft ON f.fee_type_id = ft.fee_type_id
       WHERE f.student_id = ?
       ORDER BY f.due_date DESC`,
      [id]
    );
    res.json({ success: true, fees });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add fee
router.post('/fees', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { student_id, fee_type_id, amount, due_date, term, academic_year, description } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO fees (student_id, fee_type_id, amount, due_date, term, academic_year, description, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [student_id, fee_type_id, amount, due_date, term, academic_year, description]
    );
    
    res.json({ success: true, fee_id: result.insertId });
  } catch (error) {
    console.error('Error adding fee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student payments
router.get('/students/:id/payments', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [payments] = await db.query(
      `SELECT p.*, pm.method_name, u.username as recorded_by_name
       FROM payments p
       LEFT JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
       LEFT JOIN users u ON p.recorded_by = u.user_id
       WHERE p.student_id = ?
       ORDER BY p.payment_date DESC`,
      [id]
    );
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record payment with real-time balance update and forced password change check
router.post('/payments', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    // Check if user needs to change password
    const [userCheck] = await db.query(
      'SELECT force_password_change FROM users WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (userCheck.length > 0 && userCheck[0].force_password_change === 1) {
      return res.status(403).json({ 
        success: false, 
        error: 'Password change required',
        force_password_change: true 
      });
    }
    
    const { student_id, amount, payment_method_id, reference_number, payment_date, notes } = req.body;
    const recorded_by = req.user.userId;
    
    const [result] = await db.query(
      `INSERT INTO payments (student_id, amount, payment_method_id, reference_number, payment_date, notes, recorded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [student_id, amount, payment_method_id, reference_number, payment_date, notes, recorded_by]
    );
    
    // Update fee status if fully paid
    await db.query(`
      UPDATE fees f
      SET f.status = CASE 
        WHEN (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.student_id = f.student_id) >= f.amount 
        THEN 'paid' 
        ELSE 'partial' 
      END
      WHERE f.student_id = ?
    `, [student_id]);
    
    // Send SMS to linked parents about payment
    const [parents] = await db.query(`
      SELECT p.phone, p.first_name, s.first_name as student_first_name, s.last_name as student_last_name
      FROM parent_student_links psl
      JOIN parents p ON psl.parent_id = p.parent_id
      JOIN students s ON psl.student_id = s.student_id
      WHERE psl.student_id = ? AND psl.status = 'linked' AND p.phone IS NOT NULL
    `, [student_id]);
    
    if (parents.length > 0) {
      const smsService = require('../services/smsService');
      for (const parent of parents) {
        const message = `Mwaramutse ${parent.first_name}, Umwana ${parent.student_first_name} ${parent.student_last_name} yishyuye RWF ${amount.toLocaleString()} kuwa ${new Date(payment_date).toLocaleDateString('rw-RW')}. Murakoze! - Garden TVET`;
        await smsService.sendSMS(parent.phone, message, 'payment_confirmation');
      }
    }
    
    res.json({ success: true, payment_id: result.insertId, message: 'Payment recorded and parents notified' });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get fee types
router.get('/fee-types', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    // Try to get fee types from different possible tables
    let feeTypes = [];
    try {
      const [types] = await db.query('SELECT fee_type_id as id, fee_type_name as name, amount FROM fee_types ORDER BY fee_type_name');
      feeTypes = types;
    } catch (e) {
      // If table doesn't exist, return default fee types
      feeTypes = [
        { id: 1, name: 'Tuition Fee', amount: 50000 },
        { id: 2, name: 'Registration Fee', amount: 10000 },
        { id: 3, name: 'Exam Fee', amount: 15000 },
        { id: 4, name: 'Material Fee', amount: 20000 }
      ];
    }
    res.json({ success: true, feeTypes });
  } catch (error) {
    console.error('Error fetching fee types:', error);
    // Return default fee types on error
    res.json({ 
      success: true, 
      feeTypes: [
        { id: 1, name: 'Tuition Fee', amount: 50000 },
        { id: 2, name: 'Registration Fee', amount: 10000 },
        { id: 3, name: 'Exam Fee', amount: 15000 },
        { id: 4, name: 'Material Fee', amount: 20000 }
      ]
    });
  }
});

// Get payment methods
router.get('/payment-methods', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    // Try to get payment methods from different possible tables
    let methods = [];
    try {
      const [result] = await db.query('SELECT payment_method_id as id, method_name as name FROM payment_methods WHERE is_active = 1 ORDER BY method_name');
      methods = result;
    } catch (e) {
      // If table doesn't exist, return default payment methods
      methods = [
        { id: 1, name: 'Cash' },
        { id: 2, name: 'Bank Transfer' },
        { id: 3, name: 'Mobile Money' },
        { id: 4, name: 'Cheque' }
      ];
    }
    res.json({ success: true, methods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    // Return default payment methods on error
    res.json({ 
      success: true, 
      methods: [
        { id: 1, name: 'Cash' },
        { id: 2, name: 'Bank Transfer' },
        { id: 3, name: 'Mobile Money' },
        { id: 4, name: 'Cheque' }
      ]
    });
  }
});

// Financial statistics
router.get('/statistics', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    // Use global_student_sheets table for statistics
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_students,
        COALESCE(SUM(total_fees), 0) as total_fees,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(balance), 0) as total_outstanding,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as fully_paid_count,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_paid_count,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_count
      FROM global_student_sheets
      WHERE status = 'active'
    `);
    
    const [recentPayments] = await db.query(`
      SELECT * FROM global_student_sheets 
      WHERE payment_status IN ('partial', 'paid') 
      ORDER BY updated_at DESC
      LIMIT 10
    `);
    
    res.json({ success: true, statistics: stats[0], recentPayments });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk fee assignment
router.post('/bulk-fees', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { student_ids, fee_type_id, amount, due_date, term, academic_year, description } = req.body;
    
    const values = student_ids.map(id => [id, fee_type_id, amount, due_date, term, academic_year, description, 'pending']);
    
    await db.query(
      `INSERT INTO fees (student_id, fee_type_id, amount, due_date, term, academic_year, description, status)
       VALUES ?`,
      [values]
    );
    
    res.json({ success: true, message: `Fees assigned to ${student_ids.length} students` });
  } catch (error) {
    console.error('Error assigning bulk fees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export to CSV
router.get('/export-csv', authenticateToken, authorizeRoles(['accountant', 'admin']), async (req, res) => {
  try {
    const { type = 'students' } = req.query;
    
    if (type === 'students') {
      const [students] = await db.query(`
        SELECT 
          s.admission_number, s.first_name, s.last_name, s.gender, s.phone, s.email,
          t.trade_name, l.level_name,
          COALESCE(SUM(f.amount), 0) as total_fees,
          COALESCE(SUM(p.amount), 0) as total_paid,
          COALESCE(SUM(f.amount), 0) - COALESCE(SUM(p.amount), 0) as balance
        FROM students s
        LEFT JOIN trades t ON s.trade_id = t.trade_id
        LEFT JOIN levels l ON s.level_id = l.level_id
        LEFT JOIN fees f ON s.student_id = f.student_id
        LEFT JOIN payments p ON s.student_id = p.student_id
        GROUP BY s.student_id
      `);
      
      res.json({ success: true, data: students });
    } else if (type === 'payments') {
      const [payments] = await db.query(`
        SELECT 
          p.payment_date, s.admission_number, s.first_name, s.last_name,
          p.amount, pm.method_name, p.reference_number, p.notes
        FROM payments p
        JOIN students s ON p.student_id = s.student_id
        LEFT JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
        ORDER BY p.payment_date DESC
      `);
      
      res.json({ success: true, data: payments });
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

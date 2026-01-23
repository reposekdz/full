const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all classes with enrollment stats
router.get('/classes', authenticateToken, async (req, res) => {
  try {
    const { trade, level, status } = req.query;
    let query = `
      SELECT cs.*, 
        COUNT(DISTINCT sce.student_id) as enrolled_students,
        u.name as class_teacher_name
      FROM class_structure cs
      LEFT JOIN student_class_enrollment sce ON cs.id = sce.class_structure_id AND sce.status = 'active'
      LEFT JOIN users u ON cs.class_teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (trade) { query += ' AND cs.trade = ?'; params.push(trade); }
    if (level) { query += ' AND cs.level = ?'; params.push(level); }
    if (status) { query += ' AND cs.status = ?'; params.push(status); }
    query += ' GROUP BY cs.id ORDER BY cs.trade, cs.level, cs.section';
    
    const [classes] = await pool.execute(query, params);
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
});

// Get students by class
router.get('/classes/:classId/students', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT s.*, sce.enrollment_date, sce.status as enrollment_status
      FROM students s
      INNER JOIN student_class_enrollment sce ON s.id = sce.student_id
      WHERE sce.class_structure_id = ? AND sce.status = 'active'
      ORDER BY s.name
    `, [req.params.classId]);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Enroll student to class
router.post('/classes/:classId/enroll', authenticateToken, async (req, res) => {
  try {
    const { student_id, academic_year } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO student_class_enrollment (student_id, class_structure_id, enrollment_date, academic_year, enrolled_by) VALUES (?, ?, CURDATE(), ?, ?)',
      [student_id, req.params.classId, academic_year, req.user.userId]
    );
    
    await pool.execute(
      'UPDATE class_structure SET current_enrollment = current_enrollment + 1 WHERE id = ?',
      [req.params.classId]
    );
    
    res.json({ success: true, message: 'Student enrolled', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to enroll student' });
  }
});

// New comers management
router.get('/new-comers', authenticateToken, async (req, res) => {
  try {
    const { status, trade } = req.query;
    let query = 'SELECT * FROM new_comers WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (trade) { query += ' AND trade = ?'; params.push(trade); }
    query += ' ORDER BY created_at DESC';
    const [newComers] = await pool.execute(query, params);
    res.json({ success: true, newComers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch new comers' });
  }
});

router.post('/new-comers', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, trade, level, section, registration_date, documents_submitted, notes } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO new_comers (name, email, phone, trade, level, section, registration_date, documents_submitted, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, trade, level, section, registration_date, documents_submitted, notes]
    );
    res.json({ success: true, message: 'New comer registered', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register new comer' });
  }
});

router.put('/new-comers/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE new_comers SET status = ?, approved_by = ? WHERE id = ?',
      [status, req.user.userId, req.params.id]
    );
    res.json({ success: true, message: 'New comer status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Student removals
router.get('/removals', authenticateToken, async (req, res) => {
  try {
    const { status, removal_type } = req.query;
    let query = 'SELECT * FROM student_removals WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (removal_type) { query += ' AND removal_type = ?'; params.push(removal_type); }
    query += ' ORDER BY created_at DESC';
    const [removals] = await pool.execute(query, params);
    res.json({ success: true, removals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch removals' });
  }
});

router.post('/removals', authenticateToken, async (req, res) => {
  try {
    const { student_id, removal_type, removal_date, reason } = req.body;
    const [student] = await pool.execute('SELECT student_code, name, trade, class_level FROM students WHERE id = ?', [student_id]);
    
    const [result] = await pool.execute(
      'INSERT INTO student_removals (student_id, student_code, student_name, trade, class_level, removal_type, removal_date, reason, removed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, student[0]?.student_code, student[0]?.name, student[0]?.trade, student[0]?.class_level, removal_type, removal_date, reason, req.user.userId]
    );
    res.json({ success: true, message: 'Removal request created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create removal' });
  }
});

router.put('/removals/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE student_removals SET status = ?, approved_by = ? WHERE id = ?',
      [status, req.user.userId, req.params.id]
    );
    
    if (status === 'approved') {
      const [removal] = await pool.execute('SELECT student_id FROM student_removals WHERE id = ?', [req.params.id]);
      await pool.execute(
        'UPDATE student_class_enrollment SET status = "dropped" WHERE student_id = ? AND status = "active"',
        [removal[0].student_id]
      );
    }
    
    res.json({ success: true, message: 'Removal approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve removal' });
  }
});

// Student transfers
router.get('/transfers', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT st.*, 
        s.name as student_name, s.student_code,
        cs1.class_name as from_class,
        cs2.class_name as to_class
      FROM student_transfers st
      INNER JOIN students s ON st.student_id = s.id
      INNER JOIN class_structure cs1 ON st.from_class_id = cs1.id
      INNER JOIN class_structure cs2 ON st.to_class_id = cs2.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { query += ' AND st.status = ?'; params.push(status); }
    query += ' ORDER BY st.created_at DESC';
    const [transfers] = await pool.execute(query, params);
    res.json({ success: true, transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transfers' });
  }
});

router.post('/transfers', authenticateToken, async (req, res) => {
  try {
    const { student_id, from_class_id, to_class_id, transfer_date, reason } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO student_transfers (student_id, from_class_id, to_class_id, transfer_date, reason) VALUES (?, ?, ?, ?, ?)',
      [student_id, from_class_id, to_class_id, transfer_date, reason]
    );
    res.json({ success: true, message: 'Transfer request created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create transfer' });
  }
});

router.put('/transfers/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE student_transfers SET status = ?, approved_by = ? WHERE id = ?',
      [status, req.user.userId, req.params.id]
    );
    
    if (status === 'approved') {
      const [transfer] = await pool.execute('SELECT * FROM student_transfers WHERE id = ?', [req.params.id]);
      await pool.execute(
        'UPDATE student_class_enrollment SET status = "transferred" WHERE student_id = ? AND class_structure_id = ? AND status = "active"',
        [transfer[0].student_id, transfer[0].from_class_id]
      );
      await pool.execute(
        'INSERT INTO student_class_enrollment (student_id, class_structure_id, enrollment_date, status, enrolled_by) VALUES (?, ?, CURDATE(), "active", ?)',
        [transfer[0].student_id, transfer[0].to_class_id, req.user.userId]
      );
    }
    
    res.json({ success: true, message: 'Transfer processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process transfer' });
  }
});

// Performance by class
router.get('/classes/:classId/performance', authenticateToken, async (req, res) => {
  try {
    const [performance] = await pool.execute(`
      SELECT ap.*, s.name as student_name, s.student_code
      FROM academic_performance ap
      INNER JOIN students s ON ap.student_id = s.id
      INNER JOIN student_class_enrollment sce ON s.id = sce.student_id
      WHERE sce.class_structure_id = ? AND sce.status = 'active'
      ORDER BY ap.created_at DESC
    `, [req.params.classId]);
    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch performance' });
  }
});

// Attendance by class
router.get('/classes/:classId/attendance', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [attendance] = await pool.execute(`
      SELECT sa.*, s.name as student_name, s.student_code
      FROM student_attendance sa
      INNER JOIN students s ON sa.student_id = s.id
      INNER JOIN student_class_enrollment sce ON s.id = sce.student_id
      WHERE sce.class_structure_id = ? AND sce.status = 'active'
        AND sa.attendance_date BETWEEN ? AND ?
      ORDER BY sa.attendance_date DESC
    `, [req.params.classId, start_date || '2024-01-01', end_date || '2024-12-31']);
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

// Payment summary by class
router.get('/classes/:classId/payments', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT s.id, s.student_code, s.name,
        COALESCE(SUM(fp.amount), 0) as total_paid,
        COALESCE(SUM(i.total_amount), 0) as total_invoiced,
        (COALESCE(SUM(i.total_amount), 0) - COALESCE(SUM(fp.amount), 0)) as balance
      FROM students s
      INNER JOIN student_class_enrollment sce ON s.id = sce.student_id
      LEFT JOIN fee_payments fp ON s.id = fp.student_id AND fp.status = 'completed'
      LEFT JOIN invoices i ON s.id = i.student_id
      WHERE sce.class_structure_id = ? AND sce.status = 'active'
      GROUP BY s.id
      ORDER BY s.name
    `, [req.params.classId]);
    
    const paid = students.filter(s => s.balance <= 0).length;
    const unpaid = students.filter(s => s.balance > 0 && s.total_paid === 0).length;
    const partial = students.filter(s => s.balance > 0 && s.total_paid > 0).length;
    
    res.json({
      success: true,
      summary: {
        total_students: students.length,
        paid_students: paid,
        unpaid_students: unpaid,
        partial_paid_students: partial
      },
      students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Dashboard for Head Master
router.get('/headmaster/dashboard', authenticateToken, async (req, res) => {
  try {
    const [classSummary] = await pool.execute(`
      SELECT cs.trade, cs.level, cs.section, cs.class_name,
        COUNT(DISTINCT sce.student_id) as total_students
      FROM class_structure cs
      LEFT JOIN student_class_enrollment sce ON cs.id = sce.class_structure_id AND sce.status = 'active'
      WHERE cs.status = 'active'
      GROUP BY cs.id
      ORDER BY cs.trade, cs.level, cs.section
    `);
    
    const [newComersCount] = await pool.execute('SELECT COUNT(*) as count FROM new_comers WHERE status = "pending"');
    const [removalsPending] = await pool.execute('SELECT COUNT(*) as count FROM student_removals WHERE status = "pending"');
    const [transfersPending] = await pool.execute('SELECT COUNT(*) as count FROM student_transfers WHERE status = "pending"');
    
    res.json({
      success: true,
      dashboard: {
        classSummary,
        pendingNewComers: newComersCount[0].count,
        pendingRemovals: removalsPending[0].count,
        pendingTransfers: transfersPending[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
});

module.exports = router;

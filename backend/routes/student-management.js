const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all trades
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const [trades] = await db.query('SELECT * FROM trades ORDER BY name');
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all levels
router.get('/levels', authenticateToken, async (req, res) => {
  try {
    const [levels] = await db.query('SELECT * FROM levels ORDER BY level_number');
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get columns for specific trade and level
router.get('/columns/:tradeId/:levelId', authenticateToken, async (req, res) => {
  try {
    const [columns] = await db.query(
      `SELECT lsc.*, u.username as created_by_name
       FROM level_sheet_columns lsc
       LEFT JOIN users u ON lsc.created_by = u.id
       WHERE lsc.trade_id = ? AND lsc.level_id = ?
       ORDER BY lsc.display_order, lsc.id`,
      [req.params.tradeId, req.params.levelId]
    );
    res.json(columns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new column (Accountant only)
router.post('/columns', authenticateToken, authorizeRoles('accountant', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { trade_id, level_id, column_name, column_type, is_required, default_value, display_order } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO level_sheet_columns 
       (trade_id, level_id, column_name, column_type, is_required, default_value, display_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [trade_id, level_id, column_name, column_type || 'text', is_required || false, default_value, display_order || 0, req.user.id]
    );
    
    res.json({ message: 'Column created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update column
router.put('/columns/:id', authenticateToken, authorizeRoles('accountant', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { column_name, column_type, is_required, default_value, display_order } = req.body;
    
    await db.query(
      `UPDATE level_sheet_columns 
       SET column_name = ?, column_type = ?, is_required = ?, default_value = ?, display_order = ?
       WHERE id = ?`,
      [column_name, column_type, is_required, default_value, display_order, req.params.id]
    );
    
    res.json({ message: 'Column updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete column
router.delete('/columns/:id', authenticateToken, authorizeRoles('accountant', 'admin', 'super_admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM level_sheet_columns WHERE id = ?', [req.params.id]);
    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students by trade and level with custom column values
router.get('/students/:tradeId/:levelId', authenticateToken, async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT s.*, t.name as trade_name, l.level_number, l.name as level_name
       FROM students s
       JOIN trades t ON s.trade_id = t.id
       JOIN levels l ON s.level_id = l.id
       WHERE s.trade_id = ? AND s.level_id = ?
       ORDER BY s.first_name, s.last_name`,
      [req.params.tradeId, req.params.levelId]
    );
    
    // Get custom columns
    const [columns] = await db.query(
      'SELECT * FROM level_sheet_columns WHERE trade_id = ? AND level_id = ? ORDER BY display_order',
      [req.params.tradeId, req.params.levelId]
    );
    
    // Get column values for all students
    const studentIds = students.map(s => s.id);
    let values = [];
    if (studentIds.length > 0) {
      [values] = await db.query(
        'SELECT * FROM student_column_values WHERE student_id IN (?)',
        [studentIds]
      );
    }
    
    // Attach column values to students
    students.forEach(student => {
      student.custom_values = {};
      columns.forEach(col => {
        const value = values.find(v => v.student_id === student.id && v.column_id === col.id);
        student.custom_values[col.id] = value ? value.column_value : col.default_value;
      });
    });
    
    res.json({ students, columns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student column value
router.put('/students/:studentId/columns/:columnId', authenticateToken, authorizeRoles('accountant', 'dos', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { column_value } = req.body;
    
    await db.query(
      `INSERT INTO student_column_values (student_id, column_id, column_value, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE column_value = ?, updated_by = ?`,
      [req.params.studentId, req.params.columnId, column_value, req.user.id, column_value, req.user.id]
    );
    
    res.json({ message: 'Value updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new student (DOS/Headmaster)
router.post('/students', authenticateToken, authorizeRoles('dos', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { 
      student_id, first_name, last_name, email, phone, 
      date_of_birth, gender, trade_id, level_id, 
      enrollment_date, guardian_name, guardian_phone, guardian_email 
    } = req.body;
    
    // Get trade code for serial generation
    const [trades] = await db.query('SELECT code FROM trades WHERE id = ?', [trade_id]);
    const tradeCode = trades[0]?.code || 'STD';
    const year = new Date().getFullYear();
    
    // Insert student
    const [result] = await db.query(
      `INSERT INTO students 
       (student_id, first_name, last_name, email, phone, date_of_birth, gender, 
        trade_id, level_id, enrollment_date, guardian_name, guardian_phone, guardian_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, first_name, last_name, email, phone, date_of_birth, gender, 
       trade_id, level_id, enrollment_date || new Date(), guardian_name, guardian_phone, guardian_email]
    );
    
    // Auto-generate serial code
    const serialCode = `${tradeCode}-${year}-${String(result.insertId).padStart(4, '0')}`;
    await db.query(
      `INSERT INTO serial_codes (serial_code, trade_id, level_id, student_id, academic_year, status)
       VALUES (?, ?, ?, ?, ?, 'used')`,
      [serialCode, trade_id, level_id, result.insertId, year.toString()]
    );
    
    // Create notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, priority)
       SELECT id, 'New Student Added', ?, 'student', 'medium'
       FROM users WHERE role IN ('accountant', 'admin', 'super_admin')`,
      [`${first_name} ${last_name} added to ${tradeCode} with serial ${serialCode}`]
    );
    
    res.json({ message: 'Student added successfully', id: result.insertId, serial_code: serialCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/students/:id', authenticateToken, authorizeRoles('dos', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { 
      student_id, first_name, last_name, email, phone, 
      date_of_birth, gender, trade_id, level_id, 
      guardian_name, guardian_phone, guardian_email, status 
    } = req.body;
    
    await db.query(
      `UPDATE students 
       SET student_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?,
           date_of_birth = ?, gender = ?, trade_id = ?, level_id = ?,
           guardian_name = ?, guardian_phone = ?, guardian_email = ?, status = ?
       WHERE id = ?`,
      [student_id, first_name, last_name, email, phone, date_of_birth, gender, 
       trade_id, level_id, guardian_name, guardian_phone, guardian_email, status, req.params.id]
    );
    
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get full student details
router.get('/students/:id/details', authenticateToken, async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT s.*, t.name as trade_name, l.level_number, l.name as level_name
       FROM students s
       LEFT JOIN trades t ON s.trade_id = t.id
       LEFT JOIN levels l ON s.level_id = l.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = students[0];
    
    // Get custom column values
    const [columnValues] = await db.query(
      `SELECT scv.*, lsc.column_name, lsc.column_type
       FROM student_column_values scv
       JOIN level_sheet_columns lsc ON scv.column_id = lsc.id
       WHERE scv.student_id = ?`,
      [req.params.id]
    );
    
    // Get financial info
    const [financial] = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as total_paid,
         COALESCE(SUM(i.amount), 0) as total_invoiced,
         COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.amount ELSE 0 END), 0) as balance
       FROM invoices i WHERE i.student_id = ?`,
      [req.params.id]
    );
    
    // Get recent payments
    const [payments] = await db.query(
      `SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC LIMIT 5`,
      [req.params.id]
    );
    
    student.custom_values = columnValues;
    student.financial = financial[0];
    student.recent_payments = payments;
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parent: Request connection to student
router.post('/parent/connect', authenticateToken, authorizeRoles('parent'), async (req, res) => {
  try {
    const { student_id, relationship } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO parent_student_connections (parent_id, student_id, relationship)
       VALUES (?, ?, ?)`,
      [req.user.id, student_id, relationship || 'parent']
    );
    
    // Notify admins
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, priority)
       SELECT id, 'Parent Connection Request', ?, 'connection', 'medium'
       FROM users WHERE role IN ('dos', 'headmaster', 'admin', 'super_admin')`,
      [`Parent ${req.user.username} requested connection to student ID ${student_id}`]
    );
    
    res.json({ message: 'Connection request submitted', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parent connection requests
router.get('/parent/connections', authenticateToken, authorizeRoles('dos', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const [connections] = await db.query(
      `SELECT psc.*, u.username as parent_name, u.email as parent_email,
              s.first_name, s.last_name, s.student_id, t.name as trade_name, l.level_number
       FROM parent_student_connections psc
       JOIN users u ON psc.parent_id = u.id
       JOIN students s ON psc.student_id = s.id
       LEFT JOIN trades t ON s.trade_id = t.id
       LEFT JOIN levels l ON s.level_id = l.id
       WHERE psc.status = 'pending'
       ORDER BY psc.requested_at DESC`
    );
    
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject parent connection
router.put('/parent/connections/:id', authenticateToken, authorizeRoles('dos', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    
    await db.query(
      `UPDATE parent_student_connections 
       SET status = ?, approved_by = ?, approved_at = NOW()
       WHERE id = ?`,
      [status, req.user.id, req.params.id]
    );
    
    // Notify parent
    const [connection] = await db.query(
      'SELECT parent_id FROM parent_student_connections WHERE id = ?',
      [req.params.id]
    );
    
    if (connection.length > 0) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, priority)
         VALUES (?, 'Connection Request ${status}', ?, 'connection', 'high')`,
        [connection[0].parent_id, `Your connection request has been ${status}`]
      );
    }
    
    res.json({ message: `Connection ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search students for parent connection
router.get('/students/search', authenticateToken, async (req, res) => {
  try {
    const { query, trade_id, level_id } = req.query;
    
    let sql = `
      SELECT s.*, t.name as trade_name, l.level_number
      FROM students s
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN levels l ON s.level_id = l.id
      WHERE 1=1
    `;
    const params = [];
    
    if (query) {
      sql += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }
    
    if (trade_id) {
      sql += ` AND s.trade_id = ?`;
      params.push(trade_id);
    }
    
    if (level_id) {
      sql += ` AND s.level_id = ?`;
      params.push(level_id);
    }
    
    sql += ` ORDER BY s.first_name, s.last_name LIMIT 50`;
    
    const [students] = await db.query(sql, params);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

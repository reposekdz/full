const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all trades with levels
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const trades = [
      { id: 1, code: 'SOD', name: 'SOD', levels: [
        { id: 1, level_number: 3, level_suffix: '', name: 'Level 3' },
        { id: 2, level_number: 4, level_suffix: '', name: 'Level 4' },
        { id: 3, level_number: 5, level_suffix: '', name: 'Level 5' }
      ]},
      { id: 2, code: 'BDC', name: 'BDC', levels: [
        { id: 4, level_number: 3, level_suffix: '', name: 'Level 3' },
        { id: 5, level_number: 4, level_suffix: '', name: 'Level 4' },
        { id: 6, level_number: 5, level_suffix: '', name: 'Level 5' }
      ]},
      { id: 3, code: 'AUT', name: 'AUT', levels: [
        { id: 7, level_number: 3, level_suffix: '', name: 'Level 3' },
        { id: 8, level_number: 4, level_suffix: 'A', name: 'Level 4 A' },
        { id: 9, level_number: 4, level_suffix: 'B', name: 'Level 4 B' },
        { id: 10, level_number: 5, level_suffix: 'A', name: 'Level 5 A' },
        { id: 11, level_number: 5, level_suffix: 'B', name: 'Level 5 B' }
      ]}
    ];
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all levels
router.get('/levels', authenticateToken, async (req, res) => {
  try {
    const levels = [
      { id: 1, level_number: 3, level_suffix: '', name: 'Level 3' },
      { id: 2, level_number: 4, level_suffix: '', name: 'Level 4' },
      { id: 3, level_number: 4, level_suffix: 'A', name: 'Level 4 A' },
      { id: 4, level_number: 4, level_suffix: 'B', name: 'Level 4 B' },
      { id: 5, level_number: 5, level_suffix: '', name: 'Level 5' },
      { id: 6, level_number: 5, level_suffix: 'A', name: 'Level 5 A' },
      { id: 7, level_number: 5, level_suffix: 'B', name: 'Level 5 B' }
    ];
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get columns for specific trade and level (by code)
router.get('/columns/:tradeCode/:levelNumber', authenticateToken, async (req, res) => {
  try {
    const { tradeCode, levelNumber } = req.params;
    const { level_suffix } = req.query;
    
    // Create a virtual table for columns if not exists
    const columns = [];
    
    // Try to get from database first
    try {
      const [dbColumns] = await db.query(
        `SELECT * FROM level_sheet_columns 
         WHERE trade_code = ? AND level_number = ? AND level_suffix = ?
         ORDER BY display_order, id`,
        [tradeCode, levelNumber, level_suffix || '']
      );
      columns.push(...dbColumns);
    } catch (err) {
      console.log('Columns table not found, using default columns');
    }
    
    res.json({ success: true, columns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new column (All staff can add columns including matron/patron)
router.post('/columns', authenticateToken, authorizeRoles('teacher', 'accountant', 'dos', 'director_study', 'dod', 'director_discipline', 'matron', 'patron', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { trade_code, level_number, level_suffix, column_name, column_type, is_required, default_value, display_order } = req.body;
    
    // Create table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_sheet_columns (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_code VARCHAR(10) NOT NULL,
        level_number INT NOT NULL,
        level_suffix VARCHAR(5) DEFAULT '',
        column_name VARCHAR(100) NOT NULL,
        column_type VARCHAR(50) DEFAULT 'text',
        is_required BOOLEAN DEFAULT false,
        default_value TEXT,
        display_order INT DEFAULT 0,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_trade_level (trade_code, level_number, level_suffix)
      )
    `);
    
    const [result] = await db.query(
      `INSERT INTO level_sheet_columns 
       (trade_code, level_number, level_suffix, column_name, column_type, is_required, default_value, display_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [trade_code, level_number, level_suffix || '', column_name, column_type || 'text', is_required || false, default_value, display_order || 0, req.user.id]
    );
    
    res.json({ success: true, message: 'Column created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update column (All staff including matron/patron)
router.put('/columns/:id', authenticateToken, authorizeRoles('teacher', 'accountant', 'dos', 'director_study', 'dod', 'director_discipline', 'matron', 'patron', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { column_name, column_type, is_required, default_value, display_order } = req.body;
    
    await db.query(
      `UPDATE level_sheet_columns 
       SET column_name = ?, column_type = ?, is_required = ?, default_value = ?, display_order = ?
       WHERE id = ?`,
      [column_name, column_type, is_required, default_value, display_order, req.params.id]
    );
    
    res.json({ success: true, message: 'Column updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete column (All staff including matron/patron)
router.delete('/columns/:id', authenticateToken, authorizeRoles('teacher', 'accountant', 'dos', 'director_study', 'dod', 'director_discipline', 'matron', 'patron', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM level_sheet_columns WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Column deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students by trade and level with custom columns (All staff access including matron/patron)
router.get('/sheets/:tradeCode/:levelNumber', authenticateToken, authorizeRoles('teacher', 'accountant', 'dos', 'director_study', 'dod', 'director_discipline', 'matron', 'patron', 'headmaster', 'advisor', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { tradeCode, levelNumber } = req.params;
    const { level_suffix } = req.query;
    
    const [students] = await db.query(
      `SELECT u.* FROM users u
       WHERE u.role = 'student' AND u.status = 'active'
       AND u.trade_code = ? AND u.level_number = ? AND u.level_suffix = ?
       ORDER BY u.first_name, u.last_name`,
      [tradeCode, levelNumber, level_suffix || '']
    );
    
    // Get custom columns
    let columns = [];
    try {
      [columns] = await db.query(
        `SELECT * FROM level_sheet_columns 
         WHERE trade_code = ? AND level_number = ? AND level_suffix = ?
         ORDER BY display_order`,
        [tradeCode, levelNumber, level_suffix || '']
      );
    } catch (err) {
      console.log('No custom columns found');
    }
    
    // Get column values
    const studentIds = students.map(s => s.id);
    let values = [];
    if (studentIds.length > 0 && columns.length > 0) {
      try {
        await db.query(`
          CREATE TABLE IF NOT EXISTS student_column_values (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id INT NOT NULL,
            column_id INT NOT NULL,
            column_value TEXT,
            updated_by INT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_student_column (student_id, column_id),
            INDEX idx_student (student_id)
          )
        `);
        
        [values] = await db.query(
          'SELECT * FROM student_column_values WHERE student_id IN (?)',
          [studentIds]
        );
      } catch (err) {
        console.log('Column values table error:', err.message);
      }
    }
    
    // Attach column values to students
    students.forEach(student => {
      student.custom_values = {};
      columns.forEach(col => {
        const value = values.find(v => v.student_id === student.id && v.column_id === col.id);
        student.custom_values[col.id] = value ? value.column_value : col.default_value;
      });
    });
    
    res.json({ success: true, students, columns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students (for global access by staff including matron/patron)
router.get('/students', authenticateToken, authorizeRoles('dos', 'director_study', 'headmaster', 'dod', 'director_discipline', 'matron', 'patron', 'teacher', 'accountant', 'advisor', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { trade_code, level_number, search } = req.query;
    
    let sql = `
      SELECT u.*, u.trade_code, u.level_number, u.level_suffix
      FROM users u
      WHERE u.role = 'student' AND u.status = 'active'
    `;
    const params = [];
    
    if (trade_code) {
      sql += ` AND u.trade_code = ?`;
      params.push(trade_code);
    }
    
    if (level_number) {
      sql += ` AND u.level_number = ?`;
      params.push(level_number);
    }
    
    if (search) {
      sql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.username LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ` ORDER BY u.first_name, u.last_name`;
    
    const [students] = await db.query(sql, params);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update student column value (All staff including matron/patron)
router.put('/students/:studentId/columns/:columnId', authenticateToken, authorizeRoles('teacher', 'accountant', 'dos', 'director_study', 'dod', 'director_discipline', 'matron', 'patron', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { column_value } = req.body;
    
    await db.query(
      `INSERT INTO student_column_values (student_id, column_id, column_value, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE column_value = ?, updated_by = ?`,
      [req.params.studentId, req.params.columnId, column_value, req.user.id, column_value, req.user.id]
    );
    
    res.json({ success: true, message: 'Value updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new student (DOS/Headmaster)
router.post('/students', authenticateToken, authorizeRoles('dos', 'director_study', 'headmaster', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { 
      student_id, first_name, last_name, email, phone, 
      date_of_birth, gender, trade_code, level_number, level_suffix,
      enrollment_date, guardian_name, guardian_phone, guardian_email 
    } = req.body;
    
    if (!trade_code || !level_number) {
      return res.status(400).json({ error: 'Trade code and level number are required' });
    }
    
    const year = new Date().getFullYear();
    
    // Check if users table exists, if not use students table
    const [result] = await db.query(
      `INSERT INTO users 
       (username, password, role, first_name, last_name, email, phone, date_of_birth, gender, 
        trade_code, level_number, level_suffix, enrollment_date, guardian_name, guardian_phone, guardian_email, status)
       VALUES (?, ?, 'student', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [student_id || `STD${Date.now()}`, 'password123', first_name, last_name, email, phone, date_of_birth, gender, 
       trade_code, level_number, level_suffix || '', enrollment_date || new Date(), guardian_name, guardian_phone, guardian_email]
    );
    
    // Auto-generate serial code
    const serialCode = `${trade_code}-${level_number}${level_suffix || ''}-${year}-${String(result.insertId).padStart(4, '0')}`;
    
    // Create notification
    try {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, priority, created_at)
         SELECT id, 'New Student Added', ?, 'student', 'medium', NOW()
         FROM users WHERE role IN ('accountant', 'admin', 'super_admin')`,
        [`${first_name} ${last_name} added to ${trade_code} Level ${level_number}${level_suffix || ''} with serial ${serialCode}`]
      );
    } catch (notifError) {
      console.log('Notification creation failed:', notifError.message);
    }
    
    res.json({ 
      success: true,
      message: 'Student added successfully', 
      id: result.insertId, 
      serial_code: serialCode,
      student: {
        id: result.insertId,
        first_name,
        last_name,
        trade_code,
        level_number,
        level_suffix
      }
    });
  } catch (error) {
    console.error('Error adding student:', error);
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

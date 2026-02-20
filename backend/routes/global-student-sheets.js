const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Middleware to check permissions
const checkGlobalSheetsPermission = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const allowedRoles = ['accountant', 'dos', 'dod', 'headmaster', 'teacher', 'advisor', 'stock_manager', 'matron', 'patron', 'admin'];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// TEACHER MARKS & ASSESSMENT ENDPOINTS
// ==========================================

// GET /columns - Get assessment columns for a specific context
router.get('/columns', authenticateToken, async (req, res) => {
  try {
    const { trade, level, year, term } = req.query;

    let query = `
      SELECT id, column_name, column_label, max_marks, weight, trade_code, level_number, academic_year, term, course_name
      FROM global_student_sheets_custom_columns 
      WHERE is_active = TRUE
    `;
    const params = [];

    if (trade) {
      query += ' AND (trade_code IS NULL OR trade_code = ?)';
      params.push(trade);
    }
    if (level) {
      query += ' AND (level_number IS NULL OR level_number = ?)';
      params.push(level);
    }

    query += ' ORDER BY created_at ASC';

    const [columns] = await pool.execute(query, params);
    res.json({ success: true, columns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /add-column - Add new assessment column
router.post('/add-column', authenticateToken, async (req, res) => {
  try {
    const {
      column_name, assessment_type, max_marks,
      course_name, weight, trade_code, level_number,
      academic_year, term, created_by
    } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO global_student_sheets_custom_columns 
      (column_name, assessment_type, max_marks, course_name, weight, trade_code, level_number, academic_year, term, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [column_name, assessment_type, max_marks, course_name, weight, trade_code, level_number, academic_year, term, created_by]);

    res.json({ success: true, message: 'Column added successfully', columnId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /marks - Get marks for students
router.get('/marks', authenticateToken, async (req, res) => {
  try {
    const { trade, level, year, term } = req.query;

    // Get marks joined with students to filter by trade/level
    const [marks] = await pool.execute(`
      SELECT sm.* 
      FROM student_marks sm
      JOIN users u ON sm.student_id = u.id
      WHERE u.role = 'student'
        AND (u.trade_code = ? OR ? IS NULL)
        AND (u.level = ? OR ? IS NULL)
        AND sm.academic_year = ?
        AND sm.term = ?
    `, [trade, trade, level, level, year, term]);

    res.json({ success: true, marks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /save-marks - Bulk save marks
router.post('/save-marks', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { marks } = req.body; // Array of { student_id, column_id, marks, academic_year, term }

    for (const mark of marks) {
      await connection.execute(`
        INSERT INTO student_marks (student_id, column_id, marks, academic_year, term, updated_by)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        marks = VALUES(marks),
        updated_by = VALUES(updated_by)
      `, [mark.student_id, mark.column_id, mark.marks, mark.academic_year, mark.term, req.user.id]);
    }

    await connection.commit();
    res.json({ success: true, message: 'Marks saved successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// ==========================================
// GLOBAL SHEETS VIEW ENDPOINTS (Existing)
// ==========================================

// GET /levels/:tradeCode - Get real levels for a trade from global_student_sheets
router.get('/levels/:tradeCode', authenticateToken, async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    const [levels] = await pool.execute(`
      SELECT DISTINCT level_number
      FROM global_student_sheets
      WHERE trade_code = ? AND status = 'active'
      ORDER BY level_number ASC
    `, [tradeCode]);

    const levelNumbers = levels.map(l => l.level_number);
    
    res.json({
      success: true,
      levels: levelNumbers.length > 0 ? levelNumbers : [3, 4, 5]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, levels: [3, 4, 5] });
  }
});

// Get all students - accessible to all staff roles
router.get('/students', authenticateToken, checkGlobalSheetsPermission, async (req, res) => {
  try {
    const tradeId = req.query.trade_id;
    const levelId = req.query.level_id;
    const levelSuffix = req.query.level_suffix || ''; // New: Support for 4A, 4B
    const status = req.query.status;
    const search = req.query.search;

    let query = `
      SELECT
        u.id as student_id,
        u.first_name,
        u.last_name,
        u.serial_code as student_code,
        u.level_suffix,
        COALESCE(u.gender, 'M') as gender,
        COALESCE(u.phone, '') as phone,
        u.trade_code,
        u.level as level_number,
        COALESCE(u.status, 'active') as status
      FROM users u
      WHERE u.role = 'student'
    `;

    const params = [];

    if (tradeId) {
      query += ` AND u.trade_code = ?`;
      params.push(tradeId);
    }
    if (levelId) {
      query += ` AND u.level = ?`;
      params.push(levelId);
    }
    if (levelSuffix) {
      query += ` AND (u.level_suffix = ? OR u.level_suffix IS NULL)`;
      params.push(levelSuffix);
    }

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.serial_code LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY u.last_name, u.first_name';

    const [students] = await pool.execute(query, params);

    res.json({
      success: true,
      students,
      userRole: req.user.role
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /students/create - Create new student
router.post('/students/create', authenticateToken, checkGlobalSheetsPermission, async (req, res) => {
  try {
    const { first_name, last_name, student_code, trade_code, level_number, gender, phone } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO global_student_sheets (first_name, last_name, student_code, trade_code, level_number, gender, phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `, [first_name, last_name, student_code, trade_code, level_number, gender || 'M', phone || '']);

    res.json({ success: true, message: 'Student created successfully', studentId: result.insertId });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /statistics - Get global statistics for dashboard
router.get('/statistics', authenticateToken, checkGlobalSheetsPermission, async (req, res) => {
  try {
    // Total Expected vs Collected
    const [financeStats] = await pool.execute(`
            SELECT 
                COALESCE(SUM(total_fees), 0) as total_fees,
                COALESCE(SUM(paid_amount), 0) as total_paid,
                COALESCE(SUM(balance), 0) as total_balance,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_students,
                SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_students,
                COUNT(*) as active_students
            FROM global_student_sheets
            WHERE academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
        `);

    // Additional stats like attendance avg if available
    const [academicStats] = await pool.execute(`
            SELECT 
                AVG(attendance_percentage) as avg_attendance,
                AVG(average_marks) as avg_marks
            FROM global_student_sheets
        `);

    res.json({
      success: true,
      statistics: {
        ...financeStats[0],
        ...academicStats[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
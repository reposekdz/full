const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Middleware to check permissions
const checkGlobalSheetsPermission = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const allowedRoles = ['accountant', 'dos', 'dod', 'director_discipline', 'headmaster', 'teacher', 'advisor', 'stock_manager', 'matron', 'patron', 'admin'];

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

// TEST endpoint - Get AUTO students directly
router.get('/test-auto', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT student_code, first_name, last_name, level_suffix, level_number
      FROM global_student_sheets
      WHERE trade_code = 'AUTO' AND level_number = 5
      ORDER BY level_suffix, student_code
      LIMIT 20
    `);
    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /suffixes - Get available suffixes for a trade/level combination
router.get('/suffixes', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;
    
    const [suffixes] = await pool.execute(`
      SELECT DISTINCT level_suffix
      FROM global_student_sheets
      WHERE trade_code = ? AND level_number = ? AND status = 'active'
      ORDER BY level_suffix ASC
    `, [trade_code, level_number]);

    const suffixList = suffixes.map(s => s.level_suffix || '').filter(s => s !== '');
    
    res.json({
      success: true,
      suffixes: suffixList
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, suffixes: [] });
  }
});

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
    const levelSuffix = req.query.level_suffix;
    const status = req.query.status;
    const search = req.query.search;

    let query = `
      SELECT
        student_id,
        first_name,
        last_name,
        student_code,
        level_suffix,
        COALESCE(gender, 'M') as gender,
        COALESCE(phone, '') as phone,
        trade_code,
        level_number,
        COALESCE(status, 'active') as status,
        COALESCE(conduct_score, 40) as conduct_score,
        COALESCE(attendance_percentage, 100) as attendance_percentage
      FROM global_student_sheets
      WHERE 1=1
    `;

    const params = [];

    if (tradeId) {
      query += ` AND trade_code = ?`;
      params.push(tradeId);
    }
    if (levelId) {
      query += ` AND level_number = ?`;
      params.push(levelId);
    }
    // Only filter by suffix if explicitly provided
    if (levelSuffix && levelSuffix !== '' && levelSuffix !== 'all') {
      query += ` AND level_suffix = ?`;
      params.push(levelSuffix);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY level_suffix, last_name, first_name';

    const [students] = await pool.execute(query, params);

    res.json({
      success: true,
      students,
      count: students.length,
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

// POST /add-student - Add new student (DOS/Headmaster only)
router.post('/add-student', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const allowedRoles = ['director_study', 'headmaster', 'admin', 'director_discipline'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only DOS/Headmaster can add students' });
    }

    const {
      first_name, last_name, email, phone, gender, date_of_birth, address,
      trade_code, level_number, level_suffix, student_code,
      conduct_score, attendance_percentage, payment_status
    } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO global_student_sheets (
        first_name, last_name, email, phone, gender, date_of_birth, address,
        trade_code, level_number, level_suffix, student_code,
        conduct_score, attendance_percentage, payment_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      first_name, last_name, email || null, phone || null, gender, date_of_birth || null, address || null,
      trade_code, level_number, level_suffix || '', student_code,
      conduct_score || 40, attendance_percentage || 100, payment_status || 'pending'
    ]);

    res.json({ success: true, message: 'Student added successfully', studentId: result.insertId });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /update-student - Update student information
router.put('/update-student', authenticateToken, async (req, res) => {
  try {
    const { student_id, first_name, last_name, email, phone, gender, address } = req.body;

    const updates = [];
    const params = [];

    if (first_name) {
      updates.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      params.push(last_name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (gender) {
      updates.push('gender = ?');
      params.push(gender);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(student_id);

    await pool.execute(`
      UPDATE global_student_sheets
      SET ${updates.join(', ')}
      WHERE student_id = ?
    `, params);

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /delete-student/:id - Delete student (DOS/Headmaster only)
router.delete('/delete-student/:id', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const allowedRoles = ['director_study', 'headmaster', 'admin', 'director_discipline'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only DOS/Headmaster can delete students' });
    }

    const studentId = req.params.id;

    await pool.execute(`
      UPDATE global_student_sheets
      SET status = 'deleted'
      WHERE student_id = ?
    `, [studentId]);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
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
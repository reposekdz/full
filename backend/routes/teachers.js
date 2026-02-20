const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

// ================== ADMIN ENDPOINTS ==================

// Get all teachers (Admin)
router.get('/list', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone,
        u.is_active, u.created_at,
        (SELECT COUNT(DISTINCT c.id) FROM classes c WHERE c.teacher_id = u.id AND c.is_active = 1) as class_count,
        (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e 
         JOIN classes c ON e.class_id = c.id 
         WHERE c.teacher_id = u.id AND e.status = 'active') as student_count
      FROM users u
      WHERE u.role = 'teacher'
    `;
    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (status === 'active') {
      query += ` AND u.is_active = 1`;
    } else if (status === 'inactive') {
      query += ` AND u.is_active = 0`;
    }

    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [teachers] = await pool.execute(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = "teacher"';
    const countParams = [];
    if (search) {
      countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam);
    }
    if (status === 'active') {
      countQuery += ` AND is_active = 1`;
    } else if (status === 'inactive') {
      countQuery += ` AND is_active = 0`;
    }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      teachers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List teachers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
});

// Get teacher by ID (Admin)
router.get('/details/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [teachers] = await pool.execute(`
      SELECT u.*
      FROM users u
      WHERE u.id = ? AND u.role = 'teacher'
    `, [id]);

    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const [classes] = await pool.execute(`
      SELECT c.*, co.name as course_name,
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN enrollments e ON c.id = e.class_id AND e.status = 'active'
      WHERE c.teacher_id = ?
      GROUP BY c.id
    `, [id]);

    const [assignments] = await pool.execute(`
      SELECT a.*, s.name as subject_name
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.teacher_id = ?
      ORDER BY a.due_date DESC
      LIMIT 10
    `, [id]);

    const [[metrics]] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM grades WHERE teacher_id = ?) as total_grades,
        (SELECT COUNT(*) FROM attendance WHERE marked_by = ?) as total_attendance_marked,
        (SELECT COUNT(DISTINCT class_id) FROM classes WHERE teacher_id = ?) as active_classes
    `, [id, id, id]);

    res.json({
      success: true,
      teacher: teachers[0],
      classes,
      assignments,
      metrics
    });
  } catch (error) {
    console.error('Get teacher details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher details' });
  }
});

// Create new teacher (Admin/DOS)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    // Check if user has permission (admin, headmaster, or director_study)
    const allowedRoles = ['admin', 'super_admin', 'headmaster', 'director_study', 'dos'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions. Your role: ' + req.user.role 
      });
    }

    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'First name and last name are required' });
    }

    // Auto-generate email if not provided
    const teacherEmail = email || `${first_name.toLowerCase()}.${last_name.toLowerCase()}@garden.rw`;
    const hashedPassword = await bcrypt.hash(password || 'teacher123', 10);
    const username = teacherEmail.split('@')[0] + Math.floor(Math.random() * 1000);

    // Get the teacher role_id from roles table
    const [teacherRole] = await pool.execute('SELECT id FROM roles WHERE name = "teacher"');
    const teacherRoleId = teacherRole.length > 0 ? teacherRole[0].id : null;

    const [result] = await pool.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, phone, role, role_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 'teacher', ?, 1)
    `, [username, teacherEmail, hashedPassword, first_name, last_name, phone || null, teacherRoleId]);

    res.json({
      success: true,
      message: 'Teacher created successfully',
      teacher: { id: result.insertId, username, email: teacherEmail, first_name, last_name }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Email already exists' : error.message || 'Failed to create teacher'
    });
  }
});

// Update teacher (Admin)
router.put('/update/:id', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, is_active } = req.body;

    const [result] = await pool.execute(`
      UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        is_active = COALESCE(?, is_active)
      WHERE id = ? AND role = 'teacher'
    `, [first_name, last_name, email, phone, is_active, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to update teacher' });
  }
});

// Delete teacher (Admin)
router.delete('/delete/:id', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'director_study'), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM users WHERE id = ? AND role = "teacher"', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete teacher' });
  }
});

// Get teacher statistics (Admin)
router.get('/admin/statistics', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const [[{ total_teachers }]] = await pool.execute('SELECT COUNT(*) as total_teachers FROM users WHERE role = "teacher"');
    const [[{ active_teachers }]] = await pool.execute('SELECT COUNT(*) as active_teachers FROM users WHERE role = "teacher" AND is_active = 1');

    const [teacherPerformance] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name,
        COUNT(DISTINCT c.id) as classes_taught,
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(DISTINCT g.id) as grades_submitted
      FROM users u
      LEFT JOIN classes c ON u.id = c.teacher_id AND c.is_active = 1
      LEFT JOIN enrollments e ON c.id = e.class_id AND e.status = 'active'
      LEFT JOIN grades g ON u.id = g.teacher_id
      WHERE u.role = 'teacher'
      GROUP BY u.id
      ORDER BY classes_taught DESC, total_students DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      statistics: {
        total_teachers,
        active_teachers,
        top_performers: teacherPerformance
      }
    });
  } catch (error) {
    console.error('Get teacher statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ================== TEACHER-SPECIFIC ENDPOINTS ==================

// Get all trades with levels (for teacher dashboard)
router.get('/trades-levels', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT DISTINCT trade_code, trade_name, level_number
      FROM global_student_sheets
      WHERE status = 'active'
      ORDER BY trade_code, level_number
    `);

    const tradesMap = {};
    trades.forEach(t => {
      if (!tradesMap[t.trade_code]) {
        tradesMap[t.trade_code] = { trade_code: t.trade_code, trade_name: t.trade_name, levels: [] };
      }
      if (!tradesMap[t.trade_code].levels.includes(t.level_number)) {
        tradesMap[t.trade_code].levels.push(t.level_number);
      }
    });

    res.json({ success: true, trades: Object.values(tradesMap) });
  } catch (error) {
    console.error('Get trades-levels error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get students by trade and level
router.get('/students-by-trade-level', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;

    if (!trade_code || !level_number) {
      return res.status(400).json({ success: false, message: 'Trade code and level number required' });
    }

    const [students] = await pool.execute(`
      SELECT 
        gss.id, gss.student_id, gss.student_code, gss.first_name, gss.last_name,
        gss.trade_code, gss.trade_name, gss.level_number, gss.gpa, gss.attendance_percentage,
        gss.gender, gss.email, gss.phone
      FROM global_student_sheets gss
      WHERE gss.trade_code = ? AND gss.level_number = ? AND gss.status = 'active'
      ORDER BY gss.first_name, gss.last_name
    `, [trade_code, level_number]);

    res.json({ success: true, students, count: students.length });
  } catch (error) {
    console.error('Get students by trade-level error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save marks with dynamic columns
router.post('/marks/save', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { trade_code, level_number, marks_data, columns_data } = req.body;
    const teacher_id = req.user.userId || req.user.id;

    if (!trade_code || !level_number || !marks_data || !columns_data) {
      return res.status(400).json({ success: false, message: 'Invalid data provided' });
    }

    // Create table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS student_marks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        teacher_id INT NOT NULL,
        trade_code VARCHAR(10) NOT NULL,
        level_number INT NOT NULL,
        assessment_name VARCHAR(100) NOT NULL,
        marks DECIMAL(5,2) NOT NULL DEFAULT 0,
        max_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
        weight DECIMAL(5,2) NOT NULL DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_teacher (teacher_id),
        INDEX idx_trade_level (trade_code, level_number),
        UNIQUE KEY unique_mark (student_id, teacher_id, trade_code, level_number, assessment_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    let savedCount = 0;
    for (const mark of marks_data) {
      const { student_id, assessment_name, marks, max_marks, weight } = mark;
      
      const [existing] = await pool.execute(`
        SELECT id FROM student_marks 
        WHERE student_id = ? AND assessment_name = ? AND trade_code = ? AND level_number = ? AND teacher_id = ?
      `, [student_id, assessment_name, trade_code, level_number, teacher_id]);

      if (existing.length > 0) {
        await pool.execute(`
          UPDATE student_marks 
          SET marks = ?, max_marks = ?, weight = ?, updated_at = NOW()
          WHERE id = ?
        `, [marks, max_marks, weight, existing[0].id]);
      } else {
        await pool.execute(`
          INSERT INTO student_marks (student_id, teacher_id, trade_code, level_number, assessment_name, marks, max_marks, weight, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [student_id, teacher_id, trade_code, level_number, assessment_name, marks, max_marks, weight]);
      }
      savedCount++;
    }

    res.json({ success: true, message: `Saved ${savedCount} marks successfully` });
  } catch (error) {
    console.error('Save marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Load saved marks
router.get('/marks/load', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;
    const teacher_id = req.user.userId || req.user.id;

    if (!trade_code || !level_number) {
      return res.status(400).json({ success: false, message: 'Trade code and level number required' });
    }

    const [marks] = await pool.execute(`
      SELECT sm.*, gss.first_name, gss.last_name
      FROM student_marks sm
      JOIN global_student_sheets gss ON sm.student_id = gss.student_id
      WHERE sm.trade_code = ? AND sm.level_number = ? AND sm.teacher_id = ?
      ORDER BY gss.first_name, gss.last_name, sm.assessment_name
    `, [trade_code, level_number, teacher_id]);

    res.json({ success: true, marks });
  } catch (error) {
    console.error('Load marks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all students (global sheets)
router.get('/global-students', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { search, trade_code, level_number, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT gss.*, 
        (SELECT AVG(marks) FROM student_marks WHERE student_id = gss.student_id) as avg_marks
      FROM global_student_sheets gss
      WHERE gss.status = 'active'
    `;
    const params = [];

    if (search) {
      query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (trade_code) {
      query += ` AND gss.trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND gss.level_number = ?`;
      params.push(level_number);
    }

    query += ` ORDER BY gss.first_name, gss.last_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    res.json({ success: true, students, count: students.length });
  } catch (error) {
    console.error('Get global students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete marks column
router.delete('/marks/column', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { trade_code, level_number, assessment_name } = req.body;
    const teacher_id = req.user.userId || req.user.id;

    await pool.execute(`
      DELETE FROM student_marks 
      WHERE teacher_id = ? AND trade_code = ? AND level_number = ? AND assessment_name = ?
    `, [teacher_id, trade_code, level_number, assessment_name]);

    res.json({ success: true, message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Delete column error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get teacher statistics
router.get('/statistics', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const teacher_id = req.user.userId || req.user.id;

    const [[stats]] = await pool.execute(`
      SELECT 
        (SELECT COUNT(DISTINCT trade_code) FROM student_marks WHERE teacher_id = ?) as trades_taught,
        (SELECT COUNT(DISTINCT student_id) FROM student_marks WHERE teacher_id = ?) as students_graded,
        (SELECT COUNT(*) FROM student_marks WHERE teacher_id = ?) as total_marks_entered,
        (SELECT AVG(marks) FROM student_marks WHERE teacher_id = ?) as avg_marks_given
    `, [teacher_id, teacher_id, teacher_id, teacher_id]);

    res.json({ success: true, statistics: stats });
  } catch (error) {
    console.error('Get teacher statistics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get teacher's classes
router.get('/classes', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT c.*, co.name as course_name, co.code as course_code,
        ay.name as academic_year_name,
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN enrollments e ON c.id = e.class_id AND e.status = 'active'
      WHERE c.teacher_id = ? AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `, [req.user.id]);

    res.json({ success: true, classes });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get students in teacher's class
router.get('/classes/:classId/students', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { classId } = req.params;

    const [authorized] = await pool.execute(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [classId, req.user.id]
    );

    if (authorized.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [students] = await pool.execute(`
      SELECT u.*, e.enrollment_date,
        (SELECT AVG(g.obtained_marks/g.max_marks * 100) 
         FROM grades g WHERE g.student_id = u.id AND g.class_id = ?) as average_grade,
        (SELECT COUNT(*) FROM attendance a 
         WHERE a.student_id = u.id AND a.class_id = ? AND a.status = 'present') as present_count,
        (SELECT COUNT(*) FROM attendance a 
         WHERE a.student_id = u.id AND a.class_id = ?) as total_attendance
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [classId, classId, classId, classId]);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit grades for multiple students
router.post('/grades/bulk', [
  authenticateToken,
  requireRole('teacher'),
  body('grades').isArray().withMessage('Grades must be an array'),
  body('grades.*.student_id').isInt().withMessage('Valid student ID required'),
  body('grades.*.subject_id').isInt().withMessage('Valid subject ID required'),
  body('grades.*.class_id').isInt().withMessage('Valid class ID required'),
  body('grades.*.obtained_marks').isFloat({ min: 0 }).withMessage('Valid marks required'),
  body('grades.*.max_marks').isFloat({ min: 0 }).withMessage('Valid max marks required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { grades } = req.body;
    const insertedGrades = [];

    for (const grade of grades) {
      const percentage = (grade.obtained_marks / grade.max_marks) * 100;
      let grade_letter = 'F';
      if (percentage >= 90) grade_letter = 'A';
      else if (percentage >= 80) grade_letter = 'B';
      else if (percentage >= 70) grade_letter = 'C';
      else if (percentage >= 60) grade_letter = 'D';
      else if (percentage >= 50) grade_letter = 'E';

      const [result] = await pool.execute(`
        INSERT INTO grades (
          student_id, subject_id, class_id, assessment_type, assessment_name,
          max_marks, obtained_marks, grade_letter, assessment_date, teacher_id, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        grade.student_id, grade.subject_id, grade.class_id,
        grade.assessment_type || 'exam', grade.assessment_name,
        grade.max_marks, grade.obtained_marks, grade_letter,
        grade.assessment_date || new Date().toISOString().split('T')[0],
        req.user.id, grade.comments
      ]);

      insertedGrades.push({ id: result.insertId, ...grade, grade_letter });
    }

    res.status(201).json({ success: true, message: 'Grades submitted successfully', grades: insertedGrades });
  } catch (error) {
    console.error('Submit grades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark attendance for class
router.post('/attendance/bulk', [
  authenticateToken,
  requireRole('teacher'),
  body('attendance').isArray().withMessage('Attendance must be an array'),
  body('class_id').isInt().withMessage('Valid class ID required'),
  body('subject_id').isInt().withMessage('Valid subject ID required'),
  body('attendance_date').notEmpty().withMessage('Date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { attendance, class_id, subject_id, attendance_date } = req.body;

    for (const record of attendance) {
      const [existing] = await pool.execute(
        'SELECT id FROM attendance WHERE student_id = ? AND class_id = ? AND subject_id = ? AND attendance_date = ?',
        [record.student_id, class_id, subject_id, attendance_date]
      );

      if (existing.length > 0) {
        await pool.execute(
          'UPDATE attendance SET status = ?, notes = ?, marked_by = ? WHERE id = ?',
          [record.status, record.notes, req.user.id, existing[0].id]
        );
      } else {
        await pool.execute(
          'INSERT INTO attendance (student_id, class_id, subject_id, attendance_date, status, notes, marked_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [record.student_id, class_id, subject_id, attendance_date, record.status, record.notes, req.user.id]
        );
      }
    }

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get teacher statistics
router.get('/statistics', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(DISTINCT c.id) FROM classes c WHERE c.teacher_id = ? AND c.is_active = true) as total_classes,
        (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e 
         JOIN classes c ON e.class_id = c.id 
         WHERE c.teacher_id = ? AND e.status = 'active') as total_students,
        (SELECT COUNT(*) FROM grades g WHERE g.teacher_id = ?) as total_grades,
        (SELECT COUNT(*) FROM attendance a WHERE a.marked_by = ?) as total_attendance
    `, [req.user.id, req.user.id, req.user.id, req.user.id]);

    res.json({ success: true, statistics: stats[0] });
  } catch (error) {
    console.error('Get teacher statistics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

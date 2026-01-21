const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ============ STUDENTS MANAGEMENT ============

// Get all students with filters
router.get('/students', authenticateToken, requireRole('director_discipline'), async (req, res) => {
  try {
    const { class_id, level_id, trade_id, search, status } = req.query;
    let query = `
      SELECT u.*, c.name as class_name, l.name as level_name, t.name as trade_name
      FROM users u
      LEFT JOIN classes c ON u.class_id = c.id
      LEFT JOIN levels l ON u.level_id = l.id
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
    `;
    const params = [];

    if (class_id) {
      query += ' AND u.class_id = ?';
      params.push(class_id);
    }
    if (level_id) {
      query += ' AND u.level_id = ?';
      params.push(level_id);
    }
    if (trade_id) {
      query += ' AND u.trade_id = ?';
      params.push(trade_id);
    }
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND u.is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    query += ' ORDER BY u.first_name ASC';
    const [students] = await pool.execute(query, params);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student details
router.get('/students/:id', authenticateToken, requireRole('director_discipline'), async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT u.*, c.name as class_name, l.name as level_name, t.name as trade_name
      FROM users u
      LEFT JOIN classes c ON u.class_id = c.id
      LEFT JOIN levels l ON u.level_id = l.id
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.id = ? AND u.role_id = (SELECT id FROM roles WHERE name = 'student')
    `, [req.params.id]);

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student: student[0] });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update student
router.put('/students/:id', [
  authenticateToken,
  requireRole('director_discipline'),
  body('first_name').optional().notEmpty(),
  body('last_name').optional().notEmpty(),
  body('class_id').optional().isInt(),
  body('level_id').optional().isInt(),
  body('trade_id').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { first_name, last_name, class_id, level_id, trade_id } = req.body;
    const updateFields = [];
    const updateValues = [];

    if (first_name) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (class_id) {
      updateFields.push('class_id = ?');
      updateValues.push(class_id);
    }
    if (level_id) {
      updateFields.push('level_id = ?');
      updateValues.push(level_id);
    }
    if (trade_id) {
      updateFields.push('trade_id = ?');
      updateValues.push(trade_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateValues.push(req.params.id);
    await pool.execute(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ CLASSES MANAGEMENT ============

router.get('/classes', authenticateToken, requireRole('director_discipline'), async (req, res) => {
  try {
    const [classes] = await pool.execute('SELECT * FROM classes ORDER BY name ASC');
    res.json({ success: true, classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/classes', [
  authenticateToken,
  requireRole('director_discipline'),
  body('name').notEmpty().withMessage('Class name is required'),
  body('level_id').isInt().withMessage('Level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, level_id, capacity } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO classes (name, level_id, capacity) VALUES (?, ?, ?)',
      [name, level_id, capacity || 50]
    );

    res.status(201).json({ success: true, message: 'Class created', id: result.insertId });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ LEVELS MANAGEMENT ============

router.get('/levels', authenticateToken, requireRole('director_discipline'), async (req, res) => {
  try {
    const [levels] = await pool.execute('SELECT * FROM levels ORDER BY name ASC');
    res.json({ success: true, levels });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/levels', [
  authenticateToken,
  requireRole('director_discipline'),
  body('name').notEmpty().withMessage('Level name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO levels (name, description) VALUES (?, ?)',
      [name, description || '']
    );

    res.status(201).json({ success: true, message: 'Level created', id: result.insertId });
  } catch (error) {
    console.error('Create level error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ TRADES MANAGEMENT ============

router.get('/trades', authenticateToken, requireRole('director_discipline'), async (req, res) => {
  try {
    const [trades] = await pool.execute('SELECT * FROM trades ORDER BY name ASC');
    res.json({ success: true, trades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/trades', [
  authenticateToken,
  requireRole('director_discipline'),
  body('name').notEmpty().withMessage('Trade name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, code } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO trades (name, description, code) VALUES (?, ?, ?)',
      [name, description || '', code || '']
    );

    res.status(201).json({ success: true, message: 'Trade created', id: result.insertId });
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ TEACHERS MANAGEMENT ============

router.get('/teachers', authenticateToken, requireRole('director_discipline'), async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT u.*, GROUP_CONCAT(c.name) as classes
      FROM users u
      LEFT JOIN class_teachers ct ON u.id = ct.teacher_id
      LEFT JOIN classes c ON ct.class_id = c.id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'teacher')
      GROUP BY u.id
      ORDER BY u.first_name ASC
    `);

    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/teachers/:id/assign-class', [
  authenticateToken,
  requireRole('director_discipline'),
  body('class_id').isInt().withMessage('Class is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { class_id } = req.body;
    await pool.execute(
      'INSERT INTO class_teachers (teacher_id, class_id) VALUES (?, ?)',
      [req.params.id, class_id]
    );

    res.json({ success: true, message: 'Teacher assigned to class' });
  } catch (error) {
    console.error('Assign teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ CONDUCT RECORDS ============

router.get('/conduct-records', authenticateToken, requireRole('director_discipline'), async (req, res) => {
  try {
    const { student_id, type, status } = req.query;
    let query = `
      SELECT cr.*, u.first_name, u.last_name, u.student_id
      FROM conduct_records cr
      JOIN users u ON cr.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND cr.student_id = ?';
      params.push(student_id);
    }
    if (type) {
      query += ' AND cr.type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND cr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY cr.created_at DESC';
    const [records] = await pool.execute(query, params);

    res.json({ success: true, records });
  } catch (error) {
    console.error('Get conduct records error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/conduct-records', [
  authenticateToken,
  requireRole('director_discipline'),
  body('student_id').isInt().withMessage('Student is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { student_id, type, description, severity } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO conduct_records (student_id, type, description, severity, status) VALUES (?, ?, ?, ?, ?)',
      [student_id, type, description, severity || 'medium', 'open']
    );

    res.status(201).json({ success: true, message: 'Conduct record created', id: result.insertId });
  } catch (error) {
    console.error('Create conduct record error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ ANALYTICS ============

router.get('/analytics/overview', authenticateToken, requireRole('director_discipline'), async (req, res) => {
  try {
    const [totalStudents] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "student")'
    );

    const [totalTeachers] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "teacher")'
    );

    const [conductIssues] = await pool.execute(
      'SELECT COUNT(*) as count FROM conduct_records WHERE status = "open"'
    );

    const [classes] = await pool.execute('SELECT COUNT(*) as count FROM classes');

    res.json({
      success: true,
      analytics: {
        totalStudents: totalStudents[0].count,
        totalTeachers: totalTeachers[0].count,
        openConductIssues: conductIssues[0].count,
        totalClasses: classes[0].count
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

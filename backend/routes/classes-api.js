const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all classes
router.get('/all', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.*, co.name as course_name, co.code as course_code
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE c.is_active = true
      ORDER BY c.name
    `);
    
    res.json({ success: true, classes, total: classes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get classes by trade
router.get('/trade/:tradeCode', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.*, t.code as trade_code, t.name as trade_name,
        COUNT(cs.id) as enrolled_students
      FROM classes c
      LEFT JOIN trades t ON c.trade_id = t.id
      LEFT JOIN class_students cs ON c.id = cs.class_id AND cs.is_active = true
      WHERE t.code = ? AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.level, c.section
    `, [req.params.tradeCode.toUpperCase()]);
    
    res.json({ success: true, classes, total: classes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get classes by level
router.get('/level/:level', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.*, t.code as trade_code, t.name as trade_name,
        COUNT(cs.id) as enrolled_students
      FROM classes c
      LEFT JOIN trades t ON c.trade_id = t.id
      LEFT JOIN class_students cs ON c.id = cs.class_id AND cs.is_active = true
      WHERE c.level = ? AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.section
    `, [req.params.level.toUpperCase()]);
    
    res.json({ success: true, classes, total: classes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single class with students
router.get('/:classCode', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.*, t.code as trade_code, t.name as trade_name, t.name_rw as trade_name_rw
      FROM classes c
      LEFT JOIN trades t ON c.trade_id = t.id
      WHERE c.class_code = ? AND c.is_active = true
    `, [req.params.classCode.toUpperCase()]);
    
    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const [students] = await pool.query(`
      SELECT * FROM class_students 
      WHERE class_id = ? AND is_active = true
      ORDER BY student_name
    `, [classes[0].id]);

    const [courses] = await pool.query(`
      SELECT * FROM trade_courses 
      WHERE trade_id = ? AND is_active = true
      ORDER BY code
    `, [classes[0].trade_id]);

    res.json({
      success: true,
      class: classes[0],
      students,
      courses,
      statistics: {
        totalStudents: students.length,
        capacity: classes[0].capacity,
        availableSeats: classes[0].capacity - students.length,
        totalCourses: courses.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students in a class
router.get('/:classCode/students', async (req, res) => {
  try {
    const [classes] = await pool.query(
      'SELECT id FROM classes WHERE class_code = ? AND is_active = true',
      [req.params.classCode.toUpperCase()]
    );
    
    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const [students] = await pool.query(
      'SELECT * FROM class_students WHERE class_id = ? AND is_active = true ORDER BY student_name',
      [classes[0].id]
    );

    res.json({ success: true, students, total: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add student to class
router.post('/:classCode/students', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const [classes] = await pool.query(
      'SELECT id, capacity, current_students FROM classes WHERE class_code = ? AND is_active = true',
      [req.params.classCode.toUpperCase()]
    );
    
    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classes[0].current_students >= classes[0].capacity) {
      return res.status(400).json({ success: false, message: 'Class is full' });
    }

    const { student_name, student_code } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO class_students (class_id, student_name, student_code) VALUES (?, ?, ?)',
      [classes[0].id, student_name, student_code]
    );

    await pool.query(
      'UPDATE classes SET current_students = current_students + 1 WHERE id = ?',
      [classes[0].id]
    );

    res.json({ success: true, message: 'Student added to class', studentId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update class
router.put('/:classCode', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { class_name, class_name_rw, capacity, class_teacher, room_number } = req.body;
    
    await pool.query(
      'UPDATE classes SET class_name=?, class_name_rw=?, capacity=?, class_teacher=?, room_number=? WHERE class_code=?',
      [class_name, class_name_rw, capacity, class_teacher, room_number, req.params.classCode.toUpperCase()]
    );

    res.json({ success: true, message: 'Class updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get class statistics
router.get('/statistics/summary', async (req, res) => {
  try {
    const [totalClasses] = await pool.query('SELECT COUNT(*) as count FROM classes WHERE is_active = true');
    const [totalStudents] = await pool.query('SELECT COUNT(*) as count FROM class_students WHERE is_active = true');
    const [totalCapacity] = await pool.query('SELECT SUM(capacity) as total FROM classes WHERE is_active = true');
    const [byLevel] = await pool.query(`
      SELECT level, COUNT(*) as class_count, SUM(current_students) as student_count
      FROM classes WHERE is_active = true
      GROUP BY level
    `);

    res.json({
      success: true,
      statistics: {
        totalClasses: totalClasses[0].count,
        totalStudents: totalStudents[0].count,
        totalCapacity: totalCapacity[0].total,
        availableSeats: totalCapacity[0].total - totalStudents[0].count,
        byLevel
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

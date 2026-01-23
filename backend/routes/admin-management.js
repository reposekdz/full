const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ==================== STUDENT MANAGEMENT ====================

// Get all students with filters
router.get('/students', authenticateToken, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const { search, trade_code, level, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.*, r.name as role_name, tl.trade_name, tl.trade_code, tl.level_number,
        tc.class_name, ay.name as academic_year,
        (SELECT AVG(obtained_marks/max_marks * 100) FROM grades WHERE student_id = u.id) as avg_grade,
        (SELECT COUNT(*) FROM attendance WHERE student_id = u.id AND status = 'present') as present_count,
        (SELECT COUNT(*) FROM attendance WHERE student_id = u.id) as total_attendance
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      WHERE r.name = 'student'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (trade_code) {
      query += ` AND tl.trade_code = ?`;
      params.push(trade_code);
    }
    
    if (level) {
      query += ` AND tl.level_number = ?`;
      params.push(level);
    }
    
    if (status) {
      query += ` AND u.is_active = ?`;
      params.push(status === 'active' ? 1 : 0);
    }
    
    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [students] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE r.name = 'student'`;
    const [countResult] = await pool.execute(countQuery);
    
    res.json({
      success: true,
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create student
router.post('/students', authenticateToken, requireRole('admin', 'dos'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { first_name, last_name, email, phone, password, trade_code, level_number, level_suffix } = req.body;
    
    // Generate student ID
    const year = new Date().getFullYear();
    const [lastStudent] = await connection.execute(
      'SELECT student_id FROM users WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
      [`${year}${trade_code}${level_number}${level_suffix || ''}%`]
    );
    
    let studentNumber = 1;
    if (lastStudent.length > 0) {
      const lastNumber = parseInt(lastStudent[0].student_id.slice(-3));
      studentNumber = lastNumber + 1;
    }
    
    const student_id = `${year}${trade_code}${level_number}${level_suffix || ''}${studentNumber.toString().padStart(3, '0')}`;
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [studentRole] = await connection.execute('SELECT id FROM roles WHERE name = "student"');
    
    const [result] = await connection.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, student_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [student_id, email, hashedPassword, first_name, last_name, phone, studentRole[0].id, student_id]);
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: { id: result.insertId, student_id, email, first_name, last_name }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Update student
router.put('/students/:id', authenticateToken, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address, is_active } = req.body;
    
    await pool.execute(`
      UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, is_active = ?
      WHERE id = ?
    `, [first_name, last_name, email, phone, address, is_active, id]);
    
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete student
router.delete('/students/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE users SET is_active = false WHERE id = ?', [id]);
    res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== TEACHER MANAGEMENT ====================

// Get all teachers
router.get('/teachers', authenticateToken, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT u.*, r.name as role_name,
        (SELECT COUNT(*) FROM classes WHERE teacher_id = u.id) as class_count,
        (SELECT COUNT(DISTINCT student_id) FROM enrollments e 
         JOIN classes c ON e.class_id = c.id 
         WHERE c.teacher_id = u.id) as student_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'teacher'
      ORDER BY u.created_at DESC
    `);
    
    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create teacher
router.post('/teachers', authenticateToken, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, specialization } = req.body;
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [teacherRole] = await pool.execute('SELECT id FROM roles WHERE name = "teacher"');
    const username = email.split('@')[0];
    
    const [result] = await pool.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, true)
    `, [username, email, hashedPassword, first_name, last_name, phone, teacherRole[0].id]);
    
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher: { id: result.insertId, email, first_name, last_name }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== CLASS MANAGEMENT ====================

// Get all classes
router.get('/classes', authenticateToken, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT tc.*, tl.trade_name, tl.trade_code, tl.level_number, tl.level_suffix,
        ay.name as academic_year,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        (SELECT COUNT(*) FROM enrollments WHERE class_id = tc.id AND status = 'active') as enrollment_count
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      JOIN academic_years ay ON tc.academic_year_id = ay.id
      LEFT JOIN users t ON tc.teacher_id = t.id
      ORDER BY tc.created_at DESC
    `);
    
    res.json({ success: true, classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create class
router.post('/classes', authenticateToken, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const { trade_level_id, academic_year_id, class_name, capacity, teacher_id } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO trade_classes (trade_level_id, academic_year_id, class_name, capacity, teacher_id, is_active)
      VALUES (?, ?, ?, ?, ?, true)
    `, [trade_level_id, academic_year_id, class_name, capacity, teacher_id]);
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== GRADE MANAGEMENT ====================

// Get all grades
router.get('/grades', authenticateToken, requireRole('admin', 'dos', 'teacher'), async (req, res) => {
  try {
    const { student_id, class_id, subject_id } = req.query;
    
    let query = `
      SELECT g.*, 
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        sub.name as subject_name,
        c.name as class_name,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      JOIN users s ON g.student_id = s.id
      JOIN subjects sub ON g.subject_id = sub.id
      JOIN classes c ON g.class_id = c.id
      JOIN users t ON g.teacher_id = t.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (student_id) {
      query += ` AND g.student_id = ?`;
      params.push(student_id);
    }
    
    if (class_id) {
      query += ` AND g.class_id = ?`;
      params.push(class_id);
    }
    
    if (subject_id) {
      query += ` AND g.subject_id = ?`;
      params.push(subject_id);
    }
    
    query += ` ORDER BY g.assessment_date DESC`;
    
    const [grades] = await pool.execute(query, params);
    
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create grade
router.post('/grades', authenticateToken, requireRole('admin', 'dos', 'teacher'), async (req, res) => {
  try {
    const { student_id, subject_id, class_id, assessment_type, assessment_name, obtained_marks, max_marks, assessment_date, remarks } = req.body;
    const teacher_id = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO grades (student_id, subject_id, class_id, teacher_id, assessment_type, assessment_name, obtained_marks, max_marks, assessment_date, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, subject_id, class_id, teacher_id, assessment_type, assessment_name, obtained_marks, max_marks, assessment_date, remarks]);
    
    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      grade: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== ATTENDANCE MANAGEMENT ====================

// Get attendance records
router.get('/attendance', authenticateToken, requireRole('admin', 'dos', 'teacher'), async (req, res) => {
  try {
    const { student_id, class_id, date_from, date_to } = req.query;
    
    let query = `
      SELECT a.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        sub.name as subject_name,
        c.name as class_name
      FROM attendance a
      JOIN users s ON a.student_id = s.id
      JOIN subjects sub ON a.subject_id = sub.id
      JOIN classes c ON a.class_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (student_id) {
      query += ` AND a.student_id = ?`;
      params.push(student_id);
    }
    
    if (class_id) {
      query += ` AND a.class_id = ?`;
      params.push(class_id);
    }
    
    if (date_from) {
      query += ` AND a.attendance_date >= ?`;
      params.push(date_from);
    }
    
    if (date_to) {
      query += ` AND a.attendance_date <= ?`;
      params.push(date_to);
    }
    
    query += ` ORDER BY a.attendance_date DESC`;
    
    const [attendance] = await pool.execute(query, params);
    
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark attendance
router.post('/attendance', authenticateToken, requireRole('admin', 'dos', 'teacher'), async (req, res) => {
  try {
    const { student_id, subject_id, class_id, attendance_date, status, remarks } = req.body;
    const marked_by = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO attendance (student_id, subject_id, class_id, attendance_date, status, marked_by, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = ?, remarks = ?
    `, [student_id, subject_id, class_id, attendance_date, status, marked_by, remarks, status, remarks]);
    
    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DASHBOARD STATISTICS ====================

// Get admin dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const [studentCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'student' AND u.is_active = true
    `);
    
    const [teacherCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'teacher' AND u.is_active = true
    `);
    
    const [classCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM trade_classes WHERE is_active = true
    `);
    
    const [avgAttendance] = await pool.execute(`
      SELECT 
        (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as percentage
      FROM attendance
      WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [recentEnrollments] = await pool.execute(`
      SELECT COUNT(*) as count FROM enrollments
      WHERE enrollment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [tradeStats] = await pool.execute(`
      SELECT tl.trade_code, tl.trade_name, COUNT(e.id) as student_count
      FROM trade_levels tl
      LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id
      LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
      GROUP BY tl.id
      ORDER BY student_count DESC
    `);
    
    res.json({
      success: true,
      stats: {
        total_students: studentCount[0].count,
        total_teachers: teacherCount[0].count,
        total_classes: classCount[0].count,
        avg_attendance: avgAttendance[0].percentage || 0,
        recent_enrollments: recentEnrollments[0].count,
        trade_distribution: tradeStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

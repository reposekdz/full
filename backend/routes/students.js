const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const smsService = require('../services/smsService');

const router = express.Router();

// ================== ADMIN/TEACHER ENDPOINTS ==================

// Get all students (Admin/Teacher)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const { search, trade, level, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Use global_student_sheets for student data
    let query = `
      SELECT 
        gss.id,
        gss.first_name,
        gss.last_name,
        gss.student_id,
        gss.trade_code,
        gss.level_number,
        gss.gender,
        gss.email,
        gss.phone,
        gss.status,
        gss.created_at
      FROM global_student_sheets gss
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_id LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (trade) {
      query += ` AND gss.trade_code = ?`;
      params.push(trade);
    }

    if (level) {
      query += ` AND gss.level_number = ?`;
      params.push(level);
    }

    if (status === 'active') {
      query += ` AND gss.status = 'active'`;
    } else if (status === 'inactive') {
      query += ` AND gss.status = 'inactive'`;
    }

    query += ` ORDER BY gss.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM global_student_sheets gss WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ` AND (gss.first_name LIKE ? OR gss.last_name LIKE ? OR gss.student_id LIKE ?)`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam);
    }
    if (trade) {
      countQuery += ` AND gss.trade_code = ?`;
      countParams.push(trade);
    }
    if (level) {
      countQuery += ` AND gss.level_number = ?`;
      countParams.push(level);
    }
    if (status === 'active') {
      countQuery += ` AND gss.status = 'active'`;
    } else if (status === 'inactive') {
      countQuery += ` AND gss.status = 'inactive'`;
    }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Get student by ID (Admin/Teacher)
router.get('/details/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.execute(`
      SELECT u.*, sp.*,
        u.id as user_id, sp.id as profile_id
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ? AND u.role = 'student'
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [enrollments] = await pool.execute(`
      SELECT e.*, tc.name as class_name, tc.level
      FROM enrollments e
      JOIN trade_classes tc ON e.class_id = tc.id
      WHERE e.student_id = ?
    `, [id]);

    const [medicalRecords] = await pool.execute(`
      SELECT * FROM student_medical_records WHERE student_id = ? ORDER BY created_at DESC
    `, [id]);

    res.json({
      success: true,
      student: students[0],
      enrollments,
      medical_records: medicalRecords
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student details' });
  }
});

// Get comprehensive student profile (Admin/Teacher) - Advanced Profile Dialog
router.get('/:id/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.execute(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
        sp.admission_number, sp.date_of_birth, sp.gender, sp.blood_group, sp.address,
        sp.guardian_name, sp.guardian_phone, sp.guardian_email
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ? AND u.role = 'student'
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [enrollments] = await pool.execute(`
      SELECT e.*, tc.name as class_name, tc.level_number as level, tc.level_suffix,
        t.name as trade_name, t.code as trade_code
      FROM enrollments e
      JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trades t ON tc.trade_code = t.code
      WHERE e.student_id = ?
      ORDER BY e.enrollment_date DESC
    `, [id]);

    const [grades] = await pool.execute(`
      SELECT g.id, g.obtained_marks, g.max_marks, g.assessment_date, g.remarks,
        s.name as subject_name, s.code as subject_code,
        c.name as class_name
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN classes c ON g.class_id = c.id
      WHERE g.student_id = ?
      ORDER BY g.assessment_date DESC
      LIMIT 20
    `, [id]);

    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM attendance
      WHERE student_id = ?
    `, [id]);

    const [avgGrade] = await pool.execute(`
      SELECT AVG(obtained_marks/max_marks * 100) as average
      FROM grades
      WHERE student_id = ?
    `, [id]);

    const [medicalRecords] = await pool.execute(`
      SELECT * FROM student_medical_records 
      WHERE student_id = ? 
      ORDER BY created_at DESC
      LIMIT 5
    `, [id]);

    res.json({
      success: true,
      data: {
        student: students[0],
        enrollments: enrollments || [],
        grades: grades || [],
        attendance: attendance[0] || { total: 0, present: 0, absent: 0, late: 0, excused: 0 },
        average_grade: avgGrade[0]?.average || 0,
        medical_records: medicalRecords || []
      }
    });
  } catch (error) {
    console.error('Get comprehensive student profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student profile' });
  }
});

// Create new student (Admin)
router.post('/create', authenticateToken, requireRole('admin', 'super_admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, password,
      admission_number, date_of_birth, gender, blood_group, address,
      guardian_name, guardian_phone, guardian_email,
      trade_code, level_number, level_suffix
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ success: false, message: 'First name, last name, and email are required' });
    }

    const hashedPassword = await bcrypt.hash(password || 'student123', 10);
    const username = admission_number || `STD${Date.now()}`;

    // Get the student role_id from roles table
    const [studentRole] = await pool.execute('SELECT id FROM roles WHERE name = "student"');
    if (studentRole.length === 0) {
      return res.status(500).json({ success: false, message: 'Student role not found in system' });
    }
    const studentRoleId = studentRole[0].id;

    const [userResult] = await pool.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, phone, role, role_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 'student', ?, 1)
    `, [username, email, hashedPassword, first_name, last_name, phone, studentRoleId]);

    const studentId = userResult.insertId;

    await pool.execute(`
      INSERT INTO student_profiles (
        user_id, admission_number, date_of_birth, gender, blood_group, address,
        guardian_name, guardian_phone, guardian_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, username, date_of_birth, gender, blood_group, address, guardian_name, guardian_phone, guardian_email]);

    // Auto-enroll student in trade class if provided
    if (trade_code && level_number) {
      const [tradeClass] = await pool.execute(`
        SELECT id FROM trade_classes 
        WHERE trade_code = ? AND level_number = ? AND level_suffix = ?
        LIMIT 1
      `, [trade_code, level_number, level_suffix || '']);

      if (tradeClass.length > 0) {
        await pool.execute(`
          INSERT INTO enrollments (student_id, class_id, enrollment_date, status)
          VALUES (?, ?, NOW(), 'active')
        `, [studentId, tradeClass[0].id]);
      }
    }

    res.json({
      success: true,
      message: 'Student created successfully',
      student: { id: studentId, username, email, first_name, last_name }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Email or admission number already exists' : 'Failed to create student'
    });
  }
});

// Update student (Admin)
router.put('/update/:id', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, email, phone, is_active,
      admission_number, date_of_birth, gender, blood_group, address,
      guardian_name, guardian_phone, guardian_email
    } = req.body;

    await pool.execute(`
      UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        is_active = COALESCE(?, is_active)
      WHERE id = ? AND role = 'student'
    `, [first_name, last_name, email, phone, is_active, id]);

    await pool.execute(`
      UPDATE student_profiles SET
        admission_number = COALESCE(?, admission_number),
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        blood_group = COALESCE(?, blood_group),
        address = COALESCE(?, address),
        guardian_name = COALESCE(?, guardian_name),
        guardian_phone = COALESCE(?, guardian_phone),
        guardian_email = COALESCE(?, guardian_email)
      WHERE user_id = ?
    `, [admission_number, date_of_birth, gender, blood_group, address, guardian_name, guardian_phone, guardian_email, id]);

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
});

// Delete student (Admin)
router.delete('/delete/:id', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM users WHERE id = ? AND role = "student"', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
});

// Add medical record (Admin/Teacher)
router.post('/medical/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { record_type, description, medical_officer, treatment, notes } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO student_medical_records (student_id, record_type, description, medical_officer, treatment, notes, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, record_type, description, medical_officer, treatment, notes, req.user.id]);

    res.json({
      success: true,
      message: 'Medical record added successfully',
      record_id: result.insertId
    });
  } catch (error) {
    console.error('Add medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to add medical record' });
  }
});

// Get student statistics (Admin)
router.get('/statistics', authenticateToken, requireRole('admin', 'super_admin', 'headmaster'), async (req, res) => {
  try {
    const [[{ total_students }]] = await pool.execute('SELECT COUNT(*) as total_students FROM users WHERE role = "student"');
    const [[{ active_students }]] = await pool.execute('SELECT COUNT(*) as active_students FROM users WHERE role = "student" AND is_active = 1');
    const [[{ inactive_students }]] = await pool.execute('SELECT COUNT(*) as inactive_students FROM users WHERE role = "student" AND is_active = 0');

    const [byGender] = await pool.execute(`
      SELECT sp.gender, COUNT(*) as count
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      GROUP BY sp.gender
    `);

    const [byClass] = await pool.execute(`
      SELECT tc.name as class_name, COUNT(DISTINCT e.student_id) as student_count
      FROM enrollments e
      JOIN trade_classes tc ON e.class_id = tc.id
      WHERE e.status = 'active'
      GROUP BY tc.id
      ORDER BY student_count DESC
    `);

    res.json({
      success: true,
      statistics: {
        total_students,
        active_students,
        inactive_students,
        by_gender: byGender,
        by_class: byClass
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ================== STUDENT-SPECIFIC ENDPOINTS ==================

// Get student dashboard data
router.get('/dashboard', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const [enrollments] = await pool.execute(`
      SELECT e.*, c.name as class_name, co.name as course_name, co.code as course_code,
        ay.name as academic_year_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN academic_years ay ON e.academic_year_id = ay.id
      LEFT JOIN users t ON c.teacher_id = t.id
      WHERE e.student_id = ? AND e.status = 'active'
    `, [req.user.id]);

    const [grades] = await pool.execute(`
      SELECT g.*, s.name as subject_name, s.code as subject_code,
        c.name as class_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN classes c ON g.class_id = c.id
      JOIN users t ON g.teacher_id = t.id
      WHERE g.student_id = ?
      ORDER BY g.assessment_date DESC
      LIMIT 10
    `, [req.user.id]);

    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM attendance
      WHERE student_id = ?
    `, [req.user.id]);

    const [avgGrade] = await pool.execute(`
      SELECT AVG(obtained_marks/max_marks * 100) as average
      FROM grades
      WHERE student_id = ?
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        enrollments,
        recent_grades: grades,
        attendance: attendance[0],
        average_grade: avgGrade[0].average || 0
      }
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student grades
router.get('/grades', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { subject_id, class_id } = req.query;
    let query = `
      SELECT g.*, s.name as subject_name, s.code as subject_code,
        c.name as class_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN classes c ON g.class_id = c.id
      JOIN users t ON g.teacher_id = t.id
      WHERE g.student_id = ?
    `;
    const params = [req.user.id];

    if (subject_id) {
      query += ' AND g.subject_id = ?';
      params.push(subject_id);
    }
    if (class_id) {
      query += ' AND g.class_id = ?';
      params.push(class_id);
    }

    query += ' ORDER BY g.assessment_date DESC';

    const [grades] = await pool.execute(query, params);
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student attendance
router.get('/attendance', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
      SELECT a.*, s.name as subject_name, c.name as class_name,
        CONCAT(t.first_name, ' ', t.last_name) as marked_by_name
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes c ON a.class_id = c.id
      JOIN users t ON a.marked_by = t.id
      WHERE a.student_id = ?
    `;
    const params = [req.user.id];

    if (start_date) {
      query += ' AND a.attendance_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND a.attendance_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY a.attendance_date DESC';

    const [attendance] = await pool.execute(query, params);
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student timetable
router.get('/timetable', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const [timetable] = await pool.execute(`
      SELECT t.*, s.name as subject_name, s.code as subject_code,
        c.name as class_name, CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        t.room_number
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes c ON t.class_id = c.id
      LEFT JOIN users u ON t.teacher_id = u.id
      WHERE t.class_id IN (
        SELECT class_id FROM enrollments WHERE student_id = ? AND status = 'active'
      )
      ORDER BY 
        FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        t.start_time
    `, [req.user.id]);

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Get student timetable error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student performance summary
router.get('/performance', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const [subjectPerformance] = await pool.execute(`
      SELECT s.name as subject_name, s.code as subject_code,
        COUNT(g.id) as total_assessments,
        AVG(g.obtained_marks/g.max_marks * 100) as average_percentage,
        MAX(g.obtained_marks/g.max_marks * 100) as highest_percentage,
        MIN(g.obtained_marks/g.max_marks * 100) as lowest_percentage
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ?
      GROUP BY s.id
      ORDER BY average_percentage DESC
    `, [req.user.id]);

    const [monthlyPerformance] = await pool.execute(`
      SELECT 
        DATE_FORMAT(assessment_date, '%Y-%m') as month,
        AVG(obtained_marks/max_marks * 100) as average_percentage,
        COUNT(*) as assessment_count
      FROM grades
      WHERE student_id = ?
      GROUP BY DATE_FORMAT(assessment_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [req.user.id]);

    res.json({
      success: true,
      performance: {
        by_subject: subjectPerformance,
        by_month: monthlyPerformance
      }
    });
  } catch (error) {
    console.error('Get student performance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

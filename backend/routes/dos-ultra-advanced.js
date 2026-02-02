const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ====================================
 * ULTRA-ADVANCED DOS/HEADMASTER PORTAL
 * ====================================
 * Powerful, modern, and feature-rich management system
 * - Teacher assignment to levels and trades
 * - Student management (add/remove)
 * - Report generation with auto-grading and ranking
 * - Course management for trades/levels
 * - Advanced timetable generation
 * - Modern student searching with filters
 */

// =====================================
// DASHBOARD - Comprehensive Overview
// =====================================
router.get('/dashboard/overview', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [studentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN status = 'graduated' THEN 1 END) as graduated_students,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_students,
        AVG(CASE WHEN gpa > 0 THEN gpa END) as avg_gpa,
        AVG(CASE WHEN attendance_percentage > 0 THEN attendance_percentage END) as avg_attendance
      FROM global_student_sheets
    `);
    
    const [teacherStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as total_teachers,
        COUNT(DISTINCT CASE WHEN ta.id IS NOT NULL THEN u.id END) as assigned_teachers,
        COUNT(DISTINCT ta.id) as total_assignments,
        AVG(ta.weekly_periods) as avg_weekly_periods
      FROM users u
      LEFT JOIN teacher_subject_assignments ta ON u.id = ta.teacher_id AND ta.is_active = 1
      WHERE u.role = 'teacher' AND u.is_active = 1
    `);
    
    const [tradeStats] = await pool.execute(`
      SELECT 
        trade_code,
        trade_name,
        COUNT(*) as student_count,
        AVG(CASE WHEN gpa > 0 THEN gpa END) as avg_gpa,
        AVG(CASE WHEN attendance_percentage > 0 THEN attendance_percentage END) as avg_attendance
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code, trade_name
      ORDER BY student_count DESC
    `);
    
    const [levelStats] = await pool.execute(`
      SELECT 
        level_number,
        level_suffix,
        COUNT(*) as student_count,
        AVG(CASE WHEN gpa > 0 THEN gpa END) as avg_gpa
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY level_number, level_suffix
      ORDER BY level_number, level_suffix
    `);
    
    const [recentActivities] = await pool.execute(`
      SELECT 
        'student_enrolled' as activity_type,
        created_at as activity_time,
        CONCAT(first_name, ' ', last_name, ' enrolled in ', trade_name) as description
      FROM global_student_sheets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 
        'teacher_assigned' as activity_type,
        created_at as activity_time,
        CONCAT('Teacher assigned to ', subject_name) as description
      FROM teacher_subject_assignments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY activity_time DESC
      LIMIT 20
    `);
    
    const [financialSummary] = await pool.execute(`
      SELECT 
        SUM(total_fees) as expected_revenue,
        SUM(paid_amount) as collected_revenue,
        SUM(balance) as outstanding_balance,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as fully_paid_count,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_paid_count,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_count
      FROM global_student_sheets
      WHERE status = 'active'
    `);
    
    res.json({
      success: true,
      dashboard: {
        students: studentStats[0],
        teachers: teacherStats[0],
        trades: tradeStats,
        levels: levelStats,
        recent_activities: recentActivities,
        financial: financialSummary[0]
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// TEACHER MANAGEMENT
// =====================================

// Get all teachers with assignments
router.get('/teachers', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { search, status, assigned } = req.query;
    
    let query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at,
        COUNT(DISTINCT ta.id) as assignment_count,
        COUNT(DISTINCT cta.id) as class_teacher_count,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as subjects_taught
      FROM users u
      LEFT JOIN teacher_subject_assignments ta ON u.id = ta.teacher_id AND ta.is_active = 1
      LEFT JOIN class_teacher_assignments cta ON u.id = cta.teacher_id AND cta.is_active = 1
      LEFT JOIN subjects s ON ta.subject_id = s.id
      WHERE u.role = 'teacher'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      query += ` AND u.is_active = ?`;
      params.push(status === 'active' ? 1 : 0);
    }
    
    query += ` GROUP BY u.id ORDER BY u.first_name, u.last_name`;
    
    const [teachers] = await pool.execute(query, params);
    
    res.json({
      success: true,
      teachers: teachers,
      total: teachers.length
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new teacher
router.post('/teachers', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      username,
      password,
      date_of_birth,
      gender,
      address,
      qualifications
    } = req.body;
    
    if (!first_name || !last_name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      `INSERT INTO users (
        first_name, last_name, email, phone, username, password, 
        date_of_birth, gender, address, role, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'teacher', 1)`,
      [first_name, last_name, email, phone, username, hashedPassword, date_of_birth, gender, address]
    );
    
    if (qualifications) {
      await pool.execute(
        `INSERT INTO teacher_qualifications (teacher_id, qualifications, created_at)
         VALUES (?, ?, NOW())`,
        [result.insertId, qualifications]
      );
    }
    
    res.json({
      success: true,
      message: 'Teacher added successfully',
      teacher_id: result.insertId
    });
  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove/deactivate teacher
router.delete('/teachers/:id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    if (permanent === 'true') {
      await pool.execute('DELETE FROM users WHERE id = ? AND role = "teacher"', [id]);
    } else {
      await pool.execute('UPDATE users SET is_active = 0 WHERE id = ? AND role = "teacher"', [id]);
    }
    
    res.json({
      success: true,
      message: permanent === 'true' ? 'Teacher removed permanently' : 'Teacher deactivated'
    });
  } catch (error) {
    console.error('Remove teacher error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign teacher to subject, level, and trade
router.post('/teachers/assign', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      teacher_id,
      subject_id,
      trade_code,
      level_number,
      level_suffix,
      weekly_periods,
      academic_year
    } = req.body;
    
    if (!teacher_id || !subject_id || !trade_code || !level_number) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const [tradeLevel] = await pool.execute(
      `SELECT id FROM trades_levels WHERE trade_code = ? AND level_number = ? AND level_suffix = ?`,
      [trade_code, level_number, level_suffix || '']
    );
    
    if (tradeLevel.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade level not found' });
    }
    
    const [subject] = await pool.execute('SELECT name FROM subjects WHERE id = ?', [subject_id]);
    
    await pool.execute(
      `INSERT INTO teacher_subject_assignments (
        teacher_id, subject_id, subject_name, trade_code, level_number, level_suffix, 
        trade_level_id, weekly_periods, academic_year, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        teacher_id, subject_id, subject[0]?.name || '', trade_code, level_number, 
        level_suffix || '', tradeLevel[0].id, weekly_periods || 5, 
        academic_year || new Date().getFullYear()
      ]
    );
    
    res.json({
      success: true,
      message: 'Teacher assigned successfully'
    });
  } catch (error) {
    console.error('Assign teacher error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher assignments
router.get('/teachers/:id/assignments', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [assignments] = await pool.execute(
      `SELECT 
        ta.*,
        s.name as subject_name,
        tl.trade_name,
        CONCAT(tl.trade_code, ' - Level ', tl.level_number, tl.level_suffix) as full_level_name
      FROM teacher_subject_assignments ta
      LEFT JOIN subjects s ON ta.subject_id = s.id
      LEFT JOIN trades_levels tl ON ta.trade_level_id = tl.id
      WHERE ta.teacher_id = ? AND ta.is_active = 1
      ORDER BY ta.created_at DESC`,
      [id]
    );
    
    res.json({
      success: true,
      assignments: assignments
    });
  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove teacher assignment
router.delete('/teachers/assignments/:assignment_id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { assignment_id } = req.params;
    
    await pool.execute(
      'UPDATE teacher_subject_assignments SET is_active = 0 WHERE id = ?',
      [assignment_id]
    );
    
    res.json({
      success: true,
      message: 'Assignment removed successfully'
    });
  } catch (error) {
    console.error('Remove assignment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// STUDENT MANAGEMENT
// =====================================

// Advanced student search with filters
router.get('/students/search', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      search,
      trade_code,
      level_number,
      level_suffix,
      status,
      payment_status,
      gender,
      min_gpa,
      max_gpa,
      sort_by,
      order,
      page,
      limit
    } = req.query;
    
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 50;
    const offset = (currentPage - 1) * pageLimit;
    
    let query = `SELECT * FROM global_student_sheets WHERE 1=1`;
    const params = [];
    
    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (trade_code) {
      query += ` AND trade_code = ?`;
      params.push(trade_code);
    }
    
    if (level_number) {
      query += ` AND level_number = ?`;
      params.push(level_number);
    }
    
    if (level_suffix !== undefined) {
      query += ` AND level_suffix = ?`;
      params.push(level_suffix);
    }
    
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    
    if (payment_status) {
      query += ` AND payment_status = ?`;
      params.push(payment_status);
    }
    
    if (gender) {
      query += ` AND gender = ?`;
      params.push(gender);
    }
    
    if (min_gpa) {
      query += ` AND gpa >= ?`;
      params.push(parseFloat(min_gpa));
    }
    
    if (max_gpa) {
      query += ` AND gpa <= ?`;
      params.push(parseFloat(max_gpa));
    }
    
    const sortBy = sort_by || 'first_name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(pageLimit, offset);
    
    const [students] = await pool.execute(query, params);
    
    let countQuery = `SELECT COUNT(*) as total FROM global_student_sheets WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (trade_code) { countQuery += ` AND trade_code = ?`; countParams.push(trade_code); }
    if (level_number) { countQuery += ` AND level_number = ?`; countParams.push(level_number); }
    if (level_suffix !== undefined) { countQuery += ` AND level_suffix = ?`; countParams.push(level_suffix); }
    if (status) { countQuery += ` AND status = ?`; countParams.push(status); }
    if (payment_status) { countQuery += ` AND payment_status = ?`; countParams.push(payment_status); }
    if (gender) { countQuery += ` AND gender = ?`; countParams.push(gender); }
    if (min_gpa) { countQuery += ` AND gpa >= ?`; countParams.push(parseFloat(min_gpa)); }
    if (max_gpa) { countQuery += ` AND gpa <= ?`; countParams.push(parseFloat(max_gpa)); }
    
    const [[{ total }]] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      students: students,
      pagination: {
        current_page: currentPage,
        page_limit: pageLimit,
        total_students: total,
        total_pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('Student search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new student to global list
router.post('/students', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      student_code,
      first_name,
      last_name,
      email,
      phone,
      gender,
      date_of_birth,
      trade_code,
      trade_name,
      level_number,
      level_suffix,
      class_name,
      guardian_name,
      guardian_phone,
      guardian_email,
      address,
      medical_info
    } = req.body;
    
    if (!first_name || !last_name || !student_code || !trade_code || !level_number) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const [existing] = await pool.execute(
      'SELECT id FROM global_student_sheets WHERE student_code = ?',
      [student_code]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student code already exists' });
    }
    
    const username = student_code.toLowerCase();
    const password = await require('bcrypt').hash(student_code, 10);
    
    const [userResult] = await pool.execute(
      `INSERT INTO users (
        first_name, last_name, email, phone, username, password, 
        student_id, gender, date_of_birth, role, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', 1)`,
      [first_name, last_name, email, phone, username, password, student_code, gender, date_of_birth]
    );
    
    const [result] = await pool.execute(
      `INSERT INTO global_student_sheets (
        student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth,
        trade_code, trade_name, level_number, level_suffix, class_name,
        guardian_name, guardian_phone, guardian_email, address, medical_info,
        status, academic_year, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW())`,
      [
        userResult.insertId, student_code, first_name, last_name, email, phone, gender, date_of_birth,
        trade_code, trade_name, level_number, level_suffix || '', class_name,
        guardian_name, guardian_phone, guardian_email, address, medical_info,
        new Date().getFullYear()
      ]
    );
    
    res.json({
      success: true,
      message: 'Student added successfully',
      student_id: result.insertId
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove/deactivate student
router.delete('/students/:id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, permanent } = req.body;
    
    if (permanent === true) {
      const [student] = await pool.execute('SELECT student_id FROM global_student_sheets WHERE id = ?', [id]);
      if (student.length > 0) {
        await pool.execute('DELETE FROM users WHERE id = ?', [student[0].student_id]);
      }
      await pool.execute('DELETE FROM global_student_sheets WHERE id = ?', [id]);
    } else {
      await pool.execute(
        'UPDATE global_student_sheets SET status = ?, removal_reason = ?, updated_at = NOW() WHERE id = ?',
        ['inactive', reason || 'Removed by DOS', id]
      );
    }
    
    res.json({
      success: true,
      message: permanent ? 'Student removed permanently' : 'Student deactivated'
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student information
router.put('/students/:id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'gender', 'date_of_birth',
      'trade_code', 'trade_name', 'level_number', 'level_suffix', 'class_name',
      'guardian_name', 'guardian_phone', 'guardian_email', 'address', 
      'medical_info', 'status'
    ];
    
    const updateFields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    
    updateFields.push('updated_at = NOW()');
    values.push(id);
    
    await pool.execute(
      `UPDATE global_student_sheets SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({
      success: true,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// COURSE MANAGEMENT FOR TRADES/LEVELS
// =====================================

// Get all courses
router.get('/courses', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number } = req.query;
    
    let query = `
      SELECT 
        c.*,
        tl.trade_code,
        tl.trade_name,
        tl.level_number,
        tl.level_suffix
      FROM courses c
      LEFT JOIN course_trade_levels ctl ON c.id = ctl.course_id
      LEFT JOIN trades_levels tl ON ctl.trade_level_id = tl.id
      WHERE 1=1
    `;
    const params = [];
    
    if (trade_code) {
      query += ` AND tl.trade_code = ?`;
      params.push(trade_code);
    }
    
    if (level_number) {
      query += ` AND tl.level_number = ?`;
      params.push(level_number);
    }
    
    query += ` ORDER BY c.name`;
    
    const [courses] = await pool.execute(query, params);
    
    res.json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new course
router.post('/courses', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      duration_months,
      fee_amount,
      trade_codes,
      level_numbers
    } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Course code and name are required' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO courses (code, name, description, duration_months, fee_amount, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW())`,
      [code, name, description, duration_months || 36, fee_amount || 0]
    );
    
    if (trade_codes && level_numbers) {
      for (const trade_code of trade_codes) {
        for (const level_number of level_numbers) {
          const [tradeLevel] = await pool.execute(
            'SELECT id FROM trades_levels WHERE trade_code = ? AND level_number = ?',
            [trade_code, level_number]
          );
          
          if (tradeLevel.length > 0) {
            await pool.execute(
              'INSERT INTO course_trade_levels (course_id, trade_level_id) VALUES (?, ?)',
              [result.insertId, tradeLevel[0].id]
            );
          }
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Course added successfully',
      course_id: result.insertId
    });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update course
router.put('/courses/:id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, duration_months, fee_amount, is_active } = req.body;
    
    await pool.execute(
      `UPDATE courses 
       SET code = ?, name = ?, description = ?, duration_months = ?, fee_amount = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [code, name, description, duration_months, fee_amount, is_active, id]
    );
    
    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete course
router.delete('/courses/:id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM course_trade_levels WHERE course_id = ?', [id]);
    await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// SUBJECTS MANAGEMENT
// =====================================

// Get all subjects
router.get('/subjects', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [subjects] = await pool.execute(`
      SELECT s.*, COUNT(DISTINCT ta.teacher_id) as assigned_teachers
      FROM subjects s
      LEFT JOIN teacher_subject_assignments ta ON s.id = ta.subject_id AND ta.is_active = 1
      GROUP BY s.id
      ORDER BY s.name
    `);
    
    res.json({
      success: true,
      subjects: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new subject
router.post('/subjects', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { name, code, description, category } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Subject name and code are required' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO subjects (name, code, description, category, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, code, description, category]
    );
    
    res.json({
      success: true,
      message: 'Subject added successfully',
      subject_id: result.insertId
    });
  } catch (error) {
    console.error('Add subject error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update subject
router.put('/subjects/:id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, category } = req.body;
    
    await pool.execute(
      'UPDATE subjects SET name = ?, code = ?, description = ?, category = ? WHERE id = ?',
      [name, code, description, category, id]
    );
    
    res.json({
      success: true,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete subject
router.delete('/subjects/:id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM subjects WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// TRADES AND LEVELS MANAGEMENT
// =====================================

// Get all trades and levels
router.get('/trades-levels', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [tradesLevels] = await pool.execute(`
      SELECT 
        tl.*,
        COUNT(DISTINCT gss.id) as student_count,
        AVG(gss.gpa) as avg_gpa
      FROM trades_levels tl
      LEFT JOIN global_student_sheets gss ON 
        tl.trade_code = gss.trade_code AND 
        tl.level_number = gss.level_number AND 
        tl.level_suffix = gss.level_suffix AND
        gss.status = 'active'
      WHERE tl.is_active = 1
      GROUP BY tl.id
      ORDER BY tl.trade_code, tl.level_number, tl.level_suffix
    `);
    
    res.json({
      success: true,
      trades_levels: tradesLevels
    });
  } catch (error) {
    console.error('Get trades-levels error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new trade level
router.post('/trades-levels', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, trade_name, level_number, level_suffix, description, capacity, duration_years } = req.body;
    
    if (!trade_code || !level_number) {
      return res.status(400).json({ success: false, message: 'Trade code and level number are required' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO trades_levels (
        trade_code, trade_name, level_number, level_suffix, description, 
        capacity, duration_years, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [trade_code, trade_name, level_number, level_suffix || '', description, capacity || 30, duration_years || 1]
    );
    
    res.json({
      success: true,
      message: 'Trade level added successfully',
      trade_level_id: result.insertId
    });
  } catch (error) {
    console.error('Add trade level error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// REPORT GENERATION & AUTO-GRADING
// =====================================

// Generate comprehensive student report with auto-grading and ranking
router.post('/reports/generate', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, level_suffix, term, academic_year, report_type } = req.body;
    
    if (!trade_code || !level_number) {
      return res.status(400).json({ success: false, message: 'Trade code and level number are required' });
    }
    
    const [students] = await pool.execute(
      `SELECT * FROM global_student_sheets 
       WHERE trade_code = ? AND level_number = ? AND level_suffix = ? AND status = 'active'`,
      [trade_code, level_number, level_suffix || '']
    );
    
    const reports = [];
    
    for (const student of students) {
      const [marks] = await pool.execute(
        `SELECT 
          subject_name,
          marks,
          max_marks,
          exam_type,
          term,
          academic_year
         FROM student_marks
         WHERE student_id = ? AND term = ? AND academic_year = ?
         ORDER BY subject_name`,
        [student.student_id, term || 1, academic_year || new Date().getFullYear()]
      );
      
      let totalMarks = 0;
      let totalMaxMarks = 0;
      const subjectGrades = [];
      
      for (const mark of marks) {
        totalMarks += mark.marks || 0;
        totalMaxMarks += mark.max_marks || 100;
        
        const percentage = ((mark.marks || 0) / (mark.max_marks || 100)) * 100;
        const grade = calculateGrade(percentage);
        
        subjectGrades.push({
          subject: mark.subject_name,
          marks: mark.marks,
          max_marks: mark.max_marks,
          percentage: percentage.toFixed(2),
          grade: grade
        });
      }
      
      const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
      const overallGrade = calculateGrade(overallPercentage);
      const gpa = calculateGPA(overallPercentage);
      
      await pool.execute(
        `UPDATE global_student_sheets 
         SET gpa = ?, overall_grade = ?, total_marks = ?, updated_at = NOW()
         WHERE id = ?`,
        [gpa, overallGrade, totalMarks, student.id]
      );
      
      reports.push({
        student_id: student.student_id,
        student_code: student.student_code,
        student_name: `${student.first_name} ${student.last_name}`,
        trade: `${student.trade_code} - Level ${student.level_number}${student.level_suffix}`,
        subjects: subjectGrades,
        total_marks: totalMarks,
        total_max_marks: totalMaxMarks,
        overall_percentage: overallPercentage.toFixed(2),
        overall_grade: overallGrade,
        gpa: gpa.toFixed(2)
      });
    }
    
    reports.sort((a, b) => b.overall_percentage - a.overall_percentage);
    
    reports.forEach((report, index) => {
      report.rank = index + 1;
      report.position = index + 1;
    });
    
    for (const report of reports) {
      await pool.execute(
        `UPDATE global_student_sheets 
         SET class_rank = ?, updated_at = NOW()
         WHERE student_id = ?`,
        [report.rank, report.student_id]
      );
    }
    
    const [reportResult] = await pool.execute(
      `INSERT INTO generated_reports (
        trade_code, level_number, level_suffix, term, academic_year, 
        report_type, report_data, generated_by, generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        trade_code, level_number, level_suffix || '', term, academic_year, 
        report_type || 'term_report', JSON.stringify(reports), req.user.id
      ]
    );
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      report_id: reportResult.insertId,
      reports: reports,
      summary: {
        total_students: reports.length,
        avg_percentage: (reports.reduce((sum, r) => sum + parseFloat(r.overall_percentage), 0) / reports.length).toFixed(2),
        avg_gpa: (reports.reduce((sum, r) => sum + parseFloat(r.gpa), 0) / reports.length).toFixed(2),
        highest_score: reports[0]?.overall_percentage || 0,
        lowest_score: reports[reports.length - 1]?.overall_percentage || 0
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get generated reports
router.get('/reports', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, term, academic_year, limit } = req.query;
    
    let query = `SELECT * FROM generated_reports WHERE 1=1`;
    const params = [];
    
    if (trade_code) {
      query += ` AND trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND level_number = ?`;
      params.push(level_number);
    }
    if (term) {
      query += ` AND term = ?`;
      params.push(term);
    }
    if (academic_year) {
      query += ` AND academic_year = ?`;
      params.push(academic_year);
    }
    
    query += ` ORDER BY generated_at DESC LIMIT ?`;
    params.push(parseInt(limit) || 50);
    
    const [reports] = await pool.execute(query, params);
    
    for (const report of reports) {
      if (report.report_data) {
        report.report_data = JSON.parse(report.report_data);
      }
    }
    
    res.json({
      success: true,
      reports: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Auto-calculate and update student rankings
router.post('/students/calculate-rankings', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { trade_code, level_number, level_suffix, academic_year } = req.body;
    
    let query = `SELECT * FROM global_student_sheets WHERE status = 'active'`;
    const params = [];
    
    if (trade_code) {
      query += ` AND trade_code = ?`;
      params.push(trade_code);
    }
    if (level_number) {
      query += ` AND level_number = ?`;
      params.push(level_number);
    }
    if (level_suffix !== undefined) {
      query += ` AND level_suffix = ?`;
      params.push(level_suffix);
    }
    if (academic_year) {
      query += ` AND academic_year = ?`;
      params.push(academic_year);
    }
    
    query += ` ORDER BY gpa DESC, total_marks DESC`;
    
    const [students] = await pool.execute(query, params);
    
    for (let i = 0; i < students.length; i++) {
      await pool.execute(
        `UPDATE global_student_sheets SET class_rank = ?, updated_at = NOW() WHERE id = ?`,
        [i + 1, students[i].id]
      );
    }
    
    res.json({
      success: true,
      message: 'Rankings calculated and updated successfully',
      total_students: students.length
    });
  } catch (error) {
    console.error('Calculate rankings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update student marks
router.post('/students/marks/bulk-update', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { marks_data } = req.body;
    
    if (!Array.isArray(marks_data)) {
      return res.status(400).json({ success: false, message: 'marks_data must be an array' });
    }
    
    let updated = 0;
    let errors = 0;
    
    for (const markEntry of marks_data) {
      try {
        const {
          student_id,
          subject_id,
          subject_name,
          marks,
          max_marks,
          exam_type,
          term,
          academic_year
        } = markEntry;
        
        await pool.execute(
          `INSERT INTO student_marks (
            student_id, subject_id, subject_name, marks, max_marks, 
            exam_type, term, academic_year, recorded_by, recorded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE 
            marks = VALUES(marks), 
            max_marks = VALUES(max_marks),
            updated_at = NOW()`,
          [
            student_id, subject_id, subject_name, marks, max_marks || 100,
            exam_type || 'exam', term || 1, academic_year || new Date().getFullYear(),
            req.user.id
          ]
        );
        
        updated++;
      } catch (err) {
        console.error('Error updating mark:', err);
        errors++;
      }
    }
    
    res.json({
      success: true,
      message: `Bulk update completed`,
      updated: updated,
      errors: errors
    });
  } catch (error) {
    console.error('Bulk update marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// ANALYTICS AND INSIGHTS
// =====================================

// Get comprehensive analytics
router.get('/analytics', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { academic_year } = req.query;
    const year = academic_year || new Date().getFullYear();
    
    const [performanceTrends] = await pool.execute(`
      SELECT 
        trade_code,
        trade_name,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(*) as student_count
      FROM global_student_sheets
      WHERE status = 'active' AND academic_year = ?
      GROUP BY trade_code, trade_name
      ORDER BY avg_gpa DESC
    `, [year]);
    
    const [levelPerformance] = await pool.execute(`
      SELECT 
        level_number,
        level_suffix,
        AVG(gpa) as avg_gpa,
        COUNT(*) as student_count,
        SUM(CASE WHEN gpa >= 3.5 THEN 1 ELSE 0 END) as excellent_count,
        SUM(CASE WHEN gpa >= 3.0 AND gpa < 3.5 THEN 1 ELSE 0 END) as good_count,
        SUM(CASE WHEN gpa >= 2.0 AND gpa < 3.0 THEN 1 ELSE 0 END) as average_count,
        SUM(CASE WHEN gpa < 2.0 THEN 1 ELSE 0 END) as poor_count
      FROM global_student_sheets
      WHERE status = 'active' AND academic_year = ?
      GROUP BY level_number, level_suffix
      ORDER BY level_number, level_suffix
    `, [year]);
    
    const [teacherWorkload] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT ta.id) as subject_assignments,
        SUM(ta.weekly_periods) as total_weekly_periods,
        COUNT(DISTINCT cta.id) as class_teacher_count
      FROM users u
      LEFT JOIN teacher_subject_assignments ta ON u.id = ta.teacher_id AND ta.is_active = 1
      LEFT JOIN class_teacher_assignments cta ON u.id = cta.teacher_id AND cta.is_active = 1
      WHERE u.role = 'teacher' AND u.is_active = 1
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY total_weekly_periods DESC
    `);
    
    const [attendanceTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(attendance_date, '%Y-%m') as month,
        AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_rate
      FROM student_attendance_records
      WHERE attendance_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(attendance_date, '%Y-%m')
      ORDER BY month
    `);
    
    const [financialMetrics] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(total_fees) as total_expected,
        SUM(paid_amount) as total_collected,
        SUM(balance) as total_outstanding,
        AVG(CASE WHEN paid_amount > 0 THEN (paid_amount / total_fees) * 100 END) as avg_payment_percentage
      FROM global_student_sheets
      WHERE status = 'active' AND academic_year = ?
    `, [year]);
    
    res.json({
      success: true,
      analytics: {
        performance_by_trade: performanceTrends,
        performance_by_level: levelPerformance,
        teacher_workload: teacherWorkload,
        attendance_trends: attendanceTrends,
        financial_metrics: financialMetrics[0]
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// HELPER FUNCTIONS
// =====================================

function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  return 'F';
}

function calculateGPA(percentage) {
  if (percentage >= 90) return 4.0;
  if (percentage >= 85) return 3.85;
  if (percentage >= 80) return 3.7;
  if (percentage >= 75) return 3.5;
  if (percentage >= 70) return 3.3;
  if (percentage >= 65) return 3.0;
  if (percentage >= 60) return 2.7;
  if (percentage >= 55) return 2.3;
  if (percentage >= 50) return 2.0;
  if (percentage >= 45) return 1.7;
  if (percentage >= 40) return 1.3;
  return 0.0;
}

module.exports = router;

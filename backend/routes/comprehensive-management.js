const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// ==========================================
// TEACHER MANAGEMENT APIS
// ==========================================

// Get all teachers with full details
router.get('/teachers', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { search, department, status, sort } = req.query;
    
    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.date_of_birth,
        u.gender, u.address, u.is_active, u.created_at,
        COUNT(DISTINCT tsa.subject_id) as subjects_taught,
        COUNT(DISTINCT tsa.trade_class_id) as classes_taught,
        SUM(tsa.weekly_periods) as total_periods,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as subject_names,
        AVG(ssp.percentage) as avg_student_performance
      FROM users u
      LEFT JOIN teacher_subject_assignments tsa ON u.id = tsa.teacher_id AND tsa.is_active = TRUE
      LEFT JOIN subjects s ON tsa.subject_id = s.id
      LEFT JOIN student_subject_performance ssp ON u.id = ssp.teacher_id
      WHERE u.role = 'teacher'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status === 'active') {
      query += ` AND u.is_active = TRUE`;
    } else if (status === 'inactive') {
      query += ` AND u.is_active = FALSE`;
    }
    
    query += ` GROUP BY u.id`;
    
    if (sort === 'name') {
      query += ` ORDER BY u.last_name, u.first_name`;
    } else if (sort === 'workload') {
      query += ` ORDER BY total_periods DESC`;
    } else {
      query += ` ORDER BY u.created_at DESC`;
    }
    
    const [teachers] = await pool.execute(query, params);
    res.json({ success: true, teachers, total: teachers.length });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single teacher details
router.get('/teachers/:id', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [teachers] = await pool.execute(`
      SELECT u.*, 
        COUNT(DISTINCT tsa.subject_id) as subjects_count,
        COUNT(DISTINCT tsa.trade_class_id) as classes_count,
        SUM(tsa.weekly_periods) as total_periods
      FROM users u
      LEFT JOIN teacher_subject_assignments tsa ON u.id = tsa.teacher_id AND tsa.is_active = TRUE
      WHERE u.id = ? AND u.role = 'teacher'
      GROUP BY u.id
    `, [id]);
    
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    const [assignments] = await pool.execute(`
      SELECT tsa.*, s.name as subject_name, s.code as subject_code,
        tc.class_name, tl.trade_name, tl.level_number
      FROM teacher_subject_assignments tsa
      JOIN subjects s ON tsa.subject_id = s.id
      JOIN trade_classes tc ON tsa.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE tsa.teacher_id = ? AND tsa.is_active = TRUE
    `, [id]);
    
    res.json({
      success: true,
      teacher: teachers[0],
      assignments: assignments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new teacher
router.post('/teachers/create', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, password,
      date_of_birth, gender, address, qualification,
      specialization, experience_years, salary
    } = req.body;
    
    // Check if email exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'Teacher@123', 10);
    
    const [result] = await pool.execute(`
      INSERT INTO users (
        first_name, last_name, email, phone, password, role,
        date_of_birth, gender, address, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, 'teacher', ?, ?, ?, TRUE, NOW())
    `, [first_name, last_name, email, phone, hashedPassword, date_of_birth, gender, address]);
    
    // Create teacher profile
    if (qualification || specialization || experience_years || salary) {
      await pool.execute(`
        INSERT INTO teacher_profiles (
          teacher_id, qualification, specialization, experience_years, salary, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [result.insertId, qualification, specialization, experience_years || 0, salary || 0]);
    }
    
    res.json({
      success: true,
      message: 'Teacher created successfully',
      teacher_id: result.insertId
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update teacher
router.put('/teachers/:id', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, email, phone,
      date_of_birth, gender, address, is_active
    } = req.body;
    
    await pool.execute(`
      UPDATE users SET
        first_name = ?, last_name = ?, email = ?, phone = ?,
        date_of_birth = ?, gender = ?, address = ?, is_active = ?
      WHERE id = ? AND role = 'teacher'
    `, [first_name, last_name, email, phone, date_of_birth, gender, address, is_active, id]);
    
    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete teacher (soft delete)
router.delete('/teachers/:id', authenticateToken, requireRole('headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(`
      UPDATE users SET is_active = FALSE WHERE id = ? AND role = 'teacher'
    `, [id]);
    
    // Deactivate all assignments
    await pool.execute(`
      UPDATE teacher_subject_assignments SET is_active = FALSE WHERE teacher_id = ?
    `, [id]);
    
    res.json({ success: true, message: 'Teacher deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign teacher to subject/class
router.post('/teachers/assign', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { teacher_id, subject_id, trade_class_id, academic_year_id, weekly_periods } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO teacher_subject_assignments (
        teacher_id, subject_id, trade_class_id, academic_year_id, weekly_periods, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE weekly_periods = ?, is_active = TRUE
    `, [teacher_id, subject_id, trade_class_id, academic_year_id || 1, weekly_periods || 4, weekly_periods || 4]);
    
    res.json({ success: true, message: 'Teacher assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove teacher assignment
router.delete('/teachers/assignments/:id', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(`
      UPDATE teacher_subject_assignments SET is_active = FALSE WHERE id = ?
    `, [id]);
    
    res.json({ success: true, message: 'Assignment removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher performance analytics
router.get('/teachers/:id/analytics', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [performance] = await pool.execute(`
      SELECT 
        s.name as subject_name,
        COUNT(DISTINCT ssp.student_id) as student_count,
        AVG(ssp.percentage) as avg_performance,
        MAX(ssp.percentage) as best_performance,
        MIN(ssp.percentage) as worst_performance
      FROM student_subject_performance ssp
      JOIN subjects s ON ssp.subject_id = s.id
      WHERE ssp.teacher_id = ?
      GROUP BY s.id
    `, [id]);
    
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_classes,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as classes_held,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as classes_missed
      FROM teacher_attendance
      WHERE teacher_id = ?
    `, [id]);
    
    res.json({
      success: true,
      performance: performance,
      attendance: attendance[0] || { total_classes: 0, classes_held: 0, classes_missed: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT MANAGEMENT APIS
// ==========================================

// Get all students with full details
router.get('/students', authenticateToken, requireRole('dos', 'headmaster', 'admin', 'dod', 'advisor'), async (req, res) => {
  try {
    const { search, class_id, status, sort, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.student_id, u.email, u.phone,
        u.date_of_birth, u.gender, u.address, u.is_active,
        e.status as enrollment_status,
        tc.class_name, tl.trade_name, tl.level_number,
        gss.average_marks, gss.grade, gss.class_rank,
        sf.total_amount as fees_total, sf.paid_amount as fees_paid, sf.balance as fees_balance,
        COUNT(DISTINCT sdr.id) as discipline_count
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN global_student_sheets gss ON u.id = gss.student_id
      LEFT JOIN student_fees sf ON u.id = sf.student_id
      LEFT JOIN student_discipline_records sdr ON u.id = sdr.student_id
      WHERE u.role = 'student'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (class_id) {
      query += ` AND e.class_id = ?`;
      params.push(class_id);
    }
    
    if (status === 'active') {
      query += ` AND u.is_active = TRUE`;
    } else if (status === 'inactive') {
      query += ` AND u.is_active = FALSE`;
    }
    
    query += ` GROUP BY u.id`;
    
    if (sort === 'name') {
      query += ` ORDER BY u.last_name, u.first_name`;
    } else if (sort === 'performance') {
      query += ` ORDER BY gss.average_marks DESC`;
    } else if (sort === 'fees') {
      query += ` ORDER BY sf.balance DESC`;
    } else {
      query += ` ORDER BY u.created_at DESC`;
    }
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [students] = await pool.execute(query, params);
    
    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT u.id) as total FROM users u WHERE u.role = 'student'
    `);
    
    res.json({
      success: true,
      students,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single student details
router.get('/students/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [students] = await pool.execute(`
      SELECT u.*,
        e.status as enrollment_status, e.enrollment_date,
        tc.class_name, tl.trade_name, tl.level_number,
        gss.average_marks, gss.grade, gss.gpa, gss.class_rank, gss.attendance_rate,
        sf.total_amount, sf.paid_amount, sf.balance, sf.payment_status
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN global_student_sheets gss ON u.id = gss.student_id
      LEFT JOIN student_fees sf ON u.id = sf.student_id
      WHERE u.id = ? AND u.role = 'student'
    `, [id]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get subject performance
    const [subjects] = await pool.execute(`
      SELECT ssp.*, s.name as subject_name, s.code as subject_code
      FROM student_subject_performance ssp
      JOIN subjects s ON ssp.subject_id = s.id
      WHERE ssp.student_id = ?
      ORDER BY s.name
    `, [id]);
    
    // Get discipline records
    const [discipline] = await pool.execute(`
      SELECT * FROM student_discipline_records
      WHERE student_id = ?
      ORDER BY incident_date DESC
      LIMIT 10
    `, [id]);
    
    // Get attendance
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM student_attendance_records
      WHERE student_id = ?
    `, [id]);
    
    res.json({
      success: true,
      student: students[0],
      subjects: subjects,
      discipline: discipline,
      attendance: attendance[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new student
router.post('/students/create', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, password, student_id,
      date_of_birth, gender, address, guardian_name, guardian_phone,
      class_id, enrollment_date, fees_amount
    } = req.body;
    
    // Check if email or student_id exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR student_id = ?',
      [email, student_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email or Student ID already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password || 'Student@123', 10);
    
    const [result] = await pool.execute(`
      INSERT INTO users (
        first_name, last_name, email, phone, password, student_id, role,
        date_of_birth, gender, address, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'student', ?, ?, ?, TRUE, NOW())
    `, [first_name, last_name, email, phone, hashedPassword, student_id, date_of_birth, gender, address]);
    
    const newStudentId = result.insertId;
    
    // Create enrollment
    if (class_id) {
      await pool.execute(`
        INSERT INTO enrollments (student_id, class_id, enrollment_date, status, created_at)
        VALUES (?, ?, ?, 'active', NOW())
      `, [newStudentId, class_id, enrollment_date || new Date()]);
    }
    
    // Create fee record
    if (fees_amount) {
      await pool.execute(`
        INSERT INTO student_fees (
          student_id, academic_year, total_amount, paid_amount, balance, payment_status, created_at
        ) VALUES (?, (SELECT name FROM academic_years WHERE is_current = TRUE LIMIT 1), ?, 0, ?, 'unpaid', NOW())
      `, [newStudentId, fees_amount, fees_amount]);
    }
    
    res.json({
      success: true,
      message: 'Student created successfully',
      student_id: newStudentId
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student
router.put('/students/:id', authenticateToken, requireRole('admin', 'headmaster', 'dos'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, email, phone, student_id,
      date_of_birth, gender, address, is_active
    } = req.body;
    
    await pool.execute(`
      UPDATE users SET
        first_name = ?, last_name = ?, email = ?, phone = ?, student_id = ?,
        date_of_birth = ?, gender = ?, address = ?, is_active = ?
      WHERE id = ? AND role = 'student'
    `, [first_name, last_name, email, phone, student_id, date_of_birth, gender, address, is_active, id]);
    
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Transfer student to different class
router.post('/students/:id/transfer', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { new_class_id, transfer_date, reason } = req.body;
    
    // Deactivate current enrollment
    await pool.execute(`
      UPDATE enrollments SET status = 'completed' WHERE student_id = ? AND status = 'active'
    `, [id]);
    
    // Create new enrollment
    await pool.execute(`
      INSERT INTO enrollments (student_id, class_id, enrollment_date, status, created_at)
      VALUES (?, ?, ?, 'active', NOW())
    `, [id, new_class_id, transfer_date || new Date()]);
    
    // Log transfer
    await pool.execute(`
      INSERT INTO student_transfers (student_id, new_class_id, transfer_date, reason, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [id, new_class_id, transfer_date || new Date(), reason || 'Class transfer']);
    
    res.json({ success: true, message: 'Student transferred successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk operations
router.post('/students/bulk-action', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { action, student_ids, data } = req.body;
    
    if (action === 'activate') {
      await pool.execute(`
        UPDATE users SET is_active = TRUE WHERE id IN (?) AND role = 'student'
      `, [student_ids]);
    } else if (action === 'deactivate') {
      await pool.execute(`
        UPDATE users SET is_active = FALSE WHERE id IN (?) AND role = 'student'
      `, [student_ids]);
    } else if (action === 'transfer') {
      for (const student_id of student_ids) {
        await pool.execute(`UPDATE enrollments SET status = 'completed' WHERE student_id = ? AND status = 'active'`, [student_id]);
        await pool.execute(`INSERT INTO enrollments (student_id, class_id, status, created_at) VALUES (?, ?, 'active', NOW())`, [student_id, data.new_class_id]);
      }
    }
    
    res.json({ success: true, message: `Bulk ${action} completed successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PARENT MANAGEMENT APIS
// ==========================================

// Get all parents
router.get('/parents', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { search, verified, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone,
        u.address, u.is_active, u.created_at,
        COUNT(DISTINCT ps.student_id) as children_count
      FROM users u
      LEFT JOIN parent_student ps ON u.id = ps.parent_id AND ps.is_verified = TRUE
      WHERE u.role = 'parent'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [parents] = await pool.execute(query, params);
    
    const [countResult] = await pool.execute(`SELECT COUNT(*) as total FROM users WHERE role = 'parent'`);
    
    res.json({
      success: true,
      parents,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get parent details with children
router.get('/parents/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [parents] = await pool.execute(`
      SELECT * FROM users WHERE id = ? AND role = 'parent'
    `, [id]);
    
    if (parents.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }
    
    const [children] = await pool.execute(`
      SELECT u.*, ps.is_verified, ps.relationship, ps.linked_at,
        tc.class_name, tl.trade_name, tl.level_number
      FROM parent_student ps
      JOIN users u ON ps.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE ps.parent_id = ?
    `, [id]);
    
    res.json({
      success: true,
      parent: parents[0],
      children: children
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Link parent to student
router.post('/parents/link-student', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { parent_id, student_id, relationship } = req.body;
    
    await pool.execute(`
      INSERT INTO parent_student (parent_id, student_id, relationship, is_verified, linked_at)
      VALUES (?, ?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE is_verified = TRUE
    `, [parent_id, student_id, relationship || 'parent']);
    
    res.json({ success: true, message: 'Parent linked to student successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// CLASS MANAGEMENT APIS
// ==========================================

// Get all classes
router.get('/classes', authenticateToken, async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT tc.*, tl.trade_name, tl.level_number, tl.trade_code,
        COUNT(DISTINCT e.student_id) as student_count,
        COUNT(DISTINCT tsa.teacher_id) as teacher_count
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
      LEFT JOIN teacher_subject_assignments tsa ON tc.id = tsa.trade_class_id AND tsa.is_active = TRUE
      GROUP BY tc.id
      ORDER BY tl.level_number, tc.class_name
    `);
    
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get subjects
router.get('/subjects', authenticateToken, async (req, res) => {
  try {
    const [subjects] = await pool.execute(`
      SELECT s.*,
        COUNT(DISTINCT tsa.teacher_id) as teacher_count,
        COUNT(DISTINCT ssp.student_id) as student_count,
        AVG(ssp.percentage) as avg_performance
      FROM subjects s
      LEFT JOIN teacher_subject_assignments tsa ON s.id = tsa.subject_id AND tsa.is_active = TRUE
      LEFT JOIN student_subject_performance ssp ON s.id = ssp.subject_id
      WHERE s.is_active = TRUE
      GROUP BY s.id
      ORDER BY s.name
    `);
    
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get academic years
router.get('/academic-years', authenticateToken, async (req, res) => {
  try {
    const [years] = await pool.execute(`
      SELECT * FROM academic_years ORDER BY start_date DESC
    `);
    
    res.json({ success: true, academic_years: years });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// TRADES & LEVELS MANAGEMENT
// ==========================================

// Get all trades
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute('SELECT * FROM trades ORDER BY code');
    res.json(trades);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all levels
router.get('/levels', authenticateToken, async (req, res) => {
  try {
    const [levels] = await pool.execute('SELECT * FROM levels ORDER BY level_number');
    res.json(levels);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students by trade and level
router.get('/students/:tradeId/:levelId', authenticateToken, async (req, res) => {
  try {
    const { tradeId, levelId } = req.params;
    const [students] = await pool.execute(`
      SELECT s.*, t.name as trade_name, l.level_number
      FROM students s
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN levels l ON s.level_id = l.id
      WHERE s.trade_id = ? AND s.level_id = ?
      ORDER BY s.last_name, s.first_name
    `, [tradeId, levelId]);
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get level sheet columns
router.get('/columns/:tradeId/:levelId', authenticateToken, async (req, res) => {
  try {
    const { tradeId, levelId } = req.params;
    const [columns] = await pool.execute(`
      SELECT * FROM level_sheet_columns
      WHERE trade_id = ? AND level_id = ?
      ORDER BY display_order, id
    `, [tradeId, levelId]);
    
    res.json(columns);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create level sheet column
router.post('/columns', authenticateToken, requireRole('dos', 'headmaster', 'admin', 'accountant', 'dod', 'advisor'), async (req, res) => {
  try {
    const { trade_id, level_id, column_name, column_type, is_required, default_value, display_order } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO level_sheet_columns (trade_id, level_id, column_name, column_type, is_required, default_value, display_order, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [trade_id, level_id, column_name, column_type || 'text', is_required || false, default_value || '', display_order || 0, req.user.userId]);
    
    res.json({ success: true, message: 'Column created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update level sheet column
router.put('/columns/:columnId', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { columnId } = req.params;
    const { column_name, column_type, is_required, default_value, display_order } = req.body;
    
    await pool.execute(`
      UPDATE level_sheet_columns
      SET column_name = ?, column_type = ?, is_required = ?, default_value = ?, display_order = ?
      WHERE id = ?
    `, [column_name, column_type, is_required, default_value, display_order, columnId]);
    
    res.json({ success: true, message: 'Column updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete level sheet column
router.delete('/columns/:columnId', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { columnId } = req.params;
    await pool.execute('DELETE FROM level_sheet_columns WHERE id = ?', [columnId]);
    res.json({ success: true, message: 'Column deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student column value
router.put('/students/:studentId/columns/:columnId', authenticateToken, async (req, res) => {
  try {
    const { studentId, columnId } = req.params;
    const { column_value } = req.body;
    
    await pool.execute(`
      INSERT INTO student_column_values (student_id, column_id, column_value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE column_value = ?, updated_at = NOW()
    `, [studentId, columnId, column_value, column_value]);
    
    res.json({ success: true, message: 'Value updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add student (DOS/Headmaster)
router.post('/students', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, trade_id, level_id, guardian_name, guardian_phone, guardian_email } = req.body;
    
    // Generate student_id
    const [trade] = await pool.execute('SELECT code FROM trades WHERE id = ?', [trade_id]);
    const [level] = await pool.execute('SELECT level_number FROM levels WHERE id = ?', [level_id]);
    const [count] = await pool.execute('SELECT COUNT(*) as total FROM students WHERE trade_id = ? AND level_id = ?', [trade_id, level_id]);
    const student_id = `${trade[0].code}${level[0].level_number}${String(count[0].total + 1).padStart(3, '0')}`;
    
    const [result] = await pool.execute(`
      INSERT INTO students (student_id, first_name, last_name, email, phone, date_of_birth, gender, trade_id, level_id, guardian_name, guardian_phone, guardian_email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [student_id, first_name, last_name, email, phone, date_of_birth, gender, trade_id, level_id, guardian_name, guardian_phone, guardian_email]);
    
    res.json({ success: true, message: 'Student added', id: result.insertId, student_id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student info
router.put('/students/:studentId', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { first_name, last_name, email, phone, date_of_birth, gender, trade_id, level_id, guardian_name, guardian_phone, guardian_email } = req.body;
    
    await pool.execute(`
      UPDATE students
      SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?, trade_id = ?, level_id = ?, guardian_name = ?, guardian_phone = ?, guardian_email = ?
      WHERE id = ?
    `, [first_name, last_name, email, phone, date_of_birth, gender, trade_id, level_id, guardian_name, guardian_phone, guardian_email, studentId]);
    
    res.json({ success: true, message: 'Student updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student full details
router.get('/students/:studentId/details', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [students] = await pool.execute(`
      SELECT s.*, t.name as trade_name, t.code as trade_code, l.level_number, l.name as level_name
      FROM students s
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN levels l ON s.level_id = l.id
      WHERE s.id = ?
    `, [studentId]);
    
    if (!students[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [customValues] = await pool.execute(`
      SELECT cv.*, lsc.column_name, lsc.column_type
      FROM student_column_values cv
      JOIN level_sheet_columns lsc ON cv.column_id = lsc.id
      WHERE cv.student_id = ?
    `, [studentId]);
    
    res.json({ success: true, ...students[0], custom_values: customValues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

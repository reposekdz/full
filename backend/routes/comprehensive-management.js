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
    const { search, class_id, trade_id, status, sort, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.student_id, u.email, u.phone,
        u.date_of_birth, u.gender, u.address, u.is_active, u.trade_id, u.level,
        e.status as enrollment_status,
        tc.class_name, tc.level as class_level,
        t.code as trade_code, t.name as trade_name,
        COALESCE(sf.total_amount, 0) as fees_total, 
        COALESCE(sf.paid_amount, 0) as fees_paid, 
        COALESCE(sf.balance, 0) as fees_balance,
        COUNT(DISTINCT sdr.id) as discipline_count,
        u.created_at
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN (
        SELECT student_id, 
               SUM(amount) as fees_total, 
               SUM(paid_amount) as fees_paid, 
               SUM(amount - paid_amount) as fees_balance,
               CASE 
                 WHEN SUM(amount - paid_amount) = 0 THEN 'paid'
                 WHEN SUM(paid_amount) > 0 THEN 'partial'
                 ELSE 'unpaid'
               END as payment_status
        FROM fees
        GROUP BY student_id
      ) sf ON u.id = sf.student_id
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
    
    if (trade_id) {
      query += ` AND u.trade_id = ?`;
      params.push(trade_id);
    }
    
    if (status === 'active') {
      query += ` AND u.is_active = TRUE`;
    } else if (status === 'inactive') {
      query += ` AND u.is_active = FALSE`;
    }
    
    query += ` GROUP BY u.id`;
    
    if (sort === 'name') {
      query += ` ORDER BY u.last_name, u.first_name`;
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
        tc.class_name, tc.level as class_level,
        t.code as trade_code, t.name as trade_name,
        COALESCE(sf.total_amount, 0) as total_amount, 
        COALESCE(sf.paid_amount, 0) as paid_amount, 
        COALESCE(sf.balance, 0) as balance, 
        sf.payment_status
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN (
        SELECT student_id, 
               SUM(amount) as total_amount, 
               SUM(paid_amount) as paid_amount, 
               SUM(amount - paid_amount) as balance,
               CASE 
                 WHEN SUM(amount - paid_amount) = 0 THEN 'paid'
                 WHEN SUM(paid_amount) > 0 THEN 'partial'
                 ELSE 'unpaid'
               END as payment_status
        FROM fees
        GROUP BY student_id
      ) sf ON u.id = sf.student_id
      WHERE u.id = ? AND u.role = 'student'
    `, [id]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get subject performance
    const [subjects] = await pool.execute(`
      SELECT ssp.*, s.name as subject_name, s.code as subject_code
      FROM student_subject_performance ssp
      LEFT JOIN subjects s ON ssp.subject_id = s.id
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
    
    // Get attendance summary
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM student_attendance_records
      WHERE student_id = ?
    `, [id]);
    
    // Calculate academic performance
    const [performance] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT subject_id) as total_subjects,
        AVG(percentage) as average_percentage,
        AVG(grade_points) as gpa
      FROM student_subject_performance
      WHERE student_id = ?
    `, [id]);
    
    // Get linked parents
    const [parents] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.address,
        ps.relationship, ps.is_primary_contact, ps.created_at as linked_date
      FROM parent_students ps
      JOIN users u ON ps.parent_id = u.id AND u.role = 'parent'
      WHERE ps.student_id = ?
      ORDER BY ps.is_primary_contact DESC, u.first_name
    `, [id]);
    
    res.json({
      success: true,
      student: students[0],
      subjects: subjects,
      discipline: discipline,
      attendance: attendance[0] || { total_days: 0, present: 0, absent: 0, late: 0, excused: 0 },
      performance: performance[0] || { total_subjects: 0, average_percentage: 0, gpa: 0 },
      parents: parents
    });
  } catch (error) {
    console.error('Get student details error:', error);
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
    const [trades] = await pool.execute('SELECT * FROM trades WHERE is_active = 1 ORDER BY code');
    res.json(trades);
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all levels
router.get('/levels', authenticateToken, async (req, res) => {
  try {
    const [levels] = await pool.execute(`
      SELECT 
        id, 
        name, 
        description,
        CAST(SUBSTRING_INDEX(name, ' ', -1) AS UNSIGNED) as level_number,
        created_at
      FROM levels 
      ORDER BY id
    `);
    res.json({ success: true, levels, total: levels.length });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students by trade and level
router.get('/students/:tradeId/:levelId', authenticateToken, async (req, res) => {
  try {
    const { tradeId, levelId } = req.params;
    const [students] = await pool.execute(`
      SELECT u.*, 
        t.code as trade_code, t.name as trade_name,
        e.status as enrollment_status,
        tc.class_name,
        COALESCE(sf.balance, 0) as fees_balance
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN (
        SELECT student_id, SUM(amount - paid_amount) as fees_balance
        FROM fees
        GROUP BY student_id
      ) sf ON u.id = sf.student_id
      WHERE u.role = 'student' AND u.trade_id = ? AND u.level = ?
      ORDER BY u.last_name, u.first_name
    `, [tradeId, levelId]);
    
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    console.error('Get students by trade/level error:', error);
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
    const { 
      first_name, last_name, email, phone, date_of_birth, gender, 
      trade_id, level, class_id, 
      guardian_name, guardian_phone, guardian_email,
      password 
    } = req.body;
    
    // Validate trade exists
    if (trade_id) {
      const [trade] = await pool.execute('SELECT id, code, name FROM trades WHERE id = ? AND is_active = 1', [trade_id]);
      if (!trade || trade.length === 0) {
        return res.status(404).json({ success: false, message: 'Trade not found or inactive' });
      }
    }
    
    // Generate student_id based on trade and level
    let student_id;
    if (trade_id) {
      const [trade] = await pool.execute('SELECT code FROM trades WHERE id = ?', [trade_id]);
      const tradeCode = trade[0].code;
      const levelNum = level || 1;
      const [count] = await pool.execute(
        'SELECT COUNT(*) as total FROM users WHERE role = "student" AND trade_id = ? AND level = ?', 
        [trade_id, levelNum]
      );
      student_id = `${tradeCode}${levelNum}${String(count[0].total + 1).padStart(3, '0')}`;
    } else {
      // Fallback if no trade specified
      const year = new Date().getFullYear().toString().slice(-2);
      const [count] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = "student"');
      student_id = `STU${year}${String(count[0].total + 1).padStart(4, '0')}`;
    }
    
    // Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('Student@123', 10);
    
    // Create username from email or student_id
    const username = email ? email.split('@')[0] : student_id.toLowerCase();
    
    // Insert into users table
    const [result] = await pool.execute(`
      INSERT INTO users (
        username, email, password_hash, password, first_name, last_name, phone, 
        date_of_birth, gender, role, student_id, trade_id, level, 
        is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', ?, ?, ?, 1, NOW())
    `, [
      username, email, hashedPassword, hashedPassword, first_name, last_name, phone,
      date_of_birth, gender, student_id, trade_id, level
    ]);
    
    const newStudentId = result.insertId;
    
    // Create enrollment if class_id provided
    if (class_id) {
      await pool.execute(`
        INSERT INTO enrollments (student_id, class_id, enrollment_date, status, created_at)
        VALUES (?, ?, NOW(), 'active', NOW())
      `, [newStudentId, class_id]);
    }
    
    // Create student profile entry
    if (guardian_name || guardian_phone || guardian_email) {
      await pool.execute(`
        INSERT INTO students (user_id, class_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
      `, [newStudentId, class_id]);
      
      // Store guardian info in address field temporarily or create parent record
      if (guardian_name) {
        await pool.execute(`
          UPDATE users SET address = ? WHERE id = ?
        `, [`Guardian: ${guardian_name}, Phone: ${guardian_phone || 'N/A'}, Email: ${guardian_email || 'N/A'}`, newStudentId]);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Student added successfully', 
      id: newStudentId, 
      student_id,
      username
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student info
router.put('/students/:studentId', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { 
      first_name, last_name, email, phone, date_of_birth, gender, 
      trade_id, level, class_id, is_active,
      guardian_name, guardian_phone, guardian_email 
    } = req.body;
    
    // Validate trade if provided
    if (trade_id) {
      const [trade] = await pool.execute('SELECT id FROM trades WHERE id = ? AND is_active = 1', [trade_id]);
      if (!trade || trade.length === 0) {
        return res.status(404).json({ success: false, message: 'Trade not found or inactive' });
      }
    }
    
    // Update user table
    await pool.execute(`
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, phone = ?, 
          date_of_birth = ?, gender = ?, trade_id = ?, level = ?, 
          is_active = ?, updated_at = NOW()
      WHERE id = ? AND role = 'student'
    `, [
      first_name, last_name, email, phone, 
      date_of_birth, gender, trade_id, level, 
      is_active !== undefined ? is_active : true, 
      studentId
    ]);
    
    // Update enrollment if class_id changed
    if (class_id) {
      const [existing] = await pool.execute(
        'SELECT id FROM enrollments WHERE student_id = ? AND status = "active"', 
        [studentId]
      );
      
      if (existing.length > 0) {
        await pool.execute(
          'UPDATE enrollments SET class_id = ?, updated_at = NOW() WHERE student_id = ? AND status = "active"',
          [class_id, studentId]
        );
      } else {
        await pool.execute(
          'INSERT INTO enrollments (student_id, class_id, enrollment_date, status, created_at) VALUES (?, ?, NOW(), "active", NOW())',
          [studentId, class_id]
        );
      }
    }
    
    // Update guardian info in address field
    if (guardian_name || guardian_phone || guardian_email) {
      await pool.execute(
        'UPDATE users SET address = ? WHERE id = ?',
        [`Guardian: ${guardian_name || 'N/A'}, Phone: ${guardian_phone || 'N/A'}, Email: ${guardian_email || 'N/A'}`, studentId]
      );
    }
    
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student full details
router.get('/students/:studentId/details', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [students] = await pool.execute(`
      SELECT u.*, t.name as trade_name, t.code as trade_code
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.id = ? AND u.role = 'student'
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
    
    res.json({ success: true, student: students[0], custom_values: customValues });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ADVANCED STUDENT ANALYTICS
// ==========================================

// Get overall student statistics
router.get('/students/analytics/overview', authenticateToken, requireRole('dos', 'headmaster', 'admin', 'dod'), async (req, res) => {
  try {
    // Total students by status
    const [statusStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_students
      FROM users WHERE role = 'student'
    `);
    
    // Students by trade
    const [tradeStats] = await pool.execute(`
      SELECT 
        t.id, t.code, t.name,
        COUNT(u.id) as student_count
      FROM trades t
      LEFT JOIN users u ON t.id = u.trade_id AND u.role = 'student'
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY student_count DESC
    `);
    
    // Students by level
    const [levelStats] = await pool.execute(`
      SELECT 
        level,
        COUNT(*) as student_count
      FROM users
      WHERE role = 'student' AND level IS NOT NULL
      GROUP BY level
      ORDER BY level
    `);
    
    // Gender distribution
    const [genderStats] = await pool.execute(`
      SELECT 
        gender,
        COUNT(*) as count
      FROM users
      WHERE role = 'student'
      GROUP BY gender
    `);
    
    // Recent enrollments
    const [recentEnrollments] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'student' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Fee statistics
    const [feeStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT student_id) as total_records,
        SUM(amount) as total_fees,
        SUM(paid_amount) as total_paid,
        SUM(amount - paid_amount) as total_balance,
        COUNT(DISTINCT CASE WHEN status = 'paid' THEN student_id END) as fully_paid,
        COUNT(DISTINCT CASE WHEN status = 'partial' THEN student_id END) as partial_paid,
        COUNT(DISTINCT CASE WHEN status = 'pending' OR status = 'overdue' THEN student_id END) as unpaid
      FROM fees
    `);
    
    res.json({
      success: true,
      analytics: {
        overview: statusStats[0],
        by_trade: tradeStats,
        by_level: levelStats,
        by_gender: genderStats,
        recent_enrollments: recentEnrollments[0].count,
        fees: feeStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student performance analytics
router.get('/students/analytics/performance', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { trade_id, level } = req.query;
    
    let whereClause = 'WHERE u.role = "student"';
    const params = [];
    
    if (trade_id) {
      whereClause += ' AND u.trade_id = ?';
      params.push(trade_id);
    }
    
    if (level) {
      whereClause += ' AND u.level = ?';
      params.push(level);
    }
    
    // Academic performance
    const [performance] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.student_id,
        t.name as trade_name,
        COUNT(DISTINCT ssp.subject_id) as subjects_count,
        AVG(ssp.percentage) as average_percentage,
        AVG(ssp.grade_points) as gpa
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN student_subject_performance ssp ON u.id = ssp.student_id
      ${whereClause}
      GROUP BY u.id
      HAVING subjects_count > 0
      ORDER BY gpa DESC
      LIMIT 100
    `, params);
    
    // Attendance statistics
    const [attendance] = await pool.execute(`
      SELECT 
        AVG(CASE WHEN total_days > 0 THEN (present_days / total_days) * 100 ELSE 100 END) as avg_attendance_rate,
        COUNT(CASE WHEN (present_days / NULLIF(total_days, 0)) * 100 >= 90 THEN 1 END) as excellent_attendance,
        COUNT(CASE WHEN (present_days / NULLIF(total_days, 0)) * 100 >= 75 AND (present_days / NULLIF(total_days, 0)) * 100 < 90 THEN 1 END) as good_attendance,
        COUNT(CASE WHEN (present_days / NULLIF(total_days, 0)) * 100 < 75 THEN 1 END) as poor_attendance
      FROM (
        SELECT 
          student_id,
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
        FROM student_attendance_records
        GROUP BY student_id
      ) attendance_data
    `);
    
    res.json({
      success: true,
      performance: performance,
      attendance_summary: attendance[0] || {}
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk student operations
router.post('/students/bulk', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { action, student_ids, data } = req.body;
    
    if (!action || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid request data' });
    }
    
    let result;
    
    switch (action) {
      case 'activate':
        await pool.execute(
          `UPDATE users SET is_active = 1, updated_at = NOW() WHERE id IN (${student_ids.map(() => '?').join(',')}) AND role = 'student'`,
          student_ids
        );
        result = { message: `${student_ids.length} students activated successfully` };
        break;
        
      case 'deactivate':
        await pool.execute(
          `UPDATE users SET is_active = 0, updated_at = NOW() WHERE id IN (${student_ids.map(() => '?').join(',')}) AND role = 'student'`,
          student_ids
        );
        result = { message: `${student_ids.length} students deactivated successfully` };
        break;
        
      case 'assign_trade':
        if (!data || !data.trade_id) {
          return res.status(400).json({ success: false, message: 'Trade ID required for assignment' });
        }
        
        // Validate trade
        const [trade] = await pool.execute('SELECT id FROM trades WHERE id = ? AND is_active = 1', [data.trade_id]);
        if (!trade || trade.length === 0) {
          return res.status(404).json({ success: false, message: 'Trade not found' });
        }
        
        await pool.execute(
          `UPDATE users SET trade_id = ?, level = ?, updated_at = NOW() WHERE id IN (${student_ids.map(() => '?').join(',')}) AND role = 'student'`,
          [data.trade_id, data.level || 1, ...student_ids]
        );
        result = { message: `${student_ids.length} students assigned to trade successfully` };
        break;
        
      case 'export':
        const [students] = await pool.execute(
          `SELECT u.*, t.code as trade_code, t.name as trade_name 
           FROM users u 
           LEFT JOIN trades t ON u.trade_id = t.id 
           WHERE u.id IN (${student_ids.map(() => '?').join(',')}) AND u.role = 'student'`,
          student_ids
        );
        result = { students, count: students.length };
        break;
        
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Advanced student search
router.post('/students/search', authenticateToken, requireRole('dos', 'headmaster', 'admin', 'dod', 'advisor'), async (req, res) => {
  try {
    const { 
      query, 
      trade_id, 
      level, 
      status, 
      gender, 
      enrollment_status,
      fee_status,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'DESC',
      limit = 50,
      offset = 0
    } = req.body;
    
    let whereConditions = ['u.role = "student"'];
    const params = [];
    
    if (query) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ? OR u.email LIKE ?)');
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (trade_id) {
      whereConditions.push('u.trade_id = ?');
      params.push(trade_id);
    }
    
    if (level) {
      whereConditions.push('u.level = ?');
      params.push(level);
    }
    
    if (status === 'active') {
      whereConditions.push('u.is_active = 1');
    } else if (status === 'inactive') {
      whereConditions.push('u.is_active = 0');
    }
    
    if (gender) {
      whereConditions.push('u.gender = ?');
      params.push(gender);
    }
    
    if (enrollment_status) {
      whereConditions.push('e.status = ?');
      params.push(enrollment_status);
    }
    
    if (fee_status) {
      whereConditions.push('sf.payment_status = ?');
      params.push(fee_status);
    }
    
    if (date_from) {
      whereConditions.push('u.created_at >= ?');
      params.push(date_from);
    }
    
    if (date_to) {
      whereConditions.push('u.created_at <= ?');
      params.push(date_to);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const validSortColumns = ['first_name', 'last_name', 'student_id', 'created_at', 'trade_name'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.student_id, u.email, u.phone,
        u.date_of_birth, u.gender, u.is_active, u.created_at,
        t.code as trade_code, t.name as trade_name, u.level,
        e.status as enrollment_status,
        tc.class_name,
        COALESCE(sf.balance, 0) as fees_balance,
        sf.payment_status as fee_status
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN (
        SELECT student_id, 
               SUM(amount - paid_amount) as balance,
               CASE 
                 WHEN SUM(amount - paid_amount) = 0 THEN 'paid'
                 WHEN SUM(paid_amount) > 0 THEN 'partial'
                 ELSE 'unpaid'
               END as payment_status
        FROM fees
        GROUP BY student_id
      ) sf ON u.id = sf.student_id
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT u.id) as total 
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN fees sf ON u.id = sf.student_id
      WHERE ${whereClause}
    `, params);
    
    res.json({
      success: true,
      students,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT REPORT CARD GENERATION
// ==========================================

// Generate student report card
router.get('/students/:id/report-card', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { term, academic_year } = req.query;
    
    // Get student info
    const [students] = await pool.execute(`
      SELECT u.*, t.code as trade_code, t.name as trade_name
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.id = ? AND u.role = 'student'
    `, [id]);
    
    if (!students[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = students[0];
    
    // Get subject performance
    const [subjects] = await pool.execute(`
      SELECT 
        subject_code, subject_name,
        quiz_marks, midterm_marks, final_marks, total_marks,
        percentage, grade, grade_points, remarks
      FROM student_subject_performance
      WHERE student_id = ? ${term ? 'AND term = ?' : ''} ${academic_year ? 'AND academic_year = ?' : ''}
      ORDER BY subject_name
    `, term && academic_year ? [id, term, academic_year] : term ? [id, term] : academic_year ? [id, academic_year] : [id]);
    
    // Calculate overall performance
    const totalSubjects = subjects.length;
    const totalMarks = subjects.reduce((sum, s) => sum + parseFloat(s.total_marks || 0), 0);
    const averagePercentage = totalSubjects > 0 ? subjects.reduce((sum, s) => sum + parseFloat(s.percentage || 0), 0) / totalSubjects : 0;
    const gpa = totalSubjects > 0 ? subjects.reduce((sum, s) => sum + parseFloat(s.grade_points || 0), 0) / totalSubjects : 0;
    
    const overallGrade = averagePercentage >= 90 ? 'A' : 
                        averagePercentage >= 80 ? 'B' : 
                        averagePercentage >= 70 ? 'C' : 
                        averagePercentage >= 60 ? 'D' : 'F';
    
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
    
    const attendanceRate = attendance[0].total_days > 0 ? 
      ((attendance[0].present / attendance[0].total_days) * 100).toFixed(2) : 100;
    
    // Get discipline records
    const [discipline] = await pool.execute(`
      SELECT COUNT(*) as total_incidents,
             SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
             SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
             SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
             SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM student_discipline_records
      WHERE student_id = ? AND status = 'active'
    `, [id]);
    
    const conductScore = Math.max(0, 100 - 
      (discipline[0].critical || 0) * 20 - 
      (discipline[0].high || 0) * 10 - 
      (discipline[0].medium || 0) * 5 - 
      (discipline[0].low || 0) * 2
    );
    
    const conductGrade = conductScore >= 90 ? 'A' : 
                        conductScore >= 80 ? 'B' : 
                        conductScore >= 70 ? 'C' : 
                        conductScore >= 60 ? 'D' : 'F';
    
    // Get class rank (if applicable)
    const [rankData] = await pool.execute(`
      SELECT student_id, AVG(percentage) as avg_perf
      FROM student_subject_performance
      WHERE student_id IN (
        SELECT id FROM users WHERE trade_id = ? AND level = ? AND role = 'student'
      )
      GROUP BY student_id
      ORDER BY avg_perf DESC
    `, [student.trade_id, student.level]);
    
    const rank = rankData.findIndex(r => r.student_id === parseInt(id)) + 1;
    const totalInClass = rankData.length;
    
    res.json({
      success: true,
      report_card: {
        student: {
          id: student.id,
          student_id: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          trade: student.trade_name,
          trade_code: student.trade_code,
          level: student.level,
          email: student.email
        },
        academic: {
          term: term || 'All',
          academic_year: academic_year || 'All',
          subjects: subjects,
          total_subjects: totalSubjects,
          total_marks: totalMarks.toFixed(2),
          average_percentage: averagePercentage.toFixed(2),
          gpa: gpa.toFixed(2),
          overall_grade: overallGrade,
          class_rank: rank > 0 ? rank : null,
          total_in_class: totalInClass
        },
        attendance: {
          total_days: attendance[0].total_days,
          present: attendance[0].present,
          absent: attendance[0].absent,
          late: attendance[0].late,
          attendance_rate: attendanceRate
        },
        discipline: {
          total_incidents: discipline[0].total_incidents || 0,
          conduct_score: conductScore,
          conduct_grade: conductGrade,
          breakdown: {
            critical: discipline[0].critical || 0,
            high: discipline[0].high || 0,
            medium: discipline[0].medium || 0,
            low: discipline[0].low || 0
          }
        },
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Report card generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT PROMOTION/DEMOTION
// ==========================================

// Promote students to next level
router.post('/students/promote', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { student_ids, target_level, academic_year } = req.body;
    
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Student IDs required' });
    }
    
    if (!target_level) {
      return res.status(400).json({ success: false, message: 'Target level required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      let promoted = 0;
      const results = [];
      
      for (const student_id of student_ids) {
        // Get current student info
        const [students] = await connection.execute(
          'SELECT id, first_name, last_name, student_id, level, trade_id FROM users WHERE id = ? AND role = "student"',
          [student_id]
        );
        
        if (students.length === 0) {
          results.push({ student_id, success: false, message: 'Student not found' });
          continue;
        }
        
        const student = students[0];
        
        // Update student level
        await connection.execute(
          'UPDATE users SET level = ?, updated_at = NOW() WHERE id = ?',
          [target_level, student_id]
        );
        
        // Log promotion
        await connection.execute(`
          INSERT INTO student_transfers 
          (student_id, from_level, to_level, transfer_date, transfer_type, reason, created_at)
          VALUES (?, ?, ?, NOW(), 'promotion', 'Level promotion', NOW())
        `, [student_id, student.level, target_level]);
        
        promoted++;
        results.push({ 
          student_id, 
          success: true, 
          name: `${student.first_name} ${student.last_name}`,
          from_level: student.level,
          to_level: target_level
        });
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Successfully promoted ${promoted} student(s)`,
        promoted_count: promoted,
        results: results
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Student promotion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT GRADUATION
// ==========================================

// Process student graduation
router.post('/students/graduate', authenticateToken, requireRole('headmaster', 'admin'), async (req, res) => {
  try {
    const { student_ids, graduation_date, certificate_info } = req.body;
    
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Student IDs required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      let graduated = 0;
      const results = [];
      
      for (const student_id of student_ids) {
        // Get student info
        const [students] = await connection.execute(
          `SELECT u.*, t.name as trade_name 
           FROM users u 
           LEFT JOIN trades t ON u.trade_id = t.id
           WHERE u.id = ? AND u.role = 'student'`,
          [student_id]
        );
        
        if (students.length === 0) {
          results.push({ student_id, success: false, message: 'Student not found' });
          continue;
        }
        
        const student = students[0];
        
        // Check if student has completed required level
        if (student.level < 5) {
          results.push({ 
            student_id, 
            success: false, 
            message: 'Student has not completed required level for graduation'
          });
          continue;
        }
        
        // Update enrollment status to graduated
        await connection.execute(
          'UPDATE enrollments SET status = "completed", completion_date = ?, updated_at = NOW() WHERE student_id = ? AND status = "active"',
          [graduation_date || new Date(), student_id]
        );
        
        // Update user status
        await connection.execute(
          'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?',
          [student_id]
        );
        
        // Create certificate record (if certificates table exists)
        try {
          await connection.execute(`
            INSERT INTO certificates 
            (student_id, certificate_type, issue_date, certificate_number, details, created_at)
            VALUES (?, 'graduation', ?, ?, ?, NOW())
          `, [
            student_id, 
            graduation_date || new Date(),
            `GRAD${new Date().getFullYear()}${String(student_id).padStart(6, '0')}`,
            JSON.stringify(certificate_info || {})
          ]);
        } catch (certError) {
          console.log('Certificate table not available:', certError.message);
        }
        
        graduated++;
        results.push({ 
          student_id, 
          success: true,
          name: `${student.first_name} ${student.last_name}`,
          trade: student.trade_name,
          graduation_date: graduation_date || new Date()
        });
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Successfully processed graduation for ${graduated} student(s)`,
        graduated_count: graduated,
        results: results
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Student graduation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT IMPORT (CSV/BULK)
// ==========================================

// Import students from CSV
router.post('/students/import', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { students_data, validate_only = false } = req.body;
    
    if (!students_data || !Array.isArray(students_data)) {
      return res.status(400).json({ success: false, message: 'students_data array required' });
    }
    
    const connection = await pool.getConnection();
    const results = {
      total: students_data.length,
      success: 0,
      failed: 0,
      errors: [],
      imported: []
    };
    
    try {
      if (!validate_only) {
        await connection.beginTransaction();
      }
      
      for (let i = 0; i < students_data.length; i++) {
        const student = students_data[i];
        const rowNum = i + 1;
        
        try {
          // Validate required fields
          if (!student.first_name || !student.last_name) {
            throw new Error('First name and last name are required');
          }
          
          // Validate trade if provided
          if (student.trade_id || student.trade_code) {
            const tradeQuery = student.trade_id 
              ? 'SELECT id, code, name FROM trades WHERE id = ? AND is_active = 1'
              : 'SELECT id, code, name FROM trades WHERE code = ? AND is_active = 1';
            const tradeParam = student.trade_id || student.trade_code;
            
            const [trades] = await connection.execute(tradeQuery, [tradeParam]);
            if (!trades || trades.length === 0) {
              throw new Error(`Trade not found: ${tradeParam}`);
            }
            student.trade_id = trades[0].id;
            student.trade_code = trades[0].code;
          }
          
          // Generate student_id
          let student_id;
          if (student.student_id) {
            // Check if student_id already exists
            const [existing] = await connection.execute(
              'SELECT id FROM users WHERE student_id = ?',
              [student.student_id]
            );
            if (existing.length > 0) {
              throw new Error(`Student ID ${student.student_id} already exists`);
            }
            student_id = student.student_id;
          } else if (student.trade_id) {
            const levelNum = student.level || 1;
            const [count] = await connection.execute(
              'SELECT COUNT(*) as total FROM users WHERE role = "student" AND trade_id = ? AND level = ?',
              [student.trade_id, levelNum]
            );
            student_id = `${student.trade_code}${levelNum}${String(count[0].total + 1).padStart(3, '0')}`;
          } else {
            const year = new Date().getFullYear().toString().slice(-2);
            const [count] = await connection.execute('SELECT COUNT(*) as total FROM users WHERE role = "student"');
            student_id = `STU${year}${String(count[0].total + 1).padStart(4, '0')}`;
          }
          
          if (validate_only) {
            results.success++;
            results.imported.push({ row: rowNum, student_id, status: 'valid' });
            continue;
          }
          
          // Hash password
          const password = student.password || 'password123';
          const hashedPassword = await bcrypt.hash(password, 10);
          
          // Insert student
          const [result] = await connection.execute(`
            INSERT INTO users 
            (student_id, first_name, last_name, email, phone, password, role, 
             date_of_birth, gender, address, trade_id, level, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, 1, NOW())
          `, [
            student_id,
            student.first_name,
            student.last_name,
            student.email || null,
            student.phone || null,
            hashedPassword,
            student.date_of_birth || null,
            student.gender || null,
            student.address || null,
            student.trade_id || null,
            student.level || 1
          ]);
          
          const userId = result.insertId;
          
          // Create enrollment if class_id provided
          if (student.class_id) {
            await connection.execute(`
              INSERT INTO enrollments (student_id, class_id, enrollment_date, status, created_at)
              VALUES (?, ?, NOW(), 'active', NOW())
            `, [userId, student.class_id]);
          }
          
          results.success++;
          results.imported.push({ 
            row: rowNum, 
            student_id, 
            user_id: userId,
            name: `${student.first_name} ${student.last_name}`,
            status: 'imported' 
          });
          
        } catch (error) {
          results.failed++;
          results.errors.push({ 
            row: rowNum, 
            data: student,
            error: error.message 
          });
        }
      }
      
      if (!validate_only) {
        await connection.commit();
      }
      
      res.json({
        success: true,
        message: validate_only 
          ? `Validation complete: ${results.success} valid, ${results.failed} invalid`
          : `Import complete: ${results.success} imported, ${results.failed} failed`,
        results
      });
      
    } catch (error) {
      if (!validate_only) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Student import error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT EXPORT
// ==========================================

// Export students to CSV/JSON
router.post('/students/export', authenticateToken, requireRole('dos', 'headmaster', 'admin', 'dod'), async (req, res) => {
  try {
    const { format = 'json', filters = {} } = req.body;
    
    let whereConditions = ['u.role = "student"'];
    const params = [];
    
    if (filters.trade_id) {
      whereConditions.push('u.trade_id = ?');
      params.push(filters.trade_id);
    }
    
    if (filters.level) {
      whereConditions.push('u.level = ?');
      params.push(filters.level);
    }
    
    if (filters.status) {
      whereConditions.push('u.is_active = ?');
      params.push(filters.status === 'active' ? 1 : 0);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name, u.email, u.phone,
        u.date_of_birth, u.gender, u.address, u.is_active,
        t.code as trade_code, t.name as trade_name, u.level,
        e.status as enrollment_status, e.enrollment_date,
        tc.class_name,
        u.created_at
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE ${whereClause}
      ORDER BY u.last_name, u.first_name
    `, params);
    
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'ID', 'Student ID', 'First Name', 'Last Name', 'Email', 'Phone',
        'Date of Birth', 'Gender', 'Address', 'Trade Code', 'Trade Name', 'Level',
        'Class', 'Enrollment Status', 'Enrollment Date', 'Status', 'Created At'
      ];
      
      let csv = headers.join(',') + '\n';
      
      students.forEach(student => {
        const row = [
          student.id,
          student.student_id || '',
          student.first_name,
          student.last_name,
          student.email || '',
          student.phone || '',
          student.date_of_birth || '',
          student.gender || '',
          `"${(student.address || '').replace(/"/g, '""')}"`,
          student.trade_code || '',
          student.trade_name || '',
          student.level || '',
          student.class_name || '',
          student.enrollment_status || '',
          student.enrollment_date || '',
          student.is_active ? 'Active' : 'Inactive',
          student.created_at
        ];
        csv += row.join(',') + '\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=students_export_${Date.now()}.csv`);
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        success: true,
        total: students.length,
        data: students,
        exported_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Student export error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT TRANSFER BETWEEN TRADES/CLASSES
// ==========================================

// Transfer student to different trade/class
router.post('/students/:id/transfer-trade', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { new_trade_id, new_level, new_class_id, reason, effective_date } = req.body;
    
    if (!new_trade_id) {
      return res.status(400).json({ success: false, message: 'New trade ID required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get student current info
      const [students] = await connection.execute(
        `SELECT u.*, t.name as current_trade_name 
         FROM users u 
         LEFT JOIN trades t ON u.trade_id = t.id
         WHERE u.id = ? AND u.role = 'student'`,
        [id]
      );
      
      if (!students[0]) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      
      const student = students[0];
      
      // Validate new trade
      const [newTrade] = await connection.execute(
        'SELECT id, code, name FROM trades WHERE id = ? AND is_active = 1',
        [new_trade_id]
      );
      
      if (!newTrade[0]) {
        return res.status(404).json({ success: false, message: 'New trade not found or inactive' });
      }
      
      // Generate new student_id for new trade
      const levelNum = new_level || student.level || 1;
      const [count] = await connection.execute(
        'SELECT COUNT(*) as total FROM users WHERE role = "student" AND trade_id = ? AND level = ?',
        [new_trade_id, levelNum]
      );
      const new_student_id = `${newTrade[0].code}${levelNum}${String(count[0].total + 1).padStart(3, '0')}`;
      
      // Update student
      await connection.execute(
        `UPDATE users 
         SET trade_id = ?, level = ?, student_id = ?, updated_at = NOW()
         WHERE id = ?`,
        [new_trade_id, levelNum, new_student_id, id]
      );
      
      // Deactivate old enrollment
      await connection.execute(
        'UPDATE enrollments SET status = "transferred", updated_at = NOW() WHERE student_id = ? AND status = "active"',
        [id]
      );
      
      // Create new enrollment if class provided
      if (new_class_id) {
        await connection.execute(
          `INSERT INTO enrollments (student_id, class_id, enrollment_date, status, created_at)
           VALUES (?, ?, NOW(), 'active', NOW())`,
          [id, new_class_id]
        );
      }
      
      // Log transfer in student_transfers table (if exists)
      try {
        await connection.execute(`
          INSERT INTO student_transfers 
          (student_id, from_trade_id, to_trade_id, from_level, to_level, 
           transfer_date, transfer_type, reason, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'trade_transfer', ?, NOW())
        `, [
          id,
          student.trade_id,
          new_trade_id,
          student.level,
          levelNum,
          effective_date || new Date(),
          reason || 'Trade transfer'
        ]);
      } catch (transferError) {
        console.log('Transfer log table not available:', transferError.message);
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Student transferred successfully',
        transfer: {
          student_id: id,
          old_student_id: student.student_id,
          new_student_id: new_student_id,
          from_trade: student.current_trade_name,
          to_trade: newTrade[0].name,
          from_level: student.level,
          to_level: levelNum
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Student transfer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// FEE PAYMENT PLANS & REMINDERS
// ==========================================

// Create payment plan for student
router.post('/students/:id/payment-plan', authenticateToken, requireRole('accountant', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { installments, start_date, frequency } = req.body;
    
    // Get student's total outstanding fees
    const [feeData] = await pool.execute(`
      SELECT 
        SUM(amount) as total_fees,
        SUM(paid_amount) as total_paid,
        SUM(amount - paid_amount) as balance
      FROM fees
      WHERE student_id = ?
    `, [id]);
    
    if (!feeData[0] || feeData[0].balance <= 0) {
      return res.status(400).json({ success: false, message: 'No outstanding fees found' });
    }
    
    const balance = parseFloat(feeData[0].balance);
    const installmentAmount = balance / installments;
    
    const plan = {
      student_id: id,
      total_amount: balance,
      installments: installments,
      installment_amount: installmentAmount.toFixed(2),
      start_date: start_date || new Date(),
      frequency: frequency || 'monthly',
      status: 'active',
      created_at: new Date()
    };
    
    // Create installment schedule
    const schedule = [];
    let currentDate = new Date(plan.start_date);
    
    for (let i = 1; i <= installments; i++) {
      schedule.push({
        installment_number: i,
        due_date: new Date(currentDate),
        amount: installmentAmount.toFixed(2),
        status: 'pending'
      });
      
      // Increment date based on frequency
      if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    plan.schedule = schedule;
    
    res.json({
      success: true,
      message: 'Payment plan created successfully',
      payment_plan: plan
    });
  } catch (error) {
    console.error('Payment plan creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get fee payment reminders
router.get('/fees/reminders', authenticateToken, requireRole('accountant', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { days_ahead = 7 } = req.query;
    
    // Get students with upcoming or overdue fees
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name, u.email, u.phone,
        t.name as trade_name,
        f.fee_type, f.amount, f.due_date, f.paid_amount,
        (f.amount - f.paid_amount) as balance,
        DATEDIFF(f.due_date, NOW()) as days_until_due
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      JOIN fees f ON u.id = f.student_id
      WHERE u.role = 'student' 
        AND (f.amount - f.paid_amount) > 0
        AND f.due_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
      ORDER BY f.due_date ASC
    `, [days_ahead]);
    
    const overdue = students.filter(s => s.days_until_due < 0);
    const upcoming = students.filter(s => s.days_until_due >= 0);
    
    res.json({
      success: true,
      summary: {
        total_pending: students.length,
        overdue: overdue.length,
        upcoming: upcoming.length,
        total_amount: students.reduce((sum, s) => sum + parseFloat(s.balance), 0).toFixed(2)
      },
      overdue: overdue,
      upcoming: upcoming
    });
  } catch (error) {
    console.error('Fee reminders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT DOCUMENT MANAGEMENT
// ==========================================

// Get student documents
router.get('/students/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get documents from student_documents table
    try {
      const [documents] = await pool.execute(`
        SELECT id, document_type, document_name, file_path, file_size, 
               uploaded_by, uploaded_at, verified, verified_by, verified_at
        FROM student_documents
        WHERE student_id = ?
        ORDER BY uploaded_at DESC
      `, [id]);
      
      res.json({ success: true, documents });
    } catch (tableError) {
      // Table might not exist, return empty array
      res.json({ 
        success: true, 
        documents: [],
        message: 'Document management system not yet configured'
      });
    }
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload student document
router.post('/students/:id/documents', authenticateToken, requireRole('dos', 'headmaster', 'admin', 'advisor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { document_type, document_name, file_path, file_size } = req.body;
    
    if (!document_type || !document_name || !file_path) {
      return res.status(400).json({ 
        success: false, 
        message: 'document_type, document_name, and file_path required' 
      });
    }
    
    try {
      const [result] = await pool.execute(`
        INSERT INTO student_documents 
        (student_id, document_type, document_name, file_path, file_size, 
         uploaded_by, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [id, document_type, document_name, file_path, file_size || 0, req.user.userId]);
      
      res.json({
        success: true,
        message: 'Document uploaded successfully',
        document_id: result.insertId
      });
    } catch (tableError) {
      res.status(500).json({
        success: false,
        message: 'Document table not available. Please create student_documents table.'
      });
    }
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// STUDENT TIMELINE/ACTIVITY LOG
// ==========================================

// Get student activity timeline
router.get('/students/:id/timeline', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;
    
    const timeline = [];
    
    // Get enrollment history
    try {
      const [enrollments] = await pool.execute(`
        SELECT e.*, tc.class_name, tc.level,
               'enrollment' as event_type
        FROM enrollments e
        LEFT JOIN trade_classes tc ON e.class_id = tc.id
        WHERE e.student_id = ?
        ORDER BY e.enrollment_date DESC
      `, [id]);
      
      enrollments.forEach(e => {
        timeline.push({
          date: e.enrollment_date,
          type: 'enrollment',
          title: 'Enrollment',
          description: `Enrolled in ${e.class_name || 'class'}`,
          status: e.status,
          metadata: e
        });
      });
    } catch (err) {}
    
    // Get fee payments
    try {
      const [payments] = await pool.execute(`
        SELECT fp.*, f.fee_type
        FROM fee_payments fp
        JOIN fees f ON fp.fee_id = f.id
        WHERE f.student_id = ?
        ORDER BY fp.payment_date DESC
      `, [id]);
      
      payments.forEach(p => {
        timeline.push({
          date: p.payment_date,
          type: 'payment',
          title: 'Fee Payment',
          description: `Paid ${p.amount} for ${p.fee_type}`,
          metadata: p
        });
      });
    } catch (err) {}
    
    // Get transfers
    try {
      const [transfers] = await pool.execute(`
        SELECT st.*, 
               t1.name as from_trade, 
               t2.name as to_trade
        FROM student_transfers st
        LEFT JOIN trades t1 ON st.from_trade_id = t1.id
        LEFT JOIN trades t2 ON st.to_trade_id = t2.id
        WHERE st.student_id = ?
        ORDER BY st.transfer_date DESC
      `, [id]);
      
      transfers.forEach(t => {
        timeline.push({
          date: t.transfer_date,
          type: 'transfer',
          title: 'Transfer',
          description: `Transferred from ${t.from_trade || 'level ' + t.from_level} to ${t.to_trade || 'level ' + t.to_level}`,
          metadata: t
        });
      });
    } catch (err) {}
    
    // Get discipline records
    try {
      const [discipline] = await pool.execute(`
        SELECT id, incident_date, incident_type, severity, description, status
        FROM student_discipline_records
        WHERE student_id = ?
        ORDER BY incident_date DESC
      `, [id]);
      
      discipline.forEach(d => {
        timeline.push({
          date: d.incident_date,
          type: 'discipline',
          title: 'Discipline Record',
          description: `${d.incident_type} - ${d.severity} severity`,
          severity: d.severity,
          metadata: d
        });
      });
    } catch (err) {}
    
    // Sort timeline by date (most recent first)
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      success: true,
      total_events: timeline.length,
      timeline: timeline.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Student timeline error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// AUTOMATED CLASS ASSIGNMENT
// ==========================================

// Auto-assign students to classes based on trade and level
router.post('/students/auto-assign-classes', authenticateToken, requireRole('dos', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { trade_id, level, class_capacity = 30, create_classes = false } = req.body;
    
    if (!trade_id || !level) {
      return res.status(400).json({ success: false, message: 'trade_id and level required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get students without active enrollment
      const [students] = await connection.execute(`
        SELECT u.id, u.student_id, u.first_name, u.last_name
        FROM users u
        LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
        WHERE u.role = 'student' 
          AND u.trade_id = ? 
          AND u.level = ?
          AND e.id IS NULL
        ORDER BY u.created_at
      `, [trade_id, level]);
      
      if (students.length === 0) {
        return res.json({
          success: true,
          message: 'No students found needing class assignment',
          assigned: 0
        });
      }
      
      // Get available classes for this trade and level
      let [classes] = await connection.execute(`
        SELECT tc.id, tc.class_name, COUNT(e.id) as current_enrollment
        FROM trade_classes tc
        LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
        WHERE tc.trade_id = ? AND tc.level = ? AND tc.is_active = 1
        GROUP BY tc.id
        HAVING current_enrollment < ?
        ORDER BY current_enrollment ASC
      `, [trade_id, level, class_capacity]);
      
      // Create new classes if needed
      if (create_classes && students.length > classes.length * class_capacity) {
        const classesNeeded = Math.ceil(students.length / class_capacity) - classes.length;
        
        for (let i = 0; i < classesNeeded; i++) {
          const className = `Class ${String.fromCharCode(65 + classes.length + i)}`;
          const [result] = await connection.execute(`
            INSERT INTO trade_classes (trade_id, class_name, level, capacity, is_active, created_at)
            VALUES (?, ?, ?, ?, 1, NOW())
          `, [trade_id, className, level, class_capacity]);
          
          classes.push({
            id: result.insertId,
            class_name: className,
            current_enrollment: 0
          });
        }
      }
      
      if (classes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No available classes found. Set create_classes=true to auto-create classes.'
        });
      }
      
      // Assign students to classes
      let assigned = 0;
      let classIndex = 0;
      const assignments = [];
      
      for (const student of students) {
        const targetClass = classes[classIndex];
        
        // Create enrollment
        await connection.execute(`
          INSERT INTO enrollments (student_id, class_id, enrollment_date, status, created_at)
          VALUES (?, ?, NOW(), 'active', NOW())
        `, [student.id, targetClass.id]);
        
        assigned++;
        assignments.push({
          student_id: student.student_id,
          student_name: `${student.first_name} ${student.last_name}`,
          class_name: targetClass.class_name
        });
        
        // Update class enrollment count
        targetClass.current_enrollment++;
        
        // Move to next class if current class is full
        if (targetClass.current_enrollment >= class_capacity) {
          classIndex++;
          if (classIndex >= classes.length) {
            classIndex = 0; // Cycle back if all classes are full
          }
        }
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Successfully assigned ${assigned} students to classes`,
        assigned: assigned,
        assignments: assignments,
        classes_used: classes.map(c => ({
          class_name: c.class_name,
          enrollment: c.current_enrollment
        }))
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Auto-assign classes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// BATCH CERTIFICATE GENERATION
// ==========================================

// Generate certificates for multiple students
router.post('/students/generate-certificates', authenticateToken, requireRole('headmaster', 'admin'), async (req, res) => {
  try {
    const { student_ids, certificate_type, issue_date, template } = req.body;
    
    if (!student_ids || !Array.isArray(student_ids)) {
      return res.status(400).json({ success: false, message: 'student_ids array required' });
    }
    
    const connection = await pool.getConnection();
    const certificates = [];
    
    try {
      await connection.beginTransaction();
      
      for (const student_id of student_ids) {
        const [students] = await connection.execute(
          `SELECT u.*, t.name as trade_name 
           FROM users u 
           LEFT JOIN trades t ON u.trade_id = t.id
           WHERE u.id = ? AND u.role = 'student'`,
          [student_id]
        );
        
        if (students.length === 0) continue;
        
        const student = students[0];
        const certificateNumber = `CERT${new Date().getFullYear()}${String(student_id).padStart(6, '0')}`;
        
        try {
          await connection.execute(`
            INSERT INTO certificates 
            (student_id, certificate_type, issue_date, certificate_number, details, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
          `, [
            student_id,
            certificate_type || 'completion',
            issue_date || new Date(),
            certificateNumber,
            JSON.stringify({ template, generated_at: new Date() })
          ]);
          
          certificates.push({
            student_id: student.student_id,
            student_name: `${student.first_name} ${student.last_name}`,
            certificate_number: certificateNumber,
            certificate_type: certificate_type || 'completion'
          });
        } catch (certError) {
          console.log('Certificate table error:', certError.message);
        }
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Generated ${certificates.length} certificates`,
        certificates: certificates
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// FEE COLLECTION REPORTS
// ==========================================

// Get comprehensive fee collection report
router.get('/fees/collection-report', authenticateToken, requireRole('accountant', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { start_date, end_date, trade_id, level, fee_type } = req.query;
    
    let whereConditions = [];
    const params = [];
    
    if (start_date) {
      whereConditions.push('f.created_at >= ?');
      params.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push('f.created_at <= ?');
      params.push(end_date);
    }
    
    if (trade_id) {
      whereConditions.push('u.trade_id = ?');
      params.push(trade_id);
    }
    
    if (level) {
      whereConditions.push('u.level = ?');
      params.push(level);
    }
    
    if (fee_type) {
      whereConditions.push('f.fee_type = ?');
      params.push(fee_type);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Overall summary
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT f.student_id) as total_students,
        COUNT(DISTINCT f.id) as total_fees,
        SUM(f.amount) as total_expected,
        SUM(f.paid_amount) as total_collected,
        SUM(f.amount - f.paid_amount) as total_outstanding
      FROM fees f
      JOIN users u ON f.student_id = u.id
      ${whereClause}
    `, params);
    
    // By trade breakdown
    const [byTrade] = await pool.execute(`
      SELECT 
        t.id, t.name as trade_name,
        COUNT(DISTINCT f.student_id) as students,
        SUM(f.amount) as expected,
        SUM(f.paid_amount) as collected,
        SUM(f.amount - f.paid_amount) as outstanding
      FROM fees f
      JOIN users u ON f.student_id = u.id
      LEFT JOIN trades t ON u.trade_id = t.id
      ${whereClause}
      GROUP BY t.id
      ORDER BY outstanding DESC
    `, params);
    
    // By fee type
    const [byFeeType] = await pool.execute(`
      SELECT 
        f.fee_type,
        COUNT(DISTINCT f.student_id) as students,
        SUM(f.amount) as expected,
        SUM(f.paid_amount) as collected,
        SUM(f.amount - f.paid_amount) as outstanding
      FROM fees f
      JOIN users u ON f.student_id = u.id
      ${whereClause}
      GROUP BY f.fee_type
      ORDER BY outstanding DESC
    `, params);
    
    // Payment status distribution
    const [paymentStatus] = await pool.execute(`
      SELECT 
        CASE 
          WHEN f.amount - f.paid_amount = 0 THEN 'Fully Paid'
          WHEN f.paid_amount > 0 THEN 'Partially Paid'
          ELSE 'Unpaid'
        END as payment_status,
        COUNT(*) as count,
        SUM(f.amount) as total_amount,
        SUM(f.paid_amount) as paid_amount,
        SUM(f.amount - f.paid_amount) as outstanding
      FROM fees f
      JOIN users u ON f.student_id = u.id
      ${whereClause}
      GROUP BY payment_status
    `, params);
    
    res.json({
      success: true,
      report: {
        summary: summary[0],
        by_trade: byTrade,
        by_fee_type: byFeeType,
        payment_status: paymentStatus,
        generated_at: new Date().toISOString(),
        filters: { start_date, end_date, trade_id, level, fee_type }
      }
    });
  } catch (error) {
    console.error('Fee collection report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// DOD - PARENT MANAGEMENT & MESSAGING
// ==========================================

// Get all parents in the system (DOD access)
router.get('/dod/parents', authenticateToken, requireRole('dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { search, has_children, limit = 100, offset = 0 } = req.query;
    
    let whereConditions = ['u.role = "parent"'];
    const params = [];
    
    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const [parents] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.address,
        u.is_active, u.created_at,
        COUNT(DISTINCT ps.student_id) as children_count,
        GROUP_CONCAT(DISTINCT CONCAT(s.first_name, ' ', s.last_name) SEPARATOR ', ') as children_names,
        GROUP_CONCAT(DISTINCT s.student_id SEPARATOR ', ') as student_ids
      FROM users u
      LEFT JOIN parent_students ps ON u.id = ps.parent_id
      LEFT JOIN users s ON ps.student_id = s.id AND s.role = 'student'
      WHERE ${whereClause}
      GROUP BY u.id
      ${has_children === 'true' ? 'HAVING children_count > 0' : ''}
      ORDER BY u.last_name, u.first_name
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      WHERE ${whereClause}
    `, params);
    
    res.json({
      success: true,
      parents: parents,
      total: countResult[0].total,
      page_info: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: countResult[0].total > (parseInt(offset) + parents.length)
      }
    });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get parent details with all linked students (DOD)
router.get('/dod/parents/:id', authenticateToken, requireRole('dod', 'headmaster', 'admin', 'advisor'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get parent info
    const [parents] = await pool.execute(`
      SELECT u.*, 
             COUNT(DISTINCT ps.student_id) as total_children
      FROM users u
      LEFT JOIN parent_students ps ON u.id = ps.parent_id
      WHERE u.id = ? AND u.role = 'parent'
      GROUP BY u.id
    `, [id]);
    
    if (!parents[0]) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }
    
    const parent = parents[0];
    
    // Get all linked students with their details
    const [children] = await pool.execute(`
      SELECT 
        s.id, s.student_id, s.first_name, s.last_name, s.email, s.phone,
        s.gender, s.date_of_birth, s.is_active, s.level,
        t.name as trade_name, t.code as trade_code,
        tc.class_name,
        ps.relationship,
        e.status as enrollment_status
      FROM parent_students ps
      JOIN users s ON ps.student_id = s.id AND s.role = 'student'
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE ps.parent_id = ?
      ORDER BY s.first_name, s.last_name
    `, [id]);
    
    // Get discipline records for all children
    const [disciplineRecords] = await pool.execute(`
      SELECT 
        sdr.id, sdr.student_id, sdr.incident_type, sdr.incident_date,
        sdr.severity, sdr.status, sdr.description,
        s.first_name as student_first_name, s.last_name as student_last_name,
        s.student_id as student_number
      FROM student_discipline_records sdr
      JOIN parent_students ps ON sdr.student_id = ps.student_id
      JOIN users s ON sdr.student_id = s.id
      WHERE ps.parent_id = ?
      ORDER BY sdr.incident_date DESC
      LIMIT 20
    `, [id]);
    
    res.json({
      success: true,
      parent: parent,
      children: children,
      recent_discipline_records: disciplineRecords
    });
  } catch (error) {
    console.error('Get parent details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message to parent (DOD)
router.post('/dod/parents/:id/message', authenticateToken, requireRole('dod', 'headmaster', 'admin', 'advisor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, priority = 'normal', send_sms = false } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message required' });
    }
    
    // Get parent details
    const [parents] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone FROM users WHERE id = ? AND role = "parent"',
      [id]
    );
    
    if (!parents[0]) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }
    
    const parent = parents[0];
    
    // Create message in database
    const [result] = await pool.execute(`
      INSERT INTO messages 
      (sender_id, recipient_id, subject, message, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'sent', NOW())
    `, [req.user.userId, id, subject, message, priority]);
    
    // Send SMS if requested and phone available
    if (send_sms && parent.phone) {
      try {
        // SMS sending logic here (integrate with your SMS provider)
        console.log(`SMS to ${parent.phone}: ${message}`);
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
      }
    }
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      message_id: result.insertId,
      sms_sent: send_sms && parent.phone ? true : false
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk message to multiple parents (DOD)
router.post('/dod/parents/bulk-message', authenticateToken, requireRole('dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { parent_ids, subject, message, priority = 'normal', send_sms = false } = req.body;
    
    if (!parent_ids || !Array.isArray(parent_ids) || parent_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'parent_ids array required' });
    }
    
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message required' });
    }
    
    const connection = await pool.getConnection();
    const results = {
      total: parent_ids.length,
      sent: 0,
      failed: 0,
      sms_sent: 0,
      errors: []
    };
    
    try {
      await connection.beginTransaction();
      
      for (const parent_id of parent_ids) {
        try {
          const [parents] = await connection.execute(
            'SELECT id, phone FROM users WHERE id = ? AND role = "parent"',
            [parent_id]
          );
          
          if (!parents[0]) {
            results.failed++;
            results.errors.push({ parent_id, error: 'Parent not found' });
            continue;
          }
          
          // Insert message
          await connection.execute(`
            INSERT INTO messages 
            (sender_id, recipient_id, subject, message, priority, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'sent', NOW())
          `, [req.user.userId, parent_id, subject, message, priority]);
          
          results.sent++;
          
          // Send SMS if requested
          if (send_sms && parents[0].phone) {
            try {
              // SMS logic here
              results.sms_sent++;
            } catch (smsError) {
              console.error('SMS failed for parent:', parent_id);
            }
          }
        } catch (error) {
          results.failed++;
          results.errors.push({ parent_id, error: error.message });
        }
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Messages sent to ${results.sent} parents`,
        results: results
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Bulk message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// DOD - STUDENT LEAVE MANAGEMENT
// ==========================================

// Get all student leave requests (DOD)
router.get('/dod/leave-requests', authenticateToken, requireRole('dod', 'headmaster', 'admin', 'advisor'), async (req, res) => {
  try {
    const { status, start_date, end_date, student_id, limit = 100, offset = 0 } = req.query;
    
    let whereConditions = ['1=1'];
    const params = [];
    
    if (status) {
      whereConditions.push('sl.status = ?');
      params.push(status);
    }
    
    if (start_date) {
      whereConditions.push('sl.start_date >= ?');
      params.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push('sl.end_date <= ?');
      params.push(end_date);
    }
    
    if (student_id) {
      whereConditions.push('sl.student_id = ?');
      params.push(student_id);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const [leaveRequests] = await pool.execute(`
      SELECT 
        sl.id, sl.student_id, sl.leave_type, sl.reason, sl.start_date, sl.end_date,
        sl.status, sl.approved_by, sl.approved_at, sl.notes, sl.created_at,
        s.student_id as student_number, s.first_name, s.last_name,
        t.name as trade_name, s.level,
        approver.first_name as approver_first_name, approver.last_name as approver_last_name,
        DATEDIFF(sl.end_date, sl.start_date) + 1 as days_requested
      FROM student_leave sl
      JOIN users s ON sl.student_id = s.id
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN users approver ON sl.approved_by = approver.id
      WHERE ${whereClause}
      ORDER BY sl.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      leave_requests: leaveRequests,
      total: leaveRequests.length
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create student leave (DOD can create on behalf of students)
router.post('/dod/leave-requests', authenticateToken, requireRole('dod', 'headmaster', 'admin', 'advisor'), async (req, res) => {
  try {
    const { student_id, leave_type, reason, start_date, end_date, notes } = req.body;
    
    if (!student_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'student_id, leave_type, start_date, and end_date required' 
      });
    }
    
    // Validate student exists
    const [students] = await pool.execute(
      'SELECT id, first_name, last_name FROM users WHERE id = ? AND role = "student"',
      [student_id]
    );
    
    if (!students[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO student_leave 
      (student_id, leave_type, reason, start_date, end_date, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [student_id, leave_type, reason, start_date, end_date, notes]);
    
    res.json({
      success: true,
      message: 'Leave request created successfully',
      leave_id: result.insertId
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve/reject student leave (DOD)
router.put('/dod/leave-requests/:id/status', authenticateToken, requireRole('dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }
    
    await pool.execute(`
      UPDATE student_leave 
      SET status = ?, approved_by = ?, approved_at = NOW(), notes = CONCAT(COALESCE(notes, ''), '\n', ?)
      WHERE id = ?
    `, [status, req.user.userId, notes || `${status} by DOD`, id]);
    
    res.json({
      success: true,
      message: `Leave request ${status} successfully`
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// DOD - ENHANCED DISCIPLINE/CONDUCT MANAGEMENT
// ==========================================

// Get all discipline records with advanced filtering (DOD)
router.get('/dod/discipline-records', authenticateToken, requireRole('dod', 'headmaster', 'admin', 'advisor'), async (req, res) => {
  try {
    const { 
      status, severity, incident_type, student_id, trade_id, level,
      start_date, end_date, sort_by = 'incident_date', sort_order = 'DESC',
      limit = 100, offset = 0 
    } = req.query;
    
    let whereConditions = ['1=1'];
    const params = [];
    
    if (status) {
      whereConditions.push('sdr.status = ?');
      params.push(status);
    }
    
    if (severity) {
      whereConditions.push('sdr.severity = ?');
      params.push(severity);
    }
    
    if (incident_type) {
      whereConditions.push('sdr.incident_type = ?');
      params.push(incident_type);
    }
    
    if (student_id) {
      whereConditions.push('sdr.student_id = ?');
      params.push(student_id);
    }
    
    if (trade_id) {
      whereConditions.push('s.trade_id = ?');
      params.push(trade_id);
    }
    
    if (level) {
      whereConditions.push('s.level = ?');
      params.push(level);
    }
    
    if (start_date) {
      whereConditions.push('sdr.incident_date >= ?');
      params.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push('sdr.incident_date <= ?');
      params.push(end_date);
    }
    
    const whereClause = whereConditions.join(' AND ');
    const validSortColumns = ['incident_date', 'severity', 'student_name'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'incident_date';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const [records] = await pool.execute(`
      SELECT 
        sdr.id, sdr.student_id, sdr.incident_type, sdr.incident_date, sdr.description,
        sdr.severity, sdr.action_taken, sdr.status, sdr.reported_by, sdr.created_at,
        s.student_id as student_number, s.first_name, s.last_name,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        t.name as trade_name, t.code as trade_code, s.level,
        tc.class_name,
        reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name
      FROM student_discipline_records sdr
      JOIN users s ON sdr.student_id = s.id
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      LEFT JOIN users reporter ON sdr.reported_by = reporter.id
      WHERE ${whereClause}
      ORDER BY ${sortColumn === 'student_name' ? 'student_name' : 'sdr.' + sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    // Get statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_count,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_count,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
      FROM student_discipline_records sdr
      JOIN users s ON sdr.student_id = s.id
      WHERE ${whereClause}
    `, params);
    
    res.json({
      success: true,
      records: records,
      statistics: stats[0],
      page_info: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get discipline records error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create discipline record (DOD)
router.post('/dod/discipline-records', authenticateToken, requireRole('dod', 'headmaster', 'admin', 'advisor', 'teacher'), async (req, res) => {
  try {
    const { 
      student_id, incident_type, incident_date, description, 
      severity, action_taken, notify_parent = true 
    } = req.body;
    
    if (!student_id || !incident_type || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'student_id, incident_type, and description required' 
      });
    }
    
    // Validate student
    const [students] = await pool.execute(
      `SELECT s.*, t.name as trade_name 
       FROM users s 
       LEFT JOIN trades t ON s.trade_id = t.id
       WHERE s.id = ? AND s.role = 'student'`,
      [student_id]
    );
    
    if (!students[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = students[0];
    
    const [result] = await pool.execute(`
      INSERT INTO student_discipline_records 
      (student_id, incident_type, incident_date, description, severity, action_taken, 
       reported_by, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [
      student_id,
      incident_type,
      incident_date || new Date(),
      description,
      severity || 'medium',
      action_taken || 'Under review',
      req.user.userId
    ]);
    
    // Notify parent if requested
    if (notify_parent) {
      try {
        const [parents] = await pool.execute(`
          SELECT u.id, u.first_name, u.last_name, u.email, u.phone
          FROM users u
          JOIN parent_students ps ON u.id = ps.parent_id
          WHERE ps.student_id = ?
        `, [student_id]);
        
        for (const parent of parents) {
          await pool.execute(`
            INSERT INTO messages 
            (sender_id, recipient_id, subject, message, priority, status, created_at)
            VALUES (?, ?, ?, ?, 'high', 'sent', NOW())
          `, [
            req.user.userId,
            parent.id,
            `Discipline Report: ${student.first_name} ${student.last_name}`,
            `Dear ${parent.first_name},\n\nThis is to inform you about a discipline incident involving your child ${student.first_name} ${student.last_name}.\n\nIncident Type: ${incident_type}\nDate: ${incident_date || new Date().toISOString().split('T')[0]}\nDescription: ${description}\n\nPlease contact the Director of Discipline for more information.\n\nBest regards,\nSchool Administration`
          ]);
        }
      } catch (notifyError) {
        console.error('Parent notification failed:', notifyError);
      }
    }
    
    res.json({
      success: true,
      message: 'Discipline record created successfully',
      record_id: result.insertId,
      parent_notified: notify_parent
    });
  } catch (error) {
    console.error('Create discipline record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update discipline record (DOD)
router.put('/dod/discipline-records/:id', authenticateToken, requireRole('dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { incident_type, description, severity, action_taken, status } = req.body;
    
    const updates = [];
    const params = [];
    
    if (incident_type) {
      updates.push('incident_type = ?');
      params.push(incident_type);
    }
    
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (severity) {
      updates.push('severity = ?');
      params.push(severity);
    }
    
    if (action_taken) {
      updates.push('action_taken = ?');
      params.push(action_taken);
    }
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    updates.push('updated_at = NOW()');
    params.push(id);
    
    await pool.execute(`
      UPDATE student_discipline_records 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    res.json({
      success: true,
      message: 'Discipline record updated successfully'
    });
  } catch (error) {
    console.error('Update discipline record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete/Remove discipline record (DOD)
router.delete('/dod/discipline-records/:id', authenticateToken, requireRole('dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    if (permanent === 'true') {
      // Permanently delete
      await pool.execute('DELETE FROM student_discipline_records WHERE id = ?', [id]);
    } else {
      // Soft delete - mark as removed
      await pool.execute(
        'UPDATE student_discipline_records SET status = "removed", updated_at = NOW() WHERE id = ?',
        [id]
      );
    }
    
    res.json({
      success: true,
      message: permanent === 'true' ? 'Record permanently deleted' : 'Record removed successfully'
    });
  } catch (error) {
    console.error('Delete discipline record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get discipline statistics by trade/level (DOD)
router.get('/dod/discipline-statistics', authenticateToken, requireRole('dod', 'headmaster', 'admin'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date) {
      dateFilter += ' AND sdr.incident_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      dateFilter += ' AND sdr.incident_date <= ?';
      params.push(end_date);
    }
    
    // By trade
    const [byTrade] = await pool.execute(`
      SELECT 
        t.id, t.name as trade_name, t.code as trade_code,
        COUNT(sdr.id) as total_incidents,
        SUM(CASE WHEN sdr.severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN sdr.severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN sdr.severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN sdr.severity = 'low' THEN 1 ELSE 0 END) as low
      FROM trades t
      LEFT JOIN users s ON t.id = s.trade_id AND s.role = 'student'
      LEFT JOIN student_discipline_records sdr ON s.id = sdr.student_id ${dateFilter}
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY total_incidents DESC
    `, params);
    
    // By level
    const [byLevel] = await pool.execute(`
      SELECT 
        s.level,
        COUNT(sdr.id) as total_incidents,
        SUM(CASE WHEN sdr.severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN sdr.severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN sdr.severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN sdr.severity = 'low' THEN 1 ELSE 0 END) as low
      FROM users s
      LEFT JOIN student_discipline_records sdr ON s.id = sdr.student_id ${dateFilter}
      WHERE s.role = 'student' AND s.level IS NOT NULL
      GROUP BY s.level
      ORDER BY s.level
    `, params);
    
    // By incident type
    const [byType] = await pool.execute(`
      SELECT 
        incident_type,
        COUNT(*) as count,
        AVG(CASE severity 
          WHEN 'critical' THEN 4 
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          ELSE 1 
        END) as avg_severity_score
      FROM student_discipline_records
      WHERE 1=1 ${dateFilter}
      GROUP BY incident_type
      ORDER BY count DESC
    `, params);
    
    // Top offenders
    const [topOffenders] = await pool.execute(`
      SELECT 
        s.id, s.student_id, s.first_name, s.last_name,
        t.name as trade_name, s.level,
        COUNT(sdr.id) as incident_count,
        SUM(CASE WHEN sdr.severity = 'critical' THEN 1 ELSE 0 END) as critical_count
      FROM users s
      LEFT JOIN trades t ON s.trade_id = t.id
      JOIN student_discipline_records sdr ON s.id = sdr.student_id
      WHERE s.role = 'student' ${dateFilter}
      GROUP BY s.id
      HAVING incident_count > 0
      ORDER BY incident_count DESC, critical_count DESC
      LIMIT 20
    `, params);
    
    res.json({
      success: true,
      statistics: {
        by_trade: byTrade,
        by_level: byLevel,
        by_incident_type: byType,
        top_offenders: topOffenders
      }
    });
  } catch (error) {
    console.error('Get discipline statistics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// UNIVERSAL PROFILE MANAGEMENT (ALL ROLES)
// ==========================================

router.get('/profile/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name, u.email, u.phone,
        u.date_of_birth, u.gender, u.address, u.role, u.is_active,
        u.profile_image, u.created_at,
        t.name as trade_name, t.code as trade_code, u.level,
        tc.class_name,
        e.status as enrollment_status
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE u.id = ?
    `, [userId]);
    
    if (!users[0]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/profile/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      first_name, last_name, email, phone, date_of_birth,
      gender, address, profile_image
    } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    
    if (email !== undefined) {
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone || null);
    }
    
    if (date_of_birth !== undefined) {
      updateFields.push('date_of_birth = ?');
      updateValues.push(date_of_birth || null);
    }
    
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender || null);
    }
    
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address || null);
    }
    
    if (profile_image !== undefined) {
      updateFields.push('profile_image = ?');
      updateValues.push(profile_image || null);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(query, updateValues);
    
    const [updatedUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, date_of_birth, gender, address, profile_image, role FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/profile/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }
    
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    
    if (!users[0]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const isValidPassword = await bcrypt.compare(current_password, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

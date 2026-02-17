// DOS Dashboard Ultra Advanced API Routes - Full Functionality
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== DASHBOARD STATS ====================

router.get('/dashboard/stats', authenticateToken, requireRole(['dos', 'director_study', 'admin', 'headmaster']), async (req, res) => {
  try {
    // Get total students
    const [studentsResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM users WHERE role = 'student' AND status = 'active'
    `);

    // Get total teachers
    const [teachersResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM users WHERE role = 'teacher' AND status = 'active'
    `);

    // Get active timetables
    const [timetablesResult] = await pool.execute(`
      SELECT COUNT(DISTINCT class_id) as total FROM timetables WHERE status = 'active'
    `);

    // Get reports generated this term
    const currentYear = new Date().getFullYear();
    const [reportsResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM report_cards WHERE academic_year = ?
    `, [currentYear]);

    // Get average GPA
    const [gpaResult] = await pool.execute(`
      SELECT AVG(gpa) as avg_gpa FROM global_student_sheets WHERE status = 'active'
    `);

    // Get average attendance
    const [attendanceResult] = await pool.execute(`
      SELECT AVG(attendance_percentage) as avg_attendance FROM global_student_sheets WHERE status = 'active'
    `);

    // Get active classes
    const [classesResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM trade_classes WHERE status = 'active'
    `);

    // Get pending exams
    const [examsResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM exams WHERE status = 'scheduled' AND exam_date >= CURDATE()
    `);

    res.json({
      success: true,
      stats: {
        totalStudents: studentsResult[0].total,
        totalTeachers: teachersResult[0].total,
        activeTimetables: timetablesResult[0].total,
        reportsGenerated: reportsResult[0].total,
        avgGpa: parseFloat(gpaResult[0].avg_gpa || 0),
        attendanceRate: parseFloat(attendanceResult[0].avg_attendance || 0),
        activeClasses: classesResult[0].total,
        pendingExams: examsResult[0].total
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== STUDENTS MANAGEMENT ====================

router.get('/students', authenticateToken, requireRole(['dos', 'director_study', 'admin', 'headmaster', 'teacher']), async (req, res) => {
  try {
    const { search, trade_code, level_number, status = 'active', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT 
        u.id, u.username as student_code, u.first_name, u.last_name, u.email, u.phone, u.status,
        gss.trade_code, gss.trade_name, gss.level_number, gss.level_suffix,
        gss.gpa, gss.attendance_percentage
      FROM users u
      LEFT JOIN global_student_sheets gss ON u.id = gss.student_id
      WHERE u.role = 'student'
    `;
    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.username LIKE ?)`;
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
    if (status) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY u.first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [students] = await pool.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(DISTINCT u.id) as total FROM users u LEFT JOIN global_student_sheets gss ON u.id = gss.student_id WHERE u.role = 'student'`;
    const countParams = [];
    if (search) { countQuery += ` AND (u.first_name LIKE ? OR u.last_name LIKE ?)`; countParams.push(`%${search}%`, `%${search}%`); }
    if (trade_code) { countQuery += ` AND gss.trade_code = ?`; countParams.push(trade_code); }
    if (level_number) { countQuery += ` AND gss.level_number = ?`; countParams.push(level_number); }

    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({ success: true, students, total, pagination: { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get Students Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/students/add', authenticateToken, requireRole(['dos', 'director_study', 'admin']), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, trade_code, level_number, level_suffix, guardian_name, guardian_phone } = req.body;

    // Generate student code
    const studentCode = `STU-${Date.now().toString(36).toUpperCase()}`;

    // Get the student role_id from roles table
    const [studentRole] = await pool.execute('SELECT id FROM roles WHERE name = "student"');
    if (studentRole.length === 0) {
      return res.status(500).json({ success: false, message: 'Student role not found in system' });
    }
    const studentRoleId = studentRole[0].id;

    // Insert user
    const [userResult] = await pool.execute(`
      INSERT INTO users (username, first_name, last_name, email, phone, role, role_id, password, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'student', ?, '$2b$10$placeholder', 'active', NOW())
    `, [studentCode, first_name, last_name, email, phone, studentRoleId]);

    const userId = userResult.insertId;

    // Create student profile
    await pool.execute(`
      INSERT INTO student_profiles (user_id, admission_number, date_of_birth, gender, enrollment_date)
      VALUES (?, ?, CURDATE(), 'unknown', CURDATE())
    `, [userId, studentCode]);

    // Create global student sheet
    await pool.execute(`
      INSERT INTO global_student_sheets (student_id, student_code, first_name, last_name, trade_code, level_number, level_suffix, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [userId, studentCode, first_name, last_name, trade_code, level_number, level_suffix || null]);

    // Create guardian record if provided
    if (guardian_name || guardian_phone) {
      const [guardianResult] = await pool.execute(`
        INSERT INTO guardians (student_id, name, phone, relationship, created_at)
        VALUES (?, ?, ?, 'parent', NOW())
      `, [userId, guardian_name, guardian_phone]);

      // Link guardian to student
      await pool.execute(`
        INSERT INTO parent_connections (student_id, parent_id, can_view_marks, can_view_attendance, can_view_report_cards, can_receive_sms, status, access_granted_at)
        VALUES (?, ?, 1, 1, 1, 1, 'active', NOW())
      `, [userId, guardianResult.insertId]);
    }

    res.json({ success: true, message: 'Student added successfully', student_id: userId, student_code: studentCode });
  } catch (error) {
    console.error('Add Student Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TEACHERS MANAGEMENT ====================

router.get('/teachers', authenticateToken, requireRole(['dos', 'director_study', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { search, specialization, status = 'active', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT
        u.id, u.username as teacher_code, u.first_name, u.last_name, u.email, u.phone, u.status,
        (SELECT COUNT(*) FROM teacher_class_assignments tca WHERE tca.teacher_id = u.id AND tca.status = 'active') as assigned_classes,
        (SELECT specialization FROM teacher_specializations WHERE teacher_id = u.id LIMIT 1) as specialization
      FROM users u
      WHERE u.role = 'teacher'
    `;
    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY u.first_name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [teachers] = await pool.execute(query, params);

    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Get Teachers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/teachers/add', authenticateToken, requireRole(['dos', 'director_study', 'admin']), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization } = req.body;

    const teacherCode = `TCH-${Date.now().toString(36).toUpperCase()}`;

    // Get the teacher role_id from roles table
    const [teacherRole] = await pool.execute('SELECT id FROM roles WHERE name = "teacher"');
    if (teacherRole.length === 0) {
      return res.status(500).json({ success: false, message: 'Teacher role not found in system' });
    }
    const teacherRoleId = teacherRole[0].id;

    const [userResult] = await pool.execute(`
      INSERT INTO users (username, first_name, last_name, email, phone, role, role_id, password, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'teacher', ?, '$2b$10$placeholder', 'active', NOW())
    `, [teacherCode, first_name, last_name, email, phone, teacherRoleId]);

    const userId = userResult.insertId;

    if (specialization) {
      await pool.execute(`
        INSERT INTO teacher_specializations (teacher_id, specialization, created_at)
        VALUES (?, ?, NOW())
      `, [userId, specialization]);
    }

    res.json({ success: true, message: 'Teacher added successfully', teacher_id: userId, teacher_code: teacherCode });
  } catch (error) {
    console.error('Add Teacher Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EXAMS MANAGEMENT ====================

router.get('/exams', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM exams WHERE 1=1`;
    const params = [];

    if (trade_code) { query += ` AND trade_code = ?`; params.push(trade_code); }
    if (level_number) { query += ` AND level_number = ?`; params.push(level_number); }
    if (status) { query += ` AND status = ?`; params.push(status); }

    query += ` ORDER BY exam_date, start_time LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [exams] = await pool.execute(query, params);

    res.json({ success: true, exams });
  } catch (error) {
    console.error('Get Exams Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/exams/schedule', authenticateToken, requireRole(['dos', 'director_study', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { exam_name, subject, trade_code, level_number, exam_date, start_time, duration, room } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO exams (exam_name, subject, trade_code, level_number, exam_date, start_time, duration, room, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())
    `, [exam_name, subject, trade_code, level_number, exam_date, start_time, duration || 120, room || 'Main Hall']);

    res.json({ success: true, message: 'Exam scheduled successfully', exam_id: result.insertId });
  } catch (error) {
    console.error('Schedule Exam Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TIMETABLES MANAGEMENT ====================

router.get('/timetables', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, day_of_week } = req.query;

    let query = `SELECT * FROM timetables WHERE 1=1`;
    const params = [];

    if (trade_code) { query += ` AND trade_code = ?`; params.push(trade_code); }
    if (level_number) { query += ` AND level_number = ?`; params.push(level_number); }
    if (day_of_week) { query += ` AND day_of_week = ?`; params.push(day_of_week); }

    query += ` ORDER BY day_of_week, period_number`;

    const [timetables] = await pool.execute(query, params);

    res.json({ success: true, timetables });
  } catch (error) {
    console.error('Get Timetables Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REPORT CARDS ====================

router.get('/report-cards', authenticateToken, async (req, res) => {
  try {
    const { student_id, trade_code, level_number, term, academic_year, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT rc.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM report_cards rc
      LEFT JOIN users u ON rc.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) { query += ` AND rc.student_id = ?`; params.push(student_id); }
    if (trade_code) { query += ` AND rc.trade_code = ?`; params.push(trade_code); }
    if (level_number) { query += ` AND rc.level_number = ?`; params.push(level_number); }
    if (term) { query += ` AND rc.term = ?`; params.push(term); }
    if (academic_year) { query += ` AND rc.academic_year = ?`; params.push(academic_year); }
    if (status) { query += ` AND rc.status = ?`; params.push(status); }

    query += ` ORDER BY rc.generated_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [reports] = await pool.execute(query, params);

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get Report Cards Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/report-cards/:id/publish', authenticateToken, requireRole(['dos', 'director_study', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(`
      UPDATE report_cards SET status = 'published', published_at = NOW() WHERE id = ?
    `, [id]);

    res.json({ success: true, message: 'Report published successfully' });
  } catch (error) {
    console.error('Publish Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SMS NOTIFICATIONS ====================

router.get('/sms/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT * FROM sms_notifications ORDER BY sent_at DESC LIMIT 50
    `);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get SMS Notifications Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sms/send', authenticateToken, requireRole(['dos', 'director_study', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { recipient_type, message, trade_code, level_number } = req.body;

    // Get recipients based on type
    let recipientsQuery = `SELECT phone FROM users WHERE status = 'active' AND phone IS NOT NULL`;
    const params = [];

    if (recipient_type === 'students') {
      recipientsQuery = `SELECT DISTINCT phone FROM users WHERE role = 'student' AND status = 'active' AND phone IS NOT NULL`;
    } else if (recipient_type === 'parents') {
      recipientsQuery = `SELECT DISTINCT p.phone FROM parent_connections pc JOIN users p ON pc.parent_id = p.id WHERE pc.status = 'active' AND p.phone IS NOT NULL`;
    } else if (recipient_type === 'teachers') {
      recipientsQuery = `SELECT DISTINCT phone FROM users WHERE role = 'teacher' AND status = 'active' AND phone IS NOT NULL`;
    }

    const [recipients] = await pool.execute(recipientsQuery, params);

    // Create notification record
    const [notificationResult] = await pool.execute(`
      INSERT INTO sms_notifications (recipient_type, recipient_count, message, status, sent_at)
      VALUES (?, ?, ?, 'sent', NOW())
    `, [recipient_type, recipients.length, message]);

    // In production, integrate with SMS gateway here (e.g., Twilio, Africastalking)
    // For demo, we'll simulate sending

    res.json({
      success: true,
      message: `SMS sent to ${recipients.length} recipients`,
      notification_id: notificationResult.insertId,
      recipients: recipients.length
    });
  } catch (error) {
    console.error('Send SMS Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ANALYTICS ====================

router.get('/analytics/performance', authenticateToken, async (req, res) => {
  try {
    const { academic_year } = req.query || new Date().getFullYear();

    const [tradePerformance] = await pool.execute(`
      SELECT 
        trade_code,
        trade_name,
        COUNT(*) as student_count,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code, trade_name
      ORDER BY avg_gpa DESC
    `);

    const [levelPerformance] = await pool.execute(`
      SELECT 
        level_number,
        COUNT(*) as student_count,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY level_number
      ORDER BY level_number
    `);

    res.json({
      success: true,
      analytics: { trade_performance: tradePerformance, level_performance: levelPerformance }
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

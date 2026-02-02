const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * ULTRA-COMPREHENSIVE ADMIN/HEADMASTER PORTAL
 * Complete school management, staff oversight, analytics dashboard
 * System configuration, reports, strategic insights
 */

// ============================================
// ADMIN DASHBOARD - Comprehensive Overview
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const [studentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN status = 'graduated' THEN 1 END) as graduated,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
        COUNT(CASE WHEN status = 'expelled' THEN 1 END) as expelled,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance
      FROM global_student_sheets
    `);
    
    const [staffStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_staff,
        COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
        COUNT(CASE WHEN role = 'accountant' THEN 1 END) as accountants,
        COUNT(CASE WHEN role = 'stock_manager' THEN 1 END) as stock_managers,
        COUNT(CASE WHEN role = 'advisor' THEN 1 END) as advisors,
        COUNT(CASE WHEN role = 'dos' THEN 1 END) as dos_staff,
        COUNT(CASE WHEN role = 'dod' THEN 1 END) as dod_staff,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff
      FROM users
      WHERE role IN ('teacher', 'accountant', 'stock_manager', 'advisor', 'dos', 'dod', 'admin', 'patron', 'matron')
    `);
    
    const [financialStats] = await pool.execute(`
      SELECT 
        SUM(total_fees) as expected_revenue,
        SUM(paid_amount) as collected_revenue,
        SUM(balance) as outstanding_balance,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as fully_paid,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid
      FROM global_student_sheets
    `);
    
    const [todayStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT ar.student_id) as present_today,
        COUNT(DISTINCT pr.id) as payments_today,
        SUM(pr.amount) as revenue_today,
        COUNT(DISTINCT dr.id) as incidents_today
      FROM student_attendance_records ar
      LEFT JOIN student_payment_records pr ON DATE(pr.payment_date) = CURDATE()
      LEFT JOIN student_discipline_records dr ON DATE(dr.incident_date) = CURDATE()
      WHERE DATE(ar.attendance_date) = CURDATE() AND ar.status = 'present'
    `);
    
    const [tradeDistribution] = await pool.execute(`
      SELECT 
        trade_name,
        trade_code,
        COUNT(*) as student_count,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_name, trade_code
      ORDER BY student_count DESC
    `);
    
    const [levelDistribution] = await pool.execute(`
      SELECT 
        level_number,
        COUNT(*) as student_count,
        AVG(gpa) as avg_gpa
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY level_number
      ORDER BY level_number
    `);
    
    const [recentActivities] = await pool.execute(`
      SELECT 'student_enrolled' as activity_type, created_at as activity_time, 
        CONCAT(first_name, ' ', last_name) as details
      FROM global_student_sheets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'payment_received', payment_date, CONCAT('Payment of ', amount, ' RWF')
      FROM student_payment_records
      WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY activity_time DESC
      LIMIT 20
    `);
    
    const [classStats] = await pool.execute(`
      SELECT 
        class_name,
        COUNT(*) as student_count,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance
      FROM global_student_sheets
      WHERE status = 'active' AND class_name IS NOT NULL
      GROUP BY class_name
      ORDER BY class_name
    `);
    
    res.json({
      success: true,
      dashboard: {
        students: studentStats[0],
        staff: staffStats[0],
        financial: financialStats[0],
        today: todayStats[0],
        trade_distribution: tradeDistribution,
        level_distribution: levelDistribution,
        class_stats: classStats,
        recent_activities: recentActivities
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT MANAGEMENT
// ============================================
router.get('/students/overview', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { trade_code, level_number, status, search, payment_status } = req.query;
    
    let query = 'SELECT * FROM global_student_sheets WHERE 1=1';
    const params = [];
    
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND level_number = ?'; params.push(level_number); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (payment_status) { query += ' AND payment_status = ?'; params.push(payment_status); }
    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ? OR student_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    console.error('Students Overview Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/students/enroll', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { student_code, first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year, admission_date, guardian_info } = req.body;
    
    const student_id = `STU${Date.now()}`;
    
    const [result] = await pool.execute(`
      INSERT INTO global_student_sheets 
      (student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year, admission_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year, admission_date]);
    
    if (guardian_info) {
      await pool.execute(`
        INSERT INTO student_parents 
        (student_id, relationship, first_name, last_name, phone, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [student_id, guardian_info.relationship, guardian_info.first_name, guardian_info.last_name, guardian_info.phone, guardian_info.email]);
    }
    
    res.json({ success: true, message: 'Student enrolled successfully', student_id, sheet_id: result.insertId });
  } catch (error) {
    console.error('Student Enrollment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/students/:studentId/status', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    await pool.execute(`
      UPDATE global_student_sheets 
      SET status = ?, status_change_reason = ?, status_changed_at = NOW()
      WHERE student_id = ?
    `, [status, reason, req.params.studentId]);
    
    res.json({ success: true, message: 'Student status updated successfully' });
  } catch (error) {
    console.error('Update Student Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STAFF MANAGEMENT
// ============================================
router.get('/staff/overview', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let query = `
      SELECT id, username, email, first_name, last_name, role, phone, status, created_at, last_login
      FROM users 
      WHERE role IN ('teacher', 'accountant', 'stock_manager', 'advisor', 'dos', 'dod', 'admin', 'patron', 'matron')
    `;
    const params = [];
    
    if (role) { query += ' AND role = ?'; params.push(role); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    
    query += ' ORDER BY role, last_name';
    
    const [staff] = await pool.execute(query, params);
    
    res.json({ success: true, staff, total: staff.length });
  } catch (error) {
    console.error('Staff Overview Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/staff/create', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const { username, email, password, first_name, last_name, role, phone, department } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(`
      INSERT INTO users 
      (username, email, password, first_name, last_name, role, phone, department, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [username, email, hashedPassword, first_name, last_name, role, phone, department]);
    
    res.json({ success: true, message: 'Staff member created successfully', user_id: result.insertId });
  } catch (error) {
    console.error('Create Staff Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/staff/:userId/status', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { status } = req.body;
    
    await pool.execute(`
      UPDATE users 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `, [status, req.params.userId]);
    
    res.json({ success: true, message: 'Staff status updated successfully' });
  } catch (error) {
    console.error('Update Staff Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FINANCIAL OVERSIGHT
// ============================================
router.get('/finance/comprehensive-report', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const { start_date, end_date, trade_code } = req.query;
    
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(total_fees) as expected_revenue,
        SUM(paid_amount) as collected_revenue,
        SUM(balance) as outstanding_balance,
        AVG((paid_amount / total_fees) * 100) as avg_collection_rate
      FROM global_student_sheets
      WHERE status = 'active'
      ${trade_code ? 'AND trade_code = ?' : ''}
    `, trade_code ? [trade_code] : []);
    
    const [paymentTrends] = await pool.execute(`
      SELECT 
        DATE(payment_date) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as daily_revenue
      FROM student_payment_records
      WHERE status = 'confirmed'
        ${start_date && end_date ? 'AND payment_date BETWEEN ? AND ?' : ''}
      GROUP BY DATE(payment_date)
      ORDER BY date DESC
      LIMIT 30
    `, start_date && end_date ? [start_date, end_date] : []);
    
    const [byTrade] = await pool.execute(`
      SELECT 
        trade_name,
        COUNT(*) as student_count,
        SUM(total_fees) as expected,
        SUM(paid_amount) as collected,
        SUM(balance) as outstanding,
        ROUND((SUM(paid_amount) / SUM(total_fees)) * 100, 2) as collection_rate
      FROM global_student_sheets
      WHERE status = 'active' AND total_fees > 0
      GROUP BY trade_name
      ORDER BY expected DESC
    `);
    
    res.json({
      success: true,
      financial_report: {
        summary: summary[0],
        payment_trends: paymentTrends,
        by_trade: byTrade
      }
    });
  } catch (error) {
    console.error('Financial Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ACADEMIC OVERSIGHT
// ============================================
router.get('/academics/performance-report', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron', 'dos']), async (req, res) => {
  try {
    const { trade_code, academic_year, term } = req.query;
    
    let query = `
      SELECT 
        trade_name,
        COUNT(DISTINCT student_id) as student_count,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as honors_students,
        COUNT(CASE WHEN gpa < 2.0 THEN 1 END) as at_risk_students
      FROM global_student_sheets
      WHERE status = 'active'
    `;
    const params = [];
    
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    
    query += ' GROUP BY trade_name ORDER BY avg_gpa DESC';
    
    const [performance] = await pool.execute(query, params);
    
    const [gradeDistribution] = await pool.execute(`
      SELECT 
        overall_grade,
        COUNT(*) as count
      FROM global_student_sheets
      WHERE status = 'active' AND overall_grade IS NOT NULL
      GROUP BY overall_grade
      ORDER BY FIELD(overall_grade, 'A', 'B', 'C', 'D', 'F')
    `);
    
    const [attendanceTrends] = await pool.execute(`
      SELECT 
        CASE 
          WHEN attendance_percentage >= 95 THEN 'Excellent (95-100%)'
          WHEN attendance_percentage >= 90 THEN 'Good (90-94%)'
          WHEN attendance_percentage >= 80 THEN 'Fair (80-89%)'
          WHEN attendance_percentage >= 70 THEN 'Poor (70-79%)'
          ELSE 'Critical (<70%)'
        END as attendance_category,
        COUNT(*) as student_count
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY attendance_category
    `);
    
    res.json({
      success: true,
      academic_report: {
        by_trade: performance,
        grade_distribution: gradeDistribution,
        attendance_trends: attendanceTrends
      }
    });
  } catch (error) {
    console.error('Academic Performance Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DISCIPLINE OVERSIGHT
// ============================================
router.get('/discipline/overview', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron', 'dod']), async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low,
        COUNT(DISTINCT student_id) as students_with_incidents
      FROM student_discipline_records
      WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [byCategory] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(CASE severity 
          WHEN 'critical' THEN 4
          WHEN 'high' THEN 3
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 1
        END) as avg_severity
      FROM student_discipline_records
      WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY category
      ORDER BY count DESC
    `);
    
    const [recentIncidents] = await pool.execute(`
      SELECT dr.*, 
        gs.first_name, gs.last_name, gs.student_code, gs.class_name, gs.trade_name
      FROM student_discipline_records dr
      JOIN global_student_sheets gs ON dr.student_id = gs.student_id
      ORDER BY dr.incident_date DESC
      LIMIT 20
    `);
    
    res.json({
      success: true,
      discipline_overview: {
        summary: summary[0],
        by_category: byCategory,
        recent_incidents: recentIncidents
      }
    });
  } catch (error) {
    console.error('Discipline Overview Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SYSTEM REPORTS & ANALYTICS
// ============================================
router.get('/reports/comprehensive-analytics', authenticateToken, requireRole(['admin', 'headmaster', 'patron', 'matron']), async (req, res) => {
  try {
    const [enrollmentTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(admission_date, '%Y-%m') as month,
        COUNT(*) as enrollments
      FROM global_student_sheets
      WHERE admission_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(admission_date, '%Y-%m')
      ORDER BY month DESC
    `);
    
    const [retentionRate] = await pool.execute(`
      SELECT 
        academic_year,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'graduated' THEN 1 END) as graduated,
        COUNT(CASE WHEN status IN ('suspended', 'expelled', 'withdrawn') THEN 1 END) as dropped
      FROM global_student_sheets
      GROUP BY academic_year
      ORDER BY academic_year DESC
    `);
    
    const [staffProductivity] = await pool.execute(`
      SELECT 
        u.first_name, u.last_name, u.role,
        COUNT(DISTINCT CASE WHEN ar.marked_by = u.id THEN ar.id END) as attendance_records,
        COUNT(DISTINCT CASE WHEN sp.teacher_id = u.id THEN sp.id END) as grades_recorded,
        COUNT(DISTINCT CASE WHEN a.teacher_id = u.id THEN a.id END) as assignments_created
      FROM users u
      LEFT JOIN student_attendance_records ar ON ar.marked_by = u.id 
        AND ar.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      LEFT JOIN student_subject_performance sp ON sp.teacher_id = u.id 
        AND sp.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      LEFT JOIN assignments a ON a.teacher_id = u.id 
        AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      WHERE u.role IN ('teacher', 'patron', 'matron')
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY (attendance_records + grades_recorded + assignments_created) DESC
    `);
    
    res.json({
      success: true,
      analytics: {
        enrollment_trends: enrollmentTrends,
        retention_rate: retentionRate,
        staff_productivity: staffProductivity
      }
    });
  } catch (error) {
    console.error('Comprehensive Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SYSTEM CONFIGURATION
// ============================================
router.get('/settings', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT * FROM system_settings ORDER BY category, setting_key
    `);
    
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});
    
    res.json({ success: true, settings: grouped });
  } catch (error) {
    console.error('Settings Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings/:settingId', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { value } = req.body;
    
    await pool.execute(`
      UPDATE system_settings 
      SET setting_value = ?, updated_at = NOW(), updated_by = ?
      WHERE id = ?
    `, [value, req.user.userId, req.params.settingId]);
    
    res.json({ success: true, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update Setting Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT ENROLLMENT TO GLOBAL SHEETS
// ============================================
router.post('/students/enroll', authenticateToken, requireRole(['headmaster', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year, student_code, admission_date, guardian_name, guardian_phone, guardian_email } = req.body;
    
    const [existingStudent] = await pool.execute(
      'SELECT id FROM global_student_sheets WHERE student_code = ? OR (first_name = ? AND last_name = ? AND date_of_birth = ?)',
      [student_code, first_name, last_name, date_of_birth]
    );
    
    if (existingStudent[0]) {
      return res.status(400).json({ success: false, message: 'Student already exists in the system' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO global_student_sheets 
      (student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
       trade_code, trade_name, level_number, level_suffix, class_name, academic_year, 
       status, admission_date, created_by, created_by_name, created_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `, [student_code, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
        trade_code, trade_name, level_number, level_suffix, class_name, academic_year, 
        admission_date || new Date(), req.user.userId, req.user.name, req.user.role]);
    
    if (guardian_phone || guardian_email) {
      await pool.execute(`
        INSERT INTO student_parents 
        (student_sheet_id, student_id, parent_name, phone, email, relationship, is_primary)
        VALUES (?, ?, ?, ?, ?, 'guardian', true)
      `, [result.insertId, student_code, guardian_name, guardian_phone, guardian_email]);
    }
    
    await pool.execute(`
      INSERT INTO student_conduct_tracking 
      (sheet_id, student_id, conduct_score, conduct_grade)
      VALUES (?, ?, 100, 'A')
    `, [result.insertId, student_code]);
    
    await pool.execute(`
      INSERT INTO system_activity_log 
      (user_id, user_name, action, details, created_at)
      VALUES (?, ?, 'student_enrolled', ?, NOW())
    `, [req.user.userId, req.user.name, JSON.stringify({
      student_code: student_code,
      name: `${first_name} ${last_name}`,
      trade: trade_name,
      level: level_number
    })]);
    
    res.json({
      success: true,
      message: 'Student enrolled successfully',
      student_id: result.insertId,
      student_code: student_code
    });
  } catch (error) {
    console.error('Student Enrollment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/students/bulk-enroll', authenticateToken, requireRole(['headmaster', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { students } = req.body;
    
    const results = {
      enrolled: 0,
      failed: 0,
      details: []
    };
    
    for (const student of students) {
      const { first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year, student_code } = student;
      
      try {
        const [existing] = await pool.execute(
          'SELECT id FROM global_student_sheets WHERE student_code = ?',
          [student_code]
        );
        
        if (existing[0]) {
          results.failed++;
          results.details.push({
            student_code: student_code,
            name: `${first_name} ${last_name}`,
            status: 'failed',
            reason: 'Student code already exists'
          });
          continue;
        }
        
        const [result] = await pool.execute(`
          INSERT INTO global_student_sheets 
          (student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
           trade_code, trade_name, level_number, level_suffix, class_name, academic_year, 
           status, created_by, created_by_name, created_by_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
        `, [student_code, student_code, first_name, last_name, email, phone, gender, date_of_birth, 
            trade_code, trade_name, level_number, level_suffix, class_name, academic_year, 
            req.user.userId, req.user.name, req.user.role]);
        
        await pool.execute(`
          INSERT INTO student_conduct_tracking 
          (sheet_id, student_id, conduct_score, conduct_grade)
          VALUES (?, ?, 100, 'A')
        `, [result.insertId, student_code]);
        
        results.enrolled++;
        results.details.push({
          student_code: student_code,
          name: `${first_name} ${last_name}`,
          status: 'enrolled',
          id: result.insertId
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          student_code: student_code,
          name: `${first_name} ${last_name}`,
          status: 'failed',
          reason: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `${results.enrolled} students enrolled, ${results.failed} failed`,
      results
    });
  } catch (error) {
    console.error('Bulk Student Enrollment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADVANCED PREDICTIVE ANALYTICS
// ============================================
router.get('/analytics/predictive-insights', authenticateToken, requireRole(['headmaster', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const [atRiskStudents] = await pool.execute(`
      SELECT 
        gs.student_code,
        CONCAT(gs.first_name, ' ', gs.last_name) as name,
        gs.trade_name,
        gs.level_number,
        gs.gpa,
        gs.attendance_percentage,
        gs.conduct_score,
        COUNT(dr.id) as recent_incidents,
        CASE 
          WHEN gs.gpa < 2.0 AND gs.attendance_percentage < 80 THEN 'Critical Risk'
          WHEN gs.gpa < 2.5 OR gs.attendance_percentage < 85 THEN 'High Risk'
          WHEN gs.gpa < 3.0 OR gs.attendance_percentage < 90 THEN 'Moderate Risk'
          ELSE 'Low Risk'
        END as risk_level,
        CASE 
          WHEN gs.gpa < 2.0 THEN 'Poor Academic Performance'
          WHEN gs.attendance_percentage < 80 THEN 'Poor Attendance'
          WHEN gs.conduct_score < 70 THEN 'Behavioral Issues'
          ELSE 'Multiple Factors'
        END as primary_concern
      FROM global_student_sheets gs
      LEFT JOIN student_discipline_records dr 
        ON gs.student_id = dr.student_id 
        AND dr.incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      WHERE gs.status = 'active' 
        AND (gs.gpa < 3.0 OR gs.attendance_percentage < 90 OR gs.conduct_score < 80)
      GROUP BY gs.student_id
      ORDER BY 
        CASE 
          WHEN gs.gpa < 2.0 AND gs.attendance_percentage < 80 THEN 1
          WHEN gs.gpa < 2.5 OR gs.attendance_percentage < 85 THEN 2
          ELSE 3
        END,
        gs.gpa ASC
      LIMIT 50
    `);
    
    const [graduationPrediction] = await pool.execute(`
      SELECT 
        trade_code,
        trade_name,
        level_number,
        COUNT(*) as total_students,
        COUNT(CASE WHEN gpa >= 2.0 AND attendance_percentage >= 80 THEN 1 END) as likely_to_graduate,
        COUNT(CASE WHEN gpa < 2.0 OR attendance_percentage < 80 THEN 1 END) as at_risk,
        ROUND((COUNT(CASE WHEN gpa >= 2.0 AND attendance_percentage >= 80 THEN 1 END) / COUNT(*)) * 100, 2) as graduation_probability
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code, trade_name, level_number
      ORDER BY graduation_probability ASC
    `);
    
    const [performanceTrends] = await pool.execute(`
      SELECT 
        academic_year,
        term,
        AVG(percentage) as avg_percentage,
        AVG(grade_points) as avg_gpa,
        COUNT(DISTINCT student_id) as student_count
      FROM student_subject_performance
      GROUP BY academic_year, term
      ORDER BY academic_year DESC, term DESC
      LIMIT 6
    `);
    
    res.json({
      success: true,
      predictive_insights: {
        at_risk_students: atRiskStudents,
        graduation_predictions: graduationPrediction,
        performance_trends: performanceTrends,
        summary: {
          total_at_risk: atRiskStudents.length,
          critical_risk: atRiskStudents.filter(s => s.risk_level === 'Critical Risk').length,
          high_risk: atRiskStudents.filter(s => s.risk_level === 'High Risk').length
        }
      }
    });
  } catch (error) {
    console.error('Predictive Insights Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics/school-performance-matrix', authenticateToken, requireRole(['headmaster', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const [overall] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT student_id) as total_students,
        AVG(gpa) as school_avg_gpa,
        AVG(attendance_percentage) as school_avg_attendance,
        AVG(conduct_score) as school_avg_conduct,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as honors_students,
        COUNT(CASE WHEN gpa < 2.0 THEN 1 END) as struggling_students
      FROM global_student_sheets
      WHERE status = 'active'
    `);
    
    const [byTrade] = await pool.execute(`
      SELECT 
        trade_code,
        trade_name,
        COUNT(*) as enrollment,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as top_performers,
        RANK() OVER (ORDER BY AVG(gpa) DESC) as performance_rank
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code, trade_name
      ORDER BY avg_gpa DESC
    `);
    
    const [byLevel] = await pool.execute(`
      SELECT 
        level_number,
        COUNT(*) as enrollment,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        AVG(conduct_score) as avg_conduct
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY level_number
      ORDER BY level_number
    `);
    
    const [teacherEffectiveness] = await pool.execute(`
      SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        COUNT(DISTINCT tca.class_id) as classes_taught,
        AVG(gs.gpa) as avg_student_gpa,
        AVG(gs.attendance_percentage) as avg_student_attendance,
        COUNT(DISTINCT a.id) as assignments_created
      FROM users u
      LEFT JOIN dos_teacher_class_assignments tca ON u.id = tca.teacher_id AND tca.is_active = TRUE
      LEFT JOIN global_student_sheets gs ON gs.trade_code = tca.trade_code AND gs.level_number = tca.level_number
      LEFT JOIN assignments a ON u.id = a.teacher_id
      WHERE u.role = 'teacher' AND u.status = 'active'
      GROUP BY u.id
      HAVING classes_taught > 0
      ORDER BY avg_student_gpa DESC
      LIMIT 20
    `);
    
    res.json({
      success: true,
      performance_matrix: {
        school_overview: overall[0],
        by_trade: byTrade,
        by_level: byLevel,
        teacher_effectiveness: teacherEffectiveness
      }
    });
  } catch (error) {
    console.error('Performance Matrix Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics/real-time-insights', authenticateToken, requireRole(['headmaster', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const [todayStats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(DISTINCT student_id) FROM student_attendance_records 
         WHERE attendance_date = CURDATE() AND status = 'present') as present_today,
        (SELECT COUNT(*) FROM global_student_sheets WHERE status = 'active') as total_students,
        (SELECT COUNT(*) FROM student_discipline_records 
         WHERE DATE(incident_date) = CURDATE()) as incidents_today,
        (SELECT SUM(amount) FROM student_payment_records 
         WHERE DATE(payment_date) = CURDATE() AND status = 'confirmed') as revenue_today
    `);
    
    const attendanceRate = todayStats[0].total_students > 0 
      ? ((todayStats[0].present_today / todayStats[0].total_students) * 100).toFixed(2)
      : 0;
    
    const [recentPayments] = await pool.execute(`
      SELECT 
        pr.student_id,
        CONCAT(gs.first_name, ' ', gs.last_name) as student_name,
        pr.amount,
        pr.payment_method,
        pr.payment_date
      FROM student_payment_records pr
      JOIN global_student_sheets gs ON pr.student_id = gs.student_id
      WHERE pr.payment_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY pr.payment_date DESC
      LIMIT 10
    `);
    
    const [upcomingEvents] = await pool.execute(`
      SELECT * FROM exams 
      WHERE exam_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY exam_date, start_time
      LIMIT 10
    `);
    
    res.json({
      success: true,
      real_time_insights: {
        today: {
          ...todayStats[0],
          attendance_rate: attendanceRate
        },
        recent_payments: recentPayments,
        upcoming_events: upcomingEvents,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Real-Time Insights Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// COMPREHENSIVE STUDENT MANAGEMENT
// ============================================
router.get('/students/advanced-search', authenticateToken, requireRole(['headmaster', 'admin', 'patron', 'matron']), async (req, res) => {
  try {
    const { 
      search_term, 
      trade_code, 
      level_number, 
      status, 
      gpa_min, 
      gpa_max, 
      attendance_min,
      payment_status,
      risk_level,
      sort_by = 'student_code',
      order = 'ASC',
      limit = 50,
      offset = 0
    } = req.query;
    
    let query = `
      SELECT 
        gs.*,
        COUNT(DISTINCT dr.id) as total_incidents,
        (SELECT COUNT(*) FROM student_subject_performance 
         WHERE student_id = gs.student_id) as subjects_enrolled,
        CASE 
          WHEN gs.gpa < 2.0 AND gs.attendance_percentage < 80 THEN 'Critical'
          WHEN gs.gpa < 2.5 OR gs.attendance_percentage < 85 THEN 'High'
          WHEN gs.gpa < 3.0 OR gs.attendance_percentage < 90 THEN 'Moderate'
          ELSE 'Low'
        END as calculated_risk_level
      FROM global_student_sheets gs
      LEFT JOIN student_discipline_records dr ON gs.student_id = dr.student_id
      WHERE 1=1
    `;
    const params = [];
    
    if (search_term) {
      query += ` AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_code LIKE ? OR gs.email LIKE ?)`;
      const term = `%${search_term}%`;
      params.push(term, term, term, term);
    }
    
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    if (status) { query += ' AND gs.status = ?'; params.push(status); }
    if (gpa_min) { query += ' AND gs.gpa >= ?'; params.push(gpa_min); }
    if (gpa_max) { query += ' AND gs.gpa <= ?'; params.push(gpa_max); }
    if (attendance_min) { query += ' AND gs.attendance_percentage >= ?'; params.push(attendance_min); }
    if (payment_status) { query += ' AND gs.payment_status = ?'; params.push(payment_status); }
    
    query += ' GROUP BY gs.id';
    
    if (risk_level) {
      query += ` HAVING calculated_risk_level = ?`;
      params.push(risk_level);
    }
    
    query += ` ORDER BY ${sort_by} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [students] = await pool.execute(query, params);
    
    let countQuery = `
      SELECT COUNT(DISTINCT gs.id) as total
      FROM global_student_sheets gs
      WHERE 1=1
    `;
    const countParams = [];
    
    if (search_term) {
      countQuery += ` AND (gs.first_name LIKE ? OR gs.last_name LIKE ? OR gs.student_code LIKE ? OR gs.email LIKE ?)`;
      const term = `%${search_term}%`;
      countParams.push(term, term, term, term);
    }
    if (trade_code) { countQuery += ' AND gs.trade_code = ?'; countParams.push(trade_code); }
    if (level_number) { countQuery += ' AND gs.level_number = ?'; countParams.push(level_number); }
    if (status) { countQuery += ' AND gs.status = ?'; countParams.push(status); }
    if (gpa_min) { countQuery += ' AND gs.gpa >= ?'; countParams.push(gpa_min); }
    if (gpa_max) { countQuery += ' AND gs.gpa <= ?'; countParams.push(gpa_max); }
    if (attendance_min) { countQuery += ' AND gs.attendance_percentage >= ?'; countParams.push(attendance_min); }
    if (payment_status) { countQuery += ' AND gs.payment_status = ?'; countParams.push(payment_status); }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      students,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + students.length) < countResult[0].total
      }
    });
  } catch (error) {
    console.error('Advanced Student Search Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students/:studentId/comprehensive-profile', authenticateToken, requireRole(['headmaster', 'admin', 'patron', 'matron', 'dos', 'dod']), async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ? OR id = ?
    `, [req.params.studentId, req.params.studentId]);
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const studentId = student[0].student_id;
    
    const [academic] = await pool.execute(`
      SELECT * FROM student_subject_performance 
      WHERE student_id = ?
      ORDER BY academic_year DESC, term DESC
    `, [studentId]);
    
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
      FROM student_attendance_records
      WHERE student_id = ?
    `, [studentId]);
    
    const [discipline] = await pool.execute(`
      SELECT * FROM student_discipline_records
      WHERE student_id = ?
      ORDER BY incident_date DESC
      LIMIT 10
    `, [studentId]);
    
    const [payments] = await pool.execute(`
      SELECT * FROM student_payment_records
      WHERE student_id = ?
      ORDER BY payment_date DESC
      LIMIT 10
    `, [studentId]);
    
    const [parents] = await pool.execute(`
      SELECT * FROM student_parents
      WHERE student_id = ? OR student_sheet_id = ?
    `, [studentId, student[0].id]);
    
    const [assignments] = await pool.execute(`
      SELECT 
        a.title,
        a.due_date,
        sub.status,
        sub.marks_obtained,
        a.total_marks
      FROM assignment_submissions sub
      JOIN assignments a ON sub.assignment_id = a.id
      WHERE sub.student_id = ?
      ORDER BY a.due_date DESC
      LIMIT 10
    `, [studentId]);
    
    res.json({
      success: true,
      comprehensive_profile: {
        personal: student[0],
        academic_performance: academic,
        attendance_summary: attendance[0],
        discipline_records: discipline,
        payment_history: payments,
        parent_contacts: parents,
        recent_assignments: assignments
      }
    });
  } catch (error) {
    console.error('Comprehensive Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendUniversalMessage, sendBulkSMS } = require('../services/smsService');
const { emitToParent, emitToStudent, emitToStaff } = require('../services/socketService');

/**
 * COMPREHENSIVE PATRON & MATRON PORTAL
 * Full access to all staff functionalities:
 * - Accountant features (payments, fees, financial reports)
 * - Teacher features (grades, attendance, assignments)
 * - Admin/Headmaster features (school management, staff oversight)
 * - Stock Manager features (inventory, supplies, orders)
 * - Advisor features (student counseling, guidance)
 * - DOS features (curriculum, academic planning)
 * - DOD features (discipline, behavior tracking)
 */

// ============================================
// DASHBOARD - Comprehensive Overview
// ============================================
router.get('/dashboard', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as total FROM global_student_sheets WHERE status = "active"');
    const [staff] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role IN ("teacher", "admin", "accountant", "stock_manager", "advisor", "dos", "dod")');
    const [pendingPayments] = await pool.execute('SELECT COUNT(*) as total, SUM(balance) as total_balance FROM global_student_sheets WHERE payment_status != "paid"');
    const [todayAttendance] = await pool.execute('SELECT COUNT(DISTINCT student_id) as present FROM student_attendance_records WHERE attendance_date = CURDATE() AND status = "present"');
    const [recentIncidents] = await pool.execute('SELECT COUNT(*) as total FROM student_discipline_records WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
    const [lowStock] = await pool.execute('SELECT COUNT(*) as total FROM stock_items WHERE quantity <= reorder_level');
    const [assignments] = await pool.execute('SELECT COUNT(*) as total FROM assignments WHERE status = "active" AND due_date >= CURDATE()');
    
    const [financialSummary] = await pool.execute(`
      SELECT 
        SUM(total_fees) as total_expected,
        SUM(paid_amount) as total_collected,
        SUM(balance) as total_outstanding
      FROM global_student_sheets
    `);
    
    const [academicPerformance] = await pool.execute(`
      SELECT 
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as honors_students
      FROM global_student_sheets WHERE status = "active"
    `);
    
    res.json({
      success: true,
      dashboard: {
        students: {
          total: students[0].total,
          present_today: todayAttendance[0].present,
          attendance_rate: ((todayAttendance[0].present / students[0].total) * 100).toFixed(2)
        },
        staff: {
          total: staff[0].total
        },
        finance: {
          expected: financialSummary[0].total_expected || 0,
          collected: financialSummary[0].total_collected || 0,
          outstanding: financialSummary[0].total_outstanding || 0,
          collection_rate: ((financialSummary[0].total_collected / financialSummary[0].total_expected) * 100).toFixed(2),
          pending_students: pendingPayments[0].total
        },
        academics: {
          average_gpa: parseFloat(academicPerformance[0].avg_gpa || 0).toFixed(2),
          average_attendance: parseFloat(academicPerformance[0].avg_attendance || 0).toFixed(2),
          honors_students: academicPerformance[0].honors_students || 0,
          active_assignments: assignments[0].total
        },
        discipline: {
          recent_incidents: recentIncidents[0].total
        },
        stock: {
          low_stock_items: lowStock[0].total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STUDENT MANAGEMENT (Global Access)
// ============================================
router.get('/students', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const { trade_code, level_number, status, search } = req.query;
    let query = 'SELECT * FROM global_student_sheets WHERE 1=1';
    const params = [];
    
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND level_number = ?'; params.push(level_number); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (search) { 
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ? OR student_code LIKE ?)'; 
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY trade_code, level_number, last_name, first_name';
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students/:studentId/complete-profile', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const [student] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id = ?', [req.params.studentId]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [subjects] = await pool.execute('SELECT * FROM student_subject_performance WHERE student_id = ? ORDER BY term DESC, subject_name', [req.params.studentId]);
    const [attendance] = await pool.execute('SELECT * FROM student_attendance_summary WHERE student_id = ? ORDER BY year DESC, month DESC', [req.params.studentId]);
    const [discipline] = await pool.execute('SELECT * FROM student_discipline_records WHERE student_id = ? ORDER BY incident_date DESC', [req.params.studentId]);
    const [payments] = await pool.execute('SELECT * FROM student_payment_records WHERE student_id = ? ORDER BY payment_date DESC', [req.params.studentId]);
    const [conduct] = await pool.execute('SELECT * FROM student_conduct_tracking WHERE student_id = ?', [req.params.studentId]);
    const [parents] = await pool.execute('SELECT * FROM student_parents WHERE student_id = ? AND relationship IN ("father", "mother", "guardian")', [req.params.studentId]);
    
    res.json({
      success: true,
      student: student[0],
      academic: {
        subjects: subjects,
        overall_gpa: student[0].gpa,
        overall_grade: student[0].overall_grade
      },
      attendance: {
        summary: attendance,
        overall: {
          total_days: student[0].total_days,
          present: student[0].days_present,
          absent: student[0].days_absent,
          rate: student[0].attendance_percentage
        }
      },
      discipline: {
        records: discipline,
        conduct: conduct[0],
        score: student[0].conduct_score,
        grade: student[0].conduct_grade
      },
      finance: {
        payments: payments,
        total_fees: student[0].total_fees,
        paid: student[0].paid_amount,
        balance: student[0].balance,
        status: student[0].payment_status
      },
      family: parents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FINANCIAL MANAGEMENT (Accountant Features)
// ============================================
router.get('/finance/overview', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const { academic_year, term, trade_code } = req.query;
    let query = 'SELECT * FROM global_student_sheets WHERE 1=1';
    const params = [];
    
    if (academic_year) { query += ' AND academic_year = ?'; params.push(academic_year); }
    if (trade_code) { query += ' AND trade_code = ?'; params.push(trade_code); }
    
    const [students] = await pool.execute(query, params);
    
    const summary = {
      total_students: students.length,
      total_expected: students.reduce((sum, s) => sum + parseFloat(s.total_fees || 0), 0),
      total_collected: students.reduce((sum, s) => sum + parseFloat(s.paid_amount || 0), 0),
      total_outstanding: students.reduce((sum, s) => sum + parseFloat(s.balance || 0), 0),
      fully_paid: students.filter(s => s.payment_status === 'paid').length,
      partially_paid: students.filter(s => s.payment_status === 'partial').length,
      unpaid: students.filter(s => s.payment_status === 'unpaid').length,
      collection_rate: 0
    };
    
    summary.collection_rate = ((summary.total_collected / summary.total_expected) * 100).toFixed(2);
    
    const [recentPayments] = await pool.execute(`
      SELECT pr.*, gs.first_name, gs.last_name, gs.student_code
      FROM student_payment_records pr
      JOIN global_student_sheets gs ON pr.student_id = gs.student_id
      ORDER BY pr.payment_date DESC
      LIMIT 20
    `);
    
    res.json({ success: true, summary, recent_payments: recentPayments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/finance/record-payment', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const { student_id, amount, payment_method, payment_type, receipt_number, reference_number, term, academic_year, notes } = req.body;
    
    const [student] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [student_id]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    await pool.execute(`
      INSERT INTO student_payment_records 
      (sheet_id, student_id, payment_date, payment_type, amount, payment_method, receipt_number, reference_number, term, academic_year, notes, recorded_by, recorded_by_name, status)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `, [student[0].id, student_id, payment_type, amount, payment_method, receipt_number, reference_number, term, academic_year, notes, req.user.userId, req.user.name]);
    
    const [payments] = await pool.execute('SELECT SUM(amount) as total FROM student_payment_records WHERE student_id = ? AND status = "confirmed"', [student_id]);
    const totalPaid = payments[0].total || 0;
    
    const [fees] = await pool.execute('SELECT total_fees FROM global_student_sheets WHERE student_id = ?', [student_id]);
    const balance = (fees[0].total_fees || 0) - totalPaid;
    const paymentStatus = balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
    
    await pool.execute('UPDATE global_student_sheets SET paid_amount = ?, balance = ?, payment_status = ?, last_payment_date = CURDATE() WHERE student_id = ?',
      [totalPaid, balance, paymentStatus, student_id]);
    
    res.json({ success: true, message: 'Payment recorded successfully', total_paid: totalPaid, balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ACADEMIC MANAGEMENT (Teacher & DOS Features)
// ============================================
router.post('/academics/record-grade', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const { student_id, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, remarks } = req.body;
    
    const [student] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [student_id]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const total = parseFloat(quiz_marks || 0) + parseFloat(midterm_marks || 0) + parseFloat(final_marks || 0);
    const percentage = total;
    const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
    const points = percentage >= 90 ? 4.0 : percentage >= 80 ? 3.0 : percentage >= 70 ? 2.0 : percentage >= 60 ? 1.0 : 0.0;
    
    await pool.execute(`
      INSERT INTO student_subject_performance 
      (sheet_id, student_id, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, total_marks, percentage, grade, grade_points, teacher_id, teacher_name, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        quiz_marks = VALUES(quiz_marks), midterm_marks = VALUES(midterm_marks), final_marks = VALUES(final_marks),
        total_marks = VALUES(total_marks), percentage = VALUES(percentage), grade = VALUES(grade), grade_points = VALUES(grade_points),
        remarks = VALUES(remarks), updated_at = NOW()
    `, [student[0].id, student_id, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, total, percentage, grade, points, req.user.userId, req.user.name, remarks]);
    
    const [subjects] = await pool.execute('SELECT * FROM student_subject_performance WHERE student_id = ? AND term = ? AND academic_year = ?', [student_id, term, academic_year]);
    if (subjects.length > 0) {
      const avgGpa = subjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / subjects.length;
      const avgPercentage = subjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / subjects.length;
      const overallGrade = avgPercentage >= 90 ? 'A' : avgPercentage >= 80 ? 'B' : avgPercentage >= 70 ? 'C' : avgPercentage >= 60 ? 'D' : 'F';
      
      await pool.execute('UPDATE global_student_sheets SET total_subjects = ?, gpa = ?, overall_grade = ? WHERE student_id = ?',
        [subjects.length, avgGpa.toFixed(2), overallGrade, student_id]);
    }
    
    res.json({ success: true, message: 'Grade recorded successfully', grade, points });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/academics/mark-attendance', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const { student_id, attendance_date, status, subject, period, remarks } = req.body;
    
    const [student] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [student_id]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    await pool.execute(`
      INSERT INTO student_attendance_records 
      (sheet_id, student_id, attendance_date, status, subject, period, marked_by, marked_by_name, marked_by_role, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), marked_at = NOW()
    `, [student[0].id, student_id, attendance_date, status, subject, period, req.user.userId, req.user.name, req.user.role, remarks]);
    
    const date = new Date(attendance_date);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    const [att] = await pool.execute(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM student_attendance_records 
      WHERE student_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?
    `, [student_id, date.getMonth() + 1, year]);
    
    const rate = att[0].total > 0 ? (att[0].present / att[0].total) * 100 : 100;
    
    await pool.execute(`
      INSERT INTO student_attendance_summary 
      (sheet_id, student_id, month, year, total_days, present_days, absent_days, late_days, attendance_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        total_days = VALUES(total_days), present_days = VALUES(present_days), absent_days = VALUES(absent_days),
        late_days = VALUES(late_days), attendance_rate = VALUES(attendance_rate), updated_at = NOW()
    `, [student[0].id, student_id, month, year, att[0].total, att[0].present, att[0].absent, att[0].late, rate]);
    
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DISCIPLINE MANAGEMENT (DOD Features)
// ============================================
router.post('/discipline/record-incident', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const { student_id, incident_date, incident_type, severity, category, description, location, witnesses, action_taken, punishment, punishment_start, punishment_end } = req.body;
    
    const [student] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [student_id]);
    if (!student[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    await pool.execute(`
      INSERT INTO student_discipline_records 
      (sheet_id, student_id, incident_date, incident_type, severity, category, description, location, witnesses, action_taken, punishment, punishment_start, punishment_end, recorded_by, recorded_by_name, recorded_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student[0].id, student_id, incident_date, incident_type, severity, category, description, location, witnesses, action_taken, punishment, punishment_start, punishment_end, req.user.userId, req.user.name, req.user.role]);
    
    const [incidents] = await pool.execute(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM student_discipline_records 
      WHERE student_id = ? AND status = 'active'
    `, [student_id]);
    
    let conductScore = 100;
    conductScore -= (incidents[0].critical || 0) * 20;
    conductScore -= (incidents[0].high || 0) * 10;
    conductScore -= (incidents[0].medium || 0) * 5;
    conductScore -= (incidents[0].low || 0) * 2;
    conductScore = Math.max(0, conductScore);
    
    const conductGrade = conductScore >= 90 ? 'A' : conductScore >= 80 ? 'B' : conductScore >= 70 ? 'C' : conductScore >= 60 ? 'D' : 'F';
    
    await pool.execute('UPDATE global_student_sheets SET total_incidents = ?, conduct_score = ?, conduct_grade = ? WHERE student_id = ?',
      [incidents[0].total, conductScore, conductGrade, student_id]);
    
    res.json({ success: true, message: 'Incident recorded successfully', conduct_score: conductScore, conduct_grade: conductGrade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/discipline/overview', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM student_discipline_records 
      WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [recent] = await pool.execute(`
      SELECT dr.*, gs.first_name, gs.last_name, gs.student_code, gs.trade_name, gs.level_number
      FROM student_discipline_records dr
      JOIN global_student_sheets gs ON dr.student_id = gs.student_id
      ORDER BY dr.incident_date DESC
      LIMIT 20
    `);
    
    res.json({ success: true, summary: summary[0], recent_incidents: recent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STOCK MANAGEMENT (Stock Manager Features)
// ============================================
router.get('/stock/inventory', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const [items] = await pool.execute(`
      SELECT * FROM stock_items 
      ORDER BY category, item_name
    `);
    
    const [lowStock] = await pool.execute(`
      SELECT * FROM stock_items 
      WHERE quantity <= reorder_level
      ORDER BY quantity ASC
    `);
    
    const summary = {
      total_items: items.length,
      total_value: items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_price || 0)), 0),
      low_stock_items: lowStock.length,
      categories: [...new Set(items.map(item => item.category))]
    };
    
    res.json({ success: true, summary, inventory: items, low_stock: lowStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/stock/update-inventory', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const { item_id, quantity_change, transaction_type, notes, reference_number } = req.body;
    
    const [item] = await pool.execute('SELECT * FROM stock_items WHERE id = ?', [item_id]);
    if (!item[0]) return res.status(404).json({ success: false, message: 'Item not found' });
    
    const newQuantity = parseFloat(item[0].quantity) + parseFloat(quantity_change);
    
    await pool.execute('UPDATE stock_items SET quantity = ?, last_updated = NOW() WHERE id = ?', [newQuantity, item_id]);
    
    await pool.execute(`
      INSERT INTO stock_transactions 
      (item_id, transaction_type, quantity, previous_quantity, new_quantity, reference_number, notes, performed_by, performed_by_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item_id, transaction_type, quantity_change, item[0].quantity, newQuantity, reference_number, notes, req.user.userId, req.user.name]);
    
    res.json({ success: true, message: 'Inventory updated successfully', new_quantity: newQuantity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STAFF MANAGEMENT (Admin/Headmaster Features)
// ============================================
router.get('/staff/overview', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const [staff] = await pool.execute(`
      SELECT id, username, email, first_name, last_name, role, phone, status, created_at
      FROM users 
      WHERE role IN ('teacher', 'admin', 'accountant', 'stock_manager', 'advisor', 'dos', 'dod', 'patron', 'matron')
      ORDER BY role, last_name
    `);
    
    const summary = {
      total_staff: staff.length,
      by_role: {
        teachers: staff.filter(s => s.role === 'teacher').length,
        admin: staff.filter(s => s.role === 'admin').length,
        accountant: staff.filter(s => s.role === 'accountant').length,
        stock_manager: staff.filter(s => s.role === 'stock_manager').length,
        advisor: staff.filter(s => s.role === 'advisor').length,
        dos: staff.filter(s => s.role === 'dos').length,
        dod: staff.filter(s => s.role === 'dod').length,
        patron: staff.filter(s => s.role === 'patron').length,
        matron: staff.filter(s => s.role === 'matron').length
      }
    };
    
    res.json({ success: true, summary, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ANALYTICS & REPORTS
// ============================================
router.get('/analytics/comprehensive', authenticateToken, requireRole(['patron', 'matron']), async (req, res) => {
  try {
    const [academicStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        COUNT(CASE WHEN gpa >= 3.5 THEN 1 END) as honors_students,
        COUNT(CASE WHEN attendance_percentage < 75 THEN 1 END) as poor_attendance
      FROM global_student_sheets WHERE status = 'active'
    `);
    
    const [financialStats] = await pool.execute(`
      SELECT 
        SUM(total_fees) as total_expected,
        SUM(paid_amount) as total_collected,
        SUM(balance) as total_outstanding,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as fully_paid,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid
      FROM global_student_sheets
    `);
    
    const [disciplineStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_incidents,
        COUNT(DISTINCT student_id) as students_with_incidents
      FROM student_discipline_records 
      WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [tradeDistribution] = await pool.execute(`
      SELECT trade_code, trade_name, COUNT(*) as student_count
      FROM global_student_sheets 
      WHERE status = 'active'
      GROUP BY trade_code, trade_name
      ORDER BY student_count DESC
    `);
    
    res.json({
      success: true,
      analytics: {
        academic: academicStats[0],
        financial: financialStats[0],
        discipline: disciplineStats[0],
        trade_distribution: tradeDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DOD/MATRON/PATRON CONDUCT & PARENT MESSAGING
// ============================================
router.post('/conduct/remove-incident', authenticateToken, requireRole(['patron', 'matron', 'dod']), async (req, res) => {
  try {
    const { incident_id, reason, notify_parent } = req.body;
    
    const [incident] = await pool.execute(`
      SELECT dr.*, gs.first_name, gs.last_name, gs.student_code
      FROM student_discipline_records dr
      JOIN global_student_sheets gs ON dr.student_id = gs.student_id
      WHERE dr.id = ?
    `, [incident_id]);
    
    if (!incident[0]) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    
    await pool.execute(
      'UPDATE student_discipline_records SET status = ?, resolved_by = ?, resolved_at = NOW(), resolution_notes = ? WHERE id = ?',
      ['resolved', req.user.userId, reason, incident_id]
    );
    
    const [incidents] = await pool.execute(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM student_discipline_records 
      WHERE student_id = ? AND status = 'active'
    `, [incident[0].student_id]);
    
    let conductScore = 100;
    conductScore -= (incidents[0].critical || 0) * 20;
    conductScore -= (incidents[0].high || 0) * 10;
    conductScore -= (incidents[0].medium || 0) * 5;
    conductScore -= (incidents[0].low || 0) * 2;
    conductScore = Math.max(0, conductScore);
    
    const conductGrade = conductScore >= 90 ? 'A' : conductScore >= 80 ? 'B' : conductScore >= 70 ? 'C' : conductScore >= 60 ? 'D' : 'F';
    
    await pool.execute(
      'UPDATE global_student_sheets SET total_incidents = ?, conduct_score = ?, conduct_grade = ? WHERE student_id = ?',
      [incidents[0].total, conductScore, conductGrade, incident[0].student_id]
    );
    
    if (notify_parent) {
      const [parents] = await pool.execute(
        'SELECT phone, email FROM student_parents WHERE student_id = ? AND is_primary = true',
        [incident[0].student_id]
      );
      
      if (parents[0] && parents[0].phone) {
        const message = `Good news! A disciplinary incident for ${incident[0].first_name} ${incident[0].last_name} (${incident[0].student_code}) has been resolved. Their conduct score has improved to ${conductScore}/100 (${conductGrade}). Reason: ${reason}`;
        
        const smsResult = await sendUniversalMessage(
          parents[0].phone,
          message,
          req.user.userId,
          { type: 'conduct_update', student_id: incident[0].student_code }
        );
        
        const [student] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [incident[0].student_id]);
        await pool.execute(`
          INSERT INTO parent_notifications 
          (student_sheet_id, student_code, parent_phone, title, message, type, priority)
          VALUES (?, ?, ?, 'Conduct Improvement', ?, 'conduct', 'medium')
        `, [student[0].id, incident[0].student_code, parents[0].phone, message]);
        
        emitToParent(parents[0].phone, 'conduct_update', {
          student: `${incident[0].first_name} ${incident[0].last_name}`,
          student_code: incident[0].student_code,
          new_score: conductScore,
          new_grade: conductGrade,
          message: message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Incident resolved successfully',
      new_conduct: { score: conductScore, grade: conductGrade }
    });
  } catch (error) {
    console.error('Remove Incident Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/conduct/contact-parent', authenticateToken, requireRole(['patron', 'matron', 'dod']), async (req, res) => {
  try {
    const { student_id, message_text, priority, send_via } = req.body;
    
    const [student] = await pool.execute(
      'SELECT * FROM global_student_sheets WHERE student_id = ?',
      [student_id]
    );
    
    if (!student[0]) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const [parents] = await pool.execute(
      'SELECT phone, email, relationship FROM student_parents WHERE student_id = ? AND is_primary = true',
      [student_id]
    );
    
    if (!parents[0]) {
      return res.status(404).json({ success: false, message: 'No parent contact found' });
    }
    
    const results = { sms: null, notification: null, socket: null };
    
    if (send_via === 'sms' || send_via === 'both') {
      if (parents[0].phone) {
        const smsResult = await sendUniversalMessage(
          parents[0].phone,
          message_text,
          req.user.userId,
          { type: 'conduct_message', student_id: student[0].student_code }
        );
        results.sms = smsResult;
        
        emitToParent(parents[0].phone, 'new_message', {
          from: req.user.name,
          from_role: req.user.role,
          student: `${student[0].first_name} ${student[0].last_name}`,
          student_code: student[0].student_code,
          message: message_text,
          timestamp: new Date()
        });
        results.socket = true;
      }
    }
    
    await pool.execute(`
      INSERT INTO parent_communications 
      (student_sheet_id, student_code, parent_phone, parent_email, sender_id, sender_name, sender_role, message, communication_type, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'conduct', ?)
    `, [student[0].id, student[0].student_code, parents[0].phone, parents[0].email, req.user.userId, req.user.name, req.user.role, message_text, priority || 'medium']);
    
    await pool.execute(`
      INSERT INTO parent_notifications 
      (student_sheet_id, student_code, parent_phone, title, message, type, priority)
      VALUES (?, ?, ?, 'Message from ${req.user.role}', ?, 'message', ?)
    `, [student[0].id, student[0].student_code, parents[0].phone, message_text, priority || 'medium']);
    
    results.notification = true;
    
    res.json({
      success: true,
      message: 'Parent contacted successfully',
      results
    });
  } catch (error) {
    console.error('Contact Parent Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/conduct/bulk-parent-notification', authenticateToken, requireRole(['patron', 'matron', 'dod']), async (req, res) => {
  try {
    const { trade_code, level_number, severity_filter, message_template } = req.body;
    
    let query = `
      SELECT DISTINCT gs.*, sp.phone, sp.email
      FROM global_student_sheets gs
      LEFT JOIN student_parents sp ON gs.id = sp.student_sheet_id
      WHERE gs.total_incidents > 0 AND sp.is_primary = true
    `;
    const params = [];
    
    if (trade_code) { query += ' AND gs.trade_code = ?'; params.push(trade_code); }
    if (level_number) { query += ' AND gs.level_number = ?'; params.push(level_number); }
    if (severity_filter) {
      query += ` AND gs.student_id IN (
        SELECT student_id FROM student_discipline_records 
        WHERE severity = ? AND status = 'active'
      )`;
      params.push(severity_filter);
    }
    
    const [students] = await pool.execute(query, params);
    
    const results = {
      total: students.length,
      sent: 0,
      failed: 0,
      details: []
    };
    
    for (const student of students) {
      if (!student.phone) {
        results.failed++;
        continue;
      }
      
      const message = message_template
        .replace('{student_name}', `${student.first_name} ${student.last_name}`)
        .replace('{student_code}', student.student_code)
        .replace('{conduct_score}', student.conduct_score)
        .replace('{conduct_grade}', student.conduct_grade)
        .replace('{total_incidents}', student.total_incidents);
      
      const smsResult = await sendUniversalMessage(
        student.phone,
        message,
        req.user.userId,
        { type: 'bulk_conduct_notification', student_id: student.student_code }
      );
      
      if (smsResult.success) {
        results.sent++;
        
        await pool.execute(`
          INSERT INTO parent_notifications 
          (student_sheet_id, student_code, parent_phone, title, message, type, priority)
          VALUES (?, ?, ?, 'Conduct Update', ?, 'conduct', 'high')
        `, [student.id, student.student_code, student.phone, message]);
        
        emitToParent(student.phone, 'conduct_notification', {
          student: `${student.first_name} ${student.last_name}`,
          student_code: student.student_code,
          message: message
        });
      } else {
        results.failed++;
      }
      
      results.details.push({
        student_code: student.student_code,
        name: `${student.first_name} ${student.last_name}`,
        phone: student.phone,
        status: smsResult.success ? 'sent' : 'failed'
      });
    }
    
    res.json({
      success: true,
      message: `Bulk notifications sent to ${results.sent} parents`,
      results
    });
  } catch (error) {
    console.error('Bulk Parent Notification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

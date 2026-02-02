const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Helper: Calculate grade
const calcGrade = (p) => p >= 90 ? { grade: 'A', points: 4.0 } : p >= 80 ? { grade: 'B', points: 3.0 } : p >= 70 ? { grade: 'C', points: 2.0 } : p >= 60 ? { grade: 'D', points: 1.0 } : { grade: 'F', points: 0.0 };

// Helper: Calculate conduct
const calcConduct = (i) => {
  let s = 100 - (i.critical || 0) * 20 - (i.high || 0) * 10 - (i.medium || 0) * 5 - (i.low || 0) * 2;
  s = Math.max(0, s);
  return { score: s, grade: s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : s >= 60 ? 'D' : 'F', status: s >= 90 ? 'excellent' : s >= 75 ? 'good' : s >= 60 ? 'fair' : 'poor' };
};

// GET: All students (with filters) - Uses unified students table
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, status, academic_year } = req.query;
    let q = `SELECT s.*, s.student_id, s.username, s.first_name, s.last_name, s.trade_code, s.trade_name, s.level_number
             FROM global_student_sheets s
             WHERE 1=1`;
    const p = [];
    if (trade_code) { q += ' AND s.trade_code = ?'; p.push(trade_code); }
    if (level_number) { q += ' AND s.level_number = ?'; p.push(level_number); }
    if (status) { q += ' AND s.status = ?'; p.push(status); }
    if (academic_year) { q += ' AND s.academic_year = ?'; p.push(academic_year); }
    q += ' ORDER BY s.trade_code, s.level_number, s.last_name, s.first_name';
    const [students] = await pool.execute(q, p);
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: All students for embedded selector
router.get('/all-students', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT id, student_id, username, first_name, last_name, trade_code, trade_name, level_number, level_suffix, class_name, status
      FROM global_student_sheets 
      WHERE status = 'active'
      ORDER BY trade_code, level_number, last_name, first_name
    `);
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Single student sheet - Uses unified students table
router.get('/students/:studentId', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT s.*, t.name as trade_name, t.code as trade_code, l.level_number, l.name as level_name
      FROM students s
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN levels l ON s.level_id = l.id
      WHERE s.id = ?`, [req.params.studentId]);
    if (!students[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [customValues] = await pool.execute(`
      SELECT cv.*, cc.column_name, cc.column_type 
      FROM student_column_values cv 
      JOIN level_sheet_columns cc ON cv.column_id = cc.id 
      WHERE cv.student_id = ?`, [req.params.studentId]);
    
    res.json({ success: true, sheet: students[0], customValues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Create/Update student sheet
router.post('/students', authenticateToken, async (req, res) => {
  try {
    const { student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year } = req.body;
    
    const [existing] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [student_id]);
    
    if (existing[0]) {
      await pool.execute(`UPDATE global_student_sheets SET first_name=?, last_name=?, email=?, phone=?, gender=?, date_of_birth=?, trade_code=?, trade_name=?, level_number=?, level_suffix=?, class_name=?, academic_year=?, updated_at=NOW() WHERE student_id=?`,
        [first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year, student_id]);
      res.json({ success: true, message: 'Sheet updated', id: existing[0].id });
    } else {
      const [result] = await pool.execute(`INSERT INTO global_student_sheets (student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [student_id, student_code, first_name, last_name, email, phone, gender, date_of_birth, trade_code, trade_name, level_number, level_suffix, class_name, academic_year]);
      await pool.execute('INSERT INTO student_conduct_tracking (sheet_id, student_id) VALUES (?,?)', [result.insertId, student_id]);
      res.json({ success: true, message: 'Sheet created', id: result.insertId });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Add/Update marks
router.post('/students/:studentId/marks', authenticateToken, async (req, res) => {
  try {
    const { subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, remarks } = req.body;
    const [sheet] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [req.params.studentId]);
    if (!sheet[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const total = parseFloat(quiz_marks || 0) + parseFloat(midterm_marks || 0) + parseFloat(final_marks || 0);
    const percentage = total;
    const { grade, points } = calcGrade(percentage);
    
    await pool.execute(`INSERT INTO student_subject_performance (sheet_id, student_id, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, total_marks, percentage, grade, grade_points, teacher_id, teacher_name, remarks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE quiz_marks=VALUES(quiz_marks), midterm_marks=VALUES(midterm_marks), final_marks=VALUES(final_marks), total_marks=VALUES(total_marks), percentage=VALUES(percentage), grade=VALUES(grade), grade_points=VALUES(grade_points), remarks=VALUES(remarks), updated_at=NOW()`,
      [sheet[0].id, req.params.studentId, subject_code, subject_name, term, academic_year, quiz_marks, midterm_marks, final_marks, total, percentage, grade, points, req.user.userId, req.user.name, remarks]);
    
    // Recalculate
    const [subjects] = await pool.execute('SELECT * FROM student_subject_performance WHERE student_id = ? AND term = ? AND academic_year = ?', [req.params.studentId, term, academic_year]);
    if (subjects.length > 0) {
      const totalMarks = subjects.reduce((sum, s) => sum + parseFloat(s.total_marks), 0);
      const avgMarks = totalMarks / subjects.length;
      const avgPercentage = subjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / subjects.length;
      const gpa = subjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / subjects.length;
      const { grade: overallGrade } = calcGrade(avgPercentage);
      await pool.execute('UPDATE global_student_sheets SET total_subjects=?, total_marks=?, average_marks=?, overall_grade=?, gpa=?, updated_at=NOW() WHERE student_id=?',
        [subjects.length, totalMarks, avgMarks, overallGrade, gpa.toFixed(2), req.params.studentId]);
    }
    
    res.json({ success: true, message: 'Marks recorded', total, percentage, grade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Mark attendance
router.post('/students/:studentId/attendance', authenticateToken, async (req, res) => {
  try {
    const { attendance_date, status, subject, period, remarks } = req.body;
    const [sheet] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [req.params.studentId]);
    if (!sheet[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    await pool.execute(`INSERT INTO student_attendance_records (sheet_id, student_id, attendance_date, status, subject, period, marked_by, marked_by_name, marked_by_role, remarks) VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status), remarks=VALUES(remarks), marked_at=NOW()`,
      [sheet[0].id, req.params.studentId, attendance_date, status, subject, period, req.user.userId, req.user.name, req.user.role, remarks]);
    
    // Recalculate monthly
    const date = new Date(attendance_date);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    const [att] = await pool.execute(`SELECT COUNT(*) as total, SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present, SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) as absent, SUM(CASE WHEN status='late' THEN 1 ELSE 0 END) as late, SUM(CASE WHEN status='excused' THEN 1 ELSE 0 END) as excused, SUM(CASE WHEN status='sick' THEN 1 ELSE 0 END) as sick FROM student_attendance_records WHERE student_id=? AND MONTH(attendance_date)=? AND YEAR(attendance_date)=?`,
      [req.params.studentId, date.getMonth() + 1, year]);
    
    const rate = att[0].total > 0 ? (att[0].present / att[0].total) * 100 : 100;
    await pool.execute(`INSERT INTO student_attendance_summary (sheet_id, student_id, month, year, total_days, present_days, absent_days, late_days, excused_days, sick_days, attendance_rate) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE total_days=VALUES(total_days), present_days=VALUES(present_days), absent_days=VALUES(absent_days), late_days=VALUES(late_days), excused_days=VALUES(excused_days), sick_days=VALUES(sick_days), attendance_rate=VALUES(attendance_rate), updated_at=NOW()`,
      [sheet[0].id, req.params.studentId, month, year, att[0].total, att[0].present, att[0].absent, att[0].late, att[0].excused, att[0].sick, rate]);
    
    // Update global
    const [overall] = await pool.execute('SELECT SUM(total_days) as total, SUM(present_days) as present, SUM(absent_days) as absent, SUM(late_days) as late FROM student_attendance_summary WHERE student_id=?', [req.params.studentId]);
    const overallRate = overall[0].total > 0 ? (overall[0].present / overall[0].total) * 100 : 100;
    await pool.execute('UPDATE global_student_sheets SET total_days=?, days_present=?, days_absent=?, days_late=?, attendance_percentage=?, updated_at=NOW() WHERE student_id=?',
      [overall[0].total, overall[0].present, overall[0].absent, overall[0].late, overallRate, req.params.studentId]);
    
    res.json({ success: true, message: 'Attendance marked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Add discipline record
router.post('/students/:studentId/discipline', authenticateToken, async (req, res) => {
  try {
    const { incident_date, incident_type, severity, category, description, location, witnesses, action_taken, punishment, punishment_start, punishment_end } = req.body;
    const [sheet] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [req.params.studentId]);
    if (!sheet[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    await pool.execute(`INSERT INTO student_discipline_records (sheet_id, student_id, incident_date, incident_type, severity, category, description, location, witnesses, action_taken, punishment, punishment_start, punishment_end, recorded_by, recorded_by_name, recorded_by_role) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [sheet[0].id, req.params.studentId, incident_date, incident_type, severity, category, description, location, witnesses, action_taken, punishment, punishment_start, punishment_end, req.user.userId, req.user.name, req.user.role]);
    
    // Recalculate conduct
    const [inc] = await pool.execute(`SELECT COUNT(*) as total, SUM(CASE WHEN severity='critical' THEN 1 ELSE 0 END) as critical, SUM(CASE WHEN severity='high' THEN 1 ELSE 0 END) as high, SUM(CASE WHEN severity='medium' THEN 1 ELSE 0 END) as medium, SUM(CASE WHEN severity='low' THEN 1 ELSE 0 END) as low, MAX(incident_date) as last_date FROM student_discipline_records WHERE student_id=? AND status='active'`, [req.params.studentId]);
    
    const { score, grade, status: conductStatus } = calcConduct({ critical: inc[0].critical, high: inc[0].high, medium: inc[0].medium, low: inc[0].low });
    const deductions = 100 - score;
    
    await pool.execute(`INSERT INTO student_conduct_tracking (sheet_id, student_id, total_incidents, critical_incidents, high_incidents, medium_incidents, low_incidents, deductions, final_score, conduct_grade, conduct_status, last_incident_date, last_incident_type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE total_incidents=VALUES(total_incidents), critical_incidents=VALUES(critical_incidents), high_incidents=VALUES(high_incidents), medium_incidents=VALUES(medium_incidents), low_incidents=VALUES(low_incidents), deductions=VALUES(deductions), final_score=VALUES(final_score), conduct_grade=VALUES(conduct_grade), conduct_status=VALUES(conduct_status), last_incident_date=VALUES(last_incident_date), last_incident_type=VALUES(last_incident_type), updated_at=NOW()`,
      [sheet[0].id, req.params.studentId, inc[0].total, inc[0].critical, inc[0].high, inc[0].medium, inc[0].low, deductions, score, grade, conductStatus, inc[0].last_date, incident_type]);
    
    await pool.execute('UPDATE global_student_sheets SET total_incidents=?, critical_incidents=?, high_incidents=?, medium_incidents=?, low_incidents=?, conduct_score=?, conduct_grade=?, updated_at=NOW() WHERE student_id=?',
      [inc[0].total, inc[0].critical, inc[0].high, inc[0].medium, inc[0].low, score, grade, req.params.studentId]);
    
    res.json({ success: true, message: 'Discipline recorded', conduct_score: score, conduct_grade: grade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Add payment
router.post('/students/:studentId/payments', authenticateToken, async (req, res) => {
  try {
    const { payment_date, payment_type, amount, payment_method, receipt_number, reference_number, term, academic_year, description, notes } = req.body;
    const [sheet] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [req.params.studentId]);
    if (!sheet[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    await pool.execute(`INSERT INTO student_payment_records (sheet_id, student_id, payment_date, payment_type, amount, payment_method, receipt_number, reference_number, term, academic_year, description, notes, recorded_by, recorded_by_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [sheet[0].id, req.params.studentId, payment_date, payment_type, amount, payment_method, receipt_number, reference_number, term, academic_year, description, notes, req.user.userId, req.user.name]);
    
    // Recalculate totals
    const [payments] = await pool.execute('SELECT SUM(amount) as total_paid FROM student_payment_records WHERE student_id=? AND status="confirmed"', [req.params.studentId]);
    const totalPaid = payments[0].total_paid || 0;
    const [fees] = await pool.execute('SELECT total_fees FROM global_student_sheets WHERE student_id=?', [req.params.studentId]);
    const totalFees = fees[0]?.total_fees || 0;
    const balance = totalFees - totalPaid;
    const paymentStatus = balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
    
    await pool.execute('UPDATE global_student_sheets SET paid_amount=?, balance=?, payment_status=?, updated_at=NOW() WHERE student_id=?',
      [totalPaid, balance, paymentStatus, req.params.studentId]);
    
    res.json({ success: true, message: 'Payment recorded', total_paid: totalPaid, balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Create custom column (Role-based)
router.post('/custom-columns', authenticateToken, async (req, res) => {
  try {
    const { column_name, column_label, column_type, select_options, calculation_formula, visible_to_roles, editable_by_roles, scope, scope_value, display_order, is_required } = req.body;
    
    const [result] = await pool.execute(`INSERT INTO student_sheet_custom_columns (column_name, column_label, column_type, select_options, calculation_formula, created_by_role, visible_to_roles, editable_by_roles, scope, scope_value, display_order, is_required, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [column_name, column_label, column_type, JSON.stringify(select_options), calculation_formula, req.user.role, JSON.stringify(visible_to_roles), JSON.stringify(editable_by_roles), scope, scope_value, display_order, is_required, req.user.userId]);
    
    res.json({ success: true, message: 'Custom column created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Custom columns
router.get('/custom-columns', authenticateToken, async (req, res) => {
  try {
    const { scope, scope_value } = req.query;
    let q = 'SELECT * FROM student_sheet_custom_columns WHERE is_active=1';
    const p = [];
    if (scope) { q += ' AND scope=?'; p.push(scope); }
    if (scope_value) { q += ' AND scope_value=?'; p.push(scope_value); }
    q += ' ORDER BY display_order, created_at';
    const [columns] = await pool.execute(q, p);
    res.json({ success: true, columns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Set custom value
router.post('/students/:studentId/custom-values', authenticateToken, async (req, res) => {
  try {
    const { column_id, value_text, value_number, value_date, value_boolean } = req.body;
    const [sheet] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [req.params.studentId]);
    if (!sheet[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    await pool.execute(`INSERT INTO student_sheet_custom_values (sheet_id, student_id, column_id, value_text, value_number, value_date, value_boolean, updated_by, updated_by_role) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE value_text=VALUES(value_text), value_number=VALUES(value_number), value_date=VALUES(value_date), value_boolean=VALUES(value_boolean), updated_by=VALUES(updated_by), updated_by_role=VALUES(updated_by_role), updated_at=NOW()`,
      [sheet[0].id, req.params.studentId, column_id, value_text, value_number, value_date, value_boolean, req.user.userId, req.user.role]);
    
    res.json({ success: true, message: 'Custom value saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Custom values for student
router.get('/students/:studentId/custom-values', authenticateToken, async (req, res) => {
  try {
    const [values] = await pool.execute(`
      SELECT cv.*, cc.column_name, cc.column_label, cc.column_type
      FROM student_sheet_custom_values cv
      JOIN student_sheet_custom_columns cc ON cv.column_id = cc.id
      WHERE cv.student_id = ? AND cc.is_active = 1
      ORDER BY cc.display_order
    `, [req.params.studentId]);
    res.json({ success: true, custom_values: values });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Update custom column
router.put('/custom-columns/:columnId', authenticateToken, async (req, res) => {
  try {
    const { column_label, column_type, select_options, visible_to_roles, editable_by_roles, display_order, is_required, is_active } = req.body;
    
    await pool.execute(`
      UPDATE student_sheet_custom_columns 
      SET column_label=?, column_type=?, select_options=?, visible_to_roles=?, editable_by_roles=?, display_order=?, is_required=?, is_active=?, updated_at=NOW()
      WHERE id=?
    `, [column_label, column_type, JSON.stringify(select_options), JSON.stringify(visible_to_roles), JSON.stringify(editable_by_roles), display_order, is_required, is_active, req.params.columnId]);
    
    res.json({ success: true, message: 'Custom column updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Remove custom column
router.delete('/custom-columns/:columnId', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE student_sheet_custom_columns SET is_active=0, updated_at=NOW() WHERE id=?', [req.params.columnId]);
    res.json({ success: true, message: 'Custom column deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Bulk update custom values for multiple students
router.post('/custom-values/bulk-update', authenticateToken, async (req, res) => {
  try {
    const { column_id, student_ids, value_text, value_number, value_date, value_boolean } = req.body;
    
    const results = { updated: 0, failed: 0 };
    
    for (const studentId of student_ids) {
      try {
        const [sheet] = await pool.execute('SELECT id FROM global_student_sheets WHERE student_id = ?', [studentId]);
        if (sheet[0]) {
          await pool.execute(`
            INSERT INTO student_sheet_custom_values 
            (sheet_id, student_id, column_id, value_text, value_number, value_date, value_boolean, updated_by, updated_by_role) 
            VALUES (?,?,?,?,?,?,?,?,?) 
            ON DUPLICATE KEY UPDATE value_text=VALUES(value_text), value_number=VALUES(value_number), value_date=VALUES(value_date), value_boolean=VALUES(value_boolean), updated_by=VALUES(updated_by), updated_by_role=VALUES(updated_by_role), updated_at=NOW()
          `, [sheet[0].id, studentId, column_id, value_text, value_number, value_date, value_boolean, req.user.userId, req.user.role]);
          results.updated++;
        }
      } catch (error) {
        results.failed++;
      }
    }
    
    res.json({ success: true, message: `${results.updated} students updated`, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Reorder custom columns
router.post('/custom-columns/reorder', authenticateToken, async (req, res) => {
  try {
    const { column_orders } = req.body;
    
    for (const order of column_orders) {
      await pool.execute('UPDATE student_sheet_custom_columns SET display_order=? WHERE id=?', [order.display_order, order.column_id]);
    }
    
    res.json({ success: true, message: 'Columns reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Generate term report
router.post('/students/:studentId/generate-report', authenticateToken, async (req, res) => {
  try {
    const { term, academic_year, class_teacher_comment, dos_comment, principal_comment } = req.body;
    const [sheet] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id = ?', [req.params.studentId]);
    if (!sheet[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [subjects] = await pool.execute('SELECT COUNT(*) as count, SUM(total_marks) as total, AVG(percentage) as avg, AVG(grade_points) as gpa FROM student_subject_performance WHERE student_id=? AND term=? AND academic_year=?', [req.params.studentId, term, academic_year]);
    const [attendance] = await pool.execute('SELECT AVG(attendance_rate) as rate, SUM(present_days) as present, SUM(absent_days) as absent, SUM(late_days) as late FROM student_attendance_summary WHERE student_id=?', [req.params.studentId]);
    const [conduct] = await pool.execute('SELECT final_score, conduct_grade FROM student_conduct_tracking WHERE student_id=?', [req.params.studentId]);
    
    const { grade } = calcGrade(subjects[0].avg || 0);
    
    await pool.execute(`INSERT INTO student_term_reports (sheet_id, student_id, term, academic_year, total_subjects, total_marks, average_marks, gpa, overall_grade, attendance_rate, days_present, days_absent, days_late, conduct_score, conduct_grade, total_incidents, class_teacher_comment, dos_comment, principal_comment, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published') ON DUPLICATE KEY UPDATE total_subjects=VALUES(total_subjects), total_marks=VALUES(total_marks), average_marks=VALUES(average_marks), gpa=VALUES(gpa), overall_grade=VALUES(overall_grade), attendance_rate=VALUES(attendance_rate), days_present=VALUES(days_present), days_absent=VALUES(days_absent), days_late=VALUES(days_late), conduct_score=VALUES(conduct_score), conduct_grade=VALUES(conduct_grade), total_incidents=VALUES(total_incidents), class_teacher_comment=VALUES(class_teacher_comment), dos_comment=VALUES(dos_comment), principal_comment=VALUES(principal_comment), status=VALUES(status), updated_at=NOW()`,
      [sheet[0].id, req.params.studentId, term, academic_year, subjects[0].count, subjects[0].total, subjects[0].avg, subjects[0].gpa, grade, attendance[0].rate, attendance[0].present, attendance[0].absent, attendance[0].late, conduct[0]?.final_score || 100, conduct[0]?.conduct_grade || 'A', sheet[0].total_incidents, class_teacher_comment, dos_comment, principal_comment]);
    
    res.json({ success: true, message: 'Report generated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Quick student search
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, trade_code, level_number, limit = 10 } = req.query;
    let query = `SELECT id, student_id, username, first_name, last_name, trade_code, trade_name, level_number, class_name
                 FROM global_student_sheets WHERE status = 'active'`;
    const params = [];
    
    if (q) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ? OR username LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ?)`;
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (trade_code) {
      query += ' AND trade_code = ?';
      params.push(trade_code);
    }
    
    if (level_number) {
      query += ' AND level_number = ?';
      params.push(level_number);
    }
    
    query += ' ORDER BY last_name, first_name LIMIT ?';
    params.push(parseInt(limit));
    
    const [students] = await pool.execute(query, params);
    res.json({ success: true, students, total: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, academic_year } = req.query;
    let where = '1=1';
    const p = [];
    if (trade_code) { where += ' AND trade_code=?'; p.push(trade_code); }
    if (level_number) { where += ' AND level_number=?'; p.push(level_number); }
    if (academic_year) { where += ' AND academic_year=?'; p.push(academic_year); }
    
    const [stats] = await pool.execute(`SELECT COUNT(*) as total, AVG(gpa) as avg_gpa, AVG(attendance_percentage) as avg_attendance, AVG(conduct_score) as avg_conduct, SUM(CASE WHEN payment_status='paid' THEN 1 ELSE 0 END) as paid_count, SUM(CASE WHEN payment_status='unpaid' THEN 1 ELSE 0 END) as unpaid_count FROM global_student_sheets WHERE ${where}`, p);
    
    res.json({ success: true, analytics: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

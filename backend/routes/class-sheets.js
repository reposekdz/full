const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all class sheets
router.get('/sheets', authenticateToken, async (req, res) => {
  try {
    const { trade, level, academic_year } = req.query;
    let query = `
      SELECT cs.*, cls.trade, cls.level, cls.section, cls.class_name,
        u.name as class_teacher_name,
        css.total_students, css.present_today, css.absent_today, 
        css.avg_performance, css.total_incidents, css.paid_students, css.unpaid_students
      FROM class_sheets cs
      INNER JOIN class_structure cls ON cs.class_structure_id = cls.id
      LEFT JOIN users u ON cs.class_teacher_id = u.id
      LEFT JOIN class_summary_stats css ON cs.id = css.class_sheet_id
      WHERE 1=1
    `;
    const params = [];
    if (trade) { query += ' AND cls.trade = ?'; params.push(trade); }
    if (level) { query += ' AND cls.level = ?'; params.push(level); }
    if (academic_year) { query += ' AND cs.academic_year = ?'; params.push(academic_year); }
    query += ' ORDER BY cls.trade, cls.level, cls.section';
    
    const [sheets] = await pool.execute(query, params);
    res.json({ success: true, sheets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sheets' });
  }
});

// Create class sheet
router.post('/sheets', authenticateToken, async (req, res) => {
  try {
    const { class_structure_id, academic_year, class_teacher_id } = req.body;
    const [classInfo] = await pool.execute('SELECT class_name FROM class_structure WHERE id = ?', [class_structure_id]);
    const sheet_name = `${classInfo[0].class_name} - ${academic_year}`;
    
    const [result] = await pool.execute(
      'INSERT INTO class_sheets (class_structure_id, sheet_name, academic_year, class_teacher_id, created_by) VALUES (?, ?, ?, ?, ?)',
      [class_structure_id, sheet_name, academic_year, class_teacher_id, req.user.userId]
    );
    
    await pool.execute(
      'INSERT INTO class_summary_stats (class_sheet_id) VALUES (?)',
      [result.insertId]
    );
    
    res.json({ success: true, message: 'Class sheet created', sheetId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create sheet' });
  }
});

// Get students in class sheet
router.get('/sheets/:sheetId/students', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT css.*, s.email, s.phone, s.date_of_birth
      FROM class_student_sheets css
      INNER JOIN students s ON css.student_id = s.id
      WHERE css.class_sheet_id = ? AND css.status = 'active'
      ORDER BY css.position_in_class, css.student_name
    `, [req.params.sheetId]);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Add student to class sheet
router.post('/sheets/:sheetId/students', authenticateToken, async (req, res) => {
  try {
    const { student_id, enrollment_date } = req.body;
    const [student] = await pool.execute('SELECT student_code, name, gender FROM students WHERE id = ?', [student_id]);
    
    const [result] = await pool.execute(
      'INSERT INTO class_student_sheets (class_sheet_id, student_id, student_code, student_name, gender, enrollment_date, added_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.sheetId, student_id, student[0].student_code, student[0].name, student[0].gender || 'Male', enrollment_date, req.user.userId]
    );
    
    await pool.execute(
      'UPDATE class_sheets SET total_students = total_students + 1, male_students = male_students + ?, female_students = female_students + ? WHERE id = ?',
      [student[0].gender === 'Male' ? 1 : 0, student[0].gender === 'Female' ? 1 : 0, req.params.sheetId]
    );
    
    await pool.execute(
      'INSERT INTO class_payment_sheets (class_sheet_id, student_id) VALUES (?, ?)',
      [req.params.sheetId, student_id]
    );
    
    res.json({ success: true, message: 'Student added to sheet', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add student' });
  }
});

// Get performance sheet
router.get('/sheets/:sheetId/performance', authenticateToken, async (req, res) => {
  try {
    const { subject, term } = req.query;
    let query = `
      SELECT cps.*, css.student_name, css.student_code
      FROM class_performance_sheets cps
      INNER JOIN class_student_sheets css ON cps.student_id = css.student_id AND cps.class_sheet_id = css.class_sheet_id
      WHERE cps.class_sheet_id = ?
    `;
    const params = [req.params.sheetId];
    if (subject) { query += ' AND cps.subject = ?'; params.push(subject); }
    if (term) { query += ' AND cps.term = ?'; params.push(term); }
    query += ' ORDER BY cps.position, css.student_name';
    
    const [performance] = await pool.execute(query, params);
    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch performance' });
  }
});

// Add performance record
router.post('/sheets/:sheetId/performance', authenticateToken, async (req, res) => {
  try {
    const { student_id, subject, term, quiz_score, midterm_score, final_score, remarks } = req.body;
    const total = parseFloat(quiz_score || 0) + parseFloat(midterm_score || 0) + parseFloat(final_score || 0);
    const max_total = 100;
    const percentage = (total / max_total) * 100;
    const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
    
    const [result] = await pool.execute(
      'INSERT INTO class_performance_sheets (class_sheet_id, student_id, subject, term, quiz_score, midterm_score, final_score, total_score, percentage, grade, remarks, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE quiz_score = ?, midterm_score = ?, final_score = ?, total_score = ?, percentage = ?, grade = ?, remarks = ?',
      [req.params.sheetId, student_id, subject, term, quiz_score, midterm_score, final_score, total, percentage, grade, remarks, req.user.userId, quiz_score, midterm_score, final_score, total, percentage, grade, remarks]
    );
    res.json({ success: true, message: 'Performance recorded', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record performance' });
  }
});

// Get attendance sheet
router.get('/sheets/:sheetId/attendance', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, student_id } = req.query;
    let query = `
      SELECT cas.*, css.student_name, css.student_code
      FROM class_attendance_sheets cas
      INNER JOIN class_student_sheets css ON cas.student_id = css.student_id AND cas.class_sheet_id = css.class_sheet_id
      WHERE cas.class_sheet_id = ?
    `;
    const params = [req.params.sheetId];
    if (start_date) { query += ' AND cas.attendance_date >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND cas.attendance_date <= ?'; params.push(end_date); }
    if (student_id) { query += ' AND cas.student_id = ?'; params.push(student_id); }
    query += ' ORDER BY cas.attendance_date DESC, css.student_name';
    
    const [attendance] = await pool.execute(query, params);
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

// Mark attendance
router.post('/sheets/:sheetId/attendance', authenticateToken, async (req, res) => {
  try {
    const { student_id, attendance_date, status, subject, remarks } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO class_attendance_sheets (class_sheet_id, student_id, attendance_date, status, subject, marked_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, remarks = ?',
      [req.params.sheetId, student_id, attendance_date, status, subject, req.user.userId, remarks, status, remarks]
    );
    res.json({ success: true, message: 'Attendance marked', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
});

// Bulk attendance
router.post('/sheets/:sheetId/attendance/bulk', authenticateToken, async (req, res) => {
  try {
    const { attendance_date, subject, students } = req.body;
    for (const student of students) {
      await pool.execute(
        'INSERT INTO class_attendance_sheets (class_sheet_id, student_id, attendance_date, status, subject, marked_by) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
        [req.params.sheetId, student.student_id, attendance_date, student.status, subject, req.user.userId, student.status]
      );
    }
    res.json({ success: true, message: `Attendance marked for ${students.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark bulk attendance' });
  }
});

// Get discipline sheet
router.get('/sheets/:sheetId/discipline', authenticateToken, async (req, res) => {
  try {
    const { severity, status } = req.query;
    let query = `
      SELECT cds.*, css.student_name, css.student_code
      FROM class_discipline_sheets cds
      INNER JOIN class_student_sheets css ON cds.student_id = css.student_id AND cds.class_sheet_id = css.class_sheet_id
      WHERE cds.class_sheet_id = ?
    `;
    const params = [req.params.sheetId];
    if (severity) { query += ' AND cds.severity = ?'; params.push(severity); }
    if (status) { query += ' AND cds.status = ?'; params.push(status); }
    query += ' ORDER BY cds.incident_date DESC';
    
    const [discipline] = await pool.execute(query, params);
    res.json({ success: true, discipline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch discipline' });
  }
});

// Add discipline record
router.post('/sheets/:sheetId/discipline', authenticateToken, async (req, res) => {
  try {
    const { student_id, incident_date, conduct_type, severity, description, action_taken } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO class_discipline_sheets (class_sheet_id, student_id, incident_date, conduct_type, severity, description, action_taken, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.sheetId, student_id, incident_date, conduct_type, severity, description, action_taken, req.user.userId]
    );
    res.json({ success: true, message: 'Discipline record added', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add discipline record' });
  }
});

// Get payment sheet
router.get('/sheets/:sheetId/payments', authenticateToken, async (req, res) => {
  try {
    const { payment_status } = req.query;
    let query = `
      SELECT cps.*, css.student_name, css.student_code
      FROM class_payment_sheets cps
      INNER JOIN class_student_sheets css ON cps.student_id = css.student_id AND cps.class_sheet_id = css.class_sheet_id
      WHERE cps.class_sheet_id = ?
    `;
    const params = [req.params.sheetId];
    if (payment_status) { query += ' AND cps.payment_status = ?'; params.push(payment_status); }
    query += ' ORDER BY cps.payment_status, css.student_name';
    
    const [payments] = await pool.execute(query, params);
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Update payment sheet
router.put('/sheets/:sheetId/payments/:studentId', authenticateToken, async (req, res) => {
  try {
    const { total_fees, paid_amount } = req.body;
    const balance = total_fees - paid_amount;
    const payment_status = balance <= 0 ? 'paid' : paid_amount > 0 ? 'partial' : 'unpaid';
    
    await pool.execute(
      'UPDATE class_payment_sheets SET total_fees = ?, paid_amount = ?, balance = ?, payment_status = ?, last_payment_date = CURDATE() WHERE class_sheet_id = ? AND student_id = ?',
      [total_fees, paid_amount, balance, payment_status, req.params.sheetId, req.params.studentId]
    );
    res.json({ success: true, message: 'Payment updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update payment' });
  }
});

// Get class summary
router.get('/sheets/:sheetId/summary', authenticateToken, async (req, res) => {
  try {
    const [summary] = await pool.execute('SELECT * FROM class_summary_stats WHERE class_sheet_id = ?', [req.params.sheetId]);
    const [sheet] = await pool.execute(`
      SELECT cs.*, cls.trade, cls.level, cls.section, cls.class_name
      FROM class_sheets cs
      INNER JOIN class_structure cls ON cs.class_structure_id = cls.id
      WHERE cs.id = ?
    `, [req.params.sheetId]);
    
    res.json({ success: true, summary: summary[0], sheet: sheet[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// Update class summary stats
router.post('/sheets/:sheetId/update-stats', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM class_student_sheets WHERE class_sheet_id = ? AND status = "active"', [req.params.sheetId]);
    const [present] = await pool.execute('SELECT COUNT(DISTINCT student_id) as count FROM class_attendance_sheets WHERE class_sheet_id = ? AND attendance_date = CURDATE() AND status = "present"', [req.params.sheetId]);
    const [absent] = await pool.execute('SELECT COUNT(DISTINCT student_id) as count FROM class_attendance_sheets WHERE class_sheet_id = ? AND attendance_date = CURDATE() AND status = "absent"', [req.params.sheetId]);
    const [avgPerf] = await pool.execute('SELECT AVG(percentage) as avg FROM class_performance_sheets WHERE class_sheet_id = ?', [req.params.sheetId]);
    const [incidents] = await pool.execute('SELECT COUNT(*) as count FROM class_discipline_sheets WHERE class_sheet_id = ? AND status = "active"', [req.params.sheetId]);
    const [paid] = await pool.execute('SELECT COUNT(*) as count FROM class_payment_sheets WHERE class_sheet_id = ? AND payment_status = "paid"', [req.params.sheetId]);
    const [unpaid] = await pool.execute('SELECT COUNT(*) as count FROM class_payment_sheets WHERE class_sheet_id = ? AND payment_status = "unpaid"', [req.params.sheetId]);
    
    await pool.execute(
      'UPDATE class_summary_stats SET total_students = ?, present_today = ?, absent_today = ?, avg_performance = ?, total_incidents = ?, paid_students = ?, unpaid_students = ? WHERE class_sheet_id = ?',
      [students[0].count, present[0].count, absent[0].count, avgPerf[0].avg || 0, incidents[0].count, paid[0].count, unpaid[0].count, req.params.sheetId]
    );
    
    res.json({ success: true, message: 'Stats updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stats' });
  }
});

module.exports = router;

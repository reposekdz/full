const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Auto-calculate grade from percentage
const calculateGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A', points: 4.0 };
  if (percentage >= 80) return { grade: 'B', points: 3.0 };
  if (percentage >= 70) return { grade: 'C', points: 2.0 };
  if (percentage >= 60) return { grade: 'D', points: 1.0 };
  return { grade: 'F', points: 0.0 };
};

// Auto-calculate conduct score
const calculateConductScore = (incidents) => {
  let score = 100;
  score -= (incidents.critical_incidents || 0) * 20;
  score -= (incidents.high_incidents || 0) * 10;
  score -= (incidents.medium_incidents || 0) * 5;
  score -= (incidents.low_incidents || 0) * 2;
  score = Math.max(0, score);
  
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  const status = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'poor';
  
  return { score, grade, status };
};

// Create student sheet
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_sheet_id, academic_year } = req.body;
    const [student] = await pool.execute('SELECT student_code, name, trade, class_level FROM students WHERE id = ?', [student_id]);
    const [classInfo] = await pool.execute('SELECT cs.*, cls.level, cls.section FROM class_sheets cs INNER JOIN class_structure cls ON cs.class_structure_id = cls.id WHERE cs.id = ?', [class_sheet_id]);
    
    const [result] = await pool.execute(
      'INSERT INTO student_comprehensive_sheets (student_id, student_code, student_name, class_sheet_id, trade, level, section, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, student[0].student_code, student[0].name, class_sheet_id, student[0].trade, classInfo[0].level, classInfo[0].section, academic_year]
    );
    
    await pool.execute('INSERT INTO student_conduct_tracking (student_sheet_id, student_id) VALUES (?, ?)', [result.insertId, student_id]);
    
    res.json({ success: true, message: 'Student sheet created', sheetId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create sheet' });
  }
});

// Get student sheet
router.get('/:studentId', authenticateToken, async (req, res) => {
  try {
    const [sheet] = await pool.execute('SELECT * FROM student_comprehensive_sheets WHERE student_id = ?', [req.params.studentId]);
    const [subjects] = await pool.execute('SELECT * FROM student_subject_performance WHERE student_id = ? ORDER BY term, subject', [req.params.studentId]);
    const [attendance] = await pool.execute('SELECT * FROM student_attendance_tracking WHERE student_id = ? ORDER BY year DESC, month DESC', [req.params.studentId]);
    const [conduct] = await pool.execute('SELECT * FROM student_conduct_tracking WHERE student_id = ?', [req.params.studentId]);
    const [reports] = await pool.execute('SELECT * FROM student_term_reports WHERE student_id = ? ORDER BY academic_year DESC, term DESC', [req.params.studentId]);
    
    res.json({ success: true, sheet: sheet[0], subjects, attendance, conduct: conduct[0], reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sheet' });
  }
});

// Add/Update subject marks (Teacher input)
router.post('/:studentId/marks', authenticateToken, async (req, res) => {
  try {
    const { subject, term, quiz_marks, midterm_marks, final_marks, remarks } = req.body;
    
    const quiz_max = 20, midterm_max = 30, final_max = 50, total_max = 100;
    const total_marks = parseFloat(quiz_marks || 0) + parseFloat(midterm_marks || 0) + parseFloat(final_marks || 0);
    const percentage = (total_marks / total_max) * 100;
    const { grade, points } = calculateGrade(percentage);
    
    const [sheet] = await pool.execute('SELECT id FROM student_comprehensive_sheets WHERE student_id = ?', [req.params.studentId]);
    
    await pool.execute(
      `INSERT INTO student_subject_performance 
      (student_sheet_id, student_id, subject, term, quiz_marks, quiz_max, midterm_marks, midterm_max, final_marks, final_max, total_marks, total_max, percentage, grade, grade_points, teacher_id, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      quiz_marks = ?, midterm_marks = ?, final_marks = ?, total_marks = ?, percentage = ?, grade = ?, grade_points = ?, remarks = ?`,
      [sheet[0].id, req.params.studentId, subject, term, quiz_marks, quiz_max, midterm_marks, midterm_max, final_marks, final_max, total_marks, total_max, percentage, grade, points, req.user.userId, remarks,
       quiz_marks, midterm_marks, final_marks, total_marks, percentage, grade, points, remarks]
    );
    
    await recalculateAcademicPerformance(req.params.studentId, term);
    
    res.json({ success: true, message: 'Marks recorded and calculated', total_marks, percentage, grade });
  } catch (error) {
    console.error('Marks error:', error);
    res.status(500).json({ success: false, message: 'Failed to record marks' });
  }
});

// Recalculate academic performance
async function recalculateAcademicPerformance(studentId, term) {
  const [subjects] = await pool.execute(
    'SELECT * FROM student_subject_performance WHERE student_id = ? AND term = ?',
    [studentId, term]
  );
  
  if (subjects.length === 0) return;
  
  const totalMarks = subjects.reduce((sum, s) => sum + parseFloat(s.total_marks), 0);
  const avgMarks = totalMarks / subjects.length;
  const avgPercentage = subjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / subjects.length;
  const gpa = subjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / subjects.length;
  const { grade } = calculateGrade(avgPercentage);
  
  await pool.execute(
    'UPDATE student_comprehensive_sheets SET total_subjects = ?, total_marks = ?, average_marks = ?, overall_grade = ?, gpa = ? WHERE student_id = ?',
    [subjects.length, totalMarks, avgMarks, grade, gpa.toFixed(2), studentId]
  );
}

// Mark attendance (Auto-updates stats)
router.post('/:studentId/attendance', authenticateToken, async (req, res) => {
  try {
    const { attendance_date, status } = req.body;
    const date = new Date(attendance_date);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    const [sheet] = await pool.execute('SELECT id FROM student_comprehensive_sheets WHERE student_id = ?', [req.params.studentId]);
    
    await pool.execute(
      'INSERT INTO class_attendance_sheets (class_sheet_id, student_id, attendance_date, status, marked_by) VALUES ((SELECT class_sheet_id FROM student_comprehensive_sheets WHERE student_id = ?), ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
      [req.params.studentId, req.params.studentId, attendance_date, status, req.user.userId, status]
    );
    
    await recalculateAttendance(req.params.studentId, month, year);
    
    res.json({ success: true, message: 'Attendance marked and calculated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
});

// Recalculate attendance
async function recalculateAttendance(studentId, month, year) {
  const [attendance] = await pool.execute(
    `SELECT 
      COUNT(*) as total_days,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
      SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
    FROM class_attendance_sheets 
    WHERE student_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?`,
    [studentId, new Date(`${month} 1, ${year}`).getMonth() + 1, year]
  );
  
  const total = attendance[0].total_days;
  const present = attendance[0].present;
  const rate = total > 0 ? (present / total) * 100 : 0;
  
  const [sheet] = await pool.execute('SELECT id FROM student_comprehensive_sheets WHERE student_id = ?', [studentId]);
  
  await pool.execute(
    `INSERT INTO student_attendance_tracking 
    (student_sheet_id, student_id, month, year, total_days, present_days, absent_days, late_days, excused_days, attendance_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    total_days = ?, present_days = ?, absent_days = ?, late_days = ?, excused_days = ?, attendance_rate = ?`,
    [sheet[0].id, studentId, month, year, total, present, attendance[0].absent, attendance[0].late, attendance[0].excused, rate,
     total, present, attendance[0].absent, attendance[0].late, attendance[0].excused, rate]
  );
  
  const [overall] = await pool.execute(
    'SELECT SUM(total_days) as total, SUM(present_days) as present, SUM(absent_days) as absent, SUM(late_days) as late FROM student_attendance_tracking WHERE student_id = ?',
    [studentId]
  );
  
  const overallRate = overall[0].total > 0 ? (overall[0].present / overall[0].total) * 100 : 0;
  
  await pool.execute(
    'UPDATE student_comprehensive_sheets SET total_days = ?, days_present = ?, days_absent = ?, days_late = ?, attendance_percentage = ? WHERE student_id = ?',
    [overall[0].total, overall[0].present, overall[0].absent, overall[0].late, overallRate, studentId]
  );
}

// Add discipline incident (Auto-updates conduct score)
router.post('/:studentId/discipline', authenticateToken, async (req, res) => {
  try {
    const { conduct_type, severity, description, action_taken } = req.body;
    
    await pool.execute(
      'INSERT INTO class_discipline_sheets (class_sheet_id, student_id, incident_date, conduct_type, severity, description, action_taken, recorded_by) VALUES ((SELECT class_sheet_id FROM student_comprehensive_sheets WHERE student_id = ?), ?, CURDATE(), ?, ?, ?, ?, ?)',
      [req.params.studentId, req.params.studentId, conduct_type, severity, description, action_taken, req.user.userId]
    );
    
    await recalculateConductScore(req.params.studentId);
    
    res.json({ success: true, message: 'Discipline recorded and conduct score updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record discipline' });
  }
});

// Recalculate conduct score
async function recalculateConductScore(studentId) {
  const [incidents] = await pool.execute(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low,
      SUM(CASE WHEN conduct_type = 'warning' THEN 1 ELSE 0 END) as warnings,
      SUM(CASE WHEN conduct_type = 'suspension' THEN 1 ELSE 0 END) as suspensions,
      SUM(CASE WHEN conduct_type = 'late' THEN 1 ELSE 0 END) as late_arrivals,
      SUM(CASE WHEN conduct_type = 'absence' THEN 1 ELSE 0 END) as absences,
      SUM(CASE WHEN conduct_type = 'misbehavior' THEN 1 ELSE 0 END) as misbehaviors,
      SUM(CASE WHEN conduct_type = 'uniform' THEN 1 ELSE 0 END) as uniform_violations,
      MAX(incident_date) as last_incident
    FROM class_discipline_sheets 
    WHERE student_id = ? AND status = 'active'`,
    [studentId]
  );
  
  const inc = incidents[0];
  const { score, grade, status } = calculateConductScore({
    critical_incidents: inc.critical,
    high_incidents: inc.high,
    medium_incidents: inc.medium,
    low_incidents: inc.low
  });
  
  const deductions = 100 - score;
  
  const [sheet] = await pool.execute('SELECT id FROM student_comprehensive_sheets WHERE student_id = ?', [studentId]);
  
  await pool.execute(
    `INSERT INTO student_conduct_tracking 
    (student_sheet_id, student_id, warnings, suspensions, late_arrivals, absences, misbehaviors, uniform_violations, deductions, final_score, conduct_grade, conduct_status, last_incident_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    warnings = ?, suspensions = ?, late_arrivals = ?, absences = ?, misbehaviors = ?, uniform_violations = ?, deductions = ?, final_score = ?, conduct_grade = ?, conduct_status = ?, last_incident_date = ?`,
    [sheet[0].id, studentId, inc.warnings, inc.suspensions, inc.late_arrivals, inc.absences, inc.misbehaviors, inc.uniform_violations, deductions, score, grade, status, inc.last_incident,
     inc.warnings, inc.suspensions, inc.late_arrivals, inc.absences, inc.misbehaviors, inc.uniform_violations, deductions, score, grade, status, inc.last_incident]
  );
  
  await pool.execute(
    'UPDATE student_comprehensive_sheets SET total_incidents = ?, critical_incidents = ?, high_incidents = ?, medium_incidents = ?, low_incidents = ?, conduct_score = ?, conduct_grade = ? WHERE student_id = ?',
    [inc.total, inc.critical, inc.high, inc.medium, inc.low, score, grade, studentId]
  );
}

// Generate term report
router.post('/:studentId/generate-report', authenticateToken, async (req, res) => {
  try {
    const { term, academic_year } = req.body;
    
    const [sheet] = await pool.execute('SELECT * FROM student_comprehensive_sheets WHERE student_id = ?', [req.params.studentId]);
    const [subjects] = await pool.execute('SELECT COUNT(*) as count, SUM(total_marks) as total, AVG(percentage) as avg, AVG(grade_points) as gpa FROM student_subject_performance WHERE student_id = ? AND term = ?', [req.params.studentId, term]);
    const [attendance] = await pool.execute('SELECT AVG(attendance_rate) as rate, SUM(present_days) as present, SUM(absent_days) as absent FROM student_attendance_tracking WHERE student_id = ?', [req.params.studentId]);
    const [conduct] = await pool.execute('SELECT final_score, conduct_grade, student_sheet_id FROM student_conduct_tracking WHERE student_id = ?', [req.params.studentId]);
    
    const { grade } = calculateGrade(subjects[0].avg || 0);
    
    await pool.execute(
      `INSERT INTO student_term_reports 
      (student_sheet_id, student_id, term, academic_year, total_subjects, total_marks, average_marks, gpa, overall_grade, attendance_rate, days_present, days_absent, conduct_score, conduct_grade, total_incidents)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      total_subjects = ?, total_marks = ?, average_marks = ?, gpa = ?, overall_grade = ?, attendance_rate = ?, days_present = ?, days_absent = ?, conduct_score = ?, conduct_grade = ?, total_incidents = ?`,
      [sheet[0].id, req.params.studentId, term, academic_year, subjects[0].count, subjects[0].total, subjects[0].avg, subjects[0].gpa, grade, attendance[0].rate, attendance[0].present, attendance[0].absent, conduct[0].final_score, conduct[0].conduct_grade, sheet[0].total_incidents,
       subjects[0].count, subjects[0].total, subjects[0].avg, subjects[0].gpa, grade, attendance[0].rate, attendance[0].present, attendance[0].absent, conduct[0].final_score, conduct[0].conduct_grade, sheet[0].total_incidents]
    );
    
    res.json({ success: true, message: 'Term report generated' });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

// Get all students sheets (for class view)
router.get('/class/:classSheetId/all', authenticateToken, async (req, res) => {
  try {
    const [sheets] = await pool.execute(
      'SELECT * FROM student_comprehensive_sheets WHERE class_sheet_id = ? ORDER BY class_position, student_name',
      [req.params.classSheetId]
    );
    res.json({ success: true, sheets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sheets' });
  }
});

module.exports = router;

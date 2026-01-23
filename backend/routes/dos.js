const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [totalStudents] = await pool.execute('SELECT COUNT(*) as count FROM students');
    const [totalTeachers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "teacher"');
    const [totalSubjects] = await pool.execute('SELECT COUNT(DISTINCT subject) as count FROM curriculum WHERE status = "active"');
    const [upcomingExams] = await pool.execute('SELECT COUNT(*) as count FROM examination_schedule WHERE exam_date >= CURDATE() AND status = "scheduled"');
    const [avgAttendance] = await pool.execute('SELECT ROUND(AVG(CASE WHEN status = "present" THEN 100 ELSE 0 END), 2) as avg FROM student_attendance WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
    
    res.json({
      success: true,
      stats: {
        totalStudents: totalStudents[0].count,
        totalTeachers: totalTeachers[0].count,
        totalSubjects: totalSubjects[0].count,
        upcomingExams: upcomingExams[0].count,
        avgAttendance: avgAttendance[0].avg || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
});

// Academic Performance
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { student_id, trade, class_level, subject, term } = req.query;
    let query = 'SELECT * FROM academic_performance WHERE 1=1';
    const params = [];
    if (student_id) { query += ' AND student_id = ?'; params.push(student_id); }
    if (trade) { query += ' AND student_code LIKE ?'; params.push(`${trade}%`); }
    if (subject) { query += ' AND subject = ?'; params.push(subject); }
    if (term) { query += ' AND term = ?'; params.push(term); }
    query += ' ORDER BY created_at DESC';
    const [performance] = await pool.execute(query, params);
    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch performance' });
  }
});

router.post('/performance', authenticateToken, async (req, res) => {
  try {
    const { student_id, subject, exam_type, score, max_score, term, academic_year, remarks } = req.body;
    const [student] = await pool.execute('SELECT student_code FROM students WHERE id = ?', [student_id]);
    const percentage = (score / max_score) * 100;
    const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
    
    const [result] = await pool.execute(
      'INSERT INTO academic_performance (student_id, student_code, subject, exam_type, score, max_score, percentage, grade, term, academic_year, teacher_id, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, student[0]?.student_code, subject, exam_type, score, max_score, percentage, grade, term, academic_year, req.user.userId, remarks]
    );
    res.json({ success: true, message: 'Performance recorded', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record performance' });
  }
});

// Curriculum
router.get('/curriculum', authenticateToken, async (req, res) => {
  try {
    const { trade, class_level, status } = req.query;
    let query = 'SELECT * FROM curriculum WHERE 1=1';
    const params = [];
    if (trade) { query += ' AND trade = ?'; params.push(trade); }
    if (class_level) { query += ' AND class_level = ?'; params.push(class_level); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [curriculum] = await pool.execute(query, params);
    res.json({ success: true, curriculum });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch curriculum' });
  }
});

router.post('/curriculum', authenticateToken, async (req, res) => {
  try {
    const { trade, class_level, subject, topics, learning_outcomes, assessment_methods, resources } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO curriculum (trade, class_level, subject, topics, learning_outcomes, assessment_methods, resources, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [trade, class_level, subject, topics, learning_outcomes, assessment_methods, resources, req.user.userId]
    );
    res.json({ success: true, message: 'Curriculum created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create curriculum' });
  }
});

router.put('/curriculum/:id', authenticateToken, async (req, res) => {
  try {
    const { topics, learning_outcomes, assessment_methods, resources, status } = req.body;
    await pool.execute(
      'UPDATE curriculum SET topics = ?, learning_outcomes = ?, assessment_methods = ?, resources = ?, status = ? WHERE id = ?',
      [topics, learning_outcomes, assessment_methods, resources, status, req.params.id]
    );
    res.json({ success: true, message: 'Curriculum updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update curriculum' });
  }
});

// Teacher Assignments
router.get('/teacher-assignments', authenticateToken, async (req, res) => {
  try {
    const { teacher_id, status } = req.query;
    let query = 'SELECT * FROM teacher_assignments WHERE 1=1';
    const params = [];
    if (teacher_id) { query += ' AND teacher_id = ?'; params.push(teacher_id); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [assignments] = await pool.execute(query, params);
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
});

router.post('/teacher-assignments', authenticateToken, async (req, res) => {
  try {
    const { teacher_id, trade, class_level, subject, academic_year } = req.body;
    const [teacher] = await pool.execute('SELECT name FROM users WHERE id = ?', [teacher_id]);
    const [result] = await pool.execute(
      'INSERT INTO teacher_assignments (teacher_id, teacher_name, trade, class_level, subject, academic_year, assigned_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [teacher_id, teacher[0]?.name, trade, class_level, subject, academic_year, req.user.userId]
    );
    res.json({ success: true, message: 'Teacher assigned', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign teacher' });
  }
});

// Examination Schedule
router.get('/exams', authenticateToken, async (req, res) => {
  try {
    const { status, trade, start_date, end_date } = req.query;
    let query = 'SELECT * FROM examination_schedule WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (trade) { query += ' AND trade = ?'; params.push(trade); }
    if (start_date) { query += ' AND exam_date >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND exam_date <= ?'; params.push(end_date); }
    query += ' ORDER BY exam_date ASC';
    const [exams] = await pool.execute(query, params);
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch exams' });
  }
});

router.post('/exams', authenticateToken, async (req, res) => {
  try {
    const { exam_name, exam_type, trade, class_level, subject, exam_date, start_time, end_time, venue, invigilator_id } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO examination_schedule (exam_name, exam_type, trade, class_level, subject, exam_date, start_time, end_time, venue, invigilator_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [exam_name, exam_type, trade, class_level, subject, exam_date, start_time, end_time, venue, invigilator_id, req.user.userId]
    );
    res.json({ success: true, message: 'Exam scheduled', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to schedule exam' });
  }
});

router.put('/exams/:id', authenticateToken, async (req, res) => {
  try {
    const { status, exam_date, start_time, end_time, venue } = req.body;
    await pool.execute(
      'UPDATE examination_schedule SET status = ?, exam_date = ?, start_time = ?, end_time = ?, venue = ? WHERE id = ?',
      [status, exam_date, start_time, end_time, venue, req.params.id]
    );
    res.json({ success: true, message: 'Exam updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update exam' });
  }
});

// Timetable
router.get('/timetable', authenticateToken, async (req, res) => {
  try {
    const { trade, class_level, day_of_week } = req.query;
    let query = 'SELECT * FROM class_timetable WHERE status = "active"';
    const params = [];
    if (trade) { query += ' AND trade = ?'; params.push(trade); }
    if (class_level) { query += ' AND class_level = ?'; params.push(class_level); }
    if (day_of_week) { query += ' AND day_of_week = ?'; params.push(day_of_week); }
    query += ' ORDER BY day_of_week, start_time';
    const [timetable] = await pool.execute(query, params);
    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
});

router.post('/timetable', authenticateToken, async (req, res) => {
  try {
    const { trade, class_level, day_of_week, subject, teacher_id, start_time, end_time, room, academic_year } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO class_timetable (trade, class_level, day_of_week, subject, teacher_id, start_time, end_time, room, academic_year, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [trade, class_level, day_of_week, subject, teacher_id, start_time, end_time, room, academic_year, req.user.userId]
    );
    res.json({ success: true, message: 'Timetable entry created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create timetable' });
  }
});

// Attendance
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const { student_id, trade, class_level, start_date, end_date, status } = req.query;
    let query = 'SELECT * FROM student_attendance WHERE 1=1';
    const params = [];
    if (student_id) { query += ' AND student_id = ?'; params.push(student_id); }
    if (trade) { query += ' AND trade = ?'; params.push(trade); }
    if (class_level) { query += ' AND class_level = ?'; params.push(class_level); }
    if (start_date) { query += ' AND attendance_date >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND attendance_date <= ?'; params.push(end_date); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY attendance_date DESC';
    const [attendance] = await pool.execute(query, params);
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

router.post('/attendance', authenticateToken, async (req, res) => {
  try {
    const { student_id, attendance_date, status, subject, remarks } = req.body;
    const [student] = await pool.execute('SELECT student_code, trade, class_level FROM students WHERE id = ?', [student_id]);
    const [result] = await pool.execute(
      'INSERT INTO student_attendance (student_id, student_code, trade, class_level, attendance_date, status, subject, marked_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, remarks = ?',
      [student_id, student[0]?.student_code, student[0]?.trade, student[0]?.class_level, attendance_date, status, subject, req.user.userId, remarks, status, remarks]
    );
    res.json({ success: true, message: 'Attendance marked', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
});

// Bulk attendance
router.post('/attendance/bulk', authenticateToken, async (req, res) => {
  try {
    const { students, attendance_date, subject } = req.body;
    for (const student of students) {
      const [studentData] = await pool.execute('SELECT student_code, trade, class_level FROM students WHERE id = ?', [student.student_id]);
      await pool.execute(
        'INSERT INTO student_attendance (student_id, student_code, trade, class_level, attendance_date, status, subject, marked_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
        [student.student_id, studentData[0]?.student_code, studentData[0]?.trade, studentData[0]?.class_level, attendance_date, student.status, subject, req.user.userId, student.status]
      );
    }
    res.json({ success: true, message: `Attendance marked for ${students.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark bulk attendance' });
  }
});

// Analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const [performanceByTrade] = await pool.execute(`
      SELECT trade, AVG(percentage) as avg_performance
      FROM academic_performance ap
      JOIN students s ON ap.student_id = s.id
      GROUP BY trade
    `);
    
    const [attendanceByTrade] = await pool.execute(`
      SELECT trade, 
        ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 2) as attendance_rate
      FROM student_attendance
      WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY trade
    `);
    
    res.json({ success: true, analytics: { performanceByTrade, attendanceByTrade } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

module.exports = router;

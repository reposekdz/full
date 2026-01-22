const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/dos/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Dashboard Overview
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "student")');
    const [teachers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "teacher")');
    const [courses] = await pool.execute('SELECT COUNT(*) as count FROM courses WHERE is_active = true');
    const [avgGrade] = await pool.execute('SELECT AVG(score) as avg FROM grades');
    const [attendance] = await pool.execute('SELECT COUNT(*) as present FROM attendance WHERE status = "present" AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    
    res.json({
      success: true,
      stats: {
        totalStudents: students[0].count,
        totalTeachers: teachers[0].count,
        activeCourses: courses[0].count,
        averageGrade: avgGrade[0].avg || 0,
        attendanceRate: attendance[0].present
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Courses
router.post('/courses', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { course_code, course_name, description, credits, trade_level_id, instructor_id, semester } = req.body;
    const image_url = req.file ? `/uploads/dos/${req.file.filename}` : null;
    
    const [result] = await pool.execute(`
      INSERT INTO courses (course_code, course_name, description, credits, trade_level_id, instructor_id, semester, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [course_code, course_name, description, credits, trade_level_id, instructor_id, semester, image_url]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/courses/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { course_name, description, credits, instructor_id } = req.body;
    let query = 'UPDATE courses SET course_name = ?, description = ?, credits = ?, instructor_id = ?';
    const params = [course_name, description, credits, instructor_id];
    
    if (req.file) {
      query += ', image_url = ?';
      params.push(`/uploads/dos/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/courses/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE courses SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Timetable
router.post('/timetable', authenticateToken, async (req, res) => {
  try {
    const { course_id, day_of_week, start_time, end_time, room_id } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO timetable (course_id, day_of_week, start_time, end_time, room_id, is_active)
      VALUES (?, ?, ?, ?, ?, true)
    `, [course_id, day_of_week, start_time, end_time, room_id]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Exams
router.post('/exams', authenticateToken, async (req, res) => {
  try {
    const { course_id, exam_name, exam_type, exam_date, duration, total_marks, room_id } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO exams (course_id, exam_name, exam_type, exam_date, duration, total_marks, room_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, true)
    `, [course_id, exam_name, exam_type, exam_date, duration, total_marks, room_id]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Performance Reports
router.get('/reports/performance', authenticateToken, async (req, res) => {
  try {
    const { trade, level, period } = req.query;
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.student_id,
        AVG(g.score) as avg_score,
        COUNT(DISTINCT a.id) as total_attendance,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM users u
      LEFT JOIN grades g ON u.id = g.student_id
      LEFT JOIN attendance a ON u.id = a.student_id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
    `;
    
    const params = [];
    if (period) {
      query += ' AND g.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
      params.push(parseInt(period));
    }
    
    query += ' GROUP BY u.id ORDER BY avg_score DESC';
    
    const [students] = await pool.execute(query, params);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign Teachers
router.post('/assign-teacher', authenticateToken, async (req, res) => {
  try {
    const { course_id, teacher_id } = req.body;
    await pool.execute('UPDATE courses SET instructor_id = ? WHERE id = ?', [teacher_id, course_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Academic Calendar
router.post('/calendar', authenticateToken, async (req, res) => {
  try {
    const { event_name, event_type, event_date, description } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO academic_calendar (event_name, event_type, event_date, description)
      VALUES (?, ?, ?, ?)
    `, [event_name, event_type, event_date, description]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const [events] = await pool.execute(`
      SELECT * FROM academic_calendar 
      WHERE event_date >= CURDATE() 
      ORDER BY event_date ASC
    `);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

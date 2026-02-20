const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get teacher's courses
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const [courses] = await pool.execute(`
      SELECT DISTINCT
        c.id as course_id,
        c.name as course_name,
        c.code as course_code,
        t.name as trade_name,
        t.code as trade_code,
        l.level_number,
        COUNT(DISTINCT e.student_id) as student_count
      FROM courses c
      LEFT JOIN trades t ON c.trade_id = t.id
      LEFT JOIN levels l ON c.level_id = l.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE c.teacher_id = ? OR c.id IN (
        SELECT course_id FROM course_teachers WHERE teacher_id = ?
      )
      GROUP BY c.id
      ORDER BY t.name, l.level_number, c.name
    `, [teacherId, teacherId]);

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.json({ success: true, courses: [] });
  }
});

// Get teacher's students
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { course_id, trade_code, level } = req.query;
    
    let query = `
      SELECT DISTINCT
        u.id as student_id,
        u.first_name,
        u.last_name,
        u.serial_code as student_code,
        u.trade_code,
        u.level as level_number,
        u.gender,
        u.phone,
        u.email,
        COALESCE(AVG(g.percentage), 0) as avg_grade,
        COUNT(DISTINCT a.id) as total_attendance,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN grades g ON u.id = g.student_id
      LEFT JOIN attendance a ON u.id = a.student_id
      WHERE u.role = 'student' AND u.status = 'active'
        AND (e.course_id IN (
          SELECT id FROM courses WHERE teacher_id = ?
          UNION
          SELECT course_id FROM course_teachers WHERE teacher_id = ?
        ) OR ? IS NULL)
    `;
    
    const params = [teacherId, teacherId, course_id];
    
    if (course_id) {
      query += ' AND e.course_id = ?';
      params.push(course_id);
    }
    if (trade_code) {
      query += ' AND u.trade_code = ?';
      params.push(trade_code);
    }
    if (level) {
      query += ' AND u.level = ?';
      params.push(level);
    }
    
    query += ' GROUP BY u.id ORDER BY u.last_name, u.first_name';
    
    const [students] = await pool.execute(query, params);
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.json({ success: true, students: [] });
  }
});

// Submit grades
router.post('/grades/submit', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { student_id, course_id, assessment_type, assessment_name, max_marks, obtained_marks, assessment_date } = req.body;
    const teacherId = req.user.id;
    
    const percentage = (obtained_marks / max_marks) * 100;
    let grade_letter = 'F';
    if (percentage >= 90) grade_letter = 'A';
    else if (percentage >= 80) grade_letter = 'B';
    else if (percentage >= 70) grade_letter = 'C';
    else if (percentage >= 60) grade_letter = 'D';
    else if (percentage >= 50) grade_letter = 'E';
    
    await connection.execute(`
      INSERT INTO grades (student_id, course_id, assessment_type, assessment_name, max_marks, obtained_marks, percentage, grade_letter, assessment_date, teacher_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        obtained_marks = VALUES(obtained_marks),
        percentage = VALUES(percentage),
        grade_letter = VALUES(grade_letter),
        updated_at = NOW()
    `, [student_id, course_id, assessment_type, assessment_name, max_marks, obtained_marks, percentage, grade_letter, assessment_date, teacherId]);
    
    await connection.commit();
    res.json({ success: true, message: 'Amanota yanditswe neza' });
  } catch (error) {
    await connection.rollback();
    console.error('Submit grade error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Get grades
router.get('/grades', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { course_id, student_id } = req.query;
    
    let query = `
      SELECT 
        g.*,
        u.first_name,
        u.last_name,
        u.serial_code as student_code,
        c.name as course_name
      FROM grades g
      JOIN users u ON g.student_id = u.id
      LEFT JOIN courses c ON g.course_id = c.id
      WHERE g.teacher_id = ?
    `;
    
    const params = [teacherId];
    
    if (course_id) {
      query += ' AND g.course_id = ?';
      params.push(course_id);
    }
    if (student_id) {
      query += ' AND g.student_id = ?';
      params.push(student_id);
    }
    
    query += ' ORDER BY g.assessment_date DESC, u.last_name';
    
    const [grades] = await pool.execute(query, params);
    
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get grades error:', error);
    res.json({ success: true, grades: [] });
  }
});

// Mark attendance
router.post('/attendance/mark', authenticateToken, async (req, res) => {
  try {
    const { student_id, course_id, date, status } = req.body;
    const teacherId = req.user.id;
    
    await pool.execute(`
      INSERT INTO attendance (student_id, course_id, teacher_id, date, status, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updated_at = NOW()
    `, [student_id, course_id, teacherId, date, status]);
    
    res.json({ success: true, message: 'Kwitabira byanditswe neza' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { course_id, date, student_id } = req.query;
    
    let query = `
      SELECT 
        a.*,
        u.first_name,
        u.last_name,
        u.serial_code as student_code,
        c.name as course_name
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN courses c ON a.course_id = c.id
      WHERE a.teacher_id = ?
    `;
    
    const params = [teacherId];
    
    if (course_id) {
      query += ' AND a.course_id = ?';
      params.push(course_id);
    }
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }
    
    query += ' ORDER BY a.date DESC, u.last_name';
    
    const [attendance] = await pool.execute(query, params);
    
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.json({ success: true, attendance: [] });
  }
});

// Bulk mark attendance
router.post('/attendance/bulk', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { course_id, date, attendance_records } = req.body;
    const teacherId = req.user.id;
    
    for (const record of attendance_records) {
      await connection.execute(`
        INSERT INTO attendance (student_id, course_id, teacher_id, date, status, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          updated_at = NOW()
      `, [record.student_id, course_id, teacherId, date, record.status]);
    }
    
    await connection.commit();
    res.json({ success: true, message: `${attendance_records.length} abanyeshuri banditswe` });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk attendance error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Get dashboard statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const [[stats]] = await pool.execute(`
      SELECT
        (SELECT COUNT(DISTINCT c.id) FROM courses c WHERE c.teacher_id = ? OR c.id IN (SELECT course_id FROM course_teachers WHERE teacher_id = ?)) as total_courses,
        (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e WHERE e.course_id IN (SELECT id FROM courses WHERE teacher_id = ? UNION SELECT course_id FROM course_teachers WHERE teacher_id = ?)) as total_students,
        (SELECT COUNT(*) FROM grades WHERE teacher_id = ?) as total_grades,
        (SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as attendance_last_30_days,
        (SELECT AVG(percentage) FROM grades WHERE teacher_id = ?) as avg_class_performance,
        (SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND status = 'present' AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) * 100.0 / NULLIF((SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)), 0) as attendance_rate_7_days
    `, [teacherId, teacherId, teacherId, teacherId, teacherId, teacherId, teacherId, teacherId, teacherId]);
    
    res.json({ success: true, statistics: stats });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.json({ success: true, statistics: {} });
  }
});

// Create assignment
router.post('/assignments/create', authenticateToken, async (req, res) => {
  try {
    const { course_id, title, description, due_date, max_marks } = req.body;
    const teacherId = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO assignments (course_id, teacher_id, title, description, due_date, max_marks, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [course_id, teacherId, title, description, due_date, max_marks]);
    
    res.json({ success: true, message: 'Igikorwa cyashyizweho', assignment_id: result.insertId });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assignments
router.get('/assignments', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { course_id } = req.query;
    
    let query = `
      SELECT 
        a.*,
        c.name as course_name,
        COUNT(DISTINCT s.id) as submission_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = a.course_id AND status = 'active') as total_students
      FROM assignments a
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
      WHERE a.teacher_id = ?
    `;
    
    const params = [teacherId];
    
    if (course_id) {
      query += ' AND a.course_id = ?';
      params.push(course_id);
    }
    
    query += ' GROUP BY a.id ORDER BY a.due_date DESC';
    
    const [assignments] = await pool.execute(query, params);
    
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.json({ success: true, assignments: [] });
  }
});

// Get assignment submissions
router.get('/assignments/:id/submissions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [submissions] = await pool.execute(`
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.serial_code as student_code
      FROM assignment_submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `, [id]);
    
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.json({ success: true, submissions: [] });
  }
});

// Grade assignment submission
router.post('/assignments/grade', authenticateToken, async (req, res) => {
  try {
    const { submission_id, marks, feedback } = req.body;
    
    await pool.execute(`
      UPDATE assignment_submissions
      SET marks = ?, feedback = ?, graded_at = NOW(), status = 'graded'
      WHERE id = ?
    `, [marks, feedback, submission_id]);
    
    res.json({ success: true, message: 'Igikorwa cyapimwe' });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get teacher profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const [[teacher]] = await pool.execute(`
      SELECT 
        u.*,
        COUNT(DISTINCT c.id) as courses_count,
        COUNT(DISTINCT e.student_id) as students_count
      FROM users u
      LEFT JOIN courses c ON u.id = c.teacher_id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE u.id = ?
      GROUP BY u.id
    `, [teacherId]);
    
    res.json({ success: true, teacher });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all courses
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    const { level, trade, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, t.trade_name, t.trade_code, tl.level_number,
        COUNT(DISTINCT e.student_id) as student_count,
        AVG(g.score) as average_score
      FROM courses c
      LEFT JOIN trade_levels tl ON c.trade_level_id = tl.id
      LEFT JOIN trades t ON tl.trade_code = t.trade_code
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN grades g ON c.id = g.course_id
      WHERE c.is_active = true
    `;
    const params = [];

    if (level) {
      query += ' AND tl.level_number = ?';
      params.push(level);
    }
    if (trade) {
      query += ' AND t.trade_code = ?';
      params.push(trade);
    }
    if (search) {
      query += ' AND (c.course_name LIKE ? OR c.course_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY c.id ORDER BY c.course_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [courses] = await pool.execute(query, params);

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
});

// Get course details
router.get('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [courses] = await pool.execute(`
      SELECT c.*, t.trade_name, t.trade_code, tl.level_number,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.email as instructor_email
      FROM courses c
      LEFT JOIN trade_levels tl ON c.trade_level_id = tl.id
      LEFT JOIN trades t ON tl.trade_code = t.trade_code
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get course materials
    const [materials] = await pool.execute(`
      SELECT * FROM course_materials
      WHERE course_id = ?
      ORDER BY created_at DESC
    `, [id]);

    // Get assignments
    const [assignments] = await pool.execute(`
      SELECT * FROM assignments
      WHERE course_id = ?
      ORDER BY due_date DESC
    `, [id]);

    res.json({
      success: true,
      course: courses[0],
      materials,
      assignments
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details'
    });
  }
});

// Get student courses
router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    const [courses] = await pool.execute(`
      SELECT c.*, t.trade_name, tl.level_number,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        e.enrollment_date,
        AVG(g.score) as my_average
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN trade_levels tl ON c.trade_level_id = tl.id
      LEFT JOIN trades t ON tl.trade_code = t.trade_code
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN grades g ON c.id = g.course_id AND g.student_id = ?
      WHERE e.student_id = ? AND e.status = 'active'
      GROUP BY c.id
      ORDER BY c.course_name
    `, [req.user.id, req.user.id]);

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
});

// Get assignments
router.get('/assignments', authenticateToken, async (req, res) => {
  try {
    const { courseId, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, c.course_name, c.course_code,
        s.submission_date, s.score, s.feedback, s.status as submission_status
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
      WHERE 1=1
    `;
    const params = [req.user.id];

    if (courseId) {
      query += ' AND a.course_id = ?';
      params.push(courseId);
    }
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.due_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [assignments] = await pool.execute(query, params);

    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
});

// Submit assignment
router.post('/assignments/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO assignment_submissions (
        assignment_id, student_id, content, status
      ) VALUES (?, ?, ?, 'submitted')
      ON DUPLICATE KEY UPDATE
        content = ?, submission_date = NOW(), status = 'submitted'
    `, [id, req.user.id, content, content]);

    // Store attachments
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        await pool.execute(`
          INSERT INTO submission_attachments (submission_id, file_path, file_name)
          VALUES (?, ?, ?)
        `, [result.insertId, attachment.path, attachment.name]);
      }
    }

    res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment'
    });
  }
});

// Get grades
router.get('/grades', authenticateToken, async (req, res) => {
  try {
    const { courseId, academicYear, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT g.*, c.course_name, c.course_code, c.credits,
        e.exam_name, e.exam_type, e.total_marks
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      LEFT JOIN exams e ON g.exam_id = e.id
      WHERE g.student_id = ?
    `;
    const params = [req.user.id];

    if (courseId) {
      query += ' AND g.course_id = ?';
      params.push(courseId);
    }
    if (academicYear) {
      query += ' AND g.academic_year_id = ?';
      params.push(academicYear);
    }

    query += ' ORDER BY g.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [grades] = await pool.execute(query, params);

    // Calculate GPA
    const [gpaResult] = await pool.execute(`
      SELECT 
        AVG(g.score) as average_score,
        SUM(c.credits * g.score) / SUM(c.credits) as weighted_gpa
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?
    `, [req.user.id]);

    res.json({
      success: true,
      grades,
      gpa: gpaResult[0]
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades'
    });
  }
});

// Get exams
router.get('/exams', authenticateToken, async (req, res) => {
  try {
    const { courseId, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, c.course_name, c.course_code,
        g.score, g.grade, g.remarks
      FROM exams e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN grades g ON e.id = g.exam_id AND g.student_id = ?
      WHERE e.is_active = true
    `;
    const params = [req.user.id];

    if (courseId) {
      query += ' AND e.course_id = ?';
      params.push(courseId);
    }
    if (status === 'upcoming') {
      query += ' AND e.exam_date > NOW()';
    } else if (status === 'completed') {
      query += ' AND e.exam_date <= NOW()';
    }

    query += ' ORDER BY e.exam_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [exams] = await pool.execute(query, params);

    res.json({
      success: true,
      exams
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams'
    });
  }
});

// Get timetable
router.get('/timetable', authenticateToken, async (req, res) => {
  try {
    const { day, week } = req.query;

    let query = `
      SELECT t.*, c.course_name, c.course_code,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        r.room_name, r.building
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN rooms r ON t.room_id = r.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = ? AND t.is_active = true
    `;
    const params = [req.user.id];

    if (day) {
      query += ' AND t.day_of_week = ?';
      params.push(day);
    }

    query += ' ORDER BY t.day_of_week, t.start_time';

    const [timetable] = await pool.execute(query, params);

    res.json({
      success: true,
      timetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable'
    });
  }
});

// Get attendance
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    let query = `
      SELECT a.*, c.course_name, c.course_code
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ?
    `;
    const params = [req.user.id];

    if (courseId) {
      query += ' AND a.course_id = ?';
      params.push(courseId);
    }
    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY a.date DESC';

    const [attendance] = await pool.execute(query, params);

    // Calculate attendance percentage
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_classes,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
      FROM attendance
      WHERE student_id = ?
    `, [req.user.id]);

    res.json({
      success: true,
      attendance,
      statistics: stats[0]
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
});

// Get learning resources
router.get('/resources', authenticateToken, async (req, res) => {
  try {
    const { courseId, type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, c.course_name, c.course_code
      FROM learning_resources r
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.is_active = true
    `;
    const params = [];

    if (courseId) {
      query += ' AND r.course_id = ?';
      params.push(courseId);
    }
    if (type) {
      query += ' AND r.resource_type = ?';
      params.push(type);
    }
    if (search) {
      query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [resources] = await pool.execute(query, params);

    res.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources'
    });
  }
});

// Track resource access
router.post('/resources/:id/access', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(`
      INSERT INTO resource_interactions (resource_id, user_id, interaction_type)
      VALUES (?, ?, 'view')
    `, [id, req.user.id]);

    // Update view count
    await pool.execute(`
      UPDATE learning_resources SET views = views + 1 WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Resource access tracked'
    });
  } catch (error) {
    console.error('Track resource access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track resource access'
    });
  }
});

module.exports = router;

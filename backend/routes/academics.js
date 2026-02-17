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
      SELECT c.*, t.name, t.code, tl.level_number,
        COUNT(DISTINCT e.student_id) as student_count,
        AVG(g.score) as average_score
      FROM courses c
      LEFT JOIN trade_levels tl ON c.trade_level_id = tl.id
      LEFT JOIN trades t ON tl.trade_code = t.code
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
      query += ' AND t.code = ?';
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
      SELECT c.*, t.name, t.code, tl.level_number,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.email as instructor_email
      FROM courses c
      LEFT JOIN trade_levels tl ON c.trade_level_id = tl.id
      LEFT JOIN trades t ON tl.trade_code = t.code
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
      SELECT c.*, t.name, tl.level_number,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        e.enrollment_date,
        AVG(g.score) as my_average
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN trade_levels tl ON c.trade_level_id = tl.id
      LEFT JOIN trades t ON tl.trade_code = t.code
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

// Create course
router.post('/courses', authenticateToken, async (req, res) => {
  try {
    const { name, code, description, instructor_id, credits } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Course name and code are required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO courses (name, code, description, instructor_id, credits, is_active)
      VALUES (?, ?, ?, ?, ?, true)
    `, [name, code, description, instructor_id, credits || 0]);

    res.json({
      success: true,
      message: 'Course created successfully',
      course: { id: result.insertId, name, code }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Course code already exists' : 'Failed to create course'
    });
  }
});

// Update course
router.put('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, instructor_id, credits, is_active } = req.body;

    const [result] = await pool.execute(`
      UPDATE courses SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        description = COALESCE(?, description),
        instructor_id = COALESCE(?, instructor_id),
        credits = COALESCE(?, credits),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, code, description, instructor_id, credits, is_active, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
});

// Delete course
router.delete('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
});

// Get all classes
router.get('/classes', authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM trade_classes WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR class_name LIKE ? OR level LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [classes] = await pool.execute(query, params);

    res.json({
      success: true,
      classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
});

// Get class by ID
router.get('/classes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [classes] = await pool.execute('SELECT * FROM trade_classes WHERE id = ?', [id]);

    if (classes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const [students] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, e.enrolled_at
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ? AND e.status = 'active'
    `, [id]);

    res.json({
      success: true,
      class: classes[0],
      students
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class'
    });
  }
});

// Create class
router.post('/classes', authenticateToken, async (req, res) => {
  try {
    const { name, class_name, level } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO trade_classes (name, class_name, level)
      VALUES (?, ?, ?)
    `, [name, class_name, level]);

    res.json({
      success: true,
      message: 'Class created successfully',
      class: { id: result.insertId, name, class_name, level }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create class'
    });
  }
});

// Update class
router.put('/classes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, class_name, level } = req.body;

    const [result] = await pool.execute(`
      UPDATE trade_classes SET
        name = COALESCE(?, name),
        class_name = COALESCE(?, class_name),
        level = COALESCE(?, level)
      WHERE id = ?
    `, [name, class_name, level, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class updated successfully'
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class'
    });
  }
});

// Delete class
router.delete('/classes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM trade_classes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class'
    });
  }
});

// Get all subjects
router.get('/subjects', authenticateToken, async (req, res) => {
  try {
    const [subjects] = await pool.execute('SELECT * FROM subjects ORDER BY name');

    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
});

// Create subject
router.post('/subjects', authenticateToken, async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO subjects (name, code, description)
      VALUES (?, ?, ?)
    `, [name, code, description]);

    res.json({
      success: true,
      message: 'Subject created successfully',
      subject: { id: result.insertId, name, code }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Subject code already exists' : 'Failed to create subject'
    });
  }
});

// Get all enrollments
router.get('/enrollments', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, u.first_name, u.last_name, u.email,
        tc.name as class_name, tc.level
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN trade_classes tc ON e.class_id = tc.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND e.student_id = ?';
      params.push(student_id);
    }
    if (class_id) {
      query += ' AND e.class_id = ?';
      params.push(class_id);
    }
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    query += ' ORDER BY e.enrolled_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [enrollments] = await pool.execute(query, params);

    res.json({
      success: true,
      enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
});

// Create enrollment
router.post('/enrollments', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, status } = req.body;

    if (!student_id || !class_id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Class ID are required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO enrollments (student_id, class_id, status)
      VALUES (?, ?, ?)
    `, [student_id, class_id, status || 'active']);

    res.json({
      success: true,
      message: 'Student enrolled successfully',
      enrollment: { id: result.insertId, student_id, class_id }
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Student already enrolled in this class' : 'Failed to enroll student'
    });
  }
});

// Create grade
router.post('/grades', authenticateToken, async (req, res) => {
  try {
    const {
      student_id,
      course_id,
      subject_id,
      class_id,
      assessment_type,
      score,
      max_score,
      academic_year,
      term,
      assessment_date,
      comments
    } = req.body;

    if (!student_id || !score) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and score are required'
      });
    }

    const percentage = (score / (max_score || 100)) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    const [result] = await pool.execute(`
      INSERT INTO grades (
        student_id, course_id, subject_id, class_id, assessment_type,
        score, max_score, percentage, grade, academic_year, term,
        assessment_date, teacher_id, comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, course_id, subject_id, class_id, assessment_type || 'exam',
      score, max_score || 100, percentage, grade, academic_year, term,
      assessment_date || new Date().toISOString().split('T')[0],
      req.user.id, comments
    ]);

    res.json({
      success: true,
      message: 'Grade recorded successfully',
      grade: { id: result.insertId, student_id, score, grade }
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record grade'
    });
  }
});

// Update grade
router.put('/grades/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { score, max_score, comments } = req.body;

    let updateFields = [];
    let params = [];

    if (score !== undefined) {
      const percentage = (score / (max_score || 100)) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B';
      else if (percentage >= 70) grade = 'C';
      else if (percentage >= 60) grade = 'D';

      updateFields.push('score = ?', 'percentage = ?', 'grade = ?');
      params.push(score, percentage, grade);
    }

    if (max_score !== undefined) {
      updateFields.push('max_score = ?');
      params.push(max_score);
    }

    if (comments !== undefined) {
      updateFields.push('comments = ?');
      params.push(comments);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id);

    const [result] = await pool.execute(`
      UPDATE grades SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      message: 'Grade updated successfully'
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade'
    });
  }
});

// Create attendance
router.post('/attendance', authenticateToken, async (req, res) => {
  try {
    const {
      student_id,
      class_id,
      course_id,
      attendance_date,
      status,
      check_in_time,
      check_out_time,
      notes
    } = req.body;

    if (!student_id || !attendance_date) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and attendance date are required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO attendance (
        student_id, class_id, course_id, attendance_date, status,
        check_in_time, check_out_time, marked_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        check_in_time = VALUES(check_in_time),
        check_out_time = VALUES(check_out_time),
        notes = VALUES(notes),
        marked_by = VALUES(marked_by)
    `, [
      student_id, class_id, course_id, attendance_date, status || 'present',
      check_in_time, check_out_time, req.user.id, notes
    ]);

    res.json({
      success: true,
      message: 'Attendance recorded successfully',
      attendance: { id: result.insertId, student_id, attendance_date, status }
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record attendance'
    });
  }
});

module.exports = router;

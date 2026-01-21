const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ===============================
// COURSES MANAGEMENT
// ===============================

// Get all courses
router.get('/courses', [authenticateToken], async (req, res) => {
  try {
    const [courses] = await pool.execute(`
      SELECT c.*, 
        COUNT(DISTINCT cl.id) as class_count,
        COUNT(DISTINCT e.student_id) as student_count
      FROM courses c
      LEFT JOIN classes cl ON c.id = cl.course_id AND cl.is_active = true
      LEFT JOIN enrollments e ON cl.id = e.class_id AND e.status = 'active'
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create course
router.post('/courses', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster'),
  body('name').notEmpty().withMessage('Course name is required'),
  body('code').notEmpty().withMessage('Course code is required'),
  body('duration_months').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, code, duration_months, fee_amount } = req.body;

    // Check if code already exists
    const [existing] = await pool.execute('SELECT id FROM courses WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO courses (name, description, code, duration_months, fee_amount)
      VALUES (?, ?, ?, ?, ?)
    `, [name, description, code, duration_months, fee_amount || 0]);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: {
        id: result.insertId,
        name,
        description,
        code,
        duration_months,
        fee_amount
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update course
router.put('/courses/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster'),
  body('name').optional().notEmpty().withMessage('Course name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Course code cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, code, duration_months, fee_amount, is_active } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (code) {
      // Check if code already exists (excluding current course)
      const [existing] = await pool.execute('SELECT id FROM courses WHERE code = ? AND id != ?', [code, id]);
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Course code already exists'
        });
      }
      updates.push('code = ?');
      values.push(code);
    }
    if (duration_months) {
      updates.push('duration_months = ?');
      values.push(duration_months);
    }
    if (fee_amount !== undefined) {
      updates.push('fee_amount = ?');
      values.push(fee_amount);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// CLASSES MANAGEMENT
// ===============================

// Get all classes
router.get('/classes', [authenticateToken], async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT cl.*, c.name as course_name, c.code as course_code,
        ay.name as academic_year_name,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        COUNT(e.student_id) as enrolled_students
      FROM classes cl
      JOIN courses c ON cl.course_id = c.id
      JOIN academic_years ay ON cl.academic_year_id = ay.id
      LEFT JOIN users u ON cl.teacher_id = u.id
      LEFT JOIN enrollments e ON cl.id = e.class_id AND e.status = 'active'
      WHERE cl.is_active = true
      GROUP BY cl.id
      ORDER BY c.name, cl.name
    `);

    res.json({
      success: true,
      classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create class
router.post('/classes', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster'),
  body('name').notEmpty().withMessage('Class name is required'),
  body('course_id').isInt().withMessage('Valid course ID is required'),
  body('academic_year_id').isInt().withMessage('Valid academic year ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, course_id, academic_year_id, teacher_id, capacity } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO classes (name, course_id, academic_year_id, teacher_id, capacity)
      VALUES (?, ?, ?, ?, ?)
    `, [name, course_id, academic_year_id, teacher_id || null, capacity || 30]);

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: {
        id: result.insertId,
        name,
        course_id,
        academic_year_id,
        teacher_id,
        capacity
      }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// SUBJECTS MANAGEMENT
// ===============================

// Get subjects by course
router.get('/subjects/course/:courseId', [authenticateToken], async (req, res) => {
  try {
    const { courseId } = req.params;

    const [subjects] = await pool.execute(`
      SELECT s.*, c.name as course_name
      FROM subjects s
      JOIN courses c ON s.course_id = c.id
      WHERE s.course_id = ? AND s.is_active = true
      ORDER BY s.name
    `, [courseId]);

    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create subject
router.post('/subjects', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster'),
  body('name').notEmpty().withMessage('Subject name is required'),
  body('code').notEmpty().withMessage('Subject code is required'),
  body('course_id').isInt().withMessage('Valid course ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, code, description, course_id, credits, is_practical } = req.body;

    // Check if code already exists
    const [existing] = await pool.execute('SELECT id FROM subjects WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO subjects (name, code, description, course_id, credits, is_practical)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, code, description, course_id, credits || 1, is_practical || false]);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject: {
        id: result.insertId,
        name,
        code,
        description,
        course_id,
        credits,
        is_practical
      }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// ENROLLMENTS MANAGEMENT
// ===============================

// Get enrollments
router.get('/enrollments', [authenticateToken], async (req, res) => {
  try {
    const { class_id, student_id, status } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (class_id) {
      whereClause += ' AND e.class_id = ?';
      params.push(class_id);
    }

    if (student_id) {
      whereClause += ' AND e.student_id = ?';
      params.push(student_id);
    }

    if (status) {
      whereClause += ' AND e.status = ?';
      params.push(status);
    }

    const [enrollments] = await pool.execute(`
      SELECT e.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.student_id as student_number,
        cl.name as class_name,
        c.name as course_name,
        ay.name as academic_year_name
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN classes cl ON e.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      JOIN academic_years ay ON e.academic_year_id = ay.id
      ${whereClause}
      ORDER BY e.enrollment_date DESC
    `, params);

    res.json({
      success: true,
      enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create enrollment
router.post('/enrollments', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster'),
  body('student_id').isInt().withMessage('Valid student ID is required'),
  body('class_id').isInt().withMessage('Valid class ID is required'),
  body('academic_year_id').isInt().withMessage('Valid academic year ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { student_id, class_id, academic_year_id, enrollment_date } = req.body;

    // Check if enrollment already exists
    const [existing] = await pool.execute(
      'SELECT id FROM enrollments WHERE student_id = ? AND class_id = ? AND academic_year_id = ?',
      [student_id, class_id, academic_year_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this class'
      });
    }

    // Check class capacity
    const [classInfo] = await pool.execute(`
      SELECT capacity, current_enrollment 
      FROM classes 
      WHERE id = ?
    `, [class_id]);

    if (classInfo.length > 0 && classInfo[0].current_enrollment >= classInfo[0].capacity) {
      return res.status(400).json({
        success: false,
        message: 'Class is at full capacity'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO enrollments (student_id, class_id, academic_year_id, enrollment_date)
      VALUES (?, ?, ?, ?)
    `, [student_id, class_id, academic_year_id, enrollment_date || new Date().toISOString().split('T')[0]]);

    // Update class enrollment count
    await pool.execute(`
      UPDATE classes 
      SET current_enrollment = (
        SELECT COUNT(*) FROM enrollments 
        WHERE class_id = ? AND status = 'active'
      ) 
      WHERE id = ?
    `, [class_id, class_id]);

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      enrollment: {
        id: result.insertId,
        student_id,
        class_id,
        academic_year_id,
        enrollment_date
      }
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// GRADES MANAGEMENT
// ===============================

// Get grades
router.get('/grades', [authenticateToken], async (req, res) => {
  try {
    const { student_id, class_id, subject_id } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (student_id) {
      whereClause += ' AND g.student_id = ?';
      params.push(student_id);
    }

    if (class_id) {
      whereClause += ' AND g.class_id = ?';
      params.push(class_id);
    }

    if (subject_id) {
      whereClause += ' AND g.subject_id = ?';
      params.push(subject_id);
    }

    const [grades] = await pool.execute(`
      SELECT g.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.student_id as student_number,
        s.name as subject_name,
        s.code as subject_code,
        cl.name as class_name,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      JOIN users u ON g.student_id = u.id
      JOIN subjects s ON g.subject_id = s.id
      JOIN classes cl ON g.class_id = cl.id
      JOIN users t ON g.teacher_id = t.id
      ${whereClause}
      ORDER BY g.assessment_date DESC
    `, params);

    res.json({
      success: true,
      grades
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create grade
router.post('/grades', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'teacher'),
  body('student_id').isInt().withMessage('Valid student ID is required'),
  body('subject_id').isInt().withMessage('Valid subject ID is required'),
  body('class_id').isInt().withMessage('Valid class ID is required'),
  body('assessment_name').notEmpty().withMessage('Assessment name is required'),
  body('max_marks').isFloat({ min: 0 }).withMessage('Max marks must be a positive number'),
  body('obtained_marks').isFloat({ min: 0 }).withMessage('Obtained marks must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      student_id, subject_id, class_id, assessment_type, assessment_name,
      max_marks, obtained_marks, assessment_date, comments
    } = req.body;

    // Calculate grade letter
    const percentage = (obtained_marks / max_marks) * 100;
    let grade_letter = 'F';
    if (percentage >= 90) grade_letter = 'A';
    else if (percentage >= 80) grade_letter = 'B';
    else if (percentage >= 70) grade_letter = 'C';
    else if (percentage >= 60) grade_letter = 'D';
    else if (percentage >= 50) grade_letter = 'E';

    const [result] = await pool.execute(`
      INSERT INTO grades (
        student_id, subject_id, class_id, assessment_type, assessment_name,
        max_marks, obtained_marks, grade_letter, assessment_date, teacher_id, comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, subject_id, class_id, assessment_type || 'exam', assessment_name,
      max_marks, obtained_marks, grade_letter, 
      assessment_date || new Date().toISOString().split('T')[0],
      req.user.id, comments
    ]);

    res.status(201).json({
      success: true,
      message: 'Grade recorded successfully',
      grade: {
        id: result.insertId,
        student_id,
        subject_id,
        class_id,
        assessment_name,
        max_marks,
        obtained_marks,
        grade_letter,
        percentage: percentage.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===============================
// ATTENDANCE MANAGEMENT
// ===============================

// Get attendance
router.get('/attendance', [authenticateToken], async (req, res) => {
  try {
    const { student_id, class_id, subject_id, date } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (student_id) {
      whereClause += ' AND a.student_id = ?';
      params.push(student_id);
    }

    if (class_id) {
      whereClause += ' AND a.class_id = ?';
      params.push(class_id);
    }

    if (subject_id) {
      whereClause += ' AND a.subject_id = ?';
      params.push(subject_id);
    }

    if (date) {
      whereClause += ' AND a.attendance_date = ?';
      params.push(date);
    }

    const [attendance] = await pool.execute(`
      SELECT a.*, 
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.student_id as student_number,
        s.name as subject_name,
        cl.name as class_name,
        CONCAT(t.first_name, ' ', t.last_name) as marked_by_name
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes cl ON a.class_id = cl.id
      JOIN users t ON a.marked_by = t.id
      ${whereClause}
      ORDER BY a.attendance_date DESC, u.first_name, u.last_name
    `, params);

    res.json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark attendance
router.post('/attendance', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'teacher'),
  body('student_id').isInt().withMessage('Valid student ID is required'),
  body('class_id').isInt().withMessage('Valid class ID is required'),
  body('subject_id').isInt().withMessage('Valid subject ID is required'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { student_id, class_id, subject_id, status, attendance_date, notes } = req.body;

    const finalDate = attendance_date || new Date().toISOString().split('T')[0];

    // Check if attendance already exists for this date
    const [existing] = await pool.execute(
      'SELECT id FROM attendance WHERE student_id = ? AND class_id = ? AND subject_id = ? AND attendance_date = ?',
      [student_id, class_id, subject_id, finalDate]
    );

    if (existing.length > 0) {
      // Update existing attendance
      await pool.execute(`
        UPDATE attendance 
        SET status = ?, notes = ?, marked_by = ?
        WHERE id = ?
      `, [status, notes, req.user.id, existing[0].id]);

      res.json({
        success: true,
        message: 'Attendance updated successfully'
      });
    } else {
      // Create new attendance record
      const [result] = await pool.execute(`
        INSERT INTO attendance (student_id, class_id, subject_id, attendance_date, status, notes, marked_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [student_id, class_id, subject_id, finalDate, status, notes, req.user.id]);

      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        attendance: {
          id: result.insertId,
          student_id,
          class_id,
          subject_id,
          attendance_date: finalDate,
          status,
          notes
        }
      });
    }
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get academic years
router.get('/academic-years', [authenticateToken], async (req, res) => {
  try {
    const [academicYears] = await pool.execute(
      'SELECT * FROM academic_years ORDER BY start_date DESC'
    );

    res.json({
      success: true,
      academic_years: academicYears
    });
  } catch (error) {
    console.error('Get academic years error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
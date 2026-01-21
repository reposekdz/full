const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get teacher's classes
router.get('/classes', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT c.*, co.name as course_name, co.code as course_code,
        ay.name as academic_year_name,
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN enrollments e ON c.id = e.class_id AND e.status = 'active'
      WHERE c.teacher_id = ? AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `, [req.user.id]);

    res.json({ success: true, classes });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get students in teacher's class
router.get('/classes/:classId/students', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const { classId } = req.params;

    const [authorized] = await pool.execute(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [classId, req.user.id]
    );

    if (authorized.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [students] = await pool.execute(`
      SELECT u.*, e.enrollment_date,
        (SELECT AVG(g.obtained_marks/g.max_marks * 100) 
         FROM grades g WHERE g.student_id = u.id AND g.class_id = ?) as average_grade,
        (SELECT COUNT(*) FROM attendance a 
         WHERE a.student_id = u.id AND a.class_id = ? AND a.status = 'present') as present_count,
        (SELECT COUNT(*) FROM attendance a 
         WHERE a.student_id = u.id AND a.class_id = ?) as total_attendance
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [classId, classId, classId, classId]);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit grades for multiple students
router.post('/grades/bulk', [
  authenticateToken,
  requireRole('teacher'),
  body('grades').isArray().withMessage('Grades must be an array'),
  body('grades.*.student_id').isInt().withMessage('Valid student ID required'),
  body('grades.*.subject_id').isInt().withMessage('Valid subject ID required'),
  body('grades.*.class_id').isInt().withMessage('Valid class ID required'),
  body('grades.*.obtained_marks').isFloat({ min: 0 }).withMessage('Valid marks required'),
  body('grades.*.max_marks').isFloat({ min: 0 }).withMessage('Valid max marks required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { grades } = req.body;
    const insertedGrades = [];

    for (const grade of grades) {
      const percentage = (grade.obtained_marks / grade.max_marks) * 100;
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
        grade.student_id, grade.subject_id, grade.class_id,
        grade.assessment_type || 'exam', grade.assessment_name,
        grade.max_marks, grade.obtained_marks, grade_letter,
        grade.assessment_date || new Date().toISOString().split('T')[0],
        req.user.id, grade.comments
      ]);

      insertedGrades.push({ id: result.insertId, ...grade, grade_letter });
    }

    res.status(201).json({ success: true, message: 'Grades submitted successfully', grades: insertedGrades });
  } catch (error) {
    console.error('Submit grades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark attendance for class
router.post('/attendance/bulk', [
  authenticateToken,
  requireRole('teacher'),
  body('attendance').isArray().withMessage('Attendance must be an array'),
  body('class_id').isInt().withMessage('Valid class ID required'),
  body('subject_id').isInt().withMessage('Valid subject ID required'),
  body('attendance_date').notEmpty().withMessage('Date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { attendance, class_id, subject_id, attendance_date } = req.body;

    for (const record of attendance) {
      const [existing] = await pool.execute(
        'SELECT id FROM attendance WHERE student_id = ? AND class_id = ? AND subject_id = ? AND attendance_date = ?',
        [record.student_id, class_id, subject_id, attendance_date]
      );

      if (existing.length > 0) {
        await pool.execute(
          'UPDATE attendance SET status = ?, notes = ?, marked_by = ? WHERE id = ?',
          [record.status, record.notes, req.user.id, existing[0].id]
        );
      } else {
        await pool.execute(
          'INSERT INTO attendance (student_id, class_id, subject_id, attendance_date, status, notes, marked_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [record.student_id, class_id, subject_id, attendance_date, record.status, record.notes, req.user.id]
        );
      }
    }

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get teacher statistics
router.get('/statistics', authenticateToken, requireRole('teacher'), async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(DISTINCT c.id) FROM classes c WHERE c.teacher_id = ? AND c.is_active = true) as total_classes,
        (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e 
         JOIN classes c ON e.class_id = c.id 
         WHERE c.teacher_id = ? AND e.status = 'active') as total_students,
        (SELECT COUNT(*) FROM grades g WHERE g.teacher_id = ?) as total_grades,
        (SELECT COUNT(*) FROM attendance a WHERE a.marked_by = ?) as total_attendance
    `, [req.user.id, req.user.id, req.user.id, req.user.id]);

    res.json({ success: true, statistics: stats[0] });
  } catch (error) {
    console.error('Get teacher statistics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

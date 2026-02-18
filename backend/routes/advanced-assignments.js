const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/assignments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif|zip|rar|ppt|pptx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, TXT, Images, ZIP, PPT, XLS'));
  }
});

// Get teacher's classes
router.get('/teacher/:teacherId/classes', async (req, res) => {
  try {
    // Try to get classes from dos_classes table
    const [classes] = await pool.query(`
      SELECT DISTINCT c.id, c.name, c.trade_id, c.level_id, t.name as trade_name, l.level_number
      FROM dos_classes c
      LEFT JOIN trades t ON c.trade_id = t.id
      LEFT JOIN levels l ON c.level_id = l.id
      WHERE c.teacher_id = ? OR c.id IN (
        SELECT class_id FROM teacher_class_assignments WHERE teacher_id = ?
      )
      ORDER BY t.name, l.level_number
    `, [req.params.teacherId, req.params.teacherId]);
    
    // If no results, try alternative tables
    if (classes.length === 0) {
      const [altClasses] = await pool.query(`
        SELECT DISTINCT tc.id, tc.name, tc.trade_code, tc.level_number, t.name as trade_name, tc.level_number as level_number
        FROM trade_classes tc
        LEFT JOIN trades t ON tc.trade_code = t.code
        WHERE tc.id IN (
          SELECT class_id FROM teacher_class_assignments WHERE teacher_id = ?
        ) OR tc.teacher_id = ?
        ORDER BY t.name, tc.level_number
      `, [req.params.teacherId, req.params.teacherId]);
      return res.json(altClasses);
    }
    
    res.json(classes);
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    // Return empty array instead of error
    res.json([]);
  }
});

// ============ TEACHER: CREATE & MANAGE ASSIGNMENTS ============

// Create assignment
router.post('/assignments', upload.array('files', 10), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { teacher_id, class_id, course_id, title, description, type, content_type, rich_text_content, total_marks, passing_marks, due_date, allow_late_submission, late_penalty_percent, auto_grade, is_published } = req.body;

    const [result] = await connection.query(
      `INSERT INTO assignments (teacher_id, class_id, course_id, title, description, type, content_type, rich_text_content, total_marks, passing_marks, due_date, allow_late_submission, late_penalty_percent, auto_grade, is_published) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [teacher_id, class_id, course_id, title, description, type, content_type, rich_text_content, total_marks, passing_marks || Math.floor(total_marks * 0.5), due_date, allow_late_submission || false, late_penalty_percent || 0, auto_grade || false, is_published || false]
    );

    const assignmentId = result.insertId;

    // Save uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.query(
          'INSERT INTO assignment_files (assignment_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
          [assignmentId, file.originalname, file.path, file.mimetype, file.size]
        );
      }
    }

    // Initialize analytics
    const [classInfo] = await connection.query('SELECT current_students FROM dos_classes WHERE id = ?', [class_id]);
    await connection.query(
      'INSERT INTO assignment_analytics (assignment_id, class_id, total_students) VALUES (?, ?, ?)',
      [assignmentId, class_id, classInfo[0]?.current_students || 0]
    );

    await connection.commit();
    res.status(201).json({ message: 'Assignment created successfully', id: assignmentId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Error creating assignment' });
  } finally {
    connection.release();
  }
});

// Get assignments by teacher
router.get('/assignments/teacher/:teacherId', async (req, res) => {
  try {
    const [assignments] = await pool.query(`
      SELECT a.*, 
        c.name as class_name, 
        co.name as course_name,
        (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count,
        (SELECT COUNT(*) FROM assignment_submissions s JOIN assignment_grades g ON s.id = g.submission_id WHERE s.assignment_id = a.id) as graded_count
      FROM assignments a
      JOIN dos_classes c ON a.class_id = c.id
      JOIN dos_courses co ON a.course_id = co.id
      WHERE a.teacher_id = ?
      ORDER BY a.created_at DESC
    `, [req.params.teacherId]);

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

// Get single assignment with files
router.get('/assignments/:id', async (req, res) => {
  try {
    const [assignments] = await pool.query(`
      SELECT a.*, 
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        c.name as class_name, 
        co.name as course_name
      FROM assignments a
      JOIN dos_teachers t ON a.teacher_id = t.id
      JOIN dos_classes c ON a.class_id = c.id
      JOIN dos_courses co ON a.course_id = co.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const [files] = await pool.query('SELECT * FROM assignment_files WHERE assignment_id = ?', [req.params.id]);
    
    assignments[0].files = files;
    res.json(assignments[0]);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Error fetching assignment' });
  }
});

// Update assignment
router.put('/assignments/:id', upload.array('files', 10), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { title, description, rich_text_content, total_marks, passing_marks, due_date, allow_late_submission, late_penalty_percent, is_published } = req.body;

    await connection.query(
      `UPDATE assignments SET title = ?, description = ?, rich_text_content = ?, total_marks = ?, passing_marks = ?, due_date = ?, allow_late_submission = ?, late_penalty_percent = ?, is_published = ? WHERE id = ?`,
      [title, description, rich_text_content, total_marks, passing_marks, due_date, allow_late_submission, late_penalty_percent, is_published, req.params.id]
    );

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.query(
          'INSERT INTO assignment_files (assignment_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
          [req.params.id, file.originalname, file.path, file.mimetype, file.size]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Assignment updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Error updating assignment' });
  } finally {
    connection.release();
  }
});

// Delete assignment
router.delete('/assignments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM assignments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Error deleting assignment' });
  }
});

// ============ STUDENT: SUBMIT ASSIGNMENTS ============

// Get assignments for student
router.get('/assignments/student/:studentId', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT class_id FROM students WHERE id = ?', [req.params.studentId]);
    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [assignments] = await pool.query(`
      SELECT a.*, 
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        co.name as course_name,
        s.id as submission_id,
        s.status as submission_status,
        s.submission_date,
        g.marks_obtained,
        g.percentage,
        g.grade,
        g.feedback
      FROM assignments a
      JOIN dos_teachers t ON a.teacher_id = t.id
      JOIN dos_courses co ON a.course_id = co.id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
      LEFT JOIN assignment_grades g ON s.id = g.submission_id
      WHERE a.class_id = ? AND a.is_published = true
      ORDER BY a.due_date DESC
    `, [req.params.studentId, student[0].class_id]);

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

// Submit assignment
router.post('/submissions', upload.array('files', 10), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { assignment_id, student_id, submission_text } = req.body;

    // Check if assignment exists and get due date
    const [assignment] = await connection.query('SELECT due_date, allow_late_submission FROM assignments WHERE id = ?', [assignment_id]);
    if (assignment.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const now = new Date();
    const dueDate = new Date(assignment[0].due_date);
    const isLate = now > dueDate;

    if (isLate && !assignment[0].allow_late_submission) {
      return res.status(400).json({ message: 'Late submissions not allowed' });
    }

    // Create submission
    const [result] = await connection.query(
      'INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, submission_date, is_late) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE submission_text = ?, submission_date = ?, is_late = ?',
      [assignment_id, student_id, submission_text, now, isLate, submission_text, now, isLate]
    );

    const submissionId = result.insertId || (await connection.query('SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?', [assignment_id, student_id]))[0][0].id;

    // Save uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.query(
          'INSERT INTO submission_files (submission_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
          [submissionId, file.originalname, file.path, file.mimetype, file.size]
        );
      }
    }

    // Update analytics
    await updateAnalytics(connection, assignment_id);

    await connection.commit();
    res.status(201).json({ message: 'Submission successful', id: submissionId });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Error submitting assignment' });
  } finally {
    connection.release();
  }
});

// Get submission details
router.get('/submissions/:id', async (req, res) => {
  try {
    const [submissions] = await pool.query(`
      SELECT s.*, 
        CONCAT(st.first_name, ' ', st.last_name) as student_name,
        a.title as assignment_title,
        a.total_marks,
        g.marks_obtained,
        g.percentage,
        g.grade,
        g.feedback
      FROM assignment_submissions s
      JOIN students st ON s.student_id = st.id
      JOIN assignments a ON s.assignment_id = a.id
      LEFT JOIN assignment_grades g ON s.id = g.submission_id
      WHERE s.id = ?
    `, [req.params.id]);

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const [files] = await pool.query('SELECT * FROM submission_files WHERE submission_id = ?', [req.params.id]);
    
    submissions[0].files = files;
    res.json(submissions[0]);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Error fetching submission' });
  }
});

// ============ TEACHER: GRADE SUBMISSIONS ============

// Get submissions for assignment
router.get('/assignments/:assignmentId/submissions', async (req, res) => {
  try {
    const [submissions] = await pool.query(`
      SELECT s.*, 
        CONCAT(st.first_name, ' ', st.last_name) as student_name,
        st.email as student_email,
        g.marks_obtained,
        g.percentage,
        g.grade,
        g.feedback,
        g.graded_at
      FROM assignment_submissions s
      JOIN students st ON s.student_id = st.id
      LEFT JOIN assignment_grades g ON s.id = g.submission_id
      WHERE s.assignment_id = ?
      ORDER BY s.submission_date DESC
    `, [req.params.assignmentId]);

    // Get files for each submission
    for (let submission of submissions) {
      const [files] = await pool.query('SELECT * FROM submission_files WHERE submission_id = ?', [submission.id]);
      submission.files = files;
    }

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

// Grade submission
router.post('/grades', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { submission_id, marks_obtained, total_marks, feedback, graded_by } = req.body;

    const percentage = (marks_obtained / total_marks) * 100;
    const grade = calculateGrade(percentage);

    await connection.query(
      `INSERT INTO assignment_grades (submission_id, marks_obtained, total_marks, percentage, grade, feedback, graded_by, graded_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE marks_obtained = ?, percentage = ?, grade = ?, feedback = ?, graded_at = NOW()`,
      [submission_id, marks_obtained, total_marks, percentage, grade, feedback, graded_by, marks_obtained, percentage, grade, feedback]
    );

    await connection.query('UPDATE assignment_submissions SET status = ? WHERE id = ?', ['graded', submission_id]);

    // Get assignment_id and update analytics
    const [submission] = await connection.query('SELECT assignment_id, student_id FROM assignment_submissions WHERE id = ?', [submission_id]);
    await updateAnalytics(connection, submission[0].assignment_id);
    await updateStudentPerformance(connection, submission[0].student_id);

    await connection.commit();
    res.status(201).json({ success: true, message: 'Graded successfully', percentage, grade });
  } catch (error) {
    await connection.rollback();
    console.error('Error grading submission:', error);
    res.status(500).json({ success: false, message: 'Error grading submission' });
  } finally {
    connection.release();
  }
});

// ============ ANALYTICS & REPORTS ============

// Get assignment analytics
router.get('/analytics/assignment/:assignmentId', async (req, res) => {
  try {
    const [analytics] = await pool.query('SELECT * FROM assignment_analytics WHERE assignment_id = ?', [req.params.assignmentId]);
    
    if (analytics.length === 0) {
      return res.status(404).json({ message: 'Analytics not found' });
    }

    // Get grade distribution
    const [distribution] = await pool.query(`
      SELECT grade, COUNT(*) as count
      FROM assignment_grades g
      JOIN assignment_submissions s ON g.submission_id = s.id
      WHERE s.assignment_id = ?
      GROUP BY grade
    `, [req.params.assignmentId]);

    analytics[0].grade_distribution = distribution;
    res.json(analytics[0]);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Get student performance
router.get('/analytics/student/:studentId', async (req, res) => {
  try {
    const [performance] = await pool.query(`
      SELECT sp.*, 
        c.name as class_name,
        co.name as course_name
      FROM student_performance sp
      JOIN dos_classes c ON sp.class_id = c.id
      JOIN dos_courses co ON sp.course_id = co.id
      WHERE sp.student_id = ?
    `, [req.params.studentId]);

    // Get recent grades
    const [recentGrades] = await pool.query(`
      SELECT g.*, a.title as assignment_title, a.type, a.due_date
      FROM assignment_grades g
      JOIN assignment_submissions s ON g.submission_id = s.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = ?
      ORDER BY g.graded_at DESC
      LIMIT 10
    `, [req.params.studentId]);

    res.json({ performance, recentGrades });
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({ message: 'Error fetching performance' });
  }
});

// Get class performance
router.get('/analytics/class/:classId', async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT sp.*, 
        CONCAT(s.first_name, ' ', s.last_name) as student_name
      FROM student_performance sp
      JOIN students s ON sp.student_id = s.id
      WHERE sp.class_id = ?
      ORDER BY sp.average_percentage DESC
    `, [req.params.classId]);

    res.json(students);
  } catch (error) {
    console.error('Error fetching class performance:', error);
    res.status(500).json({ message: 'Error fetching class performance' });
  }
});

// ============ HELPER FUNCTIONS ============

function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

async function updateAnalytics(connection, assignmentId) {
  const [assignment] = await connection.query('SELECT class_id, passing_marks, total_marks FROM assignments WHERE id = ?', [assignmentId]);
  
  const [stats] = await connection.query(`
    SELECT 
      COUNT(DISTINCT s.id) as submitted_count,
      COUNT(DISTINCT g.id) as graded_count,
      AVG(g.marks_obtained) as avg_marks,
      MAX(g.marks_obtained) as max_marks,
      MIN(g.marks_obtained) as min_marks,
      SUM(CASE WHEN g.marks_obtained >= ? THEN 1 ELSE 0 END) as pass_count,
      SUM(CASE WHEN g.marks_obtained < ? THEN 1 ELSE 0 END) as fail_count,
      SUM(CASE WHEN s.is_late = false THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN s.is_late = true THEN 1 ELSE 0 END) as late
    FROM assignment_submissions s
    LEFT JOIN assignment_grades g ON s.id = g.submission_id
    WHERE s.assignment_id = ?
  `, [assignment[0].passing_marks, assignment[0].passing_marks, assignmentId]);

  const passRate = stats[0].graded_count > 0 ? (stats[0].pass_count / stats[0].graded_count) * 100 : 0;

  await connection.query(`
    UPDATE assignment_analytics SET 
      submitted_count = ?,
      graded_count = ?,
      average_marks = ?,
      highest_marks = ?,
      lowest_marks = ?,
      pass_count = ?,
      fail_count = ?,
      pass_rate = ?,
      on_time_submissions = ?,
      late_submissions = ?
    WHERE assignment_id = ?
  `, [
    stats[0].submitted_count,
    stats[0].graded_count,
    stats[0].avg_marks || 0,
    stats[0].max_marks || 0,
    stats[0].min_marks || 0,
    stats[0].pass_count || 0,
    stats[0].fail_count || 0,
    passRate,
    stats[0].on_time || 0,
    stats[0].late || 0,
    assignmentId
  ]);
}

async function updateStudentPerformance(connection, studentId) {
  const [student] = await connection.query('SELECT class_id FROM students WHERE id = ?', [studentId]);
  
  const [courses] = await connection.query(`
    SELECT DISTINCT a.course_id
    FROM assignments a
    JOIN assignment_submissions s ON a.id = s.assignment_id
    WHERE s.student_id = ? AND a.class_id = ?
  `, [studentId, student[0].class_id]);

  for (const course of courses) {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT s.id) as completed,
        AVG(g.percentage) as avg_percentage,
        SUM(g.marks_obtained) as total_obtained,
        SUM(a.total_marks) as total_possible
      FROM assignments a
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
      LEFT JOIN assignment_grades g ON s.id = g.submission_id
      WHERE a.course_id = ? AND a.class_id = ?
    `, [studentId, course.course_id, student[0].class_id]);

    await connection.query(`
      INSERT INTO student_performance (student_id, class_id, course_id, total_assignments, completed_assignments, average_percentage, total_marks_obtained, total_marks_possible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        total_assignments = ?,
        completed_assignments = ?,
        average_percentage = ?,
        total_marks_obtained = ?,
        total_marks_possible = ?
    `, [
      studentId, student[0].class_id, course.course_id,
      stats[0].total_assignments, stats[0].completed, stats[0].avg_percentage || 0,
      stats[0].total_obtained || 0, stats[0].total_possible || 0,
      stats[0].total_assignments, stats[0].completed, stats[0].avg_percentage || 0,
      stats[0].total_obtained || 0, stats[0].total_possible || 0
    ]);
  }
}

module.exports = router;

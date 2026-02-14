const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ==================== TEACHER DASHBOARD ====================

// Get teacher dashboard overview
router.get('/dashboard', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    
    // Get teacher's classes
    const [classes] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      LEFT JOIN class_enrollments e ON c.id = e.class_id
      WHERE c.teacher_id = ? AND c.status = 'active'
      GROUP BY c.id
    `, [teacherId]);
    
    // Get today's schedule
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const [schedule] = await pool.execute(`
      SELECT 
        t.*,
        c.class_name,
        c.class_code
      FROM timetable t
      JOIN classes c ON t.class_id = c.id
      WHERE t.teacher_id = ? AND t.day_of_week = ?
      ORDER BY t.start_time
    `, [teacherId, today]);
    
    // Get pending assignments to grade
    const [pendingGrading] = await pool.execute(`
      SELECT 
        COUNT(*) as pending_count
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE a.teacher_id = ? AND asub.status = 'submitted' AND asub.grade IS NULL
    `, [teacherId]);
    
    // Get attendance statistics
    const [[attendanceStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance sa
      JOIN classes c ON sa.class_id = c.id
      WHERE c.teacher_id = ? AND sa.attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [teacherId]);
    
    // Get recent activities
    const [recentActivities] = await pool.execute(`
      (SELECT 'assignment' as type, title as description, created_at 
       FROM assignments WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'grading' as type, CONCAT('Graded submission for ', a.title) as description, asub.graded_at as created_at
       FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       WHERE a.teacher_id = ? AND asub.graded_at IS NOT NULL
       ORDER BY asub.graded_at DESC LIMIT 5)
      ORDER BY created_at DESC LIMIT 10
    `, [teacherId, teacherId]);
    
    res.json({
      success: true,
      dashboard: {
        classes,
        todaySchedule: schedule,
        pendingGrading: pendingGrading[0].pending_count,
        attendanceStats,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CLASS MANAGEMENT ====================

// Get teacher's classes with details
router.get('/classes', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { academicYear, term } = req.query;
    
    let conditions = ['c.teacher_id = ?'];
    let params = [teacherId];
    
    if (academicYear) {
      conditions.push('c.academic_year = ?');
      params.push(academicYear);
    }
    if (term) {
      conditions.push('c.term = ?');
      params.push(term);
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    
    const [classes] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(DISTINCT ce.student_id) as student_count,
        ROUND(AVG(CASE WHEN sa.status = 'present' THEN 100 ELSE 0 END), 2) as avg_attendance
      FROM classes c
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
      LEFT JOIN student_attendance sa ON c.id = sa.class_id AND sa.attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.class_code
    `, params);
    
    res.json({ success: true, classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get class students with performance
router.get('/classes/:classId/students', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;
    
    // Verify teacher owns this class
    const [[classCheck]] = await pool.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [classId, teacherId]);
    if (!classCheck) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to class' });
    }
    
    const [students] = await pool.execute(`
      SELECT 
        s.*,
        CONCAT(s.first_name, ' ', s.last_name) as full_name,
        ROUND(AVG(sm.final_marks), 2) as average_marks,
        COUNT(DISTINCT sa.id) as attendance_records,
        SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) as present_count,
        ROUND(SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT sa.id), 2) as attendance_rate
      FROM global_student_sheets s
      JOIN class_enrollments ce ON s.student_id = ce.student_id
      LEFT JOIN student_marks sm ON s.student_id = sm.student_id AND sm.class_id = ?
      LEFT JOIN student_attendance sa ON s.student_id = sa.student_id AND sa.class_id = ?
      WHERE ce.class_id = ?
      GROUP BY s.id
      ORDER BY s.last_name, s.first_name
    `, [classId, classId, classId]);
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ATTENDANCE MANAGEMENT ====================

// Mark attendance for class
router.post('/attendance', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { class_id, attendance_date, attendance_records } = req.body;
    const teacherId = req.user.userId;
    
    // Verify teacher owns this class
    const [[classCheck]] = await pool.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [class_id, teacherId]);
    if (!classCheck) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to class' });
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const record of attendance_records) {
        const [existing] = await connection.execute(`
          SELECT id FROM student_attendance 
          WHERE student_id = ? AND class_id = ? AND attendance_date = ?
        `, [record.student_id, class_id, attendance_date]);
        
        if (existing.length > 0) {
          await connection.execute(`
            UPDATE student_attendance 
            SET status = ?, notes = ?, updated_at = NOW() 
            WHERE id = ?
          `, [record.status, record.notes || null, existing[0].id]);
        } else {
          await connection.execute(`
            INSERT INTO student_attendance (
              student_id, class_id, teacher_id, attendance_date, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [record.student_id, class_id, teacherId, attendance_date, record.status, record.notes || null]);
        }
      }
      
      await connection.commit();
      res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance records for class
router.get('/attendance/class/:classId', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;
    const teacherId = req.user.userId;
    
    // Verify teacher owns this class
    const [[classCheck]] = await pool.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [classId, teacherId]);
    if (!classCheck) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to class' });
    }
    
    let conditions = ['sa.class_id = ?'];
    let params = [classId];
    
    if (startDate) {
      conditions.push('sa.attendance_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('sa.attendance_date <= ?');
      params.push(endDate);
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    
    const [attendance] = await pool.execute(`
      SELECT 
        sa.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code
      FROM student_attendance sa
      JOIN global_student_sheets s ON sa.student_id = s.student_id
      ${whereClause}
      ORDER BY sa.attendance_date DESC, s.last_name, s.first_name
    `, params);
    
    // Get summary
    const [[summary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN sa.status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN sa.status = 'late' THEN 1 ELSE 0 END) as late,
        ROUND(SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance sa
      ${whereClause}
    `, params);
    
    res.json({ success: true, attendance, summary });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GRADES & MARKS ====================

// Add/Update student marks
router.post('/grades', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const {
      student_id,
      class_id,
      subject_id,
      subject_code,
      subject_name,
      academic_year,
      term,
      quiz_marks,
      midterm_marks,
      final_marks,
      remarks
    } = req.body;
    
    const teacherId = req.user.userId;
    
    // Verify teacher owns this class
    const [[classCheck]] = await pool.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [class_id, teacherId]);
    if (!classCheck) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to class' });
    }
    
    // Check if marks exist
    const [existing] = await pool.execute(`
      SELECT id FROM student_marks 
      WHERE student_id = ? AND class_id = ? AND subject_code = ? AND academic_year = ? AND term = ?
    `, [student_id, class_id, subject_code, academic_year, term]);
    
    if (existing.length > 0) {
      await pool.execute(`
        UPDATE student_marks 
        SET quiz_marks = ?, midterm_marks = ?, final_marks = ?, 
            remarks = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
      `, [quiz_marks, midterm_marks, final_marks, remarks, teacherId, existing[0].id]);
      
      res.json({ success: true, message: 'Marks updated successfully' });
    } else {
      await pool.execute(`
        INSERT INTO student_marks (
          student_id, class_id, subject_id, subject_code, subject_name,
          academic_year, term, quiz_marks, midterm_marks, final_marks,
          remarks, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        student_id, class_id, subject_id, subject_code, subject_name,
        academic_year, term, quiz_marks, midterm_marks, final_marks,
        remarks, teacherId
      ]);
      
      res.json({ success: true, message: 'Marks added successfully' });
    }
  } catch (error) {
    console.error('Add/Update marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get marks for class
router.get('/grades/class/:classId', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear, term, subjectCode } = req.query;
    const teacherId = req.user.userId;
    
    // Verify teacher owns this class
    const [[classCheck]] = await pool.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [classId, teacherId]);
    if (!classCheck) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to class' });
    }
    
    let conditions = ['sm.class_id = ?'];
    let params = [classId];
    
    if (academicYear) {
      conditions.push('sm.academic_year = ?');
      params.push(academicYear);
    }
    if (term) {
      conditions.push('sm.term = ?');
      params.push(term);
    }
    if (subjectCode) {
      conditions.push('sm.subject_code = ?');
      params.push(subjectCode);
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    
    const [marks] = await pool.execute(`
      SELECT 
        sm.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        s.trade_code,
        s.level_number
      FROM student_marks sm
      JOIN global_student_sheets s ON sm.student_id = s.student_id
      ${whereClause}
      ORDER BY s.last_name, s.first_name
    `, params);
    
    // Calculate statistics
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        ROUND(AVG(sm.final_marks), 2) as average_marks,
        MAX(sm.final_marks) as highest_marks,
        MIN(sm.final_marks) as lowest_marks,
        SUM(CASE WHEN sm.final_marks >= 50 THEN 1 ELSE 0 END) as pass_count,
        ROUND(SUM(CASE WHEN sm.final_marks >= 50 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate
      FROM student_marks sm
      ${whereClause}
    `, params);
    
    res.json({ success: true, marks, statistics: stats });
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ASSIGNMENTS ====================

// Create assignment
router.post('/assignments', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const {
      class_id,
      title,
      description,
      assignment_type,
      subject_id,
      due_date,
      total_marks,
      instructions,
      attachments
    } = req.body;
    
    const teacherId = req.user.userId;
    
    const [result] = await pool.execute(`
      INSERT INTO assignments (
        class_id, teacher_id, title, description, assignment_type,
        subject_id, due_date, total_marks, instructions, attachments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      class_id, teacherId, title, description, assignment_type,
      subject_id, due_date, total_marks, instructions,
      JSON.stringify(attachments)
    ]);
    
    res.json({
      success: true,
      message: 'Assignment created successfully',
      assignmentId: result.insertId
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher's assignments
router.get('/assignments', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { classId, status } = req.query;
    
    let conditions = ['a.teacher_id = ?'];
    let params = [teacherId];
    
    if (classId) {
      conditions.push('a.class_id = ?');
      params.push(classId);
    }
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    
    const [assignments] = await pool.execute(`
      SELECT 
        a.*,
        c.class_name,
        c.class_code,
        COUNT(DISTINCT asub.id) as submission_count,
        SUM(CASE WHEN asub.status = 'graded' THEN 1 ELSE 0 END) as graded_count
      FROM assignments a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.due_date DESC
    `, params);
    
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assignment submissions
router.get('/assignments/:assignmentId/submissions', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.userId;
    
    // Verify teacher owns this assignment
    const [[assignmentCheck]] = await pool.execute('SELECT id FROM assignments WHERE id = ? AND teacher_id = ?', [assignmentId, teacherId]);
    if (!assignmentCheck) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to assignment' });
    }
    
    const [submissions] = await pool.execute(`
      SELECT 
        asub.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        s.email as student_email
      FROM assignment_submissions asub
      JOIN global_student_sheets s ON asub.student_id = s.student_id
      WHERE asub.assignment_id = ?
      ORDER BY asub.submitted_at DESC
    `, [assignmentId]);
    
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Grade assignment submission
router.post('/assignments/submissions/:submissionId/grade', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback, graded_marks } = req.body;
    const teacherId = req.user.userId;
    
    // Verify teacher owns this assignment
    const [[check]] = await pool.execute(`
      SELECT asub.id 
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE asub.id = ? AND a.teacher_id = ?
    `, [submissionId, teacherId]);
    
    if (!check) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }
    
    await pool.execute(`
      UPDATE assignment_submissions 
      SET grade = ?, feedback = ?, graded_marks = ?, status = 'graded', graded_at = NOW(), graded_by = ?
      WHERE id = ?
    `, [grade, feedback, graded_marks, teacherId, submissionId]);
    
    res.json({ success: true, message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PERFORMANCE TRACKING ====================

// Get class performance analytics
router.get('/analytics/class/:classId/performance', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear, term } = req.query;
    const teacherId = req.user.userId;
    
    // Verify teacher owns this class
    const [[classCheck]] = await pool.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [classId, teacherId]);
    if (!classCheck) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to class' });
    }
    
    // Performance by student
    const [studentPerformance] = await pool.execute(`
      SELECT 
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        ROUND(AVG(sm.final_marks), 2) as average_marks,
        COUNT(sm.id) as subject_count,
        SUM(CASE WHEN sm.final_marks >= 50 THEN 1 ELSE 0 END) as passed_subjects
      FROM global_student_sheets s
      JOIN class_enrollments ce ON s.student_id = ce.student_id
      LEFT JOIN student_marks sm ON s.student_id = sm.student_id AND sm.class_id = ?
      WHERE ce.class_id = ? AND sm.academic_year = ? AND sm.term = ?
      GROUP BY s.student_id, student_name
      ORDER BY average_marks DESC
    `, [classId, classId, academicYear, term]);
    
    // Subject-wise performance
    const [subjectPerformance] = await pool.execute(`
      SELECT 
        sm.subject_code,
        sm.subject_name,
        COUNT(*) as student_count,
        ROUND(AVG(sm.final_marks), 2) as average_marks,
        MAX(sm.final_marks) as highest_marks,
        MIN(sm.final_marks) as lowest_marks
      FROM student_marks sm
      WHERE sm.class_id = ? AND sm.academic_year = ? AND sm.term = ?
      GROUP BY sm.subject_code, sm.subject_name
    `, [classId, academicYear, term]);
    
    res.json({
      success: true,
      analytics: {
        studentPerformance,
        subjectPerformance
      }
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student detailed report
router.get('/reports/student/:studentId', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, term } = req.query;
    
    // Get student info
    const [students] = await pool.execute(`
      SELECT * FROM global_student_sheets WHERE student_id = ?
    `, [studentId]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get marks
    const [marks] = await pool.execute(`
      SELECT 
        sm.*,
        c.class_name,
        c.class_code
      FROM student_marks sm
      LEFT JOIN classes c ON sm.class_id = c.id
      WHERE sm.student_id = ? AND sm.academic_year = ? AND sm.term = ?
      ORDER BY sm.subject_name
    `, [studentId, academicYear, term]);
    
    // Get attendance
    const [[attendance]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM student_attendance
      WHERE student_id = ?
    `, [studentId]);
    
    // Get assignment submissions
    const [assignments] = await pool.execute(`
      SELECT 
        a.title,
        a.total_marks,
        asub.graded_marks,
        asub.grade,
        asub.status,
        asub.submitted_at
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE asub.student_id = ?
      ORDER BY asub.submitted_at DESC
    `, [studentId]);
    
    res.json({
      success: true,
      student: students[0],
      marks,
      attendance,
      assignments
    });
  } catch (error) {
    console.error('Student report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

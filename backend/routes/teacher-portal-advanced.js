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
        c.name as class_name,
        CONCAT(COALESCE(co.code, 'CLS'), '-', c.id) as class_code,
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      WHERE c.teacher_id = ? AND c.is_active = 1
      GROUP BY c.id
    `, [teacherId]);

    // Get today's schedule
    const today = new Date().getDay();
    const [schedule] = await pool.execute(`
      SELECT 
        t.*,
        c.name as class_name,
        c.code as class_code,
        COALESCE(co.name, 'General') as course_name,
        COALESCE(co.code, 'GEN') as course_code,
        t.room_number
      FROM timetable t
      LEFT JOIN classes c ON t.class_id = c.id
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE t.teacher_id = ? AND t.day_of_week = ?
      ORDER BY t.start_time
    `, [teacherId, today]);

    // Get pending assignments to grade (simplified - may need assignments table)
    const [pendingGrading] = await pool.execute(`
      SELECT COUNT(*) as pending_count FROM grades WHERE teacher_id = ? AND grade_letter IS NULL
    `, [teacherId]).catch(() => [[{pending_count: 0}]]);

    // Get attendance statistics
    const [[attendanceStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM attendance sa
      JOIN classes c ON sa.class_id = c.id
      WHERE c.teacher_id = ? AND sa.attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [teacherId]);

    // Get recent activities (simplified)
    const [recentActivities] = await pool.execute(`
      SELECT 'grading' as type, 
             CONCAT('Graded assessment for ', sub.name) as description, 
             g.created_at
      FROM grades g
      LEFT JOIN subjects sub ON g.subject_id = sub.id
      WHERE g.teacher_id = ?
      ORDER BY g.created_at DESC 
      LIMIT 10
    `, [teacherId]).catch(() => [[]]);

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
        c.name as class_name,
        CONCAT(co.code, '-', c.id) as class_code,
        COUNT(DISTINCT ce.student_id) as student_count,
        ROUND(AVG(CASE WHEN sa.status = 'present' THEN 100 ELSE 0 END), 2) as avg_attendance
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN enrollments ce ON c.id = ce.class_id
      LEFT JOIN attendance sa ON c.id = sa.class_id AND sa.attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.name
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
        ROUND(AVG(sm.obtained_marks), 2) as average_marks,
        COUNT(DISTINCT sa.id) as attendance_records,
        SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) as present_count,
        ROUND(SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT sa.id), 2) as attendance_rate
      FROM users s
      JOIN enrollments ce ON s.id = ce.student_id
      LEFT JOIN grades sm ON s.id = sm.student_id AND sm.class_id = ?
      LEFT JOIN attendance sa ON s.id = sa.student_id AND sa.class_id = ?
      WHERE ce.class_id = ? AND s.role_id = (SELECT id FROM roles WHERE name = 'student')
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
          SELECT id FROM attendance 
          WHERE student_id = ? AND class_id = ? AND attendance_date = ?
        `, [record.student_id, class_id, attendance_date]);

        if (existing.length > 0) {
          await connection.execute(`
            UPDATE attendance 
            SET status = ?, notes = ?, updated_at = NOW() 
            WHERE id = ?
          `, [record.status, record.notes || null, existing[0].id]);
        } else {
          await connection.execute(`
            INSERT INTO attendance (
              student_id, class_id, marked_by, attendance_date, status, notes
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
      FROM attendance sa
      JOIN users s ON sa.student_id = s.id
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
      FROM attendance sa
      ${whereClause}
    `, params);

    res.json({ success: true, attendance, summary });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;te) {
      conditions.push('sa.attendance_date <= ?');
      params.push(endDate);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    const [attendance] = await pool.execute(`
      SELECT 
        sa.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code
      FROM attendance sa
      JOIN users s ON sa.student_id = s.id
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
      FROM attendance sa
      ${whereClause}
    `, params);

    res.json({ success: true, attendance, summary });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CONDUCT / IMYITWARIRE (real API, stored in DB) ====================

// Get conduct records for teacher's class students
router.get('/conduct', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { classId } = req.query;
    let sql = `
      SELECT scr.id, scr.student_id, scr.incident_date, scr.description, scr.severity, scr.status,
             scr.created_at, scr.handled_by,
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             u.student_id as student_code
      FROM student_conduct_records scr
      JOIN users u ON scr.student_id = u.id
      JOIN class_enrollments ce ON ce.student_id = u.id
      JOIN classes c ON c.id = ce.class_id AND c.teacher_id = ?
      WHERE 1=1
    `;
    const params = [teacherId];
    if (classId) {
      sql += ' AND c.id = ?';
      params.push(classId);
    }
    sql += ' ORDER BY scr.incident_date DESC LIMIT 100';
    const [records] = await pool.execute(sql, params).catch(() => [[], []]);
    res.json({ success: true, records: Array.isArray(records) ? records : [] });
  } catch (error) {
    console.error('Teacher conduct list error:', error);
    res.json({ success: true, records: [] });
  }
});

// Teacher report conduct (record stored in database; matches discipline table columns)
// student_id can be users.id or student code (resolved to users.id)
router.post('/conduct', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { student_id, class_id, description, severity } = req.body;
    if (!student_id || !description) {
      return res.status(400).json({ success: false, message: 'Student and description required' });
    }
    const [[classCheck]] = await pool.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [class_id, teacherId]);
    if (!classCheck) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this class' });
    }
    const [[userRow]] = await pool.execute('SELECT id FROM users WHERE id = ? OR student_id = ? LIMIT 1', [student_id, String(student_id)]);
    const uid = userRow?.id;
    if (!uid) {
      return res.status(400).json({ success: false, message: 'Student not found' });
    }
    await pool.execute(`
      INSERT INTO student_conduct_records (student_id, incident_date, description, severity, status, reported_by, handled_by, incident_type)
      VALUES (?, CURDATE(), ?, ?, 'pending', ?, ?, 'teacher_report')
    `, [uid, description, severity || 'minor', teacherId, teacherId]);
    res.json({ success: true, message: 'Conduct report submitted. DOD will review.' });
  } catch (error) {
    console.error('Teacher conduct report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Teacher cancel/remove own conduct report (pending only; stored in DB as status=cancelled)
router.delete('/conduct/:id', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const recordId = req.params.id;
    const [[row]] = await pool.execute(
      'SELECT id, reported_by, status FROM student_conduct_records WHERE id = ?',
      [recordId]
    );
    if (!row) {
      return res.status(404).json({ success: false, message: 'Conduct record not found' });
    }
    if (String(row.reported_by) !== String(teacherId)) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own report' });
    }
    if (row.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending reports can be cancelled' });
    }
    await pool.execute('UPDATE student_conduct_records SET status = ? WHERE id = ?', ['cancelled', recordId]);
    res.json({ success: true, message: 'Conduct report cancelled.' });
  } catch (error) {
    console.error('Teacher conduct cancel error:', error);
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
      SELECT id FROM grades 
      WHERE student_id = ? AND class_id = ? AND subject_id = ? AND assessment_date = CURDATE()
    `, [student_id, class_id, subject_id]);

    if (existing.length > 0) {
      await pool.execute(`
        UPDATE grades 
        SET obtained_marks = ?, grade_letter = ?, comments = ?, teacher_id = ?, updated_at = NOW()
        WHERE id = ?
      `, [final_marks, remarks, remarks, teacherId, existing[0].id]);

      res.json({ success: true, message: 'Marks updated successfully' });
    } else {
      await pool.execute(`
        INSERT INTO grades (
          student_id, class_id, subject_id, assessment_type, assessment_name,
          max_marks, obtained_marks, grade_letter, assessment_date, teacher_id, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)
      `, [
        student_id, class_id, subject_id, 'final', subject_name || 'Final Assessment',
        100, final_marks, remarks, teacherId, remarks
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

    let conditions = ['g.class_id = ?'];
    let params = [classId];

    if (academicYear) {
      conditions.push('YEAR(g.assessment_date) = ?');
      params.push(academicYear);
    }
    if (term) {
      conditions.push('QUARTER(g.assessment_date) = ?');
      params.push(term);
    }
    if (subjectCode) {
      conditions.push('g.subject_id = ?');
      params.push(subjectCode);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    const [marks] = await pool.execute(`
      SELECT 
        g.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        sub.name as subject_name
      FROM grades g
      JOIN users s ON g.student_id = s.id
      LEFT JOIN subjects sub ON g.subject_id = sub.id
      ${whereClause}
      ORDER BY s.last_name, s.first_name
    `, params);

    // Calculate statistics
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        ROUND(AVG(g.obtained_marks), 2) as average_marks,
        MAX(g.obtained_marks) as highest_marks,
        MIN(g.obtained_marks) as lowest_marks,
        SUM(CASE WHEN g.obtained_marks >= 50 THEN 1 ELSE 0 END) as pass_count,
        ROUND(SUM(CASE WHEN g.obtained_marks >= 50 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate
      FROM grades g
      ${whereClause}
    `, params);

    res.json({ success: true, marks, statistics: stats });
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ASSIGNMENTS ====================
// Note: Assignment functionality requires additional tables not in current schema

// Create assignment (disabled - requires assignments table)
router.post('/assignments', authenticateToken, requireRole(['teacher']), async (req, res) => {
  res.status(501).json({ success: false, message: 'Assignment functionality not yet implemented' });
});

// Get teacher's assignments (disabled - requires assignments table)
router.get('/assignments', authenticateToken, requireRole(['teacher']), async (req, res) => {
  res.json({ success: true, assignments: [] });
});

// Get assignment submissions (disabled - requires assignments table)
router.get('/assignments/:assignmentId/submissions', authenticateToken, requireRole(['teacher']), async (req, res) => {
  res.json({ success: true, submissions: [] });
});

// Grade assignment submission (disabled - requires assignments table)
router.post('/assignments/submissions/:submissionId/grade', authenticateToken, requireRole(['teacher']), async (req, res) => {
  res.status(501).json({ success: false, message: 'Assignment grading not yet implemented' });
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
        s.id as student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        ROUND(AVG(g.obtained_marks), 2) as average_marks,
        COUNT(g.id) as subject_count,
        SUM(CASE WHEN g.obtained_marks >= 50 THEN 1 ELSE 0 END) as passed_subjects
      FROM users s
      JOIN enrollments ce ON s.id = ce.student_id
      LEFT JOIN grades g ON s.id = g.student_id AND g.class_id = ?
      WHERE ce.class_id = ? AND YEAR(g.assessment_date) = ? AND QUARTER(g.assessment_date) = ?
      GROUP BY s.id, student_name
      ORDER BY average_marks DESC
    `, [classId, classId, academicYear, term]);

    // Subject-wise performance
    const [subjectPerformance] = await pool.execute(`
      SELECT 
        sub.code as subject_code,
        sub.name as subject_name,
        COUNT(*) as student_count,
        ROUND(AVG(g.obtained_marks), 2) as average_marks,
        MAX(g.obtained_marks) as highest_marks,
        MIN(g.obtained_marks) as lowest_marks
      FROM grades g
      LEFT JOIN subjects sub ON g.subject_id = sub.id
      WHERE g.class_id = ? AND YEAR(g.assessment_date) = ? AND QUARTER(g.assessment_date) = ?
      GROUP BY sub.code, sub.name
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
      SELECT * FROM users WHERE id = ? AND role_id = (SELECT id FROM roles WHERE name = 'student')
    `, [studentId]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get marks
    const [marks] = await pool.execute(`
      SELECT 
        g.*,
        c.name as class_name,
        sub.name as subject_name
      FROM grades g
      LEFT JOIN classes c ON g.class_id = c.id
      LEFT JOIN subjects sub ON g.subject_id = sub.id
      WHERE g.student_id = ? AND YEAR(g.assessment_date) = ? AND QUARTER(g.assessment_date) = ?
      ORDER BY sub.name
    `, [studentId, academicYear, term]);

    // Get attendance
    const [[attendance]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
      FROM attendance
      WHERE student_id = ?
    `, [studentId]);

    // Get assignment submissions (disabled - no assignments table)
    const assignments = [];

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

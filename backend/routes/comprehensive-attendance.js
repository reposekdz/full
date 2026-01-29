const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==========================================
// DAILY ATTENDANCE MANAGEMENT (15 endpoints)
// ==========================================

// Get daily attendance for a class
router.get('/daily/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    const [attendance] = await pool.execute(`
      SELECT 
        a.*, u.student_id, u.first_name, u.last_name, u.email,
        tc.class_name, tl.trade_name, tl.level_number
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      JOIN trade_classes tc ON se.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE tc.id = ? AND DATE(a.date) = ?
      ORDER BY u.last_name, u.first_name
    `, [classId, attendanceDate]);
    
    res.json({ success: true, attendance, date: attendanceDate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get daily attendance for a student
router.get('/daily/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT a.*, u.first_name, u.last_name 
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.student_id = ?
    `;
    const params = [studentId];
    
    if (start_date) {
      query += ` AND DATE(a.date) >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND DATE(a.date) <= ?`;
      params.push(end_date);
    }
    
    query += ` ORDER BY a.date DESC`;
    
    const [attendance] = await pool.execute(query, params);
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark attendance for single student
router.post('/mark/student', authenticateToken, requireRole('teacher', 'admin', 'dos', 'headmaster'), async (req, res) => {
  try {
    const { student_id, status, date, notes, period_id } = req.body;
    const marked_by = req.user.id;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    const [result] = await pool.execute(`
      INSERT INTO attendance (student_id, status, date, notes, marked_by, period_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        notes = VALUES(notes),
        marked_by = VALUES(marked_by),
        period_id = VALUES(period_id)
    `, [student_id, status, attendanceDate, notes, marked_by, period_id]);
    
    res.json({ success: true, message: 'Attendance marked successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark attendance for entire class (bulk)
router.post('/mark/class', authenticateToken, requireRole('teacher', 'admin', 'dos', 'headmaster'), async (req, res) => {
  try {
    const { class_id, attendance_records, date, period_id } = req.body;
    const marked_by = req.user.id;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    const values = attendance_records.map(record => 
      [record.student_id, record.status, attendanceDate, record.notes || null, marked_by, period_id]
    );
    
    const query = `
      INSERT INTO attendance (student_id, status, date, notes, marked_by, period_id)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        notes = VALUES(notes),
        marked_by = VALUES(marked_by)
    `;
    
    await pool.query(query, [values]);
    res.json({ success: true, message: `Attendance marked for ${values.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance statistics for a class
router.get('/stats/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [classId];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(a.date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT a.id) as total_records,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_count,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as absent_count,
        COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as late_count,
        COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.id END) as excused_count,
        ROUND((COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / 
          NULLIF(COUNT(DISTINCT a.id), 0)), 2) as attendance_rate
      FROM attendance a
      JOIN student_enrollments se ON a.student_id = se.student_id AND se.is_active = TRUE
      WHERE se.trade_class_id = ? ${dateFilter}
    `, params);
    
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance statistics for a student
router.get('/stats/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [studentId];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused_days,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0)), 2) as attendance_rate
      FROM attendance
      WHERE student_id = ? ${dateFilter}
    `, params);
    
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get daily attendance summary for all classes
router.get('/daily/summary', authenticateToken, requireRole('admin', 'dos', 'headmaster', 'dod'), async (req, res) => {
  try {
    const { date } = req.query;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    const [summary] = await pool.execute(`
      SELECT 
        tc.id as class_id, tc.class_name, tl.trade_name, tl.level_number,
        COUNT(DISTINCT se.student_id) as total_students,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.student_id END) as present,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.student_id END) as absent,
        COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.student_id END) as late,
        COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.student_id END) as excused,
        COUNT(DISTINCT CASE WHEN a.student_id IS NULL THEN se.student_id END) as unmarked
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN student_enrollments se ON tc.id = se.trade_class_id AND se.is_active = TRUE
      LEFT JOIN attendance a ON se.student_id = a.student_id AND DATE(a.date) = ?
      GROUP BY tc.id, tc.class_name, tl.trade_name, tl.level_number
      ORDER BY tl.level_number, tc.class_name
    `, [attendanceDate]);
    
    res.json({ success: true, summary, date: attendanceDate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get unmarked classes for a specific date
router.get('/unmarked', authenticateToken, requireRole('teacher', 'admin', 'dos', 'headmaster'), async (req, res) => {
  try {
    const { date } = req.query;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    const [unmarked] = await pool.execute(`
      SELECT DISTINCT
        tc.id as class_id, tc.class_name, tl.trade_name, tl.level_number,
        COUNT(DISTINCT se.student_id) as total_students,
        COUNT(DISTINCT a.student_id) as marked_students
      FROM trade_classes tc
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      JOIN student_enrollments se ON tc.id = se.trade_class_id AND se.is_active = TRUE
      LEFT JOIN attendance a ON se.student_id = a.student_id AND DATE(a.date) = ?
      GROUP BY tc.id, tc.class_name, tl.trade_name, tl.level_number
      HAVING marked_students < total_students
      ORDER BY tl.level_number, tc.class_name
    `, [attendanceDate]);
    
    res.json({ success: true, unmarked_classes: unmarked, date: attendanceDate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update attendance record
router.put('/update/:attendanceId', authenticateToken, requireRole('teacher', 'admin', 'dos', 'headmaster'), async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, notes } = req.body;
    const modified_by = req.user.id;
    
    await pool.execute(`
      UPDATE attendance 
      SET status = ?, notes = ?, marked_by = ?, updated_at = NOW()
      WHERE id = ?
    `, [status, notes, modified_by, attendanceId]);
    
    res.json({ success: true, message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete attendance record
router.delete('/delete/:attendanceId', authenticateToken, requireRole('admin', 'dos', 'headmaster'), async (req, res) => {
  try {
    const { attendanceId } = req.params;
    
    await pool.execute('DELETE FROM attendance WHERE id = ?', [attendanceId]);
    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance trends for a class (weekly/monthly)
router.get('/trends/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const { period = 'week' } = req.query;
    
    const dateFormat = period === 'week' ? 'YEARWEEK(date)' : 'DATE_FORMAT(date, "%Y-%m")';
    
    const [trends] = await pool.execute(`
      SELECT 
        ${dateFormat} as period,
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0)), 2) as attendance_rate
      FROM attendance a
      JOIN student_enrollments se ON a.student_id = se.student_id AND se.is_active = TRUE
      WHERE se.trade_class_id = ?
      GROUP BY period
      ORDER BY period DESC
      LIMIT 12
    `, [classId]);
    
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students with poor attendance
router.get('/alerts/poor-attendance', authenticateToken, requireRole('admin', 'dos', 'headmaster', 'advisor', 'dod'), async (req, res) => {
  try {
    const { threshold = 75, start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(a.date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    params.push(threshold);
    
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name, u.email,
        tc.class_name, tl.trade_name, tl.level_number,
        COUNT(*) as total_days,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0)), 2) as attendance_rate
      FROM users u
      JOIN attendance a ON u.id = a.student_id
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      JOIN trade_classes tc ON se.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.role = 'student' ${dateFilter}
      GROUP BY u.id, u.student_id, u.first_name, u.last_name, u.email, 
               tc.class_name, tl.trade_name, tl.level_number
      HAVING attendance_rate < ?
      ORDER BY attendance_rate ASC
    `, params);
    
    res.json({ success: true, students, threshold });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get perfect attendance students
router.get('/awards/perfect-attendance', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(a.date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [students] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name, u.email,
        tc.class_name, tl.trade_name, tl.level_number,
        COUNT(*) as total_days,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days
      FROM users u
      JOIN attendance a ON u.id = a.student_id
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      JOIN trade_classes tc ON se.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE u.role = 'student' ${dateFilter}
      GROUP BY u.id, u.student_id, u.first_name, u.last_name, u.email,
               tc.class_name, tl.trade_name, tl.level_number
      HAVING COUNT(*) = COUNT(CASE WHEN a.status = 'present' THEN 1 END)
      ORDER BY total_days DESC
    `, params);
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get late arrivals report
router.get('/reports/late-arrivals', authenticateToken, async (req, res) => {
  try {
    const { date, class_id } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    let classFilter = '';
    const params = [targetDate];
    
    if (class_id) {
      classFilter = 'AND tc.id = ?';
      params.push(class_id);
    }
    
    const [lateStudents] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name,
        tc.class_name, tl.trade_name, tl.level_number,
        a.notes, a.created_at as marked_time
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      JOIN trade_classes tc ON se.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE a.status = 'late' AND DATE(a.date) = ? ${classFilter}
      ORDER BY a.created_at DESC
    `, params);
    
    res.json({ success: true, late_students: lateStudents, date: targetDate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export attendance data (CSV format preparation)
router.get('/export/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [classId];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(a.date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [records] = await pool.execute(`
      SELECT 
        u.student_id, u.first_name, u.last_name, u.email,
        tc.class_name, tl.trade_name, tl.level_number,
        DATE(a.date) as attendance_date, a.status, a.notes,
        CONCAT(marker.first_name, ' ', marker.last_name) as marked_by
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      JOIN trade_classes tc ON se.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN users marker ON a.marked_by = marker.id
      WHERE tc.id = ? ${dateFilter}
      ORDER BY a.date DESC, u.last_name, u.first_name
    `, params);
    
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PERIOD-BASED ATTENDANCE (15 endpoints)
// ==========================================

// Create period attendance record
router.post('/period/mark', authenticateToken, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { student_id, subject_id, period_number, status, date, notes } = req.body;
    const marked_by = req.user.id;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    const [result] = await pool.execute(`
      INSERT INTO period_attendance 
      (student_id, subject_id, period_number, status, date, notes, marked_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        notes = VALUES(notes),
        marked_by = VALUES(marked_by)
    `, [student_id, subject_id, period_number, status, attendanceDate, notes, marked_by]);
    
    res.json({ success: true, message: 'Period attendance marked', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get period attendance for a subject/class
router.get('/period/subject/:subjectId/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { subjectId, classId } = req.params;
    const { date, period_number } = req.query;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    let periodFilter = '';
    const params = [subjectId, classId, attendanceDate];
    
    if (period_number) {
      periodFilter = 'AND pa.period_number = ?';
      params.push(period_number);
    }
    
    const [attendance] = await pool.execute(`
      SELECT 
        pa.*, u.student_id, u.first_name, u.last_name,
        s.name as subject_name, s.code as subject_code
      FROM period_attendance pa
      JOIN users u ON pa.student_id = u.id
      JOIN subjects s ON pa.subject_id = s.id
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      WHERE pa.subject_id = ? AND se.trade_class_id = ? AND DATE(pa.date) = ? ${periodFilter}
      ORDER BY u.last_name, u.first_name
    `, params);
    
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher's period attendance records
router.get('/period/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [teacherId];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(pa.date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [records] = await pool.execute(`
      SELECT 
        pa.*, u.first_name, u.last_name, u.student_id,
        s.name as subject_name, s.code as subject_code,
        tc.class_name
      FROM period_attendance pa
      JOIN users u ON pa.student_id = u.id
      JOIN subjects s ON pa.subject_id = s.id
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      JOIN trade_classes tc ON se.trade_class_id = tc.id
      JOIN teacher_subject_assignments tsa ON s.id = tsa.subject_id 
        AND tc.id = tsa.trade_class_id AND tsa.is_active = TRUE
      WHERE tsa.teacher_id = ? ${dateFilter}
      ORDER BY pa.date DESC, pa.period_number
    `, params);
    
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get period attendance statistics for a student
router.get('/period/stats/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject_id, start_date, end_date } = req.query;
    
    let filters = '';
    const params = [studentId];
    
    if (subject_id) {
      filters += ' AND subject_id = ?';
      params.push(subject_id);
    }
    if (start_date && end_date) {
      filters += ' AND DATE(date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [stats] = await pool.execute(`
      SELECT 
        subject_id, s.name as subject_name,
        COUNT(*) as total_periods,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0)), 2) as attendance_rate
      FROM period_attendance pa
      JOIN subjects s ON pa.subject_id = s.id
      WHERE student_id = ? ${filters}
      GROUP BY subject_id, s.name
    `, params);
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get period attendance summary for today
router.get('/period/today/summary', authenticateToken, requireRole('teacher', 'admin', 'dos'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [summary] = await pool.execute(`
      SELECT 
        period_number,
        COUNT(DISTINCT student_id) as total_students,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(DISTINCT student_id), 0)), 2) as attendance_rate
      FROM period_attendance
      WHERE DATE(date) = ?
      GROUP BY period_number
      ORDER BY period_number
    `, [today]);
    
    res.json({ success: true, summary, date: today });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// LEAVE REQUESTS MANAGEMENT (10 endpoints)
// ==========================================

// Submit leave request
router.post('/leave/request', authenticateToken, async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason, supporting_document_url } = req.body;
    const student_id = req.user.role === 'student' ? req.user.id : req.body.student_id;
    
    const [result] = await pool.execute(`
      INSERT INTO leave_requests 
      (student_id, leave_type, start_date, end_date, reason, supporting_document_url, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [student_id, leave_type, start_date, end_date, reason, supporting_document_url]);
    
    res.json({ success: true, message: 'Leave request submitted', request_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get leave requests (with filters)
router.get('/leave/requests', authenticateToken, async (req, res) => {
  try {
    const { status, student_id, start_date, end_date } = req.query;
    
    let filters = '';
    const params = [];
    
    if (status) {
      filters += ' AND lr.status = ?';
      params.push(status);
    }
    if (student_id) {
      filters += ' AND lr.student_id = ?';
      params.push(student_id);
    }
    if (start_date && end_date) {
      filters += ' AND lr.start_date >= ? AND lr.end_date <= ?';
      params.push(start_date, end_date);
    }
    
    const [requests] = await pool.execute(`
      SELECT 
        lr.*, u.student_id as student_code, u.first_name, u.last_name, u.email,
        tc.class_name, tl.trade_name,
        approver.first_name as approver_first_name,
        approver.last_name as approver_last_name
      FROM leave_requests lr
      JOIN users u ON lr.student_id = u.id
      LEFT JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      LEFT JOIN trade_classes tc ON se.trade_class_id = tc.id
      LEFT JOIN trade_levels tl ON tc.trade_level_id = tl.id
      LEFT JOIN users approver ON lr.approved_by = approver.id
      WHERE 1=1 ${filters}
      ORDER BY lr.created_at DESC
    `, params);
    
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve/Reject leave request
router.put('/leave/request/:requestId/action', authenticateToken, requireRole('dod', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, rejection_reason } = req.body;
    const approved_by = req.user.id;
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    await pool.execute(`
      UPDATE leave_requests 
      SET status = ?, approved_by = ?, rejection_reason = ?, updated_at = NOW()
      WHERE id = ?
    `, [status, approved_by, rejection_reason, requestId]);
    
    res.json({ success: true, message: `Leave request ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get pending leave requests count
router.get('/leave/pending/count', authenticateToken, requireRole('dod', 'admin', 'headmaster'), async (req, res) => {
  try {
    const [result] = await pool.execute(`
      SELECT COUNT(*) as pending_count
      FROM leave_requests
      WHERE status = 'pending'
    `);
    
    res.json({ success: true, count: result[0].pending_count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get leave history for a student
router.get('/leave/history/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [history] = await pool.execute(`
      SELECT lr.*, 
        approver.first_name as approver_first_name,
        approver.last_name as approver_last_name
      FROM leave_requests lr
      LEFT JOIN users approver ON lr.approved_by = approver.id
      WHERE lr.student_id = ?
      ORDER BY lr.created_at DESC
    `, [studentId]);
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// REPORTS & ANALYTICS (10 endpoints)
// ==========================================

// Monthly attendance report
router.get('/reports/monthly', authenticateToken, async (req, res) => {
  try {
    const { year, month, class_id } = req.query;
    
    let classFilter = '';
    const params = [year, month];
    
    if (class_id) {
      classFilter = 'AND tc.id = ?';
      params.push(class_id);
    }
    
    const [report] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name,
        tc.class_name, tl.trade_name,
        COUNT(DISTINCT DATE(a.date)) as total_days,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN DATE(a.date) END) as present_days,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN DATE(a.date) END) as absent_days,
        COUNT(DISTINCT CASE WHEN a.status = 'late' THEN DATE(a.date) END) as late_days,
        ROUND((COUNT(DISTINCT CASE WHEN a.status = 'present' THEN DATE(a.date) END) * 100.0 / 
          NULLIF(COUNT(DISTINCT DATE(a.date)), 0)), 2) as attendance_rate
      FROM users u
      JOIN attendance a ON u.id = a.student_id
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      JOIN trade_classes tc ON se.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE YEAR(a.date) = ? AND MONTH(a.date) = ? ${classFilter}
      GROUP BY u.id, u.student_id, u.first_name, u.last_name, tc.class_name, tl.trade_name
      ORDER BY tc.class_name, u.last_name
    `, params);
    
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Weekly attendance comparison
router.get('/reports/weekly-comparison', authenticateToken, async (req, res) => {
  try {
    const [comparison] = await pool.execute(`
      SELECT 
        YEARWEEK(date) as week,
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0)), 2) as attendance_rate
      FROM attendance
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
      GROUP BY week
      ORDER BY week DESC
    `);
    
    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Class-wise attendance comparison
router.get('/reports/class-comparison', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE DATE(a.date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [comparison] = await pool.execute(`
      SELECT 
        tc.class_name, tl.trade_name, tl.level_number,
        COUNT(*) as total_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0)), 2) as attendance_rate
      FROM attendance a
      JOIN student_enrollments se ON a.student_id = se.student_id AND se.is_active = TRUE
      JOIN trade_classes tc ON se.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      ${dateFilter}
      GROUP BY tc.class_name, tl.trade_name, tl.level_number
      ORDER BY attendance_rate DESC
    `, params);
    
    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Absenteeism patterns
router.get('/reports/absenteeism-patterns', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [patterns] = await pool.execute(`
      SELECT 
        DAYNAME(date) as day_of_week,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(*) as total_records,
        ROUND((COUNT(CASE WHEN status = 'absent' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0)), 2) as absence_rate
      FROM attendance
      WHERE 1=1 ${dateFilter}
      GROUP BY DAYOFWEEK(date), day_of_week
      ORDER BY DAYOFWEEK(date)
    `, params);
    
    res.json({ success: true, patterns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Attendance forecast
router.get('/reports/forecast', authenticateToken, requireRole('admin', 'dos', 'headmaster'), async (req, res) => {
  try {
    const [forecast] = await pool.execute(`
      SELECT 
        DATE_ADD(CURDATE(), INTERVAL seq DAY) as forecast_date,
        (SELECT AVG(daily_rate) FROM (
          SELECT 
            DATE(date) as day,
            COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*) as daily_rate
          FROM attendance
          WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          GROUP BY day
        ) as rates) as predicted_rate
      FROM (
        SELECT 0 as seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
        UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      ) as sequence
    `);
    
    res.json({ success: true, forecast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

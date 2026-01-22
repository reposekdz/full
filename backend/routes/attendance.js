const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Mark attendance
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, subject_id, attendance_date, status, remarks } = req.body;
    const marked_by = req.user.id;

    await pool.query(`
      INSERT INTO attendance (student_id, class_id, subject_id, attendance_date, status, remarks, marked_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        remarks = VALUES(remarks),
        marked_by = VALUES(marked_by)
    `, [student_id, class_id, subject_id, attendance_date, status, remarks, marked_by]);

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
});

// Bulk mark attendance
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { attendance, class_id, subject_id, attendance_date } = req.body;
    const marked_by = req.user.id;

    const values = attendance.map(a => [
      a.student_id, class_id, subject_id, attendance_date, a.status, a.remarks || null, marked_by
    ]);

    await pool.query(`
      INSERT INTO attendance (student_id, class_id, subject_id, attendance_date, status, remarks, marked_by)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        remarks = VALUES(remarks),
        marked_by = VALUES(marked_by)
    `, [values]);

    res.json({ success: true, message: 'Bulk attendance marked successfully' });
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to mark bulk attendance' });
  }
});

// Get attendance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, subject_id, start_date, end_date, status } = req.query;
    
    let query = `
      SELECT a.*, 
        u.first_name, u.last_name, u.student_code,
        c.class_name,
        s.name as subject_name,
        m.first_name as marked_by_first_name, m.last_name as marked_by_last_name
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN classes c ON a.class_id = c.id
      LEFT JOIN subjects s ON a.subject_id = s.id
      LEFT JOIN users m ON a.marked_by = m.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }
    if (class_id) {
      query += ' AND a.class_id = ?';
      params.push(class_id);
    }
    if (subject_id) {
      query += ' AND a.subject_id = ?';
      params.push(subject_id);
    }
    if (start_date) {
      query += ' AND a.attendance_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND a.attendance_date <= ?';
      params.push(end_date);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.attendance_date DESC, u.last_name, u.first_name';

    const [attendance] = await pool.query(query, params);
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

// Get attendance statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
      FROM attendance
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND student_id = ?';
      params.push(student_id);
    }
    if (class_id) {
      query += ' AND class_id = ?';
      params.push(class_id);
    }
    if (start_date) {
      query += ' AND attendance_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND attendance_date <= ?';
      params.push(end_date);
    }

    const [stats] = await pool.query(query, params);
    res.json({ success: true, statistics: stats[0] });
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Get class attendance report
router.get('/class-report/:classId', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const classId = req.params.classId;

    const [students] = await pool.query(`
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.student_code
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [classId]);

    const report = [];

    for (const student of students) {
      const [stats] = await pool.query(`
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
          ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
        FROM attendance
        WHERE student_id = ? AND class_id = ?
        ${start_date ? 'AND attendance_date >= ?' : ''}
        ${end_date ? 'AND attendance_date <= ?' : ''}
      `, [student.id, classId, start_date, end_date].filter(Boolean));

      report.push({
        ...student,
        ...stats[0]
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Error generating class attendance report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

// Delete attendance record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to delete attendance' });
  }
});

module.exports = router;

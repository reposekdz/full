const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { notifyConductRemoval, notifyLeaveApproval } = require('../utils/parentNotifications');

const router = express.Router();

// Get all students with discipline info
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT s.*, 
        COUNT(DISTINCT dr.id) as total_incidents,
        COUNT(DISTINCT sl.id) as total_leaves
      FROM students s
      LEFT JOIN discipline_records dr ON s.id = dr.student_id
      LEFT JOIN student_leaves sl ON s.id = sl.student_id
      GROUP BY s.id
      ORDER BY s.student_code
    `);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Get all trades with discipline stats
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const [trades] = await pool.execute(`
      SELECT 
        s.trade,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT dr.id) as total_incidents,
        SUM(CASE WHEN dr.severity = 'critical' THEN 1 ELSE 0 END) as critical_incidents
      FROM students s
      LEFT JOIN discipline_records dr ON s.id = dr.student_id
      WHERE s.trade IS NOT NULL
      GROUP BY s.trade
      ORDER BY s.trade
    `);
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
});

// Get all classes with discipline stats
router.get('/classes', authenticateToken, async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT 
        s.trade,
        s.class_level,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT dr.id) as total_incidents
      FROM students s
      LEFT JOIN discipline_records dr ON s.id = dr.student_id
      WHERE s.trade IS NOT NULL AND s.class_level IS NOT NULL
      GROUP BY s.trade, s.class_level
      ORDER BY s.trade, s.class_level
    `);
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
});

// Add discipline record (remove conduct)
router.post('/conduct/remove', authenticateToken, async (req, res) => {
  try {
    const { student_id, conduct_type, severity, description, action_taken, lesson_missed } = req.body;
    
    // Get student info
    const [students] = await pool.execute('SELECT * FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = students[0];

    // Insert discipline record
    const [result] = await pool.execute(`
      INSERT INTO discipline_records 
      (student_id, student_code, student_name, trade, class_level, conduct_type, severity, description, action_taken, lesson_missed, removed_by, removed_by_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, student.student_code, student.name, student.trade, student.class_level,
      conduct_type, severity, description, action_taken, lesson_missed,
      req.user.userId, req.user.name
    ]);

    // Auto-notify parents using consolidated utility
    await notifyConductRemoval(student_id, { 
      conduct_type, 
      severity, 
      description, 
      action_taken, 
      removed_by_name: req.user.name 
    }, result.insertId);

    // Update discipline record as notified
    await pool.execute('UPDATE discipline_records SET parent_notified = true WHERE id = ?', [result.insertId]);

    res.json({ success: true, message: 'Conduct removed and parents notified', recordId: result.insertId });
  } catch (error) {
    console.error('Remove conduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove conduct' });
  }
});

// Add student leave
router.post('/leave/add', authenticateToken, async (req, res) => {
  try {
    const { student_id, leave_type, reason, lesson_missed, start_time, end_time } = req.body;
    
    // Get student info
    const [students] = await pool.execute('SELECT * FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = students[0];

    // Insert leave record
    const [result] = await pool.execute(`
      INSERT INTO student_leaves 
      (student_id, student_code, student_name, trade, class_level, leave_type, reason, lesson_missed, start_time, end_time, approved_by, approved_by_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, student.student_code, student.name, student.trade, student.class_level,
      leave_type, reason, lesson_missed, start_time, end_time,
      req.user.userId, req.user.name
    ]);

    // Auto-notify parents using consolidated utility
    await notifyLeaveApproval(student_id, { 
      leave_type, 
      reason, 
      lesson_missed, 
      start_time, 
      end_time, 
      approved_by_name: req.user.name 
    }, result.insertId);

    // Update leave record as notified
    await pool.execute('UPDATE student_leaves SET parent_notified = true WHERE id = ?', [result.insertId]);

    res.json({ success: true, message: 'Leave recorded and parents notified', leaveId: result.insertId });
  } catch (error) {
    console.error('Add leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to record leave' });
  }
});

// Get discipline records with filters
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const { trade, class_level, severity, conduct_type, status } = req.query;
    let query = 'SELECT * FROM discipline_records WHERE 1=1';
    const params = [];

    if (trade) {
      query += ' AND trade = ?';
      params.push(trade);
    }
    if (class_level) {
      query += ' AND class_level = ?';
      params.push(class_level);
    }
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    if (conduct_type) {
      query += ' AND conduct_type = ?';
      params.push(conduct_type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const [records] = await pool.execute(query, params);
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch records' });
  }
});

// Get leave records with filters
router.get('/leaves', authenticateToken, async (req, res) => {
  try {
    const { trade, class_level, leave_type, status } = req.query;
    let query = 'SELECT * FROM student_leaves WHERE 1=1';
    const params = [];

    if (trade) {
      query += ' AND trade = ?';
      params.push(trade);
    }
    if (class_level) {
      query += ' AND class_level = ?';
      params.push(class_level);
    }
    if (leave_type) {
      query += ' AND leave_type = ?';
      params.push(leave_type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const [leaves] = await pool.execute(query, params);
    res.json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leaves' });
  }
});

// Get discipline analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Overall stats
    const [overall] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_severity,
        SUM(CASE WHEN conduct_type = 'warning' THEN 1 ELSE 0 END) as warnings,
        SUM(CASE WHEN conduct_type = 'suspension' THEN 1 ELSE 0 END) as suspensions,
        SUM(CASE WHEN conduct_type = 'absence' THEN 1 ELSE 0 END) as absences
      FROM discipline_records
    `);

    // By trade
    const [byTrade] = await pool.execute(`
      SELECT 
        trade,
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_incidents
      FROM discipline_records
      WHERE trade IS NOT NULL
      GROUP BY trade
      ORDER BY total_incidents DESC
    `);

    // By class
    const [byClass] = await pool.execute(`
      SELECT 
        trade,
        class_level,
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_incidents
      FROM discipline_records
      WHERE trade IS NOT NULL AND class_level IS NOT NULL
      GROUP BY trade, class_level
      ORDER BY total_incidents DESC
    `);

    // Recent trends (last 30 days)
    const [trends] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as incidents
      FROM discipline_records
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Leave stats
    const [leaveStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_leaves,
        SUM(CASE WHEN leave_type = 'sick' THEN 1 ELSE 0 END) as sick_leaves,
        SUM(CASE WHEN leave_type = 'home' THEN 1 ELSE 0 END) as home_leaves,
        SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing_leaves
      FROM student_leaves
    `);

    res.json({
      success: true,
      analytics: {
        overall: overall[0],
        byTrade,
        byClass,
        trends,
        leaveStats: leaveStats[0]
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// Update discipline record status
router.put('/records/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE discipline_records SET status = ?, resolved_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ success: true, message: 'Record updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update record' });
  }
});

// Update leave status
router.put('/leaves/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE student_leaves SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ success: true, message: 'Leave updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update leave' });
  }
});

// Get parent notifications
router.get('/parent/notifications/:parentId', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      'SELECT * FROM parent_discipline_notifications WHERE parent_id = ? ORDER BY created_at DESC',
      [req.params.parentId]
    );
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/parent/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE parent_discipline_notifications SET is_read = true WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// Bulk operations
router.post('/records/bulk-update', authenticateToken, async (req, res) => {
  try {
    const { record_ids, status } = req.body;
    await pool.execute(`UPDATE discipline_records SET status = ? WHERE id IN (${record_ids.join(',')})`, [status]);
    res.json({ success: true, message: `${record_ids.length} records updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk update' });
  }
});

// Export records
router.get('/records/export', authenticateToken, async (req, res) => {
  try {
    const { format, start_date, end_date } = req.query;
    const [records] = await pool.execute(
      'SELECT * FROM discipline_records WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC',
      [start_date || '2024-01-01', end_date || '2024-12-31']
    );
    res.json({ success: true, records, format });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export' });
  }
});

// Student discipline history
router.get('/student/:studentId/history', authenticateToken, async (req, res) => {
  try {
    const [records] = await pool.execute(
      'SELECT * FROM discipline_records WHERE student_id = ? ORDER BY created_at DESC',
      [req.params.studentId]
    );
    const [leaves] = await pool.execute(
      'SELECT * FROM student_leaves WHERE student_id = ? ORDER BY created_at DESC',
      [req.params.studentId]
    );
    res.json({ success: true, records, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// Discipline trends
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const [daily] = await pool.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM discipline_records
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    const [weekly] = await pool.execute(`
      SELECT WEEK(created_at) as week, COUNT(*) as count
      FROM discipline_records
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
      GROUP BY WEEK(created_at)
      ORDER BY week
    `);
    res.json({ success: true, trends: { daily, weekly } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trends' });
  }
});

// Top offenders
router.get('/top-offenders', authenticateToken, async (req, res) => {
  try {
    const [offenders] = await pool.execute(`
      SELECT student_id, student_code, student_name, trade, class_level, COUNT(*) as total_incidents
      FROM discipline_records
      GROUP BY student_id
      ORDER BY total_incidents DESC
      LIMIT 10
    `);
    res.json({ success: true, offenders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch offenders' });
  }
});

// Conduct reports by date range
router.get('/reports/conduct', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, trade, severity } = req.query;
    let query = 'SELECT * FROM discipline_records WHERE created_at BETWEEN ? AND ?';
    const params = [start_date || '2024-01-01', end_date || '2024-12-31'];
    if (trade) { query += ' AND trade = ?'; params.push(trade); }
    if (severity) { query += ' AND severity = ?'; params.push(severity); }
    query += ' ORDER BY created_at DESC';
    const [records] = await pool.execute(query, params);
    res.json({ success: true, records, count: records.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

// Leave reports
router.get('/reports/leaves', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, leave_type } = req.query;
    let query = 'SELECT * FROM student_leaves WHERE created_at BETWEEN ? AND ?';
    const params = [start_date || '2024-01-01', end_date || '2024-12-31'];
    if (leave_type) { query += ' AND leave_type = ?'; params.push(leave_type); }
    query += ' ORDER BY created_at DESC';
    const [leaves] = await pool.execute(query, params);
    res.json({ success: true, leaves, count: leaves.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

// Discipline summary by period
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly
    let dateFormat = '%Y-%m-%d';
    if (period === 'weekly') dateFormat = '%Y-%u';
    if (period === 'monthly') dateFormat = '%Y-%m';
    
    const [summary] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM discipline_records
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY period
      ORDER BY period DESC
    `, [dateFormat]);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// Student behavior score
router.get('/student/:studentId/behavior-score', authenticateToken, async (req, res) => {
  try {
    const [incidents] = await pool.execute(
      'SELECT COUNT(*) as count, severity FROM discipline_records WHERE student_id = ? GROUP BY severity',
      [req.params.studentId]
    );
    let score = 100;
    incidents.forEach(inc => {
      if (inc.severity === 'critical') score -= inc.count * 20;
      else if (inc.severity === 'high') score -= inc.count * 10;
      else if (inc.severity === 'medium') score -= inc.count * 5;
      else if (inc.severity === 'low') score -= inc.count * 2;
    });
    res.json({ success: true, score: Math.max(0, score), incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate score' });
  }
});

// Delete record
router.delete('/records/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM discipline_records WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete record' });
  }
});

// Delete leave
router.delete('/leaves/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM student_leaves WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Leave deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete leave' });
  }
});

module.exports = router;

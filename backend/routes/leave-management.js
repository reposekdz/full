const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all leaves with student info
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        l.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id,
        s.phone_number,
        TIMESTAMPDIFF(HOUR, l.start_time, COALESCE(l.end_time, NOW())) as duration_hours
      FROM student_leave l
      JOIN student_sheets s ON l.student_id = s.student_id
      ORDER BY l.created_at DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      const leaves = results.map(leave => ({
        ...leave,
        duration: leave.duration_hours ? `${leave.duration_hours}h` : 'N/A',
        status: leave.end_time && new Date(leave.end_time) < new Date() ? 'completed' : 'active'
      }));
      
      res.json({ success: true, leaves });
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create/Grant leave
router.post('/grant', authenticateToken, async (req, res) => {
  try {
    const { student_id, leave_type, reason, start_time, end_time, approved_by, approved_by_name } = req.body;
    
    if (!student_id || !leave_type || !reason || !start_time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = `
      INSERT INTO student_leave 
      (student_id, leave_type, reason, start_time, end_time, approved_by, approved_by_name, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `;
    
    db.query(query, [student_id, leave_type, reason, start_time, end_time || null, approved_by, approved_by_name], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({ success: true, message: 'Leave granted successfully', leaveId: result.insertId });
    });
  } catch (error) {
    console.error('Error granting leave:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get leave statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM student_leave',
      active: 'SELECT COUNT(*) as count FROM student_leave WHERE end_time IS NULL OR end_time > NOW()',
      sick: 'SELECT COUNT(*) as count FROM student_leave WHERE leave_type = "sick"',
      month: 'SELECT COUNT(*) as count FROM student_leave WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())'
    };
    
    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) reject(err);
          else {
            results[key] = result[0].count;
            resolve();
          }
        });
      });
    }
    
    res.json({
      success: true,
      statistics: {
        total_leaves: results.total,
        active_leaves: results.active,
        sick_leaves: results.sick,
        month_leaves: results.month
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Log user activity
router.post('/log-activity', authenticateToken, async (req, res) => {
  try {
    const { action, details, ip_address } = req.body;
    const userId = req.user.userId || req.user.id;

    await pool.execute(`
      INSERT INTO user_activity_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [userId, action, details || null, ip_address || req.ip]);

    res.json({ success: true, message: 'Activity logged' });
  } catch (error) {
    console.error('Activity logging error:', error);
    res.status(500).json({ success: false, message: 'Failed to log activity' });
  }
});

// Get user activity logs
router.get('/activity-logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const [logs] = await pool.execute(`
      SELECT action, details, ip_address, created_at
      FROM user_activity_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get activity logs' });
  }
});

// Get system-wide activity logs (admin only)
router.get('/admin/activity-logs', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userRole = req.user.role;
    if (!['admin', 'headmaster'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { limit = 100, offset = 0, action, user_id } = req.query;
    let query = `
      SELECT ual.*, 
             COALESCE(au.username, u.username) as username,
             COALESCE(au.email, u.email) as email,
             COALESCE(au.role, u.role) as role
      FROM user_activity_logs ual
      LEFT JOIN admin_users au ON ual.user_id = au.id
      LEFT JOIN users u ON ual.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      query += ' AND ual.action = ?';
      params.push(action);
    }

    if (user_id) {
      query += ' AND ual.user_id = ?';
      params.push(parseInt(user_id));
    }

    query += ' ORDER BY ual.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await pool.execute(query, params);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Get admin activity logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get activity logs' });
  }
});

// Security dashboard stats
router.get('/security-stats', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    if (!['admin', 'headmaster'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get various security statistics
    const [credentialChanges] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM user_activity_logs
      WHERE action = 'force_credential_change'
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [loginAttempts] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM user_activity_logs
      WHERE action IN ('login_success', 'login_failed')
      AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    const [usersNeedingChange] = await pool.execute(`
      SELECT COUNT(*) as admin_count
      FROM admin_users
      WHERE must_change_password = 1
    `);

    const [regularUsersNeedingChange] = await pool.execute(`
      SELECT COUNT(*) as user_count
      FROM users
      WHERE must_change_password = 1
    `);

    const [recentActivity] = await pool.execute(`
      SELECT action, COUNT(*) as count
      FROM user_activity_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        credential_changes_30d: credentialChanges[0].count,
        login_attempts_24h: loginAttempts[0].count,
        users_needing_change: usersNeedingChange[0].admin_count + regularUsersNeedingChange[0].user_count,
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Security stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get security stats' });
  }
});

module.exports = router;
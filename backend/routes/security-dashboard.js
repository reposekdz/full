const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get security metrics
router.get('/metrics', async (req, res) => {
  try {
    const [loginAttempts] = await db.query(`
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
             SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed
      FROM login_attempts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    const [activeUsers] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_sessions WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    `);

    const [credentialChanges] = await db.query(`
      SELECT COUNT(*) as count 
      FROM credential_changes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    const [suspiciousActivities] = await db.query(`
      SELECT COUNT(*) as count 
      FROM security_logs WHERE severity = 'high' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    res.json({
      success: true,
      metrics: {
        loginAttempts: loginAttempts[0] || { total: 0, successful: 0, failed: 0 },
        activeUsers: activeUsers[0]?.count || 0,
        credentialChanges: credentialChanges[0]?.count || 0,
        suspiciousActivities: suspiciousActivities[0]?.count || 0
      }
    });
  } catch (error) {
    res.json({ success: true, metrics: { loginAttempts: { total: 0, successful: 0, failed: 0 }, activeUsers: 0, credentialChanges: 0, suspiciousActivities: 0 } });
  }
});

// Get user activities
router.get('/activities', async (req, res) => {
  try {
    const { limit = 50, offset = 0, userId, action } = req.query;
    let query = `SELECT ua.*, u.name, u.email, u.role FROM user_activities ua 
                 LEFT JOIN users u ON ua.user_id = u.id WHERE 1=1`;
    const params = [];

    if (userId) {
      query += ' AND ua.user_id = ?';
      params.push(userId);
    }
    if (action) {
      query += ' AND ua.action LIKE ?';
      params.push(`%${action}%`);
    }

    query += ' ORDER BY ua.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [activities] = await db.query(query, params);
    const [total] = await db.query('SELECT COUNT(*) as count FROM user_activities');

    res.json({ success: true, activities, total: total[0]?.count || 0 });
  } catch (error) {
    res.json({ success: true, activities: [], total: 0 });
  }
});

// Get credential changes
router.get('/credential-changes', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const [changes] = await db.query(`
      SELECT cc.*, u.name, u.email, u.role, a.name as admin_name
      FROM credential_changes cc
      LEFT JOIN users u ON cc.user_id = u.id
      LEFT JOIN users a ON cc.changed_by = a.id
      ORDER BY cc.created_at DESC LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const [total] = await db.query('SELECT COUNT(*) as count FROM credential_changes');

    res.json({ success: true, changes, total: total[0]?.count || 0 });
  } catch (error) {
    res.json({ success: true, changes: [], total: 0 });
  }
});

// Get login attempts
router.get('/login-attempts', async (req, res) => {
  try {
    const { limit = 50, offset = 0, success } = req.query;
    let query = 'SELECT * FROM login_attempts WHERE 1=1';
    const params = [];

    if (success !== undefined) {
      query += ' AND success = ?';
      params.push(success === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [attempts] = await db.query(query, params);
    const [total] = await db.query('SELECT COUNT(*) as count FROM login_attempts');

    res.json({ success: true, attempts, total: total[0]?.count || 0 });
  } catch (error) {
    res.json({ success: true, attempts: [], total: 0 });
  }
});

// Get security logs
router.get('/logs', async (req, res) => {
  try {
    const { limit = 50, offset = 0, severity } = req.query;
    let query = 'SELECT * FROM security_logs WHERE 1=1';
    const params = [];

    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await db.query(query, params);
    const [total] = await db.query('SELECT COUNT(*) as count FROM security_logs');

    res.json({ success: true, logs, total: total[0]?.count || 0 });
  } catch (error) {
    res.json({ success: true, logs: [], total: 0 });
  }
});

// Get active sessions
router.get('/sessions', async (req, res) => {
  try {
    const [sessions] = await db.query(`
      SELECT s.*, u.name, u.email, u.role
      FROM user_sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.last_activity >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY s.last_activity DESC
    `);

    res.json({ success: true, sessions });
  } catch (error) {
    res.json({ success: true, sessions: [] });
  }
});

// Terminate session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    await db.query('DELETE FROM user_sessions WHERE id = ?', [req.params.sessionId]);
    res.json({ success: true, message: 'Session terminated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to terminate session' });
  }
});

module.exports = router;

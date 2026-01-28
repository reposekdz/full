const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get user notifications
router.get('/:userId', async (req, res) => {
  try {
    const { limit = 50, unread_only } = req.query;
    let query = 'SELECT * FROM realtime_notifications WHERE user_id = ?';
    const params = [req.params.userId];
    
    if (unread_only === 'true') query += ' AND is_read = 0';
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [notifications] = await pool.execute(query, params);
    const [unreadCount] = await pool.execute('SELECT COUNT(*) as count FROM realtime_notifications WHERE user_id = ? AND is_read = 0', [req.params.userId]);
    
    res.json({ success: true, notifications, unreadCount: unreadCount[0].count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    const { user_id, title, message, type, priority, action_url, metadata } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO realtime_notifications (user_id, title, message, type, priority, action_url, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, message, type, priority || 'normal', action_url, JSON.stringify(metadata)]
    );
    
    const notification = { id: result.insertId, user_id, title, message, type, priority, action_url, metadata, created_at: new Date() };
    
    // Emit via WebSocket if available
    if (global.io) {
      global.io.to(`user_${user_id}`).emit('notification', notification);
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Broadcast notification to multiple users
router.post('/broadcast', async (req, res) => {
  try {
    const { user_ids, title, message, type, priority, action_url } = req.body;
    
    const values = user_ids.map(uid => [uid, title, message, type, priority || 'normal', action_url]);
    await pool.execute(
      'INSERT INTO realtime_notifications (user_id, title, message, type, priority, action_url) VALUES ?',
      [values]
    );
    
    if (global.io) {
      user_ids.forEach(uid => {
        global.io.to(`user_${uid}`).emit('notification', { title, message, type, priority });
      });
    }
    
    res.json({ success: true, sent: user_ids.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
  try {
    await pool.execute('UPDATE realtime_notifications SET is_read = 1, read_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all as read
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await pool.execute('UPDATE realtime_notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0', [req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM realtime_notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get notification preferences
router.get('/preferences/:userId', async (req, res) => {
  try {
    const [prefs] = await pool.execute('SELECT * FROM notification_preferences WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true, preferences: prefs[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update notification preferences
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { email_enabled, sms_enabled, push_enabled, notification_types } = req.body;
    
    await pool.execute(
      'INSERT INTO notification_preferences (user_id, email_enabled, sms_enabled, push_enabled, notification_types) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email_enabled = ?, sms_enabled = ?, push_enabled = ?, notification_types = ?',
      [req.params.userId, email_enabled, sms_enabled, push_enabled, JSON.stringify(notification_types), email_enabled, sms_enabled, push_enabled, JSON.stringify(notification_types)]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

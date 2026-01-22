const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { is_read, type, limit = 50 } = req.query;
    const userId = req.user.id;

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(is_read === 'true');
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [notifications] = await pool.query(query, params);

    const [unreadCount] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ 
      success: true, 
      notifications,
      unread_count: unreadCount[0].count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Create notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, title, message, type, link } = req.body;

    const [result] = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?)
    `, [user_id, title, message, type || 'info', link]);

    res.json({ success: true, message: 'Notification created', notificationId: result.insertId });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// Broadcast notification to multiple users
router.post('/broadcast', authenticateToken, async (req, res) => {
  try {
    const { user_ids, title, message, type, link } = req.body;

    const values = user_ids.map(userId => [userId, title, message, type || 'info', link]);

    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES ?
    `, [values]);

    res.json({ success: true, message: 'Notifications broadcasted successfully' });
  } catch (error) {
    console.error('Error broadcasting notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notifications' });
  }
});

// Broadcast to role
router.post('/broadcast-role', authenticateToken, async (req, res) => {
  try {
    const { role, title, message, type, link } = req.body;

    const [users] = await pool.query('SELECT id FROM users WHERE role = ? AND is_active = TRUE', [role]);
    
    if (users.length === 0) {
      return res.json({ success: true, message: 'No users found for this role' });
    }

    const values = users.map(user => [user.id, title, message, type || 'info', link]);

    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES ?
    `, [values]);

    res.json({ success: true, message: `Notifications sent to ${users.length} users` });
  } catch (error) {
    console.error('Error broadcasting to role:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query(`
      UPDATE notifications 
      SET is_read = TRUE, read_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await pool.query(`
      UPDATE notifications 
      SET is_read = TRUE, read_at = NOW()
      WHERE user_id = ? AND is_read = FALSE
    `, [req.user.id]);

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

// Delete all read notifications
router.delete('/clear-read', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE user_id = ? AND is_read = TRUE', [req.user.id]);
    res.json({ success: true, message: 'Read notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
});

module.exports = router;

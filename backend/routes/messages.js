const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user messages
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type = 'received', limit = 50 } = req.query;
    const userId = req.user.id;

    let query;
    if (type === 'received') {
      query = `
        SELECT m.*, 
          u.first_name as sender_first_name, 
          u.last_name as sender_last_name,
          u.profile_image as sender_image,
          u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.recipient_id = ?
        ORDER BY m.created_at DESC
        LIMIT ?
      `;
    } else {
      query = `
        SELECT m.*, 
          u.first_name as recipient_first_name, 
          u.last_name as recipient_last_name,
          u.profile_image as recipient_image,
          u.role as recipient_role
        FROM messages m
        JOIN users u ON m.recipient_id = u.id
        WHERE m.sender_id = ?
        ORDER BY m.created_at DESC
        LIMIT ?
      `;
    }

    const [messages] = await pool.query(query, [userId, parseInt(limit)]);

    const [unreadCount] = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ 
      success: true, 
      messages,
      unread_count: unreadCount[0].count
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const [messages] = await pool.query(`
      SELECT m.*, 
        s.first_name as sender_first_name, 
        s.last_name as sender_last_name,
        s.profile_image as sender_image,
        r.first_name as recipient_first_name,
        r.last_name as recipient_last_name,
        r.profile_image as recipient_image
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.recipient_id = r.id
      WHERE (m.sender_id = ? AND m.recipient_id = ?)
         OR (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at ASC
    `, [currentUserId, otherUserId, otherUserId, currentUserId]);

    // Mark messages as read
    await pool.query(`
      UPDATE messages 
      SET is_read = TRUE, read_at = NOW()
      WHERE sender_id = ? AND recipient_id = ? AND is_read = FALSE
    `, [otherUserId, currentUserId]);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipient_id, subject, message } = req.body;
    const sender_id = req.user.id;

    const [result] = await pool.query(`
      INSERT INTO messages (sender_id, recipient_id, subject, message)
      VALUES (?, ?, ?, ?)
    `, [sender_id, recipient_id, subject, message]);

    // Create notification for recipient
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, 'info', '/messages')
    `, [recipient_id, 'New Message', `You have a new message from ${req.user.first_name} ${req.user.last_name}`]);

    res.json({ success: true, message: 'Message sent successfully', messageId: result.insertId });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query(`
      UPDATE messages 
      SET is_read = TRUE, read_at = NOW()
      WHERE id = ? AND recipient_id = ?
    `, [req.params.id, req.user.id]);

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark message as read' });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(`
      DELETE FROM messages 
      WHERE id = ? AND (sender_id = ? OR recipient_id = ?)
    `, [req.params.id, req.user.id, req.user.id]);

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

// Get message statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM messages WHERE recipient_id = ?) as total_received,
        (SELECT COUNT(*) FROM messages WHERE sender_id = ?) as total_sent,
        (SELECT COUNT(*) FROM messages WHERE recipient_id = ? AND is_read = FALSE) as unread_count,
        (SELECT COUNT(*) FROM messages WHERE recipient_id = ? AND is_read = TRUE) as read_count
    `, [userId, userId, userId, userId]);

    res.json({ success: true, statistics: stats[0] });
  } catch (error) {
    console.error('Error fetching message statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Get recent contacts
router.get('/contacts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [contacts] = await pool.query(`
      SELECT DISTINCT
        u.id, u.first_name, u.last_name, u.profile_image, u.role,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND recipient_id = ? AND is_read = FALSE) as unread_count,
        (SELECT message FROM messages WHERE (sender_id = u.id AND recipient_id = ?) OR (sender_id = ? AND recipient_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE (sender_id = u.id AND recipient_id = ?) OR (sender_id = ? AND recipient_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM users u
      WHERE u.id IN (
        SELECT DISTINCT sender_id FROM messages WHERE recipient_id = ?
        UNION
        SELECT DISTINCT recipient_id FROM messages WHERE sender_id = ?
      )
      AND u.is_active = TRUE
      ORDER BY last_message_time DESC
      LIMIT 20
    `, [userId, userId, userId, userId, userId, userId, userId]);

    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

module.exports = router;

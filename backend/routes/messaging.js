const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Role-based messaging permissions
const MESSAGING_PERMISSIONS = {
  admin: ['admin', 'headmaster', 'dos', 'dod', 'patron', 'accountant', 'stock_manager', 'teacher', 'student', 'parent'],
  headmaster: ['admin', 'headmaster', 'dos', 'dod', 'patron', 'accountant', 'stock_manager', 'teacher', 'student', 'parent'],
  dos: ['admin', 'headmaster', 'dos', 'teacher', 'student', 'parent'],
  dod: ['admin', 'headmaster', 'dod', 'patron', 'student', 'parent'],
  patron: ['admin', 'headmaster', 'dod', 'patron', 'student', 'parent'],
  accountant: ['admin', 'headmaster', 'accountant', 'student', 'parent'],
  stock_manager: ['admin', 'headmaster', 'stock_manager'],
  teacher: ['admin', 'headmaster', 'dos', 'teacher', 'student', 'parent'],
  student: ['teacher', 'dos', 'dod', 'patron'],
  parent: ['admin', 'headmaster', 'dos', 'dod', 'patron', 'teacher', 'accountant']
};

// Get allowed recipients for user
router.get('/allowed-recipients', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const allowedRoles = MESSAGING_PERMISSIONS[userRole] || [];
    
    const [users] = await pool.execute(`
      SELECT id, name, email, role FROM users 
      WHERE role IN (${allowedRoles.map(() => '?').join(',')}) AND is_active = true
      ORDER BY role, name
    `, allowedRoles);
    
    res.json({ success: true, recipients: users, allowedRoles });
  } catch (error) {
    console.error('Get recipients error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recipients' });
  }
});

// Send message with role validation
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipient_ids, recipient_type, subject, message, priority, attachment_url, scheduled_time } = req.body;
    const sender_id = req.user.userId;
    const sender_name = req.user.name;
    const sender_role = req.user.role;
    
    // Validate permissions
    const allowedRoles = MESSAGING_PERMISSIONS[sender_role] || [];
    
    // Get recipient roles
    const [recipients] = await pool.execute(`
      SELECT id, role, email FROM users WHERE id IN (${recipient_ids.map(() => '?').join(',')})
    `, recipient_ids);
    
    // Check if sender can message all recipients
    for (const recipient of recipients) {
      if (!allowedRoles.includes(recipient.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `You don't have permission to message ${recipient.role}s` 
        });
      }
    }
    
    // Insert messages
    const messageIds = [];
    for (const recipient of recipients) {
      const [result] = await pool.execute(`
        INSERT INTO messages 
        (sender_id, sender_name, sender_role, recipient_id, recipient_role, recipient_type, subject, message, priority, attachment_url, scheduled_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sender_id, sender_name, sender_role, 
        recipient.id, recipient.role, recipient_type || 'direct',
        subject, message, priority || 'normal', 
        attachment_url || null, scheduled_time || null,
        scheduled_time ? 'scheduled' : 'sent'
      ]);
      messageIds.push(result.insertId);
      
      // Create notification
      await pool.execute(`
        INSERT INTO notifications 
        (user_id, type, title, message, link, priority)
        VALUES (?, 'message', ?, ?, ?, ?)
      `, [recipient.id, `New message from ${sender_name}`, subject, `/messages/${result.insertId}`, priority || 'normal']);
    }
    
    res.json({ success: true, message: 'Messages sent successfully', messageIds });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send messages' });
  }
});

// Broadcast message to role
router.post('/broadcast', authenticateToken, async (req, res) => {
  try {
    const { target_roles, subject, message, priority } = req.body;
    const sender_id = req.user.userId;
    const sender_name = req.user.name;
    const sender_role = req.user.role;
    
    // Only admin and headmaster can broadcast
    if (!['admin', 'headmaster'].includes(sender_role)) {
      return res.status(403).json({ success: false, message: 'Only admin and headmaster can broadcast' });
    }
    
    const [recipients] = await pool.execute(`
      SELECT id, role FROM users WHERE role IN (${target_roles.map(() => '?').join(',')}) AND is_active = true
    `, target_roles);
    
    for (const recipient of recipients) {
      await pool.execute(`
        INSERT INTO messages 
        (sender_id, sender_name, sender_role, recipient_id, recipient_role, recipient_type, subject, message, priority, status)
        VALUES (?, ?, ?, ?, ?, 'broadcast', ?, ?, ?, 'sent')
      `, [sender_id, sender_name, sender_role, recipient.id, recipient.role, subject, message, priority || 'normal']);
      
      await pool.execute(`
        INSERT INTO notifications (user_id, type, title, message, priority)
        VALUES (?, 'broadcast', ?, ?, ?)
      `, [recipient.id, `Broadcast from ${sender_name}`, subject, priority || 'normal']);
    }
    
    res.json({ success: true, message: `Broadcast sent to ${recipients.length} users` });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast' });
  }
});

// Get inbox messages
router.get('/inbox', authenticateToken, async (req, res) => {
  try {
    const { filter, priority, unread_only } = req.query;
    let query = 'SELECT * FROM messages WHERE recipient_id = ?';
    const params = [req.user.userId];
    
    if (filter) { query += ' AND (subject LIKE ? OR message LIKE ?)'; params.push(`%${filter}%`, `%${filter}%`); }
    if (priority) { query += ' AND priority = ?'; params.push(priority); }
    if (unread_only === 'true') { query += ' AND is_read = false'; }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const [messages] = await pool.execute(query, params);
    const [unreadCount] = await pool.execute('SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = false', [req.user.userId]);
    
    res.json({ success: true, messages, unreadCount: unreadCount[0].count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Get sent messages
router.get('/sent', authenticateToken, async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, u.name as recipient_name FROM messages m
      LEFT JOIN users u ON m.recipient_id = u.id
      WHERE m.sender_id = ?
      ORDER BY m.created_at DESC LIMIT 100
    `, [req.user.userId]);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sent messages' });
  }
});

// Get message by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, 
        sender.name as sender_full_name, sender.email as sender_email,
        recipient.name as recipient_full_name, recipient.email as recipient_email
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      WHERE m.id = ? AND (m.sender_id = ? OR m.recipient_id = ?)
    `, [req.params.id, req.user.userId, req.user.userId]);
    
    if (messages.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    res.json({ success: true, message: messages[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch message' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE messages SET is_read = true, read_at = NOW() WHERE id = ? AND recipient_id = ?', [req.params.id, req.user.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// Reply to message
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const [originalMsg] = await pool.execute('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    
    if (originalMsg.length === 0) {
      return res.status(404).json({ success: false, message: 'Original message not found' });
    }
    
    const original = originalMsg[0];
    const recipient_id = original.sender_id === req.user.userId ? original.recipient_id : original.sender_id;
    
    const [result] = await pool.execute(`
      INSERT INTO messages 
      (sender_id, sender_name, sender_role, recipient_id, recipient_role, subject, message, priority, parent_message_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent')
    `, [req.user.userId, req.user.name, req.user.role, recipient_id, original.sender_role, `Re: ${original.subject}`, message, original.priority, req.params.id]);
    
    await pool.execute(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (?, 'message', ?, ?, ?)
    `, [recipient_id, `Reply from ${req.user.name}`, `Re: ${original.subject}`, `/messages/${result.insertId}`]);
    
    res.json({ success: true, messageId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE messages SET deleted_by_recipient = true WHERE id = ? AND recipient_id = ?', [req.params.id, req.user.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

// Get notifications
router.get('/notifications/all', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC LIMIT 50
    `, [req.user.userId]);
    
    const [unreadCount] = await pool.execute('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false', [req.user.userId]);
    
    res.json({ success: true, notifications, unreadCount: unreadCount[0].count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = true WHERE user_id = ?', [req.user.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

// Delete notification
router.delete('/notifications/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

// Get message statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_received,
        SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent
      FROM messages WHERE recipient_id = ?
    `, [req.user.userId]);
    
    const [sentStats] = await pool.execute('SELECT COUNT(*) as total_sent FROM messages WHERE sender_id = ?', [req.user.userId]);
    
    res.json({ success: true, stats: { ...stats[0], ...sentStats[0] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;

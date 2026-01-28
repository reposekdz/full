const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const smsService = require('../services/smsService');

module.exports = (io) => {
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

  // Send message
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { recipient_id, subject, message } = req.body;
      const sender_id = req.user.id;

      // 1. Save to database
      const [result] = await pool.query(`
        INSERT INTO messages (sender_id, recipient_id, subject, message)
        VALUES (?, ?, ?, ?)
      `, [sender_id, recipient_id, subject, message]);

      const messageId = result.insertId;

      // 2. Fetch recipient details for SMS logic
      const [recipients] = await pool.query(
        'SELECT role, phone, phone_type, first_name, last_name FROM users WHERE id = ?',
        [recipient_id]
      );

      const recipient = recipients[0];

      // 3. Send SMS if recipient is a parent with a basic phone
      if (recipient && recipient.role === 'parent' && recipient.phone_type === 'basic' && recipient.phone) {
        const smsMessage = `Message from Garden TVET: ${subject}. ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
        await smsService.sendSMS(recipient.phone, smsMessage, sender_id);
      }

      // 4. Broadcast via Socket.io for real-time delivery
      if (io) {
        io.to(`user_${recipient_id}`).emit('new_message', {
          id: messageId,
          sender_id,
          sender_name: `${req.user.first_name} ${req.user.last_name}`,
          subject,
          message,
          created_at: new Date()
        });
      }

      // 5. Create notification
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'info', '/messages')
      `, [recipient_id, 'New Message', `You have a new message from ${req.user.first_name} ${req.user.last_name}`]);

      res.json({ success: true, message: 'Message sent successfully', messageId });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  });

  // Send message - Alias for POST / (for advanced student profile feature)
  router.post('/send', authenticateToken, async (req, res) => {
    try {
      const { recipient_id, subject, message } = req.body;
      const sender_id = req.user.id;

      // 1. Save to database
      const [result] = await pool.query(`
        INSERT INTO messages (sender_id, recipient_id, subject, message)
        VALUES (?, ?, ?, ?)
      `, [sender_id, recipient_id, subject, message]);

      const messageId = result.insertId;

      // 2. Fetch recipient details for SMS logic
      const [recipients] = await pool.query(
        'SELECT role, phone, phone_type, first_name, last_name FROM users WHERE id = ?',
        [recipient_id]
      );

      const recipient = recipients[0];

      // 3. Send SMS if recipient is a student or parent with phone
      if (recipient && recipient.phone) {
        const smsMessage = `Message from Garden TVET: ${subject}. ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
        try {
          await smsService.sendSMS(recipient.phone, smsMessage, sender_id);
        } catch (smsError) {
          console.error('SMS sending failed:', smsError);
        }
      }

      // 4. Broadcast via Socket.io for real-time delivery
      if (io) {
        io.to(`user_${recipient_id}`).emit('new_message', {
          id: messageId,
          sender_id,
          sender_name: `${req.user.first_name} ${req.user.last_name}`,
          subject,
          message,
          created_at: new Date()
        });
      }

      // 5. Create notification
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'info', '/messages')
      `, [recipient_id, 'New Message', `You have a new message from ${req.user.first_name} ${req.user.last_name}`]);

      res.json({ success: true, message: 'Message sent successfully', messageId });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  });

  // Get conversation
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

  return router;
};

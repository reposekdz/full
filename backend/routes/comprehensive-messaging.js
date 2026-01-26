const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendSMS, sendBulkSMS } = require('../services/smsService');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/messages/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images and documents are allowed'));
  }
});

// ======================
// STAFF TO PARENT MESSAGING
// ======================

// Send message to specific parent(s)
router.post('/staff/send-to-parent', authenticateToken, requireRole('staff', 'teacher', 'admin'), [
  body('parent_ids').isArray().notEmpty().withMessage('At least one parent ID required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).optional(),
  body('send_sms').isBoolean().optional()
], upload.array('attachments', 5), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { parent_ids, subject, message, priority, send_sms, category } = req.body;
    const sender_id = req.user.id;

    const attachments = req.files ? req.files.map(f => f.path) : [];

    // Insert message for each parent
    const messagePromises = parent_ids.map(async (parent_id) => {
      const [result] = await connection.execute(`
        INSERT INTO messages (
          sender_id, recipient_id, recipient_type, subject, message, 
          priority, category, attachments, status, created_at
        ) VALUES (?, ?, 'parent', ?, ?, ?, ?, ?, 'sent', NOW())
      `, [sender_id, parent_id, subject, message, priority || 'normal', 
          category || 'general', JSON.stringify(attachments)]);

      // Get parent details for SMS
      const [parents] = await connection.execute(`
        SELECT p.phone, p.has_smartphone, p.first_name, u.email
        FROM parents p
        LEFT JOIN users u ON p.parent_code = u.serial_code
        WHERE p.id = ?
      `, [parent_id]);

      if (parents.length > 0 && send_sms && !parents[0].has_smartphone) {
        const smsMessage = `${subject}: ${message.substring(0, 140)}... - School`;
        await sendSMS(parents[0].phone, smsMessage, sender_id, { 
          type: 'staff_to_parent_message',
          message_id: result.insertId 
        });
      }

      // Create notification
      await connection.execute(`
        INSERT INTO notifications (
          user_id, type, title, message, reference_id, reference_type, created_at
        ) VALUES (
          (SELECT id FROM users WHERE serial_code = (SELECT parent_code FROM parents WHERE id = ?)),
          'message', ?, ?, ?, 'message', NOW()
        )
      `, [parent_id, subject, message.substring(0, 200), result.insertId]);

      return result.insertId;
    });

    const messageIds = await Promise.all(messagePromises);

    // Log activity
    await connection.execute(`
      INSERT INTO activity_logs (
        user_id, action, entity_type, entity_id, details, created_at
      ) VALUES (?, 'send_message', 'message', ?, ?, NOW())
    `, [sender_id, messageIds[0], JSON.stringify({ 
      recipients: parent_ids.length, 
      subject, 
      priority 
    })]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Messages sent successfully',
      data: {
        message_ids: messageIds,
        recipients: parent_ids.length,
        sms_sent: send_sms ? parent_ids.length : 0
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  } finally {
    connection.release();
  }
});

// Send bulk message to class parents
router.post('/staff/send-to-class', authenticateToken, requireRole('staff', 'teacher', 'admin'), [
  body('class_id').notEmpty().withMessage('Class ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).optional(),
  body('send_sms').isBoolean().optional()
], upload.array('attachments', 5), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { class_id, subject, message, priority, send_sms, category } = req.body;
    const sender_id = req.user.id;

    // Get all parents of students in the class
    const [parents] = await connection.execute(`
      SELECT DISTINCT p.id, p.phone, p.has_smartphone, p.first_name,
             (SELECT id FROM users WHERE serial_code = p.parent_code) as user_id
      FROM parents p
      JOIN parent_student ps ON p.id = ps.parent_id
      JOIN students s ON ps.student_id = s.id
      WHERE s.class_id = ? AND p.status = 'active'
    `, [class_id]);

    const attachments = req.files ? req.files.map(f => f.path) : [];
    const messageIds = [];
    const smsRecipients = [];

    // Send message to each parent
    for (const parent of parents) {
      const [result] = await connection.execute(`
        INSERT INTO messages (
          sender_id, recipient_id, recipient_type, subject, message, 
          priority, category, attachments, status, created_at
        ) VALUES (?, ?, 'parent', ?, ?, ?, ?, ?, 'sent', NOW())
      `, [sender_id, parent.id, subject, message, priority || 'normal', 
          category || 'class_communication', JSON.stringify(attachments)]);

      messageIds.push(result.insertId);

      // Create notification
      if (parent.user_id) {
        await connection.execute(`
          INSERT INTO notifications (
            user_id, type, title, message, reference_id, reference_type, created_at
          ) VALUES (?, 'message', ?, ?, ?, 'message', NOW())
        `, [parent.user_id, subject, message.substring(0, 200), result.insertId]);
      }

      // Prepare SMS for non-smartphone parents
      if (send_sms && !parent.has_smartphone) {
        smsRecipients.push(parent.phone);
      }
    }

    // Send bulk SMS
    if (smsRecipients.length > 0) {
      const smsMessage = `${subject}: ${message.substring(0, 140)}... - School`;
      await sendBulkSMS(smsRecipients, smsMessage, sender_id, { 
        type: 'class_bulk_message',
        class_id 
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Class messages sent successfully',
      data: {
        message_ids: messageIds,
        recipients: parents.length,
        sms_sent: smsRecipients.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Send class message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  } finally {
    connection.release();
  }
});

// Send message to all parents (school-wide)
router.post('/staff/send-to-all-parents', authenticateToken, requireRole('admin', 'headmaster'), [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).optional(),
  body('send_sms').isBoolean().optional()
], upload.array('attachments', 5), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { subject, message, priority, send_sms, category } = req.body;
    const sender_id = req.user.id;

    // Get all active parents
    const [parents] = await connection.execute(`
      SELECT p.id, p.phone, p.has_smartphone, p.first_name,
             (SELECT id FROM users WHERE serial_code = p.parent_code) as user_id
      FROM parents p
      WHERE p.status = 'active'
    `);

    const attachments = req.files ? req.files.map(f => f.path) : [];
    const messageIds = [];
    const smsRecipients = [];

    // Batch insert messages (more efficient)
    const batchSize = 100;
    for (let i = 0; i < parents.length; i += batchSize) {
      const batch = parents.slice(i, i + batchSize);
      
      const values = batch.map(p => 
        `(${sender_id}, ${p.id}, 'parent', ${connection.escape(subject)}, ${connection.escape(message)}, '${priority || 'normal'}', '${category || 'school_announcement'}', '${JSON.stringify(attachments)}', 'sent', NOW())`
      ).join(',');

      await connection.execute(`
        INSERT INTO messages (
          sender_id, recipient_id, recipient_type, subject, message, 
          priority, category, attachments, status, created_at
        ) VALUES ${values}
      `);

      // Create notifications
      for (const parent of batch) {
        if (parent.user_id) {
          await connection.execute(`
            INSERT INTO notifications (
              user_id, type, title, message, reference_id, reference_type, created_at
            ) VALUES (?, 'message', ?, ?, 0, 'message', NOW())
          `, [parent.user_id, subject, message.substring(0, 200)]);
        }

        if (send_sms && !parent.has_smartphone) {
          smsRecipients.push(parent.phone);
        }
      }
    }

    // Send bulk SMS in batches of 100
    if (smsRecipients.length > 0) {
      const smsMessage = `${subject}: ${message.substring(0, 140)}... - School`;
      for (let i = 0; i < smsRecipients.length; i += 100) {
        const smsBatch = smsRecipients.slice(i, i + 100);
        await sendBulkSMS(smsBatch, smsMessage, sender_id, { 
          type: 'school_wide_message' 
        });
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'School-wide messages sent successfully',
      data: {
        recipients: parents.length,
        sms_sent: smsRecipients.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Send all parents message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  } finally {
    connection.release();
  }
});

// Get staff sent messages
router.get('/staff/sent-messages', authenticateToken, requireRole('staff', 'teacher', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, priority, category } = req.query;
    const offset = (page - 1) * limit;
    const sender_id = req.user.id;

    let query = `
      SELECT m.*, 
             CONCAT(u.first_name, ' ', u.last_name) as recipient_name,
             p.phone as recipient_phone,
             mr.read_at,
             mr.replied_at
      FROM messages m
      LEFT JOIN users u ON m.recipient_id = u.id AND m.recipient_type = 'parent'
      LEFT JOIN parents p ON m.recipient_id = p.id
      LEFT JOIN message_reads mr ON m.id = mr.message_id
      WHERE m.sender_id = ?
    `;
    const params = [sender_id];

    if (priority) {
      query += ' AND m.priority = ?';
      params.push(priority);
    }

    if (category) {
      query += ' AND m.category = ?';
      params.push(category);
    }

    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [messages] = await pool.execute(query, params);

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM messages WHERE sender_id = ?',
      [sender_id]
    );

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get sent messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Get parent inbox
router.get('/parent/inbox', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only, priority } = req.query;
    const offset = (page - 1) * limit;

    // Get parent ID from user
    const [parentData] = await pool.execute(
      'SELECT id FROM parents WHERE parent_code = (SELECT serial_code FROM users WHERE id = ?)',
      [req.user.id]
    );

    if (parentData.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const parent_id = parentData[0].id;

    let query = `
      SELECT m.*, 
             CONCAT(s.first_name, ' ', s.last_name) as sender_name,
             s.role as sender_role,
             mr.read_at,
             mr.replied_at
      FROM messages m
      LEFT JOIN users s ON m.sender_id = s.id
      LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = ?
      WHERE m.recipient_id = ? AND m.recipient_type = 'parent'
    `;
    const params = [req.user.id, parent_id];

    if (unread_only === 'true') {
      query += ' AND mr.read_at IS NULL';
    }

    if (priority) {
      query += ' AND m.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [messages] = await pool.execute(query, params);

    // Get unread count
    const [unreadCount] = await pool.execute(`
      SELECT COUNT(*) as unread
      FROM messages m
      LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = ?
      WHERE m.recipient_id = ? AND m.recipient_type = 'parent' AND mr.read_at IS NULL
    `, [req.user.id, parent_id]);

    res.json({
      success: true,
      data: messages,
      unread_count: unreadCount[0].unread,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get parent inbox error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Mark message as read
router.post('/parent/mark-read/:message_id', authenticateToken, requireRole('parent'), async (req, res) => {
  try {
    const { message_id } = req.params;

    await pool.execute(`
      INSERT INTO message_reads (message_id, user_id, read_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE read_at = NOW()
    `, [message_id, req.user.id]);

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark message as read' });
  }
});

// Reply to message
router.post('/parent/reply/:message_id', authenticateToken, requireRole('parent'), [
  body('message').notEmpty().withMessage('Reply message is required')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { message_id } = req.params;
    const { message } = req.body;

    // Get original message details
    const [originalMessage] = await connection.execute(
      'SELECT sender_id, subject FROM messages WHERE id = ?',
      [message_id]
    );

    if (originalMessage.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Original message not found' });
    }

    // Get parent ID
    const [parentData] = await connection.execute(
      'SELECT id FROM parents WHERE parent_code = (SELECT serial_code FROM users WHERE id = ?)',
      [req.user.id]
    );

    // Create reply message
    await connection.execute(`
      INSERT INTO messages (
        sender_id, recipient_id, recipient_type, subject, message, 
        parent_message_id, status, created_at
      ) VALUES (?, ?, 'staff', ?, ?, ?, 'sent', NOW())
    `, [parentData[0].id, originalMessage[0].sender_id, 
        `Re: ${originalMessage[0].subject}`, message, message_id]);

    // Mark as replied
    await connection.execute(`
      UPDATE message_reads SET replied_at = NOW()
      WHERE message_id = ? AND user_id = ?
    `, [message_id, req.user.id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Reply sent successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Reply error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  } finally {
    connection.release();
  }
});

// Get message statistics for staff
router.get('/staff/message-stats', authenticateToken, requireRole('staff', 'teacher', 'admin'), async (req, res) => {
  try {
    const sender_id = req.user.id;

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_sent,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_messages,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        (SELECT COUNT(*) FROM message_reads mr 
         JOIN messages m ON mr.message_id = m.id 
         WHERE m.sender_id = ?) as total_read,
        (SELECT COUNT(*) FROM messages WHERE sender_id = ? AND parent_message_id IS NOT NULL) as replies_received
      FROM messages
      WHERE sender_id = ?
    `, [sender_id, sender_id, sender_id]);

    res.json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('Message stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Get conversation thread
router.get('/conversation/:message_id', authenticateToken, async (req, res) => {
  try {
    const { message_id } = req.params;

    const [messages] = await pool.execute(`
      SELECT m.*,
             CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
             sender.role as sender_role,
             mr.read_at
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = ?
      WHERE m.id = ? OR m.parent_message_id = ?
      ORDER BY m.created_at ASC
    `, [req.user.id, message_id, message_id]);

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
});

module.exports = router;

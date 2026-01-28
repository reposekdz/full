const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.post('/send-message', async (req, res) => {
  try {
    const { sender_id, recipient_id, subject, message, priority } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO messages (sender_id, recipient_id, subject, message, priority, sent_at, created_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [sender_id, recipient_id, subject, message, priority || 'normal']
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/send-bulk-message', async (req, res) => {
  try {
    const { sender_id, recipient_ids, subject, message, priority } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const recipient_id of recipient_ids) {
        await connection.execute(
          `INSERT INTO messages (sender_id, recipient_id, subject, message, priority, sent_at, created_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [sender_id, recipient_id, subject, message, priority || 'normal']
        );
      }
      
      await connection.commit();
      res.json({ success: true, count: recipient_ids.length });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inbox/:userId', async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, u.first_name as sender_first_name, u.last_name as sender_last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.recipient_id = ?
      ORDER BY m.sent_at DESC
      LIMIT 100
    `, [req.params.userId]);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sent/:userId', async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, u.first_name as recipient_first_name, u.last_name as recipient_last_name
      FROM messages m
      JOIN users u ON m.recipient_id = u.id
      WHERE m.sender_id = ?
      ORDER BY m.sent_at DESC
      LIMIT 100
    `, [req.params.userId]);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/messages/:id', async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, 
        s.first_name as sender_first_name, s.last_name as sender_last_name,
        r.first_name as recipient_first_name, r.last_name as recipient_last_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.recipient_id = r.id
      WHERE m.id = ?
    `, [req.params.id]);
    
    if (messages.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    res.json({ success: true, message: messages[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/messages/:id/read', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE messages SET read_at = NOW() WHERE id = ? AND read_at IS NULL',
      [req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    await pool.execute('UPDATE messages SET deleted = true WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/unread-count/:userId', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND read_at IS NULL',
      [req.params.userId]
    );
    
    res.json({ success: true, count: result[0].count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/send-announcement', async (req, res) => {
  try {
    const { title, content, target_audience, priority, created_by } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO announcements (title, content, target_audience, priority, created_by, publish_date, status, created_at)
       VALUES (?, ?, ?, ?, ?, NOW(), 'published', NOW())`,
      [title, content, target_audience, priority, created_by]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const { target_audience, status } = req.query;
    
    let query = `
      SELECT a.*, u.first_name, u.last_name
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (target_audience) {
      query += ' AND a.target_audience = ?';
      params.push(target_audience);
    }
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY a.publish_date DESC LIMIT 50';
    
    const [announcements] = await pool.execute(query, params);
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/announcements/:id', async (req, res) => {
  try {
    const [announcements] = await pool.execute(`
      SELECT a.*, u.first_name, u.last_name
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `, [req.params.id]);
    
    if (announcements.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    await pool.execute(
      'UPDATE announcements SET view_count = view_count + 1 WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, announcement: announcements[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/announcements/:id', async (req, res) => {
  try {
    const { title, content, target_audience, priority, status } = req.body;
    
    await pool.execute(
      `UPDATE announcements 
       SET title = ?, content = ?, target_audience = ?, priority = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, content, target_audience, priority, status, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/announcements/:id', async (req, res) => {
  try {
    await pool.execute('UPDATE announcements SET status = "archived" WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/send-sms', async (req, res) => {
  try {
    const { phone_numbers, message, sender_id } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const phone of phone_numbers) {
        const [result] = await connection.execute(
          `INSERT INTO sms_logs (phone_number, message, sender_id, status, created_at)
           VALUES (?, ?, ?, 'pending', NOW())`,
          [phone, message, sender_id]
        );
      }
      
      await connection.commit();
      res.json({ success: true, count: phone_numbers.length });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sms-logs', async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM sms_logs WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (start_date && end_date) {
      query += ' AND created_at BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const [logs] = await pool.execute(query, params);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sms-statistics', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM sms_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/send-email', async (req, res) => {
  try {
    const { recipients, subject, body, sender_id } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const recipient of recipients) {
        await connection.execute(
          `INSERT INTO email_logs (recipient_email, subject, body, sender_id, status, created_at)
           VALUES (?, ?, ?, ?, 'pending', NOW())`,
          [recipient, subject, body, sender_id]
        );
      }
      
      await connection.commit();
      res.json({ success: true, count: recipients.length });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/email-logs', async (req, res) => {
  try {
    const [logs] = await pool.execute(
      'SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100'
    );
    
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { user_id, title, message, type, link } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, link, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [user_id, title, message, type, link]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.params.userId]
    );
    
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET read_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/notifications/:userId/read-all', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL',
      [req.params.userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/communication-preferences/:userId', async (req, res) => {
  try {
    const [prefs] = await pool.execute(
      'SELECT * FROM communication_preferences WHERE user_id = ?',
      [req.params.userId]
    );
    
    if (prefs.length === 0) {
      return res.json({
        success: true,
        preferences: {
          email_notifications: true,
          sms_notifications: true,
          push_notifications: true,
          announcement_notifications: true
        }
      });
    }
    
    res.json({ success: true, preferences: prefs[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/communication-preferences/:userId', async (req, res) => {
  try {
    const { email_notifications, sms_notifications, push_notifications, announcement_notifications } = req.body;
    
    const [existing] = await pool.execute(
      'SELECT * FROM communication_preferences WHERE user_id = ?',
      [req.params.userId]
    );
    
    if (existing.length === 0) {
      await pool.execute(
        `INSERT INTO communication_preferences (user_id, email_notifications, sms_notifications, push_notifications, announcement_notifications, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [req.params.userId, email_notifications, sms_notifications, push_notifications, announcement_notifications]
      );
    } else {
      await pool.execute(
        `UPDATE communication_preferences 
         SET email_notifications = ?, sms_notifications = ?, push_notifications = ?, announcement_notifications = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [email_notifications, sms_notifications, push_notifications, announcement_notifications, req.params.userId]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/message-threads/:userId', async (req, res) => {
  try {
    const [threads] = await pool.execute(`
      SELECT 
        CASE 
          WHEN m.sender_id = ? THEN m.recipient_id
          ELSE m.sender_id
        END as other_user_id,
        MAX(m.sent_at) as last_message_date,
        COUNT(*) as message_count,
        u.first_name,
        u.last_name
      FROM messages m
      JOIN users u ON (CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END) = u.id
      WHERE m.sender_id = ? OR m.recipient_id = ?
      GROUP BY other_user_id, u.first_name, u.last_name
      ORDER BY last_message_date DESC
    `, [req.params.userId, req.params.userId, req.params.userId, req.params.userId]);
    
    res.json({ success: true, threads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/conversation/:userId/:otherUserId', async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, 
        s.first_name as sender_first_name, s.last_name as sender_last_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      WHERE (m.sender_id = ? AND m.recipient_id = ?) 
         OR (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.sent_at ASC
    `, [req.params.userId, req.params.otherUserId, req.params.otherUserId, req.params.userId]);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

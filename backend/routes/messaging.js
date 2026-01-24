const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Send email
router.post('/email/send', async (req, res) => {
  try {
    const { recipients, subject, body, template_id, sender_id, scheduled_at, attachments } = req.body;
    
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    const messageIds = [];
    
    for (const recipient of recipientList) {
      const [result] = await db.query(
        `INSERT INTO email_messages (recipient, subject, body, template_id, sender_id, scheduled_at, attachments, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [recipient, subject, body, template_id, sender_id, scheduled_at, JSON.stringify(attachments), scheduled_at ? 'scheduled' : 'pending']
      );
      messageIds.push(result.insertId);
    }
    
    // If not scheduled, send immediately (simulate)
    if (!scheduled_at) {
      for (const id of messageIds) {
        await db.query('UPDATE email_messages SET status = ?, sent_at = NOW() WHERE id = ?', ['sent', id]);
      }
    }
    
    res.json({ success: true, messageIds, sent: !scheduled_at });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send SMS
router.post('/sms/send', async (req, res) => {
  try {
    const { recipients, message, sender_id, scheduled_at } = req.body;
    
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    const messageIds = [];
    
    for (const recipient of recipientList) {
      const [result] = await db.query(
        'INSERT INTO sms_messages (recipient, message, sender_id, scheduled_at, status) VALUES (?, ?, ?, ?, ?)',
        [recipient, message, sender_id, scheduled_at, scheduled_at ? 'scheduled' : 'pending']
      );
      messageIds.push(result.insertId);
    }
    
    // If not scheduled, send immediately (simulate)
    if (!scheduled_at) {
      for (const id of messageIds) {
        await db.query('UPDATE sms_messages SET status = ?, sent_at = NOW() WHERE id = ?', ['sent', id]);
      }
    }
    
    res.json({ success: true, messageIds, sent: !scheduled_at });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk send to groups
router.post('/bulk/send', async (req, res) => {
  try {
    const { type, group_type, group_ids, subject, message, sender_id } = req.body;
    
    let recipients = [];
    
    // Get recipients based on group type
    if (group_type === 'class') {
      const [students] = await db.query('SELECT email, phone FROM students WHERE class_id IN (?)', [group_ids]);
      recipients = students;
    } else if (group_type === 'role') {
      const [users] = await db.query('SELECT email, phone FROM users WHERE role_id IN (?)', [group_ids]);
      recipients = users;
    } else if (group_type === 'parents') {
      const [parents] = await db.query('SELECT email, phone FROM parents WHERE student_id IN (?)', [group_ids]);
      recipients = parents;
    }
    
    const messageIds = [];
    
    for (const recipient of recipients) {
      if (type === 'email' && recipient.email) {
        const [result] = await db.query(
          'INSERT INTO email_messages (recipient, subject, body, sender_id, status) VALUES (?, ?, ?, ?, ?)',
          [recipient.email, subject, message, sender_id, 'pending']
        );
        messageIds.push(result.insertId);
        await db.query('UPDATE email_messages SET status = ?, sent_at = NOW() WHERE id = ?', ['sent', result.insertId]);
      } else if (type === 'sms' && recipient.phone) {
        const [result] = await db.query(
          'INSERT INTO sms_messages (recipient, message, sender_id, status) VALUES (?, ?, ?, ?)',
          [recipient.phone, message, sender_id, 'pending']
        );
        messageIds.push(result.insertId);
        await db.query('UPDATE sms_messages SET status = ?, sent_at = NOW() WHERE id = ?', ['sent', result.insertId]);
      }
    }
    
    res.json({ success: true, sent: messageIds.length, messageIds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Email templates
router.get('/templates/email', async (req, res) => {
  try {
    const [templates] = await db.query('SELECT * FROM email_templates WHERE active = 1');
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/templates/email', async (req, res) => {
  try {
    const { name, subject, body, variables } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO email_templates (name, subject, body, variables) VALUES (?, ?, ?, ?)',
      [name, subject, body, JSON.stringify(variables)]
    );
    
    res.json({ success: true, template_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SMS templates
router.get('/templates/sms', async (req, res) => {
  try {
    const [templates] = await db.query('SELECT * FROM sms_templates WHERE active = 1');
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/templates/sms', async (req, res) => {
  try {
    const { name, message, variables } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO sms_templates (name, message, variables) VALUES (?, ?, ?)',
      [name, message, JSON.stringify(variables)]
    );
    
    res.json({ success: true, template_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get message history
router.get('/history/:type', async (req, res) => {
  try {
    const { limit = 100, status } = req.query;
    const table = req.params.type === 'email' ? 'email_messages' : 'sms_messages';
    
    let query = `SELECT * FROM ${table} WHERE 1=1`;
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [messages] = await db.query(query, params);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get delivery status
router.get('/status/:type/:id', async (req, res) => {
  try {
    const table = req.params.type === 'email' ? 'email_messages' : 'sms_messages';
    const [messages] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    
    if (messages.length === 0) return res.status(404).json({ success: false, message: 'Message not found' });
    
    res.json({ success: true, message: messages[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [emailTotal] = await db.query('SELECT COUNT(*) as count FROM email_messages');
    const [emailSent] = await db.query('SELECT COUNT(*) as count FROM email_messages WHERE status = "sent"');
    const [smsTotal] = await db.query('SELECT COUNT(*) as count FROM sms_messages');
    const [smsSent] = await db.query('SELECT COUNT(*) as count FROM sms_messages WHERE status = "sent"');
    
    res.json({ 
      success: true, 
      stats: {
        email: { total: emailTotal[0].count, sent: emailSent[0].count },
        sms: { total: smsTotal[0].count, sent: smsSent[0].count }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendSMS, sendBulkSMS, getMessageHistory, getSMSStats } = require('../services/smsService');

// Send message to individual parent
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientType, recipientId, message, method = 'sms', scheduled = false, scheduledTime = null } = req.body;
    
    let phoneNumber, recipientName;
    
    if (recipientType === 'parent') {
      const [parents] = await pool.query('SELECT phone, CONCAT(first_name, " ", last_name) as name FROM parents WHERE id = ?', [recipientId]);
      if (!parents.length) return res.status(404).json({ success: false, message: 'Parent not found' });
      phoneNumber = parents[0].phone;
      recipientName = parents[0].name;
    } else if (recipientType === 'student') {
      const [students] = await pool.query('SELECT parent_phone, CONCAT(first_name, " ", last_name) as name FROM students WHERE id = ?', [recipientId]);
      if (!students.length) return res.status(404).json({ success: false, message: 'Student not found' });
      phoneNumber = students[0].parent_phone;
      recipientName = students[0].name;
    }

    if (scheduled) {
      await pool.query(
        'INSERT INTO scheduled_messages (sender_id, recipient_type, recipient_id, phone, message, method, scheduled_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, recipientType, recipientId, phoneNumber, message, method, scheduledTime, 'pending']
      );
      return res.json({ success: true, message: 'Message scheduled successfully' });
    }

    const result = await sendSMS(phoneNumber, message, req.user.id, { recipientType, recipientId, recipientName });
    res.json({ success: result.success, message: result.success ? 'Message sent' : result.error, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send bulk messages
router.post('/send-bulk', authenticateToken, async (req, res) => {
  try {
    const { recipients, message, filters = {} } = req.body;
    let phoneNumbers = [];

    if (recipients && recipients.length > 0) {
      phoneNumbers = recipients;
    } else {
      let query = 'SELECT DISTINCT parent_phone FROM students WHERE 1=1';
      const params = [];

      if (filters.trade) {
        query += ' AND trade = ?';
        params.push(filters.trade);
      }
      if (filters.level) {
        query += ' AND level = ?';
        params.push(filters.level);
      }
      if (filters.class) {
        query += ' AND class = ?';
        params.push(filters.class);
      }

      const [students] = await pool.query(query, params);
      phoneNumbers = students.map(s => s.parent_phone).filter(p => p);
    }

    const result = await sendBulkSMS(phoneNumbers, message, req.user.id, { bulk: true, count: phoneNumbers.length });
    res.json({ success: result.success, message: `Sent to ${phoneNumbers.length} recipients`, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get message templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const [templates] = await pool.query(
      'SELECT * FROM message_templates WHERE role = ? OR role = "all" ORDER BY category, name',
      [req.user.role]
    );
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create template
router.post('/templates', authenticateToken, async (req, res) => {
  try {
    const { name, category, content, variables, role = req.user.role } = req.body;
    const [result] = await pool.query(
      'INSERT INTO message_templates (name, category, content, variables, role, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, content, JSON.stringify(variables || []), role, req.user.id]
    );
    res.json({ success: true, templateId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get message history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, status, dateFrom, dateTo } = req.query;
    const result = await getMessageHistory({ 
      senderId: req.user.id, 
      limit: parseInt(limit),
      status,
      dateFrom,
      dateTo
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const result = await getSMSStats({ dateFrom, dateTo });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get parent contacts by filters
router.get('/contacts', authenticateToken, async (req, res) => {
  try {
    const { trade, level, class: className, search } = req.query;
    let query = `
      SELECT DISTINCT 
        s.id as student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.parent_phone,
        s.parent_name,
        s.trade,
        s.level,
        s.class
      FROM students s
      WHERE s.parent_phone IS NOT NULL AND s.parent_phone != ''
    `;
    const params = [];

    if (trade) {
      query += ' AND s.trade = ?';
      params.push(trade);
    }
    if (level) {
      query += ' AND s.level = ?';
      params.push(level);
    }
    if (className) {
      query += ' AND s.class = ?';
      params.push(className);
    }
    if (search) {
      query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.parent_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.first_name, s.last_name LIMIT 500';

    const [contacts] = await pool.query(query, params);
    res.json({ success: true, contacts, count: contacts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get scheduled messages
router.get('/scheduled', authenticateToken, async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT * FROM scheduled_messages WHERE sender_id = ? AND status = "pending" ORDER BY scheduled_time',
      [req.user.id]
    );
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel scheduled message
router.delete('/scheduled/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE scheduled_messages SET status = "cancelled" WHERE id = ? AND sender_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Message cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

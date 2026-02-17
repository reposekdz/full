// SMS Routes - African Talking Integration
const express = require('express');
const router = express.Router();

// In-memory storage
let smsRecords = [];
let smsTemplates = [];

// Middleware
const authMiddleware = require('./auth');

// Import African Talking SMS Service
const { sendSMS, sendBulkSMS, sendTemplateSMS, sendParentNotification, getBalance, isReady } = require('../services/africanTalkingService');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

// ==================== SMS TEMPLATES ====================

// GET all templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const { type, is_active } = req.query;
    let query = 'SELECT * FROM sms_templates WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true');
    }

    query += ' ORDER BY display_order ASC';
    const [templates] = await pool.execute(query, params);

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Fetch templates error:', error);
    res.status(500).json({ success: false, message: 'Icyitonderwa: Hari ikibazo mu gushaka inyongera.' });
  }
});

// GET single template
router.get('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [templates] = await pool.execute('SELECT * FROM sms_templates WHERE template_id = ? OR id = ?', [id, id]);

    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: 'Inyongera ntiyabonetse.' });
    }

    res.json({ success: true, template: templates[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ikibazo mu gushaka inyongera.' });
  }
});

// POST create template
router.post('/templates', authenticateToken, async (req, res) => {
  try {
    const { template_name, template_content, type, is_active, display_order } = req.body;
    const templateId = `TPL-${Date.now()}`;

    await pool.execute(
      `INSERT INTO sms_templates (template_id, template_name, template_content, type, is_active, display_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [templateId, template_name, template_content, type, is_active !== false, display_order || 0, req.user.userId]
    );

    res.status(201).json({ success: true, template_id: templateId, message: 'Inyongera yashizweho neza.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ikibazo mu gushiraho inyongera.' });
  }
});

// PUT update template
router.put('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { template_name, template_content, type, is_active, display_order } = req.body;

    await pool.execute(
      `UPDATE sms_templates SET 
        template_name = COALESCE(?, template_name),
        template_content = COALESCE(?, template_content),
        type = COALESCE(?, type),
        is_active = COALESCE(?, is_active),
        display_order = COALESCE(?, display_order)
      WHERE template_id = ? OR id = ?`,
      [template_name, template_content, type, is_active, display_order, id, id]
    );

    res.json({ success: true, message: 'Inyongera yavuguruwe neza.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ikibazo mu kuvugurura inyongera.' });
  }
});

// DELETE template
router.delete('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM sms_templates WHERE template_id = ? OR id = ?', [id, id]);
    res.json({ success: true, message: 'Inyongera yasibwe neza.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ikibazo mu gusiba inyongera.' });
  }
});

// ==================== SMS SENDING ====================

// GET SMS configuration status
router.get('/config', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    config: {
      provider: 'African Talking',
      isConfigured: !!process.env.AFRICATALKING_API_KEY,
      senderId: process.env.AFRICATALKING_SENDER_ID || 'SCHOOL',
      features: ['single_sms', 'bulk_sms', 'templates', 'whatsapp_fallback']
    }
  });
});

// POST send SMS (Unified)
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { phone, message, metadata } = req.body;

    // Use the comprehensive smsService
    const smsService = require('../services/smsService');
    const result = await smsService.sendSMS(phone, message, req.user.userId, metadata);

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ikibazo mu kohereza ubutumwa.' });
  }
});

// POST send bulk SMS
router.post('/send-bulk', authenticateToken, async (req, res) => {
  try {
    const { phones, message, metadata } = req.body;
    const smsService = require('../services/smsService');
    const result = await smsService.sendBulkSMS(phones, message, req.user.userId, metadata);

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ikibazo mu kohereza ubutumwa bwinshi.' });
  }
});

// GET SMS history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { recipient, status, limit = 50 } = req.query;
    const smsService = require('../services/smsService');
    const result = await smsService.getMessageHistory({ recipient, status, limit: parseInt(limit) });

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ikibazo mu gushaka amateka y\'ubutumwa.' });
  }
});

// GET SMS statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const smsService = require('../services/smsService');
    const result = await smsService.getSMSStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ikibazo mu gushaka imibare.' });
  }
});

// ==================== PARENT NOTIFICATIONS ====================

// Send notification to linked parents
router.post('/notify/parent', authenticateToken, async (req, res) => {
  try {
    const { student_id, notification_type, custom_message, variables } = req.body;

    // Resolve parent(s) phone
    const [parents] = await pool.execute(`
      SELECT p.phone, p.first_name, p.last_name, u.first_name as student_name
      FROM users u
      JOIN parent_student_links psl ON u.id = psl.student_id
      JOIN users p ON psl.parent_id = p.id
      WHERE u.id = ? AND psl.status = 'active'
    `, [student_id]);

    if (parents.length === 0) {
      return res.status(404).json({ success: false, message: 'Nta mubyeyi wambitswe kuri uyu munyeshuri.' });
    }

    const smsService = require('../services/smsService');
    const results = [];

    for (const parent of parents) {
      let message = custom_message;
      if (!message) {
        // Fetch template or use default
        const [templates] = await pool.execute(
          'SELECT template_content FROM sms_templates WHERE type = ? AND is_active = 1 LIMIT 1',
          [notification_type]
        );

        if (templates.length > 0) {
          message = templates[0].template_content
            .replace(/{{student}}/g, parent.student_name)
            .replace(/{{parent}}/g, parent.first_name);

          // Replace other variables if provided
          if (variables) {
            Object.keys(variables).forEach(key => {
              const regex = new RegExp(`{{${key}}}`, 'g');
              message = message.replace(regex, variables[key]);
            });
          }
        } else {
          message = `Ubutumwa bukubwiye ko umunyeshuri ${parent.student_name} afite amakuru mashya.`;
        }
      }

      const result = await smsService.sendSMS(parent.phone, message, req.user.userId, { student_id, notification_type });
      results.push({ parent: parent.first_name, phone: parent.phone, success: result.success });
    }

    res.json({ success: true, results, message: 'Ubutumwa bwoherejwe neza.' });
  } catch (error) {
    console.error('Notify parent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Bulk parent notification
router.post('/notify/parents-bulk', authMiddleware, async (req, res) => {
  try {
    const { parents, notification_type, message } = req.body;

    if (!parents || !Array.isArray(parents)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of parent objects'
      });
    }

    const recipients = parents.map(p => ({
      phone: p.phone,
      name: p.student_name
    }));

    const result = await sendBulkSMS(
      recipients.map(r => r.phone),
      message
    );

    res.json({
      success: result.success,
      message: result.success ? 'Bulk notifications sent' : 'Some notifications failed',
      stats: {
        total: result.total,
        sent: result.sent,
        failed: result.failed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending bulk notifications',
      error: error.message
    });
  }
});

// ==================== SMS DELIVERY REPORTS ====================

router.get('/delivery-report', authMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let report = smsRecords.filter(r => {
      const dateMatch = (!start_date || new Date(r.sent_at) >= new Date(start_date)) &&
        (!end_date || new Date(r.sent_at) <= new Date(end_date));
      return dateMatch;
    });

    const stats = {
      total: report.length,
      delivered: report.filter(r => r.status === 'delivered').length,
      sent: report.filter(r => r.status === 'sent').length,
      failed: report.filter(r => r.status === 'failed').length,
      pending: report.filter(r => r.status === 'pending').length
    };

    res.json({
      success: true,
      stats,
      records: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating delivery report' });
  }
});

// ==================== DEMO DATA ENDPOINTS ====================

// Initialize demo SMS templates
router.post('/demo/init-templates', authMiddleware, async (req, res) => {
  const demoTemplates = [
    {
      template_id: 'TPL-ATTENDANCE-001',
      template_name: 'Attendance Alert',
      template_content: 'Dear {{parent}}, {{student}} was absent on {{date}}. Please contact the school.',
      type: 'attendance',
      is_active: true,
      display_order: 1
    },
    {
      template_id: 'TPL-PAYMENT-001',
      template_name: 'Payment Reminder',
      template_content: 'Dear {{parent}}, {{student}}\'s payment of {{amount}} is due on {{due_date}}. Please pay promptly.',
      type: 'payment',
      is_active: true,
      display_order: 2
    },
    {
      template_id: 'TPL-MARKS-001',
      template_name: 'Marks Notification',
      template_content: 'Dear {{parent}}, {{student}}\'s marks for {{subject}} have been posted. Log in to view.',
      type: 'marks',
      is_active: true,
      display_order: 3
    },
    {
      template_id: 'TPL-EXAM-001',
      template_name: 'Exam Schedule',
      template_content: 'Dear {{parent}}, {{student}} has exams starting {{date}}. Check timetable at school.',
      type: 'exam',
      is_active: true,
      display_order: 4
    },
    {
      template_id: 'TPL-GENERAL-001',
      template_name: 'General Announcement',
      template_content: '{{message}}',
      type: 'announcement',
      is_active: true,
      display_order: 5
    }
  ];

  smsTemplates = demoTemplates;

  res.json({
    success: true,
    message: 'Demo templates initialized',
    templates: demoTemplates
  });
});

// Clear SMS history
router.delete('/demo/clear-history', authMiddleware, async (req, res) => {
  smsRecords = [];
  res.json({
    success: true,
    message: 'SMS history cleared'
  });
});

// ==================== PARENT NOTIFICATIONS (African Talking) ====================
// POST /api/sms/notify-parent - Send event-based SMS to parent(s) linked with student
// Body: { student_id, event_type, ...variables }
// event_type: leave_granted | conduct_removed | sick_alert | sick_sent_home | discipline_alert | fee_overdue | general_announcement
// variables: parent (name), student (name), reason, start, end, points, amount, message, etc.
router.post('/notify-parent', authenticateToken, async (req, res) => {
  try {
    const { student_id, event_type, ...variables } = req.body;
    if (!student_id || !event_type) {
      return res.status(400).json({ success: false, message: 'student_id and event_type required' });
    }

    let parentPhones = [];
    try {
      const [rows] = await pool.execute(
        `SELECT p.phone, p.first_name, p.last_name, u.first_name as student_first, u.last_name as student_last
         FROM users u
         LEFT JOIN users p ON u.parent_id = p.id
         WHERE u.id = ? AND (p.phone IS NOT NULL AND p.phone != '')`,
        [student_id]
      );
      if (rows && rows.length > 0) {
        parentPhones = rows.map((r) => ({ phone: r.phone, parent: `${r.first_name || ''} ${r.last_name || ''}`.trim(), student: `${r.student_first || ''} ${r.student_last || ''}`.trim() }));
      }
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to resolve parent contact' });
    }

    if (parentPhones.length === 0) {
      return res.status(404).json({ success: false, message: 'No parent phone found for this student' });
    }

    const results = [];
    for (const { phone, parent, student } of parentPhones) {
      const vars = { ...variables, parent: parent || 'Parent', student: student || 'Student' };
      const result = await sendParentNotification(phone, event_type, vars);
      results.push({ phone, success: result.success, messageId: result.messageId, error: result.error });
    }

    const sent = results.filter((r) => r.success).length;
    res.json({
      success: true,
      message: `Notification sent to ${sent}/${parentPhones.length} parent(s)`,
      results,
      event_type
    });
  } catch (error) {
    console.error('Notify parent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;

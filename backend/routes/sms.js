// SMS Routes - African Talking Integration
const express = require('express');
const router = express.Router();

// In-memory storage
let smsRecords = [];
let smsTemplates = [];

// Middleware
const authMiddleware = require('./auth');

// Import African Talking SMS Service
const { sendSMS, sendBulkSMS, sendTemplateSMS, getBalance, isReady } = require('../services/africanTalkingService');

// ==================== SMS TEMPLATES ====================

// GET all templates
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    const { type, is_active } = req.query;
    let templates = [...smsTemplates];

    if (type) templates = templates.filter(t => t.type === type);
    if (is_active !== undefined) templates = templates.filter(t => t.is_active === (is_active === 'true'));

    res.json({
      success: true,
      templates: templates.sort((a, b) => a.display_order - b.display_order)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching templates' });
  }
});

// GET single template
router.get('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const template = smsTemplates.find(t => t.template_id === id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching template' });
  }
});

// POST create template
router.post('/templates', authMiddleware, async (req, res) => {
  try {
    const { template_name, template_content, type, is_active, display_order } = req.body;

    const newTemplate = {
      template_id: `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      template_name,
      template_content,
      type,
      is_active: is_active !== false,
      display_order: display_order || 0,
      created_by: req.user?.userId || 'system',
      created_at: new Date().toISOString()
    };

    smsTemplates.push(newTemplate);

    res.status(201).json({
      success: true,
      template: newTemplate,
      message: 'Template created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating template' });
  }
});

// PUT update template
router.put('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { template_name, template_content, type, is_active, display_order } = req.body;

    const index = smsTemplates.findIndex(t => t.template_id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    smsTemplates[index] = {
      ...smsTemplates[index],
      template_name: template_name || smsTemplates[index].template_name,
      template_content: template_content || smsTemplates[index].template_content,
      type: type || smsTemplates[index].type,
      is_active: is_active !== undefined ? is_active : smsTemplates[index].is_active,
      display_order: display_order || smsTemplates[index].display_order,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      template: smsTemplates[index],
      message: 'Template updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating template' });
  }
});

// DELETE template
router.delete('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const index = smsTemplates.findIndex(t => t.template_id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    smsTemplates.splice(index, 1);

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting template' });
  }
});

// ==================== SMS SENDING (African Talking) ====================

// GET SMS configuration status
router.get('/config', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    config: {
      provider: 'African Talking',
      isConfigured: isReady(),
      senderId: process.env.AFRICAN_TALKING_SENDER || 'SCHOOL',
      features: ['single_sms', 'bulk_sms', 'templates', 'delivery_reports']
    }
  });
});

// POST send single SMS
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const {
      type, title, message, recipients, specific_phones,
      send_via, schedule_send, scheduled_time,
      template_id, metadata
    } = req.body;

    let recipientList = [];
    let sentCount = 0;
    let failedCount = 0;
    const smsRecords = [];

    // Determine recipients and send SMS
    if (recipients === 'specific' && specific_phones) {
      recipientList = specific_phones.split(',').map(p => p.trim());
      const result = await sendBulkSMS(recipientList, message);
      sentCount = result.sent;
      failedCount = result.failed;
      recipientList.forEach(phone => {
        smsRecords.push({
          sms_id: `SMS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          phone,
          message,
          type,
          title,
          status: 'sent',
          sent_at: new Date().toISOString(),
          delivery_channel: 'african_talking'
        });
      });
    } else if (recipients === 'all') {
      // Would query database for all parents with SMS enabled
      recipientList = [];
    } else if (recipients === 'trade' && metadata?.trade_code) {
      // Would query database for parents of students in trade
      recipientList = [];
    } else if (recipients === 'level' && metadata?.level_number) {
      // Would query database for parents of students in level
      recipientList = [];
    } else {
      // Try sending single SMS
      const result = await sendSMS(specific_phones || '+250000000000', message);
      if (result.success) {
        sentCount = 1;
        smsRecords.push({
          sms_id: result.messageId,
          phone: specific_phones,
          message,
          type,
          title,
          status: 'sent',
          sent_at: new Date().toISOString(),
          delivery_channel: 'african_talking'
        });
      } else {
        failedCount = 1;
        smsRecords.push({
          sms_id: `SMS-${Date.now()}-failed`,
          phone: specific_phones,
          message,
          type,
          title,
          status: 'failed',
          error: result.error,
          sent_at: new Date().toISOString(),
          delivery_channel: 'african_talking'
        });
      }
    }

    // Store SMS records
    smsRecords.push(...smsRecords);

    res.json({
      success: true,
      message: `SMS sent: ${sentCount} successful, ${failedCount} failed`,
      stats: {
        total_recipients: recipientList.length,
        sent: sentCount,
        failed: failedCount
      },
      sms_records: smsRecords,
      type,
      title,
      recipients,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending SMS',
      error: error.message
    });
  }
});

// POST send bulk SMS
router.post('/send-bulk', authMiddleware, async (req, res) => {
  try {
    const { phones, message, type, title } = req.body;

    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of phone numbers'
      });
    }

    const result = await sendBulkSMS(phones, message);

    // Record SMS
    const smsRecords = phones.map(phone => ({
      sms_id: `SMS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phone,
      message,
      type,
      title,
      status: 'sent',
      sent_at: new Date().toISOString(),
      delivery_channel: 'african_talking'
    }));

    res.json({
      success: result.success,
      message: result.success ? 'Bulk SMS sent successfully' : 'Some SMS failed to send',
      stats: {
        total: result.total,
        sent: result.sent,
        failed: result.failed
      },
      sms_records: smsRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending bulk SMS',
      error: error.message
    });
  }
});

// POST send templated SMS
router.post('/send-template', authMiddleware, async (req, res) => {
  try {
    const { phone, template_id, variables, type, title } = req.body;

    if (!phone || !template_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and template_id'
      });
    }

    const result = await sendTemplateSMS(phone, template_id, variables || {});

    res.json({
      success: result.success,
      message: result.success ? 'Templated SMS sent successfully' : 'Failed to send SMS',
      result: {
        messageId: result.messageId,
        status: result.status,
        recipient: phone,
        template: template_id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending templated SMS',
      error: error.message
    });
  }
});

// GET SMS history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { type, status, start_date, end_date, limit } = req.query;

    let filteredRecords = [...smsRecords];

    if (type) filteredRecords = filteredRecords.filter(r => r.type === type);
    if (status) filteredRecords = filteredRecords.filter(r => r.status === status);
    if (start_date) filteredRecords = filteredRecords.filter(r => new Date(r.sent_at) >= new Date(start_date));
    if (end_date) filteredRecords = filteredRecords.filter(r => new Date(r.sent_at) <= new Date(end_date));

    const limitNum = parseInt(limit) || 100;
    const paginatedRecords = filteredRecords.slice(0, limitNum);

    res.json({
      success: true,
      total: filteredRecords.length,
      records: paginatedRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching SMS history' });
  }
});

// GET single SMS record
router.get('/record/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const record = smsRecords.find(r => r.sms_id === id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'SMS record not found' });
    }

    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching SMS record' });
  }
});

// GET SMS balance/status
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const balanceResult = await getBalance();

    res.json({
      success: true,
      balance: balanceResult,
      configured: isReady()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching balance',
      error: error.message
    });
  }
});

// ==================== SMS NOTIFICATIONS BY ROLE ====================

// Parent notification
router.post('/notify/parent', authMiddleware, async (req, res) => {
  try {
    const { parent_phone, notification_type, student_name, message } = req.body;

    let smsMessage = message;
    if (!smsMessage) {
      const templates = {
        'attendance': `Dear parent, ${student_name} was absent from school today. Please contact the school.`,
        'payment': `Dear parent, ${student_name}'s school fee payment is due. Please make payment soon.`,
        'marks': `Dear parent, ${student_name}'s academic results have been posted. Please check.`,
        'general': `Dear parent, ${student_name} has a message from school. Please contact us.`
      };
      smsMessage = templates[notification_type] || templates['general'];
    }

    const result = await sendSMS(parent_phone, smsMessage);

    res.json({
      success: result.success,
      message: result.success ? 'Parent notification sent' : 'Failed to send notification',
      result: {
        phone: parent_phone,
        type: notification_type,
        student: student_name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending parent notification',
      error: error.message
    });
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

module.exports = router;

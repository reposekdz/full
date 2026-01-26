const express = require('express');
const router = express.Router();
const { sendSMS, sendBulkSMS, checkBalance, getMessageHistory, getSMSStats } = require('../services/smsService');
const db = require('../config/database');

// Check role permissions
const checkPermission = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    if (!staffId) return res.status(401).json({ success: false, error: 'Staff ID required' });

    const [staff] = await db.query('SELECT id, role, first_name, last_name FROM staff WHERE id = ?', [staffId]);
    if (!staff || staff.length === 0) return res.status(404).json({ success: false, error: 'Staff not found' });

    const [perms] = await db.query('SELECT * FROM sms_role_permissions WHERE role = ?', [staff[0].role]);
    if (!perms || perms.length === 0) return res.status(403).json({ success: false, error: 'No SMS permissions' });

    req.staffMember = staff[0];
    req.permissions = perms[0];
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = (io) => {
  // Send to single parent
  router.post('/send', checkPermission, async (req, res) => {
    if (!req.permissions.can_send_single) return res.status(403).json({ success: false, error: 'No permission' });

    const { parentId, message, staffId } = req.body;
    if (!parentId || !message) return res.status(400).json({ success: false, error: 'Parent ID and message required' });

    try {
      const [parents] = await db.query('SELECT * FROM parents WHERE id = ?', [parentId]);
      if (!parents || parents.length === 0) return res.status(404).json({ success: false, error: 'Parent not found' });

      const parent = parents[0];
      if (!parent.phone) return res.status(400).json({ success: false, error: 'No phone number' });

      io.emit('sms:sending', { parentId: parent.id, parentName: `${parent.first_name} ${parent.last_name}`, phone: parent.phone, status: 'sending', timestamp: new Date() });

      const fullMessage = `GARDEN TSS\nFrom: ${req.staffMember.role.toUpperCase()} - ${req.staffMember.first_name} ${req.staffMember.last_name}\n\n${message}`;

      if (parent.has_smartphone) {
        io.emit('parent:message', { parentId: parent.id, message: fullMessage, sender: req.staffMember, timestamp: new Date(), type: 'in-app', schoolName: 'GARDEN TSS' });
      }

      const smsResult = await sendSMS(parent.phone, fullMessage, staffId, { parentId: parent.id, hasSmartphone: parent.has_smartphone });

      if (smsResult.success) {
        io.emit('sms:sent', { parentId: parent.id, phone: parent.phone, status: 'success', method: parent.has_smartphone ? 'dual' : 'sms-only' });
        res.json({ success: true, message: parent.has_smartphone ? 'Sent via app and SMS' : 'Sent via SMS', method: parent.has_smartphone ? 'dual' : 'sms-only', data: smsResult.data });
      } else {
        io.emit('sms:failed', { parentId: parent.id, phone: parent.phone, status: 'failed', error: smsResult.error });
        res.status(500).json({ success: false, error: smsResult.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Send bulk
  router.post('/bulk', checkPermission, async (req, res) => {
    if (!req.permissions.can_send_bulk) return res.status(403).json({ success: false, error: 'No bulk permission' });

    const { parentIds, message, staffId } = req.body;
    if (!parentIds || !Array.isArray(parentIds) || !message) return res.status(400).json({ success: false, error: 'Invalid data' });

    try {
      const [parents] = await db.query(`SELECT * FROM parents WHERE id IN (${parentIds.map(() => '?').join(',')})`, parentIds);
      const results = { total: parents.length, sent: 0, failed: 0, details: [] };

      for (const parent of parents) {
        if (!parent.phone) { results.failed++; continue; }

        io.emit('sms:sending', { parentId: parent.id, parentName: `${parent.first_name} ${parent.last_name}`, phone: parent.phone, status: 'sending' });

        const fullMessage = `GARDEN TSS\nFrom: ${req.staffMember.role.toUpperCase()} - ${req.staffMember.first_name} ${req.staffMember.last_name}\n\n${message}`;

        if (parent.has_smartphone) {
          io.emit('parent:message', { parentId: parent.id, message: fullMessage, sender: req.staffMember, timestamp: new Date(), type: 'in-app', schoolName: 'GARDEN TSS' });
        }

        const smsResult = await sendSMS(parent.phone, fullMessage, staffId, { parentId: parent.id, bulk: true });

        if (smsResult.success) {
          results.sent++;
          io.emit('sms:sent', { parentId: parent.id, phone: parent.phone, status: 'success' });
        } else {
          results.failed++;
          io.emit('sms:failed', { parentId: parent.id, phone: parent.phone, status: 'failed' });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Send to class
  router.post('/send-to-class', checkPermission, async (req, res) => {
    if (!req.permissions.can_send_class) return res.status(403).json({ success: false, error: 'No class permission' });

    const { classId, message, staffId } = req.body;
    if (!classId || !message) return res.status(400).json({ success: false, error: 'Class ID and message required' });

    try {
      const [students] = await db.query('SELECT DISTINCT parent_id FROM students WHERE class_id = ? AND parent_id IS NOT NULL', [classId]);
      const parentIds = students.map(s => s.parent_id);

      if (parentIds.length === 0) return res.status(404).json({ success: false, error: 'No parents found' });

      req.body.parentIds = parentIds;
      const [parents] = await db.query(`SELECT * FROM parents WHERE id IN (${parentIds.map(() => '?').join(',')})`, parentIds);
      const results = { total: parents.length, sent: 0, failed: 0 };

      for (const parent of parents) {
        if (!parent.phone) { results.failed++; continue; }

        const fullMessage = `GARDEN TSS\nFrom: ${req.staffMember.role.toUpperCase()} - ${req.staffMember.first_name} ${req.staffMember.last_name}\n\n${message}`;

        if (parent.has_smartphone) {
          io.emit('parent:message', { parentId: parent.id, message: fullMessage, sender: req.staffMember, timestamp: new Date(), type: 'in-app', schoolName: 'GARDEN TSS' });
        }

        const smsResult = await sendSMS(parent.phone, fullMessage, staffId, { classId, parentId: parent.id });
        smsResult.success ? results.sent++ : results.failed++;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Send to all
  router.post('/send-to-all', checkPermission, async (req, res) => {
    if (!req.permissions.can_send_all) return res.status(403).json({ success: false, error: 'Only admin/director can broadcast' });

    const { message, staffId } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });

    try {
      const [parents] = await db.query('SELECT * FROM parents WHERE phone IS NOT NULL');
      const results = { total: parents.length, sent: 0, failed: 0 };

      for (const parent of parents) {
        const fullMessage = `GARDEN TSS\nFrom: ${req.staffMember.role.toUpperCase()} - ${req.staffMember.first_name} ${req.staffMember.last_name}\n\n${message}`;

        if (parent.has_smartphone) {
          io.emit('parent:message', { parentId: parent.id, message: fullMessage, sender: req.staffMember, timestamp: new Date(), type: 'in-app', schoolName: 'GARDEN TSS' });
        }

        const smsResult = await sendSMS(parent.phone, fullMessage, staffId, { broadcast: true });
        smsResult.success ? results.sent++ : results.failed++;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get templates
  router.get('/templates', async (req, res) => {
    try {
      const [templates] = await db.query('SELECT * FROM sms_templates WHERE is_active = TRUE ORDER BY template_category, name');
      res.json({ success: true, templates });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create template
  router.post('/templates', checkPermission, async (req, res) => {
    if (!req.permissions.can_create_templates) return res.status(403).json({ success: false, error: 'No template permission' });

    const { name, category, message_template, variables } = req.body;
    try {
      await db.query('INSERT INTO sms_templates (name, template_category, message_template, variables, created_by) VALUES (?, ?, ?, ?, ?)', 
        [name, category, message_template, JSON.stringify(variables), req.body.staffId]);
      res.json({ success: true, message: 'Template created' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get history
  router.get('/history', checkPermission, async (req, res) => {
    if (!req.permissions.can_view_history) return res.status(403).json({ success: false, error: 'No history permission' });

    try {
      const result = await getMessageHistory({ senderId: req.query.senderId, limit: parseInt(req.query.limit) || 100 });
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get stats
  router.get('/stats', checkPermission, async (req, res) => {
    if (!req.permissions.can_view_stats) return res.status(403).json({ success: false, error: 'No stats permission' });

    try {
      const result = await getSMSStats({ dateFrom: req.query.dateFrom, dateTo: req.query.dateTo });
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Check balance
  router.get('/balance', async (req, res) => {
    try {
      const result = await checkBalance();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get permissions
  router.get('/permissions/:role', async (req, res) => {
    try {
      const [perms] = await db.query('SELECT * FROM sms_role_permissions WHERE role = ?', [req.params.role]);
      res.json({ success: true, permissions: perms[0] || null });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};

const express = require('express');
const router = express.Router();
const { sendUniversalMessage, checkBalance, getMessageHistory, getSMSStats } = require('../services/smsService');
const db = require('../config/database');

// Check role permissions
const checkPermission = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    if (!staffId) return res.status(401).json({ success: false, error: 'Staff ID required' });

    const [staff] = await db.query('SELECT id, role, first_name, last_name FROM staff WHERE id = ?', [staffId]);
    if (!staff || staff.length === 0) return res.status(404).json({ success: false, error: 'Staff not found' });

    const [perms] = await db.query('SELECT * FROM sms_role_permissions WHERE role = ?', [staff[0].role]);
    if (!perms || perms.length === 0) {
      // Default permissions for staff if not explicitly set
      req.permissions = {
        can_send_single: 1,
        can_send_bulk: 0,
        can_send_class: 1,
        can_send_all: 0,
        can_view_history: 1,
        can_view_stats: 0
      };
    } else {
      req.permissions = perms[0];
    }

    req.staffMember = staff[0];
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = (io) => {
  // Send to single parent
  router.post('/send', checkPermission, async (req, res) => {
    if (!req.permissions.can_send_single) return res.status(403).json({ success: false, error: 'No permission' });

    const { parentId, message, staffId, subject = 'School Message' } = req.body;
    if (!parentId || !message) return res.status(400).json({ success: false, error: 'Parent ID and message required' });

    try {
      const [parents] = await db.query('SELECT * FROM parents WHERE id = ?', [parentId]);
      if (!parents || parents.length === 0) return res.status(404).json({ success: false, error: 'Parent found' });

      const parent = parents[0];
      const fullMessage = `GARDEN TSS\nFrom: ${req.staffMember.role.toUpperCase()} - ${req.staffMember.first_name} ${req.staffMember.last_name}\n\n${message}`;

      // 1. Save to main messages table for UI history
      const [msgResult] = await db.query(
        'INSERT INTO messages (sender_id, sender_name, sender_role, receiver_id, subject, content, message_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [staffId, `${req.staffMember.first_name} ${req.staffMember.last_name}`, req.staffMember.role, parentId, subject, message, 'message', 'sent']
      );

      // 2. Real-time delivery via Socket.io
      io.emit('parent:message', {
        id: msgResult.insertId,
        parentId: parent.id,
        message: fullMessage,
        content: message,
        sender: req.staffMember,
        timestamp: new Date(),
        type: 'in-app'
      });

      // 3. External delivery (WhatsApp/SMS) if needed
      let externalResult = { success: true, method: 'none' };
      if (!parent.has_smartphone || parent.preferred_contact_method !== 'app') {
        externalResult = await sendUniversalMessage(parent.phone, fullMessage, staffId, {
          parentId: parent.id,
          hasSmartphone: parent.has_smartphone,
          preferredMethod: parent.preferred_contact_method || 'dual'
        });
      }

      res.json({
        success: true,
        message: 'Message processed',
        inApp: true,
        external: externalResult,
        messageId: msgResult.insertId
      });

    } catch (error) {
      console.error('Send error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Send bulk
  router.post('/bulk', checkPermission, async (req, res) => {
    if (!req.permissions.can_send_bulk) return res.status(403).json({ success: false, error: 'No bulk permission' });

    const { parentIds, message, staffId, subject = 'School Announcement' } = req.body;
    if (!parentIds || !Array.isArray(parentIds) || !message) return res.status(400).json({ success: false, error: 'Invalid data' });

    try {
      const [parents] = await db.query(`SELECT * FROM parents WHERE id IN (${parentIds.map(() => '?').join(',')})`, parentIds);
      const results = { total: parents.length, sent: 0, failed: 0 };

      for (const parent of parents) {
        const fullMessage = `GARDEN TSS\nFrom: ${req.staffMember.role.toUpperCase()} - ${req.staffMember.first_name} ${req.staffMember.last_name}\n\n${message}`;

        // Save to DB
        await db.query(
          'INSERT INTO messages (sender_id, sender_name, sender_role, receiver_id, subject, content, message_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [staffId, `${req.staffMember.first_name} ${req.staffMember.last_name}`, req.staffMember.role, parent.id, subject, message, 'message', 'sent']
        );

        // Socket.io
        io.emit('parent:message', {
          parentId: parent.id,
          message: fullMessage,
          sender: req.staffMember,
          timestamp: new Date()
        });

        // External
        const ext = await sendUniversalMessage(parent.phone, fullMessage, staffId, {
          parentId: parent.id,
          hasSmartphone: parent.has_smartphone,
          preferredMethod: 'dual'
        });

        ext.success ? results.sent++ : results.failed++;
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Send to class
  router.post('/send-to-class', checkPermission, async (req, res) => {
    if (!req.permissions.can_send_class) return res.status(403).json({ success: false, error: 'No class permission' });

    const { classId, message, staffId, subject = 'Class Announcement' } = req.body;
    if (!classId || !message) return res.status(400).json({ success: false, error: 'Class ID and message required' });

    try {
      const [students] = await db.query('SELECT DISTINCT parent_id FROM students WHERE class_id = ? AND parent_id IS NOT NULL', [classId]);
      const parentIds = students.map(s => s.parent_id);

      if (parentIds.length === 0) return res.status(404).json({ success: false, error: 'No parents found in this class' });

      req.body.parentIds = parentIds;
      req.body.subject = subject;
      // Forward to bulk route logic
      const [parents] = await db.query(`SELECT * FROM parents WHERE id IN (${parentIds.map(() => '?').join(',')})`, parentIds);
      const results = { total: parents.length, sent: 0, failed: 0 };

      for (const parent of parents) {
        const fullMessage = `GARDEN TSS\nFrom: ${req.staffMember.role.toUpperCase()} - ${req.staffMember.first_name} ${req.staffMember.last_name}\n\n${message}`;

        await db.query(
          'INSERT INTO messages (sender_id, sender_name, sender_role, receiver_id, subject, content, message_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [staffId, `${req.staffMember.first_name} ${req.staffMember.last_name}`, req.staffMember.role, parent.id, subject, message, 'message', 'sent']
        );

        io.emit('parent:message', { parentId: parent.id, message: fullMessage, sender: req.staffMember, timestamp: new Date() });

        const ext = await sendUniversalMessage(parent.phone, fullMessage, staffId, { parentId: parent.id, hasSmartphone: parent.has_smartphone, preferredMethod: 'dual' });
        ext.success ? results.sent++ : results.failed++;
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Send to all
  router.post('/send-to-all', checkPermission, async (req, res) => {
    if (!req.permissions.can_send_all) return res.status(403).json({ success: false, error: 'Only admin/director can broadcast' });

    const { message, staffId, subject = 'School-Wide Announcement' } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });

    try {
      const [parents] = await db.query('SELECT * FROM parents WHERE status = "active"');
      const results = { total: parents.length, sent: 0, failed: 0 };

      for (const parent of parents) {
        const fullMessage = `GARDEN TSS\nFrom: ${req.staffMember.role.toUpperCase()} - ${req.staffMember.first_name} ${req.staffMember.last_name}\n\n${message}`;

        await db.query(
          'INSERT INTO messages (sender_id, sender_name, sender_role, receiver_id, subject, content, message_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [staffId, `${req.staffMember.first_name} ${req.staffMember.last_name}`, req.staffMember.role, parent.id, subject, message, 'message', 'sent']
        );

        io.emit('parent:message', { parentId: parent.id, message: fullMessage, sender: req.staffMember, timestamp: new Date() });

        const ext = await sendUniversalMessage(parent.phone, fullMessage, staffId, { parentId: parent.id, hasSmartphone: parent.has_smartphone, preferredMethod: 'dual' });
        ext.success ? results.sent++ : results.failed++;
        await new Promise(resolve => setTimeout(resolve, 50));
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

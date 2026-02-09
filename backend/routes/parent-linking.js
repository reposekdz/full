// Parent Linking & Access Control Routes
const express = require('express');
const router = express.Router();

// In-memory storage
let parentConnections = [];
let accessLogs = [];
let smsRecords = [];

// Middleware
const authMiddleware = require('./auth');

// ==================== PARENT CONNECTIONS ====================

// GET all parent connections
router.get('/connections', authMiddleware, async (req, res) => {
  try {
    const { student_id, parent_phone, status, search } = req.query;
    let connections = [...parentConnections];

    if (student_id) connections = connections.filter(c => c.student_id === student_id);
    if (parent_phone) connections = connections.filter(c => c.parent_phone.includes(parent_phone));
    if (status) connections = connections.filter(c => c.status === status);
    if (search) {
      const searchLower = search.toLowerCase();
      connections = connections.filter(c =>
        c.parent_name.toLowerCase().includes(searchLower) ||
        c.student_name.toLowerCase().includes(searchLower) ||
        c.parent_phone.includes(search)
      );
    }

    res.json({
      success: true,
      connections: connections.sort((a, b) => new Date(b.access_granted_at) - new Date(a.access_granted_at)),
      total: connections.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching connections' });
  }
});

// GET single connection
router.get('/connections/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = parentConnections.find(c => c.connection_id === id);

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    res.json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching connection' });
  }
});

// POST grant parent access
router.post('/grant-access', authMiddleware, async (req, res) => {
  try {
    const {
      student_id, parent_name, parent_phone, parent_email, parent_type,
      can_view_marks, can_view_attendance, can_view_discipline, can_view_report_cards,
      can_receive_notifications, notification_preferences, access_level
    } = req.body;

    // Check for existing connection
    const existing = parentConnections.find(
      c => c.student_id === student_id && c.parent_phone === parent_phone
    );

    const user = req.user || {};
    const grantedBy = user.name || 'System';
    const grantedByRole = user.role || 'admin';

    if (existing) {
      // Update existing connection
      Object.assign(existing, {
        parent_name, parent_email, parent_type,
        can_view_marks, can_view_attendance, can_view_discipline, can_view_report_cards,
        can_receive_notifications,
        notification_preferences,
        access_level: access_level || 'standard',
        status: 'active',
        updated_at: new Date().toISOString()
      });

      // Log access update
      accessLogs.push({
        log_id: Date.now().toString(),
        connection_id: existing.connection_id,
        action: 'access_updated',
        performed_by: grantedBy,
        performed_by_role: grantedByRole,
        timestamp: new Date().toISOString(),
        details: { can_view_marks, can_view_attendance, can_view_discipline }
      });

      return res.json({
        success: true,
        message: 'Parent access updated successfully',
        connection: existing
      });
    }

    // Create new connection
    const connection = {
      connection_id: `PC-${Date.now()}`,
      student_id,
      parent_name,
      parent_phone,
      parent_email,
      parent_type,
      access_granted_by: grantedBy,
      access_granted_by_role: grantedByRole,
      access_granted_at: new Date().toISOString(),
      access_level: access_level || 'standard',
      can_view_marks: can_view_marks ?? true,
      can_view_attendance: can_view_attendance ?? true,
      can_view_discipline: can_view_discipline ?? false,
      can_view_report_cards: can_view_report_cards ?? true,
      can_receive_notifications: can_receive_notifications ?? true,
      notification_preferences: notification_preferences || {
        marks_alerts: true,
        attendance_alerts: true,
        discipline_alerts: true,
        fees_alerts: false,
        events_alerts: true,
        general_alerts: true
      },
      status: 'active',
      last_accessed_at: null
    };

    parentConnections.push(connection);

    // Log access grant
    accessLogs.push({
      log_id: Date.now().toString(),
      connection_id: connection.connection_id,
      action: 'access_granted',
      performed_by: grantedBy,
      performed_by_role: grantedByRole,
      timestamp: new Date().toISOString(),
      details: { parent_name, parent_phone, access_level: connection.access_level }
    });

    res.json({
      success: true,
      message: 'Parent access granted successfully',
      connection
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error granting access', error: error.message });
  }
});

// PUT update connection
router.put('/connections/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const connIndex = parentConnections.findIndex(c => c.connection_id === id);

    if (connIndex === -1) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    parentConnections[connIndex] = {
      ...parentConnections[connIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Log update
    accessLogs.push({
      log_id: Date.now().toString(),
      connection_id: id,
      action: 'connection_updated',
      performed_by: req.user?.name || 'System',
      performed_by_role: req.user?.role || 'admin',
      timestamp: new Date().toISOString(),
      details: updates
    });

    res.json({
      success: true,
      message: 'Connection updated successfully',
      connection: parentConnections[connIndex]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating connection' });
  }
});

// POST revoke access
router.post('/revoke-access/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const connIndex = parentConnections.findIndex(c => c.connection_id === id);

    if (connIndex === -1) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    parentConnections[connIndex].status = 'revoked';
    parentConnections[connIndex].revoked_at = new Date().toISOString();
    parentConnections[connIndex].revoked_by = req.user?.name || 'System';
    parentConnections[connIndex].revoked_by_role = req.user?.role || 'admin';
    parentConnections[connIndex].revocation_reason = reason || 'No reason provided';

    // Log revocation
    accessLogs.push({
      log_id: Date.now().toString(),
      connection_id: id,
      action: 'access_revoked',
      performed_by: req.user?.name || 'System',
      performed_by_role: req.user?.role || 'admin',
      timestamp: new Date().toISOString(),
      details: { reason }
    });

    res.json({
      success: true,
      message: 'Parent access revoked successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error revoking access' });
  }
});

// POST restore access
router.post('/restore-access/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const connIndex = parentConnections.findIndex(c => c.connection_id === id);

    if (connIndex === -1) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    parentConnections[connIndex].status = 'active';
    parentConnections[connIndex].restored_at = new Date().toISOString();
    parentConnections[connIndex].restored_by = req.user?.name || 'System';

    // Log restoration
    accessLogs.push({
      log_id: Date.now().toString(),
      connection_id: id,
      action: 'access_restored',
      performed_by: req.user?.name || 'System',
      performed_by_role: req.user?.role || 'admin',
      timestamp: new Date().toISOString(),
      details: {}
    });

    res.json({
      success: true,
      message: 'Parent access restored successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error restoring access' });
  }
});

// ==================== ACCESS LOGS ====================

// GET access logs
router.get('/access-logs', authMiddleware, async (req, res) => {
  try {
    const { connection_id, action, start_date, end_date } = req.query;
    let logs = [...accessLogs];

    if (connection_id) logs = logs.filter(l => l.connection_id === connection_id);
    if (action) logs = logs.filter(l => l.action === action);
    if (start_date) logs = logs.filter(l => new Date(l.timestamp) >= new Date(start_date));
    if (end_date) logs = logs.filter(l => new Date(l.timestamp) <= new Date(end_date));

    res.json({
      success: true,
      logs: logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      total: logs.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching logs' });
  }
});

// ==================== PARENT DASHBOARD DATA ====================

// GET parent dashboard data
router.get('/parent-dashboard/:parentPhone', async (req, res) => {
  try {
    const { parentPhone } = req.params;

    // Find all connections for this parent phone
    const connections = parentConnections.filter(
      c => c.parent_phone === parentPhone && c.status === 'active'
    );

    if (connections.length === 0) {
      return res.status(404).json({ success: false, message: 'No connections found' });
    }

    // Update last accessed
    connections.forEach(c => {
      c.last_accessed_at = new Date().toISOString();
    });

    const children = connections.map(c => ({
      student_id: c.student_id,
      student_name: c.student_name,
      connection_id: c.connection_id,
      permissions: {
        view_marks: c.can_view_marks,
        view_attendance: c.can_view_attendance,
        view_discipline: c.can_view_discipline,
        view_report_cards: c.can_view_report_cards
      },
      notification_settings: c.notification_preferences
    }));

    res.json({
      success: true,
      parent: {
        parent_phone: parentPhone,
        children,
        notification_preferences: connections[0].notification_preferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching parent dashboard' });
  }
});

// GET student data for parent
router.get('/student-data/:studentId/:parentPhone', async (req, res) => {
  try {
    const { studentId, parentPhone } = req.params;

    // Verify connection exists and is active
    const connection = parentConnections.find(
      c => c.student_id === studentId &&
           c.parent_phone === parentPhone &&
           c.status === 'active'
    );

    if (!connection) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // In production, this would fetch from global-sheets
    const studentData = {
      success: true,
      can_view_marks: connection.can_view_marks,
      can_view_attendance: connection.can_view_attendance,
      can_view_discipline: connection.can_view_discipline,
      can_view_report_cards: connection.can_view_report_cards,
      student: {
        student_id: studentId,
        name: connection.student_name
      }
    };

    res.json(studentData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching student data' });
  }
});

module.exports = router;

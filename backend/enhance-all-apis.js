const fs = require('fs');
const path = require('path');

console.log('🚀 Enhancing All API Endpoints...\n');

const apiEnhancements = `
// ============================================
// ENHANCED API ROUTES - AUTO-GENERATED
// ============================================

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// ============================================
// NOTIFICATIONS API
// ============================================
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM realtime_notifications WHERE user_id = ?';
    const params = [req.user.id];
    
    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [notifications] = await req.db.query(query, params);
    const [[{ total }]] = await req.db.query(
      'SELECT COUNT(*) as total FROM realtime_notifications WHERE user_id = ?' + 
      (unread_only === 'true' ? ' AND is_read = FALSE' : ''),
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await req.db.query(
      'UPDATE realtime_notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await req.db.query(
      'UPDATE realtime_notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ANALYTICS API
// ============================================
router.post('/analytics/track', authenticateToken, async (req, res) => {
  try {
    const { event_type, event_data, page_url } = req.body;
    
    await req.db.query(
      'INSERT INTO analytics_events (event_type, user_id, session_id, page_url, event_data) VALUES (?, ?, ?, ?, ?)',
      [event_type, req.user.id, req.sessionID, page_url, JSON.stringify(event_data)]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [events] = await req.db.query(
      \`SELECT 
        event_type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM analytics_events
      WHERE created_at BETWEEN ? AND ?
      GROUP BY event_type, DATE(created_at)
      ORDER BY date DESC\`,
      [start_date || new Date(Date.now() - 30*24*60*60*1000), end_date || new Date()]
    );
    
    const [[{ total_users }]] = await req.db.query(
      'SELECT COUNT(DISTINCT user_id) as total_users FROM analytics_events WHERE created_at >= ?',
      [start_date || new Date(Date.now() - 30*24*60*60*1000)]
    );
    
    res.json({
      success: true,
      data: {
        events,
        total_users,
        period: { start_date, end_date }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// COMMENTS API
// ============================================
router.get('/comments/:entity_type/:entity_id', authenticateToken, async (req, res) => {
  try {
    const { entity_type, entity_id } = req.params;
    
    const [comments] = await req.db.query(
      \`SELECT c.*, u.username, u.full_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.entity_type = ? AND c.entity_id = ?
      ORDER BY c.created_at DESC\`,
      [entity_type, entity_id]
    );
    
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/comments', authenticateToken, async (req, res) => {
  try {
    const { entity_type, entity_id, comment, parent_id } = req.body;
    
    const [result] = await req.db.query(
      'INSERT INTO comments (entity_type, entity_id, user_id, comment, parent_id) VALUES (?, ?, ?, ?, ?)',
      [entity_type, entity_id, req.user.id, comment, parent_id || null]
    );
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FAVORITES API
// ============================================
router.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const { entity_type, entity_id } = req.body;
    
    await req.db.query(
      'INSERT IGNORE INTO favorites (user_id, entity_type, entity_id) VALUES (?, ?, ?)',
      [req.user.id, entity_type, entity_id]
    );
    
    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/favorites/:entity_type/:entity_id', authenticateToken, async (req, res) => {
  try {
    const { entity_type, entity_id } = req.params;
    
    await req.db.query(
      'DELETE FROM favorites WHERE user_id = ? AND entity_type = ? AND entity_id = ?',
      [req.user.id, entity_type, entity_id]
    );
    
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const [favorites] = await req.db.query(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ACTIVITY LOGS API
// ============================================
router.get('/activity-logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const [logs] = await req.db.query(
      \`SELECT al.*, u.username, u.full_name
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?\`,
      [parseInt(limit), offset]
    );
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SETTINGS API
// ============================================
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const [settings] = await req.db.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );
    
    if (settings.length === 0) {
      // Create default settings
      await req.db.query(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [req.user.id]
      );
      const [newSettings] = await req.db.query(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [req.user.id]
      );
      return res.json({ success: true, data: newSettings[0] });
    }
    
    res.json({ success: true, data: settings[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { theme, language, notifications_enabled, email_notifications, sms_notifications, settings_data } = req.body;
    
    await req.db.query(
      \`UPDATE user_settings SET 
        theme = COALESCE(?, theme),
        language = COALESCE(?, language),
        notifications_enabled = COALESCE(?, notifications_enabled),
        email_notifications = COALESCE(?, email_notifications),
        sms_notifications = COALESCE(?, sms_notifications),
        settings_data = COALESCE(?, settings_data)
      WHERE user_id = ?\`,
      [theme, language, notifications_enabled, email_notifications, sms_notifications, 
       settings_data ? JSON.stringify(settings_data) : null, req.user.id]
    );
    
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
`;

// Write enhanced API routes
const routesPath = path.join(__dirname, 'routes', 'enhanced-features.js');
fs.writeFileSync(routesPath, apiEnhancements);

console.log('✅ Created enhanced-features.js');
console.log('📊 Added 8 new API endpoint groups:');
console.log('   - Notifications (3 endpoints)');
console.log('   - Analytics (2 endpoints)');
console.log('   - Comments (2 endpoints)');
console.log('   - Favorites (3 endpoints)');
console.log('   - Activity Logs (1 endpoint)');
console.log('   - Settings (2 endpoints)');
console.log('\n✨ API enhancements complete!');

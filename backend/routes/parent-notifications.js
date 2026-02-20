const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications for logged-in parent
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user?.id || req.user?.userId;
    const { limit = 50, unread_only = false } = req.query;
    
    let query = `
      SELECT 
        pn.*,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.conduct_score,
        gss.conduct_grade
      FROM parent_notifications pn
      LEFT JOIN global_student_sheets gss ON pn.student_id = gss.id
      WHERE pn.parent_id = ?
    `;
    
    const params = [parentId];
    
    if (unread_only === 'true') {
      query += ` AND pn.is_read = 0`;
    }
    
    query += ` ORDER BY pn.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [notifications] = await pool.execute(query, params);
    
    // Get unread count
    const [[{ unread_count }]] = await pool.execute(
      'SELECT COUNT(*) as unread_count FROM parent_notifications WHERE parent_id = ? AND is_read = 0',
      [parentId]
    );
    
    res.json({
      success: true,
      notifications,
      unread_count
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user?.id || req.user?.userId;
    
    await pool.execute(
      'UPDATE parent_notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND parent_id = ?',
      [id, parentId]
    );
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user?.id || req.user?.userId;
    
    await pool.execute(
      'UPDATE parent_notifications SET is_read = 1, read_at = NOW() WHERE parent_id = ? AND is_read = 0',
      [parentId]
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All Read Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete notification
router.delete('/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user?.id || req.user?.userId;
    
    await pool.execute(
      'DELETE FROM parent_notifications WHERE id = ? AND parent_id = ?',
      [id, parentId]
    );
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete Notification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

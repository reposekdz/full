const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get parent messages
router.get('/:parentId/messages', async (req, res) => {
  try {
    const [messages] = await db.query(`
      SELECT sm.*, 
             s.first_name as sender_first_name,
             s.last_name as sender_last_name,
             s.role as sender_role
      FROM sms_messages sm
      LEFT JOIN staff s ON sm.sender_id = s.id
      LEFT JOIN parents p ON sm.recipient = p.phone
      WHERE p.id = ?
      ORDER BY sm.created_at DESC
      LIMIT 100
    `, [req.params.parentId]);

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      message: msg.message,
      sender: {
        first_name: msg.sender_first_name,
        last_name: msg.sender_last_name,
        role: msg.sender_role
      },
      timestamp: msg.created_at,
      schoolName: 'GARDEN TSS',
      read: msg.read_at !== null,
      starred: msg.starred || false
    }));

    res.json({ success: true, messages: formattedMessages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark message as read
router.post('/messages/:messageId/read', async (req, res) => {
  try {
    await db.query('UPDATE sms_messages SET read_at = NOW() WHERE id = ?', [req.params.messageId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle star
router.post('/messages/:messageId/star', async (req, res) => {
  try {
    await db.query('UPDATE sms_messages SET starred = NOT starred WHERE id = ?', [req.params.messageId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    await db.query('DELETE FROM sms_messages WHERE id = ?', [req.params.messageId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

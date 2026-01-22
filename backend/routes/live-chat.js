const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Create chat session
router.post('/sessions', async (req, res) => {
  try {
    const { visitor_name, visitor_email } = req.body;
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [result] = await pool.execute(`
      INSERT INTO chat_sessions (session_id, visitor_name, visitor_email, status)
      VALUES (?, ?, ?, 'active')
    `, [sessionId, visitor_name, visitor_email]);
    
    res.json({ success: true, sessionId, chatId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message
router.post('/messages', async (req, res) => {
  try {
    const { session_id, sender_type, sender_name, message } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO chat_messages (session_id, sender_type, sender_name, message)
      VALUES (?, ?, ?, ?)
    `, [session_id, sender_type, sender_name, message]);
    
    res.json({ success: true, messageId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get messages
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `, [req.params.sessionId]);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active sessions (Admin)
router.get('/sessions/active', authenticateToken, async (req, res) => {
  try {
    const [sessions] = await pool.execute(`
      SELECT cs.*, COUNT(cm.id) as message_count,
             MAX(cm.created_at) as last_message_at
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cs.session_id = cm.session_id
      WHERE cs.status = 'active'
      GROUP BY cs.id
      ORDER BY last_message_at DESC
    `);
    
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Close session
router.put('/sessions/:sessionId/close', async (req, res) => {
  try {
    await pool.execute(`UPDATE chat_sessions SET status = 'closed', closed_at = NOW() WHERE session_id = ?`, [req.params.sessionId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

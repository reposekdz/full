const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Create live study session
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const { title, description, session_type, subject_id, trade_class_id, max_participants, scheduled_start, scheduled_end, recording_enabled } = req.body;
    
    const access_code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const [result] = await db.query(
      `INSERT INTO live_study_sessions (title, description, host_id, session_type, subject_id, trade_class_id, max_participants, is_scheduled, scheduled_start, scheduled_end, access_code, recording_enabled, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, ?, ?, ?, 'scheduled')`,
      [title, description, req.user.id, session_type, subject_id, trade_class_id, max_participants, scheduled_start, scheduled_end, access_code, recording_enabled]
    );
    
    res.status(201).json({ id: result.insertId, access_code, message: 'Session created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join session
router.post('/sessions/:id/join', authenticate, async (req, res) => {
  try {
    const session_id = req.params.id;
    
    const [session] = await db.query('SELECT * FROM live_study_sessions WHERE id = ?', [session_id]);
    
    if (!session.length) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const [participants] = await db.query('SELECT COUNT(*) as count FROM session_participants WHERE session_id = ? AND is_active = true', [session_id]);
    
    if (participants[0].count >= session[0].max_participants) {
      return res.status(400).json({ error: 'Session is full' });
    }
    
    await db.query(
      `INSERT INTO session_participants (session_id, user_id, role) VALUES (?, ?, 'participant') 
       ON DUPLICATE KEY UPDATE joined_at = CURRENT_TIMESTAMP, is_active = true`,
      [session_id, req.user.id]
    );
    
    await db.query('UPDATE live_study_sessions SET current_participants = current_participants + 1, status = "active" WHERE id = ?', [session_id]);
    
    res.json({ message: 'Joined session successfully', session: session[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active sessions
router.get('/sessions/active', authenticate, async (req, res) => {
  try {
    const [sessions] = await db.query(
      `SELECT ls.*, u.name as host_name, s.name as subject_name 
       FROM live_study_sessions ls 
       JOIN users u ON ls.host_id = u.id 
       LEFT JOIN subjects s ON ls.subject_id = s.id 
       WHERE ls.status IN ('scheduled', 'active') ORDER BY ls.scheduled_start ASC`
    );
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message in session
router.post('/sessions/:id/messages', authenticate, async (req, res) => {
  try {
    const { content, message_type, attachments, is_private, recipient_id } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO realtime_messages (session_id, sender_id, message_type, content, attachments, is_private, recipient_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, req.user.id, message_type, content, JSON.stringify(attachments), is_private, recipient_id]
    );
    
    res.json({ id: result.insertId, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

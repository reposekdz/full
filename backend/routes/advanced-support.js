const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Create support ticket
router.post('/tickets', async (req, res) => {
  try {
    const { name, email, phone, category, priority, subject, message, user_id } = req.body;
    const ticket_number = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const [result] = await db.query(
      'INSERT INTO support_tickets (ticket_number, user_id, name, email, phone, category, priority, subject, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ticket_number, user_id || null, name, email, phone, category, priority, subject, message]
    );
    
    res.json({ success: true, ticket_number, id: result.insertId, message: 'Ticket created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get ticket by number
router.get('/tickets/:ticket_number', async (req, res) => {
  try {
    const [tickets] = await db.query(
      'SELECT * FROM support_tickets WHERE ticket_number = ?',
      [req.params.ticket_number]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    res.json({ success: true, ticket: tickets[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user tickets
router.get('/tickets/user/:user_id', async (req, res) => {
  try {
    const [tickets] = await db.query(
      'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.user_id]
    );
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all tickets
router.get('/admin/tickets', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = 'SELECT * FROM support_tickets WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [tickets] = await db.query(query, params);
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update ticket
router.put('/admin/tickets/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { status, response, assigned_to } = req.body;
    const updates = [];
    const params = [];
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'resolved' || status === 'closed') {
        updates.push('resolved_at = NOW()');
      }
    }
    if (response) {
      updates.push('response = ?');
      params.push(response);
    }
    if (assigned_to) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }
    
    params.push(req.params.id);
    
    await db.query(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({ success: true, message: 'Ticket updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message, category, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, subject, message, category || 'inquiry', req.ip, req.get('user-agent')]
    );
    
    res.json({ success: true, id: result.insertId, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get contact messages
router.get('/admin/contact', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [messages] = await db.query(query, params);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Reply to contact message
router.put('/admin/contact/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { status, reply_message } = req.body;
    
    await db.query(
      'UPDATE contact_messages SET status = ?, reply_message = ?, replied_at = NOW() WHERE id = ?',
      [status, reply_message, req.params.id]
    );
    
    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get support statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
      FROM support_tickets
    `);
    
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

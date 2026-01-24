const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, 
        COUNT(DISTINCT f.id) as faq_count,
        COUNT(DISTINCT r.id) as resource_count
      FROM support_categories c
      LEFT JOIN support_faqs f ON c.id = f.category_id AND f.is_active = true
      LEFT JOIN support_resources r ON c.id = r.category_id AND r.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order
    `);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/faqs', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT * FROM support_faqs WHERE is_active = true';
    const params = [];
    
    if (category_id) {
      query += ' AND category_id = ?';
      params.push(category_id);
    }
    
    query += ' ORDER BY sort_order, views DESC';
    const [faqs] = await pool.query(query, params);
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/resources', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT * FROM support_resources WHERE is_active = true';
    const params = [];
    
    if (category_id) {
      query += ' AND category_id = ?';
      params.push(category_id);
    }
    
    query += ' ORDER BY downloads DESC';
    const [resources] = await pool.query(query, params);
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/tickets', async (req, res) => {
  try {
    const { category_id, name, email, phone, subject, message, priority } = req.body;
    const ticket_number = `TKT${Date.now()}`;
    
    await pool.query(
      'INSERT INTO support_tickets (ticket_number, category_id, name, email, phone, subject, message, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [ticket_number, category_id, name, email, phone, subject, message, priority || 'medium']
    );
    
    res.json({ success: true, message: 'Ticket created successfully', ticket_number });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/faqs/:id/helpful', async (req, res) => {
  try {
    await pool.query('UPDATE support_faqs SET helpful_count = helpful_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/faqs/:id/view', async (req, res) => {
  try {
    await pool.query('UPDATE support_faqs SET views = views + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/admin/tickets', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [tickets] = await pool.query(`
      SELECT t.*, c.name as category_name 
      FROM support_tickets t
      JOIN support_categories c ON t.category_id = c.id
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

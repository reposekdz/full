const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM support_categories WHERE is_active = true ORDER BY sort_order');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all tickets
router.get('/tickets', async (req, res) => {
  try {
    const { status, category_id, user_id } = req.query;
    let query = 'SELECT t.*, c.name_en as category_name FROM support_tickets t LEFT JOIN support_categories c ON t.category_id = c.id WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }
    if (user_id) {
      query += ' AND t.user_id = ?';
      params.push(user_id);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const [tickets] = await pool.query(query, params);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create ticket
router.post('/tickets', async (req, res) => {
  try {
    const { category_id, user_id, user_name, user_email, user_phone, subject, description, priority, attachments } = req.body;
    const ticket_number = 'TKT' + Date.now();
    
    const [result] = await pool.query(`
      INSERT INTO support_tickets (ticket_number, category_id, user_id, user_name, user_email, user_phone, subject, description, priority, attachments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [ticket_number, category_id, user_id, user_name, user_email, user_phone, subject, description, priority, JSON.stringify(attachments || [])]);
    
    res.json({ id: result.insertId, ticket_number, message: 'Ticket created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update ticket status
router.put('/tickets/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const resolved_at = status === 'resolved' ? new Date() : null;
    
    await pool.query('UPDATE support_tickets SET status = ?, resolved_at = ? WHERE id = ?', [status, resolved_at, req.params.id]);
    res.json({ message: 'Ticket status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add response to ticket
router.post('/tickets/:id/responses', async (req, res) => {
  try {
    const { responder_id, responder_name, response_text, is_internal, attachments } = req.body;
    
    await pool.query(`
      INSERT INTO support_responses (ticket_id, responder_id, responder_name, response_text, is_internal, attachments)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.params.id, responder_id, responder_name, response_text, is_internal || false, JSON.stringify(attachments || [])]);
    
    res.json({ message: 'Response added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ticket responses
router.get('/tickets/:id/responses', async (req, res) => {
  try {
    const [responses] = await pool.query('SELECT * FROM support_responses WHERE ticket_id = ? ORDER BY created_at', [req.params.id]);
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all FAQs
router.get('/faqs', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT f.*, c.name_en as category_name FROM support_faqs f LEFT JOIN support_categories c ON f.category_id = c.id WHERE f.is_active = true';
    const params = [];
    
    if (category_id) {
      query += ' AND f.category_id = ?';
      params.push(category_id);
    }
    
    query += ' ORDER BY f.sort_order, f.helpful_count DESC';
    
    const [faqs] = await pool.query(query, params);
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create FAQ
router.post('/faqs', async (req, res) => {
  try {
    const { category_id, question_rw, question_en, answer_rw, answer_en, sort_order } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO support_faqs (category_id, question_rw, question_en, answer_rw, answer_en, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [category_id, question_rw, question_en, answer_rw, answer_en, sort_order || 0]);
    
    res.json({ id: result.insertId, message: 'FAQ created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update FAQ
router.put('/faqs/:id', async (req, res) => {
  try {
    const { category_id, question_rw, question_en, answer_rw, answer_en, sort_order } = req.body;
    
    await pool.query(`
      UPDATE support_faqs 
      SET category_id = ?, question_rw = ?, question_en = ?, answer_rw = ?, answer_en = ?, sort_order = ?
      WHERE id = ?
    `, [category_id, question_rw, question_en, answer_rw, answer_en, sort_order, req.params.id]);
    
    res.json({ message: 'FAQ updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE FAQ
router.delete('/faqs/:id', async (req, res) => {
  try {
    await pool.query('UPDATE support_faqs SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST mark FAQ as helpful
router.post('/faqs/:id/helpful', async (req, res) => {
  try {
    await pool.query('UPDATE support_faqs SET helpful_count = helpful_count + 1, views = views + 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as helpful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all articles
router.get('/articles', async (req, res) => {
  try {
    const { category_id, is_featured } = req.query;
    let query = 'SELECT a.*, c.name_en as category_name FROM support_articles a LEFT JOIN support_categories c ON a.category_id = c.id WHERE a.is_active = true';
    const params = [];
    
    if (category_id) {
      query += ' AND a.category_id = ?';
      params.push(category_id);
    }
    if (is_featured) {
      query += ' AND a.is_featured = true';
    }
    
    query += ' ORDER BY a.is_featured DESC, a.views DESC, a.created_at DESC';
    
    const [articles] = await pool.query(query, params);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create article
router.post('/articles', async (req, res) => {
  try {
    const { category_id, title_rw, title_en, content_rw, content_en, author_id, author_name, tags, is_featured } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO support_articles (category_id, title_rw, title_en, content_rw, content_en, author_id, author_name, tags, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [category_id, title_rw, title_en, content_rw, content_en, author_id, author_name, JSON.stringify(tags || []), is_featured || false]);
    
    res.json({ id: result.insertId, message: 'Article created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET support statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalTickets] = await pool.query('SELECT COUNT(*) as count FROM support_tickets');
    const [openTickets] = await pool.query('SELECT COUNT(*) as count FROM support_tickets WHERE status = "open"');
    const [resolvedTickets] = await pool.query('SELECT COUNT(*) as count FROM support_tickets WHERE status = "resolved"');
    const [totalFaqs] = await pool.query('SELECT COUNT(*) as count FROM support_faqs WHERE is_active = true');
    const [totalArticles] = await pool.query('SELECT COUNT(*) as count FROM support_articles WHERE is_active = true');
    
    res.json({
      total_tickets: totalTickets[0].count,
      open_tickets: openTickets[0].count,
      resolved_tickets: resolvedTickets[0].count,
      total_faqs: totalFaqs[0].count,
      total_articles: totalArticles[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

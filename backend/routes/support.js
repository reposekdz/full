const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Create support ticket
router.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const {
      category,
      priority,
      subject,
      description,
      attachments
    } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO support_tickets (
        user_id, category, priority, subject, description, status
      ) VALUES (?, ?, ?, ?, ?, 'open')
    `, [req.user.id, category, priority, subject, description]);

    const ticketId = result.insertId;

    // Store attachments if any
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        await pool.execute(`
          INSERT INTO ticket_attachments (ticket_id, file_path, file_name)
          VALUES (?, ?, ?)
        `, [ticketId, attachment.path, attachment.name]);
      }
    }

    res.json({
      success: true,
      message: 'Support ticket created successfully',
      ticketId
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket'
    });
  }
});

// Get user tickets
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.first_name, u.last_name, u.email,
        (SELECT COUNT(*) FROM ticket_responses WHERE ticket_id = t.id) as response_count
      FROM support_tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND t.category = ?';
      params.push(category);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [tickets] = await pool.execute(query, params);

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// Get ticket details
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await pool.execute(`
      SELECT t.*, u.first_name, u.last_name, u.email
      FROM support_tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ? AND t.user_id = ?
    `, [id, req.user.id]);

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Get responses
    const [responses] = await pool.execute(`
      SELECT r.*, u.first_name, u.last_name, u.role_id
      FROM ticket_responses r
      JOIN users u ON r.user_id = u.id
      WHERE r.ticket_id = ?
      ORDER BY r.created_at ASC
    `, [id]);

    // Get attachments
    const [attachments] = await pool.execute(`
      SELECT * FROM ticket_attachments WHERE ticket_id = ?
    `, [id]);

    res.json({
      success: true,
      ticket: tickets[0],
      responses,
      attachments
    });
  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket details'
    });
  }
});

// Add response to ticket
router.post('/tickets/:id/responses', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isStaff } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO ticket_responses (ticket_id, user_id, message, is_staff)
      VALUES (?, ?, ?, ?)
    `, [id, req.user.id, message, isStaff || false]);

    // Update ticket last activity
    await pool.execute(`
      UPDATE support_tickets
      SET updated_at = NOW(), status = 'in_progress'
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Response added successfully',
      responseId: result.insertId
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
});

// Update ticket status
router.put('/tickets/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(`
      UPDATE support_tickets
      SET status = ?, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [status, id, req.user.id]);

    res.json({
      success: true,
      message: 'Ticket status updated'
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status'
    });
  }
});

// Get knowledge base articles
router.get('/knowledge-base', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM knowledge_base WHERE is_published = true';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY views DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [articles] = await pool.execute(query, params);

    res.json({
      success: true,
      articles
    });
  } catch (error) {
    console.error('Get knowledge base error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles'
    });
  }
});

// Get article details
router.get('/knowledge-base/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [articles] = await pool.execute(`
      SELECT * FROM knowledge_base WHERE id = ? AND is_published = true
    `, [id]);

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    await pool.execute(`
      UPDATE knowledge_base SET views = views + 1 WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      article: articles[0]
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article'
    });
  }
});

// Rate article
router.post('/knowledge-base/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    await pool.execute(`
      INSERT INTO article_ratings (article_id, user_id, rating, feedback)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = ?, feedback = ?
    `, [id, req.user.id, rating, feedback, rating, feedback]);

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Rate article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
});

// Get support statistics (admin only)
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
        AVG(CASE WHEN resolved_at IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
          ELSE NULL END) as avg_resolution_time
      FROM support_tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [categoryStats] = await pool.execute(`
      SELECT category, COUNT(*) as count
      FROM support_tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      statistics: stats[0],
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;

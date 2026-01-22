const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/contact/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Submit contact form
router.post('/submit', upload.single('attachment'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      subject,
      message,
      priority
    } = req.body;

    const attachment = req.file ? req.file.path : null;

    const [result] = await pool.execute(`
      INSERT INTO contact_submissions (
        name, email, phone, department, subject, message, priority, attachment, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [name, email, phone, department, subject, message, priority || 'normal', attachment]);

    // Create notification for admin
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      SELECT id, 'New Contact Submission', ?, 'contact', ?
      FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')
    `, [`New contact from ${name}: ${subject}`, result.insertId]);

    res.json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: result.insertId
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form'
    });
  }
});

// Submit callback request
router.post('/callback', async (req, res) => {
  try {
    const {
      name,
      phone,
      preferredTime,
      preferredDate,
      reason
    } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO callback_requests (
        name, phone, preferred_time, preferred_date, reason, status
      ) VALUES (?, ?, ?, ?, ?, 'pending')
    `, [name, phone, preferredTime, preferredDate, reason]);

    res.json({
      success: true,
      message: 'Callback request submitted successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Callback request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit callback request'
    });
  }
});

// Get contact submissions (admin only)
router.get('/submissions', authenticateToken, async (req, res) => {
  try {
    const { status, department, priority, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM contact_submissions WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [submissions] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM contact_submissions WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (department) {
      countQuery += ' AND department = ?';
      countParams.push(department);
    }
    if (priority) {
      countQuery += ' AND priority = ?';
      countParams.push(priority);
    }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

// Update submission status
router.put('/submissions/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    await pool.execute(`
      UPDATE contact_submissions
      SET status = ?, response = ?, responded_at = NOW(), responded_by = ?
      WHERE id = ?
    `, [status, response, req.user.id, id]);

    res.json({
      success: true,
      message: 'Submission status updated'
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission'
    });
  }
});

// Get callback requests (admin only)
router.get('/callbacks', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM callback_requests WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY preferred_date ASC, preferred_time ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [requests] = await pool.execute(query, params);

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get callbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch callback requests'
    });
  }
});

// Update callback status
router.put('/callbacks/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    await pool.execute(`
      UPDATE callback_requests
      SET status = ?, notes = ?, handled_by = ?, handled_at = NOW()
      WHERE id = ?
    `, [status, notes, req.user.id, id]);

    res.json({
      success: true,
      message: 'Callback status updated'
    });
  } catch (error) {
    console.error('Update callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update callback'
    });
  }
});

// Live chat message
router.post('/chat/message', async (req, res) => {
  try {
    const { sessionId, sender, message } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO chat_messages (session_id, sender, message)
      VALUES (?, ?, ?)
    `, [sessionId, sender, message]);

    res.json({
      success: true,
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Get chat messages
router.get('/chat/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [messages] = await pool.execute(`
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `, [sessionId]);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

module.exports = router;

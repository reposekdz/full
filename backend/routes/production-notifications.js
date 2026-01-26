const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { sendSMS } = require('../services/smsService');
const nodemailer = require('nodemailer');

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'school@example.com',
    pass: process.env.EMAIL_PASSWORD || 'your_app_password'
  }
});

// Create notification
router.post('/create', async (req, res) => {
  try {
    const { user_id, title, message, type, priority, send_sms, send_email } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, priority, is_read, created_at) 
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [user_id, title, message, type || 'info', priority || 'normal']
    );

    const notification = { id: result.insertId, user_id, title, message, type, priority };

    // Get user details for SMS/Email
    if (send_sms || send_email) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [user_id]);
      if (users.length > 0) {
        const user = users[0];
        
        // Send SMS
        if (send_sms && user.phone) {
          await sendSMSNotification(user.phone, message);
        }
        
        // Send Email
        if (send_email && user.email) {
          await sendEmail(user.email, title, message);
        }
      }
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user notifications
router.get('/user/:userId', async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.params.userId]
    );
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all as read
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Broadcast notification to all users
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, type, priority, role_filter } = req.body;
    
    let query = 'SELECT id, phone, email FROM users WHERE 1=1';
    const params = [];
    
    if (role_filter) {
      query += ' AND role = ?';
      params.push(role_filter);
    }
    
    const [users] = await pool.query(query, params);
    
    const notifications = users.map(user => [user.id, title, message, type || 'info', priority || 'normal', 0]);
    
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, priority, is_read) VALUES ?',
      [notifications]
    );
    
    res.json({ success: true, sent_to: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send SMS helper (using Africa's Talking)
async function sendSMSNotification(phoneNumber, message) {
  try {
    await sendSMS(phoneNumber, message, 1, { notification: true });
    console.log(`SMS sent to ${phoneNumber}`);
  } catch (error) {
    console.error('SMS Error:', error.message);
  }
}

// Send Email helper
async function sendEmail(email, subject, message) {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #16a34a;">${subject}</h2>
            <p style="color: #333; line-height: 1.6;">${message}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Garden TVET School Management System</p>
          </div>
        </div>
      `
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Email Error:', error.message);
  }
}

module.exports = router;

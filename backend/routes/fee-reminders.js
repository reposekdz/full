const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendSMS, sendBulkSMS } = require('../services/smsService');
const cron = require('node-cron');

// Get students with pending fees
router.get('/pending-fees', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        s.id, s.first_name, s.last_name, s.parent_phone, s.parent_name,
        s.trade, s.level, s.class,
        COALESCE(SUM(f.amount), 0) as total_fees,
        COALESCE(SUM(p.amount), 0) as total_paid,
        COALESCE(SUM(f.amount), 0) - COALESCE(SUM(p.amount), 0) as balance
      FROM students s
      LEFT JOIN fees f ON s.id = f.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      WHERE s.parent_phone IS NOT NULL
      GROUP BY s.id
      HAVING balance > 0
      ORDER BY balance DESC
    `);
    res.json({ success: true, students, count: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send fee reminder to specific student
router.post('/send-reminder/:studentId', authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        s.*, 
        COALESCE(SUM(f.amount), 0) - COALESCE(SUM(p.amount), 0) as balance
      FROM students s
      LEFT JOIN fees f ON s.id = f.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [req.params.studentId]);

    if (!students.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const student = students[0];
    const message = `Dear ${student.parent_name}, your child ${student.first_name} ${student.last_name} has a pending fee balance of ${student.balance} RWF. Please pay at your earliest convenience. - Garden TVET School`;

    const result = await sendSMS(student.parent_phone, message, req.user.id, { 
      type: 'fee_reminder', 
      studentId: student.id, 
      balance: student.balance 
    });

    await pool.query(
      'INSERT INTO fee_reminders (student_id, amount, sent_by, status, sent_at) VALUES (?, ?, ?, ?, NOW())',
      [student.id, student.balance, req.user.id, result.success ? 'sent' : 'failed']
    );

    res.json({ success: result.success, message: result.success ? 'Reminder sent' : result.error });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send bulk fee reminders
router.post('/send-bulk-reminders', authenticateToken, async (req, res) => {
  try {
    const { minBalance = 0, trade, level } = req.body;
    
    let query = `
      SELECT 
        s.id, s.first_name, s.last_name, s.parent_phone, s.parent_name,
        COALESCE(SUM(f.amount), 0) - COALESCE(SUM(p.amount), 0) as balance
      FROM students s
      LEFT JOIN fees f ON s.id = f.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      WHERE s.parent_phone IS NOT NULL
    `;
    const params = [];

    if (trade) {
      query += ' AND s.trade = ?';
      params.push(trade);
    }
    if (level) {
      query += ' AND s.level = ?';
      params.push(level);
    }

    query += ' GROUP BY s.id HAVING balance > ?';
    params.push(minBalance);

    const [students] = await pool.query(query, params);

    let sent = 0;
    for (const student of students) {
      const message = `Dear ${student.parent_name}, your child ${student.first_name} ${student.last_name} has a pending fee balance of ${student.balance} RWF. Please pay at your earliest convenience. - Garden TVET School`;
      
      const result = await sendSMS(student.parent_phone, message, req.user.id, { 
        type: 'fee_reminder', 
        studentId: student.id, 
        balance: student.balance 
      });

      await pool.query(
        'INSERT INTO fee_reminders (student_id, amount, sent_by, status, sent_at) VALUES (?, ?, ?, ?, NOW())',
        [student.id, student.balance, req.user.id, result.success ? 'sent' : 'failed']
      );

      if (result.success) sent++;
    }

    res.json({ success: true, message: `Sent ${sent}/${students.length} reminders` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reminder history
router.get('/reminder-history', authenticateToken, async (req, res) => {
  try {
    const [reminders] = await pool.query(`
      SELECT 
        fr.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.parent_phone,
        CONCAT(st.first_name, ' ', st.last_name) as sent_by_name
      FROM fee_reminders fr
      JOIN students s ON fr.student_id = s.id
      LEFT JOIN staff st ON fr.sent_by = st.id
      ORDER BY fr.sent_at DESC
      LIMIT 100
    `);
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Configure auto-reminder settings (accountant can set remind parent after X days)
router.post('/auto-reminder-settings', authenticateToken, async (req, res) => {
  try {
    const { enabled, frequency, minBalance, time, remind_after_days } = req.body;
    await pool.query(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['fee_reminder_enabled', enabled != null ? String(enabled) : 'true', enabled != null ? String(enabled) : 'true']
    );
    await pool.query(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['fee_reminder_frequency', frequency || 'daily', frequency || 'daily']
    );
    await pool.query(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['fee_reminder_min_balance', minBalance != null ? String(minBalance) : '0', minBalance != null ? String(minBalance) : '0']
    );
    await pool.query(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['fee_reminder_time', time || '09:00', time || '09:00']
    );
    await pool.query(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['fee_reminder_remind_after_days', remind_after_days != null ? String(remind_after_days) : '7', remind_after_days != null ? String(remind_after_days) : '7']
    );
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get auto-reminder settings
router.get('/auto-reminder-settings', authenticateToken, async (req, res) => {
  try {
    const [settings] = await pool.query(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE "fee_reminder_%"'
    );
    const config = {};
    settings.forEach(s => config[s.setting_key] = s.setting_value);
    res.json({ success: true, settings: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Auto-reminder cron job (runs daily at configured time)
async function runAutoReminders() {
  try {
    const [settings] = await pool.query(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ("fee_reminder_enabled", "fee_reminder_min_balance")'
    );
    
    const config = {};
    settings.forEach(s => config[s.setting_key] = s.setting_value);

    if (config.fee_reminder_enabled !== 'true') return;

    const minBalance = parseInt(config.fee_reminder_min_balance || 0);

    const [students] = await pool.query(`
      SELECT 
        s.id, s.first_name, s.last_name, s.parent_phone, s.parent_name,
        COALESCE(SUM(f.amount), 0) - COALESCE(SUM(p.amount), 0) as balance
      FROM students s
      LEFT JOIN fees f ON s.id = f.student_id
      LEFT JOIN payments p ON s.id = p.student_id
      WHERE s.parent_phone IS NOT NULL
      GROUP BY s.id
      HAVING balance > ?
    `, [minBalance]);

    console.log(`Auto-reminder: Found ${students.length} students with pending fees`);

    for (const student of students) {
      const message = `Dear ${student.parent_name}, your child ${student.first_name} ${student.last_name} has a pending fee balance of ${student.balance} RWF. Please pay at your earliest convenience. - Garden TVET School`;
      
      const result = await sendSMS(student.parent_phone, message, 1, { 
        type: 'auto_fee_reminder', 
        studentId: student.id, 
        balance: student.balance 
      });

      await pool.query(
        'INSERT INTO fee_reminders (student_id, amount, sent_by, status, sent_at, is_auto) VALUES (?, ?, ?, ?, NOW(), ?)',
        [student.id, student.balance, 1, result.success ? 'sent' : 'failed', true]
      );
    }

    console.log(`Auto-reminder: Completed`);
  } catch (error) {
    console.error('Auto-reminder error:', error);
  }
}

// Schedule cron job (daily at 9 AM)
if (process.env.ENABLE_CRON_JOBS === 'true') {
  cron.schedule('0 9 * * *', runAutoReminders);
  console.log('✅ Fee reminder cron job scheduled');
}

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const gardenSMSService = require('../services/gardenSMSService');

// Message single parent
router.post('/message-parents', async (req, res) => {
  try {
    const { student_id, message } = req.body;
    const staff_id = req.user?.id;

    if (!student_id || !message) {
      return res.status(400).json({ success: false, error: 'Student ID and message required' });
    }

    // Get linked parents
    const [parents] = await db.execute(`
      SELECT u.phone, u.first_name, u.last_name, s.first_name as student_first, s.last_name as student_last
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      JOIN global_student_sheets s ON psl.student_id = s.id
      WHERE psl.student_id = ? AND psl.status = 'approved' AND u.phone IS NOT NULL
    `, [student_id]);

    if (parents.length === 0) {
      return res.json({ success: true, sms_sent: 0, message: 'No linked parents with phone numbers' });
    }

    let sent = 0;
    for (const parent of parents) {
      const smsMessage = `Mwaramutse ${parent.first_name},\n\n${message}\n\nUmwana: ${parent.student_first} ${parent.student_last}\n\n- Garden TVET School`;
      
      const result = await gardenSMSService.sendSMS(parent.phone, smsMessage);
      if (result.success) sent++;
    }

    res.json({ success: true, sms_sent: sent, total: parents.length });
  } catch (error) {
    console.error('Message parents error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

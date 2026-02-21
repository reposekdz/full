const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireRole } = require('../middleware/auth');

// SMS Service Configuration
const SMS_CONFIG = {
  AFRICASTALKING_API_KEY: process.env.AFRICASTALKING_API_KEY || 'demo_key',
  AFRICASTALKING_USERNAME: process.env.AFRICASTALKING_USERNAME || 'sandbox',
  SENDER_ID: 'GARDEN_TVET'
};

// Send SMS function
async function sendSMS(phone, message) {
  try {
    console.log(`📱 Sending SMS to ${phone}: ${message}`);
    // In production, integrate with Africa's Talking API
    // For now, simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log SMS in database
    try {
      await db.execute(
        'INSERT INTO sms_logs (phone, message, status, sent_at) VALUES (?, ?, ?, NOW())',
        [phone, message, 'sent']
      );
    } catch (dbError) {
      console.log('SMS log error (non-critical):', dbError.message);
    }
    
    return { success: true, message: 'SMS sent successfully' };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
}

// Welcome SMS for new parent registration
router.post('/send-welcome-sms', async (req, res) => {
  try {
    const { phone, parent_name } = req.body;
    
    const welcomeMessage = `🎓 Murakaza neza kuri Garden TVET! ${parent_name}, mwiyandikishije neza. Muzabona amakuru y'umwana wanyu, amanota, imyitwarire n'ibindi. Murakoze guhitamo Garden TVET! 📚✨`;
    
    const result = await sendSMS(phone, welcomeMessage);
    
    if (result.success) {
      res.json({ success: true, message: 'Welcome SMS sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Welcome SMS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Success linking SMS
router.post('/send-linking-success-sms', async (req, res) => {
  try {
    const { phone, parent_name, student_name, trade_name, level } = req.body;
    
    const linkingMessage = `✅ Byakunze! ${parent_name}, mwafatanije neza n'umwana wanyu ${student_name} (${trade_name} Level ${level}). Ubu muzabona amakuru yawe yose kuri Garden TVET. Murakoze! 🎉📱`;
    
    const result = await sendSMS(phone, linkingMessage);
    
    if (result.success) {
      res.json({ success: true, message: 'Linking success SMS sent' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Linking SMS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DOD send message to all linked parents
router.post('/dod-message-all-parents', requireRole(['dod', 'director_discipline']), async (req, res) => {
  try {
    const { message, message_type = 'general', priority = 'normal' } = req.body;
    const sender_id = req.user.id;
    
    // Get all linked parents with phone numbers
    const [parents] = await db.execute(`
      SELECT DISTINCT p.id, p.phone, p.first_name, p.last_name,
             s.first_name as student_name, s.last_name as student_surname,
             s.trade_name, s.level_number
      FROM parents p
      JOIN parent_student_links psl ON p.id = psl.parent_id
      JOIN global_student_sheets s ON psl.student_id = s.student_id
      WHERE psl.status = 'approved' AND p.phone IS NOT NULL
    `);
    
    if (parents.length === 0) {
      return res.json({ success: false, message: 'No linked parents found' });
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // Send SMS to each parent
    for (const parent of parents) {
      const personalizedMessage = `📢 Garden TVET - ${parent.first_name}: ${message} - Umwana: ${parent.student_name} ${parent.student_surname} (${parent.trade_name} L${parent.level_number})`;
      
      const smsResult = await sendSMS(parent.phone, personalizedMessage);
      
      if (smsResult.success) {
        successCount++;
        
        // Log notification in database
        try {
          await db.execute(`
            INSERT INTO parent_notifications (parent_id, message, message_type, priority, sender_id, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
          `, [parent.id, message, message_type, priority, sender_id]);
        } catch (dbError) {
          console.log('Notification log error (non-critical):', dbError.message);
        }
      } else {
        failCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Messages sent to ${successCount} parents. ${failCount} failed.`,
      stats: { total: parents.length, success: successCount, failed: failCount }
    });
    
  } catch (error) {
    console.error('DOD messaging error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DOD send message to specific parent
router.post('/dod-message-parent', requireRole(['dod', 'director_discipline']), async (req, res) => {
  try {
    const { parent_id, message, message_type = 'general', priority = 'normal' } = req.body;
    const sender_id = req.user.id;
    
    // Get parent details
    const [parents] = await db.execute(`
      SELECT p.*, s.first_name as student_name, s.last_name as student_surname,
             s.trade_name, s.level_number
      FROM parents p
      JOIN parent_student_links psl ON p.id = psl.parent_id
      JOIN global_student_sheets s ON psl.student_id = s.student_id
      WHERE p.id = ? AND psl.status = 'approved'
      LIMIT 1
    `, [parent_id]);
    
    if (parents.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }
    
    const parent = parents[0];
    const personalizedMessage = `📢 Garden TVET - ${parent.first_name}: ${message} - Umwana: ${parent.student_name} ${parent.student_surname}`;
    
    const smsResult = await sendSMS(parent.phone, personalizedMessage);
    
    if (smsResult.success) {
      // Log notification
      try {
        await db.execute(`
          INSERT INTO parent_notifications (parent_id, message, message_type, priority, sender_id, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [parent_id, message, message_type, priority, sender_id]);
      } catch (dbError) {
        console.log('Notification log error (non-critical):', dbError.message);
      }
      
      res.json({ success: true, message: 'Message sent successfully' });
    } else {
      res.status(500).json({ success: false, error: smsResult.error });
    }
    
  } catch (error) {
    console.error('DOD parent messaging error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all linked parents for DOD
router.get('/dod-linked-parents', requireRole(['dod', 'director_discipline']), async (req, res) => {
  try {
    const [parents] = await db.execute(`
      SELECT p.id, p.first_name, p.last_name, p.phone, p.email,
             s.student_id, s.first_name as student_name, s.last_name as student_surname,
             s.student_code, s.trade_name, s.level_number, s.gender,
             psl.created_at as linked_date, psl.relationship
      FROM parents p
      JOIN parent_student_links psl ON p.id = psl.parent_id
      JOIN global_student_sheets s ON psl.student_id = s.student_id
      WHERE psl.status = 'approved'
      ORDER BY psl.created_at DESC
    `);
    
    res.json({ success: true, parents });
  } catch (error) {
    console.error('Get linked parents error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Conduct removal SMS (automatic)
router.post('/conduct-removal-sms', requireRole(['dod', 'director_discipline']), async (req, res) => {
  try {
    const { student_id, conduct_type, points_deducted, new_score, reason } = req.body;
    
    // Get all parents linked to this student
    const [parents] = await db.execute(`
      SELECT p.phone, p.first_name, s.first_name as student_name, s.last_name as student_surname
      FROM parents p
      JOIN parent_student_links psl ON p.id = psl.parent_id
      JOIN global_student_sheets s ON psl.student_id = s.student_id
      WHERE s.student_id = ? AND psl.status = 'approved' AND p.phone IS NOT NULL
    `, [student_id]);
    
    if (parents.length === 0) {
      return res.json({ success: false, message: 'No linked parents found for this student' });
    }
    
    let successCount = 0;
    
    for (const parent of parents) {
      const conductMessage = `⚠️ Garden TVET - ${parent.first_name}: Umwana ${parent.student_name} ${parent.student_surname} yakiriye igihano. Ubwoba: ${conduct_type}. Amanota yakuwe: ${points_deducted}. Amanota ashya: ${new_score}/40. Impamvu: ${reason}`;
      
      const smsResult = await sendSMS(parent.phone, conductMessage);
      if (smsResult.success) successCount++;
    }
    
    res.json({
      success: true,
      message: `Conduct SMS sent to ${successCount} parents`,
      parents_notified: successCount
    });
    
  } catch (error) {
    console.error('Conduct SMS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leave approval SMS (automatic)
router.post('/leave-approval-sms', requireRole(['dod', 'director_discipline']), async (req, res) => {
  try {
    const { student_id, leave_type, start_date, end_date, status } = req.body;
    
    // Get all parents linked to this student
    const [parents] = await db.execute(`
      SELECT p.phone, p.first_name, s.first_name as student_name, s.last_name as student_surname
      FROM parents p
      JOIN parent_student_links psl ON p.id = psl.parent_id
      JOIN global_student_sheets s ON psl.student_id = s.student_id
      WHERE s.student_id = ? AND psl.status = 'approved' AND p.phone IS NOT NULL
    `, [student_id]);
    
    if (parents.length === 0) {
      return res.json({ success: false, message: 'No linked parents found for this student' });
    }
    
    let successCount = 0;
    const statusText = status === 'approved' ? 'yemewe' : 'yanze';
    const emoji = status === 'approved' ? '✅' : '❌';
    
    for (const parent of parents) {
      const leaveMessage = `${emoji} Garden TVET - ${parent.first_name}: Icyifuzo cy'umwana ${parent.student_name} ${parent.student_surname} (${leave_type}) kuva ${start_date} kugeza ${end_date} ${statusText}.`;
      
      const smsResult = await sendSMS(parent.phone, leaveMessage);
      if (smsResult.success) successCount++;
    }
    
    res.json({
      success: true,
      message: `Leave SMS sent to ${successCount} parents`,
      parents_notified: successCount
    });
    
  } catch (error) {
    console.error('Leave SMS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
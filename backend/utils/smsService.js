// SMS Service for sending messages to parents without smartphones
// Supports multiple SMS gateways (Twilio, Africa's Talking, etc.)

const sendSMS = async (phoneNumber, message) => {
  try {
    // Format phone number (remove spaces, add country code if needed)
    const formattedPhone = phoneNumber.replace(/\s/g, '').startsWith('+') 
      ? phoneNumber.replace(/\s/g, '') 
      : `+250${phoneNumber.replace(/^0/, '')}`;

    console.log(`📱 SMS to ${formattedPhone}: ${message}`);

    // Option 1: Twilio (if configured)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      
      console.log('✅ SMS sent via Twilio:', result.sid);
      
      // Log successful SMS to database
      try {
        const { pool } = require('../config/database');
        await pool.execute(
          'INSERT INTO sms_queue (phone_number, message, status, provider, message_id, sent_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [formattedPhone, message, 'sent', 'twilio', result.sid]
        );
      } catch (dbError) {
        console.error('Failed to log SMS success:', dbError);
      }
      
      return { success: true, provider: 'twilio', messageId: result.sid };
    }

    // Option 2: Africa's Talking (if configured)
    if (process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME) {
      const AfricasTalking = require('africastalking')({
        apiKey: process.env.AFRICASTALKING_API_KEY,
        username: process.env.AFRICASTALKING_USERNAME
      });
      
      const sms = AfricasTalking.SMS;
      const result = await sms.send({
        to: [formattedPhone],
        message: message,
        from: process.env.AFRICASTALKING_SHORTCODE || 'GARDEN'
      });
      
      console.log('✅ SMS sent via Africa\'s Talking:', result);
      
      // Log successful SMS to database
      try {
        const { pool } = require('../config/database');
        await pool.execute(
          'INSERT INTO sms_queue (phone_number, message, status, provider, message_id, sent_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [formattedPhone, message, 'sent', 'africastalking', result.SMSMessageData?.Recipients?.[0]?.messageId || 'AT_' + Date.now()]
        );
      } catch (dbError) {
        console.error('Failed to log SMS success:', dbError);
      }
      
      return { success: true, provider: 'africastalking', result, messageId: result.SMSMessageData?.Recipients?.[0]?.messageId };
    }

    // Option 3: Generic HTTP SMS Gateway
    if (process.env.SMS_GATEWAY_URL) {
      const axios = require('axios');
      
      const result = await axios.post(process.env.SMS_GATEWAY_URL, {
        phone: formattedPhone,
        message: message,
        api_key: process.env.SMS_GATEWAY_API_KEY
      });
      
      console.log('✅ SMS sent via HTTP Gateway:', result.data);
      
      // Log successful SMS to database
      try {
        const { pool } = require('../config/database');
        await pool.execute(
          'INSERT INTO sms_queue (phone_number, message, status, provider, message_id, sent_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [formattedPhone, message, 'sent', 'http_gateway', result.data?.id || 'HTTP_' + Date.now()]
        );
      } catch (dbError) {
        console.error('Failed to log SMS success:', dbError);
      }
      
      return { success: true, provider: 'http_gateway', result: result.data };
    }

    // Fallback: Log to database for manual sending
    const { pool } = require('../config/database');
    await pool.execute(
      'INSERT INTO sms_queue (message, sender_id, status, created_at) VALUES (?, ?, ?, NOW())',
      [message, formattedPhone, 'pending']
    );
    
    console.log('⚠️ SMS queued for manual sending (no provider configured)');
    return { success: true, provider: 'queued', messageId: 'QUEUED_' + Date.now() };

  } catch (error) {
    console.error('❌ SMS Error:', error.message);
    
    // Log failed SMS to database
    try {
      const { pool } = require('../config/database');
      await pool.execute(
        'INSERT INTO sms_queue (message, sender_id, status, created_at) VALUES (?, ?, ?, NOW())',
        [message, phoneNumber, 'failed']
      );
    } catch (dbError) {
      console.error('Failed to log SMS error:', dbError);
    }
    
    return { success: false, error: error.message };
  }
};

// Send bulk SMS with enhanced tracking
const sendBulkSMS = async (recipients) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS(recipient.phone, recipient.message);
    results.push({ 
      ...recipient, 
      ...result,
      timestamp: new Date().toISOString()
    });
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
};

// Get SMS queue (for manual sending)
const getSMSQueue = async (status = 'pending') => {
  try {
    const { pool } = require('../config/database');
    const [messages] = await pool.execute(
      'SELECT * FROM sms_queue WHERE status = ? ORDER BY created_at DESC LIMIT 100',
      [status]
    );
    return messages;
  } catch (error) {
    console.error('Error fetching SMS queue:', error);
    return [];
  }
};

// Mark SMS as sent
const markSMSSent = async (id) => {
  try {
    const { pool } = require('../config/database');
    await pool.execute(
      'UPDATE sms_queue SET status = ?, sent_at = NOW() WHERE id = ?',
      ['sent', id]
    );
    return { success: true };
  } catch (error) {
    console.error('Error marking SMS as sent:', error);
    return { success: false, error: error.message };
  }
};

// Send parent registration welcome SMS
const sendParentWelcomeSMS = async (parentPhone, parentName) => {
  try {
    const message = `🎓 Garden TVET: Murakaza neza ${parentName}!

✅ KONTI YASHYIZWEHO: Konti yanyu ya mubyeyi yashyizweho neza!

🔍 Mwashobora:
• Gusaba guhuza n'abana banyu
• Kureba amakuru y'abana
• Kubona ubutumwa bw'ishuri
• Gukurikirana inyigisho

📱 Mwinjire muri sisitemu yacu kugira ngo mutangire!

📞 Hamagara: +250783407691 niba mufite ibibazo.

Murakoze guhitamo Garden TVET! 🙏`;
    
    return await sendSMS(parentPhone, message);
  } catch (error) {
    console.error('Parent welcome SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Send automatic linking success SMS
const sendAutoLinkSuccessSMS = async (parentPhone, parentName, studentName, studentCode, tradeCode, levelNumber) => {
  try {
    const message = `🎓 Garden TVET: Murakaza neza ${parentName}!

🎉 MWAHUYE N'UMWANA: Mwahuye n'umwana ${studentName} neza!

📋 Amakuru y'umwana:
• Amazina: ${studentName}
• Kode: ${studentCode}
• Umwuga: ${tradeCode}
• Urwego: ${levelNumber}

🔍 Ubu mwashobora kureba:
• Amanota n'ibizamini
• Kwiga no kutabara
• Imyitwarire (conduct)
• Amafaranga (fees)
• Ubutumwa bw'ishuri

📱 Mwinjire muri sisitemu yacu kugira ngo mubone amakuru yose!

Murakoze kubana natwe! 🙏`;
    
    return await sendSMS(parentPhone, message);
  } catch (error) {
    console.error('Auto link success SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Send conduct removal notification SMS
const sendConductRemovalSMS = async (parentPhone, studentName, conductType, pointsDeducted, newScore, description) => {
  try {
    const message = `Garden TVET: Umwana ${studentName} yakiriye igihano cya "${conductType}". Amanota ${pointsDeducted} yakuweho. Amanota ashya: ${newScore}/40. Impamvu: ${description}. Mufashe umwana mwanyu!`;
    
    return await sendSMS(parentPhone, message);
  } catch (error) {
    console.error('Conduct removal SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Send leave approval SMS
const sendLeaveApprovalSMS = async (parentPhone, studentName, leaveType, reason, startTime, endTime) => {
  try {
    const message = `Garden TVET: Umwana ${studentName} yemerewe gusohoka (${leaveType}). Impamvu: ${reason}. Igihe: ${startTime}${endTime && endTime !== startTime ? ' - ' + endTime : ''}. Mwirinde!`;
    
    return await sendSMS(parentPhone, message);
  } catch (error) {
    console.error('Leave approval SMS error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  getSMSQueue,
  markSMSSent,
  sendParentWelcomeSMS,
  sendAutoLinkSuccessSMS,
  sendConductRemovalSMS,
  sendLeaveApprovalSMS
};

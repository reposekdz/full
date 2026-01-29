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
      
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      
      console.log('✅ SMS sent via Twilio');
      return { success: true, provider: 'twilio' };
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
        from: process.env.AFRICASTALKING_SHORTCODE || 'SCHOOL'
      });
      
      console.log('✅ SMS sent via Africa\'s Talking');
      return { success: true, provider: 'africastalking', result };
    }

    // Option 3: Generic HTTP SMS Gateway
    if (process.env.SMS_GATEWAY_URL) {
      const axios = require('axios');
      
      await axios.post(process.env.SMS_GATEWAY_URL, {
        phone: formattedPhone,
        message: message,
        api_key: process.env.SMS_GATEWAY_API_KEY
      });
      
      console.log('✅ SMS sent via HTTP Gateway');
      return { success: true, provider: 'http_gateway' };
    }

    // Fallback: Log to database for manual sending
    const { pool } = require('../config/database');
    await pool.execute(
      'INSERT INTO sms_queue (phone_number, message, status) VALUES (?, ?, ?)',
      [formattedPhone, message, 'pending']
    );
    
    console.log('⚠️ SMS queued for manual sending (no provider configured)');
    return { success: true, provider: 'queued' };

  } catch (error) {
    console.error('❌ SMS Error:', error.message);
    
    // Log failed SMS to database
    try {
      const { pool } = require('../config/database');
      await pool.execute(
        'INSERT INTO sms_queue (phone_number, message, status, error_message) VALUES (?, ?, ?, ?)',
        [phoneNumber, message, 'failed', error.message]
      );
    } catch (dbError) {
      console.error('Failed to log SMS error:', dbError);
    }
    
    return { success: false, error: error.message };
  }
};

// Send bulk SMS
const sendBulkSMS = async (recipients) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS(recipient.phone, recipient.message);
    results.push({ ...recipient, ...result });
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
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

module.exports = {
  sendSMS,
  sendBulkSMS,
  getSMSQueue,
  markSMSSent
};

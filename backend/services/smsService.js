const africastalking = require('africastalking');
const axios = require('axios');
const { pool } = require('../config/database');

const credentials = {
  apiKey: process.env.AFRICATALKING_API_KEY,
  username: process.env.AFRICATALKING_USERNAME
};

const AT = africastalking(credentials);
const sms = AT.SMS;

// Send SMS to single recipient
async function sendSMS(to, message, senderId, metadata = {}) {
  if (process.env.ENABLE_SMS_NOTIFICATIONS === 'false') {
    console.log('SMS notifications are disabled in .env');
    return { success: true, message: 'SMS disabled', simulated: true };
  }
  try {
    const phoneNumber = formatPhoneNumber(to);
    
    const balanceCheck = await checkBalance();
    if (!balanceCheck.success && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Insufficient balance or API error' };
    }

    const result = await sms.send({
      to: [phoneNumber],
      message: message
    });

    await logMessage({
      recipient: phoneNumber,
      message: message,
      senderId: senderId,
      status: 'sent',
      provider: 'africastalking_sms',
      metadata: metadata,
      response: JSON.stringify(result)
    });

    return { 
      success: true, 
      data: result,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    };
  } catch (error) {
    await logMessage({
      recipient: to,
      message: message,
      senderId: senderId,
      status: 'failed',
      provider: 'africastalking_sms',
      metadata: metadata,
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

// Send WhatsApp message via Africa's Talking Content API
async function sendWhatsApp(to, message, senderId, metadata = {}) {
  if (process.env.ENABLE_SMS_NOTIFICATIONS === 'false') {
    console.log('WhatsApp notifications are disabled in .env');
    return { success: true, message: 'WhatsApp disabled', simulated: true };
  }
  try {
    const phoneNumber = formatPhoneNumber(to);
    
    // Using Africa's Talking Content API for WhatsApp
    // The endpoint and structure might vary based on your specific AT account setup
    const response = await axios.post(
      'https://content.africastalking.com/v1/send',
      {
        username: credentials.username,
        to: [phoneNumber],
        message: message,
        from: process.env.AFRICATALKING_WHATSAPP_CHANNEL || 'GARDEN_TSS'
      },
      {
        headers: {
          'apiKey': credentials.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    await logMessage({
      recipient: phoneNumber,
      message: message,
      senderId: senderId,
      status: 'sent',
      provider: 'africastalking_whatsapp',
      metadata: metadata,
      response: JSON.stringify(response.data)
    });

    return { success: true, data: response.data };
  } catch (error) {
    await logMessage({
      recipient: to,
      message: message,
      senderId: senderId,
      status: 'failed',
      provider: 'africastalking_whatsapp',
      metadata: metadata,
      error: error.response?.data?.errorMessage || error.message
    });
    return { success: false, error: error.message };
  }
}

// Send Universal Message (Smart logic: WhatsApp -> SMS fallback)
async function sendUniversalMessage(to, message, senderId, metadata = {}) {
  if (!isValidPhoneNumber(to)) {
    console.error(`Invalid phone number: ${to}`);
    return { success: false, error: 'Invalid phone number' };
  }

  const { preferredMethod = 'dual', hasSmartphone = false } = metadata;
  const results = { whatsapp: null, sms: null };

  if (hasSmartphone || preferredMethod === 'dual' || preferredMethod === 'whatsapp') {
    results.whatsapp = await sendWhatsApp(to, message, senderId, metadata);
    if (results.whatsapp.success && preferredMethod !== 'dual') {
      return { success: true, method: 'whatsapp', results };
    }
  }

  // If WhatsApp fails or preferred is SMS or dual, send SMS
  if (!results.whatsapp?.success || preferredMethod === 'sms' || preferredMethod === 'dual') {
    results.sms = await sendSMS(to, message, senderId, metadata);
  }

  return { 
    success: results.whatsapp?.success || results.sms?.success,
    method: results.whatsapp?.success && results.sms?.success ? 'dual' : (results.whatsapp?.success ? 'whatsapp' : 'sms'),
    results 
  };
}

// Send bulk SMS
async function sendBulkSMS(recipients, message, senderId, metadata = {}) {
  try {
    const phoneNumbers = recipients.map(formatPhoneNumber);
    
    const result = await sms.send({
      to: phoneNumbers,
      message: message,
      enqueue: true // Queue for bulk sending
    });

    // Log each message
    for (const recipient of phoneNumbers) {
      await logMessage({
        recipient: recipient,
        message: message,
        senderId: senderId,
        status: 'sent',
        provider: 'africastalking',
        metadata: { ...metadata, bulk: true },
        response: JSON.stringify(result)
      });
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Check Africa's Talking balance
async function checkBalance() {
  try {
    const application = AT.APPLICATION;
    const balance = await application.fetchApplicationData();
    return { 
      success: true, 
      balance: balance.UserData?.balance || 'Unknown'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Format phone number to international format
function formatPhoneNumber(phone) {
  if (!phone) return null;
  // Remove spaces and special characters
  let cleaned = phone.replace(/[^0-9+]/g, '');
  
  if (cleaned.length < 8) return null;

  // Add country code if missing (Rwanda +250)
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0')) {
      cleaned = '+250' + cleaned.substring(1);
    } else if (cleaned.startsWith('250')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+250' + cleaned;
    }
  }
  
  return cleaned;
}

function isValidPhoneNumber(phone) {
  const formatted = formatPhoneNumber(phone);
  return formatted && formatted.length >= 10 && formatted.startsWith('+');
}

// Log message to database
async function logMessage(data) {
  try {
    await pool.execute(
      `INSERT INTO sms_messages 
       (recipient, message, sender_id, status, provider, metadata, response, error, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.recipient,
        data.message,
        data.senderId,
        data.status,
        data.provider,
        JSON.stringify(data.metadata || {}),
        data.response || null,
        data.error || null
      ]
    );
  } catch (error) {
    console.error('Failed to log message:', error);
  }
}

// Get message history
async function getMessageHistory(filters = {}) {
  try {
    let query = `
      SELECT sm.*, 
             CONCAT(s.first_name, ' ', s.last_name) as sender_name,
             s.role as sender_role
      FROM sms_messages sm
      LEFT JOIN staff s ON sm.sender_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.senderId) {
      query += ' AND sm.sender_id = ?';
      params.push(filters.senderId);
    }

    if (filters.recipient) {
      query += ' AND sm.recipient = ?';
      params.push(filters.recipient);
    }

    if (filters.status) {
      query += ' AND sm.status = ?';
      params.push(filters.status);
    }

    if (filters.dateFrom) {
      query += ' AND sm.created_at >= ?';
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      query += ' AND sm.created_at <= ?';
      params.push(filters.dateTo);
    }

    query += ' ORDER BY sm.created_at DESC LIMIT ?';
    params.push(filters.limit || 100);

    const [messages] = await pool.execute(query, params);
    return { success: true, messages };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get SMS statistics
async function getSMSStats(filters = {}) {
  try {
    let query = `
      SELECT 
        COUNT(*) as total_messages,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        COUNT(DISTINCT recipient) as unique_recipients,
        COUNT(DISTINCT sender_id) as unique_senders
      FROM sms_messages
      WHERE 1=1
    `;
    const params = [];

    if (filters.dateFrom) {
      query += ' AND created_at >= ?';
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      query += ' AND created_at <= ?';
      params.push(filters.dateTo);
    }

    const [stats] = await pool.execute(query, params);
    return { success: true, stats: stats[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { 
  sendSMS, 
  sendWhatsApp,
  sendUniversalMessage,
  sendBulkSMS, 
  checkBalance, 
  formatPhoneNumber,
  isValidPhoneNumber,
  getMessageHistory,
  getSMSStats
};

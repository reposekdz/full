const africastalking = require('africastalking');
const db = require('../config/database');

const credentials = {
  apiKey: process.env.AFRICATALKING_API_KEY || 'atsk_d53924f3401f197002d867a93dd86ac7404952e2062869c26090eebd4e09955ffd1a8013',
  username: process.env.AFRICATALKING_USERNAME || 'sandbox'
};

const AT = africastalking(credentials);
const sms = AT.SMS;

// Send SMS to single recipient
async function sendSMS(to, message, senderId, metadata = {}) {
  try {
    // Validate phone number format
    const phoneNumber = formatPhoneNumber(to);
    
    // Check balance before sending
    const balanceCheck = await checkBalance();
    if (!balanceCheck.success) {
      return { success: false, error: 'Insufficient balance or API error' };
    }

    // Send SMS via Africa's Talking
    const result = await sms.send({
      to: [phoneNumber],
      message: message
    });

    // Log message to database
    await logMessage({
      recipient: phoneNumber,
      message: message,
      senderId: senderId,
      status: 'sent',
      provider: 'africastalking',
      metadata: metadata,
      response: JSON.stringify(result)
    });

    return { 
      success: true, 
      data: result,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId,
      status: result.SMSMessageData?.Recipients?.[0]?.status,
      cost: result.SMSMessageData?.Recipients?.[0]?.cost
    };
  } catch (error) {
    // Log failed message
    await logMessage({
      recipient: to,
      message: message,
      senderId: senderId,
      status: 'failed',
      provider: 'africastalking',
      metadata: metadata,
      error: error.message
    });

    return { success: false, error: error.message };
  }
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
  // Remove spaces and special characters
  let cleaned = phone.replace(/[^0-9+]/g, '');
  
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

// Log message to database
async function logMessage(data) {
  try {
    await db.query(
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

    const [messages] = await db.query(query, params);
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

    const [stats] = await db.query(query, params);
    return { success: true, stats: stats[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { 
  sendSMS, 
  sendBulkSMS, 
  checkBalance, 
  formatPhoneNumber,
  getMessageHistory,
  getSMSStats
};

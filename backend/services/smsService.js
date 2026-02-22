const africastalking = require('africastalking');

// Initialize Africa's Talking
const AT = africastalking({
  apiKey: process.env.AT_API_KEY || 'your_api_key_here',
  username: process.env.AT_USERNAME || 'sandbox'
});

const sms = AT.SMS;

// SMS Templates
const templates = {
  parent_link_new: (data) => `Muraho! Mwahawe konti ya Parent Portal - Garden TVET

Umwana: ${data.student_name}
Code: ${data.student_code}
Trade: ${data.trade_name} - Level ${data.level}

LOGIN:
Phone: ${data.parent_phone}
Password: ${data.temp_password}

Injira kuri: portal.gardentvet.rw
Murakoze!

Linked by: ${data.linked_by}`,

  parent_link_existing: (data) => `Muraho! Mwahujwe n'umwana wanyu - Garden TVET

Umwana: ${data.student_name}
Code: ${data.student_code}
Trade: ${data.trade_name} - Level ${data.level}

AMAKURU:
✓ Conduct: ${data.conduct_score}/40
✓ Attendance: ${data.attendance}%
✓ Balance: ${data.balance} RWF

Injira kuri portal mubone byose!
By: ${data.linked_by}`,

  payment_confirmation: (data) => `Payment Received! ✓

Student: ${data.student_name}
Amount: ${data.amount} RWF
Method: ${data.payment_method}
Receipt: ${data.receipt_number}

Balance: ${data.new_balance} RWF

Thank you! - Garden TVET`,

  conduct_removed: (data) => `CONDUCT UPDATE

Umwana: ${data.student_name}
Points Lost: -${data.points_removed}
New Score: ${data.new_score}/40
Grade: ${data.grade}

Reason: ${data.reason}
By: ${data.removed_by}

Garden TVET`,

  leave_approved: (data) => `LEAVE APPROVED ✓

Student: ${data.student_name}
Dates: ${data.start_date} - ${data.end_date}
Days: ${data.days}
Reason: ${data.reason}

Approved by: ${data.approved_by}
Garden TVET`
};

// Send SMS function
const sendSMS = async ({ to, message, type, priority = 'normal', metadata = {} }) => {
  try {
    // Format phone number
    let phone = to.toString().trim();
    if (phone.startsWith('0')) {
      phone = '+250' + phone.substring(1);
    } else if (!phone.startsWith('+')) {
      phone = '+250' + phone;
    }

    console.log(`Sending SMS to ${phone}...`);

    // Send via Africa's Talking
    const result = await sms.send({
      to: [phone],
      message: message,
      from: process.env.AT_SENDER_ID || 'GARDEN_TVET'
    });

    console.log('SMS sent successfully:', result);

    // Log to database
    try {
      const db = require('../config/database');
      await db.query(
        `INSERT INTO sms_logs (phone, message, type, priority, status, metadata, sent_at)
         VALUES (?, ?, ?, ?, 'sent', ?, NOW())`,
        [phone, message, type, priority, JSON.stringify(metadata)]
      );
    } catch (dbError) {
      console.error('Failed to log SMS:', dbError);
    }

    return {
      success: true,
      result,
      phone,
      message_id: result.SMSMessageData?.Recipients?.[0]?.messageId
    };

  } catch (error) {
    console.error('SMS send error:', error);

    // Log failed SMS
    try {
      const db = require('../config/database');
      await db.query(
        `INSERT INTO sms_logs (phone, message, type, priority, status, error_message, sent_at)
         VALUES (?, ?, ?, ?, 'failed', ?, NOW())`,
        [to, message, type, priority, error.message]
      );
    } catch (dbError) {
      console.error('Failed to log error:', dbError);
    }

    return {
      success: false,
      error: error.message
    };
  }
};

// Send templated SMS
const sendTemplatedSMS = async (templateName, data, phone) => {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  const message = template(data);
  return sendSMS({
    to: phone,
    message,
    type: templateName,
    priority: 'high',
    metadata: data
  });
};

// Bulk SMS
const sendBulkSMS = async (recipients) => {
  const results = [];
  for (const recipient of recipients) {
    const result = await sendSMS(recipient);
    results.push(result);
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return results;
};

module.exports = {
  sendSMS,
  sendTemplatedSMS,
  sendBulkSMS,
  templates
};

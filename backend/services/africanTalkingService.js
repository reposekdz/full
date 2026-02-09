// African Talking SMS Service
// Full integration with Africa's Talking API for SMS messaging

const AFRICAN_TALKING_API_KEY = process.env.AFRICAN_TALKING_API_KEY;
const AFRICAN_TALKING_USERNAME = process.env.AFRICAN_TALKING_USERNAME;
const AFRICAN_TALKING_SENDER = process.env.AFRICAN_TALKING_SENDER || 'SCHOOL';

const AT_BASE_URL = 'https://api.africastalking.com/version1';

class AfricanTalkingService {
  constructor() {
    this.apiKey = AFRICAN_TALKING_API_KEY;
    this.username = AFRICAN_TALKING_USERNAME;
    this.sender = AFRICAN_TALKING_SENDER;
    this.isConfigured = this.apiKey && this.username && this.apiKey !== 'your_api_key_here';
  }

  /**
   * Check if African Talking is properly configured
   */
  isReady() {
    return this.isConfigured;
  }

  /**
   * Get account balance
   */
  async getBalance() {
    if (!this.isConfigured) {
      return { success: false, error: 'African Talking not configured', balance: 0 };
    }

    try {
      const response = await fetch(`${AT_BASE_URL}/user/balance`, {
        headers: {
          'apiKey': this.apiKey,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      return { success: true, balance: data.UserData?.balance || '0' };
    } catch (error) {
      return { success: false, error: error.message, balance: 0 };
    }
  }

  /**
   * Send single SMS
   * @param {string} phone - Recipient phone number (format: +250XXXXXXXXX or 07XXXXXXXX)
   * @param {string} message - Message content
   */
  async sendSMS(phone, message) {
    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) {
      return { success: false, error: 'Invalid phone number format' };
    }

    // Demo mode
    if (!this.isConfigured) {
      console.log(`[DEMO SMS] To: ${formattedPhone}, Message: ${message}`);
      return {
        success: true,
        messageId: `demo-${Date.now()}`,
        status: 'demo',
        recipient: formattedPhone
      };
    }

    try {
      const response = await fetch(`${AT_BASE_URL}/messaging`, {
        method: 'POST',
        headers: {
          'apiKey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          username: this.username,
          message: message,
          to: formattedPhone,
          from: this.sender
        })
      });

      const data = await response.json();
      
      if (data.SMSMessageData?.Recipients?.length > 0) {
        const recipient = data.SMSMessageData.Recipients[0];
        return {
          success: recipient.status === 'Success',
          messageId: recipient.messageId || recipient.id,
          status: recipient.status,
          cost: recipient.cost,
          recipient: formattedPhone
        };
      }

      return { success: false, error: data.SMSMessageData?.Message || 'Failed to send SMS' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk SMS
   * @param {string[]} phones - Array of recipient phone numbers
   * @param {string} message - Message content
   */
  async sendBulkSMS(phones, message) {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const phone of phones) {
      const result = await this.sendSMS(phone, message);
      results.push(result);
      if (result.success) successCount++;
      else failCount++;
    }

    return {
      success: failCount === 0,
      total: phones.length,
      sent: successCount,
      failed: failCount,
      results
    };
  }

  /**
   * Send SMS to group (class, trade, etc.)
   * @param {Array} recipients - Array of { phone, name } objects
   * @param {string} message - Message content (can use {{name}} for personalization)
   */
  async sendGroupSMS(recipients, message) {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      const personalizedMessage = message.replace('{{name}}', recipient.name || '');
      const result = await this.sendSMS(recipient.phone, personalizedMessage);
      results.push({
        ...result,
        recipientName: recipient.name,
        recipientPhone: recipient.phone
      });
      if (result.success) successCount++;
      else failCount++;
    }

    return {
      success: failCount === 0,
      total: recipients.length,
      sent: successCount,
      failed: failCount,
      results
    };
  }

  /**
   * Format phone number to African Talking format
   * @param {string} phone - Phone number
   */
  formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Rwandan phone numbers
    if (cleaned.startsWith('250')) {
      // Already in international format
      return `+${cleaned}`;
    }
    
    if (cleaned.startsWith('0')) {
      // Remove leading 0 and add country code
      cleaned = '250' + cleaned.substring(1);
      return `+${cleaned}`;
    }
    
    if (cleaned.length === 9) {
      // Assume Rwandan number without country code
      return `+250${cleaned}`;
    }
    
    // Return as is if it has country code
    if (cleaned.length === 12 || (cleaned.length === 13 && cleaned.startsWith('25'))) {
      return `+${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  /**
   * Get SMS delivery status
   * @param {string} messageId - Message ID from send response
   */
  async getMessageStatus(messageId) {
    if (!this.isConfigured) {
      return { success: false, error: 'African Talking not configured' };
    }

    try {
      const response = await fetch(
        `${AT_BASE_URL}/messaging?messageId=${messageId}`,
        {
          headers: {
            'apiKey': this.apiKey,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      return { success: true, status: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS using template
   * @param {string} phone - Recipient phone
   * @param {string} templateId - Template ID
   * @param {Object} variables - Template variables
   */
  async sendTemplateSMS(phone, templateId, variables) {
    // Templates mapping (in production, this would be database-stored)
    const templates = {
      'attendance_alert': 'Dear {{parent}}, {{student}} was absent on {{date}}. Please contact the school.',
      'payment_reminder': 'Dear {{parent}}, {{student}}\'s payment of {{amount}} is due. Please pay by {{due_date}}.',
      'marks_notification': 'Dear {{parent}}, {{student}}\'s marks for {{subject}} have been posted. Log in to view.',
      'exam_schedule': 'Dear {{parent}}, {{student}} has exams starting {{date}}. Timetable available at school.',
      'general_announcement': '{{message}}'
    };

    const template = templates[templateId] || templates['general_announcement'];
    let message = template;

    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return this.sendSMS(phone, message);
  }
}

// Export singleton instance
const africanTalkingService = new AfricanTalkingService();

module.exports = {
  AfricanTalkingService,
  africanTalkingService,
  sendSMS: (phone, message) => africanTalkingService.sendSMS(phone, message),
  sendBulkSMS: (phones, message) => africanTalkingService.sendBulkSMS(phones, message),
  sendGroupSMS: (recipients, message) => africanTalkingService.sendGroupSMS(recipients, message),
  sendTemplateSMS: (phone, templateId, variables) => africanTalkingService.sendTemplateSMS(phone, templateId, variables),
  getBalance: () => africanTalkingService.getBalance(),
  getMessageStatus: (messageId) => africanTalkingService.getMessageStatus(messageId),
  isReady: () => africanTalkingService.isReady()
};

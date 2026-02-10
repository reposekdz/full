const { pool } = require('../config/database');
const africanTalkingService = require('./africanTalkingService');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  constructor(io) {
    this.io = io;
    this.activeConnections = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      socket.on('authenticate', async (data) => {
        try {
          const { user_id, user_type, role_name, token } = data;
          
          // Store connection in database
          await pool.execute(`
            INSERT INTO websocket_connections (socket_id, user_id, user_type, role_name, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              last_activity = CURRENT_TIMESTAMP,
              is_active = TRUE
          `, [socket.id, user_id, user_type, role_name, socket.handshake.address, socket.handshake.headers['user-agent']]);
          
          // Store in memory for quick access
          this.activeConnections.set(socket.id, {
            user_id,
            user_type,
            role_name,
            socket
          });
          
          socket.join(`user_${user_id}`);
          socket.join(`role_${role_name}`);
          socket.join(`type_${user_type}`);
          
          socket.emit('authenticated', { success: true });
          
          // Send pending notifications
          await this.sendPendingNotifications(user_id);
          
        } catch (error) {
          console.error('Socket authentication error:', error);
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });
      
      socket.on('mark_read', async (data) => {
        try {
          const { notification_id } = data;
          const connection = this.activeConnections.get(socket.id);
          
          if (connection) {
            await this.markNotificationAsRead(notification_id, connection.user_id);
          }
        } catch (error) {
          console.error('Mark read error:', error);
        }
      });
      
      socket.on('disconnect', async () => {
        try {
          await pool.execute(`
            UPDATE websocket_connections 
            SET is_active = FALSE, last_activity = CURRENT_TIMESTAMP 
            WHERE socket_id = ?
          `, [socket.id]);
          
          this.activeConnections.delete(socket.id);
          console.log(`Socket disconnected: ${socket.id}`);
        } catch (error) {
          console.error('Socket disconnect error:', error);
        }
      });
    });
  }

  async createNotification({
    type_code,
    sender_id,
    sender_role,
    title,
    message,
    priority = 'medium',
    category = 'general',
    metadata = {},
    expires_at = null,
    template_id = null
  }) {
    try {
      const notification_uuid = uuidv4();
      
      const [result] = await pool.execute(`
        INSERT INTO notifications (
          notification_uuid, type_code, template_id, sender_id, sender_role,
          title, message, priority, category, metadata, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [notification_uuid, type_code, template_id, sender_id, sender_role, title, message, priority, category, JSON.stringify(metadata), expires_at]);
      
      return {
        id: result.insertId,
        uuid: notification_uuid
      };
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  async addRecipients(notification_id, recipients) {
    try {
      const recipientData = [];
      
      for (const recipient of recipients) {
        const {
          recipient_id,
          recipient_type,
          recipient_identifier,
          phone_number,
          email,
          delivery_method = 'websocket'
        } = recipient;
        
        recipientData.push([
          notification_id,
          recipient_id,
          recipient_type,
          recipient_identifier,
          phone_number,
          email,
          delivery_method
        ]);
      }
      
      if (recipientData.length > 0) {
        await pool.execute(`
          INSERT INTO notification_recipients (
            notification_id, recipient_id, recipient_type, recipient_identifier,
            phone_number, email, delivery_method
          ) VALUES ${recipientData.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
        `, recipientData.flat());
      }
    } catch (error) {
      console.error('Add recipients error:', error);
      throw error;
    }
  }

  async sendNotification({
    type_code,
    sender_id,
    sender_role,
    title,
    message,
    recipients,
    priority = 'medium',
    category = 'general',
    metadata = {},
    send_sms = false,
    send_email = false
  }) {
    try {
      // Create notification
      const notification = await this.createNotification({
        type_code,
        sender_id,
        sender_role,
        title,
        message,
        priority,
        category,
        metadata
      });
      
      // Add recipients
      await this.addRecipients(notification.id, recipients);
      
      // Send via WebSocket
      await this.sendWebSocketNotifications(notification.id);
      
      // Send SMS if requested
      if (send_sms) {
        await this.sendSMSNotifications(notification.id);
      }
      
      // Send Email if requested (placeholder for future implementation)
      if (send_email) {
        await this.sendEmailNotifications(notification.id);
      }
      
      return notification;
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }

  async sendWebSocketNotifications(notification_id) {
    try {
      const [recipients] = await pool.execute(`
        SELECT nr.*, n.title, n.message, n.priority, n.category, n.metadata, n.created_at
        FROM notification_recipients nr
        JOIN notifications n ON nr.notification_id = n.id
        WHERE nr.notification_id = ? AND nr.delivery_method = 'websocket'
      `, [notification_id]);
      
      for (const recipient of recipients) {
        const notificationData = {
          id: notification_id,
          title: recipient.title,
          message: recipient.message,
          priority: recipient.priority,
          category: recipient.category,
          metadata: JSON.parse(recipient.metadata || '{}'),
          created_at: recipient.created_at
        };
        
        let delivered = false;
        
        // Send to specific user
        if (recipient.recipient_id) {
          const room = `user_${recipient.recipient_id}`;
          if (this.io.sockets.adapter.rooms.has(room)) {
            this.io.to(room).emit('notification', notificationData);
            delivered = true;
          }
        }
        
        // Send to role
        if (recipient.recipient_type === 'role' && recipient.recipient_identifier) {
          const room = `role_${recipient.recipient_identifier}`;
          if (this.io.sockets.adapter.rooms.has(room)) {
            this.io.to(room).emit('notification', notificationData);
            delivered = true;
          }
        }
        
        // Send to user type
        if (recipient.recipient_type !== 'user' && recipient.recipient_type !== 'role') {
          const room = `type_${recipient.recipient_type}`;
          if (this.io.sockets.adapter.rooms.has(room)) {
            this.io.to(room).emit('notification', notificationData);
            delivered = true;
          }
        }
        
        // Update delivery status
        const status = delivered ? 'sent' : 'failed';
        await pool.execute(`
          UPDATE notification_recipients 
          SET delivery_status = ?, sent_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [status, recipient.id]);
        
        // Log real-time delivery
        await pool.execute(`
          INSERT INTO realtime_delivery_log (notification_recipient_id, delivery_status, delivered_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `, [recipient.id, status]);
      }
    } catch (error) {
      console.error('WebSocket notification error:', error);
      throw error;
    }
  }

  async sendSMSNotifications(notification_id) {
    try {
      const [recipients] = await pool.execute(`
        SELECT nr.*, n.message, n.type_code
        FROM notification_recipients nr
        JOIN notifications n ON nr.notification_id = n.id
        WHERE nr.notification_id = ? AND nr.phone_number IS NOT NULL
      `, [notification_id]);
      
      for (const recipient of recipients) {
        try {
          // Get SMS template if available
          let smsMessage = recipient.message;
          
          const [templates] = await pool.execute(`
            SELECT sms_template_rw, sms_template_en 
            FROM notification_templates 
            WHERE type_code = ? AND is_active = TRUE 
            LIMIT 1
          `, [recipient.type_code]);
          
          if (templates.length > 0) {
            smsMessage = templates[0].sms_template_rw || templates[0].sms_template_en || smsMessage;
          }
          
          // Send SMS via Africa's Talking
          const smsResult = await africanTalkingService.sendSMS({
            to: recipient.phone_number,
            message: smsMessage.substring(0, 160) // SMS character limit
          });
          
          // Log SMS delivery
          await pool.execute(`
            INSERT INTO sms_delivery_log (
              notification_recipient_id, phone_number, message, status, 
              message_id, delivery_report, sent_at
            ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `, [
            recipient.id,
            recipient.phone_number,
            smsMessage,
            smsResult.success ? 'sent' : 'failed',
            smsResult.messageId || null,
            JSON.stringify(smsResult)
          ]);
          
          // Update recipient status
          await pool.execute(`
            UPDATE notification_recipients 
            SET delivery_status = ?, sent_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `, [smsResult.success ? 'sent' : 'failed', recipient.id]);
          
        } catch (smsError) {
          console.error(`SMS send error for recipient ${recipient.id}:`, smsError);
          
          // Log failed SMS
          await pool.execute(`
            INSERT INTO sms_delivery_log (
              notification_recipient_id, phone_number, message, status, 
              error_message, sent_at
            ) VALUES (?, ?, ?, 'failed', ?, CURRENT_TIMESTAMP)
          `, [recipient.id, recipient.phone_number, recipient.message, smsError.message]);
          
          await pool.execute(`
            UPDATE notification_recipients 
            SET delivery_status = 'failed', error_message = ? 
            WHERE id = ?
          `, [smsError.message, recipient.id]);
        }
      }
    } catch (error) {
      console.error('SMS notification error:', error);
      throw error;
    }
  }

  async sendEmailNotifications(notification_id) {
    // Placeholder for email implementation
    console.log(`Email notifications for ${notification_id} - To be implemented`);
  }

  async sendPendingNotifications(user_id) {
    try {
      const [notifications] = await pool.execute(`
        SELECT n.*, nr.id as recipient_id
        FROM notifications n
        JOIN notification_recipients nr ON n.id = nr.notification_id
        WHERE nr.recipient_id = ? 
          AND nr.delivery_status = 'pending' 
          AND nr.delivery_method = 'websocket'
          AND (n.expires_at IS NULL OR n.expires_at > NOW())
        ORDER BY n.created_at DESC
        LIMIT 50
      `, [user_id]);
      
      const socket = this.getSocketByUserId(user_id);
      if (socket) {
        for (const notification of notifications) {
          socket.emit('notification', {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            category: notification.category,
            metadata: JSON.parse(notification.metadata || '{}'),
            created_at: notification.created_at
          });
          
          // Update status
          await pool.execute(`
            UPDATE notification_recipients 
            SET delivery_status = 'sent', sent_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `, [notification.recipient_id]);
        }
      }
    } catch (error) {
      console.error('Send pending notifications error:', error);
    }
  }

  async markNotificationAsRead(notification_id, user_id) {
    try {
      await pool.execute(`
        UPDATE notification_recipients 
        SET delivery_status = 'read', read_at = CURRENT_TIMESTAMP 
        WHERE notification_id = ? AND recipient_id = ?
      `, [notification_id, user_id]);
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  }

  getSocketByUserId(user_id) {
    for (const [socketId, connection] of this.activeConnections) {
      if (connection.user_id === user_id) {
        return connection.socket;
      }
    }
    return null;
  }

  // Application-specific notification methods
  async notifyApplicationSubmitted(application) {
    const recipients = [
      {
        recipient_id: null,
        recipient_type: 'role',
        recipient_identifier: 'dos',
        phone_number: null,
        email: null,
        delivery_method: 'websocket'
      }
    ];
    
    // Add student notification
    if (application.phone) {
      recipients.push({
        recipient_id: null,
        recipient_type: 'student',
        recipient_identifier: application.phone,
        phone_number: application.phone,
        email: application.email,
        delivery_method: 'websocket'
      });
    }
    
    return await this.sendNotification({
      type_code: 'APPLICATION_SUBMITTED',
      sender_id: null,
      sender_role: 'system',
      title: 'New Application Submitted',
      message: `New application from ${application.first_name} ${application.last_name} (${application.application_number})`,
      recipients,
      priority: 'medium',
      category: 'application',
      metadata: {
        application_id: application.id,
        application_number: application.application_number,
        student_name: `${application.first_name} ${application.last_name}`
      },
      send_sms: true
    });
  }

  async notifyApplicationStatusChange(application, old_status, new_status, reviewed_by) {
    const type_codes = {
      'approved': 'APPLICATION_APPROVED',
      'rejected': 'APPLICATION_REJECTED',
      'under_review': 'APPLICATION_UNDER_REVIEW'
    };
    
    const type_code = type_codes[new_status] || 'APPLICATION_UNDER_REVIEW';
    
    const recipients = [{
      recipient_id: null,
      recipient_type: 'student',
      recipient_identifier: application.phone,
      phone_number: application.phone,
      email: application.email,
      delivery_method: 'websocket'
    }];
    
    const titles = {
      'approved': 'Application Approved!',
      'rejected': 'Application Status Update',
      'under_review': 'Application Under Review'
    };
    
    const messages = {
      'approved': `Congratulations! Your application has been approved. Student ID: ${application.student_id || 'TBD'}`,
      'rejected': `Your application could not be approved at this time. Please contact the admissions office.`,
      'under_review': `Your application is currently under review. You will be contacted soon.`
    };
    
    return await this.sendNotification({
      type_code,
      sender_id: reviewed_by,
      sender_role: 'staff',
      title: titles[new_status],
      message: messages[new_status],
      recipients,
      priority: new_status === 'approved' ? 'high' : 'medium',
      category: 'application',
      metadata: {
        application_id: application.id,
        application_number: application.application_number,
        student_name: `${application.first_name} ${application.last_name}`,
        old_status,
        new_status
      },
      send_sms: true
    });
  }

  async notifyInterviewScheduled(application, interview_date, interview_time, location) {
    const recipients = [{
      recipient_id: null,
      recipient_type: 'student',
      recipient_identifier: application.phone,
      phone_number: application.phone,
      email: application.email,
      delivery_method: 'websocket'
    }];
    
    return await this.sendNotification({
      type_code: 'INTERVIEW_SCHEDULED',
      sender_id: null,
      sender_role: 'system',
      title: 'Interview Scheduled',
      message: `Your interview is scheduled for ${interview_date} at ${interview_time}. Location: ${location}`,
      recipients,
      priority: 'high',
      category: 'application',
      metadata: {
        application_id: application.id,
        application_number: application.application_number,
        student_name: `${application.first_name} ${application.last_name}`,
        interview_date,
        interview_time,
        location
      },
      send_sms: true
    });
  }

  // Role-based broadcast notifications
  async broadcastToRole(role_name, title, message, priority = 'medium', category = 'general') {
    const recipients = [{
      recipient_id: null,
      recipient_type: 'role',
      recipient_identifier: role_name,
      phone_number: null,
      email: null,
      delivery_method: 'websocket'
    }];
    
    return await this.sendNotification({
      type_code: 'SYSTEM_ALERT',
      sender_id: null,
      sender_role: 'system',
      title,
      message,
      recipients,
      priority,
      category
    });
  }

  async broadcastToAll(title, message, priority = 'medium', category = 'general') {
    const recipients = [{
      recipient_id: null,
      recipient_type: 'all',
      recipient_identifier: 'all_users',
      phone_number: null,
      email: null,
      delivery_method: 'websocket'
    }];
    
    return await this.sendNotification({
      type_code: 'SYSTEM_ALERT',
      sender_id: null,
      sender_role: 'system',
      title,
      message,
      recipients,
      priority,
      category
    });
  }
}

module.exports = NotificationService;
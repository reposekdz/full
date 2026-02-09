// Socket.IO Service for Real-Time Notifications
const { Server } = require('socket.io');

let io = null;

// Store connected users
const connectedUsers = new Map();
const userRooms = new Map();

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle authentication
    socket.on('authenticate', (data) => {
      const { userId, userRole, token } = data;
      connectedUsers.set(socket.id, { userId, userRole, token });
      console.log(`User ${userId} (${userRole}) connected`);
      
      // Join role-specific room
      socket.join(`role:${userRole}`);
      
      // Join user-specific room
      socket.join(`user:${userId}`);
    });

    // Handle joining rooms
    socket.on('join:room', (data) => {
      const { room } = data;
      socket.join(room);
      if (!userRooms.has(room)) {
        userRooms.set(room, new Set());
      }
      userRooms.get(room).add(socket.id);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Handle leaving rooms
    socket.on('leave:room', (data) => {
      const { room } = data;
      socket.leave(room);
      userRooms.get(room).delete(socket.id);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    // Handle notifications
    socket.on('notification:send', (data) => {
      const { type, title, message, recipients, priority, metadata } = data;
      
      const notification = {
        id: `notif-${Date.now()}`,
        type,
        title,
        message,
        priority: priority || 'medium',
        metadata,
        sender: {
          id: connectedUsers.get(socket.id)?.userId,
          role: connectedUsers.get(socket.id)?.userRole
        },
        created_at: new Date().toISOString()
      };

      if (recipients === 'all') {
        io.emit('notification:new', notification);
      } else if (recipients === 'role') {
        io.to(`role:${metadata?.role}`).emit('notification:new', notification);
      } else if (recipients === 'specific') {
        metadata?.userIds?.forEach((userId) => {
          io.to(`user:${userId}`).emit('notification:new', notification);
        });
      }

      console.log('Notification sent:', notification);
    });

    // Handle SMS notifications
    socket.on('sms:send', (data) => {
      const { phones, message, type, senderId, senderRole } = data;
      
      phones.forEach((phone) => {
        const smsRecord = {
          id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          phone,
          message,
          type,
          status: 'sent',
          sent_at: new Date().toISOString()
        };
        
        socket.emit('sms:sent', smsRecord);
        
        setTimeout(() => {
          smsRecord.status = 'delivered';
          smsRecord.delivered_at = new Date().toISOString();
          socket.emit('sms:delivered', smsRecord);
        }, 2000);
      });

      console.log('SMS queued for:', phones);
    });

    // Handle parent alerts
    socket.on('parent:alert', (data) => {
      const { studentId, parentPhone, alertType, message, senderId, senderRole } = data;
      
      const alert = {
        id: `alert-${Date.now()}`,
        student_id: studentId,
        parent_phone: parentPhone,
        alert_type: alertType,
        message,
        sent_via: 'both',
        status: 'sent',
        created_at: new Date().toISOString()
      };

      io.to(`user:${parentPhone}`).emit('parent:alert', alert);
      
      console.log('Parent alert:', alert);
    });

    // Handle student updates
    socket.on('student:update', (data) => {
      const { studentId, updateType, data: updateData, updatedBy } = data;
      
      const update = {
        student_id: studentId,
        update_type: updateType,
        data: updateData,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      };

      io.to(`user:${studentId}`).emit(`student:${updateType}_updated`, update);
      
      io.to('role:teacher').emit(`student:${updateType}_updated`, update);
      io.to('role:director_study').emit(`student:${updateType}_updated`, update);
      
      console.log('Student update:', update);
    });

    // Handle marks updates
    socket.on('marks:update', (data) => {
      const { studentId, courseId, marks, updatedBy } = data;
      
      const update = {
        student_id: studentId,
        course_id: courseId,
        marks,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      };

      io.to(`user:${studentId}`).emit('student:marks_updated', update);
      
      console.log('Marks updated:', update);
    });

    // Handle attendance updates
    socket.on('attendance:mark', (data) => {
      const { studentId, date, status, markedBy } = data;
      
      const record = {
        student_id: studentId,
        date,
        status,
        marked_by: markedBy,
        marked_at: new Date().toISOString()
      };

      io.to(`user:${studentId}`).emit('student:attendance_updated', record);
      
      io.emit('parent:alert', {
        student_id: studentId,
        alert_type: 'attendance',
        message: status === 'absent' 
          ? 'Your child was absent from school today.'
          : `Your child was marked as ${status} today.`,
        created_at: new Date().toISOString()
      });

      console.log('Attendance marked:', record);
    });

    // Handle discipline incidents
    socket.on('discipline:report', (data) => {
      const { studentId, incidentType, severity, description, reportedBy } = data;
      
      const incident = {
        id: `inc-${Date.now()}`,
        student_id: studentId,
        incident_type: incidentType,
        severity,
        description,
        reported_by: reportedBy,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      io.to('role:director_discipline').emit('discipline:incident_reported', incident);
      
      io.to(`user:${studentId}`).emit('student:discipline_record', incident);
      
      if (severity === 'high' || severity === 'critical') {
        io.emit('parent:alert', {
          student_id: studentId,
          alert_type: 'discipline',
          message: `Important: A ${incidentType} incident involving your child has been reported.`,
          created_at: new Date().toISOString()
        });
      }

      console.log('Discipline incident reported:', incident);
    });

    // Handle report card generation
    socket.on('report:generate', (data) => {
      const { studentId, reportType, generatedBy } = data;
      
      const report = {
        id: `report-${Date.now()}`,
        student_id: studentId,
        type: reportType,
        generated_by: generatedBy,
        generated_at: new Date().toISOString()
      };

      io.to(`user:${studentId}`).emit('report:generated', report);
      
      console.log('Report generated:', report);
    });

    // Handle chat messages
    socket.on('chat:send', (data) => {
      const { roomId, message, senderId, senderName, senderRole } = data;
      
      const chatMessage = {
        id: `chat-${Date.now()}`,
        room_id: roomId,
        sender_id: senderId,
        sender_name: senderName,
        sender_role: senderRole,
        message,
        timestamp: new Date().toISOString(),
        read: false
      };

      io.to(roomId).emit('chat:message', chatMessage);
      
      console.log('Chat message sent:', chatMessage);
    });

    // Handle typing indicator
    socket.on('chat:typing', (data) => {
      const { roomId, userId, userName } = data;
      socket.to(roomId).emit('chat:typing', { userId, userName });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const userData = connectedUsers.get(socket.id);
      console.log(`Client disconnected: ${socket.id}`, userData);
      connectedUsers.delete(socket.id);
      
      userRooms.forEach((sockets, room) => {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userRooms.delete(room);
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return { io, connectedUsers, userRooms };
};

// Helper functions for sending notifications from server-side
const sendNotification = (notification, recipients) => {
  recipients.forEach(userId => {
    io.to(`user:${userId}`).emit('notification:new', {
      ...notification,
      id: notification.id || `notif-${Date.now()}`
    });
  });
};

const sendSMSNotification = (phones, message, type) => {
  phones.forEach(phone => {
    const smsRecord = {
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phone,
      message,
      type,
      status: 'sent',
      sent_at: new Date().toISOString()
    };
    
    io.emit('sms:sent', smsRecord);
    
    setTimeout(() => {
      smsRecord.status = 'delivered';
      smsRecord.delivered_at = new Date().toISOString();
      io.emit('sms:delivered', smsRecord);
    }, 2000);
  });
};

const broadcastToRole = (role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

const broadcastToAll = (event, data) => {
  io.emit(event, data);
};

const getIO = () => io;

module.exports = { 
  initializeSocket, 
  sendNotification, 
  sendSMSNotification, 
  broadcastToRole, 
  broadcastToAll, 
  getIO,
  connectedUsers,
  userRooms
};

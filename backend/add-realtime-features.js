const fs = require('fs');
const path = require('path');

console.log('🚀 Adding Real-time Features...\n');

const realtimeCode = `
// ============================================
// REAL-TIME SOCKET.IO HANDLER
// ============================================

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

function initializeRealtime(server, db) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(\`✅ User \${socket.userId} connected\`);

    // Join user's personal room
    socket.join(\`user_\${socket.userId}\`);
    socket.join(\`role_\${socket.userRole}\`);

    // ============================================
    // NOTIFICATIONS
    // ============================================
    socket.on('notification:send', async (data) => {
      try {
        const { user_id, type, title, message, priority } = data;
        
        const [result] = await db.query(
          'INSERT INTO realtime_notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
          [user_id, type, title, message, priority || 'medium']
        );

        io.to(\`user_\${user_id}\`).emit('notification:new', {
          id: result.insertId,
          type,
          title,
          message,
          priority,
          created_at: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ============================================
    // LIVE UPDATES
    // ============================================
    socket.on('subscribe:entity', (data) => {
      const { entity_type, entity_id } = data;
      socket.join(\`\${entity_type}_\${entity_id}\`);
      console.log(\`User \${socket.userId} subscribed to \${entity_type}_\${entity_id}\`);
    });

    socket.on('unsubscribe:entity', (data) => {
      const { entity_type, entity_id } = data;
      socket.leave(\`\${entity_type}_\${entity_id}\`);
    });

    socket.on('entity:update', (data) => {
      const { entity_type, entity_id, update_data } = data;
      io.to(\`\${entity_type}_\${entity_id}\`).emit('entity:updated', {
        entity_type,
        entity_id,
        data: update_data,
        updated_by: socket.userId,
        timestamp: new Date()
      });
    });

    // ============================================
    // CHAT/MESSAGING
    // ============================================
    socket.on('message:send', async (data) => {
      try {
        const { recipient_id, message, type } = data;
        
        const [result] = await db.query(
          'INSERT INTO messages (sender_id, recipient_id, message, type) VALUES (?, ?, ?, ?)',
          [socket.userId, recipient_id, message, type || 'text']
        );

        io.to(\`user_\${recipient_id}\`).emit('message:new', {
          id: result.insertId,
          sender_id: socket.userId,
          message,
          type,
          created_at: new Date()
        });

        socket.emit('message:sent', { id: result.insertId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('typing:start', (data) => {
      const { recipient_id } = data;
      io.to(\`user_\${recipient_id}\`).emit('typing:indicator', {
        user_id: socket.userId,
        is_typing: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { recipient_id } = data;
      io.to(\`user_\${recipient_id}\`).emit('typing:indicator', {
        user_id: socket.userId,
        is_typing: false
      });
    });

    // ============================================
    // PRESENCE
    // ============================================
    socket.on('presence:update', async (status) => {
      try {
        await db.query(
          'UPDATE users SET online_status = ?, last_seen = NOW() WHERE id = ?',
          [status, socket.userId]
        );

        io.emit('presence:changed', {
          user_id: socket.userId,
          status,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ============================================
    // COLLABORATION
    // ============================================
    socket.on('document:join', (data) => {
      const { document_id } = data;
      socket.join(\`document_\${document_id}\`);
      
      io.to(\`document_\${document_id}\`).emit('user:joined', {
        user_id: socket.userId,
        document_id
      });
    });

    socket.on('document:edit', (data) => {
      const { document_id, changes } = data;
      
      socket.to(\`document_\${document_id}\`).emit('document:changes', {
        user_id: socket.userId,
        changes,
        timestamp: new Date()
      });
    });

    // ============================================
    // LIVE DASHBOARD UPDATES
    // ============================================
    socket.on('dashboard:subscribe', (dashboard_type) => {
      socket.join(\`dashboard_\${dashboard_type}\`);
    });

    // Broadcast dashboard updates
    setInterval(async () => {
      try {
        // Get live stats
        const [[stats]] = await db.query(\`
          SELECT 
            (SELECT COUNT(*) FROM students WHERE is_active = TRUE) as total_students,
            (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
            (SELECT COUNT(*) FROM users WHERE online_status = 'online') as online_users
        \`);

        io.to('dashboard_admin').emit('dashboard:stats', stats);
      } catch (error) {
        console.error('Dashboard update error:', error);
      }
    }, 5000); // Update every 5 seconds

    // ============================================
    // DISCONNECT
    // ============================================
    socket.on('disconnect', async () => {
      console.log(\`❌ User \${socket.userId} disconnected\`);
      
      try {
        await db.query(
          'UPDATE users SET online_status = ?, last_seen = NOW() WHERE id = ?',
          ['offline', socket.userId]
        );

        io.emit('presence:changed', {
          user_id: socket.userId,
          status: 'offline',
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  return io;
}

module.exports = { initializeRealtime };
`;

// Write real-time handler
const realtimePath = path.join(__dirname, 'services', 'realtime.js');
fs.mkdirSync(path.dirname(realtimePath), { recursive: true });
fs.writeFileSync(realtimePath, realtimeCode);

console.log('✅ Created realtime.js service');
console.log('📊 Added real-time features:');
console.log('   - Live notifications');
console.log('   - Entity subscriptions');
console.log('   - Real-time messaging');
console.log('   - Typing indicators');
console.log('   - Presence tracking');
console.log('   - Document collaboration');
console.log('   - Live dashboard updates');
console.log('\n✨ Real-time features complete!');

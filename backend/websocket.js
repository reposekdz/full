const WebSocket = require('ws');
const db = require('./config/database');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const sessionId = req.url.split('/').pop();
    
    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      
      if (data.type === 'join_session') {
        ws.sessionId = sessionId;
        ws.userId = data.userId;
        
        await db.query(
          'INSERT INTO session_participants (session_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE joined_at = CURRENT_TIMESTAMP',
          [sessionId, data.userId]
        );
        
        broadcastToSession(sessionId, {
          type: 'participant_joined',
          userId: data.userId
        });
      }
      
      if (data.type === 'chat_message') {
        await db.query(
          'INSERT INTO realtime_messages (session_id, sender_id, content, message_type) VALUES (?, ?, ?, ?)',
          [sessionId, ws.userId, data.content, 'text']
        );
        
        broadcastToSession(sessionId, {
          type: 'message',
          message: {
            sender_id: ws.userId,
            sender_name: data.senderName,
            content: data.content,
            sent_at: new Date()
          }
        });
      }
    });

    ws.on('close', async () => {
      if (ws.userId && ws.sessionId) {
        await db.query(
          'UPDATE session_participants SET left_at = CURRENT_TIMESTAMP, is_active = false WHERE session_id = ? AND user_id = ?',
          [ws.sessionId, ws.userId]
        );
        
        broadcastToSession(ws.sessionId, {
          type: 'participant_left',
          userId: ws.userId
        });
      }
    });
  });

  const broadcastToSession = (sessionId, data) => {
    wss.clients.forEach(client => {
      if (client.sessionId === sessionId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  return wss;
};

module.exports = setupWebSocket;

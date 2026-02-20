const fs = require('fs');
const path = require('path');

console.log('🚀 Enhancing Notifications...\n');

const notificationService = `class NotificationService {
  constructor(db, io) {
    this.db = db;
    this.io = io;
  }

  async send(userId, type, title, message, priority = 'medium') {
    const [result] = await this.db.query(
      'INSERT INTO realtime_notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [userId, type, title, message, priority]
    );

    this.io.to(\`user_\${userId}\`).emit('notification:new', {
      id: result.insertId,
      type,
      title,
      message,
      priority,
      created_at: new Date()
    });

    return result.insertId;
  }

  async broadcast(type, title, message, priority = 'medium') {
    const [users] = await this.db.query('SELECT id FROM users WHERE is_active = TRUE');
    
    for (const user of users) {
      await this.send(user.id, type, title, message, priority);
    }
  }
}

module.exports = NotificationService;`;

const servicesDir = path.join(__dirname, 'services');
fs.mkdirSync(servicesDir, { recursive: true });
fs.writeFileSync(path.join(servicesDir, 'notifications.js'), notificationService);

console.log('✅ Created notification service');
console.log('✨ Notifications enhanced!');

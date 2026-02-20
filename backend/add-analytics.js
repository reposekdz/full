const fs = require('fs');
const path = require('path');

console.log('🚀 Adding Analytics...\n');

const analyticsService = `class AnalyticsService {
  constructor(db) {
    this.db = db;
  }

  async trackEvent(userId, eventType, eventData) {
    await this.db.query(
      'INSERT INTO analytics_events (user_id, event_type, event_data) VALUES (?, ?, ?)',
      [userId, eventType, JSON.stringify(eventData)]
    );
  }

  async getDashboardStats(startDate, endDate) {
    const [stats] = await this.db.query(\`
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        event_type,
        DATE(created_at) as date
      FROM analytics_events
      WHERE created_at BETWEEN ? AND ?
      GROUP BY event_type, DATE(created_at)
    \`, [startDate, endDate]);
    
    return stats;
  }
}

module.exports = AnalyticsService;`;

const servicesDir = path.join(__dirname, 'services');
fs.mkdirSync(servicesDir, { recursive: true });
fs.writeFileSync(path.join(servicesDir, 'analytics.js'), analyticsService);

console.log('✅ Created analytics service');
console.log('✨ Analytics added!');

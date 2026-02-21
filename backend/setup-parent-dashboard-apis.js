const fs = require('fs');
const path = require('path');
const db = require('./config/database');

async function setupParentDashboard() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PARENT DASHBOARD SETUP');
  console.log('='.repeat(60) + '\n');

  try {
    const sqlPath = path.join(__dirname, 'migrations', 'parent-dashboard-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.pool.query(statement);
      }
    }

    console.log('✅ Tables created successfully:\n');
    console.log('   - parent_messages');
    console.log('   - parent_activities');
    console.log('   - parent_notifications');
    console.log('   - payment_transactions\n');

    console.log('📡 API Endpoints Ready:\n');
    console.log('   GET  /api/parent-dashboard/student/auto-fetch');
    console.log('   POST /api/parent-dashboard/send-message');
    console.log('   GET  /api/parent-dashboard/messages');
    console.log('   GET  /api/parent-dashboard/activity/feed');
    console.log('   GET  /api/parent-dashboard/activity/notifications');
    console.log('   PUT  /api/parent-dashboard/activity/notifications/:id/read');
    console.log('   GET  /api/parent-dashboard/activity/stats');
    console.log('   POST /api/parent-dashboard/payments/initiate');
    console.log('   GET  /api/parent-dashboard/payments/history');
    console.log('   GET  /api/parent-dashboard/student/:id/conduct');
    console.log('   GET  /api/parent-dashboard/student/:id/fees\n');

    console.log('='.repeat(60));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupParentDashboard();

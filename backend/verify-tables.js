const { pool } = require('./config/database');

async function verifyTables() {
  const tablesToCheck = [
    'messages',
    'message_reads',
    'notifications',
    'notification_templates',
    'notification_logs',
    'activity_logs',
    'sms_logs',
    'parent_student_links'
  ];
  
  console.log('Checking database tables...\n');
  
  for (const table of tablesToCheck) {
    const [result] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
    if (result.length > 0) {
      console.log(`✓ ${table} - exists`);
    } else {
      console.log(`✗ ${table} - missing`);
    }
  }
  
  const [templates] = await pool.execute('SELECT COUNT(*) as count FROM notification_templates');
  console.log(`\nNotification templates: ${templates[0].count}`);
  
  process.exit(0);
}

verifyTables().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

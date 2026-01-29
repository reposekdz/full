const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('========================================');
  console.log('SMS NOTIFICATION SYSTEM - DATABASE SETUP');
  console.log('========================================\n');

  try {
    // Read database config
    require('dotenv').config();
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✓ Connected to database\n');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'migrations', 'sms_notifications.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Running migrations...\n');

    // Execute SQL
    await connection.query(sql);

    console.log('✓ SMS tables created successfully');
    console.log('✓ Permissions configured');
    console.log('✓ Tracking columns added\n');

    await connection.end();

    console.log('========================================');
    console.log('DATABASE SETUP COMPLETE!');
    console.log('========================================\n');

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. MySQL server is running');
    console.error('2. Database credentials in .env are correct');
    console.error('3. Database exists\n');
    return false;
  }
}

runMigration().then(success => {
  process.exit(success ? 0 : 1);
});

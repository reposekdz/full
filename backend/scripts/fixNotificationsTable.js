const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixNotificationsTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('🔧 Fixing notifications table...');

    // Check if priority column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'notifications' 
      AND COLUMN_NAME = 'priority'
    `, [process.env.DB_NAME]);

    if (columns.length === 0) {
      console.log('➕ Adding priority column...');
      await connection.execute(`
        ALTER TABLE notifications 
        ADD COLUMN priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' 
        AFTER type
      `);
      console.log('✅ Priority column added successfully');
    } else {
      console.log('✓ Priority column already exists');
    }

    console.log('✅ Notifications table fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing notifications table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixNotificationsTable();

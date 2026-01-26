const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSMSTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    await connection.query('ALTER TABLE sms_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL');
    await connection.query('ALTER TABLE sms_messages ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE');
    console.log('✅ Updated sms_messages table with read_at and starred columns');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

updateSMSTable();

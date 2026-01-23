const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPhoneColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Connected to database');

    // Check if phone column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'
    `, [process.env.DB_NAME || 'school_management']);

    if (columns.length === 0) {
      console.log('📝 Adding phone column to users table...');
      await connection.execute(`
        ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email
      `);
      console.log('✅ Phone column added successfully');
    } else {
      console.log('✅ Phone column already exists');
    }

    // Add index on phone for faster lookups
    try {
      await connection.execute(`
        CREATE INDEX idx_phone ON users(phone)
      `);
      console.log('✅ Phone index created');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') {
        console.log('⚠️  Phone index already exists');
      }
    }

    console.log('\n✅ Database fix completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixPhoneColumn();

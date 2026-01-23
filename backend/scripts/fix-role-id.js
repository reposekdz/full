const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRoleIdColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Connected to database');

    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role_id'
    `, [process.env.DB_NAME || 'school_management']);

    if (columns.length === 0) {
      console.log('📝 Adding role_id column...');
      await connection.execute(`
        ALTER TABLE users ADD COLUMN role_id INT
      `);
      console.log('✅ role_id column added');
    } else {
      console.log('✅ role_id column exists');
    }

    console.log('\n✅ Fix completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

fixRoleIdColumn();

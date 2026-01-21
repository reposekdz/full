const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function runSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('📋 Running comprehensive schema...');
    const schema = fs.readFileSync('./scripts/comprehensive-schema.sql', 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('SET'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate entry')) {
            console.log(`⚠️ Warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Database schema created successfully!');
    
    // Test a few key tables
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      const [roles] = await connection.execute('SELECT COUNT(*) as count FROM roles');
      console.log(`📊 Tables created - Roles: ${roles[0].count}, Users: ${users[0].count}`);
    } catch (error) {
      console.log('⚠️ Could not verify table creation');
    }
    
  } catch (error) {
    console.error('❌ Schema error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

runSchema();
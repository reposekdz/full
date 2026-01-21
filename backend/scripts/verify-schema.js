const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifySchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('📋 Verifying database schema...');
    
    // Check key tables
    const tables = ['users', 'roles', 'courses', 'classes', 'enrollments', 'grades', 'attendance', 'fee_payments', 'stock_items', 'messages'];
    
    for (const table of tables) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${result[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Table not found or error - ${error.message}`);
      }
    }
    
    // Test news_articles table specifically
    try {
      const [articles] = await connection.execute('SELECT COUNT(*) as count FROM news_articles');
      console.log(`📰 news_articles: ${articles[0].count} articles`);
      
      const [columns] = await connection.execute('DESCRIBE news_articles');
      console.log('📊 news_articles columns:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.log(`❌ news_articles error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verifySchema();
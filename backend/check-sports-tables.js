const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSportsTables() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  console.log('=== SPORTS-RELATED TABLES ===\n');
  
  const [tables] = await conn.execute("SHOW TABLES LIKE 'sports%'");
  
  if (tables.length === 0) {
    console.log('⚠️  No sports tables found. Will create comprehensive sports schema.\n');
  } else {
    console.log(`Found ${tables.length} sports-related tables:\n`);
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📋 Table: ${tableName}`);
      
      const [rows] = await conn.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   Records: ${rows[0].count}`);
      
      const [structure] = await conn.execute(`DESCRIBE ${tableName}`);
      console.log('   Columns:', structure.map(col => col.Field).join(', '));
    }
  }
  
  await conn.end();
}

checkSportsTables().catch(console.error);

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  console.log('=== TRADE_LEVELS TABLE STRUCTURE ===');
  const [result] = await conn.execute('SHOW CREATE TABLE trade_levels');
  console.log(result[0]['Create Table']);
  
  console.log('\n\n=== SAMPLE DATA ===');
  const [data] = await conn.execute('SELECT * FROM trade_levels LIMIT 10');
  console.table(data);
  
  await conn.end();
}

checkTable().catch(console.error);

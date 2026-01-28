const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  console.log('=== ACADEMIC_YEARS TABLE STRUCTURE ===');
  const [result] = await conn.execute('SHOW CREATE TABLE academic_years');
  console.log(result[0]['Create Table']);
  
  console.log('\n\n=== SAMPLE DATA ===');
  const [data] = await conn.execute('SELECT * FROM academic_years LIMIT 5');
  console.table(data);
  
  await conn.end();
}

checkTable().catch(console.error);

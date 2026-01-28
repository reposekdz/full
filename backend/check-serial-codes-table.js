const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  const [result] = await conn.execute('SHOW CREATE TABLE student_serial_codes');
  console.log(result[0]['Create Table']);
  
  await conn.end();
}

checkTable().catch(console.error);

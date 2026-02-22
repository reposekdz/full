const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTradeCodes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    const [trades] = await connection.execute(`
      SELECT DISTINCT trade_code, COUNT(*) as count
      FROM global_student_sheets
      GROUP BY trade_code
      ORDER BY trade_code
    `);
    
    console.log('Trade codes in database:');
    trades.forEach(t => console.log(`  ${t.trade_code}: ${t.count} students`));
  } finally {
    await connection.end();
  }
}

checkTradeCodes();

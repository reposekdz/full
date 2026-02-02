const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  console.log('=== TRADES IN DATABASE ===');
  const [trades] = await connection.query(`
    SELECT DISTINCT code, name 
    FROM courses 
    WHERE code IS NOT NULL 
    ORDER BY code
  `);
  console.log(JSON.stringify(trades, null, 2));

  console.log('\n=== LEVELS PER TRADE ===');
  for (const trade of trades) {
    const [levels] = await connection.query(`
      SELECT DISTINCT level_number, level_suffix 
      FROM courses 
      WHERE code = ? 
      ORDER BY level_number, level_suffix
    `, [trade.code]);
    console.log(`${trade.code}: ${levels.map(l => l.level_number + (l.level_suffix || '')).join(', ')}`);
  }

  console.log('\n=== STUDENTS PER TRADE ===');
  const [studentCounts] = await connection.query(`
    SELECT trade_code, COUNT(*) as count 
    FROM students 
    GROUP BY trade_code 
    ORDER BY trade_code
  `);
  console.log(JSON.stringify(studentCounts, null, 2));

  await connection.end();
}

checkDatabase().catch(console.error);

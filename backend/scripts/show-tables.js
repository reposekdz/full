const mysql = require('mysql2/promise');

async function showTables() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });
  
  const [tables] = await conn.execute('SHOW TABLES');
  console.log('\n=== DATABASE TABLES ===\n');
  tables.forEach(t => console.log('  ' + Object.values(t)[0]));
  console.log('\nTotal tables:', tables.length);
  
  await conn.end();
}

showTables().catch(console.error);

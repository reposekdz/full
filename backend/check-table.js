const mysql = require('mysql2/promise');

async function checkTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  console.log('=== COURSES TABLE STRUCTURE ===');
  const [columns] = await connection.query('SHOW COLUMNS FROM courses');
  console.log(columns.map(c => c.Field).join(', '));

  console.log('\n=== SAMPLE DATA ===');
  const [rows] = await connection.query('SELECT * FROM courses LIMIT 3');
  console.log(JSON.stringify(rows, null, 2));

  await connection.end();
}

checkTable().catch(console.error);

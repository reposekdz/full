const mysql = require('mysql2/promise');

async function showTableStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('COURSES TABLE STRUCTURE:\n');
    const [columns] = await connection.query('SHOW COLUMNS FROM courses');
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(20)} | ${col.Type.padEnd(20)} | ${col.Null} | ${col.Key} | ${col.Default}`);
    });

    console.log('\n\nSample data:');
    const [rows] = await connection.query('SELECT * FROM courses LIMIT 3');
    console.log(rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

showTableStructure();

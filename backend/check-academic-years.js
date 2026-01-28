const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });
  
  try {
    const [rows] = await conn.query('DESCRIBE academic_years');
    console.log('academic_years table structure:');
    console.table(rows);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await conn.end();
})();

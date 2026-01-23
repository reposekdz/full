const mysql = require('mysql2/promise');

async function checkTradesTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Checking trades table structure...');
    const [columns] = await connection.query('DESCRIBE trades');
    console.log('Trades table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    const [data] = await connection.query('SELECT * FROM trades LIMIT 3');
    console.log('\nSample data:');
    console.log(data);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTradesTable();

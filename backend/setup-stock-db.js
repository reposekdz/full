const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });

    console.log('✓ Connected to school_management database');

    const sqlPath = path.join(__dirname, 'database', 'stock_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await connection.query(sql);
    console.log('✓ Tables created successfully');
    console.log('✓ Sample data inserted');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupDatabase();

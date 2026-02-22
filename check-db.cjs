const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
    port: 3306
  });

  console.log('Checking parents table...\n');
  
  try {
    const [tables] = await connection.query("SHOW TABLES LIKE 'parents'");
    if (tables.length === 0) {
      console.log('❌ parents table does not exist');
    } else {
      console.log('✅ parents table exists');
      const [columns] = await connection.query("DESCRIBE parents");
      console.log('\nColumns:');
      columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  await connection.end();
}

checkDatabase();

const mysql = require('mysql2');
require('dotenv').config();

const checkTable = async () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    const [rows] = await connection.promise().execute('DESCRIBE classes');
    console.log('Classes table structure:');
    rows.forEach(row => console.log(`${row.Field}: ${row.Type}`));
    
    // Check if level_id column exists
    const hasLevelId = rows.some(row => row.Field === 'level_id');
    if (!hasLevelId) {
      console.log('\n❌ level_id column is missing, adding it...');
      await connection.promise().execute('ALTER TABLE classes ADD COLUMN level_id INT');
      console.log('✅ level_id column added');
    } else {
      console.log('✅ level_id column exists');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await connection.promise().end();
  process.exit(0);
};

checkTable();
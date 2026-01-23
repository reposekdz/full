const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkLeadership() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    const [leaders] = await connection.query('SELECT id, name, role, image_url FROM leadership');
    console.log('📊 Leadership data:');
    console.log(leaders);
    console.log(`\n✅ Total leaders: ${leaders.length}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkLeadership();

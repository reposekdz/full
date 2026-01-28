const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fixForumTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'school_management',
    multipleStatements: true
  });

  console.log('✅ Connected to database\n');

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/fix_forum_tables.sql'),
      'utf8'
    );
    
    console.log('📝 Fixing forum tables...');
    await connection.query(sql);
    console.log('✅ Forum tables fixed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixForumTables();

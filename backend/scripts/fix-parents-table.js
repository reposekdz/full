const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fixParentsTable() {
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
      path.join(__dirname, '../migrations/fix_parents_auth.sql'),
      'utf8'
    );
    
    console.log('📝 Fixing parents table structure...');
    await connection.query(sql);
    console.log('✅ Parents table fixed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixParentsTable();

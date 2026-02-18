const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
    multipleStatements: true
  });

  try {
    const sqlPath = path.join(__dirname, 'backend', 'migrations', 'dod-advanced-features.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running DOD Advanced Features Migration...\n');
    await connection.query(sql);
    
    console.log('✓ Migration completed successfully!\n');
    console.log('New DOD features added:');
    console.log('- SOD (Students of Discipline) table');
    console.log('- Conduct Removals table');
    console.log('- SMS Notifications table');
    console.log('- Teacher Class Assignments table');
    console.log('- Parent links enhancements');
    console.log('- Conduct records enhancements');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('========================================');
  console.log('Running Comprehensive System Migration');
  console.log('========================================\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✓ Connected to database\n');

    // Get migration file from command line argument
    const args = process.argv.slice(2);
    const fileIndex = args.indexOf('--file');
    let migrationFile = 'comprehensive-system-migration.sql';
    
    if (fileIndex !== -1 && args[fileIndex + 1]) {
      migrationFile = args[fileIndex + 1];
    }

    const sqlPath = path.join(__dirname, migrationFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running migration...\n');
    await connection.query(sql);

    await connection.end();

    console.log('\n========================================');
    console.log('✓ Migration completed successfully!');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n========================================');
    console.error('✗ Migration failed!');
    console.error('========================================');
    console.error('\nError:', error.message);
    console.error('\nPlease check:');
    console.error('1. MySQL is running');
    console.error('2. Database exists');
    console.error('3. Credentials in .env are correct');
    console.error('4. Migration file exists\n');
    process.exit(1);
  }
}

runMigration();

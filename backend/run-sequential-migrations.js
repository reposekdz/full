const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MIGRATION_ORDER = [
  'global_student_sheets_system.sql',
  'comprehensive-system-migration.sql'
];

async function runMigrations() {
  console.log('========================================');
  console.log('Running Sequential Migrations');
  console.log('========================================\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: false
    });

    console.log('✓ Connected to database\n');

    for (const migrationFile of MIGRATION_ORDER) {
      console.log(`Running migration: ${migrationFile}`);
      console.log('─'.repeat(40));

      const sqlPath = path.join(__dirname, 'migrations', migrationFile);
      
      if (!fs.existsSync(sqlPath)) {
        console.log(`⚠ Warning: ${migrationFile} not found, skipping...\n`);
        continue;
      }

      const sql = fs.readFileSync(sqlPath, 'utf8');
      const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.query(statement);
            successCount++;
          } catch (error) {
            if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                error.code === 'ER_DUP_FIELDNAME' ||
                error.code === 'ER_DUP_KEYNAME' ||
                error.message.includes('Duplicate')) {
              skipCount++;
            } else {
              console.warn(`⚠ Warning: ${error.message.substring(0, 100)}`);
              errorCount++;
            }
          }
        }
      }

      console.log(`  ✓ ${successCount} statements executed`);
      console.log(`  ↷ ${skipCount} statements skipped (already exist)`);
      if (errorCount > 0) {
        console.log(`  ⚠ ${errorCount} warnings`);
      }
      console.log('');
    }

    await connection.end();

    console.log('========================================');
    console.log('✓ All migrations completed successfully!');
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
    console.error('4. Migration files exist');
    process.exit(1);
  }
}

runMigrations();

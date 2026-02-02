const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('========================================');
  console.log('Running Safe Migration');
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

    // Disable foreign key checks temporarily
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks\n');

    const sqlPath = path.join(__dirname, 'migrations', 'comprehensive-system-migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and execute one by one
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    console.log(`Running ${statements.length} SQL statements...\n`);
    
    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
          successCount++;
        } catch (error) {
          // Skip if table already exists or other non-critical errors
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
              error.code === 'ER_DUP_FIELDNAME' ||
              error.message.includes('Duplicate')) {
            skipCount++;
          } else {
            console.warn(`⚠ Warning: ${error.message.substring(0, 100)}`);
          }
        }
      }
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✓ Re-enabled foreign key checks');

    await connection.end();

    console.log('\n========================================');
    console.log('✓ Migration completed!');
    console.log(`  - ${successCount} statements executed`);
    console.log(`  - ${skipCount} statements skipped (already exist)`);
    console.log('========================================\n');
  } catch (error) {
    console.error('\n========================================');
    console.error('✗ Migration failed!');
    console.error('========================================');
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

runMigration();

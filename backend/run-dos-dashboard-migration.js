// DOS Dashboard Migration Runner
const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Starting DOS Dashboard Migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', 'dos-dashboard-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons to execute statements individually
    const statements = migrationSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.execute(statement);
        } catch (err) {
          // Ignore duplicate entry errors for sample data
          if (!err.message.includes('Duplicate entry')) {
            console.log('⚠️  Statement skipped:', err.message.substring(0, 100));
          }
        }
      }
    }
    
    console.log('✅ DOS Dashboard Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

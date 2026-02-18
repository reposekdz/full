const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'add_password_changed_at.sql'), 'utf8');
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      await db.query(statement);
    }
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

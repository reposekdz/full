const fs = require('fs');
const path = require('path');
const { pool } = require('./config/database');

async function runMigration() {
  try {
    const migrationFile = path.join(__dirname, 'migrations', 'create_messaging_and_notification_tables.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    const lines = sql.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });
    
    const cleanedSQL = lines.join('\n');
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 10);
    
    console.log(`Running ${statements.length} SQL statements...`);
    
    const connection = await pool.getConnection();
    
    try {
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`\n[${i + 1}/${statements.length}] Executing statement (${statement.substring(0, 50)}...)...`);
        try {
          await connection.query(statement);
          console.log(`✓ Success`);
        } catch (err) {
          if (err.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠ Table already exists - skipping`);
          } else {
            throw err;
          }
        }
      }
      
      console.log('\n✅ Migration completed successfully!');
      console.log('\nCreated tables:');
      console.log('  - messages');
      console.log('  - message_reads');
      console.log('  - notifications');
      console.log('  - notification_templates');
      console.log('  - notification_logs');
      console.log('  - activity_logs');
      console.log('  - sms_logs');
      console.log('  - parent_student_links');
      console.log('\n✅ Inserted default notification templates');
      
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  
  try {
    console.log('========================================');
    console.log('DOS ADVANCED MANAGEMENT SETUP');
    console.log('========================================\n');
    
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });
    
    console.log('✓ Connected to database\n');
    
    // Read SQL file
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'migrations', 'dos_advanced_management.sql'),
      'utf8'
    );
    
    console.log('[1/3] Running migration...');
    await connection.query(sqlFile);
    console.log('✓ Migration completed\n');
    
    // Verify tables
    console.log('[2/3] Verifying tables...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'school_management' 
      AND TABLE_NAME IN ('subjects', 'subject_trade_assignments', 'teacher_subject_assignments', 'class_subject_schedule')
    `);
    console.log(`✓ ${tables.length} tables created\n`);
    
    // Count subjects
    console.log('[3/3] Counting subjects...');
    const [[{ total }]] = await connection.query('SELECT COUNT(*) as total FROM subjects');
    console.log(`✓ ${total} subjects loaded\n`);
    
    // Count assignments
    const [[{ assignments }]] = await connection.query('SELECT COUNT(*) as assignments FROM subject_trade_assignments');
    console.log(`✓ ${assignments} subject-trade assignments created\n`);
    
    console.log('========================================');
    console.log('✓ SETUP COMPLETE!');
    console.log('========================================\n');
    
    console.log('📊 Summary:');
    console.log(`   - Tables: ${tables.length}`);
    console.log(`   - Subjects: ${total}`);
    console.log(`   - Assignments: ${assignments}\n`);
    
    console.log('💡 Next Steps:');
    console.log('   1. Add route to server.js:');
    console.log('      const dosAdvanced = require(\'./routes/dos-advanced-management\');');
    console.log('      app.use(\'/api/dos-advanced\', dosAdvanced);\n');
    console.log('   2. Restart backend: npm run dev\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runMigration();

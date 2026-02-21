const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read the fixed migration file
    const sqlFile = path.join(__dirname, 'migrations', 'parent-child-linking-system-fixed.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🔄 Running migration...');
    
    // Execute the entire SQL file
    await connection.query(sql);

    console.log('✅ Migration completed successfully!');

    // Verify tables were created
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'school_management' 
      AND TABLE_NAME IN ('parent_linking_applications', 'parent_child_links', 'parent_linking_audit_log')
    `);

    console.log('\n📊 Tables created:');
    tables.forEach(table => {
      console.log(`   ✅ ${table.TABLE_NAME}`);
    });

    // Check for sample data
    const [apps] = await connection.query('SELECT COUNT(*) as count FROM parent_linking_applications');
    console.log(`\n📝 Sample applications: ${apps[0].count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

runMigration();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'school_management',
    multipleStatements: true
  });

  console.log('✅ Connected to database');

  try {
    // Read and execute fix_schema_issues.sql
    const schemaFixSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/fix_schema_issues.sql'),
      'utf8'
    );
    
    console.log('📝 Running schema fixes...');
    await connection.query(schemaFixSQL);
    console.log('✅ Schema fixes applied');

    // Read and execute create_parents_table.sql
    const parentsTableSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/create_parents_table.sql'),
      'utf8'
    );
    
    console.log('📝 Creating parents table...');
    await connection.query(parentsTableSQL);
    console.log('✅ Parents table created');

    // Read and execute fix_all_remaining_issues.sql
    const remainingFixesSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/fix_all_remaining_issues.sql'),
      'utf8'
    );
    
    console.log('📝 Fixing all remaining issues...');
    await connection.query(remainingFixesSQL);
    console.log('✅ All remaining issues fixed');

    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();

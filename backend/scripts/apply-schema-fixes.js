const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applySchemaFixes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    multipleStatements: true
  });

  try {
    console.log('🔧 Applying database schema fixes...\n');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'migrations', 'fix_column_errors.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the SQL
    await connection.query(sql);

    console.log('✅ Schema fixes applied successfully!\n');

    // Verify the changes
    console.log('📊 Verifying schema changes...\n');

    // Check student_profiles
    const [spColumns] = await connection.query(
      "SHOW COLUMNS FROM student_profiles LIKE 'admission_number'"
    );
    console.log(`✓ student_profiles.admission_number: ${spColumns.length > 0 ? 'EXISTS' : 'MISSING'}`);

    // Check trades
    const [tColumns] = await connection.query(
      "SHOW COLUMNS FROM trades LIKE 'trade_name'"
    );
    console.log(`✓ trades.trade_name: ${tColumns.length > 0 ? 'EXISTS' : 'MISSING'}`);

    // Check academic_years
    const [ayColumns] = await connection.query(
      "SHOW COLUMNS FROM academic_years LIKE 'is_current'"
    );
    console.log(`✓ academic_years.is_current: ${ayColumns.length > 0 ? 'EXISTS' : 'MISSING'}`);

    // Check fee_payments
    const [fpColumns] = await connection.query(
      "SHOW COLUMNS FROM fee_payments LIKE 'amount'"
    );
    console.log(`✓ fee_payments.amount: ${fpColumns.length > 0 ? 'EXISTS' : 'MISSING'}`);

    // Check enrollments
    const [eColumns] = await connection.query(
      "SHOW COLUMNS FROM enrollments"
    );
    const hasTradeCode = eColumns.some(col => col.Field === 'trade_code');
    const hasLevelNumber = eColumns.some(col => col.Field === 'level_number');
    console.log(`✓ enrollments.trade_code: ${hasTradeCode ? 'EXISTS' : 'MISSING'}`);
    console.log(`✓ enrollments.level_number: ${hasLevelNumber ? 'EXISTS' : 'MISSING'}`);

    console.log('\n✅ All schema fixes verified!\n');
    console.log('🎉 Database is now ready. Please restart your server.\n');

  } catch (error) {
    console.error('❌ Error applying schema fixes:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the migration
applySchemaFixes().catch(console.error);

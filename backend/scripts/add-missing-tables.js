const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    multipleStatements: true
  });

  console.log('🔄 Adding missing tables and columns...\n');

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/add-missing-tables-columns.sql'),
      'utf8'
    );

    await pool.query(sql);
    console.log('✅ Migration completed successfully!\n');

    // Verify
    const [[marksTable]] = await pool.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'school_management' AND table_name = 'student_marks'"
    );
    
    const [[conductColumn]] = await pool.execute(
      "SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = 'school_management' AND table_name = 'student_conduct_records' AND column_name = 'points_deducted'"
    );

    console.log('📋 Verification:');
    console.log(`   student_marks table: ${marksTable.count ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   points_deducted column: ${conductColumn.count ? '✅ EXISTS' : '❌ MISSING'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();

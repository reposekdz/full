const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('========================================');
  console.log('PAYMENT MANAGEMENT SYSTEM - DATABASE SETUP');
  console.log('========================================\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✓ Connected to database\n');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'migrations', 'payment_system_simple.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Running migration...\n');

    // Execute SQL
    await connection.query(sql);

    console.log('✓ Migration completed successfully!\n');

    // Verify tables
    const [tables] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = ? AND table_name IN ('payment_columns', 'student_payments', 'payment_history')
    `, [process.env.DB_NAME || 'school_management']);

    console.log(`✓ Created ${tables[0].count} tables\n`);

    // Check payment columns
    const [columns] = await connection.query('SELECT COUNT(*) as count FROM payment_columns');
    console.log(`✓ Inserted ${columns[0].count} default payment columns\n`);

    // Check students with payment data
    const [students] = await connection.query('SELECT COUNT(*) as count FROM global_student_sheets WHERE total_fees > 0');
    console.log(`✓ ${students[0].count} students have payment data\n`);

    await connection.end();

    console.log('========================================');
    console.log('SETUP COMPLETE!');
    console.log('========================================\n');
    console.log('Features Enabled:');
    console.log('  ✓ Excel-like payment tracking');
    console.log('  ✓ Dynamic payment columns');
    console.log('  ✓ Real-time cell editing');
    console.log('  ✓ Bulk SMS reminders');
    console.log('  ✓ Export to Excel/PDF/CSV');
    console.log('  ✓ Payment history audit trail');
    console.log('  ✓ Auto-calculation of totals');
    console.log('  ✓ Parent notifications\n');
    console.log('Next Steps:');
    console.log('  1. Restart backend: cd backend && npm start');
    console.log('  2. Access at: http://localhost:5173/payments\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();

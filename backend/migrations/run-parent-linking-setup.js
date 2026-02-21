// ═══════════════════════════════════════════════════════════════════════════
// PARENT LINKING TABLES - AUTO SETUP SCRIPT
// ═══════════════════════════════════════════════════════════════════════════
// Run: node backend/migrations/run-parent-linking-setup.js
// ═══════════════════════════════════════════════════════════════════════════

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSetup() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('PARENT LINKING TABLES - AUTO SETUP');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let connection;

  try {
    // Create database connection
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });
    console.log('✅ Connected to database\n');

    // Read SQL file
    console.log('📄 Reading SQL file...');
    const sqlFile = path.join(__dirname, 'create-parent-linking-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ SQL file loaded\n');

    // Execute SQL
    console.log('🔧 Creating tables and procedures...');
    await connection.query(sql);
    console.log('✅ Tables and procedures created successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'parent_%'
    `);
    
    console.log('\n📋 Tables created:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   ✅ ${tableName}`);
    });

    // Verify procedures
    const [procedures] = await connection.query(`
      SHOW PROCEDURE STATUS 
      WHERE Db = ? AND Name LIKE 'sp_%parent%'
    `, [process.env.DB_NAME || 'school_management']);

    console.log('\n📋 Stored procedures created:');
    procedures.forEach(proc => {
      console.log(`   ✅ ${proc.Name}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('1. Restart your backend server:');
    console.log('   cd backend');
    console.log('   npm start\n');
    console.log('2. Refresh your browser');
    console.log('3. The 500 error should be gone!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nDetails:', error);
    console.error('\nPlease check:');
    console.error('1. MySQL is running');
    console.error('2. Database credentials in .env file');
    console.error('3. Database exists: ' + (process.env.DB_NAME || 'garden_tvet_db'));
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Database connection closed\n');
    }
  }
}

// Run setup
runSetup();

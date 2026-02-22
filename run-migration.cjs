const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Try to load dotenv if available, otherwise use defaults
try {
  require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
} catch (e) {
  console.log('⚠️  dotenv not found, using default config');
}

async function runMigration() {
  console.log('========================================');
  console.log('DATABASE MIGRATION - PARENT SYSTEM');
  console.log('========================================\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  };

  console.log(`📊 Connecting to: ${config.host}:${config.port}`);
  console.log(`📁 Database: ${config.database}\n`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Database connected successfully\n');

    const sqlFile = path.join(__dirname, 'backend', 'migrations', 'parent_system_fixed.sql');
    console.log(`📄 Reading migration file: ${sqlFile}`);
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ Migration file loaded\n');

    console.log('🔄 Executing migration...');
    await connection.query(sql);
    console.log('✅ Migration executed successfully\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'parent%'");
    console.log(`✅ Found ${tables.length} parent tables:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    console.log('\n========================================');
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('Next steps:');
    console.log('1. Start backend: cd backend && npm start');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Login as DOD and link parents\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  MySQL is not running!');
      console.error('Please start XAMPP MySQL service and try again.\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Access denied!');
      console.error('Please check your database credentials in backend/.env\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  Database does not exist!');
      console.error(`Please create database '${config.database}' first.\n`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();

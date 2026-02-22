const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runPaymentMigrations = async () => {
  let connection;
  
  try {
    console.log('========================================');
    console.log('🚀 Running Payment System Migrations');
    console.log('========================================\n');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Database connected\n');

    // Migration files to run
    const migrations = ['payment_complete.sql'];

    for (const migrationFile of migrations) {
      const filePath = path.join(__dirname, 'migrations', migrationFile);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${migrationFile} - File not found`);
        continue;
      }

      console.log(`📄 Running: ${migrationFile}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await connection.query(sql);
        console.log(`✅ ${migrationFile} - SUCCESS\n`);
      } catch (error) {
        console.error(`❌ ${migrationFile} - FAILED`);
        console.error(`   Error: ${error.message}\n`);
      }
    }

    // Verify tables created
    console.log('🔍 Verifying tables...\n');
    
    const tables = [
      'payment_columns',
      'student_fees',
      'payment_transactions',
      'payment_reminders_log',
      'sms_queue',
      'payment_installments',
      'fee_waivers',
      'payment_analytics_cache',
      'payment_receipts'
    ];

    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`✅ ${table} - EXISTS`);
        } else {
          console.log(`⚠️  ${table} - NOT FOUND`);
        }
      } catch (error) {
        console.log(`❌ ${table} - ERROR: ${error.message}`);
      }
    }

    console.log('\n========================================');
    console.log('✅ Payment System Setup Complete!');
    console.log('========================================\n');
    console.log('Next steps:');
    console.log('1. Restart backend: npm start');
    console.log('2. Access payment management from accountant/teacher dashboard');
    console.log('3. Navigate to Payment Management tab\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run migrations
runPaymentMigrations();

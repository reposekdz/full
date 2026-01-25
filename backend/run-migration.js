const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    multipleStatements: true
  });

  try {
    console.log('📊 Running student payments migration...');
    
    const sqlFile = fs.readFileSync(path.join(__dirname, 'migrations', 'student_payments.sql'), 'utf8');
    
    await connection.query(sqlFile);
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Created tables: student_fees, payments, student_parents, payment_reminders');
    console.log('✅ Inserted default fees for existing students');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();

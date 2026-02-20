const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Checking Database Connection...\n');
  
  try {
    // Test connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Database connected successfully!\n');

    // Check for required tables
    const tables = [
      'global_student_sheets',
      'parent_student_links',
      'users',
      'trades'
    ];

    console.log('📋 Checking required tables:\n');
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${rows[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table}: NOT FOUND or ERROR`);
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('\n📊 Sample student data:');
    try {
      const [students] = await connection.execute(`
        SELECT first_name, last_name, trade_code, level_number 
        FROM global_student_sheets 
        LIMIT 5
      `);
      
      if (students.length > 0) {
        students.forEach(s => {
          console.log(`   - ${s.first_name} ${s.last_name} (${s.trade_code} Level ${s.level_number})`);
        });
      } else {
        console.log('   ⚠️  No students found in database');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    await connection.end();
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Solutions:');
    console.error('   1. Make sure MySQL/MariaDB is running');
    console.error('   2. Check .env file for correct credentials');
    console.error('   3. Verify database "school_management" exists');
    console.error('   4. Run: mysql -u root -p');
    console.error('      Then: CREATE DATABASE school_management;');
    process.exit(1);
  }
}

checkDatabase();

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    const tables = [
      'discipline_categories',
      'discipline_actions',
      'student_conduct_records',
      'student_behavior_points',
      'dormitory_inspections',
      'student_counseling_sessions',
      'parent_notifications',
      'student_wellness_tracking',
      'incident_witnesses',
      'discipline_appeals',
      'dormitory_assignments',
      'positive_recognition'
    ];
    
    console.log('\n📊 Verifying Tables:\n');
    
    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${count[0].count} records`);
      } else {
        console.log(`❌ ${table}: NOT FOUND`);
      }
    }
    
    console.log('\n✅ Verification complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verifyTables();

const mysql = require('mysql2/promise');
require('dotenv').config();

async function comprehensiveCheck() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('=== COMPREHENSIVE AUTO STUDENTS CHECK ===\n');

    // Check Level 5 AUTO with suffix breakdown
    const [autoBreakdown] = await connection.execute(`
      SELECT 
        level_number,
        level_suffix,
        COUNT(*) as count
      FROM global_student_sheets 
      WHERE trade_code = 'AUTO' AND level_number = 5
      GROUP BY level_number, level_suffix
      ORDER BY level_suffix
    `);
    
    console.log('AUTO Level 5 Breakdown:');
    autoBreakdown.forEach(row => {
      console.log(`  Level ${row.level_number}${row.level_suffix || ''}: ${row.count} students`);
    });

    // Show sample students from each suffix
    console.log('\n=== Sample AUTO 5A Students ===');
    const [auto5a] = await connection.execute(`
      SELECT student_code, first_name, last_name, level_suffix 
      FROM global_student_sheets 
      WHERE trade_code = 'AUTO' AND level_number = 5 AND level_suffix = 'A'
      LIMIT 5
    `);
    auto5a.forEach(s => console.log(`  ${s.student_code} - ${s.first_name} ${s.last_name} (${s.level_suffix})`));

    console.log('\n=== Sample AUTO 5B Students ===');
    const [auto5b] = await connection.execute(`
      SELECT student_code, first_name, last_name, level_suffix 
      FROM global_student_sheets 
      WHERE trade_code = 'AUTO' AND level_number = 5 AND level_suffix = 'B'
      LIMIT 5
    `);
    auto5b.forEach(s => console.log(`  ${s.student_code} - ${s.first_name} ${s.last_name} (${s.level_suffix})`));

    // Test the exact query the API uses
    console.log('\n=== Testing API Query (AUTO, Level 5, Suffix A) ===');
    const [apiTest] = await connection.execute(`
      SELECT
        student_id,
        first_name,
        last_name,
        student_code,
        level_suffix,
        trade_code,
        level_number
      FROM global_student_sheets
      WHERE 1=1
        AND trade_code = ?
        AND level_number = ?
        AND level_suffix = ?
      ORDER BY last_name, first_name
      LIMIT 5
    `, ['AUTO', 5, 'A']);
    
    console.log(`Found ${apiTest.length} students with API query`);
    apiTest.forEach(s => console.log(`  ${s.student_code} - ${s.first_name} ${s.last_name}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

comprehensiveCheck();

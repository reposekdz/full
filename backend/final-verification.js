const mysql = require('mysql2/promise');
require('dotenv').config();

async function finalVerification() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('=== FINAL VERIFICATION ===\n');

    // Test exact API query
    console.log('Testing API Query: AUTO Level 5 (All suffixes)');
    const [allAuto5] = await connection.execute(`
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
      ORDER BY level_suffix, last_name, first_name
    `, ['AUTO', 5]);
    
    console.log(`✓ Found ${allAuto5.length} students total\n`);

    // Group by suffix
    const by5A = allAuto5.filter(s => s.level_suffix === 'A');
    const by5B = allAuto5.filter(s => s.level_suffix === 'B');
    
    console.log(`  - Level 5A: ${by5A.length} students`);
    console.log(`  - Level 5B: ${by5B.length} students\n`);

    // Show first 3 from each
    console.log('Sample 5A students:');
    by5A.slice(0, 3).forEach(s => 
      console.log(`  ${s.student_code} - ${s.first_name} ${s.last_name}`)
    );

    console.log('\nSample 5B students:');
    by5B.slice(0, 3).forEach(s => 
      console.log(`  ${s.student_code} - ${s.first_name} ${s.last_name}`)
    );

    // Check all trades and levels
    console.log('\n=== ALL TRADES & LEVELS ===');
    const [summary] = await connection.execute(`
      SELECT 
        trade_code,
        level_number,
        level_suffix,
        COUNT(*) as count
      FROM global_student_sheets
      WHERE status = 'active'
      GROUP BY trade_code, level_number, level_suffix
      ORDER BY trade_code, level_number, level_suffix
    `);

    summary.forEach(row => {
      console.log(`${row.trade_code} Level ${row.level_number}${row.level_suffix || ''}: ${row.count} students`);
    });

    console.log('\n✅ Verification Complete!');
    console.log('\nAPI Endpoints to test:');
    console.log('1. All AUTO Level 5: /api/global-student-sheets/students?trade_id=AUTO&level_id=5');
    console.log('2. Only 5A: /api/global-student-sheets/students?trade_id=AUTO&level_id=5&level_suffix=A');
    console.log('3. Only 5B: /api/global-student-sheets/students?trade_id=AUTO&level_id=5&level_suffix=B');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

finalVerification();

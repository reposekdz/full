const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAutoStudents() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('Checking AUTO students in global_student_sheets...\n');

    // Check Level 5A AUTO
    const [level5A] = await connection.execute(
      'SELECT COUNT(*) as total, level_suffix FROM global_student_sheets WHERE trade_code = "AUTO" AND level_number = 5 AND level_suffix = "A"'
    );
    console.log('Level 5A AUTO:', level5A[0]);

    // Check Level 5B AUTO
    const [level5B] = await connection.execute(
      'SELECT COUNT(*) as total, level_suffix FROM global_student_sheets WHERE trade_code = "AUTO" AND level_number = 5 AND level_suffix = "B"'
    );
    console.log('Level 5B AUTO:', level5B[0]);

    // Check all Level 5 AUTO
    const [allLevel5] = await connection.execute(
      'SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code = "AUTO" AND level_number = 5'
    );
    console.log('Total Level 5 AUTO:', allLevel5[0]);

    // Show sample records
    const [samples] = await connection.execute(
      'SELECT student_id, first_name, last_name, student_code, level_suffix FROM global_student_sheets WHERE trade_code = "AUTO" AND level_number = 5 LIMIT 10'
    );
    console.log('\nSample records:');
    samples.forEach(s => console.log(`${s.student_code} - ${s.first_name} ${s.last_name} (Suffix: "${s.level_suffix}")`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAutoStudents();

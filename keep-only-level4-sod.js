import mysql from 'mysql2/promise';

async function keepOnlyLevel4SOD() {
  console.log('🧹 KEEPING ONLY LEVEL 4 SOD STUDENTS...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Get non-Level 4 SOD students
    const [nonSODStudents] = await connection.execute(`
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as name,
        student_code,
        trade_code,
        level_number
      FROM global_student_sheets
      WHERE NOT (trade_code = 'SOD' AND level_number = 4)
      ORDER BY trade_code, level_number, last_name
    `);

    console.log(`📊 Found ${nonSODStudents.length} non-Level 4 SOD students to remove:\n`);
    nonSODStudents.forEach((student, index) => {
      const trade = student.trade_code || 'No Trade';
      console.log(`   ${(index + 1).toString().padStart(2, '0')}. ❌ ${student.name.padEnd(30)} | ${student.student_code.padEnd(20)} | ${trade} L${student.level_number}`);
    });
    console.log('');

    // Delete non-Level 4 SOD students
    console.log('🗑️  Deleting non-Level 4 SOD students...\n');
    const [result] = await connection.execute(`
      DELETE FROM global_student_sheets
      WHERE NOT (trade_code = 'SOD' AND level_number = 4)
    `);

    console.log(`✅ Deleted ${result.affectedRows} students!\n`);

    // Show remaining Level 4 SOD students
    const [sodStudents] = await connection.execute(`
      SELECT 
        CONCAT(first_name, ' ', last_name) as name,
        student_code,
        gender,
        conduct_score
      FROM global_student_sheets
      WHERE trade_code = 'SOD' AND level_number = 4
      ORDER BY last_name, first_name
    `);

    console.log('👥 REMAINING LEVEL 4 SOD STUDENTS:\n');
    sodStudents.forEach((student, index) => {
      const gender = (student.gender || '').padEnd(6);
      console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${student.name.padEnd(35)} | ${student.student_code.padEnd(20)} | ${gender} | ${student.conduct_score}/40`);
    });

    console.log(`\n✅ Total Level 4 SOD students: ${sodStudents.length}\n`);
    console.log('🎉 SUCCESS! Database now contains ONLY Level 4 SOD students!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

keepOnlyLevel4SOD();

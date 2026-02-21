import mysql from 'mysql2/promise';

async function removeLevel1Students() {
  console.log('🧹 REMOVING ALL LEVEL 1 STUDENTS...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Get Level 1 students
    const [level1Students] = await connection.execute(`
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as name,
        student_code,
        trade_code,
        level_number
      FROM global_student_sheets
      WHERE level_number = 1
      ORDER BY trade_code, last_name
    `);

    console.log(`📊 Found ${level1Students.length} Level 1 students:\n`);
    level1Students.forEach((student, index) => {
      const trade = student.trade_code || 'No Trade';
      console.log(`   ${(index + 1).toString().padStart(2, '0')}. ❌ ${student.name.padEnd(30)} | ${student.student_code.padEnd(15)} | ${trade}`);
    });
    console.log('');

    // Delete Level 1 students
    console.log('🗑️  Deleting Level 1 students...\n');
    const [result] = await connection.execute(`
      DELETE FROM global_student_sheets
      WHERE level_number = 1
    `);

    console.log(`✅ Deleted ${result.affectedRows} Level 1 students!\n`);

    // Show final statistics
    const [finalStats] = await connection.execute(`
      SELECT 
        trade_code,
        level_number,
        COUNT(*) as count
      FROM global_student_sheets
      GROUP BY trade_code, level_number
      ORDER BY trade_code, level_number
    `);

    console.log('📊 Remaining Students by Trade & Level:\n');
    finalStats.forEach(row => {
      const trade = row.trade_code || 'No Trade';
      console.log(`   ${trade} Level ${row.level_number}: ${row.count} students`);
    });

    const [totalCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM global_student_sheets
    `);

    console.log(`\n✅ Total students remaining: ${totalCount[0].count}\n`);
    console.log('🎉 SUCCESS! All Level 1 students removed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

removeLevel1Students();

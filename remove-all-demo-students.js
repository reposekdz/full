import mysql from 'mysql2/promise';

async function removeAllDemoStudents() {
  console.log('🧹 REMOVING ALL DEMO STUDENTS FROM DATABASE...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Get total count before
    const [beforeTotal] = await connection.execute(`
      SELECT COUNT(*) as count FROM global_student_sheets
    `);
    console.log(`📊 Total students before: ${beforeTotal[0].count}\n`);

    // Show all demo students
    console.log('🗑️  Finding demo students...\n');
    const [demoStudents] = await connection.execute(`
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as name,
        student_code,
        trade_code,
        level_number
      FROM global_student_sheets
      WHERE 
        first_name IN ('Jane', 'Demo', 'Template', 'bb', 'Employee')
        OR last_name IN ('Smith', 'Student', 'User', 'u8i')
        OR student_code IN ('STD000004', '14', 'TEMPLATE_5_L4', 'STD000057', 
                            'STD000041', 'STD000042', 'STD000043', 'STD000044', 
                            'STD000046', 'STD000047')
        OR first_name LIKE '%Template%'
        OR first_name LIKE '%Demo%'
        OR first_name LIKE '%Employee%'
        OR student_code LIKE 'STD0000%'
      ORDER BY trade_code, level_number, last_name
    `);

    console.log(`Found ${demoStudents.length} demo students:\n`);
    demoStudents.forEach((student, index) => {
      console.log(`   ${(index + 1).toString().padStart(2, '0')}. ❌ ${student.name.padEnd(25)} | ${student.student_code.padEnd(15)} | ${student.trade_code} L${student.level_number}`);
    });
    console.log('');

    // Delete demo students
    console.log('🗑️  Deleting demo students...\n');
    const result = await connection.execute(`
      DELETE FROM global_student_sheets
      WHERE 
        first_name IN ('Jane', 'Demo', 'Template', 'bb', 'Employee')
        OR last_name IN ('Smith', 'Student', 'User', 'u8i')
        OR student_code IN ('STD000004', '14', 'TEMPLATE_5_L4', 'STD000057', 
                            'STD000041', 'STD000042', 'STD000043', 'STD000044', 
                            'STD000046', 'STD000047')
        OR first_name LIKE '%Template%'
        OR first_name LIKE '%Demo%'
        OR first_name LIKE '%Employee%'
        OR student_code LIKE 'STD0000%'
    `);

    // Get total count after
    const [afterTotal] = await connection.execute(`
      SELECT COUNT(*) as count FROM global_student_sheets
    `);

    console.log('✅ Demo students removed!\n');
    console.log('📊 Final Statistics:');
    console.log(`   Before: ${beforeTotal[0].count} students`);
    console.log(`   After:  ${afterTotal[0].count} students`);
    console.log(`   Removed: ${beforeTotal[0].count - afterTotal[0].count} demo students\n`);

    // Show Level 4 SOD count
    const [sodCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM global_student_sheets
      WHERE trade_code = 'SOD' AND level_number = 4
    `);
    console.log(`✅ Level 4 SOD now has ${sodCount[0].count} real students\n`);

    // Show breakdown by trade
    console.log('📊 Students by Trade:\n');
    const [tradeBreakdown] = await connection.execute(`
      SELECT 
        trade_code,
        level_number,
        COUNT(*) as count
      FROM global_student_sheets
      GROUP BY trade_code, level_number
      ORDER BY trade_code, level_number
    `);

    tradeBreakdown.forEach(row => {
      console.log(`   ${row.trade_code} Level ${row.level_number}: ${row.count} students`);
    });

    console.log('\n🎉 SUCCESS! All demo students removed from database!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

removeAllDemoStudents();

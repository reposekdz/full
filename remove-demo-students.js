import mysql from 'mysql2/promise';

async function removeDemoStudents() {
  console.log('🧹 REMOVING DEMO STUDENTS FROM LEVEL 4 SOD...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // List of demo student identifiers to remove
    const demoIdentifiers = [
      'Jane Smith',
      'Demo Student',
      'Template Student',
      'bb u8i',
      'Employee User',
      'STD000004',
      'STD000014',
      'TEMPLATE_5_L4',
      'STD000057',
      'STD000041',
      'STD000042',
      'STD000043',
      'STD000044',
      'STD000046',
      'STD000047'
    ];

    // Get current count
    const [beforeCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM global_student_sheets
      WHERE trade_code = 'SOD' AND level_number = 4
    `);
    console.log(`📊 Current Level 4 SOD students: ${beforeCount[0].count}\n`);

    // Show demo students to be removed
    console.log('🗑️  Demo students to remove:\n');
    for (const identifier of demoIdentifiers) {
      const [students] = await connection.execute(`
        SELECT id, CONCAT(first_name, ' ', last_name) as name, student_code
        FROM global_student_sheets
        WHERE (first_name LIKE ? OR last_name LIKE ? OR student_code = ?)
          AND trade_code = 'SOD'
      `, [`%${identifier}%`, `%${identifier}%`, identifier]);

      for (const student of students) {
        console.log(`   ❌ ${student.name} (${student.student_code})`);
      }
    }
    console.log('');

    // Delete demo students
    console.log('🗑️  Deleting demo students...\n');
    
    // Delete by first name patterns
    await connection.execute(`
      DELETE FROM global_student_sheets
      WHERE trade_code = 'SOD' 
        AND (
          first_name IN ('Jane', 'Demo', 'Template', 'bb', 'Employee')
          OR last_name IN ('Smith', 'Student', 'User')
          OR student_code IN ('STD000004', 'STD000014', 'TEMPLATE_5_L4', 'STD000057', 
                              'STD000041', 'STD000042', 'STD000043', 'STD000044', 
                              'STD000046', 'STD000047')
          OR first_name LIKE '%Template%'
          OR first_name LIKE '%Demo%'
          OR first_name LIKE '%Employee%'
        )
    `);

    // Get final count
    const [afterCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM global_student_sheets
      WHERE trade_code = 'SOD' AND level_number = 4
    `);

    console.log('✅ Demo students removed!\n');
    console.log('📊 Final Statistics:');
    console.log(`   Before: ${beforeCount[0].count} students`);
    console.log(`   After:  ${afterCount[0].count} students`);
    console.log(`   Removed: ${beforeCount[0].count - afterCount[0].count} demo students\n`);

    // Show remaining real students
    console.log('👥 Remaining REAL Level 4 SOD Students:\n');
    const [realStudents] = await connection.execute(`
      SELECT 
        CONCAT(first_name, ' ', last_name) as name,
        student_code,
        gender,
        conduct_score,
        COALESCE(
          (SELECT CONCAT(u.first_name, ' ', u.last_name)
           FROM parent_child_links pcl
           JOIN users u ON pcl.parent_id = u.id
           WHERE pcl.student_id = global_student_sheets.id 
             AND pcl.status = 'active'
           LIMIT 1),
          'Nta babyeyi'
        ) as parent_name
      FROM global_student_sheets
      WHERE trade_code = 'SOD' AND level_number = 4
      ORDER BY last_name, first_name
    `);

    realStudents.forEach((student, index) => {
      const name = (student.name || '').padEnd(30);
      const code = (student.student_code || '').padEnd(15);
      const gender = (student.gender || '').padEnd(6);
      const parent = student.parent_name || 'Nta babyeyi';
      console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${name} | ${code} | ${gender} | ${student.conduct_score}/40 | ${parent}`);
    });

    console.log(`\n✅ SUCCESS! ${realStudents.length} real students remain in Level 4 SOD\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

removeDemoStudents();

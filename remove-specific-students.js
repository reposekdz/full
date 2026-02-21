import mysql from 'mysql2/promise';

async function removeSpecificStudents() {
  console.log('🧹 REMOVING SPECIFIC STUDENTS...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Show students to be removed
    const [toRemove] = await connection.execute(`
      SELECT 
        CONCAT(first_name, ' ', last_name) as name,
        student_code
      FROM global_student_sheets
      WHERE student_code IN ('SOD-2024-001', 'SOD-2024-002')
    `);

    console.log('❌ Students to remove:\n');
    toRemove.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (${s.student_code})`);
    });
    console.log('');

    // Delete students
    await connection.execute(`
      DELETE FROM global_student_sheets
      WHERE student_code IN ('SOD-2024-001', 'SOD-2024-002')
    `);

    console.log('✅ Students removed!\n');

    // Show final count
    const [count] = await connection.execute(`
      SELECT COUNT(*) as count FROM global_student_sheets
    `);

    console.log(`✅ Remaining students: ${count[0].count}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

removeSpecificStudents();

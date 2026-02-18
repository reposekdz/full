const { pool } = require('../config/database');

async function addLevel4SODStudents() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Adding Level 4 SOD (Software Development) students...');

    // Sample Level 4 SOD students data
    const students = [
      { first_name: 'MUGISHA', last_name: 'Emmanuel', gender: 'Male', student_code: 'SOD/L4/001' },
      { first_name: 'UWASE', last_name: 'Divine', gender: 'Female', student_code: 'SOD/L4/002' },
      { first_name: 'NIYONSHUTI', last_name: 'Claude', gender: 'Male', student_code: 'SOD/L4/003' },
      { first_name: 'MUKAMANA', last_name: 'Grace', gender: 'Female', student_code: 'SOD/L4/004' },
      { first_name: 'HABIMANA', last_name: 'Patrick', gender: 'Male', student_code: 'SOD/L4/005' },
      { first_name: 'UMUTONI', last_name: 'Aline', gender: 'Female', student_code: 'SOD/L4/006' },
      { first_name: 'NSHIMIYIMANA', last_name: 'Eric', gender: 'Male', student_code: 'SOD/L4/007' },
      { first_name: 'MUREKATETE', last_name: 'Jeanne', gender: 'Female', student_code: 'SOD/L4/008' },
      { first_name: 'NIZEYIMANA', last_name: 'Olivier', gender: 'Male', student_code: 'SOD/L4/009' },
      { first_name: 'UWIMANA', last_name: 'Claudine', gender: 'Female', student_code: 'SOD/L4/010' },
      { first_name: 'HAKIZIMANA', last_name: 'Jean Paul', gender: 'Male', student_code: 'SOD/L4/011' },
      { first_name: 'MUSABYIMANA', last_name: 'Vestine', gender: 'Female', student_code: 'SOD/L4/012' },
      { first_name: 'MUTABAZI', last_name: 'Fidele', gender: 'Male', student_code: 'SOD/L4/013' },
      { first_name: 'NYIRANSABIMANA', last_name: 'Alice', gender: 'Female', student_code: 'SOD/L4/014' },
      { first_name: 'NSENGIMANA', last_name: 'Daniel', gender: 'Male', student_code: 'SOD/L4/015' },
      { first_name: 'MUKANTWARI', last_name: 'Solange', gender: 'Female', student_code: 'SOD/L4/016' },
      { first_name: 'NKURUNZIZA', last_name: 'Samuel', gender: 'Male', student_code: 'SOD/L4/017' },
      { first_name: 'UWERA', last_name: 'Chantal', gender: 'Female', student_code: 'SOD/L4/018' },
      { first_name: 'BYIRINGIRO', last_name: 'Isaac', gender: 'Male', student_code: 'SOD/L4/019' },
      { first_name: 'MUKARWEGO', last_name: 'Esperance', gender: 'Female', student_code: 'SOD/L4/020' }
    ];

    let insertedCount = 0;

    for (const student of students) {
      // Check if student already exists
      const [existing] = await connection.execute(
        'SELECT id FROM global_student_sheets WHERE student_code = ?',
        [student.student_code]
      );

      if (existing.length === 0) {
        // Insert student
        await connection.execute(`
          INSERT INTO global_student_sheets (
            student_code, first_name, last_name, gender,
            trade_code, trade_name, level_number,
            enrollment_status, status, gpa, attendance_percentage,
            balance, created_at
          ) VALUES (?, ?, ?, ?, 'SOD', 'Software Development', 4, 'enrolled', 'active', ?, ?, ?, NOW())
        `, [
          student.student_code,
          student.first_name,
          student.last_name,
          student.gender,
          (Math.random() * 20 + 60).toFixed(2), // Random GPA between 60-80
          (Math.random() * 20 + 75).toFixed(2), // Random attendance between 75-95%
          Math.floor(Math.random() * 200000) + 50000 // Random balance between 50k-250k
        ]);
        insertedCount++;
      }
    }

    await connection.commit();
    console.log(`✅ Successfully added ${insertedCount} Level 4 SOD students`);
    console.log(`📊 Total students in database: ${students.length}`);

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error adding Level 4 SOD students:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if executed directly
if (require.main === module) {
  addLevel4SODStudents()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addLevel4SODStudents };

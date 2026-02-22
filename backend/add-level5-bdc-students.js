const mysql = require('mysql2/promise');
require('dotenv').config();

const students = [
  { id: 900, firstName: 'BENINGABO', lastName: 'EMMANUEL', code: 'BDC5-001' },
  { id: 901, firstName: 'ASIFIWE', lastName: 'SERGE', code: 'BDC5-002' },
  { id: 902, firstName: 'CYANGWEGE', lastName: 'John', code: 'BDC5-003' },
  { id: 903, firstName: 'HAKIZIYAREMYE', lastName: 'Papias', code: 'BDC5-004' },
  { id: 904, firstName: 'IRAFASHA', lastName: 'AUGUSTIN', code: 'BDC5-005' },
  { id: 905, firstName: 'IRAKIZA', lastName: 'Verite', code: 'BDC5-006' },
  { id: 906, firstName: 'ISIMBI', lastName: 'SYLVIE', code: 'BDC5-007' },
  { id: 907, firstName: 'IZABAYO', lastName: 'JOSUE', code: 'BDC5-008' },
  { id: 908, firstName: 'IZABAYO', lastName: 'PATRICK', code: 'BDC5-009' },
  { id: 909, firstName: 'MIZERO', lastName: 'Emile', code: 'BDC5-010' },
  { id: 910, firstName: 'MUGISHA', lastName: 'Eric', code: 'BDC5-011' },
  { id: 911, firstName: 'MUKAMUNYANA', lastName: 'Marie Chantal', code: 'BDC5-012' },
  { id: 912, firstName: 'MUKASEKURU', lastName: 'SOLANGE', code: 'BDC5-013' },
  { id: 913, firstName: 'MUKAWIZEYE', lastName: 'DIVINE', code: 'BDC5-014' },
  { id: 914, firstName: 'MUTINYIMANA', lastName: 'Ange', code: 'BDC5-015' },
  { id: 915, firstName: 'NIYOGUSHIMWA', lastName: 'Jean Robert', code: 'BDC5-016' },
  { id: 916, firstName: 'NIYOMUGABO', lastName: 'Jean De Dieu', code: 'BDC5-017' },
  { id: 917, firstName: 'NIYONGABO', lastName: 'Jean Pierre', code: 'BDC5-018' },
  { id: 918, firstName: 'NKUMBUYE', lastName: 'Elysee', code: 'BDC5-019' },
  { id: 919, firstName: 'NZAMURAMBAHO', lastName: 'GIRBERT', code: 'BDC5-020' },
  { id: 920, firstName: 'RAFIKI', lastName: 'Suwayibu', code: 'BDC5-021' },
  { id: 921, firstName: 'RUDAHUNDAGARA', lastName: 'Jonathan', code: 'BDC5-022' },
  { id: 922, firstName: 'RUKUNDO', lastName: 'JONATHAN', code: 'BDC5-023' },
  { id: 923, firstName: 'SHUKURU', lastName: 'ALICE', code: 'BDC5-024' },
  { id: 924, firstName: 'TUYISHIMIRE', lastName: 'Francois', code: 'BDC5-025' },
  { id: 925, firstName: 'TUYIZERE', lastName: 'Théodole', code: 'BDC5-026' },
  { id: 926, firstName: 'UWIRAGIYE', lastName: 'JACKSON', code: 'BDC5-027' },
  { id: 927, firstName: 'YEHOVAYIRE', lastName: 'Adamusowari', code: 'BDC5-028' }
];

async function addLevel5BDCStudents() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('Adding 28 Level 5 BDC students...\n');

    for (const student of students) {
      await connection.execute(
        `INSERT INTO global_student_sheets 
        (student_id, first_name, last_name, student_code, class_name, trade_code, trade_name, level_number, level_suffix, status, conduct_score, attendance_percentage) 
        VALUES (?, ?, ?, ?, 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00)
        ON DUPLICATE KEY UPDATE 
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          trade_code = VALUES(trade_code),
          level_number = VALUES(level_number)`,
        [student.id, student.firstName, student.lastName, student.code]
      );
      console.log(`✓ Added: ${student.firstName} ${student.lastName} (${student.code})`);
    }

    const [result] = await connection.execute(
      'SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code = "BDC" AND level_number = 5'
    );
    
    console.log(`\n✅ SUCCESS! Total Level 5 BDC students: ${result[0].total}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addLevel5BDCStudents();

const mysql = require('mysql2/promise');
require('dotenv').config();

const students = [
  { id: 1000, firstName: 'CYUBAHIRO', lastName: 'DANNY', code: 'SOD5-001' },
  { id: 1001, firstName: 'CYUSA', lastName: 'SETH', code: 'SOD5-002' },
  { id: 1002, firstName: 'CYUZUZO', lastName: 'JEAN BOSCO', code: 'SOD5-003' },
  { id: 1003, firstName: 'HAKIZIMANA', lastName: 'Aimable', code: 'SOD5-004' },
  { id: 1004, firstName: 'INEZA', lastName: 'LOUANGE', code: 'SOD5-005' },
  { id: 1005, firstName: 'IRADUFASHA', lastName: 'Millium', code: 'SOD5-006' },
  { id: 1006, firstName: 'IRAFASHA', lastName: 'DELIPHINE', code: 'SOD5-007' },
  { id: 1007, firstName: 'IRAKOZE', lastName: 'Ratipha', code: 'SOD5-008' },
  { id: 1008, firstName: 'IRAKUZI', lastName: 'ERIC', code: 'SOD5-009' },
  { id: 1009, firstName: 'IRATANGAJE', lastName: 'RUTH', code: 'SOD5-010' },
  { id: 1010, firstName: 'ISHIMWE', lastName: 'Fillette', code: 'SOD5-011' },
  { id: 1011, firstName: 'KABAREBE', lastName: 'Fred', code: 'SOD5-012' },
  { id: 1012, firstName: 'KUBERIMANA', lastName: 'Josephine', code: 'SOD5-013' },
  { id: 1013, firstName: 'MASENGESHO', lastName: 'DIVINE', code: 'SOD5-014' },
  { id: 1014, firstName: 'MUGISHA MAHORO', lastName: 'Salvo', code: 'SOD5-015' },
  { id: 1015, firstName: 'MUHOZA', lastName: 'PACIFIQUE', code: 'SOD5-016' },
  { id: 1016, firstName: 'MUKUNZI', lastName: 'PERPETUE', code: 'SOD5-017' },
  { id: 1017, firstName: 'MUREKATETE', lastName: 'LEAH', code: 'SOD5-018' },
  { id: 1018, firstName: 'MUTONI', lastName: 'PHIONAH', code: 'SOD5-019' },
  { id: 1019, firstName: 'NIKUZE', lastName: 'SARAH', code: 'SOD5-020' },
  { id: 1020, firstName: 'NIRERE', lastName: 'Anitha', code: 'SOD5-021' },
  { id: 1021, firstName: 'NIYOMUGENI', lastName: 'JEANNE', code: 'SOD5-022' },
  { id: 1022, firstName: 'NSENGIYUMVA', lastName: 'ERIC', code: 'SOD5-023' },
  { id: 1023, firstName: 'NSHIMIYIMANA', lastName: 'Protogene', code: 'SOD5-024' },
  { id: 1024, firstName: 'NYIRANZIZA', lastName: 'ANGELIQUE', code: 'SOD5-025' },
  { id: 1025, firstName: 'TUYISHIME', lastName: 'Jean Baptiste', code: 'SOD5-026' },
  { id: 1026, firstName: 'UMUKUNDWA', lastName: 'BONETTE', code: 'SOD5-027' },
  { id: 1027, firstName: 'UMUTONI', lastName: 'Ange', code: 'SOD5-028' },
  { id: 1028, firstName: 'UWASE', lastName: 'MAGNIFIQUE', code: 'SOD5-029' },
  { id: 1029, firstName: 'UWASE', lastName: 'Merveille', code: 'SOD5-030' },
  { id: 1030, firstName: 'UWATESE', lastName: 'LILIANE', code: 'SOD5-031' },
  { id: 1031, firstName: 'UWICYEZA', lastName: 'Yvette', code: 'SOD5-032' },
  { id: 1032, firstName: 'UWIDUHAYE', lastName: 'ALINE', code: 'SOD5-033' },
  { id: 1033, firstName: 'UWIMBABAZI', lastName: 'JEANNE', code: 'SOD5-034' },
  { id: 1034, firstName: 'UWINEZA', lastName: 'SIFA', code: 'SOD5-035' },
  { id: 1035, firstName: 'UWISEZERANO', lastName: 'MARITHA', code: 'SOD5-036' },
  { id: 1036, firstName: 'UYISABYE', lastName: 'Adeline', code: 'SOD5-038' }
];

async function addLevel5SODStudents() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('Adding 37 Level 5 SOD students...\n');

    for (const student of students) {
      await connection.execute(
        `INSERT INTO global_student_sheets 
        (student_id, first_name, last_name, student_code, class_name, trade_code, trade_name, level_number, level_suffix, status, conduct_score, attendance_percentage) 
        VALUES (?, ?, ?, ?, 'SOD 5', 'SOD', 'Software Development', 5, '', 'active', 40.00, 100.00)
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
      'SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code = "SOD" AND level_number = 5'
    );
    
    console.log(`\n✅ SUCCESS! Total Level 5 SOD students: ${result[0].total}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addLevel5SODStudents();

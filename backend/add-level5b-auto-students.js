const mysql = require('mysql2/promise');
require('dotenv').config();

const students = [
  { id: 800, firstName: 'AGIRANEZA', lastName: 'Jonathan', code: 'AUTO5B-001' },
  { id: 801, firstName: 'BIGIRIMANA', lastName: 'Vincent', code: 'AUTO5B-002' },
  { id: 802, firstName: 'BUGINGO', lastName: 'EDSON', code: 'AUTO5B-003' },
  { id: 803, firstName: 'BYIRINGIRO', lastName: 'HERTIER', code: 'AUTO5B-004' },
  { id: 804, firstName: 'BYIRINGIRO', lastName: 'JEAN BAPTISTE', code: 'AUTO5B-005' },
  { id: 805, firstName: 'HABINEZA', lastName: 'Cedric', code: 'AUTO5B-006' },
  { id: 806, firstName: 'HAGENIMANA', lastName: 'Emmanuel', code: 'AUTO5B-007' },
  { id: 807, firstName: 'Iradukunda', lastName: 'Janvier', code: 'AUTO5B-008' },
  { id: 808, firstName: 'IRADUKUNDA', lastName: 'Miradji', code: 'AUTO5B-009' },
  { id: 809, firstName: 'IRERA', lastName: 'DIANE', code: 'AUTO5B-010' },
  { id: 810, firstName: 'ISHIMWE', lastName: 'Pascal', code: 'AUTO5B-011' },
  { id: 811, firstName: 'ITANGUKWISHAKA', lastName: 'JOEL', code: 'AUTO5B-012' },
  { id: 812, firstName: 'IYAMUDUHAYE', lastName: 'FELIXIS', code: 'AUTO5B-013' },
  { id: 813, firstName: 'MANIGENA', lastName: 'David', code: 'AUTO5B-014' },
  { id: 814, firstName: 'MFITUMUKIZA', lastName: 'LAVIE', code: 'AUTO5B-015' },
  { id: 815, firstName: 'MIZERO ASIFIWE', lastName: 'Yves', code: 'AUTO5B-016' },
  { id: 816, firstName: 'MUGISHA', lastName: 'Dieudone', code: 'AUTO5B-017' },
  { id: 817, firstName: 'MUGISHA', lastName: 'Eliseus', code: 'AUTO5B-018' },
  { id: 818, firstName: 'MUHAWENIMANA', lastName: 'HONORINE', code: 'AUTO5B-019' },
  { id: 819, firstName: 'MUKAHIRWA', lastName: 'ALINE', code: 'AUTO5B-020' },
  { id: 820, firstName: 'MUNYANEZA', lastName: 'David', code: 'AUTO5B-021' },
  { id: 821, firstName: 'MUTANGANA', lastName: 'PATRICK', code: 'AUTO5B-022' },
  { id: 822, firstName: 'NDAYIRAGIJE', lastName: 'ALEX', code: 'AUTO5B-023' },
  { id: 823, firstName: 'NDAYISHIMIYE', lastName: 'ERIC', code: 'AUTO5B-024' },
  { id: 824, firstName: 'NDAYIZEYE', lastName: 'Eric', code: 'AUTO5B-025' },
  { id: 825, firstName: 'NIRAGIRE', lastName: 'ERIC', code: 'AUTO5B-026' },
  { id: 826, firstName: 'NIYOMUGABO', lastName: 'STEPHANO', code: 'AUTO5B-027' },
  { id: 827, firstName: 'NIYONSENGA', lastName: 'Jean Damour', code: 'AUTO5B-028' },
  { id: 828, firstName: 'NIYONSHUTI', lastName: 'ABEL', code: 'AUTO5B-029' },
  { id: 829, firstName: 'NIYONSHUTI', lastName: 'Fazil', code: 'AUTO5B-030' },
  { id: 830, firstName: 'NKURUNZIZA', lastName: 'JAPHET', code: 'AUTO5B-031' },
  { id: 831, firstName: 'NSABIMANA', lastName: 'Jean Bosco', code: 'AUTO5B-032' },
  { id: 832, firstName: 'NSENGIYUMVA', lastName: 'Amari', code: 'AUTO5B-033' },
  { id: 833, firstName: 'NYIRABIZIMANA', lastName: 'YVETTE', code: 'AUTO5B-034' },
  { id: 834, firstName: 'NYIRISHEMA', lastName: 'ERIC', code: 'AUTO5B-035' },
  { id: 835, firstName: 'NZAYISENGA', lastName: 'ERIC', code: 'AUTO5B-036' },
  { id: 836, firstName: 'RUKUNDO', lastName: 'Jean de la Paix', code: 'AUTO5B-037' },
  { id: 837, firstName: 'RUKUNDO', lastName: 'Olivier', code: 'AUTO5B-038' },
  { id: 838, firstName: 'RWIBUTSO', lastName: 'Benjamin', code: 'AUTO5B-039' },
  { id: 839, firstName: 'SHEMA', lastName: 'David', code: 'AUTO5B-040' },
  { id: 840, firstName: 'SHEMA', lastName: 'JEAN MARIE VIANNEY', code: 'AUTO5B-041' },
  { id: 841, firstName: 'TUYISENGE', lastName: 'FABRICE', code: 'AUTO5B-042' },
  { id: 842, firstName: 'TUZA UWASE', lastName: 'Thierry', code: 'AUTO5B-043' },
  { id: 843, firstName: 'UWIMANA', lastName: 'Jean Bosco', code: 'AUTO5B-044' },
  { id: 844, firstName: 'NSANZIMFURA RUKUNDO', lastName: 'Apolinaire', code: 'AUTO5B-045' }
];

async function addLevel5BAutoStudents() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('Adding 45 Level 5B AUTO students...\n');

    for (const student of students) {
      await connection.execute(
        `INSERT INTO global_student_sheets 
        (student_id, first_name, last_name, student_code, class_name, trade_code, trade_name, level_number, level_suffix, status, conduct_score, attendance_percentage) 
        VALUES (?, ?, ?, ?, 'AUTO 5B', 'AUTO', 'Automobile Technology', 5, 'B', 'active', 40.00, 100.00)
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
      'SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code = "AUTO" AND level_number = 5 AND level_suffix = "B"'
    );
    
    console.log(`\n✅ SUCCESS! Total Level 5B AUTO students: ${result[0].total}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addLevel5BAutoStudents();

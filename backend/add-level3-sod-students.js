const mysql = require('mysql2/promise');
require('dotenv').config();

const students = [
  { id: 600, firstName: 'Akimana', lastName: 'Ange Benita', code: 'SOD3-001' },
  { id: 601, firstName: 'BAHATI', lastName: 'Noella', code: 'SOD3-002' },
  { id: 602, firstName: 'CYOMORO', lastName: 'ARIHO RICKEY', code: 'SOD3-003' },
  { id: 603, firstName: 'CYUZUZO', lastName: 'Aime Prince', code: 'SOD3-004' },
  { id: 604, firstName: 'DUSHIME', lastName: 'MUTIMUTUJE Napoleon', code: 'SOD3-005' },
  { id: 605, firstName: 'GATSINZI', lastName: 'Frank', code: 'SOD3-006' },
  { id: 606, firstName: 'IMANIZABAYO', lastName: 'Alpha', code: 'SOD3-007' },
  { id: 607, firstName: 'ISHIMWE', lastName: 'AIME ENOCK', code: 'SOD3-008' },
  { id: 608, firstName: 'MANIRAREBA', lastName: 'Stiven', code: 'SOD3-009' },
  { id: 609, firstName: 'MFASHWANABO', lastName: 'Hybert', code: 'SOD3-010' },
  { id: 610, firstName: 'MUGISHA', lastName: 'Elissa', code: 'SOD3-011' },
  { id: 611, firstName: 'MUGISHA', lastName: 'Dieu Merci', code: 'SOD3-012' },
  { id: 612, firstName: 'MUGISHA', lastName: 'Prince', code: 'SOD3-013' },
  { id: 613, firstName: 'MUNEZERO', lastName: 'DARIUS', code: 'SOD3-014' },
  { id: 614, firstName: 'Mutsindashyaka', lastName: 'Alexis', code: 'SOD3-015' },
  { id: 615, firstName: 'NIYONSHUTI', lastName: 'Costase', code: 'SOD3-016' },
  { id: 616, firstName: 'NSHIMIYIMANA', lastName: 'Raphael', code: 'SOD3-017' },
  { id: 617, firstName: 'RUGAMBAGE', lastName: 'Yannick Seviye', code: 'SOD3-018' },
  { id: 618, firstName: 'RUTAYISIRE', lastName: 'EMILE', code: 'SOD3-019' },
  { id: 619, firstName: 'SHEMA', lastName: 'Alexandre', code: 'SOD3-020' },
  { id: 620, firstName: 'TUYISINGIZE', lastName: 'Pacifique', code: 'SOD3-021' },
  { id: 621, firstName: 'UWAMAHORO', lastName: 'JEANNETTE', code: 'SOD3-022' },
  { id: 622, firstName: 'UWARUGIRA', lastName: 'DANNY', code: 'SOD3-023' },
  { id: 623, firstName: 'UWIMANA', lastName: 'CHANTAL', code: 'SOD3-024' }
];

async function addLevel3SODStudents() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('Adding 24 Level 3 SOD students...\n');

    for (const student of students) {
      await connection.execute(
        `INSERT INTO global_student_sheets 
        (student_id, first_name, last_name, student_code, class_name, trade_code, trade_name, level_number, level_suffix, status, conduct_score, attendance_percentage) 
        VALUES (?, ?, ?, ?, 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00)
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
      'SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code = "SOD" AND level_number = 3'
    );
    
    console.log(`\n✅ SUCCESS! Total Level 3 SOD students: ${result[0].total}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addLevel3SODStudents();

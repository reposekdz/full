const mysql = require('mysql2/promise');
require('dotenv').config();

const students = [
  { id: 700, firstName: 'BARINDA', lastName: 'SOUVENIR', code: 'AUTO5A-001' },
  { id: 701, firstName: 'BERINYUMA', lastName: 'Patrick', code: 'AUTO5A-002' },
  { id: 702, firstName: 'CYIZERE', lastName: 'PASCAL', code: 'AUTO5A-003' },
  { id: 703, firstName: 'DUKUZE', lastName: 'JEAN MARIE', code: 'AUTO5A-004' },
  { id: 704, firstName: 'DUKUZUMUREMYI', lastName: 'DOMINIQUE', code: 'AUTO5A-005' },
  { id: 705, firstName: 'DUSHIMIYIMANA', lastName: 'DIOGENE', code: 'AUTO5A-006' },
  { id: 706, firstName: 'DUSHIMUMUKIZA', lastName: 'Bernard', code: 'AUTO5A-007' },
  { id: 707, firstName: 'GASANA', lastName: 'EMMANUEL', code: 'AUTO5A-008' },
  { id: 708, firstName: 'GISUBIZO', lastName: 'Dieudonne', code: 'AUTO5A-009' },
  { id: 709, firstName: 'HABIMANA', lastName: 'JEANCLAUDE', code: 'AUTO5A-010' },
  { id: 710, firstName: 'HATEGEKIMANA', lastName: 'INNOCENT', code: 'AUTO5A-011' },
  { id: 711, firstName: 'IKOMEZE', lastName: 'Jean Remi', code: 'AUTO5A-012' },
  { id: 712, firstName: 'INKORAMUTIMA', lastName: 'JAPHET', code: 'AUTO5A-013' },
  { id: 713, firstName: 'KWIHANGANA', lastName: 'Fabrice', code: 'AUTO5A-014' },
  { id: 714, firstName: 'KWIZERA', lastName: 'JACQUES', code: 'AUTO5A-015' },
  { id: 715, firstName: 'MANZI', lastName: 'EDMOND', code: 'AUTO5A-016' },
  { id: 716, firstName: 'MUGISHA', lastName: 'GEDEON', code: 'AUTO5A-017' },
  { id: 717, firstName: 'MUHIRE', lastName: 'DIEUDONE', code: 'AUTO5A-018' },
  { id: 718, firstName: 'MUNEZA', lastName: 'IVAN', code: 'AUTO5A-019' },
  { id: 719, firstName: 'Ndaberetse', lastName: 'Jean de Dieu', code: 'AUTO5A-020' },
  { id: 720, firstName: 'NDIKUMWENAYO', lastName: 'ZAIDI', code: 'AUTO5A-021' },
  { id: 721, firstName: 'NDOLI', lastName: 'Vedaste', code: 'AUTO5A-022' },
  { id: 722, firstName: 'NGIRUMUKIZA', lastName: 'ARISTIDE', code: 'AUTO5A-023' },
  { id: 723, firstName: 'NINEZAYE', lastName: 'NICK NELLY D\'ASSOMPTION', code: 'AUTO5A-024' },
  { id: 724, firstName: 'NIYIBIZI', lastName: 'Divine', code: 'AUTO5A-025' },
  { id: 725, firstName: 'NIYIKUZA', lastName: 'BENITHA', code: 'AUTO5A-026' },
  { id: 726, firstName: 'NIYONAMBAZA', lastName: 'Confiance', code: 'AUTO5A-027' },
  { id: 727, firstName: 'NIYONKURU', lastName: 'Joselyne', code: 'AUTO5A-028' },
  { id: 728, firstName: 'NIYONSENGA', lastName: 'Emmanuel', code: 'AUTO5A-029' },
  { id: 729, firstName: 'NIYONZIMA', lastName: 'CHRISTIAN', code: 'AUTO5A-030' },
  { id: 730, firstName: 'NIYONZIZA', lastName: 'Desire', code: 'AUTO5A-031' },
  { id: 731, firstName: 'NSABIMANA', lastName: 'Nasthase', code: 'AUTO5A-032' },
  { id: 732, firstName: 'NSENGIYUMVA', lastName: 'Frank', code: 'AUTO5A-033' },
  { id: 733, firstName: 'NSHIMIYIMANA', lastName: 'Jean d\'Amour', code: 'AUTO5A-034' },
  { id: 734, firstName: 'NYANDWI', lastName: 'Emmanuel', code: 'AUTO5A-035' },
  { id: 735, firstName: 'NZAKAMANAYO', lastName: 'Fridus', code: 'AUTO5A-036' },
  { id: 736, firstName: 'RUDASINGWA', lastName: 'ALEX', code: 'AUTO5A-037' },
  { id: 737, firstName: 'RUKUNDO', lastName: 'OLIVIER', code: 'AUTO5A-038' },
  { id: 738, firstName: 'RUTAYISIRE', lastName: 'Moise', code: 'AUTO5A-039' },
  { id: 739, firstName: 'TUYIZERE', lastName: 'CLAUDE', code: 'AUTO5A-041' },
  { id: 740, firstName: 'TUYIZERE', lastName: 'EMMANUEL', code: 'AUTO5A-042' },
  { id: 741, firstName: 'UMUKUNDWA', lastName: 'Ange Loic', code: 'AUTO5A-043' },
  { id: 742, firstName: 'URIMUBABO', lastName: 'HAKIM', code: 'AUTO5A-044' },
  { id: 743, firstName: 'NIYOMWUNGERI', lastName: 'Jonas', code: 'AUTO5A-045' }
];

async function addLevel5AAutoStudents() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('Adding 45 Level 5A AUTO students...\n');

    for (const student of students) {
      await connection.execute(
        `INSERT INTO global_student_sheets 
        (student_id, first_name, last_name, student_code, class_name, trade_code, trade_name, level_number, level_suffix, status, conduct_score, attendance_percentage) 
        VALUES (?, ?, ?, ?, 'AUTO 5A', 'AUTO', 'Automobile Technology', 5, 'A', 'active', 40.00, 100.00)
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
      'SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code = "AUTO" AND level_number = 5'
    );
    
    console.log(`\n✅ SUCCESS! Total Level 5A AUTO students: ${result[0].total}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addLevel5AAutoStudents();

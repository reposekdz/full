const mysql = require('mysql2/promise');
require('dotenv').config();

const addBDCCourses = async () => {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('  ADDING BDC LEVEL 3 COURSES');
    console.log('='.repeat(70) + '\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });
    
    console.log('✓ Database connected\n');
    
    // Get BDC trade ID
    const [trades] = await connection.execute(
      "SELECT id FROM trades WHERE code = 'BDC' OR name LIKE '%Building%Construction%'"
    );
    
    let tradeId;
    if (trades.length === 0) {
      console.log('Creating BDC trade...');
      const [result] = await connection.execute(
        "INSERT INTO trades (code, name, description) VALUES ('BDC', 'Building and Construction', 'Building and Construction Technology')"
      );
      tradeId = result.insertId;
      console.log('✓ BDC trade created\n');
    } else {
      tradeId = trades[0].id;
      console.log('✓ BDC trade found\n');
    }
    
    // BDC Level 3 courses
    const courses = [
      { code: 'BDC301', name: 'Construct Stone', name_rw: 'Kubaka Amabuye' },
      { code: 'BDC302', name: 'Opening Fixation', name_rw: 'Gushyiraho Ibyuma' },
      { code: 'BDC303', name: 'Fundamental of Building Material', name_rw: 'Ibanze by\'Ibikoresho byo Kubaka' },
      { code: 'BDC304', name: 'Drawing', name_rw: 'Gushushanya' },
      { code: 'BDC305', name: 'Soil Based Brick and Block', name_rw: 'Amatafari n\'Amabuye y\'Ubutaka' },
      { code: 'BDC306', name: 'Setting Out', name_rw: 'Gushyiraho Imiterere' },
      { code: 'BDC307', name: 'Cement Flooring', name_rw: 'Gushyiraho Sima ku Butaka' },
      { code: 'BDC308', name: 'Plumbing', name_rw: 'Amazi n\'Imiyoboro' },
      { code: 'BDC309', name: 'Erect Bricks and Blocks', name_rw: 'Gushyiraho Amatafari n\'Amabuye' },
      { code: 'BDC310', name: 'Basic Knowledge of Domestic Electricity', name_rw: 'Ubumenyi bw\'Amashanyarazi mu Nzu' },
      { code: 'BDC311', name: 'Plastering Structure', name_rw: 'Gusiga Inyubako' },
      { code: 'BDC312', name: 'Kiswahili', name_rw: 'Igiswahili' }
    ];
    
    console.log('Adding BDC Level 3 courses...\n');
    
    for (const course of courses) {
      try {
        await connection.execute(`
          INSERT INTO courses (trade_id, course_code, course_name, course_name_rw, level, credits, is_active)
          VALUES (?, ?, ?, ?, 3, 4, 1)
          ON DUPLICATE KEY UPDATE
          course_name = VALUES(course_name),
          course_name_rw = VALUES(course_name_rw),
          level = VALUES(level)
        `, [tradeId, course.code, course.name, course.name_rw]);
        
        console.log(`  ✓ ${course.code} - ${course.name}`);
      } catch (err) {
        console.log(`  ⚠ ${course.code} - ${err.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('  ✅ BDC LEVEL 3 COURSES ADDED!');
    console.log('='.repeat(70) + '\n');
    console.log('Total Courses: 12');
    console.log('Trade: Building and Construction (BDC)');
    console.log('Level: 3\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message, '\n');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

addBDCCourses();

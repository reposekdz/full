const mysql = require('mysql2/promise');
require('dotenv').config();

const integrate = async () => {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('  GLOBAL STUDENT SHEETS - ALL STAFF ROLES ACCESS');
    console.log('='.repeat(70) + '\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });
    
    console.log('✓ Database connected\n');
    
    // Sync students to global_student_sheets
    console.log('Syncing students...');
    await connection.execute(`
      INSERT INTO global_student_sheets (
        student_id, first_name, last_name, student_code, email, phone,
        trade_id, trade_code, trade_name, level_number, status
      )
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COALESCE(u.student_code, u.student_id),
        u.email,
        u.phone,
        u.trade_id,
        t.code,
        t.name,
        COALESCE(u.level, 1),
        COALESCE(u.status, 'active')
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.role = 'student'
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        email = VALUES(email),
        phone = VALUES(phone),
        trade_id = VALUES(trade_id),
        trade_code = VALUES(trade_code),
        trade_name = VALUES(trade_name),
        level_number = VALUES(level_number),
        status = VALUES(status)
    `);
    
    const [count] = await connection.execute('SELECT COUNT(*) as c FROM global_student_sheets');
    console.log(`✓ ${count[0].c} students synced\n`);
    
    console.log('='.repeat(70));
    console.log('  ROLE ACCESS CONFIGURATION');
    console.log('='.repeat(70));
    console.log('\n  Role              | Permissions');
    console.log('  ' + '-'.repeat(66));
    console.log('  Headmaster        | View, Edit, Delete, Export');
    console.log('  DOS               | View, Edit, Delete, Export');
    console.log('  DOD               | View, Edit, Export');
    console.log('  Accountant        | View, Edit, Export');
    console.log('  Teacher           | View, Edit, Export');
    console.log('  Advisor           | View, Edit, Export');
    console.log('  Matron/Patron     | View, Edit, Export');
    console.log('  Stock Manager     | View, Export');
    console.log('  Admin             | View, Edit, Delete, Export');
    console.log('  ' + '-'.repeat(66) + '\n');
    
    console.log('='.repeat(70));
    console.log('  ✅ INTEGRATION COMPLETE!');
    console.log('='.repeat(70) + '\n');
    console.log('API Endpoint: /api/global-sheets/students');
    console.log('Component: GlobalStudentSheets');
    console.log('\nAll staff roles can now access global student sheets!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message, '\n');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

integrate();

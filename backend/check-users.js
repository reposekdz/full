const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });
  
  try {
    console.log('\n=== Checking Admin Users ===\n');
    const [adminUsers] = await conn.query('SELECT id, username, email, role, first_name, last_name FROM admin_users');
    console.table(adminUsers);
    
    console.log('\n=== Checking Regular Users ===\n');
    const [users] = await conn.query('SELECT id, username, email, role, first_name, last_name, student_id FROM users');
    console.table(users);
    
    console.log('\n=== Checking Serial Codes ===\n');
    const [codes] = await conn.query('SELECT COUNT(*) as total FROM student_serial_codes');
    console.log(`Total serial codes: ${codes[0].total}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await conn.end();
})();

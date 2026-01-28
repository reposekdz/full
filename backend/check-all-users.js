const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  console.log('=== ADMIN USERS ===');
  const [admin] = await conn.execute('SELECT id, username, email, role, first_name, last_name, phone FROM admin_users ORDER BY role, id');
  console.table(admin);

  console.log('\n=== REGULAR USERS ===');
  const [users] = await conn.execute(`
    SELECT u.id, u.username, u.email, r.name as role, u.first_name, u.last_name, u.phone, u.student_id
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    ORDER BY r.name, u.id
  `);
  console.table(users);

  await conn.end();
}

checkUsers().catch(console.error);

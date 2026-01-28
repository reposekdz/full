const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixDefaultUsers() {
  let connection;
  try {
    console.log('🔧 Fixing default users...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    const defaultPassword = '2026';
    const defaultEmail = 'reponsekldz06@gmail.com';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // For admin_users - each role should have its own specific email since email is unique
    // We'll update existing ones or create new ones with proper unique emails
    
    const adminUsers = [
      { username: 'admin', email: 'admin_2026@default.rw', first_name: 'System', last_name: 'Admin', role: 'admin', phone: '+250788000001' },
      { username: 'headmaster', email: 'headmaster_2026@default.rw', first_name: 'School', last_name: 'Headmaster', role: 'headmaster', phone: '+250788000002' },
      { username: 'dos', email: 'dos_2026@default.rw', first_name: 'Director', last_name: 'Of Studies', role: 'dos', phone: '+250788000003' },
      { username: 'dod', email: 'dod_2026@default.rw', first_name: 'Director', last_name: 'Of Discipline', role: 'dod', phone: '+250788000004' },
      { username: 'accountant', email: 'accountant_2026@default.rw', first_name: 'School', last_name: 'Accountant', role: 'accountant', phone: '+250788000005' },
      { username: 'stockmanager', email: 'stockmanager_2026@default.rw', first_name: 'Stock', last_name: 'Manager', role: 'stockmanager', phone: '+250788000006' },
      { username: 'patron', email: 'patron_2026@default.rw', first_name: 'School', last_name: 'Patron', role: 'patron', phone: '+250788000007' },
      { username: 'advisor', email: 'advisor_2026@default.rw', first_name: 'Academic', last_name: 'Advisor', role: 'advisor', phone: '+250788000008' }
    ];

    console.log('Updating admin users...');
    for (const user of adminUsers) {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT id FROM admin_users WHERE username = ?',
        [user.username]
      );

      if (existing.length > 0) {
        // Update existing user
        await connection.execute(`
          UPDATE admin_users 
          SET password = ?, 
              first_name = ?, 
              last_name = ?, 
              role = ?,
              phone = ?,
              is_active = true,
              updated_at = CURRENT_TIMESTAMP
          WHERE username = ?
        `, [hashedPassword, user.first_name, user.last_name, user.role, user.phone, user.username]);
        console.log(`✅ Updated ${user.username}`);
      } else {
        // Create new user
        await connection.execute(`
          INSERT INTO admin_users (username, email, password, first_name, last_name, role, phone, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, true)
        `, [user.username, user.email, hashedPassword, user.first_name, user.last_name, user.role, user.phone]);
        console.log(`✅ Created ${user.username}`);
      }
    }

    // For regular users
    const [roleIds] = await connection.query('SELECT id, name FROM roles');
    const roleMap = {};
    roleIds.forEach(r => roleMap[r.name] = r.id);

    const regularUsers = [
      { username: 'teacher_demo', email: 'teacher_demo_2026@default.rw', first_name: 'Demo', last_name: 'Teacher', role: 'teacher', phone: '+250788000009' },
      { username: 'student_demo', email: 'student_demo_2026@default.rw', first_name: 'Demo', last_name: 'Student', role: 'student', phone: '+250788000010' },
      { username: 'parent_demo', email: 'parent_demo_2026@default.rw', first_name: 'Demo', last_name: 'Parent', role: 'parent', phone: '+250788000011' }
    ];

    console.log('\nUpdating regular users...');
    for (const user of regularUsers) {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [user.username]
      );

      if (existing.length > 0) {
        // Update existing user
        await connection.execute(`
          UPDATE users 
          SET password_hash = ?, 
              password = ?,
              first_name = ?, 
              last_name = ?, 
              role = ?,
              role_id = ?,
              phone = ?,
              is_active = true,
              updated_at = CURRENT_TIMESTAMP
          WHERE username = ?
        `, [hashedPassword, hashedPassword, user.first_name, user.last_name, user.role, roleMap[user.role], user.phone, user.username]);
        console.log(`✅ Updated ${user.username}`);
      } else {
        // Create new user
        await connection.execute(`
          INSERT INTO users (username, email, password_hash, password, first_name, last_name, role, role_id, phone, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
        `, [user.username, user.email, hashedPassword, hashedPassword, user.first_name, user.last_name, user.role, roleMap[user.role], user.phone]);
        console.log(`✅ Created ${user.username}`);
      }
    }

    console.log('\n========================================');
    console.log('✅ DEFAULT USERS FIXED!');
    console.log('========================================');
    console.log('\n🔑 Login Credentials:');
    console.log(`   Password: ${defaultPassword}`);
    console.log('\n📝 Admin Usernames:');
    console.log('   admin, headmaster, dos, dod');
    console.log('   accountant, stockmanager, patron, advisor');
    console.log('\n📝 Regular Usernames:');
    console.log('   teacher_demo, student_demo, parent_demo');
    console.log('\n💡 NOTE: Each user now has unique email addresses');
    console.log('   Format: {username}_2026@default.rw');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDefaultUsers();

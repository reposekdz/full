const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupStaffCredentials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'school_management'
  });

  console.log('✅ Connected to database\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 SETTING UP STAFF CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════\n');

  const defaultPassword = 'staff2024';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const staffAccounts = [
    // Admin
    { username: 'admin', email: 'admin@garden.tvet', role: 'admin', first_name: 'System', last_name: 'Admin' },
    { username: 'superadmin', email: 'superadmin@garden.tvet', role: 'super_admin', first_name: 'Super', last_name: 'Admin' },
    
    // Management
    { username: 'headmaster', email: 'headmaster@garden.tvet', role: 'headmaster', first_name: 'Head', last_name: 'Master' },
    { username: 'dos', email: 'dos@garden.tvet', role: 'director_study', first_name: 'Director', last_name: 'Studies' },
    { username: 'dod', email: 'dod@garden.tvet', role: 'director_discipline', first_name: 'Director', last_name: 'Discipline' },
    
    // Staff
    { username: 'accountant', email: 'accountant@garden.tvet', role: 'accountant', first_name: 'School', last_name: 'Accountant' },
    { username: 'stockmanager', email: 'stock@garden.tvet', role: 'stock_manager', first_name: 'Stock', last_name: 'Manager' },
    { username: 'patron', email: 'patron@garden.tvet', role: 'patron', first_name: 'School', last_name: 'Patron' },
    { username: 'advisor', email: 'advisor@garden.tvet', role: 'advisor', first_name: 'School', last_name: 'Advisor' },
    
    // Teachers
    { username: 'teacher1', email: 'teacher1@garden.tvet', role: 'teacher', first_name: 'John', last_name: 'Teacher' },
    { username: 'teacher2', email: 'teacher2@garden.tvet', role: 'teacher', first_name: 'Mary', last_name: 'Teacher' },
    { username: 'teacher3', email: 'teacher3@garden.tvet', role: 'teacher', first_name: 'James', last_name: 'Teacher' }
  ];

  try {
    for (const account of staffAccounts) {
      // Check if role exists
      const [roles] = await connection.execute(
        'SELECT id FROM roles WHERE name = ?',
        [account.role]
      );

      if (roles.length === 0) {
        console.log(`⚠️  Role '${account.role}' not found, creating...`);
        await connection.execute(
          'INSERT INTO roles (name, description) VALUES (?, ?)',
          [account.role, account.role.replace('_', ' ').toUpperCase()]
        );
        const [newRole] = await connection.execute('SELECT id FROM roles WHERE name = ?', [account.role]);
        var role_id = newRole[0].id;
      } else {
        var role_id = roles[0].id;
      }

      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT id FROM admin_users WHERE username = ? OR email = ?',
        [account.username, account.email]
      );

      if (existing.length > 0) {
        // Update existing user
        await connection.execute(
          'UPDATE admin_users SET password = ?, role = ?, first_name = ?, last_name = ? WHERE username = ?',
          [hashedPassword, account.role, account.first_name, account.last_name, account.username]
        );
        console.log(`✅ Updated: ${account.username} (${account.role})`);
      } else {
        // Create new user
        await connection.execute(
          `INSERT INTO admin_users (username, email, password, role, first_name, last_name, is_active, created_at)
           VALUES (?, ?, ?, ?, ?, ?, true, NOW())`,
          [account.username, account.email, hashedPassword, account.role, account.first_name, account.last_name]
        );
        console.log(`✅ Created: ${account.username} (${account.role})`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 STAFF CREDENTIALS SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Default Password for ALL staff: staff2024\n');
    
    console.log('🔐 ADMIN ACCOUNTS:');
    console.log('   Username: admin          | Role: Admin');
    console.log('   Username: superadmin     | Role: Super Admin\n');
    
    console.log('👔 MANAGEMENT:');
    console.log('   Username: headmaster     | Role: Head Master');
    console.log('   Username: dos            | Role: Director of Studies');
    console.log('   Username: dod            | Role: Director of Discipline\n');
    
    console.log('💼 STAFF:');
    console.log('   Username: accountant     | Role: Accountant');
    console.log('   Username: stockmanager   | Role: Stock Manager');
    console.log('   Username: patron         | Role: Patron');
    console.log('   Username: advisor        | Role: Advisor\n');
    
    console.log('👨‍🏫 TEACHERS:');
    console.log('   Username: teacher1       | Role: Teacher');
    console.log('   Username: teacher2       | Role: Teacher');
    console.log('   Username: teacher3       | Role: Teacher\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 HOW TO LOGIN:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Enter username (e.g., "admin")');
    console.log('3. Enter password: staff2024');
    console.log('4. Click Login\n');
    console.log('✅ All staff accounts are ready!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

setupStaffCredentials();

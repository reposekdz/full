/**
 * RETRIEVE ALL STAFF CREDENTIALS FROM DATABASE
 * This script queries the database to get real, current credentials
 * for all staff members including stock manager, admin, accountant, headmaster, etc.
 */

const mysql = require('mysql2/promise');

async function retrieveStaffCredentials() {
  // Create connection - adjust credentials if needed
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'school_management'
  });

  console.log('✅ Connected to database\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 RETRIEVING ALL STAFF CREDENTIALS FROM DATABASE');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Query all admin_users (management staff)
    const [adminUsers] = await connection.execute(`
      SELECT 
        id, 
        username, 
        email, 
        role, 
        first_name, 
        last_name, 
        phone,
        is_active,
        created_at,
        last_login
      FROM admin_users 
      WHERE role IN (
        'admin', 'super_admin', 'headmaster', 'director_study', 
        'director_discipline', 'accountant', 'stock_manager', 
        'patron', 'advisor', 'matron'
      )
      ORDER BY role, username
    `);

    // Query all regular users (teachers, etc.)
    const [regularUsers] = await connection.execute(`
      SELECT 
        id, 
        username, 
        email, 
        role, 
        first_name, 
        last_name, 
        phone,
        is_active,
        created_at
      FROM users 
      WHERE role IN ('teacher', 'staff')
      ORDER BY role, username
    `);

    console.log('═══════════════════════════════════════════════════════');
    console.log('👔 MANAGEMENT STAFF CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found in database\n');
    } else {
      // Group by role
      const roles = {};
      adminUsers.forEach(user => {
        if (!roles[user.role]) roles[user.role] = [];
        roles[user.role].push(user);
      });

      // Display by role
      const roleOrder = [
        'admin', 'super_admin', 'headmaster', 'director_study', 
        'director_discipline', 'accountant', 'stock_manager', 
        'patron', 'advisor', 'matron'
      ];

      roleOrder.forEach(role => {
        if (roles[role]) {
          console.log(`📌 ${role.toUpperCase()}:`);
          roles[role].forEach(user => {
            console.log(`   ┌────────────────────────────────────────────`);
            console.log(`   │ Username: ${user.username}`);
            console.log(`   │ Email:    ${user.email}`);
            console.log(`   │ Full Name: ${user.first_name} ${user.last_name}`);
            console.log(`   │ Phone:    ${user.phone || 'N/A'}`);
            console.log(`   │ Active:   ${user.is_active ? '✅ Yes' : '❌ No'}`);
            console.log(`   │ Last Login: ${user.last_login || 'Never'}`);
            console.log(`   └────────────────────────────────────────────`);
          });
          console.log('');
        }
      });
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('👨‍🏫 TEACHERS & STAFF CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (regularUsers.length === 0) {
      console.log('⚠️  No teachers/staff found in database\n');
    } else {
      // Group teachers separately
      const teachers = regularUsers.filter(u => u.role === 'teacher');
      const staff = regularUsers.filter(u => u.role === 'staff');

      if (teachers.length > 0) {
        console.log('📚 TEACHERS:');
        teachers.forEach(user => {
          console.log(`   ${user.first_name} ${user.last_name} (${user.username}) - ${user.email}`);
        });
        console.log('');
      }

      if (staff.length > 0) {
        console.log('👤 STAFF:');
        staff.forEach(user => {
          console.log(`   ${user.first_name} ${user.last_name} (${user.username}) - ${user.email}`);
        });
        console.log('');
      }
    }

    // Summary table
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 CREDENTIALS SUMMARY TABLE');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('┌──────────────┬────────────────────────┬────────────────────────┐');
    console.log('│ Role        │ Username               │ Email                 │');
    console.log('├──────────────┼────────────────────────┼────────────────────────┤');
    
    adminUsers.forEach(user => {
      const username = (user.username || '').padEnd(16).substring(0, 16);
      const email = (user.email || '').padEnd(22).substring(0, 22);
      const role = (user.role || '').padEnd(12).substring(0, 12);
      console.log(`│ ${role} │ ${username} │ ${email} │`);
    });
    
    console.log('└──────────────┴────────────────────────┴────────────────────────┘\n');

    // Login instructions
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔐 HOW TO LOGIN');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Frontend: http://localhost:5173');
    console.log('Backend:  http://localhost:5000\n');
    console.log('1. Go to: http://localhost:5273/login');
    console.log('2. Click "Management Staff"');
    console.log('3. Enter access code: g@2026');
    console.log('4. Select your role');
    console.log('5. Enter your email and password');
    console.log('6. Click Login\n');

    // Note about passwords
    console.log('═══════════════════════════════════════════════════════');
    console.log('⚠️  NOTE ABOUT PASSWORDS');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Passwords are hashed (encrypted) in the database.');
    console.log('To reset a password, use:');
    console.log('  node backend/scripts/create-real-staff-accounts.js');
    console.log('  (This will set password to "2026" for all staff)\n');

    console.log(`✅ Total staff retrieved: ${adminUsers.length} management + ${regularUsers.length} teachers/staff\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. MySQL server is running');
    console.error('2. Database "school_management" exists');
    console.error('3. Tables "admin_users" and "users" exist');
  } finally {
    await connection.end();
  }
}

retrieveStaffCredentials();

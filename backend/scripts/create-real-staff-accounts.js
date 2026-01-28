const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createRealStaffAccounts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'school_management'
  });

  console.log('✅ Connected to database\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 CREATING REAL STAFF ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════\n');

  const realPassword = '2026';
  const hashedPassword = await bcrypt.hash(realPassword, 10);

  const staffAccounts = [
    { username: 'admin', email: 'admin@reponsekdz06.com', role: 'admin', first_name: 'System', last_name: 'Administrator' },
    { username: 'superadmin', email: 'superadmin@reponsekdz06.com', role: 'super_admin', first_name: 'Super', last_name: 'Administrator' },
    { username: 'headmaster', email: 'headmaster@reponsekdz06.com', role: 'headmaster', first_name: 'Head', last_name: 'Master' },
    { username: 'dos', email: 'dos@reponsekdz06.com', role: 'director_study', first_name: 'Director of', last_name: 'Studies' },
    { username: 'dod', email: 'dod@reponsekdz06.com', role: 'director_discipline', first_name: 'Director of', last_name: 'Discipline' },
    { username: 'accountant', email: 'accountant@reponsekdz06.com', role: 'accountant', first_name: 'School', last_name: 'Accountant' },
    { username: 'stockmanager', email: 'stockmanager@reponsekdz06.com', role: 'stock_manager', first_name: 'Stock', last_name: 'Manager' },
    { username: 'patron', email: 'patron@reponsekdz06.com', role: 'patron', first_name: 'School', last_name: 'Patron' },
    { username: 'advisor', email: 'advisor@reponsekdz06.com', role: 'advisor', first_name: 'School', last_name: 'Advisor' },
    { username: 'teacher1', email: 'teacher1@reponsekdz06.com', role: 'teacher', first_name: 'John', last_name: 'Doe' },
    { username: 'teacher2', email: 'teacher2@reponsekdz06.com', role: 'teacher', first_name: 'Mary', last_name: 'Smith' },
    { username: 'teacher3', email: 'teacher3@reponsekdz06.com', role: 'teacher', first_name: 'James', last_name: 'Wilson' },
    { username: 'teacher4', email: 'teacher4@reponsekdz06.com', role: 'teacher', first_name: 'Sarah', last_name: 'Johnson' },
    { username: 'teacher5', email: 'teacher5@reponsekdz06.com', role: 'teacher', first_name: 'David', last_name: 'Brown' }
  ];

  try {
    for (const account of staffAccounts) {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT id FROM admin_users WHERE username = ?',
        [account.username]
      );

      if (existing.length > 0) {
        // Update existing user with real credentials
        await connection.execute(
          `UPDATE admin_users 
           SET email = ?, password = ?, role = ?, first_name = ?, last_name = ?, is_active = true
           WHERE username = ?`,
          [account.email, hashedPassword, account.role, account.first_name, account.last_name, account.username]
        );
        console.log(`✅ Updated: ${account.username} (${account.role})`);
      } else {
        // Create new user with real credentials
        await connection.execute(
          `INSERT INTO admin_users (username, email, password, role, first_name, last_name, is_active, created_at)
           VALUES (?, ?, ?, ?, ?, ?, true, NOW())`,
          [account.username, account.email, hashedPassword, account.role, account.first_name, account.last_name]
        );
        console.log(`✅ Created: ${account.username} (${account.role})`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 REAL STAFF ACCOUNTS CREATED');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🔐 UNIVERSAL PASSWORD FOR ALL STAFF: 2026\n');
    console.log('📧 EMAIL FORMAT: [role]@reponsekdz06.com\n');
    
    console.log('👥 STAFF ACCOUNTS:\n');
    console.log('   🔐 ADMIN:');
    console.log('      Email: admin@reponsekdz06.com | Password: 2026');
    console.log('      Email: superadmin@reponsekdz06.com | Password: 2026\n');
    
    console.log('   👔 MANAGEMENT:');
    console.log('      Email: headmaster@reponsekdz06.com | Password: 2026');
    console.log('      Email: dos@reponsekdz06.com | Password: 2026');
    console.log('      Email: dod@reponsekdz06.com | Password: 2026\n');
    
    console.log('   💼 STAFF:');
    console.log('      Email: accountant@reponsekdz06.com | Password: 2026');
    console.log('      Email: stockmanager@reponsekdz06.com | Password: 2026');
    console.log('      Email: patron@reponsekdz06.com | Password: 2026');
    console.log('      Email: advisor@reponsekdz06.com | Password: 2026\n');
    
    console.log('   👨🏫 TEACHERS:');
    console.log('      Email: teacher1@reponsekdz06.com | Password: 2026');
    console.log('      Email: teacher2@reponsekdz06.com | Password: 2026');
    console.log('      Email: teacher3@reponsekdz06.com | Password: 2026');
    console.log('      Email: teacher4@reponsekdz06.com | Password: 2026');
    console.log('      Email: teacher5@reponsekdz06.com | Password: 2026\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 HOW TO LOGIN:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Click "Management Staff"');
    console.log('3. Enter access code: g@2026');
    console.log('4. Select your role');
    console.log('5. Enter your email (e.g., admin@reponsekdz06.com)');
    console.log('6. Enter password: 2026');
    console.log('7. Click Login\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✏️  CHANGE PASSWORD & EMAIL:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('After login, users can:');
    console.log('1. Go to Profile/Settings');
    console.log('2. Change email to their personal email');
    console.log('3. Change password to their own password');
    console.log('4. All changes are saved in database\n');
    
    console.log('✅ All real staff accounts are ready!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createRealStaffAccounts();

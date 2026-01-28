const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDefaultUsers() {
  let connection;
  try {
    console.log('🚀 Setting up default users and serial code system...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    const defaultPassword = '2026';
    const defaultEmail = 'reponsekldz06@gmail.com';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    console.log('✅ Password hashed successfully\n');

    // 1. Ensure roles table exists and has all roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const roles = [
      ['admin', 'System Administrator - Full access to all features'],
      ['headmaster', 'School Headmaster - Full school management access'],
      ['dos', 'Director of Studies - Academic management'],
      ['dod', 'Director of Discipline - Discipline management'],
      ['teacher', 'Teacher - Class and subject management'],
      ['student', 'Student - Learning and assignments'],
      ['parent', 'Parent - Monitor student progress'],
      ['accountant', 'Accountant - Financial management'],
      ['stockmanager', 'Stock Manager - Inventory management'],
      ['advisor', 'Academic Advisor - Student guidance'],
      ['patron', 'School Patron - General oversight']
    ];

    for (const [name, description] of roles) {
      await connection.query(
        'INSERT IGNORE INTO roles (name, description) VALUES (?, ?)',
        [name, description]
      );
    }

    console.log('✅ Roles table configured\n');

    // 2. Modify admin_users table to add missing columns and expand role enum
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50),
        phone VARCHAR(20),
        profile_image VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add phone column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE admin_users 
        ADD COLUMN phone VARCHAR(20) AFTER role
      `);
      console.log('✅ Added phone column to admin_users\n');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Phone column already exists or error:', e.message);
      }
    }

    // Modify role column to VARCHAR if it's ENUM
    try {
      await connection.query(`
        ALTER TABLE admin_users 
        MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'admin'
      `);
      console.log('✅ Updated role column type\n');
    } catch (e) {
      console.log('⚠️  Role column modification:', e.message);
    }

    console.log('✅ Admin users table ready\n');

    // 3. Ensure users table has all necessary columns
    const [userTableExists] = await connection.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
      [process.env.DB_NAME || 'school_management']
    );

    if (userTableExists[0].count === 0) {
      await connection.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          password VARCHAR(255),
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          phone VARCHAR(20),
          phone_type ENUM('smartphone', 'basic') DEFAULT 'smartphone',
          is_whatsapp_enabled BOOLEAN DEFAULT false,
          role VARCHAR(50),
          role_id INT,
          student_id VARCHAR(50),
          parent_id INT,
          date_of_birth DATE,
          gender ENUM('Male', 'Female', 'Other'),
          address TEXT,
          emergency_contact TEXT,
          medical_info TEXT,
          profile_image VARCHAR(500),
          avatar_url VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
        )
      `);
    }

    console.log('✅ Users table ready\n');

    // 4. Create student serial codes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_serial_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serial_code VARCHAR(50) UNIQUE NOT NULL,
        trade_code VARCHAR(10) NOT NULL,
        level_number INT NOT NULL,
        level_suffix VARCHAR(5),
        academic_year VARCHAR(20),
        generated_by INT NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_used BOOLEAN DEFAULT false,
        used_by INT,
        used_at TIMESTAMP NULL,
        student_id INT,
        status ENUM('active', 'used', 'expired', 'revoked') DEFAULT 'active',
        expires_at TIMESTAMP NULL,
        notes TEXT,
        FOREIGN KEY (generated_by) REFERENCES users(id),
        FOREIGN KEY (used_by) REFERENCES users(id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        INDEX idx_serial_code (serial_code),
        INDEX idx_status (status),
        INDEX idx_trade_level (trade_code, level_number)
      )
    `);

    console.log('✅ Student serial codes table created\n');

    // 5. Create profile edit history table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS profile_edit_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        field_changed VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);

    console.log('✅ Profile edit history table created\n');

    // 6. Insert default admin users
    const adminUsers = [
      ['admin', 'System', 'Admin', 'admin', '+250788000001'],
      ['headmaster', 'School', 'Headmaster', 'headmaster', '+250788000002'],
      ['dos', 'Director', 'Of Studies', 'dos', '+250788000003'],
      ['dod', 'Director', 'Of Discipline', 'dod', '+250788000004'],
      ['accountant', 'School', 'Accountant', 'accountant', '+250788000005'],
      ['stockmanager', 'Stock', 'Manager', 'stockmanager', '+250788000006'],
      ['patron', 'School', 'Patron', 'patron', '+250788000007'],
      ['advisor', 'Academic', 'Advisor', 'advisor', '+250788000008']
    ];

    for (const [username, first_name, last_name, role, phone] of adminUsers) {
      try {
        await connection.query(`
          INSERT INTO admin_users (username, email, password, first_name, last_name, role, phone, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, true)
          ON DUPLICATE KEY UPDATE 
            password = ?,
            first_name = ?,
            last_name = ?,
            role = ?,
            phone = ?,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP
        `, [username, defaultEmail, hashedPassword, first_name, last_name, role, phone, hashedPassword, first_name, last_name, role, phone]);
      } catch (e) {
        console.error(`Error inserting ${username}:`, e.message);
      }
    }

    console.log('✅ Default admin users created/updated\n');

    // 7. Insert default regular users (teacher, student, parent)
    const [roleIds] = await connection.query('SELECT id, name FROM roles');
    const roleMap = {};
    roleIds.forEach(r => roleMap[r.name] = r.id);

    const regularUsers = [
      ['teacher_demo', 'Demo', 'Teacher', 'teacher', '+250788000009'],
      ['student_demo', 'Demo', 'Student', 'student', '+250788000010'],
      ['parent_demo', 'Demo', 'Parent', 'parent', '+250788000011']
    ];

    for (const [username, first_name, last_name, role, phone] of regularUsers) {
      await connection.query(`
        INSERT INTO users (username, email, password_hash, password, first_name, last_name, role, role_id, phone, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
        ON DUPLICATE KEY UPDATE 
          password_hash = ?,
          password = ?,
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
      `, [username, defaultEmail, hashedPassword, hashedPassword, first_name, last_name, role, roleMap[role], phone, hashedPassword, hashedPassword]);
    }

    console.log('✅ Default regular users created/updated\n');

    // 8. Ensure academic infrastructure tables exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trade_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trade_code VARCHAR(10) NOT NULL,
        trade_name VARCHAR(100) NOT NULL,
        level_number INT NOT NULL,
        level_suffix VARCHAR(5),
        description TEXT,
        capacity INT DEFAULT 40,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_trade_level (trade_code, level_number, level_suffix)
      )
    `);

    const tradeLevels = [
      ['ICT', 'Information and Communication Technology', 1, 'A', 'ICT Level 1 - Section A'],
      ['ICT', 'Information and Communication Technology', 1, 'B', 'ICT Level 1 - Section B'],
      ['ICT', 'Information and Communication Technology', 2, null, 'ICT Level 2'],
      ['ICT', 'Information and Communication Technology', 3, null, 'ICT Level 3'],
      ['ELE', 'Electrical Installation', 1, null, 'Electrical Installation Level 1'],
      ['ELE', 'Electrical Installation', 2, null, 'Electrical Installation Level 2'],
      ['ELE', 'Electrical Installation', 3, null, 'Electrical Installation Level 3'],
      ['PLU', 'Plumbing', 1, null, 'Plumbing Level 1'],
      ['PLU', 'Plumbing', 2, null, 'Plumbing Level 2'],
      ['WEL', 'Welding', 1, null, 'Welding Level 1'],
      ['WEL', 'Welding', 2, null, 'Welding Level 2'],
      ['CAR', 'Carpentry', 1, null, 'Carpentry Level 1'],
      ['CAR', 'Carpentry', 2, null, 'Carpentry Level 2']
    ];

    for (const [code, name, level, suffix, desc] of tradeLevels) {
      await connection.query(
        'INSERT IGNORE INTO trade_levels (trade_code, trade_name, level_number, level_suffix, description) VALUES (?, ?, ?, ?, ?)',
        [code, name, level, suffix, desc]
      );
    }

    console.log('✅ Trade levels configured\n');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS academic_years (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      INSERT IGNORE INTO academic_years (name, start_date, end_date, is_active)
      VALUES ('2025-2026', '2025-09-01', '2026-06-30', true)
    `);

    console.log('✅ Academic year configured\n');

    // Display summary
    const [adminCount] = await connection.query('SELECT COUNT(*) as count FROM admin_users');
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [roleCount] = await connection.query('SELECT COUNT(*) as count FROM roles');
    const [tradeCount] = await connection.query('SELECT COUNT(*) as count FROM trade_levels');

    console.log('\n========================================');
    console.log('✅ DATABASE SETUP COMPLETE!');
    console.log('========================================');
    console.log(`📊 Admin Users: ${adminCount[0].count}`);
    console.log(`📊 Regular Users: ${userCount[0].count}`);
    console.log(`📊 Roles Available: ${roleCount[0].count}`);
    console.log(`📊 Trade Levels: ${tradeCount[0].count}`);
    console.log('\n🔑 Default Login Credentials:');
    console.log(`   Email: ${defaultEmail}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('\n📝 Available Usernames:');
    console.log('   - admin, headmaster, dos, dod, accountant');
    console.log('   - stockmanager, patron, advisor');
    console.log('   - teacher_demo, student_demo, parent_demo');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDefaultUsers();

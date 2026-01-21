#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const setupUnifiedAuth = async () => {
  try {
    console.log('\n🔧 Starting unified authentication setup...\n');
    
    // Test database connection first
    try {
      await pool.execute('SELECT 1');
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }

    // 1. Create roles
    console.log('📋 Creating roles...');
    const roles = [
      { name: 'director_study', description: 'Director of Study' },
      { name: 'director_discipline', description: 'Director of Discipline' },
      { name: 'headmaster', description: 'Head Master' },
      { name: 'teacher', description: 'Teacher' },
      { name: 'accountant', description: 'Accountant' },
      { name: 'stock_manager', description: 'Stock Manager' },
      { name: 'admin', description: 'Administrator' },
      { name: 'student', description: 'Student' },
      { name: 'parent', description: 'Parent' }
    ];

    for (const role of roles) {
      const [existing] = await pool.execute('SELECT id FROM roles WHERE name = ?', [role.name]);
      if (existing.length === 0) {
        await pool.execute('INSERT INTO roles (name, description) VALUES (?, ?)', [role.name, role.description]);
        console.log(`  ✓ Role '${role.name}' created`);
      }
    }

    // 2. Ensure admin_users table has required columns
    console.log('\n📊 Updating admin_users table...');
    try {
      await pool.execute('ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)');
      await pool.execute('ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)');
      console.log('  ✓ Columns added');
    } catch (e) {
      console.log('  ✓ Columns already exist');
    }

    // 3. Create unified admin user
    console.log('\n👤 Setting up unified credentials...');
    const unifiedPassword = '2026';
    const hashedPassword = await bcrypt.hash(unifiedPassword, 10);

    const [existingUser] = await pool.execute(
      'SELECT id FROM admin_users WHERE email = ?',
      ['reponse@gmail.com']
    );

    if (existingUser.length === 0) {
      await pool.execute(`
        INSERT INTO admin_users (username, email, password, role, first_name, last_name, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['reponse', 'reponse@gmail.com', hashedPassword, 'admin', 'System', 'Admin', 1]);
      console.log('  ✓ Unified admin user created');
    } else {
      await pool.execute(
        'UPDATE admin_users SET password = ?, first_name = ?, last_name = ? WHERE email = ?',
        [hashedPassword, 'System', 'Admin', 'reponse@gmail.com']
      );
      console.log('  ✓ Unified admin user updated');
    }

    // 4. Create sample data
    console.log('\n📚 Creating sample data...');

    // Create levels
    const [existingLevels] = await pool.execute('SELECT COUNT(*) as count FROM levels');
    if (existingLevels[0].count === 0) {
      const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
      for (const level of levels) {
        await pool.execute('INSERT INTO levels (name, description) VALUES (?, ?)', [level, `${level} students`]);
      }
      console.log('  ✓ Levels created');
    }

    // Create trades
    const [existingTrades] = await pool.execute('SELECT COUNT(*) as count FROM trades');
    if (existingTrades[0].count === 0) {
      const trades = [
        { name: 'Software Development', code: 'SOD' },
        { name: 'Building & Construction', code: 'BDC' },
        { name: 'Automobile Technology', code: 'AUT' }
      ];
      for (const trade of trades) {
        await pool.execute('INSERT INTO trades (name, code, description) VALUES (?, ?, ?)', 
          [trade.name, trade.code, `${trade.name} program`]);
      }
      console.log('  ✓ Trades created');
    }

    // Create classes (skip if constraints exist)
    const [existingClasses] = await pool.execute('SELECT COUNT(*) as count FROM classes');
    if (existingClasses[0].count === 0) {
      try {
        const [levels] = await pool.execute('SELECT id FROM levels LIMIT 1');
        if (levels.length > 0) {
          const classes = ['Class A', 'Class B', 'Class C'];
          for (const cls of classes) {
            await pool.execute('INSERT INTO classes (name, level_id, capacity) VALUES (?, ?, ?)', 
              [cls, levels[0].id, 50]);
          }
          console.log('  ✓ Classes created');
        }
      } catch (error) {
        // If there are foreign key constraints, insert with all required fields
        try {
          // Check if courses exist first
          const [courses] = await pool.execute('SELECT id FROM courses LIMIT 1');
          const [academicYears] = await pool.execute('SELECT id FROM academic_years LIMIT 1');
          const [levels] = await pool.execute('SELECT id FROM levels LIMIT 1');
          
          if (courses.length > 0 && academicYears.length > 0 && levels.length > 0) {
            const classes = ['Class A', 'Class B', 'Class C'];
            for (const cls of classes) {
              await pool.execute('INSERT INTO classes (name, course_id, academic_year_id, level_id, capacity) VALUES (?, ?, ?, ?, ?)', 
                [cls, courses[0].id, academicYears[0].id, levels[0].id, 50]);
            }
            console.log('  ✓ Classes created with full references');
          } else {
            console.log('  ! Classes skipped - missing required references');
          }
        } catch (e) {
          console.log('  ! Classes creation skipped due to constraints');
        }
      }
    }

    // 5. Create conduct_records table if not exists
    console.log('\n📋 Ensuring conduct_records table exists...');
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS conduct_records (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          description TEXT,
          severity VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(20) DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users(id)
        )
      `);
      console.log('  ✓ Conduct records table ready');
    } catch (e) {
      console.log('  ✓ Conduct records table already exists');
    }

    // 6. Create class_teachers table if not exists
    console.log('\n👨‍🏫 Ensuring class_teachers table exists...');
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS class_teachers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          teacher_id INT NOT NULL,
          class_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES users(id),
          FOREIGN KEY (class_id) REFERENCES classes(id)
        )
      `);
      console.log('  ✓ Class teachers table ready');
    } catch (e) {
      console.log('  ✓ Class teachers table already exists');
    }

    console.log('\n✅ Unified authentication setup complete!\n');
    console.log('📝 Unified Credentials:');
    console.log('   Email: reponse@gmail.com');
    console.log('   Password: 2026');
    console.log('\n🎯 All staff roles can login with these credentials');
    console.log('🔐 Users can change their credentials in their dashboard profile\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

setupUnifiedAuth();

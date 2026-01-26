const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function quickFix() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('🔧 QUICK FIX FOR LOGIN AND DEVELOPERS...\n');

    // 1. Fix users table
    console.log('1. Fixing users table...');
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT "student"');
      console.log('   ✅ Added role column');
    } catch (e) {
      console.log('   ⚠️  Role column already exists');
    }

    // 2. Recreate developers table
    console.log('\n2. Setting up developers table...');
    await connection.execute('DROP TABLE IF EXISTS developers');
    await connection.execute(`
      CREATE TABLE developers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        specialization VARCHAR(255),
        experience_years INT DEFAULT 0,
        bio TEXT,
        image_url VARCHAR(500),
        github_url VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Developers table created');

    // 3. Add developers
    const developers = [
      ['Reponse Kamanzi', 'Lead Full-Stack Developer', 'React, Node.js, Database Design', 5, 'Lead developer of Garden TVET School Management System', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://github.com/reponse', 'reponse@gardentvet.rw', '+250788123456', 1],
      ['Jean Baptiste Uwimana', 'Frontend Developer', 'React, TypeScript, UI/UX', 3, 'Frontend specialist creating beautiful interfaces', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', null, 'jean@gardentvet.rw', '+250788234567', 2],
      ['Marie Claire Mukamana', 'Backend Developer', 'Node.js, MySQL, APIs', 4, 'Backend developer specializing in server-side applications', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', null, 'marie@gardentvet.rw', '+250788345678', 3],
      ['Eric Nshimiyimana', 'DevOps Engineer', 'Server Management, Deployment', 3, 'DevOps engineer ensuring smooth system operations', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', null, 'eric@gardentvet.rw', '+250788456789', 4]
    ];

    for (const dev of developers) {
      await connection.execute(`
        INSERT INTO developers (name, role, specialization, experience_years, bio, image_url, github_url, email, phone, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, dev);
      console.log(`   ✅ Added: ${dev[0]}`);
    }

    // 4. Add staff users
    console.log('\n3. Adding staff users...');
    const staffUsers = [
      ['headmaster', 'headmaster@gardentvet.rw', 'headmaster123', 'headmaster', 'John', 'Mugisha'],
      ['teacher1', 'teacher1@gardentvet.rw', 'teacher123', 'teacher', 'Alice', 'Uwimana'],
      ['accountant', 'accountant@gardentvet.rw', 'accountant123', 'accountant', 'Bob', 'Nkurunziza'],
      ['dod', 'dod@gardentvet.rw', 'dod123', 'dod', 'Sarah', 'Mukamana']
    ];

    for (const staff of staffUsers) {
      const [existing] = await connection.execute('SELECT id FROM admin_users WHERE username = ?', [staff[0]]);
      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(staff[2], 10);
        await connection.execute(`
          INSERT INTO admin_users (username, email, password, role, first_name, last_name, is_active)
          VALUES (?, ?, ?, ?, ?, ?, true)
        `, [staff[0], staff[1], hashedPassword, staff[3], staff[4], staff[5]]);
        console.log(`   ✅ Added: ${staff[0]} (${staff[3]})`);
      } else {
        console.log(`   ⚠️  Already exists: ${staff[0]}`);
      }
    }

    console.log('\n🎉 ALL FIXES COMPLETED!');
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('   Admin: admin / admin123');
    console.log('   Headmaster: headmaster / headmaster123');
    console.log('   Teacher: teacher1 / teacher123');
    console.log('   Accountant: accountant / accountant123');
    console.log('   DOD: dod / dod123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

quickFix();
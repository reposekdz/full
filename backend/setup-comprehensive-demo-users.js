const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

async function setupComprehensiveDemoUsers() {
  let connection;
  try {
    console.log('🚀 Setting up comprehensive demo users for all roles...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    const defaultPassword = '2026';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // ==================== ADMIN STAFF USERS ====================
    const adminStaffUsers = [
      { username: 'admin', email: 'admin_2026@gardentvet.rw', first_name: 'System', last_name: 'Administrator', role: 'admin', phone: '+250788100001' },
      { username: 'headmaster', email: 'headmaster_2026@gardentvet.rw', first_name: 'Jean Paul', last_name: 'Nkurunziza', role: 'headmaster', phone: '+250788100002' },
      { username: 'dos', email: 'dos_2026@gardentvet.rw', first_name: 'Marie', last_name: 'Uwimana', role: 'dos', phone: '+250788100003' },
      { username: 'dod', email: 'dod_2026@gardentvet.rw', first_name: 'Eric', last_name: 'Mugenzi', role: 'dod', phone: '+250788100004' },
      { username: 'accountant', email: 'accountant_2026@gardentvet.rw', first_name: 'Grace', last_name: 'Mukandayisenga', role: 'accountant', phone: '+250788100005' },
      { username: 'stockmanager', email: 'stockmanager_2026@gardentvet.rw', first_name: 'Patrick', last_name: 'Habimana', role: 'stockmanager', phone: '+250788100006' },
      { username: 'patron', email: 'patron_2026@gardentvet.rw', first_name: 'Rev. James', last_name: 'Kalisa', role: 'patron', phone: '+250788100007' },
      { username: 'advisor', email: 'advisor_2026@gardentvet.rw', first_name: 'Alice', last_name: 'Nyiramahirwe', role: 'advisor', phone: '+250788100008' },
    ];

    console.log('📋 Creating/Updating admin staff users...');
    for (const user of adminStaffUsers) {
      const [existing] = await connection.execute(
        'SELECT id FROM admin_users WHERE username = ?',
        [user.username]
      );

      if (existing.length > 0) {
        await connection.execute(`
          UPDATE admin_users 
          SET email = ?, password = ?, first_name = ?, last_name = ?, role = ?, phone = ?, is_active = true
          WHERE username = ?
        `, [user.email, hashedPassword, user.first_name, user.last_name, user.role, user.phone, user.username]);
        console.log(`✅ Updated: ${user.username} (${user.role})`);
      } else {
        await connection.execute(`
          INSERT INTO admin_users (username, email, password, first_name, last_name, role, phone, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, true)
        `, [user.username, user.email, hashedPassword, user.first_name, user.last_name, user.role, user.phone]);
        console.log(`✅ Created: ${user.username} (${user.role})`);
      }
    }

    // Get role IDs
    const [roleIds] = await connection.query('SELECT id, name FROM roles');
    const roleMap = {};
    roleIds.forEach(r => roleMap[r.name] = r.id);

    // ==================== DEMO TEACHERS ====================
    const demoTeachers = [
      { username: 'teacher_demo', email: 'teacher_demo_2026@gardentvet.rw', first_name: 'Emmanuel', last_name: 'Mugisha', phone: '+250788200001', subject: 'Mathematics', qualification: 'MSc Mathematics' },
      { username: 'teacher_physics', email: 'teacher_physics_2026@gardentvet.rw', first_name: 'Christine', last_name: 'Uwineza', phone: '+250788200002', subject: 'Physics', qualification: 'BSc Physics' },
      { username: 'teacher_ict', email: 'teacher_ict_2026@gardentvet.rw', first_name: 'David', last_name: 'Niyonkuru', phone: '+250788200003', subject: 'ICT & Programming', qualification: 'BSc Computer Science' },
      { username: 'teacher_english', email: 'teacher_english_2026@gardentvet.rw', first_name: 'Sarah', last_name: 'Keza', phone: '+250788200004', subject: 'English Language', qualification: 'BA English Literature' },
      { username: 'teacher_electrical', email: 'teacher_electrical_2026@gardentvet.rw', first_name: 'Jean Claude', last_name: 'Bizimana', phone: '+250788200005', subject: 'Electrical Engineering', qualification: 'Diploma Electrical Eng.' },
      { username: 'teacher_welding', email: 'teacher_welding_2026@gardentvet.rw', first_name: 'Robert', last_name: 'Ndizeye', phone: '+250788200006', subject: 'Welding & Fabrication', qualification: 'Certificate Welding Tech' },
      { username: 'teacher_plumbing', email: 'teacher_plumbing_2026@gardentvet.rw', first_name: 'Joseph', last_name: 'Nkusi', phone: '+250788200007', subject: 'Plumbing & Sanitation', qualification: 'Diploma Plumbing' },
      { username: 'teacher_carpentry', email: 'teacher_carpentry_2026@gardentvet.rw', first_name: 'Francis', last_name: 'Nshimiyimana', phone: '+250788200008', subject: 'Carpentry & Joinery', qualification: 'Certificate Carpentry' },
    ];

    console.log('\n👨‍🏫 Creating/Updating demo teachers...');
    for (const teacher of demoTeachers) {
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [teacher.username]
      );

      if (existing.length > 0) {
        await connection.execute(`
          UPDATE users 
          SET email = ?, password = ?, first_name = ?, last_name = ?, phone = ?, role_id = ?
          WHERE username = ?
        `, [teacher.email, hashedPassword, teacher.first_name, teacher.last_name, teacher.phone, roleMap['teacher'], teacher.username]);
        console.log(`✅ Updated: ${teacher.username} - ${teacher.first_name} ${teacher.last_name} (${teacher.subject})`);
      } else {
        await connection.execute(`
          INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, true)
        `, [teacher.username, teacher.email, hashedPassword, teacher.first_name, teacher.last_name, teacher.phone, roleMap['teacher']]);
        console.log(`✅ Created: ${teacher.username} - ${teacher.first_name} ${teacher.last_name} (${teacher.subject})`);
      }
    }

    // ==================== GENERATE SERIAL CODES ====================
    console.log('\n🎟️  Generating serial codes for demo students...');
    
    const generateSerialCode = (tradeCode, levelNumber, levelSuffix) => {
      const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
      const suffix = levelSuffix || '';
      return `${tradeCode}${levelNumber}${suffix}-${randomPart}`;
    };

    const serialCodes = [];
    const tradeLevels = [
      { trade_code: 'SOD', level_number: 4, level_suffix: 'A', count: 3 },
      { trade_code: 'SOD', level_number: 5, level_suffix: 'A', count: 2 },
      { trade_code: 'BDC', level_number: 4, level_suffix: 'A', count: 2 },
      { trade_code: 'AUT', level_number: 4, level_suffix: 'A', count: 2 },
      { trade_code: 'ICT', level_number: 1, level_suffix: 'A', count: 2 },
    ];

    // First, drop the foreign key constraint temporarily
    try {
      await connection.execute('ALTER TABLE student_serial_codes DROP FOREIGN KEY student_serial_codes_ibfk_1');
      console.log('✅ Dropped foreign key constraint for generated_by');
    } catch (e) {
      if (!e.message.includes('check that it exists')) {
        console.log('⚠️  Foreign key constraint may already be dropped');
      }
    }

    const dosUserId = adminStaffUsers.find(u => u.role === 'dos').username;
    const [dosUser] = await connection.execute('SELECT id FROM admin_users WHERE username = ?', [dosUserId]);
    const generatorId = dosUser[0].id;

    for (const level of tradeLevels) {
      for (let i = 0; i < level.count; i++) {
        const serialCode = generateSerialCode(level.trade_code, level.level_number, level.level_suffix);
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        
        await connection.execute(`
          INSERT INTO student_serial_codes (
            serial_code, trade_code, level_number, level_suffix,
            academic_year, generated_by, expires_at, notes, status, is_used
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', false)
        `, [
          serialCode,
          level.trade_code,
          level.level_number,
          level.level_suffix,
          '2025-2026',
          generatorId,
          expiresAt,
          `Demo serial code for ${level.trade_code}${level.level_number}${level.level_suffix}`
        ]);
        
        serialCodes.push({
          code: serialCode,
          trade: level.trade_code,
          level: level.level_number,
          suffix: level.level_suffix
        });
        console.log(`✅ Generated serial code: ${serialCode}`);
      }
    }

    // ==================== DEMO STUDENTS ====================
    console.log('\n👨‍🎓 Creating demo students with enrollment...');
    
    const demoStudents = [
      { 
        username: 'student_demo1', 
        email: 'student1_2026@gardentvet.rw', 
        first_name: 'Janvier', 
        last_name: 'Uwamahoro', 
        phone: '+250788300001',
        serialCode: serialCodes.find(s => s.trade === 'SOD' && s.level === 4),
        gender: 'Male',
        date_of_birth: '2005-03-15',
        address: 'Kigali, Gasabo, Remera'
      },
      { 
        username: 'student_demo2', 
        email: 'student2_2026@gardentvet.rw', 
        first_name: 'Diane', 
        last_name: 'Ishimwe', 
        phone: '+250788300002',
        serialCode: serialCodes.find((s, idx) => s.trade === 'SOD' && s.level === 4 && idx > 0),
        gender: 'Female',
        date_of_birth: '2006-07-20',
        address: 'Kigali, Kicukiro, Niboye'
      },
      { 
        username: 'student_demo3', 
        email: 'student3_2026@gardentvet.rw', 
        first_name: 'Patrick', 
        last_name: 'Nsengimana', 
        phone: '+250788300003',
        serialCode: serialCodes.find(s => s.trade === 'BDC' && s.level === 4),
        gender: 'Male',
        date_of_birth: '2005-11-10',
        address: 'Kigali, Nyarugenge, Nyabugogo'
      },
      { 
        username: 'student_demo4', 
        email: 'student4_2026@gardentvet.rw', 
        first_name: 'Grace', 
        last_name: 'Mukamana', 
        phone: '+250788300004',
        serialCode: serialCodes.find(s => s.trade === 'AUT' && s.level === 4),
        gender: 'Female',
        date_of_birth: '2006-01-25',
        address: 'Kigali, Gasabo, Kimironko'
      },
      { 
        username: 'student_demo5', 
        email: 'student5_2026@gardentvet.rw', 
        first_name: 'Eric', 
        last_name: 'Habimana', 
        phone: '+250788300005',
        serialCode: serialCodes.find(s => s.trade === 'ICT' && s.level === 1),
        gender: 'Male',
        date_of_birth: '2005-09-05',
        address: 'Kigali, Kicukiro, Gikondo'
      },
      { 
        username: 'student_demo6', 
        email: 'student6_2026@gardentvet.rw', 
        first_name: 'Yvonne', 
        last_name: 'Uwase', 
        phone: '+250788300006',
        serialCode: serialCodes.find(s => s.trade === 'SOD' && s.level === 5),
        gender: 'Female',
        date_of_birth: '2004-05-18',
        address: 'Kigali, Gasabo, Kacyiru'
      },
    ];

    for (const student of demoStudents) {
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [student.username]
      );

      if (existing.length === 0 && student.serialCode) {
        // Generate student ID
        const year = new Date().getFullYear();
        const studentCount = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [roleMap['student']]);
        const count = studentCount[0][0].count + 1;
        const studentId = `${year}${student.serialCode.trade}${student.serialCode.level}${student.serialCode.suffix}${String(count).padStart(3, '0')}`;

        // Create student user
        const [result] = await connection.execute(`
          INSERT INTO users (
            username, email, password, first_name, last_name, phone, role_id,
            student_id, gender, date_of_birth, address, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
        `, [
          student.username, student.email, hashedPassword, student.first_name, student.last_name,
          student.phone, roleMap['student'], studentId, student.gender, student.date_of_birth, student.address
        ]);

        const userId = result.insertId;

        // Try to find existing class and enroll if exists
        const [existingClass] = await connection.execute(`
          SELECT c.id, ay.id as academic_year_id
          FROM classes c
          CROSS JOIN academic_years ay
          WHERE ay.is_active = 1
          LIMIT 1
        `);

        if (existingClass.length > 0) {
          try {
            await connection.execute(`
              INSERT INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status)
              VALUES (?, ?, ?, CURDATE(), 'active')
              ON DUPLICATE KEY UPDATE status = 'active'
            `, [userId, existingClass[0].id, existingClass[0].academic_year_id]);
          } catch (enrollError) {
            // Skip enrollment if it fails - students can be enrolled manually later
          }
        }

        // Mark serial code as used
        await connection.execute(`
          UPDATE student_serial_codes 
          SET is_used = true, used_by = ?, used_at = NOW()
          WHERE serial_code = ?
        `, [userId, student.serialCode.code]);

        console.log(`✅ Created student: ${student.username} - ${student.first_name} ${student.last_name} (ID: ${studentId}, Trade: ${student.serialCode.trade}${student.serialCode.level}${student.serialCode.suffix})`);
      } else if (existing.length > 0) {
        console.log(`ℹ️  Student already exists: ${student.username}`);
      }
    }

    // ==================== DEMO PARENTS ====================
    console.log('\n👪 Creating demo parents linked to students...');
    
    const demoParents = [
      { 
        username: 'parent_demo1', 
        email: 'parent1_2026@gardentvet.rw', 
        first_name: 'Jean', 
        last_name: 'Uwamahoro', 
        phone: '+250788400001',
        studentUsername: 'student_demo1',
        relationship: 'Father',
        address: 'Kigali, Gasabo, Remera'
      },
      { 
        username: 'parent_demo2', 
        email: 'parent2_2026@gardentvet.rw', 
        first_name: 'Agnes', 
        last_name: 'Ishimwe', 
        phone: '+250788400002',
        studentUsername: 'student_demo2',
        relationship: 'Mother',
        address: 'Kigali, Kicukiro, Niboye'
      },
      { 
        username: 'parent_demo3', 
        email: 'parent3_2026@gardentvet.rw', 
        first_name: 'Paul', 
        last_name: 'Nsengimana', 
        phone: '+250788400003',
        studentUsername: 'student_demo3',
        relationship: 'Father',
        address: 'Kigali, Nyarugenge, Nyabugogo'
      },
      { 
        username: 'parent_demo4', 
        email: 'parent4_2026@gardentvet.rw', 
        first_name: 'Rose', 
        last_name: 'Mukamana', 
        phone: '+250788400004',
        studentUsername: 'student_demo4',
        relationship: 'Mother',
        address: 'Kigali, Gasabo, Kimironko'
      },
    ];

    for (const parent of demoParents) {
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [parent.username]
      );

      if (existing.length === 0) {
        // Create parent user
        const [result] = await connection.execute(`
          INSERT INTO users (username, email, password, first_name, last_name, phone, address, role_id, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
        `, [parent.username, parent.email, hashedPassword, parent.first_name, parent.last_name, parent.phone, parent.address, roleMap['parent']]);

        const parentUserId = result.insertId;

        // Link to student
        const [student] = await connection.execute('SELECT id FROM users WHERE username = ?', [parent.studentUsername]);
        if (student.length > 0) {
          await connection.execute(`
            INSERT INTO parent_student_links (parent_id, student_id, relationship)
            VALUES (?, ?, ?)
          `, [parentUserId, student[0].id, parent.relationship]);
          console.log(`✅ Created parent: ${parent.username} - ${parent.first_name} ${parent.last_name} (linked to ${parent.studentUsername})`);
        }
      } else {
        console.log(`ℹ️  Parent already exists: ${parent.username}`);
      }
    }

    // ==================== SUMMARY ====================
    console.log('\n\n📊 SETUP SUMMARY');
    console.log('=====================================');
    
    const [adminCount] = await connection.execute('SELECT role, COUNT(*) as count FROM admin_users GROUP BY role ORDER BY role');
    console.log('\n🔐 Admin Staff Users:');
    console.table(adminCount);

    const [userCount] = await connection.execute(`
      SELECT r.name as role, COUNT(*) as count 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      GROUP BY r.name 
      ORDER BY r.name
    `);
    console.log('\n👥 Regular Users:');
    console.table(userCount);

    const [serialCodeStats] = await connection.execute(`
      SELECT 
        trade_code,
        COUNT(*) as total,
        SUM(CASE WHEN is_used = false THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN is_used = true THEN 1 ELSE 0 END) as used
      FROM student_serial_codes
      GROUP BY trade_code
      ORDER BY trade_code
    `);
    console.log('\n🎟️  Serial Codes:');
    console.table(serialCodeStats);

    await connection.end();
    console.log('\n✅ Comprehensive demo user setup completed successfully!');
    console.log('\n📝 Default password for all users: 2026');
    
  } catch (error) {
    console.error('❌ Error setting up demo users:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupComprehensiveDemoUsers();

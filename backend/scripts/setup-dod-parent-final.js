const { pool } = require('../config/database');

async function setupDODParentManagement() {
  console.log('🚀 Setting up DOD Parent Management System...\n');

  try {
    // Create all tables
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS parent_student_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        student_code VARCHAR(50),
        relationship_type ENUM('father', 'mother', 'guardian', 'sibling', 'relative', 'other') DEFAULT 'guardian',
        is_primary_contact BOOLEAN DEFAULT FALSE,
        can_view_marks BOOLEAN DEFAULT TRUE,
        can_view_attendance BOOLEAN DEFAULT TRUE,
        can_view_discipline BOOLEAN DEFAULT TRUE,
        can_view_fees BOOLEAN DEFAULT TRUE,
        can_receive_sms BOOLEAN DEFAULT TRUE,
        can_receive_calls BOOLEAN DEFAULT TRUE,
        status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'active',
        linked_by VARCHAR(255),
        linked_by_role VARCHAR(50),
        linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        auto_linked BOOLEAN DEFAULT FALSE,
        verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_parent_student (parent_id, student_id),
        INDEX idx_parent_id (parent_id),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parent_student_links');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS parents_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        national_id VARCHAR(50),
        occupation VARCHAR(255),
        address TEXT,
        province VARCHAR(100),
        district VARCHAR(100),
        whatsapp_number VARCHAR(20),
        preferred_contact_method ENUM('sms', 'whatsapp', 'call', 'email') DEFAULT 'sms',
        preferred_language ENUM('kinyarwanda', 'english', 'french') DEFAULT 'kinyarwanda',
        children_in_school INT DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parents_info');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS level4_sod_students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL UNIQUE,
        student_code VARCHAR(50) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
        phone VARCHAR(20),
        email VARCHAR(255),
        trade_code VARCHAR(10) DEFAULT 'SOD',
        trade_name VARCHAR(100) DEFAULT 'Software Development',
        level_number INT DEFAULT 4,
        conduct_score INT DEFAULT 40,
        attendance_percentage DECIMAL(5,2) DEFAULT 100.00,
        average_grade DECIMAL(5,2) DEFAULT 0.00,
        linked_parent_id INT NULL,
        linked_parent_name VARCHAR(255),
        linked_parent_phone VARCHAR(20),
        linked_parent_relationship VARCHAR(50),
        auto_linked_at TIMESTAMP NULL,
        total_linked_parents INT DEFAULT 0,
        status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ level4_sod_students');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS parent_contact_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        contact_type ENUM('sms', 'whatsapp', 'call', 'email', 'meeting', 'other') NOT NULL,
        subject VARCHAR(255),
        message TEXT,
        category ENUM('conduct', 'leave', 'academic', 'fees', 'general', 'emergency') NOT NULL,
        initiated_by INT,
        initiated_by_name VARCHAR(255),
        initiated_by_role VARCHAR(50),
        delivery_status ENUM('pending', 'sent', 'delivered', 'failed', 'read') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_parent_id (parent_id),
        INDEX idx_student_id (student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parent_contact_history');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS parent_notifications_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notification_id VARCHAR(50) UNIQUE,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        notification_type ENUM('conduct_removed', 'leave_granted', 'academic_alert', 'fee_reminder', 'general', 'emergency') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        send_via SET('sms', 'whatsapp', 'email', 'push') DEFAULT 'sms',
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP NULL,
        delivery_status ENUM('queued', 'sending', 'sent', 'delivered', 'failed', 'cancelled') DEFAULT 'queued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_parent_id (parent_id),
        INDEX idx_delivery_status (delivery_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parent_notifications_queue');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS dod_actions_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action_id VARCHAR(50) UNIQUE,
        action_type ENUM('remove_conduct', 'grant_leave', 'add_conduct', 'revoke_leave', 'contact_parent', 'bulk_action') NOT NULL,
        student_id INT NOT NULL,
        student_code VARCHAR(50),
        student_name VARCHAR(255),
        performed_by INT NOT NULL,
        performed_by_name VARCHAR(255),
        performed_by_role VARCHAR(50),
        action_details JSON,
        parent_notified BOOLEAN DEFAULT FALSE,
        parents_notified_count INT DEFAULT 0,
        reason TEXT,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_action_type (action_type),
        INDEX idx_student_id (student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ dod_actions_log\n');

    // Insert sample Level 4 SOD students
    console.log('📊 Creating sample Level 4 SOD students...');
    
    const sampleStudents = [
      { first: 'Uwase', last: 'Marie', gender: 'Female', phone: '0788111001', email: 'uwase.marie@sod.rw' },
      { first: 'Mugisha', last: 'Jean', gender: 'Male', phone: '0788111002', email: 'mugisha.jean@sod.rw' },
      { first: 'Iradukunda', last: 'Grace', gender: 'Female', phone: '0788111003', email: 'iradukunda.grace@sod.rw' },
      { first: 'Niyonkuru', last: 'Patrick', gender: 'Male', phone: '0788111004', email: 'niyonkuru.patrick@sod.rw' },
      { first: 'Mukamana', last: 'Claudine', gender: 'Female', phone: '0788111005', email: 'mukamana.claudine@sod.rw' }
    ];

    for (const student of sampleStudents) {
      try {
        const [userResult] = await pool.execute(`
          INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, gender, is_active, created_at)
          VALUES (?, ?, ?, 'student', ?, ?, ?, ?, 1, NOW())
        `, [
          student.email.split('@')[0],
          student.email,
          '$2b$10$defaultstudentpasswordhash',
          student.first,
          student.last,
          student.phone,
          student.gender
        ]);

        const studentId = userResult.insertId;
        const studentCode = `SOD4-${String(studentId).padStart(4, '0')}`;

        await pool.execute(`
          INSERT INTO student_profiles (user_id, admission_number, enrollment_date)
          VALUES (?, ?, NOW())
        `, [studentId, studentCode]);

        await pool.execute(`
          INSERT INTO level4_sod_students (
            student_id, student_code, first_name, last_name, gender, phone, email,
            trade_code, trade_name, level_number, conduct_score, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'SOD', 'Software Development', 4, 40, 'active')
        `, [studentId, studentCode, student.first, student.last, student.gender, student.phone, student.email]);

        console.log(`   ✅ ${student.first} ${student.last} (${studentCode})`);
      } catch (err) {
        if (!err.message.includes('Duplicate entry')) {
          console.log(`   ⚠️  ${student.first} ${student.last} - ${err.message}`);
        }
      }
    }

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM level4_sod_students WHERE status = "active"'
    );
    console.log(`\n✅ Total Level 4 SOD students: ${count}\n`);

    console.log('✅ DOD Parent Management System setup complete!\n');
    console.log('📋 Summary:');
    console.log('   ✓ Parent-Student linking system');
    console.log('   ✓ Level 4 SOD students sheet');
    console.log('   ✓ Automatic parent linking');
    console.log('   ✓ Contact history tracking');
    console.log('   ✓ Notification queue system\n');

    console.log('🔗 API Endpoints:');
    console.log('   GET  /api/dod-parent-management/level4-sod-students');
    console.log('   GET  /api/dod-parent-management/parents');
    console.log('   POST /api/dod-parent-management/link-parent-student');
    console.log('   POST /api/dod-parent-management/auto-link-parent');
    console.log('   POST /api/dod-parent-management/contact-parent');
    console.log('   POST /api/dod-parent-management/contact-student-parents\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDODParentManagement();

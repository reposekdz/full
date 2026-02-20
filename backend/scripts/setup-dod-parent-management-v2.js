const { pool } = require('../config/database');

async function setupDODParentManagement() {
  console.log('🚀 Setting up DOD Parent Management System...\n');

  try {
    // Create parent_student_links table
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
        INDEX idx_status (status),
        INDEX idx_auto_linked (auto_linked),
        INDEX idx_is_primary (is_primary_contact)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parent_student_links table created');

    // Create parents_info table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS parents_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        national_id VARCHAR(50),
        occupation VARCHAR(255),
        workplace VARCHAR(255),
        address TEXT,
        province VARCHAR(100),
        district VARCHAR(100),
        sector VARCHAR(100),
        cell VARCHAR(100),
        village VARCHAR(100),
        emergency_contact VARCHAR(20),
        alternative_phone VARCHAR(20),
        whatsapp_number VARCHAR(20),
        preferred_contact_method ENUM('sms', 'whatsapp', 'call', 'email') DEFAULT 'sms',
        preferred_language ENUM('kinyarwanda', 'english', 'french') DEFAULT 'kinyarwanda',
        total_children INT DEFAULT 0,
        children_in_school INT DEFAULT 0,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_contact_date TIMESTAMP NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_national_id (national_id),
        INDEX idx_is_verified (is_verified)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parents_info table created');

    // Create level4_sod_students table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS level4_sod_students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL UNIQUE,
        student_code VARCHAR(50) NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        gender ENUM('Male', 'Female') NOT NULL,
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
        enrollment_date DATE,
        expected_graduation DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_student_code (student_code),
        INDEX idx_linked_parent_id (linked_parent_id),
        INDEX idx_status (status),
        INDEX idx_trade_level (trade_code, level_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ level4_sod_students table created');

    // Create parent_contact_history table
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
        response_received BOOLEAN DEFAULT FALSE,
        response_text TEXT,
        response_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_parent_id (parent_id),
        INDEX idx_student_id (student_id),
        INDEX idx_contact_type (contact_type),
        INDEX idx_category (category),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parent_contact_history table created');

    // Create parent_notifications_queue table
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
        delivery_attempts INT DEFAULT 0,
        last_attempt_at TIMESTAMP NULL,
        error_message TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_parent_id (parent_id),
        INDEX idx_student_id (student_id),
        INDEX idx_notification_type (notification_type),
        INDEX idx_delivery_status (delivery_status),
        INDEX idx_scheduled_at (scheduled_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parent_notifications_queue table created');

    // Create dod_actions_log table
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
        notification_ids JSON,
        reason TEXT,
        notes TEXT,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_action_type (action_type),
        INDEX idx_student_id (student_id),
        INDEX idx_performed_by (performed_by),
        INDEX idx_parent_notified (parent_notified),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ dod_actions_log table created');

    // Sync Level 4 SOD students
    console.log('\n📊 Syncing Level 4 SOD students...');
    await pool.execute(`
      INSERT INTO level4_sod_students (
        student_id, student_code, first_name, last_name, gender, phone, email,
        trade_code, trade_name, level_number, conduct_score, status
      )
      SELECT 
        u.id,
        COALESCE(sp.admission_number, CONCAT('SOD4-', u.id)),
        u.first_name,
        u.last_name,
        u.gender,
        u.phone,
        u.email,
        'SOD',
        'Software Development',
        4,
        40,
        'active'
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN enrollments e ON u.id = e.student_id
      WHERE u.role = 'student' 
        AND e.trade_code = 'SOD' 
        AND e.level_number = 4
        AND e.status = 'active'
      ON DUPLICATE KEY UPDATE 
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        gender = VALUES(gender),
        phone = VALUES(phone),
        email = VALUES(email),
        updated_at = NOW()
    `);

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM level4_sod_students WHERE status = "active"'
    );
    console.log(`✅ Synced ${count} Level 4 SOD students\n`);

    console.log('✅ DOD Parent Management System setup complete!\n');
    console.log('📋 Summary:');
    console.log('   - Parent-Student linking system ready');
    console.log('   - Level 4 SOD students sheet created');
    console.log('   - Automatic parent linking enabled');
    console.log('   - Contact history tracking active');
    console.log('   - Notification queue system ready\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupDODParentManagement();

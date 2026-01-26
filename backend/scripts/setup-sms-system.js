const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupSMSSystem() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  console.log('🚀 Setting up Advanced SMS Messaging System...\n');

  try {
    // Drop existing tables to recreate
    await connection.query('DROP TABLE IF EXISTS sms_delivery_reports');
    await connection.query('DROP TABLE IF EXISTS sms_campaigns');
    await connection.query('DROP TABLE IF EXISTS sms_templates');
    await connection.query('DROP TABLE IF EXISTS sms_messages');
    console.log('✅ Cleaned old tables');

    // Create SMS messages table
    await connection.query(`
      CREATE TABLE sms_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        recipient VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        sender_id INT NOT NULL,
        sender_role VARCHAR(50),
        status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
        provider VARCHAR(50) DEFAULT 'africastalking',
        delivery_method ENUM('sms', 'app', 'dual') DEFAULT 'sms',
        metadata JSON,
        response TEXT,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sender (sender_id),
        INDEX idx_recipient (recipient),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created sms_messages table');

    // Update parents table
    const [tables] = await connection.query("SHOW TABLES LIKE 'parents'");
    if (tables.length > 0) {
      await connection.query(`
        ALTER TABLE parents 
        ADD COLUMN IF NOT EXISTS has_smartphone BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS preferred_contact_method ENUM('sms', 'app', 'dual') DEFAULT 'sms',
        ADD COLUMN IF NOT EXISTS last_sms_received TIMESTAMP NULL,
        ADD COLUMN IF NOT EXISTS sms_opt_out BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Updated parents table');
    }

    // Create SMS templates table
    await connection.query(`
      CREATE TABLE sms_templates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        template_category VARCHAR(50) NOT NULL,
        message_template TEXT NOT NULL,
        variables JSON,
        created_by INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        usage_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created sms_templates table');

    // Insert templates
    await connection.query(`
      INSERT INTO sms_templates (name, template_category, message_template, variables, created_by) VALUES
      ('Student Absence', 'academic', 'Dear Parent, your child {student_name} was absent on {date}. Contact school if unexpected.', '["student_name", "date"]', 1),
      ('Fee Reminder', 'finance', 'School fees of {amount} RWF for {student_name} due by {due_date}. Thank you.', '["student_name", "amount", "due_date"]', 1),
      ('Exam Results', 'academic', '{student_name} scored {marks}% in {subject}. Position: {position}. Well done!', '["student_name", "marks", "subject", "position"]', 1),
      ('Discipline Notice', 'discipline', 'Need to discuss {student_name} behavior. Contact Director of Discipline.', '["student_name"]', 1),
      ('Emergency Alert', 'emergency', 'URGENT: {message}. Contact school immediately.', '["message"]', 1),
      ('Meeting Invitation', 'general', 'Parents meeting on {date} at {time}. Venue: {location}.', '["date", "time", "location"]', 1),
      ('Achievement', 'academic', 'Congratulations! {student_name} achieved {achievement}!', '["student_name", "achievement"]', 1),
      ('Payment Received', 'finance', 'Payment of {amount} RWF received for {student_name}. Balance: {balance} RWF.', '["student_name", "amount", "balance"]', 1),
      ('Class Announcement', 'general', 'Class {class_name}: {announcement}', '["class_name", "announcement"]', 1),
      ('Report Card Ready', 'academic', '{student_name} report card ready. Collect from school office.', '["student_name"]', 1)
    `);
    console.log('✅ Inserted 10 message templates');

    // Create SMS campaigns table
    await connection.query(`
      CREATE TABLE sms_campaigns (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        target_audience ENUM('all', 'class', 'grade', 'custom', 'smartphone', 'non-smartphone') NOT NULL,
        target_filter JSON,
        total_recipients INT DEFAULT 0,
        sent_count INT DEFAULT 0,
        failed_count INT DEFAULT 0,
        created_by INT NOT NULL,
        created_by_role VARCHAR(50),
        status ENUM('draft', 'scheduled', 'sending', 'completed', 'cancelled') DEFAULT 'draft',
        scheduled_at TIMESTAMP NULL,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created sms_campaigns table');

    // Create role permissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sms_role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role VARCHAR(50) NOT NULL UNIQUE,
        can_send_single BOOLEAN DEFAULT TRUE,
        can_send_bulk BOOLEAN DEFAULT TRUE,
        can_send_class BOOLEAN DEFAULT TRUE,
        can_send_all BOOLEAN DEFAULT FALSE,
        can_view_history BOOLEAN DEFAULT TRUE,
        can_view_stats BOOLEAN DEFAULT TRUE,
        can_create_templates BOOLEAN DEFAULT FALSE,
        can_create_campaigns BOOLEAN DEFAULT FALSE,
        daily_limit INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created sms_role_permissions table');

    // Insert role permissions
    await connection.query(`
      INSERT INTO sms_role_permissions (role, can_send_all, can_create_templates, can_create_campaigns, daily_limit) VALUES
      ('admin', TRUE, TRUE, TRUE, 1000),
      ('director', TRUE, TRUE, TRUE, 1000),
      ('dos', TRUE, TRUE, TRUE, 500),
      ('dod', TRUE, TRUE, TRUE, 500),
      ('teacher', FALSE, FALSE, FALSE, 100),
      ('class_teacher', FALSE, FALSE, FALSE, 200),
      ('accountant', FALSE, TRUE, FALSE, 300),
      ('secretary', FALSE, FALSE, FALSE, 200),
      ('advisor', FALSE, FALSE, FALSE, 150)
    `);
    console.log('✅ Configured role permissions');

    // Create message queue table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sms_queue (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        message TEXT NOT NULL,
        sender_id INT NOT NULL,
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        scheduled_at TIMESTAMP NULL,
        status ENUM('pending', 'processing', 'sent', 'failed') DEFAULT 'pending',
        attempts INT DEFAULT 0,
        max_attempts INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_scheduled (scheduled_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created sms_queue table');

    console.log('\n✅ Advanced SMS System setup completed!\n');
    console.log('📋 Summary:');
    console.log('   ✓ SMS messages tracking');
    console.log('   ✓ 10 message templates');
    console.log('   ✓ Campaign management');
    console.log('   ✓ Role-based permissions');
    console.log('   ✓ Message queue system');
    console.log('   ✓ Parents smartphone tracking');
    console.log('\n🔑 API: atsk_d53924f3401f197002d867a93dd86ac7404952e2062869c26090eebd4e09955ffd1a8013');
    console.log('📡 Provider: Africa\'s Talking');
    console.log('\n👥 All Roles Enabled:');
    console.log('   • Admin (1000 msgs/day)');
    console.log('   • Director (1000 msgs/day)');
    console.log('   • DOS (500 msgs/day)');
    console.log('   • DOD (500 msgs/day)');
    console.log('   • Teacher (100 msgs/day)');
    console.log('   • Class Teacher (200 msgs/day)');
    console.log('   • Accountant (300 msgs/day)');
    console.log('   • Secretary (200 msgs/day)');
    console.log('   • Advisor (150 msgs/day)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

setupSMSSystem();

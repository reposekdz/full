import mysql from 'mysql2/promise';

async function setupCompleteTables() {
  console.log('🚀 Setting up Complete Parent System Tables...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
    multipleStatements: true
  });

  try {
    // 1. Parent linking applications table
    console.log('📊 Creating parent_linking_applications table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_linking_applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        child_first_name VARCHAR(100) NOT NULL,
        child_last_name VARCHAR(100) NOT NULL,
        child_gender ENUM('Male', 'Female') NOT NULL,
        child_trade_code VARCHAR(10) NOT NULL,
        child_level_number INT NOT NULL,
        relationship_type VARCHAR(20) DEFAULT 'parent',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        reviewed_by INT NULL,
        reviewed_at DATETIME NULL,
        rejection_reason TEXT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_parent_id (parent_id),
        INDEX idx_status (status),
        INDEX idx_submitted_at (submitted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Add relationship_type if missing
    await connection.execute(`
      ALTER TABLE parent_linking_applications 
      ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(20) DEFAULT 'parent'
    `).catch(() => console.log('   relationship_type already exists'));
    
    console.log('✅ parent_linking_applications created\n');

    // 2. Parent child links table
    console.log('📊 Creating parent_child_links table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_child_links (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        linked_by INT NOT NULL,
        linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        permissions JSON NULL,
        relationship_type VARCHAR(20) DEFAULT 'parent',
        INDEX idx_parent_id (parent_id),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        UNIQUE KEY unique_link (parent_id, student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✅ parent_child_links created\n');

    // 3. Parent linking audit log
    console.log('📊 Creating parent_linking_audit_log table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_linking_audit_log (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_id INT NULL,
        action VARCHAR(50) NOT NULL,
        performed_by INT NOT NULL,
        details JSON NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id),
        INDEX idx_performed_by (performed_by),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✅ parent_linking_audit_log created\n');

    // 4. Parent message history
    console.log('📊 Creating parent_message_history table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_message_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT NULL,
        message TEXT NOT NULL,
        sent_by INT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_type VARCHAR(50) DEFAULT 'custom',
        INDEX idx_parent_id (parent_id),
        INDEX idx_student_id (student_id),
        INDEX idx_sent_at (sent_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✅ parent_message_history created\n');

    // 5. Enhance sms_logs
    console.log('📊 Enhancing sms_logs table...');
    await connection.execute(`
      ALTER TABLE sms_logs 
      ADD COLUMN IF NOT EXISTS sent_by INT NULL,
      ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) NULL,
      ADD COLUMN IF NOT EXISTS student_id INT NULL,
      ADD COLUMN IF NOT EXISTS parent_id INT NULL
    `).catch(() => console.log('   Columns already exist'));
    console.log('✅ sms_logs enhanced\n');

    console.log('🎉 SUCCESS! All tables created!\n');
    console.log('📱 System Features:');
    console.log('   ✅ Parent registration with SMS');
    console.log('   ✅ Application approval/rejection');
    console.log('   ✅ Quick linking');
    console.log('   ✅ Custom messaging');
    console.log('   ✅ Bulk operations');
    console.log('   ✅ Message history');
    console.log('   ✅ Audit trail\n');
    console.log('🚀 Restart backend: cd backend && npm start\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupCompleteTables();

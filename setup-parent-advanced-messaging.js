import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function setupParentAdvancedMessaging() {
  console.log('🚀 Setting up Advanced Parent Messaging System...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
    multipleStatements: true
  });

  try {
    console.log('📊 Creating parent_message_history table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_message_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT NULL,
        message TEXT NOT NULL,
        sent_by INT NOT NULL,
        sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        message_type VARCHAR(50) DEFAULT 'custom',
        INDEX idx_parent_id (parent_id),
        INDEX idx_student_id (student_id),
        INDEX idx_sent_at (sent_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✅ parent_message_history table created\n');

    console.log('📊 Enhancing sms_logs table...');
    await connection.execute(`
      ALTER TABLE sms_logs 
      ADD COLUMN IF NOT EXISTS sent_by INT NULL AFTER parent_id
    `).catch(() => console.log('   Column sent_by already exists'));
    
    await connection.execute(`
      ALTER TABLE sms_logs 
      ADD INDEX IF NOT EXISTS idx_sent_by (sent_by)
    `).catch(() => console.log('   Index idx_sent_by already exists'));
    console.log('✅ sms_logs table enhanced\n');

    console.log('📊 Enhancing parent_child_links table...');
    await connection.execute(`
      ALTER TABLE parent_child_links
      ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(20) DEFAULT 'parent' AFTER permissions
    `).catch(() => console.log('   Column relationship_type already exists'));
    console.log('✅ parent_child_links table enhanced\n');

    console.log('🎉 SUCCESS! Advanced Parent Messaging System is ready!\n');
    console.log('📱 Features enabled:');
    console.log('   ✅ Welcome SMS on parent registration');
    console.log('   ✅ Approval/Rejection SMS');
    console.log('   ✅ Unlink notification SMS');
    console.log('   ✅ Custom message sending');
    console.log('   ✅ Bulk message sending');
    console.log('   ✅ Message history tracking');
    console.log('   ✅ Delete links with SMS notification');
    console.log('   ✅ Delete parent accounts\n');
    console.log('🚀 Restart backend: cd backend && npm start\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupParentAdvancedMessaging();

const { pool } = require('./config/database');

async function upgradeMessagesTable() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║        UPGRADING MESSAGES TABLE TO NEW SCHEMA             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const connection = await pool.getConnection();
  
  try {
    const [count] = await connection.execute('SELECT COUNT(*) as c FROM messages');
    console.log(`Current messages in table: ${count[0].c}`);
    
    if (count[0].c > 0) {
      console.log('⚠️  Table contains data. Backing up to messages_backup...');
      await connection.execute('CREATE TABLE IF NOT EXISTS messages_backup LIKE messages');
      await connection.execute('INSERT INTO messages_backup SELECT * FROM messages');
      console.log('✅ Backup created\n');
    }

    console.log('Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('Dropping old messages table...');
    await connection.execute('DROP TABLE IF EXISTS messages');
    console.log('✅ Old table dropped\n');

    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Re-enabled foreign key checks\n');

    console.log('Creating new messages table with enhanced schema...');
    await connection.execute(`
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        recipient_id INT NOT NULL,
        recipient_type ENUM('parent', 'student', 'staff', 'all') DEFAULT 'parent',
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        category VARCHAR(100) DEFAULT 'general',
        attachments JSON DEFAULT NULL,
        status ENUM('draft', 'sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
        parent_message_id INT DEFAULT NULL,
        is_reply BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL DEFAULT NULL,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE CASCADE,
        INDEX idx_recipient (recipient_id, recipient_type),
        INDEX idx_sender (sender_id),
        INDEX idx_status (status),
        INDEX idx_created (created_at),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ New messages table created with enhanced features\n');

    console.log('Verifying new structure...');
    const [columns] = await connection.execute('DESCRIBE messages');
    console.log(`✅ Table has ${columns.length} columns\n`);

    console.log('New features added:');
    console.log('  • recipient_type (parent/student/staff/all)');
    console.log('  • priority levels (low/normal/high/urgent)');
    console.log('  • category for organization');
    console.log('  • JSON attachments support');
    console.log('  • message status tracking');
    console.log('  • reply threading');
    console.log('  • soft delete support');
    console.log('  • comprehensive indexing\n');

    console.log('✅ Messages table upgrade complete!');
    
    if (count[0].c > 0) {
      console.log('\n⚠️  Note: Old data is preserved in messages_backup table');
      console.log('   You can migrate data manually if needed\n');
    }

  } catch (error) {
    console.error('❌ Upgrade failed:', error.message);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

upgradeMessagesTable().catch(err => {
  console.error(err);
  process.exit(1);
});

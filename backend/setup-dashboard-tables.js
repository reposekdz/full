const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTables() {
  console.log('Setting up database tables for enhanced dashboards...');
  
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database:', process.env.DB_NAME);

    // Create notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_read (user_id, is_read)
      )
    `);
    console.log('✓ Created/verified notifications table');

    // Create activity_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(100),
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_date (user_id, created_at)
      )
    `);
    console.log('✓ Created/verified activity_logs table');

    // Create system_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(100),
        setting_key VARCHAR(100) UNIQUE,
        setting_value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created/verified system_settings table');

    // Create leave_requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        leave_type VARCHAR(50),
        start_date DATE,
        end_date DATE,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        approved_by INT,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student_status (student_id, status)
      )
    `);
    console.log('✓ Created/verified leave_requests table');

    // Create messages table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        recipient_id INT,
        recipient_role VARCHAR(50),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'sent',
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_recipient (recipient_id, status),
        INDEX idx_sender (sender_id)
      )
    `);
    console.log('✓ Created/verified messages table');

    console.log('\n✓ All database tables created successfully!');
    
  } catch (error) {
    console.error('✗ Database setup error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupTables();

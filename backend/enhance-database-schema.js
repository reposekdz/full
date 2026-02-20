const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garden_tvet',
  waitForConnections: true,
  connectionLimit: 10
});

async function enhanceDatabase() {
  console.log('🚀 Enhancing Database Schema...\n');

  const enhancements = [
    // Real-time notifications
    `CREATE TABLE IF NOT EXISTS realtime_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      data JSON,
      is_read BOOLEAN DEFAULT FALSE,
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read_at TIMESTAMP NULL,
      INDEX idx_user_unread (user_id, is_read),
      INDEX idx_created (created_at)
    )`,

    // Activity logs
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT,
      details JSON,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_created (created_at)
    )`,

    // Analytics data
    `CREATE TABLE IF NOT EXISTS analytics_events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      event_type VARCHAR(100) NOT NULL,
      user_id INT,
      session_id VARCHAR(100),
      page_url VARCHAR(500),
      event_data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_type (event_type),
      INDEX idx_user (user_id),
      INDEX idx_session (session_id),
      INDEX idx_created (created_at)
    )`,

    // File attachments
    `CREATE TABLE IF NOT EXISTS file_attachments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_type VARCHAR(100),
      file_size INT,
      uploaded_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_entity (entity_type, entity_id)
    )`,

    // Comments system
    `CREATE TABLE IF NOT EXISTS comments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT NOT NULL,
      user_id INT NOT NULL,
      comment TEXT NOT NULL,
      parent_id INT NULL,
      is_edited BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_user (user_id),
      INDEX idx_parent (parent_id)
    )`,

    // Tags system
    `CREATE TABLE IF NOT EXISTS tags (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      color VARCHAR(7) DEFAULT '#3B82F6',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS entity_tags (
      id INT PRIMARY KEY AUTO_INCREMENT,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT NOT NULL,
      tag_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_tag (entity_type, entity_id, tag_id),
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_tag (tag_id)
    )`,

    // Favorites/Bookmarks
    `CREATE TABLE IF NOT EXISTS favorites (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_favorite (user_id, entity_type, entity_id),
      INDEX idx_user (user_id)
    )`,

    // Settings
    `CREATE TABLE IF NOT EXISTS user_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL UNIQUE,
      theme VARCHAR(20) DEFAULT 'light',
      language VARCHAR(10) DEFAULT 'en',
      notifications_enabled BOOLEAN DEFAULT TRUE,
      email_notifications BOOLEAN DEFAULT TRUE,
      sms_notifications BOOLEAN DEFAULT TRUE,
      settings_data JSON,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Sessions
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      session_token VARCHAR(255) NOT NULL UNIQUE,
      device_info JSON,
      ip_address VARCHAR(45),
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_token (session_token),
      INDEX idx_expires (expires_at)
    )`,

    // API keys
    `CREATE TABLE IF NOT EXISTS api_keys (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      key_name VARCHAR(100) NOT NULL,
      api_key VARCHAR(255) NOT NULL UNIQUE,
      permissions JSON,
      is_active BOOLEAN DEFAULT TRUE,
      last_used_at TIMESTAMP NULL,
      expires_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_key (api_key)
    )`,

    // Webhooks
    `CREATE TABLE IF NOT EXISTS webhooks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      url VARCHAR(500) NOT NULL,
      events JSON NOT NULL,
      secret VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_active (is_active)
    )`,

    `CREATE TABLE IF NOT EXISTS webhook_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      webhook_id INT NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      payload JSON,
      response_code INT,
      response_body TEXT,
      error TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_webhook (webhook_id),
      INDEX idx_created (created_at)
    )`,

    // Scheduled tasks
    `CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      task_name VARCHAR(100) NOT NULL,
      task_type VARCHAR(50) NOT NULL,
      schedule_cron VARCHAR(100),
      task_data JSON,
      is_active BOOLEAN DEFAULT TRUE,
      last_run_at TIMESTAMP NULL,
      next_run_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_active (is_active),
      INDEX idx_next_run (next_run_at)
    )`,

    // Audit trail
    `CREATE TABLE IF NOT EXISTS audit_trail (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      action VARCHAR(100) NOT NULL,
      table_name VARCHAR(100) NOT NULL,
      record_id INT,
      old_values JSON,
      new_values JSON,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_table (table_name, record_id),
      INDEX idx_created (created_at)
    )`,

    // Cache
    `CREATE TABLE IF NOT EXISTS cache_entries (
      cache_key VARCHAR(255) PRIMARY KEY,
      cache_value LONGTEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_expires (expires_at)
    )`,

    // Feature flags
    `CREATE TABLE IF NOT EXISTS feature_flags (
      id INT PRIMARY KEY AUTO_INCREMENT,
      flag_name VARCHAR(100) NOT NULL UNIQUE,
      is_enabled BOOLEAN DEFAULT FALSE,
      description TEXT,
      rollout_percentage INT DEFAULT 0,
      target_users JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (const sql of enhancements) {
      await pool.query(sql);
      console.log('✅ Created/Updated table');
    }

    console.log('\n✨ Database schema enhanced successfully!');
    console.log('📊 Added 17 new advanced tables');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

enhanceDatabase();

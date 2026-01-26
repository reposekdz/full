const db = require('../config/database');

async function setupUnifiedIntegration() {
  console.log('🚀 Setting up Unified Integration System...\n');

  try {
    // User Activities Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(100),
        module VARCHAR(50),
        details JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_module (module),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ User activities table created');

    // Announcements Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        content TEXT,
        target_role VARCHAR(50),
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        INDEX idx_role (target_role),
        INDEX idx_active (active)
      )
    `);
    console.log('✅ Announcements table created');

    // Events Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        description TEXT,
        start_date DATETIME,
        end_date DATETIME,
        location VARCHAR(255),
        event_type VARCHAR(50),
        organizer_id INT,
        status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_dates (start_date, end_date),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Events table created');

    // Search History Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        query VARCHAR(255),
        filters JSON,
        results_count INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ Search history table created');

    // Trending Searches Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS trending_searches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        query VARCHAR(255) UNIQUE,
        search_count INT DEFAULT 1,
        last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_count (search_count),
        INDEX idx_last (last_searched)
      )
    `);
    console.log('✅ Trending searches table created');

    // System Logs Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        level ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
        module VARCHAR(50),
        message TEXT,
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_level (level),
        INDEX idx_module (module),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ System logs table created');

    // Bookmarks Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        item_type VARCHAR(50),
        item_id INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bookmark (user_id, item_type, item_id),
        INDEX idx_user (user_id)
      )
    `);
    console.log('✅ Bookmarks table created');

    // Quick Links Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS quick_links (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        title VARCHAR(100),
        url VARCHAR(255),
        icon VARCHAR(50),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      )
    `);
    console.log('✅ Quick links table created');

    // Insert sample data
    await db.pool.query(`
      INSERT IGNORE INTO announcements (title, content, priority) VALUES
      ('Welcome to New Academic Year', 'We are excited to welcome all students to the new academic year!', 'high'),
      ('Exam Schedule Released', 'The final exam schedule has been published. Check your dashboard.', 'urgent'),
      ('Staff Meeting Tomorrow', 'All staff members are required to attend the meeting at 10 AM.', 'medium')
    `);
    console.log('✅ Sample announcements added');

    await db.pool.query(`
      INSERT IGNORE INTO events (title, description, start_date, end_date, location, event_type) VALUES
      ('Sports Day 2024', 'Annual sports competition for all students', '2024-06-15 08:00:00', '2024-06-15 17:00:00', 'Main Stadium', 'sports'),
      ('Science Fair', 'Student science project exhibition', '2024-07-20 09:00:00', '2024-07-20 16:00:00', 'Science Lab', 'academic'),
      ('Parent-Teacher Meeting', 'Quarterly parent-teacher conference', '2024-05-10 14:00:00', '2024-05-10 18:00:00', 'Main Hall', 'meeting')
    `);
    console.log('✅ Sample events added');

    console.log('\n✨ Unified Integration System setup complete!');
    console.log('📊 All tables created and sample data inserted');
    
  } catch (error) {
    console.error('❌ Error setting up unified integration:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupUnifiedIntegration()
    .then(() => {
      console.log('\n✅ Setup completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupUnifiedIntegration;

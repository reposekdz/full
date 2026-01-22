const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

async function setupHomeContentTables() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🏠 Setting up home content management tables...');

    // Home Features Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS home_features (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title_en VARCHAR(255) NOT NULL,
        title_rw VARCHAR(255) NOT NULL,
        description_en TEXT,
        description_rw TEXT,
        icon VARCHAR(100),
        color VARCHAR(50),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Testimonials Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        message_en TEXT NOT NULL,
        message_rw TEXT NOT NULL,
        avatar_url VARCHAR(500),
        rating INT DEFAULT 5,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Announcements Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title_en VARCHAR(255) NOT NULL,
        title_rw VARCHAR(255) NOT NULL,
        content_en TEXT NOT NULL,
        content_rw TEXT NOT NULL,
        type ENUM('general', 'academic', 'sports', 'event', 'urgent') DEFAULT 'general',
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        expires_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Home content tables created successfully');
    
  } catch (error) {
    console.error('❌ Error setting up home content tables:', error);
    throw error;
  } finally {
    connection.release();
  }
}

setupHomeContentTables()
  .then(() => {
    console.log('✅ Setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });

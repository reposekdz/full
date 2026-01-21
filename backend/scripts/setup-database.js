const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('📋 Connecting to database...');
    
    // Connect directly to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log(`✅ Connected to '${process.env.DB_NAME}' database`);
    
    // Create news_articles table manually to fix the immediate issue
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS news_articles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          content TEXT,
          image_url VARCHAR(500),
          author VARCHAR(100),
          category VARCHAR(50),
          publish_date DATE,
          is_featured BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ news_articles table created/verified');
    } catch (error) {
      console.log('⚠️  news_articles table warning:', error.message);
    }

    // Create other essential tables
    const tables = [
      {
        name: 'slides',
        sql: `CREATE TABLE IF NOT EXISTS slides (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle TEXT,
          description TEXT,
          image_url VARCHAR(500),
          button_text VARCHAR(100),
          button_link VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'testimonials',
        sql: `CREATE TABLE IF NOT EXISTS testimonials (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          role VARCHAR(100),
          avatar VARCHAR(10),
          quote TEXT NOT NULL,
          rating INT DEFAULT 5,
          is_active BOOLEAN DEFAULT true,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'school_stats',
        sql: `CREATE TABLE IF NOT EXISTS school_stats (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stat_key VARCHAR(50) NOT NULL UNIQUE,
          value VARCHAR(20) NOT NULL,
          label VARCHAR(100) NOT NULL,
          icon VARCHAR(50),
          color VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'achievements',
        sql: `CREATE TABLE IF NOT EXISTS achievements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          year VARCHAR(4),
          image_url VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      }
    ];

    for (const table of tables) {
      try {
        await connection.execute(table.sql);
        console.log(`✅ ${table.name} table created/verified`);
      } catch (error) {
        console.log(`⚠️  ${table.name} table warning:`, error.message);
      }
    }
    
    console.log('✅ Database tables created/verified');
    
    // Verify news_articles table structure
    const [columns] = await connection.execute('DESCRIBE news_articles');
    console.log('📊 news_articles table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
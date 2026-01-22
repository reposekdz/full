const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupEnhancedTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const tables = [
    `CREATE TABLE IF NOT EXISTS services (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title_rw VARCHAR(200),
      title_en VARCHAR(200),
      title_fr VARCHAR(200),
      description_rw TEXT,
      description_en TEXT,
      description_fr TEXT,
      category VARCHAR(50),
      icon VARCHAR(255),
      display_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS service_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      service_id INT,
      title_rw VARCHAR(200),
      title_en VARCHAR(200),
      title_fr VARCHAR(200),
      description_rw TEXT,
      description_en TEXT,
      description_fr TEXT,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id)
    )`,
    `CREATE TABLE IF NOT EXISTS chat_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      session_id VARCHAR(100) UNIQUE,
      visitor_name VARCHAR(100),
      visitor_email VARCHAR(100),
      status ENUM('active','closed') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      closed_at TIMESTAMP NULL
    )`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id INT PRIMARY KEY AUTO_INCREMENT,
      session_id VARCHAR(100),
      sender_type ENUM('visitor','staff') DEFAULT 'visitor',
      sender_name VARCHAR(100),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS trade_facilities (
      id INT PRIMARY KEY AUTO_INCREMENT,
      trade_code VARCHAR(10),
      name_rw VARCHAR(200),
      name_en VARCHAR(200),
      name_fr VARCHAR(200),
      description_rw TEXT,
      description_en TEXT,
      description_fr TEXT,
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const table of tables) {
    try {
      await connection.query(table);
    } catch (error) {
      console.log('Table exists:', error.message);
    }
  }

  await connection.query(`
    INSERT INTO services (title_rw, title_en, title_fr, description_rw, description_en, description_fr, category, display_order) VALUES
    ('Amasomo', 'Academic Programs', 'Programmes Academiques', 'Amasomo yihariye mu buhanga', 'Specialized technical programs', 'Programmes techniques specialises', 'education', 1),
    ('Ubufasha', 'Student Support', 'Soutien aux Etudiants', 'Ubufasha bwabanyeshuri', 'Comprehensive student support', 'Soutien complet aux etudiants', 'support', 2),
    ('Ibikorwa', 'Facilities', 'Installations', 'Ibikoresho bigezweho', 'Modern facilities', 'Installations modernes', 'facilities', 3)
    ON DUPLICATE KEY UPDATE title_rw = VALUES(title_rw)
  `);

  console.log('✅ Enhanced tables setup complete');
  await connection.end();
}

setupEnhancedTables().catch(console.error);

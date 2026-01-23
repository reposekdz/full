const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupLeadershipTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Drop existing table
    await connection.execute('DROP TABLE IF EXISTS leadership');
    console.log('✅ Dropped old leadership table');

    // Create comprehensive leadership table
    const createTableQuery = `
      CREATE TABLE leadership (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        biography_rw TEXT,
        biography_en TEXT,
        email VARCHAR(255),
        phone VARCHAR(50),
        office_location VARCHAR(255),
        image_url VARCHAR(500),
        qualifications JSON,
        experience_years INT,
        specialization TEXT,
        achievements JSON,
        responsibilities JSON,
        social_media JSON,
        office_hours VARCHAR(255),
        status ENUM('active', 'inactive') DEFAULT 'active',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);
    console.log('✅ Created leadership table with advanced features');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupLeadershipTable();

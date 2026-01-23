const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAdminTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Connected to database');

    // Notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        target ENUM('all', 'students', 'teachers', 'parents') DEFAULT 'all',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_target (target),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Notifications table created');

    // System settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        school_name VARCHAR(255) DEFAULT 'Garden TVET School',
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        academic_year VARCHAR(20),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Check if default settings exist
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM system_settings WHERE id = 1');
    if (existing[0].count === 0) {
      await connection.execute(`
        INSERT INTO system_settings (id, school_name, email, phone, address, academic_year)
        VALUES (1, 'Garden TVET School', 'info@gardentvet.rw', '+250788000000', 'Kigali, Rwanda', '2024-2025')
      `);
    }
    console.log('✅ System settings table created');

    // Security logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        action VARCHAR(100) NOT NULL,
        user VARCHAR(255),
        ip_address VARCHAR(45),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_action (action),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Security logs table created');

    // Backups table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS backups (
        id INT PRIMARY KEY AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL,
        size BIGINT DEFAULT 0,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Backups table created');

    console.log('\n🎉 Admin tables setup complete!');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupAdminTables();

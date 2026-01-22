const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupStaffAndLinking() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  // Create parent-student linking table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS parent_student_links (
      id INT PRIMARY KEY AUTO_INCREMENT,
      parent_id INT,
      student_code VARCHAR(50),
      student_name VARCHAR(200),
      student_class VARCHAR(100),
      trade VARCHAR(50),
      year INT,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      link_code VARCHAR(10),
      linked_student_id INT NULL,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL,
      approved_by INT NULL,
      FOREIGN KEY (parent_id) REFERENCES users(id),
      FOREIGN KEY (linked_student_id) REFERENCES users(id)
    )
  `);

  // Create staff table with credentials
  await connection.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(100) UNIQUE,
      password_hash VARCHAR(255),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(50),
      department VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert staff credentials
  const staffPassword = await bcrypt.hash('2025', 10);
  await connection.query(`
    INSERT INTO staff (email, password_hash, first_name, last_name, role, department) VALUES
    ('repose@gmail.com', ?, 'Repose', 'Admin', 'admin', 'Administration'),
    ('dos@school.rw', ?, 'Director', 'Studies', 'dos', 'Academic'),
    ('dod@school.rw', ?, 'Director', 'Discipline', 'dod', 'Discipline'),
    ('headmaster@school.rw', ?, 'Head', 'Master', 'headmaster', 'Administration')
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
  `, [staffPassword, staffPassword, staffPassword, staffPassword]);

  // Create student discipline records table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS discipline_records (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      incident_type VARCHAR(100),
      description TEXT,
      severity ENUM('minor','moderate','major','critical') DEFAULT 'moderate',
      action_taken TEXT,
      recorded_by INT,
      incident_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // Create student achievements/winnings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_achievements (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      achievement_type VARCHAR(100),
      title VARCHAR(200),
      description TEXT,
      category ENUM('academic','sports','arts','leadership','other') DEFAULT 'other',
      achievement_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Staff credentials and parent-student linking system setup complete');
  console.log('📧 Staff Login: repose@gmail.com / 2025');
  await connection.end();
}

setupStaffAndLinking().catch(console.error);

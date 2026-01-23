const { pool } = require('../config/database');

async function setupStudentManagementSystem() {
  try {
    // Students table with auto-generated codes
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        password VARCHAR(255) NOT NULL,
        trade VARCHAR(50) NOT NULL,
        level VARCHAR(10) NOT NULL,
        year INT NOT NULL,
        phone VARCHAR(20),
        parent_id INT,
        class_id INT,
        status VARCHAR(20) DEFAULT 'active',
        added_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (added_by) REFERENCES users(id)
      )
    `);

    // Teachers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        subject VARCHAR(100),
        qualification VARCHAR(200),
        experience_years INT,
        added_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (added_by) REFERENCES users(id)
      )
    `);

    // Student sheets (visible to DOS, Head Master, Admin)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS student_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        trade VARCHAR(50),
        level VARCHAR(10),
        class_name VARCHAR(100),
        academic_year INT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Parent sheets
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS parent_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        relationship VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    // Notifications for new registrations
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS registration_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        user_type VARCHAR(20),
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        notified_roles TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Student management system tables created successfully');
  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    process.exit();
  }
}

setupStudentManagementSystem();

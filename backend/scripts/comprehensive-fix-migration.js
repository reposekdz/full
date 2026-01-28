const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('Starting comprehensive migration...');

  try {
    // 1. Ensure students table exists if it's used elsewhere, 
    // but the user said "every class with students with codes,names,serial codes,etc..."
    // In our system, 'users' with role 'student' are students.
    // However, some routes use 'students' table. Let's create a view or table if needed.
    // Let's stick to 'users' but ensure columns exist.
    
    await connection.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) AFTER role_id`);
    await connection.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS serial_code VARCHAR(50) AFTER student_id`);
    await connection.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS trade_code VARCHAR(50) AFTER serial_code`);
    await connection.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS level_number INT AFTER trade_code`);
    await connection.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS level_suffix VARCHAR(10) AFTER level_number`);

    // 2. Fees and Payments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_fees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        total_fees DECIMAL(10,2) NOT NULL,
        academic_year VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(50),
        reference_number VARCHAR(100),
        recorded_by INT,
        status VARCHAR(20) DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Teacher Materials & Homework
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT,
        class_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(255),
        material_type ENUM('work', 'homework', 'holiday_package') DEFAULT 'work',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4. Competitions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS competitions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        created_by INT,
        status VARCHAR(20) DEFAULT 'active',
        points_reward INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS competition_submissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        competition_id INT,
        student_id INT,
        content TEXT,
        file_url VARCHAR(255),
        score INT,
        points_earned INT DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 5. Points / Achievements
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_points (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        points INT DEFAULT 0,
        reason TEXT,
        awarded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 6. Study Links
    await connection.query(`
      CREATE TABLE IF NOT EXISTS study_links (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT,
        class_id INT,
        title VARCHAR(255),
        link_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Migration completed');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await connection.end();
  }
}

migrate();

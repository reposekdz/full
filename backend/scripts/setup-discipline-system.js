const mysql = require('mysql2/promise');

async function setupDisciplineSystem() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Discipline records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS discipline_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        student_code VARCHAR(50) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        trade VARCHAR(100),
        class_level VARCHAR(50),
        conduct_type ENUM('warning', 'suspension', 'expulsion', 'late', 'absence', 'misbehavior', 'uniform', 'other') NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
        description TEXT NOT NULL,
        action_taken TEXT,
        lesson_missed VARCHAR(255),
        removed_by INT NOT NULL,
        removed_by_name VARCHAR(255) NOT NULL,
        status ENUM('active', 'resolved', 'appealed') DEFAULT 'active',
        parent_notified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (removed_by) REFERENCES users(id)
      )
    `);

    // Student leave/absence records
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_leaves (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        student_code VARCHAR(50) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        trade VARCHAR(100),
        class_level VARCHAR(50),
        leave_type ENUM('sick', 'home', 'emergency', 'family', 'medical', 'other') NOT NULL,
        reason TEXT NOT NULL,
        lesson_missed VARCHAR(255),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NULL,
        approved_by INT NOT NULL,
        approved_by_name VARCHAR(255) NOT NULL,
        parent_notified BOOLEAN DEFAULT false,
        status ENUM('ongoing', 'returned', 'extended') DEFAULT 'ongoing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id)
      )
    `);

    // Parent notifications for discipline
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_discipline_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        notification_type ENUM('conduct_removed', 'leave_approved', 'discipline_warning') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        record_id INT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    // Discipline analytics cache
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS discipline_analytics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade VARCHAR(100),
        class_level VARCHAR(50),
        total_incidents INT DEFAULT 0,
        warnings INT DEFAULT 0,
        suspensions INT DEFAULT 0,
        absences INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_trade_level (trade, class_level)
      )
    `);

    console.log('✅ Discipline system tables created successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Error setting up discipline system:', error);
    await connection.end();
    process.exit(1);
  }
}

setupDisciplineSystem();

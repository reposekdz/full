const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupParentMonitoring() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const tables = [
    `CREATE TABLE IF NOT EXISTS parent_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      parent_id INT,
      student_id INT,
      notification_type ENUM('discipline','attendance','performance','leave','medical','general') DEFAULT 'general',
      title VARCHAR(200),
      message TEXT,
      severity ENUM('info','warning','critical') DEFAULT 'info',
      is_read BOOLEAN DEFAULT false,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS student_leave_requests (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      leave_type ENUM('sick','home','hospital','emergency','other') DEFAULT 'other',
      reason TEXT,
      start_date DATE,
      end_date DATE,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      approved_by INT,
      parent_notified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS student_performance_tracking (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      academic_year_id INT,
      term VARCHAR(20),
      overall_grade DECIMAL(5,2),
      attendance_rate DECIMAL(5,2),
      behavior_score INT DEFAULT 100,
      participation_score INT DEFAULT 0,
      homework_completion_rate DECIMAL(5,2),
      class_rank INT,
      teacher_comments TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS student_behavior_log (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      behavior_type ENUM('positive','negative') DEFAULT 'positive',
      category VARCHAR(100),
      description TEXT,
      points INT DEFAULT 0,
      recorded_by INT,
      parent_notified BOOLEAN DEFAULT false,
      incident_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS homework_submissions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      assignment_id INT,
      submission_date TIMESTAMP,
      score DECIMAL(5,2),
      feedback TEXT,
      status ENUM('submitted','late','missing','graded') DEFAULT 'submitted',
      parent_notified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS student_medical_records (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      record_type ENUM('visit','medication','allergy','condition','emergency') DEFAULT 'visit',
      description TEXT,
      treatment TEXT,
      prescribed_by VARCHAR(100),
      visit_date DATE,
      parent_notified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS student_attendance_alerts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      alert_type ENUM('absent','late','left_early','excused') DEFAULT 'absent',
      date DATE,
      reason TEXT,
      parent_notified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`
  ];

  for (const table of tables) {
    await connection.query(table);
  }

  console.log('✅ Parent monitoring system setup complete');
  await connection.end();
}

setupParentMonitoring().catch(console.error);

const mysql = require('mysql2/promise');

async function setupDOSSystem() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Academic performance tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS academic_performance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        student_code VARCHAR(50),
        subject VARCHAR(100) NOT NULL,
        exam_type ENUM('quiz', 'midterm', 'final', 'practical') NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        max_score DECIMAL(5,2) NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        grade VARCHAR(5),
        term VARCHAR(20),
        academic_year VARCHAR(20),
        teacher_id INT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `);

    // Curriculum management
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS curriculum (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade VARCHAR(100) NOT NULL,
        class_level VARCHAR(50) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        topics TEXT,
        learning_outcomes TEXT,
        assessment_methods TEXT,
        resources TEXT,
        status ENUM('active', 'draft', 'archived') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Teacher assignments
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teacher_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT NOT NULL,
        teacher_name VARCHAR(255),
        trade VARCHAR(100),
        class_level VARCHAR(50),
        subject VARCHAR(100),
        academic_year VARCHAR(20),
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        assigned_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id)
      )
    `);

    // Examination schedule
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS examination_schedule (
        id INT PRIMARY KEY AUTO_INCREMENT,
        exam_name VARCHAR(255) NOT NULL,
        exam_type ENUM('quiz', 'midterm', 'final', 'practical') NOT NULL,
        trade VARCHAR(100),
        class_level VARCHAR(50),
        subject VARCHAR(100),
        exam_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        venue VARCHAR(255),
        invigilator_id INT,
        status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invigilator_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Class timetable
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_timetable (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade VARCHAR(100) NOT NULL,
        class_level VARCHAR(50) NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        subject VARCHAR(100) NOT NULL,
        teacher_id INT,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room VARCHAR(50),
        academic_year VARCHAR(20),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Student attendance
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        student_code VARCHAR(50),
        trade VARCHAR(100),
        class_level VARCHAR(50),
        attendance_date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
        subject VARCHAR(100),
        marked_by INT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES users(id),
        UNIQUE KEY unique_attendance (student_id, attendance_date, subject)
      )
    `);

    console.log('✅ DOS system tables created successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Error setting up DOS system:', error);
    await connection.end();
    process.exit(1);
  }
}

setupDOSSystem();

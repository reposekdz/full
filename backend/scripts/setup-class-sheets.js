const mysql = require('mysql2/promise');

async function setupClassSheets() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Class sheets - Main sheet for each class
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_structure_id INT NOT NULL,
        sheet_name VARCHAR(255) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        total_students INT DEFAULT 0,
        male_students INT DEFAULT 0,
        female_students INT DEFAULT 0,
        class_teacher_id INT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_structure_id) REFERENCES class_structure(id),
        FOREIGN KEY (class_teacher_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        UNIQUE KEY unique_sheet (class_structure_id, academic_year)
      )
    `);

    // Student sheet entries - Individual student records per class
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_student_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        student_code VARCHAR(50) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        gender ENUM('Male', 'Female') NOT NULL,
        enrollment_date DATE NOT NULL,
        status ENUM('active', 'transferred', 'dropped', 'graduated') DEFAULT 'active',
        position_in_class INT,
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_sheet_id) REFERENCES class_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (added_by) REFERENCES users(id),
        UNIQUE KEY unique_student_sheet (class_sheet_id, student_id)
      )
    `);

    // Performance sheet per class
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_performance_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        term VARCHAR(20) NOT NULL,
        quiz_score DECIMAL(5,2) DEFAULT 0,
        midterm_score DECIMAL(5,2) DEFAULT 0,
        final_score DECIMAL(5,2) DEFAULT 0,
        total_score DECIMAL(5,2) DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0,
        grade VARCHAR(5),
        position INT,
        remarks TEXT,
        recorded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_sheet_id) REFERENCES class_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id),
        UNIQUE KEY unique_performance (class_sheet_id, student_id, subject, term)
      )
    `);

    // Attendance sheet per class
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_attendance_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
        subject VARCHAR(100),
        marked_by INT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_sheet_id) REFERENCES class_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES users(id),
        UNIQUE KEY unique_attendance (class_sheet_id, student_id, attendance_date, subject)
      )
    `);

    // Discipline sheet per class
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_discipline_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        incident_date DATE NOT NULL,
        conduct_type ENUM('warning', 'suspension', 'expulsion', 'late', 'absence', 'misbehavior', 'uniform', 'other') NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
        description TEXT NOT NULL,
        action_taken TEXT,
        status ENUM('active', 'resolved') DEFAULT 'active',
        recorded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_sheet_id) REFERENCES class_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id)
      )
    `);

    // Payment sheet per class
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_payment_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        total_fees DECIMAL(15,2) DEFAULT 0,
        paid_amount DECIMAL(15,2) DEFAULT 0,
        balance DECIMAL(15,2) DEFAULT 0,
        payment_status ENUM('paid', 'partial', 'unpaid') DEFAULT 'unpaid',
        last_payment_date DATE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_sheet_id) REFERENCES class_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_payment_sheet (class_sheet_id, student_id)
      )
    `);

    // Class summary statistics
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_summary_stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_sheet_id INT NOT NULL,
        total_students INT DEFAULT 0,
        present_today INT DEFAULT 0,
        absent_today INT DEFAULT 0,
        avg_performance DECIMAL(5,2) DEFAULT 0,
        total_incidents INT DEFAULT 0,
        paid_students INT DEFAULT 0,
        unpaid_students INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_sheet_id) REFERENCES class_sheets(id) ON DELETE CASCADE,
        UNIQUE KEY unique_summary (class_sheet_id)
      )
    `);

    console.log('✅ Class sheets system created successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Error setting up class sheets:', error);
    await connection.end();
    process.exit(1);
  }
}

setupClassSheets();

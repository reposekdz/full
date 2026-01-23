const mysql = require('mysql2/promise');

async function setupStudentSheets() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Comprehensive student sheet
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_comprehensive_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL UNIQUE,
        student_code VARCHAR(50) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        class_sheet_id INT NOT NULL,
        trade VARCHAR(50),
        level VARCHAR(50),
        section VARCHAR(10),
        academic_year VARCHAR(20),
        
        -- Academic Performance (Auto-calculated)
        total_subjects INT DEFAULT 0,
        total_marks DECIMAL(10,2) DEFAULT 0,
        average_marks DECIMAL(5,2) DEFAULT 0,
        overall_grade VARCHAR(5),
        class_position INT,
        gpa DECIMAL(3,2) DEFAULT 0,
        
        -- Attendance (Auto-calculated)
        total_days INT DEFAULT 0,
        days_present INT DEFAULT 0,
        days_absent INT DEFAULT 0,
        days_late INT DEFAULT 0,
        attendance_percentage DECIMAL(5,2) DEFAULT 0,
        
        -- Discipline (Auto-calculated)
        total_incidents INT DEFAULT 0,
        critical_incidents INT DEFAULT 0,
        high_incidents INT DEFAULT 0,
        medium_incidents INT DEFAULT 0,
        low_incidents INT DEFAULT 0,
        conduct_score INT DEFAULT 100,
        conduct_grade VARCHAR(5) DEFAULT 'A',
        
        -- Payment Status (Auto-calculated)
        total_fees DECIMAL(15,2) DEFAULT 0,
        paid_amount DECIMAL(15,2) DEFAULT 0,
        balance DECIMAL(15,2) DEFAULT 0,
        payment_status ENUM('paid', 'partial', 'unpaid') DEFAULT 'unpaid',
        
        -- Overall Status
        overall_status ENUM('excellent', 'good', 'average', 'poor', 'critical') DEFAULT 'average',
        remarks TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_sheet_id) REFERENCES class_sheets(id) ON DELETE CASCADE
      )
    `);

    // Subject-wise performance
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_subject_performance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        term VARCHAR(20) NOT NULL,
        
        -- Marks breakdown
        quiz_marks DECIMAL(5,2) DEFAULT 0,
        quiz_max DECIMAL(5,2) DEFAULT 20,
        midterm_marks DECIMAL(5,2) DEFAULT 0,
        midterm_max DECIMAL(5,2) DEFAULT 30,
        final_marks DECIMAL(5,2) DEFAULT 0,
        final_max DECIMAL(5,2) DEFAULT 50,
        
        -- Auto-calculated
        total_marks DECIMAL(5,2) DEFAULT 0,
        total_max DECIMAL(5,2) DEFAULT 100,
        percentage DECIMAL(5,2) DEFAULT 0,
        grade VARCHAR(5),
        grade_points DECIMAL(3,2) DEFAULT 0,
        subject_position INT,
        
        teacher_id INT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (student_sheet_id) REFERENCES student_comprehensive_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        UNIQUE KEY unique_subject_term (student_id, subject, term)
      )
    `);

    // Attendance tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_attendance_tracking (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        month VARCHAR(20) NOT NULL,
        year INT NOT NULL,
        
        -- Auto-calculated monthly stats
        total_days INT DEFAULT 0,
        present_days INT DEFAULT 0,
        absent_days INT DEFAULT 0,
        late_days INT DEFAULT 0,
        excused_days INT DEFAULT 0,
        attendance_rate DECIMAL(5,2) DEFAULT 0,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (student_sheet_id) REFERENCES student_comprehensive_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_month_year (student_id, month, year)
      )
    `);

    // Conduct tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_conduct_tracking (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        
        -- Incident breakdown
        warnings INT DEFAULT 0,
        suspensions INT DEFAULT 0,
        late_arrivals INT DEFAULT 0,
        absences INT DEFAULT 0,
        misbehaviors INT DEFAULT 0,
        uniform_violations INT DEFAULT 0,
        other_incidents INT DEFAULT 0,
        
        -- Auto-calculated conduct score (starts at 100)
        base_score INT DEFAULT 100,
        deductions INT DEFAULT 0,
        final_score INT DEFAULT 100,
        conduct_grade VARCHAR(5) DEFAULT 'A',
        conduct_status ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'excellent',
        
        last_incident_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (student_sheet_id) REFERENCES student_comprehensive_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_conduct (student_id)
      )
    `);

    // Term reports
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_term_reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_sheet_id INT NOT NULL,
        student_id INT NOT NULL,
        term VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        
        -- Academic summary
        total_subjects INT DEFAULT 0,
        total_marks DECIMAL(10,2) DEFAULT 0,
        average_marks DECIMAL(5,2) DEFAULT 0,
        gpa DECIMAL(3,2) DEFAULT 0,
        overall_grade VARCHAR(5),
        class_position INT,
        
        -- Attendance summary
        attendance_rate DECIMAL(5,2) DEFAULT 0,
        days_present INT DEFAULT 0,
        days_absent INT DEFAULT 0,
        
        -- Conduct summary
        conduct_score INT DEFAULT 100,
        conduct_grade VARCHAR(5) DEFAULT 'A',
        total_incidents INT DEFAULT 0,
        
        -- Teacher remarks
        class_teacher_remarks TEXT,
        dos_remarks TEXT,
        head_master_remarks TEXT,
        
        report_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (student_sheet_id) REFERENCES student_comprehensive_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_term_report (student_id, term, academic_year)
      )
    `);

    console.log('✅ Student sheets system created successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Error setting up student sheets:', error);
    await connection.end();
    process.exit(1);
  }
}

setupStudentSheets();

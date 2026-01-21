const mysql = require('mysql2/promise');

async function createDOSTables() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management_system'
    });

    console.log('Connected to MySQL database');

    // Create students table for DOS management
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        address TEXT,
        guardian_name VARCHAR(200),
        guardian_phone VARCHAR(20),
        guardian_email VARCHAR(255),
        admission_date DATE,
        graduation_date DATE NULL,
        trade_level ENUM('Level1', 'Level2', 'Level3') NOT NULL,
        trade_program VARCHAR(100) NOT NULL,
        status ENUM('active', 'graduated', 'dropped_out', 'suspended', 'transferred') DEFAULT 'active',
        academic_year VARCHAR(20),
        profile_picture VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        INDEX idx_trade_level (trade_level),
        INDEX idx_trade_program (trade_program)
      )
    `);
    console.log('✅ Created students table');

    // Create conduct_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conduct_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        incident_type ENUM('disciplinary', 'achievement', 'attendance', 'academic') NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        action_taken TEXT,
        reported_by VARCHAR(100),
        incident_date DATE NOT NULL,
        follow_up_required BOOLEAN DEFAULT false,
        follow_up_date DATE NULL,
        status ENUM('open', 'resolved', 'under_review') DEFAULT 'open',
        points_awarded INT DEFAULT 0,
        points_deducted INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_student_conduct (student_id),
        INDEX idx_incident_type (incident_type),
        INDEX idx_incident_date (incident_date),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Created conduct_records table');

    // Create attendance_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
        subject VARCHAR(100),
        period VARCHAR(50),
        notes TEXT,
        marked_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (student_id, attendance_date, subject, period),
        INDEX idx_student_attendance (student_id),
        INDEX idx_attendance_date (attendance_date),
        INDEX idx_attendance_status (status)
      )
    `);
    console.log('✅ Created attendance_records table');

    // Create academic_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS academic_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        assessment_type ENUM('quiz', 'exam', 'assignment', 'project', 'practical', 'final') NOT NULL,
        assessment_name VARCHAR(200),
        max_marks DECIMAL(5,2) NOT NULL,
        obtained_marks DECIMAL(5,2) NOT NULL,
        grade_letter VARCHAR(5),
        percentage DECIMAL(5,2),
        assessment_date DATE NOT NULL,
        semester VARCHAR(20),
        academic_year VARCHAR(20),
        teacher VARCHAR(100),
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_student_academic (student_id),
        INDEX idx_subject (subject),
        INDEX idx_assessment_date (assessment_date)
      )
    `);
    console.log('✅ Created academic_records table');

    // Insert sample students data
    await connection.execute(`
      INSERT IGNORE INTO students (student_id, first_name, last_name, email, phone, date_of_birth, gender, address, guardian_name, guardian_phone, trade_level, trade_program, status, academic_year, admission_date) VALUES
      ('STD001', 'Jean Claude', 'Mugisha', 'jean.mugisha@student.school.rw', '+250781234567', '2005-03-15', 'male', 'Kigali, Gasabo', 'Pierre Mugisha', '+250788123456', 'Level2', 'Software Development', 'active', '2025-2026', '2024-09-01'),
      ('STD002', 'Marie', 'Uwimana', 'marie.uwimana@student.school.rw', '+250782345678', '2004-07-22', 'female', 'Kigali, Kicukiro', 'Agnes Uwimana', '+250789234567', 'Level3', 'Building Construction', 'active', '2025-2026', '2023-09-01'),
      ('STD003', 'Patrick', 'Nkurunziza', 'patrick.nkuru@student.school.rw', '+250783456789', '2005-11-08', 'male', 'Kigali, Nyarugenge', 'Emmanuel Nkurunziza', '+250790345678', 'Level1', 'Automobile Technology', 'active', '2025-2026', '2025-01-15'),
      ('STD004', 'Alice', 'Mukamana', 'alice.mukamana@student.school.rw', '+250784567890', '2004-12-03', 'female', 'Gasabo, Remera', 'Rose Mukamana', '+250791456789', 'Level2', 'Software Development', 'active', '2025-2026', '2024-09-01'),
      ('STD005', 'David', 'Habimana', 'david.habimana@student.school.rw', '+250785678901', '2005-05-17', 'male', 'Kicukiro, Niboye', 'Joseph Habimana', '+250792567890', 'Level3', 'Building Construction', 'active', '2025-2026', '2023-09-01'),
      ('STD006', 'Grace', 'Ingabire', 'grace.ingabire@student.school.rw', '+250786789012', '2005-09-25', 'female', 'Nyarugenge, Nyamirambo', 'Christine Ingabire', '+250793678901', 'Level1', 'Software Development', 'active', '2025-2026', '2025-01-15'),
      ('STD007', 'Eric', 'Nzeyimana', 'eric.nzeyimana@student.school.rw', '+250787890123', '2004-04-10', 'male', 'Gasabo, Kinyinya', 'Francis Nzeyimana', '+250794789012', 'Level2', 'Automobile Technology', 'active', '2025-2026', '2024-09-01'),
      ('STD008', 'Esther', 'Uwase', 'esther.uwase@student.school.rw', '+250788901234', '2005-08-14', 'female', 'Kicukiro, Gatenga', 'Beatrice Uwase', '+250795890123', 'Level1', 'Building Construction', 'active', '2025-2026', '2025-01-15')
    `);
    console.log('✅ Inserted sample students data');

    // Insert sample conduct records
    await connection.execute(`
      INSERT IGNORE INTO conduct_records (student_id, incident_type, severity, title, description, reported_by, incident_date, status, points_awarded, points_deducted) VALUES
      (1, 'achievement', 'high', 'Outstanding Project Presentation', 'Delivered exceptional final project presentation in Software Development class, demonstrating advanced programming skills and creativity.', 'Mr. John Doe', '2026-01-15', 'resolved', 15, 0),
      (2, 'disciplinary', 'medium', 'Late Arrival', 'Student arrived 30 minutes late to morning assembly without valid excuse.', 'Ms. Jane Smith', '2026-01-10', 'resolved', 0, 5),
      (3, 'achievement', 'medium', 'Peer Mentoring', 'Actively helped struggling classmates with automotive repair techniques during practical sessions.', 'Mr. Bob Wilson', '2026-01-12', 'resolved', 10, 0),
      (4, 'academic', 'low', 'Improved Performance', 'Significant improvement in programming assignments over the past month.', 'Ms. Alice Johnson', '2026-01-08', 'resolved', 8, 0),
      (5, 'disciplinary', 'low', 'Dress Code Violation', 'Student did not wear proper safety equipment during construction practical class.', 'Mr. Tom Brown', '2026-01-05', 'resolved', 0, 3),
      (6, 'achievement', 'high', 'Leadership Excellence', 'Successfully organized and led the student coding club activities this semester.', 'Ms. Sarah Lee', '2026-01-14', 'resolved', 20, 0),
      (7, 'attendance', 'medium', 'Perfect Attendance', 'Maintained perfect attendance record for the entire semester.', 'System', '2026-01-16', 'resolved', 12, 0),
      (8, 'disciplinary', 'medium', 'Workshop Safety Issue', 'Failed to follow proper safety protocols during welding practice session.', 'Mr. Mike Davis', '2026-01-09', 'under_review', 0, 8)
    `);
    console.log('✅ Inserted sample conduct records');

    // Insert sample attendance records for the past week
    const today = new Date();
    const students = [1, 2, 3, 4, 5, 6, 7, 8];
    const subjects = ['Programming Fundamentals', 'Construction Basics', 'Auto Mechanics', 'Mathematics', 'English'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      for (const studentId of students) {
        for (const subject of subjects.slice(0, 3)) { // 3 subjects per day
          const status = Math.random() > 0.15 ? 'present' : (Math.random() > 0.5 ? 'late' : 'absent');
          try {
            await connection.execute(`
              INSERT IGNORE INTO attendance_records (student_id, attendance_date, status, subject, period, marked_by) 
              VALUES (?, ?, ?, ?, 'Morning', 'System')
            `, [studentId, dateStr, status, subject]);
          } catch (error) {
            // Ignore duplicate errors
          }
        }
      }
    }
    console.log('✅ Inserted sample attendance records');

    // Insert sample academic records
    await connection.execute(`
      INSERT IGNORE INTO academic_records (student_id, subject, assessment_type, assessment_name, max_marks, obtained_marks, grade_letter, percentage, assessment_date, semester, academic_year, teacher) VALUES
      (1, 'Programming Fundamentals', 'exam', 'Mid-term Exam', 100, 85, 'A-', 85.0, '2026-01-10', 'Semester 1', '2025-2026', 'Mr. John Doe'),
      (1, 'Database Design', 'project', 'Database Project', 100, 92, 'A', 92.0, '2026-01-12', 'Semester 1', '2025-2026', 'Ms. Alice Johnson'),
      (2, 'Construction Safety', 'quiz', 'Safety Quiz 1', 50, 45, 'A-', 90.0, '2026-01-08', 'Semester 1', '2025-2026', 'Mr. Tom Brown'),
      (2, 'Building Materials', 'assignment', 'Materials Report', 100, 78, 'B+', 78.0, '2026-01-15', 'Semester 1', '2025-2026', 'Ms. Sarah Lee'),
      (3, 'Engine Diagnostics', 'practical', 'Engine Repair', 100, 88, 'A-', 88.0, '2026-01-11', 'Semester 1', '2025-2026', 'Mr. Bob Wilson'),
      (4, 'Web Development', 'project', 'Portfolio Website', 100, 95, 'A+', 95.0, '2026-01-14', 'Semester 1', '2025-2026', 'Mr. John Doe'),
      (5, 'Structural Engineering', 'exam', 'Structures Exam', 100, 82, 'A-', 82.0, '2026-01-09', 'Semester 1', '2025-2026', 'Mr. Tom Brown'),
      (6, 'Programming Logic', 'assignment', 'Algorithm Assignment', 100, 77, 'B+', 77.0, '2026-01-13', 'Semester 1', '2025-2026', 'Ms. Alice Johnson'),
      (7, 'Auto Electronics', 'quiz', 'Electronics Quiz', 50, 42, 'A-', 84.0, '2026-01-07', 'Semester 1', '2025-2026', 'Mr. Bob Wilson'),
      (8, 'Construction Planning', 'project', 'Site Planning Project', 100, 89, 'A-', 89.0, '2026-01-16', 'Semester 1', '2025-2026', 'Ms. Sarah Lee')
    `);
    console.log('✅ Inserted sample academic records');

    // Verify DOS tables were created
    const [tables] = await connection.execute("SHOW TABLES LIKE '%students%' OR SHOW TABLES LIKE '%conduct%' OR SHOW TABLES LIKE '%attendance%' OR SHOW TABLES LIKE '%academic%'");
    console.log('\n📊 DOS-related tables created:');
    const [allTables] = await connection.execute('SHOW TABLES');
    const dosTableNames = ['students', 'conduct_records', 'attendance_records', 'academic_records'];
    allTables.forEach(table => {
      const tableName = Object.values(table)[0];
      if (dosTableNames.includes(tableName)) {
        console.log(`- ${tableName}`);
      }
    });

    // Show record counts
    console.log('\n📈 Record counts:');
    const [studentCount] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log(`- Students: ${studentCount[0].count}`);
    
    const [conductCount] = await connection.execute('SELECT COUNT(*) as count FROM conduct_records');
    console.log(`- Conduct Records: ${conductCount[0].count}`);
    
    const [attendanceCount] = await connection.execute('SELECT COUNT(*) as count FROM attendance_records');
    console.log(`- Attendance Records: ${attendanceCount[0].count}`);
    
    const [academicCount] = await connection.execute('SELECT COUNT(*) as count FROM academic_records');
    console.log(`- Academic Records: ${academicCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error setting up DOS tables:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔐 Database connection closed');
    }
  }
}

createDOSTables();
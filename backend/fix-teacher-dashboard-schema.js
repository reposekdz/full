const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTeacherDashboardSchema() {
  console.log('Fixing teacher dashboard database schema...');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database');

    // Create teacher_class_assignments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teacher_class_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT NOT NULL,
        class_id INT NOT NULL,
        subject_id INT,
        assigned_date DATE DEFAULT (CURRENT_DATE),
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_teacher (teacher_id),
        INDEX idx_class (class_id)
      )
    `);
    console.log('✓ Created teacher_class_assignments table');

    // Fix classes table - ensure it has 'name' column
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50),
        teacher_id INT,
        course_id INT,
        trade_id INT,
        level_id INT,
        academic_year VARCHAR(20),
        term VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_teacher (teacher_id)
      )
    `);
    console.log('✓ Ensured classes table exists');

    // Fix timetable table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        teacher_id INT NOT NULL,
        subject_id INT,
        day_of_week INT NOT NULL,
        period_number INT,
        start_time TIME,
        end_time TIME,
        room_number VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_teacher_day (teacher_id, day_of_week),
        INDEX idx_class (class_id)
      )
    `);
    console.log('✓ Ensured timetable table exists');

    // Create enrollments table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        enrollment_date DATE DEFAULT (CURRENT_DATE),
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_enrollment (student_id, class_id),
        INDEX idx_student (student_id),
        INDEX idx_class (class_id)
      )
    `);
    console.log('✓ Ensured enrollments table exists');

    // Create attendance table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        marked_by INT,
        attendance_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'present',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_date (student_id, attendance_date),
        INDEX idx_class_date (class_id, attendance_date)
      )
    `);
    console.log('✓ Ensured attendance table exists');

    // Create grades table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        subject_id INT,
        teacher_id INT,
        assessment_type VARCHAR(50),
        assessment_name VARCHAR(100),
        assessment_date DATE,
        max_marks DECIMAL(5,2),
        obtained_marks DECIMAL(5,2),
        grade_letter VARCHAR(5),
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_teacher (teacher_id),
        INDEX idx_class (class_id)
      )
    `);
    console.log('✓ Ensured grades table exists');

    console.log('\n✅ All teacher dashboard tables fixed successfully!');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixTeacherDashboardSchema();

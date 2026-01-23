const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupAssignmentSystem() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await connection.query('DROP TABLE IF EXISTS assignment_analytics');
    await connection.query('DROP TABLE IF EXISTS assignment_grades');
    await connection.query('DROP TABLE IF EXISTS assignment_submissions');
    await connection.query('DROP TABLE IF EXISTS assignment_files');
    await connection.query('DROP TABLE IF EXISTS assignments');
    console.log('Dropped existing tables');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // Assignments table
    await connection.query(`
      CREATE TABLE assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT NOT NULL,
        class_id INT NOT NULL,
        course_id INT NOT NULL,
        title VARCHAR(500) NOT NULL,
        description LONGTEXT,
        type ENUM('homework', 'quiz', 'assignment', 'exam', 'project') NOT NULL,
        content_type ENUM('text', 'file', 'both') DEFAULT 'both',
        rich_text_content LONGTEXT,
        total_marks INT NOT NULL,
        passing_marks INT,
        due_date DATETIME NOT NULL,
        allow_late_submission BOOLEAN DEFAULT false,
        late_penalty_percent INT DEFAULT 0,
        auto_grade BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES dos_teachers(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES dos_classes(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES dos_courses(id) ON DELETE CASCADE
      )
    `);
    console.log('assignments table created');

    // Assignment files table
    await connection.query(`
      CREATE TABLE assignment_files (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT NOT NULL,
        file_name VARCHAR(500) NOT NULL,
        file_path VARCHAR(1000) NOT NULL,
        file_type VARCHAR(100),
        file_size BIGINT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
      )
    `);
    console.log('assignment_files table created');

    // Student submissions table
    await connection.query(`
      CREATE TABLE assignment_submissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        submission_text LONGTEXT,
        submission_date DATETIME NOT NULL,
        is_late BOOLEAN DEFAULT false,
        status ENUM('submitted', 'graded', 'returned', 'resubmit') DEFAULT 'submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        UNIQUE KEY unique_submission (assignment_id, student_id)
      )
    `);
    console.log('assignment_submissions table created');

    // Submission files table
    await connection.query(`
      CREATE TABLE submission_files (
        id INT PRIMARY KEY AUTO_INCREMENT,
        submission_id INT NOT NULL,
        file_name VARCHAR(500) NOT NULL,
        file_path VARCHAR(1000) NOT NULL,
        file_type VARCHAR(100),
        file_size BIGINT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE
      )
    `);
    console.log('submission_files table created');

    // Grades table
    await connection.query(`
      CREATE TABLE assignment_grades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        submission_id INT NOT NULL,
        marks_obtained DECIMAL(10,2) NOT NULL,
        total_marks INT NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        grade VARCHAR(5),
        feedback LONGTEXT,
        graded_by INT NOT NULL,
        graded_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES dos_teachers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_grade (submission_id)
      )
    `);
    console.log('assignment_grades table created');

    // Analytics table
    await connection.query(`
      CREATE TABLE assignment_analytics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT NOT NULL,
        class_id INT NOT NULL,
        total_students INT DEFAULT 0,
        submitted_count INT DEFAULT 0,
        graded_count INT DEFAULT 0,
        average_marks DECIMAL(10,2) DEFAULT 0,
        highest_marks DECIMAL(10,2) DEFAULT 0,
        lowest_marks DECIMAL(10,2) DEFAULT 0,
        pass_count INT DEFAULT 0,
        fail_count INT DEFAULT 0,
        pass_rate DECIMAL(5,2) DEFAULT 0,
        on_time_submissions INT DEFAULT 0,
        late_submissions INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES dos_classes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_analytics (assignment_id)
      )
    `);
    console.log('assignment_analytics table created');

    // Student performance table
    await connection.query(`
      CREATE TABLE student_performance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        course_id INT NOT NULL,
        total_assignments INT DEFAULT 0,
        completed_assignments INT DEFAULT 0,
        average_percentage DECIMAL(5,2) DEFAULT 0,
        total_marks_obtained DECIMAL(10,2) DEFAULT 0,
        total_marks_possible DECIMAL(10,2) DEFAULT 0,
        rank_in_class INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_performance (student_id, class_id, course_id)
      )
    `);
    console.log('student_performance table created');

    console.log('Assignment system database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up assignment system:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupAssignmentSystem();

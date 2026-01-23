const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupDOSManagement() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop existing tables
    await connection.query('DROP TABLE IF EXISTS teacher_assignments');
    await connection.query('DROP TABLE IF EXISTS timetable_slots');
    await connection.query('DROP TABLE IF EXISTS dos_teachers');
    await connection.query('DROP TABLE IF EXISTS dos_courses');
    await connection.query('DROP TABLE IF EXISTS dos_classes');
    await connection.query('DROP TABLE IF EXISTS dos_trades');
    console.log('Dropped existing tables');
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create dos_trades table
    await connection.query(`
      CREATE TABLE dos_trades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        duration_years INT DEFAULT 3,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('dos_trades table created');

    // Create dos_classes table
    await connection.query(`
      CREATE TABLE dos_classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        trade_id INT,
        level INT,
        capacity INT DEFAULT 30,
        current_students INT DEFAULT 0,
        academic_year VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (trade_id) REFERENCES dos_trades(id) ON DELETE SET NULL
      )
    `);
    console.log('dos_classes table created');

    // Create dos_teachers table
    await connection.query(`
      CREATE TABLE dos_teachers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        specialization VARCHAR(255),
        qualification VARCHAR(255),
        experience_years INT DEFAULT 0,
        employee_id VARCHAR(50) UNIQUE,
        hire_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('dos_teachers table created');

    // Create dos_courses table
    await connection.query(`
      CREATE TABLE dos_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        trade_id INT,
        level INT,
        credits INT DEFAULT 3,
        hours_per_week INT DEFAULT 4,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (trade_id) REFERENCES dos_trades(id) ON DELETE SET NULL
      )
    `);
    console.log('dos_courses table created');

    // Create teacher_assignments table
    await connection.query(`
      CREATE TABLE teacher_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT NOT NULL,
        class_id INT NOT NULL,
        course_id INT NOT NULL,
        academic_year VARCHAR(20),
        semester INT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES dos_teachers(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES dos_classes(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES dos_courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_assignment (teacher_id, class_id, course_id, academic_year, semester)
      )
    `);
    console.log('teacher_assignments table created');

    // Create timetable_slots table
    await connection.query(`
      CREATE TABLE timetable_slots (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES teacher_assignments(id) ON DELETE CASCADE
      )
    `);
    console.log('timetable_slots table created');

    // Insert sample trades
    const trades = [
      { name: 'Software Development', code: 'SOD', description: 'Learn programming and software engineering', duration_years: 3 },
      { name: 'Building Construction', code: 'BDC', description: 'Construction and civil engineering', duration_years: 3 },
      { name: 'Automotive Technology', code: 'AUT', description: 'Vehicle mechanics and maintenance', duration_years: 3 },
      { name: 'Electrical Installation', code: 'ELI', description: 'Electrical systems and installation', duration_years: 3 }
    ];

    for (const trade of trades) {
      await connection.query(
        'INSERT INTO dos_trades (name, code, description, duration_years) VALUES (?, ?, ?, ?)',
        [trade.name, trade.code, trade.description, trade.duration_years]
      );
    }
    console.log('Sample trades inserted');

    // Insert sample classes
    const classes = [
      { name: 'SOD Year 1 A', code: 'SOD1A', trade_id: 1, level: 1, capacity: 30, academic_year: '2024-2025' },
      { name: 'SOD Year 2 A', code: 'SOD2A', trade_id: 1, level: 2, capacity: 28, academic_year: '2024-2025' },
      { name: 'BDC Year 1 A', code: 'BDC1A', trade_id: 2, level: 1, capacity: 25, academic_year: '2024-2025' },
      { name: 'AUT Year 1 A', code: 'AUT1A', trade_id: 3, level: 1, capacity: 20, academic_year: '2024-2025' }
    ];

    for (const cls of classes) {
      await connection.query(
        'INSERT INTO dos_classes (name, code, trade_id, level, capacity, academic_year) VALUES (?, ?, ?, ?, ?, ?)',
        [cls.name, cls.code, cls.trade_id, cls.level, cls.capacity, cls.academic_year]
      );
    }
    console.log('Sample classes inserted');

    // Insert sample teachers
    const teachers = [
      { first_name: 'Jean', last_name: 'Mugisha', email: 'j.mugisha@gardentvet.rw', phone: '0788123456', specialization: 'Programming', qualification: 'MSc Computer Science', experience_years: 5, employee_id: 'T001', hire_date: '2020-01-15' },
      { first_name: 'Marie', last_name: 'Uwase', email: 'm.uwase@gardentvet.rw', phone: '0788234567', specialization: 'Mathematics', qualification: 'BSc Mathematics', experience_years: 3, employee_id: 'T002', hire_date: '2021-03-10' },
      { first_name: 'Patrick', last_name: 'Nkusi', email: 'p.nkusi@gardentvet.rw', phone: '0788345678', specialization: 'Construction', qualification: 'BSc Civil Engineering', experience_years: 7, employee_id: 'T003', hire_date: '2019-08-20' },
      { first_name: 'Grace', last_name: 'Mukamana', email: 'g.mukamana@gardentvet.rw', phone: '0788456789', specialization: 'Automotive', qualification: 'Diploma Automotive Tech', experience_years: 4, employee_id: 'T004', hire_date: '2020-09-01' }
    ];

    for (const teacher of teachers) {
      await connection.query(
        'INSERT INTO dos_teachers (first_name, last_name, email, phone, specialization, qualification, experience_years, employee_id, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [teacher.first_name, teacher.last_name, teacher.email, teacher.phone, teacher.specialization, teacher.qualification, teacher.experience_years, teacher.employee_id, teacher.hire_date]
      );
    }
    console.log('Sample teachers inserted');

    // Insert sample courses
    const courses = [
      { name: 'Introduction to Programming', code: 'SOD101', trade_id: 1, level: 1, credits: 4, hours_per_week: 6, description: 'Basic programming concepts' },
      { name: 'Web Development', code: 'SOD102', trade_id: 1, level: 1, credits: 3, hours_per_week: 4, description: 'HTML, CSS, JavaScript basics' },
      { name: 'Database Systems', code: 'SOD201', trade_id: 1, level: 2, credits: 4, hours_per_week: 5, description: 'SQL and database design' },
      { name: 'Building Materials', code: 'BDC101', trade_id: 2, level: 1, credits: 3, hours_per_week: 4, description: 'Construction materials study' },
      { name: 'Automotive Basics', code: 'AUT101', trade_id: 3, level: 1, credits: 3, hours_per_week: 5, description: 'Vehicle systems overview' }
    ];

    for (const course of courses) {
      await connection.query(
        'INSERT INTO dos_courses (name, code, trade_id, level, credits, hours_per_week, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [course.name, course.code, course.trade_id, course.level, course.credits, course.hours_per_week, course.description]
      );
    }
    console.log('Sample courses inserted');

    // Insert sample assignments
    const assignments = [
      { teacher_id: 1, class_id: 1, course_id: 1, academic_year: '2024-2025', semester: 1 },
      { teacher_id: 1, class_id: 1, course_id: 2, academic_year: '2024-2025', semester: 1 },
      { teacher_id: 2, class_id: 2, course_id: 3, academic_year: '2024-2025', semester: 1 },
      { teacher_id: 3, class_id: 3, course_id: 4, academic_year: '2024-2025', semester: 1 }
    ];

    for (const assignment of assignments) {
      await connection.query(
        'INSERT INTO teacher_assignments (teacher_id, class_id, course_id, academic_year, semester) VALUES (?, ?, ?, ?, ?)',
        [assignment.teacher_id, assignment.class_id, assignment.course_id, assignment.academic_year, assignment.semester]
      );
    }
    console.log('Sample assignments inserted');

    console.log('DOS Management database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up DOS management database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDOSManagement();

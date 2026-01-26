const mysql = require('mysql2/promise');
require('dotenv').config();

async function masterIntegration() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 MASTER SYSTEM INTEGRATION - CONNECTING ALL COMPONENTS');
    console.log('='.repeat(80) + '\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Database connected\n');

    // 1. Ensure all tables exist with proper relationships
    console.log('📊 Creating integrated database schema...\n');

    // Staff table with trade integration
    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        role VARCHAR(100),
        trade_id INT,
        level VARCHAR(50),
        specialization VARCHAR(255),
        qualifications TEXT,
        experience_years INT DEFAULT 0,
        hire_date DATE,
        salary DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        emergency_contact VARCHAR(255),
        address TEXT,
        bio TEXT,
        bio_rw TEXT,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_trade (trade_id),
        INDEX idx_role (role),
        INDEX idx_level (level),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Staff table created with trade integration');

    // Add foreign key if not exists
    try {
      await connection.query(`
        ALTER TABLE staff 
        ADD CONSTRAINT fk_staff_trade 
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE SET NULL
      `);
    } catch (e) {
      // Foreign key might already exist
    }

    // Students with trade and level integration
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        trade_id INT,
        level VARCHAR(50),
        admission_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        parent_id INT,
        address TEXT,
        emergency_contact VARCHAR(255),
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_trade (trade_id),
        INDEX idx_level (level),
        INDEX idx_status (status),
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Students table created with trade integration');

    // Classes with trade and staff integration
    await connection.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        trade_id INT,
        level VARCHAR(50),
        instructor_id INT,
        capacity INT DEFAULT 30,
        enrolled INT DEFAULT 0,
        schedule TEXT,
        room VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_trade (trade_id),
        INDEX idx_instructor (instructor_id),
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE SET NULL,
        FOREIGN KEY (instructor_id) REFERENCES staff(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Classes table created with staff & trade integration');

    // Assignments with class and trade integration
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        class_id INT,
        trade_id INT,
        level VARCHAR(50),
        instructor_id INT,
        due_date DATETIME,
        total_marks INT DEFAULT 100,
        status VARCHAR(50) DEFAULT 'active',
        attachments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_class (class_id),
        INDEX idx_trade (trade_id),
        INDEX idx_instructor (instructor_id),
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE SET NULL,
        FOREIGN KEY (instructor_id) REFERENCES staff(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Assignments table created with full integration');

    // Grades with student, assignment, and staff integration
    await connection.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        assignment_id INT,
        class_id INT,
        marks_obtained DECIMAL(5,2),
        total_marks DECIMAL(5,2),
        grade VARCHAR(10),
        feedback TEXT,
        graded_by INT,
        graded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_assignment (assignment_id),
        INDEX idx_class (class_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES staff(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Grades table created with full integration');

    // Attendance with student, class, and staff integration
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        class_id INT,
        date DATE,
        status VARCHAR(50),
        marked_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_class (class_id),
        INDEX idx_date (date),
        UNIQUE KEY unique_attendance (student_id, class_id, date),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES staff(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Attendance table created with full integration');

    // 2. Insert sample integrated data
    console.log('\n📝 Inserting sample integrated data...\n');

    // Check and insert sample staff
    const [staffCount] = await connection.query('SELECT COUNT(*) as count FROM staff');
    if (staffCount[0].count === 0) {
      await connection.query(`
        INSERT INTO staff (name, email, phone, role, trade_id, level, specialization, experience_years, status) VALUES
        ('Jean Claude Mugabo', 'jean.mugabo@school.rw', '+250788123456', 'Instructor', 1, 'Level 4', 'Advanced Welding', 8, 'active'),
        ('Marie Rose Uwase', 'marie.uwase@school.rw', '+250788234567', 'Instructor', 2, 'Level 5', 'Electrical Systems', 10, 'active'),
        ('Patrick Nkusi', 'patrick.nkusi@school.rw', '+250788345678', 'Instructor', 3, 'Level 3', 'Plumbing Systems', 5, 'active'),
        ('Emmanuel Habimana', 'emmanuel.h@school.rw', '+250788456789', 'Instructor', 4, 'Level 4', 'Carpentry & Joinery', 7, 'active'),
        ('Joseph Mutabazi', 'joseph.m@school.rw', '+250788567890', 'Instructor', 5, 'Level 5', 'Construction', 12, 'active')
      `);
      console.log('✅ Sample staff inserted with trade assignments');
    }

    // Check and insert sample students
    const [studentsCount] = await connection.query('SELECT COUNT(*) as count FROM students');
    if (studentsCount[0].count === 0) {
      await connection.query(`
        INSERT INTO students (student_id, name, email, phone, trade_id, level, admission_date, status) VALUES
        ('STD2024001', 'Alice Mukamana', 'alice.m@student.rw', '+250788111111', 1, 'Level 1', '2024-01-15', 'active'),
        ('STD2024002', 'Bob Niyonzima', 'bob.n@student.rw', '+250788222222', 2, 'Level 1', '2024-01-15', 'active'),
        ('STD2024003', 'Claire Uwera', 'claire.u@student.rw', '+250788333333', 3, 'Level 2', '2023-09-01', 'active'),
        ('STD2024004', 'David Kamanzi', 'david.k@student.rw', '+250788444444', 4, 'Level 2', '2023-09-01', 'active'),
        ('STD2024005', 'Emma Ingabire', 'emma.i@student.rw', '+250788555555', 5, 'Level 3', '2023-01-10', 'active')
      `);
      console.log('✅ Sample students inserted with trade assignments');
    }

    // Check and insert sample classes
    const [classesCount] = await connection.query('SELECT COUNT(*) as count FROM classes');
    if (classesCount[0].count === 0) {
      await connection.query(`
        INSERT INTO classes (name, trade_id, level, instructor_id, capacity, enrolled, room, status) VALUES
        ('Welding Basics', 1, 'Level 1', 1, 30, 15, 'Workshop A', 'active'),
        ('Electrical Installation', 2, 'Level 1', 2, 25, 12, 'Lab B', 'active'),
        ('Advanced Plumbing', 3, 'Level 2', 3, 20, 10, 'Workshop C', 'active'),
        ('Carpentry Techniques', 4, 'Level 2', 4, 25, 14, 'Workshop D', 'active'),
        ('Construction Methods', 5, 'Level 3', 5, 30, 18, 'Workshop E', 'active')
      `);
      console.log('✅ Sample classes inserted with staff & trade integration');
    }

    // 3. Create integration views
    console.log('\n📊 Creating integration views...\n');

    await connection.query(`
      CREATE OR REPLACE VIEW staff_with_trades AS
      SELECT s.*, t.title as trade_name, t.title_rw as trade_name_rw,
             COUNT(DISTINCT c.id) as classes_count,
             COUNT(DISTINCT st.id) as students_count
      FROM staff s
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN classes c ON s.id = c.instructor_id
      LEFT JOIN students st ON s.trade_id = st.trade_id
      WHERE s.status = 'active'
      GROUP BY s.id
    `);
    console.log('✅ Staff with trades view created');

    await connection.query(`
      CREATE OR REPLACE VIEW students_with_trades AS
      SELECT s.*, t.title as trade_name, t.title_rw as trade_name_rw,
             COUNT(DISTINCT c.id) as classes_enrolled,
             AVG(g.marks_obtained) as average_grade
      FROM students s
      LEFT JOIN trades t ON s.trade_id = t.id
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN classes c ON s.trade_id = c.trade_id
      WHERE s.status = 'active'
      GROUP BY s.id
    `);
    console.log('✅ Students with trades view created');

    await connection.query(`
      CREATE OR REPLACE VIEW classes_overview AS
      SELECT c.*, t.title as trade_name, s.name as instructor_name,
             COUNT(DISTINCT st.id) as enrolled_students,
             COUNT(DISTINCT a.id) as total_assignments
      FROM classes c
      LEFT JOIN trades t ON c.trade_id = t.id
      LEFT JOIN staff s ON c.instructor_id = s.id
      LEFT JOIN students st ON c.trade_id = st.trade_id
      LEFT JOIN assignments a ON c.id = a.class_id
      WHERE c.status = 'active'
      GROUP BY c.id
    `);
    console.log('✅ Classes overview view created');

    // 4. Create integration statistics
    console.log('\n📈 Generating integration statistics...\n');

    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM staff WHERE status = 'active') as total_staff,
        (SELECT COUNT(*) FROM students WHERE status = 'active') as total_students,
        (SELECT COUNT(*) FROM classes WHERE status = 'active') as total_classes,
        (SELECT COUNT(*) FROM trades WHERE status = 'active') as total_trades,
        (SELECT COUNT(*) FROM assignments WHERE status = 'active') as total_assignments,
        (SELECT COUNT(DISTINCT trade_id) FROM staff WHERE trade_id IS NOT NULL) as trades_with_staff,
        (SELECT COUNT(DISTINCT trade_id) FROM students WHERE trade_id IS NOT NULL) as trades_with_students
    `);

    console.log('📊 System Statistics:');
    console.log(`   - Total Staff: ${stats[0].total_staff}`);
    console.log(`   - Total Students: ${stats[0].total_students}`);
    console.log(`   - Total Classes: ${stats[0].total_classes}`);
    console.log(`   - Total Trades: ${stats[0].total_trades}`);
    console.log(`   - Total Assignments: ${stats[0].total_assignments}`);
    console.log(`   - Trades with Staff: ${stats[0].trades_with_staff}`);
    console.log(`   - Trades with Students: ${stats[0].trades_with_students}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ MASTER INTEGRATION COMPLETE!');
    console.log('='.repeat(80));
    console.log('\n🎉 All systems are now fully integrated and working together!\n');
    console.log('Integration Features:');
    console.log('  ✅ Staff linked to Trades & Levels');
    console.log('  ✅ Students linked to Trades & Levels');
    console.log('  ✅ Classes linked to Staff & Trades');
    console.log('  ✅ Assignments linked to Classes & Staff');
    console.log('  ✅ Grades linked to Students & Assignments');
    console.log('  ✅ Attendance linked to Students & Classes');
    console.log('  ✅ Database views for quick access');
    console.log('  ✅ Foreign key relationships established');
    console.log('  ✅ Sample data with full integration\n');

  } catch (error) {
    console.error('\n❌ Integration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

masterIntegration();

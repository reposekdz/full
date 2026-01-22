const { pool } = require('../config/database');

async function checkAndFixSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Check existing tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log('📋 Existing tables:');
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));

    // Check if new tables exist, if not create them
    const requiredTables = {
      'academic_years': `CREATE TABLE IF NOT EXISTS academic_years (
        id INT PRIMARY KEY AUTO_INCREMENT,
        year_name VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_current BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      'trade_courses': `CREATE TABLE IF NOT EXISTS trade_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255),
        trade ENUM('SOD', 'BDC', 'AUT', 'General') NOT NULL,
        level VARCHAR(50) NOT NULL,
        duration_weeks INT,
        description TEXT,
        image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      'subjects': `CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255),
        trade ENUM('SOD', 'BDC', 'AUT', 'General'),
        level VARCHAR(50),
        credits INT DEFAULT 3,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      'exams': `CREATE TABLE IF NOT EXISTS exams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        title_rw VARCHAR(255),
        course_id INT,
        subject_id INT,
        trade ENUM('SOD', 'BDC', 'AUT', 'General'),
        level VARCHAR(50),
        exam_type ENUM('midterm', 'final', 'quiz', 'practical') NOT NULL,
        exam_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        duration_minutes INT NOT NULL,
        room VARCHAR(100),
        instructor_id INT,
        total_marks INT NOT NULL,
        passing_marks INT NOT NULL,
        description TEXT,
        topics JSON,
        materials JSON,
        rules JSON,
        status ENUM('upcoming', 'ongoing', 'completed', 'grading') DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      'timetable_entries': `CREATE TABLE IF NOT EXISTS timetable_entries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room VARCHAR(50),
        academic_year_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      'sports_teams': `CREATE TABLE IF NOT EXISTS sports_teams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_name VARCHAR(255) NOT NULL,
        sport_type VARCHAR(100) NOT NULL,
        coach_id INT,
        description TEXT,
        image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      'sports_events': `CREATE TABLE IF NOT EXISTS sports_events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_name VARCHAR(255) NOT NULL,
        event_type VARCHAR(100),
        event_date DATE NOT NULL,
        location VARCHAR(255),
        description TEXT,
        image_url VARCHAR(255),
        status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      'sports_achievements': `CREATE TABLE IF NOT EXISTS sports_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        achievement_date DATE,
        student_id INT,
        team_id INT,
        event_id INT,
        position VARCHAR(50),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    };

    console.log('\n🔧 Creating missing tables...\n');
    for (const [tableName, createSQL] of Object.entries(requiredTables)) {
      try {
        await pool.query(createSQL);
        console.log(`✅ ${tableName} ready`);
      } catch (error) {
        console.log(`⚠️  ${tableName}: ${error.message}`);
      }
    }

    // Insert default academic year if not exists
    await pool.query(`
      INSERT IGNORE INTO academic_years (id, year_name, start_date, end_date, is_current) 
      VALUES (1, '2024-2025', '2024-09-01', '2025-06-30', TRUE)
    `);

    // Insert default subjects if not exists
    const [existingSubjects] = await pool.query('SELECT COUNT(*) as count FROM subjects');
    if (existingSubjects[0].count === 0) {
      await pool.query(`
        INSERT INTO subjects (code, name, description) VALUES
        ('SOD301', 'Web Development', 'Advanced web development course'),
        ('BDC301', 'Construction Management', 'Construction project management'),
        ('AUT301', 'Auto Electronics', 'Automotive electronics systems')
      `);
    }

    console.log('\n✅ Database schema is ready!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndFixSchema();

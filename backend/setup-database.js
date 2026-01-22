const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  let connection;

  try {
    console.log('🚀 Starting Database Setup...\n');

    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    // Create database if not exists
    console.log('📦 Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS school_management');
    await connection.query('USE school_management');
    console.log('✅ Database ready\n');

    // Create base tables
    console.log('📋 Creating base tables...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'teacher', 'dos', 'admin', 'parent') NOT NULL,
        avatar_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trade_classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        class_name VARCHAR(100),
        level VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES trade_classes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Base tables created\n');

    // Read and execute learning management schema
    console.log('📚 Creating learning management tables...');
    const lmsSchema = await fs.readFile(path.join(__dirname, 'scripts', 'learning-management-schema.sql'), 'utf8');
    const lmsStatements = lmsSchema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of lmsStatements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.log(`⚠️  Warning: ${err.message.substring(0, 100)}`);
          }
        }
      }
    }
    console.log('✅ Learning management tables created\n');

    // Read and execute advanced features schema
    console.log('🚀 Creating advanced features tables...');
    const advSchema = await fs.readFile(path.join(__dirname, 'scripts', 'advanced-features-schema.sql'), 'utf8');
    const advStatements = advSchema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of advStatements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.log(`⚠️  Warning: ${err.message.substring(0, 100)}`);
          }
        }
      }
    }
    console.log('✅ Advanced features tables created\n');

    // Insert sample data
    console.log('📝 Inserting sample data...');
    await connection.query(`
      INSERT IGNORE INTO users (id, name, email, password, role) VALUES
      (1, 'Admin User', 'admin@school.com', 'hashed_password', 'admin'),
      (2, 'John Teacher', 'teacher@school.com', 'hashed_password', 'teacher'),
      (3, 'Jane Student', 'student@school.com', 'hashed_password', 'student');

      INSERT IGNORE INTO subjects (id, name, code) VALUES
      (1, 'Mathematics', 'MATH101'),
      (2, 'Physics', 'PHY101'),
      (3, 'English', 'ENG101');

      INSERT IGNORE INTO trade_classes (id, name, class_name, level) VALUES
      (1, 'Class 10A', '10A', 'Grade 10'),
      (2, 'Class 10B', '10B', 'Grade 10');

      INSERT IGNORE INTO enrollments (student_id, class_id) VALUES
      (3, 1);

      INSERT IGNORE INTO ai_grading_models (id, model_name, model_type, version, accuracy_score) VALUES
      (1, 'Essay Grader v1', 'essay', '1.0', 85.5);

      INSERT IGNORE INTO achievement_badges (id, badge_name, badge_description, badge_category, rarity, points_value, unlock_criteria) VALUES
      (1, 'First Assignment', 'Complete your first assignment', 'academic', 'common', 10, '{"assignments_completed": 1}'),
      (2, 'Quiz Master', 'Complete 20 quizzes', 'academic', 'rare', 50, '{"quizzes_completed": 20}'),
      (3, 'Point Collector', 'Earn 1000 academic points', 'excellence', 'epic', 100, '{"academic_points": 1000}'),
      (4, 'Consistent Learner', 'Active for 30 days', 'consistency', 'rare', 75, '{"active_days": 30}');
    `);
    console.log('✅ Sample data inserted\n');

    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Total tables created: ${tables.length}\n`);

    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('📊 You can now run: node test-learning-management.js');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

setupDatabase();

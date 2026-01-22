const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
  await connection.query(`USE ${process.env.DB_NAME}`);

  const tables = [
    `CREATE TABLE IF NOT EXISTS roles (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) UNIQUE, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(100) UNIQUE, email VARCHAR(100) UNIQUE, password_hash VARCHAR(255), first_name VARCHAR(100), last_name VARCHAR(100), phone VARCHAR(20), date_of_birth DATE, gender ENUM('Male','Female'), role_id INT, student_id VARCHAR(50), parent_id INT, address TEXT, emergency_contact TEXT, medical_info TEXT, profile_image VARCHAR(255), is_active BOOLEAN DEFAULT true, last_login TIMESTAMP NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (role_id) REFERENCES roles(id))`,
    `CREATE TABLE IF NOT EXISTS admin_users (id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(100) UNIQUE, email VARCHAR(100) UNIQUE, password VARCHAR(255), first_name VARCHAR(100), last_name VARCHAR(100), role VARCHAR(50), last_login TIMESTAMP NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS teams (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100), sport_type VARCHAR(50), coach VARCHAR(100), captain VARCHAR(100), description TEXT, logo VARCHAR(255), status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS players (id INT PRIMARY KEY AUTO_INCREMENT, team_id INT, name VARCHAR(100), jersey_number INT, position VARCHAR(50), sport_type VARCHAR(50), status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (team_id) REFERENCES teams(id))`,
    `CREATE TABLE IF NOT EXISTS matches (id INT PRIMARY KEY AUTO_INCREMENT, home_team_id INT, away_team_id INT, sport_type VARCHAR(50), match_date DATE, start_time TIME, venue VARCHAR(100), home_score INT DEFAULT 0, away_score INT DEFAULT 0, status VARCHAR(20) DEFAULT 'scheduled', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (home_team_id) REFERENCES teams(id), FOREIGN KEY (away_team_id) REFERENCES teams(id))`,
    `CREATE TABLE IF NOT EXISTS trophies (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100), sport_type VARCHAR(50), year INT, date_won DATE, description TEXT, image VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS features (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100), description TEXT, icon VARCHAR(255), display_order INT DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS events (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100), description TEXT, type VARCHAR(50), start_date DATE, end_date DATE, venue VARCHAR(100), organizer VARCHAR(100), status VARCHAR(20) DEFAULT 'scheduled', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS event_images (id INT PRIMARY KEY AUTO_INCREMENT, event_id INT, image_url VARCHAR(255), is_primary BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (event_id) REFERENCES events(id))`,
    `CREATE TABLE IF NOT EXISTS news (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200), content TEXT, image_url VARCHAR(255), category VARCHAR(50), author_id INT, is_published BOOLEAN DEFAULT true, published_at TIMESTAMP, views INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS hero_slides (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200), subtitle TEXT, image_url VARCHAR(255), button_text VARCHAR(50), button_link VARCHAR(255), display_order INT DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS trades (id INT PRIMARY KEY AUTO_INCREMENT, trade_code VARCHAR(10) UNIQUE, trade_name VARCHAR(100), description TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS testimonials (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100), role VARCHAR(100), content TEXT, image VARCHAR(255), rating INT DEFAULT 5, is_published BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS achievements (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200), description TEXT, achievement_date DATE, category VARCHAR(50), is_featured BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS courses (id INT PRIMARY KEY AUTO_INCREMENT, course_code VARCHAR(20) UNIQUE, course_name VARCHAR(200), description TEXT, credits INT DEFAULT 3, trade_level_id INT, instructor_id INT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS trade_levels (id INT PRIMARY KEY AUTO_INCREMENT, trade_code VARCHAR(10), trade_name VARCHAR(100), level_number INT, level_suffix VARCHAR(10), full_name VARCHAR(200), description TEXT, capacity INT DEFAULT 30, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS academic_years (id INT PRIMARY KEY AUTO_INCREMENT, year_name VARCHAR(50), start_date DATE, end_date DATE, is_active BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS trade_classes (id INT PRIMARY KEY AUTO_INCREMENT, trade_level_id INT, academic_year_id INT, class_name VARCHAR(100), capacity INT DEFAULT 30, current_enrollment INT DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS enrollments (id INT PRIMARY KEY AUTO_INCREMENT, student_id INT, class_id INT, course_id INT, academic_year_id INT, enrollment_date DATE, status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS assignments (id INT PRIMARY KEY AUTO_INCREMENT, course_id INT, class_id INT, student_id INT, title VARCHAR(200), description TEXT, due_date DATE, total_marks INT DEFAULT 100, status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS assignment_submissions (id INT PRIMARY KEY AUTO_INCREMENT, assignment_id INT, student_id INT, content TEXT, submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, score INT, feedback TEXT, status VARCHAR(20) DEFAULT 'submitted')`,
    `CREATE TABLE IF NOT EXISTS grades (id INT PRIMARY KEY AUTO_INCREMENT, student_id INT, course_id INT, exam_id INT, assignment_id INT, grade DECIMAL(5,2), score DECIMAL(5,2), remarks TEXT, graded_by VARCHAR(100), graded_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS exams (id INT PRIMARY KEY AUTO_INCREMENT, course_id INT, exam_name VARCHAR(200), exam_type VARCHAR(50), exam_date DATE, start_time TIME, duration INT, total_marks INT DEFAULT 100, room VARCHAR(50), is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS attendance (id INT PRIMARY KEY AUTO_INCREMENT, student_id INT, course_id INT, date DATE, status ENUM('present','absent','late','excused') DEFAULT 'present', remarks TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS support_tickets (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, category VARCHAR(50), priority VARCHAR(20), subject VARCHAR(200), description TEXT, status VARCHAR(20) DEFAULT 'open', resolved_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS ticket_responses (id INT PRIMARY KEY AUTO_INCREMENT, ticket_id INT, user_id INT, message TEXT, is_staff BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS knowledge_base (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200), content TEXT, category VARCHAR(50), is_published BOOLEAN DEFAULT true, views INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS contact_submissions (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100), email VARCHAR(100), phone VARCHAR(20), department VARCHAR(50), subject VARCHAR(200), message TEXT, priority VARCHAR(20) DEFAULT 'normal', attachment VARCHAR(255), status VARCHAR(20) DEFAULT 'pending', response TEXT, responded_at TIMESTAMP NULL, responded_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS callback_requests (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100), phone VARCHAR(20), preferred_time VARCHAR(50), preferred_date DATE, reason TEXT, status VARCHAR(20) DEFAULT 'pending', notes TEXT, handled_by INT, handled_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS gamification_points (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, points INT, activity_type VARCHAR(50), description TEXT, earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS badges (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100), description TEXT, icon VARCHAR(255), points_required INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS user_badges (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, badge_id INT, earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS study_groups (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100), description TEXT, subject VARCHAR(100), max_members INT DEFAULT 50, created_by INT, privacy VARCHAR(20) DEFAULT 'public', status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS group_members (id INT PRIMARY KEY AUTO_INCREMENT, group_id INT, user_id INT, role VARCHAR(20) DEFAULT 'member', joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS group_posts (id INT PRIMARY KEY AUTO_INCREMENT, group_id INT, user_id INT, content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS group_post_comments (id INT PRIMARY KEY AUTO_INCREMENT, post_id INT, user_id INT, comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS group_post_likes (id INT PRIMARY KEY AUTO_INCREMENT, post_id INT, user_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS sports_gallery (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200), sport_type VARCHAR(50), image_url VARCHAR(255), event_date DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS player_stats (id INT PRIMARY KEY AUTO_INCREMENT, player_id INT, match_id INT, goals INT DEFAULT 0, assists INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
  ];

  for (const table of tables) {
    await connection.query(table);
  }

  // Insert default roles
  await connection.query(`INSERT IGNORE INTO roles (name, description) VALUES 
    ('admin', 'System Administrator'),
    ('teacher', 'Teacher/Instructor'),
    ('student', 'Student'),
    ('parent', 'Parent/Guardian'),
    ('dos', 'Director of Studies')`);

  // Insert default admin
  const bcrypt = require('bcryptjs');
  const adminPass = await bcrypt.hash('admin123', 10);
  await connection.query(`INSERT IGNORE INTO admin_users (username, email, password, first_name, last_name, role) VALUES ('admin', 'admin@school.rw', ?, 'System', 'Admin', 'admin')`, [adminPass]);

  console.log('✅ Database setup complete');
  await connection.end();
}

setupDatabase().catch(console.error);

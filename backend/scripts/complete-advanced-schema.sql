-- Complete Advanced School Management System Database Schema

-- Disable foreign key checks for clean table drops
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS exam_registrations;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS timetable_entries;
DROP TABLE IF EXISTS class_subjects;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS fee_payments;
DROP TABLE IF EXISTS fee_structures;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS stock_items;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS parent_student_links;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS sports_achievements;
DROP TABLE IF EXISTS sports_events;
DROP TABLE IF EXISTS sports_teams;
DROP TABLE IF EXISTS trade_courses;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Users table with comprehensive role support
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'headmaster', 'director_study', 'director_discipline', 'teacher', 'student', 'parent', 'accountant', 'stock_manager') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  profile_image VARCHAR(255),
  student_code VARCHAR(50) UNIQUE,
  admission_date DATE,
  trade ENUM('SOD', 'BDC', 'AUT', 'General'),
  level VARCHAR(50),
  class_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_student_code (student_code),
  INDEX idx_trade (trade),
  INDEX idx_level (level)
);

-- Academic Years
CREATE TABLE academic_years (
  id INT PRIMARY KEY AUTO_INCREMENT,
  year_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade Courses
CREATE TABLE trade_courses (
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
);

-- Subjects
CREATE TABLE subjects (
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
);

-- Classes
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_name VARCHAR(100) NOT NULL,
  trade ENUM('SOD', 'BDC', 'AUT', 'General') NOT NULL,
  level VARCHAR(50) NOT NULL,
  academic_year_id INT,
  class_teacher_id INT,
  room_number VARCHAR(50),
  capacity INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (class_teacher_id) REFERENCES users(id)
);

-- Enrollments
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('active', 'completed', 'dropped', 'transferred') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  UNIQUE KEY unique_enrollment (student_id, class_id, academic_year_id)
);

-- Class Subjects (Many-to-Many)
CREATE TABLE class_subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT,
  academic_year_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  UNIQUE KEY unique_class_subject (class_id, subject_id, academic_year_id)
);

-- Timetable
CREATE TABLE timetable_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(50),
  academic_year_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Assignments
CREATE TABLE assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  due_date DATETIME NOT NULL,
  total_marks INT NOT NULL,
  attachment_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Grades
CREATE TABLE grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  exam_type ENUM('quiz', 'midterm', 'final', 'practical', 'assignment') NOT NULL,
  obtained_marks DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL,
  grade_letter VARCHAR(5),
  remarks TEXT,
  graded_by INT,
  graded_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (graded_by) REFERENCES users(id)
);

-- Attendance
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  subject_id INT,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  remarks TEXT,
  marked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE KEY unique_attendance (student_id, class_id, subject_id, attendance_date)
);

-- Exams
CREATE TABLE exams (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES trade_courses(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Exam Registrations
CREATE TABLE exam_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('registered', 'appeared', 'absent', 'cancelled') DEFAULT 'registered',
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  UNIQUE KEY unique_registration (exam_id, student_id)
);

-- Exam Results
CREATE TABLE exam_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  obtained_marks DECIMAL(5,2),
  grade_letter VARCHAR(5),
  percentage DECIMAL(5,2),
  rank INT,
  remarks TEXT,
  result_date DATETIME,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  UNIQUE KEY unique_result (exam_id, student_id)
);

-- Fee Structures
CREATE TABLE fee_structures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trade ENUM('SOD', 'BDC', 'AUT', 'General') NOT NULL,
  level VARCHAR(50) NOT NULL,
  academic_year_id INT NOT NULL,
  tuition_fee DECIMAL(10,2) NOT NULL,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  exam_fee DECIMAL(10,2) DEFAULT 0,
  library_fee DECIMAL(10,2) DEFAULT 0,
  lab_fee DECIMAL(10,2) DEFAULT 0,
  other_fees DECIMAL(10,2) DEFAULT 0,
  total_fee DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Fee Payments
CREATE TABLE fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('cash', 'bank_transfer', 'mobile_money', 'card') NOT NULL,
  transaction_id VARCHAR(100),
  receipt_number VARCHAR(100) UNIQUE,
  payment_for VARCHAR(255),
  remarks TEXT,
  processed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Stock Items
CREATE TABLE stock_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category ENUM('stationery', 'equipment', 'furniture', 'electronics', 'books', 'uniforms', 'other') NOT NULL,
  description TEXT,
  unit VARCHAR(50),
  unit_price DECIMAL(10,2),
  quantity_in_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  location VARCHAR(100),
  supplier VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock Movements
CREATE TABLE stock_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  total_value DECIMAL(10,2),
  reference_number VARCHAR(100),
  reason TEXT,
  moved_by INT,
  movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES stock_items(id),
  FOREIGN KEY (moved_by) REFERENCES users(id)
);

-- Parent-Student Links
CREATE TABLE parent_student_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship ENUM('father', 'mother', 'guardian', 'other') NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  UNIQUE KEY unique_link (parent_id, student_id)
);

-- Messages
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- Notifications
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sports Teams
CREATE TABLE sports_teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_name VARCHAR(255) NOT NULL,
  sport_type VARCHAR(100) NOT NULL,
  coach_id INT,
  description TEXT,
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES users(id)
);

-- Sports Events
CREATE TABLE sports_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  event_date DATE NOT NULL,
  location VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255),
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sports Achievements
CREATE TABLE sports_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  achievement_date DATE,
  student_id INT,
  team_id INT,
  event_id INT,
  position VARCHAR(50),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES sports_teams(id),
  FOREIGN KEY (event_id) REFERENCES sports_events(id)
);

-- Teams (Management Teams)
CREATE TABLE teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  head_name VARCHAR(255) NOT NULL,
  team_size INT DEFAULT 1,
  description TEXT,
  responsibilities JSON,
  image_url VARCHAR(255),
  avatar_emoji VARCHAR(10),
  color_gradient VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default academic year
INSERT INTO academic_years (year_name, start_date, end_date, is_current) 
VALUES ('2024-2025', '2024-09-01', '2025-06-30', TRUE);

-- Insert default subjects
INSERT INTO subjects (code, name, name_rw, trade, level, credits) VALUES
('SOD301', 'Web Development', 'Iterambere rya Urubuga', 'SOD', 'Level 4', 4),
('SOD302', 'Database Management', 'Gucunga Ububiko', 'SOD', 'Level 3', 3),
('SOD401', 'Full Stack Development', 'Iterambere Ryuzuye', 'SOD', 'Level 5', 5),
('BDC301', 'Construction Management', 'Imicungire y\'Ubwubatsi', 'BDC', 'Level 4', 4),
('BDC201', 'Structural Design', 'Gushushanya Imyubakire', 'BDC', 'Level 3', 3),
('AUT301', 'Auto Electronics', 'Elegitoronike y\'Imodoka', 'AUT', 'Level 4', 4),
('AUT201', 'Engine Systems', 'Sisitemu za Moteri', 'AUT', 'Level 3', 3),
('GEN101', 'Business Communication', 'Itumanaho mu Bucuruzi', 'General', 'Level 3', 2);

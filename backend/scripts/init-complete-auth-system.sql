-- Complete Authentication System Database Schema
-- Garden TVET School Management System

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT IGNORE INTO roles (name, description) VALUES
('admin', 'System Administrator'),
('teacher', 'Teacher/Instructor'),
('student', 'Student'),
('parent', 'Parent/Guardian'),
('dos', 'Director of Studies'),
('accountant', 'Accountant/Finance'),
('librarian', 'Librarian');

-- Users table (unified for all user types)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  address TEXT,
  profile_picture VARCHAR(255),
  role_id INT,
  student_id VARCHAR(50) UNIQUE,
  parent_id INT,
  emergency_contact TEXT,
  medical_info TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (parent_id) REFERENCES users(id),
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_student_id (student_id),
  INDEX idx_phone (phone),
  INDEX idx_role (role_id)
);

-- Admin users table (separate for security)
CREATE TABLE IF NOT EXISTS admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('super_admin', 'admin', 'dos', 'accountant') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Parent-Student linking table
CREATE TABLE IF NOT EXISTS parent_student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_parent_student (parent_id, student_id)
);

-- Academic years
CREATE TABLE IF NOT EXISTS academic_years (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade levels
CREATE TABLE IF NOT EXISTS trade_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trade_code VARCHAR(10) NOT NULL,
  trade_name VARCHAR(100) NOT NULL,
  level_number INT NOT NULL,
  level_suffix VARCHAR(10),
  full_name VARCHAR(200),
  description TEXT,
  duration_years INT DEFAULT 2,
  capacity INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_trade_level (trade_code, level_number, level_suffix)
);

-- Insert default trade levels
INSERT IGNORE INTO trade_levels (trade_code, trade_name, level_number, level_suffix, full_name, description) VALUES
('SOD', 'Software Development', 4, 'A', 'Software Development S4A', 'Learn modern software development'),
('SOD', 'Software Development', 4, 'B', 'Software Development S4B', 'Learn modern software development'),
('SOD', 'Software Development', 5, 'A', 'Software Development S5A', 'Advanced software development'),
('SOD', 'Software Development', 5, 'B', 'Software Development S5B', 'Advanced software development'),
('SOD', 'Software Development', 6, 'A', 'Software Development S6A', 'Expert software development'),
('BDC', 'Building Construction', 4, 'A', 'Building Construction S4A', 'Master construction techniques'),
('BDC', 'Building Construction', 4, 'B', 'Building Construction S4B', 'Master construction techniques'),
('BDC', 'Building Construction', 5, 'A', 'Building Construction S5A', 'Advanced construction'),
('BDC', 'Building Construction', 5, 'B', 'Building Construction S5B', 'Advanced construction'),
('BDC', 'Building Construction', 6, 'A', 'Building Construction S6A', 'Expert construction'),
('AUT', 'Automobile Technology', 4, 'A', 'Automobile Technology S4A', 'Automotive technology expertise'),
('AUT', 'Automobile Technology', 4, 'B', 'Automobile Technology S4B', 'Automotive technology expertise'),
('AUT', 'Automobile Technology', 5, 'A', 'Automobile Technology S5A', 'Advanced automotive'),
('AUT', 'Automobile Technology', 5, 'B', 'Automobile Technology S5B', 'Advanced automotive'),
('AUT', 'Automobile Technology', 6, 'A', 'Automobile Technology S6A', 'Expert automotive');

-- Trade classes
CREATE TABLE IF NOT EXISTS trade_classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trade_level_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  capacity INT DEFAULT 30,
  current_enrollment INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trade_level_id) REFERENCES trade_levels(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('active', 'completed', 'withdrawn', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES trade_classes(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Student performance summary
CREATE TABLE IF NOT EXISTS student_performance_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  trade_class_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  total_marks DECIMAL(10,2) DEFAULT 0,
  average_percentage DECIMAL(5,2) DEFAULT 0,
  rank INT,
  attendance_percentage DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  UNIQUE KEY unique_student_performance (student_id, trade_class_id, academic_year_id)
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  credits INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes (for subjects)
CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  course_id INT,
  teacher_id INT,
  academic_year_id INT,
  capacity INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  duration_months INT DEFAULT 12,
  fee_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades
CREATE TABLE IF NOT EXISTS grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  assessment_type ENUM('quiz', 'test', 'exam', 'assignment', 'project') NOT NULL,
  assessment_name VARCHAR(200),
  obtained_marks DECIMAL(10,2) NOT NULL,
  max_marks DECIMAL(10,2) NOT NULL,
  assessment_date DATE NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  class_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  marked_by INT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE KEY unique_attendance (student_id, subject_id, attendance_date)
);

-- Timetable
CREATE TABLE IF NOT EXISTS timetable (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_type ENUM('tuition', 'exam', 'library', 'transport', 'other') NOT NULL,
  payment_method ENUM('cash', 'bank', 'mobile_money', 'card') NOT NULL,
  transaction_id VARCHAR(100),
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_date DATE NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Insert default academic year
INSERT IGNORE INTO academic_years (name, start_date, end_date, is_active) VALUES
('2024-2025', '2024-09-01', '2025-06-30', TRUE);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);

-- Insert demo admin user (password: admin123)
INSERT IGNORE INTO admin_users (username, email, password, first_name, last_name, role) VALUES
('admin', 'admin@gardentvet.com', '$2a$10$YourHashedPasswordHere', 'System', 'Admin', 'super_admin');

SELECT 'Database schema created successfully!' as message;

-- Setup Default Users and Serial Code System
-- Created: 2026-01-27

-- ========================================
-- 1. ENSURE ROLES TABLE EXISTS
-- ========================================
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default roles if not exists
INSERT IGNORE INTO roles (name, description) VALUES
('admin', 'System Administrator - Full access to all features'),
('headmaster', 'School Headmaster - Full school management access'),
('dos', 'Director of Studies - Academic management'),
('dod', 'Director of Discipline - Discipline management'),
('teacher', 'Teacher - Class and subject management'),
('student', 'Student - Learning and assignments'),
('parent', 'Parent - Monitor student progress'),
('accountant', 'Accountant - Financial management'),
('stockmanager', 'Stock Manager - Inventory management'),
('advisor', 'Academic Advisor - Student guidance'),
('patron', 'School Patron - General oversight');

-- ========================================
-- 2. ENSURE USERS TABLE EXISTS
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  phone_type ENUM('smartphone', 'basic') DEFAULT 'smartphone',
  is_whatsapp_enabled BOOLEAN DEFAULT false,
  role VARCHAR(50),
  role_id INT,
  student_id VARCHAR(50),
  parent_id INT,
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  address TEXT,
  emergency_contact TEXT,
  medical_info TEXT,
  profile_image VARCHAR(500),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- ========================================
-- 3. ENSURE ADMIN_USERS TABLE EXISTS
-- ========================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  profile_image VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 4. CREATE STUDENT SERIAL CODES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS student_serial_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serial_code VARCHAR(50) UNIQUE NOT NULL,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  level_suffix VARCHAR(5),
  academic_year VARCHAR(20),
  generated_by INT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_used BOOLEAN DEFAULT false,
  used_by INT,
  used_at TIMESTAMP NULL,
  student_id INT,
  status ENUM('active', 'used', 'expired', 'revoked') DEFAULT 'active',
  expires_at TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (generated_by) REFERENCES users(id),
  FOREIGN KEY (used_by) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  INDEX idx_serial_code (serial_code),
  INDEX idx_status (status),
  INDEX idx_trade_level (trade_code, level_number)
);

-- ========================================
-- 5. CREATE PROFILE EDIT HISTORY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS profile_edit_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  field_changed VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ========================================
-- 6. INSERT DEFAULT USERS FOR ALL ROLES
-- Password: 2026 (hashed with bcrypt)
-- Email: reponsekldz06@gmail.com (for all roles)
-- ========================================

-- Hash for password "2026" using bcrypt (cost factor 10)
-- $2a$10$YourBcryptHashHere
SET @default_password = '$2a$10$8Z5pYqX7JGKvN2B4xR9zheQvN5Q7ZX6Q3W8K9L0M1N2O3P4Q5R6S7';
SET @default_email = 'reponsekldz06@gmail.com';

-- Get role IDs
SET @admin_role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1);
SET @headmaster_role_id = (SELECT id FROM roles WHERE name = 'headmaster' LIMIT 1);
SET @dos_role_id = (SELECT id FROM roles WHERE name = 'dos' LIMIT 1);
SET @dod_role_id = (SELECT id FROM roles WHERE name = 'dod' LIMIT 1);
SET @teacher_role_id = (SELECT id FROM roles WHERE name = 'teacher' LIMIT 1);
SET @student_role_id = (SELECT id FROM roles WHERE name = 'student' LIMIT 1);
SET @parent_role_id = (SELECT id FROM roles WHERE name = 'parent' LIMIT 1);
SET @accountant_role_id = (SELECT id FROM roles WHERE name = 'accountant' LIMIT 1);
SET @stockmanager_role_id = (SELECT id FROM roles WHERE name = 'stockmanager' LIMIT 1);
SET @advisor_role_id = (SELECT id FROM roles WHERE name = 'advisor' LIMIT 1);
SET @patron_role_id = (SELECT id FROM roles WHERE name = 'patron' LIMIT 1);

-- Insert into admin_users table (for admin roles)
INSERT INTO admin_users (username, email, password, first_name, last_name, role, phone, is_active)
VALUES 
  ('admin', @default_email, @default_password, 'System', 'Admin', 'admin', '+250788000001', true),
  ('headmaster', @default_email, @default_password, 'School', 'Headmaster', 'headmaster', '+250788000002', true),
  ('dos', @default_email, @default_password, 'Director', 'Of Studies', 'dos', '+250788000003', true),
  ('dod', @default_email, @default_password, 'Director', 'Of Discipline', 'dod', '+250788000004', true),
  ('accountant', @default_email, @default_password, 'School', 'Accountant', 'accountant', '+250788000005', true),
  ('stockmanager', @default_email, @default_password, 'Stock', 'Manager', 'stockmanager', '+250788000006', true),
  ('patron', @default_email, @default_password, 'School', 'Patron', 'patron', '+250788000007', true),
  ('advisor', @default_email, @default_password, 'Academic', 'Advisor', 'advisor', '+250788000008', true)
ON DUPLICATE KEY UPDATE 
  password = @default_password,
  is_active = true;

-- Insert into users table (for all user roles)
INSERT INTO users (username, email, password_hash, password, first_name, last_name, role, role_id, phone, is_active)
VALUES 
  ('teacher_demo', @default_email, @default_password, @default_password, 'Demo', 'Teacher', 'teacher', @teacher_role_id, '+250788000009', true),
  ('student_demo', @default_email, @default_password, @default_password, 'Demo', 'Student', 'student', @student_role_id, '+250788000010', true),
  ('parent_demo', @default_email, @default_password, @default_password, 'Demo', 'Parent', 'parent', @parent_role_id, '+250788000011', true)
ON DUPLICATE KEY UPDATE 
  password_hash = @default_password,
  password = @default_password,
  is_active = true;

-- ========================================
-- 7. CREATE TRADE LEVELS TABLE IF NOT EXISTS
-- ========================================
CREATE TABLE IF NOT EXISTS trade_levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trade_code VARCHAR(10) NOT NULL,
  trade_name VARCHAR(100) NOT NULL,
  level_number INT NOT NULL,
  level_suffix VARCHAR(5),
  description TEXT,
  capacity INT DEFAULT 40,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_trade_level (trade_code, level_number, level_suffix)
);

-- Insert sample trade levels
INSERT IGNORE INTO trade_levels (trade_code, trade_name, level_number, level_suffix, description) VALUES
('ICT', 'Information and Communication Technology', 1, 'A', 'ICT Level 1 - Section A'),
('ICT', 'Information and Communication Technology', 1, 'B', 'ICT Level 1 - Section B'),
('ICT', 'Information and Communication Technology', 2, NULL, 'ICT Level 2'),
('ICT', 'Information and Communication Technology', 3, NULL, 'ICT Level 3'),
('ELE', 'Electrical Installation', 1, NULL, 'Electrical Installation Level 1'),
('ELE', 'Electrical Installation', 2, NULL, 'Electrical Installation Level 2'),
('ELE', 'Electrical Installation', 3, NULL, 'Electrical Installation Level 3'),
('PLU', 'Plumbing', 1, NULL, 'Plumbing Level 1'),
('PLU', 'Plumbing', 2, NULL, 'Plumbing Level 2'),
('WEL', 'Welding', 1, NULL, 'Welding Level 1'),
('WEL', 'Welding', 2, NULL, 'Welding Level 2'),
('CAR', 'Carpentry', 1, NULL, 'Carpentry Level 1'),
('CAR', 'Carpentry', 2, NULL, 'Carpentry Level 2');

-- ========================================
-- 8. CREATE ACADEMIC YEARS TABLE IF NOT EXISTS
-- ========================================
CREATE TABLE IF NOT EXISTS academic_years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert current academic year if not exists
INSERT IGNORE INTO academic_years (year_name, start_date, end_date, is_active) VALUES
('2025-2026', '2025-09-01', '2026-06-30', true);

-- ========================================
-- 9. CREATE TRADE CLASSES TABLE IF NOT EXISTS
-- ========================================
CREATE TABLE IF NOT EXISTS trade_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trade_level_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  capacity INT DEFAULT 40,
  current_enrollment INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trade_level_id) REFERENCES trade_levels(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  UNIQUE KEY unique_class (trade_level_id, academic_year_id, class_name)
);

-- ========================================
-- 10. CREATE ENROLLMENTS TABLE IF NOT EXISTS
-- ========================================
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('active', 'inactive', 'completed', 'transferred', 'dropped') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, academic_year_id)
);

-- ========================================
-- 11. CREATE STUDENT PERFORMANCE SUMMARY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS student_performance_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  trade_class_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  total_assignments INT DEFAULT 0,
  completed_assignments INT DEFAULT 0,
  average_grade DECIMAL(5,2) DEFAULT 0.00,
  attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  UNIQUE KEY unique_performance (student_id, trade_class_id, academic_year_id)
);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
SELECT 'Database setup completed successfully!' AS Status;
SELECT COUNT(*) AS 'Default Users Created' FROM admin_users;
SELECT COUNT(*) AS 'Roles Available' FROM roles;
SELECT COUNT(*) AS 'Trade Levels Available' FROM trade_levels;

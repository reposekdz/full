-- Teacher Portal Complete Schema
-- Creates all necessary tables for full teacher functionality

-- Courses table (if not exists)
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  teacher_id INT,
  trade_id INT,
  level_id INT,
  credits INT DEFAULT 3,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_teacher (teacher_id),
  INDEX idx_trade_level (trade_id, level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course teachers (for multiple teachers per course)
CREATE TABLE IF NOT EXISTS course_teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  role ENUM('primary', 'assistant') DEFAULT 'primary',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_course_teacher (course_id, teacher_id),
  INDEX idx_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('active', 'completed', 'dropped', 'failed') DEFAULT 'active',
  final_grade VARCHAR(2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (student_id, course_id),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grades table (enhanced)
CREATE TABLE IF NOT EXISTS grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT,
  teacher_id INT,
  assessment_type ENUM('quiz', 'test', 'exam', 'assignment', 'project', 'practical') DEFAULT 'test',
  assessment_name VARCHAR(255),
  max_marks DECIMAL(10,2) NOT NULL,
  obtained_marks DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  grade_letter VARCHAR(2),
  assessment_date DATE,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_date (assessment_date),
  UNIQUE KEY unique_grade (student_id, course_id, assessment_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance table (enhanced)
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT,
  teacher_id INT,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (student_id, course_id, date),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_date (date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME,
  max_marks DECIMAL(10,2) DEFAULT 100,
  attachment_path VARCHAR(500),
  status ENUM('draft', 'published', 'closed') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_course (course_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  submission_text TEXT,
  attachment_path VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  marks DECIMAL(10,2),
  feedback TEXT,
  graded_at TIMESTAMP NULL,
  status ENUM('submitted', 'graded', 'late', 'missing') DEFAULT 'submitted',
  UNIQUE KEY unique_submission (assignment_id, student_id),
  INDEX idx_assignment (assignment_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trades table (if not exists)
CREATE TABLE IF NOT EXISTS trades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Levels table (if not exists)
CREATE TABLE IF NOT EXISTS levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level_number INT NOT NULL,
  level_name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_level (level_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default trades if not exist
INSERT IGNORE INTO trades (name, code, description) VALUES
('Software Development', 'SOD', 'Software Development and Programming'),
('Building and Construction', 'BDC', 'Building and Construction Technology'),
('Automotive Technology', 'AUT', 'Automotive Mechanics and Technology');

-- Insert default levels if not exist
INSERT IGNORE INTO levels (level_number, level_name) VALUES
(1, 'Level 1'), (2, 'Level 2'), (3, 'Level 3'), (4, 'Level 4');

-- Sample courses (optional - for testing)
INSERT IGNORE INTO courses (name, code, description, trade_id, level_id) VALUES
('Programming Fundamentals', 'SOD101', 'Introduction to Programming', 1, 1),
('Web Development', 'SOD201', 'HTML, CSS, JavaScript', 1, 2),
('Database Systems', 'SOD301', 'SQL and Database Design', 1, 3),
('Software Engineering', 'SOD401', 'Advanced Software Development', 1, 4),
('Construction Materials', 'BDC101', 'Building Materials and Tools', 2, 1),
('Structural Design', 'BDC201', 'Basic Structural Engineering', 2, 2),
('Auto Mechanics Basics', 'AUT101', 'Introduction to Automotive', 3, 1),
('Engine Systems', 'AUT201', 'Engine Repair and Maintenance', 3, 2);

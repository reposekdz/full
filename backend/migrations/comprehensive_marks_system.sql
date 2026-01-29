-- =====================================================
-- COMPREHENSIVE MARKS MANAGEMENT SYSTEM
-- Dynamic assessment types, auto-calculation, reports
-- =====================================================

-- Assessment Categories (Quiz, Homework, Midterm, Final, etc.)
CREATE TABLE IF NOT EXISTS assessment_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  max_marks DECIMAL(5,2) DEFAULT 100,
  weight DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default assessment categories
INSERT INTO assessment_categories (name, code, description, max_marks, weight, display_order) VALUES
('Quiz', 'QUIZ', 'Short quizzes and tests', 20, 20, 1),
('Homework', 'HOMEWORK', 'Homework assignments', 10, 10, 2),
('Midterm Exam', 'MIDTERM', 'Mid-semester examination', 30, 30, 3),
('Final Exam', 'FINAL', 'End of semester examination', 40, 40, 4),
('Project', 'PROJECT', 'Class projects and presentations', 20, 15, 5),
('Practical', 'PRACTICAL', 'Practical/Workshop work', 25, 25, 6),
('Class Participation', 'PARTICIPATION', 'Class participation and engagement', 10, 5, 7),
('Assignment', 'ASSIGNMENT', 'Written assignments', 15, 10, 8)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Student Marks (Flexible marks entry from all teachers)
CREATE TABLE IF NOT EXISTS student_marks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year_id INT,
  term VARCHAR(20) DEFAULT 'Term 1',
  
  -- Assessment Info
  assessment_category VARCHAR(50) NOT NULL,
  assessment_name VARCHAR(200) NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL,
  obtained_marks DECIMAL(5,2) NOT NULL DEFAULT 0,
  assessment_date DATE,
  
  -- Teacher Info
  teacher_id INT NOT NULL,
  
  -- Additional Info
  remarks TEXT,
  source_type VARCHAR(50),
  source_id INT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_subject (subject_id),
  INDEX idx_class (class_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_academic_year (academic_year_id),
  INDEX idx_term (term),
  INDEX idx_assessment (assessment_category),
  INDEX idx_date (assessment_date),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student Subject Performance (Aggregated by subject)
CREATE TABLE IF NOT EXISTS student_subject_performance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  term VARCHAR(20) DEFAULT 'Term 1',
  academic_year VARCHAR(20),
  
  -- Aggregated Marks
  total_marks DECIMAL(7,2) DEFAULT 0,
  total_max DECIMAL(7,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  grade VARCHAR(5),
  grade_points DECIMAL(3,2) DEFAULT 0,
  
  -- Teacher Info
  teacher_id INT,
  teacher_name VARCHAR(200),
  remarks TEXT,
  
  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_student_subject_term (student_id, subject_id, term, academic_year),
  INDEX idx_student (student_id),
  INDEX idx_subject (subject_id),
  INDEX idx_term (term),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default academic year
INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES
('2024-2025', '2024-09-01', '2025-06-30', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Report Cards (Auto-generated comprehensive reports)
CREATE TABLE IF NOT EXISTS report_cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term VARCHAR(20) NOT NULL,
  
  -- Academic Summary
  total_subjects INT DEFAULT 0,
  average_percentage DECIMAL(5,2) DEFAULT 0,
  overall_grade VARCHAR(5),
  gpa DECIMAL(3,2) DEFAULT 0,
  class_rank INT,
  
  -- Attendance Summary
  total_days INT DEFAULT 0,
  present_days INT DEFAULT 0,
  absent_days INT DEFAULT 0,
  late_days INT DEFAULT 0,
  attendance_rate DECIMAL(5,2) DEFAULT 100,
  
  -- Discipline Summary
  total_incidents INT DEFAULT 0,
  conduct_score DECIMAL(5,2) DEFAULT 100,
  conduct_grade VARCHAR(5) DEFAULT 'A',
  
  -- Finance Summary
  total_fees DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  
  -- Class Teacher Comments
  class_teacher_id INT,
  class_teacher_comments TEXT,
  
  -- Headmaster Comments
  headmaster_comments TEXT,
  
  -- Status
  status ENUM('draft', 'finalized', 'issued') DEFAULT 'draft',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finalized_at TIMESTAMP NULL,
  issued_at TIMESTAMP NULL,
  
  UNIQUE KEY unique_student_term (student_id, academic_year, term),
  INDEX idx_student (student_id),
  INDEX idx_term (academic_year, term),
  INDEX idx_status (status),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent Help Requests (for linking code requests)
CREATE TABLE IF NOT EXISTS parent_help_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_name VARCHAR(200) NOT NULL,
  message TEXT,
  preferred_contact VARCHAR(50) DEFAULT 'email',
  status ENUM('pending', 'resolved', 'cancelled') DEFAULT 'pending',
  response_message TEXT,
  responded_by INT,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_parent (parent_id),
  INDEX idx_status (status),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Teacher Subject Assignments (to track who teaches what)
CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  subject_id INT NOT NULL,
  trade_class_id INT NOT NULL,
  trade_level_id INT,
  academic_year_id INT NOT NULL,
  assignment_type ENUM('primary', 'assistant', 'substitute') DEFAULT 'primary',
  weekly_periods INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  assignment_date DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_assignment (teacher_id, subject_id, trade_class_id, academic_year_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_subject (subject_id),
  INDEX idx_class (trade_class_id),
  INDEX idx_active (is_active),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  credits INT DEFAULT 3,
  is_core BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default subjects
INSERT INTO subjects (name, code, description, credits, is_core) VALUES
('Mathematics', 'MATH', 'Core Mathematics', 4, TRUE),
('English', 'ENG', 'English Language', 4, TRUE),
('Kinyarwanda', 'KIN', 'Kinyarwanda Language', 3, TRUE),
('Physics', 'PHY', 'Physics', 3, FALSE),
('Chemistry', 'CHEM', 'Chemistry', 3, FALSE),
('Biology', 'BIO', 'Biology', 3, FALSE),
('History', 'HIST', 'History', 2, FALSE),
('Geography', 'GEO', 'Geography', 2, FALSE),
('Computer Science', 'CS', 'Computer Science', 3, FALSE),
('Technical Drawing', 'TD', 'Technical Drawing', 3, FALSE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Parent-Student linking table
CREATE TABLE IF NOT EXISTS parent_student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
  is_primary BOOLEAN DEFAULT TRUE,
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_link (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enrollments (Students in classes)
CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year_id INT,
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('active', 'inactive', 'transferred', 'graduated') DEFAULT 'active',
  
  UNIQUE KEY unique_enrollment (student_id, class_id, academic_year_id),
  INDEX idx_student (student_id),
  INDEX idx_class (class_id),
  INDEX idx_status (status),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

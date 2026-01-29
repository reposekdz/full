-- Advanced Parent Management System Database Schema

-- 1. Enhanced Parent-Student Connection
CREATE TABLE IF NOT EXISTS parent_student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type ENUM('father', 'mother', 'guardian', 'other') NOT NULL,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_parent_student (parent_id, student_id)
);

-- 2. Behavior Records
CREATE TABLE IF NOT EXISTS behavior_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  type ENUM('positive', 'negative', 'neutral') NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  points INT DEFAULT 0,
  recorded_by INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Homework Assignments
CREATE TABLE IF NOT EXISTS homework (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  class_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME NOT NULL,
  total_points INT DEFAULT 100,
  attachments TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Homework Submissions
CREATE TABLE IF NOT EXISTS homework_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  homework_id INT NOT NULL,
  student_id INT NOT NULL,
  submission_text TEXT,
  attachments TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('submitted', 'late', 'graded', 'missing') DEFAULT 'submitted',
  grade INT,
  feedback TEXT,
  graded_by INT,
  graded_at TIMESTAMP NULL,
  FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Meeting Requests
CREATE TABLE IF NOT EXISTS meeting_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  approved_date DATE,
  approved_time TIME,
  meeting_link VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Student Goals
CREATE TABLE IF NOT EXISTS student_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('academic', 'behavioral', 'attendance', 'other') NOT NULL,
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'completed', 'failed', 'cancelled') DEFAULT 'active',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Health Records
CREATE TABLE IF NOT EXISTS health_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  record_type ENUM('medical', 'vaccination', 'allergy', 'medication', 'checkup') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  doctor_name VARCHAR(255),
  attachments TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Events and Activities
CREATE TABLE IF NOT EXISTS school_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type ENUM('academic', 'sports', 'cultural', 'meeting', 'holiday', 'other') NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  location VARCHAR(255),
  target_audience ENUM('all', 'students', 'parents', 'teachers') DEFAULT 'all',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Parent Feedback
CREATE TABLE IF NOT EXISTS parent_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  category ENUM('academic', 'facility', 'teacher', 'administration', 'other') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
  response TEXT,
  responded_by INT,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Document Library
CREATE TABLE IF NOT EXISTS document_library (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  category ENUM('policy', 'form', 'report', 'guide', 'other') NOT NULL,
  access_level ENUM('public', 'parents', 'students', 'teachers', 'admin') DEFAULT 'public',
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX idx_behavior_student ON behavior_records(student_id, date);
CREATE INDEX idx_homework_class ON homework(class_id, due_date);
CREATE INDEX idx_homework_submissions ON homework_submissions(homework_id, student_id);
CREATE INDEX idx_meeting_requests ON meeting_requests(parent_id, status);
CREATE INDEX idx_student_goals ON student_goals(student_id, status);
CREATE INDEX idx_health_records ON health_records(student_id, date);
CREATE INDEX idx_school_events ON school_events(start_date, target_audience);
CREATE INDEX idx_parent_feedback ON parent_feedback(parent_id, status);
CREATE INDEX idx_document_library ON document_library(category, access_level);

-- Insert Sample Data
INSERT INTO behavior_records (student_id, type, category, description, points, recorded_by, date) VALUES
(1, 'positive', 'Academic Excellence', 'Scored 95% in Mathematics exam', 10, 2, CURDATE()),
(1, 'positive', 'Leadership', 'Led class project successfully', 5, 2, CURDATE());

INSERT INTO school_events (title, description, event_type, start_date, end_date, location, target_audience, created_by) VALUES
('Parent-Teacher Meeting', 'Quarterly parent-teacher conference', 'meeting', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Main Hall', 'parents', 1),
('Sports Day', 'Annual sports competition', 'sports', DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 'Sports Ground', 'all', 1);

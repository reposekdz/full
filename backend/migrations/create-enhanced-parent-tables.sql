-- Enhanced Parent Portal Tables
-- Run this to create all necessary tables for the advanced parent features

-- Student Grades Table
CREATE TABLE IF NOT EXISTS student_grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  grade VARCHAR(5) NOT NULL,
  exam_type VARCHAR(50) NOT NULL,
  exam_date DATE NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_grades (student_id),
  INDEX idx_exam_date (exam_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discipline Records Table
CREATE TABLE IF NOT EXISTS discipline_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  incident_date DATE NOT NULL,
  status ENUM('pending', 'resolved', 'escalated') DEFAULT 'pending',
  reported_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_discipline (student_id),
  INDEX idx_incident_date (incident_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Messages (DOD Messages)
CREATE TABLE IF NOT EXISTS parent_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  message TEXT NOT NULL,
  message_type ENUM('leave', 'conduct', 'sick', 'general') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_messages (student_id),
  INDEX idx_message_type (message_type),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Attendance Table
CREATE TABLE IF NOT EXISTS student_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  remarks TEXT,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_attendance (student_id),
  INDEX idx_attendance_date (attendance_date),
  UNIQUE KEY unique_student_date (student_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Logs Table
CREATE TABLE IF NOT EXISTS payment_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  parent_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20),
  status ENUM('initiated', 'pending', 'success', 'failed') NOT NULL,
  transaction_ref VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_payments (student_id),
  INDEX idx_parent_payments (parent_id),
  INDEX idx_transaction_ref (transaction_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Logs Table
CREATE TABLE IF NOT EXISTS sms_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  status ENUM('sent', 'failed', 'pending') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing (Level 4 SOD students)
-- This will be populated by the migration script

-- Sample grades for testing
INSERT INTO student_grades (student_id, subject, score, grade, exam_type, exam_date, remarks) VALUES
  (1, 'Web Development', 85.5, 'A', 'Final Exam', '2024-01-15', 'Excellent understanding of modern frameworks'),
  (1, 'Database Management', 78.0, 'B+', 'Mid-term', '2023-12-10', 'Good SQL skills'),
  (1, 'Mobile App Development', 92.0, 'A+', 'Project', '2024-01-20', 'Outstanding Flutter project')
ON DUPLICATE KEY UPDATE id=id;

-- Sample discipline records (mostly empty for good students)
INSERT INTO discipline_records (student_id, incident_type, description, action_taken, incident_date, status) VALUES
  (2, 'Late Arrival', 'Student arrived 15 minutes late', 'Verbal warning issued', '2024-01-10', 'resolved')
ON DUPLICATE KEY UPDATE id=id;

-- Sample parent messages
INSERT INTO parent_messages (student_id, message, message_type, is_read, created_at) VALUES
  (1, 'Your child has requested a 2-day leave for family matters. Please confirm.', 'leave', FALSE, NOW()),
  (1, 'Congratulations! Your child received top marks in Web Development.', 'general', FALSE, NOW()),
  (2, 'Please note: Your child was absent today. Kindly contact the school if this was excused.', 'conduct', FALSE, NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Sample attendance records
INSERT INTO student_attendance (student_id, attendance_date, status, remarks) VALUES
  (1, '2024-01-15', 'present', NULL),
  (1, '2024-01-16', 'present', NULL),
  (1, '2024-01-17', 'present', NULL),
  (1, '2024-01-18', 'late', 'Arrived 10 minutes late'),
  (2, '2024-01-15', 'present', NULL),
  (2, '2024-01-16', 'absent', 'Sick leave'),
  (2, '2024-01-17', 'present', NULL)
ON DUPLICATE KEY UPDATE id=id;

-- Success message
SELECT 'Enhanced parent portal tables created successfully!' AS status;

-- Advanced Teacher Portal Features Database Schema
-- Run this migration to add new tables for analytics, reports, messaging, and lesson plans

-- ============================================
-- LESSON PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  class_id INT,
  week_start DATE NOT NULL,
  subject VARCHAR(100),
  topics JSON,
  objectives JSON,
  activities JSON,
  materials JSON,
  notes TEXT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_teacher (teacher_id),
  INDEX idx_week (week_start),
  INDEX idx_class (class_id)
);

-- ============================================
-- TEACHER-PARENT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teacher_parent_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  parent_id INT NOT NULL,
  student_id INT,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('draft', 'sent', 'delivered', 'read', 'archived') DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_teacher (teacher_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
);

-- ============================================
-- TEACHER CLASS ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teacher_class_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  class_id INT NOT NULL,
  subject VARCHAR(100),
  academic_year VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_assignment (teacher_id, class_id, academic_year),
  INDEX idx_teacher (teacher_id),
  INDEX idx_class (class_id)
);

-- ============================================
-- QUIZ QUESTIONS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay') DEFAULT 'multiple_choice',
  options JSON,
  correct_answer TEXT,
  points INT DEFAULT 1,
  order_index INT DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_quiz (quiz_id)
);

-- ============================================
-- QUIZ SUBMISSIONS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  student_id INT NOT NULL,
  answers JSON,
  score DECIMAL(10,2),
  total_marks DECIMAL(10,2),
  time_taken INT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP NULL,
  graded_by INT,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_quiz (quiz_id),
  INDEX idx_student (student_id),
  UNIQUE KEY unique_submission (quiz_id, student_id)
);

-- ============================================
-- ASSIGNMENT SUBMISSIONS ENHANCEMENTS
-- ============================================
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS 
  submitted_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS 
  graded_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS 
  feedback TEXT,
ADD COLUMN IF NOT EXISTS 
  attachments JSON;

-- ============================================
-- STUDENT CONDUCT RECORDS ENHANCEMENTS
-- ============================================
ALTER TABLE student_conduct_records ADD COLUMN IF NOT EXISTS 
  severity ENUM('low', 'medium', 'high') DEFAULT 'low',
ADD COLUMN IF NOT EXISTS 
  action_taken TEXT,
ADD COLUMN IF NOT EXISTS 
  follow_up_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS 
  follow_up_date DATE,
ADD COLUMN IF NOT EXISTS 
  parent_notified BOOLEAN DEFAULT FALSE;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================
-- Insert sample lesson plans (if tables are empty)
-- INSERT IGNORE INTO lesson_plans (teacher_id, class_id, week_start, subject, topics, objectives, activities, materials, notes, status)
-- SELECT 
--   u.id,
--   tc.id,
--   CURDATE() - INTERVAL (ROW_NUMBER() OVER () * 7) DAY,
--   'Mathematics',
--   '["Basic Algebra", "Equations", "Word Problems"]',
--   '["Understand variables", "Solve linear equations"]',
--   '["Lecture", "Group Work", "Practice"]',
--   '["Textbook", "Worksheets"]',
--   'Week plan',
--   'draft'
-- FROM users u
-- CROSS JOIN trade_classes tc
-- WHERE u.role = 'teacher' AND tc.id <= 3
-- LIMIT 10;

-- Insert sample teacher-parent messages (if tables are empty)
-- INSERT IGNORE INTO teacher_parent_messages (teacher_id, parent_id, student_id, subject, message, priority, status)
-- SELECT 
--   u.id,
--   p.id,
--   gs.student_id,
--   'Progress Update',
--   'Your child is making good progress in class.',
--   'normal',
--   'sent'
-- FROM users u
-- CROSS JOIN parents p
-- CROSS JOIN global_student_sheets gs
-- WHERE u.role = 'teacher' 
--   AND gs.student_id IS NOT NULL
-- LIMIT 20;

-- ============================================
-- GRANTS (if needed)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON lesson_plans TO 'school_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON teacher_parent_messages TO 'school_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON teacher_class_assignments TO 'school_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_questions TO 'school_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_submissions TO 'school_app'@'localhost';

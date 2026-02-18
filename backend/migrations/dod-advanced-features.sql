-- DOD Advanced Features Database Schema
-- Run this migration to add SOD, conduct removals, SMS, and parent linking features

-- ============================================
-- SOD (Students of Discipline) TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sod_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  admission_date DATE NOT NULL,
  status ENUM('active', 'monitoring', 'released', 'graduated') DEFAULT 'active',
  notes TEXT,
  added_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_sod_student (student_id)
);

-- ============================================
-- CONDUCT REMOVALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conduct_removals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_id INT NOT NULL,
  student_id INT NOT NULL,
  original_incident_type VARCHAR(100),
  original_severity VARCHAR(50),
  removal_reason TEXT,
  removal_type ENUM('leave', 'sick', 'lesson_cancelled', 'exonerated', 'appealed', 'time_expired', 'administrative') NOT NULL,
  notes TEXT,
  removed_by INT,
  removed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_removal_type (removal_type),
  INDEX idx_removed_at (removed_at)
);

-- ============================================
-- SMS NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sms_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT,
  student_id INT,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  sent_via ENUM('african_talking', 'bulk_sms', 'manual') DEFAULT 'african_talking',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  error_message TEXT,
  sms_id VARCHAR(100),
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at)
);

-- ============================================
-- PARENT STUDENT LINKS ENHANCEMENTS
-- ============================================
ALTER TABLE parent_student_links ADD COLUMN IF NOT EXISTS 
  relationship ENUM('father', 'mother', 'guardian', 'parent', 'other') DEFAULT 'parent',
ADD COLUMN IF NOT EXISTS 
  linked_by INT,
ADD COLUMN IF NOT EXISTS 
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- STUDENT CONDUCT RECORDS ENHANCEMENTS
-- ============================================
ALTER TABLE student_conduct_records ADD COLUMN IF NOT EXISTS 
  resolved_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS 
  resolved_by INT,
ADD COLUMN IF NOT EXISTS 
  resolution_notes TEXT;

-- ============================================
-- TEACHER CLASS ASSIGNMENTS (if not exists)
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
-- SAMPLE DATA
-- ============================================
-- Insert some sample SOD students (if table is empty)
-- INSERT INTO sod_students (student_id, admission_date, status, notes, added_by)
-- SELECT 
--   student_id,
--   CURDATE() - INTERVAL DAYs DAY,
--   'active',
--   'Added for disciplinary monitoring',
--   1
-- FROM global_student_sheets
-- WHERE student_id IN (1, 2, 3)
-- LIMIT 5;

-- ============================================
-- GRANTS (if needed)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON sod_students TO 'school_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON conduct_removals TO 'school_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON sms_notifications TO 'school_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON teacher_class_assignments TO 'school_app'@'localhost';

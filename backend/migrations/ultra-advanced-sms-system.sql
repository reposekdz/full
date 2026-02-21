-- Ultra-Advanced SMS and Notification System
-- Run this to create all required tables

USE school_management;

-- SMS Logs Table
CREATE TABLE IF NOT EXISTS sms_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  provider VARCHAR(50) DEFAULT 'africastalking',
  response TEXT,
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Notifications Table
CREATE TABLE IF NOT EXISTS parent_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  notification_type ENUM('conduct_removed', 'grade_updated', 'attendance_updated', 'leave_approved', 'general') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  sent_via ENUM('sms', 'email', 'push', 'dashboard') DEFAULT 'sms',
  is_read TINYINT(1) DEFAULT 0,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_type (notification_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Conduct Records Table (if not exists)
CREATE TABLE IF NOT EXISTS student_conduct_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  severity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
  description TEXT,
  action_taken TEXT,
  points_deducted INT DEFAULT 0,
  new_conduct_score INT DEFAULT 40,
  recorded_by INT,
  recorded_by_name VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_severity (severity),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Leaves Table (if not exists)
CREATE TABLE IF NOT EXISTS student_leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  reason TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT,
  approved_by_name VARCHAR(200),
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Student Links Table (if not exists)
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type VARCHAR(50) DEFAULT 'Parent',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  linked_by VARCHAR(100),
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  can_view_marks TINYINT(1) DEFAULT 1,
  can_view_attendance TINYINT(1) DEFAULT 1,
  can_view_report_cards TINYINT(1) DEFAULT 1,
  can_view_discipline TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Ultra-Advanced SMS and Notification System tables created successfully!' as message;

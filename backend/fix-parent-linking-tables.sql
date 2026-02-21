-- Fix Parent Linking Tables
-- Run this to ensure parent linking works properly

-- Create parent_student_links table if not exists
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type VARCHAR(50) DEFAULT 'Parent',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  linked_by VARCHAR(100),
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  approved_by INT NULL,
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

-- Ensure student_conduct_records table exists
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
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure student_leaves table exists
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

SELECT 'Parent linking tables created/verified successfully!' as message;

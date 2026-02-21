-- Quick Fix for Parent Linking - Run this in MySQL
-- Copy and paste into MySQL Workbench or phpMyAdmin

USE school_management;

-- Drop and recreate parent_student_links table with correct columns
DROP TABLE IF EXISTS parent_student_links;

CREATE TABLE parent_student_links (
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

SELECT 'Parent linking table fixed! Restart backend now.' as message;

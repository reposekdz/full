-- Parent Student Link Requests Table
-- This table stores requests from parents to link with students

CREATE TABLE IF NOT EXISTS parent_student_link_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  trade_code VARCHAR(20),
  level_number INT,
  gender VARCHAR(20),
  student_id VARCHAR(50),
  relationship VARCHAR(50) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by VARCHAR(100),
  approved_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Student Links Table
-- This table stores the actual links between parents and students

CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  can_view_marks TINYINT(1) DEFAULT 1,
  can_view_attendance TINYINT(1) DEFAULT 1,
  can_view_discipline TINYINT(1) DEFAULT 1,
  can_view_fees TINYINT(1) DEFAULT 1,
  can_receive_sms TINYINT(1) DEFAULT 1,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  linked_by VARCHAR(100),
  linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deactivated_at DATETIME,
  deactivated_by VARCHAR(100),
  deactivation_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

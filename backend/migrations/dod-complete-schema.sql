-- DOD Complete System Database Schema

-- Parent Connections Table (if not exists)
CREATE TABLE IF NOT EXISTS parent_connections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_id INT,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
  relationship VARCHAR(50) DEFAULT 'parent',
  can_view_marks BOOLEAN DEFAULT true,
  can_view_attendance BOOLEAN DEFAULT true,
  can_view_report_cards BOOLEAN DEFAULT true,
  can_receive_notifications BOOLEAN DEFAULT true,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  access_granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_phone (parent_phone),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discipline Records Table
CREATE TABLE IF NOT EXISTS discipline_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  student_code VARCHAR(50),
  student_name VARCHAR(255),
  trade VARCHAR(50),
  class_level VARCHAR(10),
  conduct_type VARCHAR(255) NOT NULL,
  severity ENUM('Byoroshye', 'Byagutse', 'Bikomeye') NOT NULL,
  description TEXT NOT NULL,
  action_taken TEXT,
  conduct_points_deducted INT DEFAULT 0,
  new_conduct_score INT,
  removed_by INT,
  removed_by_name VARCHAR(255),
  parent_notified BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_severity (severity),
  INDEX idx_created (created_at),
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Leaves Table
CREATE TABLE IF NOT EXISTS student_leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  student_code VARCHAR(50),
  student_name VARCHAR(255),
  trade VARCHAR(50),
  class_level VARCHAR(10),
  leave_type VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  approved_by INT,
  approved_by_name VARCHAR(255),
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  parent_notified BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_time, end_time),
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Messages Table
CREATE TABLE IF NOT EXISTS parent_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  send_via ENUM('sms', 'whatsapp', 'both') DEFAULT 'sms',
  sent_by INT,
  sent_by_name VARCHAR(255),
  delivery_status ENUM('sent', 'delivered', 'failed', 'pending') DEFAULT 'pending',
  message_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_phone (parent_phone),
  INDEX idx_status (delivery_status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled Meetings Table
CREATE TABLE IF NOT EXISTS scheduled_meetings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  meeting_type VARCHAR(255) NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  scheduled_by INT,
  scheduled_by_name VARCHAR(255),
  status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  parent_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_date (meeting_date),
  INDEX idx_status (status),
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bulk Actions Log Table
CREATE TABLE IF NOT EXISTS bulk_actions_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action_type VARCHAR(100) NOT NULL,
  student_ids TEXT,
  executed_by INT,
  executed_by_name VARCHAR(255),
  execution_data JSON,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (action_type),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance
ALTER TABLE global_student_sheets 
ADD INDEX IF NOT EXISTS idx_conduct_score (conduct_score),
ADD INDEX IF NOT EXISTS idx_status (status),
ADD INDEX IF NOT EXISTS idx_trade_level (trade_code, level_number);

-- Sample data for testing (optional)
-- INSERT INTO parent_connections (student_id, parent_name, parent_phone, relationship, status)
-- SELECT id, CONCAT('Parent of ', first_name), CONCAT('+25078', FLOOR(RAND() * 10000000)), 'parent', 'active'
-- FROM global_student_sheets WHERE status = 'active' LIMIT 10;

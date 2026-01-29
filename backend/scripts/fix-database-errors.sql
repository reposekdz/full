-- Fix Database Schema Errors
-- This script fixes missing columns and ensures all tables are properly structured

-- Fix inventory_items table (add is_active column)
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER supplier;

-- Fix users table (ensure proper columns exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) AFTER id,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) AFTER first_name;

-- Update existing users with name split if needed
UPDATE users 
SET first_name = SUBSTRING_INDEX(name, ' ', 1),
    last_name = SUBSTRING_INDEX(name, ' ', -1)
WHERE first_name IS NULL OR first_name = '';

-- Ensure inventory_items has all required columns
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS name VARCHAR(255) AFTER id,
ADD COLUMN IF NOT EXISTS category VARCHAR(100) AFTER name,
ADD COLUMN IF NOT EXISTS description TEXT AFTER category,
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0.00 AFTER description,
ADD COLUMN IF NOT EXISTS current_quantity INT DEFAULT 0 AFTER unit_price,
ADD COLUMN IF NOT EXISTS reorder_level INT DEFAULT 10 AFTER current_quantity,
ADD COLUMN IF NOT EXISTS supplier VARCHAR(255) AFTER reorder_level,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER supplier,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_active,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Ensure inventory_transactions table exists
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  transaction_type ENUM('in', 'out', 'purchase', 'issue', 'return', 'adjustment') NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) DEFAULT 0.00,
  performed_by INT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_item_id (item_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOD Management Tables
CREATE TABLE IF NOT EXISTS discipline_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  severity_level ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
  default_action VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_severity (severity_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discipline_actions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  action_type ENUM('warning', 'detention', 'suspension', 'expulsion', 'community_service', 'counseling', 'parent_meeting', 'other') NOT NULL,
  duration_days INT DEFAULT 0,
  requires_approval BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_conduct_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  category_id INT,
  description TEXT NOT NULL,
  incident_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255),
  severity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
  reported_by INT,
  handled_by INT,
  action_id INT,
  action_taken TEXT,
  action_start_date DATE,
  action_end_date DATE,
  parent_notified BOOLEAN DEFAULT FALSE,
  parent_notification_date TIMESTAMP NULL,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_notes TEXT,
  status ENUM('active', 'resolved', 'appealed', 'cancelled') DEFAULT 'active',
  resolution_notes TEXT,
  resolved_date TIMESTAMP NULL,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES discipline_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (action_id) REFERENCES discipline_actions(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_incident_date (incident_date),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_handled_by (handled_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_behavior_points (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  points INT DEFAULT 0,
  point_type ENUM('positive', 'negative') NOT NULL,
  reason VARCHAR(255) NOT NULL,
  awarded_by INT,
  conduct_record_id INT,
  academic_year VARCHAR(20),
  term VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (awarded_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (conduct_record_id) REFERENCES student_conduct_records(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_point_type (point_type),
  INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dormitory_inspections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dormitory_name VARCHAR(100) NOT NULL,
  room_number VARCHAR(50),
  inspection_date DATE NOT NULL,
  inspection_time TIME,
  inspector_id INT NOT NULL,
  cleanliness_score INT DEFAULT 0,
  organization_score INT DEFAULT 0,
  discipline_score INT DEFAULT 0,
  total_score INT DEFAULT 0,
  issues_found TEXT,
  recommendations TEXT,
  students_present JSON,
  status ENUM('passed', 'warning', 'failed') DEFAULT 'passed',
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_dormitory (dormitory_name),
  INDEX idx_inspection_date (inspection_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_counseling_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  counselor_id INT NOT NULL,
  session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_type ENUM('individual', 'group', 'family', 'crisis') DEFAULT 'individual',
  reason VARCHAR(255),
  notes TEXT,
  recommendations TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  confidential BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_counselor_id (counselor_id),
  INDEX idx_session_date (session_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parent_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_id INT,
  notification_type ENUM('discipline', 'academic', 'attendance', 'health', 'general') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sent_by INT NOT NULL,
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_method ENUM('sms', 'email', 'phone', 'letter', 'in_person') DEFAULT 'sms',
  delivery_status ENUM('pending', 'sent', 'delivered', 'failed', 'read') DEFAULT 'pending',
  parent_response TEXT,
  response_date TIMESTAMP NULL,
  conduct_record_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (conduct_record_id) REFERENCES student_conduct_records(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_delivery_status (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default discipline categories
INSERT INTO discipline_categories (name, description, severity_level, default_action) VALUES
('Late Coming', 'Student arrives late to school or class', 'minor', 'Warning'),
('Uniform Violation', 'Improper uniform or dress code violation', 'minor', 'Warning'),
('Disrespect', 'Disrespectful behavior towards staff or students', 'moderate', 'Detention'),
('Fighting', 'Physical altercation with another student', 'major', 'Suspension'),
('Bullying', 'Harassment or intimidation of other students', 'major', 'Suspension'),
('Theft', 'Stealing school or personal property', 'severe', 'Suspension'),
('Substance Abuse', 'Use or possession of prohibited substances', 'severe', 'Suspension'),
('Vandalism', 'Damage to school property', 'major', 'Community Service'),
('Truancy', 'Unauthorized absence from school', 'moderate', 'Parent Meeting'),
('Cheating', 'Academic dishonesty', 'moderate', 'Detention')
ON DUPLICATE KEY UPDATE name=name;

-- Insert default discipline actions
INSERT INTO discipline_actions (name, description, action_type, duration_days, requires_approval) VALUES
('Verbal Warning', 'Verbal warning given to student', 'warning', 0, FALSE),
('Written Warning', 'Written warning documented in file', 'warning', 0, FALSE),
('Lunch Detention', 'Student stays during lunch break', 'detention', 1, FALSE),
('After School Detention', 'Student stays after school hours', 'detention', 1, FALSE),
('1 Day Suspension', 'Student suspended for one day', 'suspension', 1, TRUE),
('3 Day Suspension', 'Student suspended for three days', 'suspension', 3, TRUE),
('1 Week Suspension', 'Student suspended for one week', 'suspension', 7, TRUE),
('Community Service', 'Student performs community service', 'community_service', 0, FALSE),
('Counseling Session', 'Mandatory counseling session', 'counseling', 0, FALSE),
('Parent Conference', 'Meeting with parents required', 'parent_meeting', 0, FALSE),
('Expulsion', 'Permanent removal from school', 'expulsion', 0, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Ensure student_discipline_records compatibility
ALTER TABLE student_discipline_records
ADD COLUMN IF NOT EXISTS category_id INT AFTER incident_type,
ADD COLUMN IF NOT EXISTS action_id INT AFTER handled_by,
ADD COLUMN IF NOT EXISTS parent_notified BOOLEAN DEFAULT FALSE AFTER action_taken,
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT FALSE AFTER parent_notified;

-- Add foreign keys if they don't exist
SET @exist := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'student_discipline_records' 
AND CONSTRAINT_NAME = 'fk_discipline_category');

SET @sqlstmt := IF(@exist = 0, 
'ALTER TABLE student_discipline_records ADD CONSTRAINT fk_discipline_category FOREIGN KEY (category_id) REFERENCES discipline_categories(id) ON DELETE SET NULL',
'SELECT ''Constraint already exists''');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'student_discipline_records' 
AND CONSTRAINT_NAME = 'fk_discipline_action');

SET @sqlstmt := IF(@exist = 0, 
'ALTER TABLE student_discipline_records ADD CONSTRAINT fk_discipline_action FOREIGN KEY (action_id) REFERENCES discipline_actions(id) ON DELETE SET NULL',
'SELECT ''Constraint already exists''');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_conduct_student ON student_conduct_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_conduct_date ON student_conduct_records(incident_date);
CREATE INDEX IF NOT EXISTS idx_student_conduct_status ON student_conduct_records(status);
CREATE INDEX IF NOT EXISTS idx_behavior_points_student ON student_behavior_points(student_id);
CREATE INDEX IF NOT EXISTS idx_counseling_student ON student_counseling_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_student ON parent_notifications(student_id);

-- Success message
SELECT '✅ Database schema fixed successfully!' as Status;

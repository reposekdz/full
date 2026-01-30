-- Fix Database Schema Errors
-- This script fixes missing columns and ensures all tables are properly structured

-- Fix inventory_items table (add is_active column)
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER supplier;

-- Fix users table (ensure proper columns exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) AFTER id,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) AFTER first_name,
ADD COLUMN IF NOT EXISTS bio TEXT AFTER phone,
ADD COLUMN IF NOT EXISTS department VARCHAR(100) AFTER bio,
ADD COLUMN IF NOT EXISTS office_location VARCHAR(255) AFTER department;

-- Update existing users with name split if needed
UPDATE users 
SET first_name = SUBSTRING_INDEX(name, ' ', 1),
    last_name = SUBSTRING_INDEX(name, ' ', -1)
WHERE (first_name IS NULL OR first_name = '') AND name IS NOT NULL;

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
  INDEX idx_item_id (item_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOD Management Tables (without foreign keys first)
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
  INDEX idx_student_id (student_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_delivery_status (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default discipline categories
INSERT IGNORE INTO discipline_categories (name, description, severity_level, default_action) VALUES
('Late Coming', 'Student arrives late to school or class', 'minor', 'Warning'),
('Uniform Violation', 'Improper uniform or dress code violation', 'minor', 'Warning'),
('Disrespect', 'Disrespectful behavior towards staff or students', 'moderate', 'Detention'),
('Fighting', 'Physical altercation with another student', 'major', 'Suspension'),
('Bullying', 'Harassment or intimidation of other students', 'major', 'Suspension'),
('Theft', 'Stealing school or personal property', 'severe', 'Suspension'),
('Substance Abuse', 'Use or possession of prohibited substances', 'severe', 'Suspension'),
('Vandalism', 'Damage to school property', 'major', 'Community Service'),
('Truancy', 'Unauthorized absence from school', 'moderate', 'Parent Meeting'),
('Cheating', 'Academic dishonesty', 'moderate', 'Detention');

-- Insert default discipline actions
INSERT IGNORE INTO discipline_actions (name, description, action_type, duration_days, requires_approval) VALUES
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
('Expulsion', 'Permanent removal from school', 'expulsion', 0, TRUE);

-- Success message
SELECT '✅ Database schema fixed successfully!' as Status;

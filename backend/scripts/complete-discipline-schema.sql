-- Complete Database Schema with Foreign Keys
SET FOREIGN_KEY_CHECKS = 0;

-- Fix users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) AFTER id,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) AFTER first_name,
ADD COLUMN IF NOT EXISTS bio TEXT AFTER phone,
ADD COLUMN IF NOT EXISTS department VARCHAR(100) AFTER bio,
ADD COLUMN IF NOT EXISTS office_location VARCHAR(255) AFTER department;

UPDATE users 
SET first_name = SUBSTRING_INDEX(name, ' ', 1),
    last_name = SUBSTRING_INDEX(name, ' ', -1)
WHERE (first_name IS NULL OR first_name = '') AND name IS NOT NULL;

-- Fix inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Discipline Categories
CREATE TABLE IF NOT EXISTS discipline_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  severity_level ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
  default_action VARCHAR(255),
  points_deduction INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_severity (severity_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discipline Actions
CREATE TABLE IF NOT EXISTS discipline_actions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  action_type ENUM('warning', 'detention', 'suspension', 'expulsion', 'community_service', 'counseling', 'parent_meeting', 'other') NOT NULL,
  duration_days INT DEFAULT 0,
  requires_approval BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Conduct Records
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
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Behavior Points
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
  INDEX idx_point_type (point_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dormitory Inspections
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
  INDEX idx_inspection_date (inspection_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Counseling Sessions
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
  INDEX idx_session_date (session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Notifications
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
  INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Wellness Tracking
CREATE TABLE IF NOT EXISTS student_wellness_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  tracked_by INT NOT NULL,
  tracking_date DATE NOT NULL,
  mood_rating INT DEFAULT 5,
  stress_level ENUM('low', 'moderate', 'high', 'severe') DEFAULT 'moderate',
  sleep_quality ENUM('poor', 'fair', 'good', 'excellent') DEFAULT 'fair',
  social_interaction ENUM('isolated', 'limited', 'normal', 'active') DEFAULT 'normal',
  academic_stress BOOLEAN DEFAULT FALSE,
  personal_issues BOOLEAN DEFAULT FALSE,
  notes TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tracked_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_tracking_date (tracking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incident Witnesses
CREATE TABLE IF NOT EXISTS incident_witnesses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conduct_record_id INT NOT NULL,
  witness_id INT,
  witness_name VARCHAR(255),
  witness_type ENUM('student', 'staff', 'parent', 'other') NOT NULL,
  statement TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conduct_record_id) REFERENCES student_conduct_records(id) ON DELETE CASCADE,
  FOREIGN KEY (witness_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_conduct_record (conduct_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discipline Appeals
CREATE TABLE IF NOT EXISTS discipline_appeals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conduct_record_id INT NOT NULL,
  appealed_by INT NOT NULL,
  appeal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  appeal_reason TEXT NOT NULL,
  supporting_documents JSON,
  reviewed_by INT,
  review_date TIMESTAMP NULL,
  decision ENUM('pending', 'approved', 'rejected', 'modified') DEFAULT 'pending',
  decision_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conduct_record_id) REFERENCES student_conduct_records(id) ON DELETE CASCADE,
  FOREIGN KEY (appealed_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_conduct_record (conduct_record_id),
  INDEX idx_decision (decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dormitory Assignments
CREATE TABLE IF NOT EXISTS dormitory_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  dormitory_name VARCHAR(100) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  bed_number VARCHAR(20),
  assigned_date DATE NOT NULL,
  end_date DATE,
  assigned_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_dormitory (dormitory_name),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Positive Recognition
CREATE TABLE IF NOT EXISTS positive_recognition (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  recognition_type ENUM('academic', 'behavior', 'leadership', 'sports', 'arts', 'community_service') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  awarded_by INT NOT NULL,
  award_date DATE NOT NULL,
  points_awarded INT DEFAULT 0,
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (awarded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_recognition_type (recognition_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert Data
INSERT IGNORE INTO discipline_categories (name, description, severity_level, default_action, points_deduction) VALUES
('Late Coming', 'Student arrives late to school or class', 'minor', 'Warning', 5),
('Uniform Violation', 'Improper uniform or dress code violation', 'minor', 'Warning', 5),
('Disrespect', 'Disrespectful behavior towards staff or students', 'moderate', 'Detention', 10),
('Fighting', 'Physical altercation with another student', 'major', 'Suspension', 20),
('Bullying', 'Harassment or intimidation of other students', 'major', 'Suspension', 20),
('Theft', 'Stealing school or personal property', 'severe', 'Suspension', 30),
('Substance Abuse', 'Use or possession of prohibited substances', 'severe', 'Suspension', 30),
('Vandalism', 'Damage to school property', 'major', 'Community Service', 20),
('Truancy', 'Unauthorized absence from school', 'moderate', 'Parent Meeting', 10),
('Cheating', 'Academic dishonesty', 'moderate', 'Detention', 10);

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

SELECT '✅ Complete schema with foreign keys created!' as Status;

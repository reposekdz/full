-- DOD Advanced Features Database Schema

-- Scheduled Meetings Table
CREATE TABLE IF NOT EXISTS scheduled_meetings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  meeting_type VARCHAR(50) NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  scheduled_by INT NOT NULL,
  status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  parent_notified BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_date (meeting_date),
  INDEX idx_status (status)
);

-- Parent Messages Table
CREATE TABLE IF NOT EXISTS parent_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_id INT,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  send_via ENUM('sms', 'whatsapp', 'both') DEFAULT 'sms',
  sent_by INT NOT NULL,
  sent_by_name VARCHAR(255),
  delivery_status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_status (delivery_status)
);

-- Bulk Actions Log Table
CREATE TABLE IF NOT EXISTS bulk_actions_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action_type VARCHAR(50) NOT NULL,
  student_ids JSON NOT NULL,
  executed_by INT NOT NULL,
  execution_data JSON,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  processed_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_type (action_type),
  INDEX idx_status (status),
  INDEX idx_executed_by (executed_by)
);

-- Update discipline_records table
ALTER TABLE discipline_records 
ADD COLUMN IF NOT EXISTS conduct_points_deducted INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS new_conduct_score INT DEFAULT 40,
ADD COLUMN IF NOT EXISTS parent_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP NULL;

-- Update student_leaves table
ALTER TABLE student_leaves 
ADD COLUMN IF NOT EXISTS parent_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP NULL;

-- Update global_students table
ALTER TABLE global_students 
ADD COLUMN IF NOT EXISTS conduct_score INT DEFAULT 40,
ADD COLUMN IF NOT EXISTS overall_attendance_percentage DECIMAL(5,2) DEFAULT 100.00;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conduct_score ON global_students(conduct_score);
CREATE INDEX IF NOT EXISTS idx_attendance ON global_students(overall_attendance_percentage);
CREATE INDEX IF NOT EXISTS idx_academic_status ON global_students(academic_status);
CREATE INDEX IF NOT EXISTS idx_current_trade ON global_students(current_trade);
CREATE INDEX IF NOT EXISTS idx_current_level ON global_students(current_level);

-- Student Parents Table (if not exists)
CREATE TABLE IF NOT EXISTS student_parents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_type ENUM('father', 'mother', 'guardian') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  national_id VARCHAR(50),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  occupation VARCHAR(100),
  workplace VARCHAR(255),
  portal_access BOOLEAN DEFAULT TRUE,
  can_make_payments BOOLEAN DEFAULT TRUE,
  can_view_grades BOOLEAN DEFAULT TRUE,
  can_view_attendance BOOLEAN DEFAULT TRUE,
  can_communicate_teachers BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  whatsapp_notifications BOOLEAN DEFAULT FALSE,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_phone (phone),
  INDEX idx_active (is_active)
);

-- Activity Log for Audit Trail
CREATE TABLE IF NOT EXISTS dod_activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  staff_name VARCHAR(255),
  action_type VARCHAR(100) NOT NULL,
  student_id INT,
  student_name VARCHAR(255),
  description TEXT,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_staff (staff_id),
  INDEX idx_student (student_id),
  INDEX idx_action (action_type),
  INDEX idx_date (created_at)
);

-- Statistics Cache Table for Performance
CREATE TABLE IF NOT EXISTS dod_statistics_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stat_key VARCHAR(100) UNIQUE NOT NULL,
  stat_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (stat_key)
);

-- Insert initial statistics
INSERT INTO dod_statistics_cache (stat_key, stat_value) VALUES
('total_students', '{"count": 0, "last_updated": null}'),
('poor_conduct', '{"count": 0, "last_updated": null}'),
('poor_attendance', '{"count": 0, "last_updated": null}'),
('total_incidents', '{"count": 0, "last_updated": null}')
ON DUPLICATE KEY UPDATE stat_value = VALUES(stat_value);

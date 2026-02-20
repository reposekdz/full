-- Advanced Parent Linking System Database Schema
-- Real trades (BDC, SOD, AUTO), real levels, real messages from DOD/DOS

-- Drop existing tables if they exist to recreate with correct schema
DROP TABLE IF EXISTS parent_messages;
DROP TABLE IF EXISTS parent_notifications;
DROP VIEW IF EXISTS parent_dashboard_view;

-- Parent messages table (messages from DOD, DOS, Headmaster, Teachers)
CREATE TABLE parent_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  parent_phone VARCHAR(20),
  student_id INT,
  sent_by INT,
  subject VARCHAR(255) NOT NULL,
  message_body TEXT NOT NULL,
  category ENUM('general', 'academic', 'conduct', 'attendance', 'fees', 'leave', 'urgent') DEFAULT 'general',
  urgency ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_parent_phone (parent_phone),
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_at (created_at)
);

-- Parent notifications table
CREATE TABLE parent_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category ENUM('linking', 'conduct', 'attendance', 'fees', 'academic', 'leave', 'general') DEFAULT 'general',
  urgency ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_parent_id (parent_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- Parent student links table (updated)
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  match_confidence INT DEFAULT 0,
  verified_by INT,
  verified_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_student_id (student_id),
  INDEX idx_status (status)
);

-- Insert sample messages from DOD/DOS (for testing)
INSERT IGNORE INTO parent_messages (parent_id, subject, message_body, category, urgency, sent_by, sent_at)
SELECT 
  p.id,
  'Welcome to Garden TVET Parent Portal',
  'Dear Parent, welcome to our interactive parent portal. You can now monitor your child\'s progress in real-time.',
  'general',
  'normal',
  (SELECT id FROM users WHERE role = 'headmaster' LIMIT 1),
  NOW()
FROM users p
WHERE p.role = 'parent'
LIMIT 10;

-- Insert sample notifications
INSERT IGNORE INTO parent_notifications (parent_id, title, message, category, urgency)
SELECT 
  p.id,
  'Account Activated',
  'Your parent portal account has been activated. You can now access all features.',
  'general',
  'normal'
FROM users p
WHERE p.role = 'parent'
LIMIT 10;

-- Create view for parent dashboard
CREATE OR REPLACE VIEW parent_dashboard_view AS
SELECT 
  p.id as parent_id,
  p.phone as parent_phone,
  p.email as parent_email,
  CONCAT(p.first_name, ' ', p.last_name) as parent_name,
  COUNT(DISTINCT psl.student_id) as total_children,
  COUNT(DISTINCT CASE WHEN psl.status = 'approved' THEN psl.student_id END) as approved_children,
  COUNT(DISTINCT CASE WHEN psl.status = 'pending' THEN psl.student_id END) as pending_children,
  (SELECT COUNT(*) FROM parent_notifications WHERE parent_id = p.id AND is_read = 0) as unread_notifications,
  (SELECT COUNT(*) FROM parent_messages WHERE parent_id = p.id AND status != 'read') as unread_messages
FROM users p
LEFT JOIN parent_student_links psl ON p.id = psl.parent_id
WHERE p.role = 'parent'
GROUP BY p.id;

-- Ensure global_student_sheets has proper indexes
ALTER TABLE global_student_sheets 
ADD INDEX IF NOT EXISTS idx_trade_level (trade_name, level_number),
ADD INDEX IF NOT EXISTS idx_status (status),
ADD INDEX IF NOT EXISTS idx_student_code (student_code);

-- Ensure attendance table exists
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
  course_id INT,
  remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_date (student_id, date),
  INDEX idx_date (date)
);

-- Ensure grades table exists
CREATE TABLE IF NOT EXISTS grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT,
  subject VARCHAR(100),
  marks DECIMAL(5,2),
  max_marks DECIMAL(5,2) DEFAULT 100,
  grade VARCHAR(5),
  term INT,
  year INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_term_year (term, year)
);

-- Ensure fee_payments table exists
CREATE TABLE IF NOT EXISTS fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_payment_date (payment_date)
);

-- Ensure student_conduct_records table exists
CREATE TABLE IF NOT EXISTS student_conduct_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  incident_type VARCHAR(100),
  severity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'minor',
  description TEXT,
  action_taken TEXT,
  recorded_by INT,
  incident_date DATE,
  status ENUM('active', 'resolved', 'dismissed') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_incident_date (incident_date)
);

SELECT 'Parent linking system database schema created successfully!' as status;

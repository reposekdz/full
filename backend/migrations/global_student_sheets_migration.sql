-- Global Student Sheets Database Migration
-- This script creates all necessary tables for the advanced student management system

-- Create global_student_sheets table (main student data)
CREATE TABLE IF NOT EXISTS global_student_sheets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  gender ENUM('Male', 'Female') NOT NULL,
  date_of_birth DATE,
  address TEXT,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  level_suffix VARCHAR(10) DEFAULT '',
  student_code VARCHAR(20) UNIQUE NOT NULL,
  conduct_score INT DEFAULT 40 CHECK (conduct_score >= 0 AND conduct_score <= 40),
  attendance_percentage DECIMAL(5,2) DEFAULT 100.00 CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
  payment_status ENUM('paid', 'pending', 'overdue', 'partial') DEFAULT 'pending',
  academic_year VARCHAR(10) DEFAULT '2024',
  term VARCHAR(20) DEFAULT 'Term 1',
  status ENUM('active', 'inactive', 'graduated', 'transferred') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_trade_level (trade_code, level_number),
  INDEX idx_student_code (student_code),
  INDEX idx_name (first_name, last_name),
  INDEX idx_conduct (conduct_score),
  INDEX idx_attendance (attendance_percentage),
  INDEX idx_payment (payment_status)
);

-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100),
  address TEXT,
  occupation VARCHAR(100),
  national_id VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_phone (phone),
  INDEX idx_email (email)
);

-- Create parent_child_links table
CREATE TABLE IF NOT EXISTS parent_child_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id)
);

-- Create student_conduct_records table
CREATE TABLE IF NOT EXISTS student_conduct_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('minor', 'moderate', 'major', 'severe') NOT NULL,
  points_removed INT NOT NULL CHECK (points_removed > 0 AND points_removed <= 40),
  action_taken TEXT,
  recorded_by INT,
  incident_date DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_conduct (student_id),
  INDEX idx_incident_date (incident_date),
  INDEX idx_severity (severity)
);

-- Create student_attendance table
CREATE TABLE IF NOT EXISTS student_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  reason TEXT,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_date (student_id, attendance_date),
  INDEX idx_student_attendance (student_id),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_status (status)
);

-- Create student_payments table
CREATE TABLE IF NOT EXISTS student_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  payment_type ENUM('tuition', 'accommodation', 'meals', 'materials', 'other') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  balance DECIMAL(10,2) GENERATED ALWAYS AS (amount - amount_paid) STORED,
  payment_status ENUM('paid', 'pending', 'overdue', 'partial') DEFAULT 'pending',
  due_date DATE,
  payment_date DATE,
  payment_method ENUM('cash', 'bank_transfer', 'mobile_money', 'card') DEFAULT 'cash',
  reference_number VARCHAR(50),
  academic_year VARCHAR(10) DEFAULT '2024',
  term VARCHAR(20) DEFAULT 'Term 1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_payments (student_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_due_date (due_date),
  INDEX idx_reference (reference_number)
);

-- Create student_leave_requests table
CREATE TABLE IF NOT EXISTS student_leave_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  leave_type ENUM('sick', 'emergency', 'family', 'personal', 'approved', 'other') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INT GENERATED ALWAYS AS (DATEDIFF(end_date, start_date) + 1) STORED,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  approved_by INT,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_leave (student_id),
  INDEX idx_leave_dates (start_date, end_date),
  INDEX idx_status (status)
);

-- Create student_grades table
CREATE TABLE IF NOT EXISTS student_grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_code VARCHAR(20) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  assessment_type ENUM('test', 'exam', 'assignment', 'project', 'practical') NOT NULL,
  marks_obtained DECIMAL(5,2) NOT NULL,
  marks_total DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((marks_obtained / marks_total) * 100) STORED,
  grade CHAR(2) GENERATED ALWAYS AS (
    CASE 
      WHEN (marks_obtained / marks_total) * 100 >= 90 THEN 'A+'
      WHEN (marks_obtained / marks_total) * 100 >= 85 THEN 'A'
      WHEN (marks_obtained / marks_total) * 100 >= 80 THEN 'A-'
      WHEN (marks_obtained / marks_total) * 100 >= 75 THEN 'B+'
      WHEN (marks_obtained / marks_total) * 100 >= 70 THEN 'B'
      WHEN (marks_obtained / marks_total) * 100 >= 65 THEN 'B-'
      WHEN (marks_obtained / marks_total) * 100 >= 60 THEN 'C+'
      WHEN (marks_obtained / marks_total) * 100 >= 55 THEN 'C'
      WHEN (marks_obtained / marks_total) * 100 >= 50 THEN 'C-'
      WHEN (marks_obtained / marks_total) * 100 >= 45 THEN 'D+'
      WHEN (marks_obtained / marks_total) * 100 >= 40 THEN 'D'
      ELSE 'F'
    END
  ) STORED,
  academic_year VARCHAR(10) DEFAULT '2024',
  term VARCHAR(20) DEFAULT 'Term 1',
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_grades (student_id),
  INDEX idx_subject (subject_code),
  INDEX idx_assessment (assessment_type),
  INDEX idx_academic_period (academic_year, term)
);

-- Create sms_notifications table
CREATE TABLE IF NOT EXISTS sms_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipient_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  message_type ENUM('conduct_removed', 'leave_approved', 'parent_linked', 'payment_reminder', 'custom', 'bulk_custom') NOT NULL,
  student_id INT,
  priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
  status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  provider VARCHAR(50),
  provider_message_id VARCHAR(100),
  cost DECIMAL(8,4) DEFAULT 0.0000,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE SET NULL,
  INDEX idx_recipient (recipient_phone),
  INDEX idx_status (status),
  INDEX idx_message_type (message_type),
  INDEX idx_student_sms (student_id),
  INDEX idx_created_at (created_at)
);

-- Create system_logs table for audit trail
CREATE TABLE IF NOT EXISTS system_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_logs (user_id),
  INDEX idx_action (action),
  INDEX idx_table_record (table_name, record_id),
  INDEX idx_created_at (created_at)
);

-- Create views for easier data access

-- View: Student summary with all key metrics
CREATE OR REPLACE VIEW student_summary AS
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  CONCAT(s.first_name, ' ', s.last_name) as full_name,
  s.student_code,
  s.trade_code,
  s.level_number,
  s.level_suffix,
  s.gender,
  s.email,
  s.phone,
  s.conduct_score,
  s.attendance_percentage,
  s.payment_status,
  COUNT(DISTINCT pcl.parent_id) as parent_count,
  COUNT(DISTINCT scr.id) as conduct_incidents,
  COUNT(DISTINCT slr.id) as leave_requests,
  AVG(sg.percentage) as average_grade,
  s.status,
  s.created_at,
  s.updated_at
FROM global_student_sheets s
LEFT JOIN parent_child_links pcl ON s.id = pcl.student_id
LEFT JOIN student_conduct_records scr ON s.id = scr.student_id
LEFT JOIN student_leave_requests slr ON s.id = slr.student_id
LEFT JOIN student_grades sg ON s.id = sg.student_id
GROUP BY s.id;

-- View: Parent-student relationships
CREATE OR REPLACE VIEW parent_student_links AS
SELECT 
  p.id as parent_id,
  CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')) as parent_name,
  p.phone as parent_phone,
  p.email as parent_email,
  s.id as student_id,
  CONCAT(s.first_name, ' ', s.last_name) as student_name,
  s.student_code,
  s.trade_code,
  s.level_number,
  pcl.relationship,
  pcl.is_primary,
  pcl.created_at as linked_at
FROM parents p
JOIN parent_child_links pcl ON p.id = pcl.parent_id
JOIN global_student_sheets s ON pcl.student_id = s.id;

-- View: Recent conduct incidents
CREATE OR REPLACE VIEW recent_conduct_incidents AS
SELECT 
  scr.id,
  s.id as student_id,
  CONCAT(s.first_name, ' ', s.last_name) as student_name,
  s.student_code,
  s.trade_code,
  s.level_number,
  scr.incident_type,
  scr.description,
  scr.severity,
  scr.points_removed,
  scr.action_taken,
  scr.incident_date,
  scr.created_at
FROM student_conduct_records scr
JOIN global_student_sheets s ON scr.student_id = s.id
ORDER BY scr.created_at DESC;

-- Insert sample data for testing (optional)
INSERT IGNORE INTO global_student_sheets 
(first_name, last_name, email, phone, gender, trade_code, level_number, student_code, conduct_score, attendance_percentage, payment_status)
VALUES 
('John', 'Doe', 'john.doe@example.com', '+250788123456', 'Male', 'SOD', 4, 'SOD4001', 38, 95.5, 'paid'),
('Jane', 'Smith', 'jane.smith@example.com', '+250788123457', 'Female', 'SOD', 4, 'SOD4002', 40, 98.2, 'pending'),
('Bob', 'Johnson', 'bob.johnson@example.com', '+250788123458', 'Male', 'BDC', 3, 'BDC3001', 35, 92.1, 'partial'),
('Alice', 'Brown', 'alice.brown@example.com', '+250788123459', 'Female', 'AUTO', 2, 'AUTO2001', 39, 96.8, 'paid'),
('Charlie', 'Wilson', 'charlie.wilson@example.com', '+250788123460', 'Male', 'SOD', 4, 'SOD4003', 32, 88.5, 'overdue');

-- Insert sample parents
INSERT IGNORE INTO parents (first_name, last_name, phone, email)
VALUES 
('Robert', 'Doe', '+250788111111', 'robert.doe@example.com'),
('Mary', 'Smith', '+250788111112', 'mary.smith@example.com'),
('David', 'Johnson', '+250788111113', 'david.johnson@example.com'),
('Sarah', 'Brown', '+250788111114', 'sarah.brown@example.com'),
('Michael', 'Wilson', '+250788111115', 'michael.wilson@example.com');

-- Link parents to students
INSERT IGNORE INTO parent_child_links (parent_id, student_id, relationship, is_primary)
VALUES 
(1, 1, 'father', TRUE),
(2, 2, 'mother', TRUE),
(3, 3, 'father', TRUE),
(4, 4, 'mother', TRUE),
(5, 5, 'father', TRUE);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_student_summary_trade_level ON global_student_sheets(trade_code, level_number, status);
CREATE INDEX IF NOT EXISTS idx_conduct_student_date ON student_conduct_records(student_id, incident_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON student_attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_payments_student_status ON student_payments(student_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_leave_student_status ON student_leave_requests(student_id, status);
CREATE INDEX IF NOT EXISTS idx_grades_student_term ON student_grades(student_id, academic_year, term);
CREATE INDEX IF NOT EXISTS idx_sms_status_created ON sms_notifications(status, created_at);

-- Create triggers for automatic updates

-- Trigger: Update conduct score when conduct record is inserted
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_conduct_score_after_incident
AFTER INSERT ON student_conduct_records
FOR EACH ROW
BEGIN
  UPDATE global_student_sheets 
  SET conduct_score = GREATEST(0, conduct_score - NEW.points_removed),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.student_id;
END//

-- Trigger: Update attendance percentage when attendance is recorded
CREATE TRIGGER IF NOT EXISTS update_attendance_percentage
AFTER INSERT ON student_attendance
FOR EACH ROW
BEGIN
  UPDATE global_student_sheets s
  SET attendance_percentage = (
    SELECT (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0) / COUNT(*)
    FROM student_attendance a
    WHERE a.student_id = s.id
  ),
  updated_at = CURRENT_TIMESTAMP
  WHERE s.id = NEW.student_id;
END//

-- Trigger: Update payment status when payment is made
CREATE TRIGGER IF NOT EXISTS update_payment_status
AFTER UPDATE ON student_payments
FOR EACH ROW
BEGIN
  UPDATE global_student_sheets s
  SET payment_status = (
    CASE 
      WHEN (SELECT SUM(balance) FROM student_payments WHERE student_id = s.id) <= 0 THEN 'paid'
      WHEN (SELECT SUM(amount_paid) FROM student_payments WHERE student_id = s.id) > 0 THEN 'partial'
      WHEN (SELECT COUNT(*) FROM student_payments WHERE student_id = s.id AND due_date < CURDATE()) > 0 THEN 'overdue'
      ELSE 'pending'
    END
  ),
  updated_at = CURRENT_TIMESTAMP
  WHERE s.id = NEW.student_id;
END//

DELIMITER ;

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON school_management.* TO 'app_user'@'localhost';
-- GRANT EXECUTE ON school_management.* TO 'app_user'@'localhost';

-- Create stored procedures for common operations

DELIMITER //

-- Procedure: Get student dashboard data
CREATE PROCEDURE IF NOT EXISTS GetStudentDashboard(IN p_student_id INT)
BEGIN
  SELECT 
    s.*,
    (SELECT COUNT(*) FROM student_conduct_records WHERE student_id = p_student_id) as total_incidents,
    (SELECT COUNT(*) FROM student_leave_requests WHERE student_id = p_student_id AND status = 'approved') as approved_leaves,
    (SELECT AVG(percentage) FROM student_grades WHERE student_id = p_student_id) as average_grade,
    (SELECT SUM(balance) FROM student_payments WHERE student_id = p_student_id) as outstanding_balance
  FROM global_student_sheets s
  WHERE s.id = p_student_id;
END//

-- Procedure: Get trade level statistics
CREATE PROCEDURE IF NOT EXISTS GetTradeLevelStats(IN p_trade_code VARCHAR(10), IN p_level_number INT)
BEGIN
  SELECT 
    COUNT(*) as total_students,
    AVG(conduct_score) as avg_conduct,
    AVG(attendance_percentage) as avg_attendance,
    COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_students,
    COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_students,
    COUNT(CASE WHEN payment_status = 'overdue' THEN 1 END) as overdue_students
  FROM global_student_sheets
  WHERE trade_code = p_trade_code AND level_number = p_level_number AND status = 'active';
END//

DELIMITER ;

-- Final optimization
ANALYZE TABLE global_student_sheets, parents, parent_child_links, student_conduct_records, 
             student_attendance, student_payments, student_leave_requests, student_grades, 
             sms_notifications, system_logs;

-- Success message
SELECT 'Global Student Sheets database migration completed successfully!' as message;
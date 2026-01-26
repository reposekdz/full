-- SMS Messages Table
CREATE TABLE IF NOT EXISTS sms_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipient VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sender_id INT NOT NULL,
  status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  provider VARCHAR(50) DEFAULT 'africastalking',
  metadata JSON,
  response TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sender (sender_id),
  INDEX idx_recipient (recipient),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  FOREIGN KEY (sender_id) REFERENCES staff(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add has_smartphone column to parents table if not exists
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS has_smartphone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_contact_method ENUM('sms', 'app', 'dual') DEFAULT 'sms',
ADD COLUMN IF NOT EXISTS last_sms_received TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS sms_opt_out BOOLEAN DEFAULT FALSE;

-- SMS Templates Table
CREATE TABLE IF NOT EXISTS sms_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category ENUM('academic', 'discipline', 'finance', 'general', 'emergency') NOT NULL,
  message_template TEXT NOT NULL,
  variables JSON,
  created_by INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Delivery Reports Table
CREATE TABLE IF NOT EXISTS sms_delivery_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  delivery_status ENUM('sent', 'delivered', 'failed', 'expired') NOT NULL,
  network_code VARCHAR(10),
  delivery_time TIMESTAMP NULL,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES sms_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Campaigns Table
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  target_audience ENUM('all', 'class', 'grade', 'custom') NOT NULL,
  target_filter JSON,
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  created_by INT NOT NULL,
  status ENUM('draft', 'scheduled', 'sending', 'completed', 'cancelled') DEFAULT 'draft',
  scheduled_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Balance Log Table
CREATE TABLE IF NOT EXISTS sms_balance_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  balance_amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checked_by INT,
  FOREIGN KEY (checked_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default SMS templates
INSERT INTO sms_templates (name, category, message_template, variables, created_by) VALUES
('Student Absence', 'academic', 'Dear Parent, your child {student_name} was absent from school on {date}. Please contact the school if this is unexpected.', '["student_name", "date"]', 1),
('Fee Reminder', 'finance', 'Dear Parent, this is a reminder that school fees of {amount} RWF for {student_name} are due by {due_date}. Thank you.', '["student_name", "amount", "due_date"]', 1),
('Exam Results', 'academic', 'Dear Parent, {student_name} scored {marks}% in {subject} exam. Overall position: {position}. Well done!', '["student_name", "marks", "subject", "position"]', 1),
('Discipline Notice', 'discipline', 'Dear Parent, we need to discuss {student_name}''s behavior. Please contact the Director of Discipline at your earliest convenience.', '["student_name"]', 1),
('Emergency Alert', 'emergency', 'URGENT: {message}. Please contact the school immediately.', '["message"]', 1),
('Meeting Invitation', 'general', 'Dear Parent, you are invited to a parents meeting on {date} at {time}. Venue: {location}. Your attendance is important.', '["date", "time", "location"]', 1),
('Achievement Notification', 'academic', 'Congratulations! {student_name} has achieved {achievement}. We are proud of this accomplishment!', '["student_name", "achievement"]', 1);

-- ================================================
-- COMPREHENSIVE MESSAGING AND NOTIFICATION SYSTEM
-- Database Tables Creation Script
-- ================================================

-- Messages Table (Staff-to-Parent Messaging)
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  recipient_type ENUM('parent', 'student', 'staff', 'all') DEFAULT 'parent',
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  category VARCHAR(100) DEFAULT 'general',
  attachments JSON DEFAULT NULL,
  status ENUM('draft', 'sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
  parent_message_id INT DEFAULT NULL,
  is_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL DEFAULT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE CASCADE,
  INDEX idx_recipient (recipient_id, recipient_type),
  INDEX idx_sender (sender_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message Reads Tracking Table
CREATE TABLE IF NOT EXISTS message_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_read (message_id, user_id),
  INDEX idx_message (message_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table (In-App Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reference_id INT DEFAULT NULL,
  reference_type VARCHAR(50) DEFAULT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_type (type),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at),
  INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Templates Table
CREATE TABLE IF NOT EXISTS notification_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  title_template VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  sms_template TEXT DEFAULT NULL,
  target_audience ENUM('parent', 'student', 'staff', 'all') NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  send_sms BOOLEAN DEFAULT FALSE,
  send_email BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_event (event_type, category),
  INDEX idx_event (event_type),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Logs Table (Track all sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT DEFAULT NULL,
  event_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_count INT DEFAULT 0,
  sms_sent INT DEFAULT 0,
  email_sent INT DEFAULT 0,
  in_app_sent INT DEFAULT 0,
  target_audience VARCHAR(50) DEFAULT NULL,
  reference_data JSON DEFAULT NULL,
  status ENUM('pending', 'sent', 'failed', 'partial') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL,
  INDEX idx_event (event_type),
  INDEX idx_created (created_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table (Admin Oversight)
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT DEFAULT NULL,
  details JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Logs Table (Track SMS sending)
CREATE TABLE IF NOT EXISTS sms_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sender_id INT DEFAULT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  provider VARCHAR(50) DEFAULT 'africastalking',
  message_id VARCHAR(255) DEFAULT NULL,
  cost DECIMAL(10, 4) DEFAULT 0.0000,
  metadata JSON DEFAULT NULL,
  error TEXT DEFAULT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_recipient (recipient),
  INDEX idx_status (status),
  INDEX idx_sent (sent_at),
  INDEX idx_provider (provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent-Student Links Table (For comprehensive auth)
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship VARCHAR(50) DEFAULT 'guardian',
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_link (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Notification Templates
INSERT INTO notification_templates (event_type, category, title_template, message_template, sms_template, target_audience, priority, send_sms, send_email) VALUES
('student_absent', 'attendance', 'Absence Alert: {{student_name}}', 'Your child {{student_name}} was marked absent on {{date}}. Please contact the school if this is incorrect.', '{{student_name}} absent on {{date}}. Contact school.', 'parent', 'high', TRUE, TRUE),
('grade_posted', 'academics', 'New Grade Posted', '{{student_name}} received a grade of {{grade}} in {{subject}}. Average: {{average}}%', 'Grade posted: {{grade}} in {{subject}}', 'parent', 'normal', FALSE, TRUE),
('assignment_created', 'academics', 'New Assignment: {{title}}', 'A new assignment "{{title}}" has been posted for {{subject}}. Due: {{due_date}}', 'New assignment: {{title}} due {{due_date}}', 'student', 'normal', FALSE, TRUE),
('fee_reminder', 'finance', 'Fee Payment Reminder', 'Fee payment of {{amount}} RWF is due on {{due_date}} for {{term}}. Current balance: {{balance}} RWF', 'Fee due: {{amount}} RWF by {{due_date}}', 'parent', 'high', TRUE, TRUE),
('discipline_incident', 'discipline', 'Discipline Alert', 'Your child {{student_name}} was involved in a {{incident_type}} incident. Action: {{action_taken}}', 'Discipline alert for {{student_name}}. Contact school.', 'parent', 'urgent', TRUE, TRUE),
('exam_scheduled', 'academics', 'Exam Scheduled: {{subject}}', 'An exam for {{subject}} has been scheduled on {{exam_date}}. Total marks: {{total_marks}}', 'Exam: {{subject}} on {{exam_date}}', 'student', 'high', FALSE, TRUE),
('school_event', 'general', 'School Event: {{event_name}}', '{{event_name}} is scheduled for {{event_date}} at {{location}}. {{description}}', 'Event: {{event_name}} on {{event_date}}', 'all', 'normal', TRUE, TRUE),
('payment_received', 'finance', 'Payment Received', 'Payment of {{amount}} RWF received. New balance: {{balance}} RWF. Thank you!', 'Payment received: {{amount}} RWF', 'parent', 'normal', TRUE, FALSE),
('report_card_ready', 'academics', 'Report Card Available', 'The report card for {{student_name}} - {{term}} is now available. Overall grade: {{grade}}', 'Report card ready for {{term}}', 'parent', 'high', TRUE, TRUE),
('assignment_due_soon', 'academics', 'Assignment Due Tomorrow', 'Reminder: "{{title}}" is due tomorrow for {{subject}}. Please submit on time.', 'Assignment "{{title}}" due tomorrow', 'student', 'high', FALSE, TRUE),
('fee_overdue', 'finance', 'Overdue Fee Payment', 'Fee payment of {{amount}} RWF was due on {{due_date}}. Please pay immediately to avoid penalties.', 'Fee overdue: {{amount}} RWF. Pay now.', 'parent', 'urgent', TRUE, TRUE),
('exam_reminder', 'academics', 'Exam Tomorrow: {{subject}}', 'Reminder: {{subject}} exam is scheduled for tomorrow at {{time}}. Good luck!', 'Exam tomorrow: {{subject}} at {{time}}', 'student', 'high', FALSE, TRUE);

-- ================================================
-- END OF MIGRATION SCRIPT
-- ================================================

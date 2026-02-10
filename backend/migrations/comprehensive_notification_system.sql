-- Comprehensive Notification System Database Schema

-- Notification types and templates
CREATE TABLE IF NOT EXISTS notification_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type_code VARCHAR(50) NOT NULL UNIQUE,
  name_en VARCHAR(100) NOT NULL,
  name_rw VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification templates for different scenarios
CREATE TABLE IF NOT EXISTS notification_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type_code VARCHAR(50) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  subject_en VARCHAR(200),
  subject_rw VARCHAR(200),
  message_en TEXT NOT NULL,
  message_rw TEXT NOT NULL,
  sms_template_en VARCHAR(160),
  sms_template_rw VARCHAR(160),
  variables JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_code) REFERENCES notification_types(type_code)
);

-- Main notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_uuid VARCHAR(36) NOT NULL UNIQUE,
  type_code VARCHAR(50) NOT NULL,
  template_id INT,
  sender_id INT,
  sender_role VARCHAR(50),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  category ENUM('system', 'academic', 'financial', 'disciplinary', 'application', 'general') DEFAULT 'general',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (type_code) REFERENCES notification_types(type_code),
  FOREIGN KEY (template_id) REFERENCES notification_templates(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  INDEX idx_notifications_type (type_code),
  INDEX idx_notifications_priority (priority),
  INDEX idx_notifications_created (created_at)
);

-- Notification recipients (supports individual and bulk notifications)
CREATE TABLE IF NOT EXISTS notification_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_id INT NOT NULL,
  recipient_id INT,
  recipient_type ENUM('user', 'student', 'parent', 'staff', 'role', 'all') NOT NULL,
  recipient_identifier VARCHAR(100),
  phone_number VARCHAR(20),
  email VARCHAR(100),
  delivery_status ENUM('pending', 'sent', 'delivered', 'failed', 'read') DEFAULT 'pending',
  delivery_method ENUM('websocket', 'sms', 'email', 'push') NOT NULL,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  read_at TIMESTAMP NULL,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  INDEX idx_recipients_notification (notification_id),
  INDEX idx_recipients_status (delivery_status),
  INDEX idx_recipients_method (delivery_method)
);

-- SMS delivery tracking
CREATE TABLE IF NOT EXISTS sms_delivery_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_recipient_id INT NOT NULL,
  provider VARCHAR(50) DEFAULT 'africas_talking',
  message_id VARCHAR(100),
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('queued', 'sent', 'delivered', 'failed', 'rejected') DEFAULT 'queued',
  cost DECIMAL(10,4) DEFAULT 0,
  delivery_report JSON,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_recipient_id) REFERENCES notification_recipients(id),
  INDEX idx_sms_status (status),
  INDEX idx_sms_phone (phone_number)
);

-- WebSocket connection tracking
CREATE TABLE IF NOT EXISTS websocket_connections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  socket_id VARCHAR(100) NOT NULL UNIQUE,
  user_id INT,
  user_type ENUM('student', 'parent', 'staff', 'admin') NOT NULL,
  role_name VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_websocket_user (user_id),
  INDEX idx_websocket_active (is_active)
);

-- Real-time notification delivery tracking
CREATE TABLE IF NOT EXISTS realtime_delivery_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_recipient_id INT NOT NULL,
  socket_id VARCHAR(100),
  delivery_status ENUM('sent', 'delivered', 'failed') NOT NULL,
  delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT,
  FOREIGN KEY (notification_recipient_id) REFERENCES notification_recipients(id),
  INDEX idx_realtime_status (delivery_status)
);

-- Insert notification types
INSERT INTO notification_types (type_code, name_en, name_rw, description) VALUES
('APPLICATION_SUBMITTED', 'Application Submitted', 'Ibyifuzo Byakiriwe', 'Student application submitted notification'),
('APPLICATION_APPROVED', 'Application Approved', 'Ibyifuzo Byemewe', 'Student application approved notification'),
('APPLICATION_REJECTED', 'Application Rejected', 'Ibyifuzo Byanze', 'Student application rejected notification'),
('APPLICATION_UNDER_REVIEW', 'Application Under Review', 'Ibyifuzo Birasuzumwa', 'Application under review notification'),
('STUDENT_ENROLLED', 'Student Enrolled', 'Umunyeshuri Yinjiye', 'Student enrollment confirmation'),
('INTERVIEW_SCHEDULED', 'Interview Scheduled', 'Ikiganiro Cyateganijwe', 'Interview scheduled notification'),
('DOCUMENT_REQUIRED', 'Document Required', 'Inyandiko Zisabwa', 'Additional documents required'),
('FEE_PAYMENT_DUE', 'Fee Payment Due', 'Amafaranga Asabwa', 'Fee payment reminder'),
('ACADEMIC_UPDATE', 'Academic Update', 'Amakuru y\'Amasomo', 'Academic progress update'),
('DISCIPLINARY_ACTION', 'Disciplinary Action', 'Icyemezo cy\'Indero', 'Disciplinary action notification'),
('SYSTEM_ALERT', 'System Alert', 'Itangazo rya Sisitemu', 'System-wide alert notification'),
('EMERGENCY_ALERT', 'Emergency Alert', 'Itangazo ry\'Ihutirwa', 'Emergency notification');

-- Insert notification templates
INSERT INTO notification_templates (type_code, template_name, subject_en, subject_rw, message_en, message_rw, sms_template_en, sms_template_rw, variables) VALUES
('APPLICATION_SUBMITTED', 'Application Confirmation', 'Application Received', 'Ibyifuzo Byakiriwe', 
 'Dear {{student_name}}, your application has been received successfully. Application Number: {{application_number}}. You will be contacted within 2 weeks.',
 'Nyakubahwa {{student_name}}, ibyifuzo byawe byakiriwe neza. Nomero: {{application_number}}. Uzahamagariwa mu gihe cya wiki 2.',
 'Application {{application_number}} received. You will be contacted soon.',
 'Ibyifuzo {{application_number}} byakiriwe. Uzahamagariwa vuba.',
 '["student_name", "application_number"]'),

('APPLICATION_APPROVED', 'Application Approved', 'Congratulations! Application Approved', 'Ibyifuzo Byemewe!', 
 'Congratulations {{student_name}}! Your application has been approved. Student ID: {{student_id}}. Report on {{enrollment_date}}.',
 'Amashimwe {{student_name}}! Ibyifuzo byawe byemewe. ID: {{student_id}}. Uje ku {{enrollment_date}}.',
 'Congratulations! Application approved. Student ID: {{student_id}}',
 'Amashimwe! Ibyifuzo byemewe. ID: {{student_id}}',
 '["student_name", "student_id", "enrollment_date"]'),

('APPLICATION_REJECTED', 'Application Rejected', 'Application Status Update', 'Ibyifuzo Byanze', 
 'Dear {{student_name}}, unfortunately your application could not be approved. Reason: {{rejection_reason}}. You may reapply next term.',
 'Nyakubahwa {{student_name}}, ibyifuzo byawe ntibyemerewe. Impamvu: {{rejection_reason}}. Ushobora ongera gusaba.',
 'Application rejected. Reason: {{rejection_reason}}',
 'Ibyifuzo byanze. Impamvu: {{rejection_reason}}',
 '["student_name", "rejection_reason"]'),

('INTERVIEW_SCHEDULED', 'Interview Scheduled', 'Interview Appointment', 'Ikiganiro Cyateganijwe', 
 'Dear {{student_name}}, your interview is scheduled for {{interview_date}} at {{interview_time}}. Location: {{location}}.',
 'Nyakubahwa {{student_name}}, ikiganiro cyawe ni ku {{interview_date}} saa {{interview_time}}. Aho: {{location}}.',
 'Interview: {{interview_date}} at {{interview_time}}. Location: {{location}}',
 'Ikiganiro: {{interview_date}} saa {{interview_time}}. Aho: {{location}}',
 '["student_name", "interview_date", "interview_time", "location"]');

-- Create indexes for performance
CREATE INDEX idx_notifications_expires ON notifications(expires_at);
CREATE INDEX idx_recipients_phone ON notification_recipients(phone_number);
CREATE INDEX idx_recipients_email ON notification_recipients(email);
CREATE INDEX idx_sms_created ON sms_delivery_log(created_at);
CREATE INDEX idx_websocket_last_activity ON websocket_connections(last_activity);
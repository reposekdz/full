-- Knowledge Base Management
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT,
  attachment VARCHAR(255),
  author_id INT,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_author (author_id)
);

-- Real-time Notifications
CREATE TABLE IF NOT EXISTS realtime_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error', 'announcement') DEFAULT 'info',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  action_url VARCHAR(255),
  metadata JSON,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  notification_types JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admission Workflows
CREATE TABLE IF NOT EXISTS admission_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  dob DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  guardian_name VARCHAR(200),
  guardian_phone VARCHAR(20),
  program VARCHAR(100),
  previous_school VARCHAR(200),
  grade_level VARCHAR(50),
  documents JSON,
  status ENUM('pending', 'under_review', 'interview_scheduled', 'approved', 'rejected', 'enrolled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_program (program)
);

CREATE TABLE IF NOT EXISTS admission_workflow (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  stage VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  reviewer_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES admission_applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admission_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES admission_applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admission_interviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  interviewer_id INT,
  location VARCHAR(200),
  notes TEXT,
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES admission_applications(id) ON DELETE CASCADE
);

-- Examination Scheduling
CREATE TABLE IF NOT EXISTS exam_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_name VARCHAR(200) NOT NULL,
  exam_type VARCHAR(100),
  academic_year VARCHAR(20),
  term VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'published', 'completed') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  subject_id INT NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INT,
  room_id INT,
  max_students INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES exam_schedules(id) ON DELETE CASCADE,
  INDEX idx_date (exam_date),
  INDEX idx_room (room_id)
);

CREATE TABLE IF NOT EXISTS exam_invigilators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  teacher_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (session_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  building VARCHAR(100),
  floor INT,
  facilities TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- Certificate Generation
CREATE TABLE IF NOT EXISTS certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  certificate_type VARCHAR(100) NOT NULL,
  template_id INT,
  issue_date DATE NOT NULL,
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  data JSON,
  status ENUM('issued', 'revoked') DEFAULT 'issued',
  revoked_at TIMESTAMP NULL,
  revoke_reason TEXT,
  revoked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_verification (verification_code)
);

CREATE TABLE IF NOT EXISTS certificate_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(100) NOT NULL,
  design JSON,
  fields JSON,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alumni Management
CREATE TABLE IF NOT EXISTS alumni (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT UNIQUE NOT NULL,
  graduation_year INT NOT NULL,
  current_occupation VARCHAR(200),
  company VARCHAR(200),
  position VARCHAR(200),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  linkedin VARCHAR(255),
  achievements JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_graduation (graduation_year)
);

CREATE TABLE IF NOT EXISTS alumni_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(255),
  organizer_id INT,
  max_attendees INT,
  status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alumni_event_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  alumni_id INT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES alumni_events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (event_id, alumni_id)
);

CREATE TABLE IF NOT EXISTS alumni_jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(200) NOT NULL,
  description TEXT,
  requirements TEXT,
  location VARCHAR(200),
  salary_range VARCHAR(100),
  posted_by INT,
  application_url VARCHAR(255),
  status ENUM('active', 'closed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS/Email Integration
CREATE TABLE IF NOT EXISTS email_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  template_id INT,
  sender_id INT,
  scheduled_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  attachments JSON,
  status ENUM('pending', 'scheduled', 'sent', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_at)
);

CREATE TABLE IF NOT EXISTS sms_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipient VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sender_id INT,
  scheduled_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  status ENUM('pending', 'scheduled', 'sent', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS email_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables JSON,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  variables JSON,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advanced Reporting
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_type VARCHAR(100) NOT NULL,
  filters JSON,
  data LONGTEXT,
  format VARCHAR(50),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (report_type),
  INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS custom_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  query_config JSON NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_type VARCHAR(100) NOT NULL,
  filters JSON,
  frequency ENUM('daily', 'weekly', 'monthly') NOT NULL,
  recipients JSON NOT NULL,
  format VARCHAR(50),
  last_run TIMESTAMP NULL,
  next_run TIMESTAMP NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create upload directories
CREATE TABLE IF NOT EXISTS system_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

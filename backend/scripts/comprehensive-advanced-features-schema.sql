-- Comprehensive Advanced Features Schema
-- School Management System - Full Feature Set

-- Enhanced Knowledge Base Management
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  content LONGTEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  author_id INT,
  views INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  attachments JSON,
  version INT DEFAULT 1,
  parent_version_id INT,
  meta_description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_version_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
  FULLTEXT KEY idx_search (title, content, tags)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kb_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  parent_id INT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES kb_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kb_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT NOT NULL,
  filename VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kb_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT NOT NULL,
  user_id INT,
  is_helpful BOOLEAN,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Notifications System
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error', 'announcement', 'assignment', 'grade', 'attendance', 'payment', 'exam') DEFAULT 'info',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  action_url VARCHAR(1000),
  action_text VARCHAR(200),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  data JSON,
  scheduled_for TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  title_template VARCHAR(500) NOT NULL,
  message_template TEXT NOT NULL,
  type VARCHAR(50),
  variables JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_type (user_id, notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admission Workflows
CREATE TABLE IF NOT EXISTS admission_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'active', 'closed', 'archived') DEFAULT 'draft',
  description TEXT,
  requirements JSON,
  fee_amount DECIMAL(10, 2),
  max_applications INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admission_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  session_id INT NOT NULL,
  student_first_name VARCHAR(200) NOT NULL,
  student_last_name VARCHAR(200) NOT NULL,
  student_dob DATE NOT NULL,
  student_gender ENUM('male', 'female', 'other'),
  grade_applying_for VARCHAR(50) NOT NULL,
  previous_school VARCHAR(500),
  parent_name VARCHAR(500) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  parent_address TEXT,
  emergency_contact JSON,
  medical_info JSON,
  status ENUM('submitted', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled') DEFAULT 'submitted',
  submitted_at TIMESTAMP NULL,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT,
  decision_notes TEXT,
  interview_scheduled TIMESTAMP NULL,
  interview_notes TEXT,
  application_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES admission_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admission_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  filename VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size BIGINT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by INT,
  verified_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES admission_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admission_workflow_steps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  step_name VARCHAR(200) NOT NULL,
  step_order INT NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
  assigned_to INT,
  notes TEXT,
  completed_at TIMESTAMP NULL,
  completed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES admission_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Examination Scheduling
CREATE TABLE IF NOT EXISTS exam_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'draft',
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exam_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  exam_name VARCHAR(500) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  class_id INT,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  room_id INT,
  max_students INT,
  instructions TEXT,
  status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES exam_rooms(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_date (exam_date),
  INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exam_rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_number VARCHAR(100) NOT NULL,
  building VARCHAR(200),
  floor VARCHAR(50),
  capacity INT NOT NULL,
  facilities JSON,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exam_invigilators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  teacher_id INT NOT NULL,
  role ENUM('chief', 'assistant', 'backup') DEFAULT 'assistant',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT,
  notes TEXT,
  FOREIGN KEY (schedule_id) REFERENCES exam_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_schedule_teacher (schedule_id, teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exam_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  student_id INT NOT NULL,
  seat_number VARCHAR(50),
  special_requirements TEXT,
  attendance_status ENUM('registered', 'present', 'absent', 'excused') DEFAULT 'registered',
  result_status ENUM('pending', 'submitted', 'published') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES exam_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_schedule_student (schedule_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Certificate Generation
CREATE TABLE IF NOT EXISTS certificate_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  template_file VARCHAR(500),
  template_html LONGTEXT,
  template_variables JSON,
  header_image VARCHAR(500),
  footer_text TEXT,
  signature_fields JSON,
  qr_code_enabled BOOLEAN DEFAULT TRUE,
  watermark VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  template_id INT NOT NULL,
  student_id INT NOT NULL,
  certificate_type VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  issue_date DATE NOT NULL,
  valid_until DATE,
  academic_year VARCHAR(20),
  grade VARCHAR(50),
  data JSON,
  file_path VARCHAR(1000),
  qr_code VARCHAR(500),
  verification_hash VARCHAR(255),
  status ENUM('draft', 'issued', 'revoked', 'expired') DEFAULT 'draft',
  issued_by INT,
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES certificate_templates(id) ON DELETE RESTRICT,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student (student_id),
  INDEX idx_certificate_number (certificate_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certificate_signatures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certificate_id INT NOT NULL,
  signatory_name VARCHAR(200) NOT NULL,
  signatory_title VARCHAR(200) NOT NULL,
  signature_image VARCHAR(500),
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certificate_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certificate_id INT NOT NULL,
  verification_code VARCHAR(255) NOT NULL,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_by VARCHAR(500),
  ip_address VARCHAR(100),
  FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
  INDEX idx_verification_code (verification_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alumni Management
CREATE TABLE IF NOT EXISTS alumni (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  student_id VARCHAR(100),
  first_name VARCHAR(200) NOT NULL,
  last_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  graduation_year INT NOT NULL,
  graduation_class VARCHAR(100),
  degree_earned VARCHAR(200),
  profile_photo VARCHAR(500),
  current_occupation VARCHAR(500),
  current_employer VARCHAR(500),
  industry VARCHAR(200),
  linkedin_url VARCHAR(500),
  address TEXT,
  city VARCHAR(200),
  country VARCHAR(200),
  bio TEXT,
  achievements JSON,
  willing_to_mentor BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  privacy_settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_graduation_year (graduation_year),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alumni_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_type ENUM('reunion', 'networking', 'workshop', 'social', 'fundraiser', 'other') DEFAULT 'networking',
  event_date DATETIME NOT NULL,
  end_date DATETIME,
  location VARCHAR(500),
  venue_details TEXT,
  max_attendees INT,
  registration_deadline DATETIME,
  fee_amount DECIMAL(10, 2) DEFAULT 0,
  banner_image VARCHAR(500),
  status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alumni_event_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  alumni_id INT NOT NULL,
  guests_count INT DEFAULT 0,
  dietary_requirements TEXT,
  special_requests TEXT,
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  payment_reference VARCHAR(200),
  attendance_status ENUM('registered', 'confirmed', 'attended', 'no_show', 'cancelled') DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES alumni_events(id) ON DELETE CASCADE,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_alumni (event_id, alumni_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alumni_jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  posted_by INT NOT NULL,
  job_title VARCHAR(500) NOT NULL,
  company_name VARCHAR(500) NOT NULL,
  company_logo VARCHAR(500),
  job_description TEXT NOT NULL,
  requirements TEXT,
  employment_type ENUM('full_time', 'part_time', 'contract', 'internship', 'freelance') DEFAULT 'full_time',
  experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'mid',
  location VARCHAR(500),
  remote_allowed BOOLEAN DEFAULT FALSE,
  salary_range VARCHAR(200),
  application_url VARCHAR(1000),
  application_deadline DATE,
  status ENUM('active', 'closed', 'filled') DEFAULT 'active',
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES alumni(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_posted_at (posted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alumni_mentorship (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mentor_id INT NOT NULL,
  mentee_id INT NOT NULL,
  status ENUM('requested', 'active', 'completed', 'declined') DEFAULT 'requested',
  focus_areas JSON,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES alumni(id) ON DELETE CASCADE,
  FOREIGN KEY (mentee_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS/Email Integration
CREATE TABLE IF NOT EXISTS communication_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  type ENUM('email', 'sms', 'both') NOT NULL,
  category VARCHAR(100),
  subject VARCHAR(500),
  body TEXT NOT NULL,
  variables JSON,
  attachments JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS communication_campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  template_id INT,
  type ENUM('email', 'sms', 'both') NOT NULL,
  target_audience JSON,
  scheduled_at TIMESTAMP NULL,
  status ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled') DEFAULT 'draft',
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES communication_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS communication_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT,
  recipient_type ENUM('user', 'parent', 'student', 'staff', 'external'),
  recipient_id INT,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  type ENUM('email', 'sms'),
  subject VARCHAR(500),
  message TEXT,
  status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked') DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES communication_campaigns(id) ON DELETE CASCADE,
  INDEX idx_recipient (recipient_type, recipient_id),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Advanced Reporting
CREATE TABLE IF NOT EXISTS custom_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  report_type ENUM('academic', 'financial', 'attendance', 'discipline', 'custom') DEFAULT 'custom',
  query_config JSON NOT NULL,
  columns JSON NOT NULL,
  filters JSON,
  grouping JSON,
  sorting JSON,
  charts JSON,
  is_public BOOLEAN DEFAULT FALSE,
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_config JSON,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_executions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  executed_by INT,
  execution_type ENUM('manual', 'scheduled') DEFAULT 'manual',
  parameters JSON,
  status ENUM('running', 'completed', 'failed') DEFAULT 'running',
  row_count INT,
  execution_time_ms INT,
  file_path VARCHAR(1000),
  file_format ENUM('pdf', 'excel', 'csv', 'json'),
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_report (report_id),
  INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  schedule_name VARCHAR(200) NOT NULL,
  frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
  day_of_week INT,
  day_of_month INT,
  time_of_day TIME,
  recipients JSON NOT NULL,
  format ENUM('pdf', 'excel', 'csv') DEFAULT 'pdf',
  is_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMP NULL,
  next_run TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard Analytics
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  widget_type ENUM('chart', 'table', 'metric', 'list', 'calendar', 'map', 'custom') NOT NULL,
  category VARCHAR(100),
  description TEXT,
  data_source JSON NOT NULL,
  visualization_config JSON NOT NULL,
  refresh_interval INT DEFAULT 300,
  roles_allowed JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_dashboards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  dashboard_name VARCHAR(200) NOT NULL,
  layout JSON NOT NULL,
  widgets JSON NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analytics_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(100),
  user_id INT,
  session_id VARCHAR(255),
  event_data JSON,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_event_type (event_type),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kpi_definitions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  calculation_query TEXT NOT NULL,
  target_value DECIMAL(15, 2),
  unit VARCHAR(50),
  trend_direction ENUM('higher_better', 'lower_better') DEFAULT 'higher_better',
  update_frequency ENUM('realtime', 'hourly', 'daily', 'weekly', 'monthly') DEFAULT 'daily',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kpi_values (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kpi_id INT NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSON,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kpi_id) REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  INDEX idx_kpi_period (kpi_id, period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Parent Portal Tables
CREATE TABLE IF NOT EXISTS parent_portal_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  access_level ENUM('full', 'limited', 'view_only') DEFAULT 'full',
  can_view_grades BOOLEAN DEFAULT TRUE,
  can_view_attendance BOOLEAN DEFAULT TRUE,
  can_view_finances BOOLEAN DEFAULT TRUE,
  can_communicate BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_parent_student (parent_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parent_communications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  teacher_id INT,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('inquiry', 'concern', 'feedback', 'request', 'other') DEFAULT 'inquiry',
  priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  resolved_at TIMESTAMP NULL,
  resolved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parent_payment_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  payment_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(100),
  reference_number VARCHAR(200),
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  description TEXT,
  receipt_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_parent (parent_id),
  INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance optimization
CREATE INDEX idx_kb_category ON knowledge_base(category);
CREATE INDEX idx_kb_status ON knowledge_base(status);
CREATE INDEX idx_admission_status ON admission_applications(status);
CREATE INDEX idx_exam_date_time ON exam_schedules(exam_date, start_time);
CREATE INDEX idx_certificate_student ON certificates(student_id, status);
CREATE INDEX idx_alumni_graduation ON alumni(graduation_year);
CREATE INDEX idx_comm_log_type ON communication_logs(type, status);
CREATE INDEX idx_report_exec_status ON report_executions(status);

-- Comprehensive Advisor System Schema
-- Complete advisor role with analytics, contact management, and student data access

-- Advisor profile table
CREATE TABLE IF NOT EXISTS advisor_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,
  staff_id VARCHAR(50) UNIQUE,
  specialization VARCHAR(100),
  years_experience INT DEFAULT 0,
  office_location VARCHAR(100),
  office_hours TEXT,
  bio TEXT,
  qualifications TEXT,
  languages_spoken TEXT,
  consultation_rate DECIMAL(10,2),
  total_consultations INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contact management system
CREATE TABLE IF NOT EXISTS advisor_contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  contact_type ENUM('student', 'parent', 'teacher', 'external', 'organization') NOT NULL,
  contact_name VARCHAR(200) NOT NULL,
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  organization VARCHAR(200),
  position VARCHAR(100),
  relationship VARCHAR(100),
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  tags TEXT,
  notes TEXT,
  last_contact_date DATETIME,
  next_followup_date DATETIME,
  total_interactions INT DEFAULT 0,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  INDEX idx_contact_type (contact_type),
  INDEX idx_priority (priority),
  INDEX idx_status (status)
);

-- Contact interaction history
CREATE TABLE IF NOT EXISTS advisor_contact_interactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contact_id INT,
  advisor_id INT,
  interaction_type ENUM('call', 'email', 'meeting', 'video_call', 'message', 'visit') NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  outcome TEXT,
  duration_minutes INT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,
  attachments TEXT,
  interaction_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES advisor_contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  INDEX idx_interaction_date (interaction_date),
  INDEX idx_interaction_type (interaction_type)
);

-- Student consultation sessions
CREATE TABLE IF NOT EXISTS advisor_consultations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  student_id INT,
  consultation_type ENUM('academic', 'career', 'personal', 'behavioral', 'health', 'financial', 'other') NOT NULL,
  session_date DATETIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  location VARCHAR(100),
  mode ENUM('in_person', 'online', 'phone', 'group') DEFAULT 'in_person',
  status ENUM('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled') DEFAULT 'scheduled',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  subject VARCHAR(255),
  description TEXT,
  notes TEXT,
  recommendations TEXT,
  action_items TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATETIME,
  parent_notified BOOLEAN DEFAULT FALSE,
  confidential BOOLEAN DEFAULT FALSE,
  satisfaction_rating INT,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_date (session_date),
  INDEX idx_consultation_type (consultation_type),
  INDEX idx_status (status)
);

-- Student progress tracking
CREATE TABLE IF NOT EXISTS advisor_student_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  student_id INT,
  tracking_date DATE NOT NULL,
  academic_performance ENUM('excellent', 'good', 'average', 'below_average', 'poor'),
  attendance_rate DECIMAL(5,2),
  behavior_rating ENUM('excellent', 'good', 'fair', 'needs_improvement', 'concerning'),
  engagement_level ENUM('very_high', 'high', 'moderate', 'low', 'very_low'),
  concerns TEXT,
  strengths TEXT,
  goals TEXT,
  interventions TEXT,
  parent_involvement ENUM('excellent', 'good', 'moderate', 'limited', 'none'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_tracking_date (tracking_date),
  INDEX idx_student_id (student_id)
);

-- School development initiatives
CREATE TABLE IF NOT EXISTS advisor_school_initiatives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  initiative_name VARCHAR(255) NOT NULL,
  category ENUM('academic', 'infrastructure', 'technology', 'sports', 'arts', 'community', 'health', 'environment', 'other') NOT NULL,
  description TEXT,
  objectives TEXT,
  target_audience VARCHAR(200),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  funding_source VARCHAR(200),
  status ENUM('planning', 'approved', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'planning',
  progress_percentage INT DEFAULT 0,
  impact_assessment TEXT,
  challenges TEXT,
  success_metrics TEXT,
  stakeholders TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_category (category)
);

-- Advisor recommendations and advice
CREATE TABLE IF NOT EXISTS advisor_recommendations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  recommendation_type ENUM('policy', 'academic', 'infrastructure', 'student_welfare', 'staff', 'financial', 'other') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rationale TEXT,
  expected_impact TEXT,
  implementation_plan TEXT,
  estimated_cost DECIMAL(12,2),
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  target_department VARCHAR(100),
  status ENUM('draft', 'submitted', 'under_review', 'approved', 'implemented', 'rejected') DEFAULT 'draft',
  submitted_date DATETIME,
  reviewed_by VARCHAR(100),
  review_date DATETIME,
  review_notes TEXT,
  implementation_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- Analytics data collection
CREATE TABLE IF NOT EXISTS advisor_analytics_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  metric_type ENUM('student_performance', 'attendance', 'behavior', 'enrollment', 'retention', 'satisfaction', 'financial', 'infrastructure', 'other') NOT NULL,
  metric_name VARCHAR(200) NOT NULL,
  metric_value DECIMAL(15,2),
  metric_unit VARCHAR(50),
  comparison_period VARCHAR(50),
  previous_value DECIMAL(15,2),
  change_percentage DECIMAL(5,2),
  trend ENUM('improving', 'stable', 'declining', 'fluctuating'),
  data_source VARCHAR(100),
  collection_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  INDEX idx_metric_type (metric_type),
  INDEX idx_collection_date (collection_date)
);

-- Advisor reports
CREATE TABLE IF NOT EXISTS advisor_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  report_type ENUM('weekly', 'monthly', 'quarterly', 'annual', 'special', 'incident') NOT NULL,
  report_title VARCHAR(255) NOT NULL,
  report_period_start DATE,
  report_period_end DATE,
  executive_summary TEXT,
  detailed_findings TEXT,
  data_analysis TEXT,
  recommendations TEXT,
  action_items TEXT,
  attachments TEXT,
  status ENUM('draft', 'submitted', 'reviewed', 'approved', 'published') DEFAULT 'draft',
  submitted_to VARCHAR(200),
  submission_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  INDEX idx_report_type (report_type),
  INDEX idx_status (status)
);

-- Student sheets access log
CREATE TABLE IF NOT EXISTS advisor_student_sheet_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  student_id INT,
  trade_id INT,
  level_id INT,
  access_type ENUM('view', 'export', 'print', 'share') NOT NULL,
  access_reason TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  access_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_access_date (access_date),
  INDEX idx_student_id (student_id)
);

-- Advisor notifications
CREATE TABLE IF NOT EXISTS advisor_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  notification_type ENUM('consultation', 'meeting', 'report_due', 'student_alert', 'parent_request', 'system', 'other') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  action_required BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  related_entity_type VARCHAR(50),
  related_entity_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  INDEX idx_is_read (is_read),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
);

-- Advisor schedule
CREATE TABLE IF NOT EXISTS advisor_schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  activity_type ENUM('consultation', 'office_hours', 'meeting', 'training', 'fieldwork', 'break', 'other') NOT NULL,
  location VARCHAR(100),
  description TEXT,
  is_recurring BOOLEAN DEFAULT TRUE,
  effective_from DATE,
  effective_until DATE,
  status ENUM('active', 'inactive', 'temporary') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  INDEX idx_day_of_week (day_of_week),
  INDEX idx_status (status)
);

-- Insert default advisor profile
INSERT INTO advisor_profiles (user_id, staff_id, specialization, years_experience, office_location, bio, qualifications, languages_spoken, status)
SELECT id, 'ADV-001', 'Educational Counseling & School Development', 8, 'Student Counseling Office', 
  'Experienced educational advisor specializing in student counseling, academic guidance, and school development initiatives. Dedicated to helping students achieve their academic and personal goals while contributing to overall school improvement.',
  'Master of Education, Bachelor in Counseling Psychology, Student Counseling Certificate, Conflict Resolution Training',
  'English, Kinyarwanda, French, Swahili',
  'active'
FROM users WHERE role = 'advisor' LIMIT 1
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

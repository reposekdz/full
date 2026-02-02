-- ========================================
-- COMPREHENSIVE GLOBAL STUDENT MANAGEMENT SYSTEM
-- ========================================
-- All student data centralized for all staff roles
-- Features: Advanced tracking, analytics, real-time updates
-- ========================================

-- Global Students Master Sheet
CREATE TABLE IF NOT EXISTS global_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT(first_name, ' ', IFNULL(middle_name, ''), ' ', last_name)) STORED,
  date_of_birth DATE NOT NULL,
  age INT GENERATED ALWAYS AS (YEAR(CURRENT_DATE) - YEAR(date_of_birth)) STORED,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  nationality VARCHAR(100) DEFAULT 'Rwandan',
  national_id VARCHAR(50),
  
  -- Contact Information
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  district VARCHAR(100),
  sector VARCHAR(100),
  cell VARCHAR(100),
  village VARCHAR(100),
  
  -- Emergency Contacts
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  emergency_contact_address TEXT,
  
  -- Academic Information
  current_class_id INT,
  current_level VARCHAR(50),
  current_trade VARCHAR(100),
  academic_year VARCHAR(20),
  enrollment_date DATE,
  expected_graduation_date DATE,
  academic_status ENUM('Active', 'Suspended', 'Graduated', 'Dropped', 'Transferred') DEFAULT 'Active',
  
  -- Performance Metrics
  current_gpa DECIMAL(3,2) DEFAULT 0.00,
  overall_attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
  conduct_score DECIMAL(5,2) DEFAULT 100.00,
  leadership_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Health & Medical
  blood_group VARCHAR(10),
  allergies TEXT,
  medical_conditions TEXT,
  special_needs TEXT,
  disability_status ENUM('None', 'Physical', 'Visual', 'Hearing', 'Learning', 'Multiple') DEFAULT 'None',
  
  -- Financial Status
  fee_balance DECIMAL(12,2) DEFAULT 0.00,
  total_fees_paid DECIMAL(12,2) DEFAULT 0.00,
  scholarship_status ENUM('None', 'Partial', 'Full') DEFAULT 'None',
  scholarship_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Documents
  profile_image VARCHAR(500),
  birth_certificate VARCHAR(500),
  national_id_copy VARCHAR(500),
  previous_school_certificate VARCHAR(500),
  medical_certificate VARCHAR(500),
  
  -- Biometric & Security
  fingerprint_data TEXT,
  face_recognition_data TEXT,
  rfid_card_number VARCHAR(50),
  
  -- Metadata
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_activity_date TIMESTAMP,
  
  INDEX idx_student_id (student_id),
  INDEX idx_admission_number (admission_number),
  INDEX idx_academic_status (academic_status),
  INDEX idx_current_class (current_class_id),
  INDEX idx_name (first_name, last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent/Guardian Information (Linked to Global Students)
CREATE TABLE IF NOT EXISTS student_parents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Parent Information
  parent_type ENUM('Father', 'Mother', 'Guardian', 'Sponsor') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
  national_id VARCHAR(50),
  
  -- Contact
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  occupation VARCHAR(100),
  workplace VARCHAR(255),
  
  -- Access & Monitoring
  portal_access BOOLEAN DEFAULT true,
  can_make_payments BOOLEAN DEFAULT true,
  can_view_grades BOOLEAN DEFAULT true,
  can_view_attendance BOOLEAN DEFAULT true,
  can_communicate_teachers BOOLEAN DEFAULT true,
  
  -- Notifications Preferences
  sms_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT false,
  
  is_primary_contact BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_parent (student_id, parent_type),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Academic Records (Comprehensive)
CREATE TABLE IF NOT EXISTS student_academic_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term VARCHAR(20) NOT NULL,
  
  -- Subject Performance
  subject_id INT,
  subject_name VARCHAR(255),
  marks_obtained DECIMAL(5,2),
  total_marks DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(5),
  points DECIMAL(3,1),
  position INT,
  remarks TEXT,
  
  -- Teacher Assessment
  teacher_id INT,
  assessment_date DATE,
  skills_assessment JSON,
  competencies JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_year_term (student_id, academic_year, term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comprehensive Attendance System
CREATE TABLE IF NOT EXISTS student_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  day_of_week VARCHAR(20),
  
  -- Attendance Details
  status ENUM('Present', 'Absent', 'Late', 'Excused', 'Sick', 'Leave') NOT NULL,
  time_in TIME,
  time_out TIME,
  late_minutes INT DEFAULT 0,
  
  -- Subject-wise Attendance
  subject_id INT,
  period_number INT,
  class_id INT,
  
  -- Tracking
  marked_by INT,
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  
  -- Biometric Verification
  verification_method ENUM('Manual', 'Fingerprint', 'Face Recognition', 'RFID') DEFAULT 'Manual',
  verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (student_id, date, subject_id, period_number),
  INDEX idx_date (date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Behavior & Discipline Records
CREATE TABLE IF NOT EXISTS student_discipline_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Incident Details
  incident_type ENUM('Minor', 'Major', 'Critical', 'Positive') NOT NULL,
  category VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME,
  location VARCHAR(255),
  
  -- Action Taken
  action_taken TEXT,
  punishment VARCHAR(255),
  suspension_days INT DEFAULT 0,
  counseling_required BOOLEAN DEFAULT false,
  parent_notified BOOLEAN DEFAULT false,
  parent_notified_date DATE,
  
  -- Staff Information
  reported_by INT NOT NULL,
  handled_by INT,
  witness_names TEXT,
  
  -- Resolution
  status ENUM('Reported', 'Under Investigation', 'Resolved', 'Escalated') DEFAULT 'Reported',
  resolution TEXT,
  resolved_date DATE,
  
  -- Impact
  conduct_points_deducted INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_date (student_id, incident_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Fee Payments & Financial Records
CREATE TABLE IF NOT EXISTS student_fee_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Payment Details
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  transaction_id VARCHAR(100),
  payment_date DATE NOT NULL,
  academic_year VARCHAR(20),
  term VARCHAR(20),
  
  -- Amount
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_method ENUM('Cash', 'Mobile Money', 'Bank Transfer', 'Cheque', 'Card', 'Online') NOT NULL,
  currency VARCHAR(10) DEFAULT 'RWF',
  
  -- Payment Purpose
  fee_type ENUM('Tuition', 'Boarding', 'Transport', 'Meals', 'Uniform', 'Books', 'Exam', 'Activity', 'Other') NOT NULL,
  description TEXT,
  
  -- Mobile Money Details
  mobile_money_provider VARCHAR(50),
  mobile_money_transaction_ref VARCHAR(100),
  payer_phone VARCHAR(20),
  
  -- Receipt
  receipt_number VARCHAR(100) UNIQUE,
  receipt_url VARCHAR(500),
  
  -- Processing
  received_by INT,
  approved_by INT,
  approval_status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Approved',
  
  -- Parent Link
  paid_by_parent_id INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_payment (student_id, payment_date),
  INDEX idx_reference (payment_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Activities & Extracurriculars
CREATE TABLE IF NOT EXISTS student_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Activity Details
  activity_type ENUM('Sports', 'Club', 'Competition', 'Leadership', 'Community Service', 'Arts', 'Music', 'Drama') NOT NULL,
  activity_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Participation
  role VARCHAR(100),
  position VARCHAR(100),
  achievement VARCHAR(255),
  performance_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Beginner',
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- Recognition
  awards JSON,
  certificates JSON,
  leadership_points DECIMAL(5,2) DEFAULT 0.00,
  
  -- Supervision
  supervisor_id INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_activity (student_id, activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Health Records
CREATE TABLE IF NOT EXISTS student_health_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Visit Details
  visit_date DATE NOT NULL,
  visit_time TIME,
  visit_type ENUM('Checkup', 'Illness', 'Injury', 'Emergency', 'Routine', 'Follow-up') NOT NULL,
  
  -- Symptoms & Diagnosis
  symptoms TEXT,
  diagnosis TEXT,
  vital_signs JSON,
  
  -- Treatment
  treatment_given TEXT,
  medication_prescribed TEXT,
  dosage_instructions TEXT,
  
  -- Referral
  referred_to_hospital BOOLEAN DEFAULT false,
  hospital_name VARCHAR(255),
  referral_reason TEXT,
  
  -- Medical Staff
  attended_by INT,
  nurse_id INT,
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  -- Parent Notification
  parent_notified BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_visit (student_id, visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STAFF ACTION TRACKING SYSTEM
-- ========================================
-- Tracks all staff actions on students from global sheet
-- ========================================

CREATE TABLE IF NOT EXISTS staff_student_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Staff Information
  staff_id INT NOT NULL,
  staff_role ENUM('Teacher', 'Admin', 'Accountant', 'Headmaster', 'Stock Manager', 'Advisor', 'DOS', 'DOD', 'Patron', 'Matron') NOT NULL,
  staff_name VARCHAR(255),
  
  -- Student Information (from global sheet)
  student_id INT NOT NULL,
  student_admission_number VARCHAR(50),
  student_name VARCHAR(255),
  
  -- Action Details
  action_type VARCHAR(100) NOT NULL,
  action_category ENUM('Academic', 'Discipline', 'Financial', 'Health', 'Attendance', 'Counseling', 'Activity', 'Communication', 'Other') NOT NULL,
  action_description TEXT NOT NULL,
  
  -- Context
  context_data JSON,
  related_record_type VARCHAR(100),
  related_record_id INT,
  
  -- Impact
  impact_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  requires_followup BOOLEAN DEFAULT false,
  followup_date DATE,
  
  -- Metadata
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_staff_actions (staff_id, action_category),
  INDEX idx_student_actions (student_id, created_at),
  INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- PARENT PORTAL ADVANCED FEATURES
-- ========================================

CREATE TABLE IF NOT EXISTS parent_portal_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  
  session_token VARCHAR(255) UNIQUE NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL,
  ip_address VARCHAR(50),
  device_info TEXT,
  is_active BOOLEAN DEFAULT true,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_parent_session (parent_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parent_student_communications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Communication Details
  recipient_type ENUM('Teacher', 'Admin', 'Headmaster', 'Class Teacher', 'Subject Teacher', 'Counselor') NOT NULL,
  recipient_id INT,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Thread
  parent_message_id INT,
  is_reply BOOLEAN DEFAULT false,
  
  -- Status
  status ENUM('Sent', 'Read', 'Replied', 'Closed') DEFAULT 'Sent',
  priority ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal',
  
  -- Response
  response TEXT,
  responded_by INT,
  responded_at TIMESTAMP NULL,
  
  -- Attachments
  attachments JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_parent_comm (parent_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parent_payment_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Request Details
  request_type ENUM('Fee Payment', 'Advance Payment', 'Activity Fee', 'Transport Fee', 'Uniform', 'Books', 'Other') NOT NULL,
  amount_requested DECIMAL(12,2) NOT NULL,
  description TEXT,
  
  -- Payment
  payment_reference VARCHAR(100),
  payment_status ENUM('Pending', 'Initiated', 'Completed', 'Failed', 'Cancelled') DEFAULT 'Pending',
  payment_method VARCHAR(50),
  
  -- Mobile Money Integration
  mobile_money_phone VARCHAR(20),
  mobile_money_provider VARCHAR(50),
  transaction_id VARCHAR(100),
  
  -- Approval
  approved_by INT,
  approval_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  approval_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_parent_payments (parent_id, payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parent_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Notification Details
  notification_type ENUM('Academic', 'Attendance', 'Discipline', 'Health', 'Financial', 'Activity', 'General', 'Emergency') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Priority & Delivery
  priority ENUM('Low', 'Normal', 'High', 'Critical') DEFAULT 'Normal',
  delivery_method ENUM('SMS', 'Email', 'WhatsApp', 'Portal', 'All') DEFAULT 'Portal',
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP NULL,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP NULL,
  
  -- Action Required
  requires_action BOOLEAN DEFAULT false,
  action_url VARCHAR(500),
  action_taken BOOLEAN DEFAULT false,
  
  -- Metadata
  related_record_type VARCHAR(100),
  related_record_id INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_parent_notif (parent_id, is_read, notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STUDENT PORTAL ADVANCED FEATURES
-- ========================================

CREATE TABLE IF NOT EXISTS student_portal_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  session_token VARCHAR(255) UNIQUE NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL,
  ip_address VARCHAR(50),
  device_info TEXT,
  location_data JSON,
  is_active BOOLEAN DEFAULT true,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_session (student_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_learning_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Subject Progress
  subject_id INT,
  subject_name VARCHAR(255),
  topic VARCHAR(255),
  
  -- Progress Metrics
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  mastery_level ENUM('Beginner', 'Developing', 'Proficient', 'Expert') DEFAULT 'Beginner',
  time_spent_minutes INT DEFAULT 0,
  
  -- Performance
  quiz_score_average DECIMAL(5,2) DEFAULT 0.00,
  assignment_score_average DECIMAL(5,2) DEFAULT 0.00,
  practice_questions_attempted INT DEFAULT 0,
  practice_questions_correct INT DEFAULT 0,
  
  -- Engagement
  last_accessed TIMESTAMP,
  access_count INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  
  -- AI Recommendations
  recommended_resources JSON,
  weak_areas JSON,
  strong_areas JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_subject (student_id, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Achievement Details
  achievement_type ENUM('Academic', 'Sports', 'Leadership', 'Behavior', 'Attendance', 'Community Service', 'Innovation') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  badge_icon VARCHAR(500),
  
  -- Recognition
  points_awarded DECIMAL(5,2) DEFAULT 0.00,
  level VARCHAR(50),
  rarity ENUM('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary') DEFAULT 'Common',
  
  -- Verification
  awarded_by INT,
  awarded_date DATE,
  certificate_url VARCHAR(500),
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_achievement (student_id, achievement_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Notification Details
  notification_type ENUM('Assignment', 'Exam', 'Grade', 'Attendance', 'Announcement', 'Message', 'Activity', 'Achievement') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Priority
  priority ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal',
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP NULL,
  
  -- Action
  action_url VARCHAR(500),
  action_text VARCHAR(100),
  
  -- Metadata
  sender_id INT,
  sender_role VARCHAR(50),
  related_record_type VARCHAR(100),
  related_record_id INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_notif (student_id, is_read, notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ADVANCED ANALYTICS & REPORTING
-- ========================================

CREATE TABLE IF NOT EXISTS student_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  analysis_date DATE NOT NULL,
  
  -- Academic Analytics
  average_grade DECIMAL(5,2),
  grade_trend VARCHAR(20),
  subject_strengths JSON,
  subject_weaknesses JSON,
  predicted_final_grade DECIMAL(5,2),
  
  -- Attendance Analytics
  attendance_rate DECIMAL(5,2),
  absence_pattern JSON,
  punctuality_score DECIMAL(5,2),
  
  -- Behavior Analytics
  conduct_score DECIMAL(5,2),
  positive_incidents INT DEFAULT 0,
  negative_incidents INT DEFAULT 0,
  behavior_trend VARCHAR(20),
  
  -- Engagement Analytics
  portal_login_frequency INT DEFAULT 0,
  assignment_submission_rate DECIMAL(5,2),
  participation_score DECIMAL(5,2),
  
  -- AI Predictions
  risk_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Low',
  dropout_risk_score DECIMAL(5,2) DEFAULT 0.00,
  intervention_recommended BOOLEAN DEFAULT false,
  recommendations JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES global_students(id) ON DELETE CASCADE,
  INDEX idx_student_analytics (student_id, analysis_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Target Audience
  target_role VARCHAR(50),
  target_user_id INT,
  broadcast_type ENUM('Individual', 'Role', 'Class', 'School', 'Custom') DEFAULT 'Individual',
  
  -- Notification Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50),
  
  -- Delivery
  delivery_channels JSON,
  scheduled_time TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  
  -- Status
  status ENUM('Draft', 'Scheduled', 'Sent', 'Failed') DEFAULT 'Draft',
  
  -- Metadata
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_target (target_role, target_user_id),
  INDEX idx_status (status, scheduled_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ========================================

ALTER TABLE global_students ADD FULLTEXT INDEX ft_name (first_name, last_name);
ALTER TABLE global_students ADD FULLTEXT INDEX ft_search (first_name, middle_name, last_name, student_id, admission_number);

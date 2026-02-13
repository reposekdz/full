-- Production-Ready Student Application System with Enhanced Security
-- Drop existing tables if needed (use with caution in production)
-- DROP TABLE IF EXISTS application_interviews;
-- DROP TABLE IF EXISTS application_notifications;
-- DROP TABLE IF EXISTS application_status_history;
-- DROP TABLE IF EXISTS application_reviews;
-- DROP TABLE IF EXISTS application_documents;
-- DROP TABLE IF EXISTS application_analytics;
-- DROP TABLE IF EXISTS student_applications;

-- Main applications table with enhanced fields
CREATE TABLE IF NOT EXISTS student_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  national_id VARCHAR(20),
  passport_number VARCHAR(50),
  
  -- Address Information (Rwanda Administrative Structure)
  address TEXT NOT NULL,
  province_id INT,
  district_id INT,
  sector_id INT,
  cell_id INT,
  village_id INT,
  
  -- Parent/Guardian Information
  parent_name VARCHAR(200) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(255),
  parent_occupation VARCHAR(100),
  parent_address TEXT,
  parent_national_id VARCHAR(20),
  emergency_contact VARCHAR(200),
  emergency_phone VARCHAR(20),
  emergency_relationship VARCHAR(50),
  
  -- Academic Information
  previous_school VARCHAR(200) NOT NULL,
  education_level VARCHAR(100) NOT NULL,
  completion_year YEAR,
  previous_grades TEXT,
  academic_certificates TEXT,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  preferred_start_date DATE,
  second_choice_trade VARCHAR(10),
  
  -- Application Details
  reason_for_applying TEXT NOT NULL,
  career_goals TEXT,
  special_needs TEXT,
  medical_conditions TEXT,
  languages_spoken VARCHAR(255),
  computer_skills TEXT,
  work_experience TEXT,
  extracurricular_activities TEXT,
  reference_contacts TEXT,
  
  -- Financial Information
  fee_payment_method ENUM('self', 'parent', 'sponsor', 'scholarship', 'government') DEFAULT 'parent',
  sponsor_name VARCHAR(200),
  sponsor_phone VARCHAR(20),
  sponsor_email VARCHAR(255),
  financial_support TEXT,
  scholarship_applied BOOLEAN DEFAULT FALSE,
  
  -- System Fields
  application_date DATE NOT NULL,
  status ENUM('pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled', 'withdrawn') DEFAULT 'pending',
  priority ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
  student_id VARCHAR(50),
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  approval_notes TEXT,
  rejection_reason TEXT,
  
  -- Security & Audit
  ip_address VARCHAR(45),
  user_agent TEXT,
  submission_source ENUM('web', 'mobile', 'admin', 'api') DEFAULT 'web',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(10),
  verification_sent_at TIMESTAMP NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  -- Foreign Keys
  FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE SET NULL,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_application_number (application_number),
  INDEX idx_status (status),
  INDEX idx_trade_code (trade_code),
  INDEX idx_level_number (level_number),
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_national_id (national_id),
  INDEX idx_application_date (application_date),
  INDEX idx_created_at (created_at),
  INDEX idx_composite (status, trade_code, level_number, created_at),
  INDEX idx_search (first_name, last_name, application_number),
  INDEX idx_location (province_id, district_id, sector_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application documents with enhanced tracking
CREATE TABLE IF NOT EXISTS application_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_path VARCHAR(500) NOT NULL,
  document_type ENUM('photo', 'birth_certificate', 'academic_certificate', 'national_id', 'recommendation_letter', 'medical_report', 'other') NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by INT,
  verified_at TIMESTAMP NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_application_id (application_id),
  INDEX idx_document_type (document_type),
  INDEX idx_is_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application status history for audit trail
CREATE TABLE IF NOT EXISTS application_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  change_reason TEXT,
  changed_by INT,
  ip_address VARCHAR(45),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_application_id (application_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application reviews and comments
CREATE TABLE IF NOT EXISTS application_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  review_text TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  recommendation ENUM('strongly_approve', 'approve', 'neutral', 'reject', 'strongly_reject'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id),
  INDEX idx_reviewer_id (reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interview scheduling
CREATE TABLE IF NOT EXISTS application_interviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  interview_location VARCHAR(255),
  interviewer_id INT,
  interview_type ENUM('individual', 'group', 'practical', 'online', 'phone') DEFAULT 'individual',
  status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show') DEFAULT 'scheduled',
  meeting_link VARCHAR(500),
  notes TEXT,
  score INT CHECK (score BETWEEN 0 AND 100),
  recommendation ENUM('strongly_recommend', 'recommend', 'neutral', 'not_recommend'),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_application_id (application_id),
  INDEX idx_interview_date (interview_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics table for dashboard
CREATE TABLE IF NOT EXISTS application_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL UNIQUE,
  total_applications INT DEFAULT 0,
  pending_applications INT DEFAULT 0,
  under_review_applications INT DEFAULT 0,
  approved_applications INT DEFAULT 0,
  rejected_applications INT DEFAULT 0,
  waitlisted_applications INT DEFAULT 0,
  enrolled_applications INT DEFAULT 0,
  withdrawn_applications INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application verification codes
CREATE TABLE IF NOT EXISTS application_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  verification_type ENUM('phone', 'email', 'document') NOT NULL,
  verification_code VARCHAR(10) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  expires_at DATETIME NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id),
  INDEX idx_verification_code (verification_code),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application payment tracking
CREATE TABLE IF NOT EXISTS application_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  payment_type ENUM('application_fee', 'registration_fee', 'tuition_deposit') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  payment_method ENUM('cash', 'mobile_money', 'bank_transfer', 'card') NOT NULL,
  payment_reference VARCHAR(100),
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_date TIMESTAMP NULL,
  verified_by INT,
  verified_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_application_id (application_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_payment_reference (payment_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Create views for reporting
CREATE OR REPLACE VIEW v_application_summary AS
SELECT 
  sa.id,
  sa.application_number,
  CONCAT(sa.first_name, ' ', sa.last_name) as full_name,
  sa.phone,
  sa.email,
  sa.date_of_birth,
  TIMESTAMPDIFF(YEAR, sa.date_of_birth, CURDATE()) as age,
  sa.gender,
  p.name as province,
  d.name as district,
  s.name as sector,
  t.name as trade_name,
  sa.level_number,
  sa.status,
  sa.priority,
  sa.application_date,
  sa.created_at,
  sa.reviewed_at,
  DATEDIFF(NOW(), sa.created_at) as days_pending,
  COUNT(DISTINCT ad.id) as document_count,
  COUNT(DISTINCT ar.id) as review_count,
  u.name as reviewed_by_name
FROM student_applications sa
LEFT JOIN provinces p ON sa.province_id = p.id
LEFT JOIN districts d ON sa.district_id = d.id
LEFT JOIN sectors s ON sa.sector_id = s.id
LEFT JOIN trades t ON sa.trade_code = t.code
LEFT JOIN application_documents ad ON sa.id = ad.application_id
LEFT JOIN application_reviews ar ON sa.id = ar.application_id
LEFT JOIN users u ON sa.reviewed_by = u.id
WHERE sa.deleted_at IS NULL
GROUP BY sa.id;



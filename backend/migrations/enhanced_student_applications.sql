-- Enhanced Student Application System Database Schema

-- Main applications table
CREATE TABLE IF NOT EXISTS student_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  national_id VARCHAR(20),
  
  -- Address Information
  address TEXT NOT NULL,
  district VARCHAR(100),
  sector VARCHAR(100),
  cell VARCHAR(100),
  village VARCHAR(100),
  
  -- Parent/Guardian Information
  parent_name VARCHAR(200) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(255),
  parent_occupation VARCHAR(100),
  parent_address TEXT,
  emergency_contact VARCHAR(200),
  emergency_phone VARCHAR(20),
  
  -- Academic Information
  previous_school VARCHAR(200) NOT NULL,
  education_level VARCHAR(100) NOT NULL,
  completion_year YEAR,
  previous_grades TEXT,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  preferred_start_date DATE,
  
  -- Application Details
  reason_for_applying TEXT NOT NULL,
  career_goals TEXT,
  special_needs TEXT,
  medical_conditions TEXT,
  languages_spoken VARCHAR(255),
  computer_skills TEXT,
  work_experience TEXT,
  
  -- Financial Information
  fee_payment_method ENUM('self', 'parent', 'sponsor', 'scholarship'),
  sponsor_name VARCHAR(200),
  sponsor_phone VARCHAR(20),
  financial_support TEXT,
  
  -- System Fields
  application_date DATETIME NOT NULL,
  status ENUM('pending', 'under_review', 'approved', 'rejected', 'waitlisted') DEFAULT 'pending',
  student_id VARCHAR(50), -- Generated when approved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_application_number (application_number),
  INDEX idx_status (status),
  INDEX idx_trade_code (trade_code),
  INDEX idx_level_number (level_number),
  INDEX idx_application_date (application_date),
  INDEX idx_created_at (created_at)
);

-- Application documents table
CREATE TABLE IF NOT EXISTS application_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_path VARCHAR(500) NOT NULL,
  document_type VARCHAR(100),
  file_size INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id)
);

-- Application reviews/status changes table
CREATE TABLE IF NOT EXISTS application_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  status ENUM('pending', 'under_review', 'approved', 'rejected', 'waitlisted') NOT NULL,
  comments TEXT,
  decision_reason TEXT,
  reviewed_by INT, -- User ID of reviewer (DOS/Headmaster)
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_application_id (application_id),
  INDEX idx_reviewed_by (reviewed_by),
  INDEX idx_reviewed_at (reviewed_at)
);

-- Trade levels table (if not exists)
CREATE TABLE IF NOT EXISTS trade_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level_number INT NOT NULL,
  level_suffix VARCHAR(5) DEFAULT 'A',
  description VARCHAR(255),
  duration_months INT DEFAULT 12,
  prerequisites TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_level (level_number, level_suffix),
  INDEX idx_level_number (level_number)
);

-- Insert default trade levels
INSERT IGNORE INTO trade_levels (level_number, level_suffix, description, duration_months, prerequisites) VALUES
(1, 'A', 'Foundation Level - Basic skills and theory', 12, 'Senior 3 completion or equivalent'),
(2, 'A', 'Intermediate Level - Advanced skills development', 12, 'Level 1 completion with good grades'),
(3, 'A', 'Advanced Level - Specialization and practical application', 12, 'Level 2 completion with excellent performance'),
(4, 'A', 'Expert Level - Industry-ready professional skills', 12, 'Level 3 completion and industry experience'),
(5, 'A', 'Master Level - Leadership and advanced specialization', 12, 'Level 4 completion and demonstrated expertise');

-- Application notifications table
CREATE TABLE IF NOT EXISTS application_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  notification_type ENUM('submitted', 'under_review', 'approved', 'rejected', 'document_request', 'interview_scheduled') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),
  sent_at TIMESTAMP NULL,
  delivery_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_delivery_status (delivery_status)
);

-- Application interview scheduling table
CREATE TABLE IF NOT EXISTS application_interviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  interview_location VARCHAR(255),
  interviewer_id INT,
  interview_type ENUM('individual', 'group', 'practical', 'online') DEFAULT 'individual',
  status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  notes TEXT,
  score INT, -- Out of 100
  recommendation ENUM('strongly_recommend', 'recommend', 'neutral', 'not_recommend') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_application_id (application_id),
  INDEX idx_interview_date (interview_date),
  INDEX idx_interviewer_id (interviewer_id)
);

-- Application statistics view
CREATE OR REPLACE VIEW application_statistics AS
SELECT 
  DATE(created_at) as application_date,
  COUNT(*) as total_applications,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review_count,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
  trade_code,
  level_number
FROM student_applications 
GROUP BY DATE(created_at), trade_code, level_number
ORDER BY application_date DESC;

-- Triggers for automatic notifications
DELIMITER //

CREATE TRIGGER after_application_status_update
AFTER UPDATE ON student_applications
FOR EACH ROW
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO application_notifications (
      application_id, 
      notification_type, 
      title, 
      message, 
      recipient_phone, 
      recipient_email
    ) VALUES (
      NEW.id,
      NEW.status,
      CASE NEW.status
        WHEN 'under_review' THEN 'Application Under Review'
        WHEN 'approved' THEN 'Application Approved - Welcome to Garden TVET!'
        WHEN 'rejected' THEN 'Application Status Update'
        WHEN 'waitlisted' THEN 'Application Waitlisted'
        ELSE 'Application Status Update'
      END,
      CASE NEW.status
        WHEN 'under_review' THEN CONCAT('Dear ', NEW.first_name, ', your application ', NEW.application_number, ' is now under review by our admissions team.')
        WHEN 'approved' THEN CONCAT('Congratulations ', NEW.first_name, '! Your application has been approved. Welcome to Garden TVET School!')
        WHEN 'rejected' THEN CONCAT('Dear ', NEW.first_name, ', we regret to inform you that your application was not successful this time.')
        WHEN 'waitlisted' THEN CONCAT('Dear ', NEW.first_name, ', your application has been placed on our waiting list.')
        ELSE CONCAT('Your application status has been updated to: ', NEW.status)
      END,
      NEW.phone,
      NEW.email
    );
  END IF;
END//

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_applications_composite ON student_applications(status, trade_code, level_number, created_at);
CREATE INDEX idx_applications_search ON student_applications(first_name, last_name, application_number);
CREATE INDEX idx_documents_type ON application_documents(document_type, uploaded_at);
CREATE INDEX idx_reviews_status_date ON application_reviews(status, reviewed_at);

-- Sample data for testing (optional)
-- INSERT INTO student_applications (
--   application_number, first_name, last_name, date_of_birth, gender, phone, email,
--   address, parent_name, parent_phone, previous_school, education_level,
--   trade_code, level_number, reason_for_applying, application_date, status
-- ) VALUES (
--   'APP1234567890', 'John', 'Doe', '2005-01-15', 'male', '+250788123456', 'john@example.com',
--   'Kigali, Gasabo, Remera', 'Jane Doe', '+250788654321', 'ABC Secondary School', 'senior_3_completed',
--   'SOD', 1, 'I want to become a software developer', NOW(), 'pending'
-- );
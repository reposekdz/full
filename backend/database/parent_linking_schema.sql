-- Parent Linking and Application System Schema

CREATE TABLE IF NOT EXISTS parents (
  parent_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100),
  national_id VARCHAR(50) UNIQUE,
  address TEXT,
  occupation VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_national_id (national_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_parents (
  link_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_id INT NOT NULL,
  relationship ENUM('father', 'mother', 'guardian', 'parent', 'other') DEFAULT 'parent',
  is_primary BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_link (student_id, parent_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS parent_applications (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  parent_id INT NOT NULL,
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_dob DATE NOT NULL,
  student_gender ENUM('Male', 'Female') NOT NULL,
  previous_school VARCHAR(200),
  previous_grade VARCHAR(50),
  desired_trade VARCHAR(10) NOT NULL,
  desired_level INT NOT NULL,
  application_reason TEXT,
  emergency_contact VARCHAR(20),
  has_disabilities BOOLEAN DEFAULT 0,
  disability_details TEXT,
  medical_conditions TEXT,
  parent_income DECIMAL(10,2),
  status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS application_documents (
  document_id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  document_type ENUM('birth_certificate', 'report_card', 'id_copy', 'photo', 'medical', 'other') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES parent_applications(application_id) ON DELETE CASCADE,
  INDEX idx_application (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS parent_communications (
  communication_id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  communication_type ENUM('sms', 'email', 'whatsapp', 'call', 'meeting') NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  sent_by INT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent', 'delivered', 'failed', 'read') DEFAULT 'sent',
  FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

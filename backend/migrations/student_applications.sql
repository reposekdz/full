-- Student Applications System
CREATE TABLE IF NOT EXISTS student_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    
    -- Parent/Guardian Information
    parent_name VARCHAR(200) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(255),
    parent_occupation VARCHAR(100),
    
    -- Academic Information
    previous_school VARCHAR(255),
    education_level ENUM('senior_3_completed', 'changing_school', 'other') NOT NULL,
    trade_code VARCHAR(50) NOT NULL,
    level_number INT NOT NULL,
    level_suffix VARCHAR(10),
    
    -- Application Details
    reason_for_applying TEXT NOT NULL,
    previous_grades TEXT,
    special_needs TEXT,
    
    -- Status & Management
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'enrolled') DEFAULT 'pending',
    reviewed_by_dos INT,
    reviewed_by_headmaster INT,
    dos_comments TEXT,
    headmaster_comments TEXT,
    dos_decision ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    headmaster_decision ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    dos_reviewed_at TIMESTAMP NULL,
    headmaster_reviewed_at TIMESTAMP NULL,
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_trade (trade_code),
    INDEX idx_application_number (application_number),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Application Documents
CREATE TABLE IF NOT EXISTS application_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    document_type ENUM('birth_certificate', 'school_certificate', 'id_card', 'photo', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Application Activity Log
CREATE TABLE IF NOT EXISTS application_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

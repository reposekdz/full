-- ============================================
-- STUDENT APPLICATION MANAGEMENT SYSTEM
-- Complete system with DOS and Headmaster approval workflow
-- ============================================

-- Student Applications Table
CREATE TABLE IF NOT EXISTS student_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    national_id VARCHAR(20),
    profile_photo VARCHAR(500),
    address TEXT NOT NULL,
    province_id INT,
    district_id INT,
    sector_id INT,
    cell_id INT,
    village_id INT,
    
    -- Parent/Guardian Information
    parent_name VARCHAR(200) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(100),
    parent_occupation VARCHAR(100),
    parent_address TEXT,
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    
    -- Academic Information
    previous_school VARCHAR(200) NOT NULL,
    education_level VARCHAR(50) NOT NULL,
    completion_year INT,
    previous_grades TEXT,
    report_card_image VARCHAR(500),
    trade_code VARCHAR(10) NOT NULL,
    level_number INT NOT NULL,
    preferred_start_date DATE,
    
    -- Additional Information
    reason_for_applying TEXT NOT NULL,
    career_goals TEXT,
    special_needs TEXT,
    medical_conditions TEXT,
    languages_spoken VARCHAR(200),
    computer_skills TEXT,
    work_experience TEXT,
    
    -- Financial Information
    fee_payment_method VARCHAR(50),
    sponsor_name VARCHAR(200),
    sponsor_phone VARCHAR(20),
    financial_support TEXT,
    
    -- Application Status
    status ENUM('pending', 'under_review_dos', 'approved_dos', 'rejected_dos', 'under_review_headmaster', 'approved', 'rejected', 'enrolled') DEFAULT 'pending',
    application_date DATE NOT NULL,
    
    -- DOS Review
    dos_reviewed_by INT,
    dos_reviewed_at DATETIME,
    dos_comments TEXT,
    dos_score INT,
    dos_recommendation ENUM('approve', 'reject', 'needs_interview'),
    
    -- Headmaster Review
    headmaster_reviewed_by INT,
    headmaster_reviewed_at DATETIME,
    headmaster_comments TEXT,
    headmaster_decision ENUM('approved', 'rejected', 'needs_more_info'),
    
    -- Interview
    interview_scheduled BOOLEAN DEFAULT FALSE,
    interview_date DATETIME,
    interview_location VARCHAR(200),
    interview_notes TEXT,
    interview_score INT,
    
    -- Final Decision
    final_decision ENUM('accepted', 'rejected', 'waitlist') DEFAULT NULL,
    decision_date DATE,
    rejection_reason TEXT,
    
    -- Enrollment
    enrolled BOOLEAN DEFAULT FALSE,
    enrollment_date DATE,
    student_id VARCHAR(20),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_application_number (application_number),
    INDEX idx_status (status),
    INDEX idx_trade_level (trade_code, level_number),
    INDEX idx_application_date (application_date),
    INDEX idx_dos_review (dos_reviewed_by, status),
    INDEX idx_headmaster_review (headmaster_reviewed_by, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application Documents Table
CREATE TABLE IF NOT EXISTS application_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application Status History Table
CREATE TABLE IF NOT EXISTS application_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT,
    changed_by_role VARCHAR(50),
    comments TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application (application_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application Comments/Notes Table
CREATE TABLE IF NOT EXISTS application_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    user_id INT NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    comment_type ENUM('note', 'question', 'recommendation', 'concern') DEFAULT 'note',
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application (application_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application Notifications Table
CREATE TABLE IF NOT EXISTS application_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    recipient_type ENUM('applicant', 'parent', 'dos', 'headmaster', 'admin') NOT NULL,
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(100),
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    sent_via ENUM('sms', 'email', 'both') DEFAULT 'sms',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application (application_id),
    INDEX idx_delivery_status (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application Statistics Table
CREATE TABLE IF NOT EXISTS application_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stat_date DATE NOT NULL,
    total_applications INT DEFAULT 0,
    pending_applications INT DEFAULT 0,
    approved_applications INT DEFAULT 0,
    rejected_applications INT DEFAULT 0,
    enrolled_students INT DEFAULT 0,
    applications_by_trade JSON,
    applications_by_level JSON,
    average_processing_days DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample validation rules
INSERT INTO location_validation_rules (field_name, rule_type, rule_value, error_message_en, error_message_rw) VALUES
('first_name', 'required', '', 'First name is required', 'Izina rya mbere ni ngombwa'),
('first_name', 'min_length', '2', 'First name must be at least 2 characters', 'Izina rya mbere rigomba kuba byibuze inyuguti 2'),
('last_name', 'required', '', 'Last name is required', 'Izina rya kabiri ni ngombwa'),
('phone', 'required', '', 'Phone number is required', 'Nomero ya telefoni ni ngombwa'),
('phone', 'pattern', '^(\\+250|0)[7][0-9]{8}$', 'Invalid phone number format', 'Nomero ya telefoni ntiyemewe'),
('email', 'pattern', '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', 'Invalid email format', 'Email ntiyemewe'),
('reason_for_applying', 'required', '', 'Reason for applying is required', 'Impamvu yo gusaba ni ngombwa'),
('reason_for_applying', 'min_length', '50', 'Reason must be at least 50 characters', 'Impamvu zigomba kuba byibuze inyuguti 50')
ON DUPLICATE KEY UPDATE rule_value=VALUES(rule_value);

-- Create stored procedure for application number generation
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS generate_application_number(OUT app_number VARCHAR(20))
BEGIN
    DECLARE year_code VARCHAR(4);
    DECLARE sequence_num INT;
    
    SET year_code = DATE_FORMAT(NOW(), '%Y');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_number, 9) AS UNSIGNED)), 0) + 1
    INTO sequence_num
    FROM student_applications
    WHERE application_number LIKE CONCAT('APP', year_code, '%');
    
    SET app_number = CONCAT('APP', year_code, LPAD(sequence_num, 5, '0'));
END //
DELIMITER ;

-- Create trigger to log status changes
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_application_status_update
AFTER UPDATE ON student_applications
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, changed_by_role)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.dos_reviewed_by, 'system');
    END IF;
END //
DELIMITER ;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON student_applications TO 'school_user'@'localhost';
GRANT SELECT, INSERT ON application_documents TO 'school_user'@'localhost';
GRANT SELECT, INSERT ON application_status_history TO 'school_user'@'localhost';
GRANT SELECT, INSERT ON application_comments TO 'school_user'@'localhost';
GRANT SELECT, INSERT ON application_notifications TO 'school_user'@'localhost';
GRANT SELECT ON application_statistics TO 'school_user'@'localhost';

-- Create indexes for performance
CREATE INDEX idx_status_date ON student_applications(status, application_date);
CREATE INDEX idx_trade_status ON student_applications(trade_code, status);
CREATE INDEX idx_dos_pending ON student_applications(status, dos_reviewed_by) WHERE status IN ('pending', 'under_review_dos');
CREATE INDEX idx_headmaster_pending ON student_applications(status, headmaster_reviewed_by) WHERE status IN ('approved_dos', 'under_review_headmaster');

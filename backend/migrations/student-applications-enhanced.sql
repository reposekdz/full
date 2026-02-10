-- Enhanced Student Applications System Database Schema

-- Main student applications table
CREATE TABLE IF NOT EXISTS student_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    national_id VARCHAR(16),
    address TEXT,
    
    -- Location Information
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
    
    -- Emergency Contact
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    
    -- Educational Background
    previous_school VARCHAR(200) NOT NULL,
    education_level ENUM('Primary', 'Secondary', 'TVET', 'University', 'Other') DEFAULT 'Secondary',
    completion_year YEAR,
    previous_grades TEXT,
    
    -- Application Details
    trade_code VARCHAR(20) NOT NULL,
    level_number INT NOT NULL,
    preferred_start_date DATE,
    reason_for_applying TEXT NOT NULL,
    career_goals TEXT,
    
    -- Special Requirements
    special_needs TEXT,
    medical_conditions TEXT,
    languages_spoken VARCHAR(255),
    computer_skills TEXT,
    work_experience TEXT,
    
    -- Financial Information
    fee_payment_method ENUM('Self', 'Parent', 'Sponsor', 'Scholarship', 'Government') DEFAULT 'Parent',
    sponsor_name VARCHAR(200),
    sponsor_phone VARCHAR(20),
    financial_support TEXT,
    
    -- Application Status
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled') DEFAULT 'pending',
    application_date DATE NOT NULL,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_trade_code (trade_code),
    INDEX idx_application_date (application_date),
    INDEX idx_province_id (province_id),
    INDEX idx_district_id (district_id),
    
    -- Foreign Keys
    FOREIGN KEY (province_id) REFERENCES provinces(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (sector_id) REFERENCES sectors(id),
    FOREIGN KEY (cell_id) REFERENCES cells(id),
    FOREIGN KEY (village_id) REFERENCES villages(id),
    FOREIGN KEY (trade_code) REFERENCES trades(code),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
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

-- Application status history table
CREATE TABLE IF NOT EXISTS application_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    change_reason TEXT,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_application_id (application_id),
    INDEX idx_changed_at (changed_at)
);

-- Application reviews table
CREATE TABLE IF NOT EXISTS application_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_text TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    INDEX idx_application_id (application_id),
    INDEX idx_reviewer_id (reviewer_id)
);

-- Application analytics table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date)
);

-- Application notifications table (for SMS/Email)
CREATE TABLE IF NOT EXISTS application_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    notification_type ENUM('submission', 'status_change', 'approval', 'rejection', 'reminder') NOT NULL,
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_status (status),
    INDEX idx_notification_type (notification_type)
);

-- Application interview schedule table
CREATE TABLE IF NOT EXISTS application_interviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    interviewer_id INT,
    location VARCHAR(255),
    notes TEXT,
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    score INT CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (interviewer_id) REFERENCES users(id),
    INDEX idx_application_id (application_id),
    INDEX idx_interview_date (interview_date),
    INDEX idx_status (status)
);

-- Application requirements checklist
CREATE TABLE IF NOT EXISTS application_requirements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    requirement_name VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_is_completed (is_completed)
);

-- Application fees table
CREATE TABLE IF NOT EXISTS application_fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    fee_type ENUM('application', 'registration', 'examination', 'other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    payment_status ENUM('pending', 'paid', 'partial', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_at TIMESTAMP NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_due_date (due_date)
);

-- Application communication log
CREATE TABLE IF NOT EXISTS application_communications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    communication_type ENUM('email', 'sms', 'call', 'meeting', 'letter') NOT NULL,
    direction ENUM('inbound', 'outbound') NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    sender_id INT,
    recipient VARCHAR(255),
    status ENUM('sent', 'delivered', 'read', 'replied', 'failed') DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    INDEX idx_application_id (application_id),
    INDEX idx_communication_type (communication_type),
    INDEX idx_created_at (created_at)
);

-- Provinces table (if not exists)
CREATE TABLE IF NOT EXISTS provinces (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Districts table (if not exists)
CREATE TABLE IF NOT EXISTS districts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    province_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (province_id) REFERENCES provinces(id)
);

-- Sectors table (if not exists)
CREATE TABLE IF NOT EXISTS sectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    district_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Cells table (if not exists)
CREATE TABLE IF NOT EXISTS cells (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sector_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sector_id) REFERENCES sectors(id)
);

-- Villages table (if not exists)
CREATE TABLE IF NOT EXISTS villages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cell_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cell_id) REFERENCES cells(id)
);

-- Trades table (if not exists)
CREATE TABLE IF NOT EXISTS trades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration INT, -- in months
    requirements TEXT,
    level_1 BOOLEAN DEFAULT TRUE,
    level_2 BOOLEAN DEFAULT TRUE,
    level_3 BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for provinces (Rwanda)
INSERT IGNORE INTO provinces (id, name, code) VALUES
(1, 'Kigali City', 'KGL'),
(2, 'Eastern Province', 'EST'),
(3, 'Northern Province', 'NTH'),
(4, 'Southern Province', 'STH'),
(5, 'Western Province', 'WST');

-- Insert sample districts for Kigali
INSERT IGNORE INTO districts (id, province_id, name, code) VALUES
(1, 1, 'Gasabo', 'GSB'),
(2, 1, 'Kicukiro', 'KCK'),
(3, 1, 'Nyarugenge', 'NYR');

-- Insert sample sectors for Gasabo
INSERT IGNORE INTO sectors (id, district_id, name, code) VALUES
(1, 1, 'Kimironko', 'KMR'),
(2, 1, 'Remera', 'RMR'),
(3, 1, 'Kacyiru', 'KCY');

-- Insert sample trades
INSERT IGNORE INTO trades (code, name, description, duration, requirements, level_1, level_2, level_3, active) VALUES
('ICT001', 'Information Technology', 'Computer programming and systems administration', 24, 'Secondary education certificate', TRUE, TRUE, TRUE, TRUE),
('ELC001', 'Electrical Installation', 'Electrical wiring and maintenance', 18, 'Secondary education certificate', TRUE, TRUE, FALSE, TRUE),
('PLB001', 'Plumbing', 'Water and sewage systems installation', 12, 'Primary education certificate', TRUE, TRUE, FALSE, TRUE),
('WLD001', 'Welding', 'Metal joining and fabrication', 15, 'Primary education certificate', TRUE, TRUE, FALSE, TRUE),
('AUT001', 'Automotive Mechanics', 'Vehicle repair and maintenance', 24, 'Secondary education certificate', TRUE, TRUE, TRUE, TRUE),
('CST001', 'Construction', 'Building and construction techniques', 18, 'Primary education certificate', TRUE, TRUE, FALSE, TRUE),
('HSP001', 'Hospitality Management', 'Hotel and restaurant management', 24, 'Secondary education certificate', TRUE, TRUE, TRUE, TRUE),
('AGR001', 'Agriculture', 'Modern farming techniques', 12, 'Primary education certificate', TRUE, TRUE, FALSE, TRUE);

-- Create triggers for automatic analytics updates
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_analytics_on_insert
AFTER INSERT ON student_applications
FOR EACH ROW
BEGIN
    INSERT INTO application_analytics (date, total_applications, pending_applications)
    VALUES (CURDATE(), 1, IF(NEW.status = 'pending', 1, 0))
    ON DUPLICATE KEY UPDATE 
        total_applications = total_applications + 1,
        pending_applications = pending_applications + IF(NEW.status = 'pending', 1, 0);
END//

CREATE TRIGGER IF NOT EXISTS update_analytics_on_status_change
AFTER UPDATE ON student_applications
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        -- Decrease old status count
        UPDATE application_analytics 
        SET 
            pending_applications = pending_applications - IF(OLD.status = 'pending', 1, 0),
            under_review_applications = under_review_applications - IF(OLD.status = 'under_review', 1, 0),
            approved_applications = approved_applications - IF(OLD.status = 'approved', 1, 0),
            rejected_applications = rejected_applications - IF(OLD.status = 'rejected', 1, 0),
            waitlisted_applications = waitlisted_applications - IF(OLD.status = 'waitlisted', 1, 0),
            enrolled_applications = enrolled_applications - IF(OLD.status = 'enrolled', 1, 0)
        WHERE date = CURDATE();
        
        -- Increase new status count
        INSERT INTO application_analytics (date, pending_applications, under_review_applications, approved_applications, rejected_applications, waitlisted_applications, enrolled_applications)
        VALUES (CURDATE(), 
            IF(NEW.status = 'pending', 1, 0),
            IF(NEW.status = 'under_review', 1, 0),
            IF(NEW.status = 'approved', 1, 0),
            IF(NEW.status = 'rejected', 1, 0),
            IF(NEW.status = 'waitlisted', 1, 0),
            IF(NEW.status = 'enrolled', 1, 0)
        )
        ON DUPLICATE KEY UPDATE 
            pending_applications = pending_applications + IF(NEW.status = 'pending', 1, 0),
            under_review_applications = under_review_applications + IF(NEW.status = 'under_review', 1, 0),
            approved_applications = approved_applications + IF(NEW.status = 'approved', 1, 0),
            rejected_applications = rejected_applications + IF(NEW.status = 'rejected', 1, 0),
            waitlisted_applications = waitlisted_applications + IF(NEW.status = 'waitlisted', 1, 0),
            enrolled_applications = enrolled_applications + IF(NEW.status = 'enrolled', 1, 0);
    END IF;
END//

DELIMITER ;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetApplicationsByStatus(IN app_status VARCHAR(50))
BEGIN
    SELECT 
        sa.*,
        p.name as province_name,
        d.name as district_name,
        s.name as sector_name,
        t.name as trade_name,
        COUNT(ad.id) as document_count
    FROM student_applications sa
    LEFT JOIN provinces p ON sa.province_id = p.id
    LEFT JOIN districts d ON sa.district_id = d.id
    LEFT JOIN sectors s ON sa.sector_id = s.id
    LEFT JOIN trades t ON sa.trade_code = t.code
    LEFT JOIN application_documents ad ON sa.id = ad.application_id
    WHERE sa.status = app_status
    GROUP BY sa.id
    ORDER BY sa.created_at DESC;
END//

CREATE PROCEDURE IF NOT EXISTS GetApplicationAnalytics(IN days_back INT)
BEGIN
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM student_applications
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL days_back DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
END//

DELIMITER ;

-- Create views for common queries
CREATE OR REPLACE VIEW application_summary AS
SELECT 
    sa.id,
    sa.application_number,
    sa.first_name,
    sa.last_name,
    sa.phone,
    sa.status,
    sa.created_at,
    p.name as province_name,
    d.name as district_name,
    t.name as trade_name,
    sa.level_number,
    COUNT(ad.id) as document_count,
    DATEDIFF(NOW(), sa.created_at) as days_since_application
FROM student_applications sa
LEFT JOIN provinces p ON sa.province_id = p.id
LEFT JOIN districts d ON sa.district_id = d.id
LEFT JOIN trades t ON sa.trade_code = t.code
LEFT JOIN application_documents ad ON sa.id = ad.application_id
GROUP BY sa.id;

CREATE OR REPLACE VIEW pending_applications AS
SELECT * FROM application_summary WHERE status = 'pending';

CREATE OR REPLACE VIEW urgent_applications AS
SELECT * FROM application_summary 
WHERE status = 'pending' AND days_since_application > 7
ORDER BY days_since_application DESC;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_composite ON student_applications(status, trade_code, created_at);
CREATE INDEX IF NOT EXISTS idx_applications_location ON student_applications(province_id, district_id, sector_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON application_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON application_notifications(status, notification_type);
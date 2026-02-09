-- DOD and DOS Management Tables
-- Run this migration to create tables for Director of Studies and Director of Discipline management

-- Report Cards Table
CREATE TABLE IF NOT EXISTS report_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    trade_code VARCHAR(20) NOT NULL,
    level_number INT NOT NULL,
    level_suffix VARCHAR(5) DEFAULT NULL,
    term VARCHAR(20) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    total_score DECIMAL(10,2) DEFAULT 0,
    average_score DECIMAL(10,2) DEFAULT 0,
    gpa DECIMAL(4,2) DEFAULT 0,
    rank_position INT DEFAULT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    include_ranks TINYINT(1) DEFAULT 1,
    include_teacher_comments TINYINT(1) DEFAULT 1,
    include_dos_comments TINYINT(1) DEFAULT 1,
    include_attendance TINYINT(1) DEFAULT 1,
    teacher_comments TEXT DEFAULT NULL,
    dos_comments TEXT DEFAULT NULL,
    generated_by VARCHAR(100) DEFAULT 'System',
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_by VARCHAR(100) DEFAULT NULL,
    published_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_trade_code (trade_code),
    INDEX idx_term (term),
    INDEX idx_academic_year (academic_year),
    INDEX idx_status (status)
);

-- Report Card Marks Table
CREATE TABLE IF NOT EXISTS report_card_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_card_id VARCHAR(50) NOT NULL,
    student_id INT NOT NULL,
    course_id INT DEFAULT NULL,
    course_name VARCHAR(100) NOT NULL,
    quiz_score DECIMAL(5,2) DEFAULT NULL,
    midterm_score DECIMAL(5,2) DEFAULT NULL,
    final_score DECIMAL(5,2) DEFAULT NULL,
    total_score DECIMAL(5,2) DEFAULT 0,
    grade VARCHAR(5) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_card_id (report_card_id),
    INDEX idx_student_id (student_id)
);

-- Parent Connections Table
CREATE TABLE IF NOT EXISTS parent_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    parent_id INT NOT NULL,
    can_view_marks TINYINT(1) DEFAULT 1,
    can_view_attendance TINYINT(1) DEFAULT 1,
    can_view_discipline TINYINT(1) DEFAULT 1,
    can_view_report_cards TINYINT(1) DEFAULT 1,
    can_receive_sms TINYINT(1) DEFAULT 1,
    status ENUM('active', 'pending', 'revoked', 'expired') DEFAULT 'pending',
    access_granted_by VARCHAR(100) DEFAULT NULL,
    access_granted_at DATETIME DEFAULT NULL,
    access_expires_at DATETIME DEFAULT NULL,
    access_revoked_by VARCHAR(100) DEFAULT NULL,
    access_revoked_at DATETIME DEFAULT NULL,
    revocation_reason TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_parent (student_id, parent_id),
    INDEX idx_student_id (student_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status)
);

-- Discipline Incidents Table
CREATE TABLE IF NOT EXISTS discipline_incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    description TEXT NOT NULL,
    location VARCHAR(100) DEFAULT NULL,
    witnesses TEXT DEFAULT NULL,
    actions_taken TEXT DEFAULT NULL,
    incident_date DATE NOT NULL,
    reported_by INT DEFAULT NULL,
    status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
    resolution_notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_incident_type (incident_type),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_incident_date (incident_date)
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    supporting_document VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    decision_by INT DEFAULT NULL,
    decision_notes TEXT DEFAULT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    decided_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_leave_type (leave_type),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
);

-- Conduct Records Table
CREATE TABLE IF NOT EXISTS conduct_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    term VARCHAR(20) NOT NULL,
    conduct_grade VARCHAR(5) NOT NULL,
    teacher_remarks TEXT DEFAULT NULL,
    dos_remarks TEXT DEFAULT NULL,
    points INT DEFAULT 0,
    created_by VARCHAR(100) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_term (student_id, academic_year, term),
    INDEX idx_student_id (student_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

-- Counseling Sessions Table
CREATE TABLE IF NOT EXISTS counseling_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    counselor_id INT NOT NULL,
    session_type VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    location VARCHAR(100) DEFAULT NULL,
    topic VARCHAR(100) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    outcomes TEXT DEFAULT NULL,
    follow_up_required TINYINT(1) DEFAULT 0,
    follow_up_date DATE DEFAULT NULL,
    recommendations TEXT DEFAULT NULL,
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    created_by VARCHAR(100) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    scheduled_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_counselor_id (counselor_id),
    INDEX idx_session_date (session_date),
    INDEX idx_status (status)
);

-- SMS History Table
CREATE TABLE IF NOT EXISTS sms_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sms_id VARCHAR(50) UNIQUE NOT NULL,
    parent_id INT DEFAULT NULL,
    student_id INT DEFAULT NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    sent_at DATETIME DEFAULT NULL,
    delivered_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id),
    INDEX idx_student_id (student_id),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
);

-- Parent Notifications Table
CREATE TABLE IF NOT EXISTS parent_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    parent_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    send_sms TINYINT(1) DEFAULT 0,
    send_email TINYINT(1) DEFAULT 0,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_status (status)
);

-- Global Sheet Columns Table
CREATE TABLE IF NOT EXISTS global_sheet_columns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    column_type ENUM('text', 'number', 'date', 'boolean', 'select', 'actions') DEFAULT 'text',
    width INT DEFAULT 100,
    visible TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_by VARCHAR(100) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_display_order (display_order)
);

-- Insert default columns
INSERT INTO global_sheet_columns (role, column_name, display_name, column_type, width, display_order) VALUES
('all', 'admission_number', 'Admission #', 'text', 100, 1),
('all', 'first_name', 'First Name', 'text', 120, 2),
('all', 'last_name', 'Last Name', 'text', 120, 3),
('all', 'gender', 'Gender', 'select', 80, 4),
('all', 'trade_code', 'Trade', 'text', 100, 5),
('all', 'level_number', 'Level', 'number', 60, 6),
('all', 'phone', 'Phone', 'text', 120, 7),
('all', 'email', 'Email', 'text', 150, 8),
('all', 'is_active', 'Status', 'boolean', 80, 9),
('director_discipline', 'total_absences', 'Absences', 'number', 80, 10),
('director_discipline', 'pending_incidents', 'Pending Incidents', 'number', 120, 11),
('director_study', 'average_score', 'Average Score', 'number', 100, 10),
('director_study', 'gpa', 'GPA', 'number', 60, 11),
('headmaster', 'attendance_percentage', 'Attendance %', 'number', 80, 10);

-- Insert incident types
INSERT INTO discipline_incidents (incident_type, severity) VALUES
('Late Arrival', 'low'),
('Absence Without Notice', 'medium'),
('Uniform Violation', 'low'),
('Property Damage', 'medium'),
('Fighting', 'high'),
('Bullying', 'high'),
('Cheating', 'medium'),
('Disruptive Behavior', 'low'),
('Substance Abuse', 'critical'),
('Theft', 'high'),
('Harassment', 'high'),
('Weapon Possession', 'critical');

-- Insert leave types
INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason) VALUES
(1, 'Sick Leave', CURDATE(), CURDATE(), 'Initial entry');

-- Sample leave types reference (not a table, just documentation)
-- Types: Sick Leave, Family Emergency, Personal Leave, Religious Holiday, Other

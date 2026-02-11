-- ============================================
-- STUDENT TRAINING & PARENT SYSTEM MIGRATION
-- Complete Database Schema for Student Training, Parent Portal & Linking
-- ============================================

-- ============================================
-- STUDENT TRAINING MANAGEMENT TABLES
-- ============================================

-- Student Training Programs
CREATE TABLE IF NOT EXISTS student_training_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_code VARCHAR(50) UNIQUE NOT NULL,
    program_name VARCHAR(200) NOT NULL,
    description TEXT,
    trade_code VARCHAR(50),
    level_number INT DEFAULT 1,
    duration_weeks INT,
    start_date DATE,
    end_date DATE,
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_program_code (program_code),
    INDEX idx_trade (trade_code),
    INDEX idx_status (status)
);

-- Training Modules
CREATE TABLE IF NOT EXISTS training_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    module_code VARCHAR(50) UNIQUE NOT NULL,
    module_name VARCHAR(200) NOT NULL,
    description TEXT,
    sequence_order INT DEFAULT 1,
    duration_hours DECIMAL(5,2),
    passing_score DECIMAL(5,2) DEFAULT 60.00,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES student_training_programs(id) ON DELETE CASCADE,
    INDEX idx_program (program_id),
    INDEX idx_sequence (sequence_order)
);

-- Training Sessions
CREATE TABLE IF NOT EXISTS training_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    session_code VARCHAR(50) UNIQUE NOT NULL,
    session_title VARCHAR(200) NOT NULL,
    description TEXT,
    session_type ENUM('theory', 'practical', 'assessment', 'field_work', 'workshop') DEFAULT 'theory',
    scheduled_date DATE,
    scheduled_time TIME,
    duration_minutes INT DEFAULT 60,
    instructor_id INT,
    location VARCHAR(200),
    max_participants INT,
    materials TEXT,
    learning_objectives TEXT,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    INDEX idx_module (module_id),
    INDEX idx_date (scheduled_date),
    INDEX idx_status (status)
);

-- Student Training Enrollments
CREATE TABLE IF NOT EXISTS student_training_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    program_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    expected_completion_date DATE,
    actual_completion_date DATE,
    status ENUM('enrolled', 'in_progress', 'completed', 'dropped', 'suspended') DEFAULT 'enrolled',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    overall_grade DECIMAL(5,2),
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_number VARCHAR(50),
    enrolled_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES student_training_programs(id),
    INDEX idx_student (student_id),
    INDEX idx_program (program_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_enrollment (student_id, program_id)
);

-- Student Module Progress
CREATE TABLE IF NOT EXISTS student_module_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    module_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    start_date DATE,
    completion_date DATE,
    score DECIMAL(5,2),
    grade VARCHAR(10),
    attempts INT DEFAULT 1,
    max_attempts INT DEFAULT 3,
    time_spent_minutes INT DEFAULT 0,
    instructor_notes TEXT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES student_training_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_module (module_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_enrollment_module (enrollment_id, module_id)
);

-- Student Session Attendance
CREATE TABLE IF NOT EXISTS student_session_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    session_id INT NOT NULL,
    attendance_status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'absent',
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    duration_attended INT DEFAULT 0,
    instructor_feedback TEXT,
    student_comments TEXT,
    marked_by INT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES student_training_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_session (session_id),
    INDEX idx_date (attendance_status),
    UNIQUE KEY unique_enrollment_session (enrollment_id, session_id)
);

-- Training Assessments
CREATE TABLE IF NOT EXISTS training_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    assessment_code VARCHAR(50) UNIQUE NOT NULL,
    assessment_type ENUM('quiz', 'test', 'practical', 'project', 'presentation', 'final') DEFAULT 'quiz',
    title VARCHAR(200) NOT NULL,
    description TEXT,
    total_marks DECIMAL(6,2) DEFAULT 100,
    passing_marks DECIMAL(6,2),
    duration_minutes INT DEFAULT 60,
    max_attempts INT DEFAULT 1,
    weight_percentage DECIMAL(5,2) DEFAULT 100,
    due_date DATETIME,
    instructions TEXT,
    status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    INDEX idx_module (module_id),
    INDEX idx_status (status)
);

-- Assessment Results
CREATE TABLE IF NOT EXISTS assessment_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    attempt_number INT DEFAULT 1,
    score DECIMAL(6,2),
    percentage DECIMAL(5,2),
    grade VARCHAR(10),
    passed BOOLEAN DEFAULT FALSE,
    time_spent_minutes INT DEFAULT 0,
    answers JSON,
    feedback TEXT,
    graded_by INT,
    graded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES training_assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES student_training_enrollments(id) ON DELETE CASCADE,
    INDEX idx_assessment (assessment_id),
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_attempt (attempt_number)
);

-- Training Resources/Materials
CREATE TABLE IF NOT EXISTS training_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    resource_type ENUM('document', 'video', 'link', 'presentation', 'spreadsheet', 'image') DEFAULT 'document',
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    external_url VARCHAR(500),
    file_size INT,
    duration_minutes INT,
    is_required BOOLEAN DEFAULT FALSE,
    sequence_order INT DEFAULT 1,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    INDEX idx_module (module_id),
    INDEX idx_type (resource_type)
);

-- ============================================
-- ENHANCED PARENT TABLE
-- ============================================

-- Enhanced Parent Profiles
CREATE TABLE IF NOT EXISTS parent_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    parent_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    id_number VARCHAR(50),
    id_type ENUM('national_id', 'passport', 'drivers_license', 'other') DEFAULT 'national_id',
    occupation VARCHAR(100),
    employer VARCHAR(200),
    workplace_phone VARCHAR(20),
    workplace_address TEXT,
    home_address TEXT,
    district VARCHAR(100),
    sector VARCHAR(100),
    relationship_to_student ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'father',
    is_primary_contact BOOLEAN DEFAULT TRUE,
    can_receive_sms BOOLEAN DEFAULT TRUE,
    can_receive_email BOOLEAN DEFAULT TRUE,
    can_receive_whatsapp BOOLEAN DEFAULT FALSE,
    preferred_language ENUM('en', 'rw', 'fr') DEFAULT 'en',
    communication_preference ENUM('sms', 'email', 'whatsapp', 'phone') DEFAULT 'sms',
    account_status ENUM('active', 'inactive', 'suspended', 'pending_verification') DEFAULT 'active',
    verified_at TIMESTAMP NULL,
    verified_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_parent_id (parent_id),
    INDEX idx_phone (phone),
    INDEX idx_user (user_id)
);

-- ============================================
-- STUDENT-PARENT LINKING TABLES
-- ============================================

-- Student-Parent Links (Official Relationships)
CREATE TABLE IF NOT EXISTS student_parent_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50) NOT NULL,
    relationship_type ENUM('father', 'mother', 'guardian', 'other') NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    emergency_priority INT DEFAULT 1,
    can_view_grades BOOLEAN DEFAULT TRUE,
    can_view_attendance BOOLEAN DEFAULT TRUE,
    can_view_discipline BOOLEAN DEFAULT TRUE,
    can_view_fees BOOLEAN DEFAULT TRUE,
    can_receive_notifications BOOLEAN DEFAULT TRUE,
    can_receive_sms BOOLEAN DEFAULT TRUE,
    can_receive_email BOOLEAN DEFAULT TRUE,
    can_receive_whatsapp BOOLEAN DEFAULT FALSE,
    link_status ENUM('active', 'inactive', 'pending', 'revoked') DEFAULT 'pending',
    linked_by INT,
    linked_by_role VARCHAR(50),
    approved_by INT,
    approved_at TIMESTAMP NULL,
    revocation_reason TEXT,
    revoked_by INT,
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parent_profiles(parent_id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_parent (parent_id),
    INDEX idx_status (link_status),
    UNIQUE KEY unique_link (student_id, parent_id, relationship_type)
);

-- Parent Verification Requests
CREATE TABLE IF NOT EXISTS parent_verification_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(50),
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(150),
    parent_name VARCHAR(200) NOT NULL,
    student_id VARCHAR(50),
    student_name VARCHAR(200),
    student_trade VARCHAR(50),
    student_level INT,
    student_code VARCHAR(50),
    relationship_type ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
    verification_code VARCHAR(10),
    verification_status ENUM('pending', 'verified', 'expired', 'cancelled') DEFAULT 'pending',
    request_status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    request_message TEXT,
    admin_notes TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (parent_phone),
    INDEX idx_student (student_id),
    INDEX idx_verification_code (verification_code),
    INDEX idx_status (request_status)
);

-- ============================================
-- PARENT NOTIFICATION PREFERENCES
-- ============================================

-- Parent Notification Settings
CREATE TABLE IF NOT EXISTS parent_notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(50) NOT NULL,
    notify_on_grades BOOLEAN DEFAULT TRUE,
    notify_on_attendance BOOLEAN DEFAULT TRUE,
    notify_on_discipline BOOLEAN DEFAULT TRUE,
    notify_on_fees BOOLEAN DEFAULT TRUE,
    notify_on_events BOOLEAN DEFAULT TRUE,
    notify_on_announcements BOOLEAN DEFAULT TRUE,
    notify_on_assignments BOOLEAN DEFAULT TRUE,
    notify_on_exams BOOLEAN DEFAULT TRUE,
    notify_on_achievements BOOLEAN DEFAULT TRUE,
    notify_on_absences BOOLEAN DEFAULT TRUE,
    notify_on_late_arrivals BOOLEAN DEFAULT TRUE,
    notify_on_low_grades BOOLEAN DEFAULT TRUE,
    grade_threshold DECIMAL(5,2) DEFAULT 60.00,
    sms_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '06:00:00',
    language_preference ENUM('en', 'rw', 'fr') DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parent_profiles(parent_id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_settings (parent_id)
);

-- ============================================
-- PARENT ACTIVITY LOG
-- ============================================

-- Parent Activity Log
CREATE TABLE IF NOT EXISTS parent_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50),
    activity_type ENUM('login', 'view_grades', 'view_attendance', 'view_discipline', 
                      'view_fees', 'download_report', 'contact_teacher', 'submit_payment',
                      'update_settings', 'view_schedule', 'view_assignments', 'view_achievements') NOT NULL,
    activity_details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_duration INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parent_profiles(parent_id) ON DELETE CASCADE,
    INDEX idx_parent (parent_id),
    INDEX idx_student (student_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created (created_at)
);

-- ============================================
-- PARENT MESSAGES & COMMUNICATION
-- ============================================

-- Parent Messages
CREATE TABLE IF NOT EXISTS parent_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(50) UNIQUE NOT NULL,
    parent_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50),
    recipient_type ENUM('teacher', 'admin', 'dod', 'matron', 'accountant', 'all') NOT NULL,
    recipient_id INT,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    message_type ENUM('inquiry', 'feedback', 'complaint', 'request', 'suggestion', 'emergency') DEFAULT 'inquiry',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('sent', 'read', 'replied', 'archived') DEFAULT 'sent',
    sent_via ENUM('sms', 'email', 'whatsapp', 'portal', 'all') DEFAULT 'portal',
    attachments JSON,
    reply_to_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parent_profiles(parent_id) ON DELETE CASCADE,
    INDEX idx_parent (parent_id),
    INDEX idx_recipient (recipient_type, recipient_id),
    INDEX idx_status (status)
);

-- ============================================
-- SAMPLE DATA - TRAINING PROGRAMS
-- ============================================

INSERT INTO student_training_programs (program_code, program_name, description, trade_code, level_number, duration_weeks, status) VALUES
('TRN-CARP-001', 'Carpentry Fundamentals', 'Core carpentry skills and safety training', 'carpentry', 1, 12, 'active'),
('TRN-ELEC-001', 'Electrical Installation Basics', 'Basic electrical installation and wiring', 'electricity', 1, 16, 'active'),
('TRN-MASON-001', 'Masonry and Concrete Work', 'Foundation masonry and concrete techniques', 'masonry', 1, 14, 'active'),
('TRN-PLUMB-001', 'Plumbing Systems', 'Residential and commercial plumbing', 'plumbing', 1, 12, 'active'),
('TRN-WELD-001', 'Welding Technology', 'Arc welding and metal fabrication', 'welding', 1, 18, 'active');

INSERT INTO training_modules (program_id, module_code, module_name, description, sequence_order, duration_hours) VALUES
(1, 'CARP-MOD-001', 'Safety and Tools', 'Workshop safety and hand tools', 1, 20),
(1, 'CARP-MOD-002', 'Wood Selection', 'Wood types and selection', 2, 15),
(1, 'CARP-MOD-003', 'Basic Joinery', 'Basic joinery techniques', 3, 25),
(1, 'CARP-MOD-004', 'Finishing', 'Surface preparation and finishing', 4, 15),
(2, 'ELEC-MOD-001', 'Electrical Safety', 'Electrical safety protocols', 1, 12),
(2, 'ELEC-MOD-002', 'Circuit Basics', 'Electrical circuit fundamentals', 2, 20),
(2, 'ELEC-MOD-003', 'Wiring Techniques', 'Residential wiring', 3, 30),
(2, 'ELEC-MOD-004', 'Testing and Maintenance', 'Circuit testing and maintenance', 4, 18);

INSERT INTO training_sessions (module_id, session_code, session_title, session_type, scheduled_date, duration_minutes, location, status) VALUES
(1, 'CARP-SES-001', 'Workshop Safety Introduction', 'theory', CURDATE() + INTERVAL 1 DAY, 120, 'Workshop A', 'scheduled'),
(1, 'CARP-SES-002', 'Hand Tools Practice', 'practical', CURDATE() + INTERVAL 2 DAY, 180, 'Workshop A', 'scheduled'),
(2, 'CARP-SES-003', 'Wood Types Identification', 'theory', CURDATE() + INTERVAL 4 DAY, 90, 'Classroom 1', 'scheduled'),
(3, 'CARP-SES-004', 'Joint Making Workshop', 'practical', CURDATE() + INTERVAL 5 DAY, 240, 'Workshop A', 'scheduled');

-- ============================================
-- PROCEDURES
-- ============================================

DELIMITER //

-- Get student training progress
CREATE PROCEDURE GetStudentTrainingProgress(IN p_student_id VARCHAR(50))
BEGIN
    SELECT 
        ste.id as enrollment_id,
        ste.student_id,
        stp.program_name,
        stp.program_code,
        stp.duration_weeks,
        ste.enrollment_date,
        ste.expected_completion_date,
        ste.actual_completion_date,
        ste.status,
        ste.progress_percentage,
        ste.overall_grade,
        ste.certificate_issued,
        COUNT(DISTINCT tmp.id) as total_modules,
        SUM(CASE WHEN tmp.status = 'completed' THEN 1 ELSE 0 END) as completed_modules,
        AVG(tmp.score) as average_score
    FROM student_training_enrollments ste
    JOIN student_training_programs stp ON ste.program_id = stp.id
    LEFT JOIN student_module_progress tmp ON ste.id = tmp.enrollment_id
    WHERE ste.student_id = p_student_id
    GROUP BY ste.id, stp.program_name, stp.program_code, ste.enrollment_date, 
             ste.expected_completion_date, ste.actual_completion_date, ste.status,
             ste.progress_percentage, ste.overall_grade, ste.certificate_issued;
END //

-- Get student linked parents
CREATE PROCEDURE GetStudentLinkedParents(IN p_student_id VARCHAR(50))
BEGIN
    SELECT 
        spl.id as link_id,
        spl.student_id,
        spl.parent_id,
        spl.relationship_type,
        spl.is_primary,
        spl.is_emergency_contact,
        spl.emergency_priority,
        spl.link_status,
        spl.can_view_grants,
        spl.can_view_attendance,
        spl.can_view_discipline,
        spl.can_view_fees,
        spl.can_receive_notifications,
        pp.first_name,
        pp.last_name,
        pp.phone,
        pp.email,
        pp.whatsapp_number,
        pp.relationship_to_student,
        pp.preferred_language,
        spl.approved_at,
        spl.created_at
    FROM student_parent_links spl
    JOIN parent_profiles pp ON spl.parent_id = pp.parent_id
    WHERE spl.student_id = p_student_id AND spl.link_status = 'active'
    ORDER BY spl.is_primary DESC, spl.emergency_priority ASC;
END //

-- Get parent dashboard data
CREATE PROCEDURE GetParentDashboard(IN p_parent_id VARCHAR(50))
BEGIN
    SELECT 
        pp.parent_id,
        pp.first_name,
        pp.last_name,
        pp.phone,
        pp.email,
        pp.preferred_language,
        COUNT(DISTINCT spl.student_id) as total_children,
        SUM(CASE WHEN spl.is_primary = 1 THEN 1 ELSE 0 END) as primary_connections
    FROM parent_profiles pp
    LEFT JOIN student_parent_links spl ON pp.parent_id = spl.parent_id AND spl.link_status = 'active'
    WHERE pp.parent_id = p_parent_id
    GROUP BY pp.parent_id, pp.first_name, pp.last_name, pp.phone, pp.email, pp.preferred_language;
END //

DELIMITER ;

-- ============================================
-- VIEWS
-- ============================================

-- Student Training Progress View
CREATE VIEW v_student_training_progress AS
SELECT 
    ste.student_id,
    gs.first_name,
    gs.last_name,
    gs.trade_code,
    gs.level_number,
    stp.program_code,
    stp.program_name,
    ste.enrollment_date,
    ste.status,
    ste.progress_percentage,
    ste.overall_grade,
    COUNT(DISTINCT tm.id) as total_modules,
    COUNT(DISTINCT CASE WHEN tmp.status = 'completed' THEN tm.id END) as completed_modules,
    AVG(tmp.score) as avg_module_score
FROM student_training_enrollments ste
JOIN global_student_sheets gs ON ste.student_id = gs.student_id
JOIN student_training_programs stp ON ste.program_id = stp.id
LEFT JOIN training_modules tm ON stp.id = tm.program_id
LEFT JOIN student_module_progress tmp ON ste.id = tmp.enrollment_id AND tm.id = tmp.module_id
GROUP BY ste.student_id, gs.first_name, gs.last_name, gs.trade_code, gs.level_number,
         stp.program_code, stp.program_name, ste.enrollment_date, ste.status,
         ste.progress_percentage, ste.overall_grade;

-- Parent Links View
CREATE VIEW v_student_parent_connections AS
SELECT 
    gs.student_id,
    gs.first_name,
    gs.last_name,
    gs.trade_code,
    gs.level_number,
    gs.class_name,
    pp.parent_id,
    pp.first_name as parent_first_name,
    pp.last_name as parent_last_name,
    pp.phone as parent_phone,
    pp.email as parent_email,
    spl.relationship_type,
    spl.is_primary,
    spl.is_emergency_contact,
    spl.link_status,
    spl.can_view_grades,
    spl.can_view_attendance,
    spl.can_view_discipline,
    spl.can_view_fees,
    spl.approved_at
FROM global_student_sheets gs
JOIN student_parent_links spl ON gs.student_id = spl.student_id
JOIN parent_profiles pp ON spl.parent_id = pp.parent_id
WHERE spl.link_status = 'active';

-- Parent Children Overview View
CREATE VIEW v_parent_children_overview AS
SELECT 
    pp.parent_id,
    pp.first_name as parent_first_name,
    pp.last_name as parent_last_name,
    pp.phone,
    pp.email,
    gs.student_id,
    gs.first_name as student_first_name,
    gs.last_name as student_last_name,
    gs.trade_code,
    gs.level_number,
    gs.gpa,
    gs.attendance_percentage,
    gs.conduct_score,
    spl.relationship_type,
    spl.is_primary
FROM parent_profiles pp
JOIN student_parent_links spl ON pp.parent_id = spl.parent_id
JOIN global_student_sheets gs ON spl.student_id = gs.student_id
WHERE spl.link_status = 'active';

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Update enrollment progress on module completion
CREATE TRIGGER update_enrollment_progress AFTER UPDATE ON student_module_progress
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE student_training_enrollments ste
        SET progress_percentage = (
            SELECT (COUNT(*) * 100.0 / 
                   (SELECT COUNT(*) FROM training_modules WHERE program_id = (
                       SELECT program_id FROM student_module_progress WHERE id = NEW.enrollment_id
                   )))
            FROM student_module_progress 
            WHERE enrollment_id = NEW.enrollment_id AND status = 'completed'
        ),
        updated_at = NOW()
        WHERE id = NEW.enrollment_id;
    END IF;
END //

-- Log parent activity
CREATE TRIGGER log_parent_activity AFTER INSERT ON parent_activity_log
FOR EACH ROW
BEGIN
    -- This trigger is for automatic logging if needed
    NULL;
END //

DELIMITER ;

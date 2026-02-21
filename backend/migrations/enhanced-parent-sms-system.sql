-- Enhanced Parent SMS System Database Migration
-- Run this to set up all required tables for the enhanced functionality

-- Create SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT NULL,
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
);

-- Create parent notifications table
CREATE TABLE IF NOT EXISTS parent_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('general', 'academic', 'discipline', 'finance', 'events', 'conduct', 'leave') DEFAULT 'general',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    sender_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_message_type (message_type),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
);

-- Enhance parents table with additional fields
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS preferred_language ENUM('en', 'rw') DEFAULT 'rw';

-- Enhance parent_student_links table
ALTER TABLE parent_student_links
ADD COLUMN IF NOT EXISTS approved_by INT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('general', 'academic', 'discipline', 'finance', 'events') DEFAULT 'general',
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- Insert default message templates
INSERT IGNORE INTO message_templates (title, content, category, created_by) VALUES
('Conduct Warning', 'Umwana wanyu yakiriye ikimenyetso ku myitwarire. Turasaba ko mwongera kumufasha.', 'discipline', 1),
('Academic Progress', 'Umwana wanyu agenda neza mu masomo. Turamushimira cyane!', 'academic', 1),
('Fee Reminder', 'Turakwibuka ko hari amafaranga asigaye. Murakoze kubifata nk\'ibanze.', 'finance', 1),
('Parent Meeting', 'Hari inama y\'ababyeyi itariki... Turasaba ko muza.', 'events', 1),
('Holiday Notice', 'Ishuri rizafunga kuva... kugeza... Abana bazagaruka...', 'general', 1),
('Excellent Performance', 'Umwana wanyu akora cyane mu masomo. Turamushimira!', 'academic', 1),
('Attendance Issue', 'Umwana wanyu ntiyaje ishuri iminsi mike. Turasaba gusubira.', 'discipline', 1),
('Medical Attention', 'Umwana wanyu asaba ubuvuzi. Turasaba ko muza kumufata.', 'general', 1);

-- Create conduct records table with enhanced SMS tracking
CREATE TABLE IF NOT EXISTS student_conduct_records_enhanced (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    incident_type VARCHAR(255) NOT NULL,
    severity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
    description TEXT NOT NULL,
    action_taken TEXT NULL,
    conduct_points_deducted INT DEFAULT 0,
    new_conduct_score INT DEFAULT 40,
    removed_by INT NOT NULL,
    incident_date DATE NOT NULL,
    parents_notified BOOLEAN DEFAULT FALSE,
    sms_sent_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    FOREIGN KEY (removed_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_incident_date (incident_date),
    INDEX idx_severity (severity)
);

-- Create leave requests table with enhanced SMS tracking
CREATE TABLE IF NOT EXISTS student_leave_requests_enhanced (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    leave_type ENUM('sick', 'family', 'emergency', 'personal', 'medical') DEFAULT 'sick',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    parents_notified BOOLEAN DEFAULT FALSE,
    sms_sent_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
);

-- Create SMS statistics table
CREATE TABLE IF NOT EXISTS sms_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    total_sent INT DEFAULT 0,
    total_failed INT DEFAULT 0,
    conduct_sms INT DEFAULT 0,
    leave_sms INT DEFAULT 0,
    general_sms INT DEFAULT 0,
    welcome_sms INT DEFAULT 0,
    linking_sms INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date),
    INDEX idx_date (date)
);

-- Insert today's statistics if not exists
INSERT IGNORE INTO sms_statistics (date, total_sent, total_failed, conduct_sms, leave_sms, general_sms, welcome_sms, linking_sms)
VALUES (CURDATE(), 0, 0, 0, 0, 0, 0, 0);

-- Create parent preferences table
CREATE TABLE IF NOT EXISTS parent_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    sms_conduct_alerts BOOLEAN DEFAULT TRUE,
    sms_leave_updates BOOLEAN DEFAULT TRUE,
    sms_academic_updates BOOLEAN DEFAULT TRUE,
    sms_fee_reminders BOOLEAN DEFAULT TRUE,
    sms_general_announcements BOOLEAN DEFAULT TRUE,
    preferred_contact_time ENUM('morning', 'afternoon', 'evening', 'anytime') DEFAULT 'anytime',
    language_preference ENUM('en', 'rw', 'both') DEFAULT 'rw',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent (parent_id)
);

-- Create triggers for automatic SMS logging

DELIMITER //

-- Trigger for conduct removal SMS
CREATE TRIGGER IF NOT EXISTS after_conduct_insert 
AFTER INSERT ON student_conduct_records_enhanced
FOR EACH ROW
BEGIN
    -- Update SMS statistics
    INSERT INTO sms_statistics (date, conduct_sms) 
    VALUES (CURDATE(), 1)
    ON DUPLICATE KEY UPDATE conduct_sms = conduct_sms + 1;
END//

-- Trigger for leave approval SMS
CREATE TRIGGER IF NOT EXISTS after_leave_update
AFTER UPDATE ON student_leave_requests_enhanced
FOR EACH ROW
BEGIN
    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
        -- Update SMS statistics
        INSERT INTO sms_statistics (date, leave_sms) 
        VALUES (CURDATE(), 1)
        ON DUPLICATE KEY UPDATE leave_sms = leave_sms + 1;
    END IF;
END//

-- Trigger for parent registration SMS
CREATE TRIGGER IF NOT EXISTS after_parent_insert
AFTER INSERT ON parents
FOR EACH ROW
BEGIN
    -- Update SMS statistics
    INSERT INTO sms_statistics (date, welcome_sms) 
    VALUES (CURDATE(), 1)
    ON DUPLICATE KEY UPDATE welcome_sms = welcome_sms + 1;
    
    -- Insert default preferences
    INSERT INTO parent_preferences (parent_id) VALUES (NEW.id);
END//

-- Trigger for parent linking SMS
CREATE TRIGGER IF NOT EXISTS after_parent_link_approved
AFTER UPDATE ON parent_student_links
FOR EACH ROW
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
        -- Update SMS statistics
        INSERT INTO sms_statistics (date, linking_sms) 
        VALUES (CURDATE(), 1)
        ON DUPLICATE KEY UPDATE linking_sms = linking_sms + 1;
    END IF;
END//

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone);
CREATE INDEX IF NOT EXISTS idx_parents_created_at ON parents(created_at);
CREATE INDEX IF NOT EXISTS idx_parent_links_status ON parent_student_links(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone_date ON sms_logs(phone, sent_at);

-- Update existing conduct scores to 40-point system if needed
UPDATE global_student_sheets SET conduct_score = 40 WHERE conduct_score IS NULL OR conduct_score > 40;

-- Add sample data for testing (optional)
-- INSERT IGNORE INTO parents (first_name, last_name, phone, password) VALUES
-- ('Test', 'Parent1', '0788123456', '$2a$10$example_hash'),
-- ('Test', 'Parent2', '0788123457', '$2a$10$example_hash');

COMMIT;
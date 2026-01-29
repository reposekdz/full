-- SMS Queue Table for Parent Notifications
CREATE TABLE IF NOT EXISTS sms_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_phone (phone_number),
    INDEX idx_created (created_at)
);

-- SMS Messages Table (for advanced SMS service)
CREATE TABLE IF NOT EXISTS sms_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipient VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    sender_id INT,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    provider VARCHAR(50),
    metadata JSON,
    response TEXT,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recipient (recipient),
    INDEX idx_sender (sender_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- SMS Templates Table
CREATE TABLE IF NOT EXISTS sms_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    template_category VARCHAR(50),
    message_template TEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SMS Role Permissions Table
CREATE TABLE IF NOT EXISTS sms_role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role VARCHAR(50) NOT NULL UNIQUE,
    can_send_single BOOLEAN DEFAULT TRUE,
    can_send_bulk BOOLEAN DEFAULT FALSE,
    can_send_class BOOLEAN DEFAULT TRUE,
    can_send_all BOOLEAN DEFAULT FALSE,
    can_view_history BOOLEAN DEFAULT TRUE,
    can_view_stats BOOLEAN DEFAULT FALSE,
    can_create_templates BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default permissions
INSERT IGNORE INTO sms_role_permissions (role, can_send_single, can_send_bulk, can_send_class, can_send_all, can_view_history, can_view_stats, can_create_templates) VALUES
('admin', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('director', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('dos', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE),
('dod', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE),
('patron', TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE),
('matron', TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE),
('teacher', TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE),
('class_teacher', TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE),
('accountant', TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, FALSE),
('secretary', TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE);

-- Add SMS notification tracking to discipline records
ALTER TABLE discipline_records 
ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP NULL;

-- Add SMS notification tracking to student leaves
ALTER TABLE student_leaves 
ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP NULL;

-- Add parent contact preferences
ALTER TABLE users
ADD COLUMN IF NOT EXISTS has_smartphone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_contact_method ENUM('app', 'sms', 'whatsapp', 'dual') DEFAULT 'dual';

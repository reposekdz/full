-- Comprehensive Parent Portal Schema Expansion
-- Ensures all tables for advanced features exist and are consistent

-- 1. Parent Profiles (already mostly exists, but ensuring columns)
CREATE TABLE IF NOT EXISTS parent_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    parent_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    id_number VARCHAR(50),
    id_type ENUM('national_id', 'passport', 'other') DEFAULT 'national_id',
    occupation VARCHAR(100),
    employer VARCHAR(100),
    relationship_to_student VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'en',
    communication_preference ENUM('sms', 'email', 'whatsapp') DEFAULT 'sms',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Student-Parent Links
CREATE TABLE IF NOT EXISTS student_parent_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    relationship_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    can_view_grades BOOLEAN DEFAULT true,
    can_view_attendance BOOLEAN DEFAULT true,
    can_view_discipline BOOLEAN DEFAULT true,
    can_view_fees BOOLEAN DEFAULT true,
    link_status ENUM('active', 'pending', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Parent Notifications
CREATE TABLE IF NOT EXISTS parent_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- attendance, grade, payment, generic
    priority ENUM('low', 'normal', 'high', 'emergency') DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Parent Activity Log (Unified)
CREATE TABLE IF NOT EXISTS parent_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50),
    activity_type VARCHAR(50) NOT NULL, -- login, view_grades, submit_payment, etc.
    activity_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Notification Settings
CREATE TABLE IF NOT EXISTS parent_notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(50) UNIQUE NOT NULL,
    notify_on_grades BOOLEAN DEFAULT true,
    notify_on_attendance BOOLEAN DEFAULT true,
    notify_on_discipline BOOLEAN DEFAULT true,
    notify_on_fees BOOLEAN DEFAULT true,
    notify_on_events BOOLEAN DEFAULT true,
    notify_on_announcements BOOLEAN DEFAULT true,
    notify_on_assignments BOOLEAN DEFAULT true,
    notify_on_exams BOOLEAN DEFAULT true,
    notify_on_achievements BOOLEAN DEFAULT true,
    notify_on_absences BOOLEAN DEFAULT true,
    notify_on_late_arrivals BOOLEAN DEFAULT true,
    notify_on_low_grades BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    whatsapp_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Payment Proofs
CREATE TABLE IF NOT EXISTS payment_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50) NOT NULL,
    parent_name VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    payment_date DATE,
    notes TEXT,
    proof_image TEXT,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    verified_by INT NULL
);

-- 7. Parent-Student Link Activity (For tracking link requests/audits)
CREATE TABLE IF NOT EXISTS parent_student_link_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    link_id INT,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

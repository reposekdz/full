-- DOD Parent Linking Advanced System - Complete Schema
-- Automatic parent linking for Level 4 SOD students with comprehensive parent management

-- Enhanced parent_student_links table with auto-linking support
CREATE TABLE IF NOT EXISTS `parent_student_links` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `relationship_type` ENUM('father', 'mother', 'guardian', 'sibling', 'relative', 'other') DEFAULT 'guardian',
  `is_primary_contact` BOOLEAN DEFAULT FALSE,
  `can_view_marks` BOOLEAN DEFAULT TRUE,
  `can_view_attendance` BOOLEAN DEFAULT TRUE,
  `can_view_discipline` BOOLEAN DEFAULT TRUE,
  `can_view_fees` BOOLEAN DEFAULT TRUE,
  `can_receive_sms` BOOLEAN DEFAULT TRUE,
  `can_receive_calls` BOOLEAN DEFAULT TRUE,
  `status` ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'active',
  `linked_by` VARCHAR(255),
  `linked_by_role` VARCHAR(50),
  `linked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `auto_linked` BOOLEAN DEFAULT FALSE COMMENT 'True if automatically linked by system',
  `verified` BOOLEAN DEFAULT FALSE,
  `verified_at` TIMESTAMP NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_parent_student` (`parent_id`, `student_id`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_auto_linked` (`auto_linked`),
  INDEX `idx_is_primary` (`is_primary_contact`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parents information table (extended from users table)
CREATE TABLE IF NOT EXISTS `parents_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `national_id` VARCHAR(50),
  `occupation` VARCHAR(255),
  `workplace` VARCHAR(255),
  `address` TEXT,
  `province` VARCHAR(100),
  `district` VARCHAR(100),
  `sector` VARCHAR(100),
  `cell` VARCHAR(100),
  `village` VARCHAR(100),
  `emergency_contact` VARCHAR(20),
  `alternative_phone` VARCHAR(20),
  `whatsapp_number` VARCHAR(20),
  `preferred_contact_method` ENUM('sms', 'whatsapp', 'call', 'email') DEFAULT 'sms',
  `preferred_language` ENUM('kinyarwanda', 'english', 'french') DEFAULT 'kinyarwanda',
  `total_children` INT DEFAULT 0,
  `children_in_school` INT DEFAULT 0,
  `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_contact_date` TIMESTAMP NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `verification_method` VARCHAR(50),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_national_id` (`national_id`),
  INDEX `idx_is_verified` (`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Level 4 SOD students with linked parent column
CREATE TABLE IF NOT EXISTS `level4_sod_students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL UNIQUE,
  `student_code` VARCHAR(50) NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `gender` ENUM('Male', 'Female') NOT NULL,
  `phone` VARCHAR(20),
  `email` VARCHAR(255),
  `trade_code` VARCHAR(10) DEFAULT 'SOD',
  `trade_name` VARCHAR(100) DEFAULT 'Software Development',
  `level_number` INT DEFAULT 4,
  `conduct_score` INT DEFAULT 40,
  `attendance_percentage` DECIMAL(5,2) DEFAULT 100.00,
  `average_grade` DECIMAL(5,2) DEFAULT 0.00,
  `linked_parent_id` INT NULL COMMENT 'Primary linked parent',
  `linked_parent_name` VARCHAR(255),
  `linked_parent_phone` VARCHAR(20),
  `linked_parent_relationship` VARCHAR(50),
  `auto_linked_at` TIMESTAMP NULL,
  `total_linked_parents` INT DEFAULT 0,
  `status` ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
  `enrollment_date` DATE,
  `expected_graduation` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_student_code` (`student_code`),
  INDEX `idx_linked_parent_id` (`linked_parent_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_trade_level` (`trade_code`, `level_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent contact history
CREATE TABLE IF NOT EXISTS `parent_contact_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `contact_type` ENUM('sms', 'whatsapp', 'call', 'email', 'meeting', 'other') NOT NULL,
  `subject` VARCHAR(255),
  `message` TEXT,
  `category` ENUM('conduct', 'leave', 'academic', 'fees', 'general', 'emergency') NOT NULL,
  `initiated_by` INT,
  `initiated_by_name` VARCHAR(255),
  `initiated_by_role` VARCHAR(50),
  `delivery_status` ENUM('pending', 'sent', 'delivered', 'failed', 'read') DEFAULT 'pending',
  `response_received` BOOLEAN DEFAULT FALSE,
  `response_text` TEXT,
  `response_date` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_contact_type` (`contact_type`),
  INDEX `idx_category` (`category`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent linking requests (for manual approval)
CREATE TABLE IF NOT EXISTS `parent_linking_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_code` VARCHAR(50) UNIQUE,
  `parent_id` INT,
  `parent_name` VARCHAR(255) NOT NULL,
  `parent_phone` VARCHAR(20) NOT NULL,
  `parent_email` VARCHAR(255),
  `student_id` INT,
  `student_code` VARCHAR(50),
  `student_first_name` VARCHAR(100) NOT NULL,
  `student_last_name` VARCHAR(100) NOT NULL,
  `student_trade` VARCHAR(100),
  `student_level` INT,
  `relationship_type` VARCHAR(50) DEFAULT 'guardian',
  `verification_code` VARCHAR(10),
  `verification_method` ENUM('phone', 'email', 'document', 'in_person') DEFAULT 'phone',
  `status` ENUM('pending', 'verified', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  `reviewed_by` INT,
  `reviewed_by_name` VARCHAR(255),
  `reviewed_by_role` VARCHAR(50),
  `reviewed_at` TIMESTAMP NULL,
  `review_notes` TEXT,
  `rejection_reason` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL,
  INDEX `idx_request_code` (`request_code`),
  INDEX `idx_parent_phone` (`parent_phone`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_verification_code` (`verification_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent notifications queue
CREATE TABLE IF NOT EXISTS `parent_notifications_queue` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `notification_id` VARCHAR(50) UNIQUE,
  `parent_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `notification_type` ENUM('conduct_removed', 'leave_granted', 'academic_alert', 'fee_reminder', 'general', 'emergency') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `send_via` SET('sms', 'whatsapp', 'email', 'push') DEFAULT 'sms',
  `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  `scheduled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `sent_at` TIMESTAMP NULL,
  `delivery_status` ENUM('queued', 'sending', 'sent', 'delivered', 'failed', 'cancelled') DEFAULT 'queued',
  `delivery_attempts` INT DEFAULT 0,
  `last_attempt_at` TIMESTAMP NULL,
  `error_message` TEXT,
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_notification_type` (`notification_type`),
  INDEX `idx_delivery_status` (`delivery_status`),
  INDEX `idx_scheduled_at` (`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOD actions log with parent notification tracking
CREATE TABLE IF NOT EXISTS `dod_actions_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `action_id` VARCHAR(50) UNIQUE,
  `action_type` ENUM('remove_conduct', 'grant_leave', 'add_conduct', 'revoke_leave', 'contact_parent', 'bulk_action') NOT NULL,
  `student_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `student_name` VARCHAR(255),
  `performed_by` INT NOT NULL,
  `performed_by_name` VARCHAR(255),
  `performed_by_role` VARCHAR(50),
  `action_details` JSON,
  `parent_notified` BOOLEAN DEFAULT FALSE,
  `parents_notified_count` INT DEFAULT 0,
  `notification_ids` JSON,
  `reason` TEXT,
  `notes` TEXT,
  `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_action_type` (`action_type`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_performed_by` (`performed_by`),
  INDEX `idx_parent_notified` (`parent_notified`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent dashboard access log
CREATE TABLE IF NOT EXISTS `parent_access_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT NOT NULL,
  `student_id` INT,
  `access_type` ENUM('login', 'view_marks', 'view_attendance', 'view_discipline', 'view_fees', 'download_report') NOT NULL,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `device_type` VARCHAR(50),
  `access_granted` BOOLEAN DEFAULT TRUE,
  `denial_reason` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_access_type` (`access_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger to auto-update linked parent info in level4_sod_students
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS `update_linked_parent_info`
AFTER INSERT ON `parent_student_links`
FOR EACH ROW
BEGIN
  IF NEW.is_primary_contact = TRUE AND NEW.status = 'active' THEN
    UPDATE level4_sod_students l4s
    JOIN users u ON NEW.parent_id = u.id
    SET 
      l4s.linked_parent_id = NEW.parent_id,
      l4s.linked_parent_name = CONCAT(u.first_name, ' ', u.last_name),
      l4s.linked_parent_phone = u.phone,
      l4s.linked_parent_relationship = NEW.relationship_type,
      l4s.auto_linked_at = NOW()
    WHERE l4s.student_id = NEW.student_id;
  END IF;
  
  -- Update total linked parents count
  UPDATE level4_sod_students
  SET total_linked_parents = (
    SELECT COUNT(*) FROM parent_student_links 
    WHERE student_id = NEW.student_id AND status = 'active'
  )
  WHERE student_id = NEW.student_id;
END$$

DELIMITER ;

-- Trigger to update parent info count
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS `update_parent_children_count`
AFTER INSERT ON `parent_student_links`
FOR EACH ROW
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE parents_info
    SET 
      children_in_school = (
        SELECT COUNT(DISTINCT student_id) 
        FROM parent_student_links 
        WHERE parent_id = NEW.parent_id AND status = 'active'
      ),
      updated_at = NOW()
    WHERE user_id = NEW.parent_id;
  END IF;
END$$

DELIMITER ;

-- Insert sample Level 4 SOD students if table is empty
INSERT IGNORE INTO level4_sod_students (student_id, student_code, first_name, last_name, gender, trade_code, trade_name, level_number, conduct_score, status)
SELECT 
  u.id,
  sp.admission_number,
  u.first_name,
  u.last_name,
  u.gender,
  'SOD',
  'Software Development',
  4,
  40,
  'active'
FROM users u
JOIN student_profiles sp ON u.id = sp.user_id
JOIN enrollments e ON u.id = e.student_id
WHERE u.role = 'student' 
  AND e.trade_code = 'SOD' 
  AND e.level_number = 4
  AND e.status = 'active'
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create view for easy parent-student relationship queries
CREATE OR REPLACE VIEW `v_parent_student_relationships` AS
SELECT 
  psl.id AS link_id,
  psl.parent_id,
  CONCAT(p.first_name, ' ', p.last_name) AS parent_name,
  p.phone AS parent_phone,
  p.email AS parent_email,
  pi.whatsapp_number AS parent_whatsapp,
  pi.preferred_contact_method,
  psl.student_id,
  CONCAT(s.first_name, ' ', s.last_name) AS student_name,
  sp.admission_number AS student_code,
  e.trade_code,
  t.name AS trade_name,
  e.level_number,
  psl.relationship_type,
  psl.is_primary_contact,
  psl.can_receive_sms,
  psl.status AS link_status,
  psl.auto_linked,
  psl.linked_at
FROM parent_student_links psl
JOIN users p ON psl.parent_id = p.id
LEFT JOIN parents_info pi ON p.id = pi.user_id
JOIN users s ON psl.student_id = s.id
LEFT JOIN student_profiles sp ON s.id = sp.user_id
LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
LEFT JOIN trades t ON e.trade_code = t.code
WHERE psl.status = 'active';

-- Create view for Level 4 SOD students with all linked parents
CREATE OR REPLACE VIEW `v_level4_sod_with_parents` AS
SELECT 
  l4s.*,
  GROUP_CONCAT(
    CONCAT(
      COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''),
      ' (', COALESCE(p.phone, 'No phone'), ') - ', COALESCE(psl.relationship_type, 'Unknown')
    ) SEPARATOR ' | '
  ) AS all_linked_parents
FROM level4_sod_students l4s
LEFT JOIN parent_student_links psl ON l4s.student_id = psl.student_id AND psl.status = 'active'
LEFT JOIN users p ON psl.parent_id = p.id
WHERE l4s.status = 'active'
GROUP BY l4s.id;

SELECT 'DOD Parent Linking Advanced System created successfully!' AS Status;

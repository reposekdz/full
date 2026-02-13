-- Parent Linking & DOD System - Database Schema Verification
-- Run this to ensure all required tables exist

-- Discipline Records Table
CREATE TABLE IF NOT EXISTS `discipline_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `student_name` VARCHAR(255),
  `trade` VARCHAR(100),
  `class_level` INT,
  `conduct_type` ENUM('warning', 'suspension', 'expulsion', 'probation') DEFAULT 'warning',
  `severity` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `description` TEXT NOT NULL,
  `action_taken` TEXT,
  `conduct_points_deducted` INT DEFAULT 0,
  `new_conduct_score` INT DEFAULT 40,
  `removed_by` INT,
  `removed_by_name` VARCHAR(255),
  `parent_notified` BOOLEAN DEFAULT FALSE,
  `sms_sent` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Leaves Table
CREATE TABLE IF NOT EXISTS `student_leaves` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `student_name` VARCHAR(255),
  `trade` VARCHAR(100),
  `class_level` INT,
  `leave_type` ENUM('sick', 'home', 'emergency', 'family', 'medical', 'other') DEFAULT 'sick',
  `reason` TEXT NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME,
  `approved_by` INT,
  `approved_by_name` VARCHAR(255),
  `status` ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  `parent_notified` BOOLEAN DEFAULT FALSE,
  `sms_sent` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Connections Table (if not exists)
CREATE TABLE IF NOT EXISTS `parent_connections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `connection_id` VARCHAR(50) UNIQUE,
  `parent_id` INT,
  `parent_name` VARCHAR(255) NOT NULL,
  `parent_phone` VARCHAR(20) NOT NULL,
  `parent_email` VARCHAR(255),
  `student_id` INT NOT NULL,
  `student_name` VARCHAR(255),
  `relationship` VARCHAR(50) DEFAULT 'guardian',
  `can_view_marks` BOOLEAN DEFAULT TRUE,
  `can_view_attendance` BOOLEAN DEFAULT TRUE,
  `can_view_discipline` BOOLEAN DEFAULT FALSE,
  `can_view_report_cards` BOOLEAN DEFAULT TRUE,
  `can_view_fees` BOOLEAN DEFAULT TRUE,
  `can_receive_notifications` BOOLEAN DEFAULT TRUE,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `approved_by` VARCHAR(255),
  `approved_by_role` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_parent_phone` (`parent_phone`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Student Requests Table (if not exists)
CREATE TABLE IF NOT EXISTS `parent_student_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT,
  `parent_name` VARCHAR(255) NOT NULL,
  `parent_phone` VARCHAR(20) NOT NULL,
  `parent_email` VARCHAR(255),
  `student_first_name` VARCHAR(100) NOT NULL,
  `student_last_name` VARCHAR(100) NOT NULL,
  `student_trade` VARCHAR(100),
  `student_level` VARCHAR(20),
  `student_id` INT,
  `student_code` VARCHAR(50),
  `relationship_type` VARCHAR(50) DEFAULT 'guardian',
  `message` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `reviewed_by` INT,
  `reviewed_by_name` VARCHAR(255),
  `reviewed_by_role` VARCHAR(50),
  `reviewed_at` TIMESTAMP NULL,
  `review_note` TEXT,
  `verified_by_parent` BOOLEAN DEFAULT FALSE,
  `verification_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_parent_phone` (`parent_phone`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Verification Codes Table (if not exists)
CREATE TABLE IF NOT EXISTS `parent_verification_codes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_phone` VARCHAR(20) NOT NULL,
  `parent_name` VARCHAR(255) NOT NULL,
  `parent_email` VARCHAR(255),
  `student_first_name` VARCHAR(100) NOT NULL,
  `student_last_name` VARCHAR(100) NOT NULL,
  `student_trade` VARCHAR(100),
  `student_level` VARCHAR(20),
  `student_id` INT,
  `student_code` VARCHAR(50),
  `relationship_type` VARCHAR(50) DEFAULT 'guardian',
  `message` TEXT,
  `verification_code` VARCHAR(10) NOT NULL,
  `status` ENUM('pending', 'verified', 'expired') DEFAULT 'pending',
  `verified_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_verification_code` (`verification_code`),
  INDEX `idx_status` (`status`),
  INDEX `idx_parent_phone` (`parent_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Notifications Table (if not exists)
CREATE TABLE IF NOT EXISTS `parent_notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_phone` VARCHAR(20) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `urgency` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_parent_phone` (`parent_phone`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Communications Table (if not exists)
CREATE TABLE IF NOT EXISTS `parent_communications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_sheet_id` INT,
  `sender_id` INT,
  `sender_name` VARCHAR(255),
  `sender_role` VARCHAR(50),
  `parent_phone` VARCHAR(20) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message_body` TEXT NOT NULL,
  `urgency` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  `category` ENUM('general', 'academic', 'discipline', 'financial', 'health', 'emergency') DEFAULT 'general',
  `status` ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_parent_phone` (`parent_phone`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sent_at` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled Meetings Table
CREATE TABLE IF NOT EXISTS `scheduled_meetings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `meeting_type` VARCHAR(100) NOT NULL,
  `meeting_date` DATE NOT NULL,
  `meeting_time` TIME NOT NULL,
  `location` VARCHAR(255),
  `notes` TEXT,
  `scheduled_by` INT,
  `status` ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  `parent_notified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_meeting_date` (`meeting_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bulk Actions Log Table
CREATE TABLE IF NOT EXISTS `bulk_actions_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `action_type` VARCHAR(100) NOT NULL,
  `student_ids` TEXT NOT NULL,
  `executed_by` INT,
  `execution_data` TEXT,
  `status` ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_action_type` (`action_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Messages Table
CREATE TABLE IF NOT EXISTS `parent_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `parent_id` INT,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `send_via` ENUM('sms', 'whatsapp', 'email', 'both') DEFAULT 'sms',
  `sent_by` INT,
  `sent_by_name` VARCHAR(255),
  `delivery_status` ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_delivery_status` (`delivery_status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
ALTER TABLE `discipline_records` 
  ADD INDEX IF NOT EXISTS `idx_parent_notified` (`parent_notified`),
  ADD INDEX IF NOT EXISTS `idx_severity` (`severity`);

ALTER TABLE `student_leaves` 
  ADD INDEX IF NOT EXISTS `idx_parent_notified` (`parent_notified`),
  ADD INDEX IF NOT EXISTS `idx_leave_type` (`leave_type`);

-- Ensure global_student_sheets has conduct_score column
ALTER TABLE `global_student_sheets` 
  ADD COLUMN IF NOT EXISTS `conduct_score` INT DEFAULT 40 AFTER `level_number`;

-- Success message
SELECT 'Parent Linking & DOD System tables verified successfully!' AS Status;

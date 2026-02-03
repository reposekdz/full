-- ============================================
-- COMPREHENSIVE SCHOOL MANAGEMENT SYSTEM
-- Database Migration Script
-- ============================================
-- This migration adds all necessary tables for the ultra-comprehensive
-- staff portal system with full database integration
-- ============================================

-- Stock Management Tables
CREATE TABLE IF NOT EXISTS `stock_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `item_code` VARCHAR(50) UNIQUE NOT NULL,
  `item_name` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100) NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  `unit_price` DECIMAL(10,2) DEFAULT 0,
  `quantity` DECIMAL(10,2) DEFAULT 0,
  `reorder_level` DECIMAL(10,2) DEFAULT 10,
  `supplier_id` INT,
  `location` VARCHAR(100),
  `created_by` INT,
  `created_by_name` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_quantity` (`quantity`),
  INDEX `idx_item_code` (`item_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_transactions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `item_id` INT NOT NULL,
  `transaction_type` ENUM('receive', 'issue', 'adjustment') NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `previous_quantity` DECIMAL(10,2),
  `new_quantity` DECIMAL(10,2),
  `supplier_id` INT,
  `invoice_number` VARCHAR(100),
  `unit_cost` DECIMAL(10,2),
  `issued_to` INT,
  `issued_to_role` VARCHAR(50),
  `department` VARCHAR(100),
  `purpose` TEXT,
  `notes` TEXT,
  `performed_by` INT NOT NULL,
  `performed_by_name` VARCHAR(255),
  `transaction_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`item_id`) REFERENCES `stock_items`(`id`) ON DELETE CASCADE,
  INDEX `idx_transaction_date` (`transaction_date`),
  INDEX `idx_transaction_type` (`transaction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `supplier_name` VARCHAR(255) NOT NULL,
  `contact_person` VARCHAR(255),
  `phone` VARCHAR(20),
  `email` VARCHAR(255),
  `address` TEXT,
  `notes` TEXT,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_supplier_name` (`supplier_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Counseling & Advisory Tables
-- Note: These tables reference global_student_sheets(id) instead of student_id to avoid FK issues
CREATE TABLE IF NOT EXISTS `counseling_sessions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `counselor_id` INT NOT NULL,
  `counselor_name` VARCHAR(255),
  `session_date` DATE NOT NULL,
  `session_time` TIME,
  `session_type` VARCHAR(100),
  `topic` VARCHAR(255),
  `notes` TEXT,
  `status` ENUM('scheduled', 'completed', 'cancelled', 'active') DEFAULT 'scheduled',
  `outcome` TEXT,
  `action_taken` TEXT,
  `follow_up_required` BOOLEAN DEFAULT FALSE,
  `follow_up_date` DATE,
  `session_notes` TEXT,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_counselor` (`student_sheet_id`, `counselor_id`),
  INDEX `idx_session_date` (`session_date`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_career_profiles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT UNIQUE NOT NULL,
  `student_code` VARCHAR(50),
  `career_interest` VARCHAR(255),
  `strengths` TEXT,
  `weaknesses` TEXT,
  `aptitude_test_results` TEXT,
  `recommended_paths` TEXT,
  `goals` TEXT,
  `action_plan` TEXT,
  `advisor_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_career_interest` (`career_interest`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_wellbeing_assessments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `counselor_id` INT NOT NULL,
  `assessment_type` VARCHAR(100),
  `stress_level` INT CHECK (`stress_level` BETWEEN 1 AND 10),
  `anxiety_level` INT CHECK (`anxiety_level` BETWEEN 1 AND 10),
  `depression_indicators` BOOLEAN DEFAULT FALSE,
  `notes` TEXT,
  `recommended_actions` TEXT,
  `assessment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_assessment_date` (`assessment_date`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_interventions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `counselor_id` INT NOT NULL,
  `intervention_type` VARCHAR(100),
  `reason` TEXT,
  `description` TEXT,
  `target_outcomes` TEXT,
  `start_date` DATE,
  `expected_end_date` DATE,
  `stakeholders` TEXT,
  `status` ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_status` (`status`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `intervention_progress_notes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `intervention_id` INT NOT NULL,
  `counselor_id` INT NOT NULL,
  `progress_notes` TEXT,
  `effectiveness_rating` INT CHECK (`effectiveness_rating` BETWEEN 1 AND 10),
  `challenges` TEXT,
  `next_steps` TEXT,
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`intervention_id`) REFERENCES `student_interventions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Curriculum Management Tables
CREATE TABLE IF NOT EXISTS `curriculum` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `trade_id` INT NOT NULL,
  `level_id` INT,
  `subject_name` VARCHAR(255) NOT NULL,
  `subject_code` VARCHAR(50),
  `description` TEXT,
  `topics` JSON,
  `learning_outcomes` TEXT,
  `assessment_methods` TEXT,
  `resources` TEXT,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_trade_level` (`trade_id`, `level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teacher_curriculum_progress` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `class_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  `topic_id` INT NOT NULL,
  `completion_percentage` DECIMAL(5,2) DEFAULT 0,
  `notes` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_class_teacher` (`class_id`, `teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discipline & Behavior Management Tables
CREATE TABLE IF NOT EXISTS `behavior_intervention_programs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `counselor_id` INT NOT NULL,
  `program_name` VARCHAR(255),
  `intervention_type` VARCHAR(100),
  `reason` TEXT,
  `goals` TEXT,
  `strategies` TEXT,
  `duration_weeks` INT,
  `start_date` DATE,
  `expected_end_date` DATE,
  `stakeholders` TEXT,
  `status` ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_status` (`status`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `intervention_progress_tracking` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `program_id` INT NOT NULL,
  `counselor_id` INT NOT NULL,
  `progress_notes` TEXT,
  `behavior_change` TEXT,
  `effectiveness` INT CHECK (`effectiveness` BETWEEN 1 AND 10),
  `challenges` TEXT,
  `adjustments` TEXT,
  `recorded_by` INT,
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`program_id`) REFERENCES `behavior_intervention_programs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `parent_communications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `sender_id` INT NOT NULL,
  `sender_name` VARCHAR(255),
  `sender_role` VARCHAR(50),
  `subject` VARCHAR(255),
  `message` TEXT,
  `urgency` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `requires_response` BOOLEAN DEFAULT FALSE,
  `status` ENUM('sent', 'read', 'replied') DEFAULT 'sent',
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_status` (`status`),
  INDEX `idx_urgency` (`urgency`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Tables
CREATE TABLE IF NOT EXISTS `student_notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT,
  `student_code` VARCHAR(50),
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50),
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_read` (`student_sheet_id`, `is_read`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `parent_notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT,
  `student_code` VARCHAR(50),
  `parent_phone` VARCHAR(20),
  `parent_email` VARCHAR(255),
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50),
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_read` (`student_sheet_id`, `is_read`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_student_code` (`student_code`),
  INDEX `idx_parent_phone` (`parent_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Proof Management
CREATE TABLE IF NOT EXISTS `payment_proofs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_method` VARCHAR(100),
  `reference_number` VARCHAR(100),
  `proof_image` VARCHAR(500),
  `description` TEXT,
  `status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  `verified_by` INT,
  `verified_at` TIMESTAMP NULL,
  `rejection_reason` TEXT,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_date` (`payment_date`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Achievements
CREATE TABLE IF NOT EXISTS `student_achievements` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `achievement_type` VARCHAR(100),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `date_awarded` DATE,
  `points` INT DEFAULT 0,
  `certificate_url` VARCHAR(500),
  `awarded_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_achievement_type` (`achievement_type`),
  INDEX `idx_date_awarded` (`date_awarded`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 
CREATE TABLE IF NOT EXISTS `timetable_entries` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `class_id` VARCHAR(100),
  `trade_code` VARCHAR(50),
  `day_of_week` VARCHAR(20),
  `start_time` TIME,
  `end_time` TIME,
  `subject_name` VARCHAR(255),
  `teacher_id` INT,
  `teacher_name` VARCHAR(255),
  `venue` VARCHAR(255),
  `academic_year` VARCHAR(20),
  `term` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_class_day` (`class_id`, `day_of_week`),
  INDEX `idx_trade_day` (`trade_code`, `day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `assignment_id` INT NOT NULL,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `submission_text` TEXT,
  `attachment_url` VARCHAR(500),
  `marks_obtained` DECIMAL(5,2),
  `feedback` TEXT,
  `status` ENUM('pending', 'submitted', 'graded', 'late') DEFAULT 'pending',
  `submitted_at` TIMESTAMP NULL,
  `graded_at` TIMESTAMP NULL,
  `graded_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_assignment_student` (`assignment_id`, `student_sheet_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Parents Linking
CREATE TABLE IF NOT EXISTS `student_parents` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_sheet_id` INT NOT NULL,
  `student_code` VARCHAR(50),
  `parent_id` INT,
  `phone` VARCHAR(20),
  `email` VARCHAR(255),
  `relationship` VARCHAR(50),
  `is_primary` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_parent` (`student_sheet_id`, `parent_id`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_email` (`email`),
  INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Add Missing Columns to Existing Tables
-- ============================================

-- Add advisor_id to global_student_sheets if not exists
ALTER TABLE `global_student_sheets` 
ADD COLUMN IF NOT EXISTS `advisor_id` INT AFTER `class_name`,
ADD INDEX IF NOT EXISTS `idx_advisor_id` (`advisor_id`);

-- Add profile_image to global_student_sheets if not exists
ALTER TABLE `global_student_sheets` 
ADD COLUMN IF NOT EXISTS `profile_image` VARCHAR(500) AFTER `gender`;

-- Ensure all required indexes exist
ALTER TABLE `global_student_sheets` 
ADD INDEX IF NOT EXISTS `idx_trade_level` (`trade_code`, `level_number`),
ADD INDEX IF NOT EXISTS `idx_status` (`status`),
ADD INDEX IF NOT EXISTS `idx_payment_status` (`payment_status`),
ADD INDEX IF NOT EXISTS `idx_gpa` (`gpa`),
ADD INDEX IF NOT EXISTS `idx_conduct_score` (`conduct_score`);

-- Ensure student_discipline_records has all required columns
ALTER TABLE `student_discipline_records`
ADD COLUMN IF NOT EXISTS `incident_time` TIME AFTER `incident_date`,
ADD COLUMN IF NOT EXISTS `location` VARCHAR(255) AFTER `incident_time`,
ADD COLUMN IF NOT EXISTS `witnesses` TEXT AFTER `description`,
ADD COLUMN IF NOT EXISTS `immediate_action` TEXT AFTER `witnesses`,
ADD COLUMN IF NOT EXISTS `parents_notified` BOOLEAN DEFAULT FALSE AFTER `action_taken`,
ADD COLUMN IF NOT EXISTS `follow_up_required` BOOLEAN DEFAULT FALSE AFTER `parents_notified`,
ADD COLUMN IF NOT EXISTS `follow_up_date` DATE AFTER `follow_up_required`,
ADD COLUMN IF NOT EXISTS `resolution_notes` TEXT AFTER `follow_up_date`,
ADD COLUMN IF NOT EXISTS `resolved_by` INT AFTER `resolution_notes`,
ADD COLUMN IF NOT EXISTS `resolved_at` TIMESTAMP NULL AFTER `resolved_by`,
ADD INDEX IF NOT EXISTS `idx_severity` (`severity`),
ADD INDEX IF NOT EXISTS `idx_status` (`resolution_status`),
ADD INDEX IF NOT EXISTS `idx_incident_date` (`incident_date`);

-- ============================================
-- Insert Sample Data (Optional)
-- ============================================

-- Sample stock categories
INSERT IGNORE INTO `stock_items` (`item_code`, `item_name`, `category`, `unit`, `unit_price`, `quantity`, `reorder_level`) VALUES
('STK001', 'A4 Paper Reams', 'Stationery', 'ream', 15000, 50, 20),
('STK002', 'Whiteboard Markers', 'Stationery', 'box', 8000, 30, 10),
('STK003', 'Cleaning Detergent', 'Supplies', 'liter', 5000, 25, 15);

-- Sample suppliers
INSERT IGNORE INTO `suppliers` (`supplier_name`, `contact_person`, `phone`, `email`) VALUES
('Office Supplies Ltd', 'John Doe', '0788123456', 'john@officesupplies.com'),
('Cleaning Solutions Rwanda', 'Jane Smith', '0788654321', 'jane@cleaningsolutions.rw');

-- ============================================
-- Migration Complete
-- ============================================
-- All tables created successfully
-- Indexes added for optimal query performance
-- Foreign keys established for data integrity
-- Ready for production use
-- ============================================

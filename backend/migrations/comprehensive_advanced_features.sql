-- ==========================================
-- COMPREHENSIVE ADVANCED FEATURES DATABASE SCHEMA
-- School Management System - Advanced Features
-- ==========================================

-- Custom Columns System (Dynamic Field Management)
CREATE TABLE IF NOT EXISTS `custom_columns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `entity_type` VARCHAR(50) NOT NULL COMMENT 'students, teachers, staff, parents',
  `column_name` VARCHAR(100) NOT NULL,
  `column_label` VARCHAR(200) NOT NULL,
  `column_type` ENUM('text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'textarea', 'file', 'email', 'phone', 'url') NOT NULL DEFAULT 'text',
  `data_type` ENUM('string', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'json') NOT NULL DEFAULT 'string',
  `is_required` TINYINT(1) DEFAULT 0,
  `is_searchable` TINYINT(1) DEFAULT 0,
  `is_sortable` TINYINT(1) DEFAULT 0,
  `is_filterable` TINYINT(1) DEFAULT 0,
  `default_value` TEXT,
  `validation_rules` JSON,
  `options` JSON COMMENT 'For select/multiselect types',
  `display_order` INT DEFAULT 0,
  `description` TEXT,
  `group_name` VARCHAR(100),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_entity_type` (`entity_type`),
  INDEX `idx_is_active` (`is_active`),
  UNIQUE KEY `unique_entity_column` (`entity_type`, `column_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Column Values Storage
CREATE TABLE IF NOT EXISTS `custom_column_values` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT NOT NULL,
  `column_id` INT NOT NULL,
  `column_value` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_entity` (`entity_type`, `entity_id`),
  INDEX `idx_column` (`column_id`),
  FOREIGN KEY (`column_id`) REFERENCES `custom_columns`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_entity_column_value` (`entity_type`, `entity_id`, `column_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Fee Structures
CREATE TABLE IF NOT EXISTS `fee_structures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `academic_year` VARCHAR(20) NOT NULL,
  `term` VARCHAR(20) NOT NULL,
  `trade_code` VARCHAR(50),
  `trade_name` VARCHAR(200),
  `level_number` INT,
  `fee_type` VARCHAR(100) NOT NULL,
  `fee_category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `due_date` DATE,
  `description` TEXT,
  `is_mandatory` TINYINT(1) DEFAULT 1,
  `installment_allowed` TINYINT(1) DEFAULT 0,
  `installment_count` INT DEFAULT 1,
  `status` ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_academic_year_term` (`academic_year`, `term`),
  INDEX `idx_trade_level` (`trade_code`, `level_number`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fee Payments Enhancement
CREATE TABLE IF NOT EXISTS `fee_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `fee_type` VARCHAR(100) NOT NULL,
  `fee_category` VARCHAR(100),
  `amount` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `payment_method` VARCHAR(50),
  `payment_reference` VARCHAR(200),
  `payment_date` DATE NOT NULL,
  `academic_year` VARCHAR(20),
  `term` VARCHAR(20),
  `status` ENUM('paid', 'pending', 'overdue', 'cancelled') DEFAULT 'pending',
  `notes` TEXT,
  `proof_document` VARCHAR(500),
  `recorded_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student` (`student_id`),
  INDEX `idx_payment_date` (`payment_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_academic_year_term` (`academic_year`, `term`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Receipts
CREATE TABLE IF NOT EXISTS `payment_receipts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_id` INT NOT NULL,
  `receipt_number` VARCHAR(100) UNIQUE NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `payment_date` DATE NOT NULL,
  `generated_by` INT,
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_payment` (`payment_id`),
  INDEX `idx_student` (`student_id`),
  FOREIGN KEY (`payment_id`) REFERENCES `fee_payments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Balances
CREATE TABLE IF NOT EXISTS `student_balances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL,
  `term` VARCHAR(20) NOT NULL,
  `balance` DECIMAL(15,2) DEFAULT 0,
  `last_payment_date` DATE,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_year_term` (`student_id`, `academic_year`, `term`),
  INDEX `idx_balance` (`balance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budgets
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `academic_year` VARCHAR(20) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100),
  `allocated_amount` DECIMAL(15,2) NOT NULL,
  `spent_amount` DECIMAL(15,2) DEFAULT 0,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `description` TEXT,
  `status` ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_academic_year` (`academic_year`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100),
  `amount` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `expense_date` DATE NOT NULL,
  `description` TEXT,
  `vendor` VARCHAR(200),
  `receipt_number` VARCHAR(100),
  `payment_method` VARCHAR(50),
  `budget_id` INT,
  `recorded_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_expense_date` (`expense_date`),
  INDEX `idx_category` (`category`),
  INDEX `idx_budget` (`budget_id`),
  FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Stock Items
CREATE TABLE IF NOT EXISTS `stock_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_code` VARCHAR(100) UNIQUE NOT NULL,
  `item_name` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100),
  `unit_of_measure` VARCHAR(50) NOT NULL,
  `quantity` INT DEFAULT 0,
  `unit_price` DECIMAL(15,2) DEFAULT 0,
  `reorder_level` INT DEFAULT 10,
  `supplier_id` INT,
  `storage_location` VARCHAR(200),
  `barcode` VARCHAR(100),
  `expiry_date` DATE,
  `manufacturer` VARCHAR(200),
  `status` ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') DEFAULT 'available',
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_supplier` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `supplier_name` VARCHAR(200) NOT NULL,
  `contact_person` VARCHAR(200),
  `email` VARCHAR(200),
  `phone` VARCHAR(50),
  `address` TEXT,
  `city` VARCHAR(100),
  `country` VARCHAR(100) DEFAULT 'Rwanda',
  `payment_terms` VARCHAR(200),
  `tax_id` VARCHAR(100),
  `notes` TEXT,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Transactions
CREATE TABLE IF NOT EXISTS `stock_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `transaction_type` ENUM('purchase', 'distribution', 'return', 'adjustment', 'initial') NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(15,2),
  `total_amount` DECIMAL(15,2),
  `supplier_id` INT,
  `purchase_order_number` VARCHAR(100),
  `invoice_number` VARCHAR(100),
  `transaction_date` DATE NOT NULL,
  `notes` TEXT,
  `performed_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_item` (`item_id`),
  INDEX `idx_transaction_date` (`transaction_date`),
  INDEX `idx_type` (`transaction_type`),
  FOREIGN KEY (`item_id`) REFERENCES `stock_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Distributions
CREATE TABLE IF NOT EXISTS `stock_distributions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `distributed_to` VARCHAR(200) NOT NULL,
  `distributed_to_type` ENUM('department', 'staff', 'student', 'class', 'other') NOT NULL,
  `department` VARCHAR(100),
  `purpose` TEXT,
  `distribution_date` DATE NOT NULL,
  `notes` TEXT,
  `return_expected` TINYINT(1) DEFAULT 0,
  `expected_return_date` DATE,
  `quantity_returned` INT DEFAULT 0,
  `return_date` DATE,
  `return_condition` VARCHAR(200),
  `status` ENUM('distributed', 'partial_return', 'returned', 'lost') DEFAULT 'distributed',
  `distributed_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_item` (`item_id`),
  INDEX `idx_distribution_date` (`distribution_date`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`item_id`) REFERENCES `stock_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `submission_text` TEXT,
  `submission_files` JSON,
  `status` ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'draft',
  `grade` VARCHAR(10),
  `graded_marks` DECIMAL(5,2),
  `feedback` TEXT,
  `submitted_at` TIMESTAMP NULL,
  `graded_at` TIMESTAMP NULL,
  `graded_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_assignment` (`assignment_id`),
  INDEX `idx_student` (`student_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discipline Records
CREATE TABLE IF NOT EXISTS `discipline_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `incident_type` VARCHAR(100) NOT NULL,
  `severity` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `incident_date` DATE NOT NULL,
  `incident_time` TIME,
  `location` VARCHAR(200),
  `description` TEXT NOT NULL,
  `action_taken` TEXT,
  `resolution_status` ENUM('open', 'in_progress', 'resolved', 'escalated') DEFAULT 'open',
  `witnesses` TEXT,
  `parent_notified` TINYINT(1) DEFAULT 0,
  `notification_date` DATE,
  `recorded_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student` (`student_id`),
  INDEX `idx_incident_date` (`incident_date`),
  INDEX `idx_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Conduct Tracking
CREATE TABLE IF NOT EXISTS `student_conduct_tracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sheet_id` INT,
  `student_id` VARCHAR(50) NOT NULL UNIQUE,
  `critical` INT DEFAULT 0,
  `high` INT DEFAULT 0,
  `medium` INT DEFAULT 0,
  `low` INT DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Achievements
CREATE TABLE IF NOT EXISTS `student_achievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `achievement_type` VARCHAR(100) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `achievement_date` DATE NOT NULL,
  `category` VARCHAR(100),
  `certificate_issued` TINYINT(1) DEFAULT 0,
  `certificate_number` VARCHAR(100),
  `awarded_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student` (`student_id`),
  INDEX `idx_achievement_date` (`achievement_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Links
CREATE TABLE IF NOT EXISTS `parent_links` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `relationship` ENUM('father', 'mother', 'guardian', 'other') NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `can_make_payments` TINYINT(1) DEFAULT 1,
  `can_view_grades` TINYINT(1) DEFAULT 1,
  `can_view_attendance` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_parent` (`parent_id`),
  INDEX `idx_student` (`student_id`),
  UNIQUE KEY `unique_parent_student` (`parent_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Proofs
CREATE TABLE IF NOT EXISTS `payment_proofs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `parent_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `payment_method` VARCHAR(50),
  `transaction_reference` VARCHAR(200),
  `payment_date` DATE NOT NULL,
  `proof_document` VARCHAR(500),
  `notes` TEXT,
  `status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  `verified_by` INT,
  `verified_at` TIMESTAMP NULL,
  `rejection_reason` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student` (`student_id`),
  INDEX `idx_parent` (`parent_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) UNIQUE NOT NULL,
  `setting_value` TEXT,
  `category` VARCHAR(100),
  `description` TEXT,
  `data_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  `is_editable` TINYINT(1) DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50),
  `entity_id` INT,
  `description` TEXT,
  `ip_address` VARCHAR(50),
  `user_agent` TEXT,
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Class Enrollments
CREATE TABLE IF NOT EXISTS `class_enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `enrollment_date` DATE NOT NULL,
  `status` ENUM('active', 'completed', 'withdrawn') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_class` (`class_id`),
  INDEX `idx_student` (`student_id`),
  UNIQUE KEY `unique_class_student` (`class_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages/Communication
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL,
  `recipient_id` INT,
  `recipient_type` VARCHAR(50) COMMENT 'all_students, all_parents, all_teachers, etc.',
  `subject` VARCHAR(300) NOT NULL,
  `message` TEXT NOT NULL,
  `message_type` VARCHAR(50) DEFAULT 'general',
  `related_student_id` VARCHAR(50),
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sender` (`sender_id`),
  INDEX `idx_recipient` (`recipient_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `user_type` VARCHAR(50),
  `title` VARCHAR(300) NOT NULL,
  `message` TEXT NOT NULL,
  `notification_type` VARCHAR(50),
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` TIMESTAMP NULL,
  `action_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `category`, `description`, `data_type`) VALUES
('school_name', 'Advanced School Management System', 'general', 'School Name', 'string'),
('academic_year', '2024-2025', 'academic', 'Current Academic Year', 'string'),
('current_term', 'Term 1', 'academic', 'Current Term', 'string'),
('currency', 'RWF', 'financial', 'Default Currency', 'string'),
('enable_sms', '1', 'communication', 'Enable SMS Notifications', 'boolean'),
('enable_email', '1', 'communication', 'Enable Email Notifications', 'boolean'),
('default_language', 'en', 'general', 'Default System Language', 'string'),
('attendance_grace_period', '15', 'academic', 'Late Attendance Grace Period (minutes)', 'number');

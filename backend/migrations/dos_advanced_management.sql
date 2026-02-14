-- ============================================
-- DOS ADVANCED MANAGEMENT SYSTEM
-- Complete Course, Subject & Teacher Management
-- ============================================

-- Subjects/Courses Table (Trade-specific and General Studies)
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `subject_code` VARCHAR(50) UNIQUE NOT NULL,
  `subject_name` VARCHAR(255) NOT NULL,
  `subject_type` ENUM('trade_specific', 'general_studies', 'core', 'elective') DEFAULT 'trade_specific',
  `description` TEXT,
  `credit_hours` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_subject_code` (`subject_code`),
  INDEX `idx_subject_type` (`subject_type`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subject-Trade-Level Assignment (Which subjects for which trade/level)
CREATE TABLE IF NOT EXISTS `subject_trade_assignments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `subject_id` INT NOT NULL,
  `subject_code` VARCHAR(50) NOT NULL,
  `subject_name` VARCHAR(255) NOT NULL,
  `trade_code` VARCHAR(50) NOT NULL,
  `level_number` INT NOT NULL,
  `is_mandatory` BOOLEAN DEFAULT TRUE,
  `academic_year` VARCHAR(20),
  `term` VARCHAR(20),
  `assigned_by` INT,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_subject_trade_level` (`subject_code`, `trade_code`, `level_number`, `academic_year`),
  INDEX `idx_trade_level` (`trade_code`, `level_number`),
  INDEX `idx_subject` (`subject_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teacher-Subject Assignment (Which teacher teaches which subject)
CREATE TABLE IF NOT EXISTS `teacher_subject_assignments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `teacher_id` INT NOT NULL,
  `teacher_name` VARCHAR(255) NOT NULL,
  `subject_id` INT NOT NULL,
  `subject_code` VARCHAR(50) NOT NULL,
  `subject_name` VARCHAR(255) NOT NULL,
  `trade_code` VARCHAR(50) NOT NULL,
  `level_number` INT NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL,
  `term` VARCHAR(20),
  `is_active` BOOLEAN DEFAULT TRUE,
  `assigned_by` INT,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_teacher_subject_trade` (`teacher_id`, `subject_code`, `trade_code`, `level_number`, `academic_year`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_subject` (`subject_code`),
  INDEX `idx_trade_level` (`trade_code`, `level_number`),
  INDEX `idx_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teacher Workload Tracking
CREATE TABLE IF NOT EXISTS `teacher_workload` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `teacher_id` INT NOT NULL,
  `teacher_name` VARCHAR(255) NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL,
  `term` VARCHAR(20),
  `total_subjects` INT DEFAULT 0,
  `total_classes` INT DEFAULT 0,
  `total_students` INT DEFAULT 0,
  `total_periods_per_week` INT DEFAULT 0,
  `workload_percentage` DECIMAL(5,2) DEFAULT 0,
  `status` ENUM('underloaded', 'optimal', 'overloaded') DEFAULT 'optimal',
  `last_calculated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_teacher_year` (`teacher_id`, `academic_year`, `term`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Class-Subject Schedule (Timetable entries)
CREATE TABLE IF NOT EXISTS `class_subject_schedule` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `trade_code` VARCHAR(50) NOT NULL,
  `level_number` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `subject_code` VARCHAR(50) NOT NULL,
  `subject_name` VARCHAR(255) NOT NULL,
  `teacher_id` INT NOT NULL,
  `teacher_name` VARCHAR(255) NOT NULL,
  `day_of_week` ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `period_number` INT NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `room` VARCHAR(100),
  `academic_year` VARCHAR(20) NOT NULL,
  `term` VARCHAR(20),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  INDEX `idx_trade_level` (`trade_code`, `level_number`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_day_period` (`day_of_week`, `period_number`),
  INDEX `idx_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subject Topics/Modules
CREATE TABLE IF NOT EXISTS `subject_topics` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `subject_id` INT NOT NULL,
  `subject_code` VARCHAR(50) NOT NULL,
  `topic_number` INT NOT NULL,
  `topic_name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `learning_outcomes` TEXT,
  `duration_hours` INT DEFAULT 0,
  `resources` TEXT,
  `assessment_methods` TEXT,
  `order_sequence` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  INDEX `idx_subject` (`subject_code`),
  INDEX `idx_order` (`order_sequence`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subject Materials/Resources
CREATE TABLE IF NOT EXISTS `subject_materials` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `subject_id` INT NOT NULL,
  `subject_code` VARCHAR(50) NOT NULL,
  `material_type` ENUM('textbook', 'handout', 'video', 'presentation', 'assignment', 'other') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `file_url` VARCHAR(500),
  `external_link` VARCHAR(500),
  `uploaded_by` INT,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  INDEX `idx_subject` (`subject_code`),
  INDEX `idx_material_type` (`material_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOS Actions Log
CREATE TABLE IF NOT EXISTS `dos_action_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `dos_id` INT NOT NULL,
  `dos_name` VARCHAR(255) NOT NULL,
  `action_type` VARCHAR(100) NOT NULL,
  `action_description` TEXT,
  `target_type` VARCHAR(50),
  `target_id` INT,
  `old_value` TEXT,
  `new_value` TEXT,
  `ip_address` VARCHAR(50),
  `user_agent` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_dos` (`dos_id`),
  INDEX `idx_action_type` (`action_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT SAMPLE GENERAL STUDIES SUBJECTS
-- ============================================

INSERT IGNORE INTO `subjects` (`subject_code`, `subject_name`, `subject_type`, `description`, `credit_hours`) VALUES
-- General Studies (Common for all trades)
('GS001', 'English Language', 'general_studies', 'Communication and writing skills', 4),
('GS002', 'Kinyarwanda', 'general_studies', 'National language and culture', 3),
('GS003', 'Mathematics', 'general_studies', 'Basic and applied mathematics', 4),
('GS004', 'Physics', 'general_studies', 'Basic physics principles', 3),
('GS005', 'Chemistry', 'general_studies', 'Basic chemistry principles', 3),
('GS006', 'Entrepreneurship', 'general_studies', 'Business and entrepreneurship skills', 2),
('GS007', 'ICT Basics', 'general_studies', 'Computer literacy and digital skills', 2),
('GS008', 'Civic Education', 'general_studies', 'Citizenship and civic responsibility', 2),
('GS009', 'Physical Education', 'general_studies', 'Sports and physical fitness', 2),
('GS010', 'Life Skills', 'general_studies', 'Personal development and life skills', 2),

-- AUT (Automotive) Specific Subjects
('AUT001', 'Engine Systems', 'trade_specific', 'Internal combustion engines', 6),
('AUT002', 'Electrical Systems', 'trade_specific', 'Automotive electrical and electronics', 5),
('AUT003', 'Transmission Systems', 'trade_specific', 'Manual and automatic transmissions', 5),
('AUT004', 'Brake Systems', 'trade_specific', 'Hydraulic and pneumatic brakes', 4),
('AUT005', 'Suspension & Steering', 'trade_specific', 'Vehicle suspension and steering systems', 4),
('AUT006', 'Automotive Diagnostics', 'trade_specific', 'Fault finding and diagnostics', 5),
('AUT007', 'Fuel Systems', 'trade_specific', 'Fuel injection and carburetion', 4),
('AUT008', 'Air Conditioning', 'trade_specific', 'HVAC systems in vehicles', 3),
('AUT009', 'Automotive Workshop Practice', 'trade_specific', 'Practical workshop skills', 6),
('AUT010', 'Vehicle Maintenance', 'trade_specific', 'Preventive maintenance procedures', 4),

-- BDC (Building & Construction) Specific Subjects
('BDC001', 'Building Construction Technology', 'trade_specific', 'Construction methods and techniques', 6),
('BDC002', 'Structural Design', 'trade_specific', 'Design of building structures', 5),
('BDC003', 'Construction Materials', 'trade_specific', 'Properties and uses of materials', 4),
('BDC004', 'Surveying', 'trade_specific', 'Land and construction surveying', 5),
('BDC005', 'Concrete Technology', 'trade_specific', 'Concrete mix design and testing', 4),
('BDC006', 'Masonry & Bricklaying', 'trade_specific', 'Brick and block work', 5),
('BDC007', 'Carpentry & Joinery', 'trade_specific', 'Woodwork and joinery', 5),
('BDC008', 'Plumbing Systems', 'trade_specific', 'Water supply and drainage', 4),
('BDC009', 'Electrical Installation', 'trade_specific', 'Building electrical systems', 4),
('BDC010', 'Construction Drawing', 'trade_specific', 'Technical drawing and CAD', 5),
('BDC011', 'Quantity Surveying', 'trade_specific', 'Cost estimation and BOQ', 4),
('BDC012', 'Construction Site Management', 'trade_specific', 'Site organization and safety', 3),

-- SOD (Software Development) Specific Subjects
('SOD001', 'Programming Fundamentals', 'trade_specific', 'Basic programming concepts', 6),
('SOD002', 'Web Development', 'trade_specific', 'HTML, CSS, JavaScript', 6),
('SOD003', 'Database Management', 'trade_specific', 'SQL and database design', 5),
('SOD004', 'Object-Oriented Programming', 'trade_specific', 'OOP concepts and Java', 6),
('SOD005', 'Mobile App Development', 'trade_specific', 'Android and iOS development', 5),
('SOD006', 'Software Engineering', 'trade_specific', 'SDLC and methodologies', 4),
('SOD007', 'Data Structures & Algorithms', 'trade_specific', 'DSA fundamentals', 5),
('SOD008', 'Network & Security', 'trade_specific', 'Computer networks and cybersecurity', 4),
('SOD009', 'UI/UX Design', 'trade_specific', 'User interface and experience design', 4),
('SOD010', 'Cloud Computing', 'trade_specific', 'Cloud platforms and services', 4),
('SOD011', 'DevOps Practices', 'trade_specific', 'CI/CD and automation', 3),
('SOD012', 'Project Management', 'trade_specific', 'Agile and Scrum methodologies', 3);

-- ============================================
-- ASSIGN GENERAL STUDIES TO ALL TRADES/LEVELS
-- ============================================

-- General Studies for AUT Level 4
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'AUT', 4, TRUE, '2025' FROM `subjects` WHERE `subject_type` = 'general_studies';

-- General Studies for AUT Level 5
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'AUT', 5, TRUE, '2025' FROM `subjects` WHERE `subject_type` = 'general_studies';

-- General Studies for BDC Level 3, 4, 5
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'BDC', 3, TRUE, '2025' FROM `subjects` WHERE `subject_type` = 'general_studies';

INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'BDC', 4, TRUE, '2025' FROM `subjects` WHERE `subject_type` = 'general_studies';

INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'BDC', 5, TRUE, '2025' FROM `subjects` WHERE `subject_type` = 'general_studies';

-- General Studies for SOD Level 3, 4, 5
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'SOD', 3, TRUE, '2025' FROM `subjects` WHERE `subject_type` = 'general_studies';

INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'SOD', 4, TRUE, '2025' FROM `subjects` WHERE `subject_type` = 'general_studies';

INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'SOD', 5, TRUE, '2025' FROM `subjects` WHERE `subject_type` = 'general_studies';

-- ============================================
-- ASSIGN TRADE-SPECIFIC SUBJECTS
-- ============================================

-- AUT Subjects for Level 4
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'AUT', 4, TRUE, '2025' FROM `subjects` WHERE `subject_code` LIKE 'AUT%' AND `subject_code` IN ('AUT001', 'AUT002', 'AUT003', 'AUT004', 'AUT005', 'AUT009');

-- AUT Subjects for Level 5
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'AUT', 5, TRUE, '2025' FROM `subjects` WHERE `subject_code` LIKE 'AUT%';

-- BDC Subjects for Level 3
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'BDC', 3, TRUE, '2025' FROM `subjects` WHERE `subject_code` LIKE 'BDC%' AND `subject_code` IN ('BDC001', 'BDC003', 'BDC006', 'BDC007', 'BDC010');

-- BDC Subjects for Level 4
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'BDC', 4, TRUE, '2025' FROM `subjects` WHERE `subject_code` LIKE 'BDC%' AND `subject_code` IN ('BDC001', 'BDC002', 'BDC003', 'BDC004', 'BDC005', 'BDC006', 'BDC007', 'BDC008', 'BDC010');

-- BDC Subjects for Level 5
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'BDC', 5, TRUE, '2025' FROM `subjects` WHERE `subject_code` LIKE 'BDC%';

-- SOD Subjects for Level 3
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'SOD', 3, TRUE, '2025' FROM `subjects` WHERE `subject_code` LIKE 'SOD%' AND `subject_code` IN ('SOD001', 'SOD002', 'SOD003', 'SOD009');

-- SOD Subjects for Level 4
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'SOD', 4, TRUE, '2025' FROM `subjects` WHERE `subject_code` LIKE 'SOD%' AND `subject_code` IN ('SOD001', 'SOD002', 'SOD003', 'SOD004', 'SOD005', 'SOD006', 'SOD007', 'SOD009');

-- SOD Subjects for Level 5
INSERT IGNORE INTO `subject_trade_assignments` (`subject_id`, `subject_code`, `subject_name`, `trade_code`, `level_number`, `is_mandatory`, `academic_year`) 
SELECT id, subject_code, subject_name, 'SOD', 5, TRUE, '2025' FROM `subjects` WHERE `subject_code` LIKE 'SOD%';

-- ============================================
-- Migration Complete
-- ============================================

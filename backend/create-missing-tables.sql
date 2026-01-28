-- ============================================================
-- COMPREHENSIVE DATABASE SCHEMA FOR MISSING TABLES
-- Fixes 23 failing APIs identified in testing
-- ============================================================

-- Sports Management System Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS `teams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `sport_type` VARCHAR(100) NOT NULL,
  `category` ENUM('boys', 'girls', 'mixed') DEFAULT 'mixed',
  `coach_name` VARCHAR(255),
  `coach_phone` VARCHAR(20),
  `captain_id` INT,
  `founded_date` DATE,
  `description` TEXT,
  `logo_url` VARCHAR(500),
  `achievements` JSON,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sport_type (`sport_type`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `players` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `team_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `jersey_number` INT,
  `position` VARCHAR(100),
  `height_cm` DECIMAL(5,2),
  `weight_kg` DECIMAL(5,2),
  `blood_group` VARCHAR(10),
  `join_date` DATE NOT NULL,
  `status` ENUM('active', 'injured', 'suspended', 'inactive') DEFAULT 'active',
  `statistics` JSON,
  `medical_clearance` BOOLEAN DEFAULT FALSE,
  `parent_consent` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  INDEX idx_team_student (`team_id`, `student_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `matches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `home_team_id` INT NOT NULL,
  `away_team_id` INT NOT NULL,
  `tournament_id` INT,
  `match_date` DATETIME NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `home_score` INT DEFAULT 0,
  `away_score` INT DEFAULT 0,
  `status` ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed') DEFAULT 'scheduled',
  `match_type` ENUM('friendly', 'league', 'tournament', 'championship') DEFAULT 'friendly',
  `referee` VARCHAR(255),
  `attendance` INT DEFAULT 0,
  `highlights` TEXT,
  `statistics` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`home_team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`away_team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  INDEX idx_match_date (`match_date`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tournaments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `sport_type` VARCHAR(100) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `location` VARCHAR(255),
  `organizer` VARCHAR(255),
  `description` TEXT,
  `prize_pool` DECIMAL(12,2),
  `status` ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  `participants_count` INT DEFAULT 0,
  `rules` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dates (`start_date`, `end_date`),
  INDEX idx_sport_type (`sport_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Testimonials System
-- ============================================================

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `author_name` VARCHAR(255) NOT NULL,
  `author_role` VARCHAR(255),
  `author_company` VARCHAR(255),
  `author_image` VARCHAR(500),
  `content` TEXT NOT NULL,
  `rating` TINYINT DEFAULT 5,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `display_order` INT DEFAULT 0,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `submitted_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_date` TIMESTAMP NULL,
  `approved_by` INT,
  `category` VARCHAR(100),
  `tags` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (`status`),
  INDEX idx_featured (`is_featured`),
  INDEX idx_rating (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exam Scheduling System
-- ============================================================

CREATE TABLE IF NOT EXISTS `exam_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_name` VARCHAR(255) NOT NULL,
  `exam_type` ENUM('quiz', 'mid_term', 'final', 'practical', 'assessment') NOT NULL,
  `subject_id` INT,
  `class_id` INT,
  `trade_level_id` INT,
  `exam_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `duration_minutes` INT NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `invigilator_id` INT,
  `total_marks` INT DEFAULT 100,
  `passing_marks` INT DEFAULT 50,
  `instructions` TEXT,
  `status` ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_exam_date (`exam_date`),
  INDEX idx_status (`status`),
  INDEX idx_subject_class (`subject_id`, `class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cafeteria Management System
-- ============================================================

CREATE TABLE IF NOT EXISTS `cafeteria_menu` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_name` VARCHAR(255) NOT NULL,
  `category` ENUM('breakfast', 'lunch', 'dinner', 'snacks', 'beverages') NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `cost_price` DECIMAL(10,2),
  `image_url` VARCHAR(500),
  `ingredients` JSON,
  `allergens` JSON,
  `nutritional_info` JSON,
  `is_available` BOOLEAN DEFAULT TRUE,
  `is_vegetarian` BOOLEAN DEFAULT FALSE,
  `is_halal` BOOLEAN DEFAULT TRUE,
  `preparation_time_minutes` INT,
  `serving_size` VARCHAR(100),
  `stock_quantity` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (`category`),
  INDEX idx_available (`is_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cafeteria_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `student_id` INT NOT NULL,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('cash', 'card', 'mobile_money', 'account') DEFAULT 'cash',
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `order_status` ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending',
  `items` JSON NOT NULL,
  `special_instructions` TEXT,
  `served_by` INT,
  `served_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (`student_id`),
  INDEX idx_order_date (`order_date`),
  INDEX idx_status (`order_status`, `payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge Base System
-- ============================================================

CREATE TABLE IF NOT EXISTS `knowledge_base_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(100),
  `parent_id` INT,
  `display_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `knowledge_base_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `knowledge_base_articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) UNIQUE NOT NULL,
  `content` LONGTEXT NOT NULL,
  `excerpt` TEXT,
  `author_id` INT,
  `featured_image` VARCHAR(500),
  `tags` JSON,
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `views_count` INT DEFAULT 0,
  `helpful_count` INT DEFAULT 0,
  `not_helpful_count` INT DEFAULT 0,
  `search_keywords` TEXT,
  `meta_description` TEXT,
  `published_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `knowledge_base_categories`(`id`) ON DELETE CASCADE,
  INDEX idx_status (`status`),
  INDEX idx_category (`category_id`),
  FULLTEXT idx_search (`title`, `content`, `search_keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forums System
-- ============================================================

CREATE TABLE IF NOT EXISTS `forum_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(100),
  `display_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_topics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) UNIQUE NOT NULL,
  `content` TEXT NOT NULL,
  `author_id` INT NOT NULL,
  `is_pinned` BOOLEAN DEFAULT FALSE,
  `is_locked` BOOLEAN DEFAULT FALSE,
  `is_solved` BOOLEAN DEFAULT FALSE,
  `views_count` INT DEFAULT 0,
  `replies_count` INT DEFAULT 0,
  `last_reply_at` TIMESTAMP NULL,
  `last_reply_by` INT,
  `tags` JSON,
  `status` ENUM('active', 'closed', 'archived') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `forum_categories`(`id`) ON DELETE CASCADE,
  INDEX idx_category (`category_id`),
  INDEX idx_author (`author_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_replies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `topic_id` INT NOT NULL,
  `parent_id` INT,
  `content` TEXT NOT NULL,
  `author_id` INT NOT NULL,
  `is_solution` BOOLEAN DEFAULT FALSE,
  `upvotes` INT DEFAULT 0,
  `downvotes` INT DEFAULT 0,
  `is_edited` BOOLEAN DEFAULT FALSE,
  `edited_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`topic_id`) REFERENCES `forum_topics`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `forum_replies`(`id`) ON DELETE CASCADE,
  INDEX idx_topic (`topic_id`),
  INDEX idx_author (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clubs Management System
-- ============================================================

CREATE TABLE IF NOT EXISTS `clubs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `logo_url` VARCHAR(500),
  `banner_url` VARCHAR(500),
  `patron_id` INT,
  `president_id` INT,
  `vice_president_id` INT,
  `secretary_id` INT,
  `meeting_day` VARCHAR(50),
  `meeting_time` TIME,
  `meeting_venue` VARCHAR(255),
  `members_count` INT DEFAULT 0,
  `max_members` INT,
  `annual_fee` DECIMAL(10,2) DEFAULT 0,
  `objectives` JSON,
  `achievements` JSON,
  `upcoming_events` JSON,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `founded_date` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (`status`),
  INDEX idx_category (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `club_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `club_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `role` VARCHAR(100) DEFAULT 'member',
  `join_date` DATE NOT NULL,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `fee_paid` BOOLEAN DEFAULT FALSE,
  `contribution` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE CASCADE,
  UNIQUE KEY unique_club_student (`club_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Certificates System
-- ============================================================

CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `certificate_number` VARCHAR(100) UNIQUE NOT NULL,
  `student_id` INT NOT NULL,
  `certificate_type` ENUM('completion', 'achievement', 'participation', 'excellence', 'graduation') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `issued_date` DATE NOT NULL,
  `issued_by` INT,
  `course_name` VARCHAR(255),
  `grade` VARCHAR(50),
  `duration` VARCHAR(100),
  `skills_acquired` JSON,
  `template_id` INT,
  `file_url` VARCHAR(500),
  `qr_code` VARCHAR(500),
  `verification_code` VARCHAR(100) UNIQUE,
  `is_verified` BOOLEAN DEFAULT TRUE,
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (`student_id`),
  INDEX idx_type (`certificate_type`),
  INDEX idx_verification (`verification_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alumni System
-- ============================================================

CREATE TABLE IF NOT EXISTS `alumni` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT,
  `alumni_id` VARCHAR(100) UNIQUE NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `phone` VARCHAR(20),
  `graduation_year` INT NOT NULL,
  `trade_name` VARCHAR(255),
  `class_name` VARCHAR(255),
  `current_occupation` VARCHAR(255),
  `current_employer` VARCHAR(255),
  `current_position` VARCHAR(255),
  `linkedin_url` VARCHAR(500),
  `address` TEXT,
  `city` VARCHAR(100),
  `country` VARCHAR(100) DEFAULT 'Rwanda',
  `profile_picture` VARCHAR(500),
  `bio` TEXT,
  `achievements` JSON,
  `willing_to_mentor` BOOLEAN DEFAULT FALSE,
  `expertise_areas` JSON,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `status` ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_graduation_year (`graduation_year`),
  INDEX idx_email (`email`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admissions System (for apply endpoint)
-- ============================================================

CREATE TABLE IF NOT EXISTS `admissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_number` VARCHAR(100) UNIQUE NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL,
  `email` VARCHAR(255),
  `phone` VARCHAR(20) NOT NULL,
  `parent_phone` VARCHAR(20),
  `parent_email` VARCHAR(255),
  `address` TEXT,
  `previous_school` VARCHAR(255),
  `previous_grade` VARCHAR(50),
  `desired_trade` VARCHAR(255) NOT NULL,
  `desired_level` VARCHAR(100),
  `academic_year` VARCHAR(50) NOT NULL,
  `documents` JSON,
  `transcript_url` VARCHAR(500),
  `id_card_url` VARCHAR(500),
  `photo_url` VARCHAR(500),
  `application_status` ENUM('submitted', 'under_review', 'approved', 'rejected', 'enrolled') DEFAULT 'submitted',
  `payment_status` ENUM('pending', 'partial', 'full') DEFAULT 'pending',
  `interview_date` DATETIME,
  `interview_notes` TEXT,
  `rejection_reason` TEXT,
  `reviewed_by` INT,
  `reviewed_at` TIMESTAMP NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_application_number (`application_number`),
  INDEX idx_status (`application_status`),
  INDEX idx_academic_year (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT SAMPLE DATA FOR TESTING
-- ============================================================

-- Sample forum categories
INSERT IGNORE INTO `forum_categories` (`name`, `slug`, `description`, `display_order`) VALUES
('General Discussion', 'general', 'General school-related discussions', 1),
('Academic Help', 'academic-help', 'Get help with your studies', 2),
('Technical Support', 'tech-support', 'Technical and IT support', 3),
('Announcements', 'announcements', 'Official school announcements', 4);

-- Sample knowledge base categories
INSERT IGNORE INTO `knowledge_base_categories` (`name`, `slug`, `description`, `icon`, `display_order`) VALUES
('Getting Started', 'getting-started', 'New student orientation', 'book-open', 1),
('Academic Policies', 'academic-policies', 'School academic policies and procedures', 'file-text', 2),
('Student Life', 'student-life', 'Student life and activities', 'users', 3),
('FAQs', 'faqs', 'Frequently asked questions', 'help-circle', 4);

-- Sample cafeteria menu items
INSERT IGNORE INTO `cafeteria_menu` (`item_name`, `category`, `description`, `price`, `is_available`) VALUES
('Breakfast Combo', 'breakfast', 'Eggs, bread, and tea', 1500.00, TRUE),
('Rice and Beans', 'lunch', 'Traditional Rwandan meal', 2000.00, TRUE),
('Chapati and Beef', 'lunch', 'Chapati with beef stew', 2500.00, TRUE),
('Fruit Juice', 'beverages', 'Fresh fruit juice', 500.00, TRUE),
('Samosa', 'snacks', 'Vegetable samosa', 300.00, TRUE);

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================

-- Add indexes to improve query performance
ALTER TABLE `teams` ADD INDEX idx_created_at (`created_at`);
ALTER TABLE `matches` ADD INDEX idx_teams (`home_team_id`, `away_team_id`);
ALTER TABLE `cafeteria_orders` ADD INDEX idx_order_number (`order_number`);
ALTER TABLE `certificates` ADD INDEX idx_issued_date (`issued_date`);
ALTER TABLE `alumni` ADD INDEX idx_name (`first_name`, `last_name`);

-- ============================================================
-- COMPLETED
-- ============================================================

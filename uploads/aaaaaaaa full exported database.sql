-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: school_management
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `about_content`
--

DROP TABLE IF EXISTS `about_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `about_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_title` varchar(255) DEFAULT NULL,
  `main_title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `statistics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`statistics`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_content`
--

LOCK TABLES `about_content` WRITE;
/*!40000 ALTER TABLE `about_content` DISABLE KEYS */;
INSERT INTO `about_content` VALUES (1,'About Our Institution','POWERFUL SCHOOL MANAGEMENT SYSTEM','Excellence in Education','We are committed to providing world-class technical education that prepares students for successful careers in today\'s competitive job market. Our modern facilities and expert instructors ensure the highest quality learning experience.',NULL,'[\"Modern Facilities\", \"Expert Instructors\", \"Industry Partnerships\", \"Hands-on Learning\", \"Career Support\", \"International Standards\"]','{\"students\": 1248, \"programs\": 3, \"teachers\": 65, \"partners\": 65}',1,'2026-01-22 06:58:35','2026-01-22 06:58:35');
/*!40000 ALTER TABLE `about_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_calendar`
--

DROP TABLE IF EXISTS `academic_calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_calendar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_calendar`
--

LOCK TABLES `academic_calendar` WRITE;
/*!40000 ALTER TABLE `academic_calendar` DISABLE KEYS */;
/*!40000 ALTER TABLE `academic_calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_performance`
--

DROP TABLE IF EXISTS `academic_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_performance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `subject` varchar(100) NOT NULL,
  `exam_type` enum('quiz','midterm','final','practical') NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `academic_performance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `academic_performance_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_performance`
--

LOCK TABLES `academic_performance` WRITE;
/*!40000 ALTER TABLE `academic_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `academic_performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_progress`
--

DROP TABLE IF EXISTS `academic_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `term` enum('term1','term2','term3') NOT NULL,
  `academic_year` varchar(10) NOT NULL,
  `marks` decimal(5,2) DEFAULT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `rank_in_class` int(11) DEFAULT NULL,
  `teacher_comment_rw` text DEFAULT NULL,
  `teacher_comment_en` text DEFAULT NULL,
  `advisor_comment_rw` text DEFAULT NULL,
  `advisor_comment_en` text DEFAULT NULL,
  `strengths_rw` text DEFAULT NULL,
  `strengths_en` text DEFAULT NULL,
  `areas_improvement_rw` text DEFAULT NULL,
  `areas_improvement_en` text DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `parent_signature` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_progress`
--

LOCK TABLES `academic_progress` WRITE;
/*!40000 ALTER TABLE `academic_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `academic_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_years`
--

DROP TABLE IF EXISTS `academic_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_years` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_years`
--

LOCK TABLES `academic_years` WRITE;
/*!40000 ALTER TABLE `academic_years` DISABLE KEYS */;
INSERT INTO `academic_years` VALUES (1,'2025-2026','2025-09-01','2026-06-30',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(2,'2024-2025','2024-09-01','2025-06-30',1,'2026-01-26 09:20:11','2026-01-26 09:20:11'),(3,'2025-2026','2025-09-01','2026-06-30',0,'2026-01-26 09:20:11','2026-01-26 09:20:11'),(4,'2025-2026','2025-09-01','2026-06-30',1,'2026-01-27 14:17:48','2026-01-27 14:17:48'),(5,'2025-2026','2025-09-01','2026-06-30',1,'2026-01-27 14:23:18','2026-01-27 14:23:18');
/*!40000 ALTER TABLE `academic_years` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievement_badges`
--

DROP TABLE IF EXISTS `achievement_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `achievement_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `badge_name` varchar(100) NOT NULL,
  `badge_description` text DEFAULT NULL,
  `badge_icon` varchar(255) DEFAULT NULL,
  `badge_category` enum('academic','participation','collaboration','consistency','excellence','special') NOT NULL,
  `points_value` int(11) DEFAULT 0,
  `rarity` enum('common','uncommon','rare','epic','legendary') DEFAULT 'common',
  `unlock_criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`unlock_criteria`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievement_badges`
--

LOCK TABLES `achievement_badges` WRITE;
/*!40000 ALTER TABLE `achievement_badges` DISABLE KEYS */;
INSERT INTO `achievement_badges` VALUES (1,'First Assignment','Complete your first assignment',NULL,'academic',10,'common','{}',1,'2026-01-22 09:03:58'),(2,'Quiz Master','Complete 20 quizzes',NULL,'academic',50,'rare','{}',1,'2026-01-22 09:03:58'),(3,'Point Collector','Earn 1000 points',NULL,'excellence',100,'epic','{}',1,'2026-01-22 09:03:58'),(4,'Consistent Learner','Active for 30 days',NULL,'consistency',75,'rare','{}',1,'2026-01-22 09:03:58');
/*!40000 ALTER TABLE `achievement_badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `year` varchar(4) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'Ishuri ry\'Umwaka','Twatoranijwe nk\'ishuri ry\'umwaka mu mahugurwa y\'ubuhanga','2025',NULL,1,1,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(2,'Igihembo cya Mbere - Siporo','Abanyeshuri bacu batsinze igihembo cya mbere mu mikino y\'ishuri','2025',NULL,1,2,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(3,'Ubuhanga bw\'Ikoranabuhanga','Ikipe yacu yatsinze amahugurwa y\'igihugu y\'ubuhanga bw\'ikoranabuhanga','2024',NULL,1,3,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(4,'Ubufatanye Mpuzamahanga','Twashyizeho ubufatanye n\'amashuri menshi mu mahanga','2024',NULL,1,4,'2026-01-27 07:48:18','2026-01-27 07:48:18');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `action_description` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_content_access_log`
--

DROP TABLE IF EXISTS `admin_content_access_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_content_access_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `admin_name` varchar(200) DEFAULT NULL,
  `page_name` varchar(100) DEFAULT NULL,
  `section_name` varchar(100) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `old_content` text DEFAULT NULL,
  `new_content` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_admin` (`admin_id`),
  KEY `idx_page` (`page_name`),
  KEY `idx_action` (`action`),
  KEY `idx_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_content_access_log`
--

LOCK TABLES `admin_content_access_log` WRITE;
/*!40000 ALTER TABLE `admin_content_access_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_content_access_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_page_content`
--

DROP TABLE IF EXISTS `admin_page_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_page_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_name` varchar(100) NOT NULL,
  `section_name` varchar(100) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `content_text` text DEFAULT NULL,
  `content_html` longtext DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `background_color` varchar(50) DEFAULT NULL,
  `text_color` varchar(50) DEFAULT NULL,
  `font_size` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_page_section` (`page_name`,`section_name`),
  KEY `idx_page_name` (`page_name`),
  KEY `idx_section_name` (`section_name`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_page_content`
--

LOCK TABLES `admin_page_content` WRITE;
/*!40000 ALTER TABLE `admin_page_content` DISABLE KEYS */;
INSERT INTO `admin_page_content` VALUES (1,'dashboard','welcome_message','Welcome Message',NULL,'Welcome to the School Management System',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(2,'dashboard','stats_header','Statistics Header',NULL,'School Overview',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(3,'dashboard','quick_actions','Quick Actions',NULL,'Quick Access Tools',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(4,'staff-management','page_title','Staff Management',NULL,'Manage Staff Performance and Data',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(5,'staff-management','description','Page Description',NULL,'Comprehensive staff management with role-based access',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(6,'staff-management','features_header','Features Header',NULL,'Staff Management Features',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(7,'student-sheets','page_title','Student Management',NULL,'Global Student Data Management',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(8,'student-sheets','description','Page Description',NULL,'Manage student data with auto-calculations and role-based permissions',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(9,'student-sheets','role_info','Role Information',NULL,'Role-based access for different staff members',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(10,'headmaster-dashboard','welcome','Welcome Message',NULL,'Welcome, Headmaster',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(11,'headmaster-dashboard','overview','School Overview',NULL,'Complete school management and oversight',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(12,'headmaster-dashboard','key_metrics','Key Metrics',NULL,'Important school performance indicators',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(13,'teacher-dashboard','welcome','Welcome Message',NULL,'Welcome, Teacher',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(14,'teacher-dashboard','classes','My Classes',NULL,'Manage your classes and students',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(15,'teacher-dashboard','grades','Grade Management',NULL,'Enter and manage student grades',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(16,'accountant-dashboard','welcome','Welcome Message',NULL,'Welcome, Accountant',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(17,'accountant-dashboard','finances','Financial Overview',NULL,'School financial management',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(18,'accountant-dashboard','payments','Payment Tracking',NULL,'Track student payments and fees',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(19,'dos-dashboard','welcome','Welcome Message',NULL,'Welcome, Director of Studies',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(20,'dos-dashboard','academics','Academic Oversight',NULL,'Monitor academic performance',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(21,'dos-dashboard','curriculum','Curriculum Management',NULL,'Manage academic programs',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(22,'dod-dashboard','welcome','Welcome Message',NULL,'Welcome, Director of Discipline',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(23,'dod-dashboard','discipline','Discipline Management',NULL,'Monitor student behavior and conduct',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(24,'dod-dashboard','incidents','Incident Tracking',NULL,'Track and manage discipline incidents',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(25,'admin-dashboard','welcome','Welcome Message',NULL,'Welcome, Administrator',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(26,'admin-dashboard','system','System Management',NULL,'Complete system administration',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(27,'admin-dashboard','content','Content Management',NULL,'Manage all page content and images',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(28,'login','title','Login',NULL,'School Management System Login',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(29,'login','subtitle','Login Subtitle',NULL,'Access your dashboard',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(30,'login','welcome_text','Welcome Text',NULL,'Welcome back! Please sign in to continue.',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(31,'home','hero_title','School Name',NULL,'Powerful School Management System',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(32,'home','hero_subtitle','Hero Subtitle',NULL,'Excellence in Education Management',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(33,'home','about_section','About Section',NULL,'Leading educational institution committed to excellence',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(34,'about','page_title','About Us',NULL,'About Our School',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(35,'about','mission','Our Mission',NULL,'To provide quality education and shape future leaders',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(36,'about','vision','Our Vision',NULL,'To be a center of excellence in education',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(37,'contact','page_title','Contact Us',NULL,'Get in Touch',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(38,'contact','address','School Address',NULL,'School Address Information',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(39,'contact','phone','Phone Number',NULL,'Contact Phone Number',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(40,'news','page_title','News & Updates',NULL,'Latest School News',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(41,'news','featured','Featured News',NULL,'Important announcements and updates',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(42,'gallery','page_title','Photo Gallery',NULL,'School Photo Gallery',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(43,'gallery','description','Gallery Description',NULL,'Explore our school life through photos',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(44,'trades','page_title','Trade Programs',NULL,'Technical and Vocational Programs',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(45,'trades','description','Programs Description',NULL,'Comprehensive technical education programs',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(46,'sports','page_title','Sports & Athletics',NULL,'School Sports Programs',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(47,'sports','description','Sports Description',NULL,'Promoting physical fitness and teamwork',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(48,'leadership','page_title','School Leadership',NULL,'Our Leadership Team',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10'),(49,'leadership','description','Leadership Description',NULL,'Meet our dedicated leadership team',NULL,NULL,NULL,NULL,NULL,1,0,'2026-02-10 04:40:10','2026-02-10 04:40:10');
/*!40000 ALTER TABLE `admin_page_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','admin@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','admin','+250788100001',1,'2026-02-10 07:32:54','2026-01-22 06:59:45','2026-02-10 07:32:54','System','Administrator',NULL),(2,'reponse','reponse@gmail.com','$2a$10$jC8XoiMnnUo51tfGx8Qze.GU/ORp.vcuumEsf57I5s28c5s2o2I8C','admin',NULL,1,'2026-01-22 07:01:13','2026-01-22 07:00:00','2026-01-22 07:01:13','System','Administrator',NULL),(3,'admin_main','reponsekdz06@gmail.com','$2a$10$56ZV1aaHpzMEwd055ueKvOVQ./.FvXxE1f1MVnjFtRtWY.ZOLfN6q','admin',NULL,1,'2026-01-22 07:02:23','2026-01-22 07:00:45','2026-01-22 07:02:23',NULL,NULL,NULL),(7,'headmaster','headmaster@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','headmaster','+250788100002',1,'2026-02-10 07:29:01','2026-01-26 10:15:53','2026-02-10 07:29:01','Head','Master',NULL),(8,'teacher1','teacher1@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','teacher',NULL,1,'2026-02-10 07:24:54','2026-01-26 10:15:53','2026-02-10 07:24:54','John','Doe',NULL),(9,'accountant','accountant@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','accountant','+250788100005',1,'2026-02-10 07:30:27','2026-01-26 10:15:53','2026-02-10 07:30:27','School','Accountant',NULL),(10,'dod','dod@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','director_discipline','+250788100004',1,'2026-02-10 07:25:49','2026-01-26 10:15:53','2026-02-10 07:25:49','Director of','Discipline',NULL),(13,'dos','dos@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','director_study','+250788100003',1,'2026-02-10 07:26:50','2026-01-27 14:17:13','2026-02-10 07:26:50','Director of','Studies',NULL),(35,'stockmanager','stockmanager@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','stock_manager','+250788100006',1,'2026-02-10 10:30:47','2026-01-27 14:24:17','2026-02-10 10:30:47','Stock','Manager',NULL),(36,'patron','patron@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','patron','+250788100007',1,NULL,'2026-01-27 14:24:17','2026-01-28 13:45:29','School','Patron',NULL),(37,'advisor','advisor@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','advisor','+250788100008',1,'2026-02-10 07:27:59','2026-01-27 14:24:17','2026-02-10 07:27:59','School','Advisor',NULL),(38,'superadmin','superadmin@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','super_admin',NULL,1,NULL,'2026-01-28 13:21:54','2026-01-28 13:45:29','Super','Administrator',NULL),(39,'teacher2','teacher2@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','teacher',NULL,1,'2026-01-28 14:46:38','2026-01-28 13:21:54','2026-01-28 14:46:38','Mary','Smith',NULL),(40,'teacher3','teacher3@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','teacher',NULL,1,NULL,'2026-01-28 13:21:54','2026-01-28 13:45:29','James','Wilson',NULL),(41,'teacher4','teacher4@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','teacher',NULL,1,NULL,'2026-01-28 13:39:08','2026-01-28 13:45:29','Sarah','Johnson',NULL),(42,'teacher5','teacher5@reponsekdz06.com','$2a$10$mgx5yAVop9S12DKoDhIQMOIQMif3tMJ7U1txkIruW.pRJsAiHvySq','teacher',NULL,1,NULL,'2026-01-28 13:39:08','2026-01-28 13:45:29','David','Brown',NULL);
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admission_applications`
--

DROP TABLE IF EXISTS `admission_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admission_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `application_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `previous_education` text DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `status` enum('pending','under_review','approved','rejected','waitlisted') DEFAULT 'pending',
  `application_date` date NOT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_number` (`application_number`),
  KEY `session_id` (`session_id`),
  KEY `course_id` (`course_id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_status` (`status`),
  KEY `idx_email` (`email`),
  CONSTRAINT `admission_applications_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `admissions_sessions` (`id`),
  CONSTRAINT `admission_applications_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `admission_applications_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_applications`
--

LOCK TABLES `admission_applications` WRITE;
/*!40000 ALTER TABLE `admission_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `admission_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admission_comments`
--

DROP TABLE IF EXISTS `admission_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admission_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `admission_comments_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_comments`
--

LOCK TABLES `admission_comments` WRITE;
/*!40000 ALTER TABLE `admission_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `admission_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admission_interviews`
--

DROP TABLE IF EXISTS `admission_interviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admission_interviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `interview_date` date NOT NULL,
  `interview_time` time NOT NULL,
  `interviewer_id` int(11) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `admission_interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_interviews`
--

LOCK TABLES `admission_interviews` WRITE;
/*!40000 ALTER TABLE `admission_interviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `admission_interviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admission_workflow`
--

DROP TABLE IF EXISTS `admission_workflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admission_workflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `stage` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `reviewer_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `admission_workflow_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_workflow`
--

LOCK TABLES `admission_workflow` WRITE;
/*!40000 ALTER TABLE `admission_workflow` DISABLE KEYS */;
/*!40000 ALTER TABLE `admission_workflow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admissions`
--

DROP TABLE IF EXISTS `admissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_number` varchar(100) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `parent_phone` varchar(20) DEFAULT NULL,
  `parent_email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `previous_school` varchar(255) DEFAULT NULL,
  `previous_grade` varchar(50) DEFAULT NULL,
  `desired_trade` varchar(255) NOT NULL,
  `desired_level` varchar(100) DEFAULT NULL,
  `academic_year` varchar(50) NOT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `transcript_url` varchar(500) DEFAULT NULL,
  `id_card_url` varchar(500) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `application_status` enum('submitted','under_review','approved','rejected','enrolled') DEFAULT 'submitted',
  `payment_status` enum('pending','partial','full') DEFAULT 'pending',
  `interview_date` datetime DEFAULT NULL,
  `interview_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_number` (`application_number`),
  KEY `idx_application_number` (`application_number`),
  KEY `idx_status` (`application_status`),
  KEY `idx_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admissions`
--

LOCK TABLES `admissions` WRITE;
/*!40000 ALTER TABLE `admissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admissions_sessions`
--

DROP TABLE IF EXISTS `admissions_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admissions_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_name` varchar(100) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('upcoming','open','closed','cancelled') DEFAULT 'upcoming',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `academic_year_id` (`academic_year_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `admissions_sessions_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admissions_sessions`
--

LOCK TABLES `admissions_sessions` WRITE;
/*!40000 ALTER TABLE `admissions_sessions` DISABLE KEYS */;
INSERT INTO `admissions_sessions` VALUES (1,'2026-2027 Intake',1,'2026-05-01','2026-08-31','upcoming',NULL,'2026-01-24 05:02:47','2026-01-24 05:02:47');
/*!40000 ALTER TABLE `admissions_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `advisor_tasks`
--

DROP TABLE IF EXISTS `advisor_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `advisor_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `advisor_id` int(11) NOT NULL,
  `task_type` enum('call','meeting','report','follow_up','visit','other') NOT NULL,
  `title_rw` varchar(200) NOT NULL,
  `title_en` varchar(200) DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `due_date` datetime NOT NULL,
  `related_student_id` int(11) DEFAULT NULL,
  `related_parent_id` int(11) DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `completion_date` datetime DEFAULT NULL,
  `notes_rw` text DEFAULT NULL,
  `notes_en` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advisor_tasks`
--

LOCK TABLES `advisor_tasks` WRITE;
/*!40000 ALTER TABLE `advisor_tasks` DISABLE KEYS */;
INSERT INTO `advisor_tasks` VALUES (1,1,'call','Hamagara Ababyeyi ba Abanyeshuri Bafite Ibibazo','Call Parents of Students with Issues','Hamagara ababyeyi 5 bafite abana bafite ibibazo byo kwiga','Call 5 parents whose children have academic issues','high','2026-01-24 00:37:45',NULL,NULL,'pending',NULL,NULL,NULL,'2026-01-23 10:37:45'),(2,1,'meeting','Inama y\'Ababyeyi','Parents Meeting','Gutegura inama rusange y\'ababyeyi ku wa 15','Prepare general parents meeting on the 15th','medium','2026-01-30 00:37:45',NULL,NULL,'pending',NULL,NULL,NULL,'2026-01-23 10:37:45'),(3,1,'report','Raporo y\'Igihembwe','Term Report','Gukora raporo y\'imikorere y\'abanyeshuri muri iki gihembwe','Prepare student performance report for this term','high','2026-01-26 00:37:45',NULL,NULL,'in_progress',NULL,NULL,NULL,'2026-01-23 10:37:45'),(4,1,'visit','Gusura Imiryango','Home Visits','Gusura imiryango 3 y\'abanyeshuri bafite ibibazo','Visit 3 families of students with issues','urgent','2026-01-25 00:37:45',NULL,NULL,'pending',NULL,NULL,NULL,'2026-01-23 10:37:45');
/*!40000 ALTER TABLE `advisor_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_grading_models`
--

DROP TABLE IF EXISTS `ai_grading_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ai_grading_models` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model_name` varchar(100) NOT NULL,
  `model_type` enum('essay','code','math','general') NOT NULL,
  `version` varchar(20) NOT NULL,
  `accuracy_score` decimal(5,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_grading_models`
--

LOCK TABLES `ai_grading_models` WRITE;
/*!40000 ALTER TABLE `ai_grading_models` DISABLE KEYS */;
INSERT INTO `ai_grading_models` VALUES (1,'Essay Grader v1','essay','1.0',85.50,1,'2026-01-22 09:03:58');
/*!40000 ALTER TABLE `ai_grading_models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_grading_results`
--

DROP TABLE IF EXISTS `ai_grading_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ai_grading_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `submission_type` enum('assignment','quiz','homework') NOT NULL,
  `model_id` int(11) NOT NULL,
  `ai_score` decimal(5,2) DEFAULT NULL,
  `confidence_level` decimal(5,2) DEFAULT NULL,
  `detailed_feedback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detailed_feedback`)),
  `strengths` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`strengths`)),
  `weaknesses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`weaknesses`)),
  `improvement_suggestions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`improvement_suggestions`)),
  `grammar_score` decimal(5,2) DEFAULT NULL,
  `coherence_score` decimal(5,2) DEFAULT NULL,
  `creativity_score` decimal(5,2) DEFAULT NULL,
  `processed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assignment_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `model_id` (`model_id`),
  CONSTRAINT `ai_grading_results_ibfk_1` FOREIGN KEY (`model_id`) REFERENCES `ai_grading_models` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_grading_results`
--

LOCK TABLES `ai_grading_results` WRITE;
/*!40000 ALTER TABLE `ai_grading_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_grading_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni`
--

DROP TABLE IF EXISTS `alumni`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumni` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `graduation_year` int(11) NOT NULL,
  `current_occupation` varchar(200) DEFAULT NULL,
  `company` varchar(200) DEFAULT NULL,
  `position` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `achievements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`achievements`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `idx_graduation` (`graduation_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni`
--

LOCK TABLES `alumni` WRITE;
/*!40000 ALTER TABLE `alumni` DISABLE KEYS */;
/*!40000 ALTER TABLE `alumni` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni_data`
--

DROP TABLE IF EXISTS `alumni_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumni_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `graduation_year` int(11) DEFAULT NULL,
  `current_status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni_data`
--

LOCK TABLES `alumni_data` WRITE;
/*!40000 ALTER TABLE `alumni_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `alumni_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni_event_registrations`
--

DROP TABLE IF EXISTS `alumni_event_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumni_event_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `alumni_id` int(11) NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`event_id`,`alumni_id`),
  CONSTRAINT `alumni_event_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `alumni_events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni_event_registrations`
--

LOCK TABLES `alumni_event_registrations` WRITE;
/*!40000 ALTER TABLE `alumni_event_registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `alumni_event_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni_events`
--

DROP TABLE IF EXISTS `alumni_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumni_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `organizer_id` int(11) DEFAULT NULL,
  `max_attendees` int(11) DEFAULT NULL,
  `status` enum('upcoming','completed','cancelled') DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni_events`
--

LOCK TABLES `alumni_events` WRITE;
/*!40000 ALTER TABLE `alumni_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `alumni_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni_jobs`
--

DROP TABLE IF EXISTS `alumni_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumni_jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `company` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `posted_by` int(11) DEFAULT NULL,
  `application_url` varchar(255) DEFAULT NULL,
  `status` enum('active','closed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni_jobs`
--

LOCK TABLES `alumni_jobs` WRITE;
/*!40000 ALTER TABLE `alumni_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `alumni_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcement_attachments`
--

DROP TABLE IF EXISTS `announcement_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcement_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_id` int(11) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `announcement_id` (`announcement_id`),
  CONSTRAINT `announcement_attachments_ibfk_1` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement_attachments`
--

LOCK TABLES `announcement_attachments` WRITE;
/*!40000 ALTER TABLE `announcement_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcement_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `target_audience` enum('all','students','teachers','parents','staff') DEFAULT 'all',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `published_by` int(11) NOT NULL,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','published','expired','archived') DEFAULT 'draft',
  `attachment_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `published_by` (`published_by`),
  KEY `idx_target_audience` (`target_audience`),
  KEY `idx_priority` (`priority`),
  KEY `idx_status` (`status`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`published_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_activity_log`
--

DROP TABLE IF EXISTS `application_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  CONSTRAINT `application_activity_log_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_activity_log`
--

LOCK TABLES `application_activity_log` WRITE;
/*!40000 ALTER TABLE `application_activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_analytics`
--

DROP TABLE IF EXISTS `application_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `total_applications` int(11) DEFAULT 0,
  `pending_applications` int(11) DEFAULT 0,
  `under_review_applications` int(11) DEFAULT 0,
  `approved_applications` int(11) DEFAULT 0,
  `rejected_applications` int(11) DEFAULT 0,
  `waitlisted_applications` int(11) DEFAULT 0,
  `enrolled_applications` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_analytics`
--

LOCK TABLES `application_analytics` WRITE;
/*!40000 ALTER TABLE `application_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_documents`
--

DROP TABLE IF EXISTS `application_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `document_type` enum('birth_certificate','school_certificate','id_card','photo','other') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` text NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  CONSTRAINT `application_documents_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_documents`
--

LOCK TABLES `application_documents` WRITE;
/*!40000 ALTER TABLE `application_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_notifications`
--

DROP TABLE IF EXISTS `application_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `notification_type` enum('submission','status_change','approval','rejection','reminder') NOT NULL,
  `recipient_phone` varchar(20) DEFAULT NULL,
  `recipient_email` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('pending','sent','failed','delivered') DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `retry_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_status` (`status`),
  KEY `idx_notification_type` (`notification_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_notifications`
--

LOCK TABLES `application_notifications` WRITE;
/*!40000 ALTER TABLE `application_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_reviews`
--

DROP TABLE IF EXISTS `application_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `review_text` text NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_reviewer_id` (`reviewer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_reviews`
--

LOCK TABLES `application_reviews` WRITE;
/*!40000 ALTER TABLE `application_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_status_history`
--

DROP TABLE IF EXISTS `application_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_status_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `change_reason` text DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_changed_at` (`changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_status_history`
--

LOCK TABLES `application_status_history` WRITE;
/*!40000 ALTER TABLE `application_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_validation_rules`
--

DROP TABLE IF EXISTS `application_validation_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_validation_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `field_name` varchar(100) NOT NULL,
  `rule_type` varchar(50) NOT NULL,
  `rule_value` text DEFAULT NULL,
  `error_message_en` text DEFAULT NULL,
  `error_message_rw` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_validation_rules`
--

LOCK TABLES `application_validation_rules` WRITE;
/*!40000 ALTER TABLE `application_validation_rules` DISABLE KEYS */;
INSERT INTO `application_validation_rules` VALUES (1,'phone','pattern','^(\\+250|0)[7][0-9]{8}$','Invalid phone number format','Numero ya telefoni ntiyemewe',1,'2026-02-10 05:17:43','2026-02-10 05:17:43'),(2,'email','pattern','^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$','Invalid email format','Imeri ntiyemewe',1,'2026-02-10 05:17:43','2026-02-10 05:17:43'),(3,'national_id','length','16','National ID must be 16 digits','Indangamuntu igomba kuba imibare 16',1,'2026-02-10 05:17:43','2026-02-10 05:17:43'),(4,'age','range','14-35','Age must be between 14 and 35','Imyaka igomba kuba hagati ya 14 na 35',1,'2026-02-10 05:17:43','2026-02-10 05:17:43');
/*!40000 ALTER TABLE `application_validation_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_ratings`
--

DROP TABLE IF EXISTS `article_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `article_ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(4) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `feedback` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_rating` (`article_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `article_ratings_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `knowledge_base` (`id`) ON DELETE CASCADE,
  CONSTRAINT `article_ratings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_ratings`
--

LOCK TABLES `article_ratings` WRITE;
/*!40000 ALTER TABLE `article_ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `article_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessment_results`
--

DROP TABLE IF EXISTS `assessment_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assessment_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assessment_id` int(11) NOT NULL,
  `enrollment_id` int(11) NOT NULL,
  `attempt_number` int(11) DEFAULT 1,
  `score` decimal(6,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT 0,
  `time_spent_minutes` int(11) DEFAULT 0,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answers`)),
  `feedback` text DEFAULT NULL,
  `graded_by` int(11) DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_assessment` (`assessment_id`),
  KEY `idx_enrollment` (`enrollment_id`),
  KEY `idx_attempt` (`attempt_number`),
  CONSTRAINT `assessment_results_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `training_assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessment_results_ibfk_2` FOREIGN KEY (`enrollment_id`) REFERENCES `student_training_enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_results`
--

LOCK TABLES `assessment_results` WRITE;
/*!40000 ALTER TABLE `assessment_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessment_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_analytics`
--

DROP TABLE IF EXISTS `assignment_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignment_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `total_students` int(11) DEFAULT 0,
  `submitted_count` int(11) DEFAULT 0,
  `graded_count` int(11) DEFAULT 0,
  `average_marks` decimal(10,2) DEFAULT 0.00,
  `highest_marks` decimal(10,2) DEFAULT 0.00,
  `lowest_marks` decimal(10,2) DEFAULT 0.00,
  `pass_count` int(11) DEFAULT 0,
  `fail_count` int(11) DEFAULT 0,
  `pass_rate` decimal(5,2) DEFAULT 0.00,
  `on_time_submissions` int(11) DEFAULT 0,
  `late_submissions` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_analytics` (`assignment_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `assignment_analytics_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_analytics_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `dos_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_analytics`
--

LOCK TABLES `assignment_analytics` WRITE;
/*!40000 ALTER TABLE `assignment_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_files`
--

DROP TABLE IF EXISTS `assignment_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignment_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(1000) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `assignment_files_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_files`
--

LOCK TABLES `assignment_files` WRITE;
/*!40000 ALTER TABLE `assignment_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_grades`
--

DROP TABLE IF EXISTS `assignment_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignment_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `marks_obtained` decimal(10,2) NOT NULL,
  `total_marks` int(11) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `feedback` longtext DEFAULT NULL,
  `graded_by` int(11) NOT NULL,
  `graded_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade` (`submission_id`),
  KEY `graded_by` (`graded_by`),
  CONSTRAINT `assignment_grades_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `assignment_submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_grades_ibfk_2` FOREIGN KEY (`graded_by`) REFERENCES `dos_teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_grades`
--

LOCK TABLES `assignment_grades` WRITE;
/*!40000 ALTER TABLE `assignment_grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignment_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_text` text DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` int(11) DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `status` enum('submitted','graded','late','missing') DEFAULT 'submitted',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_submission` (`assignment_id`,`student_id`),
  KEY `graded_by` (`graded_by`),
  KEY `idx_student` (`student_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `assignment_submissions_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `due_date` datetime NOT NULL,
  `max_marks` decimal(5,2) DEFAULT 100.00,
  `attachment_url` varchar(500) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `status` enum('draft','published','closed') DEFAULT 'draft',
  `is_published` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `idx_class` (`class_id`),
  KEY `idx_subject` (`subject_id`),
  KEY `idx_due_date` (`due_date`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('present','absent','late','excused') NOT NULL,
  `notes` text DEFAULT NULL,
  `marked_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`class_id`,`subject_id`,`attendance_date`),
  KEY `class_id` (`class_id`),
  KEY `subject_id` (`subject_id`),
  KEY `marked_by` (`marked_by`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `attendance_ibfk_4` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backups`
--

DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `backups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `size` bigint(20) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `points_required` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badges`
--

LOCK TABLES `badges` WRITE;
/*!40000 ALTER TABLE `badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badges_achievements`
--

DROP TABLE IF EXISTS `badges_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badges_achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `badge_name` varchar(200) NOT NULL,
  `badge_description` text DEFAULT NULL,
  `badge_icon` varchar(500) DEFAULT NULL,
  `badge_category` varchar(100) DEFAULT NULL,
  `criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`criteria`)),
  `points_value` int(11) DEFAULT 0,
  `rarity` enum('common','uncommon','rare','epic','legendary') DEFAULT 'common',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`badge_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badges_achievements`
--

LOCK TABLES `badges_achievements` WRITE;
/*!40000 ALTER TABLE `badges_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `badges_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `behavior_points`
--

DROP TABLE IF EXISTS `behavior_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `behavior_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `points` int(11) DEFAULT 0,
  `reason` varchar(255) DEFAULT NULL,
  `point_type` enum('amanota_meza','amanota_mabi') DEFAULT 'amanota_meza',
  `awarded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_type` (`point_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `behavior_points`
--

LOCK TABLES `behavior_points` WRITE;
/*!40000 ALTER TABLE `behavior_points` DISABLE KEYS */;
/*!40000 ALTER TABLE `behavior_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book_issues`
--

DROP TABLE IF EXISTS `book_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `book_issues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `issued_by` (`issued_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_issue_date` (`issue_date`),
  CONSTRAINT `book_issues_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `book_issues_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `book_issues_ibfk_3` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_issues`
--

LOCK TABLES `book_issues` WRITE;
/*!40000 ALTER TABLE `book_issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `book_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookmarks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `item_type` varchar(50) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bookmark` (`user_id`,`item_type`,`item_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookmarks`
--

LOCK TABLES `bookmarks` WRITE;
/*!40000 ALTER TABLE `bookmarks` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookmarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `budgets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `allocated_amount` decimal(15,2) NOT NULL,
  `spent_amount` decimal(15,2) DEFAULT 0.00,
  `remaining_amount` decimal(15,2) NOT NULL,
  `fiscal_year` varchar(20) NOT NULL,
  `status` enum('active','completed','exceeded') DEFAULT 'active',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budgets`
--

LOCK TABLES `budgets` WRITE;
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cafeteria_menu`
--

DROP TABLE IF EXISTS `cafeteria_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cafeteria_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `available` tinyint(1) DEFAULT 1,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_available` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cafeteria_menu`
--

LOCK TABLES `cafeteria_menu` WRITE;
/*!40000 ALTER TABLE `cafeteria_menu` DISABLE KEYS */;
/*!40000 ALTER TABLE `cafeteria_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cafeteria_order_items`
--

DROP TABLE IF EXISTS `cafeteria_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cafeteria_order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_item_id` (`menu_item_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `cafeteria_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `cafeteria_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cafeteria_order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `cafeteria_menu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cafeteria_order_items`
--

LOCK TABLES `cafeteria_order_items` WRITE;
/*!40000 ALTER TABLE `cafeteria_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cafeteria_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cafeteria_orders`
--

DROP TABLE IF EXISTS `cafeteria_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cafeteria_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `total_amount` decimal(10,2) NOT NULL,
  `order_date` datetime DEFAULT current_timestamp(),
  `status` enum('pending','preparing','ready','completed','cancelled') DEFAULT 'pending',
  `payment_status` enum('paid','pending') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_order_date` (`order_date`),
  CONSTRAINT `cafeteria_orders_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cafeteria_orders_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `cafeteria_menu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cafeteria_orders`
--

LOCK TABLES `cafeteria_orders` WRITE;
/*!40000 ALTER TABLE `cafeteria_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `cafeteria_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `callback_requests`
--

DROP TABLE IF EXISTS `callback_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `callback_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `preferred_time` varchar(50) NOT NULL,
  `preferred_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','scheduled','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `handled_by` int(11) DEFAULT NULL,
  `handled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `handled_by` (`handled_by`),
  KEY `idx_status` (`status`),
  KEY `idx_preferred_date` (`preferred_date`),
  CONSTRAINT `callback_requests_ibfk_1` FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `callback_requests`
--

LOCK TABLES `callback_requests` WRITE;
/*!40000 ALTER TABLE `callback_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `callback_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cells`
--

DROP TABLE IF EXISTS `cells`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cells` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sector_id` int(11) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sector_id` (`sector_id`),
  CONSTRAINT `cells_ibfk_1` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cells`
--

LOCK TABLES `cells` WRITE;
/*!40000 ALTER TABLE `cells` DISABLE KEYS */;
/*!40000 ALTER TABLE `cells` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificate_templates`
--

DROP TABLE IF EXISTS `certificate_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificate_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `type` varchar(100) NOT NULL,
  `design` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`design`)),
  `fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fields`)),
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_templates`
--

LOCK TABLES `certificate_templates` WRITE;
/*!40000 ALTER TABLE `certificate_templates` DISABLE KEYS */;
INSERT INTO `certificate_templates` VALUES (1,'Completion Certificate','completion','{}','[\"student_name\",\"course_name\",\"completion_date\"]',1,'2026-01-24 04:40:52'),(2,'Achievement Award','achievement','{}','[\"student_name\",\"achievement\",\"date\"]',1,'2026-01-24 04:40:52'),(3,'Graduation Certificate','graduation','{}','[\"student_name\",\"program\",\"graduation_year\"]',1,'2026-01-24 04:40:52');
/*!40000 ALTER TABLE `certificate_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `certificate_number` varchar(100) NOT NULL,
  `certificate_type` varchar(100) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `verification_code` varchar(100) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `status` enum('issued','revoked') DEFAULT 'issued',
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoke_reason` text DEFAULT NULL,
  `revoked_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_number` (`certificate_number`),
  UNIQUE KEY `verification_code` (`verification_code`),
  KEY `idx_student` (`student_id`),
  KEY `idx_verification` (`verification_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `sender` enum('user','agent','bot') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_sessions`
--

DROP TABLE IF EXISTS `chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) DEFAULT NULL,
  `visitor_name` varchar(100) DEFAULT NULL,
  `visitor_email` varchar(100) DEFAULT NULL,
  `status` enum('active','closed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_sessions`
--

LOCK TABLES `chat_sessions` WRITE;
/*!40000 ALTER TABLE `chat_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_analytics`
--

DROP TABLE IF EXISTS `class_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `analysis_date` date NOT NULL,
  `total_students` int(11) DEFAULT 0,
  `average_attendance` decimal(5,2) DEFAULT NULL,
  `average_grade` decimal(5,2) DEFAULT NULL,
  `conduct_incidents` int(11) DEFAULT 0,
  `top_performers` int(11) DEFAULT 0,
  `at_risk_students` int(11) DEFAULT 0,
  `participation_rate` decimal(5,2) DEFAULT NULL,
  `assignment_completion_rate` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_analysis_date` (`analysis_date`),
  CONSTRAINT `class_analytics_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_analytics`
--

LOCK TABLES `class_analytics` WRITE;
/*!40000 ALTER TABLE `class_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_attendance_sheets`
--

DROP TABLE IF EXISTS `class_attendance_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_attendance_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('present','absent','late','excused') NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `marked_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`class_sheet_id`,`student_id`,`attendance_date`,`subject`),
  KEY `student_id` (`student_id`),
  KEY `marked_by` (`marked_by`),
  CONSTRAINT `class_attendance_sheets_ibfk_1` FOREIGN KEY (`class_sheet_id`) REFERENCES `class_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_attendance_sheets_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_attendance_sheets_ibfk_3` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_attendance_sheets`
--

LOCK TABLES `class_attendance_sheets` WRITE;
/*!40000 ALTER TABLE `class_attendance_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_attendance_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_discipline_sheets`
--

DROP TABLE IF EXISTS `class_discipline_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_discipline_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `incident_date` date NOT NULL,
  `conduct_type` enum('warning','suspension','expulsion','late','absence','misbehavior','uniform','other') NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL,
  `description` text NOT NULL,
  `action_taken` text DEFAULT NULL,
  `status` enum('active','resolved') DEFAULT 'active',
  `recorded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `class_sheet_id` (`class_sheet_id`),
  KEY `student_id` (`student_id`),
  KEY `recorded_by` (`recorded_by`),
  CONSTRAINT `class_discipline_sheets_ibfk_1` FOREIGN KEY (`class_sheet_id`) REFERENCES `class_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_discipline_sheets_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_discipline_sheets_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_discipline_sheets`
--

LOCK TABLES `class_discipline_sheets` WRITE;
/*!40000 ALTER TABLE `class_discipline_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_discipline_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_payment_sheets`
--

DROP TABLE IF EXISTS `class_payment_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_payment_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `total_fees` decimal(15,2) DEFAULT 0.00,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `balance` decimal(15,2) DEFAULT 0.00,
  `payment_status` enum('paid','partial','unpaid') DEFAULT 'unpaid',
  `last_payment_date` date DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_payment_sheet` (`class_sheet_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `class_payment_sheets_ibfk_1` FOREIGN KEY (`class_sheet_id`) REFERENCES `class_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_payment_sheets_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_payment_sheets`
--

LOCK TABLES `class_payment_sheets` WRITE;
/*!40000 ALTER TABLE `class_payment_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_payment_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_payment_summary`
--

DROP TABLE IF EXISTS `class_payment_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_payment_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_structure_id` int(11) NOT NULL,
  `total_students` int(11) DEFAULT 0,
  `paid_students` int(11) DEFAULT 0,
  `unpaid_students` int(11) DEFAULT 0,
  `partial_paid_students` int(11) DEFAULT 0,
  `total_expected` decimal(15,2) DEFAULT 0.00,
  `total_collected` decimal(15,2) DEFAULT 0.00,
  `total_outstanding` decimal(15,2) DEFAULT 0.00,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `class_structure_id` (`class_structure_id`),
  CONSTRAINT `class_payment_summary_ibfk_1` FOREIGN KEY (`class_structure_id`) REFERENCES `class_structure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_payment_summary`
--

LOCK TABLES `class_payment_summary` WRITE;
/*!40000 ALTER TABLE `class_payment_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_payment_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_performance_sheets`
--

DROP TABLE IF EXISTS `class_performance_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_performance_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `term` varchar(20) NOT NULL,
  `quiz_score` decimal(5,2) DEFAULT 0.00,
  `midterm_score` decimal(5,2) DEFAULT 0.00,
  `final_score` decimal(5,2) DEFAULT 0.00,
  `total_score` decimal(5,2) DEFAULT 0.00,
  `percentage` decimal(5,2) DEFAULT 0.00,
  `grade` varchar(5) DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_performance` (`class_sheet_id`,`student_id`,`subject`,`term`),
  KEY `student_id` (`student_id`),
  KEY `recorded_by` (`recorded_by`),
  CONSTRAINT `class_performance_sheets_ibfk_1` FOREIGN KEY (`class_sheet_id`) REFERENCES `class_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_performance_sheets_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_performance_sheets_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_performance_sheets`
--

LOCK TABLES `class_performance_sheets` WRITE;
/*!40000 ALTER TABLE `class_performance_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_performance_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_schedules`
--

DROP TABLE IF EXISTS `class_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `class_schedules_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `class_schedules_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `class_schedules_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_schedules`
--

LOCK TABLES `class_schedules` WRITE;
/*!40000 ALTER TABLE `class_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_sheets`
--

DROP TABLE IF EXISTS `class_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_structure_id` int(11) NOT NULL,
  `sheet_name` varchar(255) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `total_students` int(11) DEFAULT 0,
  `male_students` int(11) DEFAULT 0,
  `female_students` int(11) DEFAULT 0,
  `class_teacher_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sheet` (`class_structure_id`,`academic_year`),
  KEY `class_teacher_id` (`class_teacher_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `class_sheets_ibfk_1` FOREIGN KEY (`class_structure_id`) REFERENCES `class_structure` (`id`),
  CONSTRAINT `class_sheets_ibfk_2` FOREIGN KEY (`class_teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `class_sheets_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_sheets`
--

LOCK TABLES `class_sheets` WRITE;
/*!40000 ALTER TABLE `class_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_structure`
--

DROP TABLE IF EXISTS `class_structure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_structure` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade` enum('SOD','AUT','BDC') NOT NULL,
  `level` varchar(20) NOT NULL,
  `section` varchar(10) DEFAULT NULL,
  `class_name` varchar(100) NOT NULL,
  `capacity` int(11) DEFAULT 40,
  `current_enrollment` int(11) DEFAULT 0,
  `class_teacher_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class` (`trade`,`level`,`section`),
  KEY `class_teacher_id` (`class_teacher_id`),
  CONSTRAINT `class_structure_ibfk_1` FOREIGN KEY (`class_teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_structure`
--

LOCK TABLES `class_structure` WRITE;
/*!40000 ALTER TABLE `class_structure` DISABLE KEYS */;
INSERT INTO `class_structure` VALUES (1,'SOD','Level 3',NULL,'SOD Level 3',40,0,NULL,'active','2026-01-23 05:51:59'),(2,'SOD','Level 4',NULL,'SOD Level 4',40,0,NULL,'active','2026-01-23 05:51:59'),(3,'SOD','Level 5',NULL,'SOD Level 5',40,0,NULL,'active','2026-01-23 05:51:59'),(4,'AUT','Level 3',NULL,'AUT Level 3',40,0,NULL,'active','2026-01-23 05:51:59'),(5,'AUT','Level 4','A','AUT Level 4A',40,0,NULL,'active','2026-01-23 05:51:59'),(6,'AUT','Level 4','B','AUT Level 4B',40,0,NULL,'active','2026-01-23 05:51:59'),(7,'AUT','Level 5','A','AUT Level 5A',40,0,NULL,'active','2026-01-23 05:51:59'),(8,'AUT','Level 5','B','AUT Level 5B',40,0,NULL,'active','2026-01-23 05:51:59'),(9,'BDC','Level 3',NULL,'BDC Level 3',40,0,NULL,'active','2026-01-23 05:51:59'),(10,'BDC','Level 4',NULL,'BDC Level 4',40,0,NULL,'active','2026-01-23 05:51:59'),(11,'BDC','Level 5',NULL,'BDC Level 5',40,0,NULL,'active','2026-01-23 05:51:59');
/*!40000 ALTER TABLE `class_structure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_student_sheets`
--

DROP TABLE IF EXISTS `class_student_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_student_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_code` varchar(50) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `enrollment_date` date NOT NULL,
  `status` enum('active','transferred','dropped','graduated') DEFAULT 'active',
  `position_in_class` int(11) DEFAULT NULL,
  `added_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_sheet` (`class_sheet_id`,`student_id`),
  KEY `student_id` (`student_id`),
  KEY `added_by` (`added_by`),
  CONSTRAINT `class_student_sheets_ibfk_1` FOREIGN KEY (`class_sheet_id`) REFERENCES `class_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_student_sheets_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_student_sheets_ibfk_3` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_student_sheets`
--

LOCK TABLES `class_student_sheets` WRITE;
/*!40000 ALTER TABLE `class_student_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_student_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_students`
--

DROP TABLE IF EXISTS `class_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `enrollment_date` date DEFAULT curdate(),
  `status` varchar(20) DEFAULT 'active',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `class_students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_students`
--

LOCK TABLES `class_students` WRITE;
/*!40000 ALTER TABLE `class_students` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_subjects`
--

DROP TABLE IF EXISTS `class_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `academic_year_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_subject` (`class_id`,`subject_id`,`academic_year_id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `class_subjects_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `class_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `class_subjects_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `class_subjects_ibfk_4` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_subjects`
--

LOCK TABLES `class_subjects` WRITE;
/*!40000 ALTER TABLE `class_subjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_summary_stats`
--

DROP TABLE IF EXISTS `class_summary_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_summary_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_sheet_id` int(11) NOT NULL,
  `total_students` int(11) DEFAULT 0,
  `present_today` int(11) DEFAULT 0,
  `absent_today` int(11) DEFAULT 0,
  `avg_performance` decimal(5,2) DEFAULT 0.00,
  `total_incidents` int(11) DEFAULT 0,
  `paid_students` int(11) DEFAULT 0,
  `unpaid_students` int(11) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_summary` (`class_sheet_id`),
  CONSTRAINT `class_summary_stats_ibfk_1` FOREIGN KEY (`class_sheet_id`) REFERENCES `class_sheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_summary_stats`
--

LOCK TABLES `class_summary_stats` WRITE;
/*!40000 ALTER TABLE `class_summary_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_summary_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_teachers`
--

DROP TABLE IF EXISTS `class_teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `class_teachers_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `class_teachers_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_teachers`
--

LOCK TABLES `class_teachers` WRITE;
/*!40000 ALTER TABLE `class_teachers` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_timetable`
--

DROP TABLE IF EXISTS `class_timetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_timetable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade` varchar(100) NOT NULL,
  `class_level` varchar(50) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `subject` varchar(100) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `class_timetable_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `class_timetable_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_timetable`
--

LOCK TABLES `class_timetable` WRITE;
/*!40000 ALTER TABLE `class_timetable` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_timetable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `course_id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT 30,
  `current_enrollment` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `trade_code` varchar(20) DEFAULT NULL,
  `level` varchar(10) DEFAULT NULL,
  `section` varchar(10) DEFAULT NULL,
  `name_rw` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `academic_year_id` (`academic_year_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `classes_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'Senior 1 A',1,1,3,40,0,1,'2026-01-26 17:24:11','2026-01-26 17:24:11',NULL,'S1','A',NULL);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `club_members`
--

DROP TABLE IF EXISTS `club_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `club_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `club_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `join_date` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_membership` (`club_id`,`student_id`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `club_members_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `club_members_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club_members`
--

LOCK TABLES `club_members` WRITE;
/*!40000 ALTER TABLE `club_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `club_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clubs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `max_members` int(11) DEFAULT 50,
  `meeting_schedule` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `idx_category` (`category`),
  CONSTRAINT `clubs_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clubs`
--

LOCK TABLES `clubs` WRITE;
/*!40000 ALTER TABLE `clubs` DISABLE KEYS */;
/*!40000 ALTER TABLE `clubs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_content`
--

DROP TABLE IF EXISTS `cms_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `display_order` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_section` (`section`),
  KEY `idx_active` (`active`),
  KEY `idx_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_content`
--

LOCK TABLES `cms_content` WRITE;
/*!40000 ALTER TABLE `cms_content` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaboration_group_members`
--

DROP TABLE IF EXISTS `collaboration_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collaboration_group_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('leader','member','observer') DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `contribution_score` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_membership` (`group_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `collaboration_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `collaboration_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collaboration_group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaboration_group_members`
--

LOCK TABLES `collaboration_group_members` WRITE;
/*!40000 ALTER TABLE `collaboration_group_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `collaboration_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaboration_groups`
--

DROP TABLE IF EXISTS `collaboration_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collaboration_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `creator_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `trade_class_id` int(11) DEFAULT NULL,
  `max_members` int(11) DEFAULT 10,
  `is_active` tinyint(1) DEFAULT 1,
  `collaboration_type` enum('study_group','project_team','peer_learning','skill_sharing') DEFAULT 'study_group',
  `rules` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `subject_id` (`subject_id`),
  KEY `trade_class_id` (`trade_class_id`),
  CONSTRAINT `collaboration_groups_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collaboration_groups_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `collaboration_groups_ibfk_3` FOREIGN KEY (`trade_class_id`) REFERENCES `trade_classes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaboration_groups`
--

LOCK TABLES `collaboration_groups` WRITE;
/*!40000 ALTER TABLE `collaboration_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `collaboration_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communication_preferences`
--

DROP TABLE IF EXISTS `communication_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `communication_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 1,
  `push_notifications` tinyint(1) DEFAULT 1,
  `announcement_notifications` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`user_id`),
  CONSTRAINT `communication_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communication_preferences`
--

LOCK TABLES `communication_preferences` WRITE;
/*!40000 ALTER TABLE `communication_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `communication_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `competition_participants`
--

DROP TABLE IF EXISTS `competition_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `competition_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `competition_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `submission_content` text DEFAULT NULL,
  `score` int(11) DEFAULT 0,
  `status` varchar(20) DEFAULT 'submitted',
  `achieved_points` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `competition_id` (`competition_id`),
  CONSTRAINT `competition_participants_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competition_participants`
--

LOCK TABLES `competition_participants` WRITE;
/*!40000 ALTER TABLE `competition_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `competition_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `competitions`
--

DROP TABLE IF EXISTS `competitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `competitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `points_reward` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competitions`
--

LOCK TABLES `competitions` WRITE;
/*!40000 ALTER TABLE `competitions` DISABLE KEYS */;
INSERT INTO `competitions` VALUES (1,'Science Fair 2026','Annual science projects competition','2026-02-01','2026-02-15','Academic',1,'active',500,'2026-01-26 16:38:08'),(2,'Inter-School Debate','Debating competition for all levels','2026-03-05','2026-03-07','Extra-Curricular',1,'active',300,'2026-01-26 16:38:08');
/*!40000 ALTER TABLE `competitions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conduct_history`
--

DROP TABLE IF EXISTS `conduct_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conduct_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conduct_id` int(11) NOT NULL,
  `action_type` enum('created','updated','removed','restored') NOT NULL,
  `action_by` int(11) NOT NULL,
  `action_date` datetime DEFAULT current_timestamp(),
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `action_by` (`action_by`),
  KEY `idx_conduct_id` (`conduct_id`),
  CONSTRAINT `conduct_history_ibfk_1` FOREIGN KEY (`conduct_id`) REFERENCES `discipline_conducts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conduct_history_ibfk_2` FOREIGN KEY (`action_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conduct_history`
--

LOCK TABLES `conduct_history` WRITE;
/*!40000 ALTER TABLE `conduct_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `conduct_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conduct_records`
--

DROP TABLE IF EXISTS `conduct_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conduct_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `severity` varchar(20) DEFAULT 'medium',
  `status` varchar(20) DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `conduct_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conduct_records`
--

LOCK TABLES `conduct_records` WRITE;
/*!40000 ALTER TABLE `conduct_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `conduct_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(500) NOT NULL,
  `message` text NOT NULL,
  `category` enum('inquiry','admission','partnership','feedback','other') DEFAULT 'inquiry',
  `status` enum('new','read','replied','archived') DEFAULT 'new',
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `reply_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_submissions`
--

DROP TABLE IF EXISTS `contact_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `department` enum('admissions','academics','finance','student-services','technical-support','general') NOT NULL,
  `subject` varchar(500) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `attachment` varchar(500) DEFAULT NULL,
  `status` enum('pending','in_progress','resolved','closed') DEFAULT 'pending',
  `response` text DEFAULT NULL,
  `responded_by` int(11) DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `responded_by` (`responded_by`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_contact_email` (`email`),
  CONSTRAINT `contact_submissions_ibfk_1` FOREIGN KEY (`responded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_submissions`
--

LOCK TABLES `contact_submissions` WRITE;
/*!40000 ALTER TABLE `contact_submissions` DISABLE KEYS */;
INSERT INTO `contact_submissions` VALUES (1,'reponse kdz','reponsekdz06@gmail.com','+250722725735','admissions','wgwgh3','sdfghjk','high',NULL,'pending',NULL,NULL,NULL,'2026-01-22 17:12:42','2026-01-22 17:12:42');
/*!40000 ALTER TABLE `contact_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `content`
--

DROP TABLE IF EXISTS `content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content`
--

LOCK TABLES `content` WRITE;
/*!40000 ALTER TABLE `content` DISABLE KEYS */;
/*!40000 ALTER TABLE `content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `content_items`
--

DROP TABLE IF EXISTS `content_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `content_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content_items`
--

LOCK TABLES `content_items` WRITE;
/*!40000 ALTER TABLE `content_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `content_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `counseling_sessions`
--

DROP TABLE IF EXISTS `counseling_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `counseling_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `counselor_id` int(11) NOT NULL,
  `session_type` enum('individual','group','family','crisis') NOT NULL,
  `category` enum('academic','personal','social','career','family','health') NOT NULL,
  `title_rw` varchar(200) NOT NULL,
  `title_en` varchar(200) DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `session_date` datetime NOT NULL,
  `duration_minutes` int(11) DEFAULT 45,
  `location` varchar(200) DEFAULT NULL,
  `concerns_rw` text NOT NULL,
  `concerns_en` text DEFAULT NULL,
  `interventions_rw` text DEFAULT NULL,
  `interventions_en` text DEFAULT NULL,
  `outcomes_rw` text DEFAULT NULL,
  `outcomes_en` text DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `parent_involved` tinyint(1) DEFAULT 0,
  `confidential` tinyint(1) DEFAULT 1,
  `status` enum('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `counseling_sessions`
--

LOCK TABLES `counseling_sessions` WRITE;
/*!40000 ALTER TABLE `counseling_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `counseling_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_materials`
--

DROP TABLE IF EXISTS `course_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_course` (`course_id`),
  CONSTRAINT `course_materials_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_materials_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_materials`
--

LOCK TABLES `course_materials` WRITE;
/*!40000 ALTER TABLE `course_materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_code` varchar(10) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `level_suffix` varchar(5) DEFAULT '',
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `duration_months` int(11) NOT NULL,
  `fee_amount` decimal(10,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  FULLTEXT KEY `ft_name` (`name`),
  FULLTEXT KEY `ft_description` (`description`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,NULL,NULL,'','Software Development','Comprehensive software development program covering modern programming languages and frameworks','SOD',24,500000.00,1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(2,NULL,NULL,'','Building Construction','Construction techniques, project management, and safety protocols training','BDC',18,400000.00,1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(3,NULL,NULL,'','Automobile Technology','Automotive training covering diagnostics, repair, and modern vehicle technologies','AUTO',20,450000.00,1,'2026-01-24 05:02:44','2026-01-24 05:02:44');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curriculum`
--

DROP TABLE IF EXISTS `curriculum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `curriculum` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade` varchar(100) NOT NULL,
  `class_level` varchar(50) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `topics` text DEFAULT NULL,
  `learning_outcomes` text DEFAULT NULL,
  `assessment_methods` text DEFAULT NULL,
  `resources` text DEFAULT NULL,
  `status` enum('active','draft','archived') DEFAULT 'active',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `curriculum_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curriculum`
--

LOCK TABLES `curriculum` WRITE;
/*!40000 ALTER TABLE `curriculum` DISABLE KEYS */;
INSERT INTO `curriculum` VALUES (1,'Software Development','Level 4','Programming Fundamentals','Variables, Control Flow, Functions','Understand basic programming concepts','Quizzes, Projects','Python IDE, Laptop','active',NULL,'2026-02-06 10:18:40'),(2,'Software Development','Level 4','Web Development','HTML, CSS, JavaScript','Build responsive websites','Projects, Exams','Code Editor, Browser','active',NULL,'2026-02-06 10:27:19'),(3,'Software Development','Level 4','Database Systems','SQL, PostgreSQL, MongoDB','Design and query databases','Lab Work, Quizzes','Database Server, Tools','active',NULL,'2026-02-06 10:27:19'),(4,'Software Development','Level 5','Software Engineering','Agile, Scrum, DevOps','Manage software projects','Case Studies, Reports','Project Management Tools','active',NULL,'2026-02-06 10:27:19');
/*!40000 ALTER TABLE `curriculum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_reports`
--

DROP TABLE IF EXISTS `custom_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `query_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`query_config`)),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_reports`
--

LOCK TABLES `custom_reports` WRITE;
/*!40000 ALTER TABLE `custom_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_sheet_columns`
--

DROP TABLE IF EXISTS `custom_sheet_columns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_sheet_columns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `column_name` varchar(255) NOT NULL,
  `column_type` varchar(50) NOT NULL,
  `calculation_formula` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_class` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_sheet_columns`
--

LOCK TABLES `custom_sheet_columns` WRITE;
/*!40000 ALTER TABLE `custom_sheet_columns` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_sheet_columns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_attendance_summary`
--

DROP TABLE IF EXISTS `daily_attendance_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `daily_attendance_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `summary_date` date NOT NULL,
  `total_students` int(11) DEFAULT 0,
  `present_count` int(11) DEFAULT 0,
  `absent_count` int(11) DEFAULT 0,
  `late_count` int(11) DEFAULT 0,
  `excused_count` int(11) DEFAULT 0,
  `on_leave_count` int(11) DEFAULT 0,
  `attendance_rate` decimal(5,2) DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `summary_date` (`summary_date`),
  KEY `idx_summary_date` (`summary_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_attendance_summary`
--

LOCK TABLES `daily_attendance_summary` WRITE;
/*!40000 ALTER TABLE `daily_attendance_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_attendance_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `developer_team`
--

DROP TABLE IF EXISTS `developer_team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `developer_team` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `name_rw` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  `role_rw` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `github_url` varchar(500) DEFAULT NULL,
  `linkedin_url` varchar(500) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `achievements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`achievements`)),
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `developer_team`
--

LOCK TABLES `developer_team` WRITE;
/*!40000 ALTER TABLE `developer_team` DISABLE KEYS */;
INSERT INTO `developer_team` VALUES (13,'Niyonkuru Reponse','Niyonkuru Reponse','Team Owner & System Development Manager','Umuyobozi w\'Itsinda & Umuyobozi w\'Iterambere rya Sisitemu',NULL,'Niyonkuru Reponse ni umuyobozi mukuru w\'itsinda ry\'abatunganyije sisitemu ikomeye yo gucunga ishuri. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu iterambere rya sisitemu n\'ubuyobozi bw\'imishinga.\n\nNk\'umuyobozi w\'itsinda, Reponse yafashe inshingano zo guhuza abagize itsinda, gushyiraho imyubakire ya sisitemu, no kwemeza ko umushinga urangira neza. Yagize uruhare runini mu gushyira mu bikorwa tekinoloji zigezweho nko React, TypeScript, Node.js, Express, na MySQL mu gukora sisitemu ihuza ibikenewe n\'amashuri mu Rwanda.\n\nIMYUGA N\'UBUMENYI:\nReponse afite ubumenyi bukomeye mu iterambere rya sisitemu zikomeye (Full-Stack Development). Yatunganye sisitemu ikomeye yo kwiyandikisha abanyeshuri ikoresheje kode zidasanzwe, dashboard zitandukanye ku bigo by\'abakoresha, sisitemu yo gucunga amaklasi, sisitemu yo gukurikirana amanota, na sisitemu yo guhanahana.\n\nIMISHINGA YAKOZE:\n1. School Management System - Umushinga mukuru w\'impamyabumenyi\n2. Student Serial Code Authentication System\n3. Class Sheets Management System\n4. DOS Management Dashboard\n5. Homepage Content Management System\n\nUBUSHOBOZI BWE:\n- Full-Stack Development\n- Database Design & Architecture\n- System Architecture & Design\n- Team Leadership & Management\n- Project Management\n- Problem Solving & Critical Thinking\n- Code Review & Quality Assurance\n- Technical Documentation\n\nIBIHEMBO YARONSE:\n- Best Student Developer 2025 - Garden TVET School\n- Innovation Award 2025 - Rwanda ICT Chamber\n- Best Graduation Project 2026 - TVET Schools Competition\n- Young Developer Award 2026 - Rwanda Development Board','/uploads/developers/niyonkuru reponse.jpg','reponse@garden-tvet.rw','+250 788 123 456','https://github.com/niyonkuru-reponse','https://linkedin.com/in/niyonkuru-reponse','[\"React\",\"TypeScript\",\"Node.js\",\"MySQL\"]','[\"Best Developer 2025\"]',1,1,'2026-01-24 07:38:24','2026-01-24 07:42:26'),(14,'Musoni Mugisha Yves','Musoni Mugisha Yves','Asset Tracker & Innovation Specialist','Umukurikirana w\'Umutungo & Inzobere mu Guhanga Udushya',NULL,'Musoni Mugisha Yves ni inzobere mu gukurikirana umutungo n\'uguhanga udushya. Afite uruhare runini mu gushyira mu bikorwa ibitekerezo bishya no gufasha itsinda gukomeza gutera imbere.\n\nURUHARE MU MUSHINGA:\nYves yagize uruhare runini mu gukurikirana umutungo wa sisitemu, gukora testing, no kwemeza ko sisitemu ikora neza. Yafashe inshingano zo gukora quality assurance, gukora documentation, no gufasha mu gukemura ibibazo.\n\nUBUSHOBOZI BWE:\n- Innovation & Creative Thinking\n- Asset Management & Tracking\n- Quality Assurance & Testing\n- Technical Documentation\n- Problem Solving\n- Team Collaboration\n\nIMISHINGA YAKOZE:\n- Asset Tracking System\n- Quality Assurance Framework\n- Testing Documentation\n- Innovation Proposals\n\nIBIHEMBO:\n- Innovation Excellence Award 2025\n- Best Team Player 2025\n- Quality Assurance Award 2025','/uploads/developers/musoni mugisha yves.jpg','yves@garden-tvet.rw','+250 788 234 567','https://github.com/musoni-yves','https://linkedin.com/in/musoni-yves','[\"Innovation\",\"Testing\",\"Documentation\"]','[\"Innovation Award 2025\"]',2,1,'2026-01-24 07:38:24','2026-01-24 07:42:26'),(15,'Zamilu Yazid Surayman','Zamilu Yazid Surayman','Secretary & Data Gathering Specialist','Umunyamabanga & Inzobere mu Gukusanya Amakuru',NULL,'Zamilu Yazid Surayman ni umunyamabanga w\'itsinda kandi ni inzobere mu gukusanya amakuru. Afite uruhare runini mu gukusanya no gutunganya amakuru akenewe mu gukora sisitemu.\n\nURUHARE MU MUSHINGA:\nYazid yagize uruhare runini mu gukora ubushakashatsi, gukusanya ibikenewe n\'abakoresha, gutunganya amakuru, no gukora documentation. Yafashe inshingano zo kwandika raporo, gukora inyandiko, no guhuza itsinda n\'abayobozi b\'ishuri.\n\nUBUSHOBOZI BWE:\n- Data Analysis & Research\n- Information Gathering\n- Documentation & Reporting\n- Communication Skills\n- Organization & Planning\n- Stakeholder Management\n\nIMISHINGA YAKOZE:\n- User Requirements Documentation\n- Research Reports\n- Data Collection Systems\n- Meeting Minutes & Reports\n\nIBIHEMBO:\n- Best Data Analyst 2025\n- Excellence in Research 2025\n- Best Documentation Award 2025','/uploads/developers/zamiru yazid surayiman.JPG','yazid@garden-tvet.rw','+250 788 345 678','https://github.com/zamilu-yazid','https://linkedin.com/in/zamilu-yazid','[\"Data Analysis\",\"Research\",\"Documentation\"]','[\"Best Analyst 2025\"]',3,1,'2026-01-24 07:38:24','2026-01-24 07:42:26'),(16,'Niyonsenga Frank','Niyonsenga Frank','Team Representative & Advisor','Uhagarariye Itsinda & Umujyanama',NULL,'Niyonsenga Frank ni uhagarariye itsinda kandi ni umujyanama. Afite uruhare runini mu guhuza itsinda n\'abayobozi b\'ishuri no gutanga inama ku bijyanye n\'umushinga.\n\nURUHARE MU MUSHINGA:\nFrank yagize uruhare runini mu guhuza itsinda n\'abayobozi b\'ishuri, gutanga inama ku bijyanye n\'umushinga, gukora presentation, no gufasha mu gushyira mu bikorwa imishinga. Yafashe inshingano zo kuvugira itsinda, gukora advisory, no guhuza stakeholders.\n\nUBUSHOBOZI BWE:\n- Leadership & Team Representation\n- Communication & Presentation\n- Project Coordination\n- Stakeholder Management\n- Advisory & Consulting\n- Conflict Resolution\n\nIMISHINGA YAKOZE:\n- Stakeholder Engagement Strategy\n- Project Presentations\n- Advisory Reports\n- Team Coordination Framework\n\nIBIHEMBO:\n- Best Team Representative 2025\n- Leadership Excellence Award 2025\n- Communication Award 2025','/uploads/developers/niyonsenga frank.JPG','frank@garden-tvet.rw','+250 788 456 789','https://github.com/niyonsenga-frank','https://linkedin.com/in/niyonsenga-frank','[\"Leadership\",\"Communication\",\"Advisory\"]','[\"Leadership Award 2025\"]',4,1,'2026-01-24 07:38:24','2026-01-24 07:42:26');
/*!40000 ALTER TABLE `developer_team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `developers`
--

DROP TABLE IF EXISTS `developers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `developers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `name_rw` varchar(255) DEFAULT NULL,
  `role` varchar(100) NOT NULL,
  `role_rw` varchar(100) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `bio` text DEFAULT NULL,
  `bio_rw` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `github_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `projects` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`projects`)),
  `achievements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`achievements`)),
  `social_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_links`)),
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `developers`
--

LOCK TABLES `developers` WRITE;
/*!40000 ALTER TABLE `developers` DISABLE KEYS */;
INSERT INTO `developers` VALUES (1,'Niyonkuru Reponse','Niyonkuru Reponse','Lead Full-Stack Developer & System Architect','Umuyobozi w\'Abateza Porogaramu n\'Umubunyangamugayo','React, Node.js, MySQL, System Architecture',6,'Lead developer and architect of the Garden TVET School Management System. Expert in full-stack development with extensive experience in educational technology solutions.','Umuyobozi w\'abateza porogaramu na mubunyangamugayo wa sisitemu y\'ubuyobozi bw\'ishuri rya Garden TVET. Inzobere mu guteza porogaramu zuzuye kandi afite ubunararibonye bwinshi mu bikoranabuhanga by\'uburezi.','/uploads/developers/niyonkuru reponse.jpg','https://github.com/reponse-dev','https://linkedin.com/in/reponse-niyonkuru',NULL,'reponse@gardentvet.rw','+250788123456','[\"React\",\"Node.js\",\"MySQL\",\"TypeScript\",\"System Design\",\"DevOps\",\"Project Management\"]','[{\"name\":\"School Management System\",\"description\":\"Complete educational management platform\",\"tech\":[\"React\",\"Node.js\",\"MySQL\"]},{\"name\":\"Student Portal\",\"description\":\"Interactive student dashboard\",\"tech\":[\"React\",\"TypeScript\"]},{\"name\":\"Admin Dashboard\",\"description\":\"Comprehensive admin interface\",\"tech\":[\"React\",\"Node.js\"]}]','[\"Led development of complete school management system\",\"Implemented advanced authentication system\",\"Designed scalable database architecture\",\"Mentored junior developers\"]','{\"twitter\":\"https://twitter.com/reponse_dev\",\"instagram\":\"https://instagram.com/reponse.dev\"}',1,1,1,'2026-01-26 10:24:35','2026-01-26 10:24:35'),(2,'Musoni Mugisha Yves','Musoni Mugisha Yves','Senior Frontend Developer','Umuteza Porogaramu w\'Imbere Mukuru','React, Vue.js, UI/UX Design, Mobile Development',4,'Senior frontend developer specializing in modern web technologies and user experience design. Expert in creating responsive and intuitive interfaces.','Umuteza porogaramu w\'imbere mukuru, inzobere mu bikoranabuhanga bigezweho bya web n\'igishushanyo cy\'uburambe bw\'abakoresha. Inzobere mu gukora interface zihuza kandi zoroshye.','/uploads/developers/musoni mugisha yves.jpg','https://github.com/yves-musoni','https://linkedin.com/in/yves-musoni',NULL,'yves@gardentvet.rw','+250788234567','[\"React\",\"Vue.js\",\"JavaScript\",\"CSS3\",\"SASS\",\"Figma\",\"Adobe XD\",\"Mobile Development\"]','[{\"name\":\"Student Dashboard UI\",\"description\":\"Modern student interface design\",\"tech\":[\"React\",\"CSS3\"]},{\"name\":\"Mobile App Frontend\",\"description\":\"Cross-platform mobile interface\",\"tech\":[\"React Native\"]},{\"name\":\"Admin Panel Design\",\"description\":\"Comprehensive admin interface\",\"tech\":[\"Vue.js\",\"SASS\"]}]','[\"Designed complete UI/UX for school system\",\"Implemented responsive design patterns\",\"Created mobile-first interfaces\",\"Optimized frontend performance\"]','{\"behance\":\"https://behance.net/yves-musoni\",\"dribbble\":\"https://dribbble.com/yves-musoni\"}',1,1,2,'2026-01-26 10:24:35','2026-01-26 10:24:35'),(3,'Niyonsenga Frank','Niyonsenga Frank','Backend Developer & Database Specialist','Umuteza Porogaramu w\'Inyuma n\'Inzobere mu Bubiko bw\'Amakuru','Node.js, MySQL, API Development, Database Optimization',3,'Backend developer and database specialist focused on creating robust server-side applications and optimizing database performance for educational systems.','Umuteza porogaramu w\'inyuma n\'inzobere mu bubiko bw\'amakuru, yibanze ku gukora porogaramu z\'inyuma zikomeye no kunoza imikorere y\'ububiko bw\'amakuru mu sisitemu z\'uburezi.','/uploads/developers/niyonsenga frank.JPG','https://github.com/frank-niyonsenga','https://linkedin.com/in/frank-niyonsenga',NULL,'frank@gardentvet.rw','+250788345678','[\"Node.js\",\"Express.js\",\"MySQL\",\"MongoDB\",\"API Design\",\"Database Optimization\",\"Server Management\"]','[{\"name\":\"School API System\",\"description\":\"RESTful API for school management\",\"tech\":[\"Node.js\",\"MySQL\"]},{\"name\":\"Database Architecture\",\"description\":\"Optimized database design\",\"tech\":[\"MySQL\",\"Database Design\"]},{\"name\":\"Authentication System\",\"description\":\"Secure user authentication\",\"tech\":[\"Node.js\",\"JWT\"]}]','[\"Designed scalable database architecture\",\"Implemented secure authentication system\",\"Optimized database queries for performance\",\"Created comprehensive API documentation\"]','{\"stackoverflow\":\"https://stackoverflow.com/users/frank-niyonsenga\"}',1,0,3,'2026-01-26 10:24:35','2026-01-26 10:24:35'),(4,'Zamiru Yazid Surayiman','Zamiru Yazid Surayiman','DevOps Engineer & System Administrator','Injeniyeri ya DevOps n\'Umuyobozi wa Sisitemu','Server Management, Deployment, Security, Cloud Infrastructure',4,'DevOps engineer and system administrator ensuring smooth deployment, maintenance, and security of the school management system infrastructure.','Injeniyeri ya DevOps n\'umuyobozi wa sisitemu ukora ku gushyira mu bikorwa, kubungabunga, n\'umutekano wa sisitemu y\'ubuyobozi bw\'ishuri.','/uploads/developers/zamiru yazid surayiman.JPG','https://github.com/yazid-zamiru','https://linkedin.com/in/yazid-zamiru',NULL,'yazid@gardentvet.rw','+250788456789','[\"Linux\",\"Docker\",\"AWS\",\"Nginx\",\"CI/CD\",\"Security\",\"Monitoring\",\"Backup Systems\"]','[{\"name\":\"School Infrastructure\",\"description\":\"Complete server infrastructure setup\",\"tech\":[\"Linux\",\"Docker\"]},{\"name\":\"Deployment Pipeline\",\"description\":\"Automated deployment system\",\"tech\":[\"CI/CD\",\"Docker\"]},{\"name\":\"Security Implementation\",\"description\":\"System security and monitoring\",\"tech\":[\"Security\",\"Monitoring\"]}]','[\"Set up complete server infrastructure\",\"Implemented automated deployment pipeline\",\"Established security protocols\",\"Created backup and recovery systems\"]','{\"medium\":\"https://medium.com/@yazid-zamiru\"}',1,0,4,'2026-01-26 10:24:35','2026-01-26 10:24:35');
/*!40000 ALTER TABLE `developers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline_actions`
--

DROP TABLE IF EXISTS `discipline_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `action_type` enum('warning','detention','suspension','expulsion','community_service','counseling','parent_meeting','other') NOT NULL,
  `duration_days` int(11) DEFAULT 0,
  `requires_approval` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_action_type` (`action_type`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline_actions`
--

LOCK TABLES `discipline_actions` WRITE;
/*!40000 ALTER TABLE `discipline_actions` DISABLE KEYS */;
INSERT INTO `discipline_actions` VALUES (1,'Verbal Warning','Verbal warning given to student','warning',0,0,1,'2026-01-29 18:51:48'),(2,'Written Warning','Written warning documented in file','warning',0,0,1,'2026-01-29 18:51:48'),(3,'Lunch Detention','Student stays during lunch break','detention',1,0,1,'2026-01-29 18:51:48'),(4,'After School Detention','Student stays after school hours','detention',1,0,1,'2026-01-29 18:51:48'),(5,'1 Day Suspension','Student suspended for one day','suspension',1,1,1,'2026-01-29 18:51:48'),(6,'3 Day Suspension','Student suspended for three days','suspension',3,1,1,'2026-01-29 18:51:48'),(7,'1 Week Suspension','Student suspended for one week','suspension',7,1,1,'2026-01-29 18:51:48'),(8,'Community Service','Student performs community service','community_service',0,0,1,'2026-01-29 18:51:48'),(9,'Counseling Session','Mandatory counseling session','counseling',0,0,1,'2026-01-29 18:51:48'),(10,'Parent Conference','Meeting with parents required','parent_meeting',0,0,1,'2026-01-29 18:51:48'),(11,'Expulsion','Permanent removal from school','expulsion',0,1,1,'2026-01-29 18:51:48'),(12,'Verbal Warning','Verbal warning given to student','warning',0,0,1,'2026-01-29 19:03:29'),(13,'Written Warning','Written warning documented in file','warning',0,0,1,'2026-01-29 19:03:29'),(14,'Lunch Detention','Student stays during lunch break','detention',1,0,1,'2026-01-29 19:03:29'),(15,'After School Detention','Student stays after school hours','detention',1,0,1,'2026-01-29 19:03:29'),(16,'1 Day Suspension','Student suspended for one day','suspension',1,1,1,'2026-01-29 19:03:29'),(17,'3 Day Suspension','Student suspended for three days','suspension',3,1,1,'2026-01-29 19:03:29'),(18,'1 Week Suspension','Student suspended for one week','suspension',7,1,1,'2026-01-29 19:03:29'),(19,'Community Service','Student performs community service','community_service',0,0,1,'2026-01-29 19:03:29'),(20,'Counseling Session','Mandatory counseling session','counseling',0,0,1,'2026-01-29 19:03:29'),(21,'Parent Conference','Meeting with parents required','parent_meeting',0,0,1,'2026-01-29 19:03:29'),(22,'Expulsion','Permanent removal from school','expulsion',0,1,1,'2026-01-29 19:03:29'),(23,'Verbal Warning','Verbal warning given to student','warning',0,0,1,'2026-01-29 19:10:51'),(24,'Written Warning','Written warning documented in file','warning',0,0,1,'2026-01-29 19:10:51'),(25,'Lunch Detention','Student stays during lunch break','detention',1,0,1,'2026-01-29 19:10:51'),(26,'After School Detention','Student stays after school hours','detention',1,0,1,'2026-01-29 19:10:51'),(27,'1 Day Suspension','Student suspended for one day','suspension',1,1,1,'2026-01-29 19:10:51'),(28,'3 Day Suspension','Student suspended for three days','suspension',3,1,1,'2026-01-29 19:10:51'),(29,'1 Week Suspension','Student suspended for one week','suspension',7,1,1,'2026-01-29 19:10:51'),(30,'Community Service','Student performs community service','community_service',0,0,1,'2026-01-29 19:10:51'),(31,'Counseling Session','Mandatory counseling session','counseling',0,0,1,'2026-01-29 19:10:51'),(32,'Parent Conference','Meeting with parents required','parent_meeting',0,0,1,'2026-01-29 19:10:51'),(33,'Expulsion','Permanent removal from school','expulsion',0,1,1,'2026-01-29 19:10:51');
/*!40000 ALTER TABLE `discipline_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline_analytics`
--

DROP TABLE IF EXISTS `discipline_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade` varchar(100) DEFAULT NULL,
  `class_level` varchar(50) DEFAULT NULL,
  `total_incidents` int(11) DEFAULT 0,
  `warnings` int(11) DEFAULT 0,
  `suspensions` int(11) DEFAULT 0,
  `absences` int(11) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_trade_level` (`trade`,`class_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline_analytics`
--

LOCK TABLES `discipline_analytics` WRITE;
/*!40000 ALTER TABLE `discipline_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `discipline_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline_appeals`
--

DROP TABLE IF EXISTS `discipline_appeals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_appeals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conduct_record_id` int(11) NOT NULL,
  `appealed_by` int(11) NOT NULL,
  `appeal_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `appeal_reason` text NOT NULL,
  `supporting_documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`supporting_documents`)),
  `reviewed_by` int(11) DEFAULT NULL,
  `review_date` timestamp NULL DEFAULT NULL,
  `decision` enum('pending','approved','rejected','modified') DEFAULT 'pending',
  `decision_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `appealed_by` (`appealed_by`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_conduct_record` (`conduct_record_id`),
  KEY `idx_decision` (`decision`),
  CONSTRAINT `discipline_appeals_ibfk_1` FOREIGN KEY (`conduct_record_id`) REFERENCES `student_conduct_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `discipline_appeals_ibfk_2` FOREIGN KEY (`appealed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `discipline_appeals_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline_appeals`
--

LOCK TABLES `discipline_appeals` WRITE;
/*!40000 ALTER TABLE `discipline_appeals` DISABLE KEYS */;
/*!40000 ALTER TABLE `discipline_appeals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline_cases`
--

DROP TABLE IF EXISTS `discipline_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_cases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `case_type` enum('ikosa_gito','ikosa_gikomeye','ikosa_cyane','ikosa_kibabaje') DEFAULT 'ikosa_gito',
  `description` text NOT NULL,
  `action_taken` text DEFAULT NULL,
  `status` enum('gishya','girakurikiranwa','byakemuwe','byahagaritswe') DEFAULT 'gishya',
  `severity` int(11) DEFAULT 1,
  `reported_by` int(11) DEFAULT NULL,
  `handled_by` int(11) DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline_cases`
--

LOCK TABLES `discipline_cases` WRITE;
/*!40000 ALTER TABLE `discipline_cases` DISABLE KEYS */;
/*!40000 ALTER TABLE `discipline_cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline_categories`
--

DROP TABLE IF EXISTS `discipline_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `severity_level` enum('minor','moderate','major','severe') DEFAULT 'moderate',
  `default_action` varchar(255) DEFAULT NULL,
  `points_deduction` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_severity` (`severity_level`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline_categories`
--

LOCK TABLES `discipline_categories` WRITE;
/*!40000 ALTER TABLE `discipline_categories` DISABLE KEYS */;
INSERT INTO `discipline_categories` VALUES (1,'Late Coming','Student arrives late to school or class','minor','Warning',5,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(2,'Uniform Violation','Improper uniform or dress code violation','minor','Warning',5,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(3,'Disrespect','Disrespectful behavior towards staff or students','moderate','Detention',10,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(4,'Fighting','Physical altercation with another student','major','Suspension',20,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(5,'Bullying','Harassment or intimidation of other students','major','Suspension',20,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(6,'Theft','Stealing school or personal property','severe','Suspension',30,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(7,'Substance Abuse','Use or possession of prohibited substances','severe','Suspension',30,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(8,'Vandalism','Damage to school property','major','Community Service',20,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(9,'Truancy','Unauthorized absence from school','moderate','Parent Meeting',10,1,'2026-01-29 19:03:29','2026-01-29 19:03:29'),(10,'Cheating','Academic dishonesty','moderate','Detention',10,1,'2026-01-29 19:03:29','2026-01-29 19:03:29');
/*!40000 ALTER TABLE `discipline_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline_conducts`
--

DROP TABLE IF EXISTS `discipline_conducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_conducts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `incident_date` date NOT NULL,
  `incident_time` time DEFAULT NULL,
  `incident_type` varchar(100) NOT NULL,
  `severity` enum('minor','moderate','serious','severe') NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `description` text NOT NULL,
  `mistake_details` text NOT NULL,
  `witness_names` text DEFAULT NULL,
  `reported_by` int(11) NOT NULL,
  `action_taken` text DEFAULT NULL,
  `conduct_points` int(11) DEFAULT 0,
  `parent_notified` tinyint(1) DEFAULT 0,
  `parent_notified_at` datetime DEFAULT NULL,
  `status` enum('active','resolved','removed') DEFAULT 'active',
  `removed_by` int(11) DEFAULT NULL,
  `removed_at` datetime DEFAULT NULL,
  `removal_reason` text DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reported_by` (`reported_by`),
  KEY `removed_by` (`removed_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_incident_date` (`incident_date`),
  CONSTRAINT `discipline_conducts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `discipline_conducts_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`),
  CONSTRAINT `discipline_conducts_ibfk_3` FOREIGN KEY (`removed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline_conducts`
--

LOCK TABLES `discipline_conducts` WRITE;
/*!40000 ALTER TABLE `discipline_conducts` DISABLE KEYS */;
/*!40000 ALTER TABLE `discipline_conducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline_incidents`
--

DROP TABLE IF EXISTS `discipline_incidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_incidents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `incident_type` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'open',
  `reported_by` int(11) DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_student` (`student_id`),
  CONSTRAINT `discipline_incidents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline_incidents`
--

LOCK TABLES `discipline_incidents` WRITE;
/*!40000 ALTER TABLE `discipline_incidents` DISABLE KEYS */;
/*!40000 ALTER TABLE `discipline_incidents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline_records`
--

DROP TABLE IF EXISTS `discipline_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `incident_date` date NOT NULL,
  `incident_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `action_taken` text DEFAULT NULL,
  `reported_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sms_sent` tinyint(1) DEFAULT 0,
  `sms_sent_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reported_by` (`reported_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_incident_date` (`incident_date`),
  CONSTRAINT `discipline_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `discipline_records_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline_records`
--

LOCK TABLES `discipline_records` WRITE;
/*!40000 ALTER TABLE `discipline_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `discipline_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discussion_forums`
--

DROP TABLE IF EXISTS `discussion_forums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discussion_forums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) DEFAULT NULL,
  `trade_class_id` int(11) DEFAULT NULL,
  `forum_title` varchar(255) NOT NULL,
  `forum_description` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `is_moderated` tinyint(1) DEFAULT 1,
  `post_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `trade_class_id` (`trade_class_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `discussion_forums_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `discussion_forums_ibfk_2` FOREIGN KEY (`trade_class_id`) REFERENCES `trade_classes` (`id`),
  CONSTRAINT `discussion_forums_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discussion_forums`
--

LOCK TABLES `discussion_forums` WRITE;
/*!40000 ALTER TABLE `discussion_forums` DISABLE KEYS */;
/*!40000 ALTER TABLE `discussion_forums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `districts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `province_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `name_en` varchar(100) DEFAULT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,1,'Gasabo','GSB','2026-02-10 05:00:28','Gasabo','Gasabo'),(2,1,'Kicukiro','KCK','2026-02-10 05:00:28','Kicukiro','Kicukiro'),(3,1,'Nyarugenge','NYR','2026-02-10 05:00:28','Nyarugenge','Nyarugenge');
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dod_activity_log`
--

DROP TABLE IF EXISTS `dod_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dod_activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(50) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dod_activity_log`
--

LOCK TABLES `dod_activity_log` WRITE;
/*!40000 ALTER TABLE `dod_activity_log` DISABLE KEYS */;
INSERT INTO `dod_activity_log` VALUES (1,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:03:53'),(2,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:11:51'),(3,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:16:03'),(4,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:17:56'),(5,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:18:14'),(6,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:21:13'),(7,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:22:37'),(8,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:25:04'),(9,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:31:15'),(10,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:40:42'),(11,0,'student_expelled','discipline','{\"student_id\":1,\"reason\":\"Test Expulsion\"}',NULL,'2026-01-26 17:41:12'),(12,0,'Guhindura profil','profil',NULL,NULL,'2026-01-28 04:05:14'),(13,1,'Gushyira ifoto','profil',NULL,NULL,'2026-01-28 15:00:39');
/*!40000 ALTER TABLE `dod_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dod_notifications`
--

DROP TABLE IF EXISTS `dod_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dod_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('ikosa','ibihano','ibizamini','sisiteme','amakuru') DEFAULT 'amakuru',
  `priority` enum('bihutirwa','byingenzi','bisanzwe') DEFAULT 'bisanzwe',
  `target_user` int(11) DEFAULT NULL,
  `target_role` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`target_user`),
  KEY `idx_read` (`is_read`),
  KEY `idx_type` (`notification_type`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dod_notifications`
--

LOCK TABLES `dod_notifications` WRITE;
/*!40000 ALTER TABLE `dod_notifications` DISABLE KEYS */;
INSERT INTO `dod_notifications` VALUES (1,'Ubutumwa bushya','Hari amakuru mashya akwiye kumenya','amakuru','byingenzi',NULL,'director_discipline',0,'2026-01-26 07:56:19'),(2,'Ikizamini gitegerejwe','Ikizamini cya Mathematics kizaba ku wa 15/06/2024','ibizamini','byingenzi',NULL,'director_discipline',0,'2026-01-26 07:56:19'),(3,'Ikizamini gitegerejwe','Ikizamini cya Physics kizaba ku wa 20/06/2024','ibizamini','byingenzi',NULL,'director_discipline',0,'2026-01-26 07:56:19'),(4,'Ikimenyetso cya sisiteme','Sisiteme yaravuguruwe neza','sisiteme','bisanzwe',NULL,'director_discipline',0,'2026-01-26 07:56:19'),(5,'Ubutumwa bushya','Hari amakuru mashya akwiye kumenya','amakuru','byingenzi',NULL,'director_discipline',0,'2026-01-26 08:10:54'),(6,'Ikizamini gitegerejwe','Ikizamini cya Mathematics kizaba ku wa 15/06/2024','ibizamini','byingenzi',NULL,'director_discipline',1,'2026-01-26 08:10:54'),(7,'Ikizamini gitegerejwe','Ikizamini cya Physics kizaba ku wa 20/06/2024','ibizamini','byingenzi',NULL,'director_discipline',0,'2026-01-26 08:10:54'),(8,'Ikimenyetso cya sisiteme','Sisiteme yaravuguruwe neza','sisiteme','bisanzwe',NULL,'director_discipline',0,'2026-01-26 08:10:54'),(9,'Ubutumwa bushya','Hari amakuru mashya akwiye kumenya','amakuru','byingenzi',NULL,'director_discipline',1,'2026-01-26 08:13:33'),(10,'Ikizamini gitegerejwe','Ikizamini cya Mathematics kizaba ku wa 15/06/2024','ibizamini','byingenzi',NULL,'director_discipline',1,'2026-01-26 08:13:33'),(11,'Ikizamini gitegerejwe','Ikizamini cya Physics kizaba ku wa 20/06/2024','ibizamini','byingenzi',NULL,'director_discipline',0,'2026-01-26 08:13:33'),(12,'Ikimenyetso cya sisiteme','Sisiteme yaravuguruwe neza','sisiteme','bisanzwe',NULL,'director_discipline',0,'2026-01-26 08:13:33'),(13,'Ubutumwa bushya','Hari amakuru mashya akwiye kumenya','amakuru','byingenzi',NULL,'director_discipline',1,'2026-01-26 08:22:19'),(14,'Ikizamini gitegerejwe','Ikizamini cya Mathematics kizaba ku wa 15/06/2024','ibizamini','byingenzi',NULL,'director_discipline',1,'2026-01-26 08:22:19'),(15,'Ikizamini gitegerejwe','Ikizamini cya Physics kizaba ku wa 20/06/2024','ibizamini','byingenzi',NULL,'director_discipline',1,'2026-01-26 08:22:19'),(16,'Ikimenyetso cya sisiteme','Sisiteme yaravuguruwe neza','sisiteme','bisanzwe',NULL,'director_discipline',1,'2026-01-26 08:22:19');
/*!40000 ALTER TABLE `dod_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dormitory_assignments`
--

DROP TABLE IF EXISTS `dormitory_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dormitory_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `dormitory_name` varchar(100) NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `bed_number` varchar(20) DEFAULT NULL,
  `assigned_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_dormitory` (`dormitory_name`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `dormitory_assignments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dormitory_assignments_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dormitory_assignments`
--

LOCK TABLES `dormitory_assignments` WRITE;
/*!40000 ALTER TABLE `dormitory_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `dormitory_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dormitory_inspections`
--

DROP TABLE IF EXISTS `dormitory_inspections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dormitory_inspections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dormitory_name` varchar(100) NOT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `inspection_date` date NOT NULL,
  `inspection_time` time DEFAULT NULL,
  `inspector_id` int(11) NOT NULL,
  `cleanliness_score` int(11) DEFAULT 0,
  `organization_score` int(11) DEFAULT 0,
  `discipline_score` int(11) DEFAULT 0,
  `total_score` int(11) DEFAULT 0,
  `issues_found` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `students_present` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`students_present`)),
  `status` enum('passed','warning','failed') DEFAULT 'passed',
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `inspector_id` (`inspector_id`),
  KEY `idx_dormitory` (`dormitory_name`),
  KEY `idx_inspection_date` (`inspection_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `dormitory_inspections_ibfk_1` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dormitory_inspections`
--

LOCK TABLES `dormitory_inspections` WRITE;
/*!40000 ALTER TABLE `dormitory_inspections` DISABLE KEYS */;
/*!40000 ALTER TABLE `dormitory_inspections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_analytics_cache`
--

DROP TABLE IF EXISTS `dos_analytics_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_analytics_cache` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cache_key` varchar(200) NOT NULL,
  `cache_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`cache_data`)),
  `trade_code` varchar(20) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cache_key` (`cache_key`),
  KEY `idx_key` (`cache_key`),
  KEY `idx_class` (`trade_code`,`level_number`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_analytics_cache`
--

LOCK TABLES `dos_analytics_cache` WRITE;
/*!40000 ALTER TABLE `dos_analytics_cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `dos_analytics_cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_bulk_report_queue`
--

DROP TABLE IF EXISTS `dos_bulk_report_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_bulk_report_queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_id` varchar(100) NOT NULL,
  `trade_code` varchar(20) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `total_students` int(11) DEFAULT 0,
  `processed_students` int(11) DEFAULT 0,
  `failed_students` int(11) DEFAULT 0,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `started_by` int(11) DEFAULT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_batch` (`batch_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_bulk_report_queue`
--

LOCK TABLES `dos_bulk_report_queue` WRITE;
/*!40000 ALTER TABLE `dos_bulk_report_queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `dos_bulk_report_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_classes`
--

DROP TABLE IF EXISTS `dos_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `trade_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT 30,
  `current_students` int(11) DEFAULT 0,
  `academic_year` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `trade_id` (`trade_id`),
  CONSTRAINT `dos_classes_ibfk_1` FOREIGN KEY (`trade_id`) REFERENCES `dos_trades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_classes`
--

LOCK TABLES `dos_classes` WRITE;
/*!40000 ALTER TABLE `dos_classes` DISABLE KEYS */;
INSERT INTO `dos_classes` VALUES (1,'SOD Year 1 A','SOD1A',1,1,30,0,'2024-2025',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(2,'SOD Year 2 A','SOD2A',1,2,28,0,'2024-2025',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(3,'BDC Year 1 A','BDC1A',2,1,25,0,'2024-2025',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(4,'AUT Year 1 A','AUT1A',3,1,20,0,'2024-2025',1,'2026-01-23 09:04:36','2026-01-23 09:04:36');
/*!40000 ALTER TABLE `dos_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_courses`
--

DROP TABLE IF EXISTS `dos_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `trade_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `credits` int(11) DEFAULT 3,
  `hours_per_week` int(11) DEFAULT 4,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `trade_id` (`trade_id`),
  CONSTRAINT `dos_courses_ibfk_1` FOREIGN KEY (`trade_id`) REFERENCES `dos_trades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_courses`
--

LOCK TABLES `dos_courses` WRITE;
/*!40000 ALTER TABLE `dos_courses` DISABLE KEYS */;
INSERT INTO `dos_courses` VALUES (1,'Introduction to Programming','SOD101',1,1,4,6,'Basic programming concepts',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(2,'Web Development','SOD102',1,1,3,4,'HTML, CSS, JavaScript basics',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(3,'Database Systems','SOD201',1,2,4,5,'SQL and database design',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(4,'Building Materials','BDC101',2,1,3,4,'Construction materials study',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(5,'Automotive Basics','AUT101',3,1,3,5,'Vehicle systems overview',1,'2026-01-23 09:04:36','2026-01-23 09:04:36');
/*!40000 ALTER TABLE `dos_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_parent_sms_notifications`
--

DROP TABLE IF EXISTS `dos_parent_sms_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_parent_sms_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `parent_phone` varchar(20) NOT NULL,
  `parent_name` varchar(200) DEFAULT NULL,
  `message_type` enum('report_card','discipline','attendance','fee_reminder','general') NOT NULL,
  `message_content` text NOT NULL,
  `sms_status` enum('pending','sent','delivered','failed') DEFAULT 'pending',
  `sms_provider` varchar(50) DEFAULT NULL,
  `sms_id` varchar(100) DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `sent_by` int(11) DEFAULT NULL,
  `sent_by_name` varchar(200) DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivered_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_phone` (`parent_phone`),
  KEY `idx_status` (`sms_status`),
  KEY `idx_type` (`message_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_parent_sms_notifications`
--

LOCK TABLES `dos_parent_sms_notifications` WRITE;
/*!40000 ALTER TABLE `dos_parent_sms_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `dos_parent_sms_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_report_cards`
--

DROP TABLE IF EXISTS `dos_report_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_report_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `student_name` varchar(200) DEFAULT NULL,
  `trade_code` varchar(20) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `total_subjects` int(11) DEFAULT 0,
  `total_marks` decimal(10,2) DEFAULT 0.00,
  `average_marks` decimal(10,2) DEFAULT 0.00,
  `percentage` decimal(5,2) DEFAULT 0.00,
  `gpa` decimal(3,2) DEFAULT 0.00,
  `overall_grade` varchar(5) DEFAULT NULL,
  `class_rank` int(11) DEFAULT NULL,
  `total_students` int(11) DEFAULT NULL,
  `attendance_rate` decimal(5,2) DEFAULT NULL,
  `days_present` int(11) DEFAULT NULL,
  `days_absent` int(11) DEFAULT NULL,
  `days_late` int(11) DEFAULT NULL,
  `conduct_score` decimal(5,2) DEFAULT NULL,
  `conduct_grade` varchar(5) DEFAULT NULL,
  `total_incidents` int(11) DEFAULT NULL,
  `class_teacher_comment` text DEFAULT NULL,
  `dos_comment` text DEFAULT NULL,
  `principal_comment` text DEFAULT NULL,
  `pdf_path` varchar(500) DEFAULT NULL,
  `pdf_generated` tinyint(1) DEFAULT 0,
  `status` enum('draft','generated','sent_to_parent','printed') DEFAULT 'draft',
  `generated_by` int(11) DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report` (`student_id`,`term`,`academic_year`),
  KEY `idx_student` (`student_id`),
  KEY `idx_class` (`trade_code`,`level_number`),
  KEY `idx_term` (`term`,`academic_year`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_report_cards`
--

LOCK TABLES `dos_report_cards` WRITE;
/*!40000 ALTER TABLE `dos_report_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `dos_report_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_teacher_class_assignments`
--

DROP TABLE IF EXISTS `dos_teacher_class_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_teacher_class_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `teacher_name` varchar(200) DEFAULT NULL,
  `trade_code` varchar(20) NOT NULL,
  `level_number` int(11) NOT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `role` enum('class_teacher','subject_teacher','assistant') DEFAULT 'subject_teacher',
  `academic_year` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_teacher` (`teacher_id`),
  KEY `idx_class` (`trade_code`,`level_number`),
  KEY `idx_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_teacher_class_assignments`
--

LOCK TABLES `dos_teacher_class_assignments` WRITE;
/*!40000 ALTER TABLE `dos_teacher_class_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `dos_teacher_class_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_teacher_course_assignments`
--

DROP TABLE IF EXISTS `dos_teacher_course_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_teacher_course_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `teacher_name` varchar(200) DEFAULT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `trade_code` varchar(20) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_assignment` (`teacher_id`,`subject_code`,`trade_code`,`level_number`,`academic_year`),
  KEY `idx_teacher` (`teacher_id`),
  KEY `idx_subject` (`subject_code`),
  KEY `idx_class` (`trade_code`,`level_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_teacher_course_assignments`
--

LOCK TABLES `dos_teacher_course_assignments` WRITE;
/*!40000 ALTER TABLE `dos_teacher_course_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `dos_teacher_course_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_teachers`
--

DROP TABLE IF EXISTS `dos_teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `employee_id` varchar(50) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_teachers`
--

LOCK TABLES `dos_teachers` WRITE;
/*!40000 ALTER TABLE `dos_teachers` DISABLE KEYS */;
INSERT INTO `dos_teachers` VALUES (1,'Jean','Mugisha','j.mugisha@gardentvet.rw','0788123456','Programming','MSc Computer Science',5,'T001','2020-01-15',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(2,'Marie','Uwase','m.uwase@gardentvet.rw','0788234567','Mathematics','BSc Mathematics',3,'T002','2021-03-10',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(3,'Patrick','Nkusi','p.nkusi@gardentvet.rw','0788345678','Construction','BSc Civil Engineering',7,'T003','2019-08-20',1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(4,'Grace','Mukamana','g.mukamana@gardentvet.rw','0788456789','Automotive','Diploma Automotive Tech',4,'T004','2020-09-01',1,'2026-01-23 09:04:36','2026-01-23 09:04:36');
/*!40000 ALTER TABLE `dos_teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_timetable_slots`
--

DROP TABLE IF EXISTS `dos_timetable_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_timetable_slots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timetable_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `period_number` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `subject_name` varchar(100) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `teacher_name` varchar(200) DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_timetable` (`timetable_id`),
  KEY `idx_day` (`day_of_week`),
  KEY `idx_teacher` (`teacher_id`),
  CONSTRAINT `dos_timetable_slots_ibfk_1` FOREIGN KEY (`timetable_id`) REFERENCES `dos_timetables` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_timetable_slots`
--

LOCK TABLES `dos_timetable_slots` WRITE;
/*!40000 ALTER TABLE `dos_timetable_slots` DISABLE KEYS */;
/*!40000 ALTER TABLE `dos_timetable_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_timetables`
--

DROP TABLE IF EXISTS `dos_timetables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_timetables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timetable_name` varchar(200) NOT NULL,
  `trade_code` varchar(20) NOT NULL,
  `level_number` int(11) NOT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('draft','active','archived') DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_class` (`trade_code`,`level_number`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_timetables`
--

LOCK TABLES `dos_timetables` WRITE;
/*!40000 ALTER TABLE `dos_timetables` DISABLE KEYS */;
/*!40000 ALTER TABLE `dos_timetables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dos_trades`
--

DROP TABLE IF EXISTS `dos_trades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dos_trades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `duration_years` int(11) DEFAULT 3,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dos_trades`
--

LOCK TABLES `dos_trades` WRITE;
/*!40000 ALTER TABLE `dos_trades` DISABLE KEYS */;
INSERT INTO `dos_trades` VALUES (1,'Software Development','SOD','Learn programming and software engineering',3,1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(2,'Building Construction','BDC','Construction and civil engineering',3,1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(3,'Automotive Technology','AUT','Vehicle mechanics and maintenance',3,1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(4,'Electrical Installation','ELI','Electrical systems and installation',3,1,'2026-01-23 09:04:36','2026-01-23 09:04:36');
/*!40000 ALTER TABLE `dos_trades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_content`
--

DROP TABLE IF EXISTS `dynamic_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page` varchar(50) NOT NULL,
  `section` varchar(50) NOT NULL,
  `content_key` varchar(100) NOT NULL,
  `content_value` text NOT NULL,
  `content_type` enum('text','image','html','json') DEFAULT 'text',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_content` (`page`,`section`,`content_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_content`
--

LOCK TABLES `dynamic_content` WRITE;
/*!40000 ALTER TABLE `dynamic_content` DISABLE KEYS */;
/*!40000 ALTER TABLE `dynamic_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_logs`
--

DROP TABLE IF EXISTS `email_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_email` varchar(255) NOT NULL,
  `subject` varchar(500) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_logs`
--

LOCK TABLES `email_logs` WRITE;
/*!40000 ALTER TABLE `email_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_messages`
--

DROP TABLE IF EXISTS `email_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` enum('pending','scheduled','sent','failed') DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled` (`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_messages`
--

LOCK TABLES `email_messages` WRITE;
/*!40000 ALTER TABLE `email_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_templates`
--

DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_templates`
--

LOCK TABLES `email_templates` WRITE;
/*!40000 ALTER TABLE `email_templates` DISABLE KEYS */;
INSERT INTO `email_templates` VALUES (1,'Welcome Email','Welcome to {{school_name}}','Dear {{student_name}}, Welcome to our school...','[\"school_name\",\"student_name\"]',1,'2026-01-24 04:40:52'),(2,'Exam Reminder','Upcoming Exam: {{exam_name}}','This is a reminder about your exam on {{exam_date}}...','[\"exam_name\",\"exam_date\"]',1,'2026-01-24 04:40:52'),(3,'Grade Report','Your Grade Report for {{term}}','Dear {{student_name}}, Your grades for {{term}} are now available...','[\"student_name\",\"term\"]',1,'2026-01-24 04:40:52');
/*!40000 ALTER TABLE `email_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergency_contacts`
--

DROP TABLE IF EXISTS `emergency_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `emergency_contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `contact_name` varchar(100) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `phone_primary` varchar(20) NOT NULL,
  `phone_secondary` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `priority_order` int(11) DEFAULT 1,
  `can_pickup` tinyint(1) DEFAULT 0,
  `medical_authority` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergency_contacts`
--

LOCK TABLES `emergency_contacts` WRITE;
/*!40000 ALTER TABLE `emergency_contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `emergency_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_attendance`
--

DROP TABLE IF EXISTS `employee_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `status` enum('present','absent','late','half_day') DEFAULT 'present',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_date` (`employee_id`,`date`),
  KEY `idx_date` (`date`),
  CONSTRAINT `employee_attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_attendance`
--

LOCK TABLES `employee_attendance` WRITE;
/*!40000 ALTER TABLE `employee_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `engagement_metrics`
--

DROP TABLE IF EXISTS `engagement_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `engagement_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `login_count` int(11) DEFAULT 0,
  `session_duration_minutes` int(11) DEFAULT 0,
  `assignments_completed` int(11) DEFAULT 0,
  `quizzes_attempted` int(11) DEFAULT 0,
  `engagement_score` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_date` (`student_id`,`date`),
  CONSTRAINT `engagement_metrics_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `engagement_metrics`
--

LOCK TABLES `engagement_metrics` WRITE;
/*!40000 ALTER TABLE `engagement_metrics` DISABLE KEYS */;
/*!40000 ALTER TABLE `engagement_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `enrollment_date` date NOT NULL,
  `status` enum('active','completed','dropped','suspended') DEFAULT 'active',
  `completion_date` date DEFAULT NULL,
  `final_grade` varchar(5) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`student_id`,`class_id`,`academic_year_id`),
  KEY `class_id` (`class_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (2,1,1,1,'2026-01-26','active',NULL,NULL,'2026-01-26 17:24:11','2026-01-26 17:24:11'),(4,27,1,1,'2026-01-27','active',NULL,NULL,'2026-01-27 15:02:43','2026-01-27 15:02:43'),(5,28,1,1,'2026-01-27','active',NULL,NULL,'2026-01-27 15:02:43','2026-01-27 15:02:43');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_announcements`
--

DROP TABLE IF EXISTS `event_announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `target_audience` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `event_announcements_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_announcements`
--

LOCK TABLES `event_announcements` WRITE;
/*!40000 ALTER TABLE `event_announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_attendees`
--

DROP TABLE IF EXISTS `event_attendees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_attendees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('registered','attended','cancelled') DEFAULT 'registered',
  `check_in_time` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event_user` (`event_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `event_attendees_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_attendees`
--

LOCK TABLES `event_attendees` WRITE;
/*!40000 ALTER TABLE `event_attendees` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_attendees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_certificates`
--

DROP TABLE IF EXISTS `event_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `certificate_url` varchar(500) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `event_certificates_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_certificates_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_certificates`
--

LOCK TABLES `event_certificates` WRITE;
/*!40000 ALTER TABLE `event_certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_feedback`
--

DROP TABLE IF EXISTS `event_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comments` text DEFAULT NULL,
  `feedback_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `event_feedback_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_feedback_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_feedback`
--

LOCK TABLES `event_feedback` WRITE;
/*!40000 ALTER TABLE `event_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_images`
--

DROP TABLE IF EXISTS `event_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `event_images_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_images`
--

LOCK TABLES `event_images` WRITE;
/*!40000 ALTER TABLE `event_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_participants`
--

DROP TABLE IF EXISTS `event_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `attendance_status` enum('registered','attended','absent','cancelled') DEFAULT 'registered',
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  CONSTRAINT `event_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_participants`
--

LOCK TABLES `event_participants` WRITE;
/*!40000 ALTER TABLE `event_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `title_rw` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `event_type` varchar(50) DEFAULT NULL,
  `priority` varchar(20) DEFAULT NULL,
  `organizer` varchar(100) DEFAULT NULL,
  `organizer_rw` varchar(100) DEFAULT NULL,
  `contact_info` varchar(100) DEFAULT NULL,
  `max_attendees` int(11) DEFAULT NULL,
  `current_attendees` int(11) DEFAULT 0,
  `status` varchar(20) DEFAULT 'upcoming',
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Parent-Teacher Meeting','Inama y\'Ababyeyi n\'Abarimu','Monthly meeting between parents and teachers','Inama y\'ukwezi ihuza ababyeyi n\'abarimu','2026-01-25','14:00:00','Main Hall','academic','high','School Administration','Abayobozi b\'Ishuri','admin@school.rw',200,0,'upcoming',1,1,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(2,'Mid-term Exams','Imirimo y\'Icyiciro cya Kabiri','Mid-term examinations for all classes','Imirimo y\'icyiciro cya kabiri ku mashuri yose','2026-01-28','08:00:00','All Classrooms','academic','high','Academic Department','Ishami ry\'Amashuri','academic@school.rw',NULL,0,'upcoming',1,2,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(3,'Basketball Championship','Igikombe cya Basketball','Regional basketball championship finals','Impera z\'igikombe cya basketball cy\'akarere','2026-02-01','14:00:00','Kibagabaga Stadium','sports','medium','Sports Department','Ishami ry\'Imikino','sports@school.rw',500,0,'upcoming',1,3,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(4,'Athletics Competition','Marushanwa y\'Imikino Ngororamubiri','Inter-school athletics competition','Marushanwa y\'imikino ngororamubiri hagati y\'amashuri','2026-02-05','08:00:00','Nyamirambo Stadium','sports','medium','PE Department','Ishami ry\'Imikino Ngororamubiri','pe@school.rw',300,0,'upcoming',1,4,'2026-01-27 07:48:18','2026-01-27 07:48:18');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_invigilators`
--

DROP TABLE IF EXISTS `exam_invigilators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_invigilators` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_assignment` (`session_id`,`teacher_id`),
  CONSTRAINT `exam_invigilators_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `exam_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_invigilators`
--

LOCK TABLES `exam_invigilators` WRITE;
/*!40000 ALTER TABLE `exam_invigilators` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_invigilators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_monitoring`
--

DROP TABLE IF EXISTS `exam_monitoring`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_monitoring` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `exam_name` varchar(255) NOT NULL,
  `exam_date` date NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `status` enum('biteguwe','biratangira','byarangiye','byahagaritswe') DEFAULT 'biteguwe',
  `students_count` int(11) DEFAULT 0,
  `issues_reported` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_date` (`exam_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_monitoring`
--

LOCK TABLES `exam_monitoring` WRITE;
/*!40000 ALTER TABLE `exam_monitoring` DISABLE KEYS */;
INSERT INTO `exam_monitoring` VALUES (1,0,'Ikizamini cya Mathematics','2024-06-15','Icyumba A101',NULL,'biratangira',45,NULL,NULL,'2026-01-26 07:56:19'),(2,0,'Ikizamini cya Physics','2024-06-20','Icyumba B205',NULL,'biteguwe',38,0,NULL,'2026-01-26 07:56:19'),(3,0,'Ikizamini cya Mathematics','2024-06-15','Icyumba A101',NULL,'byarangiye',45,NULL,NULL,'2026-01-26 08:10:54'),(4,0,'Ikizamini cya Physics','2024-06-20','Icyumba B205',NULL,'biteguwe',38,0,NULL,'2026-01-26 08:10:54'),(5,0,'Ikizamini cya Mathematics','2024-06-15','Icyumba A101',NULL,'biratangira',45,NULL,NULL,'2026-01-26 08:13:33'),(6,0,'Ikizamini cya Physics','2024-06-20','Icyumba B205',NULL,'biteguwe',38,0,NULL,'2026-01-26 08:13:33'),(7,0,'Ikizamini cya Mathematics','2024-06-15','Icyumba A101',NULL,'biteguwe',45,0,NULL,'2026-01-26 08:22:19'),(8,0,'Ikizamini cya Physics','2024-06-20','Icyumba B205',NULL,'biteguwe',38,0,NULL,'2026-01-26 08:22:19');
/*!40000 ALTER TABLE `exam_monitoring` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_registrations`
--

DROP TABLE IF EXISTS `exam_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `registration_date` datetime DEFAULT current_timestamp(),
  `status` enum('registered','appeared','absent','cancelled') DEFAULT 'registered',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`exam_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `exam_registrations_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`),
  CONSTRAINT `exam_registrations_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_registrations`
--

LOCK TABLES `exam_registrations` WRITE;
/*!40000 ALTER TABLE `exam_registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_results`
--

DROP TABLE IF EXISTS `exam_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `obtained_marks` decimal(5,2) DEFAULT NULL,
  `grade_letter` varchar(5) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `rank` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `result_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_result` (`exam_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`),
  CONSTRAINT `exam_results_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_results`
--

LOCK TABLES `exam_results` WRITE;
/*!40000 ALTER TABLE `exam_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_schedules`
--

DROP TABLE IF EXISTS `exam_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_name` varchar(200) NOT NULL,
  `exam_type` varchar(100) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `term` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('draft','published','completed') DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_schedules`
--

LOCK TABLES `exam_schedules` WRITE;
/*!40000 ALTER TABLE `exam_schedules` DISABLE KEYS */;
INSERT INTO `exam_schedules` VALUES (1,'Exam','Regular','2026','1','2026-01-28','2026-01-28','draft',NULL,NULL,'2026-01-28 12:50:23','2026-01-28 12:50:23'),(2,'Exam','Regular','2026','1','2026-01-28','2026-01-28','draft',NULL,NULL,'2026-01-28 12:53:55','2026-01-28 12:53:55'),(3,'Exam','Regular','2026','1','2026-01-28','2026-01-28','draft',NULL,NULL,'2026-01-28 12:58:15','2026-01-28 12:58:15'),(4,'Exam','Regular','2026','1','2026-01-28','2026-01-28','draft',NULL,NULL,'2026-01-28 13:12:09','2026-01-28 13:12:09'),(5,'Exam','Regular','2026','1','2026-01-28','2026-01-28','draft',NULL,NULL,'2026-01-28 14:27:14','2026-01-28 14:27:14'),(6,'Exam','Regular','2026','1','2026-01-28','2026-01-28','draft',NULL,NULL,'2026-01-28 14:58:33','2026-01-28 14:58:33');
/*!40000 ALTER TABLE `exam_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_sessions`
--

DROP TABLE IF EXISTS `exam_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_name` varchar(100) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `exam_type` enum('mid-term','end-term','final','quiz','mock') DEFAULT 'end-term',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('scheduled','ongoing','completed','cancelled') DEFAULT 'scheduled',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `academic_year_id` (`academic_year_id`),
  KEY `idx_status` (`status`),
  KEY `idx_exam_type` (`exam_type`),
  CONSTRAINT `exam_sessions_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_sessions`
--

LOCK TABLES `exam_sessions` WRITE;
/*!40000 ALTER TABLE `exam_sessions` DISABLE KEYS */;
INSERT INTO `exam_sessions` VALUES (1,'Mid-Term Exams 2025-2026',1,'mid-term','2025-11-15','2025-11-30','scheduled',NULL,'2026-01-24 05:02:47','2026-01-24 05:02:47'),(2,'End-Term Exams 2025-2026',1,'end-term','2026-03-01','2026-03-15','scheduled',NULL,'2026-01-24 05:02:47','2026-01-24 05:02:47');
/*!40000 ALTER TABLE `exam_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_schedule`
--

DROP TABLE IF EXISTS `examination_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `examination_schedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_name` varchar(255) NOT NULL,
  `exam_type` enum('quiz','midterm','final','practical') NOT NULL,
  `trade` varchar(100) DEFAULT NULL,
  `class_level` varchar(50) DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `exam_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `invigilator_id` int(11) DEFAULT NULL,
  `status` enum('scheduled','ongoing','completed','cancelled') DEFAULT 'scheduled',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `invigilator_id` (`invigilator_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `examination_schedule_ibfk_1` FOREIGN KEY (`invigilator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `examination_schedule_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_schedule`
--

LOCK TABLES `examination_schedule` WRITE;
/*!40000 ALTER TABLE `examination_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `examination_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `title_rw` varchar(255) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `trade` enum('SOD','BDC','AUT','General') DEFAULT NULL,
  `level` varchar(50) DEFAULT NULL,
  `exam_type` enum('midterm','final','quiz','practical') NOT NULL,
  `exam_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `room` varchar(100) DEFAULT NULL,
  `instructor_id` int(11) DEFAULT NULL,
  `total_marks` int(11) NOT NULL,
  `passing_marks` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `topics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`topics`)),
  `materials` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`materials`)),
  `rules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rules`)),
  `status` enum('upcoming','ongoing','completed','grading') DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `course_id` (`course_id`),
  KEY `subject_id` (`subject_id`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `trade_courses` (`id`),
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `exams_ibfk_3` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `expense_date` date NOT NULL,
  `payment_method` enum('cash','bank','mobile_money','card') NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected','paid') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `processed_by` (`processed_by`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `features`
--

DROP TABLE IF EXISTS `features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `features`
--

LOCK TABLES `features` WRITE;
/*!40000 ALTER TABLE `features` DISABLE KEYS */;
INSERT INTO `features` VALUES (1,'Quality Education','Industry-standard curriculum and experienced instructors','GraduationCap',1,1,'2026-01-23 10:01:24'),(2,'Modern Facilities','State-of-the-art labs and equipment','Building2',2,1,'2026-01-23 10:01:24'),(3,'Career Support','Job placement assistance and internships','Briefcase',3,1,'2026-01-23 10:01:24'),(4,'Flexible Learning','Day and evening classes available','Clock',4,1,'2026-01-23 10:01:24');
/*!40000 ALTER TABLE `features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_payments`
--

DROP TABLE IF EXISTS `fee_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fee_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `academic_year_id` int(11) DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `remaining_amount` decimal(15,2) DEFAULT 0.00,
  `transaction_code` varchar(100) DEFAULT NULL,
  `fee_structure_id` int(11) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('cash','bank_transfer','mobile_money','card') NOT NULL,
  `transaction_reference` varchar(100) DEFAULT NULL,
  `receipt_number` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'unpaid',
  `received_by` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `student_id` (`student_id`),
  KEY `fee_structure_id` (`fee_structure_id`),
  KEY `received_by` (`received_by`),
  CONSTRAINT `fee_payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fee_payments_ibfk_2` FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structures` (`id`),
  CONSTRAINT `fee_payments_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_payments`
--

LOCK TABLES `fee_payments` WRITE;
/*!40000 ALTER TABLE `fee_payments` DISABLE KEYS */;
INSERT INTO `fee_payments` VALUES (7,1,1,'Term 1',500000.00,500000.00,0.00,'TEST_TXN_999',1,200000.00,'2026-01-26','bank_transfer',NULL,NULL,'paid',4,NULL,'2026-01-26 17:27:56','2026-01-26 17:27:56');
/*!40000 ALTER TABLE `fee_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_structure`
--

DROP TABLE IF EXISTS `fee_structure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fee_structure` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) DEFAULT NULL,
  `fee_type` enum('tuition','exam','library','hostel','transport','other') DEFAULT 'tuition',
  `amount` decimal(10,2) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `term` enum('1','2','3') DEFAULT '1',
  `description` text DEFAULT NULL,
  `is_mandatory` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `fee_structure_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `trade_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_structure`
--

LOCK TABLES `fee_structure` WRITE;
/*!40000 ALTER TABLE `fee_structure` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_structure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_structures`
--

DROP TABLE IF EXISTS `fee_structures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fee_structures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `fee_type_id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date_offset_days` int(11) DEFAULT 30,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_fee_structure` (`course_id`,`fee_type_id`,`academic_year_id`),
  KEY `fee_type_id` (`fee_type_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `fee_structures_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `fee_structures_ibfk_2` FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types` (`id`),
  CONSTRAINT `fee_structures_ibfk_3` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_structures`
--

LOCK TABLES `fee_structures` WRITE;
/*!40000 ALTER TABLE `fee_structures` DISABLE KEYS */;
INSERT INTO `fee_structures` VALUES (1,1,1,1,500000.00,30,1,'2026-01-26 17:27:56','2026-01-26 17:27:56'),(2,1,2,1,50000.00,30,1,'2026-01-26 17:27:56','2026-01-26 17:27:56'),(3,1,3,1,100000.00,30,1,'2026-01-26 17:27:56','2026-01-26 17:27:56');
/*!40000 ALTER TABLE `fee_structures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_types`
--

DROP TABLE IF EXISTS `fee_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fee_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 1,
  `recurrence_period` enum('monthly','quarterly','semester','annual') DEFAULT 'monthly',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_types`
--

LOCK TABLES `fee_types` WRITE;
/*!40000 ALTER TABLE `fee_types` DISABLE KEYS */;
INSERT INTO `fee_types` VALUES (1,'Tuition Fee','Main school fees',1,'semester',1,'2026-01-26 17:27:56','2026-01-26 17:27:56'),(2,'Library Fee','Access to library',0,'annual',1,'2026-01-26 17:27:56','2026-01-26 17:27:56'),(3,'Computer Lab Fee','Lab maintenance',1,'semester',1,'2026-01-26 17:27:56','2026-01-26 17:27:56');
/*!40000 ALTER TABLE `fee_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fees`
--

DROP TABLE IF EXISTS `fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `fee_type` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('paid','pending','overdue','partial') DEFAULT 'pending',
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  CONSTRAINT `fees_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fees`
--

LOCK TABLES `fees` WRITE;
/*!40000 ALTER TABLE `fees` DISABLE KEYS */;
/*!40000 ALTER TABLE `fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_analytics`
--

DROP TABLE IF EXISTS `financial_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `financial_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `analysis_date` date NOT NULL,
  `total_fees_due` decimal(12,2) DEFAULT 0.00,
  `total_fees_collected` decimal(12,2) DEFAULT 0.00,
  `total_fees_pending` decimal(12,2) DEFAULT 0.00,
  `total_fees_overdue` decimal(12,2) DEFAULT 0.00,
  `collection_rate` decimal(5,2) DEFAULT NULL,
  `students_with_pending_fees` int(11) DEFAULT 0,
  `students_with_overdue_fees` int(11) DEFAULT 0,
  `cafeteria_revenue` decimal(12,2) DEFAULT 0.00,
  `transport_revenue` decimal(12,2) DEFAULT 0.00,
  `library_fines` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_analysis_date` (`analysis_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_analytics`
--

LOCK TABLES `financial_analytics` WRITE;
/*!40000 ALTER TABLE `financial_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `financial_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_reports`
--

DROP TABLE IF EXISTS `financial_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `financial_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_type` enum('income','expense','balance','profit_loss','cash_flow') NOT NULL,
  `report_period` varchar(50) NOT NULL,
  `total_income` decimal(15,2) DEFAULT 0.00,
  `total_expense` decimal(15,2) DEFAULT 0.00,
  `net_balance` decimal(15,2) DEFAULT 0.00,
  `generated_by` int(11) DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `generated_by` (`generated_by`),
  CONSTRAINT `financial_reports_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_reports`
--

LOCK TABLES `financial_reports` WRITE;
/*!40000 ALTER TABLE `financial_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `financial_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_categories`
--

DROP TABLE IF EXISTS `forum_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forum_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_categories`
--

LOCK TABLES `forum_categories` WRITE;
/*!40000 ALTER TABLE `forum_categories` DISABLE KEYS */;
INSERT INTO `forum_categories` VALUES (1,'General Discussion','general','General school-related discussions',NULL,1,1,'2026-01-28 04:19:01','2026-01-28 04:19:01'),(2,'Academic Help','academic-help','Get help with your studies',NULL,2,1,'2026-01-28 04:19:01','2026-01-28 04:19:01'),(3,'Technical Support','tech-support','Technical and IT support',NULL,3,1,'2026-01-28 04:19:01','2026-01-28 04:19:01'),(4,'Announcements','announcements','Official school announcements',NULL,4,1,'2026-01-28 04:19:01','2026-01-28 04:19:01');
/*!40000 ALTER TABLE `forum_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_posts`
--

DROP TABLE IF EXISTS `forum_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forum_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `forum_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `is_pinned` tinyint(1) DEFAULT 0,
  `is_locked` tinyint(1) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_forum` (`forum_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `forum_posts_ibfk_1` FOREIGN KEY (`forum_id`) REFERENCES `discussion_forums` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_posts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_posts`
--

LOCK TABLES `forum_posts` WRITE;
/*!40000 ALTER TABLE `forum_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_replies`
--

DROP TABLE IF EXISTS `forum_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forum_replies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topic_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `is_solution` tinyint(1) DEFAULT 0,
  `upvotes` int(11) DEFAULT 0,
  `downvotes` int(11) DEFAULT 0,
  `is_edited` tinyint(1) DEFAULT 0,
  `edited_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_topic` (`topic_id`),
  KEY `idx_author` (`author_id`),
  CONSTRAINT `forum_replies_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `forum_topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_replies`
--

LOCK TABLES `forum_replies` WRITE;
/*!40000 ALTER TABLE `forum_replies` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_topics`
--

DROP TABLE IF EXISTS `forum_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forum_topics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `slug` varchar(500) NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `is_pinned` tinyint(1) DEFAULT 0,
  `is_locked` tinyint(1) DEFAULT 0,
  `is_solved` tinyint(1) DEFAULT 0,
  `views_count` int(11) DEFAULT 0,
  `replies_count` int(11) DEFAULT 0,
  `last_reply_at` timestamp NULL DEFAULT NULL,
  `last_reply_by` int(11) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `status` enum('active','closed','archived') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category` (`category_id`),
  KEY `idx_author` (`author_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `forum_topics_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `forum_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_topics`
--

LOCK TABLES `forum_topics` WRITE;
/*!40000 ALTER TABLE `forum_topics` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_category` (`category`),
  FULLTEXT KEY `ft_title` (`title`),
  FULLTEXT KEY `ft_description` (`description`),
  CONSTRAINT `gallery_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery`
--

LOCK TABLES `gallery` WRITE;
/*!40000 ALTER TABLE `gallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery_images`
--

DROP TABLE IF EXISTS `gallery_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gallery_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL DEFAULT 'Campus Image',
  `title_rw` varchar(255) DEFAULT 'Ifoto y Ikigo',
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_images`
--

LOCK TABLES `gallery_images` WRITE;
/*!40000 ALTER TABLE `gallery_images` DISABLE KEYS */;
INSERT INTO `gallery_images` VALUES (1,'Main Campus Building','Inyubako Nkuru','Our modern main building','Inyubako yacu nshya','/uploads/gallery/image1.jpg',1,1,'2026-01-23 04:25:14','2026-01-23 04:25:14'),(2,'Computer Lab','Laboratoire ya Mudasobwa','State-of-the-art computer lab','Laboratoire igezweho','/uploads/gallery/image2.jpg',2,1,'2026-01-23 04:25:14','2026-01-23 04:25:14'),(3,'Library','Isomero','Well-stocked library','Isomero ryuzuye ibitabo','/uploads/gallery/image3.jpg',3,1,'2026-01-23 04:25:14','2026-01-23 04:25:14'),(4,'Sports Field','Terrain ya Siporo','Modern sports facilities','Ibikoresho bya siporo bigezweho','/uploads/gallery/image4.jpg',4,1,'2026-01-23 04:25:14','2026-01-23 04:25:14');
/*!40000 ALTER TABLE `gallery_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gamification_points`
--

DROP TABLE IF EXISTS `gamification_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gamification_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `activity_type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gamification_points`
--

LOCK TABLES `gamification_points` WRITE;
/*!40000 ALTER TABLE `gamification_points` DISABLE KEYS */;
/*!40000 ALTER TABLE `gamification_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `generated_reports`
--

DROP TABLE IF EXISTS `generated_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generated_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `academic_year` int(11) NOT NULL,
  `term` varchar(50) DEFAULT NULL,
  `report_data` longtext DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `generated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_class_year` (`class_id`,`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `generated_reports`
--

LOCK TABLES `generated_reports` WRITE;
/*!40000 ALTER TABLE `generated_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `generated_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_sheet_columns`
--

DROP TABLE IF EXISTS `global_sheet_columns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `global_sheet_columns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(50) NOT NULL,
  `column_name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `column_type` enum('text','number','date','boolean','select','actions') DEFAULT 'text',
  `width` int(11) DEFAULT 100,
  `visible` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_role` (`role`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_sheet_columns`
--

LOCK TABLES `global_sheet_columns` WRITE;
/*!40000 ALTER TABLE `global_sheet_columns` DISABLE KEYS */;
INSERT INTO `global_sheet_columns` VALUES (1,'all','admission_number','Admission #','text',100,1,1,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(2,'all','first_name','First Name','text',120,1,2,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(3,'all','last_name','Last Name','text',120,1,3,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(4,'all','gender','Gender','select',80,1,4,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(5,'all','trade_code','Trade','text',100,1,5,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(6,'all','level_number','Level','number',60,1,6,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(7,'all','phone','Phone','text',120,1,7,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(8,'all','email','Email','text',150,1,8,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(9,'all','is_active','Status','boolean',80,1,9,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(10,'director_discipline','total_absences','Absences','number',80,1,10,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(11,'director_discipline','pending_incidents','Pending Incidents','number',120,1,11,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(12,'director_study','average_score','Average Score','number',100,1,10,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(13,'director_study','gpa','GPA','number',60,1,11,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59'),(14,'headmaster','attendance_percentage','Attendance %','number',80,1,10,NULL,'2026-02-04 07:33:59','2026-02-04 07:33:59');
/*!40000 ALTER TABLE `global_sheet_columns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_student_sheets`
--

DROP TABLE IF EXISTS `global_student_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `global_student_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) DEFAULT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `trade_code` varchar(50) DEFAULT NULL,
  `trade_name` varchar(200) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `level_suffix` varchar(10) DEFAULT NULL,
  `class_name` varchar(200) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive','suspended','graduated','transferred') DEFAULT 'active',
  `total_subjects` int(11) DEFAULT 0,
  `total_marks` decimal(10,2) DEFAULT 0.00,
  `average_marks` decimal(10,2) DEFAULT 0.00,
  `overall_grade` varchar(5) DEFAULT NULL,
  `gpa` decimal(4,2) DEFAULT 0.00,
  `total_days` int(11) DEFAULT 0,
  `days_present` int(11) DEFAULT 0,
  `days_absent` int(11) DEFAULT 0,
  `days_late` int(11) DEFAULT 0,
  `attendance_percentage` decimal(10,2) DEFAULT 100.00,
  `total_incidents` int(11) DEFAULT 0,
  `critical_incidents` int(11) DEFAULT 0,
  `high_incidents` int(11) DEFAULT 0,
  `medium_incidents` int(11) DEFAULT 0,
  `low_incidents` int(11) DEFAULT 0,
  `conduct_score` int(11) DEFAULT 100,
  `conduct_grade` varchar(5) DEFAULT 'A',
  `total_fees` decimal(10,2) DEFAULT 0.00,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `balance` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('unpaid','partial','paid') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=482 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_student_sheets`
--

LOCK TABLES `global_student_sheets` WRITE;
/*!40000 ALTER TABLE `global_student_sheets` DISABLE KEYS */;
INSERT INTO `global_student_sheets` VALUES (1,'STU001','SOD-2024-001',NULL,'John','Mugisha',NULL,NULL,NULL,NULL,'SOD','Software Development',4,NULL,'SOD Level 4',NULL,'active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-06 12:23:51','2026-02-06 12:23:51'),(2,'STU002','SOD-2024-002',NULL,'Marie','Uwera',NULL,NULL,NULL,NULL,'SOD','Software Development',4,NULL,'SOD Level 4',NULL,'active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-06 12:23:51','2026-02-06 12:23:51'),(3,'STU003','BDC-2024-001',NULL,'Pierre','Niyonkuru',NULL,NULL,NULL,NULL,'BDC','Business Development',3,NULL,'BDC Level 3',NULL,'active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-06 12:23:51','2026-02-06 12:23:51'),(4,'STU004','AUT-2024-001',NULL,'Grace','Mukamana',NULL,NULL,NULL,NULL,'AUT','Automotive',5,NULL,'AUT Level 5',NULL,'active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-06 12:23:51','2026-02-06 12:23:51'),(5,'1','2024SOD4A001',NULL,'Demo','Student','student@gardentvet.com','0788123456','male',NULL,'GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(6,'14',NULL,NULL,'Demo','Student','student_demo_2026@default.rw','+250788000010','male',NULL,'GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(7,'23','2026ICT1A003',NULL,'Janvier','Uwamahoro','student1_2026@gardentvet.rw','+250788300001','male','2005-03-15','GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(8,'24','2026SOD4A004',NULL,'Diane','Ishimwe','student2_2026@gardentvet.rw','+250788300002','female','2006-07-20','GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(9,'25','2026BDC4A005',NULL,'Patrick','Nsengimana','student3_2026@gardentvet.rw','+250788300003','male','2005-11-10','GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(10,'26','2026AUT4A006',NULL,'Grace','Mukamana','student4_2026@gardentvet.rw','+250788300004','female','2006-01-25','GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(11,'27','2026ICT1A007',NULL,'Eric','Habimana','student5_2026@gardentvet.rw','+250788300005','male','2005-09-05','GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(12,'28','2026SOD5A008',NULL,'Yvonne','Uwase','student6_2026@gardentvet.rw','+250788300006','female','2004-05-18','GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(13,'45','20260NaN',NULL,'Test','User','test1769606398701@test.com','0788999888','male',NULL,'GEN','General',1,'A','General Class','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 03:49:18','2026-02-10 04:00:29'),(50,'0','TEMPLATE_5_L4',NULL,'Template','Student',NULL,NULL,NULL,NULL,'5','Level 4 Software Development',4,'A','Level 4 Software Development Level 4','2026','active',0,0.00,0.00,NULL,0.00,0,0,0,0,100.00,0,0,0,0,0,100,'A',0.00,0.00,0.00,'unpaid','2026-02-10 04:00:29','2026-02-10 04:00:29');
/*!40000 ALTER TABLE `global_student_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `assessment_type` enum('quiz','exam','assignment','project','final') NOT NULL,
  `assessment_name` varchar(200) NOT NULL,
  `max_marks` decimal(5,2) NOT NULL,
  `obtained_marks` decimal(5,2) NOT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `ranking` int(11) DEFAULT NULL,
  `grade_letter` varchar(5) DEFAULT NULL,
  `assessment_date` date NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `subject_id` (`subject_id`),
  KEY `class_id` (`class_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `grades_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (9,1,1,1,'quiz','Quiz 1',20.00,15.00,75.00,NULL,'C','2026-01-26',3,NULL,'2026-01-26 17:27:56','2026-01-26 17:27:56'),(10,1,1,1,'exam','Mid-Term Exam',100.00,85.00,85.00,1,'B','2026-01-26',3,NULL,'2026-01-26 17:27:56','2026-01-26 17:27:56');
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS `group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_members`
--

LOCK TABLES `group_members` WRITE;
/*!40000 ALTER TABLE `group_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_post_comments`
--

DROP TABLE IF EXISTS `group_post_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_post_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_post_comments`
--

LOCK TABLES `group_post_comments` WRITE;
/*!40000 ALTER TABLE `group_post_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_post_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_post_likes`
--

DROP TABLE IF EXISTS `group_post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_post_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_post_likes`
--

LOCK TABLES `group_post_likes` WRITE;
/*!40000 ALTER TABLE `group_post_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_post_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_posts`
--

DROP TABLE IF EXISTS `group_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_posts`
--

LOCK TABLES `group_posts` WRITE;
/*!40000 ALTER TABLE `group_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hero_slides`
--

DROP TABLE IF EXISTS `hero_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hero_slides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `button_text` varchar(50) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_slides`
--

LOCK TABLES `hero_slides` WRITE;
/*!40000 ALTER TABLE `hero_slides` DISABLE KEYS */;
INSERT INTO `hero_slides` VALUES (1,'Welcome to Garden TVET School','Excellence in Technical Education',NULL,NULL,NULL,1,1,'2026-01-23 10:01:24'),(2,'Build Your Future','Quality Programs in Technology and Construction',NULL,NULL,NULL,2,1,'2026-01-23 10:01:24'),(3,'Join Us Today','Transform Your Career with Practical Skills',NULL,NULL,NULL,3,1,'2026-01-23 10:01:24');
/*!40000 ALTER TABLE `hero_slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holiday_package_progress`
--

DROP TABLE IF EXISTS `holiday_package_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `holiday_package_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `activity_completed` int(11) DEFAULT 0,
  `total_activities` int(11) NOT NULL,
  `progress_percentage` decimal(5,2) DEFAULT 0.00,
  `submission_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`submission_content`)),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `teacher_feedback` text DEFAULT NULL,
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `status` enum('not_started','in_progress','completed','submitted','graded') DEFAULT 'not_started',
  `graded_by` int(11) DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_progress` (`package_id`,`student_id`),
  KEY `student_id` (`student_id`),
  KEY `graded_by` (`graded_by`),
  CONSTRAINT `holiday_package_progress_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `holiday_packages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `holiday_package_progress_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `holiday_package_progress_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holiday_package_progress`
--

LOCK TABLES `holiday_package_progress` WRITE;
/*!40000 ALTER TABLE `holiday_package_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `holiday_package_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holiday_packages`
--

DROP TABLE IF EXISTS `holiday_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `holiday_packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `teacher_id` int(11) NOT NULL,
  `trade_class_id` int(11) NOT NULL,
  `package_type` enum('revision','practice','project','reading','skill_building') DEFAULT 'revision',
  `subject_id` int(11) DEFAULT NULL,
  `total_activities` int(11) NOT NULL DEFAULT 1,
  `estimated_duration_days` int(11) DEFAULT 7,
  `difficulty_level` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
  `learning_objectives` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`learning_objectives`)),
  `resources` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`resources`)),
  `instructions` text DEFAULT NULL,
  `submission_required` tinyint(1) DEFAULT 1,
  `peer_collaboration` tinyint(1) DEFAULT 0,
  `parent_involvement` tinyint(1) DEFAULT 0,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `trade_class_id` (`trade_class_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `holiday_packages_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `holiday_packages_ibfk_2` FOREIGN KEY (`trade_class_id`) REFERENCES `trade_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `holiday_packages_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holiday_packages`
--

LOCK TABLES `holiday_packages` WRITE;
/*!40000 ALTER TABLE `holiday_packages` DISABLE KEYS */;
/*!40000 ALTER TABLE `holiday_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_content`
--

DROP TABLE IF EXISTS `home_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_key` varchar(100) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `additional_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`additional_data`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `section_key` (`section_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_content`
--

LOCK TABLES `home_content` WRITE;
/*!40000 ALTER TABLE `home_content` DISABLE KEYS */;
INSERT INTO `home_content` VALUES (1,'hero_main','Imibare Yacu','Ishuri ry\'ubuhanga rifite imikorere myiza kandi ryizera',NULL,NULL,1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(2,'news_section','Amakuru Y\'Ishuri','Amakuru mashya n\'ibikorwa by\'ishuri ryacu',NULL,NULL,1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(3,'testimonials_section','Ibyo Abantu Bavuga','Icyo abanyeshuri, ababyeyi, n\'abarimu bavuga ku ishuri ryacu',NULL,NULL,1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(4,'achievements_section','Ibihembo N\'Intsinzi','Ibyo twagezeho mu myaka yashize',NULL,NULL,1,'2026-01-24 05:02:44','2026-01-24 05:02:44');
/*!40000 ALTER TABLE `home_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_features`
--

DROP TABLE IF EXISTS `home_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `title_rw` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_features`
--

LOCK TABLES `home_features` WRITE;
/*!40000 ALTER TABLE `home_features` DISABLE KEYS */;
INSERT INTO `home_features` VALUES (1,'Experienced Teachers','Abarimu Babizi','Our teachers have extensive experience and expertise','Abarimu bacu bafite uburambe bwinshi n\'ubuhanga','GraduationCap','from-blue-500 to-indigo-600',1,1,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(2,'Modern Facilities','Ibikoresho By\'Igihe','State-of-the-art facilities and equipment','Ibikoresho bigezweho by\'igihe','Building','from-green-500 to-teal-500',1,2,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(3,'High Employment Rate','Gushirwa mu Kazi Cyinshi','95% of our graduates find employment','95% y\'abanyeshuri bacu babona akazi','Briefcase','from-yellow-500 to-orange-500',1,3,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(4,'Many Trophies','Ibihembo Byinshi','25+ trophies won in various competitions','Ibihembo 25+ byatsindwe mu marushanwa','Trophy','from-orange-500 to-red-500',1,4,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(5,'International Partnerships','Ubufatanye Mpuzamahanga','Partnerships with international institutions','Ubufatanye n\'amashuri mpuzamahanga','Globe','from-pink-500 to-rose-500',1,5,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(6,'Extracurricular Activities','Ibikorwa by\'Inyongera','Sports, clubs, and other activities','Siporo, amakoperative n\'ibindi bikorwa','Target','from-purple-500 to-indigo-500',1,6,'2026-01-27 07:48:18','2026-01-27 07:48:18');
/*!40000 ALTER TABLE `home_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_sections`
--

DROP TABLE IF EXISTS `home_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_name` varchar(100) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `background_color` varchar(20) DEFAULT NULL,
  `text_color` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_sections`
--

LOCK TABLES `home_sections` WRITE;
/*!40000 ALTER TABLE `home_sections` DISABLE KEYS */;
INSERT INTO `home_sections` VALUES (1,'hero','POWERFUL SCHOOL MANAGEMENT SYSTEM','Excellence in Education','Empowering students with world-class technical education and modern learning facilities.',NULL,NULL,NULL,1,1,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(2,'about','About Our Institution','Leading Technical Education','We provide comprehensive technical education programs that prepare students for successful careers in today\'s competitive job market.',NULL,NULL,NULL,1,2,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(3,'programs','Our Programs','Technical Education Excellence','Discover our range of professional technical education programs designed for industry success.',NULL,NULL,NULL,1,3,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(4,'stats','Our Achievements','Numbers That Matter','See the impact we\'ve made in technical education over the years.',NULL,NULL,NULL,1,4,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(5,'hero','POWERFUL SCHOOL MANAGEMENT SYSTEM','Excellence in Education','Empowering students with world-class technical education and modern learning facilities.',NULL,NULL,NULL,1,1,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(6,'about','About Our Institution','Leading Technical Education','We provide comprehensive technical education programs that prepare students for successful careers in today\'s competitive job market.',NULL,NULL,NULL,1,2,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(7,'programs','Our Programs','Technical Education Excellence','Discover our range of professional technical education programs designed for industry success.',NULL,NULL,NULL,1,3,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(8,'stats','Our Achievements','Numbers That Matter','See the impact we\'ve made in technical education over the years.',NULL,NULL,NULL,1,4,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(9,'hero','POWERFUL SCHOOL MANAGEMENT SYSTEM','Excellence in Education','Empowering students with world-class technical education and modern learning facilities.',NULL,NULL,NULL,1,1,'2026-01-23 10:01:16','2026-01-23 10:01:16'),(10,'about','About Our Institution','Leading Technical Education','We provide comprehensive technical education programs that prepare students for successful careers in today\'s competitive job market.',NULL,NULL,NULL,1,2,'2026-01-23 10:01:16','2026-01-23 10:01:16'),(11,'programs','Our Programs','Technical Education Excellence','Discover our range of professional technical education programs designed for industry success.',NULL,NULL,NULL,1,3,'2026-01-23 10:01:16','2026-01-23 10:01:16'),(12,'stats','Our Achievements','Numbers That Matter','See the impact we\'ve made in technical education over the years.',NULL,NULL,NULL,1,4,'2026-01-23 10:01:16','2026-01-23 10:01:16');
/*!40000 ALTER TABLE `home_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_slides`
--

DROP TABLE IF EXISTS `home_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_slides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(300) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_slides`
--

LOCK TABLES `home_slides` WRITE;
/*!40000 ALTER TABLE `home_slides` DISABLE KEYS */;
INSERT INTO `home_slides` VALUES (1,'Welcome to Excellence','TVET Education at its Best','Join thousands of students who have transformed their careers through our comprehensive technical programs.','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80','Explore Programs','/trades',1,1,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(2,'Build Your Future','Hands-On Learning','Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.','https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80','Get Started','/register',1,2,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(3,'Industry Ready','94% Success Rate','Our graduates are highly sought after by employers. Join our community of successful professionals.','https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80','View Success Stories','/testimonials',1,3,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(4,'Welcome to Excellence','TVET Education at its Best','Join thousands of students who have transformed their careers through our comprehensive technical programs.','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80','Explore Programs','/trades',1,1,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(5,'Build Your Future','Hands-On Learning','Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.','https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80','Get Started','/register',1,2,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(6,'Industry Ready','94% Success Rate','Our graduates are highly sought after by employers. Join our community of successful professionals.','https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80','View Success Stories','/testimonials',1,3,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(7,'Welcome to Excellence','TVET Education at its Best','Join thousands of students who have transformed their careers through our comprehensive technical programs.','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80','Explore Programs','/trades',1,1,'2026-01-23 10:01:16','2026-01-23 10:01:16'),(8,'Build Your Future','Hands-On Learning','Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.','https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80','Get Started','/register',1,2,'2026-01-23 10:01:16','2026-01-23 10:01:16'),(9,'Industry Ready','94% Success Rate','Our graduates are highly sought after by employers. Join our community of successful professionals.','https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80','View Success Stories','/testimonials',1,3,'2026-01-23 10:01:16','2026-01-23 10:01:16');
/*!40000 ALTER TABLE `home_slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_statistics`
--

DROP TABLE IF EXISTS `home_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(100) NOT NULL,
  `value` varchar(50) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_statistics`
--

LOCK TABLES `home_statistics` WRITE;
/*!40000 ALTER TABLE `home_statistics` DISABLE KEYS */;
INSERT INTO `home_statistics` VALUES (1,'Students','1,248','Users','Total enrolled students',1,0,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(2,'Success Rate','93%','TrendingUp','Graduation success rate',1,0,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(3,'Programs','3','BookOpen','Available trade programs',1,0,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(4,'Teachers','65+','GraduationCap','Qualified instructors',1,0,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(5,'Partners','65+','Briefcase','Industry partnerships',1,0,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(6,'Years','15+','Award','Years of excellence',1,0,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(7,'Students','1,248','Users','Total enrolled students',1,0,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(8,'Success Rate','93%','TrendingUp','Graduation success rate',1,0,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(9,'Programs','3','BookOpen','Available trade programs',1,0,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(10,'Teachers','65+','GraduationCap','Qualified instructors',1,0,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(11,'Partners','65+','Briefcase','Industry partnerships',1,0,'2026-01-22 06:58:35','2026-01-22 06:58:35'),(12,'Years','15+','Award','Years of excellence',1,0,'2026-01-22 06:58:35','2026-01-22 06:58:35');
/*!40000 ALTER TABLE `home_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_visits`
--

DROP TABLE IF EXISTS `home_visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_visits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `advisor_id` int(11) NOT NULL,
  `visit_date` datetime NOT NULL,
  `purpose_rw` text NOT NULL,
  `purpose_en` text DEFAULT NULL,
  `family_members_present` text DEFAULT NULL,
  `home_conditions_rw` text DEFAULT NULL,
  `home_conditions_en` text DEFAULT NULL,
  `observations_rw` text NOT NULL,
  `observations_en` text DEFAULT NULL,
  `concerns_identified_rw` text DEFAULT NULL,
  `concerns_identified_en` text DEFAULT NULL,
  `recommendations_rw` text DEFAULT NULL,
  `recommendations_en` text DEFAULT NULL,
  `follow_up_actions` text DEFAULT NULL,
  `parent_feedback_rw` text DEFAULT NULL,
  `parent_feedback_en` text DEFAULT NULL,
  `visit_status` enum('planned','completed','cancelled') DEFAULT 'planned',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_visits`
--

LOCK TABLES `home_visits` WRITE;
/*!40000 ALTER TABLE `home_visits` DISABLE KEYS */;
/*!40000 ALTER TABLE `home_visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `homepage_content`
--

DROP TABLE IF EXISTS `homepage_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `homepage_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section` varchar(255) DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`content`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homepage_content`
--

LOCK TABLES `homepage_content` WRITE;
/*!40000 ALTER TABLE `homepage_content` DISABLE KEYS */;
/*!40000 ALTER TABLE `homepage_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `homework`
--

DROP TABLE IF EXISTS `homework`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `homework` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `trade_class_id` int(11) NOT NULL,
  `homework_type` enum('daily','weekly','monthly','revision','practice') DEFAULT 'daily',
  `total_marks` decimal(5,2) NOT NULL DEFAULT 50.00,
  `instructions` text DEFAULT NULL,
  `resources` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resources`)),
  `due_date` date NOT NULL,
  `submission_required` tinyint(1) DEFAULT 1,
  `peer_review_required` tinyint(1) DEFAULT 0,
  `parent_notification` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `trade_class_id` (`trade_class_id`),
  CONSTRAINT `homework_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `homework_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `homework_ibfk_3` FOREIGN KEY (`trade_class_id`) REFERENCES `trade_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homework`
--

LOCK TABLES `homework` WRITE;
/*!40000 ALTER TABLE `homework` DISABLE KEYS */;
/*!40000 ALTER TABLE `homework` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `homework_submissions`
--

DROP TABLE IF EXISTS `homework_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `homework_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `homework_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_content` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_late` tinyint(1) DEFAULT 0,
  `status` enum('pending','submitted','reviewed','graded') DEFAULT 'pending',
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `teacher_feedback` text DEFAULT NULL,
  `peer_reviews` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`peer_reviews`)),
  `graded_by` int(11) DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_submission` (`homework_id`,`student_id`),
  KEY `student_id` (`student_id`),
  KEY `graded_by` (`graded_by`),
  CONSTRAINT `homework_submissions_ibfk_1` FOREIGN KEY (`homework_id`) REFERENCES `homework` (`id`) ON DELETE CASCADE,
  CONSTRAINT `homework_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `homework_submissions_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homework_submissions`
--

LOCK TABLES `homework_submissions` WRITE;
/*!40000 ALTER TABLE `homework_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `homework_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostel_allocations`
--

DROP TABLE IF EXISTS `hostel_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hostel_allocations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date DEFAULT NULL,
  `status` enum('active','checked_out','terminated') DEFAULT 'active',
  `bed_number` varchar(10) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `allocated_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `academic_year_id` (`academic_year_id`),
  KEY `allocated_by` (`allocated_by`),
  KEY `idx_student` (`student_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `hostel_allocations_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms` (`id`),
  CONSTRAINT `hostel_allocations_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `hostel_allocations_ibfk_3` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `hostel_allocations_ibfk_4` FOREIGN KEY (`allocated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostel_allocations`
--

LOCK TABLES `hostel_allocations` WRITE;
/*!40000 ALTER TABLE `hostel_allocations` DISABLE KEYS */;
/*!40000 ALTER TABLE `hostel_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostel_applications`
--

DROP TABLE IF EXISTS `hostel_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hostel_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `application_date` date NOT NULL,
  `check_in_date` date DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `hostel_applications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hostel_applications_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms` (`id`),
  CONSTRAINT `hostel_applications_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostel_applications`
--

LOCK TABLES `hostel_applications` WRITE;
/*!40000 ALTER TABLE `hostel_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `hostel_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostel_rooms`
--

DROP TABLE IF EXISTS `hostel_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hostel_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_number` varchar(20) NOT NULL,
  `hostel_name` varchar(100) DEFAULT NULL,
  `floor` int(11) DEFAULT NULL,
  `room_type` enum('single','double','dormitory') DEFAULT 'dormitory',
  `capacity` int(11) NOT NULL,
  `current_occupancy` int(11) DEFAULT 0,
  `gender` enum('male','female','mixed') DEFAULT 'mixed',
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `status` enum('available','occupied','maintenance','closed') DEFAULT 'available',
  `monthly_fee` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`),
  KEY `idx_status` (`status`),
  KEY `idx_gender` (`gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostel_rooms`
--

LOCK TABLES `hostel_rooms` WRITE;
/*!40000 ALTER TABLE `hostel_rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `hostel_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incident_witnesses`
--

DROP TABLE IF EXISTS `incident_witnesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `incident_witnesses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conduct_record_id` int(11) NOT NULL,
  `witness_id` int(11) DEFAULT NULL,
  `witness_name` varchar(255) DEFAULT NULL,
  `witness_type` enum('student','staff','parent','other') NOT NULL,
  `statement` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `witness_id` (`witness_id`),
  KEY `idx_conduct_record` (`conduct_record_id`),
  CONSTRAINT `incident_witnesses_ibfk_1` FOREIGN KEY (`conduct_record_id`) REFERENCES `student_conduct_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `incident_witnesses_ibfk_2` FOREIGN KEY (`witness_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incident_witnesses`
--

LOCK TABLES `incident_witnesses` WRITE;
/*!40000 ALTER TABLE `incident_witnesses` DISABLE KEYS */;
/*!40000 ALTER TABLE `incident_witnesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `intervention_progress_notes`
--

DROP TABLE IF EXISTS `intervention_progress_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `intervention_progress_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `intervention_id` int(11) NOT NULL,
  `counselor_id` int(11) NOT NULL,
  `progress_notes` text DEFAULT NULL,
  `effectiveness_rating` int(11) DEFAULT NULL CHECK (`effectiveness_rating` between 1 and 10),
  `challenges` text DEFAULT NULL,
  `next_steps` text DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `intervention_id` (`intervention_id`),
  CONSTRAINT `intervention_progress_notes_ibfk_1` FOREIGN KEY (`intervention_id`) REFERENCES `student_interventions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intervention_progress_notes`
--

LOCK TABLES `intervention_progress_notes` WRITE;
/*!40000 ALTER TABLE `intervention_progress_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `intervention_progress_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `intervention_progress_tracking`
--

DROP TABLE IF EXISTS `intervention_progress_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `intervention_progress_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `counselor_id` int(11) NOT NULL,
  `progress_notes` text DEFAULT NULL,
  `behavior_change` text DEFAULT NULL,
  `effectiveness` int(11) DEFAULT NULL CHECK (`effectiveness` between 1 and 10),
  `challenges` text DEFAULT NULL,
  `adjustments` text DEFAULT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `intervention_progress_tracking_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `behavior_intervention_programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intervention_progress_tracking`
--

LOCK TABLES `intervention_progress_tracking` WRITE;
/*!40000 ALTER TABLE `intervention_progress_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `intervention_progress_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(50) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `supplier` varchar(200) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `min_stock_level` int(11) DEFAULT 10,
  `status` enum('available','low_stock','out_of_stock') DEFAULT 'available',
  `last_restocked` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_code` varchar(100) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `reorder_level` int(11) DEFAULT 10,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_code` (`item_code`),
  KEY `idx_category` (`category`),
  KEY `idx_quantity` (`quantity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_transactions`
--

DROP TABLE IF EXISTS `inventory_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `transaction_type` enum('in','out','adjustment') NOT NULL,
  `quantity` int(11) NOT NULL,
  `previous_quantity` int(11) DEFAULT NULL,
  `new_quantity` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_item_date` (`item_id`,`transaction_date`),
  CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_transactions`
--

LOCK TABLES `inventory_transactions` WRITE;
/*!40000 ALTER TABLE `inventory_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `balance` decimal(15,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `student_id` (`student_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_applications`
--

DROP TABLE IF EXISTS `job_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `job_id` int(11) NOT NULL,
  `applicant_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `resume_url` varchar(500) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `applied_date` date NOT NULL,
  `status` enum('pending','reviewed','shortlisted','rejected','hired') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `job_applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_applications`
--

LOCK TABLES `job_applications` WRITE;
/*!40000 ALTER TABLE `job_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_postings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `requirements` text DEFAULT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `deadline` date NOT NULL,
  `posted_date` date NOT NULL,
  `status` enum('open','closed','filled') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_postings`
--

LOCK TABLES `job_postings` WRITE;
/*!40000 ALTER TABLE `job_postings` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_articles`
--

DROP TABLE IF EXISTS `knowledge_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `knowledge_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_author` (`author_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_articles`
--

LOCK TABLES `knowledge_articles` WRITE;
/*!40000 ALTER TABLE `knowledge_articles` DISABLE KEYS */;
INSERT INTO `knowledge_articles` VALUES (1,'Getting Started Guide','Welcome to the school management system...','Getting Started','guide,tutorial,basics',NULL,1,0,'2026-01-24 04:40:52','2026-01-24 04:40:52'),(2,'Student Registration Process','Step-by-step guide for registering new students...','Administration','students,registration,admin',NULL,1,0,'2026-01-24 04:40:52','2026-01-24 04:40:52'),(3,'Grading System Overview','Understanding how grades are calculated...','Academics','grades,assessment,academics',NULL,1,0,'2026-01-24 04:40:52','2026-01-24 04:40:52'),(4,'Untitled','','General','',NULL,NULL,0,'2026-01-28 12:44:21','2026-01-28 12:44:21'),(5,'Untitled','','General','',NULL,NULL,0,'2026-01-28 12:51:18','2026-01-28 12:51:18'),(6,'Untitled','','General','',NULL,NULL,0,'2026-01-28 12:54:48','2026-01-28 12:54:48'),(7,'Untitled','','General','',NULL,NULL,0,'2026-01-28 12:59:10','2026-01-28 12:59:10'),(8,'Untitled','','General','',NULL,NULL,0,'2026-01-28 13:13:18','2026-01-28 13:13:18'),(9,'Untitled','','General','',NULL,NULL,0,'2026-01-28 13:20:51','2026-01-28 13:20:51'),(10,'Untitled','','General','',NULL,NULL,0,'2026-01-28 14:28:24','2026-01-28 14:28:24'),(11,'Untitled','','General','',NULL,NULL,0,'2026-01-28 14:59:35','2026-01-28 14:59:35');
/*!40000 ALTER TABLE `knowledge_articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_base`
--

DROP TABLE IF EXISTS `knowledge_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `knowledge_base` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `author_id` int(11) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `helpful_count` int(11) DEFAULT 0,
  `not_helpful_count` int(11) DEFAULT 0,
  `version` int(11) DEFAULT 1,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  FULLTEXT KEY `idx_search` (`title`,`content`,`tags`),
  CONSTRAINT `knowledge_base_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_base`
--

LOCK TABLES `knowledge_base` WRITE;
/*!40000 ALTER TABLE `knowledge_base` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_base` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_base_articles`
--

DROP TABLE IF EXISTS `knowledge_base_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `knowledge_base_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `slug` varchar(500) NOT NULL,
  `content` longtext NOT NULL,
  `excerpt` text DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `views_count` int(11) DEFAULT 0,
  `helpful_count` int(11) DEFAULT 0,
  `not_helpful_count` int(11) DEFAULT 0,
  `search_keywords` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category_id`),
  CONSTRAINT `knowledge_base_articles_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `knowledge_base_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_base_articles`
--

LOCK TABLES `knowledge_base_articles` WRITE;
/*!40000 ALTER TABLE `knowledge_base_articles` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_base_articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_base_categories`
--

DROP TABLE IF EXISTS `knowledge_base_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `knowledge_base_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_base_categories`
--

LOCK TABLES `knowledge_base_categories` WRITE;
/*!40000 ALTER TABLE `knowledge_base_categories` DISABLE KEYS */;
INSERT INTO `knowledge_base_categories` VALUES (1,'Getting Started','getting-started','New student orientation','book-open',NULL,1,1,'2026-01-28 04:19:01','2026-01-28 04:19:01'),(2,'Academic Policies','academic-policies','School academic policies and procedures','file-text',NULL,2,1,'2026-01-28 04:19:01','2026-01-28 04:19:01'),(3,'Student Life','student-life','Student life and activities','users',NULL,3,1,'2026-01-28 04:19:01','2026-01-28 04:19:01'),(4,'FAQs','faqs','Frequently asked questions','help-circle',NULL,4,1,'2026-01-28 04:19:01','2026-01-28 04:19:01');
/*!40000 ALTER TABLE `knowledge_base_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_graph`
--

DROP TABLE IF EXISTS `knowledge_graph`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `knowledge_graph` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL,
  `concept_name` varchar(255) NOT NULL,
  `concept_description` text DEFAULT NULL,
  `difficulty_level` int(11) DEFAULT 1,
  `prerequisites` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prerequisites`)),
  `related_concepts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`related_concepts`)),
  `mastery_threshold` decimal(5,2) DEFAULT 80.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `knowledge_graph_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_graph`
--

LOCK TABLES `knowledge_graph` WRITE;
/*!40000 ALTER TABLE `knowledge_graph` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_graph` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leadership`
--

DROP TABLE IF EXISTS `leadership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leadership` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `biography_rw` text DEFAULT NULL,
  `biography_en` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `office_location` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `qualifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications`)),
  `experience_years` int(11) DEFAULT NULL,
  `specialization` text DEFAULT NULL,
  `achievements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`achievements`)),
  `responsibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities`)),
  `social_media` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_media`)),
  `office_hours` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  FULLTEXT KEY `ft_name` (`name`),
  FULLTEXT KEY `ft_role` (`role`),
  FULLTEXT KEY `ft_department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leadership`
--

LOCK TABLES `leadership` WRITE;
/*!40000 ALTER TABLE `leadership` DISABLE KEYS */;
INSERT INTO `leadership` VALUES (68,'Rugambage Andre','School Owner','Administration','Umuyobozi mukuru n\'uwashinze ishuri rya Garden TVET School','Founder and owner of Garden TVET School','owner@gardentvet.rw','0788000000','Main Office','/uploads/leadership/school owner.png',NULL,4,NULL,NULL,NULL,NULL,NULL,'active',1,'2026-02-03 13:43:06','2026-02-03 13:43:06'),(69,'Mukamugema Emerance','Advisor','Student Affairs','Umujyanama w\'abanyeshuri akaba afasha mu mibanire y\'abanyeshuri, ababyeyi n\'umuryango','Fostering positive relationship with parent, student and community','emerancemukamugema77@gmail.com','0788815924','Student Affairs Office','/uploads/leadership/mukamugenga emmerance.jpg',NULL,4,NULL,NULL,NULL,NULL,NULL,'active',2,'2026-02-03 13:43:06','2026-02-03 13:43:06'),(70,'Masezerano Issac','DOS','Academic Affairs','Umuyobozi w\'amasomo akaba ashinzwe gahunda z\'amasomo n\'imyigishirize','Director of Studies overseeing academic programs and teaching','masezeranoisaac1@gmail.com','0780467323 / 0732287628','Academic Office','/uploads/leadership/masezerano issac DOS.jpeg',NULL,4,NULL,NULL,NULL,NULL,NULL,'active',3,'2026-02-03 13:43:06','2026-02-03 13:43:06'),(71,'Mukandayisabye Emiliane','Accountant','Finance','Umubitsi w\'ishuri akaba ashinzwe imicungire y\'imari n\'ibaruramari','Accountant services and other related services','emmanueltuyishime2020@gmail.com','0788622709 / 0735077312','Finance Office','/uploads/leadership/accountant.jpg',NULL,4,NULL,NULL,NULL,NULL,NULL,'active',4,'2026-02-03 13:43:06','2026-02-03 13:43:06'),(72,'Twizeyimana Jean Claude','Patron','Student Welfare','Patron w\'abanyeshuri b\'abahungu akaba ashinzwe imibereho y\'abanyeshuri','Boys patron overseeing male students welfare','jeanclaudetwizeyimana14@gmail.com','0783407691','Boys Hostel','/uploads/leadership/patron.jpg',NULL,4,NULL,NULL,NULL,NULL,NULL,'active',5,'2026-02-03 13:43:06','2026-02-03 13:43:06'),(73,'Ishimwe Esther','Matron','Student Welfare','Matron w\'abanyeshuri b\'abakobwa akaba ashinzwe imibereho y\'abanyeshuri','Girls matron overseeing female students welfare','eishimwe674@gmail.com','0787342430','Girls Hostel','/uploads/leadership/matron.png',NULL,4,NULL,NULL,NULL,NULL,NULL,'active',6,'2026-02-03 13:43:06','2026-02-03 13:43:06'),(74,'Mukamana Grace','DOD','Discipline','Umuyobozi w\'imyitwarire akaba ashinzwe imyitwarire y\'abanyeshuri','Director of Discipline managing student conduct','inganji777@gmail.com','0788000004','Discipline Office','/uploads/leadership/director of discpline dod.jpg',NULL,4,NULL,NULL,NULL,NULL,NULL,'active',7,'2026-02-03 13:43:06','2026-02-03 13:43:06');
/*!40000 ALTER TABLE `leadership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_analytics_events`
--

DROP TABLE IF EXISTS `learning_analytics_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `learning_analytics_events` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_category` enum('engagement','performance','behavior','social','technical') NOT NULL,
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`event_data`)),
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `learning_analytics_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_analytics_events`
--

LOCK TABLES `learning_analytics_events` WRITE;
/*!40000 ALTER TABLE `learning_analytics_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_analytics_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_materials`
--

DROP TABLE IF EXISTS `learning_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `learning_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) NOT NULL,
  `material_type` enum('video','pdf','document','presentation','link','interactive') NOT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_size_mb` decimal(10,2) DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `downloads_count` int(11) DEFAULT 0,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `difficulty_level` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
  `is_featured` tinyint(1) DEFAULT 0,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `learning_materials_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `learning_materials_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `learning_materials_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_materials`
--

LOCK TABLES `learning_materials` WRITE;
/*!40000 ALTER TABLE `learning_materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_notifications`
--

DROP TABLE IF EXISTS `learning_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `learning_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `notification_type` enum('assignment_due','quiz_scheduled','homework_reminder','grade_posted','peer_review','session_invite','deadline_warning') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_id` int(11) DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `action_url` varchar(500) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `learning_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_notifications`
--

LOCK TABLES `learning_notifications` WRITE;
/*!40000 ALTER TABLE `learning_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_paths`
--

DROP TABLE IF EXISTS `learning_paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `learning_paths` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path_name` varchar(255) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `difficulty_level` enum('beginner','intermediate','advanced','expert') NOT NULL,
  `prerequisites` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prerequisites`)),
  `learning_objectives` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`learning_objectives`)),
  `estimated_duration_hours` int(11) DEFAULT NULL,
  `path_structure` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`path_structure`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `learning_paths_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `learning_paths_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_paths`
--

LOCK TABLES `learning_paths` WRITE;
/*!40000 ALTER TABLE `learning_paths` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_paths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_resources`
--

DROP TABLE IF EXISTS `learning_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `learning_resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_title` varchar(255) NOT NULL,
  `resource_type` enum('video','document','interactive','audio','link','ebook','simulation') NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `difficulty_level` enum('beginner','intermediate','advanced') NOT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `view_count` int(11) DEFAULT 0,
  `rating_avg` decimal(3,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `learning_resources_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `learning_resources_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_resources`
--

LOCK TABLES `learning_resources` WRITE;
/*!40000 ALTER TABLE `learning_resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `leave_type` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `levels`
--

DROP TABLE IF EXISTS `levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `levels`
--

LOCK TABLES `levels` WRITE;
/*!40000 ALTER TABLE `levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_books`
--

DROP TABLE IF EXISTS `library_books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library_books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(200) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `publisher` varchar(200) DEFAULT NULL,
  `publication_year` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `available_quantity` int(11) DEFAULT 1,
  `location` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('available','unavailable','maintenance') DEFAULT 'available',
  `cover_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  FULLTEXT KEY `idx_search` (`title`,`author`,`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_books`
--

LOCK TABLES `library_books` WRITE;
/*!40000 ALTER TABLE `library_books` DISABLE KEYS */;
/*!40000 ALTER TABLE `library_books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_borrowings`
--

DROP TABLE IF EXISTS `library_borrowings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library_borrowings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `borrow_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('borrowed','returned','overdue','lost') DEFAULT 'borrowed',
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `issued_by` int(11) NOT NULL,
  `returned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `issued_by` (`issued_by`),
  KEY `returned_to` (`returned_to`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  CONSTRAINT `library_borrowings_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`id`),
  CONSTRAINT `library_borrowings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `library_borrowings_ibfk_3` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`),
  CONSTRAINT `library_borrowings_ibfk_4` FOREIGN KEY (`returned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_borrowings`
--

LOCK TABLES `library_borrowings` WRITE;
/*!40000 ALTER TABLE `library_borrowings` DISABLE KEYS */;
/*!40000 ALTER TABLE `library_borrowings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_study_sessions`
--

DROP TABLE IF EXISTS `live_study_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `live_study_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `host_id` int(11) NOT NULL,
  `session_type` enum('class','study_group','office_hours','peer_tutoring','q_and_a') DEFAULT 'study_group',
  `subject_id` int(11) DEFAULT NULL,
  `trade_class_id` int(11) DEFAULT NULL,
  `max_participants` int(11) DEFAULT 50,
  `is_scheduled` tinyint(1) DEFAULT 0,
  `scheduled_start` datetime DEFAULT NULL,
  `scheduled_end` datetime DEFAULT NULL,
  `actual_start` timestamp NULL DEFAULT NULL,
  `actual_end` timestamp NULL DEFAULT NULL,
  `status` enum('scheduled','active','ended','cancelled') DEFAULT 'scheduled',
  `meeting_link` varchar(500) DEFAULT NULL,
  `access_code` varchar(20) DEFAULT NULL,
  `recording_enabled` tinyint(1) DEFAULT 0,
  `recording_url` varchar(500) DEFAULT NULL,
  `participants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`participants`)),
  `session_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `host_id` (`host_id`),
  KEY `subject_id` (`subject_id`),
  KEY `trade_class_id` (`trade_class_id`),
  CONSTRAINT `live_study_sessions_ibfk_1` FOREIGN KEY (`host_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `live_study_sessions_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `live_study_sessions_ibfk_3` FOREIGN KEY (`trade_class_id`) REFERENCES `trade_classes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_study_sessions`
--

LOCK TABLES `live_study_sessions` WRITE;
/*!40000 ALTER TABLE `live_study_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `live_study_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `sport_type` varchar(50) DEFAULT NULL,
  `match_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `venue` varchar(100) DEFAULT NULL,
  `home_score` int(11) DEFAULT 0,
  `away_score` int(11) DEFAULT 0,
  `status` varchar(20) DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `away_team_id` (`away_team_id`),
  KEY `idx_teams` (`home_team_id`,`away_team_id`),
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_library`
--

DROP TABLE IF EXISTS `media_library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media_library` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `media_library_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_library`
--

LOCK TABLES `media_library` WRITE;
/*!40000 ALTER TABLE `media_library` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_library` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_reads`
--

DROP TABLE IF EXISTS `message_reads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message_reads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_read` (`message_id`,`user_id`),
  KEY `idx_message` (`message_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `message_reads_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_reads_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_reads`
--

LOCK TABLES `message_reads` WRITE;
/*!40000 ALTER TABLE `message_reads` DISABLE KEYS */;
/*!40000 ALTER TABLE `message_reads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `recipient_type` enum('parent','student','staff','all') DEFAULT 'parent',
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `category` varchar(100) DEFAULT 'general',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` enum('draft','sent','delivered','read','failed') DEFAULT 'sent',
  `parent_message_id` int(11) DEFAULT NULL,
  `is_reply` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_message_id` (`parent_message_id`),
  KEY `idx_recipient` (`recipient_id`,`recipient_type`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`),
  KEY `idx_priority` (`priority`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`parent_message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `new_comers`
--

DROP TABLE IF EXISTS `new_comers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `new_comers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `trade` enum('SOD','AUT','BDC') NOT NULL,
  `level` varchar(20) NOT NULL,
  `section` varchar(10) DEFAULT NULL,
  `registration_date` date NOT NULL,
  `status` enum('pending','approved','enrolled','rejected') DEFAULT 'pending',
  `documents_submitted` tinyint(1) DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `enrolled_as_student_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `enrolled_as_student_id` (`enrolled_as_student_id`),
  CONSTRAINT `new_comers_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `new_comers_ibfk_2` FOREIGN KEY (`enrolled_as_student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `new_comers`
--

LOCK TABLES `new_comers` WRITE;
/*!40000 ALTER TABLE `new_comers` DISABLE KEYS */;
/*!40000 ALTER TABLE `new_comers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 1,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `views` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news_articles`
--

DROP TABLE IF EXISTS `news_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `date_published` date DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `views` int(11) DEFAULT 0,
  `likes` int(11) DEFAULT 0,
  `shares` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  FULLTEXT KEY `ft_title` (`title`),
  FULLTEXT KEY `ft_content` (`content`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news_articles`
--

LOCK TABLES `news_articles` WRITE;
/*!40000 ALTER TABLE `news_articles` DISABLE KEYS */;
INSERT INTO `news_articles` VALUES (2,'Ishuri ryacu ryitabiriye ibirori bya siporo','Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\'ishuri ry\'igihugu.','Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\'ishuri ry\'igihugu. Ni ishuri ryiza cyane.',NULL,'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800','Sarah Uwase','Siporo','2026-01-12',0,1,2,'2026-01-27 07:48:18','2026-01-27 07:48:18',0,0,0),(3,'Amashuri mashya azatangira mu kwezi gutaha','Kwiyandikisha kw\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026.','Kwiyandikisha kw\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026. Abanyeshuri bashya bagomba gutegura inyandiko zose.',NULL,'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800','Grace Ingabire','Amakuru','2026-01-10',0,1,3,'2026-01-27 07:48:18','2026-01-27 07:48:18',0,0,0),(4,'Ubufatanye bushya n\'amasosiyete','Ishuri ryacu ryasinyeho amasezerano y\'ubufatanye n\'amasosiyete 5 mu bikorwa.','Ishuri ryacu ryasinyeho amasezerano y\'ubufatanye n\'amasosiyete 5 mu bikorwa. Ibi bizagira ingaruka nziza ku banyeshuri.',NULL,'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800','Peter Karenzi','Ubufatanye','2026-01-08',0,1,4,'2026-01-27 07:48:18','2026-01-27 07:48:18',0,0,0),(5,'Ibiganiro Hagati y\'Abanyeshuri n\'Abayobozi','Ibiganiro by\'ingenzi hagati y\'abanyeshuri n\'abayobozi byagamije guteza imbere ubufatanye.','Mu rwego rwo guteza imbere ubushobozi bw\'abanyeshuri, Garden TVET School yakoze ibiganiro by\'ingenzi hagati y\'abanyeshuri n\'abayobozi b\'ishuri.\n\nIbi biganiro byagamije:\n• Kumva ibibazo abanyeshuri bahura nabyo\n• Gushyiraho ibisubizo bikwiye\n• Guteza imbere ubufatanye hagati y\'abanyeshuri n\'abayobozi\n• Gushyira mu bikorwa gahunda z\'iterambere\n\nAbanyeshuri bashimiye ubu buryo bwo kubana n\'abayobozi kandi bavuze ko bizafasha cyane mu guteza imbere ubumenyi bwabo. Ibi biganiro bizakomeza buri kwezi kugira ngo habeho ubufatanye buhoraho.',NULL,'/uploads/news/ibiganiro hagati yabanyeshuri nabayobozi.jpg','Garden TVET Admin','school_life','2026-01-27',1,1,7,'2026-01-27 15:44:03','2026-02-09 18:48:08',124,25,18),(6,'Inama Nyishi Zitangwa ku Banyeshuri','Gahunda y\'inama nyishi zigamije gufasha abanyeshuri mu gutoranya inzira zabo z\'ubuzima.','Garden TVET School yatangije gahunda y\'inama nyishi zigamije gufasha abanyeshuri mu gutoranya inzira zabo z\'ubuzima.\n\nIzi nama zirimo:\n• Ubuyobozi bw\'ubuzima\n• Gukurikirana intego z\'amasomo\n• Gufasha mu gukemura ibibazo by\'ubwiyunge\n• Gutanga ubufasha mu kwihangana n\'ibibazo\n\nAbanyeshuri bavuze ko izi nama zibafasha cyane mu gukemura ibibazo babo kandi zigafasha mu guteza imbere ubwoba bwabo. Gahunda izakomeza mu gihe cyose cy\'amashuri.',NULL,'/uploads/news/inama nyishi zitangwa kubanyeshuri.jpg','Counseling Department','counseling','2026-01-27',0,1,2,'2026-01-27 15:44:03','2026-01-29 14:14:29',67,40,7),(7,'Kuganirizwa n\'Abayobozi Batandukanye','Abanyeshuri bagize amahirwe yo kuganirizwa n\'abayobozi batandukanye bo mu turere.','Abanyeshuri ba Garden TVET School bagize amahirwe yo kuganirizwa n\'abayobozi batandukanye bo mu turere.\n\nUku kuganirizwa kwagamije:\n• Kwigisha abanyeshuri ubuyobozi\n• Gushyira mu gaciro ubushobozi bwabo\n• Gutanga ubunararibonye ku buzima bw\'ubuyobozi\n• Gufasha mu gutegura ejo hazaza\n\nAbayobozi bashimiye uruhare rw\'ishuri mu guteza imbere ubumenyi bw\'abanyeshuri kandi bashyigikiye gahunda z\'amahugurwa. Ibi bikorwa bizakomeza mu gihe gito kizaza.',NULL,'/uploads/news/kuganirizwa nabayobozi batandukanye.jpg','Leadership Team','leadership','2026-01-27',1,1,4,'2026-01-27 15:44:03','2026-01-29 15:58:22',66,32,21),(8,'Mu Bihe byo Gukora Ibizamini','Ishuri ryateguye neza abanyeshuri mu bihe byo gukora ibizamini by\'umwaka.','Garden TVET School yateguye neza abanyeshuri bayo mu bihe byo gukora ibizamini by\'umwaka.\n\nIbyo byateguwe birimo:\n• Amasomo y\'isubiramo\n• Ubufasha bw\'abarimu\n• Ibitabo n\'ibikoresho byose bikenewe\n• Ahantu heza ho kwiga\n\nAbanyeshuri bashimiye ubufasha bwose bwahawe kandi bemeje ko bazagira ibisubizo byiza. Ibizamini bizatangira mu cyumweru gitaha kandi bizarangira mu kwezi gutaha.',NULL,'/uploads/news/mubihe byogukora ibizamin.jpg','Academic Department','academics','2026-01-27',0,1,5,'2026-01-27 15:44:03','2026-01-27 15:44:43',88,43,14),(9,'Muri Garden TSS Isuku ni Umuco','Ishuri ryashyize imbere gahunda y\'isuku nk\'umuco w\'ishuri.','Garden TVET School yashyize imbere gahunda y\'isuku nk\'umuco w\'ishuri.\n\nIbi bikorwa birimo:\n• Gusukura ibice byose by\'ishuri\n• Gushyira mu gaciro ibidukikije\n• Kwiga abanyeshuri ubwiyunge\n• Gukora ibidukikije byiza byo kwigamo\n\nAbanyeshuri n\'abakozi bose bagize uruhare mu gukora iki gikorwa kandi bavuze ko bizafasha cyane mu guteza imbere ubuzima bwabo. Gahunda y\'isuku izakomeza buri munsi.',NULL,'/uploads/news/muri garden  tss isuku ni umuco.jpg','Environment Committee','environment','2026-01-27',0,1,5,'2026-01-27 15:44:03','2026-02-10 14:32:40',73,33,14),(10,'Team y\'Ikigo','Ishuri rifite team y\'abakozi b\'ubuhanga bafite ubumenyi bukomeye.','Garden TVET School ifite team y\'abakozi b\'ubuhanga bafite ubumenyi bukomeye.\n\nTeam yacu igizwe na:\n• Abarimu b\'ubuhanga\n• Abayobozi b\'ubunararibonye\n• Abakozi b\'ubufasha\n• Abashinzwe ubuzima bw\'abanyeshuri\n\nBose bafite intego imwe yo guteza imbere ubumenyi bw\'abanyeshuri no kubafasha kugera ku ntego zabo. Team yacu ikomeje kwihugura kugira ngo itange serivisi nziza.',NULL,'/uploads/news/team yikigo.jpg','HR Department','staff','2026-01-27',1,1,6,'2026-01-27 15:44:03','2026-01-31 12:54:07',82,38,16);
/*!40000 ALTER TABLE `news_articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) DEFAULT NULL,
  `event_type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `recipient_count` int(11) DEFAULT 0,
  `sms_sent` int(11) DEFAULT 0,
  `email_sent` int(11) DEFAULT 0,
  `in_app_sent` int(11) DEFAULT 0,
  `target_audience` varchar(50) DEFAULT NULL,
  `reference_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reference_data`)),
  `status` enum('pending','sent','failed','partial') DEFAULT 'sent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  KEY `idx_event` (`event_type`),
  KEY `idx_created` (`created_at`),
  KEY `idx_status` (`status`),
  CONSTRAINT `notification_logs_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `notification_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_logs`
--

LOCK TABLES `notification_logs` WRITE;
/*!40000 ALTER TABLE `notification_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_preferences`
--

DROP TABLE IF EXISTS `notification_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email_enabled` tinyint(1) DEFAULT 1,
  `sms_enabled` tinyint(1) DEFAULT 1,
  `push_enabled` tinyint(1) DEFAULT 1,
  `notification_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_types`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_preferences`
--

LOCK TABLES `notification_preferences` WRITE;
/*!40000 ALTER TABLE `notification_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_templates`
--

DROP TABLE IF EXISTS `notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_type` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `title_template` varchar(255) NOT NULL,
  `message_template` text NOT NULL,
  `sms_template` text DEFAULT NULL,
  `target_audience` enum('parent','student','staff','all') NOT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `send_sms` tinyint(1) DEFAULT 0,
  `send_email` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event` (`event_type`,`category`),
  KEY `idx_event` (`event_type`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_templates`
--

LOCK TABLES `notification_templates` WRITE;
/*!40000 ALTER TABLE `notification_templates` DISABLE KEYS */;
INSERT INTO `notification_templates` VALUES (1,'student_absent','attendance','Absence Alert: {{student_name}}','Your child {{student_name}} was marked absent on {{date}}. Please contact the school if this is incorrect.','{{student_name}} absent on {{date}}. Contact school.','parent','high',1,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(2,'grade_posted','academics','New Grade Posted','{{student_name}} received a grade of {{grade}} in {{subject}}. Average: {{average}}%','Grade posted: {{grade}} in {{subject}}','parent','normal',0,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(3,'assignment_created','academics','New Assignment: {{title}}','A new assignment \"{{title}}\" has been posted for {{subject}}. Due: {{due_date}}','New assignment: {{title}} due {{due_date}}','student','normal',0,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(4,'fee_reminder','finance','Fee Payment Reminder','Fee payment of {{amount}} RWF is due on {{due_date}} for {{term}}. Current balance: {{balance}} RWF','Fee due: {{amount}} RWF by {{due_date}}','parent','high',1,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(5,'discipline_incident','discipline','Discipline Alert','Your child {{student_name}} was involved in a {{incident_type}} incident. Action: {{action_taken}}','Discipline alert for {{student_name}}. Contact school.','parent','urgent',1,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(6,'exam_scheduled','academics','Exam Scheduled: {{subject}}','An exam for {{subject}} has been scheduled on {{exam_date}}. Total marks: {{total_marks}}','Exam: {{subject}} on {{exam_date}}','student','high',0,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(7,'school_event','general','School Event: {{event_name}}','{{event_name}} is scheduled for {{event_date}} at {{location}}. {{description}}','Event: {{event_name}} on {{event_date}}','all','normal',1,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(8,'payment_received','finance','Payment Received','Payment of {{amount}} RWF received. New balance: {{balance}} RWF. Thank you!','Payment received: {{amount}} RWF','parent','normal',1,0,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(9,'report_card_ready','academics','Report Card Available','The report card for {{student_name}} - {{term}} is now available. Overall grade: {{grade}}','Report card ready for {{term}}','parent','high',1,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(10,'assignment_due_soon','academics','Assignment Due Tomorrow','Reminder: \"{{title}}\" is due tomorrow for {{subject}}. Please submit on time.','Assignment \"{{title}}\" due tomorrow','student','high',0,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(11,'fee_overdue','finance','Overdue Fee Payment','Fee payment of {{amount}} RWF was due on {{due_date}}. Please pay immediately to avoid penalties.','Fee overdue: {{amount}} RWF. Pay now.','parent','urgent',1,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55'),(12,'exam_reminder','academics','Exam Tomorrow: {{subject}}','Reminder: {{subject}} exam is scheduled for tomorrow at {{time}}. Good luck!','Exam tomorrow: {{subject}} at {{time}}','student','high',0,1,1,'2026-01-26 11:48:55','2026-01-26 11:48:55');
/*!40000 ALTER TABLE `notification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_public` tinyint(1) DEFAULT 1,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `action_url` varchar(500) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `online_quizzes`
--

DROP TABLE IF EXISTS `online_quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `online_quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `total_marks` int(11) NOT NULL,
  `passing_marks` int(11) NOT NULL,
  `difficulty_level` enum('easy','medium','hard','expert') DEFAULT 'medium',
  `quiz_type` enum('multiple_choice','true_false','mixed') DEFAULT 'mixed',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `attempts_allowed` int(11) DEFAULT 1,
  `shuffle_questions` tinyint(1) DEFAULT 1,
  `show_results_immediately` tinyint(1) DEFAULT 0,
  `status` enum('draft','published','active','completed','archived') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `online_quizzes_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `online_quizzes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `online_quizzes_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `online_quizzes`
--

LOCK TABLES `online_quizzes` WRITE;
/*!40000 ALTER TABLE `online_quizzes` DISABLE KEYS */;
/*!40000 ALTER TABLE `online_quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_activity_log`
--

DROP TABLE IF EXISTS `parent_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` varchar(50) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `activity_type` enum('login','view_grades','view_attendance','view_discipline','view_fees','download_report','contact_teacher','submit_payment','update_settings','view_schedule','view_assignments','view_achievements') NOT NULL,
  `activity_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`activity_details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_duration` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_activity_type` (`activity_type`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `parent_activity_log_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parent_profiles` (`parent_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_activity_log`
--

LOCK TABLES `parent_activity_log` WRITE;
/*!40000 ALTER TABLE `parent_activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_child_links`
--

DROP TABLE IF EXISTS `parent_child_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_child_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_user_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `student_name` varchar(200) NOT NULL,
  `student_level` varchar(50) NOT NULL,
  `student_year` int(11) NOT NULL,
  `verification_code` varchar(50) NOT NULL,
  `request_date` date NOT NULL,
  `verification_date` date DEFAULT NULL,
  `status` enum('pending','verified','rejected','expired') DEFAULT 'pending',
  `verified_by` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `expires_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `verification_code` (`verification_code`),
  KEY `student_id` (`student_id`),
  KEY `verified_by` (`verified_by`),
  KEY `idx_parent_user_id` (`parent_user_id`),
  KEY `idx_verification_code` (`verification_code`),
  KEY `idx_status` (`status`),
  CONSTRAINT `parent_child_links_ibfk_1` FOREIGN KEY (`parent_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parent_child_links_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  CONSTRAINT `parent_child_links_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_child_links`
--

LOCK TABLES `parent_child_links` WRITE;
/*!40000 ALTER TABLE `parent_child_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_child_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_communications`
--

DROP TABLE IF EXISTS `parent_communications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_communications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `advisor_id` int(11) NOT NULL,
  `communication_type` enum('call','sms','email','meeting','home_visit') NOT NULL,
  `subject_rw` varchar(200) NOT NULL,
  `subject_en` varchar(200) DEFAULT NULL,
  `message_rw` text NOT NULL,
  `message_en` text DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('pending','sent','delivered','read','replied') DEFAULT 'pending',
  `scheduled_date` datetime DEFAULT NULL,
  `sent_date` datetime DEFAULT NULL,
  `response_rw` text DEFAULT NULL,
  `response_en` text DEFAULT NULL,
  `response_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `parent_communications_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_communications`
--

LOCK TABLES `parent_communications` WRITE;
/*!40000 ALTER TABLE `parent_communications` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_communications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_connections`
--

DROP TABLE IF EXISTS `parent_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `can_view_marks` tinyint(1) DEFAULT 1,
  `can_view_attendance` tinyint(1) DEFAULT 1,
  `can_view_discipline` tinyint(1) DEFAULT 1,
  `can_view_report_cards` tinyint(1) DEFAULT 1,
  `can_receive_sms` tinyint(1) DEFAULT 1,
  `status` enum('active','pending','revoked','expired') DEFAULT 'pending',
  `access_granted_by` varchar(100) DEFAULT NULL,
  `access_granted_at` datetime DEFAULT NULL,
  `access_expires_at` datetime DEFAULT NULL,
  `access_revoked_by` varchar(100) DEFAULT NULL,
  `access_revoked_at` datetime DEFAULT NULL,
  `revocation_reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_parent` (`student_id`,`parent_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_connections`
--

LOCK TABLES `parent_connections` WRITE;
/*!40000 ALTER TABLE `parent_connections` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_connections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_details`
--

DROP TABLE IF EXISTS `parent_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `relationship` enum('father','mother','guardian') DEFAULT 'guardian',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `parent_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_details`
--

LOCK TABLES `parent_details` WRITE;
/*!40000 ALTER TABLE `parent_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_discipline_notifications`
--

DROP TABLE IF EXISTS `parent_discipline_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_discipline_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `notification_type` enum('conduct_removed','leave_approved','discipline_warning') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `parent_discipline_notifications_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parent_discipline_notifications_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_discipline_notifications`
--

LOCK TABLES `parent_discipline_notifications` WRITE;
/*!40000 ALTER TABLE `parent_discipline_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_discipline_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_feedback`
--

DROP TABLE IF EXISTS `parent_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `feedback_type` enum('complaint','suggestion','compliment','inquiry','concern') NOT NULL,
  `category` enum('academic','discipline','facilities','staff','fees','transport','food','other') NOT NULL,
  `subject_rw` varchar(200) NOT NULL,
  `subject_en` varchar(200) DEFAULT NULL,
  `message_rw` text NOT NULL,
  `message_en` text DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('received','reviewing','investigating','resolved','closed') DEFAULT 'received',
  `assigned_to` int(11) DEFAULT NULL,
  `response_rw` text DEFAULT NULL,
  `response_en` text DEFAULT NULL,
  `resolution_rw` text DEFAULT NULL,
  `resolution_en` text DEFAULT NULL,
  `satisfaction_rating` int(11) DEFAULT NULL,
  `resolved_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `parent_feedback_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_feedback`
--

LOCK TABLES `parent_feedback` WRITE;
/*!40000 ALTER TABLE `parent_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_linking_requests`
--

DROP TABLE IF EXISTS `parent_linking_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_linking_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `preferred_contact` enum('email','phone') DEFAULT 'email',
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `parent_linking_requests_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_linking_requests`
--

LOCK TABLES `parent_linking_requests` WRITE;
/*!40000 ALTER TABLE `parent_linking_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_linking_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_meetings`
--

DROP TABLE IF EXISTS `parent_meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_meetings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `advisor_id` int(11) NOT NULL,
  `meeting_type` enum('individual','group','emergency','routine') NOT NULL,
  `title_rw` varchar(200) NOT NULL,
  `title_en` varchar(200) DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `meeting_date` datetime NOT NULL,
  `duration_minutes` int(11) DEFAULT 30,
  `status` enum('scheduled','confirmed','completed','cancelled','rescheduled') DEFAULT 'scheduled',
  `attendance_status` enum('present','absent','late') DEFAULT NULL,
  `notes_rw` text DEFAULT NULL,
  `notes_en` text DEFAULT NULL,
  `action_items` text DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `parent_meetings_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_meetings`
--

LOCK TABLES `parent_meetings` WRITE;
/*!40000 ALTER TABLE `parent_meetings` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_messages`
--

DROP TABLE IF EXISTS `parent_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message_id` varchar(50) NOT NULL,
  `parent_id` varchar(50) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `recipient_type` enum('teacher','admin','dod','matron','accountant','all') NOT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `message` text NOT NULL,
  `message_type` enum('inquiry','feedback','complaint','request','suggestion','emergency') DEFAULT 'inquiry',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `status` enum('sent','read','replied','archived') DEFAULT 'sent',
  `sent_via` enum('sms','email','whatsapp','portal','all') DEFAULT 'portal',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `reply_to_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_id` (`message_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_recipient` (`recipient_type`,`recipient_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `parent_messages_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parent_profiles` (`parent_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_messages`
--

LOCK TABLES `parent_messages` WRITE;
/*!40000 ALTER TABLE `parent_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_notification_settings`
--

DROP TABLE IF EXISTS `parent_notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_notification_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` varchar(50) NOT NULL,
  `notify_on_grades` tinyint(1) DEFAULT 1,
  `notify_on_attendance` tinyint(1) DEFAULT 1,
  `notify_on_discipline` tinyint(1) DEFAULT 1,
  `notify_on_fees` tinyint(1) DEFAULT 1,
  `notify_on_events` tinyint(1) DEFAULT 1,
  `notify_on_announcements` tinyint(1) DEFAULT 1,
  `notify_on_assignments` tinyint(1) DEFAULT 1,
  `notify_on_exams` tinyint(1) DEFAULT 1,
  `notify_on_achievements` tinyint(1) DEFAULT 1,
  `notify_on_absences` tinyint(1) DEFAULT 1,
  `notify_on_late_arrivals` tinyint(1) DEFAULT 1,
  `notify_on_low_grades` tinyint(1) DEFAULT 1,
  `grade_threshold` decimal(5,2) DEFAULT 60.00,
  `sms_enabled` tinyint(1) DEFAULT 1,
  `email_enabled` tinyint(1) DEFAULT 1,
  `whatsapp_enabled` tinyint(1) DEFAULT 0,
  `push_enabled` tinyint(1) DEFAULT 0,
  `quiet_hours_enabled` tinyint(1) DEFAULT 0,
  `quiet_hours_start` time DEFAULT '22:00:00',
  `quiet_hours_end` time DEFAULT '06:00:00',
  `language_preference` enum('en','rw','fr') DEFAULT 'en',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_parent_settings` (`parent_id`),
  CONSTRAINT `parent_notification_settings_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parent_profiles` (`parent_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_notification_settings`
--

LOCK TABLES `parent_notification_settings` WRITE;
/*!40000 ALTER TABLE `parent_notification_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_notification_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_notifications`
--

DROP TABLE IF EXISTS `parent_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_user_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `notification_type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_table` varchar(100) DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_parent_user_id` (`parent_user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_parent_notifications_student` (`student_id`),
  CONSTRAINT `parent_notifications_ibfk_1` FOREIGN KEY (`parent_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parent_notifications_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_notifications`
--

LOCK TABLES `parent_notifications` WRITE;
/*!40000 ALTER TABLE `parent_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_profiles`
--

DROP TABLE IF EXISTS `parent_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `parent_id` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `alternate_phone` varchar(20) DEFAULT NULL,
  `whatsapp_number` varchar(20) DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `id_type` enum('national_id','passport','drivers_license','other') DEFAULT 'national_id',
  `occupation` varchar(100) DEFAULT NULL,
  `employer` varchar(200) DEFAULT NULL,
  `workplace_phone` varchar(20) DEFAULT NULL,
  `workplace_address` text DEFAULT NULL,
  `home_address` text DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `relationship_to_student` enum('father','mother','guardian','other') DEFAULT 'father',
  `is_primary_contact` tinyint(1) DEFAULT 1,
  `can_receive_sms` tinyint(1) DEFAULT 1,
  `can_receive_email` tinyint(1) DEFAULT 1,
  `can_receive_whatsapp` tinyint(1) DEFAULT 0,
  `preferred_language` enum('en','rw','fr') DEFAULT 'en',
  `communication_preference` enum('sms','email','whatsapp','phone') DEFAULT 'sms',
  `account_status` enum('active','inactive','suspended','pending_verification') DEFAULT 'active',
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_id` (`parent_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `parent_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_profiles`
--

LOCK TABLES `parent_profiles` WRITE;
/*!40000 ALTER TABLE `parent_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_routes`
--

DROP TABLE IF EXISTS `parent_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_routes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `route_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_routes`
--

LOCK TABLES `parent_routes` WRITE;
/*!40000 ALTER TABLE `parent_routes` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_sheets`
--

DROP TABLE IF EXISTS `parent_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `parent_sheets_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parent_sheets_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_sheets`
--

LOCK TABLES `parent_sheets` WRITE;
/*!40000 ALTER TABLE `parent_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_student`
--

DROP TABLE IF EXISTS `parent_student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_student` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `relationship` enum('father','mother','guardian') DEFAULT 'guardian',
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_parent_student` (`parent_id`,`student_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_student` (`student_id`),
  CONSTRAINT `parent_student_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parent_student_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_student`
--

LOCK TABLES `parent_student` WRITE;
/*!40000 ALTER TABLE `parent_student` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_verification_requests`
--

DROP TABLE IF EXISTS `parent_verification_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_verification_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` varchar(50) DEFAULT NULL,
  `parent_phone` varchar(20) NOT NULL,
  `parent_email` varchar(150) DEFAULT NULL,
  `parent_name` varchar(200) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `student_name` varchar(200) DEFAULT NULL,
  `student_trade` varchar(50) DEFAULT NULL,
  `student_level` int(11) DEFAULT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `relationship_type` enum('father','mother','guardian','other') DEFAULT 'guardian',
  `verification_code` varchar(10) DEFAULT NULL,
  `verification_status` enum('pending','verified','expired','cancelled') DEFAULT 'pending',
  `request_status` enum('pending','approved','rejected','completed') DEFAULT 'pending',
  `request_message` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_phone` (`parent_phone`),
  KEY `idx_student` (`student_id`),
  KEY `idx_verification_code` (`verification_code`),
  KEY `idx_status` (`request_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_verification_requests`
--

LOCK TABLES `parent_verification_requests` WRITE;
/*!40000 ALTER TABLE `parent_verification_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_verification_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parents`
--

DROP TABLE IF EXISTS `parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `relationship` enum('father','mother','guardian') DEFAULT 'guardian',
  `profile_image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES (1,'test_parent_1769605231677','testparent1769605231677@test.com','$2a$10$0JP87HK8nSm/HwAQ8Wx6kui/L4okvPydVJcc5ti9jIOYOuhXJtosm','Test','Parent','0788123456','Kigali, Rwanda',NULL,'guardian',NULL,1,'2026-01-28 03:01:38','2026-01-28 13:00:31','2026-01-28 13:01:38'),(2,'parent_1769966329848','parent_0796329328@garden.tvet','$2a$10$EWaQQVbgyQYgbw2ef6FUdeDGBRoo4Qd/JRUvYQ9njkii85zOgROoW','Test','Parent','0796329328',NULL,NULL,'guardian',NULL,1,'2026-02-01 07:31:41','2026-02-01 17:18:49','2026-02-01 17:31:41');
/*!40000 ALTER TABLE `parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_proofs`
--

DROP TABLE IF EXISTS `payment_proofs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_proofs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_number` varchar(100) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `trade` varchar(50) DEFAULT NULL,
  `level` varchar(20) DEFAULT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `proof_image` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','verified','rejected','processed') DEFAULT 'pending',
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verification_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `submission_number` (`submission_number`),
  KEY `verified_by` (`verified_by`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_date` (`payment_date`),
  CONSTRAINT `payment_proofs_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_proofs`
--

LOCK TABLES `payment_proofs` WRITE;
/*!40000 ALTER TABLE `payment_proofs` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_proofs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_reminders`
--

DROP TABLE IF EXISTS `payment_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_reminders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `reminder_date` datetime NOT NULL,
  `message` text NOT NULL,
  `sent_by` int(11) DEFAULT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `sent_by` (`sent_by`),
  KEY `idx_reminder_status` (`status`),
  KEY `idx_reminder_date` (`reminder_date`),
  CONSTRAINT `payment_reminders_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_reminders_ibfk_2` FOREIGN KEY (`sent_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_reminders`
--

LOCK TABLES `payment_reminders` WRITE;
/*!40000 ALTER TABLE `payment_reminders` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'RWF',
  `payment_type` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `reference` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `peer_reviews`
--

DROP TABLE IF EXISTS `peer_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `peer_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `submission_type` enum('assignment','homework','project') NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `review_content` text NOT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `criteria_ratings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`criteria_ratings`)),
  `is_anonymous` tinyint(1) DEFAULT 1,
  `helpful_votes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reviewer_id` (`reviewer_id`),
  CONSTRAINT `peer_reviews_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `peer_reviews`
--

LOCK TABLES `peer_reviews` WRITE;
/*!40000 ALTER TABLE `peer_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `peer_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_reviews`
--

DROP TABLE IF EXISTS `performance_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performance_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `reviewer_id` int(11) DEFAULT NULL,
  `review_date` date NOT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `weaknesses` text DEFAULT NULL,
  `goals` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_employee_date` (`employee_id`,`review_date`),
  CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_reviews`
--

LOCK TABLES `performance_reviews` WRITE;
/*!40000 ALTER TABLE `performance_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `module` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'users.create','Create new users','users','2026-01-24 05:02:44'),(2,'users.read','View users','users','2026-01-24 05:02:44'),(3,'users.update','Update user information','users','2026-01-24 05:02:44'),(4,'users.delete','Delete users','users','2026-01-24 05:02:44'),(5,'users.manage_roles','Manage user roles','users','2026-01-24 05:02:44'),(6,'academics.create','Create academic records','academics','2026-01-24 05:02:44'),(7,'academics.read','View academic records','academics','2026-01-24 05:02:44'),(8,'academics.update','Update academic records','academics','2026-01-24 05:02:44'),(9,'academics.delete','Delete academic records','academics','2026-01-24 05:02:44'),(10,'academics.manage_grades','Manage student grades','academics','2026-01-24 05:02:44'),(11,'academics.manage_attendance','Manage attendance','academics','2026-01-24 05:02:44'),(12,'finance.create','Create financial records','finance','2026-01-24 05:02:44'),(13,'finance.read','View financial records','finance','2026-01-24 05:02:44'),(14,'finance.update','Update financial records','finance','2026-01-24 05:02:44'),(15,'finance.delete','Delete financial records','finance','2026-01-24 05:02:44'),(16,'finance.process_payments','Process payments','finance','2026-01-24 05:02:44'),(17,'stock.create','Create stock records','stock','2026-01-24 05:02:44'),(18,'stock.read','View stock records','stock','2026-01-24 05:02:44'),(19,'stock.update','Update stock records','stock','2026-01-24 05:02:44'),(20,'stock.delete','Delete stock records','stock','2026-01-24 05:02:44'),(21,'stock.manage_movements','Manage stock movements','stock','2026-01-24 05:02:44'),(22,'content.create','Create content','content','2026-01-24 05:02:44'),(23,'content.read','View content','content','2026-01-24 05:02:44'),(24,'content.update','Update content','content','2026-01-24 05:02:44'),(25,'content.delete','Delete content','content','2026-01-24 05:02:44'),(26,'communication.send','Send messages','communication','2026-01-24 05:02:44'),(27,'communication.read','Read messages','communication','2026-01-24 05:02:44'),(28,'communication.broadcast','Send broadcast messages','communication','2026-01-24 05:02:44'),(29,'settings.read','View system settings','settings','2026-01-24 05:02:44'),(30,'settings.update','Update system settings','settings','2026-01-24 05:02:44');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_stats`
--

DROP TABLE IF EXISTS `player_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `player_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) DEFAULT NULL,
  `match_id` int(11) DEFAULT NULL,
  `goals` int(11) DEFAULT 0,
  `assists` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `match_id` (`match_id`),
  CONSTRAINT `player_stats_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `player_stats_ibfk_2` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_stats`
--

LOCK TABLES `player_stats` WRITE;
/*!40000 ALTER TABLE `player_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `jersey_number` int(11) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `sport_type` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `players_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `positive_recognition`
--

DROP TABLE IF EXISTS `positive_recognition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `positive_recognition` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `recognition_type` enum('academic','behavior','leadership','sports','arts','community_service') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `awarded_by` int(11) NOT NULL,
  `award_date` date NOT NULL,
  `points_awarded` int(11) DEFAULT 0,
  `certificate_issued` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `awarded_by` (`awarded_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_recognition_type` (`recognition_type`),
  CONSTRAINT `positive_recognition_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `positive_recognition_ibfk_2` FOREIGN KEY (`awarded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positive_recognition`
--

LOCK TABLES `positive_recognition` WRITE;
/*!40000 ALTER TABLE `positive_recognition` DISABLE KEYS */;
/*!40000 ALTER TABLE `positive_recognition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `predictive_alerts`
--

DROP TABLE IF EXISTS `predictive_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `predictive_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alert_type` varchar(100) NOT NULL,
  `severity` enum('info','warning','critical','urgent') NOT NULL,
  `entity_type` enum('student','class','teacher','system') NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `alert_title` varchar(255) NOT NULL,
  `alert_message` text NOT NULL,
  `prediction_confidence` decimal(5,2) DEFAULT NULL,
  `recommended_action` text DEFAULT NULL,
  `status` enum('active','acknowledged','resolved','dismissed') DEFAULT 'active',
  `acknowledged_by` int(11) DEFAULT NULL,
  `acknowledged_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `acknowledged_by` (`acknowledged_by`),
  KEY `idx_alert_type` (`alert_type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `predictive_alerts_ibfk_1` FOREIGN KEY (`acknowledged_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predictive_alerts`
--

LOCK TABLES `predictive_alerts` WRITE;
/*!40000 ALTER TABLE `predictive_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `predictive_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `predictive_analytics`
--

DROP TABLE IF EXISTS `predictive_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `predictive_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `prediction_type` enum('performance','dropout_risk','success_probability','time_to_mastery') NOT NULL,
  `predicted_value` decimal(10,2) DEFAULT NULL,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `contributing_factors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contributing_factors`)),
  `recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recommendations`)),
  `prediction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `predictive_analytics_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `predictive_analytics_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predictive_analytics`
--

LOCK TABLES `predictive_analytics` WRITE;
/*!40000 ALTER TABLE `predictive_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `predictive_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurement_order_items`
--

DROP TABLE IF EXISTS `procurement_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `procurement_order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity_ordered` int(11) NOT NULL,
  `quantity_received` int(11) DEFAULT 0,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `procurement_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `procurement_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `procurement_order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurement_order_items`
--

LOCK TABLES `procurement_order_items` WRITE;
/*!40000 ALTER TABLE `procurement_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `procurement_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurement_orders`
--

DROP TABLE IF EXISTS `procurement_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `procurement_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(100) NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `supplier_contact` varchar(100) DEFAULT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `status` enum('pending','ordered','partial','delivered','cancelled') DEFAULT 'pending',
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `payment_status` enum('unpaid','partial','paid') DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT NULL,
  `ordered_by` int(11) NOT NULL,
  `received_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `ordered_by` (`ordered_by`),
  KEY `received_by` (`received_by`),
  KEY `idx_status` (`status`),
  KEY `idx_supplier` (`supplier`),
  CONSTRAINT `procurement_orders_ibfk_1` FOREIGN KEY (`ordered_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `procurement_orders_ibfk_2` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurement_orders`
--

LOCK TABLES `procurement_orders` WRITE;
/*!40000 ALTER TABLE `procurement_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `procurement_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile_edit_history`
--

DROP TABLE IF EXISTS `profile_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profile_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `field_changed` varchar(100) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `profile_edit_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile_edit_history`
--

LOCK TABLES `profile_edit_history` WRITE;
/*!40000 ALTER TABLE `profile_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `profile_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provinces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `name_en` varchar(100) DEFAULT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES (1,'Kigali City','KGL','2026-02-10 05:00:28',NULL,NULL),(2,'Eastern Province','EST','2026-02-10 05:00:28',NULL,NULL),(3,'Northern Province','NTH','2026-02-10 05:00:28',NULL,NULL),(4,'Southern Province','STH','2026-02-10 05:00:28',NULL,NULL),(5,'Western Province','WST','2026-02-10 05:00:28',NULL,NULL);
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `punishments`
--

DROP TABLE IF EXISTS `punishments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `punishments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `case_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `punishment_type` enum('iburira','guhagarikwa_iminsi','guhagarikwa_byimazeyo','kwirukana') DEFAULT 'iburira',
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('bitegerejwe','birakora','byarangiye') DEFAULT 'bitegerejwe',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_case` (`case_id`),
  KEY `idx_status` (`status`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `punishments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `punishments`
--

LOCK TABLES `punishments` WRITE;
/*!40000 ALTER TABLE `punishments` DISABLE KEYS */;
/*!40000 ALTER TABLE `punishments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_items`
--

LOCK TABLES `purchase_order_items` WRITE;
/*!40000 ALTER TABLE `purchase_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','received','cancelled') DEFAULT 'pending',
  `order_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_bank`
--

DROP TABLE IF EXISTS `question_bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `question_bank` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','true_false','short_answer','essay','coding') NOT NULL,
  `difficulty_level` int(11) DEFAULT 1,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`correct_answer`)),
  `explanation` text DEFAULT NULL,
  `points` decimal(5,2) DEFAULT 1.00,
  `created_by` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `question_bank_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `question_bank_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_bank`
--

LOCK TABLES `question_bank` WRITE;
/*!40000 ALTER TABLE `question_bank` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_bank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quick_links`
--

DROP TABLE IF EXISTS `quick_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quick_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quick_links`
--

LOCK TABLES `quick_links` WRITE;
/*!40000 ALTER TABLE `quick_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `quick_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_answers`
--

DROP TABLE IF EXISTS `quiz_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `student_answer` text DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `marks_awarded` decimal(5,2) DEFAULT NULL,
  `time_spent_seconds` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  KEY `idx_attempt_id` (`attempt_id`),
  CONSTRAINT `quiz_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_answers`
--

LOCK TABLES `quiz_answers` WRITE;
/*!40000 ALTER TABLE `quiz_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attempt_number` int(11) DEFAULT 1,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `time_taken_minutes` int(11) DEFAULT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `score` decimal(5,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `grade_letter` varchar(2) DEFAULT NULL,
  `is_passed` tinyint(1) DEFAULT NULL,
  `status` enum('in_progress','completed','timed_out','abandoned') DEFAULT 'in_progress',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attempt` (`quiz_id`,`student_id`,`attempt_number`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_questions`
--

DROP TABLE IF EXISTS `quiz_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','true_false','short_answer') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` text NOT NULL,
  `marks` int(11) NOT NULL,
  `explanation` text DEFAULT NULL,
  `difficulty` enum('easy','medium','hard') DEFAULT 'medium',
  `order_number` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `online_quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_questions`
--

LOCK TABLES `quiz_questions` WRITE;
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `trade_class_id` int(11) NOT NULL,
  `quiz_type` enum('practice','assessment','exam','pop_quiz') DEFAULT 'assessment',
  `total_marks` decimal(5,2) NOT NULL DEFAULT 100.00,
  `duration_minutes` int(11) NOT NULL,
  `instructions` text DEFAULT NULL,
  `questions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`questions`)),
  `answer_key` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answer_key`)),
  `passing_score` decimal(5,2) DEFAULT 50.00,
  `allow_retake` tinyint(1) DEFAULT 0,
  `max_attempts` int(11) DEFAULT 1,
  `shuffle_questions` tinyint(1) DEFAULT 1,
  `shuffle_options` tinyint(1) DEFAULT 1,
  `show_results_immediately` tinyint(1) DEFAULT 0,
  `scheduled_date` datetime DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `trade_class_id` (`trade_class_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quizzes_ibfk_3` FOREIGN KEY (`trade_class_id`) REFERENCES `trade_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `real_time_dashboard_metrics`
--

DROP TABLE IF EXISTS `real_time_dashboard_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `real_time_dashboard_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metric_type` varchar(100) NOT NULL,
  `metric_value` decimal(12,2) DEFAULT NULL,
  `metric_label` varchar(200) DEFAULT NULL,
  `metric_category` varchar(100) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_metric` (`metric_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `real_time_dashboard_metrics`
--

LOCK TABLES `real_time_dashboard_metrics` WRITE;
/*!40000 ALTER TABLE `real_time_dashboard_metrics` DISABLE KEYS */;
/*!40000 ALTER TABLE `real_time_dashboard_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `realtime_messages`
--

DROP TABLE IF EXISTS `realtime_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `realtime_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message_type` enum('text','file','emoji','system') DEFAULT 'text',
  `content` text NOT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `is_private` tinyint(1) DEFAULT 0,
  `recipient_id` int(11) DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `edited` tinyint(1) DEFAULT 0,
  `edited_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `sender_id` (`sender_id`),
  KEY `recipient_id` (`recipient_id`),
  CONSTRAINT `realtime_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `live_study_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `realtime_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `realtime_messages_ibfk_3` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `realtime_messages`
--

LOCK TABLES `realtime_messages` WRITE;
/*!40000 ALTER TABLE `realtime_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `realtime_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `realtime_notifications`
--

DROP TABLE IF EXISTS `realtime_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `realtime_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error','announcement') DEFAULT 'info',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `action_url` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_read` (`is_read`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `realtime_notifications`
--

LOCK TABLES `realtime_notifications` WRITE;
/*!40000 ALTER TABLE `realtime_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `realtime_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token`(255)),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration_notifications`
--

DROP TABLE IF EXISTS `registration_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `registration_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_type` varchar(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `notified_roles` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `registration_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_notifications`
--

LOCK TABLES `registration_notifications` WRITE;
/*!40000 ALTER TABLE `registration_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `registration_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_card_marks`
--

DROP TABLE IF EXISTS `report_card_marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `report_card_marks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_card_id` varchar(50) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `course_name` varchar(100) NOT NULL,
  `quiz_score` decimal(5,2) DEFAULT NULL,
  `midterm_score` decimal(5,2) DEFAULT NULL,
  `final_score` decimal(5,2) DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT 0.00,
  `grade` varchar(5) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_report_card_id` (`report_card_id`),
  KEY `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_card_marks`
--

LOCK TABLES `report_card_marks` WRITE;
/*!40000 ALTER TABLE `report_card_marks` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_card_marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_cards`
--

DROP TABLE IF EXISTS `report_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `report_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` varchar(50) NOT NULL,
  `student_id` int(11) NOT NULL,
  `trade_code` varchar(20) NOT NULL,
  `level_number` int(11) NOT NULL,
  `level_suffix` varchar(5) DEFAULT NULL,
  `term` varchar(20) NOT NULL,
  `academic_year` varchar(10) NOT NULL,
  `total_score` decimal(10,2) DEFAULT 0.00,
  `average_score` decimal(10,2) DEFAULT 0.00,
  `gpa` decimal(4,2) DEFAULT 0.00,
  `rank_position` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `include_ranks` tinyint(1) DEFAULT 1,
  `include_teacher_comments` tinyint(1) DEFAULT 1,
  `include_dos_comments` tinyint(1) DEFAULT 1,
  `include_attendance` tinyint(1) DEFAULT 1,
  `teacher_comments` text DEFAULT NULL,
  `dos_comments` text DEFAULT NULL,
  `generated_by` varchar(100) DEFAULT 'System',
  `generated_at` datetime DEFAULT current_timestamp(),
  `published_by` varchar(100) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_id` (`report_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_trade_code` (`trade_code`),
  KEY `idx_term` (`term`),
  KEY `idx_academic_year` (`academic_year`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_cards`
--

LOCK TABLES `report_cards` WRITE;
/*!40000 ALTER TABLE `report_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_type` varchar(100) NOT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `data` longtext DEFAULT NULL,
  `format` varchar(50) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_type` (`report_type`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_credentials`
--

DROP TABLE IF EXISTS `role_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_credentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferences`)),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`),
  KEY `idx_role` (`role_name`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7988 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_credentials`
--

LOCK TABLES `role_credentials` WRITE;
/*!40000 ALTER TABLE `role_credentials` DISABLE KEYS */;
INSERT INTO `role_credentials` VALUES (1,'director_study','reponse@gmail.com','$2a$10$atIwqta/2GQtY0C5m3LFM.4I8OJl1f.FqpD4i91gIyRJaL8a9EG..','Director','of Studies',NULL,NULL,NULL,'2026-01-25 06:33:09',1,'2026-01-21 19:00:19','2026-01-25 06:33:09'),(2,'director_discipline','reponse@gmail.com','$2a$10$W2urnAbPrRug7z.xxp4eAujF3c2/5fH/qIpQrSsHLXe.78RqyhRFW','Director','of Discipline',NULL,NULL,NULL,'2026-01-26 09:07:36',1,'2026-01-21 19:00:19','2026-01-26 09:07:36'),(3,'headmaster','reponse@gmail.com','$2a$10$KBiBXrNNwy3R3INE7zWTiOlJicl3S5YC71AJc6cJ3J4jAVTTIoeyG','Head','Master',NULL,NULL,NULL,'2026-01-28 13:31:40',1,'2026-01-21 19:00:19','2026-01-28 13:31:40'),(4,'teacher','reponse@gmail.com','$2a$10$T5ghFdnpJ02JFWNWWQ2zwOLEJg.jaquK.wkRQyYi7nL0zTsUFO7am','Teacher','Staff',NULL,NULL,NULL,'2026-01-25 14:57:45',1,'2026-01-21 19:00:19','2026-01-25 14:57:45'),(5,'accountant','reponse@gmail.com','$2a$10$D07tCZpS0pWugKI7teIWfOj7t6crA.9d89dRy/DDEcVTqSYMXbcHS','School','Accountant',NULL,NULL,NULL,'2026-01-25 14:14:31',1,'2026-01-21 19:00:19','2026-01-25 14:14:31'),(6,'stock_manager','reponse@gmail.com','$2a$10$3PFiQ6jKwBbAzUCNALAVm.MW2gD/ZPJyV8oJPOD3VmgSzP4cSEp2W','Stock','Manager',NULL,NULL,NULL,NULL,1,'2026-01-21 19:00:19','2026-01-21 19:00:19'),(7,'admin','reponse@gmail.com','$2a$10$/e/OARpQGsjFGckLjvlswuxWW3ANImjof/yGwkDNvOHRoGSFLNzzq','System','Admin',NULL,NULL,NULL,'2026-01-26 08:16:21',1,'2026-01-21 19:00:19','2026-01-26 08:16:21');
/*!40000 ALTER TABLE `role_credentials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1,6,'2026-01-24 05:02:44'),(2,1,9,'2026-01-24 05:02:44'),(3,1,11,'2026-01-24 05:02:44'),(4,1,10,'2026-01-24 05:02:44'),(5,1,7,'2026-01-24 05:02:44'),(6,1,8,'2026-01-24 05:02:44'),(7,1,28,'2026-01-24 05:02:44'),(8,1,27,'2026-01-24 05:02:44'),(9,1,26,'2026-01-24 05:02:44'),(10,1,22,'2026-01-24 05:02:44'),(11,1,25,'2026-01-24 05:02:44'),(12,1,23,'2026-01-24 05:02:44'),(13,1,24,'2026-01-24 05:02:44'),(14,1,12,'2026-01-24 05:02:44'),(15,1,15,'2026-01-24 05:02:44'),(16,1,16,'2026-01-24 05:02:44'),(17,1,13,'2026-01-24 05:02:44'),(18,1,14,'2026-01-24 05:02:44'),(19,1,29,'2026-01-24 05:02:44'),(20,1,30,'2026-01-24 05:02:44'),(21,1,17,'2026-01-24 05:02:44'),(22,1,20,'2026-01-24 05:02:44'),(23,1,21,'2026-01-24 05:02:44'),(24,1,18,'2026-01-24 05:02:44'),(25,1,19,'2026-01-24 05:02:44'),(26,1,1,'2026-01-24 05:02:44'),(27,1,4,'2026-01-24 05:02:44'),(28,1,5,'2026-01-24 05:02:44'),(29,1,2,'2026-01-24 05:02:44'),(30,1,3,'2026-01-24 05:02:44'),(32,2,6,'2026-01-24 05:02:44'),(33,2,9,'2026-01-24 05:02:44'),(34,2,11,'2026-01-24 05:02:44'),(35,2,10,'2026-01-24 05:02:44'),(36,2,7,'2026-01-24 05:02:44'),(37,2,8,'2026-01-24 05:02:44'),(38,2,28,'2026-01-24 05:02:44'),(39,2,27,'2026-01-24 05:02:44'),(40,2,26,'2026-01-24 05:02:44'),(41,2,22,'2026-01-24 05:02:44'),(42,2,25,'2026-01-24 05:02:44'),(43,2,23,'2026-01-24 05:02:44'),(44,2,24,'2026-01-24 05:02:44'),(45,2,12,'2026-01-24 05:02:44'),(46,2,15,'2026-01-24 05:02:44'),(47,2,16,'2026-01-24 05:02:44'),(48,2,13,'2026-01-24 05:02:44'),(49,2,14,'2026-01-24 05:02:44'),(50,2,17,'2026-01-24 05:02:44'),(51,2,20,'2026-01-24 05:02:44'),(52,2,21,'2026-01-24 05:02:44'),(53,2,18,'2026-01-24 05:02:44'),(54,2,19,'2026-01-24 05:02:44'),(55,2,1,'2026-01-24 05:02:44'),(56,2,4,'2026-01-24 05:02:44'),(57,2,5,'2026-01-24 05:02:44'),(58,2,2,'2026-01-24 05:02:44'),(59,2,3,'2026-01-24 05:02:44');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'super_admin','Super Administrator with full system access',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(2,'admin','Administrator with most system access',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(3,'headmaster','Head Master role',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(4,'director_study','Director of Studies',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(5,'director_discipline','Director of Discipline',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(6,'teacher','Teaching staff',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(7,'student','Student user',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(8,'parent','Parent/Guardian user',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(9,'accountant','Financial management staff',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(10,'stock_manager','Stock management staff',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(11,'dos','Director of Studies',1,'2026-01-26 09:20:11','2026-01-26 09:20:11'),(12,'librarian','Librarian',1,'2026-01-26 09:20:11','2026-01-26 09:20:11'),(16,'dod','Director of Discipline - Discipline management',1,'2026-01-27 14:14:05','2026-01-27 14:14:05'),(21,'stockmanager','Stock Manager - Inventory management',1,'2026-01-27 14:14:05','2026-01-27 14:14:05'),(22,'advisor','Academic Advisor - Student guidance',1,'2026-01-27 14:14:05','2026-01-27 14:14:05'),(23,'patron','School Patron - General oversight',1,'2026-01-27 14:14:05','2026-01-27 14:14:05');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) NOT NULL,
  `building` varchar(100) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `room_type` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salaries`
--

DROP TABLE IF EXISTS `salaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `month` varchar(2) DEFAULT NULL,
  `year` varchar(4) DEFAULT NULL,
  `status` enum('pending','paid') DEFAULT 'pending',
  `payment_date` datetime DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salaries`
--

LOCK TABLES `salaries` WRITE;
/*!40000 ALTER TABLE `salaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `salaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_payments`
--

DROP TABLE IF EXISTS `salary_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salary_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `staff_name` varchar(255) NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `allowances` decimal(15,2) DEFAULT 0.00,
  `deductions` decimal(15,2) DEFAULT 0.00,
  `net_salary` decimal(15,2) NOT NULL,
  `payment_month` varchar(20) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `processed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  KEY `processed_by` (`processed_by`),
  CONSTRAINT `salary_payments_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `salary_payments_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_payments`
--

LOCK TABLES `salary_payments` WRITE;
/*!40000 ALTER TABLE `salary_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `salary_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduled_reports`
--

DROP TABLE IF EXISTS `scheduled_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `scheduled_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_type` varchar(100) NOT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `frequency` enum('daily','weekly','monthly') NOT NULL,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`recipients`)),
  `format` varchar(50) DEFAULT NULL,
  `last_run` timestamp NULL DEFAULT NULL,
  `next_run` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_reports`
--

LOCK TABLES `scheduled_reports` WRITE;
/*!40000 ALTER TABLE `scheduled_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `scheduled_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_leadership`
--

DROP TABLE IF EXISTS `school_leadership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `school_leadership` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `office_location` varchar(255) DEFAULT NULL,
  `responsibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities`)),
  `qualifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications`)),
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sort` (`sort_order`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_leadership`
--

LOCK TABLES `school_leadership` WRITE;
/*!40000 ALTER TABLE `school_leadership` DISABLE KEYS */;
INSERT INTO `school_leadership` VALUES (14,'Dr. Mugisha Jean Claude','Umuyobozi Mukuru w\'Ishuri','Ubuyobozi Bukuru','Umuyobozi mukuru w\'ishuri afite uburambe bw\'imyaka 15 mu buyobozi bw\'amashuri. Yize kugeza kuri Doctorate mu buyobozi bw\'uburezi kandi afite ubushobozi bukomeye mu guteza imbere amashuri. Yabaye umuyobozi mukuru kuva 2018, aho yagaragaje ubushobozi bukomeye mu kuyobora ishuri no guteza imbere uburezi bw\'ikoranabuhanga. Afite ubunararibonye mu gushyira mu bikorwa politiki z\'uburezi, gukora ingengo y\'imari, no guhuza abafatanyabikorwa batandukanye. Yashyizeho sisitemu nyinshi zo guteza imbere ishuri nko sisitemu yo gukurikirana abanyeshuri, sisitemu yo gucunga abakozi, na sisitemu yo gutanga raporo.','/api/placeholder/400/400','principal@garden-tvet.rw','+250 788 123 456','Office Block A, Room 101','[\"Kuyobora ishuri muri rusange no gushyira mu bikorwa politiki z\'ishuri\",\"Gufata ibyemezo by\'ingenzi ku mikorere y\'ishuri\",\"Guhuza abakozi bose b\'ishuri no kwemeza ko bakora neza\",\"Gufatanya n\'abafatanyabikorwa nko Minisiteri y\'Uburezi, REB, WDA\",\"Gukora ingengo y\'imari y\'ishuri no kuyicunga neza\",\"Gukurikirana iterambere ry\'ishuri no gutanga raporo\",\"Kwemeza ko ishuri ryubahiriza amategeko n\'amabwiriza\",\"Guteza imbere ubuyobozi bw\'ishuri\"]','[\"PhD mu Buyobozi bw\'Uburezi - Kigali Independent University (2015)\",\"Master\'s Degree mu Pedagogy - University of Rwanda (2010)\",\"Bachelor\'s Degree mu Education Management - Kigali Institute of Education (2005)\",\"Certificate mu School Leadership - Harvard Graduate School (2018)\",\"Training mu Strategic Planning - VVOB Rwanda (2019)\"]',1,1,'2026-01-23 08:26:01','2026-01-23 08:26:01'),(15,'Mukamana Grace','Umuyobozi w\'Amasomo (DOS)','Amasomo','Umuyobozi w\'amasomo ushinzwe gukurikirana amasomo yose y\'ishuri, gushyiraho amategeko y\'amasomo, no gufasha abarimu mu kazi kabo. Afite uburambe bw\'imyaka 12 mu buyobozi bw\'amasomo n\'imyigishirize. Yabaye DOS kuva 2019, aho yagaragaje ubushobozi bukomeye mu gutunganya amasomo, gukora amategeko y\'amasomo, no gufasha abarimu guteza imbere ubumenyi bwabo. Yashyizeho sisitemu yo gukurikirana amasomo, sisitemu yo gusuzuma abarimu, na sisitemu yo gutanga raporo z\'amasomo.','/api/placeholder/400/400','dos@garden-tvet.rw','+250 788 234 567','Office Block A, Room 102','[\"Gukurikirana amasomo yose y\'ishuri no kwemeza ko atangwa neza\",\"Gukora amategeko y\'amasomo (Timetables) akurikije ibisabwa\",\"Gufasha abarimu mu gutegura amasomo no gutanga ubufasha\",\"Gukurikirana iterambere ry\'abanyeshuri mu masomo\",\"Gusuzuma abarimu no kubafasha guteza imbere ubumenyi\",\"Gukora raporo z\'amasomo no kuzitanga ubuyobozi\",\"Gushyiraho ibizamini no kwemeza ko bikozwe neza\",\"Gufatanya n\'abarimu mu gukemura ibibazo by\'amasomo\"]','[\"Master\'s Degree mu Curriculum Development - University of Rwanda (2015)\",\"Bachelor\'s Degree mu Education - Kigali Institute of Education (2010)\",\"Certificate mu School Management - VVOB Rwanda (2017)\",\"Training mu Pedagogical Methods - British Council (2018)\",\"Diploma mu Educational Leadership - African Virtual University (2019)\"]',2,1,'2026-01-23 08:26:01','2026-01-23 08:26:01'),(16,'Nkusi Patrick','Umuyobozi w\'Imyigire (DOD)','Imyigire','Umuyobozi w\'imyigire ushinzwe gukurikirana imyigire y\'abanyeshuri mu by\'umukoro, gufasha abanyeshuri kubona amahugurwa, no guhuza n\'ibigo bitanga akazi. Afite uburambe bw\'imyaka 10 mu buyobozi bw\'imyigire n\'amahugurwa. Yabaye DOD kuva 2020, aho yagaragaje ubushobozi bukomeye mu guhuza abanyeshuri n\'ibigo bitanga akazi, gukora amasezerano n\'ibigo by\'imyigire, no gufasha abanyeshuri kubona amahugurwa.','/api/placeholder/400/400','dod@garden-tvet.rw','+250 788 345 678','Office Block B, Room 201','[\"Gukurikirana imyigire y\'abanyeshuri mu by\'umukoro\",\"Gufasha abanyeshuri kubona amahugurwa mu bigo bitanga akazi\",\"Guhuza n\'ibigo bitanga akazi no gukora amasezerano\",\"Gukora raporo z\'imyigire no kuzitanga ubuyobozi\",\"Gukurikirana abanyeshuri mu gihe cy\'imyigire\",\"Gufasha abanyeshuri kubona akazi nyuma y\'imyigire\",\"Gukora inama z\'abanyeshuri ku bijyanye n\'imyigire\",\"Kwemeza ko imyigire ihuye n\'ibisabwa n\'amashuri\"]','[\"Master\'s Degree mu Technical Education - Kigali Institute of Science and Technology (2016)\",\"Bachelor\'s Degree mu Engineering - University of Rwanda (2012)\",\"Certificate mu Vocational Training - WDA (2018)\",\"Training mu Industry Partnership - GIZ Rwanda (2019)\",\"Diploma mu Career Guidance - African Virtual University (2020)\"]',3,1,'2026-01-23 08:26:01','2026-01-23 08:26:01'),(17,'Uwase Marie','Umuyobozi w\'Amafaranga','Amafaranga','Umuyobozi w\'amafaranga ushinzwe gucunga amafaranga y\'ishuri, gukora ingengo y\'imari, no kwishyura abakozi. Afite uburambe bw\'imyaka 10 mu bucuruzi n\'ibaruramari. Yabaye umuyobozi w\'amafaranga kuva 2019, aho yagaragaje ubushobozi bukomeye mu gucunga amafaranga, gukora ingengo y\'imari, no kwishyura abakozi. Yashyizeho sisitemu yo gucunga amafaranga, sisitemu yo gukurikirana amafaranga, na sisitemu yo gutanga raporo z\'amafaranga.','/api/placeholder/400/400','accountant@garden-tvet.rw','+250 788 456 789','Office Block A, Room 103','[\"Gucunga amafaranga y\'ishuri no kwemeza ko akoreshwa neza\",\"Gukora ingengo y\'imari y\'ishuri no kuyikurikirana\",\"Kwishyura abakozi ku gihe no mu buryo bwuzuye\",\"Gukora raporo z\'amafaranga no kuzitanga ubuyobozi\",\"Gukurikirana amadeni y\'ishuri no gufasha abanyeshuri kwishyura\",\"Gukora ibaruramari ry\'ishuri no kuryemeza ko ryuzuye\",\"Gufatanya n\'abanzi no gukora amasezerano\",\"Kwemeza ko ishuri ryubahiriza amategeko y\'ibaruramari\"]','[\"Master\'s Degree mu Accounting - University of Rwanda (2015)\",\"Bachelor\'s Degree mu Finance - Kigali Independent University (2011)\",\"CPA Certification - Institute of Certified Public Accountants of Rwanda (2017)\",\"Training mu Financial Management - World Bank (2018)\",\"Diploma mu Auditing - African Virtual University (2019)\"]',4,1,'2026-01-23 08:26:01','2026-01-23 08:26:01'),(18,'Habimana Joseph','Umuyobozi w\'Abanyeshuri','Imyifatire y\'Abanyeshuri','Umuyobozi w\'abanyeshuri ushinzwe gukurikirana imyifatire y\'abanyeshuri, gukemura ibibazo byabo, no kubafasha mu buzima bwabo bwa buri munsi. Afite uburambe bw\'imyaka 8 mu buyobozi bw\'abanyeshuri n\'imyifatire. Yabaye umuyobozi w\'abanyeshuri kuva 2021, aho yagaragaje ubushobozi bukomeye mu gukurikirana abanyeshuri, gukemura ibibazo byabo, no kubafasha mu buzima bwabo.','/api/placeholder/400/400','studentaffairs@garden-tvet.rw','+250 788 567 890','Office Block B, Room 202','[\"Gukurikirana imyifatire y\'abanyeshuri no kwemeza ko myiza\",\"Gukemura ibibazo by\'abanyeshuri no kubafasha\",\"Gufasha abanyeshuri mu buzima bwabo bwa buri munsi\",\"Gukora ibikorwa by\'abanyeshuri nk\'imikino n\'ibirori\",\"Gutanga ubujyanama ku banyeshuri bakeneye ubufasha\",\"Gukurikirana indwara z\'abanyeshuri no kubafasha\",\"Gufatanya n\'ababyeyi mu gukemura ibibazo by\'abana\",\"Kwemeza ko abanyeshuri bafite umutekano mu ishuri\"]','[\"Master\'s Degree mu Student Affairs - University of Rwanda (2018)\",\"Bachelor\'s Degree mu Psychology - Kigali Independent University (2014)\",\"Certificate mu Counseling - Rwanda Counseling Association (2019)\",\"Training mu Conflict Resolution - Search for Common Ground (2020)\",\"Diploma mu Youth Development - African Virtual University (2021)\"]',5,1,'2026-01-23 08:26:01','2026-01-23 08:26:01'),(19,'Uwimana Jean Paul','Umujyanama w\'Ikigo','Ubujyanama','Umujyanama w\'ikigo ushinzwe gutanga inama ku buyobozi bw\'ishuri, gufasha mu gufata ibyemezo by\'ingenzi, no gukurikirana imikorere y\'ishuri. Afite uburambe bw\'imyaka 20 mu buyobozi bw\'amashuri n\'ubujyanama. Yabaye umujyanama w\'ikigo kuva 2017, aho yagaragaje ubushobozi bukomeye mu gutanga inama nziza, gufasha ubuyobozi gufata ibyemezo byiza, no gukurikirana imikorere y\'ishuri. Yashyizeho sisitemu nyinshi zo guteza imbere ishuri, gufasha abakozi, no gukemura ibibazo. Afite ubushobozi bwo gusesengura ibibazo, gutanga ibisubizo, no gufasha ishuri kugera ku ntego zacyo.','/api/placeholder/400/400','advisor@garden-tvet.rw','+250 788 678 901','Office Block A, Room 104','[\"Gutanga inama ku buyobozi bw\'ishuri no gufasha mu gufata ibyemezo\",\"Gukurikirana imikorere y\'ishuri no gutanga raporo\",\"Gufasha ubuyobozi gukemura ibibazo by\'ishuri\",\"Gusesengura politiki z\'ishuri no gutanga ibisubizo\",\"Gufatanya n\'abafatanyabikorwa bo hanze\",\"Gukora ubushakashatsi ku iterambere ry\'ishuri\",\"Gutanga amahugurwa ku buyobozi bw\'ishuri\",\"Gufasha mu gushyira mu bikorwa politiki nshya\"]','[\"PhD mu Educational Leadership - University of Rwanda (2012)\",\"Master\'s Degree mu School Administration - Kigali Independent University (2008)\",\"Bachelor\'s Degree mu Education Management - Kigali Institute of Education (2004)\",\"Certificate mu Strategic Planning - VVOB Rwanda (2015)\",\"Training mu Quality Assurance - British Council (2017)\"]',6,1,'2026-01-23 08:29:48','2026-01-23 08:29:48'),(21,'MASEZERANO Isaac','Umuyobozi w\'Amasomo (DOS)','Academic Affairs','MASEZERANO Isaac ni Umuyobozi w\'Amasomo (Director of Studies - DOS) muri Garden TVET School. Afite uburambe bukomeye mu gucunga amasomo n\'iterambere ry\'abanyeshuri mu by\'ubumenyi.\n\nINSHINGANO ZE: Gucunga amasomo yose, Gukora gahunda y\'amasomo, Gukurikirana abarimu, Gukurikirana iterambere ry\'abanyeshuri, Gutegura ibizamini, Gukora raporo z\'amasomo.\n\nUBUMENYI: Master\'s Degree in Education Management, Bachelor\'s Degree in Education, 18 years experience.','/uploads/leadership/masezerano-isaac.jpeg','masezerano.isaac@garden-tvet.rw','+250 788 567 890','DOS Office, Administration Block','[\"Gucunga amasomo\",\"Gukora gahunda\",\"Gukurikirana abarimu\",\"Gutegura ibizamini\"]','[\"Masters in Education\",\"Bachelors in Education\",\"18 years experience\"]',3,1,'2026-01-23 11:32:33','2026-01-23 11:32:33');
/*!40000 ALTER TABLE `school_leadership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_services`
--

DROP TABLE IF EXISTS `school_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `school_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `name_rw` varchar(255) NOT NULL,
  `category` enum('academic','health','transport','library','counseling','cafeteria','hostel','sports','technology','other') NOT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `full_details` longtext DEFAULT NULL,
  `full_details_rw` longtext DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `availability` enum('available','limited','unavailable') DEFAULT 'available',
  `contact_person` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`schedule`)),
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `benefits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`benefits`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_services`
--

LOCK TABLES `school_services` WRITE;
/*!40000 ALTER TABLE `school_services` DISABLE KEYS */;
INSERT INTO `school_services` VALUES (1,'Library Services','Serivisi z\'Isomero','library','Access to extensive collection of books, digital resources, and study spaces','Kubona ibitabo byinshi, ibikoresho bya digitale n\'ahantu ho kwiga',NULL,'SERIVISI Z\'ISOMERO - ISOMERO RIKOMEYE RY\'ISHURI\n\nIsomero ryacu rifite ibitabo byinshi, ibikoresho bya digitale, n\'ahantu heza ho kwiga. Abanyeshuri bashobora kubona ibitabo by\'amasomo, ibitabo by\'ubumenyi, n\'ibindi bikoresho byinshi.\n\nIBIRANGA ISOMERO:\n• Ibitabo byinshi - Ibitabo 5000+ by\'amasomo n\'ubumenyi\n• Ibikoresho bya Digitale - Mudasobwa 50+ n\'internet yihuse\n• Ahantu ho Kwiga - Ameza 100+ n\'intebe zinoze\n• Abakozi Babifitiye Ubumenyi - Abakozi 5 bafasha abanyeshuri\n• Igihe Kinini - Ifungura kuva saa 2 kugeza saa 10\n• Serivisi za Online - Gusaba ibitabo online no kubona inyandiko\n\nIBYICIRO BY\'IBITABO:\n1. Ibitabo by\'Amasomo - Ibitabo byose by\'amasomo y\'ishuri\n2. Ibitabo by\'Ubumenyi - Ibitabo by\'ubumenyi mu byiciro byose\n3. Ibitabo by\'Imyuga - Ibitabo by\'imyuga n\'ikoranabuhanga\n4. Magazines na Journals - Ibinyamakuru n\'ibitabo by\'ubushakashatsi\n5. Digital Resources - Inyandiko za PDF, amavideo n\'ibindi\n\nSERIVISI ZITANGWA:\n• Guhagarika Ibitabo - Abanyeshuri bashobora guhagarika ibitabo iminsi 14\n• Gusoma mu Isomero - Ahantu heza ho gusoma no kwiga\n• Ubufasha bwo Gushakisha - Abakozi bafasha gushakisha ibitabo\n• Amahugurwa - Amahugurwa yo gukoresha isomero neza\n• Printing & Scanning - Serivisi zo gucapa no gusikana\n• Internet Access - Internet yihuse ku banyeshuri bose\n\nAMATEGEKO Y\'ISOMERO:\n1. Kwinjira mu isomero - Abanyeshuri bagomba kugira ID card\n2. Guhagarika ibitabo - Ibitabo bishobora guhagarikwa iminsi 14\n3. Gusubiza ibitabo - Ibitabo bigomba gusubizwa ku gihe\n4. Gucapa - Gucapa bihenze 50 RWF ku rupapuro\n5. Gusoma - Gusoma mu isomero ni ubuntu\n\nINYUNGU Z\'ABANYESHURI:\n✓ Kubona ibitabo byinshi by\'ubuntu\n✓ Kwiga mu buryo bworoshye\n✓ Gukoresha mudasobwa n\'internet\n✓ Kubona ubufasha bw\'abakozi\n✓ Kwiga mu buryo bwigenga\n✓ Gutegura ibizamini neza','BookOpen',NULL,0.00,'Umwaka wose','available','Mukamana Grace','library@garden-tvet.rw','+250 788 111 222','Library Building, Ground Floor','{\"monday\":\"08:00-18:00\",\"tuesday\":\"08:00-18:00\",\"wednesday\":\"08:00-18:00\",\"thursday\":\"08:00-18:00\",\"friday\":\"08:00-18:00\",\"saturday\":\"09:00-13:00\",\"sunday\":\"Closed\"}','[\"5000+ ibitabo\",\"50+ mudasobwa\",\"Internet yihuse\",\"Ahantu ho kwiga\",\"Printing & Scanning\",\"Digital Resources\"]','[\"ID Card y\'ishuri\",\"Kwiyandikisha mu isomero\",\"Kubahiriza amategeko\"]','[\"Kubona ibitabo by\'ubuntu\",\"Kwiga mu buryo bworoshye\",\"Gukoresha mudasobwa\",\"Kubona ubufasha\"]',1,NULL,'2026-01-23 08:38:41','2026-01-23 08:38:41'),(2,'Health Services','Serivisi z\'Ubuzima','health','Comprehensive healthcare services for students','Serivisi z\'ubuzima zuzuye ku banyeshuri',NULL,'SERIVISI Z\'UBUZIMA - UBUZIMA BW\'ABANYESHURI\n\nIshuri rifite serivisi z\'ubuzima zuzuye zifasha abanyeshuri kubona ubufasha bw\'ubuzima. Dufite abaganga, abaforomo n\'ibikoresho by\'ubuzima.\n\nIBIRANGA SERIVISI Z\'UBUZIMA:\n• Kliniki y\'Ishuri - Kliniki ifite ibikoresho byose\n• Abaganga Babifitiye Ubumenyi - Abaganga 3 n\'abaforomo 5\n• Imiti Yose - Imiti y\'indwara zose\n• Serivisi za Byihutirwa - Serivisi 24/7 ku bibazo by\'ubuzima\n• Ubujyanama bw\'Ubuzima - Ubujyanama ku buzima bw\'abanyeshuri\n• Gukurikirana Ubuzima - Gukurikirana ubuzima bwa buri mwana\n\nSERIVISI ZITANGWA:\n1. Kuvura Indwara - Kuvura indwara zose z\'abanyeshuri\n2. Gukurikirana Ubuzima - Gukurikirana ubuzima bwa buri mwana\n3. Vaccination - Inkingo zose zikenewe\n4. First Aid - Ubufasha bwa mbere ku bibazo by\'ubuzima\n5. Mental Health - Ubujyanama ku buzima bwo mu mutwe\n6. Dental Care - Kuvura amenyo\n\nIGIHE CY\'AKAZI:\n• Ku cyumweru - Saa 2 kugeza saa 10\n• Ku wa gatandatu - Saa 3 kugeza saa 7\n• Emergency - 24/7\n\nAMATEGEKO:\n1. Abanyeshuri bagomba kugira insurance\n2. Kuja kwa muganga bifite ID card\n3. Gukurikiza inama z\'abaganga\n4. Kunywa imiti nk\'uko byateganyijwe\n\nINYUNGU:\n✓ Kubona ubufasha bw\'ubuzima vuba\n✓ Kuvurwa indwara zose\n✓ Gukurikirana ubuzima\n✓ Kubona ubujyanama\n✓ Serivisi z\'ubuntu','Heart',NULL,0.00,'Umwaka wose','available','Dr. Uwera Christine','health@garden-tvet.rw','+250 788 222 333','Health Center, Block B','{\"monday\":\"08:00-18:00\",\"tuesday\":\"08:00-18:00\",\"wednesday\":\"08:00-18:00\",\"thursday\":\"08:00-18:00\",\"friday\":\"08:00-18:00\",\"saturday\":\"09:00-13:00\",\"sunday\":\"Emergency Only\"}','[\"Kliniki ikomeye\",\"Abaganga babifitiye ubumenyi\",\"Imiti yose\",\"Serivisi 24/7\",\"Mental health support\",\"Dental care\"]','[\"ID Card\",\"Insurance card\",\"Parent consent (for minors)\"]','[\"Ubufasha bw\'ubuzima vuba\",\"Kuvurwa indwara\",\"Gukurikirana ubuzima\",\"Serivisi z\'ubuntu\"]',1,NULL,'2026-01-23 08:38:41','2026-01-23 08:38:41'),(3,'Library Services','Serivisi z\'Isomero','library','Access to extensive collection of books, digital resources, and study spaces','Kubona ibitabo byinshi, ibikoresho bya digitale n\'ahantu ho kwiga',NULL,'SERIVISI Z\'ISOMERO - ISOMERO RIKOMEYE RY\'ISHURI\n\nIsomero ryacu rifite ibitabo byinshi, ibikoresho bya digitale, n\'ahantu heza ho kwiga. Abanyeshuri bashobora kubona ibitabo by\'amasomo, ibitabo by\'ubumenyi, n\'ibindi bikoresho byinshi.\n\nIBIRANGA ISOMERO:\n• Ibitabo byinshi - Ibitabo 5000+ by\'amasomo n\'ubumenyi\n• Ibikoresho bya Digitale - Mudasobwa 50+ n\'internet yihuse\n• Ahantu ho Kwiga - Ameza 100+ n\'intebe zinoze\n• Abakozi Babifitiye Ubumenyi - Abakozi 5 bafasha abanyeshuri\n• Igihe Kinini - Ifungura kuva saa 2 kugeza saa 10\n• Serivisi za Online - Gusaba ibitabo online no kubona inyandiko\n\nIBYICIRO BY\'IBITABO:\n1. Ibitabo by\'Amasomo - Ibitabo byose by\'amasomo y\'ishuri\n2. Ibitabo by\'Ubumenyi - Ibitabo by\'ubumenyi mu byiciro byose\n3. Ibitabo by\'Imyuga - Ibitabo by\'imyuga n\'ikoranabuhanga\n4. Magazines na Journals - Ibinyamakuru n\'ibitabo by\'ubushakashatsi\n5. Digital Resources - Inyandiko za PDF, amavideo n\'ibindi\n\nSERIVISI ZITANGWA:\n• Guhagarika Ibitabo - Abanyeshuri bashobora guhagarika ibitabo iminsi 14\n• Gusoma mu Isomero - Ahantu heza ho gusoma no kwiga\n• Ubufasha bwo Gushakisha - Abakozi bafasha gushakisha ibitabo\n• Amahugurwa - Amahugurwa yo gukoresha isomero neza\n• Printing & Scanning - Serivisi zo gucapa no gusikana\n• Internet Access - Internet yihuse ku banyeshuri bose\n\nAMATEGEKO Y\'ISOMERO:\n1. Kwinjira mu isomero - Abanyeshuri bagomba kugira ID card\n2. Guhagarika ibitabo - Ibitabo bishobora guhagarikwa iminsi 14\n3. Gusubiza ibitabo - Ibitabo bigomba gusubizwa ku gihe\n4. Gucapa - Gucapa bihenze 50 RWF ku rupapuro\n5. Gusoma - Gusoma mu isomero ni ubuntu\n\nINYUNGU Z\'ABANYESHURI:\n✓ Kubona ibitabo byinshi by\'ubuntu\n✓ Kwiga mu buryo bworoshye\n✓ Gukoresha mudasobwa n\'internet\n✓ Kubona ubufasha bw\'abakozi\n✓ Kwiga mu buryo bwigenga\n✓ Gutegura ibizamini neza','BookOpen',NULL,0.00,'Umwaka wose','available','Mukamana Grace','library@garden-tvet.rw','+250 788 111 222','Library Building, Ground Floor','{\"monday\":\"08:00-18:00\",\"tuesday\":\"08:00-18:00\",\"wednesday\":\"08:00-18:00\",\"thursday\":\"08:00-18:00\",\"friday\":\"08:00-18:00\",\"saturday\":\"09:00-13:00\",\"sunday\":\"Closed\"}','[\"5000+ ibitabo\",\"50+ mudasobwa\",\"Internet yihuse\",\"Ahantu ho kwiga\",\"Printing & Scanning\",\"Digital Resources\"]','[\"ID Card y\'ishuri\",\"Kwiyandikisha mu isomero\",\"Kubahiriza amategeko\"]','[\"Kubona ibitabo by\'ubuntu\",\"Kwiga mu buryo bworoshye\",\"Gukoresha mudasobwa\",\"Kubona ubufasha\"]',1,NULL,'2026-01-23 12:36:59','2026-01-23 12:36:59'),(4,'Health Services','Serivisi z\'Ubuzima','health','Comprehensive healthcare services for students','Serivisi z\'ubuzima zuzuye ku banyeshuri',NULL,'SERIVISI Z\'UBUZIMA - UBUZIMA BW\'ABANYESHURI\n\nIshuri rifite serivisi z\'ubuzima zuzuye zifasha abanyeshuri kubona ubufasha bw\'ubuzima. Dufite abaganga, abaforomo n\'ibikoresho by\'ubuzima.\n\nIBIRANGA SERIVISI Z\'UBUZIMA:\n• Kliniki y\'Ishuri - Kliniki ifite ibikoresho byose\n• Abaganga Babifitiye Ubumenyi - Abaganga 3 n\'abaforomo 5\n• Imiti Yose - Imiti y\'indwara zose\n• Serivisi za Byihutirwa - Serivisi 24/7 ku bibazo by\'ubuzima\n• Ubujyanama bw\'Ubuzima - Ubujyanama ku buzima bw\'abanyeshuri\n• Gukurikirana Ubuzima - Gukurikirana ubuzima bwa buri mwana\n\nSERIVISI ZITANGWA:\n1. Kuvura Indwara - Kuvura indwara zose z\'abanyeshuri\n2. Gukurikirana Ubuzima - Gukurikirana ubuzima bwa buri mwana\n3. Vaccination - Inkingo zose zikenewe\n4. First Aid - Ubufasha bwa mbere ku bibazo by\'ubuzima\n5. Mental Health - Ubujyanama ku buzima bwo mu mutwe\n6. Dental Care - Kuvura amenyo\n\nIGIHE CY\'AKAZI:\n• Ku cyumweru - Saa 2 kugeza saa 10\n• Ku wa gatandatu - Saa 3 kugeza saa 7\n• Emergency - 24/7\n\nAMATEGEKO:\n1. Abanyeshuri bagomba kugira insurance\n2. Kuja kwa muganga bifite ID card\n3. Gukurikiza inama z\'abaganga\n4. Kunywa imiti nk\'uko byateganyijwe\n\nINYUNGU:\n✓ Kubona ubufasha bw\'ubuzima vuba\n✓ Kuvurwa indwara zose\n✓ Gukurikirana ubuzima\n✓ Kubona ubujyanama\n✓ Serivisi z\'ubuntu','Heart',NULL,0.00,'Umwaka wose','available','Dr. Uwera Christine','health@garden-tvet.rw','+250 788 222 333','Health Center, Block B','{\"monday\":\"08:00-18:00\",\"tuesday\":\"08:00-18:00\",\"wednesday\":\"08:00-18:00\",\"thursday\":\"08:00-18:00\",\"friday\":\"08:00-18:00\",\"saturday\":\"09:00-13:00\",\"sunday\":\"Emergency Only\"}','[\"Kliniki ikomeye\",\"Abaganga babifitiye ubumenyi\",\"Imiti yose\",\"Serivisi 24/7\",\"Mental health support\",\"Dental care\"]','[\"ID Card\",\"Insurance card\",\"Parent consent (for minors)\"]','[\"Ubufasha bw\'ubuzima vuba\",\"Kuvurwa indwara\",\"Gukurikirana ubuzima\",\"Serivisi z\'ubuntu\"]',1,NULL,'2026-01-23 12:36:59','2026-01-23 12:36:59'),(5,'Counseling Services','Serivisi z\'Ubujyanama','counseling','Professional counseling and guidance for students','Ubujyanama n\'ubuyobozi bw\'abanyeshuri',NULL,'SERIVISI Z\'UBUJYANAMA - UBUFASHA BW\'ABANYESHURI\n\nDufite abajyanama babifitiye ubumenyi bafasha abanyeshuri mu bibazo byabo. Ubujyanama bufasha abanyeshuri gukemura ibibazo by\'amasomo, imibereho n\'indi mibanire.\n\nIBIRANGA SERIVISI Z\'UBUJYANAMA:\n• Abajyanama Babifitiye Ubumenyi - Abajyanama 4 bafite ubushobozi\n• Ubujyanama bw\'Amasomo - Gufasha abanyeshuri mu masomo\n• Ubujyanama bw\'Imibereho - Gufasha mu bibazo by\'imibereho\n• Ubujyanama bw\'Umwuga - Gufasha guhitamo umwuga\n• Serivisi z\'Ibanga - Ibanga ryubahirizwa cyane\n• Igihe Kinini - Ifungura buri gihe\n\nSERIVISI ZITANGWA:\n1. Ubujyanama ku Giti - Guganira n\'umujyanama wenyine\n2. Ubujyanama mu Matsinda - Guganira mu matsinda\n3. Ubujyanama bw\'Ababyeyi - Gufasha ababyeyi\n4. Gukurikirana - Gukurikirana abanyeshuri\n5. Crisis Intervention - Ubufasha mu bihe bigoye\n6. Career Guidance - Ubuyobozi bw\'umwuga\n\nINYUNGU:\n✓ Gukemura ibibazo vuba\n✓ Kubona ubufasha bw\'abahanga\n✓ Kwiga neza\n✓ Kugira ubuzima bwiza\n✓ Guhitamo umwuga mwiza','HelpCircle',NULL,0.00,'Umwaka wose','available','Niyonkuru Patrick','counseling@garden-tvet.rw','+250 788 333 444','Counseling Office, Block A','{\"monday\":\"08:00-17:00\",\"tuesday\":\"08:00-17:00\",\"wednesday\":\"08:00-17:00\",\"thursday\":\"08:00-17:00\",\"friday\":\"08:00-17:00\",\"saturday\":\"09:00-12:00\",\"sunday\":\"Closed\"}','[\"Abajyanama babifitiye ubumenyi\",\"Ubujyanama bw\'amasomo\",\"Ubujyanama bw\'imibereho\",\"Career guidance\",\"Serivisi z\'ibanga\",\"Crisis intervention\"]','[\"ID Card\",\"Gusaba ubujyanama\",\"Kubahiriza ibanga\"]','[\"Gukemura ibibazo\",\"Kubona ubufasha\",\"Kwiga neza\",\"Kugira ubuzima bwiza\"]',1,NULL,'2026-01-23 12:44:20','2026-01-23 12:44:20'),(6,'Transport Services','Serivisi z\'Ubwikorezi','transport','Safe and reliable transport for students','Ubwikorezi bwizewe bw\'abanyeshuri',NULL,'SERIVISI Z\'UBWIKOREZI - UBWIKOREZI BW\'ABANYESHURI\n\nDufite serivisi z\'ubwikorezi zizewe zifasha abanyeshuri kugera ku ishuri no gusubira mu rugo. Dufite amabus akomeye kandi afite umutekano.\n\nIBIRANGA SERIVISI Z\'UBWIKOREZI:\n• Amabus Akomeye - Amabus 10 akomeye\n• Abashoferi Babifitiye Ubumenyi - Abashoferi 15 bafite ubushobozi\n• Umutekano - Umutekano w\'abanyeshuri ni ingenzi\n• Igihe Cyizewe - Amabus agera ku gihe\n• Inzira Nyinshi - Inzira 20 zitandukanye\n• Igiciro Gihendutse - Igiciro gihendutse ku banyeshuri\n\nSERIVISI ZITANGWA:\n1. Ubwikorezi bwa Buri Munsi - Kugera ku ishuri no gusubira\n2. Ubwikorezi bw\'Ikiruhuko - Ubwikorezi ku wa gatandatu\n3. Ubwikorezi bw\'Ibihe Byihariye - Ubwikorezi mu bihe byihariye\n4. Gukurikirana - GPS tracking ku mabus yose\n\nINZIRA:\n• Kigali City - 5 inzira\n• Gasabo - 4 inzira\n• Kicukiro - 4 inzira\n• Nyarugenge - 3 inzira\n• Suburbs - 4 inzira\n\nINYUNGU:\n✓ Umutekano w\'abanyeshuri\n✓ Kugera ku gihe\n✓ Igiciro gihendutse\n✓ Ubwikorezi bwizewe','Bus',NULL,15000.00,'Ukwezi','available','Habimana Emmanuel','transport@garden-tvet.rw','+250 788 444 555','Transport Office, Main Gate','{\"monday\":\"06:00-19:00\",\"tuesday\":\"06:00-19:00\",\"wednesday\":\"06:00-19:00\",\"thursday\":\"06:00-19:00\",\"friday\":\"06:00-19:00\",\"saturday\":\"07:00-14:00\",\"sunday\":\"Closed\"}','[\"Amabus akomeye\",\"Abashoferi babifitiye ubumenyi\",\"GPS tracking\",\"Umutekano\",\"Inzira nyinshi\",\"Igiciro gihendutse\"]','[\"ID Card\",\"Kwishyura\",\"Gukurikiza amategeko\"]','[\"Umutekano\",\"Kugera ku gihe\",\"Igiciro gihendutse\",\"Ubwikorezi bwizewe\"]',1,NULL,'2026-01-23 12:44:20','2026-01-23 12:44:20'),(7,'Cafeteria Services','Serivisi z\'Ibiryo','cafeteria','Healthy and nutritious meals for students','Ibiryo byiza kandi bifite intungamubiri',NULL,'SERIVISI Z\'IBIRYO - IBIRYO BY\'ABANYESHURI\n\nDufite cafeteria ikomeye itanga ibiryo byiza kandi bifite intungamubiri. Abanyeshuri bashobora kubona ifunguro rya mu gitondo, rya saa sita n\'iry\'umugoroba.\n\nIBIRANGA CAFETERIA:\n• Ibiryo Byiza - Ibiryo byiza kandi bifite intungamubiri\n• Abateka Babifitiye Ubumenyi - Abateka 8 bafite ubushobozi\n• Isuku - Isuku y\'ibiryo ni ingenzi\n• Igiciro Gihendutse - Igiciro gihendutse ku banyeshuri\n• Menu Itandukanye - Menu itandukanye buri munsi\n• Ahantu Hanini - Ahantu ho kurya hanini\n\nIFUNGURO RITANGWA:\n1. Ifunguro rya Mu Gitondo - 7:00-9:00\n2. Ifunguro rya Saa Sita - 12:00-14:00\n3. Ifunguro ry\'Umugoroba - 18:00-20:00\n4. Snacks - Snacks zitandukanye\n\nMENU:\n• Ku wa mbere - Umuceri n\'isosi\n• Ku wa kabiri - Ibirayi n\'inyama\n• Ku wa gatatu - Ibishyimbo n\'umugati\n• Ku wa kane - Pasta n\'isosi\n• Ku wa gatanu - Pilau n\'inyama\n\nINYUNGU:\n✓ Ibiryo byiza\n✓ Intungamubiri\n✓ Igiciro gihendutse\n✓ Menu itandukanye','Utensils',NULL,25000.00,'Ukwezi','available','Mukamana Alice','cafeteria@garden-tvet.rw','+250 788 555 666','Cafeteria Building','{\"monday\":\"07:00-20:00\",\"tuesday\":\"07:00-20:00\",\"wednesday\":\"07:00-20:00\",\"thursday\":\"07:00-20:00\",\"friday\":\"07:00-20:00\",\"saturday\":\"08:00-15:00\",\"sunday\":\"Closed\"}','[\"Ibiryo byiza\",\"Abateka babifitiye ubumenyi\",\"Isuku\",\"Menu itandukanye\",\"Igiciro gihendutse\",\"Ahantu hanini\"]','[\"ID Card\",\"Kwishyura\",\"Kubahiriza isuku\"]','[\"Ibiryo byiza\",\"Intungamubiri\",\"Igiciro gihendutse\",\"Menu itandukanye\"]',1,NULL,'2026-01-23 12:44:20','2026-01-23 12:44:20');
/*!40000 ALTER TABLE `school_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_stats`
--

DROP TABLE IF EXISTS `school_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `school_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stat_key` varchar(50) NOT NULL,
  `value` varchar(20) NOT NULL,
  `label` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `stat_key` (`stat_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_stats`
--

LOCK TABLES `school_stats` WRITE;
/*!40000 ALTER TABLE `school_stats` DISABLE KEYS */;
INSERT INTO `school_stats` VALUES (1,'students','1,248','Abanyeshuri','Users','from-blue-500 to-indigo-500',1,1,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(2,'teachers','84','Abarimu','GraduationCap','from-green-500 to-teal-500',1,2,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(3,'employment','95%','Gushirwa mu kazi','Briefcase','from-yellow-500 to-orange-500',1,3,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(4,'awards','25+','Ibihembo','Trophy','from-orange-500 to-red-500',1,4,'2026-01-27 07:48:18','2026-01-27 07:48:18');
/*!40000 ALTER TABLE `school_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_analytics`
--

DROP TABLE IF EXISTS `search_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `search_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `total_searches` int(11) DEFAULT 0,
  `unique_queries` int(11) DEFAULT 0,
  `avg_results` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_analytics`
--

LOCK TABLES `search_analytics` WRITE;
/*!40000 ALTER TABLE `search_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `search_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_history`
--

DROP TABLE IF EXISTS `search_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `search_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `query` varchar(255) DEFAULT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `results_count` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_history`
--

LOCK TABLES `search_history` WRITE;
/*!40000 ALTER TABLE `search_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `search_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_logs`
--

DROP TABLE IF EXISTS `search_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `search_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `search_query` varchar(500) NOT NULL,
  `search_type` enum('global','students','teachers','courses','news','gallery') DEFAULT 'global',
  `results_count` int(11) DEFAULT 0,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_query` (`search_query`(255)),
  KEY `idx_type` (`search_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_logs`
--

LOCK TABLES `search_logs` WRITE;
/*!40000 ALTER TABLE `search_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `search_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sectors`
--

DROP TABLE IF EXISTS `sectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sectors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `district_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `name_en` varchar(100) DEFAULT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sectors`
--

LOCK TABLES `sectors` WRITE;
/*!40000 ALTER TABLE `sectors` DISABLE KEYS */;
INSERT INTO `sectors` VALUES (1,1,'Kimironko','KMR','2026-02-10 05:00:28','Kimironko','Kimironko'),(2,1,'Remera','RMR','2026-02-10 05:00:28','Remera','Remera'),(3,1,'Kacyiru','KCY','2026-02-10 05:00:28','Kacyiru','Kacyiru');
/*!40000 ALTER TABLE `sectors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_logs`
--

DROP TABLE IF EXISTS `security_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `security_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(100) NOT NULL,
  `user` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_logs`
--

LOCK TABLES `security_logs` WRITE;
/*!40000 ALTER TABLE `security_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_items`
--

DROP TABLE IF EXISTS `service_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) DEFAULT NULL,
  `title_rw` varchar(200) DEFAULT NULL,
  `title_en` varchar(200) DEFAULT NULL,
  `title_fr` varchar(200) DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `description_fr` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_items_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_items`
--

LOCK TABLES `service_items` WRITE;
/*!40000 ALTER TABLE `service_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_email` varchar(255) DEFAULT NULL,
  `student_phone` varchar(20) DEFAULT NULL,
  `parent_name` varchar(255) DEFAULT NULL,
  `parent_phone` varchar(20) DEFAULT NULL,
  `request_type` enum('inquiry','booking','complaint','feedback') DEFAULT 'inquiry',
  `message` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','completed') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_service` (`service_id`),
  CONSTRAINT `service_requests_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `school_services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_requests`
--

LOCK TABLES `service_requests` WRITE;
/*!40000 ALTER TABLE `service_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title_rw` varchar(200) DEFAULT NULL,
  `title_en` varchar(200) DEFAULT NULL,
  `title_fr` varchar(200) DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `description_fr` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Amasomo','Academic Programs','Programmes Academiques','Amasomo yihariye mu buhanga','Specialized technical programs','Programmes techniques specialises','education',NULL,1,1,'2026-01-22 12:40:49'),(2,'Ubufasha','Student Support','Soutien aux Etudiants','Ubufasha bwabanyeshuri','Comprehensive student support','Soutien complet aux etudiants','support',NULL,2,1,'2026-01-22 12:40:49'),(3,'Ibikorwa','Facilities','Installations','Ibikoresho bigezweho','Modern facilities','Installations modernes','facilities',NULL,3,1,'2026-01-22 12:40:49');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_participants`
--

DROP TABLE IF EXISTS `session_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `session_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('host','co_host','presenter','participant') DEFAULT 'participant',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `left_at` timestamp NULL DEFAULT NULL,
  `participation_score` decimal(5,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participation` (`session_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `session_participants_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `live_study_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `session_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_participants`
--

LOCK TABLES `session_participants` WRITE;
/*!40000 ALTER TABLE `session_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `session_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `slides`
--

DROP TABLE IF EXISTS `slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `slides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slides`
--

LOCK TABLES `slides` WRITE;
/*!40000 ALTER TABLE `slides` DISABLE KEYS */;
INSERT INTO `slides` VALUES (1,'EMPOWERING FUTURE SKILLS','Building Tomorrow\'s Professionals Today','Join thousands of students who have transformed their careers through our comprehensive technical programs.','https://images.unsplash.com/photo-1758270704524-596810e891b5?w=1080','Get Started','/register',1,1,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(2,'SOFTWARE DEVELOPMENT','Master Coding & Technology','Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.','https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=1080','Learn More','/trades',1,2,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(3,'BUILDING CONSTRUCTION','Create Tomorrow\'s Infrastructure','Learn construction techniques, project management, and safety protocols with modern tools and sustainable building practices.','https://images.unsplash.com/photo-1672072830247-85ac23671e96?w=1080','Explore','/trades',1,3,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(4,'AUTOMOBILE TECHNOLOGY','Drive Your Future Forward','Comprehensive automotive training covering diagnostics, repair, and modern vehicle technologies including hybrid and electric systems.','https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1080','Discover','/trades',1,4,'2026-01-27 07:48:18','2026-01-27 07:48:18');
/*!40000 ALTER TABLE `slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_campaigns`
--

DROP TABLE IF EXISTS `sms_campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_campaigns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `target_audience` enum('all','class','grade','custom','smartphone','non-smartphone') NOT NULL,
  `target_filter` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`target_filter`)),
  `total_recipients` int(11) DEFAULT 0,
  `sent_count` int(11) DEFAULT 0,
  `failed_count` int(11) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_by_role` varchar(50) DEFAULT NULL,
  `status` enum('draft','scheduled','sending','completed','cancelled') DEFAULT 'draft',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_campaigns`
--

LOCK TABLES `sms_campaigns` WRITE;
/*!40000 ALTER TABLE `sms_campaigns` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_history`
--

DROP TABLE IF EXISTS `sms_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sms_id` varchar(50) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `status` enum('pending','sent','delivered','failed') DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sms_id` (`sms_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`),
  KEY `idx_sent_at` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_history`
--

LOCK TABLES `sms_history` WRITE;
/*!40000 ALTER TABLE `sms_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_logs`
--

DROP TABLE IF EXISTS `sms_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `status` enum('pending','sent','delivered','failed') DEFAULT 'pending',
  `provider` varchar(50) DEFAULT 'africastalking',
  `message_id` varchar(255) DEFAULT NULL,
  `cost` decimal(10,4) DEFAULT 0.0000,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `error` text DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivered_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_recipient` (`recipient`),
  KEY `idx_status` (`status`),
  KEY `idx_sent` (`sent_at`),
  KEY `idx_provider` (`provider`),
  CONSTRAINT `sms_logs_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_logs`
--

LOCK TABLES `sms_logs` WRITE;
/*!40000 ALTER TABLE `sms_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_messages`
--

DROP TABLE IF EXISTS `sms_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_role` varchar(50) DEFAULT NULL,
  `status` enum('pending','sent','failed','delivered') DEFAULT 'pending',
  `provider` varchar(50) DEFAULT 'africastalking',
  `delivery_method` enum('sms','app','dual') DEFAULT 'sms',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `response` text DEFAULT NULL,
  `error` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  `starred` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_recipient` (`recipient`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_messages`
--

LOCK TABLES `sms_messages` WRITE;
/*!40000 ALTER TABLE `sms_messages` DISABLE KEYS */;
INSERT INTO `sms_messages` VALUES (1,'+250780000000','Test',0,NULL,'pending','africastalking','sms',NULL,NULL,NULL,'2026-01-27 10:08:50','2026-01-27 10:08:50',NULL,0);
/*!40000 ALTER TABLE `sms_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_queue`
--

DROP TABLE IF EXISTS `sms_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `sender_id` int(11) NOT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','processing','sent','failed') DEFAULT 'pending',
  `attempts` int(11) DEFAULT 0,
  `max_attempts` int(11) DEFAULT 3,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled` (`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_queue`
--

LOCK TABLES `sms_queue` WRITE;
/*!40000 ALTER TABLE `sms_queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_role_permissions`
--

DROP TABLE IF EXISTS `sms_role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(50) NOT NULL,
  `can_send_single` tinyint(1) DEFAULT 1,
  `can_send_bulk` tinyint(1) DEFAULT 1,
  `can_send_class` tinyint(1) DEFAULT 1,
  `can_send_all` tinyint(1) DEFAULT 0,
  `can_view_history` tinyint(1) DEFAULT 1,
  `can_view_stats` tinyint(1) DEFAULT 1,
  `can_create_templates` tinyint(1) DEFAULT 0,
  `can_create_campaigns` tinyint(1) DEFAULT 0,
  `daily_limit` int(11) DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_role_permissions`
--

LOCK TABLES `sms_role_permissions` WRITE;
/*!40000 ALTER TABLE `sms_role_permissions` DISABLE KEYS */;
INSERT INTO `sms_role_permissions` VALUES (1,'admin',1,1,1,1,1,1,1,1,1000,'2026-01-26 04:51:24'),(2,'director',1,1,1,1,1,1,1,1,1000,'2026-01-26 04:51:24'),(3,'dos',1,1,1,1,1,1,1,1,500,'2026-01-26 04:51:24'),(4,'dod',1,1,1,1,1,1,1,1,500,'2026-01-26 04:51:24'),(5,'teacher',1,1,1,0,1,1,0,0,100,'2026-01-26 04:51:24'),(6,'class_teacher',1,1,1,0,1,1,0,0,200,'2026-01-26 04:51:24'),(7,'accountant',1,1,1,0,1,1,1,0,300,'2026-01-26 04:51:24'),(8,'secretary',1,1,1,0,1,1,0,0,200,'2026-01-26 04:51:24'),(9,'advisor',1,1,1,0,1,1,0,0,150,'2026-01-26 04:51:24'),(10,'patron',1,0,1,0,1,0,0,0,100,'2026-01-29 13:27:16'),(11,'matron',1,0,1,0,1,0,0,0,100,'2026-01-29 13:27:16');
/*!40000 ALTER TABLE `sms_role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_templates`
--

DROP TABLE IF EXISTS `sms_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `template_category` varchar(50) NOT NULL,
  `message_template` text NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `created_by` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `usage_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_templates`
--

LOCK TABLES `sms_templates` WRITE;
/*!40000 ALTER TABLE `sms_templates` DISABLE KEYS */;
INSERT INTO `sms_templates` VALUES (1,'Student Absence','academic','Dear Parent, your child {student_name} was absent on {date}. Contact school if unexpected.','[\"student_name\", \"date\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(2,'Fee Reminder','finance','School fees of {amount} RWF for {student_name} due by {due_date}. Thank you.','[\"student_name\", \"amount\", \"due_date\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(3,'Exam Results','academic','{student_name} scored {marks}% in {subject}. Position: {position}. Well done!','[\"student_name\", \"marks\", \"subject\", \"position\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(4,'Discipline Notice','discipline','Need to discuss {student_name} behavior. Contact Director of Discipline.','[\"student_name\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(5,'Emergency Alert','emergency','URGENT: {message}. Contact school immediately.','[\"message\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(6,'Meeting Invitation','general','Parents meeting on {date} at {time}. Venue: {location}.','[\"date\", \"time\", \"location\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(7,'Achievement','academic','Congratulations! {student_name} achieved {achievement}!','[\"student_name\", \"achievement\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(8,'Payment Received','finance','Payment of {amount} RWF received for {student_name}. Balance: {balance} RWF.','[\"student_name\", \"amount\", \"balance\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(9,'Class Announcement','general','Class {class_name}: {announcement}','[\"class_name\", \"announcement\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24'),(10,'Report Card Ready','academic','{student_name} report card ready. Collect from school office.','[\"student_name\"]',1,1,0,'2026-01-26 04:51:24','2026-01-26 04:51:24');
/*!40000 ALTER TABLE `sms_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sport_achievements`
--

DROP TABLE IF EXISTS `sport_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sport_achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `sport` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sport_achievements`
--

LOCK TABLES `sport_achievements` WRITE;
/*!40000 ALTER TABLE `sport_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `sport_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sport_coaches`
--

DROP TABLE IF EXISTS `sport_coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sport_coaches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `sport` varchar(50) DEFAULT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sport_coaches`
--

LOCK TABLES `sport_coaches` WRITE;
/*!40000 ALTER TABLE `sport_coaches` DISABLE KEYS */;
/*!40000 ALTER TABLE `sport_coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sport_players`
--

DROP TABLE IF EXISTS `sport_players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sport_players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `position` varchar(50) DEFAULT NULL,
  `jersey_number` int(11) DEFAULT NULL,
  `team` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sport_players`
--

LOCK TABLES `sport_players` WRITE;
/*!40000 ALTER TABLE `sport_players` DISABLE KEYS */;
/*!40000 ALTER TABLE `sport_players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sport_teams`
--

DROP TABLE IF EXISTS `sport_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sport_teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `sport_type` varchar(50) DEFAULT NULL,
  `coach` varchar(100) DEFAULT NULL,
  `players_count` int(11) DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sport_teams`
--

LOCK TABLES `sport_teams` WRITE;
/*!40000 ALTER TABLE `sport_teams` DISABLE KEYS */;
/*!40000 ALTER TABLE `sport_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports`
--

DROP TABLE IF EXISTS `sports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `coach` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  FULLTEXT KEY `ft_name` (`name`),
  FULLTEXT KEY `ft_description` (`description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports`
--

LOCK TABLES `sports` WRITE;
/*!40000 ALTER TABLE `sports` DISABLE KEYS */;
/*!40000 ALTER TABLE `sports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_achievements`
--

DROP TABLE IF EXISTS `sports_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `title_rw` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `achievement_date` date DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `competition_name` varchar(200) DEFAULT NULL,
  `competition_name_rw` varchar(200) DEFAULT NULL,
  `icon` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `sports_achievements_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `sports_teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_achievements`
--

LOCK TABLES `sports_achievements` WRITE;
/*!40000 ALTER TABLE `sports_achievements` DISABLE KEYS */;
INSERT INTO `sports_achievements` VALUES (1,1,'Inter-School Championship','Igikombe cy\'Amashuri',NULL,'Twatsindiye igikombe cy\'amashuri mu 2024','2024-06-15',1,'Kigali Inter-School Tournament','Amarushanwa y\'Amashuri ya Kigali','🏆','2026-01-24 07:49:55'),(2,1,'Best Team Award','Ikipe Yiza Cyane',NULL,'Twahawwe igihembo cy\'ikipe yiza cyane','2024-12-10',1,'TVET Schools Competition','Amarushanwa y\'Amashuri ya TVET','🥇','2026-01-24 07:49:55'),(3,2,'Regional Champions','Abatsindiye mu Karere',NULL,'Twatsindiye amarushanwa y\'akarere','2024-05-20',1,'Regional Volleyball Championship','Igikombe cy\'Akarere','🏆','2026-01-24 07:49:55'),(4,2,'Fair Play Award','Igihembo cy\'Imikino Myiza',NULL,'Twahawwe igihembo cy\'imikino myiza','2024-11-15',1,'National School Games','Imikino y\'Amashuri ku Rwego rw\'Igihugu','⭐','2026-01-24 07:49:55');
/*!40000 ALTER TABLE `sports_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_categories`
--

DROP TABLE IF EXISTS `sports_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_categories`
--

LOCK TABLES `sports_categories` WRITE;
/*!40000 ALTER TABLE `sports_categories` DISABLE KEYS */;
INSERT INTO `sports_categories` VALUES (1,'Football','School football team and competitions','Trophy',1,'2026-01-23 10:01:24'),(2,'Basketball','Basketball training and matches','Trophy',1,'2026-01-23 10:01:24'),(3,'Volleyball','Volleyball team activities','Trophy',1,'2026-01-23 10:01:24');
/*!40000 ALTER TABLE `sports_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_coaches`
--

DROP TABLE IF EXISTS `sports_coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_coaches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `role_rw` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `bio_rw` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `sports_coaches_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `sports_teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_coaches`
--

LOCK TABLES `sports_coaches` WRITE;
/*!40000 ALTER TABLE `sports_coaches` DISABLE KEYS */;
INSERT INTO `sports_coaches` VALUES (2,2,'Coach Marie Claire','Umutoza Marie Claire','Head Coach','Umutoza Mukuru','/uploads/sports/coach-volleyball.jpg','coach.volleyball@garden-tvet.rw','+250 788 333 444',8,NULL,'Umutoza Marie Claire afite uburambe bw\'imyaka 8 mu gutoza umupira w\'amaboko. Yatoje amakipe menshi kandi yaronse ibihembo byinshi.',1,'2026-01-24 07:49:55'),(7,1,'Jotham',NULL,'Head Coach',NULL,'/uploads/sports/coach of football.jpg','jotham@garden.rw','+250788000000',5,'Inter-School Championship Winner 2023, National Youth Coach License, 2+ years experience',NULL,1,'2026-02-10 06:05:09'),(8,1,'Patrick',NULL,'Assistant Coach',NULL,'/uploads/sports/coach helper.jpg','patrick@garden.rw','+250788000001',3,'Assistant Coach & Team Coordinator, 2+ years experience',NULL,1,'2026-02-10 06:05:09');
/*!40000 ALTER TABLE `sports_coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_events`
--

DROP TABLE IF EXISTS `sports_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `event_date` date NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_events`
--

LOCK TABLES `sports_events` WRITE;
/*!40000 ALTER TABLE `sports_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `sports_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_gallery`
--

DROP TABLE IF EXISTS `sports_gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `sport_type` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_gallery`
--

LOCK TABLES `sports_gallery` WRITE;
/*!40000 ALTER TABLE `sports_gallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `sports_gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_matches`
--

DROP TABLE IF EXISTS `sports_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `opponent` varchar(100) NOT NULL,
  `match_date` date NOT NULL,
  `match_time` time DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `location_rw` varchar(200) DEFAULT NULL,
  `our_score` int(11) DEFAULT NULL,
  `opponent_score` int(11) DEFAULT NULL,
  `result` enum('win','loss','draw','pending') DEFAULT NULL,
  `match_type` varchar(50) DEFAULT NULL,
  `season` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `sports_matches_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `sports_teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_matches`
--

LOCK TABLES `sports_matches` WRITE;
/*!40000 ALTER TABLE `sports_matches` DISABLE KEYS */;
INSERT INTO `sports_matches` VALUES (1,1,'IPRC Kigali','2024-12-15','14:00:00','Garden TVET Stadium','Stade ya Garden TVET',3,1,'win','League','2024','2026-01-24 07:49:56'),(2,1,'AUCA','2024-12-08','15:00:00','AUCA Stadium','Stade ya AUCA',2,2,'draw','League','2024','2026-01-24 07:49:56'),(3,1,'UR Huye','2024-12-01','14:30:00','Garden TVET Stadium','Stade ya Garden TVET',4,0,'win','League','2024','2026-01-24 07:49:56'),(4,2,'IPRC Musanze','2024-12-10','16:00:00','Garden TVET Court','Terrain ya Garden TVET',3,1,'win','League','2024','2026-01-24 07:49:56'),(5,2,'UR Nyagatare','2024-12-03','15:30:00','UR Nyagatare Court','Terrain ya UR Nyagatare',2,3,'loss','League','2024','2026-01-24 07:49:56');
/*!40000 ALTER TABLE `sports_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_members`
--

DROP TABLE IF EXISTS `sports_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `join_date` date NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_membership` (`team_id`,`student_id`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `sports_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `sports_teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sports_members_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_members`
--

LOCK TABLES `sports_members` WRITE;
/*!40000 ALTER TABLE `sports_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `sports_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_players`
--

DROP TABLE IF EXISTS `sports_players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  `jersey_number` int(11) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `position_rw` varchar(50) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `is_captain` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `joined_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `sports_players_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `sports_teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_players`
--

LOCK TABLES `sports_players` WRITE;
/*!40000 ALTER TABLE `sports_players` DISABLE KEYS */;
INSERT INTO `sports_players` VALUES (6,2,'Uwase Grace','Uwase Grace',1,'Setter','Setter','/uploads/sports/player-v1.jpg','2005-02-10',170,60,'Level 4A',1,1,'2023-01-10','2026-01-24 07:49:55'),(7,2,'Mukamana Alice','Mukamana Alice',5,'Outside Hitter','Outside Hitter','/uploads/sports/player-v2.jpg','2004-08-15',172,62,'Level 4A',0,1,'2023-01-10','2026-01-24 07:49:55'),(8,2,'Ingabire Sarah','Ingabire Sarah',7,'Middle Blocker','Middle Blocker','/uploads/sports/player-v3.jpg','2005-04-20',175,65,'Level 4B',0,1,'2023-01-10','2026-01-24 07:49:55'),(9,2,'Uwineza Diane','Uwineza Diane',10,'Libero','Libero','/uploads/sports/player-v4.jpg','2004-12-08',168,58,'Level 4A',0,1,'2023-01-10','2026-01-24 07:49:55'),(10,2,'Mutesi Peace','Mutesi Peace',9,'Opposite Hitter','Opposite Hitter','/uploads/sports/player-v5.jpg','2005-06-25',173,63,'Level 4B',0,1,'2023-01-10','2026-01-24 07:49:55'),(31,1,'Beningabo Emmanuel',NULL,10,'Forward',NULL,'/uploads/sports/garden foot ball plyers/beningabo emannuel.jpg',NULL,NULL,NULL,NULL,1,1,NULL,'2026-02-10 05:48:51'),(32,1,'Cyangwege John',NULL,8,'Midfielder',NULL,'/uploads/sports/garden foot ball plyers/cyangwege john.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(33,1,'Dukuze JMV',NULL,5,'Defender',NULL,'/uploads/sports/garden foot ball plyers/dukuze jmv.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(34,1,'Habineza Felix',NULL,1,'Goalkeeper',NULL,'/uploads/sports/garden foot ball plyers/habineza felix.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(35,1,'Iradukunda Sammuel',NULL,11,'Forward',NULL,'/uploads/sports/garden foot ball plyers/iradukunda sammuel.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(36,1,'Irafasha Augiste',NULL,6,'Midfielder',NULL,'/uploads/sports/garden foot ball plyers/irafasha augiste.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(37,1,'Manzi Fabrice',NULL,4,'Defender',NULL,'/uploads/sports/garden foot ball plyers/manzi fabrice.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(38,1,'Mpfite Umukiza Lavie',NULL,7,'Midfielder',NULL,'/uploads/sports/garden foot ball plyers/mpfite umukiza lavie.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(39,1,'Mugisha Dieudonne',NULL,9,'Forward',NULL,'/uploads/sports/garden foot ball plyers/mugisha dieudonne.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(40,1,'Mugisha Elisa',NULL,3,'Defender',NULL,'/uploads/sports/garden foot ball plyers/mugisha elisa.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(41,1,'Mugisha Joseph',NULL,14,'Midfielder',NULL,'/uploads/sports/garden foot ball plyers/mugisha joseph.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(42,1,'Ndayizeye Eric',NULL,17,'Forward',NULL,'/uploads/sports/garden foot ball plyers/ndayizeye eric.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(43,1,'Ndayizeye Patric',NULL,2,'Defender',NULL,'/uploads/sports/garden foot ball plyers/ndayizeye patric.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(44,1,'Ndori Vedaste',NULL,15,'Midfielder',NULL,'/uploads/sports/garden foot ball plyers/ndori vedaste.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(45,1,'Nineza Nick Nelly',NULL,19,'Forward',NULL,'/uploads/sports/garden foot ball plyers/nineza nick nelly.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(46,1,'Nsengiyumva Flank',NULL,12,'Defender',NULL,'/uploads/sports/garden foot ball plyers/nsengiyumva flank.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(47,1,'Nzamurambaho Jirbert',NULL,13,'Midfielder',NULL,'/uploads/sports/garden foot ball plyers/nzamurambaho jirbert.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(48,1,'Olivier',NULL,20,'Forward',NULL,'/uploads/sports/garden foot ball plyers/olivier.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(49,1,'Umukundwa Anfge Lohike',NULL,16,'Defender',NULL,'/uploads/sports/garden foot ball plyers/umukundwa anfge lohike.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51'),(50,1,'Uwayisenga Patrick',NULL,18,'Midfielder',NULL,'/uploads/sports/garden foot ball plyers/uwayisenga patrick.jpg',NULL,NULL,NULL,NULL,0,1,NULL,'2026-02-10 05:48:51');
/*!40000 ALTER TABLE `sports_players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_statistics`
--

DROP TABLE IF EXISTS `sports_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sport_type` varchar(100) NOT NULL,
  `total_players` int(11) DEFAULT 0,
  `total_matches` int(11) DEFAULT 0,
  `wins` int(11) DEFAULT 0,
  `losses` int(11) DEFAULT 0,
  `draws` int(11) DEFAULT 0,
  `goals_scored` int(11) DEFAULT 0,
  `goals_conceded` int(11) DEFAULT 0,
  `season` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sport` (`sport_type`),
  KEY `idx_season` (`season`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_statistics`
--

LOCK TABLES `sports_statistics` WRITE;
/*!40000 ALTER TABLE `sports_statistics` DISABLE KEYS */;
INSERT INTO `sports_statistics` VALUES (1,'Football',0,0,0,0,0,0,0,'2024','2026-01-28 13:19:03','2026-01-28 13:19:03'),(2,'Basketball',0,0,0,0,0,0,0,'2024','2026-01-28 13:19:03','2026-01-28 13:19:03'),(3,'Volleyball',0,0,0,0,0,0,0,'2024','2026-01-28 13:19:03','2026-01-28 13:19:03');
/*!40000 ALTER TABLE `sports_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_team_members`
--

DROP TABLE IF EXISTS `sports_team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `position` varchar(50) DEFAULT NULL,
  `jersey_number` int(11) DEFAULT NULL,
  `joined_date` date NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_member` (`team_id`,`student_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `sports_team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `sports_teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sports_team_members_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_team_members`
--

LOCK TABLES `sports_team_members` WRITE;
/*!40000 ALTER TABLE `sports_team_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `sports_team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_team_overview`
--

DROP TABLE IF EXISTS `sports_team_overview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_team_overview` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `content_type` enum('stat','highlight','milestone','quote','image','video','announcement') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `title_rw` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `value` varchar(100) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `sports_team_overview_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `sports_teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_team_overview`
--

LOCK TABLES `sports_team_overview` WRITE;
/*!40000 ALTER TABLE `sports_team_overview` DISABLE KEYS */;
INSERT INTO `sports_team_overview` VALUES (1,1,'stat','Win Rate','Igipimo cy\'Intsinzi','Current season win percentage','Igipimo cy\'intsinzi muri iki gihembwe',NULL,'🏆','75%','green',1,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(2,1,'stat','Goals Scored','Ibitego Byatsinzwe','Total goals this season','Ibitego byose muri iki gihembwe',NULL,'⚽','45','blue',2,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(3,1,'stat','Clean Sheets','Imikino Tutakiriye','Matches without conceding','Imikino tutakiriye ibitego',NULL,'🛡️','8','yellow',3,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(4,1,'highlight','Championship Victory','Intsinzi y\'Igikombe','Won the regional championship','Twatsindiye igikombe cy\'akarere',NULL,'🏆',NULL,'gold',4,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(5,1,'milestone','100 Goals','Ibitego 100','Team reached 100 goals milestone','Ikipe yageze ku bitego 100',NULL,'🎯','100','red',5,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(6,1,'quote','Team Spirit','Umwuka w\'Ikipe','Together we achieve greatness','Hamwe tugera ku ntsinzi',NULL,'💪',NULL,'purple',6,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(7,2,'stat','Win Rate','Igipimo cy\'Intsinzi','Current season win percentage','Igipimo cy\'intsinzi muri iki gihembwe',NULL,'🏐','82%','green',1,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(8,2,'stat','Sets Won','Amatsinda Yatsinzwe','Total sets won this season','Amatsinda yose yatsinzwe muri iki gihembwe',NULL,'📊','67','blue',2,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(9,2,'stat','Aces','Aces','Total aces scored','Aces zose zakoze',NULL,'⚡','156','yellow',3,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(10,2,'highlight','Undefeated Streak','Intsinzi Zikurikirana','12 consecutive wins','Intsinzi 12 zikurikirana',NULL,'🔥','12','orange',4,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(11,2,'milestone','National Ranking','Umwanya ku Gihugu','Ranked #2 nationally','Umwanya wa 2 ku gihugu',NULL,'🥈','#2','silver',5,1,'2026-01-25 14:53:15','2026-01-25 14:53:15'),(12,1,'image','Full Team Photo','Ifoto y\'Ikipe Yose','Complete football team','Ikipe yose ya football','/uploads/sports/full teamof football.jpg','📸',NULL,NULL,10,1,'2026-01-25 16:18:21','2026-01-25 16:18:21'),(13,1,'image','Team Captain','Kapiteni w\'Ikipe','Team leadership','Ubuyobozi bw\'ikipe','/uploads/sports/vis president of football.jpg','👑',NULL,NULL,11,1,'2026-01-25 16:18:21','2026-01-25 16:18:21');
/*!40000 ALTER TABLE `sports_team_overview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports_teams`
--

DROP TABLE IF EXISTS `sports_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sports_teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `sport_type` enum('football','volleyball') NOT NULL,
  `description` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `icon` varchar(10) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `founded_year` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports_teams`
--

LOCK TABLES `sports_teams` WRITE;
/*!40000 ALTER TABLE `sports_teams` DISABLE KEYS */;
INSERT INTO `sports_teams` VALUES (1,'Umupira w\'Amaguru','Football Team','football','Ikipe ya Garden TVET School mu mupira w\'amaguru. Ikipe yacu ifite abakinnyi beza kandi ifite intsinzi nyinshi mu marushanwa atandukanye.','Garden TVET School Football Team. Our team has excellent players and many victories in various competitions.','⚽','/uploads/sports/foot ball team.png',2020,1,'2026-01-24 07:49:55','2026-02-10 06:19:15'),(2,'Umupira w\'Amaboko','Volleyball Team','volleyball','Ikipe ya Garden TVET School mu mupira w\'amaboko. Ikipe yacu ifite abakinnyi beza kandi ifite intsinzi nyinshi mu marushanwa atandukanye.','Garden TVET School Volleyball Team. Our team has excellent players and many victories in various competitions.','🏐','/uploads/sports/volleyball-team.jpg',2020,1,'2026-01-24 07:49:55','2026-01-24 07:49:55');
/*!40000 ALTER TABLE `sports_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'repose@gmail.com','$2a$10$08bSrR9PuTjE1f0PUHYnJuL4HLIBJIO5W7fX2DgDUUGiNZCIP4GbC','Repose','Admin','admin','Administration',1,'2026-01-22 12:26:59'),(2,'dos@school.rw','$2a$10$08bSrR9PuTjE1f0PUHYnJuL4HLIBJIO5W7fX2DgDUUGiNZCIP4GbC','Director','Studies','dos','Academic',1,'2026-01-22 12:26:59'),(3,'dod@school.rw','$2a$10$08bSrR9PuTjE1f0PUHYnJuL4HLIBJIO5W7fX2DgDUUGiNZCIP4GbC','Director','Discipline','dod','Discipline',1,'2026-01-22 12:26:59'),(4,'headmaster@school.rw','$2a$10$08bSrR9PuTjE1f0PUHYnJuL4HLIBJIO5W7fX2DgDUUGiNZCIP4GbC','Head','Master','headmaster','Administration',1,'2026-01-22 12:26:59');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_activity_log`
--

DROP TABLE IF EXISTS `staff_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_activity_log`
--

LOCK TABLES `staff_activity_log` WRITE;
/*!40000 ALTER TABLE `staff_activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_attendance`
--

DROP TABLE IF EXISTS `staff_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `status` enum('present','absent','late','half_day','on_leave') DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_staff_date` (`staff_id`,`date`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_date` (`date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_attendance`
--

LOCK TABLES `staff_attendance` WRITE;
/*!40000 ALTER TABLE `staff_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_data`
--

DROP TABLE IF EXISTS `staff_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_data`
--

LOCK TABLES `staff_data` WRITE;
/*!40000 ALTER TABLE `staff_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_documents`
--

DROP TABLE IF EXISTS `staff_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` text NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `category` enum('contract','certificate','id_document','resume','performance','other') DEFAULT 'other',
  `description` text DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_documents`
--

LOCK TABLES `staff_documents` WRITE;
/*!40000 ALTER TABLE `staff_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_leaves`
--

DROP TABLE IF EXISTS `staff_leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_leaves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `leave_type` varchar(50) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `coverage_arrangement` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewer_comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_leaves`
--

LOCK TABLES `staff_leaves` WRITE;
/*!40000 ALTER TABLE `staff_leaves` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_management`
--

DROP TABLE IF EXISTS `staff_management`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_management` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `title_rw` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `responsibilities` text DEFAULT NULL,
  `responsibilities_rw` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_management`
--

LOCK TABLES `staff_management` WRITE;
/*!40000 ALTER TABLE `staff_management` DISABLE KEYS */;
INSERT INTO `staff_management` VALUES (1,'Head Master','Umuyobozi Mukuru','Dr. Jean Baptiste NIYONZIMA','/assets/staff/headmaster.jpg','headmaster@gardentvet.ac.rw','+250788123456','The Head Master oversees all school operations and strategic planning.','Umuyobozi Mukuru akurikirana ibikorwa byose by\'ishuri n\'igenamigambi.','Overall school management, Strategic planning, Staff supervision, Budget oversight, Community relations','Ubuyobozi rusange bw\'ishuri, Igenamigambi, Kugenzura abakozi, Gucunga ingengo y\'imari, Umubano n\'abaturage',1,1,'2026-01-23 04:54:32','2026-01-23 04:54:32'),(2,'Director of Studies','Umuyobozi w\'Amasomo','Prof. Marie Claire UWASE','/assets/staff/dos.jpg','dos@gardentvet.ac.rw','+250788234567','The Director of Studies manages academic programs and curriculum development.','Umuyobozi w\'Amasomo akurikirana gahunda z\'amasomo n\'integanyanyigisho.','Academic program management, Curriculum development, Teacher evaluation, Examination coordination, Student performance monitoring','Gucunga gahunda z\'amasomo, Gutegura integanyanyigisho, Gusuzuma abarimu, Gutegura ibizamini, Gukurikirana imikorere y\'abanyeshuri',2,1,'2026-01-23 04:54:32','2026-01-23 04:54:32'),(3,'Director of Discipline','Umuyobozi w\'Imyitwarire','Mr. Paul MUGABO','/assets/staff/dod.jpg','dod@gardentvet.ac.rw','+250788345678','The Director of Discipline ensures student welfare and maintains school discipline.','Umuyobozi w\'Imyitwarire areba imibereho y\'abanyeshuri n\'imyitwarire myiza.','Student discipline management, Counseling services, Behavior monitoring, Conflict resolution, Student welfare programs','Gucunga imyitwarire y\'abanyeshuri, Ubujyanama, Gukurikirana imyitwarire, Gukemura amakimbirane, Gahunda z\'imibereho myiza',3,1,'2026-01-23 04:54:32','2026-01-23 04:54:32'),(4,'Stock Manager','Umuyobozi w\'Ububiko','Mrs. Grace MUKAMANA','/assets/staff/stock.jpg','stock@gardentvet.ac.rw','+250788456789','The Stock Manager oversees inventory and procurement of school supplies.','Umuyobozi w\'Ububiko akurikirana ibikoresho n\'ibicuruzwa by\'ishuri.','Inventory management, Procurement coordination, Supply chain oversight, Asset tracking, Vendor relations','Gucunga ububiko, Gutegura ibicuruzwa, Gukurikirana ibikoresho, Gukurikirana umutungo, Umubano n\'abatanga',4,1,'2026-01-23 04:54:32','2026-01-23 04:54:32'),(5,'School Advisor','Umujyanama w\'Ishuri','Dr. Emmanuel HABIMANA','/assets/staff/advisor.jpg','advisor@gardentvet.ac.rw','+250788567890','The School Advisor provides guidance on educational policies and strategic initiatives.','Umujyanama w\'Ishuri atanga ubujyanama ku ngamba z\'uburezi n\'imigambi.','Policy advisory, Strategic planning support, Quality assurance, Stakeholder engagement, Educational research','Ubujyanama ku ngamba, Gufasha mu nteganyabikorwa, Kureba ireme, Guhuza abafatanyabikorwa, Ubushakashatsi mu burezi',5,1,'2026-01-23 04:54:32','2026-01-23 04:54:32'),(6,'School Manager','Umuyobozi w\'Imicungire','Mr. David KAMANZI','/assets/staff/manager.jpg','manager@gardentvet.ac.rw','+250788678901','The School Manager handles administrative operations and facility management.','Umuyobozi w\'Imicungire akurikirana ibikorwa by\'ubuyobozi n\'ububiko.','Administrative operations, Facility management, Resource allocation, Operational planning, Support services coordination','Ibikorwa by\'ubuyobozi, Gucunga ububiko, Gutanga ibikoresho, Gutegura ibikorwa, Guhuza serivisi zifasha',6,1,'2026-01-23 04:54:32','2026-01-23 04:54:32');
/*!40000 ALTER TABLE `staff_management` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_notifications`
--

DROP TABLE IF EXISTS `staff_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','error','success') DEFAULT 'info',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `action_url` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_notifications`
--

LOCK TABLES `staff_notifications` WRITE;
/*!40000 ALTER TABLE `staff_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_profiles`
--

DROP TABLE IF EXISTS `staff_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_image` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact` varchar(200) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `hire_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_profiles`
--

LOCK TABLES `staff_profiles` WRITE;
/*!40000 ALTER TABLE `staff_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_reviews`
--

DROP TABLE IF EXISTS `staff_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `evaluation_period` varchar(50) DEFAULT NULL,
  `overall_rating` decimal(3,2) DEFAULT NULL,
  `rating_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rating_breakdown`)),
  `strengths` text DEFAULT NULL,
  `areas_for_improvement` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `goals` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`goals`)),
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_evaluation_period` (`evaluation_period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_reviews`
--

LOCK TABLES `staff_reviews` WRITE;
/*!40000 ALTER TABLE `staff_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_role_cards`
--

DROP TABLE IF EXISTS `staff_role_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_role_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(50) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `access_level` varchar(20) DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_role_cards`
--

LOCK TABLES `staff_role_cards` WRITE;
/*!40000 ALTER TABLE `staff_role_cards` DISABLE KEYS */;
INSERT INTO `staff_role_cards` VALUES (1,'advisor','School Advisor','Comprehensive school management with full analytics, student oversight, and communication coordination','fas fa-user-tie','linear-gradient(135d','[\"Kureba Abanyeshuri Bose - Abanyeshuri bose bo mu myuga yose\",\"Ikibaho cy\'Isesengura - Imibare n\'isesengura mu gihe nyacyo\",\"Imicungire y\'Itumanaho - Gucunga ubutumwa bwose\",\"Gukurikirana Iterambere - Gukurikirana iterambere ry\'abanyeshuri\",\"Guhuza Ababyeyi - Guhuza ababyeyi n\'ishuri\",\"Kora Raporo - Kora raporo zuzuye\",\"Isesengura ry\'Ingaruka - Kumenya abanyeshuri bakeneye ubufasha\",\"Guhuza Abarimu - Gufatanya n\'abarimu\",\"Amakuru y\'Iterambere ry\'Ishuri - Amakuru y\'iterambere\",\"Imicungire Yuzuye - Imicungire yose y\'ishuri\"]','high',2,1,'2026-01-28 03:16:45');
/*!40000 ALTER TABLE `staff_role_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_schedule`
--

DROP TABLE IF EXISTS `staff_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_schedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL COMMENT '1=Monday, 7=Sunday',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `activity` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_day_of_week` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_schedule`
--

LOCK TABLES `staff_schedule` WRITE;
/*!40000 ALTER TABLE `staff_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_sheet_columns`
--

DROP TABLE IF EXISTS `staff_sheet_columns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_sheet_columns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `column_name` varchar(100) NOT NULL,
  `column_type` varchar(50) NOT NULL,
  `is_calculated` tinyint(1) DEFAULT 0,
  `calculation_formula` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_role` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_sheet_columns`
--

LOCK TABLES `staff_sheet_columns` WRITE;
/*!40000 ALTER TABLE `staff_sheet_columns` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_sheet_columns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_categories`
--

DROP TABLE IF EXISTS `stock_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_categories`
--

LOCK TABLES `stock_categories` WRITE;
/*!40000 ALTER TABLE `stock_categories` DISABLE KEYS */;
INSERT INTO `stock_categories` VALUES (1,'Electronics','Electronic equipment and components',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(2,'Stationery','Office and classroom stationery',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(3,'Tools','Workshop tools and equipment',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(4,'Furniture','Classroom and office furniture',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(5,'Books','Textbooks and reference materials',1,'2026-01-24 05:02:44','2026-01-24 05:02:44');
/*!40000 ALTER TABLE `stock_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_items`
--

DROP TABLE IF EXISTS `stock_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `current_quantity` int(11) DEFAULT 0,
  `minimum_quantity` int(11) DEFAULT 10,
  `maximum_quantity` int(11) DEFAULT 1000,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `unit_of_measurement` varchar(20) DEFAULT 'piece',
  `supplier` varchar(200) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `stock_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `stock_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_items`
--

LOCK TABLES `stock_items` WRITE;
/*!40000 ALTER TABLE `stock_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_item_id` int(11) NOT NULL,
  `movement_type` enum('in','out','adjustment','transfer') NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `total_value` decimal(10,2) DEFAULT 0.00,
  `reference_number` varchar(100) DEFAULT NULL,
  `reason` varchar(200) DEFAULT NULL,
  `moved_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `movement_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `stock_item_id` (`stock_item_id`),
  KEY `moved_by` (`moved_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`),
  CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`moved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `stock_movements_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_requisition_items`
--

DROP TABLE IF EXISTS `stock_requisition_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_requisition_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requisition_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity_requested` int(11) NOT NULL,
  `quantity_approved` int(11) DEFAULT 0,
  `quantity_issued` int(11) DEFAULT 0,
  `purpose` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_requisition_id` (`requisition_id`),
  KEY `idx_item_id` (`item_id`),
  CONSTRAINT `stock_requisition_items_ibfk_1` FOREIGN KEY (`requisition_id`) REFERENCES `stock_requisitions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_requisition_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_requisition_items`
--

LOCK TABLES `stock_requisition_items` WRITE;
/*!40000 ALTER TABLE `stock_requisition_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_requisition_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_requisitions`
--

DROP TABLE IF EXISTS `stock_requisitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_requisitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requisition_number` varchar(100) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `request_date` date NOT NULL,
  `required_date` date DEFAULT NULL,
  `status` enum('pending','approved','rejected','fulfilled','cancelled') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `requisition_number` (`requisition_number`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by`),
  CONSTRAINT `stock_requisitions_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_requisitions_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_requisitions`
--

LOCK TABLES `stock_requisitions` WRITE;
/*!40000 ALTER TABLE `stock_requisitions` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_requisitions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_suppliers`
--

DROP TABLE IF EXISTS `stock_suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `status` enum('active','inactive','blacklisted') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_supplier_name` (`supplier_name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_suppliers`
--

LOCK TABLES `stock_suppliers` WRITE;
/*!40000 ALTER TABLE `stock_suppliers` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_take_items`
--

DROP TABLE IF EXISTS `stock_take_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_take_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_take_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `system_quantity` int(11) NOT NULL,
  `actual_quantity` int(11) NOT NULL,
  `variance` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_take_id` (`stock_take_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `stock_take_items_ibfk_1` FOREIGN KEY (`stock_take_id`) REFERENCES `stock_takes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_take_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_take_items`
--

LOCK TABLES `stock_take_items` WRITE;
/*!40000 ALTER TABLE `stock_take_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_take_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_takes`
--

DROP TABLE IF EXISTS `stock_takes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_takes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conducted_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','completed') DEFAULT 'pending',
  `date_conducted` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_takes`
--

LOCK TABLES `stock_takes` WRITE;
/*!40000 ALTER TABLE `stock_takes` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_takes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transactions`
--

DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `transaction_type` enum('purchase','issue','return','adjustment','damage','loss') DEFAULT 'issue',
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `total_value` decimal(10,2) DEFAULT 0.00,
  `transaction_date` date NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `issued_to` int(11) DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `issued_to` (`issued_to`),
  KEY `issued_by` (`issued_by`),
  KEY `idx_item` (`item_id`),
  KEY `idx_transaction_date` (`transaction_date`),
  KEY `idx_type` (`transaction_type`),
  CONSTRAINT `stock_transactions_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_transactions_ibfk_2` FOREIGN KEY (`issued_to`) REFERENCES `users` (`id`),
  CONSTRAINT `stock_transactions_ibfk_3` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--

LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_achievements`
--

DROP TABLE IF EXISTS `student_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `achievement_type` varchar(100) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `points` int(11) DEFAULT 0,
  `category` enum('academic','sports','arts','leadership','other') DEFAULT 'other',
  `achievement_date` date DEFAULT NULL,
  `date_earned` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_achievements_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_achievements`
--

LOCK TABLES `student_achievements` WRITE;
/*!40000 ALTER TABLE `student_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_action_logs`
--

DROP TABLE IF EXISTS `student_action_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_action_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `action_description` text DEFAULT NULL,
  `performed_by` int(11) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_performed_by` (`performed_by`),
  CONSTRAINT `student_action_logs_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_action_logs_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_action_logs`
--

LOCK TABLES `student_action_logs` WRITE;
/*!40000 ALTER TABLE `student_action_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_action_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_applications`
--

DROP TABLE IF EXISTS `student_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `parent_name` varchar(200) NOT NULL,
  `parent_phone` varchar(20) NOT NULL,
  `parent_email` varchar(255) DEFAULT NULL,
  `parent_occupation` varchar(100) DEFAULT NULL,
  `previous_school` varchar(255) DEFAULT NULL,
  `education_level` enum('senior_3_completed','changing_school','other') NOT NULL,
  `trade_code` varchar(50) NOT NULL,
  `level_number` int(11) NOT NULL,
  `level_suffix` varchar(10) DEFAULT NULL,
  `reason_for_applying` text NOT NULL,
  `previous_grades` text DEFAULT NULL,
  `special_needs` text DEFAULT NULL,
  `status` enum('pending','under_review','approved','rejected','enrolled') DEFAULT 'pending',
  `reviewed_by_dos` int(11) DEFAULT NULL,
  `reviewed_by_headmaster` int(11) DEFAULT NULL,
  `dos_comments` text DEFAULT NULL,
  `headmaster_comments` text DEFAULT NULL,
  `dos_decision` enum('pending','approved','rejected') DEFAULT 'pending',
  `headmaster_decision` enum('pending','approved','rejected') DEFAULT 'pending',
  `dos_reviewed_at` timestamp NULL DEFAULT NULL,
  `headmaster_reviewed_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_number` (`application_number`),
  KEY `idx_status` (`status`),
  KEY `idx_trade` (`trade_code`),
  KEY `idx_application_number` (`application_number`),
  KEY `idx_submitted_at` (`submitted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_applications`
--

LOCK TABLES `student_applications` WRITE;
/*!40000 ALTER TABLE `student_applications` DISABLE KEYS */;
INSERT INTO `student_applications` VALUES (1,'APP2024001','Jean','Uwimana','2000-05-15','male','+250788123456','jean@email.com','Kigali','Marie Uwimana','+250788654321',NULL,NULL,'GS Kimisagara','senior_3_completed','AUT',4,NULL,'I want to learn automotive technology',NULL,NULL,'pending',NULL,NULL,NULL,NULL,'pending','pending',NULL,NULL,'2026-02-10 05:48:14','2026-02-10 05:48:14'),(2,'APP2024002','Grace','Mukamana','1999-08-22','female','+250788987654','grace@email.com','Kigali','Joseph Mukamana','+250788456789',NULL,NULL,'Lycee de Kigali','senior_3_completed','SOD',5,NULL,'I want to become a software developer',NULL,NULL,'approved',NULL,NULL,NULL,NULL,'pending','pending',NULL,NULL,'2026-02-10 05:48:14','2026-02-10 05:48:14'),(3,'APP2024003','Patrick','Niyonzima','2001-03-10','male','+250788111222','patrick@email.com','Kigali','Agnes Niyonzima','+250788333444',NULL,NULL,'APRED Ndera','senior_3_completed','BDC',3,NULL,'I want to learn construction',NULL,NULL,'under_review',NULL,NULL,NULL,NULL,'pending','pending',NULL,NULL,'2026-02-10 05:48:14','2026-02-10 05:48:14'),(4,'APP2024004','Alice','Uwamahoro','2000-11-18','female','+250788555666','alice@email.com','Rwamagana','Emmanuel Uwamahoro','+250788777888',NULL,NULL,'ES Rwamagana','senior_3_completed','AUT',5,NULL,'I want to become an automotive engineer',NULL,NULL,'',NULL,NULL,NULL,NULL,'pending','pending',NULL,NULL,'2026-02-10 05:48:14','2026-02-10 05:48:14'),(5,'APP2024005','Eric','Habimana','1998-07-25','male','+250788999000','eric@email.com','Musanze','Beatrice Habimana','+250788111333',NULL,NULL,'GS Musanze','senior_3_completed','SOD',4,NULL,'I want to develop mobile applications',NULL,NULL,'rejected',NULL,NULL,NULL,NULL,'pending','pending',NULL,NULL,'2026-02-10 05:48:14','2026-02-10 05:48:14'),(6,'APP2024006','Claudine','Mukamana','2001-07-30','female','+250788444555','claudine@email.com','Huye','Vincent Mukamana','+250788666777',NULL,NULL,'Lycee de Butare','senior_3_completed','BDC',4,NULL,'I want to specialize in construction management',NULL,NULL,'pending',NULL,NULL,NULL,NULL,'pending','pending',NULL,NULL,'2026-02-10 05:48:14','2026-02-10 05:48:14');
/*!40000 ALTER TABLE `student_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_attendance`
--

DROP TABLE IF EXISTS `student_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `trade` varchar(100) DEFAULT NULL,
  `class_level` varchar(50) DEFAULT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('present','absent','late','excused') NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `marked_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`attendance_date`,`subject`),
  KEY `marked_by` (`marked_by`),
  CONSTRAINT `student_attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_attendance_ibfk_2` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_attendance`
--

LOCK TABLES `student_attendance` WRITE;
/*!40000 ALTER TABLE `student_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_attendance_alerts`
--

DROP TABLE IF EXISTS `student_attendance_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_attendance_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `alert_type` enum('absent','late','left_early','excused') DEFAULT 'absent',
  `date` date DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_attendance_alerts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_attendance_alerts`
--

LOCK TABLES `student_attendance_alerts` WRITE;
/*!40000 ALTER TABLE `student_attendance_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_attendance_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_attendance_records`
--

DROP TABLE IF EXISTS `student_attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_attendance_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sheet_id` int(11) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `attendance_date` date DEFAULT NULL,
  `status` enum('present','absent','late','excused','sick','leave') DEFAULT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `period` varchar(50) DEFAULT NULL,
  `marked_by` varchar(50) DEFAULT NULL,
  `marked_by_name` varchar(200) DEFAULT NULL,
  `marked_by_role` varchar(50) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`attendance_date`,`subject`,`period`),
  KEY `idx_attendance_student_date` (`student_id`,`attendance_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_attendance_records`
--

LOCK TABLES `student_attendance_records` WRITE;
/*!40000 ALTER TABLE `student_attendance_records` DISABLE KEYS */;
INSERT INTO `student_attendance_records` VALUES (1,1,'STU001','2026-02-06','present','Mathematics',NULL,'T001','Teacher John','teacher',NULL,'2026-02-06 13:29:05');
/*!40000 ALTER TABLE `student_attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_attendance_summary`
--

DROP TABLE IF EXISTS `student_attendance_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_attendance_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sheet_id` int(11) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `month` varchar(50) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `total_days` int(11) DEFAULT 0,
  `present_days` int(11) DEFAULT 0,
  `absent_days` int(11) DEFAULT 0,
  `late_days` int(11) DEFAULT 0,
  `excused_days` int(11) DEFAULT 0,
  `sick_days` int(11) DEFAULT 0,
  `attendance_rate` decimal(10,2) DEFAULT 100.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_summary` (`student_id`,`month`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_attendance_summary`
--

LOCK TABLES `student_attendance_summary` WRITE;
/*!40000 ALTER TABLE `student_attendance_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_attendance_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_attendance_tracking`
--

DROP TABLE IF EXISTS `student_attendance_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_attendance_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `month` varchar(20) NOT NULL,
  `year` int(11) NOT NULL,
  `total_days` int(11) DEFAULT 0,
  `present_days` int(11) DEFAULT 0,
  `absent_days` int(11) DEFAULT 0,
  `late_days` int(11) DEFAULT 0,
  `excused_days` int(11) DEFAULT 0,
  `attendance_rate` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_month_year` (`student_id`,`month`,`year`),
  KEY `student_sheet_id` (`student_sheet_id`),
  CONSTRAINT `student_attendance_tracking_ibfk_1` FOREIGN KEY (`student_sheet_id`) REFERENCES `student_comprehensive_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_attendance_tracking_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_attendance_tracking`
--

LOCK TABLES `student_attendance_tracking` WRITE;
/*!40000 ALTER TABLE `student_attendance_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_attendance_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_badges`
--

DROP TABLE IF EXISTS `student_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `badge_id` int(11) NOT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `progress_percentage` decimal(5,2) DEFAULT 100.00,
  `is_displayed` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_badge` (`student_id`,`badge_id`),
  KEY `badge_id` (`badge_id`),
  CONSTRAINT `student_badges_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `achievement_badges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_badges`
--

LOCK TABLES `student_badges` WRITE;
/*!40000 ALTER TABLE `student_badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_behavior`
--

DROP TABLE IF EXISTS `student_behavior`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_behavior` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `recorded_by` int(11) NOT NULL,
  `behavior_type` enum('positive','negative','neutral') NOT NULL,
  `category` enum('discipline','attendance','academic','social','health') NOT NULL,
  `title_rw` varchar(200) NOT NULL,
  `title_en` varchar(200) DEFAULT NULL,
  `description_rw` text NOT NULL,
  `description_en` text DEFAULT NULL,
  `severity` enum('minor','moderate','major','critical') DEFAULT 'minor',
  `incident_date` datetime NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `witnesses` text DEFAULT NULL,
  `action_taken_rw` text DEFAULT NULL,
  `action_taken_en` text DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `parent_notification_date` datetime DEFAULT NULL,
  `parent_response_rw` text DEFAULT NULL,
  `parent_response_en` text DEFAULT NULL,
  `resolved` tinyint(1) DEFAULT 0,
  `resolution_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_behavior`
--

LOCK TABLES `student_behavior` WRITE;
/*!40000 ALTER TABLE `student_behavior` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_behavior` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_behavior_analytics`
--

DROP TABLE IF EXISTS `student_behavior_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_behavior_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `analysis_period_start` date NOT NULL,
  `analysis_period_end` date NOT NULL,
  `total_conducts` int(11) DEFAULT 0,
  `minor_incidents` int(11) DEFAULT 0,
  `moderate_incidents` int(11) DEFAULT 0,
  `serious_incidents` int(11) DEFAULT 0,
  `severe_incidents` int(11) DEFAULT 0,
  `total_conduct_points` int(11) DEFAULT 0,
  `positive_behaviors` int(11) DEFAULT 0,
  `improvement_trend` enum('improving','stable','declining','critical') DEFAULT 'stable',
  `risk_level` enum('low','medium','high','critical') DEFAULT 'low',
  `intervention_required` tinyint(1) DEFAULT 0,
  `last_incident_date` date DEFAULT NULL,
  `consecutive_good_days` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_risk_level` (`risk_level`),
  KEY `idx_period` (`analysis_period_start`,`analysis_period_end`),
  CONSTRAINT `student_behavior_analytics_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_behavior_analytics`
--

LOCK TABLES `student_behavior_analytics` WRITE;
/*!40000 ALTER TABLE `student_behavior_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_behavior_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_behavior_log`
--

DROP TABLE IF EXISTS `student_behavior_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_behavior_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `behavior_type` enum('positive','negative') DEFAULT 'positive',
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `points` int(11) DEFAULT 0,
  `recorded_by` int(11) DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `incident_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_behavior_log_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_behavior_log`
--

LOCK TABLES `student_behavior_log` WRITE;
/*!40000 ALTER TABLE `student_behavior_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_behavior_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_behavior_points`
--

DROP TABLE IF EXISTS `student_behavior_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_behavior_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `points` int(11) DEFAULT 0,
  `point_type` enum('positive','negative') NOT NULL,
  `reason` varchar(255) NOT NULL,
  `awarded_by` int(11) DEFAULT NULL,
  `conduct_record_id` int(11) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_point_type` (`point_type`),
  KEY `idx_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_behavior_points`
--

LOCK TABLES `student_behavior_points` WRITE;
/*!40000 ALTER TABLE `student_behavior_points` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_behavior_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_career_profiles`
--

DROP TABLE IF EXISTS `student_career_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_career_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_sheet_id` int(11) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `career_interest` varchar(255) DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `weaknesses` text DEFAULT NULL,
  `aptitude_test_results` text DEFAULT NULL,
  `recommended_paths` text DEFAULT NULL,
  `goals` text DEFAULT NULL,
  `action_plan` text DEFAULT NULL,
  `advisor_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_sheet_id` (`student_sheet_id`),
  KEY `idx_career_interest` (`career_interest`),
  KEY `idx_student_code` (`student_code`),
  CONSTRAINT `student_career_profiles_ibfk_1` FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_career_profiles`
--

LOCK TABLES `student_career_profiles` WRITE;
/*!40000 ALTER TABLE `student_career_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_career_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_class_enrollment`
--

DROP TABLE IF EXISTS `student_class_enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_class_enrollment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_structure_id` int(11) NOT NULL,
  `enrollment_date` date NOT NULL,
  `status` enum('active','transferred','graduated','dropped') DEFAULT 'active',
  `academic_year` varchar(20) DEFAULT NULL,
  `enrolled_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `class_structure_id` (`class_structure_id`),
  KEY `enrolled_by` (`enrolled_by`),
  CONSTRAINT `student_class_enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_class_enrollment_ibfk_2` FOREIGN KEY (`class_structure_id`) REFERENCES `class_structure` (`id`),
  CONSTRAINT `student_class_enrollment_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_class_enrollment`
--

LOCK TABLES `student_class_enrollment` WRITE;
/*!40000 ALTER TABLE `student_class_enrollment` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_class_enrollment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_comprehensive_sheets`
--

DROP TABLE IF EXISTS `student_comprehensive_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_comprehensive_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `student_code` varchar(50) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `class_sheet_id` int(11) NOT NULL,
  `trade` varchar(50) DEFAULT NULL,
  `level` varchar(50) DEFAULT NULL,
  `section` varchar(10) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `total_subjects` int(11) DEFAULT 0,
  `total_marks` decimal(10,2) DEFAULT 0.00,
  `average_marks` decimal(5,2) DEFAULT 0.00,
  `overall_grade` varchar(5) DEFAULT NULL,
  `class_position` int(11) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT 0.00,
  `total_days` int(11) DEFAULT 0,
  `days_present` int(11) DEFAULT 0,
  `days_absent` int(11) DEFAULT 0,
  `days_late` int(11) DEFAULT 0,
  `attendance_percentage` decimal(5,2) DEFAULT 0.00,
  `total_incidents` int(11) DEFAULT 0,
  `critical_incidents` int(11) DEFAULT 0,
  `high_incidents` int(11) DEFAULT 0,
  `medium_incidents` int(11) DEFAULT 0,
  `low_incidents` int(11) DEFAULT 0,
  `conduct_score` int(11) DEFAULT 100,
  `conduct_grade` varchar(5) DEFAULT 'A',
  `total_fees` decimal(15,2) DEFAULT 0.00,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `balance` decimal(15,2) DEFAULT 0.00,
  `payment_status` enum('paid','partial','unpaid') DEFAULT 'unpaid',
  `overall_status` enum('excellent','good','average','poor','critical') DEFAULT 'average',
  `remarks` text DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `class_sheet_id` (`class_sheet_id`),
  CONSTRAINT `student_comprehensive_sheets_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_comprehensive_sheets_ibfk_2` FOREIGN KEY (`class_sheet_id`) REFERENCES `class_sheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_comprehensive_sheets`
--

LOCK TABLES `student_comprehensive_sheets` WRITE;
/*!40000 ALTER TABLE `student_comprehensive_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_comprehensive_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_concept_mastery`
--

DROP TABLE IF EXISTS `student_concept_mastery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_concept_mastery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `concept_id` int(11) NOT NULL,
  `mastery_level` decimal(5,2) DEFAULT 0.00,
  `attempts_count` int(11) DEFAULT 0,
  `last_assessment_score` decimal(5,2) DEFAULT NULL,
  `needs_review` tinyint(1) DEFAULT 0,
  `last_practiced` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_concept` (`student_id`,`concept_id`),
  KEY `concept_id` (`concept_id`),
  CONSTRAINT `student_concept_mastery_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_concept_mastery_ibfk_2` FOREIGN KEY (`concept_id`) REFERENCES `knowledge_graph` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_concept_mastery`
--

LOCK TABLES `student_concept_mastery` WRITE;
/*!40000 ALTER TABLE `student_concept_mastery` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_concept_mastery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_conduct_records`
--

DROP TABLE IF EXISTS `student_conduct_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_conduct_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `incident_type` varchar(100) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `description` text NOT NULL,
  `incident_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `location` varchar(255) DEFAULT NULL,
  `severity` enum('minor','moderate','major','severe') DEFAULT 'moderate',
  `reported_by` int(11) DEFAULT NULL,
  `handled_by` int(11) DEFAULT NULL,
  `action_id` int(11) DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `action_start_date` date DEFAULT NULL,
  `action_end_date` date DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `parent_notification_date` timestamp NULL DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `follow_up_notes` text DEFAULT NULL,
  `status` enum('active','resolved','appealed','cancelled') DEFAULT 'active',
  `resolution_notes` text DEFAULT NULL,
  `resolved_date` timestamp NULL DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_incident_date` (`incident_date`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_handled_by` (`handled_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_conduct_records`
--

LOCK TABLES `student_conduct_records` WRITE;
/*!40000 ALTER TABLE `student_conduct_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_conduct_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_conduct_tracking`
--

DROP TABLE IF EXISTS `student_conduct_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_conduct_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `warnings` int(11) DEFAULT 0,
  `suspensions` int(11) DEFAULT 0,
  `late_arrivals` int(11) DEFAULT 0,
  `absences` int(11) DEFAULT 0,
  `misbehaviors` int(11) DEFAULT 0,
  `uniform_violations` int(11) DEFAULT 0,
  `other_incidents` int(11) DEFAULT 0,
  `base_score` int(11) DEFAULT 100,
  `deductions` int(11) DEFAULT 0,
  `final_score` int(11) DEFAULT 100,
  `conduct_grade` varchar(5) DEFAULT 'A',
  `conduct_status` enum('excellent','good','fair','poor') DEFAULT 'excellent',
  `last_incident_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sheet_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_conduct` (`student_id`),
  KEY `student_sheet_id` (`student_sheet_id`),
  KEY `idx_sheet_id` (`sheet_id`),
  CONSTRAINT `student_conduct_tracking_ibfk_1` FOREIGN KEY (`student_sheet_id`) REFERENCES `student_comprehensive_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_conduct_tracking_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_conduct_tracking`
--

LOCK TABLES `student_conduct_tracking` WRITE;
/*!40000 ALTER TABLE `student_conduct_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_conduct_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_counseling_sessions`
--

DROP TABLE IF EXISTS `student_counseling_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_counseling_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `counselor_id` int(11) NOT NULL,
  `session_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `session_type` enum('individual','group','family','crisis') DEFAULT 'individual',
  `reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled',
  `confidential` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_counselor_id` (`counselor_id`),
  KEY `idx_session_date` (`session_date`),
  KEY `idx_status` (`status`),
  KEY `idx_counseling_student` (`student_id`),
  CONSTRAINT `student_counseling_sessions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_counseling_sessions_ibfk_2` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_counseling_sessions`
--

LOCK TABLES `student_counseling_sessions` WRITE;
/*!40000 ALTER TABLE `student_counseling_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_counseling_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_custom_columns`
--

DROP TABLE IF EXISTS `student_custom_columns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_custom_columns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_code` varchar(10) NOT NULL,
  `level_number` int(11) NOT NULL,
  `level_suffix` varchar(5) DEFAULT '',
  `column_name` varchar(100) NOT NULL,
  `column_type` enum('text','number','date','percentage') DEFAULT 'text',
  `formula` text DEFAULT NULL,
  `calculation_type` enum('none','sum','average','formula') DEFAULT 'none',
  `default_value` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_required` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_trade_level` (`trade_code`,`level_number`,`level_suffix`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_custom_columns`
--

LOCK TABLES `student_custom_columns` WRITE;
/*!40000 ALTER TABLE `student_custom_columns` DISABLE KEYS */;
INSERT INTO `student_custom_columns` VALUES (1,'SOD',3,'','Math Marks','number',NULL,'none',NULL,0,0,'2026-02-01 05:10:00','2026-02-01 05:10:00'),(2,'SOD',3,'','Science Marks','number',NULL,'none',NULL,0,0,'2026-02-01 05:10:00','2026-02-01 05:10:00'),(3,'SOD',3,'','Total','number','{Math Marks} + {Science Marks}','formula',NULL,0,0,'2026-02-01 05:10:00','2026-02-01 05:10:00'),(4,'SOD',3,'','Average','number','({Math Marks} + {Science Marks}) / 2','formula',NULL,0,0,'2026-02-01 05:10:00','2026-02-01 05:10:00'),(5,'BDC',4,'','Attendance %','percentage',NULL,'none',NULL,0,0,'2026-02-01 05:10:00','2026-02-01 05:10:00'),(6,'AUT',5,'','Practical Score','number',NULL,'none',NULL,0,0,'2026-02-01 05:10:00','2026-02-01 05:10:00');
/*!40000 ALTER TABLE `student_custom_columns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_custom_values`
--

DROP TABLE IF EXISTS `student_custom_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_custom_values` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `column_id` int(11) NOT NULL,
  `column_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_column` (`student_id`,`column_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_column` (`column_id`),
  CONSTRAINT `student_custom_values_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_custom_values_ibfk_2` FOREIGN KEY (`column_id`) REFERENCES `student_custom_columns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_custom_values`
--

LOCK TABLES `student_custom_values` WRITE;
/*!40000 ALTER TABLE `student_custom_values` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_custom_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_discipline_records`
--

DROP TABLE IF EXISTS `student_discipline_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_discipline_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sheet_id` int(11) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `incident_date` date DEFAULT NULL,
  `incident_type` varchar(100) DEFAULT NULL,
  `severity` enum('low','medium','high','critical') DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `witnesses` text DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `punishment` text DEFAULT NULL,
  `punishment_start` date DEFAULT NULL,
  `punishment_end` date DEFAULT NULL,
  `status` enum('active','resolved','appealed') DEFAULT 'active',
  `recorded_by` varchar(50) DEFAULT NULL,
  `recorded_by_name` varchar(200) DEFAULT NULL,
  `recorded_by_role` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_discipline_student_status` (`student_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_discipline_records`
--

LOCK TABLES `student_discipline_records` WRITE;
/*!40000 ALTER TABLE `student_discipline_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_discipline_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_expulsions`
--

DROP TABLE IF EXISTS `student_expulsions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_expulsions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `effective_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','revoked','completed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_expulsions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_expulsions`
--

LOCK TABLES `student_expulsions` WRITE;
/*!40000 ALTER TABLE `student_expulsions` DISABLE KEYS */;
INSERT INTO `student_expulsions` VALUES (1,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:03:53','2026-01-26 17:03:53'),(2,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:11:51','2026-01-26 17:11:51'),(3,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:16:03','2026-01-26 17:16:03'),(4,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:17:56','2026-01-26 17:17:56'),(5,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:18:14','2026-01-26 17:18:14'),(6,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:21:13','2026-01-26 17:21:13'),(7,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:22:37','2026-01-26 17:22:37'),(8,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:25:04','2026-01-26 17:25:04'),(9,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:31:15','2026-01-26 17:31:15'),(10,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:40:42','2026-01-26 17:40:42'),(11,1,'Test Expulsion','2026-01-26',NULL,'active','2026-01-26 17:41:12','2026-01-26 17:41:12');
/*!40000 ALTER TABLE `student_expulsions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_fees`
--

DROP TABLE IF EXISTS `student_fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_fees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `total_fees` decimal(10,2) NOT NULL DEFAULT 0.00,
  `academic_year` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_year` (`student_id`,`academic_year`),
  CONSTRAINT `student_fees_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_fees`
--

LOCK TABLES `student_fees` WRITE;
/*!40000 ALTER TABLE `student_fees` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_interventions`
--

DROP TABLE IF EXISTS `student_interventions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_interventions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_sheet_id` int(11) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `counselor_id` int(11) NOT NULL,
  `intervention_type` varchar(100) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `target_outcomes` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `expected_end_date` date DEFAULT NULL,
  `stakeholders` text DEFAULT NULL,
  `status` enum('active','completed','discontinued') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_sheet_id` (`student_sheet_id`),
  KEY `idx_status` (`status`),
  KEY `idx_student_code` (`student_code`),
  CONSTRAINT `student_interventions_ibfk_1` FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_interventions`
--

LOCK TABLES `student_interventions` WRITE;
/*!40000 ALTER TABLE `student_interventions` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_interventions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_learning_analytics`
--

DROP TABLE IF EXISTS `student_learning_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_learning_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `assignments_completed` int(11) DEFAULT 0,
  `assignments_avg_score` decimal(5,2) DEFAULT 0.00,
  `quizzes_taken` int(11) DEFAULT 0,
  `quizzes_avg_score` decimal(5,2) DEFAULT 0.00,
  `homework_completed` int(11) DEFAULT 0,
  `homework_avg_score` decimal(5,2) DEFAULT 0.00,
  `study_sessions_attended` int(11) DEFAULT 0,
  `total_study_hours` decimal(5,2) DEFAULT 0.00,
  `peer_reviews_given` int(11) DEFAULT 0,
  `peer_reviews_received` int(11) DEFAULT 0,
  `collaboration_score` decimal(5,2) DEFAULT 0.00,
  `improvement_trend` decimal(5,2) DEFAULT 0.00,
  `strengths` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`strengths`)),
  `areas_for_improvement` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`areas_for_improvement`)),
  `recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recommendations`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_analytics` (`student_id`,`subject_id`,`period_start`,`period_end`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `student_learning_analytics_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_learning_analytics_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_learning_analytics`
--

LOCK TABLES `student_learning_analytics` WRITE;
/*!40000 ALTER TABLE `student_learning_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_learning_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_learning_paths`
--

DROP TABLE IF EXISTS `student_learning_paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_learning_paths` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `path_id` int(11) NOT NULL,
  `enrollment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `current_milestone` int(11) DEFAULT 0,
  `completion_percentage` decimal(5,2) DEFAULT 0.00,
  `performance_score` decimal(5,2) DEFAULT NULL,
  `status` enum('not_started','in_progress','completed','paused') DEFAULT 'not_started',
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`student_id`,`path_id`),
  KEY `path_id` (`path_id`),
  CONSTRAINT `student_learning_paths_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_learning_paths_ibfk_2` FOREIGN KEY (`path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_learning_paths`
--

LOCK TABLES `student_learning_paths` WRITE;
/*!40000 ALTER TABLE `student_learning_paths` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_learning_paths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_leave_requests`
--

DROP TABLE IF EXISTS `student_leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_leave_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `leave_type` enum('sick','home','hospital','emergency','other') DEFAULT 'other',
  `reason` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_leave_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_leave_requests`
--

LOCK TABLES `student_leave_requests` WRITE;
/*!40000 ALTER TABLE `student_leave_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_leaves`
--

DROP TABLE IF EXISTS `student_leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_leaves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `student_code` varchar(50) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `trade` varchar(100) DEFAULT NULL,
  `class_level` varchar(50) DEFAULT NULL,
  `leave_type` varchar(100) DEFAULT NULL,
  `reason` text NOT NULL,
  `lesson_missed` varchar(255) DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `approved_by` int(11) NOT NULL,
  `approved_by_name` varchar(255) NOT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `status` enum('ongoing','returned','extended') DEFAULT 'ongoing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `sms_sent` tinyint(1) DEFAULT 0,
  `sms_sent_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `student_leaves_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_leaves_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_leaves`
--

LOCK TABLES `student_leaves` WRITE;
/*!40000 ALTER TABLE `student_leaves` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_lessons`
--

DROP TABLE IF EXISTS `student_lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `lesson_date` date NOT NULL,
  `time_from` time NOT NULL,
  `time_to` time NOT NULL,
  `lesson_type` varchar(100) NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `reason` text NOT NULL,
  `approved_by` int(11) NOT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_lesson_date` (`lesson_date`),
  CONSTRAINT `student_lessons_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_lessons_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `student_lessons_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_lessons`
--

LOCK TABLES `student_lessons` WRITE;
/*!40000 ALTER TABLE `student_lessons` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_levels`
--

DROP TABLE IF EXISTS `student_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `current_level` int(11) DEFAULT 1,
  `current_xp` int(11) DEFAULT 0,
  `total_xp` int(11) DEFAULT 0,
  `next_level_xp` int(11) DEFAULT 100,
  `level_title` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_subject` (`student_id`,`subject_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `student_levels_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_levels_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_levels`
--

LOCK TABLES `student_levels` WRITE;
/*!40000 ALTER TABLE `student_levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_location_tracking`
--

DROP TABLE IF EXISTS `student_location_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_location_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `tracking_date` date NOT NULL,
  `tracking_time` time NOT NULL,
  `location` varchar(200) NOT NULL,
  `location_type` enum('classroom','library','cafeteria','lab','sports_field','office','medical','outside') NOT NULL,
  `activity` varchar(200) DEFAULT NULL,
  `checked_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `checked_by` (`checked_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_tracking_date` (`tracking_date`),
  KEY `idx_location_type` (`location_type`),
  CONSTRAINT `student_location_tracking_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_location_tracking_ibfk_2` FOREIGN KEY (`checked_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_location_tracking`
--

LOCK TABLES `student_location_tracking` WRITE;
/*!40000 ALTER TABLE `student_location_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_location_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_medical_records`
--

DROP TABLE IF EXISTS `student_medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_medical_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `record_type` enum('visit','medication','allergy','condition','emergency') DEFAULT 'visit',
  `description` text DEFAULT NULL,
  `treatment` text DEFAULT NULL,
  `prescribed_by` varchar(100) DEFAULT NULL,
  `visit_date` date DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_medical_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_medical_records`
--

LOCK TABLES `student_medical_records` WRITE;
/*!40000 ALTER TABLE `student_medical_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_module_progress`
--

DROP TABLE IF EXISTS `student_module_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_module_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollment_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `status` enum('not_started','in_progress','completed') DEFAULT 'not_started',
  `start_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `attempts` int(11) DEFAULT 1,
  `max_attempts` int(11) DEFAULT 3,
  `time_spent_minutes` int(11) DEFAULT 0,
  `instructor_notes` text DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment_module` (`enrollment_id`,`module_id`),
  KEY `idx_enrollment` (`enrollment_id`),
  KEY `idx_module` (`module_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `student_module_progress_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `student_training_enrollments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_module_progress_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `training_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_module_progress`
--

LOCK TABLES `student_module_progress` WRITE;
/*!40000 ALTER TABLE `student_module_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_module_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_movements`
--

DROP TABLE IF EXISTS `student_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `movement_date` date NOT NULL,
  `entry_time` time DEFAULT NULL,
  `exit_time` time DEFAULT NULL,
  `movement_type` enum('arrival','departure','leave','return','late_arrival','early_departure') NOT NULL,
  `destination` varchar(200) DEFAULT NULL,
  `destination_type` enum('hospital','home','counseling','library','office','external','other') DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `authorized_by` int(11) DEFAULT NULL,
  `parent_contacted` tinyint(1) DEFAULT 0,
  `return_expected_time` time DEFAULT NULL,
  `actual_return_time` time DEFAULT NULL,
  `status` enum('pending','approved','in_progress','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `authorized_by` (`authorized_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_movement_date` (`movement_date`),
  KEY `idx_movement_type` (`movement_type`),
  KEY `idx_destination_type` (`destination_type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `student_movements_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_movements_ibfk_2` FOREIGN KEY (`authorized_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_movements`
--

LOCK TABLES `student_movements` WRITE;
/*!40000 ALTER TABLE `student_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_parent_links`
--

DROP TABLE IF EXISTS `student_parent_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_parent_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) NOT NULL,
  `parent_id` varchar(50) NOT NULL,
  `relationship_type` enum('father','mother','guardian','other') NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `is_emergency_contact` tinyint(1) DEFAULT 0,
  `emergency_priority` int(11) DEFAULT 1,
  `can_view_grades` tinyint(1) DEFAULT 1,
  `can_view_attendance` tinyint(1) DEFAULT 1,
  `can_view_discipline` tinyint(1) DEFAULT 1,
  `can_view_fees` tinyint(1) DEFAULT 1,
  `can_receive_notifications` tinyint(1) DEFAULT 1,
  `can_receive_sms` tinyint(1) DEFAULT 1,
  `can_receive_email` tinyint(1) DEFAULT 1,
  `can_receive_whatsapp` tinyint(1) DEFAULT 0,
  `link_status` enum('active','inactive','pending','revoked') DEFAULT 'pending',
  `linked_by` int(11) DEFAULT NULL,
  `linked_by_role` varchar(50) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `revocation_reason` text DEFAULT NULL,
  `revoked_by` int(11) DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_link` (`student_id`,`parent_id`,`relationship_type`),
  KEY `idx_student` (`student_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`link_status`),
  CONSTRAINT `student_parent_links_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `global_student_sheets` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `student_parent_links_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `parent_profiles` (`parent_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_parent_links`
--

LOCK TABLES `student_parent_links` WRITE;
/*!40000 ALTER TABLE `student_parent_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_parent_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_parents`
--

DROP TABLE IF EXISTS `student_parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_parents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `can_pickup` tinyint(1) DEFAULT 1,
  `financial_responsible` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `student_parents_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_parents`
--

LOCK TABLES `student_parents` WRITE;
/*!40000 ALTER TABLE `student_parents` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_payment_records`
--

DROP TABLE IF EXISTS `student_payment_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_payment_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sheet_id` int(11) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_type` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_method` enum('cash','bank','mobile','cheque','other') DEFAULT NULL,
  `receipt_number` varchar(100) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `term` varchar(50) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed','rejected','refunded') DEFAULT 'pending',
  `recorded_by` varchar(50) DEFAULT NULL,
  `recorded_by_name` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_payment_records`
--

LOCK TABLES `student_payment_records` WRITE;
/*!40000 ALTER TABLE `student_payment_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_payment_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_performance`
--

DROP TABLE IF EXISTS `student_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_performance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `total_assignments` int(11) DEFAULT 0,
  `completed_assignments` int(11) DEFAULT 0,
  `average_percentage` decimal(5,2) DEFAULT 0.00,
  `total_marks_obtained` decimal(10,2) DEFAULT 0.00,
  `total_marks_possible` decimal(10,2) DEFAULT 0.00,
  `rank_in_class` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_performance` (`student_id`,`class_id`,`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_performance`
--

LOCK TABLES `student_performance` WRITE;
/*!40000 ALTER TABLE `student_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_performance_summary`
--

DROP TABLE IF EXISTS `student_performance_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_performance_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `trade_class_id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `total_marks` decimal(10,2) DEFAULT 0.00,
  `average_percentage` decimal(5,2) DEFAULT 0.00,
  `rank` int(11) DEFAULT NULL,
  `attendance_percentage` decimal(5,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_performance` (`student_id`,`trade_class_id`,`academic_year_id`),
  KEY `trade_class_id` (`trade_class_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `student_performance_summary_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `student_performance_summary_ibfk_2` FOREIGN KEY (`trade_class_id`) REFERENCES `trade_classes` (`id`),
  CONSTRAINT `student_performance_summary_ibfk_3` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_performance_summary`
--

LOCK TABLES `student_performance_summary` WRITE;
/*!40000 ALTER TABLE `student_performance_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_performance_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_performance_tracking`
--

DROP TABLE IF EXISTS `student_performance_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_performance_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `tracking_date` date NOT NULL,
  `academic_score` decimal(5,2) DEFAULT NULL,
  `behavior_score` decimal(5,2) DEFAULT NULL,
  `attendance_rate` decimal(5,2) DEFAULT NULL,
  `participation_score` decimal(5,2) DEFAULT NULL,
  `overall_grade` varchar(5) DEFAULT NULL,
  `teacher_comments` text DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `areas_for_improvement` text DEFAULT NULL,
  `parent_viewed` tinyint(1) DEFAULT 0,
  `parent_viewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_tracking_date` (`tracking_date`),
  CONSTRAINT `student_performance_tracking_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_performance_tracking`
--

LOCK TABLES `student_performance_tracking` WRITE;
/*!40000 ALTER TABLE `student_performance_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_performance_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_points`
--

DROP TABLE IF EXISTS `student_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `points_type` enum('academic','participation','collaboration','bonus','penalty') NOT NULL,
  `points_value` int(11) NOT NULL,
  `source_type` varchar(50) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `awarded_by` int(11) DEFAULT NULL,
  `awarded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `awarded_by` (`awarded_by`),
  CONSTRAINT `student_points_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_points_ibfk_2` FOREIGN KEY (`awarded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_points`
--

LOCK TABLES `student_points` WRITE;
/*!40000 ALTER TABLE `student_points` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `interests` text DEFAULT NULL,
  `achievements_summary` text DEFAULT NULL,
  `learning_style` varchar(100) DEFAULT NULL,
  `preferred_subjects` text DEFAULT NULL,
  `career_goals` text DEFAULT NULL,
  `social_media_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_media_links`)),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `student_profiles_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_progress`
--

DROP TABLE IF EXISTS `student_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `total_lessons` int(11) DEFAULT 0,
  `completed_lessons` int(11) DEFAULT 0,
  `total_quizzes` int(11) DEFAULT 0,
  `completed_quizzes` int(11) DEFAULT 0,
  `average_quiz_score` decimal(5,2) DEFAULT NULL,
  `total_assignments` int(11) DEFAULT 0,
  `completed_assignments` int(11) DEFAULT 0,
  `average_assignment_score` decimal(5,2) DEFAULT NULL,
  `study_time_hours` decimal(10,2) DEFAULT 0.00,
  `last_activity_date` date DEFAULT NULL,
  `progress_percentage` decimal(5,2) DEFAULT NULL,
  `mastery_level` enum('beginner','developing','proficient','advanced','expert') DEFAULT 'beginner',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_progress` (`student_id`,`subject_id`),
  KEY `subject_id` (`subject_id`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `student_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_progress_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_progress`
--

LOCK TABLES `student_progress` WRITE;
/*!40000 ALTER TABLE `student_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_rankings`
--

DROP TABLE IF EXISTS `student_rankings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_rankings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `ranking_period` varchar(50) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `overall_rank` int(11) DEFAULT NULL,
  `class_rank` int(11) DEFAULT NULL,
  `subject_ranks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`subject_ranks`)),
  `total_points` decimal(10,2) DEFAULT NULL,
  `average_grade` decimal(5,2) DEFAULT NULL,
  `quiz_score` decimal(5,2) DEFAULT NULL,
  `assignment_score` decimal(5,2) DEFAULT NULL,
  `attendance_score` decimal(5,2) DEFAULT NULL,
  `behavior_score` decimal(5,2) DEFAULT NULL,
  `participation_score` decimal(5,2) DEFAULT NULL,
  `improvement_rate` decimal(5,2) DEFAULT NULL,
  `badges_earned` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`badges_earned`)),
  `achievements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`achievements`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ranking` (`student_id`,`ranking_period`,`period_start`),
  KEY `idx_overall_rank` (`overall_rank`),
  KEY `idx_period` (`period_start`,`period_end`),
  CONSTRAINT `student_rankings_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_rankings`
--

LOCK TABLES `student_rankings` WRITE;
/*!40000 ALTER TABLE `student_rankings` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_rankings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_removals`
--

DROP TABLE IF EXISTS `student_removals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_removals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `trade` varchar(50) DEFAULT NULL,
  `class_level` varchar(50) DEFAULT NULL,
  `removal_type` enum('expelled','withdrawn','transferred_out','graduated') NOT NULL,
  `removal_date` date NOT NULL,
  `reason` text NOT NULL,
  `removed_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `removed_by` (`removed_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `student_removals_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `student_removals_ibfk_2` FOREIGN KEY (`removed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `student_removals_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_removals`
--

LOCK TABLES `student_removals` WRITE;
/*!40000 ALTER TABLE `student_removals` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_removals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_serial_codes`
--

DROP TABLE IF EXISTS `student_serial_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_serial_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serial_code` varchar(50) NOT NULL,
  `trade_code` varchar(10) NOT NULL,
  `level_number` int(11) NOT NULL,
  `level_suffix` varchar(5) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `generated_by` int(11) NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_used` tinyint(1) DEFAULT 0,
  `used_by` int(11) DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `status` enum('active','used','expired','revoked') DEFAULT 'active',
  `expires_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_code` (`serial_code`),
  KEY `generated_by` (`generated_by`),
  KEY `used_by` (`used_by`),
  KEY `student_id` (`student_id`),
  KEY `idx_serial_code` (`serial_code`),
  KEY `idx_status` (`status`),
  KEY `idx_trade_level` (`trade_code`,`level_number`),
  CONSTRAINT `student_serial_codes_ibfk_2` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`),
  CONSTRAINT `student_serial_codes_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_serial_codes`
--

LOCK TABLES `student_serial_codes` WRITE;
/*!40000 ALTER TABLE `student_serial_codes` DISABLE KEYS */;
INSERT INTO `student_serial_codes` VALUES (2,'ICT1A-23E74AE6','ICT',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for ICT1A'),(3,'ICT1A-A090FDF0','ICT',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for ICT1A'),(4,'ICT1A-57D7A734','ICT',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for ICT1A'),(5,'ICT2B-71A2DDB9','ICT',2,'B','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for ICT2B'),(6,'ICT2B-D834CD68','ICT',2,'B','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for ICT2B'),(7,'ELE1A-06ED8A4D','ELE',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for ELE1A'),(8,'ELE1A-97415D7D','ELE',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for ELE1A'),(9,'PLU1A-D7BF1AA7','PLU',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for PLU1A'),(10,'PLU1A-843BFB53','PLU',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for PLU1A'),(11,'WEL1A-81BF0E41','WEL',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for WEL1A'),(12,'WEL1A-793297A6','WEL',1,'A','2025-2026',13,'2026-01-27 14:36:23',0,NULL,NULL,NULL,'active','2027-01-27 14:36:23','Demo serial code for WEL1A'),(13,'SOD4A-A66652ED','SOD',4,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for SOD4A'),(14,'SOD4A-6651D222','SOD',4,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for SOD4A'),(15,'SOD4A-C723F1B8','SOD',4,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for SOD4A'),(16,'SOD5A-E2E6E54D','SOD',5,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for SOD5A'),(17,'SOD5A-8EE381B7','SOD',5,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for SOD5A'),(18,'BDC4A-4DD4FA1F','BDC',4,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for BDC4A'),(19,'BDC4A-5734464D','BDC',4,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for BDC4A'),(20,'AUT4A-0F4ABC5B','AUT',4,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for AUT4A'),(21,'AUT4A-71524B1F','AUT',4,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for AUT4A'),(22,'ICT1A-C648231C','ICT',1,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for ICT1A'),(23,'ICT1A-611B2754','ICT',1,'A','2025-2026',13,'2026-01-27 15:00:51',0,NULL,NULL,NULL,'active','2027-01-27 15:00:51','Demo serial code for ICT1A'),(24,'SOD4A-DC53F4B6','SOD',4,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for SOD4A'),(25,'SOD4A-4DDC85FD','SOD',4,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for SOD4A'),(26,'SOD4A-792A4BEE','SOD',4,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for SOD4A'),(27,'SOD5A-077DB8B3','SOD',5,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for SOD5A'),(28,'SOD5A-8861F9E7','SOD',5,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for SOD5A'),(29,'BDC4A-7B3B4523','BDC',4,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for BDC4A'),(30,'BDC4A-F1F3DEF3','BDC',4,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for BDC4A'),(31,'AUT4A-F8D31A75','AUT',4,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for AUT4A'),(32,'AUT4A-715AA46B','AUT',4,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for AUT4A'),(33,'ICT1A-7E17E217','ICT',1,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for ICT1A'),(34,'ICT1A-14757918','ICT',1,'A','2025-2026',13,'2026-01-27 15:01:39',0,NULL,NULL,NULL,'active','2027-01-27 15:01:39','Demo serial code for ICT1A'),(35,'SOD4A-3D005E92','SOD',4,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for SOD4A'),(36,'SOD4A-5BC201CD','SOD',4,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for SOD4A'),(37,'SOD4A-C23A3D26','SOD',4,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for SOD4A'),(38,'SOD5A-F410F54E','SOD',5,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for SOD5A'),(39,'SOD5A-14389235','SOD',5,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for SOD5A'),(40,'BDC4A-33CC391E','BDC',4,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for BDC4A'),(41,'BDC4A-8F8EDD9D','BDC',4,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for BDC4A'),(42,'AUT4A-CD54F009','AUT',4,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for AUT4A'),(43,'AUT4A-7C954902','AUT',4,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for AUT4A'),(44,'ICT1A-EC62B9C7','ICT',1,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for ICT1A'),(45,'ICT1A-A2EC8E38','ICT',1,'A','2025-2026',13,'2026-01-27 15:02:19',0,NULL,NULL,NULL,'active','2027-01-27 15:02:19','Demo serial code for ICT1A'),(46,'SOD4A-01505B28','SOD',4,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for SOD4A'),(47,'SOD4A-92A1D5EC','SOD',4,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for SOD4A'),(48,'SOD4A-35F2EDFA','SOD',4,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for SOD4A'),(49,'SOD5A-3C9F7950','SOD',5,'A','2025-2026',13,'2026-01-27 15:02:43',1,28,'2026-01-27 15:02:43',NULL,'active','2027-01-27 15:02:43','Demo serial code for SOD5A'),(50,'SOD5A-4A52B01B','SOD',5,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for SOD5A'),(51,'BDC4A-9855BC50','BDC',4,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for BDC4A'),(52,'BDC4A-3F3DE86C','BDC',4,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for BDC4A'),(53,'AUT4A-D44B6227','AUT',4,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for AUT4A'),(54,'AUT4A-D44E1F48','AUT',4,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for AUT4A'),(55,'ICT1A-F7B00431','ICT',1,'A','2025-2026',13,'2026-01-27 15:02:43',1,27,'2026-01-27 15:02:43',NULL,'active','2027-01-27 15:02:43','Demo serial code for ICT1A'),(56,'ICT1A-B4036ADF','ICT',1,'A','2025-2026',13,'2026-01-27 15:02:43',0,NULL,NULL,NULL,'active','2027-01-27 15:02:43','Demo serial code for ICT1A');
/*!40000 ALTER TABLE `student_serial_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_session_attendance`
--

DROP TABLE IF EXISTS `student_session_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_session_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollment_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `attendance_status` enum('present','absent','late','excused') DEFAULT 'absent',
  `check_in_time` timestamp NULL DEFAULT NULL,
  `check_out_time` timestamp NULL DEFAULT NULL,
  `duration_attended` int(11) DEFAULT 0,
  `instructor_feedback` text DEFAULT NULL,
  `student_comments` text DEFAULT NULL,
  `marked_by` int(11) DEFAULT NULL,
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment_session` (`enrollment_id`,`session_id`),
  KEY `idx_enrollment` (`enrollment_id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_date` (`attendance_status`),
  CONSTRAINT `student_session_attendance_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `student_training_enrollments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_session_attendance_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `training_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_session_attendance`
--

LOCK TABLES `student_session_attendance` WRITE;
/*!40000 ALTER TABLE `student_session_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_session_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_sheet_access_log`
--

DROP TABLE IF EXISTS `student_sheet_access_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_sheet_access_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `accessed_by` int(11) NOT NULL,
  `accessed_by_name` varchar(200) DEFAULT NULL,
  `accessed_by_role` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `section_accessed` varchar(100) DEFAULT NULL,
  `changes_made` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes_made`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `accessed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_user` (`accessed_by`),
  KEY `idx_role` (`accessed_by_role`),
  KEY `idx_date` (`accessed_at`),
  KEY `sheet_id` (`sheet_id`),
  CONSTRAINT `student_sheet_access_log_ibfk_1` FOREIGN KEY (`sheet_id`) REFERENCES `global_student_sheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_sheet_access_log`
--

LOCK TABLES `student_sheet_access_log` WRITE;
/*!40000 ALTER TABLE `student_sheet_access_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_sheet_access_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_sheet_custom_columns`
--

DROP TABLE IF EXISTS `student_sheet_custom_columns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_sheet_custom_columns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `column_name` varchar(100) DEFAULT NULL,
  `column_label` varchar(200) DEFAULT NULL,
  `column_type` enum('text','number','date','boolean','select','textarea','file') DEFAULT NULL,
  `select_options` text DEFAULT NULL,
  `calculation_formula` text DEFAULT NULL,
  `created_by_role` varchar(50) DEFAULT NULL,
  `visible_to_roles` text DEFAULT NULL,
  `editable_by_roles` text DEFAULT NULL,
  `scope` enum('global','trade','level','class') DEFAULT 'global',
  `scope_value` varchar(100) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_required` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_custom_columns_name_type` (`column_name`,`column_type`)
) ENGINE=InnoDB AUTO_INCREMENT=241 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_sheet_custom_columns`
--

LOCK TABLES `student_sheet_custom_columns` WRITE;
/*!40000 ALTER TABLE `student_sheet_custom_columns` DISABLE KEYS */;
INSERT INTO `student_sheet_custom_columns` VALUES (1,'sports_participation','Sports Participation','select','[\"None\",\"Football\",\"Basketball\",\"Volleyball\",\"Athletics\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:49:18','2026-02-10 03:49:18'),(2,'leadership_role','Leadership Role','text',NULL,NULL,'dos','[\"teacher\",\"dos\",\"admin\"]','[\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:49:18','2026-02-10 03:49:18'),(3,'special_needs','Special Needs','textarea',NULL,NULL,'admin','[\"teacher\",\"dos\",\"admin\"]','[\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:49:18','2026-02-10 03:49:18'),(4,'parent_contact_frequency','Parent Contact Frequency','select','[\"Weekly\",\"Bi-weekly\",\"Monthly\",\"As needed\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:49:18','2026-02-10 03:49:18'),(5,'sports_participation','Sports Participation','select','[\"None\",\"Football\",\"Basketball\",\"Volleyball\",\"Athletics\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:49:31','2026-02-10 03:49:31'),(6,'leadership_role','Leadership Role','text',NULL,NULL,'dos','[\"teacher\",\"dos\",\"admin\"]','[\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:49:31','2026-02-10 03:49:31'),(7,'special_needs','Special Needs','textarea',NULL,NULL,'admin','[\"teacher\",\"dos\",\"admin\"]','[\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:49:31','2026-02-10 03:49:31'),(8,'parent_contact_frequency','Parent Contact Frequency','select','[\"Weekly\",\"Bi-weekly\",\"Monthly\",\"As needed\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:49:31','2026-02-10 03:49:31'),(9,'sports_participation','Sports Participation','select','[\"None\",\"Football\",\"Basketball\",\"Volleyball\",\"Athletics\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:53:50','2026-02-10 03:53:50'),(10,'leadership_role','Leadership Role','text',NULL,NULL,'dos','[\"teacher\",\"dos\",\"admin\"]','[\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:53:50','2026-02-10 03:53:50'),(11,'special_needs','Special Needs','textarea',NULL,NULL,'admin','[\"teacher\",\"dos\",\"admin\"]','[\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:53:50','2026-02-10 03:53:50'),(12,'parent_contact_frequency','Parent Contact Frequency','select','[\"Weekly\",\"Bi-weekly\",\"Monthly\",\"As needed\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 03:53:50','2026-02-10 03:53:50'),(13,'teacher_notes','Teacher Notes','textarea',NULL,NULL,'teacher','[\"teacher\",\"admin\"]','[\"teacher\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(14,'dos_notes','Dos Notes','textarea',NULL,NULL,'dos','[\"dos\",\"admin\"]','[\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(15,'admin_notes','Admin Notes','textarea',NULL,NULL,'admin','[\"admin\",\"admin\"]','[\"admin\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(16,'principal_notes','Principal Notes','textarea',NULL,NULL,'principal','[\"principal\",\"admin\"]','[\"principal\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(17,'accountant_notes','Accountant Notes','textarea',NULL,NULL,'accountant','[\"accountant\",\"admin\"]','[\"accountant\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(18,'sports_participation','Sports Participation','select','[\"None\",\"Football\",\"Basketball\",\"Volleyball\",\"Athletics\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(19,'leadership_role','Leadership Role','text',NULL,NULL,'dos','[\"teacher\",\"dos\",\"admin\"]','[\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(20,'special_needs','Special Needs','textarea',NULL,NULL,'admin','[\"teacher\",\"dos\",\"admin\"]','[\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(21,'parent_contact_frequency','Parent Contact Frequency','select','[\"Weekly\",\"Bi-weekly\",\"Monthly\",\"As needed\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:02','2026-02-10 04:00:02'),(22,'teacher_notes','Teacher Notes','textarea',NULL,NULL,'teacher','[\"teacher\",\"admin\"]','[\"teacher\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(23,'dos_notes','Dos Notes','textarea',NULL,NULL,'dos','[\"dos\",\"admin\"]','[\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(24,'admin_notes','Admin Notes','textarea',NULL,NULL,'admin','[\"admin\",\"admin\"]','[\"admin\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(25,'principal_notes','Principal Notes','textarea',NULL,NULL,'principal','[\"principal\",\"admin\"]','[\"principal\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(26,'accountant_notes','Accountant Notes','textarea',NULL,NULL,'accountant','[\"accountant\",\"admin\"]','[\"accountant\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(27,'sports_participation','Sports Participation','select','[\"None\",\"Football\",\"Basketball\",\"Volleyball\",\"Athletics\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(28,'leadership_role','Leadership Role','text',NULL,NULL,'dos','[\"teacher\",\"dos\",\"admin\"]','[\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(29,'special_needs','Special Needs','textarea',NULL,NULL,'admin','[\"teacher\",\"dos\",\"admin\"]','[\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(30,'parent_contact_frequency','Parent Contact Frequency','select','[\"Weekly\",\"Bi-weekly\",\"Monthly\",\"As needed\"]',NULL,'teacher','[\"teacher\",\"dos\",\"admin\"]','[\"teacher\",\"dos\",\"admin\"]','global',NULL,0,0,1,NULL,'2026-02-10 04:00:31','2026-02-10 04:00:31'),(31,'paid_amount','Paid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,1,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(32,'unpaid_amount','Unpaid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,2,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(33,'remaining_balance','Remaining Balance','',NULL,'total_fees - paid_amount','accountant','[\"accountant\", \"admin\", \"headmaster\"]','[]','global',NULL,3,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(34,'payment_status','Payment Status','select','[\"Paid\", \"Partial\", \"Unpaid\", \"Overdue\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,4,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(35,'payment_date','Last Payment Date','date',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,5,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(36,'fee_category','Fee Category','select','[\"Tuition\", \"Exam\", \"Uniform\", \"Transport\", \"Hostel\", \"Cafeteria\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,6,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(37,'payment_method','Payment Method','select','[\"Cash\", \"Bank Transfer\", \"Mobile Money\", \"Cheque\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,7,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(38,'discount_applied','Discount Applied','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,8,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(39,'quiz_marks','Quiz Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,10,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(40,'midterm_marks','Midterm Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,11,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(41,'final_marks','Final Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,12,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(42,'total_marks','Total Marks','',NULL,'quiz_marks + midterm_marks + final_marks','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,13,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(43,'percentage','Percentage','',NULL,'(total_marks / 100) * 100','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,14,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(44,'grade','Grade','',NULL,'CASE WHEN percentage >= 90 THEN \"A\" WHEN percentage >= 80 THEN \"B\" WHEN percentage >= 70 THEN \"C\" WHEN percentage >= 60 THEN \"D\" ELSE \"F\" END','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,15,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(45,'subject_name','Subject Name','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,16,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(46,'course_code','Course Code','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,17,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(47,'assignment_marks','Assignment Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,18,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(48,'participation_score','Participation Score','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,19,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(49,'academic_performance','Academic Performance','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,20,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(50,'class_rank','Class Rank','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,21,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(51,'gpa','GPA','',NULL,'percentage / 20','dos','[\"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,22,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(52,'study_plan','Study Plan','textarea',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,23,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(53,'academic_status','Academic Status','select','[\"Excellent\", \"Good\", \"Average\", \"Poor\", \"At Risk\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,24,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(54,'remedial_needed','Remedial Needed','boolean',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,25,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(55,'promotion_status','Promotion Status','select','[\"Promoted\", \"Repeat\", \"Conditional\", \"Pending\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,26,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(56,'behavior_score','Behavior Score','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,30,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(57,'discipline_incidents','Discipline Incidents','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,31,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(58,'conduct_grade','Conduct Grade','select','[\"A\", \"B\", \"C\", \"D\", \"F\"]',NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,32,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(59,'counseling_sessions','Counseling Sessions','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,33,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(60,'parent_meetings','Parent Meetings','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,34,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(61,'suspension_days','Suspension Days','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,35,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(62,'behavior_improvement_plan','Behavior Improvement Plan','textarea',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,36,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(63,'overall_rating','Overall Rating','',NULL,'(academic_performance + conduct_score + attendance_percentage) / 3','headmaster','[\"headmaster\", \"admin\"]','[]','global',NULL,40,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(64,'recommendation','Principal Recommendation','textarea',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,41,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(65,'awards','Awards & Recognition','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,42,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(66,'leadership_potential','Leadership Potential','select','[\"High\", \"Medium\", \"Low\", \"Not Assessed\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,43,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(67,'special_programs','Special Programs','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,44,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(68,'graduation_readiness','Graduation Readiness','select','[\"Ready\", \"Needs Improvement\", \"At Risk\", \"Not Ready\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,45,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(69,'system_notes','System Notes','textarea',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,50,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(70,'data_quality_score','Data Quality Score','number',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,51,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(71,'last_updated_by','Last Updated By','text',NULL,NULL,'admin','[\"admin\"]','[]','global',NULL,52,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(72,'verification_status','Verification Status','select','[\"Verified\", \"Pending\", \"Needs Review\", \"Rejected\"]',NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,53,0,1,NULL,'2026-02-10 04:12:35','2026-02-10 04:12:35'),(73,'paid_amount','Paid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,1,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(74,'unpaid_amount','Unpaid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,2,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(75,'remaining_balance','Remaining Balance','',NULL,'total_fees - paid_amount','accountant','[\"accountant\", \"admin\", \"headmaster\"]','[]','global',NULL,3,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(76,'payment_status','Payment Status','select','[\"Paid\", \"Partial\", \"Unpaid\", \"Overdue\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,4,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(77,'payment_date','Last Payment Date','date',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,5,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(78,'fee_category','Fee Category','select','[\"Tuition\", \"Exam\", \"Uniform\", \"Transport\", \"Hostel\", \"Cafeteria\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,6,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(79,'payment_method','Payment Method','select','[\"Cash\", \"Bank Transfer\", \"Mobile Money\", \"Cheque\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,7,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(80,'discount_applied','Discount Applied','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,8,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(81,'quiz_marks','Quiz Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,10,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(82,'midterm_marks','Midterm Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,11,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(83,'final_marks','Final Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,12,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(84,'total_marks','Total Marks','',NULL,'quiz_marks + midterm_marks + final_marks','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,13,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(85,'percentage','Percentage','',NULL,'(total_marks / 100) * 100','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,14,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(86,'grade','Grade','',NULL,'CASE WHEN percentage >= 90 THEN \"A\" WHEN percentage >= 80 THEN \"B\" WHEN percentage >= 70 THEN \"C\" WHEN percentage >= 60 THEN \"D\" ELSE \"F\" END','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,15,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(87,'subject_name','Subject Name','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,16,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(88,'course_code','Course Code','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,17,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(89,'assignment_marks','Assignment Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,18,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(90,'participation_score','Participation Score','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,19,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(91,'academic_performance','Academic Performance','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,20,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(92,'class_rank','Class Rank','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,21,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(93,'gpa','GPA','',NULL,'percentage / 20','dos','[\"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,22,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(94,'study_plan','Study Plan','textarea',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,23,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(95,'academic_status','Academic Status','select','[\"Excellent\", \"Good\", \"Average\", \"Poor\", \"At Risk\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,24,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(96,'remedial_needed','Remedial Needed','boolean',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,25,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(97,'promotion_status','Promotion Status','select','[\"Promoted\", \"Repeat\", \"Conditional\", \"Pending\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,26,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(98,'behavior_score','Behavior Score','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,30,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(99,'discipline_incidents','Discipline Incidents','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,31,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(100,'conduct_grade','Conduct Grade','select','[\"A\", \"B\", \"C\", \"D\", \"F\"]',NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,32,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(101,'counseling_sessions','Counseling Sessions','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,33,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(102,'parent_meetings','Parent Meetings','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,34,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(103,'suspension_days','Suspension Days','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,35,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(104,'behavior_improvement_plan','Behavior Improvement Plan','textarea',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,36,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(105,'overall_rating','Overall Rating','',NULL,'(academic_performance + conduct_score + attendance_percentage) / 3','headmaster','[\"headmaster\", \"admin\"]','[]','global',NULL,40,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(106,'recommendation','Principal Recommendation','textarea',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,41,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(107,'awards','Awards & Recognition','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,42,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(108,'leadership_potential','Leadership Potential','select','[\"High\", \"Medium\", \"Low\", \"Not Assessed\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,43,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(109,'special_programs','Special Programs','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,44,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(110,'graduation_readiness','Graduation Readiness','select','[\"Ready\", \"Needs Improvement\", \"At Risk\", \"Not Ready\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,45,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(111,'system_notes','System Notes','textarea',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,50,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(112,'data_quality_score','Data Quality Score','number',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,51,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(113,'last_updated_by','Last Updated By','text',NULL,NULL,'admin','[\"admin\"]','[]','global',NULL,52,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(114,'verification_status','Verification Status','select','[\"Verified\", \"Pending\", \"Needs Review\", \"Rejected\"]',NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,53,0,1,NULL,'2026-02-10 04:13:29','2026-02-10 04:13:29'),(115,'paid_amount','Paid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,1,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(116,'unpaid_amount','Unpaid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,2,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(117,'remaining_balance','Remaining Balance','',NULL,'total_fees - paid_amount','accountant','[\"accountant\", \"admin\", \"headmaster\"]','[]','global',NULL,3,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(118,'payment_status','Payment Status','select','[\"Paid\", \"Partial\", \"Unpaid\", \"Overdue\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,4,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(119,'payment_date','Last Payment Date','date',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,5,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(120,'fee_category','Fee Category','select','[\"Tuition\", \"Exam\", \"Uniform\", \"Transport\", \"Hostel\", \"Cafeteria\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,6,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(121,'payment_method','Payment Method','select','[\"Cash\", \"Bank Transfer\", \"Mobile Money\", \"Cheque\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,7,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(122,'discount_applied','Discount Applied','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,8,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(123,'quiz_marks','Quiz Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,10,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(124,'midterm_marks','Midterm Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,11,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(125,'final_marks','Final Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,12,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(126,'total_marks','Total Marks','',NULL,'quiz_marks + midterm_marks + final_marks','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,13,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(127,'percentage','Percentage','',NULL,'(total_marks / 100) * 100','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,14,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(128,'grade','Grade','',NULL,'CASE WHEN percentage >= 90 THEN \"A\" WHEN percentage >= 80 THEN \"B\" WHEN percentage >= 70 THEN \"C\" WHEN percentage >= 60 THEN \"D\" ELSE \"F\" END','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,15,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(129,'subject_name','Subject Name','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,16,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(130,'course_code','Course Code','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,17,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(131,'assignment_marks','Assignment Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,18,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(132,'participation_score','Participation Score','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,19,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(133,'academic_performance','Academic Performance','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,20,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(134,'class_rank','Class Rank','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,21,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(135,'gpa','GPA','',NULL,'percentage / 20','dos','[\"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,22,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(136,'study_plan','Study Plan','textarea',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,23,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(137,'academic_status','Academic Status','select','[\"Excellent\", \"Good\", \"Average\", \"Poor\", \"At Risk\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,24,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(138,'remedial_needed','Remedial Needed','boolean',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,25,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(139,'promotion_status','Promotion Status','select','[\"Promoted\", \"Repeat\", \"Conditional\", \"Pending\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,26,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(140,'behavior_score','Behavior Score','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,30,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(141,'discipline_incidents','Discipline Incidents','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,31,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(142,'conduct_grade','Conduct Grade','select','[\"A\", \"B\", \"C\", \"D\", \"F\"]',NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,32,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(143,'counseling_sessions','Counseling Sessions','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,33,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(144,'parent_meetings','Parent Meetings','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,34,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(145,'suspension_days','Suspension Days','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,35,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(146,'behavior_improvement_plan','Behavior Improvement Plan','textarea',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,36,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(147,'overall_rating','Overall Rating','',NULL,'(academic_performance + conduct_score + attendance_percentage) / 3','headmaster','[\"headmaster\", \"admin\"]','[]','global',NULL,40,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(148,'recommendation','Principal Recommendation','textarea',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,41,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(149,'awards','Awards & Recognition','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,42,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(150,'leadership_potential','Leadership Potential','select','[\"High\", \"Medium\", \"Low\", \"Not Assessed\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,43,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(151,'special_programs','Special Programs','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,44,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(152,'graduation_readiness','Graduation Readiness','select','[\"Ready\", \"Needs Improvement\", \"At Risk\", \"Not Ready\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,45,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(153,'system_notes','System Notes','textarea',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,50,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(154,'data_quality_score','Data Quality Score','number',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,51,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(155,'last_updated_by','Last Updated By','text',NULL,NULL,'admin','[\"admin\"]','[]','global',NULL,52,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(156,'verification_status','Verification Status','select','[\"Verified\", \"Pending\", \"Needs Review\", \"Rejected\"]',NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,53,0,1,NULL,'2026-02-10 04:15:04','2026-02-10 04:15:04'),(157,'paid_amount','Paid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,1,0,1,NULL,'2026-02-10 04:25:17','2026-02-10 04:25:17'),(158,'unpaid_amount','Unpaid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,2,0,1,NULL,'2026-02-10 04:25:17','2026-02-10 04:25:17'),(159,'remaining_balance','Remaining Balance','',NULL,'total_fees - paid_amount','accountant','[\"accountant\", \"admin\", \"headmaster\"]','[]','global',NULL,3,0,1,NULL,'2026-02-10 04:25:17','2026-02-10 04:25:18'),(160,'payment_status','Payment Status','select','[\"Paid\", \"Partial\", \"Unpaid\", \"Overdue\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,4,0,1,NULL,'2026-02-10 04:25:17','2026-02-10 04:25:17'),(161,'payment_date','Last Payment Date','date',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,5,0,1,NULL,'2026-02-10 04:25:17','2026-02-10 04:25:17'),(162,'fee_category','Fee Category','select','[\"Tuition\", \"Exam\", \"Uniform\", \"Transport\", \"Hostel\", \"Cafeteria\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,6,0,1,NULL,'2026-02-10 04:25:17','2026-02-10 04:25:17'),(163,'payment_method','Payment Method','select','[\"Cash\", \"Bank Transfer\", \"Mobile Money\", \"Cheque\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,7,0,1,NULL,'2026-02-10 04:25:17','2026-02-10 04:25:17'),(164,'discount_applied','Discount Applied','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,8,0,1,NULL,'2026-02-10 04:25:17','2026-02-10 04:25:17'),(165,'quiz_marks','Quiz Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,10,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(166,'midterm_marks','Midterm Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,11,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(167,'final_marks','Final Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,12,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(168,'total_marks','Total Marks','',NULL,'quiz_marks + midterm_marks + final_marks','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,13,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(169,'percentage','Percentage','',NULL,'(total_marks / 100) * 100','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,14,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(170,'grade','Grade','',NULL,'CASE WHEN percentage >= 90 THEN \"A\" WHEN percentage >= 80 THEN \"B\" WHEN percentage >= 70 THEN \"C\" WHEN percentage >= 60 THEN \"D\" ELSE \"F\" END','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,15,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(171,'subject_name','Subject Name','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,16,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(172,'course_code','Course Code','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,17,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(173,'assignment_marks','Assignment Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,18,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(174,'participation_score','Participation Score','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,19,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(175,'academic_performance','Academic Performance','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,20,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(176,'class_rank','Class Rank','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,21,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(177,'gpa','GPA','',NULL,'percentage / 20','dos','[\"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,22,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(178,'study_plan','Study Plan','textarea',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,23,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(179,'academic_status','Academic Status','select','[\"Excellent\", \"Good\", \"Average\", \"Poor\", \"At Risk\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,24,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(180,'remedial_needed','Remedial Needed','boolean',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,25,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(181,'promotion_status','Promotion Status','select','[\"Promoted\", \"Repeat\", \"Conditional\", \"Pending\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,26,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(182,'behavior_score','Behavior Score','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,30,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(183,'discipline_incidents','Discipline Incidents','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,31,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(184,'conduct_grade','Conduct Grade','select','[\"A\", \"B\", \"C\", \"D\", \"F\"]',NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,32,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(185,'counseling_sessions','Counseling Sessions','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,33,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(186,'parent_meetings','Parent Meetings','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,34,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(187,'suspension_days','Suspension Days','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,35,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(188,'behavior_improvement_plan','Behavior Improvement Plan','textarea',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,36,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(189,'overall_rating','Overall Rating','',NULL,'(academic_performance + conduct_score + attendance_percentage) / 3','headmaster','[\"headmaster\", \"admin\"]','[]','global',NULL,40,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(190,'recommendation','Principal Recommendation','textarea',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,41,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(191,'awards','Awards & Recognition','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,42,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(192,'leadership_potential','Leadership Potential','select','[\"High\", \"Medium\", \"Low\", \"Not Assessed\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,43,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(193,'special_programs','Special Programs','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,44,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(194,'graduation_readiness','Graduation Readiness','select','[\"Ready\", \"Needs Improvement\", \"At Risk\", \"Not Ready\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,45,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(195,'system_notes','System Notes','textarea',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,50,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(196,'data_quality_score','Data Quality Score','number',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,51,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(197,'last_updated_by','Last Updated By','text',NULL,NULL,'admin','[\"admin\"]','[]','global',NULL,52,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(198,'verification_status','Verification Status','select','[\"Verified\", \"Pending\", \"Needs Review\", \"Rejected\"]',NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,53,0,1,NULL,'2026-02-10 04:25:18','2026-02-10 04:25:18'),(199,'paid_amount','Paid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,1,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(200,'unpaid_amount','Unpaid Amount','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,2,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(201,'remaining_balance','Remaining Balance','',NULL,'total_fees - paid_amount','accountant','[\"accountant\", \"admin\", \"headmaster\"]','[]','global',NULL,3,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(202,'payment_status','Payment Status','select','[\"Paid\", \"Partial\", \"Unpaid\", \"Overdue\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,4,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(203,'payment_date','Last Payment Date','date',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,5,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(204,'fee_category','Fee Category','select','[\"Tuition\", \"Exam\", \"Uniform\", \"Transport\", \"Hostel\", \"Cafeteria\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,6,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(205,'payment_method','Payment Method','select','[\"Cash\", \"Bank Transfer\", \"Mobile Money\", \"Cheque\", \"Other\"]',NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,7,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(206,'discount_applied','Discount Applied','number',NULL,NULL,'accountant','[\"accountant\", \"admin\", \"headmaster\"]','[\"accountant\", \"admin\"]','global',NULL,8,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(207,'quiz_marks','Quiz Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,10,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(208,'midterm_marks','Midterm Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,11,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(209,'final_marks','Final Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,12,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(210,'total_marks','Total Marks','',NULL,'quiz_marks + midterm_marks + final_marks','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,13,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(211,'percentage','Percentage','',NULL,'(total_marks / 100) * 100','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,14,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(212,'grade','Grade','',NULL,'CASE WHEN percentage >= 90 THEN \"A\" WHEN percentage >= 80 THEN \"B\" WHEN percentage >= 70 THEN \"C\" WHEN percentage >= 60 THEN \"D\" ELSE \"F\" END','teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,15,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(213,'subject_name','Subject Name','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,16,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(214,'course_code','Course Code','text',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,17,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(215,'assignment_marks','Assignment Marks','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,18,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(216,'participation_score','Participation Score','number',NULL,NULL,'teacher','[\"teacher\", \"dos\", \"admin\", \"headmaster\"]','[\"teacher\", \"dos\", \"admin\"]','global',NULL,19,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(217,'academic_performance','Academic Performance','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,20,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(218,'class_rank','Class Rank','number',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,21,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(219,'gpa','GPA','',NULL,'percentage / 20','dos','[\"dos\", \"admin\", \"headmaster\"]','[]','global',NULL,22,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(220,'study_plan','Study Plan','textarea',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,23,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(221,'academic_status','Academic Status','select','[\"Excellent\", \"Good\", \"Average\", \"Poor\", \"At Risk\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,24,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(222,'remedial_needed','Remedial Needed','boolean',NULL,NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,25,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(223,'promotion_status','Promotion Status','select','[\"Promoted\", \"Repeat\", \"Conditional\", \"Pending\"]',NULL,'dos','[\"dos\", \"admin\", \"headmaster\"]','[\"dos\", \"admin\"]','global',NULL,26,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(224,'behavior_score','Behavior Score','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,30,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(225,'discipline_incidents','Discipline Incidents','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,31,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(226,'conduct_grade','Conduct Grade','select','[\"A\", \"B\", \"C\", \"D\", \"F\"]',NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,32,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(227,'counseling_sessions','Counseling Sessions','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,33,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(228,'parent_meetings','Parent Meetings','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,34,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(229,'suspension_days','Suspension Days','number',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,35,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(230,'behavior_improvement_plan','Behavior Improvement Plan','textarea',NULL,NULL,'dod','[\"dod\", \"admin\", \"headmaster\"]','[\"dod\", \"admin\"]','global',NULL,36,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(231,'overall_rating','Overall Rating','',NULL,'(academic_performance + conduct_score + attendance_percentage) / 3','headmaster','[\"headmaster\", \"admin\"]','[]','global',NULL,40,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(232,'recommendation','Principal Recommendation','textarea',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,41,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(233,'awards','Awards & Recognition','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,42,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(234,'leadership_potential','Leadership Potential','select','[\"High\", \"Medium\", \"Low\", \"Not Assessed\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,43,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(235,'special_programs','Special Programs','text',NULL,NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,44,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(236,'graduation_readiness','Graduation Readiness','select','[\"Ready\", \"Needs Improvement\", \"At Risk\", \"Not Ready\"]',NULL,'headmaster','[\"headmaster\", \"admin\"]','[\"headmaster\", \"admin\"]','global',NULL,45,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(237,'system_notes','System Notes','textarea',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,50,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(238,'data_quality_score','Data Quality Score','number',NULL,NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,51,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(239,'last_updated_by','Last Updated By','text',NULL,NULL,'admin','[\"admin\"]','[]','global',NULL,52,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52'),(240,'verification_status','Verification Status','select','[\"Verified\", \"Pending\", \"Needs Review\", \"Rejected\"]',NULL,'admin','[\"admin\"]','[\"admin\"]','global',NULL,53,0,1,NULL,'2026-02-10 04:25:52','2026-02-10 04:25:52');
/*!40000 ALTER TABLE `student_sheet_custom_columns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_sheet_custom_values`
--

DROP TABLE IF EXISTS `student_sheet_custom_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_sheet_custom_values` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sheet_id` int(11) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `column_id` int(11) DEFAULT NULL,
  `value_text` text DEFAULT NULL,
  `value_number` decimal(15,4) DEFAULT NULL,
  `value_date` date DEFAULT NULL,
  `value_boolean` tinyint(1) DEFAULT 0,
  `updated_by` varchar(50) DEFAULT NULL,
  `updated_by_role` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_value` (`student_id`,`column_id`),
  KEY `idx_custom_values_sheet_column` (`sheet_id`,`column_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_sheet_custom_values`
--

LOCK TABLES `student_sheet_custom_values` WRITE;
/*!40000 ALTER TABLE `student_sheet_custom_values` DISABLE KEYS */;
INSERT INTO `student_sheet_custom_values` VALUES (1,5,'1',39,NULL,85.0000,NULL,0,NULL,'system','2026-02-10 04:25:18','2026-02-10 04:25:52');
/*!40000 ALTER TABLE `student_sheet_custom_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_sheets`
--

DROP TABLE IF EXISTS `student_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `trade` varchar(50) DEFAULT NULL,
  `level` varchar(10) DEFAULT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `academic_year` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `student_sheets_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_sheets_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_sheets`
--

LOCK TABLES `student_sheets` WRITE;
/*!40000 ALTER TABLE `student_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_subject_performance`
--

DROP TABLE IF EXISTS `student_subject_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_subject_performance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `term` varchar(20) NOT NULL,
  `quiz_marks` decimal(5,2) DEFAULT 0.00,
  `quiz_max` decimal(5,2) DEFAULT 20.00,
  `midterm_marks` decimal(5,2) DEFAULT 0.00,
  `midterm_max` decimal(5,2) DEFAULT 30.00,
  `final_marks` decimal(5,2) DEFAULT 0.00,
  `final_max` decimal(5,2) DEFAULT 50.00,
  `total_marks` decimal(5,2) DEFAULT 0.00,
  `total_max` decimal(5,2) DEFAULT 100.00,
  `percentage` decimal(5,2) DEFAULT 0.00,
  `grade` varchar(5) DEFAULT NULL,
  `grade_points` decimal(3,2) DEFAULT 0.00,
  `subject_position` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_subject_term` (`student_id`,`subject`,`term`),
  KEY `student_sheet_id` (`student_sheet_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `student_subject_performance_ibfk_1` FOREIGN KEY (`student_sheet_id`) REFERENCES `student_comprehensive_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_subject_performance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_subject_performance_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_subject_performance`
--

LOCK TABLES `student_subject_performance` WRITE;
/*!40000 ALTER TABLE `student_subject_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_subject_performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_term_reports`
--

DROP TABLE IF EXISTS `student_term_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_term_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_sheet_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `term` varchar(20) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `total_subjects` int(11) DEFAULT 0,
  `total_marks` decimal(10,2) DEFAULT 0.00,
  `average_marks` decimal(5,2) DEFAULT 0.00,
  `gpa` decimal(3,2) DEFAULT 0.00,
  `overall_grade` varchar(5) DEFAULT NULL,
  `class_position` int(11) DEFAULT NULL,
  `attendance_rate` decimal(5,2) DEFAULT 0.00,
  `days_present` int(11) DEFAULT 0,
  `days_absent` int(11) DEFAULT 0,
  `conduct_score` int(11) DEFAULT 100,
  `conduct_grade` varchar(5) DEFAULT 'A',
  `total_incidents` int(11) DEFAULT 0,
  `class_teacher_remarks` text DEFAULT NULL,
  `dos_remarks` text DEFAULT NULL,
  `head_master_remarks` text DEFAULT NULL,
  `report_generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_term_report` (`student_id`,`term`,`academic_year`),
  KEY `student_sheet_id` (`student_sheet_id`),
  CONSTRAINT `student_term_reports_ibfk_1` FOREIGN KEY (`student_sheet_id`) REFERENCES `student_comprehensive_sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_term_reports_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_term_reports`
--

LOCK TABLES `student_term_reports` WRITE;
/*!40000 ALTER TABLE `student_term_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_term_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_training_enrollments`
--

DROP TABLE IF EXISTS `student_training_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_training_enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) NOT NULL,
  `program_id` int(11) NOT NULL,
  `enrollment_date` date NOT NULL,
  `expected_completion_date` date DEFAULT NULL,
  `actual_completion_date` date DEFAULT NULL,
  `status` enum('enrolled','in_progress','completed','dropped','suspended') DEFAULT 'enrolled',
  `progress_percentage` decimal(5,2) DEFAULT 0.00,
  `overall_grade` decimal(5,2) DEFAULT NULL,
  `certificate_issued` tinyint(1) DEFAULT 0,
  `certificate_number` varchar(50) DEFAULT NULL,
  `enrolled_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`student_id`,`program_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_program` (`program_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `student_training_enrollments_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `student_training_programs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_training_enrollments`
--

LOCK TABLES `student_training_enrollments` WRITE;
/*!40000 ALTER TABLE `student_training_enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_training_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_training_programs`
--

DROP TABLE IF EXISTS `student_training_programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_training_programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_code` varchar(50) NOT NULL,
  `program_name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `trade_code` varchar(50) DEFAULT NULL,
  `level_number` int(11) DEFAULT 1,
  `duration_weeks` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('draft','active','completed','archived') DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `program_code` (`program_code`),
  KEY `idx_program_code` (`program_code`),
  KEY `idx_trade` (`trade_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_training_programs`
--

LOCK TABLES `student_training_programs` WRITE;
/*!40000 ALTER TABLE `student_training_programs` DISABLE KEYS */;
INSERT INTO `student_training_programs` VALUES (1,'TRN-CARP-001','Carpentry Fundamentals','Core carpentry skills and safety training','carpentry',1,12,NULL,NULL,'active',NULL,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(2,'TRN-ELEC-001','Electrical Installation Basics','Basic electrical installation and wiring','electricity',1,16,NULL,NULL,'active',NULL,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(3,'TRN-MASON-001','Masonry and Concrete Work','Foundation masonry and concrete techniques','masonry',1,14,NULL,NULL,'active',NULL,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(4,'TRN-PLUMB-001','Plumbing Systems','Residential and commercial plumbing','plumbing',1,12,NULL,NULL,'active',NULL,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(5,'TRN-WELD-001','Welding Technology','Arc welding and metal fabrication','welding',1,18,NULL,NULL,'active',NULL,'2026-02-10 14:04:15','2026-02-10 14:04:15');
/*!40000 ALTER TABLE `student_training_programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_transfers`
--

DROP TABLE IF EXISTS `student_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_transfers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `from_class_id` int(11) NOT NULL,
  `to_class_id` int(11) NOT NULL,
  `transfer_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `from_class_id` (`from_class_id`),
  KEY `to_class_id` (`to_class_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `student_transfers_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_transfers_ibfk_2` FOREIGN KEY (`from_class_id`) REFERENCES `class_structure` (`id`),
  CONSTRAINT `student_transfers_ibfk_3` FOREIGN KEY (`to_class_id`) REFERENCES `class_structure` (`id`),
  CONSTRAINT `student_transfers_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_transfers`
--

LOCK TABLES `student_transfers` WRITE;
/*!40000 ALTER TABLE `student_transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_wellbeing_assessments`
--

DROP TABLE IF EXISTS `student_wellbeing_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_wellbeing_assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_sheet_id` int(11) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `counselor_id` int(11) NOT NULL,
  `assessment_type` varchar(100) DEFAULT NULL,
  `stress_level` int(11) DEFAULT NULL CHECK (`stress_level` between 1 and 10),
  `anxiety_level` int(11) DEFAULT NULL CHECK (`anxiety_level` between 1 and 10),
  `depression_indicators` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `recommended_actions` text DEFAULT NULL,
  `assessment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_sheet_id` (`student_sheet_id`),
  KEY `idx_assessment_date` (`assessment_date`),
  KEY `idx_student_code` (`student_code`),
  CONSTRAINT `student_wellbeing_assessments_ibfk_1` FOREIGN KEY (`student_sheet_id`) REFERENCES `global_student_sheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_wellbeing_assessments`
--

LOCK TABLES `student_wellbeing_assessments` WRITE;
/*!40000 ALTER TABLE `student_wellbeing_assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_wellbeing_assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_wellness_tracking`
--

DROP TABLE IF EXISTS `student_wellness_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_wellness_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `tracked_by` int(11) NOT NULL,
  `tracking_date` date NOT NULL,
  `mood_rating` int(11) DEFAULT 5,
  `stress_level` enum('low','moderate','high','severe') DEFAULT 'moderate',
  `sleep_quality` enum('poor','fair','good','excellent') DEFAULT 'fair',
  `social_interaction` enum('isolated','limited','normal','active') DEFAULT 'normal',
  `academic_stress` tinyint(1) DEFAULT 0,
  `personal_issues` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tracked_by` (`tracked_by`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_tracking_date` (`tracking_date`),
  CONSTRAINT `student_wellness_tracking_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_wellness_tracking_ibfk_2` FOREIGN KEY (`tracked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_wellness_tracking`
--

LOCK TABLES `student_wellness_tracking` WRITE;
/*!40000 ALTER TABLE `student_wellness_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_wellness_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `admission_date` date DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_class_id` (`class_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_group_members`
--

DROP TABLE IF EXISTS `study_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `study_group_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('admin','moderator','member') DEFAULT 'member',
  `contribution_score` decimal(5,2) DEFAULT 0.00,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_membership` (`group_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `study_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `study_group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_group_members`
--

LOCK TABLES `study_group_members` WRITE;
/*!40000 ALTER TABLE `study_group_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `study_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_groups`
--

DROP TABLE IF EXISTS `study_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `study_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `creator_id` int(11) NOT NULL,
  `group_type` enum('public','private','invite_only') DEFAULT 'public',
  `max_members` int(11) DEFAULT 20,
  `current_members` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `study_groups_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `study_groups_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_groups`
--

LOCK TABLES `study_groups` WRITE;
/*!40000 ALTER TABLE `study_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `study_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_links`
--

DROP TABLE IF EXISTS `study_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `study_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category` varchar(50) DEFAULT 'general',
  `is_featured` tinyint(1) DEFAULT 0,
  `tags` text DEFAULT NULL,
  `click_count` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_study_links_category` (`category`),
  KEY `idx_study_links_featured` (`is_featured`),
  KEY `idx_study_links_teacher` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_links`
--

LOCK TABLES `study_links` WRITE;
/*!40000 ALTER TABLE `study_links` DISABLE KEYS */;
INSERT INTO `study_links` VALUES (1,2,1,1,'Mathematics Basics','https://khanacademy.org/math','Essential math concepts','2026-01-26 16:38:08','general',0,NULL,0,'2026-01-26 17:31:08'),(2,2,1,2,'Physics Principles','https://physics.org/basics','Introductory physics links','2026-01-26 16:38:08','general',0,NULL,0,'2026-01-26 17:31:08'),(3,1,1,1,'Test Study Link','https://example.com','Test link for studying','2026-01-26 17:21:13','general',0,NULL,0,'2026-01-26 17:31:08'),(4,1,1,1,'Advanced JavaScript Programming - MDN Documentation','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide','Comprehensive guide to JavaScript programming covering ES6+, async/await, modules, and advanced concepts for software development students','2026-01-26 17:22:37','general',0,NULL,0,'2026-01-26 17:31:08'),(5,1,1,1,'React.js Official Tutorial - Building Interactive UIs','https://react.dev/learn','Official React documentation and tutorial for building modern web applications with component-based architecture','2026-01-26 17:22:37','general',0,NULL,0,'2026-01-26 17:31:08'),(6,2,2,2,'AutoCAD 2024 Complete Training Course','https://www.autodesk.com/products/autocad/learn-training-tutorials','Professional AutoCAD training for architectural and construction drawings, 3D modeling, and technical documentation','2026-01-26 17:22:37','general',0,NULL,0,'2026-01-26 17:31:08'),(7,3,3,3,'Automotive Engine Diagnostics & Repair Manual','https://www.bosch-mobility-solutions.com/en/solutions/diagnostics/','Professional automotive diagnostic tools and techniques for modern vehicle systems, ECU programming, and troubleshooting','2026-01-26 17:22:37','general',0,NULL,0,'2026-01-26 17:31:08'),(8,1,1,1,'Advanced JavaScript Programming - Updated MDN Documentation','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide','UPDATED: Comprehensive guide to JavaScript programming covering ES6+, async/await, modules, advanced concepts, and latest features for software development students','2026-01-26 17:31:15','tutorial',1,'javascript,programming,web-development,es6',0,'2026-01-26 17:31:15'),(10,2,2,2,'AutoCAD 2024 Complete Training Course','https://www.autodesk.com/products/autocad/learn-training-tutorials','Professional AutoCAD training for architectural and construction drawings, 3D modeling, and technical documentation','2026-01-26 17:31:15','video',0,NULL,0,'2026-01-26 17:31:15'),(11,2,2,2,'Construction Project Management Guide','https://www.pmi.org/learning/library/construction-project-management-guide-6423','Comprehensive guide to managing construction projects, scheduling, budgeting, and quality control','2026-01-26 17:31:15','document',0,NULL,0,'2026-01-26 17:31:15'),(12,2,2,2,'Building Codes and Safety Standards','https://www.iccsafe.org/building-safety-journal/','International building codes, safety regulations, and compliance standards for construction professionals','2026-01-26 17:31:15','document',0,NULL,0,'2026-01-26 17:31:15'),(13,1,1,1,'Advanced JavaScript Programming - Updated MDN Documentation','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide','UPDATED: Comprehensive guide to JavaScript programming covering ES6+, async/await, modules, advanced concepts, and latest features for software development students','2026-01-26 17:41:12','tutorial',1,'javascript,programming,web-development,es6',0,'2026-01-26 17:41:12'),(15,2,2,2,'AutoCAD 2024 Complete Training Course','https://www.autodesk.com/products/autocad/learn-training-tutorials','Professional AutoCAD training for architectural and construction drawings, 3D modeling, and technical documentation','2026-01-26 17:41:12','video',0,NULL,0,'2026-01-26 17:41:12'),(16,2,2,2,'Construction Project Management Guide','https://www.pmi.org/learning/library/construction-project-management-guide-6423','Comprehensive guide to managing construction projects, scheduling, budgeting, and quality control','2026-01-26 17:41:12','document',0,NULL,0,'2026-01-26 17:41:12'),(17,2,2,2,'Building Codes and Safety Standards','https://www.iccsafe.org/building-safety-journal/','International building codes, safety regulations, and compliance standards for construction professionals','2026-01-26 17:41:12','document',0,NULL,0,'2026-01-26 17:41:12');
/*!40000 ALTER TABLE `study_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `credits` int(11) DEFAULT 1,
  `is_practical` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'Mathematics','MATH101','Basic Mathematics',1,1,0,1,'2026-01-26 17:24:11','2026-01-26 17:24:11');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission_attachments`
--

DROP TABLE IF EXISTS `submission_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `submission_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `submission_attachments_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `assignment_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission_attachments`
--

LOCK TABLES `submission_attachments` WRITE;
/*!40000 ALTER TABLE `submission_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `submission_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission_files`
--

DROP TABLE IF EXISTS `submission_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `submission_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(1000) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `submission_files_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `assignment_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission_files`
--

LOCK TABLES `submission_files` WRITE;
/*!40000 ALTER TABLE `submission_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `submission_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `payment_terms` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_articles`
--

DROP TABLE IF EXISTS `support_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `title_rw` varchar(500) NOT NULL,
  `title_en` varchar(500) NOT NULL,
  `content_rw` text NOT NULL,
  `content_en` text NOT NULL,
  `author_id` int(11) DEFAULT NULL,
  `author_name` varchar(255) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `helpful_count` int(11) DEFAULT 0,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `support_articles_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `support_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_articles`
--

LOCK TABLES `support_articles` WRITE;
/*!40000 ALTER TABLE `support_articles` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_categories`
--

DROP TABLE IF EXISTS `support_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_categories`
--

LOCK TABLES `support_categories` WRITE;
/*!40000 ALTER TABLE `support_categories` DISABLE KEYS */;
INSERT INTO `support_categories` VALUES (1,'Technical Support','Ubufasha bwa Tekiniki','Get help with technical issues, system errors, and troubleshooting','Ubufasha mu bibazo bya tekiniki, amakosa ya sisitemu, no gukemura ibibazo','Settings','yellow',1,1,'2026-01-24 08:02:30'),(2,'Academic Support','Ubufasha bw\'Amasomo','Questions about courses, grades, assignments, and academic matters','Ibibazo ku masomo, amanota, ibikorwa, n\'ibijyanye n\'amasomo','BookOpen','green',1,2,'2026-01-24 08:02:30'),(3,'Financial Support','Ubufasha bw\'Amafaranga','Help with fees, payments, scholarships, and financial aid','Ubufasha ku mafaranga y\'ishuri, kwishyura, buruse, n\'ubufasha bw\'amafaranga','DollarSign','yellow',1,3,'2026-01-24 08:02:30'),(4,'Account Issues','Ibibazo by\'Konti','Login problems, password reset, account access issues','Ibibazo byo kwinjira, gusubiza ijambo ry\'ibanga, ibibazo byo kwinjira muri konti','User','green',1,4,'2026-01-24 08:02:30'),(5,'General Inquiry','Ibibazo Rusange','General questions and information requests','Ibibazo rusange n\'ibisabwa by\'amakuru','MessageCircle','yellow',1,5,'2026-01-24 08:02:30');
/*!40000 ALTER TABLE `support_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_faqs`
--

DROP TABLE IF EXISTS `support_faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_faqs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `question_rw` text DEFAULT NULL,
  `answer` text NOT NULL,
  `answer_rw` text DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `helpful_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `support_faqs_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `support_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_faqs`
--

LOCK TABLES `support_faqs` WRITE;
/*!40000 ALTER TABLE `support_faqs` DISABLE KEYS */;
INSERT INTO `support_faqs` VALUES (1,1,'How do I reset my password?','Nsubiza nte ijambo ryanjye ryibanga?','Click on \"Forgot Password\" on the login page, enter your email, and follow the instructions sent to your email.','Kanda kuri \"Wibagiwe Ijambo ryibanga\" ku rupapuro rwo kwinjira, wandike imeri yawe, ukurikize amabwiriza yoherejwe kuri imeri yawe.',150,45,1,1,'2026-01-24 08:02:30'),(2,1,'Why can\'t I access my dashboard?','Kuki ntashobora kugera kuri dashboard yanjye?','Make sure you are using the correct login credentials. Clear your browser cache and try again. If the problem persists, contact support.','Emeza ko ukoresha amazina yo kwinjira akwiye. Siba cache ya browser yawe ugerageze. Niba ikibazo gikomeje, vugana n\'ubufasha.',120,38,1,2,'2026-01-24 08:02:30'),(3,2,'How do I check my grades?','Nreba nte amanota yanjye?','Login to your student dashboard, navigate to \"Academics\" section, and click on \"My Grades\" to view all your grades.','Injira muri dashboard yawe y\'umunyeshuri, jya ku gice cya \"Amasomo\", kanda kuri \"Amanota yanjye\" urebe amanota yawe yose.',200,60,1,1,'2026-01-24 08:02:30'),(4,2,'Where can I find my class schedule?','Nshobora kubona he gahunda y\'amasomo yanjye?','Your class schedule is available in the \"Academics\" section under \"My Schedule\" or \"Timetable\".','Gahunda y\'amasomo yawe iraboneka mu gice cya \"Amasomo\" munsi ya \"Gahunda yanjye\" cyangwa \"Timetable\".',180,55,1,2,'2026-01-24 08:02:30'),(5,3,'How do I pay my school fees?','Nishyura nte amafaranga y\'ishuri?','You can pay through Mobile Money, Bank Transfer, or at the school accountant office. Payment details are in your dashboard.','Urashobora kwishyura ukoresheje Mobile Money, Bank Transfer, cyangwa ku biro by\'umubare w\'ishuri. Amakuru yo kwishyura ari muri dashboard yawe.',250,75,1,1,'2026-01-24 08:02:30'),(6,3,'Can I get a scholarship?','Nshobora kubona buruse?','Yes, scholarships are available based on academic performance and financial need. Contact the DOS office for more information.','Yego, buruse zirahari zishingiye ku myigire n\'ibikenewe by\'amafaranga. Vugana na biro ya DOS kugira ngo ubone amakuru yimbitse.',100,31,1,2,'2026-01-24 08:02:30'),(7,4,'I forgot my student code, what should I do?','Nwibagiwe kode yanjye y\'umunyeshuri, nkore iki?','Contact your class teacher or visit the DOS office with your ID to retrieve your student code.','Vugana n\'umwarimu w\'ishuri cyangwa sura biro ya DOS ufite indangamuntu yawe kugira ngo ubone kode yawe y\'umunyeshuri.',90,25,1,1,'2026-01-24 08:02:30'),(8,5,'What are the school operating hours?','Ni izihe masaha ishuri rikora?','School operates Monday to Friday, 7:00 AM to 5:00 PM. Office hours are 8:00 AM to 4:00 PM.','Ishuri rikora Kuwa mbere kugeza Kuwa gatanu, saa 1 z\'igitondo kugeza saa 11 z\'umugoroba. Amasaha ya biro ni saa 2 z\'igitondo kugeza saa 10 z\'umugoroba.',80,20,1,1,'2026-01-24 08:02:30');
/*!40000 ALTER TABLE `support_faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_resources`
--

DROP TABLE IF EXISTS `support_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `title_rw` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `resource_type` enum('guide','video','document','link') NOT NULL,
  `resource_url` varchar(500) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `downloads` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `support_resources_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `support_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_resources`
--

LOCK TABLES `support_resources` WRITE;
/*!40000 ALTER TABLE `support_resources` DISABLE KEYS */;
INSERT INTO `support_resources` VALUES (1,1,'Student Portal User Guide','Umuyobozi wo Gukoresha Portal y\'Abanyeshuri','Complete guide on how to use the student portal','Umuyobozi wuzuye ku buryo bwo gukoresha portal y\'abanyeshuri','guide','/resources/student-portal-guide.pdf',NULL,150,1,'2026-01-24 08:02:30'),(2,2,'Academic Calendar 2024-2026','Kalendari y\'Amasomo 2024-2026','Full academic calendar with important dates','Kalendari yuzuye y\'amasomo hamwe n\'italiki z\'ingenzi','document','/resources/academic-calendar.pdf',NULL,200,1,'2026-01-24 08:02:30'),(3,3,'Fee Payment Instructions','Amabwiriza yo Kwishyura Amafaranga','Step by step guide for paying school fees','Umuyobozi w\'intambwe ku ntambwe yo kwishyura amafaranga y\'ishuri','guide','/resources/fee-payment-guide.pdf',NULL,180,1,'2026-01-24 08:02:30'),(4,1,'How to Reset Password Video','Video yo Gusubiza Ijambo ryibanga','Video tutorial on resetting your password','Inyigisho ya video ku gusubiza ijambo ryibanga','video','https://youtube.com/watch?v=example',NULL,120,1,'2026-01-24 08:02:30');
/*!40000 ALTER TABLE `support_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_responses`
--

DROP TABLE IF EXISTS `support_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_responses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `responder_id` int(11) DEFAULT NULL,
  `responder_name` varchar(255) DEFAULT NULL,
  `response_text` text NOT NULL,
  `is_internal` tinyint(1) DEFAULT 0,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `support_responses_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_responses`
--

LOCK TABLES `support_responses` WRITE;
/*!40000 ALTER TABLE `support_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(50) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `assigned_to` varchar(100) DEFAULT NULL,
  `response` text DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `support_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
INSERT INTO `support_tickets` VALUES (1,'TKT1769604261963',1,'Anonymous','no-email@example.com','','No Subject','','medium','open',NULL,NULL,NULL,'2026-01-28 12:44:22','2026-01-28 12:44:22'),(2,'TKT1769604679198',1,'Anonymous','no-email@example.com','','No Subject','','medium','open',NULL,NULL,NULL,'2026-01-28 12:51:19','2026-01-28 12:51:19'),(3,'TKT1769604889567',1,'Anonymous','no-email@example.com','','No Subject','','medium','open',NULL,NULL,NULL,'2026-01-28 12:54:49','2026-01-28 12:54:49'),(4,'TKT1769605150895',1,'Anonymous','no-email@example.com','','No Subject','','medium','open',NULL,NULL,NULL,'2026-01-28 12:59:10','2026-01-28 12:59:10'),(5,'TKT1769605999009',1,'Anonymous','no-email@example.com','','No Subject','','medium','open',NULL,NULL,NULL,'2026-01-28 13:13:19','2026-01-28 13:13:19'),(6,'TKT1769606452557',1,'Anonymous','no-email@example.com','','No Subject','','medium','open',NULL,NULL,NULL,'2026-01-28 13:20:52','2026-01-28 13:20:52'),(7,'TKT1769610505282',1,'Anonymous','no-email@example.com','','No Subject','','medium','open',NULL,NULL,NULL,'2026-01-28 14:28:25','2026-01-28 14:28:25'),(8,'TKT1769612376485',1,'Anonymous','no-email@example.com','','No Subject','','medium','open',NULL,NULL,NULL,'2026-01-28 14:59:36','2026-01-28 14:59:36');
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_alerts`
--

DROP TABLE IF EXISTS `system_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alert_type` enum('ikimenyetso','ikosa','amakuru','byihutirwa') DEFAULT 'amakuru',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `severity` enum('byo_hejuru','byo_hagati','byo_hasi') DEFAULT 'byo_hagati',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_type` (`alert_type`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_alerts`
--

LOCK TABLES `system_alerts` WRITE;
/*!40000 ALTER TABLE `system_alerts` DISABLE KEYS */;
INSERT INTO `system_alerts` VALUES (1,'amakuru','Sisiteme irakora neza','Ibice byose bya sisiteme birakora neza','byo_hasi',1,'2026-01-26 07:56:19',NULL),(2,'ikimenyetso','Kugenzura ibizamini','Ibizamini 2 bitegerejwe muri iki cyumweru','byo_hagati',1,'2026-01-26 07:56:19',NULL),(3,'amakuru','Sisiteme irakora neza','Ibice byose bya sisiteme birakora neza','byo_hasi',1,'2026-01-26 08:10:54',NULL),(4,'ikimenyetso','Kugenzura ibizamini','Ibizamini 2 bitegerejwe muri iki cyumweru','byo_hagati',1,'2026-01-26 08:10:54',NULL),(5,'amakuru','Sisiteme irakora neza','Ibice byose bya sisiteme birakora neza','byo_hasi',1,'2026-01-26 08:13:33',NULL),(6,'ikimenyetso','Kugenzura ibizamini','Ibizamini 2 bitegerejwe muri iki cyumweru','byo_hagati',1,'2026-01-26 08:13:33',NULL),(7,'amakuru','Sisiteme irakora neza','Ibice byose bya sisiteme birakora neza','byo_hasi',1,'2026-01-26 08:22:19',NULL),(8,'ikimenyetso','Kugenzura ibizamini','Ibizamini 2 bitegerejwe muri iki cyumweru','byo_hagati',1,'2026-01-26 08:22:19',NULL);
/*!40000 ALTER TABLE `system_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level` enum('info','warning','error','critical') DEFAULT 'info',
  `module` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_level` (`level`),
  KEY `idx_module` (`module`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'school_name','Powerful School Management System','string','School name',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(2,'school_address','Kigali, Rwanda','string','School address',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(3,'school_phone','+250 123 456 789','string','School phone number',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(4,'school_email','info@school.rw','string','School email address',1,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(5,'academic_year_start','09-01','string','Academic year start date (MM-DD)',0,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(6,'academic_year_end','06-30','string','Academic year end date (MM-DD)',0,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(7,'default_password','school123','string','Default password for new users',0,'2026-01-24 05:02:44','2026-01-24 05:02:44'),(8,'max_file_upload_size','10','number','Maximum file upload size in MB',0,'2026-01-24 05:02:44','2026-01-24 05:02:44');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_assignments`
--

DROP TABLE IF EXISTS `teacher_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_assignment` (`teacher_id`,`class_id`,`course_id`,`academic_year`,`semester`),
  KEY `class_id` (`class_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `dos_teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `dos_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `dos_courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_assignments`
--

LOCK TABLES `teacher_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_assignments` DISABLE KEYS */;
INSERT INTO `teacher_assignments` VALUES (1,1,1,1,'2024-2025',1,1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(2,1,1,2,'2024-2025',1,1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(3,2,2,3,'2024-2025',1,1,'2026-01-23 09:04:36','2026-01-23 09:04:36'),(4,3,3,4,'2024-2025',1,1,'2026-01-23 09:04:36','2026-01-23 09:04:36');
/*!40000 ALTER TABLE `teacher_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_classes`
--

DROP TABLE IF EXISTS `teacher_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `is_class_teacher` tinyint(1) DEFAULT 0,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `teacher_classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `teacher_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_classes`
--

LOCK TABLES `teacher_classes` WRITE;
/*!40000 ALTER TABLE `teacher_classes` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_curriculum_progress`
--

DROP TABLE IF EXISTS `teacher_curriculum_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_curriculum_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `completion_percentage` decimal(5,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_class_teacher` (`class_id`,`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_curriculum_progress`
--

LOCK TABLES `teacher_curriculum_progress` WRITE;
/*!40000 ALTER TABLE `teacher_curriculum_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_curriculum_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_materials`
--

DROP TABLE IF EXISTS `teacher_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `material_type` enum('work','homework','holiday_package') DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_materials`
--

LOCK TABLES `teacher_materials` WRITE;
/*!40000 ALTER TABLE `teacher_materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_performance_metrics`
--

DROP TABLE IF EXISTS `teacher_performance_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_performance_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `metric_date` date NOT NULL,
  `classes_taught` int(11) DEFAULT 0,
  `total_students` int(11) DEFAULT 0,
  `average_class_grade` decimal(5,2) DEFAULT NULL,
  `assignment_graded_count` int(11) DEFAULT 0,
  `average_grading_time_hours` decimal(5,2) DEFAULT NULL,
  `student_satisfaction_score` decimal(5,2) DEFAULT NULL,
  `attendance_marked_on_time` int(11) DEFAULT 0,
  `conduct_reports_filed` int(11) DEFAULT 0,
  `parent_communications` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_metric_date` (`metric_date`),
  CONSTRAINT `teacher_performance_metrics_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_performance_metrics`
--

LOCK TABLES `teacher_performance_metrics` WRITE;
/*!40000 ALTER TABLE `teacher_performance_metrics` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_performance_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_portal_data`
--

DROP TABLE IF EXISTS `teacher_portal_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_portal_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_portal_data`
--

LOCK TABLES `teacher_portal_data` WRITE;
/*!40000 ALTER TABLE `teacher_portal_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_portal_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `qualification` varchar(200) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `added_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `added_by` (`added_by`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `head_name` varchar(255) NOT NULL,
  `team_size` int(11) DEFAULT 1,
  `description` text DEFAULT NULL,
  `responsibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities`)),
  `image_url` varchar(255) DEFAULT NULL,
  `avatar_emoji` varchar(10) DEFAULT NULL,
  `color_gradient` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `coach` varchar(255) DEFAULT NULL,
  `captain` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Academic Team','Education Management','Dr. Jean Uwimana',15,'Responsible for curriculum development and academic excellence',NULL,NULL,'📚','from-blue-500 to-indigo-500',1,1,'2026-01-23 10:01:46',NULL,NULL,NULL),(2,'Administration Team','School Management','Ms. Grace Mukamana',12,'Handles administrative operations and school management',NULL,NULL,'🏢','from-purple-500 to-pink-500',1,2,'2026-01-23 10:01:46',NULL,NULL,NULL),(3,'Finance Team','Financial Management','Mr. Patrick Habimana',8,'Manages school finances and budgeting',NULL,NULL,'💰','from-green-500 to-emerald-500',1,3,'2026-01-23 10:01:46',NULL,NULL,NULL),(4,'IT Team','Technology Support','Eng. David Mugabo',6,'Provides technical support and maintains IT infrastructure',NULL,NULL,'💻','from-cyan-500 to-blue-500',1,4,'2026-01-23 10:01:46',NULL,NULL,NULL),(5,'New Team',NULL,'',1,NULL,NULL,NULL,NULL,NULL,1,0,'2026-01-28 12:54:20',NULL,NULL,NULL),(6,'New Team',NULL,'',1,NULL,NULL,NULL,NULL,NULL,1,0,'2026-01-28 12:58:41',NULL,NULL,NULL),(7,'New Team',NULL,'',1,NULL,NULL,NULL,NULL,NULL,1,0,'2026-01-28 13:12:37',NULL,NULL,NULL),(8,'New Team',NULL,'',1,NULL,NULL,NULL,NULL,NULL,1,0,'2026-01-28 13:20:23',NULL,NULL,NULL),(9,'New Team',NULL,'',1,NULL,NULL,NULL,NULL,NULL,1,0,'2026-01-28 14:27:47',NULL,NULL,NULL),(10,'New Team',NULL,'',1,NULL,NULL,NULL,NULL,NULL,1,0,'2026-01-28 14:58:59',NULL,NULL,NULL);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `avatar` varchar(10) DEFAULT NULL,
  `quote` text NOT NULL,
  `rating` int(11) DEFAULT 5,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'Jean Claude Mugisha','Umunyeshuri - Software Development','JM','Ishuri ryacu ryampaye amahirwe menshi yo kwiga ubuhanga bw\'ikoranabuhanga. Abarimu bacu barahebuje kandi bagashoboye.',5,1,1,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(2,'Marie Uwase','Umubyeyi','MU','Umwana wanjye yarahindutse cyane kuva atangiye kwiga muri iri shuri. Amasomo ni meza kandi abanyeshuri bagenzurwa neza.',5,1,2,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(3,'Patrick Nkurunziza','Warangije - Building Construction','PN','Nyuma yo kurangiza amashuri yanjye, nabonye akazi kahambaye mu kigo cy\'ubwubatsi. Murakoze ishuri!',5,1,3,'2026-01-27 07:48:18','2026-01-27 07:48:18'),(4,'Alice Mukandori','Umwarimu','AM','Ni ishuri ryiza cyane rifite ibikoresho byiza by\'amashuri. Abanyeshuri bacu bagera kuri byinshi.',5,1,4,'2026-01-27 07:48:18','2026-01-27 07:48:18');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_attachments`
--

DROP TABLE IF EXISTS `ticket_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ticket_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ticket_id` (`ticket_id`),
  CONSTRAINT `ticket_attachments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_attachments`
--

LOCK TABLES `ticket_attachments` WRITE;
/*!40000 ALTER TABLE `ticket_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_responses`
--

DROP TABLE IF EXISTS `ticket_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ticket_responses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_staff` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_ticket_id` (`ticket_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `ticket_responses_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_responses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_responses`
--

LOCK TABLES `ticket_responses` WRITE;
/*!40000 ALTER TABLE `ticket_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable`
--

DROP TABLE IF EXISTS `timetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timetable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_day` (`day_of_week`),
  CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timetable_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timetable_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable`
--

LOCK TABLES `timetable` WRITE;
/*!40000 ALTER TABLE `timetable` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_entries`
--

DROP TABLE IF EXISTS `timetable_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timetable_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `academic_year_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `timetable_entries_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `timetable_entries_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `timetable_entries_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `timetable_entries_ibfk_4` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_entries`
--

LOCK TABLES `timetable_entries` WRITE;
/*!40000 ALTER TABLE `timetable_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_slots`
--

DROP TABLE IF EXISTS `timetable_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timetable_slots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `timetable_slots_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `teacher_assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_slots`
--

LOCK TABLES `timetable_slots` WRITE;
/*!40000 ALTER TABLE `timetable_slots` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tournaments`
--

DROP TABLE IF EXISTS `tournaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tournaments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `sport_type` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `organizer` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `prize_pool` decimal(12,2) DEFAULT NULL,
  `status` enum('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  `participants_count` int(11) DEFAULT 0,
  `rules` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_sport_type` (`sport_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournaments`
--

LOCK TABLES `tournaments` WRITE;
/*!40000 ALTER TABLE `tournaments` DISABLE KEYS */;
/*!40000 ALTER TABLE `tournaments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trade_classes`
--

DROP TABLE IF EXISTS `trade_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trade_classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `level` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trade_classes`
--

LOCK TABLES `trade_classes` WRITE;
/*!40000 ALTER TABLE `trade_classes` DISABLE KEYS */;
INSERT INTO `trade_classes` VALUES (1,'Class 10A','10A','Grade 10','2026-01-22 09:02:14'),(2,'Class 10B','10B','Grade 10','2026-01-22 09:02:14');
/*!40000 ALTER TABLE `trade_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trade_courses`
--

DROP TABLE IF EXISTS `trade_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trade_courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `name_rw` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `credits` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `trade_id` (`trade_id`),
  CONSTRAINT `trade_courses_ibfk_1` FOREIGN KEY (`trade_id`) REFERENCES `trades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trade_courses`
--

LOCK TABLES `trade_courses` WRITE;
/*!40000 ALTER TABLE `trade_courses` DISABLE KEYS */;
INSERT INTO `trade_courses` VALUES (13,5,'L4SOD-01','Data Structure and Algorithm','Imiterere y\'Amakuru na Algorithm',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(14,5,'L4SOD-02','Database Development','Iterambere ry\'Ububiko bw\'Amakuru',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(15,5,'L4SOD-03','Backend Design','Igishushanyo cya Backend',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(16,5,'L4SOD-04','Backend Application','Porogaramu ya Backend',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(17,5,'L4SOD-05','Window Server','Seriveri ya Windows',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(18,5,'L4SOD-06','PHP Programming','Porogaramu ya PHP',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(19,5,'L4SOD-07','Networking','Umuyoboro',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(20,5,'L4SOD-08','Computer Skills','Ubumenyi bwa Mudasobwa',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(21,6,'L5BDC-01','Construction Site Management','Imicungire y\'Urubuga rw\'Ubwubatsi',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(22,6,'L5BDC-02','Ceiling Work','Akazi k\'Igisenge',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(23,6,'L5BDC-03','Scaffolding Operation','Imikorere ya Scaffolding',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(24,6,'L5BDC-04','Ornamental Finishing Work','Akazi ko Kurangiza Imitako',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(25,6,'L5BDC-05','Construct Roof Structure','Kubaka Imiterere y\'Igisenge',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(26,6,'L5BDC-06','ArchiCAD Software','Software ya ArchiCAD',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(27,6,'L5BDC-07','Acoustic and Thermal Insulation','Gukumira Amajwi n\'Ubushyuhe',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(28,6,'L5BDC-08','Basic Reinforced Concrete Design','Igishushanyo cy\'ibanze cya Beto Yashyizweho Ibyuma',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(29,7,'L3SOD-01','Apply JavaScript','Gukoresha JavaScript',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(30,7,'L3SOD-02','Design UI/UX','Igishushanyo cya UI/UX',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(31,7,'L3SOD-03','Computer Literacy','Ubumenyi bwa Mudasobwa',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(32,7,'L3SOD-04','Graphic Design','Igishushanyo cy\'Amashusho',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(33,7,'L3SOD-05','Develop Website','Gukora Website',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(34,7,'L3SOD-06','Conduct Version Control','Gukora Version Control',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(35,7,'L3SOD-07','Develop Game in Vue','Gukora Umukino muri Vue',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(36,7,'L3SOD-08','Analyse Project Requirement','Gusesengura Ibisabwa n\'Umushinga',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(37,8,'L3BDC-01','Construct Stone','Kubaka Amabuye',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(38,8,'L3BDC-02','Opening Fixation','Gushyiraho Ibyuho',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(39,8,'L3BDC-03','Fundamental of Building Material','Ibanze by\'Ibikoresho byo Kubaka',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(40,8,'L3BDC-04','Drawing','Igishushanyo',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(41,8,'L3BDC-05','Soil Based Brick and Block','Amatafari n\'Amabuye y\'Ubutaka',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(42,8,'L3BDC-06','Setting Out','Gushyiraho Imiterere',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(43,8,'L3BDC-07','Cement Flooring','Hasi ya Sima',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(44,8,'L3BDC-08','Plumbing','Gushyiraho Imiyoboro',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(45,8,'L3BDC-09','Erect Bricks and Blocks','Gushyiraho Amatafari n\'Amabuye',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(46,8,'L3BDC-10','Basic Knowledge of Domestic Electricity','Ubumenyi bw\'Ibanze bw\'Amashanyarazi yo mu Rugo',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(47,8,'L3BDC-11','Plastering Structure','Gusiga Imiterere',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(48,8,'L3BDC-12','Kiswahili','Igiswahili',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(49,9,'L4BDC-01','Cement Base Block Pavers Work','Akazi k\'Amabuye ya Sima',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(50,9,'L4BDC-02','Quantify Construction Work','Gupima Akazi k\'Ubwubatsi',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(51,9,'L4BDC-03','Performing Tile Work','Gukora Amatafari',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(52,9,'L4BDC-04','Drawing','Igishushanyo',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(53,9,'L4BDC-05','Perform Concrete Work','Gukora Akazi ka Beto',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(54,9,'L4BDC-06','AutoCAD','AutoCAD',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(55,9,'L4BDC-07','Steel Bars','Ibyuma',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(56,9,'L4BDC-08','Welding','Gusudira',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(57,9,'L4BDC-09','Treezer','Treezer',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(58,10,'L3AUTO-01','Cooling System','Sisitemu yo Gukonjesha',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(59,10,'L3AUTO-02','Lubrication System','Sisitemu yo Gusiga Amavuta',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(60,10,'L3AUTO-03','Electricity','Amashanyarazi',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(61,10,'L3AUTO-04','Super Charging','Super Charging',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(62,10,'L3AUTO-05','Bench Work','Akazi ku Ntebe',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(63,10,'L3AUTO-06','Engine Repair','Gusana Moteri',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(64,10,'L3AUTO-07','Welding','Gusudira',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(65,10,'L3AUTO-08','Fuel Supply System','Sisitemu yo Gutanga Lisansi',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(66,10,'L3AUTO-09','Exhaust','Exhaust',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(67,10,'L3AUTO-10','Technical Drawing','Igishushanyo cy\'Ikoranabuhanga',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(68,10,'L3AUTO-11','Wheel and Tyre','Uruziga n\'Ipine',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(69,10,'L3AUTO-12','Car Body','Umubiri w\'Imodoka',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(70,11,'L5SOD-01','Python Programming','Porogaramu ya Python',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(71,11,'L5SOD-02','Apply Quality Assurance','Gukoresha Ubwiza bw\'Ibikorwa',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(72,11,'L5SOD-03','React JS','React JS',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(73,11,'L5SOD-04','Blockchain','Blockchain',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(74,11,'L5SOD-05','Machine Learning','Kwiga kwa Mashini',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(75,11,'L5SOD-06','Mobile Application','Porogaramu ya Telefoni',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(76,11,'L5SOD-07','Use ICT at Workplace','Gukoresha ICT ku Kazi',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(77,11,'L5SOD-08','Apply DevOps Techniques','Gukoresha Tekinike za DevOps',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(78,11,'L5SOD-09','Develop NoSQL Database','Gukora Ububiko bwa NoSQL',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(79,11,'L5SOD-10','Business Organisation','Imitunganyirize y\'Ubucuruzi',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(80,12,'L4AUTO-01','Repair Diesel Engine','Gusana Moteri ya Mazutu',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(81,12,'L4AUTO-02','Vehicle Control System','Sisitemu yo Kugenzura Imodoka',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(82,12,'L4AUTO-03','Automotive Electricity','Amashanyarazi y\'Ibinyabiziga',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(83,12,'L4AUTO-04','Manual Transmission','Transmission Ikora n\'Ukuboko',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(84,12,'L4AUTO-05','Material','Ibikoresho',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(85,12,'L4AUTO-06','Air Condition System','Sisitemu yo Gukonjesha Umwuka',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(86,12,'L4AUTO-07','Engine Auxiliary System','Sisitemu Ifasha Moteri',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(87,12,'L4AUTO-08','Digital and Power Electronic','Elektronike Digitale n\'Ingufu',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(88,12,'L4AUTO-09','Overhaul Design','Igishushanyo cyo Gusana Byuzuye',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(89,13,'L5AUTO-01','Apply Hydraulic and Pneumatic System','Gukoresha Sisitemu ya Hydraulic na Pneumatic',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(90,13,'L5AUTO-02','Repair Diesel Injection System','Gusana Sisitemu ya Injection ya Mazutu',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(91,13,'L5AUTO-03','Auto Spare Parts Repair','Gusana Ibice by\'Ibinyabiziga',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(92,13,'L5AUTO-04','Business Organisation','Imitunganyirize y\'Ubucuruzi',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(93,13,'L5AUTO-05','Vehicle Electronic','Elektronike y\'Ibinyabiziga',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(94,13,'L5AUTO-06','Engine Auxiliary System','Sisitemu Ifasha Moteri',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(95,13,'L5AUTO-07','Automatic Gear Box','Gear Box Ikora Yonyine',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33'),(96,13,'L5AUTO-08','Hybrid Vehicle','Imodoka Hybrid',NULL,NULL,NULL,NULL,1,'2026-01-24 13:57:33');
/*!40000 ALTER TABLE `trade_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trade_facilities`
--

DROP TABLE IF EXISTS `trade_facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trade_facilities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_code` varchar(10) DEFAULT NULL,
  `name_rw` varchar(200) DEFAULT NULL,
  `name_en` varchar(200) DEFAULT NULL,
  `name_fr` varchar(200) DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `description_fr` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trade_facilities`
--

LOCK TABLES `trade_facilities` WRITE;
/*!40000 ALTER TABLE `trade_facilities` DISABLE KEYS */;
/*!40000 ALTER TABLE `trade_facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trade_instructors`
--

DROP TABLE IF EXISTS `trade_instructors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trade_instructors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `role_rw` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `specialization` text DEFAULT NULL,
  `specialization_rw` text DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `trade_id` (`trade_id`),
  CONSTRAINT `trade_instructors_ibfk_1` FOREIGN KEY (`trade_id`) REFERENCES `trades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trade_instructors`
--

LOCK TABLES `trade_instructors` WRITE;
/*!40000 ALTER TABLE `trade_instructors` DISABLE KEYS */;
/*!40000 ALTER TABLE `trade_instructors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trade_levels`
--

DROP TABLE IF EXISTS `trade_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trade_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_code` varchar(10) DEFAULT NULL,
  `trade_name` varchar(100) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `sub_level` varchar(5) DEFAULT NULL,
  `level_suffix` varchar(10) DEFAULT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `capacity` int(11) DEFAULT 30,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trade_levels`
--

LOCK TABLES `trade_levels` WRITE;
/*!40000 ALTER TABLE `trade_levels` DISABLE KEYS */;
INSERT INTO `trade_levels` VALUES (1,'SOD','Software Development',4,NULL,'A','Software Development S4A','Learn modern software development',30,1,'2026-01-26 09:20:11',NULL),(2,'SOD','Software Development',5,NULL,'A','Software Development S5A','Advanced software development',30,1,'2026-01-26 09:20:11',NULL),(3,'SOD','Software Development',6,NULL,'A','Software Development S6A','Expert software development',30,1,'2026-01-26 09:20:11',NULL),(4,'BDC','Building Construction',4,NULL,'A','Building Construction S4A','Master construction techniques',30,1,'2026-01-26 09:20:11',NULL),(5,'BDC','Building Construction',5,NULL,'A','Building Construction S5A','Advanced construction',30,1,'2026-01-26 09:20:11',NULL),(6,'BDC','Building Construction',6,NULL,'A','Building Construction S6A','Expert construction',30,1,'2026-01-26 09:20:11',NULL),(10,'ICT','Information and Communication Technology',1,NULL,'A',NULL,'ICT Level 1 - Section A',30,1,'2026-01-27 14:17:13',NULL),(11,'ICT','Information and Communication Technology',1,NULL,'B',NULL,'ICT Level 1 - Section B',30,1,'2026-01-27 14:17:13',NULL),(12,'ICT','Information and Communication Technology',2,NULL,NULL,NULL,'ICT Level 2',30,1,'2026-01-27 14:17:13',NULL),(13,'ICT','Information and Communication Technology',3,NULL,NULL,NULL,'ICT Level 3',30,1,'2026-01-27 14:17:13',NULL),(14,'ELE','Electrical Installation',1,NULL,NULL,NULL,'Electrical Installation Level 1',30,1,'2026-01-27 14:17:13',NULL),(15,'ELE','Electrical Installation',2,NULL,NULL,NULL,'Electrical Installation Level 2',30,1,'2026-01-27 14:17:13',NULL),(16,'ELE','Electrical Installation',3,NULL,NULL,NULL,'Electrical Installation Level 3',30,1,'2026-01-27 14:17:13',NULL),(17,'PLU','Plumbing',1,NULL,NULL,NULL,'Plumbing Level 1',30,1,'2026-01-27 14:17:13',NULL),(18,'PLU','Plumbing',2,NULL,NULL,NULL,'Plumbing Level 2',30,1,'2026-01-27 14:17:13',NULL),(19,'WEL','Welding',1,NULL,NULL,NULL,'Welding Level 1',30,1,'2026-01-27 14:17:13',NULL),(20,'WEL','Welding',2,NULL,NULL,NULL,'Welding Level 2',30,1,'2026-01-27 14:17:13',NULL),(21,'CAR','Carpentry',1,NULL,NULL,NULL,'Carpentry Level 1',30,1,'2026-01-27 14:17:13',NULL),(22,'CAR','Carpentry',2,NULL,NULL,NULL,'Carpentry Level 2',30,1,'2026-01-27 14:17:13',NULL),(23,'ICT','Information and Communication Technology',1,NULL,'A',NULL,'ICT Level 1 - Section A',30,1,'2026-01-27 14:17:47',NULL),(24,'ICT','Information and Communication Technology',1,NULL,'B',NULL,'ICT Level 1 - Section B',30,1,'2026-01-27 14:17:47',NULL),(25,'ICT','Information and Communication Technology',2,NULL,NULL,NULL,'ICT Level 2',30,1,'2026-01-27 14:17:47',NULL),(26,'ICT','Information and Communication Technology',3,NULL,NULL,NULL,'ICT Level 3',30,1,'2026-01-27 14:17:47',NULL),(27,'ELE','Electrical Installation',1,NULL,NULL,NULL,'Electrical Installation Level 1',30,1,'2026-01-27 14:17:47',NULL),(28,'ELE','Electrical Installation',2,NULL,NULL,NULL,'Electrical Installation Level 2',30,1,'2026-01-27 14:17:47',NULL),(29,'ELE','Electrical Installation',3,NULL,NULL,NULL,'Electrical Installation Level 3',30,1,'2026-01-27 14:17:47',NULL),(30,'PLU','Plumbing',1,NULL,NULL,NULL,'Plumbing Level 1',30,1,'2026-01-27 14:17:47',NULL),(31,'PLU','Plumbing',2,NULL,NULL,NULL,'Plumbing Level 2',30,1,'2026-01-27 14:17:47',NULL),(32,'WEL','Welding',1,NULL,NULL,NULL,'Welding Level 1',30,1,'2026-01-27 14:17:47',NULL),(33,'WEL','Welding',2,NULL,NULL,NULL,'Welding Level 2',30,1,'2026-01-27 14:17:48',NULL),(34,'CAR','Carpentry',1,NULL,NULL,NULL,'Carpentry Level 1',30,1,'2026-01-27 14:17:48',NULL),(35,'CAR','Carpentry',2,NULL,NULL,NULL,'Carpentry Level 2',30,1,'2026-01-27 14:17:48',NULL),(36,'ICT','Information and Communication Technology',1,NULL,'A',NULL,'ICT Level 1 - Section A',30,1,'2026-01-27 14:23:18',NULL),(37,'ICT','Information and Communication Technology',1,NULL,'B',NULL,'ICT Level 1 - Section B',30,1,'2026-01-27 14:23:18',NULL),(38,'ICT','Information and Communication Technology',2,NULL,NULL,NULL,'ICT Level 2',30,1,'2026-01-27 14:23:18',NULL),(39,'ICT','Information and Communication Technology',3,NULL,NULL,NULL,'ICT Level 3',30,1,'2026-01-27 14:23:18',NULL),(40,'ELE','Electrical Installation',1,NULL,NULL,NULL,'Electrical Installation Level 1',30,1,'2026-01-27 14:23:18',NULL),(41,'ELE','Electrical Installation',2,NULL,NULL,NULL,'Electrical Installation Level 2',30,1,'2026-01-27 14:23:18',NULL),(42,'ELE','Electrical Installation',3,NULL,NULL,NULL,'Electrical Installation Level 3',30,1,'2026-01-27 14:23:18',NULL),(43,'PLU','Plumbing',1,NULL,NULL,NULL,'Plumbing Level 1',30,1,'2026-01-27 14:23:18',NULL),(44,'PLU','Plumbing',2,NULL,NULL,NULL,'Plumbing Level 2',30,1,'2026-01-27 14:23:18',NULL),(45,'WEL','Welding',1,NULL,NULL,NULL,'Welding Level 1',30,1,'2026-01-27 14:23:18',NULL),(46,'WEL','Welding',2,NULL,NULL,NULL,'Welding Level 2',30,1,'2026-01-27 14:23:18',NULL),(47,'CAR','Carpentry',1,NULL,NULL,NULL,'Carpentry Level 1',30,1,'2026-01-27 14:23:18',NULL),(48,'CAR','Carpentry',2,NULL,NULL,NULL,'Carpentry Level 2',30,1,'2026-01-27 14:23:18',NULL);
/*!40000 ALTER TABLE `trade_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trade_programs`
--

DROP TABLE IF EXISTS `trade_programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trade_programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `total_students` int(11) DEFAULT 0,
  `graduation_rate` decimal(5,2) DEFAULT 0.00,
  `employment_rate` decimal(5,2) DEFAULT 0.00,
  `average_salary` varchar(50) DEFAULT NULL,
  `industry_partners` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trade_programs`
--

LOCK TABLES `trade_programs` WRITE;
/*!40000 ALTER TABLE `trade_programs` DISABLE KEYS */;
INSERT INTO `trade_programs` VALUES (1,'SOD','Software Development','Master modern programming languages, frameworks, and development methodologies. Build web applications, mobile apps, and enterprise software solutions.','/uploads/sod-default.jpg',1,420,96.50,94.20,'$85,000',25,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(2,'BDC','Building & Construction','Learn construction techniques, project management, and safety protocols. Work with modern tools and sustainable building practices.','/uploads/bdc-default.jpg',1,380,92.80,89.50,'$72,000',18,'2026-01-22 06:58:06','2026-01-22 06:58:06'),(3,'AUT','Automobile Technology','Comprehensive automotive training covering diagnostics, repair, and modern vehicle technologies including hybrid and electric systems.','/uploads/aut-default.jpg',1,290,94.10,91.80,'$68,000',22,'2026-01-22 06:58:06','2026-01-22 06:58:06');
/*!40000 ALTER TABLE `trade_programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trade_students`
--

DROP TABLE IF EXISTS `trade_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trade_students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `trade_id` (`trade_id`),
  CONSTRAINT `trade_students_ibfk_1` FOREIGN KEY (`trade_id`) REFERENCES `trades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trade_students`
--

LOCK TABLES `trade_students` WRITE;
/*!40000 ALTER TABLE `trade_students` DISABLE KEYS */;
/*!40000 ALTER TABLE `trade_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trades`
--

DROP TABLE IF EXISTS `trades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `name` varchar(200) NOT NULL,
  `name_rw` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_rw` text DEFAULT NULL,
  `icon` varchar(10) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `duration_years` int(11) DEFAULT NULL,
  `total_students` int(11) DEFAULT 0,
  `total_instructors` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  FULLTEXT KEY `ft_name` (`name`),
  FULLTEXT KEY `ft_description` (`description`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trades`
--

LOCK TABLES `trades` WRITE;
/*!40000 ALTER TABLE `trades` DISABLE KEYS */;
INSERT INTO `trades` VALUES (5,'L4SOD','Level 4 Software Development','Urwego rwa 4 mu Iterambere rya Software','Advanced software development program focusing on data structures, databases, and backend technologies','Porogaramu y\'iterambere rya software yibanda ku miterere y\'amakuru, ububiko bw\'amakuru, n\'ikoranabuhanga rya backend',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(6,'L5BDC','Level 5 Building and Construction','Urwego rwa 5 mu Kubaka','Advanced building and construction program covering site management, roofing, and architectural design','Porogaramu y\'ubwubatsi yibanda ku micungire y\'urubuga, igisenge, n\'igishushanyo cy\'inyubako',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(7,'L3SOD','Level 3 Software Development','Urwego rwa 3 mu Iterambere rya Software','Foundation software development program covering web development, UI/UX design, and game development','Porogaramu y\'ibanze y\'iterambere rya software yibanda ku iterambere rya website, igishushanyo cya UI/UX, n\'iterambere ry\'imikino',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(8,'L3BDC','Level 3 Building and Construction','Urwego rwa 3 mu Kubaka','Foundation building and construction program covering essential construction skills and techniques','Porogaramu y\'ibanze y\'ubwubatsi yibanda ku bumenyi bw\'ibanze bwo kubaka',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(9,'L4BDC','Level 4 Building and Construction','Urwego rwa 4 mu Kubaka','Intermediate building and construction program focusing on concrete work, tiling, and technical drawing','Porogaramu yo hagati y\'ubwubatsi yibanda ku kazi ka beto, amatafari, n\'igishushanyo cy\'ikoranabuhanga',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(10,'L3AUTO','Level 3 Automotive Technology','Urwego rwa 3 mu Ikoranabuhanga ry\'Ibinyabiziga','Foundation automotive program covering engine systems, electrical systems, and vehicle maintenance','Porogaramu y\'ibanze y\'ibinyabiziga yibanda ku sisitemu ya moteri, sisitemu y\'amashanyarazi, n\'isana ry\'ibinyabiziga',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(11,'L5SOD','Level 5 Software Development','Urwego rwa 5 mu Iterambere rya Software','Expert software development program covering advanced technologies like AI, blockchain, and mobile development','Porogaramu y\'inzobere mu iterambere rya software yibanda ku ikoranabuhanga rigezweho nka AI, blockchain, n\'iterambere rya mobile',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(12,'L4AUTO','Level 4 Automotive Technology','Urwego rwa 4 mu Ikoranabuhanga ry\'Ibinyabiziga','Advanced automotive program focusing on diesel engines, transmission systems, and vehicle electronics','Porogaramu y\'ibinyabiziga yibanda ku moteri za mazutu, sisitemu zo kohereza ingufu, n\'elektronike y\'ibinyabiziga',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(13,'L5AUTO','Level 5 Automotive Technology','Urwego rwa 5 mu Ikoranabuhanga ry\'Ibinyabiziga','Expert automotive program covering hydraulic systems, diesel injection, and hybrid vehicle technology','Porogaramu y\'inzobere mu binyabiziga yibanda ku sisitemu ya hydraulic, injection ya mazutu, n\'ikoranabuhanga ry\'ibinyabiziga hybrid',NULL,NULL,2,0,0,1,'2026-01-24 13:57:33','2026-01-24 13:57:33'),(14,'AUT','Automotive Technology',NULL,'Vehicle repair, maintenance, and automotive systems',NULL,NULL,NULL,NULL,0,0,1,'2026-02-10 05:30:57','2026-02-10 05:30:57'),(15,'BDC','Building and Construction',NULL,'Construction techniques, building design, and project management',NULL,NULL,NULL,NULL,0,0,1,'2026-02-10 05:30:57','2026-02-10 05:30:57'),(16,'SOD','Software Development',NULL,'Programming, web development, and software engineering',NULL,NULL,NULL,NULL,0,0,1,'2026-02-10 05:30:57','2026-02-10 05:30:57');
/*!40000 ALTER TABLE `trades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trades_levels`
--

DROP TABLE IF EXISTS `trades_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trades_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_code` varchar(20) NOT NULL,
  `level_number` int(11) NOT NULL,
  `level_suffix` varchar(10) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trades_levels`
--

LOCK TABLES `trades_levels` WRITE;
/*!40000 ALTER TABLE `trades_levels` DISABLE KEYS */;
INSERT INTO `trades_levels` VALUES (1,'L3AUTO',1,'','Level 1 - L3AUTO',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(2,'L3AUTO',2,'','Level 2 - L3AUTO',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(3,'L3AUTO',3,'','Level 3 - L3AUTO',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(4,'L3AUTO',4,'','Level 4 - L3AUTO',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(5,'L3BDC',1,'','Level 1 - L3BDC',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(6,'L3BDC',2,'','Level 2 - L3BDC',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(7,'L3BDC',3,'','Level 3 - L3BDC',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(8,'L3BDC',4,'','Level 4 - L3BDC',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(9,'L3SOD',1,'','Level 1 - L3SOD',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(10,'L3SOD',2,'','Level 2 - L3SOD',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(11,'L3SOD',3,'','Level 3 - L3SOD',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(12,'L3SOD',4,'','Level 4 - L3SOD',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(13,'L4AUTO',1,'','Level 1 - L4AUTO',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(14,'L4AUTO',2,'','Level 2 - L4AUTO',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(15,'L4AUTO',3,'','Level 3 - L4AUTO',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(16,'L4AUTO',4,'','Level 4 - L4AUTO',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(17,'L4BDC',1,'','Level 1 - L4BDC',1,'2026-02-10 05:18:22','2026-02-10 05:18:22'),(18,'L4BDC',2,'','Level 2 - L4BDC',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(19,'L4BDC',3,'','Level 3 - L4BDC',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(20,'L4BDC',4,'','Level 4 - L4BDC',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(21,'L4SOD',1,'','Level 1 - L4SOD',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(22,'L4SOD',2,'','Level 2 - L4SOD',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(23,'L4SOD',3,'','Level 3 - L4SOD',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(24,'L4SOD',4,'','Level 4 - L4SOD',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(25,'L5AUTO',1,'','Level 1 - L5AUTO',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(26,'L5AUTO',2,'','Level 2 - L5AUTO',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(27,'L5AUTO',3,'','Level 3 - L5AUTO',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(28,'L5AUTO',4,'','Level 4 - L5AUTO',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(29,'L5BDC',1,'','Level 1 - L5BDC',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(30,'L5BDC',2,'','Level 2 - L5BDC',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(31,'L5BDC',3,'','Level 3 - L5BDC',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(32,'L5BDC',4,'','Level 4 - L5BDC',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(33,'L5SOD',1,'','Level 1 - L5SOD',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(34,'L5SOD',2,'','Level 2 - L5SOD',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(35,'L5SOD',3,'','Level 3 - L5SOD',1,'2026-02-10 05:18:23','2026-02-10 05:18:23'),(36,'L5SOD',4,'','Level 4 - L5SOD',1,'2026-02-10 05:18:23','2026-02-10 05:18:23');
/*!40000 ALTER TABLE `trades_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_assessments`
--

DROP TABLE IF EXISTS `training_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `training_assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `assessment_code` varchar(50) NOT NULL,
  `assessment_type` enum('quiz','test','practical','project','presentation','final') DEFAULT 'quiz',
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `total_marks` decimal(6,2) DEFAULT 100.00,
  `passing_marks` decimal(6,2) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT 60,
  `max_attempts` int(11) DEFAULT 1,
  `weight_percentage` decimal(5,2) DEFAULT 100.00,
  `due_date` datetime DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `status` enum('draft','published','closed') DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_code` (`assessment_code`),
  KEY `idx_module` (`module_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `training_assessments_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `training_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_assessments`
--

LOCK TABLES `training_assessments` WRITE;
/*!40000 ALTER TABLE `training_assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `training_assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_enrollments`
--

DROP TABLE IF EXISTS `training_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `training_enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `enrollment_date` date NOT NULL,
  `completion_date` date DEFAULT NULL,
  `status` enum('enrolled','completed','dropped') DEFAULT 'enrolled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `training_enrollments_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `training_enrollments_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `training_programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_enrollments`
--

LOCK TABLES `training_enrollments` WRITE;
/*!40000 ALTER TABLE `training_enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `training_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_modules`
--

DROP TABLE IF EXISTS `training_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `training_modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `module_code` varchar(50) NOT NULL,
  `module_name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `sequence_order` int(11) DEFAULT 1,
  `duration_hours` decimal(5,2) DEFAULT NULL,
  `passing_score` decimal(5,2) DEFAULT 60.00,
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `module_code` (`module_code`),
  KEY `idx_program` (`program_id`),
  KEY `idx_sequence` (`sequence_order`),
  CONSTRAINT `training_modules_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `student_training_programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_modules`
--

LOCK TABLES `training_modules` WRITE;
/*!40000 ALTER TABLE `training_modules` DISABLE KEYS */;
INSERT INTO `training_modules` VALUES (1,1,'CARP-MOD-001','Safety and Tools','Workshop safety and hand tools',1,20.00,60.00,1,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(2,1,'CARP-MOD-002','Wood Selection','Wood types and selection',2,15.00,60.00,1,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(3,1,'CARP-MOD-003','Basic Joinery','Basic joinery techniques',3,25.00,60.00,1,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(4,1,'CARP-MOD-004','Finishing','Surface preparation and finishing',4,15.00,60.00,1,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(5,2,'ELEC-MOD-001','Electrical Safety','Electrical safety protocols',1,12.00,60.00,1,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(6,2,'ELEC-MOD-002','Circuit Basics','Electrical circuit fundamentals',2,20.00,60.00,1,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(7,2,'ELEC-MOD-003','Wiring Techniques','Residential wiring',3,30.00,60.00,1,'2026-02-10 14:04:15','2026-02-10 14:04:15'),(8,2,'ELEC-MOD-004','Testing and Maintenance','Circuit testing and maintenance',4,18.00,60.00,1,'2026-02-10 14:04:15','2026-02-10 14:04:15');
/*!40000 ALTER TABLE `training_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_programs`
--

DROP TABLE IF EXISTS `training_programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `training_programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `trainer` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_programs`
--

LOCK TABLES `training_programs` WRITE;
/*!40000 ALTER TABLE `training_programs` DISABLE KEYS */;
/*!40000 ALTER TABLE `training_programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_resources`
--

DROP TABLE IF EXISTS `training_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `training_resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `resource_type` enum('document','video','link','presentation','spreadsheet','image') DEFAULT 'document',
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `external_url` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `sequence_order` int(11) DEFAULT 1,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_module` (`module_id`),
  KEY `idx_type` (`resource_type`),
  CONSTRAINT `training_resources_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `training_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_resources`
--

LOCK TABLES `training_resources` WRITE;
/*!40000 ALTER TABLE `training_resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `training_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_sessions`
--

DROP TABLE IF EXISTS `training_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `training_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `session_code` varchar(50) NOT NULL,
  `session_title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `session_type` enum('theory','practical','assessment','field_work','workshop') DEFAULT 'theory',
  `scheduled_date` date DEFAULT NULL,
  `scheduled_time` time DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT 60,
  `instructor_id` int(11) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `max_participants` int(11) DEFAULT NULL,
  `materials` text DEFAULT NULL,
  `learning_objectives` text DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_code` (`session_code`),
  KEY `idx_module` (`module_id`),
  KEY `idx_date` (`scheduled_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `training_sessions_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `training_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_sessions`
--

LOCK TABLES `training_sessions` WRITE;
/*!40000 ALTER TABLE `training_sessions` DISABLE KEYS */;
INSERT INTO `training_sessions` VALUES (1,1,'CARP-SES-001','Workshop Safety Introduction',NULL,'theory','2026-02-11',NULL,120,NULL,'Workshop A',NULL,NULL,NULL,'scheduled','2026-02-10 14:04:15','2026-02-10 14:04:15'),(2,1,'CARP-SES-002','Hand Tools Practice',NULL,'practical','2026-02-12',NULL,180,NULL,'Workshop A',NULL,NULL,NULL,'scheduled','2026-02-10 14:04:15','2026-02-10 14:04:15'),(3,2,'CARP-SES-003','Wood Types Identification',NULL,'theory','2026-02-14',NULL,90,NULL,'Classroom 1',NULL,NULL,NULL,'scheduled','2026-02-10 14:04:15','2026-02-10 14:04:15'),(4,3,'CARP-SES-004','Joint Making Workshop',NULL,'practical','2026-02-15',NULL,240,NULL,'Workshop A',NULL,NULL,NULL,'scheduled','2026-02-10 14:04:15','2026-02-10 14:04:15');
/*!40000 ALTER TABLE `training_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('income','expense') DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `transaction_date` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_bookings`
--

DROP TABLE IF EXISTS `transport_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transport_bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `pickup_point` varchar(255) DEFAULT NULL,
  `status` enum('active','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `transport_bookings_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transport_bookings_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_bookings`
--

LOCK TABLES `transport_bookings` WRITE;
/*!40000 ALTER TABLE `transport_bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `transport_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_route_assignments`
--

DROP TABLE IF EXISTS `transport_route_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transport_route_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `route_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `pickup_point` varchar(200) DEFAULT NULL,
  `dropoff_point` varchar(200) DEFAULT NULL,
  `status` enum('active','suspended','cancelled') DEFAULT 'active',
  `assigned_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `academic_year_id` (`academic_year_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `transport_route_assignments_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`),
  CONSTRAINT `transport_route_assignments_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `transport_vehicles` (`id`),
  CONSTRAINT `transport_route_assignments_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transport_route_assignments_ibfk_4` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_route_assignments`
--

LOCK TABLES `transport_route_assignments` WRITE;
/*!40000 ALTER TABLE `transport_route_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `transport_route_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_routes`
--

DROP TABLE IF EXISTS `transport_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transport_routes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `route_name` varchar(100) NOT NULL,
  `route_code` varchar(20) NOT NULL,
  `start_point` varchar(200) DEFAULT NULL,
  `end_point` varchar(200) DEFAULT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `pickup_points` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pickup_points`)),
  `dropoff_points` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dropoff_points`)),
  `schedule_time` time DEFAULT NULL,
  `monthly_fee` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `route_code` (`route_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_routes`
--

LOCK TABLES `transport_routes` WRITE;
/*!40000 ALTER TABLE `transport_routes` DISABLE KEYS */;
INSERT INTO `transport_routes` VALUES (1,'City Center Route','CCR01','City Center','School Campus',12.50,NULL,NULL,'07:00:00',25000.00,'active','2026-01-24 05:02:47','2026-01-24 05:02:47'),(2,'Airport Road Route','ARR01','Airport Junction','School Campus',8.30,NULL,NULL,'07:15:00',20000.00,'active','2026-01-24 05:02:47','2026-01-24 05:02:47'),(3,'Downtown Route','DTR01','Downtown Area','School Campus',15.20,NULL,NULL,'06:45:00',30000.00,'active','2026-01-24 05:02:47','2026-01-24 05:02:47');
/*!40000 ALTER TABLE `transport_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_vehicles`
--

DROP TABLE IF EXISTS `transport_vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transport_vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehicle_number` varchar(20) NOT NULL,
  `vehicle_type` enum('bus','van','car') DEFAULT 'bus',
  `capacity` int(11) NOT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `driver_phone` varchar(20) DEFAULT NULL,
  `driver_license` varchar(50) DEFAULT NULL,
  `status` enum('active','maintenance','inactive') DEFAULT 'active',
  `registration_number` varchar(50) DEFAULT NULL,
  `insurance_expiry` date DEFAULT NULL,
  `last_service_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicle_number` (`vehicle_number`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_vehicles`
--

LOCK TABLES `transport_vehicles` WRITE;
/*!40000 ALTER TABLE `transport_vehicles` DISABLE KEYS */;
/*!40000 ALTER TABLE `transport_vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trending_searches`
--

DROP TABLE IF EXISTS `trending_searches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trending_searches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query` varchar(255) DEFAULT NULL,
  `search_count` int(11) DEFAULT 1,
  `last_searched` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `query` (`query`),
  KEY `idx_count` (`search_count`),
  KEY `idx_last` (`last_searched`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trending_searches`
--

LOCK TABLES `trending_searches` WRITE;
/*!40000 ALTER TABLE `trending_searches` DISABLE KEYS */;
/*!40000 ALTER TABLE `trending_searches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trophies`
--

DROP TABLE IF EXISTS `trophies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trophies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `sport_type` varchar(50) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `date_won` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trophies`
--

LOCK TABLES `trophies` WRITE;
/*!40000 ALTER TABLE `trophies` DISABLE KEYS */;
/*!40000 ALTER TABLE `trophies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unified_content`
--

DROP TABLE IF EXISTS `unified_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unified_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content_type` varchar(100) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unified_content`
--

LOCK TABLES `unified_content` WRITE;
/*!40000 ALTER TABLE `unified_content` DISABLE KEYS */;
/*!40000 ALTER TABLE `unified_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploaded_files`
--

DROP TABLE IF EXISTS `uploaded_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uploaded_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `original_name` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `uploaded_files_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploaded_files`
--

LOCK TABLES `uploaded_files` WRITE;
/*!40000 ALTER TABLE `uploaded_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `uploaded_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activities`
--

DROP TABLE IF EXISTS `user_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activities`
--

LOCK TABLES `user_activities` WRITE;
/*!40000 ALTER TABLE `user_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activity_logs`
--

DROP TABLE IF EXISTS `user_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `user_activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activity_logs`
--

LOCK TABLES `user_activity_logs` WRITE;
/*!40000 ALTER TABLE `user_activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_badges`
--

DROP TABLE IF EXISTS `user_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `badge_id` int(11) DEFAULT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_badges`
--

LOCK TABLES `user_badges` WRITE;
/*!40000 ALTER TABLE `user_badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `granted` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_permission` (`user_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `phone_type` enum('smartphone','basic') DEFAULT 'smartphone',
  `is_whatsapp_enabled` tinyint(1) DEFAULT 0,
  `address` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `profile_picture` varchar(500) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `serial_code` varchar(50) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profile_image` varchar(500) DEFAULT NULL,
  `trade_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT NULL COMMENT 'Level 3, 4, or 5',
  `class` varchar(10) DEFAULT NULL COMMENT 'Class A or B',
  `employee_id` varchar(50) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `office_location` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL COMMENT 'Simple password for staff',
  `preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferences`)),
  `status` varchar(50) DEFAULT 'active',
  `role` varchar(50) DEFAULT 'student',
  `has_smartphone` tinyint(1) DEFAULT 0,
  `preferred_contact_method` enum('app','sms','whatsapp','dual') DEFAULT 'dual',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `student_id` (`student_id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `parent_id` (`parent_id`),
  KEY `idx_role` (`role_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_email` (`email`),
  KEY `idx_active` (`is_active`),
  KEY `trade_id` (`trade_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`trade_id`) REFERENCES `trades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_4` FOREIGN KEY (`trade_id`) REFERENCES `trades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'demo_student','student@gardentvet.com','$2a$10$s5W3MQ1Ey51q5nOMgbhDRuFle22k.SP8xWPa/hCCrWSQaMd92n8kC','Demo','Student','0788123456','smartphone',0,NULL,NULL,NULL,NULL,7,'2024SOD4A001','SN-100',NULL,0,0,NULL,NULL,NULL,'2026-01-26 09:20:11','2026-01-28 15:00:39',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/profiles/profile_1769612439261.jpg',NULL,NULL,'expelled','student',0,'dual'),(2,'demo_parent','parent@gardentvet.com','$2a$10$ZY4Yxy/.anwZmlGNagwHOukrCx915lBrj9ZzdZljPCHLZZLp0xFfe','Demo','Parent','0788654321','smartphone',0,NULL,NULL,NULL,NULL,8,NULL,'SN-200',NULL,1,0,NULL,NULL,NULL,'2026-01-26 09:20:11','2026-01-26 16:38:08',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(3,'teacher1','teacher1@example.com','hashed_password','John','Doe',NULL,'smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-26 17:16:50','2026-01-26 17:16:50',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(4,'accountant1','accountant1@example.com','hashed_password','Jane','Smith',NULL,'smartphone',0,NULL,NULL,NULL,NULL,9,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-26 17:16:50','2026-01-26 17:16:50',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(5,'teacher_demo','teacher_demo_2026@gardentvet.rw','$2a$10$3peMFdAVcSP94wFRJq0bOuKzXrajyn.klNVff8sFiEc7Jn0TlvJRW','Emmanuel','Mugisha','+250788200001','smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,'2026-01-27 14:24:25',NULL,NULL,'2026-01-27 14:17:13','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','teacher',0,'dual'),(14,'student_demo','student_demo_2026@default.rw','$2a$10$3peMFdAVcSP94wFRJq0bOuKzXrajyn.klNVff8sFiEc7Jn0TlvJRW','Demo','Student','+250788000010','smartphone',0,NULL,NULL,NULL,NULL,7,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:24:17','2026-01-27 14:24:17',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$3peMFdAVcSP94wFRJq0bOuKzXrajyn.klNVff8sFiEc7Jn0TlvJRW',NULL,'active','student',0,'dual'),(15,'parent_demo','parent_demo_2026@default.rw','$2a$10$3peMFdAVcSP94wFRJq0bOuKzXrajyn.klNVff8sFiEc7Jn0TlvJRW','Demo','Parent','+250788000011','smartphone',0,NULL,NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:24:17','2026-01-27 14:24:17',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$3peMFdAVcSP94wFRJq0bOuKzXrajyn.klNVff8sFiEc7Jn0TlvJRW',NULL,'active','parent',0,'dual'),(16,'teacher_physics','teacher_physics_2026@gardentvet.rw','','Christine','Uwineza','+250788200002','smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:35:16','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(17,'teacher_ict','teacher_ict_2026@gardentvet.rw','','David','Niyonkuru','+250788200003','smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:35:16','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(18,'teacher_english','teacher_english_2026@gardentvet.rw','','Sarah','Keza','+250788200004','smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:35:16','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(19,'teacher_electrical','teacher_electrical_2026@gardentvet.rw','','Jean Claude','Bizimana','+250788200005','smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:35:16','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(20,'teacher_welding','teacher_welding_2026@gardentvet.rw','','Robert','Ndizeye','+250788200006','smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:35:16','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(21,'teacher_plumbing','teacher_plumbing_2026@gardentvet.rw','','Joseph','Nkusi','+250788200007','smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:35:16','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(22,'teacher_carpentry','teacher_carpentry_2026@gardentvet.rw','','Francis','Nshimiyimana','+250788200008','smartphone',0,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:35:16','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(23,'student_demo1','student1_2026@gardentvet.rw','','Janvier','Uwamahoro','+250788300001','smartphone',0,'Kigali, Gasabo, Remera','2005-03-15','male',NULL,7,'2026ICT1A003',NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 14:36:23','2026-01-27 14:36:23',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$HNmLFOI/ky7uveLtpVGxkOyzuy0Ck.e5fsZS8UcVGaGuJJ1CLe8LG',NULL,'active','student',0,'dual'),(24,'student_demo2','student2_2026@gardentvet.rw','','Diane','Ishimwe','+250788300002','smartphone',0,'Kigali, Kicukiro, Niboye','2006-07-20','female',NULL,7,'2026SOD4A004',NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:00:51','2026-01-27 15:00:51',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$MSe1rjQbXn7EatQDirsmr.9duzEquXqKFEGcKOtZtiHPlMwyNvzEm',NULL,'active','student',0,'dual'),(25,'student_demo3','student3_2026@gardentvet.rw','','Patrick','Nsengimana','+250788300003','smartphone',0,'Kigali, Nyarugenge, Nyabugogo','2005-11-10','male',NULL,7,'2026BDC4A005',NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:01:39','2026-01-27 15:01:39',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$iZCwvW0W5WCLNx5fz8NbwefrPKLnvlZdNLhqpqaKMQVcjLmc.y1qS',NULL,'active','student',0,'dual'),(26,'student_demo4','student4_2026@gardentvet.rw','','Grace','Mukamana','+250788300004','smartphone',0,'Kigali, Gasabo, Kimironko','2006-01-25','female',NULL,7,'2026AUT4A006',NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:02:19','2026-01-27 15:02:19',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$O3r8N1wIW8EWlc1o5/XJwub3lfc2ILw1UVygkA64ngR.tX0y9r3ye',NULL,'active','student',0,'dual'),(27,'student_demo5','student5_2026@gardentvet.rw','','Eric','Habimana','+250788300005','smartphone',0,'Kigali, Kicukiro, Gikondo','2005-09-05','male',NULL,7,'2026ICT1A007',NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:02:43','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(28,'student_demo6','student6_2026@gardentvet.rw','','Yvonne','Uwase','+250788300006','smartphone',0,'Kigali, Gasabo, Kacyiru','2004-05-18','female',NULL,7,'2026SOD5A008',NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:02:43','2026-01-27 15:02:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','student',0,'dual'),(29,'parent_demo1','parent1_2026@gardentvet.rw','','Jean','Uwamahoro','+250788400001','smartphone',0,'Kigali, Gasabo, Remera',NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:02:43','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','parent',0,'dual'),(30,'parent_demo2','parent2_2026@gardentvet.rw','','Agnes','Ishimwe','+250788400002','smartphone',0,'Kigali, Kicukiro, Niboye',NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:02:43','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','parent',0,'dual'),(31,'parent_demo3','parent3_2026@gardentvet.rw','','Paul','Nsengimana','+250788400003','smartphone',0,'Kigali, Nyarugenge, Nyabugogo',NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:02:43','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','parent',0,'dual'),(32,'parent_demo4','parent4_2026@gardentvet.rw','','Rose','Mukamana','+250788400004','smartphone',0,'Kigali, Gasabo, Kimironko',NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-27 15:02:43','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$10$eYbKnpmTClKusJG06O7x2.ilgaQJwVnnrBOq0V8P9MVhTpBZVYKma',NULL,'active','parent',0,'dual'),(39,'parent_0789447620','reponse@gmail.com','$2a$10$W7u/KFJkPFsrqBgEAdbsAubfCOlrZa4t7t0Q/xkMM17..6H0jQimy','reponse','kdz','0789447620','smartphone',0,NULL,NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 10:03:37','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','parent',0,'dual'),(40,'parent_0784484638','parent_0784484638@parent.gardentvet.com','$2a$10$.u6q6EikiTyLuOgD63Hvc.ssImer5VP0D5fcQ/681Lrmhl6X38L06','bb','nn','0784484638','smartphone',0,NULL,NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 12:19:52','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','parent',0,'dual'),(41,'user_1769604689231','user1769604689231@example.com','$2a$10$4FayLD4tk3PPtyx4z2LET.dX/OLGZsIcZk/wnuJcpICaOQgNvATle','Employee','User','','smartphone',0,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 12:51:29','2026-01-28 12:51:29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(42,'user_1769604900472','user1769604900472@example.com','$2a$10$iWSItgBL5BsotDCopI2UoObYu4vLuTd3MhvWLYW4RBlsvOCB41so6','Employee','User','','smartphone',0,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 12:55:00','2026-01-28 12:55:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(43,'user_1769605161111','user1769605161111@example.com','$2a$10$Pm17h/3UxQ8rA4OLYr5vt.kyNM2XkXtl1tkNZqZU7Fpr3WM7XnZX.','Employee','User','','smartphone',0,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 12:59:21','2026-01-28 12:59:21',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(44,'user_1769606008814','user1769606008814@example.com','$2a$10$BYfZ108cychFoXRDLysuw.wsj9L.pnCJDiBrNqswQbEa5/bGG/WUS','Employee','User','','smartphone',0,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 13:13:28','2026-01-28 13:13:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(45,'test_user_1769606398701','test1769606398701@test.com','$2a$10$qwEUTJniTrUJRj.G42LqBuGFscIGuDg9WBa1oi7oCmm.GYDsGJx/W','Test','User','0788999888','smartphone',0,NULL,NULL,NULL,NULL,7,'20260NaN',NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 13:20:01','2026-01-28 13:20:01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(46,'user_1769606462496','user1769606462496@example.com','$2a$10$PU9Cy7qTP/jYT4QKPiyn3OWDBT5lZ80pF1rTLtQ.0qeDC8TluhUsO','Employee','User','','smartphone',0,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 13:21:02','2026-01-28 13:21:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(47,'user_1769610516079','user1769610516079@example.com','$2a$10$pheVO4ZCoMYHMPzda.8DiuEyV3TvutzI0lGjpy/VtVegFm67j8by2','Employee','User','','smartphone',0,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 14:28:36','2026-01-28 14:28:36',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(48,'user_1769612387502','user1769612387502@example.com','$2a$10$KAz2mftQzkARwj0IfUST/.ybRoWl7ak53O5IEkRB5Z7YuvPxIFPPC','Employee','User','','smartphone',0,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-28 14:59:47','2026-01-28 14:59:47',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual'),(49,'parent_0722725735','parent_0722725735@parent.gardentvet.com','$2a$10$je0Nhrl4vhBRm5VUhVgnxOMzwplGdqR9v/XnnRITjfhslz6Ziq5rG','obama','kus','0722725735','smartphone',0,NULL,NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-29 06:16:00','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','parent',0,'dual'),(50,'parent_0784484630','parent_0784484630@parent.gardentvet.com','$2a$10$GA7dhop5Z8.T752jZyCVhOYaGnI2DaERHtgSjEYS42kCoOpIBYxKe','re','po','0784484630','smartphone',0,NULL,NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-01-29 07:02:45','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','parent',0,'dual'),(56,'parent_0796329328','parent_0796329328@parent.gardentvet.com','$2a$10$apynhvo4j1swMJ/npuZGveBpp0beKv5dbKN.WFNWTedfSywzZ9z6u','yves','musoni','0796329328','smartphone',0,NULL,NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-02-01 17:04:29','2026-02-01 17:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','parent',0,'dual'),(57,'parent_0781234567','parent_0781234567@parent.gardentvet.com','$2a$10$NkB1faRgQTmnNMv4LPu/G.gZg2O7KfaH.NglkV8qXQoYuEiyMCQoy','bb','u8i','0781234567','smartphone',0,NULL,NULL,NULL,NULL,8,NULL,NULL,NULL,1,0,NULL,NULL,NULL,'2026-02-02 15:13:21','2026-02-02 15:13:21',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','student',0,'dual');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `villages`
--

DROP TABLE IF EXISTS `villages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `villages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cell_id` int(11) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cell_id` (`cell_id`),
  CONSTRAINT `villages_ibfk_1` FOREIGN KEY (`cell_id`) REFERENCES `cells` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `villages`
--

LOCK TABLES `villages` WRITE;
/*!40000 ALTER TABLE `villages` DISABLE KEYS */;
/*!40000 ALTER TABLE `villages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workshop_images`
--

DROP TABLE IF EXISTS `workshop_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workshop_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workshop_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `workshop_id` (`workshop_id`),
  CONSTRAINT `workshop_images_ibfk_1` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workshop_images`
--

LOCK TABLES `workshop_images` WRITE;
/*!40000 ALTER TABLE `workshop_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `workshop_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workshop_participants`
--

DROP TABLE IF EXISTS `workshop_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workshop_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workshop_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `attendance_status` enum('registered','attended','absent','cancelled') DEFAULT 'registered',
  PRIMARY KEY (`id`),
  KEY `workshop_id` (`workshop_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `workshop_participants_ibfk_1` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`),
  CONSTRAINT `workshop_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workshop_participants`
--

LOCK TABLES `workshop_participants` WRITE;
/*!40000 ALTER TABLE `workshop_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `workshop_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workshops`
--

DROP TABLE IF EXISTS `workshops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workshops` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `facilitator` varchar(255) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `target_audience` varchar(255) DEFAULT NULL,
  `max_participants` int(11) DEFAULT NULL,
  `status` enum('scheduled','ongoing','completed','cancelled') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workshops`
--

LOCK TABLES `workshops` WRITE;
/*!40000 ALTER TABLE `workshops` DISABLE KEYS */;
/*!40000 ALTER TABLE `workshops` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-10 22:33:56

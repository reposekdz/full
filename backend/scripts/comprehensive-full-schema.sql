-- Comprehensive Full-Stack School Management System Database Schema
-- This schema includes ALL tables needed for the comprehensive API system
-- Extends the base comprehensive-schema.sql with additional modules

SET FOREIGN_KEY_CHECKS = 0;

-- Drop additional tables
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS knowledge_base;
DROP TABLE IF EXISTS library_borrowings;
DROP TABLE IF EXISTS library_books;
DROP TABLE IF EXISTS hostel_allocations;
DROP TABLE IF EXISTS hostel_rooms;
DROP TABLE IF EXISTS transport_route_assignments;
DROP TABLE IF EXISTS transport_vehicles;
DROP TABLE IF EXISTS transport_routes;
DROP TABLE IF EXISTS sports_matches;
DROP TABLE IF EXISTS sports_team_members;
DROP TABLE IF EXISTS sports_teams;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS admission_applications;
DROP TABLE IF EXISTS admissions_sessions;
DROP TABLE IF EXISTS exam_sessions;
DROP TABLE IF EXISTS user_activity_logs;

SET FOREIGN_KEY_CHECKS = 1;

-- ===============================
-- KNOWLEDGE BASE SYSTEM
-- ===============================

CREATE TABLE knowledge_base (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags VARCHAR(500),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    author_id INT,
    meta_description TEXT,
    featured BOOLEAN DEFAULT false,
    views INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    version INT DEFAULT 1,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    FULLTEXT idx_search (title, content, tags)
);

-- ===============================
-- ASSIGNMENTS SYSTEM
-- ===============================

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    due_date DATETIME NOT NULL,
    max_marks DECIMAL(5,2) DEFAULT 100,
    attachment_url VARCHAR(500),
    instructions TEXT,
    status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    INDEX idx_class (class_id),
    INDEX idx_subject (subject_id),
    INDEX idx_due_date (due_date)
);

CREATE TABLE assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_text TEXT,
    attachment_url VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marks_obtained DECIMAL(5,2) NULL,
    feedback TEXT,
    graded_by INT NULL,
    graded_at TIMESTAMP NULL,
    status ENUM('submitted', 'graded', 'late', 'missing') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (graded_by) REFERENCES users(id),
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- ===============================
-- LIBRARY MANAGEMENT SYSTEM
-- ===============================

CREATE TABLE library_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(200),
    isbn VARCHAR(20) UNIQUE,
    category VARCHAR(100),
    publisher VARCHAR(200),
    publication_year INT,
    quantity INT DEFAULT 1,
    available_quantity INT DEFAULT 1,
    location VARCHAR(100),
    description TEXT,
    status ENUM('available', 'unavailable', 'maintenance') DEFAULT 'available',
    cover_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    FULLTEXT idx_search (title, author, isbn)
);

CREATE TABLE library_borrowings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status ENUM('borrowed', 'returned', 'overdue', 'lost') DEFAULT 'borrowed',
    fine_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    issued_by INT NOT NULL,
    returned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES library_books(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (issued_by) REFERENCES users(id),
    FOREIGN KEY (returned_to) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- ===============================
-- HOSTEL MANAGEMENT SYSTEM
-- ===============================

CREATE TABLE hostel_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    hostel_name VARCHAR(100),
    floor INT,
    room_type ENUM('single', 'double', 'dormitory') DEFAULT 'dormitory',
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    gender ENUM('male', 'female', 'mixed') DEFAULT 'mixed',
    amenities JSON,
    status ENUM('available', 'occupied', 'maintenance', 'closed') DEFAULT 'available',
    monthly_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_gender (gender)
);

CREATE TABLE hostel_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NULL,
    status ENUM('active', 'checked_out', 'terminated') DEFAULT 'active',
    bed_number VARCHAR(10),
    notes TEXT,
    allocated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (allocated_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- ===============================
-- TRANSPORT MANAGEMENT SYSTEM
-- ===============================

CREATE TABLE transport_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    route_code VARCHAR(20) UNIQUE NOT NULL,
    start_point VARCHAR(200),
    end_point VARCHAR(200),
    distance_km DECIMAL(8,2),
    pickup_points JSON,
    dropoff_points JSON,
    schedule_time TIME,
    monthly_fee DECIMAL(10,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

CREATE TABLE transport_vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type ENUM('bus', 'van', 'car') DEFAULT 'bus',
    capacity INT NOT NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_license VARCHAR(50),
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    registration_number VARCHAR(50),
    insurance_expiry DATE,
    last_service_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

CREATE TABLE transport_route_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    pickup_point VARCHAR(200),
    dropoff_point VARCHAR(200),
    status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
    assigned_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id),
    FOREIGN KEY (vehicle_id) REFERENCES transport_vehicles(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- ===============================
-- SPORTS MANAGEMENT SYSTEM
-- ===============================

CREATE TABLE sports_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50),
    coach_name VARCHAR(100),
    coach_id INT,
    captain_id INT,
    description TEXT,
    established_date DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    achievements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sport_type (sport_type),
    INDEX idx_status (status)
);

CREATE TABLE sports_team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    student_id INT NOT NULL,
    position VARCHAR(50),
    jersey_number INT,
    joined_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE KEY unique_team_member (team_id, student_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

CREATE TABLE sports_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    opponent_name VARCHAR(100) NOT NULL,
    match_date DATETIME NOT NULL,
    venue VARCHAR(200),
    match_type ENUM('friendly', 'league', 'tournament', 'championship') DEFAULT 'friendly',
    team_score INT DEFAULT 0,
    opponent_score INT DEFAULT 0,
    result ENUM('win', 'loss', 'draw', 'pending') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES sports_teams(id),
    INDEX idx_match_date (match_date),
    INDEX idx_result (result)
);

-- ===============================
-- COMMUNICATION SYSTEM (EXTENDED)
-- ===============================

CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_audience ENUM('all', 'students', 'teachers', 'parents', 'staff') DEFAULT 'all',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    published_by INT NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    status ENUM('draft', 'published', 'expired', 'archived') DEFAULT 'draft',
    attachment_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (published_by) REFERENCES users(id),
    INDEX idx_target_audience (target_audience),
    INDEX idx_priority (priority),
    INDEX idx_status (status)
);

-- ===============================
-- ADMISSIONS SYSTEM
-- ===============================

CREATE TABLE admissions_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_name VARCHAR(100) NOT NULL,
    academic_year_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('upcoming', 'open', 'closed', 'cancelled') DEFAULT 'upcoming',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    INDEX idx_status (status)
);

CREATE TABLE admission_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    course_id INT NOT NULL,
    previous_education TEXT,
    documents JSON,
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'waitlisted') DEFAULT 'pending',
    application_date DATE NOT NULL,
    reviewed_by INT,
    review_notes TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES admissions_sessions(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_email (email)
);

-- ===============================
-- EXAM SESSIONS SYSTEM
-- ===============================

CREATE TABLE exam_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_name VARCHAR(100) NOT NULL,
    academic_year_id INT NOT NULL,
    exam_type ENUM('mid-term', 'end-term', 'final', 'quiz', 'mock') DEFAULT 'end-term',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    INDEX idx_status (status),
    INDEX idx_exam_type (exam_type)
);

-- ===============================
-- USER ACTIVITY LOGS
-- ===============================

CREATE TABLE user_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- ===============================
-- INSERT INITIAL DATA FOR NEW TABLES
-- ===============================

-- Default exam session
INSERT INTO exam_sessions (session_name, academic_year_id, exam_type, start_date, end_date, status) VALUES
('Mid-Term Exams 2025-2026', 1, 'mid-term', '2025-11-15', '2025-11-30', 'scheduled'),
('End-Term Exams 2025-2026', 1, 'end-term', '2026-03-01', '2026-03-15', 'scheduled');

-- Default admissions session
INSERT INTO admissions_sessions (session_name, academic_year_id, start_date, end_date, status) VALUES
('2026-2027 Intake', 1, '2026-05-01', '2026-08-31', 'upcoming');

-- Default transport routes
INSERT INTO transport_routes (route_name, route_code, start_point, end_point, distance_km, schedule_time, monthly_fee) VALUES
('City Center Route', 'CCR01', 'City Center', 'School Campus', 12.5, '07:00:00', 25000),
('Airport Road Route', 'ARR01', 'Airport Junction', 'School Campus', 8.3, '07:15:00', 20000),
('Downtown Route', 'DTR01', 'Downtown Area', 'School Campus', 15.2, '06:45:00', 30000);

-- Default sports teams
INSERT INTO sports_teams (team_name, sport_type, description, status) VALUES
('School Football Team', 'Football', 'Main football team representing the school', 'active'),
('School Basketball Team', 'Basketball', 'Main basketball team', 'active'),
('School Volleyball Team', 'Volleyball', 'Main volleyball team', 'active');

SET FOREIGN_KEY_CHECKS = 1;

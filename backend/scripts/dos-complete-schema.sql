-- ===============================
-- COMPREHENSIVE SCHOOL MANAGEMENT DATABASE SCHEMA
-- ===============================

-- Drop existing tables if they exist (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS conduct_records;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS timetable_sessions;
DROP TABLE IF EXISTS teacher_class_assignments;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS trade_classes;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS trade_levels;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- ===============================
-- CORE TABLES
-- ===============================

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table (students, teachers, parents, admin, etc.)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('Male', 'Female') DEFAULT 'Male',
    address TEXT,
    profile_picture VARCHAR(255),
    role_id INT NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    parent_id INT,
    emergency_contact VARCHAR(255),
    medical_info TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (parent_id) REFERENCES users(id),
    INDEX idx_role (role_id),
    INDEX idx_student_id (student_id),
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active)
);

-- Academic years
CREATE TABLE academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
);

-- Trade levels (SOD Level 3, BDC Level 4, etc.)
CREATE TABLE trade_levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trade_code VARCHAR(10) NOT NULL,
    trade_name VARCHAR(100) NOT NULL,
    level_number INT NOT NULL,
    level_suffix VARCHAR(10),
    full_name VARCHAR(150) NOT NULL,
    description TEXT,
    duration_years INT DEFAULT 1,
    capacity INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trade_level (trade_code, level_number, level_suffix),
    INDEX idx_active (is_active)
);

-- Subjects
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    credits INT DEFAULT 1,
    is_practical BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);

-- Trade classes (actual class instances)
CREATE TABLE trade_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trade_level_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    classroom VARCHAR(50),
    capacity INT DEFAULT 30,
    current_enrollment INT DEFAULT 0,
    main_teacher_id INT,
    assistant_teacher_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_level_id) REFERENCES trade_levels(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (main_teacher_id) REFERENCES users(id),
    FOREIGN KEY (assistant_teacher_id) REFERENCES users(id),
    INDEX idx_trade_level (trade_level_id),
    INDEX idx_academic_year (academic_year_id),
    INDEX idx_active (is_active)
);

-- Student enrollments
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'completed', 'dropped', 'transferred') DEFAULT 'active',
    completion_date DATE,
    final_grade DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE KEY unique_enrollment (student_id, class_id, academic_year_id),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id),
    INDEX idx_status (status)
);

-- Teacher class assignments
CREATE TABLE teacher_class_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    subject_id INT NOT NULL,
    assignment_type ENUM('main', 'assistant', 'subject_specialist') DEFAULT 'subject_specialist',
    start_date DATE NOT NULL,
    end_date DATE,
    assigned_by INT NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_class (trade_class_id),
    INDEX idx_subject (subject_id),
    INDEX idx_active (is_active)
);

-- Timetable sessions
CREATE TABLE timetable_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trade_class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    session_type ENUM('theory', 'practical', 'workshop', 'laboratory') DEFAULT 'theory',
    equipment_needed TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    INDEX idx_class_day (trade_class_id, day_of_week),
    INDEX idx_teacher_day (teacher_id, day_of_week),
    INDEX idx_active (is_active)
);

-- Grades
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    assessment_type ENUM('quiz', 'test', 'exam', 'assignment', 'project', 'practical') NOT NULL,
    assessment_name VARCHAR(100) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    obtained_marks DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (obtained_marks / max_marks * 100) STORED,
    assessment_date DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    INDEX idx_student (student_id),
    INDEX idx_subject (subject_id),
    INDEX idx_class (trade_class_id),
    INDEX idx_date (assessment_date)
);

-- Attendance
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    subject_id INT,
    teacher_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    period_number INT,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    remarks TEXT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marked_by INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (student_id, trade_class_id, attendance_date, period_number),
    INDEX idx_student_date (student_id, attendance_date),
    INDEX idx_class_date (trade_class_id, attendance_date),
    INDEX idx_status (status)
);

-- Conduct records
CREATE TABLE conduct_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    trade_class_id INT,
    incident_type ENUM('positive', 'negative', 'neutral') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100),
    incident_date DATETIME NOT NULL,
    reported_by INT NOT NULL,
    witness_ids JSON,
    action_taken TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    points_awarded INT DEFAULT 0,
    points_deducted INT DEFAULT 0,
    parent_notified BOOLEAN DEFAULT FALSE,
    admin_reviewed BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'investigating', 'resolved', 'escalated', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (reported_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_class (trade_class_id),
    INDEX idx_type (incident_type),
    INDEX idx_date (incident_date),
    INDEX idx_status (status)
);

-- ===============================
-- INSERT INITIAL DATA
-- ===============================

-- Insert roles
INSERT INTO roles (name, description) VALUES
('student', 'Student role with access to grades, attendance, and personal information'),
('teacher', 'Teacher role with access to class management, grading, and attendance'),
('parent', 'Parent role with access to child information and communication'),
('director_of_study', 'Director of Study with access to academic management and student oversight'),
('director_of_discipline', 'Director of Discipline with access to conduct management'),
('head_master', 'Head Master with full school oversight'),
('accountant', 'Accountant with access to financial management'),
('stock_manager', 'Stock Manager with access to inventory management'),
('admin', 'Administrator with system management access'),
('super_admin', 'Super Administrator with full system access');

-- Insert academic year
INSERT INTO academic_years (name, start_date, end_date, is_active) VALUES
('2024-2025', '2024-09-01', '2025-08-31', TRUE);

-- Insert trade levels
INSERT INTO trade_levels (trade_code, trade_name, level_number, level_suffix, full_name, description) VALUES
('SOD', 'Software Development', 3, NULL, 'Level 3 Software Development', 'Foundation level software development'),
('SOD', 'Software Development', 4, NULL, 'Level 4 Software Development', 'Intermediate software development'),
('SOD', 'Software Development', 5, NULL, 'Level 5 Software Development', 'Advanced software development'),
('BDC', 'Building & Construction', 3, NULL, 'Level 3 Building & Construction', 'Foundation level construction'),
('BDC', 'Building & Construction', 4, NULL, 'Level 4 Building & Construction', 'Intermediate construction'),
('BDC', 'Building & Construction', 5, NULL, 'Level 5 Building & Construction', 'Advanced construction'),
('AUT', 'Automobile Technology', 3, NULL, 'Level 3 Automobile Technology', 'Foundation level automotive'),
('AUT', 'Automobile Technology', 4, 'A', 'Level 4A Automobile Technology', 'Intermediate automotive - Track A'),
('AUT', 'Automobile Technology', 4, 'B', 'Level 4B Automobile Technology', 'Intermediate automotive - Track B'),
('AUT', 'Automobile Technology', 5, 'A', 'Level 5A Automobile Technology', 'Advanced automotive - Track A'),
('AUT', 'Automobile Technology', 5, 'B', 'Level 5B Automobile Technology', 'Advanced automotive - Track B');

-- Insert subjects
INSERT INTO subjects (code, name, description, credits, is_practical) VALUES
('MATH', 'Mathematics', 'General Mathematics', 3, FALSE),
('ENG', 'English', 'English Language', 2, FALSE),
('PHYS', 'Physics', 'General Physics', 3, TRUE),
('CHEM', 'Chemistry', 'General Chemistry', 3, TRUE),
('PROG', 'Programming', 'Computer Programming', 4, TRUE),
('WEB', 'Web Development', 'Web Development Technologies', 4, TRUE),
('DB', 'Database Systems', 'Database Design and Management', 3, TRUE),
('CONST', 'Construction Technology', 'Building Construction Methods', 4, TRUE),
('ARCH', 'Architectural Drawing', 'Technical Drawing and Design', 3, TRUE),
('AUTO', 'Automotive Systems', 'Vehicle Systems and Maintenance', 4, TRUE),
('MECH', 'Mechanical Systems', 'Mechanical Engineering Principles', 3, TRUE);

-- Insert demo users
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, is_active) VALUES
('admin', 'admin@school.rw', '$2a$10$defaulthash', 'System', 'Administrator', '+250788000001', 
 (SELECT id FROM roles WHERE name = 'admin'), TRUE),
('dos', 'dos@school.rw', '$2a$10$defaulthash', 'Director', 'of Study', '+250788000002', 
 (SELECT id FROM roles WHERE name = 'director_of_study'), TRUE),
('teacher1', 'teacher1@school.rw', '$2a$10$defaulthash', 'Jean', 'Mugabo', '+250788000003', 
 (SELECT id FROM roles WHERE name = 'teacher'), TRUE),
('teacher2', 'teacher2@school.rw', '$2a$10$defaulthash', 'Marie', 'Uwase', '+250788000004', 
 (SELECT id FROM roles WHERE name = 'teacher'), TRUE);

-- Create some trade classes
INSERT INTO trade_classes (trade_level_id, academic_year_id, class_name, capacity) VALUES
((SELECT id FROM trade_levels WHERE trade_code = 'SOD' AND level_number = 3 LIMIT 1), 
 (SELECT id FROM academic_years WHERE is_active = TRUE LIMIT 1), 'SOD3-A', 30),
((SELECT id FROM trade_levels WHERE trade_code = 'SOD' AND level_number = 4 LIMIT 1), 
 (SELECT id FROM academic_years WHERE is_active = TRUE LIMIT 1), 'SOD4-A', 30),
((SELECT id FROM trade_levels WHERE trade_code = 'BDC' AND level_number = 3 LIMIT 1), 
 (SELECT id FROM academic_years WHERE is_active = TRUE LIMIT 1), 'BDC3-A', 30),
((SELECT id FROM trade_levels WHERE trade_code = 'AUT' AND level_number = 3 LIMIT 1), 
 (SELECT id FROM academic_years WHERE is_active = TRUE LIMIT 1), 'AUT3-A', 30);

-- Insert some demo students
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, date_of_birth, gender, role_id, student_id, is_active) VALUES
('2024SOD3001', 'student1@school.rw', '$2a$10$defaulthash', 'Alice', 'Uwimana', '+250788001001', '2005-03-15', 'Female', 
 (SELECT id FROM roles WHERE name = 'student'), '2024SOD3001', TRUE),
('2024SOD3002', 'student2@school.rw', '$2a$10$defaulthash', 'Bob', 'Nkusi', '+250788001002', '2005-07-22', 'Male', 
 (SELECT id FROM roles WHERE name = 'student'), '2024SOD3002', TRUE),
('2024BDC3001', 'student3@school.rw', '$2a$10$defaulthash', 'Claire', 'Mukamana', '+250788001003', '2005-01-10', 'Female', 
 (SELECT id FROM roles WHERE name = 'student'), '2024BDC3001', TRUE),
('2024AUT3001', 'student4@school.rw', '$2a$10$defaulthash', 'David', 'Habimana', '+250788001004', '2005-09-05', 'Male', 
 (SELECT id FROM roles WHERE name = 'student'), '2024AUT3001', TRUE);

-- Enroll students in classes
INSERT INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status) VALUES
((SELECT id FROM users WHERE student_id = '2024SOD3001'), 
 (SELECT id FROM trade_classes WHERE class_name = 'SOD3-A'), 
 (SELECT id FROM academic_years WHERE is_active = TRUE), '2024-09-01', 'active'),
((SELECT id FROM users WHERE student_id = '2024SOD3002'), 
 (SELECT id FROM trade_classes WHERE class_name = 'SOD3-A'), 
 (SELECT id FROM academic_years WHERE is_active = TRUE), '2024-09-01', 'active'),
((SELECT id FROM users WHERE student_id = '2024BDC3001'), 
 (SELECT id FROM trade_classes WHERE class_name = 'BDC3-A'), 
 (SELECT id FROM academic_years WHERE is_active = TRUE), '2024-09-01', 'active'),
((SELECT id FROM users WHERE student_id = '2024AUT3001'), 
 (SELECT id FROM trade_classes WHERE class_name = 'AUT3-A'), 
 (SELECT id FROM academic_years WHERE is_active = TRUE), '2024-09-01', 'active');

-- Update class enrollment counts
UPDATE trade_classes SET current_enrollment = (
    SELECT COUNT(*) FROM enrollments WHERE class_id = trade_classes.id AND status = 'active'
);

-- Insert some sample grades
INSERT INTO grades (student_id, subject_id, teacher_id, trade_class_id, academic_year_id, assessment_type, assessment_name, max_marks, obtained_marks, assessment_date) VALUES
((SELECT id FROM users WHERE student_id = '2024SOD3001'), 
 (SELECT id FROM subjects WHERE code = 'MATH'), 
 (SELECT id FROM users WHERE username = 'teacher1'), 
 (SELECT id FROM trade_classes WHERE class_name = 'SOD3-A'), 
 (SELECT id FROM academic_years WHERE is_active = TRUE), 
 'test', 'Mid-term Test', 100, 85, '2024-11-15'),
((SELECT id FROM users WHERE student_id = '2024SOD3001'), 
 (SELECT id FROM subjects WHERE code = 'PROG'), 
 (SELECT id FROM users WHERE username = 'teacher2'), 
 (SELECT id FROM trade_classes WHERE class_name = 'SOD3-A'), 
 (SELECT id FROM academic_years WHERE is_active = TRUE), 
 'assignment', 'Programming Assignment 1', 50, 42, '2024-11-20');

-- Insert some attendance records
INSERT INTO attendance (student_id, trade_class_id, subject_id, teacher_id, attendance_date, period_number, status, marked_by) VALUES
((SELECT id FROM users WHERE student_id = '2024SOD3001'), 
 (SELECT id FROM trade_classes WHERE class_name = 'SOD3-A'), 
 (SELECT id FROM subjects WHERE code = 'MATH'), 
 (SELECT id FROM users WHERE username = 'teacher1'), 
 '2024-12-01', 1, 'present', 
 (SELECT id FROM users WHERE username = 'teacher1')),
((SELECT id FROM users WHERE student_id = '2024SOD3002'), 
 (SELECT id FROM trade_classes WHERE class_name = 'SOD3-A'), 
 (SELECT id FROM subjects WHERE code = 'MATH'), 
 (SELECT id FROM users WHERE username = 'teacher1'), 
 '2024-12-01', 1, 'present', 
 (SELECT id FROM users WHERE username = 'teacher1'));

-- Insert some conduct records
INSERT INTO conduct_records (student_id, trade_class_id, incident_type, severity, title, description, incident_date, reported_by, points_awarded, status) VALUES
((SELECT id FROM users WHERE student_id = '2024SOD3001'), 
 (SELECT id FROM trade_classes WHERE class_name = 'SOD3-A'), 
 'positive', 'low', 'Excellent Participation', 'Student showed excellent participation in class discussion', 
 '2024-12-01 10:00:00', 
 (SELECT id FROM users WHERE username = 'teacher1'), 5, 'resolved');

COMMIT;
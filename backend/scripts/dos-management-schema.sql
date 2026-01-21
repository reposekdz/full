-- DOS Management System Additional Tables
-- Extends the existing comprehensive schema for DOS-specific functionality

SET FOREIGN_KEY_CHECKS = 0;

-- Drop DOS specific tables if they exist
DROP TABLE IF EXISTS conduct_records;
DROP TABLE IF EXISTS teacher_class_assignments;
DROP TABLE IF EXISTS class_performance_analytics;
DROP TABLE IF EXISTS student_performance_summary;
DROP TABLE IF EXISTS timetable_sessions;
DROP TABLE IF EXISTS trade_levels;
DROP TABLE IF EXISTS trade_classes;

SET FOREIGN_KEY_CHECKS = 1;

-- ===============================
-- TRADE AND CLASS STRUCTURE
-- ===============================

-- Trade levels (BDC, SOD, AUT with specific level structure)
CREATE TABLE trade_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_code VARCHAR(10) NOT NULL,
    trade_name VARCHAR(100) NOT NULL,
    level_number INT NOT NULL,
    level_suffix VARCHAR(10) DEFAULT NULL, -- For A, B classes in Level 4 & 5
    full_name VARCHAR(150) NOT NULL,
    description TEXT,
    capacity INT DEFAULT 25,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_trade_level (trade_code, level_number, level_suffix)
);

-- Trade-specific classes
CREATE TABLE trade_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_level_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    main_teacher_id INT NULL,
    assistant_teacher_id INT NULL,
    classroom VARCHAR(50),
    capacity INT DEFAULT 25,
    current_enrollment INT DEFAULT 0,
    performance_average DECIMAL(5,2) DEFAULT 0.00,
    attendance_average DECIMAL(5,2) DEFAULT 0.00,
    conduct_average DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_level_id) REFERENCES trade_levels(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (main_teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assistant_teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_trade_class (trade_level_id, academic_year_id, class_name)
);

-- ===============================
-- TEACHER MANAGEMENT
-- ===============================

-- Teacher class assignments
CREATE TABLE teacher_class_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    subject_id INT NOT NULL,
    assignment_type ENUM('main', 'assistant', 'subject_specialist') DEFAULT 'subject_specialist',
    start_date DATE NOT NULL,
    end_date DATE NULL,
    is_active BOOLEAN DEFAULT true,
    assigned_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_teacher_class_subject (teacher_id, trade_class_id, subject_id)
);

-- ===============================
-- TIMETABLE MANAGEMENT
-- ===============================

-- Enhanced timetable sessions
CREATE TABLE timetable_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    session_type ENUM('theory', 'practical', 'workshop', 'laboratory') DEFAULT 'theory',
    equipment_needed TEXT,
    is_active BOOLEAN DEFAULT true,
    academic_year_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE KEY unique_class_period (trade_class_id, day_of_week, period_number, academic_year_id)
);

-- ===============================
-- CONDUCT AND DISCIPLINE
-- ===============================

-- Enhanced conduct records
CREATE TABLE conduct_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    incident_type ENUM('positive', 'negative', 'neutral') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100),
    incident_date DATETIME NOT NULL,
    reported_by INT NOT NULL,
    witness_ids JSON NULL,
    action_taken VARCHAR(500),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE NULL,
    status ENUM('pending', 'investigating', 'resolved', 'escalated', 'closed') DEFAULT 'pending',
    points_awarded INT DEFAULT 0, -- Positive points for good conduct
    points_deducted INT DEFAULT 0, -- Negative points for misconduct
    parent_notified BOOLEAN DEFAULT false,
    parent_notified_at TIMESTAMP NULL,
    admin_reviewed BOOLEAN DEFAULT false,
    admin_reviewed_by INT NULL,
    admin_reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (admin_reviewed_by) REFERENCES users(id)
);

-- ===============================
-- PERFORMANCE ANALYTICS
-- ===============================

-- Student performance summary (updated automatically)
CREATE TABLE student_performance_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    total_subjects INT DEFAULT 0,
    average_grade DECIMAL(5,2) DEFAULT 0.00,
    total_credits DECIMAL(5,2) DEFAULT 0.00,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    conduct_score DECIMAL(5,2) DEFAULT 0.00,
    total_conduct_points INT DEFAULT 0,
    positive_conducts INT DEFAULT 0,
    negative_conducts INT DEFAULT 0,
    rank_in_class INT DEFAULT 0,
    rank_in_trade INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE KEY unique_student_performance (student_id, trade_class_id, academic_year_id)
);

-- Class performance analytics (updated automatically)
CREATE TABLE class_performance_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    total_students INT DEFAULT 0,
    average_grade DECIMAL(5,2) DEFAULT 0.00,
    average_attendance DECIMAL(5,2) DEFAULT 0.00,
    average_conduct_score DECIMAL(5,2) DEFAULT 0.00,
    top_performer_id INT NULL,
    improvement_needed INT DEFAULT 0,
    excellent_students INT DEFAULT 0,
    good_students INT DEFAULT 0,
    average_students INT DEFAULT 0,
    poor_students INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (top_performer_id) REFERENCES users(id),
    UNIQUE KEY unique_class_analytics (trade_class_id, academic_year_id)
);

-- ===============================
-- INSERT SAMPLE DATA
-- ===============================

-- Insert trade levels
INSERT INTO trade_levels (trade_code, trade_name, level_number, level_suffix, full_name, description) VALUES
('BDC', 'Building and Construction', 3, NULL, 'Level 3 BDC', 'Basic building and construction skills'),
('BDC', 'Building and Construction', 4, 'A', 'Level 4A BDC', 'Intermediate building and construction - Class A'),
('BDC', 'Building and Construction', 4, 'B', 'Level 4B BDC', 'Intermediate building and construction - Class B'),
('BDC', 'Building and Construction', 5, 'A', 'Level 5A BDC', 'Advanced building and construction - Class A'),
('BDC', 'Building and Construction', 5, 'B', 'Level 5B BDC', 'Advanced building and construction - Class B'),

('SOD', 'Software Development', 3, NULL, 'Level 3 SOD', 'Basic software development and programming'),
('SOD', 'Software Development', 4, 'A', 'Level 4A SOD', 'Intermediate software development - Class A'),
('SOD', 'Software Development', 4, 'B', 'Level 4B SOD', 'Intermediate software development - Class B'),
('SOD', 'Software Development', 5, 'A', 'Level 5A SOD', 'Advanced software development - Class A'),
('SOD', 'Software Development', 5, 'B', 'Level 5B SOD', 'Advanced software development - Class B'),

('AUT', 'Automotive', 3, NULL, 'Level 3 AUT', 'Basic automotive maintenance and repair'),
('AUT', 'Automotive', 4, 'A', 'Level 4A AUT', 'Intermediate automotive technology - Class A'),
('AUT', 'Automotive', 4, 'B', 'Level 4B AUT', 'Intermediate automotive technology - Class B'),
('AUT', 'Automotive', 5, 'A', 'Level 5A AUT', 'Advanced automotive technology - Class A'),
('AUT', 'Automotive', 5, 'B', 'Level 5B AUT', 'Advanced automotive technology - Class B');

-- Create indexes for better performance
CREATE INDEX idx_conduct_student_date ON conduct_records (student_id, incident_date);
CREATE INDEX idx_conduct_class_status ON conduct_records (trade_class_id, status);
CREATE INDEX idx_performance_student ON student_performance_summary (student_id, academic_year_id);
CREATE INDEX idx_performance_class ON class_performance_analytics (trade_class_id, academic_year_id);
CREATE INDEX idx_timetable_class_day ON timetable_sessions (trade_class_id, day_of_week);
CREATE INDEX idx_teacher_assignments ON teacher_class_assignments (teacher_id, is_active);

SET FOREIGN_KEY_CHECKS = 1;
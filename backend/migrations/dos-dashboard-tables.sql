-- DOS Dashboard Ultra Advanced Database Migration
-- Comprehensive tables for Director of Studies Management System

-- SMS Notifications Table
CREATE TABLE IF NOT EXISTS sms_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(50) UNIQUE,
    recipient_type ENUM('all', 'students', 'parents', 'teachers', 'specific') NOT NULL,
    recipient_count INT DEFAULT 0,
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sent_at (sent_at),
    INDEX idx_status (status)
);

-- Report Cards Table
CREATE TABLE IF NOT EXISTS report_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    trade_code VARCHAR(10),
    level_number INT,
    level_suffix VARCHAR(5),
    term INT DEFAULT 1,
    academic_year INT DEFAULT YEAR(CURDATE()),
    total_score DECIMAL(10,2) DEFAULT 0,
    average_score DECIMAL(10,2) DEFAULT 0,
    gpa DECIMAL(4,2) DEFAULT 0,
    rank_position INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    include_ranks TINYINT(1) DEFAULT 0,
    include_teacher_comments TINYINT(1) DEFAULT 0,
    include_dos_comments TINYINT(1) DEFAULT 0,
    include_attendance TINYINT(1) DEFAULT 0,
    generated_by VARCHAR(100),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    INDEX idx_student_id (student_id),
    INDEX idx_trade_level (trade_code, level_number),
    INDEX idx_academic_year (academic_year),
    INDEX idx_status (status)
);

-- Report Card Marks Table
CREATE TABLE IF NOT EXISTS report_card_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_card_id VARCHAR(50) NOT NULL,
    student_id INT NOT NULL,
    course_id INT,
    course_name VARCHAR(100),
    quiz_score DECIMAL(5,2) DEFAULT 0,
    midterm_score DECIMAL(5,2) DEFAULT 0,
    final_score DECIMAL(5,2) DEFAULT 0,
    total_score DECIMAL(5,2) DEFAULT 0,
    grade VARCHAR(5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_card_id (report_card_id),
    INDEX idx_student_id (student_id)
);

-- Timetables Table
CREATE TABLE IF NOT EXISTS timetables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_id INT,
    teacher_name VARCHAR(100),
    room VARCHAR(50),
    trade_code VARCHAR(10),
    level_number INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_day_period (day_of_week, period_number),
    INDEX idx_class_id (class_id),
    INDEX idx_status (status)
);

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    trade_code VARCHAR(10),
    level_number INT,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    duration INT DEFAULT 120,
    room VARCHAR(50),
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_exam_date (exam_date),
    INDEX idx_status (status)
);

-- Curriculum Progress Table
CREATE TABLE IF NOT EXISTS teacher_curriculum_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    subject_id INT,
    topic_id INT,
    topic_name VARCHAR(100),
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    status ENUM('in_progress', 'completed', 'pending') DEFAULT 'in_progress',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_class_id (class_id)
);

-- Insert default SMS notification template
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) 
VALUES ('sms_notification_template', '{"welcome": "Welcome to Garden TVET School!", "attendance": "Your child was absent today", "exam": "Exam reminder: {exam_name} on {date}"}', 'SMS Notification Templates');

-- Insert sample data for demonstration
INSERT INTO sms_notifications (notification_id, recipient_type, recipient_count, message, status, sent_at) VALUES
('SMS-001', 'all', 150, 'Welcome to Garden TVET School! Your academic journey starts here.', 'delivered', NOW() - INTERVAL 1 DAY),
('SMS-002', 'parents', 80, 'Reminder: Parent-Teacher meeting scheduled for Friday at 2 PM.', 'delivered', NOW() - INTERVAL 2 DAY),
('SMS-003', 'students', 120, 'Final examinations start next week. Please prepare accordingly.', 'delivered', NOW() - INTERVAL 3 DAY);

-- Insert sample exams
INSERT INTO exams (exam_name, subject, trade_code, level_number, exam_date, start_time, duration, status) VALUES
('Mid-Term Exam', 'Mathematics', 'SOD', 2, CURDATE() + INTERVAL 7 DAY, '09:00:00', 120, 'scheduled'),
('Practical Exam', 'Automotive Basics', 'AUT', 1, CURDATE() + INTERVAL 10 DAY, '10:00:00', 180, 'scheduled'),
('Final Exam', 'Building Construction', 'BDC', 3, CURDATE() + INTERVAL 14 DAY, '08:00:00', 180, 'scheduled');

-- Insert sample timetables
INSERT INTO timetables (day_of_week, period_number, start_time, end_time, subject, teacher_name, room, trade_code, level_number, status) VALUES
('Monday', 1, '07:30', '08:30', 'Mathematics', 'Mr. John', 'Room 101', 'SOD', 1, 'active'),
('Monday', 2, '08:30', '09:30', 'English', 'Ms. Jane', 'Room 102', 'SOD', 1, 'active'),
('Monday', 3, '09:30', '10:30', 'Physics', 'Mr. Bob', 'Lab 1', 'SOD', 1, 'active'),
('Monday', 4, '11:00', '12:00', 'Programming', 'Mr. Smith', 'Computer Lab', 'SOD', 1, 'active'),
('Monday', 5, '12:00', '13:00', 'History', 'Mrs. Brown', 'Room 103', 'SOD', 1, 'active');

SELECT 'DOS Dashboard tables created/verified successfully!' AS status;

-- ===============================
-- ENHANCED POWERFUL SCHOOL MANAGEMENT SYSTEM SCHEMA
-- Features: Trade Management, Teacher Assignments, Timetable Generation, Comprehensive Reports
-- ===============================

-- ===============================
-- ENHANCED TEACHER ASSIGNMENTS
-- ===============================

-- Class teacher assignments (separate from subject teaching)
CREATE TABLE IF NOT EXISTS class_teacher_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    assignment_date DATE NOT NULL,
    end_date DATE,
    responsibilities TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_class_teacher (trade_class_id, academic_year_id, is_active),
    INDEX idx_teacher (teacher_id),
    INDEX idx_class (trade_class_id),
    INDEX idx_active (is_active)
);

-- Enhanced teacher subject assignments with more details
CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    trade_level_id INT NOT NULL,
    assignment_type ENUM('primary', 'secondary', 'substitute') DEFAULT 'primary',
    weekly_periods INT DEFAULT 0,
    assignment_date DATE NOT NULL,
    end_date DATE,
    assigned_by INT NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_level_id) REFERENCES trade_levels(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_subject (subject_id),
    INDEX idx_class (trade_class_id),
    INDEX idx_level (trade_level_id),
    INDEX idx_active (is_active)
);

-- ===============================
-- ADVANCED TIMETABLE SYSTEM
-- ===============================

-- Timetable templates for easy generation
CREATE TABLE IF NOT EXISTS timetable_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_periods_per_day INT DEFAULT 8,
    period_duration_minutes INT DEFAULT 45,
    break_periods JSON,
    start_time TIME DEFAULT '08:00:00',
    end_time TIME DEFAULT '16:00:00',
    working_days JSON,
    is_default BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_default (is_default)
);

-- Enhanced timetable with conflict detection
CREATE TABLE IF NOT EXISTS timetables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trade_class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    template_id INT,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    room_type ENUM('classroom', 'laboratory', 'workshop', 'computer_lab', 'library', 'sports_hall') DEFAULT 'classroom',
    session_type ENUM('theory', 'practical', 'workshop', 'laboratory', 'sports', 'arts') DEFAULT 'theory',
    requires_equipment BOOLEAN DEFAULT FALSE,
    equipment_details TEXT,
    max_students INT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES timetable_templates(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_class_time (trade_class_id, day_of_week, period_number, is_active),
    UNIQUE KEY unique_teacher_time (teacher_id, day_of_week, period_number, is_active),
    UNIQUE KEY unique_room_time (room, day_of_week, period_number, is_active),
    INDEX idx_class (trade_class_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_day (day_of_week),
    INDEX idx_active (is_active)
);

-- Timetable change history
CREATE TABLE IF NOT EXISTS timetable_change_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    timetable_id INT NOT NULL,
    change_type ENUM('created', 'updated', 'deleted', 'swapped') NOT NULL,
    old_values JSON,
    new_values JSON,
    reason TEXT,
    changed_by INT NOT NULL,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_timetable (timetable_id),
    INDEX idx_date (change_date)
);

-- ===============================
-- COMPREHENSIVE ASSESSMENT & MARKS SYSTEM
-- ===============================

-- Assessment categories with weights
CREATE TABLE IF NOT EXISTS assessment_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL,
    weight_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);

-- Comprehensive student marks from all sources
CREATE TABLE IF NOT EXISTS student_marks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    assessment_category_id INT NOT NULL,
    assessment_name VARCHAR(200) NOT NULL,
    max_marks DECIMAL(6,2) NOT NULL,
    obtained_marks DECIMAL(6,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((obtained_marks / max_marks) * 100) STORED,
    assessment_date DATE NOT NULL,
    teacher_id INT NOT NULL,
    source_type ENUM('quiz', 'assignment', 'homework', 'exam', 'project', 'practical', 'oral', 'holiday_package') NOT NULL,
    source_id INT,
    remarks TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_category_id) REFERENCES assessment_categories(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_subject (subject_id),
    INDEX idx_class (trade_class_id),
    INDEX idx_category (assessment_category_id),
    INDEX idx_source (source_type, source_id),
    INDEX idx_date (assessment_date)
);

-- Subject summary for each student
CREATE TABLE IF NOT EXISTS student_subject_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    term_id INT,
    total_assessments INT DEFAULT 0,
    total_marks_obtained DECIMAL(8,2) DEFAULT 0,
    total_max_marks DECIMAL(8,2) DEFAULT 0,
    average_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_max_marks > 0 THEN (total_marks_obtained / total_max_marks) * 100 
            ELSE 0 
        END
    ) STORED,
    grade_letter VARCHAR(5),
    quiz_average DECIMAL(5,2) DEFAULT 0,
    assignment_average DECIMAL(5,2) DEFAULT 0,
    exam_average DECIMAL(5,2) DEFAULT 0,
    practical_average DECIMAL(5,2) DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    class_rank INT,
    level_rank INT,
    teacher_comment TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_subject (student_id, subject_id, trade_class_id, academic_year_id, term_id),
    INDEX idx_student (student_id),
    INDEX idx_subject (subject_id),
    INDEX idx_class (trade_class_id),
    INDEX idx_average (average_percentage)
);

-- Overall student report
CREATE TABLE IF NOT EXISTS student_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    term_id INT,
    report_type ENUM('mid_term', 'end_term', 'annual', 'progress') DEFAULT 'end_term',
    total_subjects INT DEFAULT 0,
    total_marks_obtained DECIMAL(10,2) DEFAULT 0,
    total_max_marks DECIMAL(10,2) DEFAULT 0,
    overall_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_max_marks > 0 THEN (total_marks_obtained / total_max_marks) * 100 
            ELSE 0 
        END
    ) STORED,
    overall_grade VARCHAR(5),
    class_rank INT,
    level_rank INT,
    total_students_in_class INT,
    total_students_in_level INT,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    days_present INT DEFAULT 0,
    days_absent INT DEFAULT 0,
    conduct_grade VARCHAR(5),
    principal_comment TEXT,
    class_teacher_comment TEXT,
    dos_comment TEXT,
    strengths JSON,
    areas_for_improvement JSON,
    next_term_start_date DATE,
    report_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    UNIQUE KEY unique_student_report (student_id, trade_class_id, academic_year_id, term_id, report_type),
    INDEX idx_student (student_id),
    INDEX idx_class (trade_class_id),
    INDEX idx_rank (class_rank),
    INDEX idx_percentage (overall_percentage),
    INDEX idx_published (is_published)
);

-- Report subject details
CREATE TABLE IF NOT EXISTS report_subject_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    max_marks DECIMAL(6,2) NOT NULL,
    obtained_marks DECIMAL(6,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((obtained_marks / max_marks) * 100) STORED,
    grade_letter VARCHAR(5),
    class_average DECIMAL(5,2),
    highest_in_class DECIMAL(6,2),
    position_in_subject INT,
    teacher_comment TEXT,
    assessment_breakdown JSON,
    FOREIGN KEY (report_id) REFERENCES student_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    INDEX idx_report (report_id),
    INDEX idx_subject (subject_id)
);

-- ===============================
-- GRADING SYSTEM
-- ===============================

-- Grading scale configuration
CREATE TABLE IF NOT EXISTS grading_scales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    min_percentage DECIMAL(5,2) NOT NULL,
    max_percentage DECIMAL(5,2) NOT NULL,
    grade_letter VARCHAR(5) NOT NULL,
    grade_point DECIMAL(3,2),
    description VARCHAR(100),
    is_passing BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_percentage (min_percentage, max_percentage),
    INDEX idx_default (is_default)
);

-- ===============================
-- TERMS/SEMESTERS
-- ===============================

-- Academic terms
CREATE TABLE IF NOT EXISTS academic_terms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    academic_year_id INT NOT NULL,
    term_name VARCHAR(50) NOT NULL,
    term_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    INDEX idx_academic_year (academic_year_id),
    INDEX idx_active (is_active)
);

-- ===============================
-- INNOVATIVE FEATURES
-- ===============================

-- Student progress tracking
CREATE TABLE IF NOT EXISTS student_progress_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    week_number INT NOT NULL,
    month_number INT NOT NULL,
    topics_covered JSON,
    skills_acquired JSON,
    challenges_faced JSON,
    improvement_percentage DECIMAL(5,2) DEFAULT 0,
    teacher_notes TEXT,
    tracked_by INT NOT NULL,
    tracking_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (tracked_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_subject (subject_id),
    INDEX idx_date (tracking_date)
);

-- Parent engagement tracking
CREATE TABLE IF NOT EXISTS parent_engagement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    parent_id INT NOT NULL,
    engagement_type ENUM('meeting', 'report_viewed', 'email', 'call', 'portal_login') NOT NULL,
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    status ENUM('scheduled', 'completed', 'cancelled', 'missed') DEFAULT 'scheduled',
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_parent (parent_id),
    INDEX idx_type (engagement_type)
);

-- Teacher workload tracking
CREATE TABLE IF NOT EXISTS teacher_workload (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    total_classes INT DEFAULT 0,
    total_subjects INT DEFAULT 0,
    total_students INT DEFAULT 0,
    weekly_periods INT DEFAULT 0,
    class_teacher_assignments INT DEFAULT 0,
    extra_responsibilities JSON,
    workload_score DECIMAL(5,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_year (teacher_id, academic_year_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_workload (workload_score)
);

-- Report templates
CREATE TABLE IF NOT EXISTS report_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100) NOT NULL,
    template_type ENUM('student_report', 'class_summary', 'subject_analysis', 'teacher_performance') NOT NULL,
    layout_config JSON NOT NULL,
    include_graphs BOOLEAN DEFAULT TRUE,
    include_comments BOOLEAN DEFAULT TRUE,
    include_attendance BOOLEAN DEFAULT TRUE,
    include_conduct BOOLEAN DEFAULT TRUE,
    custom_fields JSON,
    is_default BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_type (template_type),
    INDEX idx_default (is_default)
);

-- ===============================
-- INSERT DEFAULT DATA
-- ===============================

-- Insert default assessment categories
INSERT INTO assessment_categories (name, code, weight_percentage, description) VALUES
('Online Quizzes', 'QUIZ', 20.00, 'Regular online quizzes and tests'),
('Assignments', 'ASSIGN', 20.00, 'Homework and class assignments'),
('Practical Work', 'PRACT', 15.00, 'Practical and laboratory work'),
('Mid-term Exam', 'MIDTERM', 20.00, 'Mid-term examination'),
('Final Exam', 'FINAL', 25.00, 'Final/End-term examination'),
('Holiday Packages', 'HOLIDAY', 5.00, 'Holiday learning packages'),
('Projects', 'PROJECT', 10.00, 'Student projects and presentations'),
('Oral Assessment', 'ORAL', 5.00, 'Oral examinations and presentations')
ON DUPLICATE KEY UPDATE name=name;

-- Insert default grading scale
INSERT INTO grading_scales (name, min_percentage, max_percentage, grade_letter, grade_point, description, is_passing, is_default) VALUES
('Excellent', 90.00, 100.00, 'A+', 4.00, 'Outstanding', TRUE, TRUE),
('Very Good', 80.00, 89.99, 'A', 3.75, 'Excellent performance', TRUE, TRUE),
('Good', 70.00, 79.99, 'B+', 3.50, 'Very good performance', TRUE, TRUE),
('Above Average', 60.00, 69.99, 'B', 3.00, 'Good performance', TRUE, TRUE),
('Average', 50.00, 59.99, 'C', 2.50, 'Satisfactory', TRUE, TRUE),
('Below Average', 40.00, 49.99, 'D', 2.00, 'Pass but needs improvement', TRUE, TRUE),
('Fail', 0.00, 39.99, 'F', 0.00, 'Failed', FALSE, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Insert default timetable template
INSERT INTO timetable_templates (name, description, total_periods_per_day, period_duration_minutes, break_periods, start_time, end_time, working_days, is_default, created_by)
SELECT 
    'Standard School Day',
    'Default 8-period school day with breaks',
    8,
    45,
    JSON_ARRAY(
        JSON_OBJECT('period', 3, 'name', 'Morning Break', 'duration', 15),
        JSON_OBJECT('period', 5, 'name', 'Lunch Break', 'duration', 60)
    ),
    '08:00:00',
    '16:00:00',
    JSON_ARRAY('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'),
    TRUE,
    1
WHERE NOT EXISTS (SELECT 1 FROM timetable_templates WHERE is_default = TRUE);

-- ===============================
-- STORED PROCEDURES FOR AUTOMATION
-- ===============================

DELIMITER //

-- Procedure to calculate and update student subject summary
CREATE PROCEDURE IF NOT EXISTS UpdateStudentSubjectSummary(
    IN p_student_id INT,
    IN p_subject_id INT,
    IN p_trade_class_id INT,
    IN p_academic_year_id INT,
    IN p_term_id INT
)
BEGIN
    DECLARE v_total_assessments INT;
    DECLARE v_total_obtained DECIMAL(8,2);
    DECLARE v_total_max DECIMAL(8,2);
    DECLARE v_quiz_avg DECIMAL(5,2);
    DECLARE v_assignment_avg DECIMAL(5,2);
    DECLARE v_exam_avg DECIMAL(5,2);
    DECLARE v_practical_avg DECIMAL(5,2);
    
    SELECT 
        COUNT(*),
        COALESCE(SUM(obtained_marks), 0),
        COALESCE(SUM(max_marks), 0)
    INTO 
        v_total_assessments,
        v_total_obtained,
        v_total_max
    FROM student_marks
    WHERE student_id = p_student_id 
        AND subject_id = p_subject_id
        AND trade_class_id = p_trade_class_id
        AND academic_year_id = p_academic_year_id;
    
    SELECT COALESCE(AVG(percentage), 0) INTO v_quiz_avg
    FROM student_marks
    WHERE student_id = p_student_id AND subject_id = p_subject_id 
        AND source_type = 'quiz';
    
    SELECT COALESCE(AVG(percentage), 0) INTO v_assignment_avg
    FROM student_marks
    WHERE student_id = p_student_id AND subject_id = p_subject_id 
        AND source_type = 'assignment';
    
    SELECT COALESCE(AVG(percentage), 0) INTO v_exam_avg
    FROM student_marks
    WHERE student_id = p_student_id AND subject_id = p_subject_id 
        AND source_type = 'exam';
    
    SELECT COALESCE(AVG(percentage), 0) INTO v_practical_avg
    FROM student_marks
    WHERE student_id = p_student_id AND subject_id = p_subject_id 
        AND source_type = 'practical';
    
    INSERT INTO student_subject_summary (
        student_id, subject_id, trade_class_id, academic_year_id, term_id,
        total_assessments, total_marks_obtained, total_max_marks,
        quiz_average, assignment_average, exam_average, practical_average
    ) VALUES (
        p_student_id, p_subject_id, p_trade_class_id, p_academic_year_id, p_term_id,
        v_total_assessments, v_total_obtained, v_total_max,
        v_quiz_avg, v_assignment_avg, v_exam_avg, v_practical_avg
    )
    ON DUPLICATE KEY UPDATE
        total_assessments = v_total_assessments,
        total_marks_obtained = v_total_obtained,
        total_max_marks = v_total_max,
        quiz_average = v_quiz_avg,
        assignment_average = v_assignment_avg,
        exam_average = v_exam_avg,
        practical_average = v_practical_avg;
END//

-- Procedure to calculate class ranks
CREATE PROCEDURE IF NOT EXISTS CalculateClassRanks(
    IN p_trade_class_id INT,
    IN p_academic_year_id INT,
    IN p_term_id INT
)
BEGIN
    UPDATE student_reports sr1
    SET class_rank = (
        SELECT COUNT(*) + 1
        FROM student_reports sr2
        WHERE sr2.trade_class_id = p_trade_class_id
            AND sr2.academic_year_id = p_academic_year_id
            AND sr2.term_id = p_term_id
            AND sr2.overall_percentage > sr1.overall_percentage
    )
    WHERE sr1.trade_class_id = p_trade_class_id
        AND sr1.academic_year_id = p_academic_year_id
        AND sr1.term_id = p_term_id;
END//

-- Procedure to generate comprehensive student report
CREATE PROCEDURE IF NOT EXISTS GenerateStudentReport(
    IN p_student_id INT,
    IN p_trade_class_id INT,
    IN p_academic_year_id INT,
    IN p_term_id INT,
    IN p_report_type VARCHAR(20),
    IN p_generated_by INT
)
BEGIN
    DECLARE v_total_subjects INT;
    DECLARE v_total_obtained DECIMAL(10,2);
    DECLARE v_total_max DECIMAL(10,2);
    DECLARE v_days_present INT;
    DECLARE v_days_absent INT;
    DECLARE v_report_id INT;
    
    SELECT 
        COUNT(DISTINCT subject_id),
        COALESCE(SUM(total_marks_obtained), 0),
        COALESCE(SUM(total_max_marks), 0)
    INTO 
        v_total_subjects,
        v_total_obtained,
        v_total_max
    FROM student_subject_summary
    WHERE student_id = p_student_id
        AND trade_class_id = p_trade_class_id
        AND academic_year_id = p_academic_year_id
        AND term_id = p_term_id;
    
    SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END),
        COUNT(CASE WHEN status = 'absent' THEN 1 END)
    INTO v_days_present, v_days_absent
    FROM attendance
    WHERE student_id = p_student_id
        AND academic_year_id = p_academic_year_id;
    
    INSERT INTO student_reports (
        student_id, trade_class_id, academic_year_id, term_id,
        report_type, total_subjects, total_marks_obtained, total_max_marks,
        days_present, days_absent,
        attendance_percentage, generated_by
    ) VALUES (
        p_student_id, p_trade_class_id, p_academic_year_id, p_term_id,
        p_report_type, v_total_subjects, v_total_obtained, v_total_max,
        v_days_present, v_days_absent,
        CASE WHEN (v_days_present + v_days_absent) > 0 
            THEN (v_days_present * 100.0) / (v_days_present + v_days_absent)
            ELSE 0 END,
        p_generated_by
    )
    ON DUPLICATE KEY UPDATE
        total_subjects = v_total_subjects,
        total_marks_obtained = v_total_obtained,
        total_max_marks = v_total_max,
        days_present = v_days_present,
        days_absent = v_days_absent,
        attendance_percentage = CASE WHEN (v_days_present + v_days_absent) > 0 
            THEN (v_days_present * 100.0) / (v_days_present + v_days_absent)
            ELSE 0 END;
    
    SET v_report_id = LAST_INSERT_ID();
    
    INSERT INTO report_subject_details (
        report_id, subject_id, teacher_id, max_marks, obtained_marks, 
        grade_letter, teacher_comment
    )
    SELECT 
        v_report_id,
        sss.subject_id,
        tsa.teacher_id,
        sss.total_max_marks,
        sss.total_marks_obtained,
        sss.grade_letter,
        sss.teacher_comment
    FROM student_subject_summary sss
    JOIN teacher_subject_assignments tsa 
        ON tsa.subject_id = sss.subject_id 
        AND tsa.trade_class_id = sss.trade_class_id
    WHERE sss.student_id = p_student_id
        AND sss.trade_class_id = p_trade_class_id
        AND sss.academic_year_id = p_academic_year_id
        AND sss.term_id = p_term_id
    ON DUPLICATE KEY UPDATE
        obtained_marks = VALUES(obtained_marks),
        max_marks = VALUES(max_marks);
    
    CALL CalculateClassRanks(p_trade_class_id, p_academic_year_id, p_term_id);
END//

DELIMITER ;

-- ===============================
-- TRIGGERS
-- ===============================

DELIMITER //

-- Trigger to update subject summary when marks are added
CREATE TRIGGER IF NOT EXISTS after_student_marks_insert
AFTER INSERT ON student_marks
FOR EACH ROW
BEGIN
    CALL UpdateStudentSubjectSummary(
        NEW.student_id,
        NEW.subject_id,
        NEW.trade_class_id,
        NEW.academic_year_id,
        NULL
    );
END//

-- Trigger to update teacher workload
CREATE TRIGGER IF NOT EXISTS after_teacher_assignment_insert
AFTER INSERT ON teacher_subject_assignments
FOR EACH ROW
BEGIN
    INSERT INTO teacher_workload (
        teacher_id, academic_year_id, total_classes, total_subjects
    )
    SELECT 
        NEW.teacher_id,
        NEW.academic_year_id,
        COUNT(DISTINCT trade_class_id),
        COUNT(DISTINCT subject_id)
    FROM teacher_subject_assignments
    WHERE teacher_id = NEW.teacher_id
        AND academic_year_id = NEW.academic_year_id
        AND is_active = TRUE
    ON DUPLICATE KEY UPDATE
        total_classes = VALUES(total_classes),
        total_subjects = VALUES(total_subjects);
END//

DELIMITER ;

-- ===============================
-- INDEXES FOR PERFORMANCE
-- ===============================

-- Additional performance indexes
CREATE INDEX idx_marks_student_subject ON student_marks(student_id, subject_id, academic_year_id);
CREATE INDEX idx_marks_assessment ON student_marks(assessment_category_id, assessment_date);
CREATE INDEX idx_timetable_lookup ON timetables(trade_class_id, day_of_week, period_number);
CREATE INDEX idx_teacher_lookup ON teacher_subject_assignments(teacher_id, academic_year_id, is_active);
CREATE INDEX idx_report_lookup ON student_reports(student_id, academic_year_id, is_published);

-- ===============================
-- END OF ENHANCED SCHEMA
-- ===============================

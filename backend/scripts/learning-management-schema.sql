-- Powerful School Management System - Learning Management Features Schema
-- This schema supports assignments, quizzes, homework, online submissions, and real-time learning

-- ================================
-- ASSIGNMENT MANAGEMENT TABLES
-- ================================

-- Assignments table
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    assignment_type ENUM('homework', 'project', 'presentation', 'research', 'lab_work') DEFAULT 'homework',
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    instructions TEXT,
    attachments JSON NULL, -- Array of file URLs/metadata
    due_date DATETIME NOT NULL,
    submission_deadline DATETIME NOT NULL,
    allow_late_submission BOOLEAN DEFAULT false,
    late_submission_penalty DECIMAL(5,2) DEFAULT 0.00, -- Percentage penalty
    grading_rubric JSON NULL, -- Detailed grading criteria
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    INDEX idx_teacher_class (teacher_id, trade_class_id),
    INDEX idx_due_date (due_date),
    INDEX idx_published (is_published)
);

-- Assignment submissions
CREATE TABLE assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_content TEXT,
    attachments JSON NULL, -- Array of submitted files
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    late_days INT DEFAULT 0,
    status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'draft',
    marks_obtained DECIMAL(5,2) NULL,
    grade_letter VARCHAR(2) NULL,
    teacher_feedback TEXT NULL,
    graded_by INT NULL,
    graded_at TIMESTAMP NULL,
    plagiarism_score DECIMAL(5,2) DEFAULT 0.00,
    ai_detection_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id),
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_status (status),
    INDEX idx_graded (graded_by, graded_at)
);

-- ================================
-- QUIZ MANAGEMENT TABLES
-- ================================

-- Quizzes table
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    quiz_type ENUM('practice', 'assessment', 'exam', 'pop_quiz') DEFAULT 'assessment',
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    duration_minutes INT NOT NULL, -- Time limit
    instructions TEXT,
    questions JSON NOT NULL, -- Array of question objects
    answer_key JSON NOT NULL, -- Correct answers and explanations
    passing_score DECIMAL(5,2) DEFAULT 50.00, -- Minimum passing percentage
    allow_retake BOOLEAN DEFAULT false,
    max_attempts INT DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT true,
    shuffle_options BOOLEAN DEFAULT true,
    show_results_immediately BOOLEAN DEFAULT false,
    scheduled_date DATETIME NULL,
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    INDEX idx_teacher_class (teacher_id, trade_class_id),
    INDEX idx_scheduled (scheduled_date, start_time),
    INDEX idx_active (is_active)
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    student_id INT NOT NULL,
    attempt_number INT DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    time_taken_minutes INT NULL,
    answers JSON NOT NULL, -- Student's answers
    score DECIMAL(5,2) NULL,
    percentage DECIMAL(5,2) NULL,
    grade_letter VARCHAR(2) NULL,
    is_passed BOOLEAN NULL,
    status ENUM('in_progress', 'completed', 'timed_out', 'abandoned') DEFAULT 'in_progress',
    ip_address VARCHAR(45) NULL,
    browser_info JSON NULL,
    flagged_for_review BOOLEAN DEFAULT false,
    review_notes TEXT NULL,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    UNIQUE KEY unique_attempt (quiz_id, student_id, attempt_number),
    INDEX idx_status (status),
    INDEX idx_score (score)
);

-- ================================
-- HOMEWORK MANAGEMENT TABLES
-- ================================

-- Homework table
CREATE TABLE homework (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    homework_type ENUM('daily', 'weekly', 'monthly', 'revision', 'practice') DEFAULT 'daily',
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    instructions TEXT,
    resources JSON NULL, -- Additional learning materials
    due_date DATE NOT NULL,
    submission_required BOOLEAN DEFAULT true,
    peer_review_required BOOLEAN DEFAULT false,
    parent_notification BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    INDEX idx_teacher_class (teacher_id, trade_class_id),
    INDEX idx_due_date (due_date),
    INDEX idx_active (is_active)
);

-- Homework submissions
CREATE TABLE homework_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    homework_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_content TEXT,
    attachments JSON NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    status ENUM('pending', 'submitted', 'reviewed', 'graded') DEFAULT 'pending',
    marks_obtained DECIMAL(5,2) NULL,
    teacher_feedback TEXT NULL,
    peer_reviews JSON NULL, -- Reviews from classmates
    graded_by INT NULL,
    graded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id),
    UNIQUE KEY unique_submission (homework_id, student_id),
    INDEX idx_status (status)
);

-- ================================
-- HOLIDAY PACKAGES TABLES
-- ================================

-- Holiday packages
CREATE TABLE holiday_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INT NOT NULL,
    trade_class_id INT NOT NULL,
    package_type ENUM('revision', 'practice', 'project', 'reading', 'skill_building') DEFAULT 'revision',
    subject_id INT NULL,
    total_activities INT NOT NULL DEFAULT 1,
    estimated_duration_days INT DEFAULT 7,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    learning_objectives JSON NULL, -- Array of objectives
    resources JSON NOT NULL, -- Package materials
    instructions TEXT,
    submission_required BOOLEAN DEFAULT true,
    peer_collaboration BOOLEAN DEFAULT false,
    parent_involvement BOOLEAN DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    INDEX idx_teacher_class (teacher_id, trade_class_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_active (is_active)
);

-- Holiday package progress
CREATE TABLE holiday_package_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    student_id INT NOT NULL,
    activity_completed INT DEFAULT 0,
    total_activities INT NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    submission_content JSON NULL,
    submitted_at TIMESTAMP NULL,
    teacher_feedback TEXT NULL,
    marks_obtained DECIMAL(5,2) NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'submitted', 'graded') DEFAULT 'not_started',
    graded_by INT NULL,
    graded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES holiday_packages(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id),
    UNIQUE KEY unique_progress (package_id, student_id),
    INDEX idx_status (status)
);

-- ================================
-- REAL-TIME LEARNING TABLES
-- ================================

-- Live study sessions
CREATE TABLE live_study_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    host_id INT NOT NULL, -- Teacher or student hosting
    session_type ENUM('class', 'study_group', 'office_hours', 'peer_tutoring', 'q_and_a') DEFAULT 'study_group',
    subject_id INT NULL,
    trade_class_id INT NULL,
    max_participants INT DEFAULT 50,
    is_scheduled BOOLEAN DEFAULT false,
    scheduled_start DATETIME NULL,
    scheduled_end DATETIME NULL,
    actual_start TIMESTAMP NULL,
    actual_end TIMESTAMP NULL,
    status ENUM('scheduled', 'active', 'ended', 'cancelled') DEFAULT 'scheduled',
    meeting_link VARCHAR(500) NULL,
    access_code VARCHAR(20) NULL,
    recording_enabled BOOLEAN DEFAULT false,
    recording_url VARCHAR(500) NULL,
    participants JSON NULL, -- Array of participant IDs with roles
    session_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    INDEX idx_host (host_id),
    INDEX idx_scheduled (scheduled_start, scheduled_end),
    INDEX idx_status (status)
);

-- Session participants
CREATE TABLE session_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('host', 'co_host', 'presenter', 'participant') DEFAULT 'participant',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    participation_score DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT NULL,
    FOREIGN KEY (session_id) REFERENCES live_study_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participation (session_id, user_id),
    INDEX idx_role (role)
);

-- Real-time messages (for chat during sessions)
CREATE TABLE realtime_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_type ENUM('text', 'file', 'emoji', 'system') DEFAULT 'text',
    content TEXT NOT NULL,
    attachments JSON NULL,
    is_private BOOLEAN DEFAULT false,
    recipient_id INT NULL, -- For private messages
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP NULL,
    FOREIGN KEY (session_id) REFERENCES live_study_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    INDEX idx_session_time (session_id, sent_at),
    INDEX idx_sender (sender_id)
);

-- ================================
-- P2P CORRECTION AND COLLABORATION
-- ================================

-- Peer reviews
CREATE TABLE peer_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL, -- Can be assignment, homework, etc.
    submission_type ENUM('assignment', 'homework', 'project') NOT NULL,
    reviewer_id INT NOT NULL,
    review_content TEXT NOT NULL,
    rating DECIMAL(3,2) NULL, -- 1-5 rating
    criteria_ratings JSON NULL, -- Detailed criteria ratings
    is_anonymous BOOLEAN DEFAULT true,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_submission (submission_id, submission_type),
    INDEX idx_reviewer (reviewer_id)
);

-- Collaboration groups
CREATE TABLE collaboration_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INT NOT NULL,
    subject_id INT NULL,
    trade_class_id INT NULL,
    max_members INT DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    collaboration_type ENUM('study_group', 'project_team', 'peer_learning', 'skill_sharing') DEFAULT 'study_group',
    rules TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
    INDEX idx_creator (creator_id),
    INDEX idx_active (is_active)
);

-- Group members
CREATE TABLE collaboration_group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('leader', 'member', 'observer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    contribution_score DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (group_id) REFERENCES collaboration_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id),
    INDEX idx_role (role)
);

-- ================================
-- LEARNING ANALYTICS TABLES
-- ================================

-- Student learning analytics
CREATE TABLE student_learning_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    assignments_completed INT DEFAULT 0,
    assignments_avg_score DECIMAL(5,2) DEFAULT 0.00,
    quizzes_taken INT DEFAULT 0,
    quizzes_avg_score DECIMAL(5,2) DEFAULT 0.00,
    homework_completed INT DEFAULT 0,
    homework_avg_score DECIMAL(5,2) DEFAULT 0.00,
    study_sessions_attended INT DEFAULT 0,
    total_study_hours DECIMAL(5,2) DEFAULT 0.00,
    peer_reviews_given INT DEFAULT 0,
    peer_reviews_received INT DEFAULT 0,
    collaboration_score DECIMAL(5,2) DEFAULT 0.00,
    improvement_trend DECIMAL(5,2) DEFAULT 0.00, -- Percentage improvement
    strengths JSON NULL,
    areas_for_improvement JSON NULL,
    recommendations JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_analytics (student_id, subject_id, period_start, period_end),
    INDEX idx_period (period_start, period_end)
);

-- ================================
-- NOTIFICATIONS FOR LEARNING ACTIVITIES
-- ================================

-- Learning notifications
CREATE TABLE learning_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('assignment_due', 'quiz_scheduled', 'homework_reminder', 'grade_posted', 'peer_review', 'session_invite', 'deadline_warning') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INT NULL, -- ID of related assignment/quiz/etc.
    related_type VARCHAR(50) NULL, -- Type of related item
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    action_url VARCHAR(500) NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_type_created (notification_type, created_at),
    INDEX idx_expires (expires_at)
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Composite indexes for common queries
CREATE INDEX idx_assignment_submissions_status_date ON assignment_submissions (status, submitted_at);
CREATE INDEX idx_quiz_attempts_student_status ON quiz_attempts (student_id, status);
CREATE INDEX idx_homework_submissions_status_date ON homework_submissions (status, submitted_at);
CREATE INDEX idx_session_participants_session_time ON session_participants (session_id, joined_at, left_at);
CREATE INDEX idx_realtime_messages_session_time ON realtime_messages (session_id, sent_at);
CREATE INDEX idx_learning_notifications_user_type ON learning_notifications (user_id, notification_type, is_read);

-- ================================
-- TRIGGERS FOR AUTOMATION
-- ================================

DELIMITER //

-- Trigger to create notifications for new assignments
CREATE TRIGGER assignment_notification_trigger AFTER INSERT ON assignments
FOR EACH ROW
BEGIN
    IF NEW.is_published THEN
        INSERT INTO learning_notifications (
            user_id, notification_type, title, message, related_id, related_type, priority
        )
        SELECT
            e.student_id,
            'assignment_due',
            CONCAT('New Assignment: ', NEW.title),
            CONCAT('You have a new assignment due on ', DATE_FORMAT(NEW.due_date, '%M %d, %Y')),
            NEW.id,
            'assignment',
            'normal'
        FROM enrollments e
        WHERE e.class_id = NEW.trade_class_id AND e.status = 'active';
    END IF;
END//

-- Trigger to create notifications for quiz schedules
CREATE TRIGGER quiz_notification_trigger AFTER UPDATE ON quizzes
FOR EACH ROW
BEGIN
    IF NEW.is_active = true AND OLD.is_active = false AND NEW.scheduled_date IS NOT NULL THEN
        INSERT INTO learning_notifications (
            user_id, notification_type, title, message, related_id, related_type, priority
        )
        SELECT
            e.student_id,
            'quiz_scheduled',
            CONCAT('Quiz Scheduled: ', NEW.title),
            CONCAT('Quiz scheduled for ', DATE_FORMAT(NEW.scheduled_date, '%M %d, %Y'), ' at ', TIME_FORMAT(NEW.start_time, '%h:%i %p')),
            NEW.id,
            'quiz',
            'high'
        FROM enrollments e
        WHERE e.class_id = NEW.trade_class_id AND e.status = 'active';
    END IF;
END//

-- Trigger to update student analytics when grades are posted
CREATE TRIGGER grade_analytics_trigger AFTER INSERT ON assignment_submissions
FOR EACH ROW
BEGIN
    IF NEW.status = 'graded' AND NEW.marks_obtained IS NOT NULL THEN
        INSERT INTO student_learning_analytics (
            student_id, subject_id, period_start, period_end,
            assignments_completed, assignments_avg_score
        )
        SELECT
            NEW.student_id,
            a.subject_id,
            DATE_SUB(CURDATE(), INTERVAL DAYOFMONTH(CURDATE())-1 DAY),
            LAST_DAY(CURDATE()),
            1,
            NEW.marks_obtained
        FROM assignments a
        WHERE a.id = NEW.assignment_id
        ON DUPLICATE KEY UPDATE
            assignments_completed = assignments_completed + 1,
            assignments_avg_score = (assignments_avg_score * (assignments_completed - 1) + NEW.marks_obtained) / assignments_completed;
    END IF;
END//

DELIMITER ;

-- ================================
-- SAMPLE DATA INSERTION
-- ================================

-- Insert sample assignments
INSERT INTO assignments (title, description, subject_id, teacher_id, trade_class_id, assignment_type, total_marks, instructions, due_date, submission_deadline, is_published) VALUES
('Mathematics Problem Set 1', 'Complete all exercises from chapter 3', 1, 2, 1, 'homework', 50.00, 'Show all working steps clearly', '2024-01-15 23:59:59', '2024-01-15 23:59:59', true),
('Physics Lab Report', 'Write a complete lab report for the pendulum experiment', 2, 3, 2, 'project', 100.00, 'Include hypothesis, methodology, results, and conclusion', '2024-01-20 23:59:59', '2024-01-20 23:59:59', true);

-- Insert sample quizzes
INSERT INTO quizzes (title, description, subject_id, teacher_id, trade_class_id, quiz_type, total_marks, duration_minutes, questions, answer_key, scheduled_date, start_time, end_time, is_active) VALUES
('Mathematics Chapter 3 Quiz', 'Assessment on algebraic equations', 1, 2, 1, 'assessment', 25.00, 30, '[{"question": "Solve: 2x + 3 = 7", "options": ["x = 2", "x = 3", "x = 4", "x = 5"], "type": "multiple_choice"}]', '{"answers": ["0"], "explanations": ["Subtract 3 from both sides: 2x = 4, then divide by 2: x = 2"]}', '2024-01-10', '2024-01-10 10:00:00', '2024-01-10 10:30:00', true);

-- Insert sample homework
INSERT INTO homework (title, description, subject_id, teacher_id, trade_class_id, homework_type, total_marks, instructions, due_date, is_active) VALUES
('Daily Mathematics Practice', 'Practice multiplication tables 1-10', 1, 2, 1, 'daily', 10.00, 'Complete all tables accurately', '2024-01-08', true),
('English Reading Assignment', 'Read chapter 5 and answer questions', 3, 4, 1, 'weekly', 20.00, 'Answer all questions in complete sentences', '2024-01-12', true);

-- Insert sample holiday package
INSERT INTO holiday_packages (title, description, teacher_id, trade_class_id, package_type, total_activities, estimated_duration_days, resources, instructions, start_date, end_date, is_active) VALUES
('Holiday Mathematics Revision', 'Comprehensive revision package for mathematics', 2, 1, 'revision', 10, 14, '["algebra_worksheet.pdf", "geometry_practice.pdf", "calculus_basics.pdf"]', 'Complete one activity per day', '2024-01-20', '2024-02-03', true);

-- ================================
-- END OF LEARNING MANAGEMENT SCHEMA
-- ================================

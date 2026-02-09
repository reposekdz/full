-- ========================================================
-- COMPREHENSIVE ROLE-BASED DATABASE MIGRATION
-- ========================================================
-- Creates all necessary tables for:
-- - Admin Management
-- - Accountant Financial Tracking
-- - Teacher Academic Management
-- - Advisor Counseling Management
-- - DOS Student Affairs
-- - DOD Discipline Management
-- - Headmaster Leadership
-- - Stock Manager Inventory
-- ========================================================

-- ========================================================
-- PART 1: CORE TABLES (If not exist)
-- ========================================================

-- Users Table (extended with role-specific fields)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'headmaster', 'accountant', 'teacher', 'advisor', 'director_study', 'director_discipline', 'stock_manager', 'student', 'parent', 'matron', 'patron', 'counselor') NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(12, 2),
    status ENUM('active', 'inactive', 'on_leave', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 2: STUDENT MANAGEMENT (DOS)
-- ========================================================

-- Global Student Sheets
CREATE TABLE IF NOT EXISTS global_student_sheets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    gender ENUM('male', 'female', 'other'),
    date_of_birth DATE,
    address TEXT,
    trade_code VARCHAR(50),
    level_number INT DEFAULT 1,
    level_suffix VARCHAR(10),
    status ENUM('active', 'pending', 'suspended', 'graduated', 'dropped') DEFAULT 'active',
    admission_date DATE,
    graduation_date DATE,
    total_fees DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    balance DECIMAL(12, 2) DEFAULT 0,
    payment_status ENUM('paid', 'partial', 'unpaid') DEFAULT 'unpaid',
    payment_deadline DATE,
    last_payment_date DATE,
    parent_name VARCHAR(200),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trade (trade_code),
    INDEX idx_status (status),
    INDEX idx_payment (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    trade_code VARCHAR(50) NOT NULL,
    level_number INT NOT NULL,
    level_suffix VARCHAR(10),
    academic_year VARCHAR(10) NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'completed', 'transferred', 'dropped') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    INDEX idx_enrollment (student_id, trade_code, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Courses
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    trade_code VARCHAR(50),
    level_number INT,
    credits INT DEFAULT 3,
    max_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 40,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_course_trade (trade_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(50) UNIQUE NOT NULL,
    class_name VARCHAR(200) NOT NULL,
    teacher_id INT,
    trade_code VARCHAR(50),
    level_number INT,
    academic_year VARCHAR(10),
    term VARCHAR(20),
    max_students INT DEFAULT 50,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Class Enrollments
CREATE TABLE IF NOT EXISTS class_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'completed', 'withdrawn') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (class_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 3: ACADEMIC MANAGEMENT (Teacher)
-- ========================================================

-- Student Marks
CREATE TABLE IF NOT EXISTS student_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    class_id INT,
    subject_code VARCHAR(50),
    subject_name VARCHAR(200),
    academic_year VARCHAR(10),
    term VARCHAR(20),
    quiz_marks DECIMAL(5, 2) DEFAULT 0,
    midterm_marks DECIMAL(5, 2) DEFAULT 0,
    final_marks DECIMAL(5, 2) DEFAULT 0,
    total_marks DECIMAL(5, 2) DEFAULT 0,
    grade VARCHAR(5),
    remarks TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    INDEX idx_marks_student (student_id),
    INDEX idx_marks_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student Attendance
CREATE TABLE IF NOT EXISTS student_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    class_id INT,
    teacher_id INT,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    period VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type ENUM('homework', 'project', 'quiz', 'exam', 'other') DEFAULT 'homework',
    subject_id INT,
    due_date DATETIME,
    total_marks INT DEFAULT 100,
    instructions TEXT,
    attachments JSON,
    status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    submission_date DATETIME,
    grade DECIMAL(5, 2),
    feedback TEXT,
    attachments JSON,
    status ENUM('submitted', 'graded', 'returned') DEFAULT 'submitted',
    graded_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 4: FINANCIAL MANAGEMENT (Accountant)
-- ========================================================

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100),
    payment_method VARCHAR(50),
    reference_id INT,
    reference_type VARCHAR(100),
    created_by INT,
    status ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_transaction_type (type),
    INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student Payment Records
CREATE TABLE IF NOT EXISTS student_payment_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    payment_date DATE NOT NULL,
    notes TEXT,
    recorded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    INDEX idx_payment_student (student_id),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payment Reminders
CREATE TABLE IF NOT EXISTS payment_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    reminder_type ENUM('automatic', 'manual', 'bulk') DEFAULT 'automatic',
    message TEXT,
    sent_to VARCHAR(255),
    sent_via ENUM('sms', 'email', 'both') DEFAULT 'sms',
    sent_by INT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 5: ADVISOR & COUNSELING MANAGEMENT
-- ========================================================

-- Advised Students
CREATE TABLE IF NOT EXISTS advised_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advisor_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    academic_year VARCHAR(10),
    assigned_date DATE NOT NULL,
    status ENUM('active', 'completed', 'transferred') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_advising (advisor_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student Cases
CREATE TABLE IF NOT EXISTS student_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    advisor_id INT NOT NULL,
    case_type ENUM('academic', 'personal', 'disciplinary', 'career', 'financial', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    resolution_notes TEXT,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    INDEX idx_case_status (status),
    INDEX idx_case_advisor (advisor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Advisor Meetings
CREATE TABLE IF NOT EXISTS advisor_meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advisor_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    purpose VARCHAR(255),
    location VARCHAR(255) DEFAULT 'Advisor Office',
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Advisor Case Activities
CREATE TABLE IF NOT EXISTS advisor_case_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    advisor_id INT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 6: DISCIPLINE MANAGEMENT (DOD)
-- ========================================================

-- Student Conduct Records
CREATE TABLE IF NOT EXISTS student_conduct_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    category_id INT,
    description TEXT,
    location VARCHAR(255),
    severity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
    reported_by INT,
    handled_by INT,
    action_id INT,
    action_taken VARCHAR(255),
    action_start_date DATE,
    action_end_date DATE,
    parent_notified BOOLEAN DEFAULT FALSE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    status ENUM('active', 'resolved', 'cancelled') DEFAULT 'active',
    incident_date DATE NOT NULL,
    resolved_date DATE,
    resolution_notes TEXT,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    INDEX idx_conduct_status (status),
    INDEX idx_conduct_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Behavior Points
CREATE TABLE IF NOT EXISTS student_behavior_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    points INT NOT NULL,
    point_type ENUM('positive', 'negative') NOT NULL,
    reason TEXT,
    awarded_by INT,
    conduct_record_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    FOREIGN KEY (conduct_record_id) REFERENCES student_conduct_records(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student Leaves
CREATE TABLE IF NOT EXISTS student_leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    leave_type ENUM('sick', 'personal', 'emergency', 'bereavement', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    approved_by VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Counseling Sessions
CREATE TABLE IF NOT EXISTS student_counseling_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    counselor_id INT NOT NULL,
    session_type ENUM('individual', 'group', 'peer') DEFAULT 'individual',
    session_date DATE NOT NULL,
    notes TEXT,
    recommendations TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
    FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 7: STOCK & INVENTORY MANAGEMENT
-- ========================================================

-- Stock Items
CREATE TABLE IF NOT EXISTS stock_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    quantity INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pcs',
    unit_price DECIMAL(10, 2) DEFAULT 0,
    reorder_level INT DEFAULT 10,
    location VARCHAR(255),
    supplier VARCHAR(255),
    supplier_contact VARCHAR(255),
    status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_stock_category (category),
    INDEX idx_stock_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock Transactions
CREATE TABLE IF NOT EXISTS stock_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    transaction_type ENUM('purchase', 'issue', 'return', 'adjustment', 'damage') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2),
    reference_number VARCHAR(100),
    issued_to VARCHAR(255),
    department VARCHAR(100),
    notes TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
    INDEX idx_stock_transaction_item (item_id),
    INDEX idx_stock_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 8: HEADMASTER & LEADERSHIP
-- ========================================================

-- School Events
CREATE TABLE IF NOT EXISTS school_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('meeting', 'ceremony', 'exam', 'sports', 'celebration', 'other') DEFAULT 'meeting',
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    target_audience VARCHAR(255),
    status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    status ENUM('success', 'failed', 'warning') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Strategic Goals
CREATE TABLE IF NOT EXISTS strategic_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    progress INT DEFAULT 0,
    status ENUM('not_started', 'in_progress', 'completed', 'delayed') DEFAULT 'not_started',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 9: PARENT & COMMUNICATION
-- ========================================================

-- Parent Connections
CREATE TABLE IF NOT EXISTS parent_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    parent_id INT NOT NULL,
    can_view_marks BOOLEAN DEFAULT TRUE,
    can_view_attendance BOOLEAN DEFAULT TRUE,
    can_view_discipline BOOLEAN DEFAULT FALSE,
    can_view_report_cards BOOLEAN DEFAULT TRUE,
    can_receive_sms BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'inactive', 'revoked') DEFAULT 'active',
    access_granted_by VARCHAR(255),
    access_granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_expired_at TIMESTAMP NULL,
    access_revoked_by VARCHAR(255),
    access_revoked_at TIMESTAMP NULL,
    revocation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SMS History
CREATE TABLE IF NOT EXISTS sms_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT,
    student_id INT,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('payment_reminder', 'attendance', 'discipline', 'general', 'meeting') DEFAULT 'general',
    priority ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('sent', 'delivered', 'failed', 'pending') DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    error_message TEXT,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sms_status (status),
    INDEX idx_sms_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- PART 10: REFERENCE TABLES
-- ========================================================

-- Trades
CREATE TABLE IF NOT EXISTS trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_code VARCHAR(50) UNIQUE NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_years INT DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Report Cards
CREATE TABLE IF NOT EXISTS report_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    trade_code VARCHAR(50),
    level_number INT,
    academic_year VARCHAR(10) NOT NULL,
    term VARCHAR(20) NOT NULL,
    total_score DECIMAL(8, 2),
    average_score DECIMAL(5, 2),
    gpa DECIMAL(3, 2),
    rank_position INT,
    attendance_rate DECIMAL(5, 2),
    conduct_score DECIMAL(5, 2),
    teacher_comment TEXT,
    dos_comment TEXT,
    headmaster_comment TEXT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    generated_by VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- MIGRATION COMPLETE
-- ========================================================

-- Insert default admin user if not exists
INSERT IGNORE INTO users (username, email, phone, password, first_name, last_name, role, is_active)
VALUES ('admin', 'admin@gardentvet.rw', '+250788000000', 'admin123', 'System', 'Administrator', 'admin', TRUE);

-- Insert default staff roles
INSERT IGNORE INTO staff (user_id, employee_id, department, position, hire_date, salary, status)
SELECT id, CONCAT('EMP-', LPAD(id, 4, '0)), 'Administration', 'Administrator', CURDATE(), 500000, 'active'
FROM users WHERE role = 'admin' AND employee_id IS NULL;

-- Insert sample trades
INSERT IGNORE INTO trades (trade_code, trade_name, description, duration_years)
VALUES 
    ('ICT', 'Information Communication Technology', 'Computer and ICT related courses', 3),
    ('AUT', 'Automotive', 'Vehicle mechanics and repair', 3),
    ('BDC', 'Building Construction', 'Construction and civil engineering', 3),
    ('ELE', 'Electrical', 'Electrical installation and maintenance', 3),
    ('PLB', 'Plumbing', 'Pipe fitting and plumbing', 2),
    ('AGR', 'Agriculture', 'Crop and animal production', 3),
    ('SOD', 'Social Development', 'Community development and social work', 3)
ON DUPLICATE KEY UPDATE trade_name = VALUES(trade_name);

-- Insert sample courses
INSERT IGNORE INTO courses (course_code, course_name, trade_code, level_number, credits)
VALUES 
    ('ICT101', 'Computer Fundamentals', 'ICT', 1, 3),
    ('ICT102', 'Programming Basics', 'ICT', 1, 4),
    ('AUT101', 'Engine Principles', 'AUT', 1, 3),
    ('BDC101', 'Construction Materials', 'BDC', 1, 3),
    ('ELE101', 'Electrical Theory', 'ELE', 1, 4);

SELECT 'Migration completed successfully!' as status;

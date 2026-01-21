-- Fix Database Schema - Complete School Management System
-- This script fixes all SQL errors and creates a comprehensive database

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all existing tables to start fresh
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS fee_payments;
DROP TABLE IF EXISTS fee_structures;
DROP TABLE IF EXISTS fee_types;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS stock_items;
DROP TABLE IF EXISTS stock_categories;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS class_schedules;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS school_stats;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS news_articles;
DROP TABLE IF EXISTS home_content;
DROP TABLE IF EXISTS slides;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS admin_users;

SET FOREIGN_KEY_CHECKS = 1;

-- ===============================
-- ROLES AND PERMISSIONS SYSTEM
-- ===============================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Users table (comprehensive for all user types)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    profile_picture VARCHAR(500),
    role_id INT NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    parent_id INT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_role (role_id),
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Admin users table (for backward compatibility)
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    granted BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_permission (user_id, permission_id)
);

-- ===============================
-- ACADEMIC MANAGEMENT SYSTEM
-- ===============================

CREATE TABLE academic_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL,
    duration_months INT NOT NULL,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    teacher_id INT,
    capacity INT DEFAULT 30,
    current_enrollment INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    course_id INT NOT NULL,
    credits INT DEFAULT 1,
    is_practical BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE class_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'completed', 'dropped', 'suspended') DEFAULT 'active',
    completion_date DATE NULL,
    final_grade VARCHAR(5) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE KEY unique_enrollment (student_id, class_id, academic_year_id)
);

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    notes TEXT,
    marked_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (student_id, class_id, subject_id, attendance_date)
);

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    class_id INT NOT NULL,
    assessment_type ENUM('quiz', 'exam', 'assignment', 'project', 'final') NOT NULL,
    assessment_name VARCHAR(200) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    obtained_marks DECIMAL(5,2) NOT NULL,
    grade_letter VARCHAR(5),
    assessment_date DATE NOT NULL,
    teacher_id INT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ===============================
-- FINANCIAL MANAGEMENT SYSTEM
-- ===============================

CREATE TABLE fee_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT true,
    recurrence_period ENUM('monthly', 'quarterly', 'semester', 'annual') DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE fee_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    fee_type_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date_offset_days INT DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE KEY unique_fee_structure (course_id, fee_type_id, academic_year_id)
);

CREATE TABLE fee_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    fee_structure_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'mobile_money', 'card') NOT NULL,
    transaction_reference VARCHAR(100),
    receipt_number VARCHAR(100) UNIQUE,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
    received_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id),
    FOREIGN KEY (received_by) REFERENCES users(id)
);

-- ===============================
-- STOCK MANAGEMENT SYSTEM
-- ===============================

CREATE TABLE stock_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE stock_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    current_quantity INT DEFAULT 0,
    minimum_quantity INT DEFAULT 10,
    maximum_quantity INT DEFAULT 1000,
    unit_price DECIMAL(10,2) DEFAULT 0,
    unit_of_measurement VARCHAR(20) DEFAULT 'piece',
    supplier VARCHAR(200),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES stock_categories(id)
);

CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock_item_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment', 'transfer') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0,
    reference_number VARCHAR(100),
    reason VARCHAR(200),
    moved_by INT NOT NULL,
    approved_by INT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_item_id) REFERENCES stock_items(id),
    FOREIGN KEY (moved_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ===============================
-- COMMUNICATION SYSTEM
-- ===============================

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    message_type ENUM('message', 'notice', 'alert') DEFAULT 'message',
    parent_message_id INT NULL,
    attachments JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    action_url VARCHAR(500),
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- CONTENT MANAGEMENT SYSTEM
-- ===============================

CREATE TABLE slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url VARCHAR(500),
    button_text VARCHAR(100),
    button_link VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE home_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    subtitle TEXT,
    content TEXT,
    additional_data JSON,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    image_url VARCHAR(500),
    author VARCHAR(100),
    category VARCHAR(50),
    date_published DATE,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    avatar VARCHAR(10),
    quote TEXT NOT NULL,
    rating INT DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE school_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_key VARCHAR(50) NOT NULL UNIQUE,
    value VARCHAR(20) NOT NULL,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    year VARCHAR(4),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===============================
-- SYSTEM SETTINGS
-- ===============================

CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===============================
-- INSERT DEFAULT DATA
-- ===============================

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('super_admin', 'Super Administrator with full system access'),
('admin', 'Administrator with most system access'),
('headmaster', 'Head Master role'),
('director_study', 'Director of Studies'),
('director_discipline', 'Director of Discipline'),
('teacher', 'Teaching staff'),
('student', 'Student user'),
('parent', 'Parent/Guardian user'),
('accountant', 'Financial management staff'),
('stock_manager', 'Stock management staff');

-- Insert default permissions
INSERT INTO permissions (name, description, module) VALUES
-- User Management
('users.create', 'Create new users', 'users'),
('users.read', 'View users', 'users'),
('users.update', 'Update user information', 'users'),
('users.delete', 'Delete users', 'users'),
('users.manage_roles', 'Manage user roles', 'users'),

-- Academic Management
('academics.create', 'Create academic records', 'academics'),
('academics.read', 'View academic records', 'academics'),
('academics.update', 'Update academic records', 'academics'),
('academics.delete', 'Delete academic records', 'academics'),
('academics.manage_grades', 'Manage student grades', 'academics'),
('academics.manage_attendance', 'Manage attendance', 'academics'),

-- Financial Management
('finance.create', 'Create financial records', 'finance'),
('finance.read', 'View financial records', 'finance'),
('finance.update', 'Update financial records', 'finance'),
('finance.delete', 'Delete financial records', 'finance'),
('finance.process_payments', 'Process payments', 'finance'),

-- Stock Management
('stock.create', 'Create stock records', 'stock'),
('stock.read', 'View stock records', 'stock'),
('stock.update', 'Update stock records', 'stock'),
('stock.delete', 'Delete stock records', 'stock'),
('stock.manage_movements', 'Manage stock movements', 'stock'),

-- Content Management
('content.create', 'Create content', 'content'),
('content.read', 'View content', 'content'),
('content.update', 'Update content', 'content'),
('content.delete', 'Delete content', 'content'),

-- Communication
('communication.send', 'Send messages', 'communication'),
('communication.read', 'Read messages', 'communication'),
('communication.broadcast', 'Send broadcast messages', 'communication'),

-- System Settings
('settings.read', 'View system settings', 'settings'),
('settings.update', 'Update system settings', 'settings');

-- Assign permissions to roles (Super Admin gets all)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'super_admin';

-- Admin gets most permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name NOT LIKE 'settings.%';

-- Insert default admin user
INSERT INTO admin_users (username, email, password, role) VALUES
('admin', 'admin@school.rw', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Default academic year
INSERT INTO academic_years (name, start_date, end_date, is_active) VALUES
('2025-2026', '2025-09-01', '2026-06-30', true);

-- Default courses
INSERT INTO courses (name, description, code, duration_months, fee_amount) VALUES
('Software Development', 'Comprehensive software development program covering modern programming languages and frameworks', 'SOD', 24, 500000),
('Building Construction', 'Construction techniques, project management, and safety protocols training', 'BDC', 18, 400000),
('Automobile Technology', 'Automotive training covering diagnostics, repair, and modern vehicle technologies', 'AUTO', 20, 450000);

-- Default fee types
INSERT INTO fee_types (name, description, is_recurring, recurrence_period) VALUES
('Tuition Fee', 'Monthly tuition fee', true, 'monthly'),
('Registration Fee', 'One-time registration fee', false, 'annual'),
('Material Fee', 'Learning materials and equipment fee', true, 'semester'),
('Exam Fee', 'Examination and certification fee', false, 'annual');

-- Default stock categories
INSERT INTO stock_categories (name, description) VALUES
('Electronics', 'Electronic equipment and components'),
('Stationery', 'Office and classroom stationery'),
('Tools', 'Workshop tools and equipment'),
('Furniture', 'Classroom and office furniture'),
('Books', 'Textbooks and reference materials');

-- Default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('school_name', 'Powerful School Management System', 'string', 'School name', true),
('school_address', 'Kigali, Rwanda', 'string', 'School address', true),
('school_phone', '+250 123 456 789', 'string', 'School phone number', true),
('school_email', 'info@school.rw', 'string', 'School email address', true),
('academic_year_start', '09-01', 'string', 'Academic year start date (MM-DD)', false),
('academic_year_end', '06-30', 'string', 'Academic year end date (MM-DD)', false),
('default_password', 'school123', 'string', 'Default password for new users', false),
('max_file_upload_size', '10', 'number', 'Maximum file upload size in MB', false);

-- Insert default content data
INSERT INTO slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES
('EMPOWERING FUTURE SKILLS', 'Building Tomorrow\'s Professionals Today', 'Join thousands of students who have transformed their careers through our comprehensive technical programs.', 'https://images.unsplash.com/photo-1758270704524-596810e891b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2ODc2NTA2NXww&ixlib=rb-4.1.0&q=80&w=1080', 'Get Started', '/register', 1),
('SOFTWARE DEVELOPMENT', 'Master Coding & Technology', 'Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.', 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc2ODcxODI3MXww&ixlib=rb-4.1.0&q=80&w=1080', 'Learn More', '/trades', 2),
('BUILDING CONSTRUCTION', 'Create Tomorrow\'s Infrastructure', 'Learn construction techniques, project management, and safety protocols with modern tools and sustainable building practices.', 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY4NzMwNzQ0fDA', 'Explore', '/trades', 3),
('AUTOMOBILE TECHNOLOGY', 'Drive Your Future Forward', 'Comprehensive automotive training covering diagnostics, repair, and modern vehicle technologies including hybrid and electric systems.', 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW9iaWxlJTIwbWVjaGFuaWMlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3Njg4MDYyMTl8MA', 'Discover', '/trades', 4);

INSERT INTO news_articles (title, description, content, image_url, author, category, date_published, sort_order) VALUES
('Abanyeshuri bacu batsinze amahugurwa y\'ubuhanga', 'Ikipe y\'abanyeshuri muri Software Development yatsindiye igihembo cya mbere mu mahugurwa y\'igihugu.', 'Ikipe y\'abanyeshuri muri Software Development yatsindiye igihembo cya mbere mu mahugurwa y\'igihugu. Ibi ni bimwe mu bintu byiza tutanga abanyeshuri bacu.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'Jean Mugisha', 'Ibihembo', '2026-01-15', 1),
('Ishuri ryacu ryitabiriye ibirori bya siporo', 'Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\'ishuri ry\'igihugu.', 'Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\'ishuri ry\'igihugu. Ni ishuri ryiza cyane.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 'Sarah Uwase', 'Siporo', '2026-01-12', 2),
('Amashuri mashya azatangira mu kwezi gutaha', 'Kwiyandikisha kw\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026.', 'Kwiyandikisha kw\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026. Abanyeshuri bashya bagomba gutegura inyandiko zose.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800', 'Grace Ingabire', 'Amakuru', '2026-01-10', 3),
('Ubufatanye bushya n\'amasosiyete', 'Ishuri ryacu ryasinyeho amasezerano y\'ubufatanye n\'amasosiyete 5 mu bikorwa.', 'Ishuri ryacu ryasinyeho amasezerano y\'ubufatanye n\'amasosiyete 5 mu bikorwa. Ibi bizagira ingaruka nziza ku banyeshuri.', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800', 'Peter Karenzi', 'Ubufatanye', '2026-01-08', 4);

INSERT INTO testimonials (name, role, avatar, quote, rating, sort_order) VALUES
('Jean Claude Mugisha', 'Umunyeshuri - Software Development', 'JM', 'Ishuri ryacu ryampaye amahirwe menshi yo kwiga ubuhanga bw\'ikoranabuhanga. Abarimu bacu barahebuje kandi bagashoboye.', 5, 1),
('Marie Uwase', 'Umubyeyi', 'MU', 'Umwana wanjye yarahindutse cyane kuva atangiye kwiga muri iri shuri. Amasomo ni meza kandi abanyeshuri bagenzurwa neza.', 5, 2),
('Patrick Nkurunziza', 'Warangije - Building Construction', 'PN', 'Nyuma yo kurangiza amashuri yanjye, nabonye akazi kahambaye mu kigo cy\'ubwubatsi. Murakoze ishuri!', 5, 3),
('Alice Mukandori', 'Umwarimu', 'AM', 'Ni ishuri ryiza cyane rifite ibikoresho byiza by\'amashuri. Abanyeshuri bacu bagera kuri byinshi.', 5, 4);

INSERT INTO school_stats (stat_key, value, label, icon, color, sort_order) VALUES
('students', '1,248', 'Abanyeshuri', 'Users', 'from-blue-500 to-indigo-500', 1),
('teachers', '84', 'Abarimu', 'GraduationCap', 'from-green-500 to-teal-500', 2),
('employment', '95%', 'Gushirwa mu kazi', 'Briefcase', 'from-yellow-500 to-orange-500', 3),
('awards', '25+', 'Ibihembo', 'Trophy', 'from-orange-500 to-red-500', 4);

INSERT INTO achievements (title, description, year, sort_order) VALUES
('Ishuri ry\'Umwaka', 'Twatoranijwe nk\'ishuri ry\'umwaka mu mahugurwa y\'ubuhanga', '2025', 1),
('Igihembo cya Mbere - Siporo', 'Abanyeshuri bacu batsinze igihembo cya mbere mu mikino y\'ishuri', '2025', 2),
('Ubuhanga bw\'Ikoranabuhanga', 'Ikipe yacu yatsinze amahugurwa y\'igihugu y\'ubuhanga bw\'ikoranabuhanga', '2024', 3),
('Ubufatanye Mpuzamahanga', 'Twashyizeho ubufatanye n\'amashuri menshi mu mahanga', '2024', 4);

INSERT INTO home_content (section_key, title, subtitle, content) VALUES
('hero_main', 'Imibare Yacu', 'Ishuri ry\'ubuhanga rifite imikorere myiza kandi ryizera', NULL),
('news_section', 'Amakuru Y\'Ishuri', 'Amakuru mashya n\'ibikorwa by\'ishuri ryacu', NULL),
('testimonials_section', 'Ibyo Abantu Bavuga', 'Icyo abanyeshuri, ababyeyi, n\'abarimu bavuga ku ishuri ryacu', NULL),
('achievements_section', 'Ibihembo N\'Intsinzi', 'Ibyo twagezeho mu myaka yashize', NULL);
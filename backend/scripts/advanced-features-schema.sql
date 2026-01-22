-- Advanced Features Schema - Parent-Student Linking, Excel Import, Dynamic Content

-- =============================== PARENT-STUDENT LINKING SYSTEM ===============================
CREATE TABLE parent_student_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    verification_code VARCHAR(10) NOT NULL UNIQUE,
    student_name VARCHAR(100) NOT NULL,
    student_level VARCHAR(50),
    student_trade VARCHAR(100),
    academic_year VARCHAR(20),
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 24 HOUR),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_code (verification_code),
    INDEX idx_phone (parent_phone),
    INDEX idx_student (student_id)
);

-- Parent-Student Relationships
CREATE TABLE parent_student_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship_type ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
    is_primary BOOLEAN DEFAULT false,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    linked_by INT NULL, -- admin/staff who approved the link
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (linked_by) REFERENCES users(id),
    UNIQUE KEY unique_parent_student (parent_id, student_id),
    INDEX idx_parent (parent_id),
    INDEX idx_student_link (student_id)
);

-- =============================== STUDENT DATA IMPORT/EXPORT SYSTEM ===============================
CREATE TABLE student_data_imports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    import_type ENUM('excel', 'csv', 'json') DEFAULT 'excel',
    total_rows INT DEFAULT 0,
    successful_imports INT DEFAULT 0,
    failed_imports INT DEFAULT 0,
    import_errors JSON NULL,
    imported_by INT NOT NULL,
    class_id INT NULL,
    academic_year_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imported_by) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Import Error Logs
CREATE TABLE import_error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    import_id INT NOT NULL,
    row_number INT NOT NULL,
    error_message TEXT NOT NULL,
    raw_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (import_id) REFERENCES student_data_imports(id) ON DELETE CASCADE
);

-- =============================== ENHANCED STUDENT PERFORMANCE VIEWS ===============================
CREATE TABLE student_performance_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    view_name VARCHAR(100) NOT NULL,
    view_type ENUM('class', 'trade', 'level', 'all') DEFAULT 'class',
    class_id INT NULL,
    course_id INT NULL,
    academic_year_id INT NULL,
    filters JSON NULL,
    columns JSON NULL, -- which columns to display
    sort_column VARCHAR(50) DEFAULT 'student_name',
    sort_direction ENUM('asc', 'desc') DEFAULT 'asc',
    created_by INT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================== DYNAMIC PAGE CONTENT SYSTEM ===============================
CREATE TABLE page_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_key VARCHAR(100) NOT NULL,
    section_key VARCHAR(100) NOT NULL,
    content_type ENUM('text', 'html', 'image', 'video', 'link', 'json') DEFAULT 'text',
    content_en TEXT,
    content_rw TEXT,
    metadata JSON NULL, -- additional data like alt text, dimensions, etc.
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id),
    UNIQUE KEY unique_page_section (page_key, section_key),
    INDEX idx_page (page_key),
    INDEX idx_active (is_active)
);

-- =============================== ADMIN EDITABLE SYSTEM SETTINGS ===============================
CREATE TABLE admin_editable_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('text', 'html', 'json', 'image_url', 'file_url', 'number', 'boolean') DEFAULT 'text',
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    validation_rules JSON NULL,
    is_editable BOOLEAN DEFAULT true,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_category (category),
    INDEX idx_editable (is_editable)
);

-- =============================== EXCEL-STYLE STUDENT SHEETS ===============================
CREATE TABLE student_excel_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    view_name VARCHAR(100) NOT NULL,
    class_id INT NULL,
    course_id INT NULL,
    academic_year_id INT NULL,
    view_config JSON NOT NULL, -- column configuration, filters, etc.
    created_by INT NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================== NOTIFICATION TEMPLATES ===============================
CREATE TABLE notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    variables JSON NULL, -- available variables for template
    target_audience ENUM('all', 'students', 'teachers', 'parents', 'staff', 'admin') DEFAULT 'all',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================== AUTO-UPDATE TRIGGERS ===============================
DELIMITER //

-- Trigger for parent-student linking notifications
CREATE TRIGGER notify_parent_link AFTER INSERT ON parent_student_codes
FOR EACH ROW
BEGIN
    INSERT INTO system_notifications (
        title, title_rw, message, message_rw, type, target_audience,
        target_users, sent_by, action_button_text, action_button_link
    )
    SELECT
        'Parent Verification Code',
        'Kode yo Kugenzura Ababyeyi',
        CONCAT('Your verification code for ', NEW.student_name, ' (', NEW.student_trade, ', ', NEW.academic_year, ') is: ', NEW.verification_code, '. Valid for 24 hours.'),
        CONCAT('Kode yawe yo kugenzura ', NEW.student_name, ' (', NEW.student_trade, ', ', NEW.academic_year, ') ni: ', NEW.verification_code, '. Ifata amasaha 24.'),
        'info',
        'parents',
        JSON_ARRAY(NEW.parent_phone),
        (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'director_discipline') LIMIT 1),
        'Verify Now',
        CONCAT('/parent/verify?code=', NEW.verification_code)
    FROM dual
    WHERE NOT EXISTS (
        SELECT 1 FROM parent_student_links
        WHERE student_id = NEW.student_id AND parent_id IN (
            SELECT id FROM users WHERE phone = NEW.parent_phone AND role_id = (SELECT id FROM roles WHERE name = 'parent')
        )
    );
END//

-- Trigger for student performance updates
CREATE TRIGGER update_performance_view AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    -- Update student performance metrics
    INSERT INTO student_performance_metrics (
        student_id, academic_year_id, average_grade, last_updated
    )
    SELECT
        NEW.student_id,
        (SELECT id FROM academic_years WHERE is_active = true LIMIT 1),
        AVG((g.obtained_marks / g.max_marks) * 100),
        NOW()
    FROM grades g
    WHERE g.student_id = NEW.student_id
        AND g.class_id IN (
            SELECT cl.id FROM classes cl
            JOIN academic_years ay ON cl.academic_year_id = ay.id
            WHERE ay.is_active = true
        )
    GROUP BY g.student_id
    ON DUPLICATE KEY UPDATE
        average_grade = VALUES(average_grade),
        last_updated = VALUES(last_updated);
END//

DELIMITER ;

-- =============================== INSERT DEFAULT DATA ===============================
-- Default admin editable settings
INSERT INTO admin_editable_settings (setting_key, setting_value, setting_type, category, description) VALUES
('school_name', 'Powerful School Management System', 'text', 'general', 'School name displayed throughout the application'),
('school_tagline', 'Building Tomorrow\'s Professionals Today', 'text', 'general', 'School tagline/motto'),
('school_description', 'Comprehensive technical education with modern facilities and expert instructors', 'html', 'general', 'Detailed school description'),
('contact_email', 'info@school.rw', 'text', 'contact', 'Primary contact email'),
('contact_phone', '+250 123 456 789', 'text', 'contact', 'Primary contact phone'),
('contact_address', 'Kigali, Rwanda', 'text', 'contact', 'School physical address'),
('hero_title', 'EMPOWERING FUTURE SKILLS', 'text', 'homepage', 'Main hero section title'),
('hero_subtitle', 'Building Tomorrow\'s Professionals Today', 'text', 'homepage', 'Hero section subtitle'),
('hero_description', 'Join thousands of students who have transformed their careers through our comprehensive technical programs.', 'html', 'homepage', 'Hero section description'),
('about_title', 'About Our School', 'text', 'about', 'About section title'),
('about_content', 'We provide world-class technical education with modern facilities, experienced instructors, and industry-relevant curriculum.', 'html', 'about', 'About section content'),
('footer_text', '© 2024 Powerful School Management System. All rights reserved.', 'html', 'footer', 'Footer copyright text'),
('welcome_message', 'Welcome to our comprehensive school management system. Access your personalized dashboard with all the tools you need.', 'html', 'dashboard', 'Welcome message for logged-in users'),
('login_title', 'Welcome Back', 'text', 'auth', 'Login page title'),
('login_subtitle', 'Sign in to your account', 'text', 'auth', 'Login page subtitle'),
('register_title', 'Join Our Community', 'text', 'auth', 'Registration page title'),
('register_subtitle', 'Create your account to get started', 'text', 'auth', 'Registration page subtitle');

-- Default page content for all pages
INSERT INTO page_content (page_key, section_key, content_type, content_en, content_rw, sort_order) VALUES
('home', 'hero_title', 'text', 'EMPOWERING FUTURE SKILLS', 'GUTANGA IMBARAGA Z\'EJO HAZAHO', 1),
('home', 'hero_subtitle', 'text', 'Building Tomorrow\'s Professionals Today', 'Tubaka Abahanga B\'Ejo Hazaho Uyu Munsi', 2),
('home', 'hero_description', 'html', 'Join thousands of students who have transformed their careers through our comprehensive technical programs.', 'Jya mu bihumbi by\'abanyeshuri bahinduye imirimo yabo binyuze muri porogaramu zacu zihuriweho z\'ubuhanga.', 3),
('home', 'stats_title', 'text', 'Our Achievements', 'Intsinzi Zacu', 4),
('home', 'trades_title', 'text', 'Available Programs', 'Porogaramu Zihari', 5),
('home', 'news_title', 'text', 'Latest News', 'Amakuru Mashya', 6),
('home', 'testimonials_title', 'text', 'What People Say', 'Ibyo Abantu Bavuga', 7),
('home', 'achievements_title', 'text', 'Our Achievements', 'Intsinzi Zacu', 8),
('home', 'events_title', 'text', 'Upcoming Events', 'Ibirori Bizaza', 9),
('sports', 'hero_title', 'text', 'School Sports', 'Siporo z\'Ishuri', 1),
('sports', 'hero_description', 'html', 'Teams, victories & matches - Learn the way of champions!', 'Amakipe, intsinzi n\'imikino - Igira uko abatsinzi bagira!', 2),
('contact', 'title', 'text', 'Contact Us', 'Twandikire', 1),
('contact', 'description', 'html', 'Get in touch with us for any inquiries or support.', 'Twandikira kubintu ubonetse cyangwa ubufasha.', 2),
('about', 'title', 'text', 'About Our School', 'Ibyerekeye Ishuli Ryacu', 1),
('about', 'mission_title', 'text', 'Our Mission', 'Intego Yacu', 2),
('about', 'vision_title', 'text', 'Our Vision', 'Icyerekezo Cyacu', 3),
('dashboard', 'welcome_title', 'text', 'Welcome to Your Dashboard', 'Murakaza Neza ku Dashibodi Yawe', 1),
('dashboard', 'welcome_message', 'html', 'Access all your school management tools and stay updated with the latest information.', 'Koresha ibikoresho byawe byose byo kubaza ishuli kandi uhore uzi amakuru mashya.', 2);

-- Default notification templates
INSERT INTO notification_templates (template_key, title_template, message_template, variables, target_audience) VALUES
('parent_verification_code', 'Parent Verification Code', 'Your verification code for {student_name} ({student_trade}, {academic_year}) is: {verification_code}. Valid for 24 hours.', '["student_name", "student_trade", "academic_year", "verification_code"]', 'parents'),
('grade_posted', 'New Grade Posted', 'A new grade has been posted for {subject_name}: {grade_letter} ({percentage}%)', '["subject_name", "grade_letter", "percentage"]', 'students'),
('attendance_alert', 'Attendance Alert', 'You have {absent_days} absent days this month. Please contact your teacher if needed.', '["absent_days"]', 'students'),
('fee_due', 'Fee Payment Due', 'Your fee payment of {amount} RWF is due on {due_date}.', '["amount", "due_date"]', 'students'),
('event_reminder', 'Event Reminder', 'Don\'t forget: {event_name} on {event_date} at {event_time}.', '["event_name", "event_date", "event_time"]', 'all'),
('discipline_notice', 'Discipline Notice', 'A discipline case has been reported. Please check your dashboard for details.', '[]', 'students');

-- Sample student performance views
INSERT INTO student_performance_views (view_name, view_type, created_by, columns, filters) VALUES
('Class 1A Overview', 'class', 1, '["student_name", "average_grade", "attendance_rate", "conduct_rating", "total_discipline_cases"]', '{"class_id": 1}'),
('SOD Trade Performance', 'trade', 1, '["student_name", "subject_grades", "overall_average", "improvement_trend"]', '{"course_code": "SOD"}'),
('All Students Report', 'all', 1, '["student_name", "class_name", "average_grade", "attendance_rate", "risk_level"]', NULL);

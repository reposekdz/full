-- Dynamic Content Management Schema Additions
-- This file contains additional tables for dynamic content management

-- =============================== SPORTS MANAGEMENT SYSTEM ===============================
CREATE TABLE sports_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_rw VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(100) NOT NULL DEFAULT 'from-blue-500 to-indigo-600',
    bg_color VARCHAR(100) NOT NULL DEFAULT 'from-blue-50 to-indigo-50',
    border_color VARCHAR(100) NOT NULL DEFAULT 'border-blue-200 hover:border-blue-400',
    description TEXT,
    description_rw TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sports_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_rw VARCHAR(200) NOT NULL,
    coach_name VARCHAR(100),
    coach_name_rw VARCHAR(100),
    team_count INT DEFAULT 0,
    trophies INT DEFAULT 0,
    description TEXT,
    description_rw TEXT,
    image_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_category_id) REFERENCES sports_categories(id) ON DELETE CASCADE
);

CREATE TABLE sports_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_category_id INT NOT NULL,
    home_team VARCHAR(200) NOT NULL DEFAULT 'Garden TVET School',
    away_team VARCHAR(200) NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    status ENUM('upcoming', 'live', 'completed', 'cancelled') DEFAULT 'upcoming',
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    result VARCHAR(50) NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_category_id) REFERENCES sports_categories(id) ON DELETE CASCADE
);

CREATE TABLE sports_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_rw VARCHAR(255) NOT NULL,
    position VARCHAR(50) NOT NULL,
    achievement_date DATE NOT NULL,
    description TEXT,
    description_rw TEXT,
    image_url VARCHAR(500) NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_category_id) REFERENCES sports_categories(id) ON DELETE CASCADE
);

-- =============================== EVENTS MANAGEMENT SYSTEM ===============================
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_rw VARCHAR(255) NOT NULL,
    description TEXT,
    description_rw TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    event_type ENUM('academic', 'sports', 'cultural', 'administrative', 'other') DEFAULT 'other',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    organizer VARCHAR(100),
    organizer_rw VARCHAR(100),
    contact_info VARCHAR(200),
    max_attendees INT NULL,
    current_attendees INT DEFAULT 0,
    image_url VARCHAR(500) NULL,
    additional_info JSON NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================== DISCIPLINE MANAGEMENT SYSTEM ===============================
CREATE TABLE discipline_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_rw VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    description_rw TEXT,
    severity_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    color VARCHAR(50) DEFAULT '#f59e0b',
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE discipline_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    category_id INT NOT NULL,
    reported_by INT NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME NULL,
    location VARCHAR(200),
    description TEXT NOT NULL,
    description_rw TEXT,
    witnesses TEXT,
    evidence TEXT,
    severity_assessment TEXT,
    action_taken TEXT NOT NULL,
    action_taken_rw TEXT,
    consequences TEXT,
    consequences_rw TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE NULL,
    follow_up_notes TEXT,
    status ENUM('reported', 'investigating', 'resolved', 'dismissed', 'appealed') DEFAULT 'reported',
    resolution_date DATE NULL,
    resolved_by INT NULL,
    appeal_deadline DATE NULL,
    appeal_reason TEXT,
    appeal_status ENUM('none', 'pending', 'approved', 'denied') DEFAULT 'none',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES discipline_categories(id),
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE TABLE discipline_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year_id INT NOT NULL,
    total_cases INT DEFAULT 0,
    resolved_cases INT DEFAULT 0,
    pending_cases INT DEFAULT 0,
    appealed_cases INT DEFAULT 0,
    category_breakdown JSON NULL,
    monthly_trends JSON NULL,
    top_categories JSON NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- =============================== STUDENT PERFORMANCE TRACKING ===============================
CREATE TABLE student_conduct_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    rating_period ENUM('monthly', 'quarterly', 'semesterly', 'annual') DEFAULT 'monthly',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    overall_rating DECIMAL(3,2) DEFAULT 0,
    punctuality_rating DECIMAL(3,2) DEFAULT 0,
    behavior_rating DECIMAL(3,2) DEFAULT 0,
    participation_rating DECIMAL(3,2) DEFAULT 0,
    respect_rating DECIMAL(3,2) DEFAULT 0,
    comments TEXT,
    comments_rw TEXT,
    rated_by INT NOT NULL,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (rated_by) REFERENCES users(id),
    UNIQUE KEY unique_rating (student_id, academic_year_id, rating_period, period_start, period_end)
);

CREATE TABLE student_performance_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    average_grade DECIMAL(5,2) DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 0,
    conduct_rating DECIMAL(3,2) DEFAULT 0,
    total_discipline_cases INT DEFAULT 0,
    sports_participation BOOLEAN DEFAULT false,
    extracurricular_activities INT DEFAULT 0,
    leadership_roles INT DEFAULT 0,
    improvement_trend VARCHAR(20) DEFAULT 'stable',
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    recommendations TEXT,
    recommendations_rw TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE KEY unique_metrics (student_id, academic_year_id)
);

-- =============================== DYNAMIC CONTENT MANAGEMENT ===============================
CREATE TABLE dynamic_home_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    title_rw VARCHAR(255),
    subtitle TEXT,
    subtitle_rw TEXT,
    content TEXT,
    content_rw TEXT,
    image_url VARCHAR(500) NULL,
    button_text VARCHAR(100),
    button_text_rw VARCHAR(100),
    button_link VARCHAR(500),
    background_color VARCHAR(50) DEFAULT '#ffffff',
    text_color VARCHAR(50) DEFAULT '#000000',
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE dynamic_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_rw VARCHAR(255) NOT NULL,
    description TEXT,
    description_rw TEXT,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(100) NOT NULL DEFAULT 'from-blue-500 to-indigo-600',
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE dynamic_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_key VARCHAR(50) NOT NULL UNIQUE,
    value VARCHAR(20) NOT NULL,
    label VARCHAR(100) NOT NULL,
    label_rw VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(100) NOT NULL DEFAULT 'from-blue-500 to-indigo-500',
    auto_update BOOLEAN DEFAULT true,
    query_type VARCHAR(50) NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================== NOTIFICATION SYSTEM ===============================
CREATE TABLE system_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_rw VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_rw TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'announcement') DEFAULT 'info',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    target_audience ENUM('all', 'students', 'teachers', 'parents', 'staff', 'admin') DEFAULT 'all',
    target_roles JSON NULL,
    target_users JSON NULL,
    expires_at TIMESTAMP NULL,
    action_button_text VARCHAR(100) NULL,
    action_button_link VARCHAR(500) NULL,
    image_url VARCHAR(500) NULL,
    sent_by INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sent_by) REFERENCES users(id)
);

CREATE TABLE notification_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES system_notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_read (notification_id, user_id)
);

-- =============================== AUTO-UPDATE TRIGGERS ===============================
DELIMITER //

CREATE TRIGGER update_discipline_stats AFTER INSERT ON discipline_cases
FOR EACH ROW
BEGIN
    SET @current_year = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1);
    IF @current_year IS NOT NULL THEN
        INSERT INTO discipline_stats (academic_year_id, total_cases, resolved_cases, pending_cases, appealed_cases)
        VALUES (@current_year, 1,
                CASE WHEN NEW.status = 'resolved' THEN 1 ELSE 0 END,
                CASE WHEN NEW.status IN ('reported', 'investigating') THEN 1 ELSE 0 END,
                CASE WHEN NEW.appeal_status = 'pending' THEN 1 ELSE 0 END)
        ON DUPLICATE KEY UPDATE
            total_cases = total_cases + 1,
            resolved_cases = resolved_cases + CASE WHEN NEW.status = 'resolved' THEN 1 ELSE 0 END,
            pending_cases = pending_cases + CASE WHEN NEW.status IN ('reported', 'investigating') THEN 1 ELSE 0 END,
            appealed_cases = appealed_cases + CASE WHEN NEW.appeal_status = 'pending' THEN 1 ELSE 0 END;
    END IF;
END//

CREATE TRIGGER update_student_metrics AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    SET @current_year = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1);
    IF @current_year IS NOT NULL THEN
        SET @avg_grade = (
            SELECT AVG((obtained_marks / max_marks) * 100)
            FROM grades g
            JOIN classes c ON g.class_id = c.id
            WHERE g.student_id = NEW.student_id AND c.academic_year_id = @current_year
        );

        SET @attendance_rate = (
            SELECT
                CASE
                    WHEN COUNT(*) > 0 THEN (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100
                    ELSE 0
                END
            FROM attendance a
            JOIN classes cl ON a.class_id = cl.id
            WHERE a.student_id = NEW.student_id AND cl.academic_year_id = @current_year
        );

        INSERT INTO student_performance_metrics (
            student_id, academic_year_id, average_grade, attendance_rate
        ) VALUES (
            NEW.student_id, @current_year, COALESCE(@avg_grade, 0), COALESCE(@attendance_rate, 0)
        ) ON DUPLICATE KEY UPDATE
            average_grade = COALESCE(@avg_grade, average_grade),
            attendance_rate = COALESCE(@attendance_rate, attendance_rate);
    END IF;
END//

DELIMITER ;

-- =============================== INSERT DEFAULT DATA ===============================
INSERT INTO sports_categories (name, name_rw, icon, color, bg_color, border_color, description, description_rw, sort_order) VALUES
('Football', 'Umupira w\'Amaguru', '⚽', 'from-green-500 to-emerald-600', 'from-green-50 to-emerald-50', 'border-green-200 hover:border-green-400', 'Football team with championship history', 'Ikipe y\'umupira wamaguru ifite amateka yo gutsinda ibikombe', 1),
('Volleyball', 'Volleyball', '🏐', 'from-blue-500 to-indigo-600', 'from-blue-50 to-indigo-50', 'border-blue-200 hover:border-blue-400', 'Competitive volleyball team', 'Ikipe ya volleyball y\'umupira wo mu kirere', 2),
('Basketball', 'Umupira wo mu Gatebo', '🏀', 'from-orange-500 to-red-600', 'from-orange-50 to-red-50', 'border-orange-200 hover:border-orange-400', 'Basketball champions of the region', 'Abatsinze ibikombe bya basketball mu karere', 3),
('Athletics', 'Siporo z\'Umubiri', '🏃', 'from-yellow-500 to-amber-600', 'from-yellow-50 to-amber-50', 'border-yellow-200 hover:border-yellow-400', 'Track and field athletes', 'Abanyeshuri b\'umupira w\'amaguru n\'abandi', 4),
('Handball', 'Umupira w\'Intoki', '🤾', 'from-purple-500 to-violet-600', 'from-purple-50 to-violet-50', 'border-purple-200 hover:border-purple-400', 'Handball team with growing success', 'Ikipe y\'umupira w\'intoki iragenda iterambere', 5),
('Table Tennis', 'Tenisi y\'Ameza', '🏓', 'from-cyan-500 to-teal-600', 'from-cyan-50 to-teal-50', 'border-cyan-200 hover:border-cyan-400', 'Table tennis champions', 'Abatsinze ibikombe bya tenisi y\'ameza', 6);

INSERT INTO discipline_categories (name, name_rw, description, description_rw, severity_level, color, sort_order) VALUES
('Attendance Issues', 'Ibibazo by\'Itabira', 'Problems with attendance and punctuality', 'Ibibazo bijyanye n\'itabira n\'igihe', 'medium', '#f59e0b', 1),
('Behavioral Issues', 'Ibibazo by\'Imyitwarire', 'Disruptive behavior in class', 'Imyitwarire mibi mu ishuri', 'high', '#ef4444', 2),
('Academic Dishonesty', 'Kubeshya mu Masomo', 'Cheating, plagiarism, or other academic misconduct', 'Kubeshya, kwiba ibitekerezo cyangwa ibindi', 'high', '#dc2626', 3),
('Bullying', 'Gusenya Abandi', 'Harassment or bullying of other students', 'Gusenya cyangwa guhohotera abandi', 'critical', '#991b1b', 4),
('Property Damage', 'Kwangiza Imitungo', 'Damaging school property', 'Kwangiza imitungo y\'ishuri', 'high', '#ea580c', 5),
('Uniform Violations', 'Kubahiriza Imyenda', 'Not following uniform policy', 'Kubahiriza amabwiriza y\'imyenda', 'low', '#f97316', 6);

INSERT INTO dynamic_features (title, title_rw, description, description_rw, icon, color, sort_order) VALUES
('Experienced Teachers', 'Abarimu Babizi', 'Our teachers have extensive experience and expertise', 'Abarimu bacu bafite uburambe bwinshi n\'ubuhanga', 'GraduationCap', 'from-blue-500 to-indigo-600', 1),
('Modern Facilities', 'Ibikoresho By\'Igihe', 'State-of-the-art facilities and equipment', 'Ibikoresho bigezweho by\'igihe', 'Building', 'from-green-500 to-teal-500', 2),
('High Employment Rate', 'Gushirwa mu Kazi Cyinshi', '95% of our graduates find employment', '95% y\'abanyeshuri bacu babona akazi', 'Briefcase', 'from-yellow-500 to-orange-500', 3),
('Many Trophies', 'Ibihembo Byinshi', '25+ trophies won in various competitions', 'Ibihembo 25+ byatsindwe mu marushanwa', 'Trophy', 'from-orange-500 to-red-500', 4),
('International Partnerships', 'Ubufatanye Mpuzamahanga', 'Partnerships with international institutions', 'Ubufatanye n\'amashuri mpuzamahanga', 'Globe', 'from-pink-500 to-rose-500', 5),
('Extracurricular Activities', 'Ibikorwa by\'Inyongera', 'Sports, clubs, and other activities', 'Siporo, amakoperative n\'ibindi bikorwa', 'Target', 'from-purple-500 to-indigo-500', 6);

INSERT INTO dynamic_stats (stat_key, value, label, label_rw, icon, color, auto_update, query_type, sort_order) VALUES
('students', '1248', 'Students', 'Abanyeshuri', 'Users', 'from-blue-500 to-indigo-500', true, 'count_students', 1),
('teachers', '84', 'Teachers', 'Abarimu', 'GraduationCap', 'from-green-500 to-teal-500', true, 'count_teachers', 2),
('employment', '95%', 'Employment Rate', 'Gushirwa mu Kazi', 'Briefcase', 'from-yellow-500 to-orange-500', false, NULL, 3),
('awards', '38', 'Trophies', 'Ibihembo', 'Trophy', 'from-orange-500 to-red-500', true, 'count_trophies', 4);

INSERT INTO events (title, title_rw, description, description_rw, event_date, event_time, location, event_type, priority, organizer, organizer_rw, sort_order) VALUES
('Parent-Teacher Meeting', 'Inama y\'Ababyeyi n\'Abarimu', 'Monthly meeting between parents and teachers', 'Inama y\'ukwezi ihuza ababyeyi n\'abarimu', '2026-01-25', '14:00:00', 'Main Hall', 'academic', 'high', 'School Administration', 'Abayobozi b\'Ishuri', 1),
('Mid-term Exams', 'Imirimo y\'Icyiciro cya Kabiri', 'Mid-term examinations for all classes', 'Imirimo y\'icyiciro cya kabiri ku mashuri yose', '2026-01-28', '08:00:00', 'All Classrooms', 'academic', 'high', 'Academic Department', 'Ishami ry\'Amashuri', 2),
('Basketball Championship', 'Igikombe cya Basketball', 'Regional basketball championship finals', 'Impera z\'igikombe cya basketball cy\'akarere', '2026-02-01', '14:00', 'Kibagabaga Stadium', 'sports', 'medium', 'Sports Department', 'Ishami ry\'Imikino', 3),
('Athletics Competition', 'Marushanwa y\'Imikino Ngororamubiri', 'Inter-school athletics competition', 'Marushanwa y\'imikino ngororamubiri hagati y\'amashuri', '2026-02-05', '08:00', 'Nyamirambo Stadium', 'sports', 'medium', 'PE Department', 'Ishami ry\'Imikino Ngororamubiri', 4);

INSERT INTO sports_achievements (sport_category_id, title, title_rw, position, achievement_date, description, description_rw, is_featured, sort_order) VALUES
(3, 'Basketball Regional Championship 2023', 'Igikombe cya Basketball cy\'Akarere 2023', '🥇 1st Place', '2023-12-15', 'Won the regional basketball championship', 'Twatsinze igikombe cya basketball cy\'akarere', true, 1),
(1, 'Football Inter-School Tournament', 'Marushanwa y\'Umupira w\'Amaguru hagati y\'Amashuri', '🥈 2nd Place', '2023-11-20', 'Second place in inter-school football tournament', 'Twabaye aba kabiri mu marushanwa y\'umupira w\'amaguru', true, 2),
(2, 'Volleyball MVP Award', 'Igihembo cya MVP muri Volleyball', '⭐ MVP Award', '2023-10-10', 'Player of the tournament award', 'Igihembo cy\'umukinnyi mwiza cy\'amarushanwa', true, 3),
(4, 'Regional Athletics Championship', 'Igikombe cy\'Imikino Ngororamubiri cy\'Akarere', '🥇 1st Place', '2023-09-25', 'Multiple gold medals in regional championship', 'Imyambaro y\'izahabu nyinshi mu gikombe cy\'akarere', true, 4);

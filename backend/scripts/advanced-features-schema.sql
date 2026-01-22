-- Sports Management Tables

CREATE TABLE IF NOT EXISTS matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  home_team_id INT,
  away_team_id INT,
  match_date DATETIME NOT NULL,
  venue VARCHAR(255),
  sport_type ENUM('football', 'volleyball', 'basketball', 'athletics') NOT NULL,
  competition VARCHAR(255),
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  jersey_number INT,
  position VARCHAR(100),
  team_id INT,
  sport_type ENUM('football', 'volleyball', 'basketball', 'athletics') NOT NULL,
  image VARCHAR(500),
  date_of_birth DATE,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  status ENUM('active', 'injured', 'suspended', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS trophies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  competition VARCHAR(255),
  sport_type ENUM('football', 'volleyball', 'basketball', 'athletics') NOT NULL,
  year INT NOT NULL,
  date_won DATE,
  image VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sports_gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sport_type ENUM('football', 'volleyball', 'basketball', 'athletics'),
  event_name VARCHAR(255),
  event_date DATE,
  image VARCHAR(500) NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_id INT NOT NULL,
  match_id INT NOT NULL,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  minutes_played INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

-- Academic Year Management

CREATE TABLE IF NOT EXISTS academic_years (
  id INT PRIMARY KEY AUTO_INCREMENT,
  year_name VARCHAR(50) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT 0,
  status ENUM('active', 'completed', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher Management

CREATE TABLE IF NOT EXISTS teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  specialization VARCHAR(255),
  qualification VARCHAR(255),
  experience_years INT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact VARCHAR(255),
  status ENUM('active', 'on_leave', 'suspended', 'terminated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Class Management

CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50),
  section VARCHAR(50),
  academic_year_id INT NOT NULL,
  trade_code VARCHAR(50),
  capacity INT,
  room_number VARCHAR(50),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (trade_code) REFERENCES trades(code)
);

CREATE TABLE IF NOT EXISTS teacher_classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  class_id INT NOT NULL,
  subject VARCHAR(255),
  is_class_teacher BOOLEAN DEFAULT 0,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Workshop Management

CREATE TABLE IF NOT EXISTS workshops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  facilitator VARCHAR(255),
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  venue VARCHAR(255),
  target_audience VARCHAR(255),
  max_participants INT,
  status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workshop_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workshop_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workshop_id) REFERENCES workshops(id)
);

CREATE TABLE IF NOT EXISTS workshop_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workshop_id INT NOT NULL,
  user_id INT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attendance_status ENUM('registered', 'attended', 'absent', 'cancelled') DEFAULT 'registered',
  FOREIGN KEY (workshop_id) REFERENCES workshops(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Student Lifecycle

CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  student_number VARCHAR(50) UNIQUE,
  trade_code VARCHAR(50),
  enrollment_date DATE,
  status ENUM('active', 'graduated', 'suspended', 'withdrawn', 'transferred') DEFAULT 'active',
  graduation_date DATE,
  certificate_issued BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (trade_code) REFERENCES trades(code)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('active', 'completed', 'withdrawn') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

CREATE TABLE IF NOT EXISTS student_transfers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  from_class_id INT,
  to_class_id INT,
  from_trade_code VARCHAR(50),
  to_trade_code VARCHAR(50),
  reason TEXT,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (from_class_id) REFERENCES classes(id),
  FOREIGN KEY (to_class_id) REFERENCES classes(id)
);

-- News Management

CREATE TABLE IF NOT EXISTS news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR(100),
  image VARCHAR(500),
  author_id INT NOT NULL,
  tags VARCHAR(500),
  published_date DATETIME,
  featured BOOLEAN DEFAULT 0,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Event Management

CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  venue VARCHAR(255),
  organizer VARCHAR(255),
  max_participants INT,
  registration_deadline DATETIME,
  status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS event_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attendance_status ENUM('registered', 'attended', 'absent', 'cancelled') DEFAULT 'registered',
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Announcement System

CREATE TABLE IF NOT EXISTS announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience ENUM('all', 'students', 'teachers', 'staff', 'parents') DEFAULT 'all',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  created_by INT NOT NULL,
  send_email BOOLEAN DEFAULT 0,
  send_sms BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS announcement_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  announcement_id INT NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcement_id) REFERENCES announcements(id)
);

-- Media Library

CREATE TABLE IF NOT EXISTS media_library (
  id INT PRIMARY KEY AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  category VARCHAR(100),
  uploaded_by INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- System Settings

CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Activity Log

CREATE TABLE IF NOT EXISTS activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default academic year
INSERT INTO academic_years (year_name, start_date, end_date, is_current, status) 
VALUES ('2025-2026', '2025-01-01', '2026-12-31', 1, 'active')
ON DUPLICATE KEY UPDATE year_name = year_name;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('school_name', 'Garden TVET School'),
('school_email', 'info@gardentvet.edu.rw'),
('school_phone', '+250 788 000 000'),
('school_address', 'Kigali, Rwanda'),
('academic_year_format', 'YYYY-YYYY'),
('default_password', '2026'),
('enable_email_notifications', '1'),
('enable_sms_notifications', '0')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

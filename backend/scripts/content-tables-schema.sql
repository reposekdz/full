-- Content Management Tables
CREATE TABLE IF NOT EXISTS news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  author_id INT,
  is_published BOOLEAN DEFAULT TRUE,
  published_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_published (is_published),
  INDEX idx_category (category)
);

CREATE TABLE IF NOT EXISTS hero_slides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  subtitle TEXT,
  image_url VARCHAR(500),
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  rating INT DEFAULT 5,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  achievement_date DATE,
  category VARCHAR(100),
  image_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date DATETIME,
  location VARCHAR(255),
  category VARCHAR(100),
  image_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sports_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sports_matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  match_date DATETIME,
  location VARCHAR(255),
  sport_type VARCHAR(100),
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sports_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  achievement_date DATE,
  sport_type VARCHAR(100),
  student_name VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sports_teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sport VARCHAR(100) NOT NULL,
  description TEXT,
  coach VARCHAR(255),
  captain VARCHAR(255),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO hero_slides (title, subtitle, display_order, is_active) VALUES
('Welcome to Garden TVET School', 'Excellence in Technical Education', 1, TRUE),
('Build Your Future', 'Quality Programs in Technology and Construction', 2, TRUE),
('Join Us Today', 'Transform Your Career with Practical Skills', 3, TRUE)
ON DUPLICATE KEY UPDATE title = title;

INSERT INTO features (title, description, icon, display_order, is_active) VALUES
('Quality Education', 'Industry-standard curriculum and experienced instructors', 'GraduationCap', 1, TRUE),
('Modern Facilities', 'State-of-the-art labs and equipment', 'Building2', 2, TRUE),
('Career Support', 'Job placement assistance and internships', 'Briefcase', 3, TRUE),
('Flexible Learning', 'Day and evening classes available', 'Clock', 4, TRUE)
ON DUPLICATE KEY UPDATE title = title;

INSERT INTO sports_categories (name, description, icon, is_active) VALUES
('Football', 'School football team and competitions', 'Trophy', TRUE),
('Basketball', 'Basketball training and matches', 'Trophy', TRUE),
('Volleyball', 'Volleyball team activities', 'Trophy', TRUE)
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO sports_teams (name, sport, description, is_active) VALUES
('Garden TVET Football Team', 'Football', 'Our competitive football team', TRUE),
('Garden TVET Basketball Team', 'Basketball', 'School basketball champions', TRUE),
('Garden TVET Volleyball Team', 'Volleyball', 'Volleyball excellence', TRUE)
ON DUPLICATE KEY UPDATE name = name;

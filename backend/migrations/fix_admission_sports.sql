-- Fix admission system and sports tables

-- Create admission_applications table if not exists
CREATE TABLE IF NOT EXISTS admission_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female'),
  address TEXT,
  trade_preference VARCHAR(100),
  previous_school VARCHAR(255),
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(50),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop and recreate sports_statistics table
DROP TABLE IF EXISTS sports_statistics;

CREATE TABLE sports_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sport_type VARCHAR(100) NOT NULL,
  total_players INT DEFAULT 0,
  total_matches INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  goals_scored INT DEFAULT 0,
  goals_conceded INT DEFAULT 0,
  season VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sport (sport_type),
  INDEX idx_season (season)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default sports statistics
INSERT INTO sports_statistics (sport_type, season) VALUES
('Football', '2024'),
('Basketball', '2024'),
('Volleyball', '2024');

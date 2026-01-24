-- Sports Teams Database Schema

-- Teams table
CREATE TABLE IF NOT EXISTS sports_teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  sport_type ENUM('football', 'volleyball') NOT NULL,
  description TEXT,
  description_en TEXT,
  icon VARCHAR(10),
  image_url VARCHAR(500),
  founded_year INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Coaches table
CREATE TABLE IF NOT EXISTS sports_coaches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_rw VARCHAR(100),
  role VARCHAR(100),
  role_rw VARCHAR(100),
  image_url VARCHAR(500),
  email VARCHAR(100),
  phone VARCHAR(20),
  experience_years INT,
  bio TEXT,
  bio_rw TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
);

-- Players table
CREATE TABLE IF NOT EXISTS sports_players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_rw VARCHAR(100),
  jersey_number INT,
  position VARCHAR(50),
  position_rw VARCHAR(50),
  image_url VARCHAR(500),
  date_of_birth DATE,
  height INT,
  weight INT,
  class VARCHAR(50),
  is_captain BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  joined_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
);

-- Achievements table
CREATE TABLE IF NOT EXISTS sports_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  title_rw VARCHAR(200),
  description TEXT,
  description_rw TEXT,
  achievement_date DATE,
  position INT,
  competition_name VARCHAR(200),
  competition_name_rw VARCHAR(200),
  icon VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
);

-- Matches/Games table
CREATE TABLE IF NOT EXISTS sports_matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  opponent VARCHAR(100) NOT NULL,
  match_date DATE NOT NULL,
  match_time TIME,
  location VARCHAR(200),
  location_rw VARCHAR(200),
  our_score INT,
  opponent_score INT,
  result ENUM('win', 'loss', 'draw', 'pending'),
  match_type VARCHAR(50),
  season VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO sports_teams (name, name_en, sport_type, description, description_en, icon, image_url, founded_year) VALUES
('Umupira w''Amaguru', 'Football Team', 'football', 
 'Ikipe ya Garden TVET School mu mupira w''amaguru. Ikipe yacu ifite abakinnyi beza kandi ifite intsinzi nyinshi mu marushanwa atandukanye.',
 'Garden TVET School Football Team. Our team has excellent players and many victories in various competitions.',
 '⚽', '/uploads/sports/football-team.jpg', 2020),
 
('Umupira w''Amaboko', 'Volleyball Team', 'volleyball',
 'Ikipe ya Garden TVET School mu mupira w''amaboko. Ikipe yacu ifite abakinnyi beza kandi ifite intsinzi nyinshi mu marushanwa atandukanye.',
 'Garden TVET School Volleyball Team. Our team has excellent players and many victories in various competitions.',
 '🏐', '/uploads/sports/volleyball-team.jpg', 2020);

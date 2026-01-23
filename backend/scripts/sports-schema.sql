-- Sports Management Database Schema for Football and Volleyball

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sport_type ENUM('football', 'volleyball') NOT NULL,
  category VARCHAR(100) DEFAULT 'Senior',
  logo VARCHAR(500),
  description TEXT,
  founded_year INT,
  coach_name VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sport_type (sport_type),
  INDEX idx_status (status)
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT,
  name VARCHAR(255) NOT NULL,
  sport_type ENUM('football', 'volleyball') NOT NULL,
  position VARCHAR(100),
  jersey_number INT,
  photo VARCHAR(500),
  date_of_birth DATE,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  nationality VARCHAR(100) DEFAULT 'Rwanda',
  status ENUM('active', 'inactive', 'injured') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  INDEX idx_team (team_id),
  INDEX idx_sport_type (sport_type),
  INDEX idx_status (status)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sport_type ENUM('football', 'volleyball') NOT NULL,
  home_team_id INT NOT NULL,
  away_team_id INT NOT NULL,
  competition VARCHAR(255),
  match_date DATE NOT NULL,
  match_time TIME,
  location VARCHAR(255),
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
  match_report TEXT,
  attendance INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE,
  INDEX idx_sport_type (sport_type),
  INDEX idx_match_date (match_date),
  INDEX idx_status (status)
);

-- Player Statistics table
CREATE TABLE IF NOT EXISTS player_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_id INT NOT NULL,
  match_id INT NOT NULL,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  minutes_played INT DEFAULT 0,
  spikes INT DEFAULT 0,
  blocks INT DEFAULT 0,
  serves INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  INDEX idx_player (player_id),
  INDEX idx_match (match_id)
);

-- Trophies table
CREATE TABLE IF NOT EXISTS trophies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sport_type ENUM('football', 'volleyball') NOT NULL,
  trophy_name VARCHAR(255) NOT NULL,
  competition VARCHAR(255),
  year INT NOT NULL,
  date_won DATE,
  description TEXT,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sport_type (sport_type),
  INDEX idx_year (year)
);

-- Sports Gallery table
CREATE TABLE IF NOT EXISTS sports_gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sport_type ENUM('football', 'volleyball') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  event_date DATE,
  photographer VARCHAR(255),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sport_type (sport_type),
  INDEX idx_featured (featured),
  INDEX idx_event_date (event_date)
);

-- Insert sample Football data
INSERT INTO teams (name, sport_type, category, description, coach_name, status) VALUES
('Garden TVET Football A', 'football', 'Senior', 'Main football team representing Garden TVET in regional competitions', 'Coach Jean Baptiste', 'active'),
('Garden TVET Football B', 'football', 'Junior', 'Junior football team for developing young talents', 'Coach Eric Mugisha', 'active');

INSERT INTO players (team_id, name, sport_type, position, jersey_number, nationality, status) VALUES
(1, 'Nshimiyimana Patrick', 'football', 'Forward', 10, 'Rwanda', 'active'),
(1, 'Uwimana Jean', 'football', 'Midfielder', 8, 'Rwanda', 'active'),
(1, 'Habimana Eric', 'football', 'Defender', 5, 'Rwanda', 'active'),
(1, 'Mugisha Claude', 'football', 'Goalkeeper', 1, 'Rwanda', 'active'),
(1, 'Niyonzima David', 'football', 'Forward', 11, 'Rwanda', 'active'),
(1, 'Bizimana Frank', 'football', 'Midfielder', 6, 'Rwanda', 'active'),
(2, 'Kalisa Junior', 'football', 'Forward', 9, 'Rwanda', 'active'),
(2, 'Mutoni Alex', 'football', 'Defender', 4, 'Rwanda', 'active');

INSERT INTO matches (sport_type, home_team_id, away_team_id, competition, match_date, match_time, location, home_score, away_score, status) VALUES
('football', 1, 2, 'Inter-School League', '2024-03-15', '14:00:00', 'Amahoro Stadium', 3, 1, 'completed'),
('football', 1, 2, 'Regional Championship', '2024-04-20', '15:00:00', 'Kigali Stadium', 0, 0, 'scheduled');

INSERT INTO trophies (sport_type, trophy_name, competition, year, date_won, description) VALUES
('football', 'Regional Champions', 'Kigali Schools League', 2023, '2023-12-15', 'Won the regional championship defeating 12 schools'),
('football', 'Fair Play Award', 'National Schools Tournament', 2023, '2023-11-20', 'Recognized for exceptional sportsmanship'),
('football', 'Top Scorer Trophy', 'Inter-School Competition', 2023, '2023-10-10', 'Patrick Nshimiyimana scored 15 goals');

-- Insert sample Volleyball data
INSERT INTO teams (name, sport_type, category, description, coach_name, status) VALUES
('Garden TVET Volleyball Men', 'volleyball', 'Senior', 'Men\'s volleyball team competing at national level', 'Coach Marie Uwase', 'active'),
('Garden TVET Volleyball Women', 'volleyball', 'Senior', 'Women\'s volleyball team with outstanding performance', 'Coach Grace Mukamana', 'active');

INSERT INTO players (team_id, name, sport_type, position, jersey_number, nationality, status) VALUES
(3, 'Kamanzi Joseph', 'volleyball', 'Spiker', 7, 'Rwanda', 'active'),
(3, 'Nkurunziza Emmanuel', 'volleyball', 'Setter', 3, 'Rwanda', 'active'),
(3, 'Hakizimana Olivier', 'volleyball', 'Blocker', 12, 'Rwanda', 'active'),
(3, 'Nsengimana Fabrice', 'volleyball', 'Libero', 2, 'Rwanda', 'active'),
(4, 'Uwera Claudine', 'volleyball', 'Spiker', 8, 'Rwanda', 'active'),
(4, 'Mukamana Diane', 'volleyball', 'Setter', 5, 'Rwanda', 'active'),
(4, 'Ingabire Peace', 'volleyball', 'Blocker', 11, 'Rwanda', 'active');

INSERT INTO matches (sport_type, home_team_id, away_team_id, competition, match_date, match_time, location, home_score, away_score, status) VALUES
('volleyball', 3, 4, 'School Championship', '2024-03-10', '16:00:00', 'School Court', 3, 2, 'completed'),
('volleyball', 3, 4, 'Regional Finals', '2024-04-15', '14:30:00', 'Kigali Arena', 0, 0, 'scheduled');

INSERT INTO trophies (sport_type, trophy_name, competition, year, date_won, description) VALUES
('volleyball', 'National Schools Champions', 'Rwanda Schools Volleyball', 2023, '2023-12-20', 'Won national championship in thrilling final'),
('volleyball', 'Best Team Award', 'Regional Tournament', 2023, '2023-11-15', 'Recognized as best performing team'),
('volleyball', 'MVP Award', 'Inter-School League', 2023, '2023-10-25', 'Joseph Kamanzi named Most Valuable Player');

-- Insert sample gallery images
INSERT INTO sports_gallery (sport_type, title, description, image_url, event_date, featured) VALUES
('football', 'Championship Victory', 'Team celebrating regional championship win', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800', '2023-12-15', TRUE),
('football', 'Training Session', 'Players during intensive training', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800', '2024-01-10', FALSE),
('volleyball', 'National Finals', 'Team competing in national finals', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', '2023-12-20', TRUE),
('volleyball', 'Team Practice', 'Volleyball team during practice session', 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800', '2024-01-15', FALSE);

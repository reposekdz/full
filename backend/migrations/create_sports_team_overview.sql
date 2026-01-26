-- Create sports_team_overview table for dynamic team overview content
CREATE TABLE IF NOT EXISTS sports_team_overview (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  content_type ENUM('stat', 'highlight', 'milestone', 'quote', 'image', 'video', 'announcement') NOT NULL,
  title VARCHAR(255),
  title_rw VARCHAR(255),
  description TEXT,
  description_rw TEXT,
  image_url VARCHAR(500),
  icon VARCHAR(50),
  value VARCHAR(100),
  color VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
);

-- Insert sample overview content for Football team (team_id = 1)
INSERT INTO sports_team_overview (team_id, content_type, title, title_rw, description, description_rw, icon, value, color, sort_order) VALUES
(1, 'stat', 'Win Rate', 'Igipimo cy\'Intsinzi', 'Current season win percentage', 'Igipimo cy\'intsinzi muri iki gihembwe', '🏆', '75%', 'green', 1),
(1, 'stat', 'Goals Scored', 'Ibitego Byatsinzwe', 'Total goals this season', 'Ibitego byose muri iki gihembwe', '⚽', '45', 'blue', 2),
(1, 'stat', 'Clean Sheets', 'Imikino Tutakiriye', 'Matches without conceding', 'Imikino tutakiriye ibitego', '🛡️', '8', 'yellow', 3),
(1, 'highlight', 'Championship Victory', 'Intsinzi y\'Igikombe', 'Won the regional championship', 'Twatsindiye igikombe cy\'akarere', '🏆', NULL, 'gold', 4),
(1, 'milestone', '100 Goals', 'Ibitego 100', 'Team reached 100 goals milestone', 'Ikipe yageze ku bitego 100', '🎯', '100', 'red', 5),
(1, 'quote', 'Team Spirit', 'Umwuka w\'Ikipe', 'Together we achieve greatness', 'Hamwe tugera ku ntsinzi', '💪', NULL, 'purple', 6);

-- Insert sample overview content for Volleyball team (team_id = 2)
INSERT INTO sports_team_overview (team_id, content_type, title, title_rw, description, description_rw, icon, value, color, sort_order) VALUES
(2, 'stat', 'Win Rate', 'Igipimo cy\'Intsinzi', 'Current season win percentage', 'Igipimo cy\'intsinzi muri iki gihembwe', '🏐', '82%', 'green', 1),
(2, 'stat', 'Sets Won', 'Amatsinda Yatsinzwe', 'Total sets won this season', 'Amatsinda yose yatsinzwe muri iki gihembwe', '📊', '67', 'blue', 2),
(2, 'stat', 'Aces', 'Aces', 'Total aces scored', 'Aces zose zakoze', '⚡', '156', 'yellow', 3),
(2, 'highlight', 'Undefeated Streak', 'Intsinzi Zikurikirana', '12 consecutive wins', 'Intsinzi 12 zikurikirana', '🔥', '12', 'orange', 4),
(2, 'milestone', 'National Ranking', 'Umwanya ku Gihugu', 'Ranked #2 nationally', 'Umwanya wa 2 ku gihugu', '🥈', '#2', 'silver', 5);

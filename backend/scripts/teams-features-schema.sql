-- Teams Table (if not exists)
CREATE TABLE IF NOT EXISTS teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sport_type ENUM('football', 'volleyball', 'basketball', 'athletics') NOT NULL,
  coach VARCHAR(255),
  captain VARCHAR(255),
  description TEXT,
  logo VARCHAR(500),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Features Table
CREATE TABLE IF NOT EXISTS features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default features
INSERT INTO features (title, description, icon, display_order, is_active) VALUES
('Quality Education', 'World-class TVET education with modern facilities and experienced instructors', 'graduation-cap', 1, 1),
('Practical Training', 'Hands-on training in state-of-the-art workshops and laboratories', 'tools', 2, 1),
('Industry Partnerships', 'Strong connections with leading companies for internships and job placements', 'handshake', 3, 1),
('Modern Facilities', 'Well-equipped classrooms, workshops, and sports facilities', 'building', 4, 1),
('Experienced Faculty', 'Highly qualified and experienced teaching staff', 'chalkboard-teacher', 5, 1),
('Career Support', 'Comprehensive career guidance and job placement assistance', 'briefcase', 6, 1)
ON DUPLICATE KEY UPDATE title = title;

-- Insert sample teams
INSERT INTO teams (name, sport_type, coach, captain, description, status) VALUES
('Garden TVET Football Team', 'football', 'Coach John Doe', 'Player Captain', 'Our competitive football team representing the school in inter-school tournaments', 'active'),
('Garden TVET Volleyball Team', 'volleyball', 'Coach Jane Smith', 'Team Leader', 'Skilled volleyball team with multiple championship wins', 'active'),
('Garden TVET Basketball Team', 'basketball', 'Coach Mike Johnson', 'Star Player', 'Dynamic basketball team competing at regional level', 'active'),
('Garden TVET Athletics Team', 'athletics', 'Coach Sarah Williams', 'Track Captain', 'Track and field athletes excelling in various events', 'active')
ON DUPLICATE KEY UPDATE name = name;

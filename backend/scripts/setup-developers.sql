CREATE TABLE IF NOT EXISTS developers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  specialization TEXT,
  bio TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  github VARCHAR(255),
  linkedin VARCHAR(255),
  portfolio VARCHAR(255),
  image_url VARCHAR(500),
  skills LONGTEXT,
  experience_years INT DEFAULT 0,
  display_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample developers
INSERT INTO developers (name, role, specialization, bio, email, phone, skills, experience_years, display_order) VALUES
('Developer 1', 'Full Stack Developer', 'React, Node.js, MySQL', 'Umukoresha ukomeye w\'ikoranabuhanga', 'dev1@gardentvet.rw', '+250788000010', '["React", "Node.js", "MySQL", "TypeScript", "Express"]', 5, 1),
('Developer 2', 'Frontend Developer', 'React, UI/UX', 'Umukoresha w\'imbere y\'urubuga', 'dev2@gardentvet.rw', '+250788000011', '["React", "CSS", "Tailwind", "Framer Motion", "UI/UX"]', 3, 2),
('Developer 3', 'Backend Developer', 'Node.js, Database', 'Umukoresha w\'inyuma y\'urubuga', 'dev3@gardentvet.rw', '+250788000012', '["Node.js", "MySQL", "MongoDB", "Express", "API Design"]', 4, 3)
ON DUPLICATE KEY UPDATE name = name;

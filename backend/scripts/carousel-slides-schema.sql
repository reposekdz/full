-- Carousel Slides Table for Hero Section
CREATE TABLE IF NOT EXISTS carousel_slides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  title_rw VARCHAR(255),
  description TEXT,
  description_rw TEXT,
  image_url VARCHAR(500) NOT NULL,
  trade_code VARCHAR(10),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_sort (sort_order)
);

-- Insert default slides with trade images
INSERT INTO carousel_slides (title, title_rw, description, description_rw, image_url, trade_code, sort_order, is_active) VALUES
('Software Development', 'Iterambere rya Porogaramu', 'Learn modern programming and software development', 'Kwiga gukora porogaramu z\'ikoranabuhanga', '/uploads/carousel/sod-slide.png', 'SOD', 1, TRUE),
('Building Construction', 'Ubwubatsi bw\'Inyubako', 'Master construction and building techniques', 'Kwiga ubwubatsi bw\'amazu n\'inyubako', '/uploads/carousel/bdc-slide.jpg', 'BDC', 2, TRUE),
('Automobile Technology', 'Ikoranabuhanga ry\'Imodoka', 'Automotive technology and mechanics', 'Kwiga ikoranabuhanga ry\'imodoka', '/uploads/carousel/aut-slide.png', 'AUT', 3, TRUE);

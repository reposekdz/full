CREATE TABLE IF NOT EXISTS gallery_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL DEFAULT 'Campus Image',
  title_rw VARCHAR(255) DEFAULT 'Ifoto y\'Ikigo',
  description TEXT,
  description_rw TEXT,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

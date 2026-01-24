-- Search System Database Setup
-- Run this SQL script to enable search logging and analytics

-- Create search_logs table for tracking searches
CREATE TABLE IF NOT EXISTS search_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  search_query VARCHAR(255) NOT NULL,
  search_type VARCHAR(50) DEFAULT 'all',
  results_count INT DEFAULT 0,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_query (search_query),
  INDEX idx_created_at (created_at),
  INDEX idx_search_type (search_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create news_articles table if not exists
CREATE TABLE IF NOT EXISTS news_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  category VARCHAR(100),
  author_id INT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active),
  FULLTEXT idx_content (title, description, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create gallery_images table if not exists
CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_rw VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add is_public column to notifications if not exists
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true AFTER type;

-- Add is_published column to assignments if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true AFTER status;

-- Insert sample news articles
INSERT INTO news_articles (title, description, content, is_active) VALUES
('Welcome to Garden TVET School', 'Official welcome message for new students', 'We are excited to welcome all new students to Garden TVET School. Our institution is committed to providing quality technical and vocational education...', true),
('New Software Development Program', 'Introducing our latest technical program', 'Garden TVET School is proud to announce the launch of our new Software Development program. This comprehensive course will prepare students for careers in technology...', true),
('Sports Day 2024 Success', 'Annual sports day celebration highlights', 'Our annual sports day was a tremendous success with over 500 students participating in various sporting events. Congratulations to all winners and participants...', true),
('Exam Schedule Released', 'End of term examination timetable', 'The examination schedule for the current term has been released. Students are advised to check their respective timetables and prepare accordingly...', true),
('New Library Resources', 'Latest books and materials available', 'The school library has been updated with new books, journals, and digital resources. Students can now access a wider range of learning materials...', true);

-- Insert sample gallery images
INSERT INTO gallery_images (title, title_rw, description, image_url, is_active) VALUES
('School Campus', 'Ikigo cy\'Ishuri', 'Beautiful view of our school campus', '/images/gallery/campus1.jpg', true),
('Computer Lab', 'Laboratoire ya Mudasobwa', 'State-of-the-art computer laboratory', '/images/gallery/lab1.jpg', true),
('Sports Field', 'Ikibuga cya Siporo', 'Our modern sports facilities', '/images/gallery/sports1.jpg', true),
('Graduation Ceremony', 'Ibirori byo Guhabwa Impamyabumenyi', '2023 graduation ceremony highlights', '/images/gallery/graduation1.jpg', true),
('Workshop Training', 'Amahugurwa mu Kigo', 'Students in practical training session', '/images/gallery/workshop1.jpg', true);

-- Create indexes for better search performance
CREATE INDEX idx_courses_search ON trade_courses(name, code, description);
CREATE INDEX idx_trades_search ON trades(name_en, name_rw, code);
CREATE INDEX idx_teams_search ON teams(name, sport_type);

-- Update existing data to ensure compatibility
UPDATE notifications SET is_public = true WHERE is_public IS NULL;
UPDATE assignments SET is_published = true WHERE is_published IS NULL;

-- Create view for popular searches
CREATE OR REPLACE VIEW popular_searches AS
SELECT 
  search_query,
  COUNT(*) as search_count,
  MAX(created_at) as last_searched
FROM search_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY search_query
ORDER BY search_count DESC
LIMIT 20;

-- Create view for search analytics
CREATE OR REPLACE VIEW search_analytics AS
SELECT 
  DATE(created_at) as search_date,
  search_type,
  COUNT(*) as total_searches,
  AVG(results_count) as avg_results,
  COUNT(DISTINCT search_query) as unique_queries
FROM search_logs
GROUP BY DATE(created_at), search_type
ORDER BY search_date DESC;

COMMIT;

-- Verify setup
SELECT 'Search system setup completed successfully!' as status;
SELECT COUNT(*) as total_news FROM news_articles;
SELECT COUNT(*) as total_gallery FROM gallery_images;

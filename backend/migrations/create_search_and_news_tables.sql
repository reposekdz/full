-- Create search_logs table for tracking searches
CREATE TABLE IF NOT EXISTS search_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  search_query VARCHAR(255) NOT NULL,
  search_type VARCHAR(50),
  results_count INT DEFAULT 0,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_query (search_query),
  INDEX idx_created_at (created_at)
);

-- Ensure news_articles table exists with all required columns
CREATE TABLE IF NOT EXISTS news_articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  author VARCHAR(100),
  category VARCHAR(50),
  date_published DATE,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add missing columns to news_articles if they don't exist
ALTER TABLE news_articles 
ADD COLUMN IF NOT EXISTS views INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares INT DEFAULT 0;

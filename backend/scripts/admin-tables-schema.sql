-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  image_url VARCHAR(500) NOT NULL,
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_category (category)
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add image_url columns to existing tables
ALTER TABLE trades ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE trade_levels ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Academic calendar
CREATE TABLE IF NOT EXISTS academic_calendar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  event_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

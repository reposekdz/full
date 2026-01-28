-- Fix all database schema issues

-- 1. Add missing columns to discussion_forums if they don't exist
ALTER TABLE discussion_forums 
ADD COLUMN IF NOT EXISTS created_by INT,
ADD COLUMN IF NOT EXISTS user_id INT;

-- 2. Add missing columns to forum_posts if they don't exist
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS created_by INT,
ADD COLUMN IF NOT EXISTS user_id INT;

-- 3. Add missing columns to teams if they don't exist
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS coach VARCHAR(255),
ADD COLUMN IF NOT EXISTS captain VARCHAR(255);

-- 4. Make exam_schedules dates nullable
ALTER TABLE exam_schedules 
MODIFY COLUMN start_date DATE NULL,
MODIFY COLUMN end_date DATE NULL;

-- 5. Ensure cafeteria_menu table exists
CREATE TABLE IF NOT EXISTS cafeteria_menu (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2) DEFAULT 0,
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  nutritional_info JSON,
  allergens JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Fix HR management - ensure employee_attendance table exists
CREATE TABLE IF NOT EXISTS employee_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(50) DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_date (employee_id, date)
);

-- 7. Ensure testimonials table exists
CREATE TABLE IF NOT EXISTS testimonials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  company VARCHAR(255),
  content TEXT NOT NULL,
  rating INT DEFAULT 5,
  image_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

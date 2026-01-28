-- Fix all remaining database schema issues

-- 1. Add missing columns to discussion_forums
ALTER TABLE discussion_forums 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Add missing columns to forum_posts
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS content TEXT;

-- 3. Add missing columns to teams
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS logo VARCHAR(255);

-- 4. Add missing columns to ai_grading_results
ALTER TABLE ai_grading_results 
ADD COLUMN IF NOT EXISTS assignment_id INT,
ADD COLUMN IF NOT EXISTS student_id INT;

-- 5. Ensure cafeteria_menu has all required columns
ALTER TABLE cafeteria_menu 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;

-- 6. Create routes that don't exist - parent routes
CREATE TABLE IF NOT EXISTS parent_routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  route_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create teacher_portal routes table
CREATE TABLE IF NOT EXISTS teacher_portal_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT,
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create staff routes table  
CREATE TABLE IF NOT EXISTS staff_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT,
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create alumni_system table
CREATE TABLE IF NOT EXISTS alumni_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  graduation_year INT,
  current_status VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create certificate_system table
CREATE TABLE IF NOT EXISTS certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  certificate_type VARCHAR(255),
  issue_date DATE,
  certificate_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create workshop_system table
CREATE TABLE IF NOT EXISTS workshops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Create content table
CREATE TABLE IF NOT EXISTS content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  content TEXT,
  type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Create homepage table
CREATE TABLE IF NOT EXISTS homepage_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section VARCHAR(255),
  content JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Create unified_content table
CREATE TABLE IF NOT EXISTS unified_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content_type VARCHAR(100),
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Create sports_advanced table
CREATE TABLE IF NOT EXISTS sports_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sport_id INT,
  statistics JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

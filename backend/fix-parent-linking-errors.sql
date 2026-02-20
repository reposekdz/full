-- FIX PARENT LINKING ERRORS
-- Run this in MySQL to ensure all tables are correct

USE garden_tvet;

-- 1. Ensure parent_student_links table exists with correct structure
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type VARCHAR(50) DEFAULT 'Parent',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  linked_by VARCHAR(100),
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_link (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Verify global_student_sheets has required columns
ALTER TABLE global_student_sheets 
  MODIFY COLUMN status VARCHAR(20) DEFAULT 'active';

-- 3. Show current links
SELECT 
  psl.id,
  u.username as parent_username,
  CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
  gss.trade_code,
  gss.level_number,
  psl.relationship_type,
  psl.status,
  psl.linked_at
FROM parent_student_links psl
JOIN users u ON psl.parent_id = u.id
JOIN global_student_sheets gss ON psl.student_id = gss.id
ORDER BY psl.linked_at DESC
LIMIT 10;

-- 4. Show available students for linking
SELECT 
  id,
  student_code,
  CONCAT(first_name, ' ', last_name) as full_name,
  trade_code,
  trade_name,
  level_number,
  gender,
  status
FROM global_student_sheets
WHERE status = 'active'
ORDER BY trade_code, level_number, last_name
LIMIT 20;

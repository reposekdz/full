-- Add missing tables and columns for GPA and Conduct tracking

-- 1. Create student_marks table if not exists
CREATE TABLE IF NOT EXISTS student_marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  course_code VARCHAR(50),
  subject_name VARCHAR(100),
  mark DECIMAL(5,2) DEFAULT 0,
  max_mark DECIMAL(5,2) DEFAULT 100,
  weight DECIMAL(5,2) DEFAULT 100,
  assessment_type VARCHAR(50),
  term VARCHAR(20),
  academic_year VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_id (student_id),
  INDEX idx_course_code (course_code),
  INDEX idx_term (term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add points_deducted column to student_conduct_records if not exists
ALTER TABLE student_conduct_records 
ADD COLUMN IF NOT EXISTS points_deducted INT DEFAULT 0 
COMMENT 'Points deducted from 40-point conduct system';

-- 3. Update existing conduct records with default points based on severity
UPDATE student_conduct_records 
SET points_deducted = CASE 
  WHEN severity = 'minor' THEN 1
  WHEN severity = 'moderate' THEN 3
  WHEN severity = 'major' THEN 5
  WHEN severity = 'severe' THEN 10
  ELSE 3
END
WHERE points_deducted = 0 OR points_deducted IS NULL;

-- 4. Verify tables exist
SELECT 'student_marks' as table_name, COUNT(*) as record_count FROM student_marks
UNION ALL
SELECT 'student_conduct_records', COUNT(*) FROM student_conduct_records;

-- 5. Show column info
SHOW COLUMNS FROM student_conduct_records LIKE 'points_deducted';

SELECT '✅ Tables and columns created successfully!' as status;

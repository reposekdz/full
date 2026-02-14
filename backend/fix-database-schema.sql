-- ============================================
-- DATABASE SCHEMA FIX SCRIPT
-- Fixes all missing tables and columns
-- ============================================

USE school_management;

-- 1. Create class_enrollments table if not exists
CREATE TABLE IF NOT EXISTS class_enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('active', 'inactive', 'completed', 'dropped') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (class_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add 'name' column to cells table if not exists
ALTER TABLE cells 
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL AFTER id;

-- 3. Add 'course_id' column to assignments table if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS course_id INT NULL AFTER class_id;

-- 4. Add 'total_amount' column to student_fees table if not exists
ALTER TABLE student_fees 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0.00 AFTER academic_year;

-- 5. Add 'student_code' column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS student_code VARCHAR(50) NULL UNIQUE AFTER email;

-- 6. Update cells table with names from sector data (if empty)
UPDATE cells c
INNER JOIN sectors s ON c.sector_id = s.id
SET c.name = CONCAT(s.name, ' Cell ', c.id)
WHERE c.name IS NULL OR c.name = '';

-- 7. Update student_fees total_amount from existing data
UPDATE student_fees 
SET total_amount = COALESCE(amount_due, 0)
WHERE total_amount = 0 OR total_amount IS NULL;

-- 8. Generate student codes for existing students without codes
UPDATE users 
SET student_code = CONCAT('STD', LPAD(id, 6, '0'))
WHERE role = 'student' AND (student_code IS NULL OR student_code = '');

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_status ON class_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_users_student_code ON users(student_code);
CREATE INDEX IF NOT EXISTS idx_cells_name ON cells(name);

-- 10. Verify the changes
SELECT 'Schema fixes completed successfully!' AS status;

-- Show table structures to verify
SHOW COLUMNS FROM class_enrollments;
SHOW COLUMNS FROM cells LIKE 'name';
SHOW COLUMNS FROM assignments LIKE 'course_id';
SHOW COLUMNS FROM student_fees LIKE 'total_amount';
SHOW COLUMNS FROM users LIKE 'student_code';

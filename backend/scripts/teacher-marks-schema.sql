-- ========================================
-- TEACHER MARKS & GLOBAL SHEETS SCHEMA
-- ========================================

-- 1. Custom Columns for Global Student Sheets & Marks
-- Defines assessments like "Quiz 1", "Midterm", "Homework 3"
CREATE TABLE IF NOT EXISTS global_student_sheets_custom_columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  column_name VARCHAR(100) NOT NULL,
  
  -- Metadata
  assessment_type ENUM('Quiz', 'Assignment', 'Midterm', 'Final', 'Project', 'Practical', 'Other') DEFAULT 'Quiz',
  max_marks DECIMAL(5,2) DEFAULT 100.00,
  weight DECIMAL(5,2) DEFAULT 1.0, -- For weighted averages
  
  -- Scope
  course_name VARCHAR(100), -- E.g., "Mathematics", "Engine Repair"
  trade_code VARCHAR(20),   -- NULL = All trades
  level_number INT,         -- NULL = All levels
  academic_year VARCHAR(20),
  term INT,
  
  -- Permissions
  created_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_scope (trade_code, level_number, academic_year, term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Marks
-- Stores the actual marks for each student for each column
CREATE TABLE IF NOT EXISTS student_marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  column_id INT NOT NULL,
  
  marks DECIMAL(5,2),
  
  -- Context (redundant but useful for quick queries/partitioning)
  academic_year VARCHAR(20),
  term INT,
  
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (column_id) REFERENCES global_student_sheets_custom_columns(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE KEY unique_student_mark (student_id, column_id),
  INDEX idx_student_term (student_id, academic_year, term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Global Student Sheets (Aggregated Data)
-- This table matches the usage in global-student-sheets.js
CREATE TABLE IF NOT EXISTS global_student_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Denormalized info for fast grid display
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  student_code VARCHAR(50),
  trade_code VARCHAR(20),
  level_number INT,
  status ENUM('active', 'inactive', 'suspended', 'graduated') DEFAULT 'active',
  
  -- Financials
  total_fees DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  payment_status ENUM('paid', 'partial', 'unpaid') DEFAULT 'unpaid',
  
  -- Academics
  average_marks DECIMAL(5,2) DEFAULT 0,
  attendance_percentage DECIMAL(5,2) DEFAULT 0,
  conduct_score DECIMAL(5,2) DEFAULT 100,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_sheet (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Custom Values (for extra fields dynamically added by users in the global view)
-- Matches usage in global-student-sheets.js update logic
CREATE TABLE IF NOT EXISTS student_sheet_custom_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  column_id INT NOT NULL, -- References a different table (student_sheet_custom_columns) if using that system
                          -- But for now we'll assume it references a column definition table
  
  value_text TEXT,
  value_number DECIMAL(12,2),
  
  updated_by_role VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_sheet_value (sheet_id, column_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View: v_global_student_sheets (Used by global-student-sheets.js)
CREATE OR REPLACE VIEW v_global_student_sheets AS
SELECT 
  gss.*,
  u.email,
  u.phone_number,
  CONCAT(u.first_name, ' ', u.last_name) as full_name
FROM global_student_sheets gss
JOIN users u ON gss.student_id = u.id;

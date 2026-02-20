-- Teacher Global Sheets with Dynamic Columns Schema

-- Custom columns table (if not exists)
CREATE TABLE IF NOT EXISTS global_student_sheets_custom_columns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  column_name VARCHAR(100) NOT NULL,
  assessment_type VARCHAR(50) DEFAULT 'test',
  max_marks INT NOT NULL DEFAULT 100,
  weight DECIMAL(5,2) DEFAULT 100.00,
  trade_code VARCHAR(10) NULL,
  level_number INT NULL,
  academic_year INT NULL,
  term INT NULL,
  course_name VARCHAR(100) DEFAULT '',
  created_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trade_level (trade_code, level_number),
  INDEX idx_year_term (academic_year, term)
);

-- Student marks table (if not exists)
CREATE TABLE IF NOT EXISTS student_marks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  column_id INT NOT NULL,
  marks DECIMAL(6,2) NOT NULL DEFAULT 0,
  academic_year INT NOT NULL,
  term INT NOT NULL,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_mark (student_id, column_id, academic_year, term),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (column_id) REFERENCES global_student_sheets_custom_columns(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_column (column_id),
  INDEX idx_year_term (academic_year, term)
);

-- Insert sample columns for testing
INSERT IGNORE INTO global_student_sheets_custom_columns 
(column_name, assessment_type, max_marks, weight, trade_code, level_number, academic_year, term, created_by) 
VALUES 
('Test 1', 'test', 20, 20.00, NULL, NULL, 2024, 1, 1),
('Test 2', 'test', 20, 20.00, NULL, NULL, 2024, 1, 1),
('Final Exam', 'exam', 60, 60.00, NULL, NULL, 2024, 1, 1);

SELECT 'Schema created successfully!' as status;

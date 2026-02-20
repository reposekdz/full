-- Create student_marks table for teacher marks sheet
CREATE TABLE IF NOT EXISTS student_marks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  assessment_name VARCHAR(100) NOT NULL,
  marks DECIMAL(5,2) NOT NULL DEFAULT 0,
  max_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  weight DECIMAL(5,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_trade_level (trade_code, level_number),
  UNIQUE KEY unique_mark (student_id, teacher_id, trade_code, level_number, assessment_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

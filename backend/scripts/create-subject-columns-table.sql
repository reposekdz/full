-- Create subject_columns table for teacher-created mark columns
CREATE TABLE IF NOT EXISTS subject_columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  subject_name VARCHAR(200) NOT NULL,
  subject_code VARCHAR(50),
  column_name VARCHAR(100) NOT NULL UNIQUE,
  max_marks INT NOT NULL DEFAULT 100,
  trade_code VARCHAR(10),
  level_number INT,
  level_suffix VARCHAR(5),
  term INT DEFAULT 1,
  academic_year INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trade_level (trade_code, level_number, level_suffix),
  INDEX idx_teacher (teacher_id),
  INDEX idx_academic (academic_year, term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update student_marks table if needed
CREATE TABLE IF NOT EXISTS student_marks_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mark_id INT,
  student_id INT NOT NULL,
  subject_name VARCHAR(200),
  subject_code VARCHAR(50),
  marks DECIMAL(10,2),
  max_marks DECIMAL(10,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(5),
  exam_type VARCHAR(50),
  term INT,
  academic_year INT,
  remarks TEXT,
  recorded_by INT,
  recorded_at TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_academic (student_id, academic_year, term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

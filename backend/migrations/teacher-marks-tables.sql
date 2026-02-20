-- Teacher Marks Table for Global Sheets
CREATE TABLE IF NOT EXISTS teacher_marks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  term VARCHAR(50) DEFAULT 'Term 1',
  assessment_type VARCHAR(50) DEFAULT 'exam',
  marks_data JSON NOT NULL COMMENT 'Stores marks for each column',
  columns_data JSON NOT NULL COMMENT 'Stores column definitions',
  total_marks DECIMAL(10,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  grade VARCHAR(2) DEFAULT 'F',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_trade_level (trade_code, level_number),
  INDEX idx_term (term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance tracking table
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (student_id, teacher_id, attendance_date),
  INDEX idx_date (attendance_date),
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Amanota (Competency) marks table
CREATE TABLE IF NOT EXISTS teacher_amanota (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  competency_name VARCHAR(255) NOT NULL,
  marks DECIMAL(5,2) NOT NULL DEFAULT 0,
  max_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  is_competent BOOLEAN GENERATED ALWAYS AS (marks >= 70) STORED,
  assessment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_competent (is_competent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT IGNORE INTO teacher_marks (student_id, teacher_id, trade_code, level_number, term, marks_data, columns_data, total_marks, percentage, grade)
SELECT 
  gss.id,
  (SELECT id FROM users WHERE role = 'teacher' LIMIT 1),
  gss.trade_code,
  gss.level_number,
  'Term 1',
  '{"col1": 18, "col2": 16, "col3": 54}',
  '[{"id":"col1","name":"Test 1","maxMarks":20,"weight":20},{"id":"col2","name":"Test 2","maxMarks":20,"weight":20},{"id":"col3","name":"Exam","maxMarks":60,"weight":60}]',
  88.00,
  88.00,
  'B'
FROM global_student_sheets gss
WHERE gss.status = 'active'
LIMIT 5;

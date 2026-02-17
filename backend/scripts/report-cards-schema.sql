-- ========================================
-- REPORT CARD GENERATION SYSTEM
-- Comprehensive report cards for all trades
-- ========================================

CREATE TABLE IF NOT EXISTS report_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Student and academic info
  student_id INT NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term INT NOT NULL CHECK (term IN (1, 2, 3)),
  trade_code VARCHAR(20) NOT NULL,
  level_number INT NOT NULL,
  
  -- Performance metrics
  total_marks DECIMAL(10,2),
  max_marks DECIMAL(10,2),
  average_marks DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(5), -- A, B+, B, C, D, F
  class_rank INT,
  total_students_in_class INT,
  
  -- Additional metrics
  attendance_percentage DECIMAL(5,2),
  conduct_score DECIMAL(5,2), -- From DOD
  participation_score DECIMAL(5,2),
  
  -- Comments
  teacher_comment TEXT,
  headmaster_comment TEXT,
  dos_comment TEXT,
  
  -- Subject-wise data (JSON for flexibility)
  subjects_data JSON, -- [{subject, marks_obtained, max_marks, grade, rank}, ...]
  
  -- Skills assessment (for TVET)
  practical_skills_rating DECIMAL(3,1), -- Out of 5.0
  theoretical_knowledge_rating DECIMAL(3,1),
  workplace_readiness_rating DECIMAL(3,1),
  
  -- Report generation
  generated_by INT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pdf_path VARCHAR(500),
  pdf_generated_at TIMESTAMP NULL,
  
  -- Status
  status ENUM('draft', 'final', 'issued', 'revised') DEFAULT 'draft',
  issued_to_parent_at TIMESTAMP NULL,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE KEY unique_student_report (student_id, academic_year, term),
  INDEX idx_student (student_id),
  INDEX idx_term (academic_year, term),
  INDEX idx_trade_level (trade_code, level_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Report Card Comments Library (suggested comments)
CREATE TABLE IF NOT EXISTS report_card_comment_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('excellence', 'good', 'satisfactory', 'needs_improvement', 'poor') NOT NULL,
  comment_text TEXT NOT NULL,
  applicable_to ENUM('all', 'specific_trade') DEFAULT 'all',
  trade_code VARCHAR(20),
  created_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grading Scale Configuration
CREATE TABLE IF NOT EXISTS grading_scales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trade_code VARCHAR(20),
  level_number INT,
  
  grade VARCHAR(5) NOT NULL,
  min_percentage DECIMAL(5,2) NOT NULL,
  max_percentage DECIMAL(5,2) NOT NULL,
  grade_point DECIMAL(3,2),
  description VARCHAR(200),
  
  is_passing BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  academic_year VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_trade_level (trade_code, level_number),
  INDEX idx_grade (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default grading scale
INSERT INTO grading_scales (trade_code, level_number, grade, min_percentage, max_percentage, grade_point, description, is_passing) VALUES
(NULL, NULL, 'A', 85.00, 100.00, 5.00, 'Excellent', TRUE),
(NULL, NULL, 'B+', 75.00, 84.99, 4.50, 'Very Good', TRUE),
(NULL, NULL, 'B', 65.00, 74.99, 4.00, 'Good', TRUE),
(NULL, NULL, 'C', 55.00, 64.99, 3.00, 'Satisfactory', TRUE),
(NULL, NULL, 'D', 45.00, 54.99, 2.00, 'Pass', TRUE),
(NULL, NULL, 'F', 0.00, 44.99, 0.00, 'Fail', FALSE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- View: Student Performance Summary (for quick report generation)
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
  u.id as student_id,
  u.first_name,
  u.last_name,
  u.student_id as student_code,
  u.trade_code,
  u.level as level_number,
  
  -- Marks summary
  COALESCE(SUM(sm.marks), 0) as total_marks,
  COALESCE(SUM(gssc.max_marks), 0) as max_marks,
  COALESCE(AVG(sm.marks / NULLIF(gssc.max_marks, 0) * 100), 0) as average_percentage,
  
  -- Count of assessments
  COUNT(DISTINCT sm.column_id) as total_assessments,
  
  -- Attendance (from global student sheets if available)
  gss.attendance_percentage,
  gss.conduct_score
  
FROM users u
LEFT JOIN student_marks sm ON u.id = sm.student_id
LEFT JOIN global_student_sheets_custom_columns gssc ON sm.column_id = gssc.id
LEFT JOIN global_student_sheets gss ON u.id = gss.student_id
WHERE u.role = 'student'
GROUP BY u.id, u.first_name, u.last_name, u.student_id, u.trade_code, u.level, gss.attendance_percentage, gss.conduct_score;

-- ============================================
-- CREATE MISSING STUDENT_EXAMS TABLE
-- Junction table linking students to exams
-- ============================================

USE school_management;

-- Create student_exams junction table
CREATE TABLE IF NOT EXISTS student_exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('scheduled', 'completed', 'missed', 'excused') DEFAULT 'scheduled',
  score DECIMAL(5,2) NULL,
  remarks TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_exam (exam_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create student_assignments junction table (if not exists)
CREATE TABLE IF NOT EXISTS student_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('pending', 'submitted', 'graded', 'late') DEFAULT 'pending',
  submission_date DATETIME NULL,
  score DECIMAL(5,2) NULL,
  feedback TEXT NULL,
  file_path VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_assignment (assignment_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_exams_exam ON student_exams(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_student ON student_exams(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_status ON student_exams(status);
CREATE INDEX IF NOT EXISTS idx_student_assignments_assignment ON student_assignments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_student ON student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON student_assignments(status);

SELECT 'student_exams and student_assignments tables created successfully!' AS status;

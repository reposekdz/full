-- Student Lessons Table for DOD Give Lessons Feature
-- This table stores lessons given to students who were absent

CREATE TABLE IF NOT EXISTS student_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  lesson_date DATE NOT NULL,
  lesson_topics TEXT,
  duration_hours DECIMAL(3,1) DEFAULT 1.0,
  notes TEXT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_id (student_id),
  INDEX idx_lesson_date (lesson_date),
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
);

-- Add sample data if table is empty
-- INSERT INTO student_lessons (student_id, subject, lesson_date, lesson_topics, duration_hours, notes, created_by)
-- SELECT gss.id, 'Mathematics', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Algebra basics', 1, 'Makeup lesson for absence', 1
-- FROM global_student_sheets gss WHERE gss.level_number = 4 LIMIT 5;

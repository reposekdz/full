-- Ultra Advanced Quiz System Database Schema

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id INT,
  trade_code VARCHAR(10),
  level_number VARCHAR(5),
  level_suffix VARCHAR(5),
  difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  time_limit INT DEFAULT 60 COMMENT 'Time in minutes',
  total_marks INT DEFAULT 100,
  passing_marks INT DEFAULT 50,
  instructions TEXT,
  start_time DATETIME,
  end_time DATETIME,
  randomize_questions BOOLEAN DEFAULT FALSE,
  show_results_immediately BOOLEAN DEFAULT TRUE,
  allow_review BOOLEAN DEFAULT TRUE,
  max_attempts INT DEFAULT 3,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_teacher (teacher_id),
  INDEX idx_trade_level (trade_code, level_number),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question_order INT NOT NULL,
  question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank', 'code') NOT NULL,
  question_text TEXT NOT NULL,
  points INT DEFAULT 10,
  options JSON COMMENT 'Array of options for multiple choice',
  correct_answer JSON COMMENT 'Correct answer(s)',
  explanation TEXT COMMENT 'Explanation shown after submission',
  media_url VARCHAR(500),
  media_type ENUM('image', 'video', 'audio'),
  code_language VARCHAR(50),
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_quiz (quiz_id),
  INDEX idx_order (quiz_id, question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz submissions table
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  student_id INT NOT NULL,
  score DECIMAL(10, 2) DEFAULT 0,
  total_marks INT NOT NULL,
  percentage DECIMAL(5, 2) DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  time_taken INT COMMENT 'Time taken in seconds',
  submitted_at DATETIME,
  status ENUM('in_progress', 'completed', 'graded') DEFAULT 'in_progress',
  feedback TEXT,
  graded_by INT,
  graded_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_quiz (quiz_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_attempt (quiz_id, student_id, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  question_id INT NOT NULL,
  student_answer TEXT,
  is_correct BOOLEAN,
  points_earned DECIMAL(10, 2) DEFAULT 0,
  teacher_feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  INDEX idx_submission (submission_id),
  INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz analytics table
CREATE TABLE IF NOT EXISTS quiz_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  total_attempts INT DEFAULT 0,
  avg_score DECIMAL(10, 2) DEFAULT 0,
  avg_time_taken INT DEFAULT 0,
  pass_rate DECIMAL(5, 2) DEFAULT 0,
  most_difficult_question_id INT,
  easiest_question_id INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_quiz (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz question bank (for reusable questions)
CREATE TABLE IF NOT EXISTS question_bank (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  subject_id INT,
  question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank', 'code') NOT NULL,
  question_text TEXT NOT NULL,
  points INT DEFAULT 10,
  options JSON,
  correct_answer JSON,
  explanation TEXT,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  tags JSON COMMENT 'Array of tags for categorization',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_teacher (teacher_id),
  INDEX idx_type (question_type),
  INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO quizzes (teacher_id, title, description, trade_code, level_number, difficulty_level, time_limit, total_marks, passing_marks, status)
VALUES 
(1, 'JavaScript Fundamentals Quiz', 'Test your knowledge of JavaScript basics', 'SOD', '3', 'medium', 45, 100, 60, 'published'),
(1, 'Database Design Assessment', 'Comprehensive database design quiz', 'SOD', '4', 'hard', 60, 150, 90, 'published');

-- Insert sample questions
INSERT INTO quiz_questions (quiz_id, question_order, question_type, question_text, points, options, correct_answer, explanation, difficulty)
VALUES 
(1, 1, 'multiple_choice', 'What is the correct way to declare a variable in JavaScript?', 10, 
 '["var x = 5", "variable x = 5", "v x = 5", "dim x = 5"]', 
 '"var x = 5"', 
 'In JavaScript, variables are declared using var, let, or const keywords.', 
 'easy'),
(1, 2, 'true_false', 'JavaScript is a compiled language.', 10, 
 '["true", "false"]', 
 '"false"', 
 'JavaScript is an interpreted language, not compiled.', 
 'medium');

-- Create views for analytics
CREATE OR REPLACE VIEW quiz_performance_summary AS
SELECT 
  q.id as quiz_id,
  q.title,
  q.teacher_id,
  COUNT(DISTINCT qs.id) as total_submissions,
  AVG(qs.score) as avg_score,
  AVG(qs.percentage) as avg_percentage,
  SUM(CASE WHEN qs.passed = 1 THEN 1 ELSE 0 END) as passed_count,
  AVG(qs.time_taken) as avg_time_taken
FROM quizzes q
LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id
WHERE qs.status = 'completed'
GROUP BY q.id;

CREATE OR REPLACE VIEW question_difficulty_analysis AS
SELECT 
  qq.id as question_id,
  qq.quiz_id,
  qq.question_text,
  qq.question_type,
  qq.difficulty,
  COUNT(qa.id) as total_answers,
  SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
  (SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(qa.id) * 100) as success_rate
FROM quiz_questions qq
LEFT JOIN quiz_answers qa ON qq.id = qa.question_id
GROUP BY qq.id;

-- Stored procedure for auto-grading
DELIMITER //
CREATE PROCEDURE auto_grade_submission(IN p_submission_id INT)
BEGIN
  DECLARE v_total_score DECIMAL(10,2);
  DECLARE v_total_marks INT;
  DECLARE v_percentage DECIMAL(5,2);
  DECLARE v_passing_marks INT;
  DECLARE v_passed BOOLEAN;
  
  -- Calculate total score
  SELECT SUM(points_earned) INTO v_total_score
  FROM quiz_answers
  WHERE submission_id = p_submission_id;
  
  -- Get quiz details
  SELECT q.total_marks, q.passing_marks
  INTO v_total_marks, v_passing_marks
  FROM quiz_submissions qs
  JOIN quizzes q ON qs.quiz_id = q.id
  WHERE qs.id = p_submission_id;
  
  -- Calculate percentage and pass status
  SET v_percentage = (v_total_score / v_total_marks) * 100;
  SET v_passed = v_total_score >= v_passing_marks;
  
  -- Update submission
  UPDATE quiz_submissions
  SET score = v_total_score,
      percentage = v_percentage,
      passed = v_passed,
      status = 'graded',
      graded_at = NOW()
  WHERE id = p_submission_id;
END //
DELIMITER ;

-- Trigger to update analytics after submission
DELIMITER //
CREATE TRIGGER after_quiz_submission_insert
AFTER INSERT ON quiz_submissions
FOR EACH ROW
BEGIN
  INSERT INTO quiz_analytics (quiz_id, total_attempts, avg_score, pass_rate)
  VALUES (NEW.quiz_id, 1, NEW.score, IF(NEW.passed, 100, 0))
  ON DUPLICATE KEY UPDATE
    total_attempts = total_attempts + 1,
    avg_score = (avg_score * (total_attempts - 1) + NEW.score) / total_attempts,
    pass_rate = (SELECT (SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100)
                 FROM quiz_submissions WHERE quiz_id = NEW.quiz_id);
END //
DELIMITER ;

-- Indexes for performance
CREATE INDEX idx_quiz_submissions_student_quiz ON quiz_submissions(student_id, quiz_id);
CREATE INDEX idx_quiz_answers_submission ON quiz_answers(submission_id);
CREATE INDEX idx_quizzes_teacher_status ON quizzes(teacher_id, status);
CREATE FULLTEXT INDEX idx_question_text ON quiz_questions(question_text);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON quizzes TO 'school_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_questions TO 'school_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_submissions TO 'school_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_answers TO 'school_user'@'localhost';
GRANT SELECT ON quiz_performance_summary TO 'school_user'@'localhost';
GRANT SELECT ON question_difficulty_analysis TO 'school_user'@'localhost';
GRANT EXECUTE ON PROCEDURE auto_grade_submission TO 'school_user'@'localhost';

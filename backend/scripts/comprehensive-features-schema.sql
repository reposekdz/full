-- Contact Management Tables
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  department VARCHAR(100),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  attachment VARCHAR(500),
  status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
  response TEXT,
  responded_at DATETIME,
  responded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department),
  INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS callback_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  preferred_time VARCHAR(50),
  preferred_date DATE,
  reason TEXT,
  status ENUM('pending', 'scheduled', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  handled_by INT,
  handled_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_date (preferred_date)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(100) NOT NULL,
  sender ENUM('user', 'support') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  INDEX idx_created (created_at)
);

-- Support System Tables
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  assigned_to INT,
  resolved_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_category (category)
);

CREATE TABLE IF NOT EXISTS ticket_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_ticket (ticket_id)
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags VARCHAR(500),
  views INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_published (is_published),
  FULLTEXT idx_search (title, content)
);

CREATE TABLE IF NOT EXISTS article_ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_rating (article_id, user_id)
);

-- Academic Tables
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  description TEXT,
  credits INT DEFAULT 3,
  trade_level_id INT,
  instructor_id INT,
  semester INT,
  academic_year_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id),
  INDEX idx_trade_level (trade_level_id),
  INDEX idx_instructor (instructor_id),
  INDEX idx_active (is_active)
);

CREATE TABLE IF NOT EXISTS course_materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  file_size INT,
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_course (course_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME,
  total_marks INT DEFAULT 100,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_course (course_id),
  INDEX idx_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  content TEXT,
  submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  score INT,
  feedback TEXT,
  status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'draft',
  graded_by INT,
  graded_at DATETIME,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (graded_by) REFERENCES users(id),
  UNIQUE KEY unique_submission (assignment_id, student_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS submission_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  exam_name VARCHAR(255) NOT NULL,
  exam_type ENUM('quiz', 'midterm', 'final', 'practical') NOT NULL,
  exam_date DATETIME,
  duration INT COMMENT 'Duration in minutes',
  total_marks INT DEFAULT 100,
  room_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course (course_id),
  INDEX idx_date (exam_date)
);

CREATE TABLE IF NOT EXISTS grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  exam_id INT,
  score DECIMAL(5,2),
  grade VARCHAR(5),
  remarks TEXT,
  academic_year_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id)
);

CREATE TABLE IF NOT EXISTS timetable (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course (course_id),
  INDEX idx_day (day_of_week)
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_name VARCHAR(100) NOT NULL,
  building VARCHAR(100),
  capacity INT,
  room_type VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  remarks TEXT,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  UNIQUE KEY unique_attendance (student_id, course_id, date),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_date (date)
);

-- Insert default staff credentials
INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active)
SELECT 'staff_default', 'reponse@gmail.com', '$2a$10$YourHashedPasswordHere', 'Staff', 'User', id, TRUE
FROM roles WHERE name = 'teacher'
ON DUPLICATE KEY UPDATE email = email;

-- Insert sample knowledge base articles
INSERT INTO knowledge_base (category, title, content, created_by) VALUES
('Admissions', 'How to Apply for Admission', 'To apply for admission to Garden TVET School, follow these steps:\n1. Visit our admissions office\n2. Fill out the application form\n3. Submit required documents\n4. Pay application fee\n5. Wait for admission decision', 1),
('Academics', 'Course Registration Process', 'Course registration is done at the beginning of each semester. Students should:\n1. Meet with academic advisor\n2. Select courses based on program requirements\n3. Register online through student portal\n4. Confirm registration and pay fees', 1),
('Finance', 'Payment Methods', 'School fees can be paid through:\n- Mobile Money (MTN, Airtel)\n- Bank transfer\n- Cash at finance office\n- Installment plans available', 1),
('Technical', 'Student Portal Access', 'To access the student portal:\n1. Go to school website\n2. Click Student Portal\n3. Enter your student ID and password\n4. Contact IT support if you have issues', 1);

-- Create indexes for performance
CREATE INDEX idx_contact_email ON contact_submissions(email);
CREATE INDEX idx_ticket_priority ON support_tickets(priority);
CREATE INDEX idx_course_code ON courses(course_code);
CREATE INDEX idx_grade_score ON grades(score);

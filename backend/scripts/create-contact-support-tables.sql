-- Contact and Support System Tables
-- This script creates all tables needed for Contact and Support pages

USE school_management;

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  department ENUM('admissions', 'academics', 'finance', 'student-services', 'technical-support', 'general') NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  attachment VARCHAR(500) NULL,
  status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
  response TEXT NULL,
  responded_by INT NULL,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_department (department),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Callback Requests Table
CREATE TABLE IF NOT EXISTS callback_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  preferred_time VARCHAR(50) NOT NULL,
  preferred_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'scheduled', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT NULL,
  handled_by INT NULL,
  handled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_preferred_date (preferred_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  sender ENUM('user', 'agent', 'bot') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category ENUM('account', 'technical', 'academic', 'payment', 'portal', 'other') NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'waiting_response', 'resolved', 'closed') DEFAULT 'open',
  assigned_to INT NULL,
  resolution TEXT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ticket Attachments Table
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ticket Responses Table
CREATE TABLE IF NOT EXISTS ticket_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Knowledge Base Articles Table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('account', 'technical', 'academic', 'payment', 'portal', 'other', 'getting-started') NOT NULL,
  tags JSON NULL,
  author_id INT NOT NULL,
  views INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_published (is_published),
  INDEX idx_views (views),
  FULLTEXT KEY idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Article Ratings Table
CREATE TABLE IF NOT EXISTS article_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (article_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample knowledge base articles
INSERT INTO knowledge_base (title, content, category, author_id, views, helpful_count) VALUES
('How to Reset Your Password', 'Step 1: Go to the login page and click "Forgot Password". Step 2: Enter your email address. Step 3: Check your email for a reset link. Step 4: Click the link and create a new password. Step 5: Log in with your new password.', 'account', 1, 1250, 890),
('Accessing the Student Portal', 'To access the student portal: 1. Visit the main website. 2. Click "Student Portal" in the header. 3. Enter your student ID and password. 4. If you forgot your password, use the reset option. 5. For first-time users, check your welcome email for login credentials.', 'portal', 1, 2100, 1650),
('How to Submit Assignments Online', 'Step 1: Log in to your account. Step 2: Navigate to your course page. Step 3: Click on the assignment you want to submit. Step 4: Upload your file (PDF, DOC, or DOCX). Step 5: Click "Submit" before the deadline. You will receive a confirmation email.', 'academic', 1, 1850, 1420),
('Understanding Your Fee Statement', 'Your fee statement includes tuition, lab fees, library fees, and any other charges. You can view a detailed breakdown in the Finance section of your portal. Payment can be made via Mobile Money, bank transfer, or in person at the Finance Office.', 'payment', 1, 980, 720),
('Troubleshooting Login Issues', 'If you cannot log in: 1. Check your internet connection. 2. Clear your browser cache and cookies. 3. Try a different browser. 4. Ensure Caps Lock is off. 5. Reset your password if needed. 6. Contact support if the issue persists.', 'technical', 1, 1540, 1180),
('How to Check Your Grades', 'To check your grades: 1. Log in to the student portal. 2. Click "Academics" in the menu. 3. Select "Grades" or "Results". 4. Choose the term/semester. 5. View your grades by subject. You can also download a PDF transcript for official records.', 'academic', 1, 2250, 1890),
('Registering for a New Semester', 'Registration Process: 1. Log in during the registration period. 2. Clear any outstanding fees. 3. Select your courses. 4. Confirm your timetable. 5. Submit registration. 6. Print your registration slip. Late registration may incur additional fees.', 'academic', 1, 1630, 1320),
('Mobile App Installation Guide', 'Download the Garden TVET app: 1. Go to Google Play Store or Apple App Store. 2. Search "Garden TVET School". 3. Download and install. 4. Open the app and log in with your credentials. 5. Enable notifications to stay updated with announcements.', 'getting-started', 1, 1120, 890);

SELECT '✅ Contact and Support tables created successfully!' as Status;

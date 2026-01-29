-- DOS Management System Extensions

-- Teacher Assignments to Classes
CREATE TABLE IF NOT EXISTS dos_teacher_class_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  teacher_name VARCHAR(200),
  trade_code VARCHAR(20) NOT NULL,
  level_number INT NOT NULL,
  class_name VARCHAR(100),
  role ENUM('class_teacher', 'subject_teacher', 'assistant') DEFAULT 'subject_teacher',
  academic_year VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_teacher (teacher_id),
  INDEX idx_class (trade_code, level_number),
  INDEX idx_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Teacher Course Assignments
CREATE TABLE IF NOT EXISTS dos_teacher_course_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  teacher_name VARCHAR(200),
  subject_code VARCHAR(20) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  trade_code VARCHAR(20),
  level_number INT,
  academic_year VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_assignment (teacher_id, subject_code, trade_code, level_number, academic_year),
  INDEX idx_teacher (teacher_id),
  INDEX idx_subject (subject_code),
  INDEX idx_class (trade_code, level_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Timetable Master
CREATE TABLE IF NOT EXISTS dos_timetables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  timetable_name VARCHAR(200) NOT NULL,
  trade_code VARCHAR(20) NOT NULL,
  level_number INT NOT NULL,
  academic_year VARCHAR(20),
  term VARCHAR(20),
  start_date DATE,
  end_date DATE,
  status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_class (trade_code, level_number),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Timetable Slots
CREATE TABLE IF NOT EXISTS dos_timetable_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  timetable_id INT NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  period_number INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_code VARCHAR(20),
  subject_name VARCHAR(100),
  teacher_id INT,
  teacher_name VARCHAR(200),
  room VARCHAR(50),
  notes TEXT,
  FOREIGN KEY (timetable_id) REFERENCES dos_timetables(id) ON DELETE CASCADE,
  INDEX idx_timetable (timetable_id),
  INDEX idx_day (day_of_week),
  INDEX idx_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Report Cards Generated
CREATE TABLE IF NOT EXISTS dos_report_cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  student_code VARCHAR(50),
  student_name VARCHAR(200),
  trade_code VARCHAR(20),
  level_number INT,
  term VARCHAR(20),
  academic_year VARCHAR(20),
  
  -- Academic Summary
  total_subjects INT DEFAULT 0,
  total_marks DECIMAL(10,2) DEFAULT 0,
  average_marks DECIMAL(10,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  gpa DECIMAL(3,2) DEFAULT 0,
  overall_grade VARCHAR(5),
  class_rank INT,
  total_students INT,
  
  -- Attendance
  attendance_rate DECIMAL(5,2),
  days_present INT,
  days_absent INT,
  days_late INT,
  
  -- Conduct
  conduct_score DECIMAL(5,2),
  conduct_grade VARCHAR(5),
  total_incidents INT,
  
  -- Comments
  class_teacher_comment TEXT,
  dos_comment TEXT,
  principal_comment TEXT,
  
  -- PDF
  pdf_path VARCHAR(500),
  pdf_generated BOOLEAN DEFAULT FALSE,
  
  -- Status
  status ENUM('draft', 'generated', 'sent_to_parent', 'printed') DEFAULT 'draft',
  generated_by INT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_report (student_id, term, academic_year),
  INDEX idx_student (student_id),
  INDEX idx_class (trade_code, level_number),
  INDEX idx_term (term, academic_year),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent SMS Notifications
CREATE TABLE IF NOT EXISTS dos_parent_sms_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_name VARCHAR(200),
  message_type ENUM('report_card', 'discipline', 'attendance', 'fee_reminder', 'general') NOT NULL,
  message_content TEXT NOT NULL,
  
  -- SMS Details
  sms_status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  sms_provider VARCHAR(50),
  sms_id VARCHAR(100),
  cost DECIMAL(10,2),
  
  -- Metadata
  sent_by INT,
  sent_by_name VARCHAR(200),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  
  INDEX idx_student (student_id),
  INDEX idx_phone (parent_phone),
  INDEX idx_status (sms_status),
  INDEX idx_type (message_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DOS Analytics Cache
CREATE TABLE IF NOT EXISTS dos_analytics_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cache_key VARCHAR(200) NOT NULL UNIQUE,
  cache_data JSON NOT NULL,
  trade_code VARCHAR(20),
  level_number INT,
  academic_year VARCHAR(20),
  term VARCHAR(20),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_key (cache_key),
  INDEX idx_class (trade_code, level_number),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bulk Report Generation Queue
CREATE TABLE IF NOT EXISTS dos_bulk_report_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  batch_id VARCHAR(100) NOT NULL,
  trade_code VARCHAR(20),
  level_number INT,
  term VARCHAR(20),
  academic_year VARCHAR(20),
  total_students INT DEFAULT 0,
  processed_students INT DEFAULT 0,
  failed_students INT DEFAULT 0,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  started_by INT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_batch (batch_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

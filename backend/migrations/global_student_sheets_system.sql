-- =====================================================
-- GLOBAL STUDENT SHEETS SYSTEM - COMPREHENSIVE SCHEMA
-- All roles use same global sheets with role-based access
-- =====================================================

-- Global Student Sheets (Master Sheet for All Students)
CREATE TABLE IF NOT EXISTS global_student_sheets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL UNIQUE,
  student_code VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  date_of_birth DATE,
  
  -- Trade & Level (Global Reference)
  trade_code VARCHAR(20) NOT NULL,
  trade_name VARCHAR(100),
  level_number INT NOT NULL,
  level_suffix VARCHAR(10),
  class_name VARCHAR(100),
  
  -- Academic Performance
  total_subjects INT DEFAULT 0,
  total_marks DECIMAL(10,2) DEFAULT 0,
  average_marks DECIMAL(10,2) DEFAULT 0,
  overall_grade VARCHAR(5),
  gpa DECIMAL(3,2) DEFAULT 0,
  class_rank INT,
  
  -- Attendance
  total_days INT DEFAULT 0,
  days_present INT DEFAULT 0,
  days_absent INT DEFAULT 0,
  days_late INT DEFAULT 0,
  attendance_percentage DECIMAL(5,2) DEFAULT 100,
  
  -- Discipline
  total_incidents INT DEFAULT 0,
  critical_incidents INT DEFAULT 0,
  high_incidents INT DEFAULT 0,
  medium_incidents INT DEFAULT 0,
  low_incidents INT DEFAULT 0,
  conduct_score DECIMAL(5,2) DEFAULT 100,
  conduct_grade VARCHAR(5) DEFAULT 'A',
  
  -- Finance
  total_fees DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  payment_status ENUM('paid', 'partial', 'unpaid') DEFAULT 'unpaid',
  
  -- Status
  enrollment_status ENUM('active', 'suspended', 'graduated', 'transferred', 'dropped') DEFAULT 'active',
  academic_year VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_trade_level (trade_code, level_number),
  INDEX idx_status (enrollment_status),
  INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Subject Performance (All Subjects for All Students)
CREATE TABLE IF NOT EXISTS student_subject_performance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Subject Info
  subject_code VARCHAR(20) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  term VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20),
  
  -- Marks Breakdown
  quiz_marks DECIMAL(5,2) DEFAULT 0,
  quiz_max DECIMAL(5,2) DEFAULT 20,
  midterm_marks DECIMAL(5,2) DEFAULT 0,
  midterm_max DECIMAL(5,2) DEFAULT 30,
  final_marks DECIMAL(5,2) DEFAULT 0,
  final_max DECIMAL(5,2) DEFAULT 50,
  
  -- Calculated
  total_marks DECIMAL(5,2) DEFAULT 0,
  total_max DECIMAL(5,2) DEFAULT 100,
  percentage DECIMAL(5,2) DEFAULT 0,
  grade VARCHAR(5),
  grade_points DECIMAL(3,2) DEFAULT 0,
  
  -- Teacher Info
  teacher_id INT,
  teacher_name VARCHAR(200),
  remarks TEXT,
  
  -- Timestamps
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_subject_term (student_id, subject_code, term, academic_year),
  INDEX idx_student (student_id),
  INDEX idx_sheet (sheet_id),
  INDEX idx_term (term, academic_year),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance Tracking (Daily Attendance)
CREATE TABLE IF NOT EXISTS student_attendance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Attendance Info
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused', 'sick') NOT NULL,
  subject VARCHAR(100),
  period VARCHAR(50),
  
  -- Marked By
  marked_by INT,
  marked_by_name VARCHAR(200),
  marked_by_role VARCHAR(50),
  remarks TEXT,
  
  -- Timestamps
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_attendance (student_id, attendance_date, subject, period),
  INDEX idx_student (student_id),
  INDEX idx_date (attendance_date),
  INDEX idx_status (status),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance Summary (Monthly/Yearly)
CREATE TABLE IF NOT EXISTS student_attendance_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Period
  month VARCHAR(20),
  year INT,
  term VARCHAR(20),
  
  -- Stats
  total_days INT DEFAULT 0,
  present_days INT DEFAULT 0,
  absent_days INT DEFAULT 0,
  late_days INT DEFAULT 0,
  excused_days INT DEFAULT 0,
  sick_days INT DEFAULT 0,
  attendance_rate DECIMAL(5,2) DEFAULT 100,
  
  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_period (student_id, month, year),
  INDEX idx_student (student_id),
  INDEX idx_period (year, month),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Discipline Records (All Incidents)
CREATE TABLE IF NOT EXISTS student_discipline_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Incident Info
  incident_date DATE NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  category ENUM('academic', 'behavioral', 'attendance', 'uniform', 'other') DEFAULT 'behavioral',
  
  -- Details
  description TEXT NOT NULL,
  location VARCHAR(200),
  witnesses TEXT,
  
  -- Action Taken
  action_taken TEXT,
  punishment VARCHAR(200),
  punishment_start DATE,
  punishment_end DATE,
  
  -- Status
  status ENUM('active', 'resolved', 'appealed', 'dismissed') DEFAULT 'active',
  resolution_notes TEXT,
  
  -- Recorded By
  recorded_by INT,
  recorded_by_name VARCHAR(200),
  recorded_by_role VARCHAR(50),
  
  -- Parent Notification
  parent_notified BOOLEAN DEFAULT FALSE,
  notification_date TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_date (incident_date),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Conduct Tracking (Behavior Score)
CREATE TABLE IF NOT EXISTS student_conduct_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL UNIQUE,
  
  -- Incident Counts
  total_incidents INT DEFAULT 0,
  critical_incidents INT DEFAULT 0,
  high_incidents INT DEFAULT 0,
  medium_incidents INT DEFAULT 0,
  low_incidents INT DEFAULT 0,
  
  -- Category Counts
  warnings INT DEFAULT 0,
  suspensions INT DEFAULT 0,
  late_arrivals INT DEFAULT 0,
  absences INT DEFAULT 0,
  misbehaviors INT DEFAULT 0,
  uniform_violations INT DEFAULT 0,
  
  -- Score Calculation
  base_score DECIMAL(5,2) DEFAULT 100,
  deductions DECIMAL(5,2) DEFAULT 0,
  final_score DECIMAL(5,2) DEFAULT 100,
  conduct_grade VARCHAR(5) DEFAULT 'A',
  conduct_status ENUM('excellent', 'good', 'fair', 'poor', 'critical') DEFAULT 'excellent',
  
  -- Last Incident
  last_incident_date DATE,
  last_incident_type VARCHAR(100),
  
  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_score (final_score),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payment Records (Finance Tracking)
CREATE TABLE IF NOT EXISTS student_payment_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Payment Info
  payment_date DATE NOT NULL,
  payment_type ENUM('tuition', 'exam', 'uniform', 'transport', 'hostel', 'cafeteria', 'other') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'bank', 'mobile_money', 'cheque', 'other') DEFAULT 'cash',
  
  -- Reference
  receipt_number VARCHAR(100) UNIQUE,
  reference_number VARCHAR(100),
  term VARCHAR(20),
  academic_year VARCHAR(20),
  
  -- Details
  description TEXT,
  notes TEXT,
  
  -- Recorded By
  recorded_by INT,
  recorded_by_name VARCHAR(200),
  
  -- Status
  status ENUM('pending', 'confirmed', 'cancelled', 'refunded') DEFAULT 'confirmed',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_date (payment_date),
  INDEX idx_type (payment_type),
  INDEX idx_status (status),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Custom Columns (Role-Based Dynamic Columns)
CREATE TABLE IF NOT EXISTS student_sheet_custom_columns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Column Definition
  column_name VARCHAR(100) NOT NULL,
  column_label VARCHAR(200) NOT NULL,
  column_type ENUM('text', 'number', 'date', 'boolean', 'select', 'textarea', 'calculated') NOT NULL,
  
  -- Options for Select Type
  select_options JSON,
  
  -- Calculation Formula (for calculated type)
  calculation_formula TEXT,
  
  -- Access Control
  created_by_role VARCHAR(50) NOT NULL,
  visible_to_roles JSON,
  editable_by_roles JSON,
  
  -- Scope
  scope ENUM('global', 'trade', 'level', 'class') DEFAULT 'global',
  scope_value VARCHAR(100),
  
  -- Display
  display_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  
  UNIQUE KEY unique_column (column_name, scope, scope_value),
  INDEX idx_role (created_by_role),
  INDEX idx_scope (scope, scope_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Custom Column Values
CREATE TABLE IF NOT EXISTS student_sheet_custom_values (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  column_id INT NOT NULL,
  
  -- Value
  value_text TEXT,
  value_number DECIMAL(10,2),
  value_date DATE,
  value_boolean BOOLEAN,
  
  -- Metadata
  updated_by INT,
  updated_by_role VARCHAR(50),
  
  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_value (sheet_id, column_id),
  INDEX idx_student (student_id),
  INDEX idx_column (column_id),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (column_id) REFERENCES student_sheet_custom_columns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Term Reports (Generated Reports)
CREATE TABLE IF NOT EXISTS student_term_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Period
  term VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  
  -- Academic Summary
  total_subjects INT DEFAULT 0,
  total_marks DECIMAL(10,2) DEFAULT 0,
  average_marks DECIMAL(10,2) DEFAULT 0,
  gpa DECIMAL(3,2) DEFAULT 0,
  overall_grade VARCHAR(5),
  class_rank INT,
  total_students INT,
  
  -- Attendance Summary
  attendance_rate DECIMAL(5,2) DEFAULT 100,
  days_present INT DEFAULT 0,
  days_absent INT DEFAULT 0,
  days_late INT DEFAULT 0,
  
  -- Conduct Summary
  conduct_score DECIMAL(5,2) DEFAULT 100,
  conduct_grade VARCHAR(5) DEFAULT 'A',
  total_incidents INT DEFAULT 0,
  
  -- Comments
  class_teacher_comment TEXT,
  dos_comment TEXT,
  principal_comment TEXT,
  
  -- Status
  status ENUM('draft', 'published', 'sent_to_parent') DEFAULT 'draft',
  published_at TIMESTAMP,
  
  -- Timestamps
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_report (student_id, term, academic_year),
  INDEX idx_student (student_id),
  INDEX idx_period (term, academic_year),
  INDEX idx_status (status),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Role Access Log (Track who accessed what)
CREATE TABLE IF NOT EXISTS student_sheet_access_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Access Info
  accessed_by INT NOT NULL,
  accessed_by_name VARCHAR(200),
  accessed_by_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  
  -- Details
  section_accessed VARCHAR(100),
  changes_made JSON,
  ip_address VARCHAR(50),
  
  -- Timestamp
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_user (accessed_by),
  INDEX idx_role (accessed_by_role),
  INDEX idx_date (accessed_at),
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- STAFF DASHBOARD COMPREHENSIVE SCHEMA
-- Supporting tables for all staff roles

-- ==============================================
-- ADVISOR TABLES
-- ==============================================

CREATE TABLE IF NOT EXISTS student_advisor_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  advisor_id INT NOT NULL,
  assignment_date DATE DEFAULT (CURRENT_DATE),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_advisor (advisor_id),
  INDEX idx_active (is_active),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_cases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  advisor_id INT NOT NULL,
  case_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('active', 'resolved', 'closed') DEFAULT 'active',
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  
  INDEX idx_student (student_id),
  INDEX idx_advisor (advisor_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS advisor_meetings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advisor_id INT NOT NULL,
  student_id INT NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TIME,
  purpose VARCHAR(255),
  location VARCHAR(200),
  status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_advisor (advisor_id),
  INDEX idx_student (student_id),
  INDEX idx_date (meeting_date),
  INDEX idx_status (status),
  FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- ACCOUNTANT TABLES
-- ==============================================

CREATE TABLE IF NOT EXISTS student_fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term VARCHAR(20) DEFAULT 'Term 1',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status ENUM('unpaid', 'partial', 'paid', 'overpaid') DEFAULT 'unpaid',
  due_date DATE,
  last_payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_student_year_term (student_id, academic_year, term),
  INDEX idx_student (student_id),
  INDEX idx_year (academic_year),
  INDEX idx_status (payment_status),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'mobile_money', 'bank_transfer', 'card', 'check') NOT NULL,
  transaction_ref VARCHAR(100),
  payment_date DATE NOT NULL,
  recorded_by INT,
  notes TEXT,
  receipt_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_date (payment_date),
  INDEX idx_method (payment_method),
  INDEX idx_ref (transaction_ref),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- DISCIPLINE (DOD) TABLES  
-- ==============================================

CREATE TABLE IF NOT EXISTS student_discipline_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
  incident_date TIMESTAMP NOT NULL,
  location VARCHAR(200),
  reported_by VARCHAR(200),
  witnesses TEXT,
  action_taken VARCHAR(255),
  punishment TEXT,
  handled_by INT,
  parent_notified BOOLEAN DEFAULT FALSE,
  parent_contact_date DATE,
  status ENUM('active', 'resolved', 'appealed') DEFAULT 'active',
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_date (incident_date),
  INDEX idx_severity (severity),
  INDEX idx_type (incident_type),
  INDEX idx_status (status),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- ATTENDANCE TABLES
-- ==============================================

CREATE TABLE IF NOT EXISTS student_attendance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  term VARCHAR(20),
  remarks TEXT,
  marked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_student_date (student_id, attendance_date),
  INDEX idx_student (student_id),
  INDEX idx_date (attendance_date),
  INDEX idx_status (status),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- INVENTORY/STOCK TABLES
-- ==============================================

CREATE TABLE IF NOT EXISTS inventory_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  unit_price DECIMAL(10,2) DEFAULT 0,
  current_quantity INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  unit_of_measure VARCHAR(50),
  supplier VARCHAR(200),
  location VARCHAR(200),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_name (name),
  INDEX idx_active (is_active),
  INDEX idx_low_stock (current_quantity, reorder_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  transaction_type ENUM('in', 'out', 'adjustment', 'purchase', 'issue', 'return') NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  total_value DECIMAL(10,2),
  reference_number VARCHAR(100),
  performed_by INT,
  recipient VARCHAR(200),
  transaction_date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_item (item_id),
  INDEX idx_date (transaction_date),
  INDEX idx_type (transaction_type),
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- GLOBAL STUDENT SHEETS (Academic Overview)
-- ==============================================

CREATE TABLE IF NOT EXISTS global_student_sheets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term VARCHAR(20) DEFAULT 'Term 1',
  average_marks DECIMAL(5,2) DEFAULT 0,
  overall_grade VARCHAR(5),
  class_rank INT,
  total_credits INT DEFAULT 0,
  gpa DECIMAL(3,2) DEFAULT 0,
  attendance_rate DECIMAL(5,2) DEFAULT 100,
  discipline_score DECIMAL(5,2) DEFAULT 100,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_student_year_term (student_id, academic_year, term),
  INDEX idx_student (student_id),
  INDEX idx_year (academic_year),
  INDEX idx_rank (class_rank),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- ENROLLMENTS (Student Class Assignment)
-- ==============================================

CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year VARCHAR(20),
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('active', 'withdrawn', 'completed', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_class (class_id),
  INDEX idx_status (status),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- NOTIFICATIONS
-- ==============================================

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  
  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_date (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- PARENT-STUDENT LINKING
-- ==============================================

CREATE TABLE IF NOT EXISTS parent_student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  linked_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data for testing

-- Insert advisor assignments (if advisors exist)
INSERT IGNORE INTO student_advisor_assignments (student_id, advisor_id, assignment_date, is_active)
SELECT u1.id, u2.id, CURDATE(), TRUE
FROM users u1
CROSS JOIN users u2
WHERE u1.role = 'student' AND u2.role = 'advisor' AND u1.is_active = TRUE AND u2.is_active = TRUE
LIMIT 10;

-- Insert sample fees (for all active students)
INSERT IGNORE INTO student_fees (student_id, academic_year, term, total_amount, paid_amount, balance, payment_status, due_date)
SELECT 
  id,
  '2024-2025',
  'Term 1',
  500000,
  FLOOR(RAND() * 500000),
  500000 - FLOOR(RAND() * 500000),
  CASE 
    WHEN FLOOR(RAND() * 500000) >= 500000 THEN 'paid'
    WHEN FLOOR(RAND() * 500000) > 0 THEN 'partial'
    ELSE 'unpaid'
  END,
  DATE_ADD(CURDATE(), INTERVAL 30 DAY)
FROM users
WHERE role = 'student' AND is_active = TRUE;

-- Insert sample inventory items
INSERT IGNORE INTO inventory_items (name, category, description, unit_price, current_quantity, reorder_level, supplier, sku)
VALUES
  ('Office Paper A4', 'Stationery', 'White A4 printing paper 500 sheets', 5000, 100, 20, 'Office Supplies Ltd', 'PAPER-A4-001'),
  ('Whiteboard Markers', 'Stationery', 'Dry erase markers - black', 500, 250, 50, 'Office Supplies Ltd', 'MARKER-BLK-001'),
  ('Student Desks', 'Furniture', 'Standard classroom desk', 35000, 150, 10, 'School Furniture Co', 'DESK-STD-001'),
  ('Laboratory Equipment', 'Equipment', 'Basic chemistry lab equipment set', 150000, 20, 5, 'Science Supplies Ltd', 'LAB-CHEM-001'),
  ('Sports Equipment', 'Sports', 'Football, basketball, volleyball set', 75000, 30, 5, 'Sports World', 'SPORT-SET-001'),
  ('Computer Keyboards', 'Electronics', 'USB wired keyboard', 15000, 50, 10, 'Tech Supplies', 'KB-USB-001'),
  ('Cleaning Supplies', 'Maintenance', 'Detergent, mops, brooms bundle', 25000, 40, 15, 'Cleaning Co', 'CLEAN-BDL-001');

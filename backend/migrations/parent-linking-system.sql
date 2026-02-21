-- Parent Linking Requests System Tables

-- Parent Linking Requests Table
CREATE TABLE IF NOT EXISTS parent_linking_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id VARCHAR(50) UNIQUE NOT NULL,
  parent_id INT NOT NULL,
  student_id INT,
  child_first_name VARCHAR(100) NOT NULL,
  child_last_name VARCHAR(100) NOT NULL,
  child_gender ENUM('Male', 'Female') NOT NULL,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  relationship VARCHAR(50) DEFAULT 'parent',
  notes TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT,
  approved_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Connections Table (After Approval)
CREATE TABLE IF NOT EXISTS parent_connections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  can_view_marks BOOLEAN DEFAULT TRUE,
  can_view_attendance BOOLEAN DEFAULT TRUE,
  can_view_report_cards BOOLEAN DEFAULT TRUE,
  can_view_discipline BOOLEAN DEFAULT TRUE,
  can_pay_fees BOOLEAN DEFAULT TRUE,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Notifications Table
CREATE TABLE IF NOT EXISTS parent_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category ENUM('system', 'academic', 'discipline', 'attendance', 'payment', 'general') DEFAULT 'general',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Activities Table
CREATE TABLE IF NOT EXISTS parent_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_type (activity_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Messages Table
CREATE TABLE IF NOT EXISTS parent_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  recipient_role VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('sent', 'read', 'replied') DEFAULT 'sent',
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fee Payments Table (for parent payments)
CREATE TABLE IF NOT EXISTS parent_fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id VARCHAR(50) UNIQUE NOT NULL,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('momo', 'bank', 'cash', 'card') NOT NULL,
  phone_number VARCHAR(20),
  transaction_reference VARCHAR(100),
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  payment_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

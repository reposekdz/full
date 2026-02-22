-- Parent Child Links Table
CREATE TABLE IF NOT EXISTS parent_child_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type VARCHAR(50) DEFAULT 'parent',
  linked_by INT,
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unlinked_at TIMESTAMP NULL,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  permissions VARCHAR(255) DEFAULT 'full',
  UNIQUE KEY unique_link (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent Credentials Table
CREATE TABLE IF NOT EXISTS parent_credentials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  temp_password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fee Payments Table
CREATE TABLE IF NOT EXISTS fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_id INT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  phone VARCHAR(20),
  reference_number VARCHAR(100),
  payment_type VARCHAR(50),
  term VARCHAR(50),
  notes TEXT,
  receipt_number VARCHAR(100) UNIQUE,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_receipt (receipt_number),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent Messages Table
CREATE TABLE IF NOT EXISTS parent_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  sender_id INT,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'normal',
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_read (read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SMS Logs Table
CREATE TABLE IF NOT EXISTS sms_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  error_message TEXT,
  metadata JSON,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent Student Links (Advanced)
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  student_code VARCHAR(50),
  relationship_type VARCHAR(50) DEFAULT 'guardian',
  is_primary_contact TINYINT(1) DEFAULT 0,
  can_view_grades TINYINT(1) DEFAULT 1,
  can_view_attendance TINYINT(1) DEFAULT 1,
  can_view_conduct TINYINT(1) DEFAULT 1,
  can_view_fees TINYINT(1) DEFAULT 1,
  can_receive_sms TINYINT(1) DEFAULT 1,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  linked_by VARCHAR(100),
  linked_by_role VARCHAR(50),
  auto_linked TINYINT(1) DEFAULT 0,
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent Contact History
CREATE TABLE IF NOT EXISTS parent_contact_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  contact_type VARCHAR(50),
  subject VARCHAR(255),
  message TEXT,
  category VARCHAR(50),
  initiated_by INT,
  initiated_by_name VARCHAR(100),
  initiated_by_role VARCHAR(50),
  delivery_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_type (contact_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent Notifications Queue
CREATE TABLE IF NOT EXISTS parent_notifications_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_id VARCHAR(100) UNIQUE,
  parent_id INT NOT NULL,
  student_id INT,
  notification_type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  send_via VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  delivery_status VARCHAR(50) DEFAULT 'queued',
  error_message TEXT,
  retry_count INT DEFAULT 0,
  INDEX idx_parent (parent_id),
  INDEX idx_status (delivery_status),
  INDEX idx_scheduled (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parents Info (Extended Profile)
CREATE TABLE IF NOT EXISTS parents_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  national_id VARCHAR(50),
  occupation VARCHAR(100),
  address TEXT,
  province VARCHAR(50),
  district VARCHAR(50),
  sector VARCHAR(50),
  cell VARCHAR(50),
  village VARCHAR(50),
  whatsapp_number VARCHAR(20),
  preferred_contact_method VARCHAR(20) DEFAULT 'sms',
  preferred_language VARCHAR(10) DEFAULT 'en',
  children_in_school INT DEFAULT 1,
  is_verified TINYINT(1) DEFAULT 0,
  last_contact_date TIMESTAMP NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_national_id (national_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent Linking Requests
CREATE TABLE IF NOT EXISTS parent_linking_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_phone VARCHAR(20) NOT NULL,
  parent_name VARCHAR(100),
  student_name VARCHAR(100) NOT NULL,
  student_gender VARCHAR(10),
  trade_code VARCHAR(10),
  level_number INT,
  relationship_type VARCHAR(50) DEFAULT 'guardian',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (parent_phone),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Success message
SELECT 'Database migration completed successfully!' as message;

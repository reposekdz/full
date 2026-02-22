-- Parent Child Links Table (if not exists)
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
);

-- Parent Credentials Table
CREATE TABLE IF NOT EXISTS parent_credentials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  temp_password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  INDEX idx_parent (parent_id)
);

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
);

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
);

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
);

-- Update parents table to include login credentials
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'parent',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL;

-- Ensure global_student_sheets has necessary columns
ALTER TABLE global_student_sheets
ADD COLUMN IF NOT EXISTS total_fees DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_fees DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_code ON global_student_sheets(student_code);
CREATE INDEX IF NOT EXISTS idx_trade_level ON global_student_sheets(trade_code, level_number);
CREATE INDEX IF NOT EXISTS idx_conduct ON global_student_sheets(conduct_score);
CREATE INDEX IF NOT EXISTS idx_attendance ON global_student_sheets(attendance_percentage);

-- Insert sample data for testing (optional)
INSERT IGNORE INTO parents (parent_id, first_name, last_name, phone, email, password, role, status) 
VALUES (1, 'Test', 'Parent', '0788123456', 'parent@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'parent', 'active');

-- Success message
SELECT 'Database migration completed successfully!' as message;

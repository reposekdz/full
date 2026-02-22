-- Ultra-Advanced Payment Management System Tables

-- Payment Columns Table
CREATE TABLE IF NOT EXISTS payment_columns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  term VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  due_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Student Fees Table
CREATE TABLE IF NOT EXISTS student_fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  total_fees DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) AS (total_fees - paid_amount) STORED,
  payment_method VARCHAR(50),
  last_payment_date DATE,
  due_date DATE,
  term VARCHAR(50) DEFAULT 'Term 1',
  academic_year VARCHAR(20) DEFAULT '2024',
  status ENUM('paid', 'partial', 'overdue', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_term (student_id, term, academic_year),
  KEY idx_student_id (student_id)
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'mobile_money', 'bank_transfer', 'card', 'other') NOT NULL,
  reference VARCHAR(255),
  term VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20) DEFAULT '2024',
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  recorded_by INT,
  notes TEXT,
  status ENUM('completed', 'pending', 'failed', 'refunded') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_date (student_id, transaction_date),
  INDEX idx_payment_method (payment_method),
  INDEX idx_status (status)
);

-- Payment Reminders Log Table
CREATE TABLE IF NOT EXISTS payment_reminders_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_by INT,
  reminder_type ENUM('manual', 'auto', 'bulk') DEFAULT 'manual',
  status ENUM('sent', 'failed', 'pending') DEFAULT 'sent',
  INDEX idx_student_sent (student_id, sent_at)
);

-- SMS Queue Table
CREATE TABLE IF NOT EXISTS sms_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50),
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status_priority (status, priority),
  INDEX idx_scheduled (scheduled_at)
);

-- Add foreign keys using ALTER TABLE
ALTER TABLE payment_columns 
  ADD CONSTRAINT fk_payment_columns_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE student_fees 
  ADD CONSTRAINT fk_student_fees_student 
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE;

ALTER TABLE payment_transactions 
  ADD CONSTRAINT fk_payment_transactions_student 
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_payment_transactions_recorded_by 
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE payment_reminders_log 
  ADD CONSTRAINT fk_payment_reminders_student 
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_payment_reminders_sent_by 
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL;

-- Insert default payment columns
INSERT IGNORE INTO payment_columns (name, amount, term, academic_year, due_date, is_active) VALUES
('Tuition Fee - Term 1', 150000, 'Term 1', '2024', '2024-03-31', TRUE),
('Tuition Fee - Term 2', 150000, 'Term 2', '2024', '2024-07-31', TRUE),
('Tuition Fee - Term 3', 150000, 'Term 3', '2024', '2024-11-30', TRUE),
('Lab Fee', 25000, 'Term 1', '2024', '2024-03-31', TRUE),
('Library Fee', 10000, 'Term 1', '2024', '2024-03-31', TRUE),
('Sports Fee', 15000, 'Term 1', '2024', '2024-03-31', TRUE),
('Exam Fee', 20000, 'Term 1', '2024', '2024-03-31', TRUE);

-- Initialize student fees for existing students
INSERT IGNORE INTO student_fees (student_id, total_fees, due_date, term, academic_year)
SELECT 
  student_id,
  450000 as total_fees,
  '2024-03-31' as due_date,
  'Term 1' as term,
  '2024' as academic_year
FROM global_student_sheets
WHERE status = 'active';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON student_fees(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON sms_queue(status, priority);

COMMIT;

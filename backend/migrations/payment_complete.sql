-- Complete Payment System with Foreign Keys

-- 1. Payment Columns
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
  KEY idx_created_by (created_by)
);

-- 2. Student Fees
CREATE TABLE IF NOT EXISTS student_fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  total_fees DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(50),
  last_payment_date DATE,
  due_date DATE,
  term VARCHAR(50) DEFAULT 'Term 1',
  academic_year VARCHAR(20) DEFAULT '2024',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_term (student_id, term, academic_year),
  KEY idx_student_id (student_id),
  KEY idx_status (status)
);

-- 3. Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  reference VARCHAR(255),
  term VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20) DEFAULT '2024',
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  recorded_by INT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_student_id (student_id),
  KEY idx_recorded_by (recorded_by),
  KEY idx_transaction_date (transaction_date)
);

-- 4. Payment Reminders Log
CREATE TABLE IF NOT EXISTS payment_reminders_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_by INT,
  reminder_type VARCHAR(20) DEFAULT 'manual',
  status VARCHAR(20) DEFAULT 'sent',
  KEY idx_student_id (student_id),
  KEY idx_sent_by (sent_by)
);

-- 5. Payment Installments
CREATE TABLE IF NOT EXISTS payment_installments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  installment_number INT NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_student_id (student_id),
  KEY idx_due_date (due_date)
);

-- 6. Fee Waivers
CREATE TABLE IF NOT EXISTS fee_waivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  waived_by INT,
  waived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_student_id (student_id),
  KEY idx_waived_by (waived_by)
);

-- 7. Payment Analytics Cache
CREATE TABLE IF NOT EXISTS payment_analytics_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  metric_name VARCHAR(100) NOT NULL,
  metric_value JSON,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_metric (metric_name)
);

-- 8. Payment Receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_path VARCHAR(255),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_transaction_id (transaction_id)
);

-- Insert default payment columns
INSERT IGNORE INTO payment_columns (name, amount, term, academic_year, due_date, is_active) VALUES
('Tuition Fee - Term 1', 150000, 'Term 1', '2024', '2024-03-31', TRUE),
('Tuition Fee - Term 2', 150000, 'Term 2', '2024', '2024-07-31', TRUE),
('Tuition Fee - Term 3', 150000, 'Term 3', '2024', '2024-11-30', TRUE),
('Lab Fee', 25000, 'Term 1', '2024', '2024-03-31', TRUE),
('Library Fee', 10000, 'Term 1', '2024', '2024-03-31', TRUE),
('Sports Fee', 15000, 'Term 1', '2024', '2024-03-31', TRUE),
('Exam Fee', 20000, 'Term 1', '2024', '2024-03-31', TRUE);

-- Initialize fees for ALL real students from global_student_sheets
INSERT IGNORE INTO student_fees (student_id, total_fees, balance, due_date, term, academic_year, status)
SELECT 
  student_id,
  450000 as total_fees,
  450000 as balance,
  '2024-03-31' as due_date,
  'Term 1' as term,
  '2024' as academic_year,
  'pending' as status
FROM global_student_sheets
WHERE status = 'active';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON student_fees(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(transaction_date);

COMMIT;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS payment_receipts;
DROP TABLE IF EXISTS payment_analytics_cache;
DROP TABLE IF EXISTS fee_waivers;
DROP TABLE IF EXISTS payment_installments;
DROP TABLE IF EXISTS payment_reminders_log;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS student_fees;
DROP TABLE IF EXISTS payment_columns;

-- Payment Columns Table
CREATE TABLE payment_columns (
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
CREATE TABLE student_fees (
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
  status ENUM('paid', 'partial', 'overdue', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_term (student_id, term, academic_year),
  KEY idx_student_id (student_id),
  KEY idx_status (status)
);

-- Payment Transactions Table
CREATE TABLE payment_transactions (
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
  KEY idx_student_date (student_id, transaction_date),
  KEY idx_payment_method (payment_method),
  KEY idx_status (status)
);

-- Payment Reminders Log
CREATE TABLE payment_reminders_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_by INT,
  reminder_type ENUM('manual', 'auto', 'bulk') DEFAULT 'manual',
  status ENUM('sent', 'failed', 'pending') DEFAULT 'sent',
  KEY idx_student_sent (student_id, sent_at)
);

-- Payment Installments
CREATE TABLE payment_installments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  installment_number INT NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_student_due (student_id, due_date)
);

-- Fee Waivers
CREATE TABLE fee_waivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  waived_by INT,
  waived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Analytics Cache
CREATE TABLE payment_analytics_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  metric_name VARCHAR(100) NOT NULL,
  metric_value JSON,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_metric (metric_name)
);

-- Payment Receipts
CREATE TABLE payment_receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_path VARCHAR(255),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_transaction (transaction_id)
);

-- Insert default payment columns
INSERT INTO payment_columns (name, amount, term, academic_year, due_date, is_active) VALUES
('Tuition Fee - Term 1', 150000, 'Term 1', '2024', '2024-03-31', TRUE),
('Tuition Fee - Term 2', 150000, 'Term 2', '2024', '2024-07-31', TRUE),
('Tuition Fee - Term 3', 150000, 'Term 3', '2024', '2024-11-30', TRUE),
('Lab Fee', 25000, 'Term 1', '2024', '2024-03-31', TRUE),
('Library Fee', 10000, 'Term 1', '2024', '2024-03-31', TRUE),
('Sports Fee', 15000, 'Term 1', '2024', '2024-03-31', TRUE),
('Exam Fee', 20000, 'Term 1', '2024', '2024-03-31', TRUE);

-- Initialize fees for ALL real students from global_student_sheets
INSERT INTO student_fees (student_id, total_fees, balance, due_date, term, academic_year, status)
SELECT 
  student_id,
  450000 as total_fees,
  450000 as balance,
  '2024-03-31' as due_date,
  'Term 1' as term,
  '2024' as academic_year,
  'pending' as status
FROM global_student_sheets
WHERE status = 'active'
ON DUPLICATE KEY UPDATE student_id = student_id;

COMMIT;

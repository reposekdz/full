-- Payment system tables for real students

CREATE TABLE IF NOT EXISTS payment_columns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  term VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  due_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  UNIQUE KEY unique_student_term (student_id, term, academic_year)
);

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
  status VARCHAR(20) DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS payment_reminders_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_by INT,
  reminder_type VARCHAR(20) DEFAULT 'manual',
  status VARCHAR(20) DEFAULT 'sent'
);

-- Insert default columns
INSERT IGNORE INTO payment_columns (name, amount, term, academic_year, due_date) VALUES
('Tuition Fee - Term 1', 150000, 'Term 1', '2024', '2024-03-31'),
('Lab Fee', 25000, 'Term 1', '2024', '2024-03-31'),
('Library Fee', 10000, 'Term 1', '2024', '2024-03-31');

-- Initialize fees for real students
INSERT IGNORE INTO student_fees (student_id, total_fees, balance, due_date, term, status)
SELECT 
  student_id,
  450000,
  450000,
  '2024-03-31',
  'Term 1',
  'pending'
FROM global_student_sheets
WHERE status = 'active';

COMMIT;

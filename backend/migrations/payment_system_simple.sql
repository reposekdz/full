-- ========================================
-- PAYMENT MANAGEMENT SYSTEM - SIMPLIFIED MIGRATION
-- ========================================

-- Payment Columns Table
CREATE TABLE IF NOT EXISTS payment_columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  term VARCHAR(50) DEFAULT 'Term 1',
  academic_year VARCHAR(10) DEFAULT '2024',
  due_date DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_term (term, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Payments Table
CREATE TABLE IF NOT EXISTS student_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  column_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'cash',
  reference_number VARCHAR(100),
  payment_date DATE,
  recorded_by INT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE KEY unique_payment (student_id, column_id),
  INDEX idx_student (student_id),
  INDEX idx_column (column_id),
  INDEX idx_date (payment_date),
  FOREIGN KEY (column_id) REFERENCES payment_columns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  column_id INT,
  amount DECIMAL(12,2) NOT NULL,
  action VARCHAR(50) NOT NULL,
  performed_by INT,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_value DECIMAL(12,2),
  new_value DECIMAL(12,2),
  notes TEXT,
  INDEX idx_student (student_id),
  INDEX idx_date (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default payment columns
INSERT INTO payment_columns (name, amount, term, academic_year, due_date, display_order) VALUES
('Term 1 Tuition', 150000.00, 'Term 1', '2024', '2024-03-31', 1),
('Term 1 Exam Fees', 25000.00, 'Term 1', '2024', '2024-03-31', 2),
('Term 2 Tuition', 150000.00, 'Term 2', '2024', '2024-07-31', 3),
('Term 2 Exam Fees', 25000.00, 'Term 2', '2024', '2024-07-31', 4),
('Term 3 Tuition', 150000.00, 'Term 3', '2024', '2024-11-30', 5),
('Term 3 Exam Fees', 25000.00, 'Term 3', '2024', '2024-11-30', 6),
('Uniform', 35000.00, 'Annual', '2024', '2024-02-28', 7),
('Transport', 50000.00, 'Annual', '2024', '2024-02-28', 8)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Update global_student_sheets to include payment fields
ALTER TABLE global_student_sheets 
ADD COLUMN IF NOT EXISTS total_fees DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_status ENUM('paid', 'partial', 'unpaid', 'overdue') DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS last_payment_date DATE;

-- Set default total fees for all students
UPDATE global_student_sheets 
SET total_fees = (SELECT SUM(amount) FROM payment_columns WHERE is_active = 1)
WHERE total_fees = 0 OR total_fees IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_status ON global_student_sheets(payment_status);
CREATE INDEX IF NOT EXISTS idx_balance ON global_student_sheets((total_fees - paid_amount));

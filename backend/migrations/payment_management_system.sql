-- ========================================
-- PAYMENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Excel-like dynamic payment tracking
-- ========================================

-- Payment Columns Table (Dynamic columns like Excel)
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

-- Student Payments Table (Cell values)
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

-- Payment History Table (Audit trail)
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
INSERT INTO payment_columns (name, amount, term, academic_year, due_date) VALUES
('Term 1 Tuition', 150000.00, 'Term 1', '2024', '2024-03-31'),
('Term 1 Exam Fees', 25000.00, 'Term 1', '2024', '2024-03-31'),
('Term 2 Tuition', 150000.00, 'Term 2', '2024', '2024-07-31'),
('Term 2 Exam Fees', 25000.00, 'Term 2', '2024', '2024-07-31'),
('Term 3 Tuition', 150000.00, 'Term 3', '2024', '2024-11-30'),
('Term 3 Exam Fees', 25000.00, 'Term 3', '2024', '2024-11-30'),
('Uniform', 35000.00, 'Annual', '2024', '2024-02-28'),
('Transport', 50000.00, 'Annual', '2024', '2024-02-28')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Update global_student_sheets to include payment fields if not exists
ALTER TABLE global_student_sheets 
ADD COLUMN IF NOT EXISTS total_fees DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS balance DECIMAL(12,2) GENERATED ALWAYS AS (total_fees - paid_amount) STORED,
ADD COLUMN IF NOT EXISTS payment_status ENUM('paid', 'partial', 'unpaid', 'overdue') DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS last_payment_date DATE,
ADD INDEX IF NOT EXISTS idx_payment_status (payment_status);

-- Set default total fees for all students (sum of all columns)
UPDATE global_student_sheets 
SET total_fees = (SELECT SUM(amount) FROM payment_columns WHERE is_active = 1)
WHERE total_fees = 0;

-- Create view for payment summary
CREATE OR REPLACE VIEW v_payment_summary AS
SELECT 
  gss.student_id,
  gss.student_code,
  gss.first_name,
  gss.last_name,
  gss.trade_code,
  gss.level_number,
  gss.total_fees,
  gss.paid_amount,
  gss.balance,
  gss.payment_status,
  gss.last_payment_date,
  COUNT(sp.id) as payment_count,
  GROUP_CONCAT(CONCAT(pc.name, ':', sp.amount) SEPARATOR '|') as payment_details
FROM global_student_sheets gss
LEFT JOIN student_payments sp ON gss.student_id = sp.student_id
LEFT JOIN payment_columns pc ON sp.column_id = pc.id
WHERE gss.status = 'active'
GROUP BY gss.student_id;

-- Stored procedure to recalculate student payment totals
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS recalculate_student_payments(IN p_student_id INT)
BEGIN
  DECLARE v_total_paid DECIMAL(12,2);
  DECLARE v_total_fees DECIMAL(12,2);
  
  -- Calculate total paid
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM student_payments
  WHERE student_id = p_student_id;
  
  -- Get total fees
  SELECT total_fees INTO v_total_fees
  FROM global_student_sheets
  WHERE student_id = p_student_id;
  
  -- Update student record
  UPDATE global_student_sheets
  SET 
    paid_amount = v_total_paid,
    payment_status = CASE 
      WHEN v_total_paid >= v_total_fees THEN 'paid'
      WHEN v_total_paid > 0 THEN 'partial'
      ELSE 'unpaid'
    END,
    last_payment_date = (
      SELECT MAX(payment_date) 
      FROM student_payments 
      WHERE student_id = p_student_id
    )
  WHERE student_id = p_student_id;
END //
DELIMITER ;

-- Trigger to update payment history
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_payment_update
AFTER UPDATE ON student_payments
FOR EACH ROW
BEGIN
  INSERT INTO payment_history (
    student_id, column_id, amount, action, 
    old_value, new_value, performed_at
  ) VALUES (
    NEW.student_id, NEW.column_id, NEW.amount, 'UPDATE',
    OLD.amount, NEW.amount, NOW()
  );
  
  CALL recalculate_student_payments(NEW.student_id);
END //
DELIMITER ;

-- Trigger for new payments
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_payment_insert
AFTER INSERT ON student_payments
FOR EACH ROW
BEGIN
  INSERT INTO payment_history (
    student_id, column_id, amount, action, 
    new_value, performed_at
  ) VALUES (
    NEW.student_id, NEW.column_id, NEW.amount, 'INSERT',
    NEW.amount, NOW()
  );
  
  CALL recalculate_student_payments(NEW.student_id);
END //
DELIMITER ;

-- Sample data for testing (optional)
-- Uncomment to insert sample payments
/*
INSERT INTO student_payments (student_id, column_id, amount, payment_method, payment_date) VALUES
(600, 1, 150000.00, 'cash', '2024-01-15'),
(600, 2, 25000.00, 'mobile_money', '2024-01-20'),
(601, 1, 100000.00, 'bank_transfer', '2024-01-18');
*/

-- Verify setup
SELECT 'Payment columns created:' as status, COUNT(*) as count FROM payment_columns;
SELECT 'Students with payment data:' as status, COUNT(*) as count FROM global_student_sheets WHERE total_fees > 0;

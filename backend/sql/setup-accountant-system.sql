-- Accountant System Database Setup

-- Fee Types Table
CREATE TABLE IF NOT EXISTS fee_types (
  fee_type_id INT PRIMARY KEY AUTO_INCREMENT,
  fee_type_name VARCHAR(100) NOT NULL,
  description TEXT,
  default_amount DECIMAL(10,2),
  is_mandatory BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  payment_method_id INT PRIMARY KEY AUTO_INCREMENT,
  method_name VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fees Table
CREATE TABLE IF NOT EXISTS fees (
  fee_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  fee_type_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  term VARCHAR(20),
  academic_year INT,
  description TEXT,
  status ENUM('pending', 'partial', 'paid', 'waived') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (fee_type_id) REFERENCES fee_types(fee_type_id),
  INDEX idx_student_fees (student_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method_id INT,
  reference_number VARCHAR(100),
  payment_date DATE NOT NULL,
  notes TEXT,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id),
  FOREIGN KEY (recorded_by) REFERENCES users(user_id),
  INDEX idx_student_payments (student_id),
  INDEX idx_payment_date (payment_date)
);

-- Insert default fee types
INSERT INTO fee_types (fee_type_name, description, default_amount, is_mandatory) VALUES
('Tuition Fee', 'Regular tuition fee per term', 150000.00, 1),
('Registration Fee', 'One-time registration fee', 50000.00, 1),
('Exam Fee', 'Examination fee per term', 30000.00, 1),
('Library Fee', 'Library access and materials', 10000.00, 0),
('Sports Fee', 'Sports and recreation activities', 15000.00, 0),
('Lab Fee', 'Laboratory materials and equipment', 25000.00, 0),
('Hostel Fee', 'Accommodation fee per term', 100000.00, 0),
('Transport Fee', 'School transport service', 40000.00, 0),
('Uniform Fee', 'School uniform', 35000.00, 0),
('Medical Fee', 'Medical insurance and services', 20000.00, 0)
ON DUPLICATE KEY UPDATE fee_type_name = fee_type_name;

-- Insert default payment methods
INSERT INTO payment_methods (method_name, description, is_active) VALUES
('Cash', 'Cash payment at school office', 1),
('Bank Transfer', 'Direct bank transfer', 1),
('Mobile Money', 'MTN Mobile Money or Airtel Money', 1),
('Cheque', 'Bank cheque', 1),
('Credit Card', 'Credit/Debit card payment', 1),
('Online Payment', 'Online payment gateway', 1)
ON DUPLICATE KEY UPDATE method_name = method_name;

-- Create view for student financial summary
CREATE OR REPLACE VIEW student_financial_summary AS
SELECT 
  s.student_id,
  s.admission_number,
  s.first_name,
  s.last_name,
  t.trade_name,
  l.level_name,
  COALESCE(SUM(f.amount), 0) as total_fees,
  COALESCE(SUM(p.amount), 0) as total_paid,
  COALESCE(SUM(f.amount), 0) - COALESCE(SUM(p.amount), 0) as balance,
  CASE 
    WHEN COALESCE(SUM(f.amount), 0) - COALESCE(SUM(p.amount), 0) <= 0 THEN 'Paid'
    WHEN COALESCE(SUM(p.amount), 0) > 0 THEN 'Partial'
    ELSE 'Unpaid'
  END as payment_status
FROM students s
LEFT JOIN trades t ON s.trade_id = t.trade_id
LEFT JOIN levels l ON s.level_id = l.level_id
LEFT JOIN fees f ON s.student_id = f.student_id
LEFT JOIN payments p ON s.student_id = p.student_id
GROUP BY s.student_id;

SELECT 'Accountant database setup completed successfully!' as message;

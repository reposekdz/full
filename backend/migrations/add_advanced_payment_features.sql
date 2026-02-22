-- Advanced Payment System Tables

-- Payment Installments
CREATE TABLE IF NOT EXISTS payment_installments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  installment_number INT NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
  INDEX idx_student_due (student_id, due_date)
);

-- Fee Waivers
CREATE TABLE IF NOT EXISTS fee_waivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  waived_by INT,
  waived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
  FOREIGN KEY (waived_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Payment Analytics Cache
CREATE TABLE IF NOT EXISTS payment_analytics_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  metric_name VARCHAR(100) NOT NULL,
  metric_value JSON,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_metric (metric_name)
);

-- Payment Receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_path VARCHAR(255),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE
);

COMMIT;

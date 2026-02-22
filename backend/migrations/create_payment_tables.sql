-- Ultra-Advanced Payment Management System Tables

-- Payment Columns Table (for accountant/teacher to add fee types)
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Student Fees Table (tracks total fees and payments per student)
CREATE TABLE IF NOT EXISTS student_fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  total_fees DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) GENERATED ALWAYS AS (total_fees - paid_amount) STORED,
  payment_method VARCHAR(50),
  last_payment_date DATE,
  due_date DATE,
  term VARCHAR(50) DEFAULT 'Term 1',
  academic_year VARCHAR(20) DEFAULT '2024',
  status ENUM('paid', 'partial', 'overdue', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_term (student_id, term, academic_year),
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE
);

-- Payment Transactions Table (detailed payment history)
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
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_date (student_id, transaction_date),
  INDEX idx_payment_method (payment_method),
  INDEX idx_status (status)
);

-- Payment Reminders Log Table (track SMS reminders sent)
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

-- SMS Queue Table (for queuing SMS messages)
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

-- Insert default payment columns
INSERT INTO payment_columns (name, amount, term, academic_year, due_date, is_active) VALUES
('Tuition Fee - Term 1', 150000, 'Term 1', '2024', '2024-03-31', TRUE),
('Tuition Fee - Term 2', 150000, 'Term 2', '2024', '2024-07-31', TRUE),
('Tuition Fee - Term 3', 150000, 'Term 3', '2024', '2024-11-30', TRUE),
('Lab Fee', 25000, 'Term 1', '2024', '2024-03-31', TRUE),
('Library Fee', 10000, 'Term 1', '2024', '2024-03-31', TRUE),
('Sports Fee', 15000, 'Term 1', '2024', '2024-03-31', TRUE),
('Exam Fee', 20000, 'Term 1', '2024', '2024-03-31', TRUE);

-- Initialize student fees for existing students
INSERT INTO student_fees (student_id, total_fees, paid_amount, due_date, term, academic_year)
SELECT 
  student_id,
  450000 as total_fees,
  0 as paid_amount,
  '2024-03-31' as due_date,
  'Term 1' as term,
  '2024' as academic_year
FROM global_student_sheets
WHERE status = 'active'
ON DUPLICATE KEY UPDATE total_fees = total_fees;

-- Create view for payment dashboard
CREATE OR REPLACE VIEW payment_dashboard_view AS
SELECT 
  s.student_id,
  s.first_name,
  s.last_name,
  s.student_code,
  s.trade_code,
  s.level_number,
  COALESCE(f.total_fees, 0) as total_fees,
  COALESCE(f.paid_amount, 0) as paid_amount,
  COALESCE(f.balance, 0) as balance,
  f.payment_method,
  f.last_payment_date,
  f.due_date,
  f.term,
  f.academic_year,
  COALESCE(f.status, 'pending') as status,
  p.phone as parent_phone,
  p.email as parent_email,
  COUNT(pt.id) as payment_count,
  MAX(pt.transaction_date) as last_transaction_date
FROM global_student_sheets s
LEFT JOIN student_fees f ON s.student_id = f.student_id
LEFT JOIN parent_child_links pcl ON s.student_id = pcl.student_id
LEFT JOIN users p ON pcl.parent_id = p.id
LEFT JOIN payment_transactions pt ON s.student_id = pt.student_id
WHERE s.status = 'active'
GROUP BY s.student_id, s.first_name, s.last_name, s.student_code, s.trade_code, s.level_number, f.total_fees, f.paid_amount, f.balance, f.payment_method, f.last_payment_date, f.due_date, f.term, f.academic_year, f.status, p.phone, p.email;

-- Create stored procedure for automatic payment reminders
DELIMITER //

CREATE PROCEDURE send_auto_payment_reminders()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_student_id INT;
  DECLARE v_first_name VARCHAR(255);
  DECLARE v_last_name VARCHAR(255);
  DECLARE v_balance DECIMAL(10, 2);
  DECLARE v_phone VARCHAR(20);
  DECLARE v_message TEXT;
  
  DECLARE cur CURSOR FOR
    SELECT 
      s.student_id,
      s.first_name,
      s.last_name,
      f.balance,
      p.phone
    FROM global_student_sheets s
    JOIN student_fees f ON s.student_id = f.student_id
    LEFT JOIN parent_child_links pcl ON s.student_id = pcl.student_id
    LEFT JOIN users p ON pcl.parent_id = p.id
    WHERE f.due_date < CURDATE()
      AND f.balance > 0
      AND p.phone IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM payment_reminders_log prl
        WHERE prl.student_id = s.student_id
          AND prl.sent_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      );
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN cur;
  
  read_loop: LOOP
    FETCH cur INTO v_student_id, v_first_name, v_last_name, v_balance, v_phone;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    SET v_message = CONCAT(
      'Mwiriwe! Ikwibutso: Umwana wanyu ',
      v_first_name, ' ', v_last_name,
      ' afite ideni ry\'ishuri: ',
      FORMAT(v_balance, 0), ' RWF. ',
      'Murakoze - Garden TVET'
    );
    
    INSERT INTO sms_queue (phone_number, message, message_type, priority)
    VALUES (v_phone, v_message, 'auto_payment_reminder', 'normal');
    
    INSERT INTO payment_reminders_log (student_id, parent_phone, message, reminder_type)
    VALUES (v_student_id, v_phone, v_message, 'auto');
  END LOOP;
  
  CLOSE cur;
END //

DELIMITER ;

-- Create event to run automatic reminders daily at 9 AM
CREATE EVENT IF NOT EXISTS daily_payment_reminders
ON SCHEDULE EVERY 1 DAY
STARTS CONCAT(CURDATE() + INTERVAL 1 DAY, ' 09:00:00')
DO CALL send_auto_payment_reminders();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON payment_columns TO 'school_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON student_fees TO 'school_user'@'localhost';
GRANT SELECT, INSERT ON payment_transactions TO 'school_user'@'localhost';
GRANT SELECT, INSERT ON payment_reminders_log TO 'school_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON sms_queue TO 'school_user'@'localhost';

-- Create indexes for performance
CREATE INDEX idx_student_fees_status ON student_fees(status);
CREATE INDEX idx_student_fees_due_date ON student_fees(due_date);
CREATE INDEX idx_payment_transactions_date ON payment_transactions(transaction_date);
CREATE INDEX idx_sms_queue_status ON sms_queue(status, priority);

COMMIT;

-- ========================================
-- ADVANCED PAYMENT SYSTEM
-- Real payment gateway integration ready
-- ========================================

-- Main Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Transaction details
  reference_number VARCHAR(200) UNIQUE NOT NULL,
  gateway_reference VARCHAR(200), -- Reference from payment provider
  transaction_id VARCHAR(200), -- Gateway transaction ID
  
  -- Parties
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  
  -- Amount details
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RWF',
  
  -- Payment type
  payment_type ENUM('tuition', 'exam_fees', 'uniform', 'transport', 'hostel', 'meal_plan', 'library', 'lab_fees', 'sports', 'other') NOT NULL,
  academic_year VARCHAR(20),
  term INT, -- 1, 2, or 3
  
  -- Payment method
  payment_method ENUM('mobile_money_mtn', 'mobile_money_airtel', 'bank_transfer', 'card', 'cash', 'other') NOT NULL,
  mobile_number VARCHAR(20), -- For mobile money
  account_number VARCHAR(100), -- For bank transfer
  
  -- Status tracking
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
  
  -- Gateway integration
  payment_url TEXT, -- URL to redirect user for payment
  ussd_code VARCHAR(50), -- USSD code for mobile money
  gateway_response JSON, -- Full response from gateway
  
  -- Receipt and documentation
  receipt_number VARCHAR(100) UNIQUE,
  receipt_path VARCHAR(500),
  invoice_path VARCHAR(500),
  
  -- Metadata
  description TEXT,
  notes TEXT,
  metadata JSON, -- Additional info: fee_category, discount_applied, etc.
  
  -- Important timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  initiated_at TIMESTAMP NULL,
  processing_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  failed_at TIMESTAMP NULL,
  
  -- Error handling
  error_code VARCHAR(50),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE RESTRICT,
  
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_reference (reference_number),
  INDEX idx_created (created_at),
  INDEX idx_gateway_ref (gateway_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Callbacks/Webhooks Log
CREATE TABLE IF NOT EXISTS payment_callbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  
  callback_type ENUM('status_update', 'confirmation', 'cancellation', 'refund') NOT NULL,
  gateway_name VARCHAR(50), -- mtn, airtel, stripe, etc.
  
  -- Raw callback data
  request_headers JSON,
  request_body JSON,
  response_status INT,
  
  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP NULL,
  processing_error TEXT,
  
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  INDEX idx_payment (payment_id),
  INDEX idx_processed (processed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fee Structure (what students need to pay)
CREATE TABLE IF NOT EXISTS student_fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  academic_year VARCHAR(20) NOT NULL,
  term INT NOT NULL,
  
  -- Fee breakdown
  tuition_amount DECIMAL(12,2) DEFAULT 0.00,
  exam_fees DECIMAL(12,2) DEFAULT 0.00,
  uniform_fees DECIMAL(12,2) DEFAULT 0.00,
  transport_fees DECIMAL(12,2) DEFAULT 0.00,
  hostel_fees DECIMAL(12,2) DEFAULT 0.00,
  meal_plan_fees DECIMAL(12,2) DEFAULT 0.00,
  library_fees DECIMAL(12,2) DEFAULT 0.00,
  lab_fees DECIMAL(12,2) DEFAULT 0.00,
  sports_fees DECIMAL(12,2) DEFAULT 0.00,
  other_fees DECIMAL(12,2) DEFAULT 0.00,
  
  -- Calculated totals
  total_amount DECIMAL(12,2) GENERATED ALWAYS AS (
    tuition_amount + exam_fees + uniform_fees + transport_fees + 
    hostel_fees + meal_plan_fees + library_fees + lab_fees + 
    sports_fees + other_fees
  ) STORED,
  
  paid_amount DECIMAL(12,2) DEFAULT 0.00,
  balance DECIMAL(12,2) GENERATED ALWAYS AS (
    tuition_amount + exam_fees + uniform_fees + transport_fees + 
    hostel_fees + meal_plan_fees + library_fees + lab_fees + 
    sports_fees + other_fees - paid_amount
  ) STORED,
  
  -- Status
  payment_status ENUM('not_started', 'partial', 'paid', 'overpaid') DEFAULT 'not_started',
  due_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_term (student_id, academic_year, term),
  INDEX idx_student (student_id),
  INDEX idx_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Reconciliation (match payments to fees)
CREATE TABLE IF NOT EXISTS payment_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  student_fee_id INT NOT NULL,
  
  amount DECIMAL(12,2) NOT NULL,
  fee_type VARCHAR(50) NOT NULL, -- Which specific fee this payment covers
  
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  allocated_by INT,
  
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE,
  FOREIGN KEY (allocated_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_payment (payment_id),
  INDEX idx_fee (student_fee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Gateway Configuration
CREATE TABLE IF NOT EXISTS payment_gateways (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gateway_name VARCHAR(50) UNIQUE NOT NULL,
  gateway_type ENUM('mobile_money', 'card', 'bank_transfer') NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- API configuration (encrypted in production)
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  merchant_id VARCHAR(200),
  webhook_secret VARCHAR(500),
  
  -- Endpoints
  api_base_url VARCHAR(500),
  payment_initiation_endpoint VARCHAR(500),
  payment_status_endpoint VARCHAR(500),
  refund_endpoint VARCHAR(500),
  
  -- Settings
  min_amount DECIMAL(12,2) DEFAULT 100.00,
  max_amount DECIMAL(12,2) DEFAULT 10000000.00,
  supported_currencies JSON, -- ["RWF", "USD"]
  
  configuration JSON, -- Additional gateway-specific settings
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default gateway configurations (mock for now)
INSERT INTO payment_gateways (gateway_name, gateway_type, is_active, is_default, api_base_url, supported_currencies) VALUES
('mtn_mobile_money', 'mobile_money', TRUE, TRUE, 'https://api.mtn.com/v1', '["RWF"]'),
('airtel_money', 'mobile_money', TRUE, FALSE, 'https://api.airtel.com/v1', '["RWF"]'),
('stripe', 'card', FALSE, FALSE, 'https://api.stripe.com/v1', '["RWF", "USD"]')
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Trigger to update student_fees.paid_amount when payment is completed
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_student_fees_on_payment
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE student_fees
    SET paid_amount = paid_amount + NEW.amount,
        payment_status = CASE
          WHEN paid_amount + NEW.amount >= total_amount THEN 'paid'
          WHEN paid_amount + NEW.amount > 0 THEN 'partial'
          ELSE 'not_started'
        END
    WHERE student_id = NEW.student_id
      AND academic_year = NEW.academic_year
      AND term = NEW.term;
  END IF;
END//
DELIMITER ;

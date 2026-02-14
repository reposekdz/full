-- Garden TVET School - Parent Payment System Database Migration
-- Complete Payment System with Bank Integrations

-- Drop existing tables if needed
DROP TABLE IF EXISTS pending_payments;
DROP TABLE IF EXISTS payment_receipts;
DROP TABLE IF EXISTS bank_configurations;
DROP TABLE IF EXISTS fee_categories;
DROP TABLE IF EXISTS level_fee_config;
DROP TABLE IF EXISTS payment_transactions;

-- Parent Linking Table (already exists, but adding indexes)
CREATE INDEX idx_parent_linking_parent_id ON parent_linking(parent_id);
CREATE INDEX idx_parent_linking_student_id ON parent_linking(student_id);
CREATE INDEX idx_parent_linking_status ON parent_linking(status);

-- Fee Categories Table
CREATE TABLE IF NOT EXISTS fee_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Level Fee Configuration
CREATE TABLE IF NOT EXISTS level_fee_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level_number VARCHAR(20) NOT NULL,
    fee_category_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fee_category_id) REFERENCES fee_categories(id),
    UNIQUE KEY unique_level_category_year (level_number, fee_category_id, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fee Assessments Table
CREATE TABLE IF NOT EXISTS fee_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    fee_category VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fee_student (student_id),
    INDEX idx_fee_academic_year (academic_year),
    INDEX idx_fee_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pending Payments Table (for tracking initiated payments)
CREATE TABLE IF NOT EXISTS pending_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    fee_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    external_reference VARCHAR(200),
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    INDEX idx_pending_parent (parent_id),
    INDEX idx_pending_student (student_id),
    INDEX idx_pending_reference (reference_number),
    INDEX idx_pending_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Transactions Table (main payments table)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    fee_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_channel VARCHAR(50),
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_transaction_student (student_id),
    INDEX idx_transaction_parent (parent_id),
    INDEX idx_transaction_reference (reference_number),
    INDEX idx_transaction_status (status),
    INDEX idx_transaction_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy Payments Table (for backward compatibility)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50),
    fee_id INT,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100) UNIQUE,
    receipt_number VARCHAR(100) UNIQUE,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fee_amount DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payments_student (student_id),
    INDEX idx_payments_parent (parent_id),
    INDEX idx_payments_reference (reference_number),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Receipts Table
CREATE TABLE IF NOT EXISTS payment_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50),
    transaction_id VARCHAR(100),
    amount DECIMAL(12, 2) NOT NULL,
    fee_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(50),
    pdf_path VARCHAR(255),
    is_valid BOOLEAN DEFAULT TRUE,
    voided_at TIMESTAMP NULL,
    voided_by VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_receipts_student (student_id),
    INDEX idx_receipts_parent (parent_id),
    INDEX idx_receipts_number (receipt_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Configurations Table
CREATE TABLE IF NOT EXISTS bank_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bank_code VARCHAR(50) UNIQUE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    api_url VARCHAR(500),
    merchant_id VARCHAR(100),
    collection_id VARCHAR(100),
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    callback_url VARCHAR(500),
    webhook_secret VARCHAR(255),
    fee_percent DECIMAL(5, 2) DEFAULT 0.00,
    min_amount DECIMAL(12, 2) DEFAULT 0.00,
    max_amount DECIMAL(12, 2),
    is_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sandbox_mode BOOLEAN DEFAULT FALSE,
    config_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bank_enabled (is_enabled),
    INDEX idx_bank_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default fee categories
INSERT INTO fee_categories (category_code, category_name, description, is_mandatory) VALUES
('TUITION', 'Tuition Fees', 'Core tuition fees for the academic year', TRUE),
('REGISTRATION', 'Registration Fees', 'One-time registration fees', TRUE),
('EXAM', 'Examination Fees', 'Fees for internal and external examinations', TRUE),
('MATERIAL', 'Learning Materials', 'Books, uniforms, and learning materials', TRUE),
('HOSTEL', 'Hostel Accommodation', 'Dormitory and accommodation fees', FALSE),
('TRANSPORT', 'Transport Fees', 'School bus and transportation fees', FALSE),
('CAFETERIA', 'Cafeteria/Food', 'Meal plans and cafeteria credits', FALSE),
('ACTIVITY', 'Activity Fees', 'Sports, clubs, and extracurricular activities', FALSE),
('LATE', 'Late Payment Fees', 'Penalty for late payment', FALSE),
('OTHER', 'Other Fees', 'Miscellaneous fees', FALSE)
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- Insert level fee configurations for current academic year
INSERT INTO level_fee_config (level_number, fee_category_id, amount, academic_year) VALUES
('3', 1, 150000, '2024-2025'),
('3', 2, 25000, '2024-2025'),
('3', 3, 50000, '2024-2025'),
('3', 4, 75000, '2024-2025'),
('4', 1, 200000, '2024-2025'),
('4', 2, 25000, '2024-2025'),
('4', 3, 50000, '2024-2025'),
('4', 4, 75000, '2024-2025'),
('5', 1, 250000, '2024-2025'),
('5', 2, 25000, '2024-2025'),
('5', 3, 75000, '2024-2025'),
('5', 4, 75000, '2024-2025'),
('BDC', 1, 100000, '2024-2025'),
('BDC', 2, 25000, '2024-2025'),
('BDC', 3, 25000, '2024-2025'),
('BDC', 4, 50000, '2024-2025'),
('AUT', 1, 180000, '2024-2025'),
('AUT', 2, 25000, '2024-2025'),
('AUT', 3, 50000, '2024-2025'),
('AUT', 4, 100000, '2024-2025'),
('4A', 1, 200000, '2024-2025'),
('4A', 2, 25000, '2024-2025'),
('4A', 3, 50000, '2024-2025'),
('4A', 4, 75000, '2024-2025'),
('4B', 1, 200000, '2024-2025'),
('4B', 2, 25000, '2024-2025'),
('4B', 3, 50000, '2024-2025'),
('4B', 4, 75000, '2024-2025'),
('5A', 1, 250000, '2024-2025'),
('5A', 2, 25000, '2024-2025'),
('5A', 3, 75000, '2024-2025'),
('5A', 4, 75000, '2024-2025'),
('5B', 1, 250000, '2024-2025'),
('5B', 2, 25000, '2024-2025'),
('5B', 3, 75000, '2024-2025'),
('5B', 4, 75000, '2024-2025')
ON DUPLICATE KEY UPDATE amount = VALUES(amount);

-- Insert bank configurations
INSERT INTO bank_configurations (bank_code, bank_name, api_url, fee_percent, min_amount, max_amount, is_enabled) VALUES
('gt_bank', 'GT Bank Rwanda', NULL, 0.00, 1000, 10000000, FALSE),
('bpr', 'Bank of Kigali (BPR)', NULL, 0.00, 1000, 10000000, FALSE),
('equity_bank', 'Equity Bank Rwanda', NULL, 0.00, 1000, 10000000, FALSE),
('mtn_money', 'MTN Mobile Money', NULL, 0.50, 100, 500000, FALSE),
('airtel_money', 'Airtel Money', NULL, 0.50, 100, 500000, FALSE)
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

-- Create view for parent payment summary
CREATE OR REPLACE VIEW v_parent_payment_summary AS
SELECT 
    pl.parent_id,
    pl.student_id,
    ss.first_name,
    ss.last_name,
    ss.student_code,
    ss.level_number,
    ss.trade_code,
    pl.relationship,
    pl.is_primary,
    COALESCE(SUM(fa.amount), 0) as total_fees,
    COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(fa.amount), 0) - COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as balance,
    CASE 
        WHEN COALESCE(SUM(fa.amount), 0) <= COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) THEN 'paid'
        WHEN COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) > 0 THEN 'partial'
        ELSE 'unpaid'
    END as payment_status,
    CASE 
        WHEN COALESCE(SUM(fa.amount), 0) > 0 THEN
            ROUND((COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) / COALESCE(SUM(fa.amount), 0)) * 100, 2)
        ELSE 0
    END as percentage_paid
FROM parent_linking pl
JOIN student_sheets ss ON pl.student_id = ss.student_id
LEFT JOIN fee_assessments fa ON fa.student_id = ss.student_id 
    AND fa.academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
LEFT JOIN payments p ON p.student_id = ss.student_id AND p.status = 'completed'
WHERE pl.status = 'verified'
GROUP BY pl.parent_id, pl.student_id, ss.first_name, ss.last_name, ss.student_code, ss.level_number, ss.trade_code, pl.relationship, pl.is_primary;

-- Create stored procedure for auto-calculate balance
DELIMITER //
CREATE PROCEDURE sp_calculate_student_balance(IN p_student_id VARCHAR(50))
BEGIN
    DECLARE v_total_fees DECIMAL(12, 2);
    DECLARE v_paid_amount DECIMAL(12, 2);
    DECLARE v_balance DECIMAL(12, 2);
    DECLARE v_status VARCHAR(20);
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_fees 
    FROM fee_assessments 
    WHERE student_id = p_student_id 
    AND academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1);
    
    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount 
    FROM payments 
    WHERE student_id = p_student_id 
    AND status = 'completed';
    
    SET v_balance = v_total_fees - v_paid_amount;
    
    IF v_total_fees <= v_paid_amount THEN SET v_status = 'paid';
    ELSEIF v_paid_amount > 0 THEN SET v_status = 'partial';
    ELSE SET v_status = 'unpaid';
    END IF;
    
    SELECT v_total_fees as total_fees, v_paid_amount as paid_amount, v_balance as balance, v_status as payment_status;
END //
DELIMITER ;

-- Update system settings to include payment settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('payment_gateway_enabled', 'true', 'boolean', 'Enable payment gateway'),
('allow_partial_payments', 'true', 'boolean', 'Allow partial fee payments'),
('payment_expiry_hours', '24', 'number', 'Payment link expiry in hours'),
('auto_receipt_generation', 'true', 'boolean', 'Auto-generate receipts on payment'),
('payment_notification_enabled', 'true', 'boolean', 'Send notifications for payments')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Create trigger for auto-generate receipt on payment completion
DELIMITER //
CREATE TRIGGER trg_after_payment_complete
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO payment_receipts (receipt_number, student_id, parent_id, transaction_id, amount, fee_amount, total_amount, payment_method, payment_date, generated_by)
        VALUES (
            CONCAT('RCP-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', LPAD(NEW.id, 6, '0')),
            NEW.student_id,
            NEW.parent_id,
            NEW.reference_number,
            NEW.amount,
            NEW.fee_amount,
            NEW.amount + NEW.fee_amount,
            NEW.payment_method,
            NEW.payment_date,
            'system'
        );
    END IF;
END //
DELIMITER ;

-- Migration complete message
SELECT 'Parent Payment System Migration Completed Successfully!' as status;

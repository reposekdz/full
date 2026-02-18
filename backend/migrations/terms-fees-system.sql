-- ============================================================
-- TERMS AND FEES SYSTEM FOR RWANDA SCHOOLS
-- ============================================================

-- Terms table (3 terms for Rwanda schools)
CREATE TABLE IF NOT EXISTS academic_terms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    term_number INT NOT NULL CHECK (term_number BETWEEN 1 AND 3),
    term_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_term (term_number, academic_year),
    INDEX idx_academic_year (academic_year),
    INDEX idx_is_current (is_current)
);

-- Insert default terms for current academic year
INSERT INTO academic_terms (term_number, term_name, start_date, end_date, academic_year, is_current, status) VALUES
(1, 'Term 1', '2025-01-15', '2025-04-30', '2024-2025', TRUE, 'active'),
(2, 'Term 2', '2025-05-01', '2025-08-15', '2024-2025', FALSE, 'pending'),
(3, 'Term 3', '2025-08-16', '2025-11-30', '2024-2025', FALSE, 'pending')
ON DUPLICATE KEY UPDATE term_name = VALUES(term_name);

-- Fee categories
CREATE TABLE IF NOT EXISTS fee_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default fee categories
INSERT INTO fee_categories (name, description, is_required) VALUES
('Tuition', 'School fees/tuition', TRUE),
('Registration', 'Registration fee', TRUE),
('Development', 'Development fund', TRUE),
('Library', 'Library fee', TRUE),
('Sports', 'Sports activities', TRUE),
('Exam', 'Examination fee', TRUE),
('Transport', 'Transportation fee', FALSE),
('Boarding', 'Boarding fee', FALSE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Fee structures per term
CREATE TABLE IF NOT EXISTS fee_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    term_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    level VARCHAR(50),
    trade VARCHAR(100),
    due_date DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (term_id) REFERENCES academic_terms(id),
    FOREIGN KEY (category_id) REFERENCES fee_categories(id),
    INDEX idx_term (term_id),
    INDEX idx_academic_year (academic_year)
);

-- Student fees (what each student owes per term)
CREATE TABLE IF NOT EXISTS student_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'partial', 'paid', 'waived', 'overdue') DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (term_id) REFERENCES academic_terms(id),
    FOREIGN KEY (category_id) REFERENCES fee_categories(id),
    INDEX idx_student (student_id),
    INDEX idx_term (term_id),
    INDEX idx_status (status)
);

-- Student payments
CREATE TABLE IF NOT EXISTS student_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash', 'bank', 'mobile_money', 'cheque') DEFAULT 'cash',
    transaction_ref VARCHAR(100),
    payment_date DATE NOT NULL,
    recorded_by INT,
    notes TEXT,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (term_id) REFERENCES academic_terms(id),
    INDEX idx_student (student_id),
    INDEX idx_term (term_id),
    INDEX idx_payment_date (payment_date)
);

-- Payment receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    payment_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    print_count INT DEFAULT 0,
    last_printed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES student_payments(id)
);

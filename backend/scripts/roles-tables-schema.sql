-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_student (student_id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  expense_date DATE,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_code VARCHAR(100) UNIQUE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity INT DEFAULT 0,
  unit_price DECIMAL(10,2),
  reorder_level INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_quantity (quantity)
);

-- Discipline incidents
CREATE TABLE IF NOT EXISTS discipline_incidents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  incident_type VARCHAR(100),
  description TEXT,
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'open',
  reported_by INT,
  resolved_by INT,
  resolved_at DATETIME,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_student (student_id)
);

-- Insert sample data
INSERT INTO system_settings (setting_key, setting_value) VALUES
('school_name', 'Garden TVET School'),
('school_email', 'info@gardentvet.rw'),
('school_phone', '+250 788 987 830'),
('academic_year', '2024-2025')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

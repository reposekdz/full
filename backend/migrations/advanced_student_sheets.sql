-- Advanced Student Sheets Schema

-- Custom columns table
CREATE TABLE IF NOT EXISTS student_custom_columns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  level_suffix VARCHAR(5) DEFAULT '',
  column_name VARCHAR(100) NOT NULL,
  column_type ENUM('text', 'number', 'date', 'percentage') DEFAULT 'text',
  formula TEXT,
  calculation_type ENUM('none', 'sum', 'average', 'formula') DEFAULT 'none',
  default_value VARCHAR(255),
  display_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trade_level (trade_code, level_number, level_suffix)
);

-- Custom values table
CREATE TABLE IF NOT EXISTS student_custom_values (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  column_id INT NOT NULL,
  column_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_column (student_id, column_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (column_id) REFERENCES student_custom_columns(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_column (column_id)
);

-- Action logs for tracking all student actions
CREATE TABLE IF NOT EXISTS student_action_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT,
  performed_by INT NOT NULL,
  role VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id),
  INDEX idx_student (student_id),
  INDEX idx_action_type (action_type),
  INDEX idx_performed_by (performed_by)
);

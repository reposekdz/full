-- Dynamic Columns Management Schema
-- Allows accountants to create custom columns for level sheets

CREATE TABLE IF NOT EXISTS level_sheet_columns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trade_id INT NOT NULL,
    level_id INT NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    column_type ENUM('text', 'number', 'date', 'currency', 'percentage') DEFAULT 'text',
    is_required BOOLEAN DEFAULT FALSE,
    default_value VARCHAR(255),
    display_order INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_column (trade_id, level_id, column_name)
);

CREATE TABLE IF NOT EXISTS student_column_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    column_id INT NOT NULL,
    column_value TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES level_sheet_columns(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_column (student_id, column_id)
);

CREATE TABLE IF NOT EXISTS parent_student_connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship VARCHAR(50) DEFAULT 'parent',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_parent_student (parent_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_columns_trade_level ON level_sheet_columns(trade_id, level_id);
CREATE INDEX idx_values_student ON student_column_values(student_id);
CREATE INDEX idx_connections_parent ON parent_student_connections(parent_id);
CREATE INDEX idx_connections_status ON parent_student_connections(status);

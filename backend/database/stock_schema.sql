-- Stock Management System Database Schema

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS stock_items;

SET FOREIGN_KEY_CHECKS = 1;

-- Stock Items Table
CREATE TABLE stock_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category ENUM('Stationery', 'Electronics', 'Furniture', 'Sports', 'Laboratory', 'Kitchen', 'Cleaning', 'Medical', 'Other') NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 10,
  supplier VARCHAR(255),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_item_code (item_code),
  INDEX idx_item_name (item_name)
);

-- Stock Transactions Table
CREATE TABLE stock_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stock_item_id INT NOT NULL,
  transaction_type ENUM('in', 'out') NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  performed_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
  INDEX idx_stock_item (stock_item_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_created_at (created_at)
);

-- Sample Data
INSERT INTO stock_items (item_code, item_name, category, quantity, unit, unit_price, reorder_level, supplier, location) VALUES
('STN001', 'A4 Paper Ream', 'Stationery', 50, 'Ream', 5000, 10, 'Office Supplies Ltd', 'Store Room A'),
('STN002', 'Blue Pens', 'Stationery', 200, 'Box', 2000, 20, 'Office Supplies Ltd', 'Store Room A'),
('ELC001', 'Projector', 'Electronics', 5, 'Unit', 500000, 2, 'Tech Solutions', 'IT Room'),
('FUR001', 'Student Desk', 'Furniture', 100, 'Unit', 35000, 10, 'Furniture Co', 'Warehouse'),
('SPT001', 'Football', 'Sports', 15, 'Unit', 15000, 5, 'Sports World', 'Sports Store'),
('LAB001', 'Test Tubes', 'Laboratory', 100, 'Pack', 8000, 20, 'Lab Equipment', 'Laboratory'),
('KIT001', 'Plates', 'Kitchen', 200, 'Unit', 1500, 30, 'Kitchen Supplies', 'Kitchen Store'),
('CLN001', 'Detergent', 'Cleaning', 30, 'Kg', 3000, 10, 'Cleaning Co', 'Cleaning Store'),
('MED001', 'First Aid Kit', 'Medical', 10, 'Unit', 25000, 3, 'Medical Supplies', 'Clinic');

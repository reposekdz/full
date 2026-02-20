-- ============================================
-- ULTRA COMPREHENSIVE STOCK MANAGEMENT SYSTEM
-- Complete Database Schema
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS stock_adjustments;
DROP TABLE IF EXISTS stock_transfers;
DROP TABLE IF EXISTS stock_alerts;
DROP TABLE IF EXISTS stock_order_items;
DROP TABLE IF EXISTS stock_orders;
DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS stock_items;
DROP TABLE IF EXISTS stock_suppliers;
DROP TABLE IF EXISTS stock_categories;
DROP TABLE IF EXISTS stock_locations;

-- ============================================
-- STOCK CATEGORIES
-- ============================================
CREATE TABLE stock_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_code VARCHAR(20) UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_category_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_category_id) REFERENCES stock_categories(id) ON DELETE SET NULL
);

-- ============================================
-- STOCK LOCATIONS
-- ============================================
CREATE TABLE stock_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_code VARCHAR(20) UNIQUE NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  location_type ENUM('warehouse', 'store', 'workshop', 'office', 'other') DEFAULT 'store',
  address TEXT,
  capacity INT,
  manager_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- STOCK SUPPLIERS
-- ============================================
CREATE TABLE stock_suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplier_code VARCHAR(20) UNIQUE NOT NULL,
  supplier_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Rwanda',
  tax_number VARCHAR(50),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(15,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- STOCK ITEMS
-- ============================================
CREATE TABLE stock_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  category_id INT,
  description TEXT,
  unit VARCHAR(50) DEFAULT 'pieces',
  quantity INT DEFAULT 0,
  min_quantity INT DEFAULT 10,
  max_quantity INT DEFAULT 1000,
  reorder_level INT DEFAULT 20,
  unit_price DECIMAL(15,2) DEFAULT 0,
  selling_price DECIMAL(15,2) DEFAULT 0,
  supplier_id INT,
  location_id INT,
  barcode VARCHAR(100),
  sku VARCHAR(100),
  image_url VARCHAR(500),
  expiry_date DATE,
  batch_number VARCHAR(100),
  warranty_months INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES stock_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES stock_suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES stock_locations(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_item_code (item_code),
  INDEX idx_category (category_id),
  INDEX idx_quantity (quantity),
  INDEX idx_active (is_active)
);

-- ============================================
-- STOCK TRANSACTIONS
-- ============================================
CREATE TABLE stock_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_code VARCHAR(50) UNIQUE NOT NULL,
  item_id INT NOT NULL,
  transaction_type ENUM('purchase', 'sale', 'stock_in', 'stock_out', 'adjustment', 'transfer', 'return', 'damage', 'loss') NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  unit_price DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  reference_number VARCHAR(100),
  issued_to VARCHAR(200),
  received_from VARCHAR(200),
  location_id INT,
  notes TEXT,
  performed_by INT,
  approved_by INT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES stock_locations(id) ON DELETE SET NULL,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_item (item_id),
  INDEX idx_type (transaction_type),
  INDEX idx_date (transaction_date)
);

-- ============================================
-- STOCK ORDERS (Purchase Orders)
-- ============================================
CREATE TABLE stock_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id INT NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery DATE,
  actual_delivery DATE,
  status ENUM('draft', 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled') DEFAULT 'draft',
  total_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  shipping_cost DECIMAL(15,2) DEFAULT 0,
  grand_total DECIMAL(15,2) DEFAULT 0,
  payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
  payment_method VARCHAR(50),
  notes TEXT,
  created_by INT,
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES stock_suppliers(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_order_number (order_number),
  INDEX idx_status (status),
  INDEX idx_supplier (supplier_id)
);

-- ============================================
-- STOCK ORDER ITEMS
-- ============================================
CREATE TABLE stock_order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  received_quantity INT DEFAULT 0,
  unit_price DECIMAL(15,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax_percent DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES stock_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE RESTRICT
);

-- ============================================
-- STOCK TRANSFERS
-- ============================================
CREATE TABLE stock_transfers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transfer_code VARCHAR(50) UNIQUE NOT NULL,
  item_id INT NOT NULL,
  from_location_id INT NOT NULL,
  to_location_id INT NOT NULL,
  quantity INT NOT NULL,
  transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'in_transit', 'completed', 'cancelled') DEFAULT 'pending',
  requested_by INT,
  approved_by INT,
  received_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
  FOREIGN KEY (from_location_id) REFERENCES stock_locations(id) ON DELETE RESTRICT,
  FOREIGN KEY (to_location_id) REFERENCES stock_locations(id) ON DELETE RESTRICT,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- STOCK ADJUSTMENTS
-- ============================================
CREATE TABLE stock_adjustments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  adjustment_code VARCHAR(50) UNIQUE NOT NULL,
  item_id INT NOT NULL,
  adjustment_type ENUM('increase', 'decrease', 'recount', 'damage', 'expiry', 'theft', 'other') NOT NULL,
  quantity_before INT NOT NULL,
  quantity_adjusted INT NOT NULL,
  quantity_after INT NOT NULL,
  reason TEXT NOT NULL,
  adjustment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  performed_by INT,
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- STOCK ALERTS
-- ============================================
CREATE TABLE stock_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  alert_type ENUM('low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by INT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_alert_type (alert_type),
  INDEX idx_resolved (is_resolved)
);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Sample Categories
INSERT INTO stock_categories (category_code, category_name, description) VALUES
('SOD', 'Software Development Tools', 'Tools and equipment for software development trade'),
('BDC', 'Building Construction Materials', 'Materials and tools for building construction'),
('AUT', 'Automotive Parts', 'Automotive parts and tools'),
('ELC', 'Electronics', 'Electronic components and devices'),
('STA', 'Stationery', 'Office and school stationery'),
('UNI', 'Uniforms', 'School uniforms and accessories'),
('FUR', 'Furniture', 'School furniture and fixtures'),
('CLN', 'Cleaning Supplies', 'Cleaning materials and equipment');

-- Sample Locations
INSERT INTO stock_locations (location_code, location_name, location_type, capacity) VALUES
('MAIN-STORE', 'Main Store', 'warehouse', 10000),
('SOD-WORKSHOP', 'SOD Workshop', 'workshop', 500),
('BDC-WORKSHOP', 'BDC Workshop', 'workshop', 800),
('AUT-WORKSHOP', 'Automotive Workshop', 'workshop', 600),
('ADMIN-OFFICE', 'Administration Office', 'office', 200);

-- Sample Suppliers
INSERT INTO stock_suppliers (supplier_code, supplier_name, contact_person, email, phone, city, country) VALUES
('SUP001', 'Kigali Tech Supplies Ltd', 'Jean Paul', 'info@kigalitech.rw', '+250788123456', 'Kigali', 'Rwanda'),
('SUP002', 'Rwanda Building Materials', 'Marie Claire', 'sales@rwandabuild.rw', '+250788234567', 'Kigali', 'Rwanda'),
('SUP003', 'Auto Parts Rwanda', 'Eric Nshuti', 'contact@autoparts.rw', '+250788345678', 'Kigali', 'Rwanda'),
('SUP004', 'Office Supplies Co', 'Grace Uwase', 'orders@officesupplies.rw', '+250788456789', 'Kigali', 'Rwanda');

-- Sample Stock Items
INSERT INTO stock_items (item_code, item_name, category_id, description, unit, quantity, reorder_level, unit_price, selling_price, supplier_id, location_id) VALUES
('SOD-001', 'Laptop Dell Latitude 5420', 1, 'Dell Latitude 5420, i5, 8GB RAM, 256GB SSD', 'pieces', 15, 5, 650000, 750000, 1, 2),
('SOD-002', 'Programming Books Set', 1, 'Complete set of programming books', 'sets', 25, 10, 50000, 60000, 1, 2),
('SOD-003', 'USB Flash Drive 32GB', 1, 'Kingston 32GB USB 3.0', 'pieces', 50, 20, 8000, 12000, 1, 2),
('BDC-001', 'Cement Bags', 2, 'Portland cement 50kg bags', 'bags', 200, 50, 12000, 15000, 2, 3),
('BDC-002', 'Steel Bars 12mm', 2, 'Construction steel bars', 'pieces', 100, 30, 8000, 10000, 2, 3),
('AUT-001', 'Engine Oil 5W-30', 3, 'Synthetic engine oil', 'liters', 80, 20, 15000, 20000, 3, 4),
('AUT-002', 'Brake Pads Set', 3, 'Front brake pads', 'sets', 30, 10, 25000, 35000, 3, 4),
('STA-001', 'A4 Paper Reams', 5, 'White A4 paper 500 sheets', 'reams', 100, 30, 8000, 10000, 4, 5),
('STA-002', 'Pens Box', 5, 'Blue ballpoint pens box of 50', 'boxes', 40, 15, 15000, 20000, 4, 5),
('UNI-001', 'School Uniform Shirt', 6, 'White school shirt', 'pieces', 150, 50, 8000, 12000, 4, 1);

COMMIT;

-- Stock Management System Database Schema

-- Stock Items Table
CREATE TABLE IF NOT EXISTS stock_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_name VARCHAR(255) NOT NULL,
  item_code VARCHAR(100) UNIQUE NOT NULL,
  category ENUM('furniture', 'electronics', 'stationery', 'sports', 'laboratory', 'kitchen', 'maintenance', 'medical', 'other') DEFAULT 'other',
  description TEXT,
  quantity INT DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  unit_price DECIMAL(10, 2) DEFAULT 0.00,
  reorder_level INT DEFAULT 10,
  location VARCHAR(255),
  supplier VARCHAR(255),
  supplier_contact VARCHAR(100),
  status ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') DEFAULT 'available',
  last_restock_date DATE,
  last_restock_quantity INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_item_code (item_code),
  INDEX idx_item_name (item_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Transactions Table
CREATE TABLE IF NOT EXISTS stock_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  transaction_type ENUM('purchase', 'issue', 'return', 'damage', 'loss', 'adjustment', 'transfer') NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) DEFAULT 0.00,
  total_value DECIMAL(10, 2) DEFAULT 0.00,
  transaction_date DATE NOT NULL,
  reference_number VARCHAR(100),
  issued_to INT,
  issued_by INT,
  department VARCHAR(100),
  purpose TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_item_id (item_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_issued_to (issued_to),
  INDEX idx_issued_by (issued_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Requisitions Table
CREATE TABLE IF NOT EXISTS stock_requisitions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requisition_number VARCHAR(100) UNIQUE NOT NULL,
  requested_by INT NOT NULL,
  department VARCHAR(100),
  request_date DATE NOT NULL,
  required_date DATE,
  status ENUM('pending', 'approved', 'rejected', 'fulfilled', 'cancelled') DEFAULT 'pending',
  approved_by INT,
  approval_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_requested_by (requested_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Requisition Items Table
CREATE TABLE IF NOT EXISTS stock_requisition_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requisition_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity_requested INT NOT NULL,
  quantity_approved INT DEFAULT 0,
  quantity_issued INT DEFAULT 0,
  purpose TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requisition_id) REFERENCES stock_requisitions(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
  INDEX idx_requisition_id (requisition_id),
  INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Procurement Orders Table
CREATE TABLE IF NOT EXISTS procurement_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  supplier_contact VARCHAR(100),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status ENUM('pending', 'ordered', 'partial', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(12, 2) DEFAULT 0.00,
  payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
  payment_method VARCHAR(50),
  ordered_by INT NOT NULL,
  received_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ordered_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_supplier (supplier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Procurement Order Items Table
CREATE TABLE IF NOT EXISTS procurement_order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  item_id INT,
  item_name VARCHAR(255) NOT NULL,
  quantity_ordered INT NOT NULL,
  quantity_received INT DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES procurement_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE SET NULL,
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Suppliers Table
CREATE TABLE IF NOT EXISTS stock_suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplier_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  category VARCHAR(100),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  status ENUM('active', 'inactive', 'blacklisted') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_supplier_name (supplier_name),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO stock_items (item_name, item_code, category, description, quantity, unit, unit_price, reorder_level, location, status) VALUES
('Desk Chair', 'FUR001', 'furniture', 'Office desk chair with wheels', 45, 'pcs', 25000, 10, 'Store Room A', 'available'),
('Laptop Dell', 'ELC001', 'electronics', 'Dell Latitude 5420 Laptop', 8, 'pcs', 850000, 5, 'IT Store', 'low_stock'),
('Whiteboard Marker', 'STA001', 'stationery', 'Whiteboard marker - Black', 150, 'pcs', 500, 50, 'Store Room B', 'available'),
('Football', 'SPT001', 'sports', 'Standard size 5 football', 12, 'pcs', 15000, 5, 'Sports Store', 'available'),
('Microscope', 'LAB001', 'laboratory', 'Compound microscope 1000x', 3, 'pcs', 450000, 2, 'Science Lab', 'low_stock'),
('Cooking Pot', 'KIT001', 'kitchen', 'Large cooking pot 50L', 8, 'pcs', 35000, 3, 'Kitchen Store', 'available'),
('Paint Brush', 'MNT001', 'maintenance', 'Paint brush 4 inch', 25, 'pcs', 2500, 10, 'Maintenance Store', 'available'),
('First Aid Kit', 'MED001', 'medical', 'Complete first aid kit', 5, 'pcs', 45000, 3, 'Medical Room', 'available');

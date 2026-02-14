-- Stock Management Database Tables for Garden TVET School
-- Clean installation - drops existing tables first

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS stock_order_items;
DROP TABLE IF EXISTS stock_orders;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS stock_items;
DROP TABLE IF EXISTS stock_suppliers;
DROP TABLE IF EXISTS stock_categories;

-- Stock Items Table
CREATE TABLE stock_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pcs',
    unit_price DECIMAL(10, 2) DEFAULT 0,
    reorder_level DECIMAL(10, 2) DEFAULT 5,
    location VARCHAR(100),
    supplier_id INT,
    expiry_date DATE,
    batch_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_supplier (supplier_id),
    INDEX idx_quantity (quantity),
    INDEX idx_active (is_active)
);

-- Stock Movements Table
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment', 'return', 'damage', 'transfer') NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    previous_qty DECIMAL(10, 2),
    new_qty DECIMAL(10, 2),
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_item_id (item_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_created_at (created_at)
);

-- Stock Suppliers Table
CREATE TABLE stock_suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    payment_terms VARCHAR(200),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock Orders Table (Purchase Orders)
CREATE TABLE stock_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT,
    status ENUM('draft', 'pending', 'approved', 'ordered', 'received', 'cancelled') DEFAULT 'draft',
    total_amount DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    expected_delivery DATE,
    received_at DATETIME,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Stock Order Items Table
CREATE TABLE stock_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(12, 2),
    received_quantity DECIMAL(10, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_item_id (item_id)
);

-- Stock Categories Reference Table
CREATE TABLE stock_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO stock_categories (category_name, description) VALUES
('Office Supplies', 'Pens, papers, staplers, and other office materials'),
('Cleaning Supplies', 'Detergents, sanitizers, cleaning equipment'),
('Laboratory Equipment', 'Science lab materials and equipment'),
('Sports Equipment', 'Sports gear and athletic supplies'),
('IT Equipment', 'Computers, printers, and technology items'),
('Furniture', 'Desks, chairs, tables, and storage'),
('Medical Supplies', 'First aid and medical materials'),
('Teaching Materials', 'Textbooks, charts, and educational resources'),
('Maintenance Supplies', 'Tools and repair materials'),
('Other', 'Miscellaneous items');

-- Insert sample suppliers
INSERT INTO stock_suppliers (supplier_code, supplier_name, contact_person, phone, email, address) VALUES
('SUP001', 'Rwanda Office Supplies Ltd', 'John Mukama', '+250788123456', 'john@rwandaofficesupplies.rw', 'Kigali, Rwanda'),
('SUP002', 'East African Traders', 'Mary Uwimana', '+250788654321', 'mary@eastaftraders.rw', 'Kigali, Rwanda'),
('SUP003', 'Tech Solutions Rwanda', 'Bob Nzeyimana', '+250788111222', 'bob@techsolutions.rw', 'Kigali, Rwanda'),
('SUP004', 'CleanPro Services', 'Alice Mutoni', '+250788333444', 'alice@cleanpro.rw', 'Kigali, Rwanda');

-- Insert sample stock items
INSERT INTO stock_items (item_code, item_name, category, description, quantity, unit, unit_price, reorder_level, location) VALUES
('SI001', 'Ballpoint Pens (Blue)', 'Office Supplies', 'Blue ballpoint pens, pack of 12', 500, 'packs', 2.50, 50, 'A1-01'),
('SI002', 'A4 Paper Reams', 'Office Supplies', 'White A4 paper, 80gsm', 200, 'reams', 5.00, 30, 'A1-02'),
('SI003', 'Exercise Books', 'Office Supplies', '200-page exercise books', 1000, 'pcs', 1.00, 100, 'A1-03'),
('SI004', 'Whiteboard Markers', 'Office Supplies', 'Assorted colors, set of 4', 150, 'sets', 3.00, 20, 'A1-04'),
('SI005', 'Hand Sanitizer', 'Cleaning Supplies', '500ml bottles', 75, 'bottles', 4.00, 20, 'B1-01'),
('SI006', 'Disinfectant Wipes', 'Cleaning Supplies', 'Pack of 100', 200, 'packs', 6.00, 30, 'B1-02'),
('SI007', 'Trash Bags', 'Cleaning Supplies', 'Large black bags, pack of 50', 100, 'packs', 8.00, 15, 'B1-03'),
('SI008', 'Laptop Computers', 'IT Equipment', '15.6" laptop, 8GB RAM', 15, 'pcs', 450.00, 5, 'C1-01'),
('SI009', 'USB Flash Drives', 'IT Equipment', '32GB capacity', 50, 'pcs', 12.00, 10, 'C1-02'),
('SI010', 'Projector', 'IT Equipment', 'HD projector, 3000 lumens', 3, 'pcs', 350.00, 2, 'C1-03'),
('SI011', 'First Aid Kit', 'Medical Supplies', 'Complete first aid supplies', 10, 'kits', 45.00, 3, 'D1-01'),
('SI012', 'Bandages', 'Medical Supplies', 'Assorted sizes, pack of 50', 25, 'packs', 8.00, 10, 'D1-02'),
('SI013', 'Basketballs', 'Sports Equipment', 'Official size basketballs', 20, 'pcs', 25.00, 5, 'E1-01'),
('SI014', 'Soccer Balls', 'Sports Equipment', 'Standard size soccer balls', 30, 'pcs', 20.00, 10, 'E1-02'),
('SI015', 'Chalkboard Chalk', 'Teaching Materials', 'White chalk, box of 100', 50, 'boxes', 3.00, 15, 'F1-01');

SET FOREIGN_KEY_CHECKS = 1;

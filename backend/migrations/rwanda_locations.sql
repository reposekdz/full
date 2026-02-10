-- Rwanda Administrative Divisions Database
-- Provinces, Districts, Sectors, Cells, Villages

-- Provinces table
CREATE TABLE IF NOT EXISTS provinces (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name_en VARCHAR(100) NOT NULL,
  name_rw VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  province_id INT NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_rw VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
);

-- Sectors table
CREATE TABLE IF NOT EXISTS sectors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  district_id INT NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_rw VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

-- Cells table
CREATE TABLE IF NOT EXISTS cells (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sector_id INT NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_rw VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE
);

-- Villages table
CREATE TABLE IF NOT EXISTS villages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cell_id INT NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_rw VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE CASCADE
);

-- Insert Provinces
INSERT INTO provinces (name_en, name_rw, code) VALUES
('Kigali City', 'Umujyi wa Kigali', 'KGL'),
('Northern Province', 'Intara y''Amajyaruguru', 'NTH'),
('Southern Province', 'Intara y''Amajyepfo', 'STH'),
('Eastern Province', 'Intara y''Iburasirazuba', 'EST'),
('Western Province', 'Intara y''Iburengerazuba', 'WST');

-- Insert Districts for Kigali City
INSERT INTO districts (province_id, name_en, name_rw, code) VALUES
(1, 'Gasabo', 'Gasabo', 'GSB'),
(1, 'Kicukiro', 'Kicukiro', 'KCK'),
(1, 'Nyarugenge', 'Nyarugenge', 'NYR');

-- Insert Districts for Northern Province
INSERT INTO districts (province_id, name_en, name_rw, code) VALUES
(2, 'Burera', 'Burera', 'BRR'),
(2, 'Gakenke', 'Gakenke', 'GKK'),
(2, 'Gicumbi', 'Gicumbi', 'GCB'),
(2, 'Musanze', 'Musanze', 'MSZ'),
(2, 'Rulindo', 'Rulindo', 'RLD');

-- Insert Districts for Southern Province
INSERT INTO districts (province_id, name_en, name_rw, code) VALUES
(3, 'Gisagara', 'Gisagara', 'GSG'),
(3, 'Huye', 'Huye', 'HYE'),
(3, 'Kamonyi', 'Kamonyi', 'KMY'),
(3, 'Muhanga', 'Muhanga', 'MHG'),
(3, 'Nyamagabe', 'Nyamagabe', 'NMG'),
(3, 'Nyanza', 'Nyanza', 'NYZ'),
(3, 'Nyaruguru', 'Nyaruguru', 'NRG'),
(3, 'Ruhango', 'Ruhango', 'RHG');

-- Insert Districts for Eastern Province
INSERT INTO districts (province_id, name_en, name_rw, code) VALUES
(4, 'Bugesera', 'Bugesera', 'BGS'),
(4, 'Gatsibo', 'Gatsibo', 'GTB'),
(4, 'Kayonza', 'Kayonza', 'KYZ'),
(4, 'Kirehe', 'Kirehe', 'KRH'),
(4, 'Ngoma', 'Ngoma', 'NGM'),
(4, 'Nyagatare', 'Nyagatare', 'NGT'),
(4, 'Rwamagana', 'Rwamagana', 'RWM');

-- Insert Districts for Western Province
INSERT INTO districts (province_id, name_en, name_rw, code) VALUES
(5, 'Karongi', 'Karongi', 'KRG'),
(5, 'Ngororero', 'Ngororero', 'NGR'),
(5, 'Nyabihu', 'Nyabihu', 'NBH'),
(5, 'Nyamasheke', 'Nyamasheke', 'NMS'),
(5, 'Rubavu', 'Rubavu', 'RBV'),
(5, 'Rusizi', 'Rusizi', 'RSZ'),
(5, 'Rutsiro', 'Rutsiro', 'RTS');

-- Sample Sectors for Gasabo District
INSERT INTO sectors (district_id, name_en, name_rw, code) VALUES
(1, 'Bumbogo', 'Bumbogo', 'BMB'),
(1, 'Gatsata', 'Gatsata', 'GTS'),
(1, 'Gikomero', 'Gikomero', 'GKM'),
(1, 'Gisozi', 'Gisozi', 'GSZ'),
(1, 'Jabana', 'Jabana', 'JBN'),
(1, 'Jali', 'Jali', 'JLI'),
(1, 'Kacyiru', 'Kacyiru', 'KCR'),
(1, 'Kimihurura', 'Kimihurura', 'KMH'),
(1, 'Kimisagara', 'Kimisagara', 'KMS'),
(1, 'Kinyinya', 'Kinyinya', 'KNY'),
(1, 'Ndera', 'Ndera', 'NDR'),
(1, 'Nduba', 'Nduba', 'NDB'),
(1, 'Remera', 'Remera', 'RMR'),
(1, 'Rusororo', 'Rusororo', 'RSR'),
(1, 'Rutunga', 'Rutunga', 'RTG');

-- Sample Sectors for Kicukiro District
INSERT INTO sectors (district_id, name_en, name_rw, code) VALUES
(2, 'Gahanga', 'Gahanga', 'GHG'),
(2, 'Gatenga', 'Gatenga', 'GTG'),
(2, 'Gikondo', 'Gikondo', 'GKD'),
(2, 'Kagarama', 'Kagarama', 'KGR'),
(2, 'Kanombe', 'Kanombe', 'KNB'),
(2, 'Kicukiro', 'Kicukiro', 'KCK'),
(2, 'Niboye', 'Niboye', 'NBY'),
(2, 'Nyarugunga', 'Nyarugunga', 'NRG');

-- Sample Sectors for Nyarugenge District
INSERT INTO sectors (district_id, name_en, name_rw, code) VALUES
(3, 'Gitega', 'Gitega', 'GTG'),
(3, 'Kanyinya', 'Kanyinya', 'KNY'),
(3, 'Kigali', 'Kigali', 'KGL'),
(3, 'Kimisagara', 'Kimisagara', 'KMS'),
(3, 'Mageragere', 'Mageragere', 'MGR'),
(3, 'Muhima', 'Muhima', 'MHM'),
(3, 'Nyakabanda', 'Nyakabanda', 'NKB'),
(3, 'Nyamirambo', 'Nyamirambo', 'NMR'),
(3, 'Nyarugenge', 'Nyarugenge', 'NRG'),
(3, 'Rwezamenyo', 'Rwezamenyo', 'RWZ');

-- Sample Cells for Remera Sector
INSERT INTO cells (sector_id, name_en, name_rw, code) VALUES
(13, 'Gishushu', 'Gishushu', 'GSH'),
(13, 'Kabuga', 'Kabuga', 'KBG'),
(13, 'Rukiri I', 'Rukiri I', 'RK1'),
(13, 'Rukiri II', 'Rukiri II', 'RK2'),
(13, 'Urugwiro', 'Urugwiro', 'URG');

-- Sample Villages for Gishushu Cell
INSERT INTO villages (cell_id, name_en, name_rw, code) VALUES
(1, 'Gishushu I', 'Gishushu I', 'GS1'),
(1, 'Gishushu II', 'Gishushu II', 'GS2'),
(1, 'Gishushu III', 'Gishushu III', 'GS3');

-- Update student_applications table to use location IDs
ALTER TABLE student_applications 
ADD COLUMN province_id INT,
ADD COLUMN district_id INT,
ADD COLUMN sector_id INT,
ADD COLUMN cell_id INT,
ADD COLUMN village_id INT,
ADD FOREIGN KEY (province_id) REFERENCES provinces(id),
ADD FOREIGN KEY (district_id) REFERENCES districts(id),
ADD FOREIGN KEY (sector_id) REFERENCES sectors(id),
ADD FOREIGN KEY (cell_id) REFERENCES cells(id),
ADD FOREIGN KEY (village_id) REFERENCES villages(id);

-- Application validation rules
CREATE TABLE IF NOT EXISTS application_validation_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  field_name VARCHAR(100) NOT NULL,
  rule_type ENUM('required', 'min_length', 'max_length', 'pattern', 'custom') NOT NULL,
  rule_value TEXT,
  error_message_en TEXT,
  error_message_rw TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert validation rules
INSERT INTO application_validation_rules (field_name, rule_type, rule_value, error_message_en, error_message_rw) VALUES
('first_name', 'required', NULL, 'First name is required', 'Izina rya mbere ni ngombwa'),
('first_name', 'min_length', '2', 'First name must be at least 2 characters', 'Izina rya mbere rigomba kuba rifite byibuze inyuguti 2'),
('last_name', 'required', NULL, 'Last name is required', 'Izina rya kabiri ni ngombwa'),
('phone', 'pattern', '^(\+250|0)[7][0-9]{8}$', 'Invalid phone number format', 'Nomero ya telefoni ntabwo iri neza'),
('email', 'pattern', '^[^\s@]+@[^\s@]+\.[^\s@]+$', 'Invalid email format', 'Email ntabwo iri neza'),
('national_id', 'pattern', '^[0-9]{16}$', 'National ID must be 16 digits', 'Indangamuntu igomba kuba ifite imibare 16');

-- Application status tracking
CREATE TABLE IF NOT EXISTS application_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INT,
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Application analytics
CREATE TABLE IF NOT EXISTS application_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  total_applications INT DEFAULT 0,
  pending_applications INT DEFAULT 0,
  approved_applications INT DEFAULT 0,
  rejected_applications INT DEFAULT 0,
  applications_by_province JSON,
  applications_by_trade JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date (date)
);
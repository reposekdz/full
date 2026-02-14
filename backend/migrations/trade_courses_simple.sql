-- Simple Trade Courses Setup
DROP TABLE IF EXISTS trade_courses;

CREATE TABLE trade_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  credits INT DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trade_level (trade_code, level_number)
);

-- BDC Level 3
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('BDC', 3, 'Construct Stone'),('BDC', 3, 'Opening Fixation'),('BDC', 3, 'Fundamental of Building Material'),
('BDC', 3, 'Drawing'),('BDC', 3, 'Soil Based Brick and Block'),('BDC', 3, 'Setting Out'),
('BDC', 3, 'Cement Flooring'),('BDC', 3, 'Plumbing'),('BDC', 3, 'Erect Bricks and Blocks'),
('BDC', 3, 'Basic Knowledge of Domestic Electricity'),('BDC', 3, 'Plastering Structure'),
('BDC', 3, 'Kiswahili'),('BDC', 3, 'Chemistry'),('BDC', 3, 'SHE & Occupation'),
('BDC', 3, 'Math'),('BDC', 3, 'Physics'),('BDC', 3, 'Citizenship'),
('BDC', 3, 'English'),('BDC', 3, 'Francais'),('BDC', 3, 'Computer Skills'),
('BDC', 3, 'Kinyarwanda'),('BDC', 3, 'Entrepreneurship');

-- BDC Level 4
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('BDC', 4, 'Cement Base Block Pavers Work'),('BDC', 4, 'Quantify Construction Work'),
('BDC', 4, 'Performing Tile Work'),('BDC', 4, 'Drawing'),('BDC', 4, 'Perform Concrete Work'),
('BDC', 4, 'AutoCAD'),('BDC', 4, 'Steel Bars'),('BDC', 4, 'Welding'),('BDC', 4, 'Treezer'),
('BDC', 4, 'Kiswahili'),('BDC', 4, 'Chemistry'),('BDC', 4, 'Math'),('BDC', 4, 'Physics'),
('BDC', 4, 'Citizenship'),('BDC', 4, 'English'),('BDC', 4, 'Francais'),
('BDC', 4, 'Computer Skills'),('BDC', 4, 'Kinyarwanda'),('BDC', 4, 'Entrepreneurship');

-- BDC Level 5
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('BDC', 5, 'Construction Site Management'),('BDC', 5, 'Ceiling Work'),('BDC', 5, 'Scaffolding Operation'),
('BDC', 5, 'Ornamental Finishing Work'),('BDC', 5, 'Construct Roof Structure'),('BDC', 5, 'ArchiCAD Software'),
('BDC', 5, 'Acoustic and Thermal Insulation'),('BDC', 5, 'Basic Reinforced Concrete Design'),
('BDC', 5, 'Kiswahili'),('BDC', 5, 'Chemistry'),('BDC', 5, 'Math'),('BDC', 5, 'Physics'),
('BDC', 5, 'Citizenship'),('BDC', 5, 'English'),('BDC', 5, 'Francais'),
('BDC', 5, 'Computer Skills'),('BDC', 5, 'Kinyarwanda'),('BDC', 5, 'Entrepreneurship');

-- SOD Level 3
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('SOD', 3, 'Apply JavaScript'),('SOD', 3, 'Design UI/UX'),('SOD', 3, 'Computer Literacy'),
('SOD', 3, 'Graphic Design'),('SOD', 3, 'Develop Website'),('SOD', 3, 'Conduct Version Control'),
('SOD', 3, 'Develop Game in Vue'),('SOD', 3, 'Analyse Project Requirement'),
('SOD', 3, 'SHE & Occupation'),('SOD', 3, 'Math'),('SOD', 3, 'Physics'),
('SOD', 3, 'Citizenship'),('SOD', 3, 'English'),('SOD', 3, 'Francais'),
('SOD', 3, 'Computer Skills'),('SOD', 3, 'Kinyarwanda'),('SOD', 3, 'Entrepreneurship');

-- SOD Level 4
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('SOD', 4, 'Data Structure and Algorithm'),('SOD', 4, 'Database Development'),('SOD', 4, 'Backend Design'),
('SOD', 4, 'Backend Application'),('SOD', 4, 'Window Server'),('SOD', 4, 'PHP Programming'),
('SOD', 4, 'Networking'),('SOD', 4, 'Computer Skills'),('SOD', 4, 'Math'),('SOD', 4, 'Physics'),
('SOD', 4, 'Citizenship'),('SOD', 4, 'English'),('SOD', 4, 'Francais'),
('SOD', 4, 'Kinyarwanda'),('SOD', 4, 'Entrepreneurship');

-- SOD Level 5
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('SOD', 5, 'Python Programming'),('SOD', 5, 'Apply Quality Assurance'),('SOD', 5, 'React JS'),
('SOD', 5, 'Blockchain'),('SOD', 5, 'Machine Learning'),('SOD', 5, 'Mobile Application'),
('SOD', 5, 'Use ICT at Workplace'),('SOD', 5, 'Apply DevOps Techniques'),
('SOD', 5, 'Develop NoSQL Database'),('SOD', 5, 'Business Organisation'),
('SOD', 5, 'Math'),('SOD', 5, 'Physics'),('SOD', 5, 'Citizenship'),
('SOD', 5, 'English'),('SOD', 5, 'Francais'),('SOD', 5, 'Computer Skills'),
('SOD', 5, 'Kinyarwanda'),('SOD', 5, 'Entrepreneurship');

-- AUT Level 3
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('AUT', 3, 'Cooling System'),('AUT', 3, 'Lubrication System'),('AUT', 3, 'Electricity'),
('AUT', 3, 'Super Charging'),('AUT', 3, 'Bench Work'),('AUT', 3, 'Engine Repair'),
('AUT', 3, 'Welding'),('AUT', 3, 'Fuel Supply System'),('AUT', 3, 'Exhaust'),
('AUT', 3, 'Technical Drawing'),('AUT', 3, 'Wheel and Tyre'),('AUT', 3, 'Car Body'),
('AUT', 3, 'Chemistry'),('AUT', 3, 'SHE & Occupation'),('AUT', 3, 'Math'),('AUT', 3, 'Physics'),
('AUT', 3, 'Citizenship'),('AUT', 3, 'English'),('AUT', 3, 'Francais'),
('AUT', 3, 'Computer Skills'),('AUT', 3, 'Kinyarwanda'),('AUT', 3, 'Entrepreneurship');

-- AUT Level 4
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('AUT', 4, 'Repair Diesel Engine'),('AUT', 4, 'Vehicle Control System'),('AUT', 4, 'Automotive Electricity'),
('AUT', 4, 'Manual Transmission'),('AUT', 4, 'Material'),('AUT', 4, 'Air Condition System'),
('AUT', 4, 'Engine Auxiliary System'),('AUT', 4, 'Digital and Power Electronic'),('AUT', 4, 'Overhaul Design'),
('AUT', 4, 'Chemistry'),('AUT', 4, 'Math'),('AUT', 4, 'Physics'),
('AUT', 4, 'Citizenship'),('AUT', 4, 'English'),('AUT', 4, 'Francais'),
('AUT', 4, 'Computer Skills'),('AUT', 4, 'Kinyarwanda'),('AUT', 4, 'Entrepreneurship');

-- AUT Level 5
INSERT INTO trade_courses (trade_code, level_number, course_name) VALUES
('AUT', 5, 'Apply Hydraulic and Pneumatic System'),('AUT', 5, 'Repair Diesel Injection System'),
('AUT', 5, 'Auto Spare Parts Repair'),('AUT', 5, 'Business Organisation'),('AUT', 5, 'Vehicle Electronic'),
('AUT', 5, 'Engine Auxiliary System'),('AUT', 5, 'Automatic Gear Box'),('AUT', 5, 'Hybrid Vehicle'),
('AUT', 5, 'Chemistry'),('AUT', 5, 'Math'),('AUT', 5, 'Physics'),
('AUT', 5, 'Citizenship'),('AUT', 5, 'English'),('AUT', 5, 'Francais'),
('AUT', 5, 'Computer Skills'),('AUT', 5, 'Kinyarwanda'),('AUT', 5, 'Entrepreneurship');

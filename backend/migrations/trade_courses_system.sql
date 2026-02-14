-- Trade Courses System
-- This creates a comprehensive course management system for all trades and levels

-- Create courses table without foreign key first
CREATE TABLE IF NOT EXISTS trade_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50),
  description TEXT,
  credits INT DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trade_level (trade_code, level_number),
  INDEX idx_course_name (course_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert BDC Level 3 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('BDC', 3, 'Construct Stone', true),
('BDC', 3, 'Opening Fixation', true),
('BDC', 3, 'Fundamental of Building Material', true),
('BDC', 3, 'Drawing', true),
('BDC', 3, 'Soil Based Brick and Block', true),
('BDC', 3, 'Setting Out', true),
('BDC', 3, 'Cement Flooring', true),
('BDC', 3, 'Plumbing', true),
('BDC', 3, 'Erect Bricks and Blocks', true),
('BDC', 3, 'Basic Knowledge of Domestic Electricity', true),
('BDC', 3, 'Plastering Structure', true),
('BDC', 3, 'Kiswahili', true),
('BDC', 3, 'Chemistry', true),
('BDC', 3, 'SHE & Occupation', true),
('BDC', 3, 'Math', true),
('BDC', 3, 'Physics', true),
('BDC', 3, 'Citizenship', true),
('BDC', 3, 'English', true),
('BDC', 3, 'Francais', true),
('BDC', 3, 'Computer Skills', true),
('BDC', 3, 'Kinyarwanda', true),
('BDC', 3, 'Entrepreneurship', true);

-- Insert SOD Level 4 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('SOD', 4, 'Data Structure and Algorithm', true),
('SOD', 4, 'Database Development', true),
('SOD', 4, 'Backend Design', true),
('SOD', 4, 'Backend Application', true),
('SOD', 4, 'Window Server', true),
('SOD', 4, 'PHP Programming', true),
('SOD', 4, 'Networking', true),
('SOD', 4, 'Computer Skills', true),
('SOD', 4, 'Math', true),
('SOD', 4, 'Physics', true),
('SOD', 4, 'Citizenship', true),
('SOD', 4, 'English', true),
('SOD', 4, 'Francais', true),
('SOD', 4, 'Kinyarwanda', true),
('SOD', 4, 'Entrepreneurship', true);

-- Insert BDC Level 5 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('BDC', 5, 'Construction Site Management', true),
('BDC', 5, 'Ceiling Work', true),
('BDC', 5, 'Scaffolding Operation', true),
('BDC', 5, 'Ornamental Finishing Work', true),
('BDC', 5, 'Construct Roof Structure', true),
('BDC', 5, 'ArchiCAD Software', true),
('BDC', 5, 'Acoustic and Thermal Insulation', true),
('BDC', 5, 'Basic Reinforced Concrete Design', true),
('BDC', 5, 'Kiswahili', true),
('BDC', 5, 'Chemistry', true),
('BDC', 5, 'Math', true),
('BDC', 5, 'Physics', true),
('BDC', 5, 'Citizenship', true),
('BDC', 5, 'English', true),
('BDC', 5, 'Francais', true),
('BDC', 5, 'Computer Skills', true),
('BDC', 5, 'Kinyarwanda', true),
('BDC', 5, 'Entrepreneurship', true);

-- Insert SOD Level 3 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('SOD', 3, 'Apply JavaScript', true),
('SOD', 3, 'Design UI/UX', true),
('SOD', 3, 'Computer Literacy', true),
('SOD', 3, 'Graphic Design', true),
('SOD', 3, 'Develop Website', true),
('SOD', 3, 'Conduct Version Control', true),
('SOD', 3, 'Develop Game in Vue', true),
('SOD', 3, 'Analyse Project Requirement', true),
('SOD', 3, 'SHE & Occupation', true),
('SOD', 3, 'Math', true),
('SOD', 3, 'Physics', true),
('SOD', 3, 'Citizenship', true),
('SOD', 3, 'English', true),
('SOD', 3, 'Francais', true),
('SOD', 3, 'Computer Skills', true),
('SOD', 3, 'Kinyarwanda', true),
('SOD', 3, 'Entrepreneurship', true);

-- Insert BDC Level 4 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('BDC', 4, 'Cement Base Block Pavers Work', true),
('BDC', 4, 'Quantify Construction Work', true),
('BDC', 4, 'Performing Tile Work', true),
('BDC', 4, 'Drawing', true),
('BDC', 4, 'Perform Concrete Work', true),
('BDC', 4, 'AutoCAD', true),
('BDC', 4, 'Steel Bars', true),
('BDC', 4, 'Welding', true),
('BDC', 4, 'Treezer', true),
('BDC', 4, 'Kiswahili', true),
('BDC', 4, 'Chemistry', true),
('BDC', 4, 'Math', true),
('BDC', 4, 'Physics', true),
('BDC', 4, 'Citizenship', true),
('BDC', 4, 'English', true),
('BDC', 4, 'Francais', true),
('BDC', 4, 'Computer Skills', true),
('BDC', 4, 'Kinyarwanda', true),
('BDC', 4, 'Entrepreneurship', true);

-- Insert AUT Level 3 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('AUT', 3, 'Cooling System', true),
('AUT', 3, 'Lubrication System', true),
('AUT', 3, 'Electricity', true),
('AUT', 3, 'Super Charging', true),
('AUT', 3, 'Bench Work', true),
('AUT', 3, 'Engine Repair', true),
('AUT', 3, 'Welding', true),
('AUT', 3, 'Fuel Supply System', true),
('AUT', 3, 'Exhaust', true),
('AUT', 3, 'Technical Drawing', true),
('AUT', 3, 'Wheel and Tyre', true),
('AUT', 3, 'Car Body', true),
('AUT', 3, 'Chemistry', true),
('AUT', 3, 'SHE & Occupation', true),
('AUT', 3, 'Math', true),
('AUT', 3, 'Physics', true),
('AUT', 3, 'Citizenship', true),
('AUT', 3, 'English', true),
('AUT', 3, 'Francais', true),
('AUT', 3, 'Computer Skills', true),
('AUT', 3, 'Kinyarwanda', true),
('AUT', 3, 'Entrepreneurship', true);

-- Insert SOD Level 5 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('SOD', 5, 'Python Programming', true),
('SOD', 5, 'Apply Quality Assurance', true),
('SOD', 5, 'React JS', true),
('SOD', 5, 'Blockchain', true),
('SOD', 5, 'Machine Learning', true),
('SOD', 5, 'Mobile Application', true),
('SOD', 5, 'Use ICT at Workplace', true),
('SOD', 5, 'Apply DevOps Techniques', true),
('SOD', 5, 'Develop NoSQL Database', true),
('SOD', 5, 'Business Organisation', true),
('SOD', 5, 'Math', true),
('SOD', 5, 'Physics', true),
('SOD', 5, 'Citizenship', true),
('SOD', 5, 'English', true),
('SOD', 5, 'Francais', true),
('SOD', 5, 'Computer Skills', true),
('SOD', 5, 'Kinyarwanda', true),
('SOD', 5, 'Entrepreneurship', true);

-- Insert AUT Level 4 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('AUT', 4, 'Repair Diesel Engine', true),
('AUT', 4, 'Vehicle Control System', true),
('AUT', 4, 'Automotive Electricity', true),
('AUT', 4, 'Manual Transmission', true),
('AUT', 4, 'Material', true),
('AUT', 4, 'Air Condition System', true),
('AUT', 4, 'Engine Auxiliary System', true),
('AUT', 4, 'Digital and Power Electronic', true),
('AUT', 4, 'Overhaul Design', true),
('AUT', 4, 'Chemistry', true),
('AUT', 4, 'Math', true),
('AUT', 4, 'Physics', true),
('AUT', 4, 'Citizenship', true),
('AUT', 4, 'English', true),
('AUT', 4, 'Francais', true),
('AUT', 4, 'Computer Skills', true),
('AUT', 4, 'Kinyarwanda', true),
('AUT', 4, 'Entrepreneurship', true);

-- Insert AUT Level 5 Courses
INSERT INTO trade_courses (trade_code, level_number, course_name, is_required) VALUES
('AUT', 5, 'Apply Hydraulic and Pneumatic System', true),
('AUT', 5, 'Repair Diesel Injection System', true),
('AUT', 5, 'Auto Spare Parts Repair', true),
('AUT', 5, 'Business Organisation', true),
('AUT', 5, 'Vehicle Electronic', true),
('AUT', 5, 'Engine Auxiliary System', true),
('AUT', 5, 'Automatic Gear Box', true),
('AUT', 5, 'Hybrid Vehicle', true),
('AUT', 5, 'Chemistry', true),
('AUT', 5, 'Math', true),
('AUT', 5, 'Physics', true),
('AUT', 5, 'Citizenship', true),
('AUT', 5, 'English', true),
('AUT', 5, 'Francais', true),
('AUT', 5, 'Computer Skills', true),
('AUT', 5, 'Kinyarwanda', true),
('AUT', 5, 'Entrepreneurship', true);

-- Create view for easy querying (with collation fix)
CREATE OR REPLACE VIEW v_trade_courses AS
SELECT 
  tc.id,
  tc.trade_code,
  t.name as trade_name,
  tc.level_number,
  CONCAT('Level ', tc.level_number) as level_name,
  tc.course_name,
  tc.course_code,
  tc.description,
  tc.credits,
  tc.is_required,
  tc.is_active,
  tc.created_at
FROM trade_courses tc
JOIN trades t ON tc.trade_code COLLATE utf8mb4_general_ci = t.code
WHERE tc.is_active = true
ORDER BY t.name, tc.level_number, tc.course_name;

-- Create summary view (with collation fix)
CREATE OR REPLACE VIEW v_trade_course_summary AS
SELECT 
  t.code as trade_code,
  t.name as trade_name,
  tc.level_number,
  CONCAT('Level ', tc.level_number) as level_name,
  COUNT(*) as total_courses,
  SUM(CASE WHEN tc.is_required THEN 1 ELSE 0 END) as required_courses,
  SUM(tc.credits) as total_credits
FROM trades t
LEFT JOIN trade_courses tc ON t.code = tc.trade_code COLLATE utf8mb4_general_ci AND tc.is_active = true
GROUP BY t.code, t.name, tc.level_number
ORDER BY t.name, tc.level_number;

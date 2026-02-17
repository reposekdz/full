-- ========================================
-- GLOBAL STUDENT SHEETS - COMPLETE DATABASE SCHEMA
-- Supports all roles: Accountant, DOS, DOD, Teacher, Headmaster, etc.
-- Features: Dynamic columns, marks, inline editing, Excel-like grid
-- ========================================

-- Main Global Student Sheets Table
CREATE TABLE IF NOT EXISTS global_student_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  
  -- Basic Student Info (Copied for quick access)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  student_code VARCHAR(50) UNIQUE,
  class_name VARCHAR(100),
  trade_code VARCHAR(20),
  trade_name VARCHAR(100),
  level_number INT,
  level_suffix VARCHAR(10),
  
  -- Academic Metrics (Auto-calculated)
  total_marks DECIMAL(8,2) DEFAULT 0.00,
  average_marks DECIMAL(5,2) DEFAULT 0.00,
  attendance_percentage DECIMAL(5,2) DEFAULT 100.00,
  conduct_score DECIMAL(5,2) DEFAULT 100.00,
  
  -- Financial Info (Accountant)
  total_fees DECIMAL(12,2) DEFAULT 0.00,
  paid_amount DECIMAL(12,2) DEFAULT 0.00,
  balance DECIMAL(12,2) GENERATED ALWAYS AS (total_fees - paid_amount) STORED,
  payment_status ENUM('paid', 'partial', 'unpaid', 'overdue') DEFAULT 'unpaid',
  
  -- Status
  status ENUM('active', 'inactive', 'graduated', 'transferred', 'suspended') DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_student (student_id),
  INDEX idx_class_level (trade_code, level_number),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Columns Definition (Role-specific)
CREATE TABLE IF NOT EXISTS student_sheet_custom_columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Column Definition
  column_name VARCHAR(100) NOT NULL,
  column_label VARCHAR(255) NOT NULL,
  column_type ENUM('text', 'number', 'date', 'select', 'textarea', 'calculated', 'mark') NOT NULL,
  
  -- For Select Type
  select_options JSON DEFAULT NULL,
  
  -- For Calculated Type
  calculation_formula TEXT DEFAULT NULL,
  
  -- Metadata for Mark Columns
  metadata JSON DEFAULT NULL, -- { max_marks: 100, course_id: 5, course_name: "Math", trade_code: "SOD", level_number: 3 }
  
  -- Role-Based Access Control
  created_by_role VARCHAR(50),
  visible_to_roles JSON NOT NULL, -- ["teacher", "admin", "dos"]
  editable_by_roles JSON NOT NULL, -- ["teacher"]
  
  -- Scope
  scope ENUM('global', 'trade', 'level', 'class') DEFAULT 'global',
  scope_value VARCHAR(100) DEFAULT NULL, -- e.g., "SOD" for trade, "3" for level
  
  -- Display
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active (is_active),
  INDEX idx_scope (scope, scope_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Column Values (Per Student)
CREATE TABLE IF NOT EXISTS student_sheet_custom_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  sheet_id INT NOT NULL,
  student_id INT NOT NULL,
  column_id INT NOT NULL,
  
  -- Value Storage (Type-specific)
  value_text TEXT DEFAULT NULL,
  value_number DECIMAL(12,2) DEFAULT NULL,
  value_date DATE DEFAULT NULL,
  
  -- Tracking
  updated_by_role VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_value (sheet_id, column_id),
  INDEX idx_student_column (student_id, column_id),
  
  FOREIGN KEY (sheet_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (column_id) REFERENCES student_sheet_custom_columns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mark Columns (Specialized for Teachers)
CREATE TABLE IF NOT EXISTS student_marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  trade_code VARCHAR(20),
  level_number INT,
  level_suffix VARCHAR(10),
  
  -- Mark Details
  mark_obtained DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((mark_obtained / max_marks) * 100) STORED,
  
  -- Assessment Type
  assessment_type ENUM('quiz', 'midterm', 'final', 'assignment', 'project', 'practical') DEFAULT 'quiz',
  
  -- Tracking
  entered_by INT,
  entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_student_course (student_id, course_id),
  INDEX idx_trade_level (trade_code, level_number),
  
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role Permissions for Global Sheets
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  role_name VARCHAR(50) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  
  -- Permission Flags
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT true,
  can_add_columns BOOLEAN DEFAULT false,
  can_bulk_edit BOOLEAN DEFAULT false,
  
  UNIQUE KEY unique_role_permission (role_name, permission_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Permissions
INSERT INTO role_permissions (role_name, permission_name, can_view, can_edit, can_delete, can_export, can_add_columns, can_bulk_edit) VALUES
('teacher', 'global_student_sheets', true, true, false, true, true, false),
('accountant', 'global_student_sheets', true, true, false, true, true, true),
('dos', 'global_student_sheets', true, true, false, true, true, true),
('dod', 'global_student_sheets', true, true, false, true, true, true),
('headmaster', 'global_student_sheets', true, true, true, true, true, true),
('admin', 'global_student_sheets', true, true, true, true, true, true),
('advisor', 'global_student_sheets', true, true, false, true, true, false),
('stock_manager', 'global_student_sheets', true, true, false, true, false, false)
ON DUPLICATE KEY UPDATE 
  can_view = VALUES(can_view),
  can_edit = VALUES(can_edit),
  can_delete = VALUES(can_delete),
  can_export = VALUES(can_export),
  can_add_columns = VALUES(can_add_columns),
  can_bulk_edit = VALUES(can_bulk_edit);

-- Pre-populate Common Columns for Each Role
INSERT INTO student_sheet_custom_columns 
(column_name, column_label, column_type, created_by_role, visible_to_roles, editable_by_roles, scope) VALUES
-- Accountant Columns
('paid_amount', 'Paid Amount', 'number', 'accountant', '["accountant", "admin", "headmaster"]', '["accountant", "admin"]', 'global'),
('payment_date', 'Last Payment Date', 'date', 'accountant', '["accountant", "admin", "headmaster"]', '["accountant"]', 'global'),
('fee_category', 'Fee Category', 'select', 'accountant', '["accountant", "admin"]', '["accountant"]', 'global'),

-- DOS (Director of Studies) Columns
('academic_performance', 'Academic Performance', 'number', 'dos', '["dos", "admin", "headmaster", "teacher"]', '["dos", "admin"]', 'global'),
('class_rank', 'Class Rank', 'number', 'dos', '["dos", "admin", "headmaster"]', '["dos"]', 'global'),
('academic_status', 'Academic Status', 'select', 'dos', '["dos", "admin", "headmaster"]', '["dos", "admin"]', 'global'),

-- DOD (Director of Discipline) Columns
('behavior_score', 'Behavior Score', 'number', 'dod', '["dod", "admin", "headmaster"]', '["dod", "admin"]', 'global'),
('discipline_incidents', 'Discipline Incidents', 'number', 'dod', '["dod", "admin", "headmaster"]', '["dod"]', 'global'),
('conduct_grade', 'Conduct Grade', 'select', 'dod', '["dod", "admin", "headmaster", "teacher"]', '["dod"]', 'global'),

-- Headmaster Columns
('recommendation', 'Principal Recommendation', 'textarea', 'headmaster', '["headmaster", "admin"]', '["headmaster", "admin"]', 'global'),
('awards', 'Awards & Recognition', 'text', 'headmaster', '["headmaster", "admin", "teacher"]', '["headmaster", "admin"]', 'global'),
('leadership_potential', 'Leadership Potential', 'select', 'headmaster', '["headmaster", "admin", "dos"]', '["headmaster"]', 'global'),

-- Advisor Columns
('counseling_notes', 'Counseling Notes', 'textarea', 'advisor', '["advisor", "admin", "headmaster"]', '["advisor"]', 'global'),
('risk_level', 'Risk Level', 'select', 'advisor', '["advisor", "admin", "headmaster"]', '["advisor", "admin"]', 'global'),
('next_meeting', 'Next Meeting', 'date', 'advisor', '["advisor", "admin"]', '["advisor"]', 'global')
ON DUPLICATE KEY UPDATE column_label = VALUES(column_label);

-- Update select options for dropdown columns
UPDATE student_sheet_custom_columns SET select_options = '["Tuition", "Exam", "Uniform", "Transport", "Hostel"]' WHERE column_name = 'fee_category';
UPDATE student_sheet_custom_columns SET select_options = '["Excellent", "Good", "Average", "Poor"]' WHERE column_name = 'academic_status';
UPDATE student_sheet_custom_columns SET select_options = '["A", "B", "C", "D", "F"]' WHERE column_name = 'conduct_grade';
UPDATE student_sheet_custom_columns SET select_options = '["High", "Medium", "Low"]' WHERE column_name = 'leadership_potential';
UPDATE student_sheet_custom_columns SET select_options = '["Low", "Medium", "High", "Critical"]' WHERE column_name = 'risk_level';

-- View for Global Student Sheets (Combines all data)
CREATE OR REPLACE VIEW v_global_student_sheets AS
SELECT 
  gss.*,
  u.email as student_email,
  u.phone as student_phone,
  -- Aggregate custom values
  GROUP_CONCAT(DISTINCT CONCAT(sscv.column_id, ':', COALESCE(sscv.value_text, ''), ':', COALESCE(sscv.value_number, '')) SEPARATOR '|') as custom_values,
  -- Aggregate marks
  SUM(sm.mark_obtained) as calculated_total_marks,
  AVG(sm.percentage) as calculated_average
FROM global_student_sheets gss
LEFT JOIN users u ON gss.student_id = u.id
LEFT JOIN student_sheet_custom_values sscv ON gss.id = sscv.sheet_id
LEFT JOIN student_marks sm ON gss.student_id = sm.student_id
GROUP BY gss.id;

-- Stored Procedure: Update calculations for a student
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS update_all_calculations(IN p_sheet_id INT)
BEGIN
  DECLARE v_student_id INT;
  DECLARE v_total DECIMAL(8,2);
  DECLARE v_avg DECIMAL(5,2);
  
  -- Get student_id
  SELECT student_id INTO v_student_id FROM global_student_sheets WHERE id = p_sheet_id;
  
  -- Calculate totals from marks
  SELECT 
    COALESCE(SUM(mark_obtained), 0),
    COALESCE(AVG(percentage), 0)
  INTO v_total, v_avg
  FROM student_marks
  WHERE student_id = v_student_id;
  
  -- Update global sheet
  UPDATE global_student_sheets
  SET 
    total_marks = v_total,
    average_marks = v_avg,
    updated_at = NOW()
  WHERE id = p_sheet_id;
END //
DELIMITER ;

-- Indexes for performance
ALTER TABLE global_student_sheets ADD INDEX idx_search (first_name, last_name, student_code);
ALTER TABLE student_sheet_custom_values ADD INDEX idx_value_lookup (column_id, value_number);
ALTER TABLE student_marks ADD INDEX idx_student_marks (student_id, course_id, level_number);

-- ========================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ========================================
-- Uncomment to insert sample data

/*
INSERT INTO global_student_sheets 
(student_id, first_name, last_name, student_code, class_name, trade_code, trade_name, level_number, level_suffix, status) 
VALUES 
(1, 'Jean', 'Uwase', 'SOD001', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active'),
(2, 'Marie', 'Mutoni', 'BDC002', 'BDC 2B', 'BDC', 'Building Construction', 2, 'B', 'active'),
(3, 'Paul', 'Nkunda', 'AUT003', 'AUT 1C', 'AUT', 'Automotive', 1, 'C', 'active');
*/

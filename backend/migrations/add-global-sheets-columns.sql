-- Migration: Add missing columns to global_student_sheets
-- Run this SQL to add columns needed for parent linking

-- Add missing columns if they don't exist (MySQL syntax)
ALTER TABLE global_student_sheets ADD COLUMN student_code VARCHAR(50) DEFAULT NULL AFTER id;
ALTER TABLE global_student_sheets ADD COLUMN trade_name VARCHAR(200) DEFAULT NULL AFTER trade_code;
ALTER TABLE global_student_sheets ADD COLUMN class_name VARCHAR(200) DEFAULT NULL AFTER level_suffix;
ALTER TABLE global_student_sheets ADD COLUMN gpa DECIMAL(3,2) DEFAULT 0 AFTER class_name;
ALTER TABLE global_student_sheets ADD COLUMN attendance_percentage DECIMAL(5,2) DEFAULT 0 AFTER gpa;
ALTER TABLE global_student_sheets ADD COLUMN conduct_score DECIMAL(5,2) DEFAULT 40 AFTER attendance_percentage;
ALTER TABLE global_student_sheets ADD COLUMN conduct_grade VARCHAR(20) DEFAULT 'Good' AFTER conduct_score;
ALTER TABLE global_student_sheets ADD COLUMN academic_year VARCHAR(20) DEFAULT '2024-2025' AFTER conduct_grade;
ALTER TABLE global_student_sheets ADD COLUMN profile_image VARCHAR(500) DEFAULT NULL AFTER academic_year;
ALTER TABLE global_student_sheets ADD COLUMN emergency_contact VARCHAR(50) DEFAULT NULL AFTER profile_image;

-- Update existing records to populate trade_name from trade_code if empty
UPDATE global_student_sheets 
SET trade_name = CASE 
    WHEN trade_code = 'BDC' THEN 'Building and Construction'
    WHEN trade_code = 'SOD' THEN 'Software Development'
    WHEN trade_code = 'AUTO' THEN 'Automobile Technology'
    WHEN trade_code = 'ENG' THEN 'Engineering'
    WHEN trade_code = 'HTL' THEN 'Hotel and Tourism'
    ELSE trade_code
END
WHERE (trade_name IS NULL OR trade_name = '') AND trade_code IS NOT NULL;

-- Update student_code from student_id if empty
UPDATE global_student_sheets 
SET student_code = student_id 
WHERE (student_code IS NULL OR student_code = '') AND student_id IS NOT NULL;

-- Set default academic year
UPDATE global_student_sheets 
SET academic_year = '2024-2025' 
WHERE academic_year IS NULL OR academic_year = '';

SELECT 'Migration complete!' as message;

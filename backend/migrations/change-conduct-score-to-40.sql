-- Change Conduct Score from 100 to 40
-- This updates the default conduct score system

-- Add points_deducted column if not exists
ALTER TABLE student_conduct_records 
ADD COLUMN IF NOT EXISTS points_deducted INT DEFAULT 0 COMMENT 'Points deducted from conduct score';

-- Update global_student_sheets table
ALTER TABLE global_student_sheets 
MODIFY COLUMN conduct_score INT DEFAULT 40 COMMENT 'Conduct score out of 40';

-- Update student_conduct_tracking table if exists
ALTER TABLE student_conduct_tracking 
MODIFY COLUMN final_score INT DEFAULT 40 COMMENT 'Final conduct score out of 40';

-- Update existing records that have 100 to 40 (only if they are default/unchanged)
UPDATE global_student_sheets 
SET conduct_score = 40 
WHERE conduct_score = 100 AND total_incidents = 0;

-- Update conduct tracking
UPDATE student_conduct_tracking 
SET final_score = 40 
WHERE final_score = 100 AND total_incidents = 0;

-- Update points_deducted for existing records based on severity (40-point scale)
UPDATE student_conduct_records 
SET points_deducted = CASE 
  WHEN severity = 'severe' THEN 4
  WHEN severity = 'major' THEN 3
  WHEN severity = 'moderate' THEN 2
  WHEN severity = 'minor' THEN 1
  ELSE 2
END
WHERE points_deducted = 0 OR points_deducted IS NULL;

-- Update conduct grade thresholds for 40-point scale
-- A: 36-40, B: 32-35, C: 28-31, D: 24-27, F: 0-23
UPDATE global_student_sheets 
SET conduct_grade = CASE 
  WHEN conduct_score >= 36 THEN 'A'
  WHEN conduct_score >= 32 THEN 'B'
  WHEN conduct_score >= 28 THEN 'C'
  WHEN conduct_score >= 24 THEN 'D'
  ELSE 'F'
END;

SELECT '✅ Conduct score changed from 100 to 40!' as Status;
SELECT 'New scale: A=36-40, B=32-35, C=28-31, D=24-27, F=0-23' as Info;
SELECT 'Points deduction: Minor=1, Moderate=2, Major=3, Severe=4' as Deductions;

-- Add points_deducted column to student_conduct_records
-- This allows tracking how many points were deducted for each incident

ALTER TABLE student_conduct_records 
ADD COLUMN IF NOT EXISTS points_deducted INT DEFAULT 0 COMMENT 'Points deducted from conduct score';

-- Update existing records based on severity (for 40-point scale)
UPDATE student_conduct_records 
SET points_deducted = CASE 
  WHEN severity = 'severe' THEN 4
  WHEN severity = 'major' THEN 3
  WHEN severity = 'moderate' THEN 2
  WHEN severity = 'minor' THEN 1
  ELSE 2
END
WHERE points_deducted = 0 OR points_deducted IS NULL;

SELECT '✅ Added points_deducted column to student_conduct_records!' as Status;
SELECT 'Points can now be restored when conduct is removed' as Info;

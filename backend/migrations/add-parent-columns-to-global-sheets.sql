-- Add Parent Information Columns to Global Student Sheets
-- This allows all staff to see linked parent information directly

USE school_management;

-- Add parent columns to global_student_sheets
ALTER TABLE global_student_sheets
ADD COLUMN IF NOT EXISTS parent_names TEXT COMMENT 'Comma-separated list of linked parent names',
ADD COLUMN IF NOT EXISTS parent_phones TEXT COMMENT 'Comma-separated list of linked parent phones',
ADD COLUMN IF NOT EXISTS parent_count INT DEFAULT 0 COMMENT 'Number of linked parents',
ADD COLUMN IF NOT EXISTS last_parent_notification TIMESTAMP NULL COMMENT 'Last time parents were notified';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_parent_count ON global_student_sheets(parent_count);

-- Create view for staff to see students with parent info
CREATE OR REPLACE VIEW students_with_parents AS
SELECT 
  gss.*,
  GROUP_CONCAT(DISTINCT CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as linked_parent_names,
  GROUP_CONCAT(DISTINCT u.phone SEPARATOR ', ') as linked_parent_phones,
  COUNT(DISTINCT psl.parent_id) as total_linked_parents
FROM global_student_sheets gss
LEFT JOIN parent_student_links psl ON gss.id = psl.student_id AND psl.status = 'approved'
LEFT JOIN users u ON psl.parent_id = u.id
GROUP BY gss.id;

SELECT 'Parent columns added to global_student_sheets successfully!' as message;

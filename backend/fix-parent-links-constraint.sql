-- Fix Parent Student Links Foreign Key Constraint
-- The issue: student_id references users.id but we're using global_student_sheets.id

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE `parent_student_links` 
DROP FOREIGN KEY IF EXISTS `parent_student_links_ibfk_2`;

-- Step 2: Recreate the table without the problematic foreign key
-- This allows student_id to reference global_student_sheets.id instead
ALTER TABLE `parent_student_links`
MODIFY COLUMN `student_id` INT NOT NULL COMMENT 'References global_student_sheets.id';

-- Step 3: Add proper index for performance
ALTER TABLE `parent_student_links`
ADD INDEX IF NOT EXISTS `idx_student_id` (`student_id`);

-- Step 4: Clean up any invalid links (optional safety check)
DELETE psl FROM `parent_student_links` psl
LEFT JOIN `global_student_sheets` gss ON psl.student_id = gss.id
WHERE gss.id IS NULL;

-- Success message
SELECT 'Parent Links constraint fixed! Now uses global_student_sheets.id' AS Status;

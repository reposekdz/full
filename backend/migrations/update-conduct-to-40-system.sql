-- =====================================================
-- UPDATE CONDUCT SCORING SYSTEM TO 40 POINTS
-- Garden TVET School Management System
-- =====================================================

-- Step 1: Update default conduct score to 40 for all active students
UPDATE global_student_sheets 
SET conduct_score = 40 
WHERE conduct_score IS NULL OR conduct_score = 0 OR conduct_score = 100;

-- Step 2: Scale existing scores from 100 to 40 (if any remain)
UPDATE global_student_sheets 
SET conduct_score = ROUND((conduct_score / 100) * 40)
WHERE conduct_score > 40 AND conduct_score <= 100;

-- Step 3: Ensure no scores exceed 40
UPDATE global_student_sheets 
SET conduct_score = 40 
WHERE conduct_score > 40;

-- Step 4: Update conduct grade calculation based on 40-point system
-- A: 36-40, B: 32-35, C: 28-31, D: 24-27, F: 0-23
UPDATE global_student_sheets 
SET conduct_grade = CASE
    WHEN conduct_score >= 36 THEN 'A'
    WHEN conduct_score >= 32 THEN 'B'
    WHEN conduct_score >= 28 THEN 'C'
    WHEN conduct_score >= 24 THEN 'D'
    ELSE 'F'
END
WHERE conduct_score IS NOT NULL;

-- Step 5: Create or replace trigger for automatic conduct score calculation
DROP TRIGGER IF EXISTS update_conduct_score_on_record;

DELIMITER $$

CREATE TRIGGER update_conduct_score_on_record
AFTER INSERT ON student_conduct_records
FOR EACH ROW
BEGIN
    DECLARE current_score INT DEFAULT 40;
    DECLARE points_to_deduct INT DEFAULT 0;
    
    -- Get current conduct score
    SELECT conduct_score INTO current_score 
    FROM global_student_sheets 
    WHERE id = NEW.student_id;
    
    -- Set default if null
    IF current_score IS NULL THEN
        SET current_score = 40;
    END IF;
    
    -- Calculate points to deduct based on severity
    SET points_to_deduct = CASE NEW.severity
        WHEN 'minor' THEN 1
        WHEN 'moderate' THEN 2
        WHEN 'major' THEN 3
        WHEN 'severe' THEN 4
        ELSE 2
    END;
    
    -- Update conduct score (minimum 0)
    UPDATE global_student_sheets 
    SET 
        conduct_score = GREATEST(0, current_score - points_to_deduct),
        conduct_grade = CASE
            WHEN GREATEST(0, current_score - points_to_deduct) >= 36 THEN 'A'
            WHEN GREATEST(0, current_score - points_to_deduct) >= 32 THEN 'B'
            WHEN GREATEST(0, current_score - points_to_deduct) >= 28 THEN 'C'
            WHEN GREATEST(0, current_score - points_to_deduct) >= 24 THEN 'D'
            ELSE 'F'
        END
    WHERE id = NEW.student_id;
END$$

DELIMITER ;

-- Step 6: Add index for performance
CREATE INDEX IF NOT EXISTS idx_conduct_score ON global_student_sheets(conduct_score);
CREATE INDEX IF NOT EXISTS idx_conduct_grade ON global_student_sheets(conduct_grade);

-- Step 7: Create view for conduct statistics
CREATE OR REPLACE VIEW conduct_statistics AS
SELECT 
    COUNT(*) as total_students,
    SUM(CASE WHEN conduct_score >= 36 THEN 1 ELSE 0 END) as grade_a_count,
    SUM(CASE WHEN conduct_score >= 32 AND conduct_score < 36 THEN 1 ELSE 0 END) as grade_b_count,
    SUM(CASE WHEN conduct_score >= 28 AND conduct_score < 32 THEN 1 ELSE 0 END) as grade_c_count,
    SUM(CASE WHEN conduct_score >= 24 AND conduct_score < 28 THEN 1 ELSE 0 END) as grade_d_count,
    SUM(CASE WHEN conduct_score < 24 THEN 1 ELSE 0 END) as grade_f_count,
    ROUND(AVG(conduct_score), 2) as average_conduct_score,
    MAX(conduct_score) as highest_score,
    MIN(conduct_score) as lowest_score
FROM global_student_sheets
WHERE status = 'active';

-- Step 8: Log the migration
INSERT INTO system_logs (log_type, message, created_at)
VALUES ('migration', 'Conduct scoring system updated to 40-point scale', NOW());

-- Verification Query
SELECT 
    'Migration Complete' as status,
    COUNT(*) as total_students,
    ROUND(AVG(conduct_score), 2) as avg_score,
    MIN(conduct_score) as min_score,
    MAX(conduct_score) as max_score,
    SUM(CASE WHEN conduct_score > 40 THEN 1 ELSE 0 END) as scores_over_40
FROM global_student_sheets
WHERE status = 'active';

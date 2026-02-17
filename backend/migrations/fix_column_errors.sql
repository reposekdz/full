-- Fix Database Schema Column Errors
-- This migration adds missing columns referenced in the application

-- Fix student_profiles table - add admission_number if missing
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS admission_number VARCHAR(50) UNIQUE AFTER user_id;

-- Fix trades table - add trade_name if missing  
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS trade_name VARCHAR(100) AFTER trade_code;

-- Update existing trades to have trade_name from name column if exists
UPDATE trades SET trade_name = name WHERE trade_name IS NULL AND name IS NOT NULL;

-- Fix academic_years table - add is_current if missing
ALTER TABLE academic_years 
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE AFTER end_date;

-- Set one academic year as current if none exists
UPDATE academic_years SET is_current = TRUE 
WHERE id = (SELECT id FROM (SELECT id FROM academic_years ORDER BY start_date DESC LIMIT 1) AS temp)
AND NOT EXISTS (SELECT 1 FROM academic_years WHERE is_current = TRUE);

-- Fix fee_payments table - add amount column if missing
ALTER TABLE fee_payments 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER student_id;

-- Fix users table - remove trade and level columns (should be in enrollments)
-- These columns should NOT be in users table, data should come from enrollments
-- If they exist, we'll keep them for backward compatibility but queries should use enrollments

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_admission ON student_profiles(admission_number);
CREATE INDEX IF NOT EXISTS idx_trades_name ON trades(trade_name);
CREATE INDEX IF NOT EXISTS idx_academic_years_current ON academic_years(is_current);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_status ON fee_payments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_trade ON enrollments(trade_code);

-- Ensure enrollments table has correct structure
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS trade_code VARCHAR(20) AFTER student_id,
ADD COLUMN IF NOT EXISTS level_number INT AFTER trade_code,
ADD COLUMN IF NOT EXISTS level_suffix VARCHAR(10) AFTER level_number,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' AFTER level_suffix;

-- Add foreign key constraints if they don't exist
-- Note: MySQL doesn't have IF NOT EXISTS for constraints, so we'll use a procedure

DELIMITER $$

CREATE PROCEDURE AddConstraintsIfNotExist()
BEGIN
    -- Check and add foreign key for enrollments -> trades
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'enrollments'
        AND CONSTRAINT_NAME = 'fk_enrollments_trade'
    ) THEN
        ALTER TABLE enrollments 
        ADD CONSTRAINT fk_enrollments_trade 
        FOREIGN KEY (trade_code) REFERENCES trades(trade_code) ON DELETE SET NULL;
    END IF;
    
    -- Check and add foreign key for enrollments -> users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'enrollments'
        AND CONSTRAINT_NAME = 'fk_enrollments_student'
    ) THEN
        ALTER TABLE enrollments 
        ADD CONSTRAINT fk_enrollments_student 
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END$$

DELIMITER ;

CALL AddConstraintsIfNotExist();
DROP PROCEDURE AddConstraintsIfNotExist;

-- Verify the changes
SELECT 'Schema fixes applied successfully' AS status;

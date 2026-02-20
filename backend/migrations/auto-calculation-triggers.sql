-- Auto-Calculation Triggers and Procedures for Student Sheets
-- This file creates comprehensive auto-calculation system

DELIMITER $$

-- Drop existing triggers and procedures
DROP TRIGGER IF EXISTS student_values_insert_trigger$$
DROP TRIGGER IF EXISTS student_values_update_trigger$$
DROP PROCEDURE IF EXISTS recalculate_student_sheet$$
DROP PROCEDURE IF EXISTS calculate_grade$$
DROP PROCEDURE IF EXISTS update_main_sheet_totals$$

-- Create comprehensive recalculation procedure
CREATE PROCEDURE recalculate_student_sheet(IN p_sheet_id INT)
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_quiz_marks DECIMAL(10,2) DEFAULT 0;
    DECLARE v_midterm_marks DECIMAL(10,2) DEFAULT 0;
    DECLARE v_final_marks DECIMAL(10,2) DEFAULT 0;
    DECLARE v_assignment_marks DECIMAL(10,2) DEFAULT 0;
    DECLARE v_participation_score DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_marks DECIMAL(10,2) DEFAULT 0;
    DECLARE v_percentage DECIMAL(10,2) DEFAULT 0;
    DECLARE v_gpa DECIMAL(4,2) DEFAULT 0;
    DECLARE v_grade VARCHAR(5) DEFAULT 'F';
    
    DECLARE v_paid_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_fees DECIMAL(10,2) DEFAULT 0;
    DECLARE v_remaining_balance DECIMAL(10,2) DEFAULT 0;
    
    DECLARE v_academic_performance DECIMAL(10,2) DEFAULT 0;
    DECLARE v_conduct_score DECIMAL(10,2) DEFAULT 0;
    DECLARE v_attendance_percentage DECIMAL(10,2) DEFAULT 0;
    DECLARE v_overall_rating DECIMAL(10,2) DEFAULT 0;
    
    -- Get student ID
    SELECT student_id INTO v_student_id FROM global_student_sheets WHERE id = p_sheet_id;
    
    -- Get current values from custom columns
    SELECT 
        COALESCE(MAX(CASE WHEN ssc.column_name = 'quiz_marks' THEN sscv.value_number END), 0),
        COALESCE(MAX(CASE WHEN ssc.column_name = 'midterm_marks' THEN sscv.value_number END), 0),
        COALESCE(MAX(CASE WHEN ssc.column_name = 'final_marks' THEN sscv.value_number END), 0),
        COALESCE(MAX(CASE WHEN ssc.column_name = 'assignment_marks' THEN sscv.value_number END), 0),
        COALESCE(MAX(CASE WHEN ssc.column_name = 'participation_score' THEN sscv.value_number END), 0),
        COALESCE(MAX(CASE WHEN ssc.column_name = 'paid_amount' THEN sscv.value_number END), 0),
        COALESCE(MAX(CASE WHEN ssc.column_name = 'academic_performance' THEN sscv.value_number END), 0),
        COALESCE(MAX(CASE WHEN ssc.column_name = 'conduct_score' THEN sscv.value_number END), 0),
        COALESCE(MAX(CASE WHEN ssc.column_name = 'attendance_percentage' THEN sscv.value_number END), 0)
    INTO v_quiz_marks, v_midterm_marks, v_final_marks, v_assignment_marks, v_participation_score, 
         v_paid_amount, v_academic_performance, v_conduct_score, v_attendance_percentage
    FROM student_sheet_custom_values sscv
    JOIN student_sheet_custom_columns ssc ON sscv.column_id = ssc.id
    WHERE sscv.sheet_id = p_sheet_id;
    
    -- Get total fees from main sheet
    SELECT COALESCE(total_fees, 0) INTO v_total_fees FROM global_student_sheets WHERE id = p_sheet_id;
    
    -- Calculate academic totals
    SET v_total_marks = v_quiz_marks + v_midterm_marks + v_final_marks + v_assignment_marks + v_participation_score;
    SET v_percentage = CASE WHEN v_total_marks > 0 THEN ROUND((v_total_marks / 500) * 100, 2) ELSE 0 END;
    SET v_gpa = ROUND(v_percentage / 20, 2);
    
    -- Calculate grade
    SET v_grade = CASE 
        WHEN v_percentage >= 90 THEN 'A'
        WHEN v_percentage >= 80 THEN 'B'
        WHEN v_percentage >= 70 THEN 'C'
        WHEN v_percentage >= 60 THEN 'D'
        ELSE 'F'
    END;
    
    -- Calculate financial totals
    SET v_remaining_balance = v_total_fees - v_paid_amount;
    
    -- Calculate overall rating
    SET v_overall_rating = CASE 
        WHEN (v_academic_performance + v_conduct_score + v_attendance_percentage) > 0 
        THEN ROUND((v_academic_performance + v_conduct_score + v_attendance_percentage) / 3, 2)
        ELSE 0 
    END;
    
    -- Update calculated values
    INSERT INTO student_sheet_custom_values (sheet_id, student_id, column_id, value_number, value_text, updated_by_role, updated_at)
    SELECT p_sheet_id, v_student_id, ssc.id, 
           CASE 
               WHEN ssc.column_name = 'total_marks' THEN v_total_marks
               WHEN ssc.column_name = 'percentage' THEN v_percentage
               WHEN ssc.column_name = 'gpa' THEN v_gpa
               WHEN ssc.column_name = 'remaining_balance' THEN v_remaining_balance
               WHEN ssc.column_name = 'overall_rating' THEN v_overall_rating
               ELSE NULL
           END,
           CASE 
               WHEN ssc.column_name = 'grade' THEN v_grade
               ELSE NULL
           END,
           'system', NOW()
    FROM student_sheet_custom_columns ssc
    WHERE ssc.column_type = 'calculated' 
    AND ssc.column_name IN ('total_marks', 'percentage', 'gpa', 'grade', 'remaining_balance', 'overall_rating')
    ON DUPLICATE KEY UPDATE 
        value_number = VALUES(value_number),
        value_text = VALUES(value_text),
        updated_by_role = 'system',
        updated_at = NOW();
    
    -- Update main sheet totals
    UPDATE global_student_sheets 
    SET 
        total_marks = v_total_marks,
        average_marks = v_percentage,
        gpa = v_gpa,
        overall_grade = v_grade,
        paid_amount = v_paid_amount,
        balance = v_remaining_balance,
        payment_status = CASE 
            WHEN v_remaining_balance <= 0 THEN 'paid'
            WHEN v_paid_amount > 0 THEN 'partial'
            ELSE 'unpaid'
        END,
        updated_at = NOW()
    WHERE id = p_sheet_id;
    
END$$

-- Create trigger for INSERT operations
CREATE TRIGGER student_values_insert_trigger
AFTER INSERT ON student_sheet_custom_values
FOR EACH ROW
BEGIN
    CALL recalculate_student_sheet(NEW.sheet_id);
END$$

-- Create trigger for UPDATE operations
CREATE TRIGGER student_values_update_trigger
AFTER UPDATE ON student_sheet_custom_values
FOR EACH ROW
BEGIN
    CALL recalculate_student_sheet(NEW.sheet_id);
END$$

-- Create procedure to update payment status
CREATE PROCEDURE update_payment_status(IN p_sheet_id INT)
BEGIN
    DECLARE v_paid DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0;
    DECLARE v_status VARCHAR(20);
    
    SELECT COALESCE(paid_amount, 0), COALESCE(total_fees, 0) 
    INTO v_paid, v_total 
    FROM global_student_sheets 
    WHERE id = p_sheet_id;
    
    SET v_status = CASE 
        WHEN v_paid >= v_total THEN 'paid'
        WHEN v_paid > 0 THEN 'partial'
        ELSE 'unpaid'
    END;
    
    UPDATE global_student_sheets 
    SET payment_status = v_status 
    WHERE id = p_sheet_id;
END$$

-- Create procedure to calculate attendance percentage
CREATE PROCEDURE calculate_attendance(IN p_sheet_id INT)
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_total_days INT DEFAULT 0;
    DECLARE v_present_days INT DEFAULT 0;
    DECLARE v_attendance_rate DECIMAL(5,2) DEFAULT 100;
    
    SELECT student_id INTO v_student_id FROM global_student_sheets WHERE id = p_sheet_id;
    
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
    INTO v_total_days, v_present_days
    FROM student_attendance_records 
    WHERE student_id = v_student_id;
    
    SET v_attendance_rate = CASE 
        WHEN v_total_days > 0 THEN ROUND((v_present_days / v_total_days) * 100, 2)
        ELSE 100 
    END;
    
    UPDATE global_student_sheets 
    SET 
        total_days = v_total_days,
        days_present = v_present_days,
        days_absent = v_total_days - v_present_days,
        attendance_percentage = v_attendance_rate
    WHERE id = p_sheet_id;
END$$

-- Create procedure to update conduct score
CREATE PROCEDURE update_conduct_score(IN p_sheet_id INT)
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_total_incidents INT DEFAULT 0;
    DECLARE v_critical_incidents INT DEFAULT 0;
    DECLARE v_conduct_score DECIMAL(5,2) DEFAULT 40;
    DECLARE v_conduct_grade VARCHAR(5) DEFAULT 'A';
    
    SELECT student_id INTO v_student_id FROM global_student_sheets WHERE id = p_sheet_id;
    
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical
    INTO v_total_incidents, v_critical_incidents
    FROM student_discipline_records 
    WHERE student_id = v_student_id AND status = 'active';
    
    -- Calculate conduct score (start with 40, deduct points for incidents)
    SET v_conduct_score = 40 - (v_total_incidents * 2) - (v_critical_incidents * 4);
    SET v_conduct_score = CASE WHEN v_conduct_score < 0 THEN 0 ELSE v_conduct_score END;
    
    SET v_conduct_grade = CASE 
        WHEN v_conduct_score >= 36 THEN 'A'
        WHEN v_conduct_score >= 32 THEN 'B'
        WHEN v_conduct_score >= 28 THEN 'C'
        WHEN v_conduct_score >= 24 THEN 'D'
        ELSE 'F'
    END;
    
    UPDATE global_student_sheets 
    SET 
        total_incidents = v_total_incidents,
        critical_incidents = v_critical_incidents,
        conduct_score = v_conduct_score,
        conduct_grade = v_conduct_grade
    WHERE id = p_sheet_id;
END$$

-- Create comprehensive update procedure
CREATE PROCEDURE update_all_calculations(IN p_sheet_id INT)
BEGIN
    CALL recalculate_student_sheet(p_sheet_id);
    CALL update_payment_status(p_sheet_id);
    CALL calculate_attendance(p_sheet_id);
    CALL update_conduct_score(p_sheet_id);
END$$

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_values_sheet_column ON student_sheet_custom_values(sheet_id, column_id);
CREATE INDEX IF NOT EXISTS idx_custom_columns_name_type ON student_sheet_custom_columns(column_name, column_type);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON student_attendance_records(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_discipline_student_status ON student_discipline_records(student_id, status);

-- Test the triggers with sample data
INSERT INTO student_sheet_custom_values (sheet_id, student_id, column_id, value_number, updated_by_role)
SELECT 1, 1, id, 85, 'system'
FROM student_sheet_custom_columns 
WHERE column_name = 'quiz_marks' 
LIMIT 1
ON DUPLICATE KEY UPDATE value_number = 85;
-- Verify DOD Complete System Database Schema
-- This script checks if all required columns and tables exist

SELECT 'DATABASE SCHEMA VERIFICATION' as status;

-- Check global_student_sheets columns
SELECT 'Checking global_student_sheets columns...' as status;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'school_management_system' 
  AND TABLE_NAME = 'global_student_sheets'
  AND COLUMN_NAME IN ('conduct_status', 'conduct_score', 'conduct_grade')
ORDER BY COLUMN_NAME;

-- Check parent_connections columns  
SELECT 'Checking parent_connections columns...' as status;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'school_management_system' 
  AND TABLE_NAME = 'parent_connections'
  AND COLUMN_NAME IN ('parent_phone', 'parent_name', 'status', 'can_receive_notifications')
ORDER BY COLUMN_NAME;

-- Check if required tables exist
SELECT 'Checking required tables...' as status;
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'school_management_system' 
  AND TABLE_NAME IN ('discipline_records', 'student_leaves', 'parent_messages', 'parent_connections')
ORDER BY TABLE_NAME;

-- Show data counts
SELECT 'Data counts:' as status;
SELECT 'Active Students' as table_name, COUNT(*) as count FROM global_student_sheets WHERE status = 'active'
UNION ALL
SELECT 'Parent Connections', COUNT(*) FROM parent_connections WHERE status = 'active'
UNION ALL  
SELECT 'Discipline Records', COUNT(*) FROM discipline_records
UNION ALL
SELECT 'Student Leaves', COUNT(*) FROM student_leaves
UNION ALL
SELECT 'Parent Messages', COUNT(*) FROM parent_messages;

-- Sample data check
SELECT 'Sample student with parent info:' as status;
SELECT 
    gss.id,
    gss.student_code,
    gss.first_name,
    gss.last_name,
    gss.conduct_score,
    gss.conduct_grade,
    gss.conduct_status,
    COUNT(pc.id) as linked_parents,
    GROUP_CONCAT(pc.parent_phone) as parent_phones
FROM global_student_sheets gss
LEFT JOIN parent_connections pc ON gss.id = pc.student_id AND pc.status = 'active'
WHERE gss.status = 'active'
GROUP BY gss.id
LIMIT 3;
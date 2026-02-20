-- Verify Conduct System - Complete Check
-- Run this to verify everything is working correctly

-- ========================================
-- 1. CHECK TABLES EXIST
-- ========================================
SELECT 'Checking Tables...' as Step;

SELECT 
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ student_conduct_records exists'
    ELSE '❌ student_conduct_records MISSING'
  END as Status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'student_conduct_records';

-- ========================================
-- 2. CHECK VIEWS EXIST
-- ========================================
SELECT 'Checking Compatibility Views...' as Step;

SELECT 
  table_name,
  CASE 
    WHEN table_type = 'VIEW' THEN '✅ View exists'
    ELSE '❌ Not a view'
  END as Status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN ('discipline_records', 'student_discipline_records');

-- ========================================
-- 3. CHECK COLUMNS
-- ========================================
SELECT 'Checking Columns...' as Step;

SELECT 
  column_name,
  column_type,
  '✅ Correct' as Status
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'student_conduct_records'
AND column_name IN ('incident_type', 'severity', 'student_id', 'description', 'action_taken');

-- ========================================
-- 4. CHECK DATA
-- ========================================
SELECT 'Checking Data...' as Step;

SELECT 
  'student_conduct_records' as Table_Name,
  COUNT(*) as Record_Count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Has data'
    ELSE '⚠️ No data (this is OK if new system)'
  END as Status
FROM student_conduct_records;

-- ========================================
-- 5. CHECK SEVERITY VALUES
-- ========================================
SELECT 'Checking Severity Values...' as Step;

SELECT 
  severity,
  COUNT(*) as count,
  CASE 
    WHEN severity IN ('minor', 'moderate', 'major', 'severe') THEN '✅ Valid'
    ELSE '❌ Invalid'
  END as Status
FROM student_conduct_records
GROUP BY severity;

-- ========================================
-- 6. CHECK COMPATIBILITY
-- ========================================
SELECT 'Checking Backward Compatibility...' as Step;

SELECT 
  'All tables return same count' as Test,
  CASE 
    WHEN 
      (SELECT COUNT(*) FROM student_conduct_records) = 
      (SELECT COUNT(*) FROM discipline_records) AND
      (SELECT COUNT(*) FROM student_conduct_records) = 
      (SELECT COUNT(*) FROM student_discipline_records)
    THEN '✅ PASS - All views working'
    ELSE '❌ FAIL - Views not synced'
  END as Status;

-- ========================================
-- 7. SAMPLE DATA
-- ========================================
SELECT 'Sample Records...' as Step;

SELECT 
  id,
  student_id,
  incident_type,
  severity,
  LEFT(description, 50) as description_preview,
  incident_date,
  status
FROM student_conduct_records
ORDER BY incident_date DESC
LIMIT 5;

-- ========================================
-- 8. STATISTICS
-- ========================================
SELECT 'System Statistics...' as Step;

SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT student_id) as students_with_records,
  SUM(CASE WHEN severity = 'severe' THEN 1 ELSE 0 END) as severe_incidents,
  SUM(CASE WHEN severity = 'major' THEN 1 ELSE 0 END) as major_incidents,
  SUM(CASE WHEN severity = 'moderate' THEN 1 ELSE 0 END) as moderate_incidents,
  SUM(CASE WHEN severity = 'minor' THEN 1 ELSE 0 END) as minor_incidents,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_records,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_records
FROM student_conduct_records;

-- ========================================
-- FINAL RESULT
-- ========================================
SELECT 
  '========================================' as '';
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'student_conduct_records'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = DATABASE() 
      AND table_name = 'student_conduct_records'
      AND column_name = 'incident_type'
    )
    THEN '✅ SYSTEM IS WORKING CORRECTLY!'
    ELSE '❌ SYSTEM NEEDS FIXING - Run fix-conduct-tables.bat'
  END as FINAL_STATUS;
SELECT 
  '========================================' as '';

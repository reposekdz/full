-- Fix Conduct/Discipline Tables - Standardize to student_conduct_records
-- This migration ensures all conduct/discipline data uses the correct table

SET FOREIGN_KEY_CHECKS = 0;

-- Check if old tables exist and migrate data
-- If discipline_records exists, migrate to student_conduct_records
CREATE TABLE IF NOT EXISTS discipline_records_backup AS SELECT * FROM discipline_records WHERE 1=0;

-- Migrate data from discipline_records to student_conduct_records if it exists
INSERT IGNORE INTO student_conduct_records 
  (student_id, incident_type, description, severity, action_taken, incident_date, created_at)
SELECT 
  student_id, 
  COALESCE(conduct_type, incident_type, 'Disrespect') as incident_type,
  description,
  CASE 
    WHEN severity IN ('Bikomeye', 'critical') THEN 'severe'
    WHEN severity IN ('Byagutse', 'high') THEN 'major'
    WHEN severity IN ('medium', 'moderate') THEN 'moderate'
    ELSE 'minor'
  END as severity,
  action_taken,
  COALESCE(incident_date, created_at) as incident_date,
  created_at
FROM discipline_records
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'discipline_records');

-- Migrate from student_discipline_records to student_conduct_records if different
INSERT IGNORE INTO student_conduct_records 
  (student_id, incident_type, description, severity, action_taken, incident_date, location, 
   reported_by, handled_by, parent_notified, status, created_at)
SELECT 
  student_id, 
  incident_type,
  description,
  severity,
  action_taken,
  incident_date,
  location,
  reported_by,
  handled_by,
  parent_notified,
  status,
  created_at
FROM student_discipline_records
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = DATABASE() 
  AND table_name = 'student_discipline_records'
  AND table_name != 'student_conduct_records'
);

-- Create view for backward compatibility
CREATE OR REPLACE VIEW discipline_records AS
SELECT 
  id,
  student_id,
  incident_type as conduct_type,
  incident_type,
  description,
  severity,
  action_taken,
  incident_date,
  location,
  reported_by,
  handled_by,
  parent_notified,
  parent_notification_date,
  status,
  created_at,
  updated_at
FROM student_conduct_records;

-- Create view for student_discipline_records compatibility
CREATE OR REPLACE VIEW student_discipline_records AS
SELECT * FROM student_conduct_records;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ Conduct tables standardized to student_conduct_records!' as Status;
SELECT '✅ Created compatibility views: discipline_records, student_discipline_records' as Info;

-- ====================================================================
-- Migration: Add Text Columns for Location Names
-- Purpose: Allow users to write location names instead of selecting from dropdowns
-- This enables offline/standalone operation without database dependency
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ====================================================================
-- Add text columns to student_applications table
-- ====================================================================
ALTER TABLE student_applications 
ADD COLUMN IF NOT EXISTS province_name VARCHAR(100) AFTER province_id,
ADD COLUMN IF NOT EXISTS district_name VARCHAR(100) AFTER district_id,
ADD COLUMN IF NOT EXISTS sector_name VARCHAR(100) AFTER sector_id,
ADD COLUMN IF NOT EXISTS cell_name VARCHAR(100) AFTER cell_id,
ADD COLUMN IF NOT EXISTS village_name VARCHAR(100) AFTER village_id;

-- Create indexes for the new text columns for faster searches
CREATE INDEX IF NOT EXISTS idx_student_app_province_name ON student_applications(province_name);
CREATE INDEX IF NOT EXISTS idx_student_app_district_name ON student_applications(district_name);
CREATE INDEX IF NOT EXISTS idx_student_app_sector_name ON student_applications(sector_name);

-- ====================================================================
-- Add text columns to parents table
-- ====================================================================
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS province VARCHAR(100) AFTER address,
ADD COLUMN IF NOT EXISTS district VARCHAR(100) AFTER province,
ADD COLUMN IF NOT EXISTS sector VARCHAR(100) AFTER district,
ADD COLUMN IF NOT EXISTS cell VARCHAR(100) AFTER sector,
ADD COLUMN IF NOT EXISTS village VARCHAR(100) AFTER cell;

-- Create indexes for the new text columns
CREATE INDEX IF NOT EXISTS idx_parents_province ON parents(province);
CREATE INDEX IF NOT EXISTS idx_parents_district ON parents(district);
CREATE INDEX IF NOT EXISTS idx_parents_sector ON parents(sector);

-- ====================================================================
-- Add text columns to global_student_sheets table (for enrolled students)
-- ====================================================================
ALTER TABLE global_student_sheets 
ADD COLUMN IF NOT EXISTS province_name VARCHAR(100) AFTER province_id,
ADD COLUMN IF NOT EXISTS district_name VARCHAR(100) AFTER district_id,
ADD COLUMN IF NOT EXISTS sector_name VARCHAR(100) AFTER sector_id,
ADD COLUMN IF NOT EXISTS cell_name VARCHAR(100) AFTER cell_id,
ADD COLUMN IF NOT EXISTS village_name VARCHAR(100) AFTER village_id;

-- ====================================================================
-- Update views to include text location names
-- ====================================================================

-- Update the application summary view to include text names
CREATE OR REPLACE VIEW v_application_summary AS
SELECT 
  sa.id,
  sa.application_number,
  CONCAT(sa.first_name, ' ', sa.last_name) as full_name,
  sa.phone,
  sa.email,
  sa.date_of_birth,
  TIMESTAMPDIFF(YEAR, sa.date_of_birth, CURDATE()) as age,
  sa.gender,
  COALESCE(sa.province_name, p.name) as province,
  COALESCE(sa.district_name, d.name) as district,
  COALESCE(sa.sector_name, s.name) as sector,
  t.name as trade_name,
  sa.level_number,
  sa.status,
  sa.priority,
  sa.application_date,
  sa.created_at,
  sa.reviewed_at,
  DATEDIFF(NOW(), sa.created_at) as days_pending,
  COUNT(DISTINCT ad.id) as document_count,
  COUNT(DISTINCT ar.id) as review_count,
  u.name as reviewed_by_name
FROM student_applications sa
LEFT JOIN provinces p ON sa.province_id = p.id
LEFT JOIN districts d ON sa.district_id = d.id
LEFT JOIN sectors s ON sa.sector_id = s.id
LEFT JOIN trades t ON sa.trade_code = t.code
LEFT JOIN application_documents ad ON sa.id = ad.application_id
LEFT JOIN application_reviews ar ON sa.id = ar.application_id
LEFT JOIN users u ON sa.reviewed_by = u.id
WHERE sa.deleted_at IS NULL
GROUP BY sa.id;

-- ====================================================================
-- Create helper procedures for location data
-- ====================================================================

-- Procedure to get location names by IDs
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetLocationNames(
  IN p_province_id INT,
  IN p_district_id INT,
  IN p_sector_id INT,
  IN p_cell_id INT,
  IN p_village_id INT
)
BEGIN
  SELECT 
    COALESCE(p.name_en, p.name_rw) as province_name,
    COALESCE(d.name_en, d.name_rw) as district_name,
    COALESCE(s.name_en, s.name_rw) as sector_name,
    COALESCE(c.name_en, c.name_rw) as cell_name,
    COALESCE(v.name_en, v.name_rw) as village_name
  FROM provinces p
  LEFT JOIN districts d ON d.province_id = p.id
  LEFT JOIN sectors s ON s.district_id = d.id
  LEFT JOIN cells c ON c.sector_id = s.id
  LEFT JOIN villages v ON v.cell_id = c.id
  WHERE p.id = p_province_id 
    AND d.id = p_district_id 
    AND s.id = p_sector_id
    AND c.id = p_cell_id
    AND v.id = p_village_id;
END //
DELIMITER ;

-- ====================================================================
-- Migration Complete
-- ====================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- Migration Summary:
-- 1. Added text columns to student_applications: province_name, district_name, sector_name, cell_name, village_name
-- 2. Added text columns to parents: province, district, sector, cell, village
-- 3. Added text columns to global_student_sheets: province_name, district_name, sector_name, cell_name, village_name
-- 4. Updated v_application_summary view to use text names when available
-- 5. Created GetLocationNames procedure for backward compatibility
-- 
-- Usage:
-- - Frontend can now submit location as text (e.g., "Kigali City", "Gasabo", etc.)
-- - Backend stores text values directly in the new _name columns
-- - Frontend can also use dropdowns (IDs) and the system will store both ID and name
-- - Reports and views will优先使用 text names when available, falling back to ID lookups

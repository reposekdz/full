-- ═══════════════════════════════════════════════════════════════════════════
-- PARENT-CHILD LINKING SYSTEM - SAFE MIGRATION (Foreign Key Safe)
-- ═══════════════════════════════════════════════════════════════════════════

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS parent_linking_audit_log;
DROP TABLE IF EXISTS parent_child_links;
DROP TABLE IF EXISTS parent_linking_applications;

SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PARENT LINKING APPLICATIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE parent_linking_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_code VARCHAR(50) UNIQUE NOT NULL,
  parent_id INT NOT NULL,
  child_first_name VARCHAR(100) NOT NULL,
  child_last_name VARCHAR(100) NOT NULL,
  child_gender ENUM('Male', 'Female') NOT NULL,
  child_trade_code VARCHAR(10) NOT NULL,
  child_level_number INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  INDEX idx_parent_id (parent_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. PARENT-CHILD LINKS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE parent_child_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  linked_by INT NOT NULL,
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'suspended', 'revoked') DEFAULT 'active',
  permissions JSON NULL,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_student_id (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. AUDIT LOG TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE parent_linking_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  action ENUM('submitted', 'approved', 'rejected', 'revoked') NOT NULL,
  performed_by INT NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_application_id (application_id),
  INDEX idx_performed_by (performed_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. SAMPLE DATA (Optional - for testing)
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert sample applications (only if users table has data)
INSERT INTO parent_linking_applications 
(application_code, parent_id, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, status)
SELECT 'APP-2024-001', u.id, 'Eric', 'Mugabo', 'Male', 'SOD', 4, 'pending'
FROM users u 
WHERE u.role = 'parent' 
LIMIT 1;

INSERT INTO parent_linking_applications 
(application_code, parent_id, child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, status)
SELECT 'APP-2024-002', u.id, 'Grace', 'Ishimwe', 'Female', 'BDC', 3, 'pending'
FROM users u 
WHERE u.role = 'parent' 
LIMIT 1 OFFSET 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. VIEWS FOR EASY QUERYING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_pending_parent_applications AS
SELECT 
  pla.*,
  CONCAT(u.first_name, ' ', u.last_name) as parent_name,
  u.phone as parent_phone,
  u.email as parent_email,
  gss.id as matched_student_id,
  CONCAT(gss.first_name, ' ', gss.last_name) as matched_student_name,
  gss.student_code as matched_student_code
FROM parent_linking_applications pla
LEFT JOIN users u ON pla.parent_id = u.id
LEFT JOIN global_student_sheets gss ON 
  gss.first_name = pla.child_first_name AND
  gss.last_name = pla.child_last_name AND
  gss.gender = pla.child_gender AND
  gss.trade_code = pla.child_trade_code AND
  gss.level_number = pla.child_level_number
WHERE pla.status = 'pending';

CREATE OR REPLACE VIEW v_active_parent_child_links AS
SELECT 
  pcl.*,
  CONCAT(u.first_name, ' ', u.last_name) as parent_name,
  u.phone as parent_phone,
  CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
  gss.student_code,
  gss.trade_code,
  gss.level_number
FROM parent_child_links pcl
LEFT JOIN users u ON pcl.parent_id = u.id
LEFT JOIN global_student_sheets gss ON pcl.student_id = gss.id
WHERE pcl.status = 'active';

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'Parent-Child Linking System Migration Complete!' as status;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARENT LINKING APPLICATIONS TABLE - QUICK FIX
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this if you get 500 error on /api/parent-child-linking/pending-applications
-- ═══════════════════════════════════════════════════════════════════════════

-- Create parent_linking_applications table
CREATE TABLE IF NOT EXISTS parent_linking_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  child_first_name VARCHAR(100) NOT NULL,
  child_last_name VARCHAR(100) NOT NULL,
  child_gender ENUM('Male', 'Female') NOT NULL,
  child_trade_code VARCHAR(10) NOT NULL,
  child_level_number INT NOT NULL,
  relationship VARCHAR(50) DEFAULT 'parent',
  notes TEXT,
  matched_student_id INT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reviewed_by INT,
  reviewed_by_name VARCHAR(200),
  reviewed_by_role VARCHAR(50),
  reviewed_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_student_id) REFERENCES global_student_sheets(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_status (status),
  INDEX idx_student (matched_student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create parent_child_links table
CREATE TABLE IF NOT EXISTS parent_child_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship VARCHAR(50) DEFAULT 'parent',
  status ENUM('active', 'inactive') DEFAULT 'active',
  linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  linked_by INT,
  linked_by_name VARCHAR(200),
  last_accessed_at DATETIME,
  can_view_marks BOOLEAN DEFAULT TRUE,
  can_view_attendance BOOLEAN DEFAULT TRUE,
  can_view_discipline BOOLEAN DEFAULT TRUE,
  can_view_conduct BOOLEAN DEFAULT TRUE,
  can_view_fees BOOLEAN DEFAULT TRUE,
  can_view_messages BOOLEAN DEFAULT TRUE,
  can_view_timetable BOOLEAN DEFAULT TRUE,
  can_view_assignments BOOLEAN DEFAULT TRUE,
  can_view_report_cards BOOLEAN DEFAULT TRUE,
  can_make_payments BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create audit log table
CREATE TABLE IF NOT EXISTS parent_linking_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT,
  link_id INT,
  action VARCHAR(50) NOT NULL,
  performed_by INT,
  performed_by_name VARCHAR(200),
  performed_by_role VARCHAR(50),
  details TEXT,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_application (application_id),
  INDEX idx_link (link_id),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create stored procedure for submitting application
DELIMITER //

DROP PROCEDURE IF EXISTS sp_submit_parent_linking_application//

CREATE PROCEDURE sp_submit_parent_linking_application(
  IN p_parent_id INT,
  IN p_child_first_name VARCHAR(100),
  IN p_child_last_name VARCHAR(100),
  IN p_child_gender VARCHAR(10),
  IN p_child_trade_code VARCHAR(10),
  IN p_child_level_number INT,
  IN p_relationship VARCHAR(50),
  IN p_notes TEXT,
  OUT p_application_id INT,
  OUT p_matched_student_id INT,
  OUT p_status VARCHAR(20)
)
BEGIN
  DECLARE v_student_id INT DEFAULT NULL;
  
  -- Try to find matching student
  SELECT id INTO v_student_id
  FROM global_student_sheets
  WHERE first_name = p_child_first_name
    AND last_name = p_child_last_name
    AND gender = p_child_gender
    AND trade_code = p_child_trade_code
    AND level_number = p_child_level_number
    AND status = 'active'
  LIMIT 1;
  
  -- Insert application
  INSERT INTO parent_linking_applications (
    parent_id, child_first_name, child_last_name, child_gender,
    child_trade_code, child_level_number, relationship, notes,
    matched_student_id, status
  ) VALUES (
    p_parent_id, p_child_first_name, p_child_last_name, p_child_gender,
    p_child_trade_code, p_child_level_number, p_relationship, p_notes,
    v_student_id, 'pending'
  );
  
  SET p_application_id = LAST_INSERT_ID();
  SET p_matched_student_id = v_student_id;
  SET p_status = IF(v_student_id IS NULL, 'no_match', 'pending');
END//

-- Create stored procedure for approving application
DROP PROCEDURE IF EXISTS sp_approve_parent_linking_application//

CREATE PROCEDURE sp_approve_parent_linking_application(
  IN p_application_id INT,
  IN p_staff_id INT,
  IN p_staff_name VARCHAR(200),
  IN p_staff_role VARCHAR(50),
  OUT p_link_id INT,
  OUT p_success BOOLEAN
)
BEGIN
  DECLARE v_parent_id INT;
  DECLARE v_student_id INT;
  DECLARE v_relationship VARCHAR(50);
  DECLARE v_status VARCHAR(20);
  
  -- Get application details
  SELECT parent_id, matched_student_id, relationship, status
  INTO v_parent_id, v_student_id, v_relationship, v_status
  FROM parent_linking_applications
  WHERE id = p_application_id;
  
  -- Check if application exists and is pending
  IF v_status = 'pending' AND v_student_id IS NOT NULL THEN
    -- Create parent-child link
    INSERT INTO parent_child_links (
      parent_id, student_id, relationship, status,
      linked_by, linked_by_name
    ) VALUES (
      v_parent_id, v_student_id, v_relationship, 'active',
      p_staff_id, p_staff_name
    );
    
    SET p_link_id = LAST_INSERT_ID();
    
    -- Update application status
    UPDATE parent_linking_applications
    SET status = 'approved',
        reviewed_by = p_staff_id,
        reviewed_by_name = p_staff_name,
        reviewed_by_role = p_staff_role,
        reviewed_at = NOW()
    WHERE id = p_application_id;
    
    SET p_success = TRUE;
  ELSE
    SET p_link_id = NULL;
    SET p_success = FALSE;
  END IF;
END//

-- Create stored procedure for rejecting application
DROP PROCEDURE IF EXISTS sp_reject_parent_linking_application//

CREATE PROCEDURE sp_reject_parent_linking_application(
  IN p_application_id INT,
  IN p_staff_id INT,
  IN p_staff_name VARCHAR(200),
  IN p_staff_role VARCHAR(50),
  IN p_rejection_reason TEXT,
  OUT p_success BOOLEAN
)
BEGIN
  DECLARE v_status VARCHAR(20);
  
  -- Get application status
  SELECT status INTO v_status
  FROM parent_linking_applications
  WHERE id = p_application_id;
  
  -- Check if application exists and is pending
  IF v_status = 'pending' THEN
    -- Update application status
    UPDATE parent_linking_applications
    SET status = 'rejected',
        reviewed_by = p_staff_id,
        reviewed_by_name = p_staff_name,
        reviewed_by_role = p_staff_role,
        reviewed_at = NOW(),
        rejection_reason = p_rejection_reason
    WHERE id = p_application_id;
    
    SET p_success = TRUE;
  ELSE
    SET p_success = FALSE;
  END IF;
END//

DELIMITER ;

-- Success message
SELECT 'Parent linking tables and procedures created successfully!' as message;

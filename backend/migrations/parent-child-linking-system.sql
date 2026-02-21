-- ═══════════════════════════════════════════════════════════════════════════
-- PARENT-CHILD LINKING SYSTEM - COMPLETE DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
-- Features:
-- 1. Parent submits linking request (no student code required)
-- 2. Request goes to DOD dashboard
-- 3. DOD approves/rejects from global sheets
-- 4. Parent gets full access to child data after approval
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS parent_linking_audit_log;
DROP TABLE IF EXISTS parent_child_links;
DROP TABLE IF EXISTS parent_linking_applications;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PARENT LINKING APPLICATIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE parent_linking_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Parent Information
    parent_id INT NOT NULL,
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    parent_first_name VARCHAR(100),
    parent_last_name VARCHAR(100),
    
    -- Child Information (from form)
    child_first_name VARCHAR(100) NOT NULL,
    child_last_name VARCHAR(100) NOT NULL,
    child_gender ENUM('Male', 'Female') NOT NULL,
    child_trade_code VARCHAR(10) NOT NULL,
    child_level_number INT NOT NULL,
    relationship VARCHAR(50) DEFAULT 'parent',
    
    -- Matched Student (after search)
    matched_student_id INT,
    matched_student_code VARCHAR(50),
    matched_student_name VARCHAR(255),
    
    -- Application Status
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    
    -- Approval/Rejection
    reviewed_by INT,
    reviewed_by_name VARCHAR(255),
    reviewed_by_role VARCHAR(50),
    reviewed_at DATETIME,
    rejection_reason TEXT,
    
    -- Additional Info
    notes TEXT,
    parent_message TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_parent_id (parent_id),
    INDEX idx_matched_student_id (matched_student_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    -- Foreign Keys
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (matched_student_id) REFERENCES global_student_sheets(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. PARENT-CHILD LINKS TABLE (After Approval)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE parent_child_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    link_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Link Information
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship VARCHAR(50) DEFAULT 'parent',
    
    -- Permissions (what parent can view)
    can_view_marks BOOLEAN DEFAULT TRUE,
    can_view_attendance BOOLEAN DEFAULT TRUE,
    can_view_discipline BOOLEAN DEFAULT TRUE,
    can_view_conduct BOOLEAN DEFAULT TRUE,
    can_view_fees BOOLEAN DEFAULT TRUE,
    can_view_messages BOOLEAN DEFAULT TRUE,
    can_view_timetable BOOLEAN DEFAULT TRUE,
    can_view_assignments BOOLEAN DEFAULT TRUE,
    can_view_report_cards BOOLEAN DEFAULT TRUE,
    can_make_payments BOOLEAN DEFAULT TRUE,
    
    -- Link Status
    status ENUM('active', 'inactive', 'suspended', 'revoked') DEFAULT 'active',
    
    -- Approval Info
    approved_by INT,
    approved_by_name VARCHAR(255),
    approved_at DATETIME,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_accessed_at DATETIME,
    
    -- Indexes
    INDEX idx_parent_id (parent_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    UNIQUE INDEX idx_parent_student (parent_id, student_id),
    
    -- Foreign Keys
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. PARENT LINKING AUDIT LOG
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE parent_linking_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Action Information
    action_type ENUM('application_submitted', 'application_approved', 'application_rejected', 
                     'link_created', 'link_suspended', 'link_revoked', 'permissions_updated') NOT NULL,
    
    -- Related Records
    application_id INT,
    link_id INT,
    parent_id INT,
    student_id INT,
    
    -- Action Details
    performed_by INT,
    performed_by_name VARCHAR(255),
    performed_by_role VARCHAR(50),
    
    -- Change Details
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    reason TEXT,
    notes TEXT,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_application_id (application_id),
    INDEX idx_link_id (link_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_student_id (student_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at),
    
    -- Foreign Keys
    FOREIGN KEY (application_id) REFERENCES parent_linking_applications(id) ON DELETE SET NULL,
    FOREIGN KEY (link_id) REFERENCES parent_child_links(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE SET NULL,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. SAMPLE DATA FOR TESTING
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert sample pending applications
INSERT INTO parent_linking_applications 
(application_id, parent_id, parent_email, parent_phone, parent_first_name, parent_last_name,
 child_first_name, child_last_name, child_gender, child_trade_code, child_level_number, 
 relationship, status, notes)
VALUES
('APP-2024-001', 
 (SELECT id FROM users WHERE role = 'parent' LIMIT 1),
 'parent1@example.com', '0781234567', 'Jean', 'Mukamana',
 'Eric', 'Mugabo', 'Male', 'SOD', 4, 'mother', 'pending',
 'My son Eric is in Level 4 SOD. I would like to monitor his progress.'),
 
('APP-2024-002',
 (SELECT id FROM users WHERE role = 'parent' LIMIT 1),
 'parent2@example.com', '0782345678', 'Marie', 'Uwase',
 'Grace', 'Ishimwe', 'Female', 'BDC', 3, 'mother', 'pending',
 'My daughter Grace is in Level 3 BDC. Please link me to her account.');

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. VIEWS FOR EASY QUERYING
-- ═══════════════════════════════════════════════════════════════════════════

-- View: Pending Applications with Full Details
CREATE OR REPLACE VIEW v_pending_parent_applications AS
SELECT 
    pla.*,
    gss.id as student_id,
    gss.student_code,
    gss.first_name as student_first_name,
    gss.last_name as student_last_name,
    gss.trade_name,
    gss.level_number,
    gss.class_name,
    gss.profile_image,
    gss.phone as student_phone,
    gss.email as student_email,
    u.first_name as parent_user_first_name,
    u.last_name as parent_user_last_name,
    u.email as parent_user_email,
    u.phone as parent_user_phone
FROM parent_linking_applications pla
LEFT JOIN global_student_sheets gss ON 
    LOWER(gss.first_name) = LOWER(pla.child_first_name) AND
    LOWER(gss.last_name) = LOWER(pla.child_last_name) AND
    gss.gender = pla.child_gender AND
    gss.trade_code = pla.child_trade_code AND
    gss.level_number = pla.child_level_number AND
    gss.status = 'active'
LEFT JOIN users u ON pla.parent_id = u.id
WHERE pla.status = 'pending'
ORDER BY pla.created_at DESC;

-- View: Active Parent-Child Links with Full Details
CREATE OR REPLACE VIEW v_active_parent_child_links AS
SELECT 
    pcl.*,
    u.first_name as parent_first_name,
    u.last_name as parent_last_name,
    u.email as parent_email,
    u.phone as parent_phone,
    gss.student_code,
    gss.first_name as student_first_name,
    gss.last_name as student_last_name,
    gss.trade_name,
    gss.trade_code,
    gss.level_number,
    gss.class_name,
    gss.gender,
    gss.conduct_score,
    gss.overall_attendance_percentage,
    gss.profile_image
FROM parent_child_links pcl
INNER JOIN users u ON pcl.parent_id = u.id
INNER JOIN global_student_sheets gss ON pcl.student_id = gss.id
WHERE pcl.status = 'active'
ORDER BY pcl.created_at DESC;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. STORED PROCEDURES
-- ═══════════════════════════════════════════════════════════════════════════

DELIMITER //

-- Procedure: Submit Parent Linking Application
CREATE PROCEDURE sp_submit_parent_linking_application(
    IN p_parent_id INT,
    IN p_child_first_name VARCHAR(100),
    IN p_child_last_name VARCHAR(100),
    IN p_child_gender VARCHAR(10),
    IN p_child_trade_code VARCHAR(10),
    IN p_child_level_number INT,
    IN p_relationship VARCHAR(50),
    IN p_notes TEXT,
    OUT p_application_id VARCHAR(50),
    OUT p_matched_student_id INT,
    OUT p_status VARCHAR(50)
)
BEGIN
    DECLARE v_app_id VARCHAR(50);
    DECLARE v_student_id INT;
    DECLARE v_parent_email VARCHAR(255);
    DECLARE v_parent_phone VARCHAR(20);
    DECLARE v_parent_first_name VARCHAR(100);
    DECLARE v_parent_last_name VARCHAR(100);
    
    -- Generate application ID
    SET v_app_id = CONCAT('APP-', YEAR(NOW()), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'));
    
    -- Get parent details
    SELECT email, phone, first_name, last_name 
    INTO v_parent_email, v_parent_phone, v_parent_first_name, v_parent_last_name
    FROM users WHERE id = p_parent_id;
    
    -- Search for matching student
    SELECT id INTO v_student_id
    FROM global_student_sheets
    WHERE LOWER(first_name) = LOWER(p_child_first_name)
      AND LOWER(last_name) = LOWER(p_child_last_name)
      AND gender = p_child_gender
      AND trade_code = p_child_trade_code
      AND level_number = p_child_level_number
      AND status = 'active'
    LIMIT 1;
    
    -- Insert application
    INSERT INTO parent_linking_applications (
        application_id, parent_id, parent_email, parent_phone, 
        parent_first_name, parent_last_name,
        child_first_name, child_last_name, child_gender, 
        child_trade_code, child_level_number, relationship,
        matched_student_id, notes, status
    ) VALUES (
        v_app_id, p_parent_id, v_parent_email, v_parent_phone,
        v_parent_first_name, v_parent_last_name,
        p_child_first_name, p_child_last_name, p_child_gender,
        p_child_trade_code, p_child_level_number, p_relationship,
        v_student_id, p_notes, 'pending'
    );
    
    -- Log action
    INSERT INTO parent_linking_audit_log (
        action_type, application_id, parent_id, student_id,
        performed_by, performed_by_name, performed_by_role, notes
    ) VALUES (
        'application_submitted', LAST_INSERT_ID(), p_parent_id, v_student_id,
        p_parent_id, CONCAT(v_parent_first_name, ' ', v_parent_last_name), 'parent',
        'Parent submitted linking application'
    );
    
    -- Return values
    SET p_application_id = v_app_id;
    SET p_matched_student_id = v_student_id;
    SET p_status = IF(v_student_id IS NOT NULL, 'matched', 'no_match');
END //

-- Procedure: Approve Parent Linking Application
CREATE PROCEDURE sp_approve_parent_linking_application(
    IN p_application_id INT,
    IN p_approved_by INT,
    IN p_approved_by_name VARCHAR(255),
    IN p_approved_by_role VARCHAR(50),
    OUT p_link_id VARCHAR(50),
    OUT p_success BOOLEAN
)
BEGIN
    DECLARE v_parent_id INT;
    DECLARE v_student_id INT;
    DECLARE v_relationship VARCHAR(50);
    DECLARE v_link_id VARCHAR(50);
    
    -- Get application details
    SELECT parent_id, matched_student_id, relationship
    INTO v_parent_id, v_student_id, v_relationship
    FROM parent_linking_applications
    WHERE id = p_application_id AND status = 'pending';
    
    IF v_parent_id IS NOT NULL AND v_student_id IS NOT NULL THEN
        -- Generate link ID
        SET v_link_id = CONCAT('LINK-', YEAR(NOW()), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'));
        
        -- Update application status
        UPDATE parent_linking_applications
        SET status = 'approved',
            reviewed_by = p_approved_by,
            reviewed_by_name = p_approved_by_name,
            reviewed_by_role = p_approved_by_role,
            reviewed_at = NOW()
        WHERE id = p_application_id;
        
        -- Create parent-child link
        INSERT INTO parent_child_links (
            link_id, parent_id, student_id, relationship,
            approved_by, approved_by_name, approved_at, status
        ) VALUES (
            v_link_id, v_parent_id, v_student_id, v_relationship,
            p_approved_by, p_approved_by_name, NOW(), 'active'
        );
        
        -- Log action
        INSERT INTO parent_linking_audit_log (
            action_type, application_id, link_id, parent_id, student_id,
            performed_by, performed_by_name, performed_by_role,
            old_status, new_status, notes
        ) VALUES (
            'application_approved', p_application_id, LAST_INSERT_ID(), 
            v_parent_id, v_student_id,
            p_approved_by, p_approved_by_name, p_approved_by_role,
            'pending', 'approved', 'Application approved and link created'
        );
        
        SET p_link_id = v_link_id;
        SET p_success = TRUE;
    ELSE
        SET p_success = FALSE;
    END IF;
END //

-- Procedure: Reject Parent Linking Application
CREATE PROCEDURE sp_reject_parent_linking_application(
    IN p_application_id INT,
    IN p_rejected_by INT,
    IN p_rejected_by_name VARCHAR(255),
    IN p_rejected_by_role VARCHAR(50),
    IN p_rejection_reason TEXT,
    OUT p_success BOOLEAN
)
BEGIN
    DECLARE v_parent_id INT;
    DECLARE v_student_id INT;
    
    -- Get application details
    SELECT parent_id, matched_student_id
    INTO v_parent_id, v_student_id
    FROM parent_linking_applications
    WHERE id = p_application_id AND status = 'pending';
    
    IF v_parent_id IS NOT NULL THEN
        -- Update application status
        UPDATE parent_linking_applications
        SET status = 'rejected',
            reviewed_by = p_rejected_by,
            reviewed_by_name = p_rejected_by_name,
            reviewed_by_role = p_rejected_by_role,
            reviewed_at = NOW(),
            rejection_reason = p_rejection_reason
        WHERE id = p_application_id;
        
        -- Log action
        INSERT INTO parent_linking_audit_log (
            action_type, application_id, parent_id, student_id,
            performed_by, performed_by_name, performed_by_role,
            old_status, new_status, reason
        ) VALUES (
            'application_rejected', p_application_id, v_parent_id, v_student_id,
            p_rejected_by, p_rejected_by_name, p_rejected_by_role,
            'pending', 'rejected', p_rejection_reason
        );
        
        SET p_success = TRUE;
    ELSE
        SET p_success = FALSE;
    END IF;
END //

DELIMITER ;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Trigger: Update last_accessed_at when parent views child data
DELIMITER //
CREATE TRIGGER trg_update_link_access
BEFORE UPDATE ON parent_child_links
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' AND OLD.status = 'active' THEN
        SET NEW.last_accessed_at = NOW();
    END IF;
END //
DELIMITER ;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════

-- Additional composite indexes
CREATE INDEX idx_app_parent_status ON parent_linking_applications(parent_id, status);
CREATE INDEX idx_link_parent_status ON parent_child_links(parent_id, status);
CREATE INDEX idx_audit_parent_action ON parent_linking_audit_log(parent_id, action_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'Parent-Child Linking System Database Schema Created Successfully!' as Status;

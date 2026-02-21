-- ═══════════════════════════════════════════════════════════════════════════
-- PARENT WAITING LIST SYSTEM - ADVANCED SCHEMA (NO AI)
-- ═══════════════════════════════════════════════════════════════════════════

-- Create parent waiting list table
CREATE TABLE IF NOT EXISTS parent_waiting_list (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    child_first_name VARCHAR(100) NOT NULL,
    child_last_name VARCHAR(100) NOT NULL,
    child_gender ENUM('Male', 'Female') NOT NULL,
    child_trade_code VARCHAR(10) NOT NULL,
    child_level_number INT NOT NULL,
    relationship VARCHAR(50) DEFAULT 'parent',
    notes TEXT,
    status ENUM('waiting', 'matched', 'expired') DEFAULT 'waiting',
    matched_student_id INT NULL,
    matched_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent_waiting (parent_id, status),
    INDEX idx_student_search (child_first_name, child_last_name, child_trade_code, child_level_number),
    INDEX idx_status_created (status, created_at)
);

-- Create parent search history table
CREATE TABLE IF NOT EXISTS parent_search_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    search_term VARCHAR(255),
    trade_code VARCHAR(10),
    level_number INT,
    gender ENUM('Male', 'Female'),
    results_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_parent_searches (parent_id, created_at)
);

-- Create parent notifications table (enhanced)
CREATE TABLE IF NOT EXISTS parent_notifications_advanced (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'urgent') DEFAULT 'info',
    category ENUM('general', 'academic', 'fees', 'attendance', 'discipline', 'system') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500) NULL,
    action_text VARCHAR(100) NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    INDEX idx_parent_notifications (parent_id, is_read, created_at),
    INDEX idx_notification_type (type, created_at)
);

-- Create parent preferences table
CREATE TABLE IF NOT EXISTS parent_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL UNIQUE,
    language ENUM('en', 'rw', 'fr') DEFAULT 'rw',
    timezone VARCHAR(50) DEFAULT 'Africa/Kigali',
    notification_sms BOOLEAN DEFAULT TRUE,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_push BOOLEAN DEFAULT TRUE,
    auto_translate BOOLEAN DEFAULT FALSE,
    theme ENUM('light', 'dark', 'auto') DEFAULT 'light',
    dashboard_layout ENUM('compact', 'detailed', 'cards') DEFAULT 'cards',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create parent activity log
CREATE TABLE IF NOT EXISTS parent_activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_parent_activity (parent_id, created_at),
    INDEX idx_action_time (action, created_at)
);

-- Create parent feedback table
CREATE TABLE IF NOT EXISTS parent_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    category ENUM('bug', 'feature', 'improvement', 'complaint', 'compliment') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    status ENUM('pending', 'reviewed', 'resolved', 'closed') DEFAULT 'pending',
    staff_response TEXT NULL,
    responded_by INT NULL,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_parent_feedback (parent_id, status, created_at),
    INDEX idx_feedback_category (category, status)
);

-- Advanced features for parent system (NO AI)
CREATE TABLE IF NOT EXISTS parent_smart_matching (
    id INT PRIMARY KEY AUTO_INCREMENT,
    waiting_list_id INT NOT NULL,
    student_id INT NOT NULL,
    match_score DECIMAL(5,2) DEFAULT 0.00,
    match_factors JSON,
    auto_matched BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (waiting_list_id) REFERENCES parent_waiting_list(id),
    INDEX idx_smart_match (waiting_list_id, match_score DESC)
);

CREATE TABLE IF NOT EXISTS parent_communication_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    communication_type ENUM('sms', 'email', 'push', 'call', 'whatsapp') NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed', 'read') DEFAULT 'pending',
    delivery_time TIMESTAMP NULL,
    read_time TIMESTAMP NULL,
    cost DECIMAL(10,2) DEFAULT 0.00,
    provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_parent_comm (parent_id, created_at),
    INDEX idx_comm_status (status, created_at)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waiting_list_search ON parent_waiting_list (child_first_name, child_last_name, child_trade_code);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON parent_notifications_advanced (parent_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_recent ON parent_activity_log (parent_id, created_at DESC);

-- Create views for easy access
CREATE OR REPLACE VIEW parent_waiting_list_summary AS
SELECT 
    pwl.*,
    CONCAT(pwl.child_first_name, ' ', pwl.child_last_name) as child_full_name,
    CASE 
        WHEN pwl.status = 'waiting' THEN 'Tegereza'
        WHEN pwl.status = 'matched' THEN 'Hasanze'
        WHEN pwl.status = 'expired' THEN 'Byarangiye'
        ELSE pwl.status
    END as status_kinyarwanda,
    DATEDIFF(NOW(), pwl.created_at) as days_waiting
FROM parent_waiting_list pwl;

CREATE OR REPLACE VIEW parent_dashboard_stats AS
SELECT 
    p.id as parent_id,
    COUNT(DISTINCT pcl.id) as linked_children,
    COUNT(DISTINCT pwl.id) as waiting_requests,
    COUNT(DISTINCT pna.id) as unread_notifications,
    COUNT(DISTINCT pm.id) as unread_messages
FROM users p
LEFT JOIN parent_child_links pcl ON p.id = pcl.parent_id AND pcl.status = 'active'
LEFT JOIN parent_waiting_list pwl ON p.id = pwl.parent_id AND pwl.status = 'waiting'
LEFT JOIN parent_notifications_advanced pna ON p.id = pna.parent_id AND pna.is_read = FALSE
LEFT JOIN parent_messages pm ON p.id = pm.parent_id AND pm.is_read = FALSE
WHERE p.role = 'parent'
GROUP BY p.id;

-- Advanced stored procedures (NO AI)
DELIMITER //

CREATE PROCEDURE sp_smart_match_students(IN p_waiting_list_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_student_id INT;
    DECLARE v_match_score DECIMAL(5,2);
    DECLARE cur CURSOR FOR 
        SELECT gss.id, 
               (CASE 
                   WHEN gss.first_name = pwl.child_first_name THEN 40
                   WHEN SOUNDEX(gss.first_name) = SOUNDEX(pwl.child_first_name) THEN 25
                   ELSE 0
               END +
               CASE 
                   WHEN gss.last_name = pwl.child_last_name THEN 40
                   WHEN SOUNDEX(gss.last_name) = SOUNDEX(pwl.child_last_name) THEN 25
                   ELSE 0
               END +
               CASE WHEN gss.trade_code = pwl.child_trade_code THEN 15 ELSE 0 END +
               CASE WHEN gss.level_number = pwl.child_level_number THEN 5 ELSE 0 END) as match_score
        FROM global_student_sheets gss
        CROSS JOIN parent_waiting_list pwl
        WHERE pwl.id = p_waiting_list_id
        HAVING match_score >= 50
        ORDER BY match_score DESC
        LIMIT 10;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    DELETE FROM parent_smart_matching WHERE waiting_list_id = p_waiting_list_id;
    
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_student_id, v_match_score;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        INSERT INTO parent_smart_matching (waiting_list_id, student_id, match_score, auto_matched)
        VALUES (p_waiting_list_id, v_student_id, v_match_score, v_match_score >= 80);
    END LOOP;
    
    CLOSE cur;
END//

DELIMITER ;

-- Success message
SELECT 'Advanced Parent System with Smart Matching created successfully!' as message;
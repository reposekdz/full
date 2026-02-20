-- ============================================================================
-- FIX CONDUCT SCORE TO 40-POINT SYSTEM WITH PARENT NOTIFICATIONS
-- ============================================================================

-- 1. Ensure global_student_sheets has conduct_score with default 40
ALTER TABLE global_student_sheets 
MODIFY COLUMN conduct_score INT DEFAULT 40 CHECK (conduct_score >= 0 AND conduct_score <= 40);

-- 2. Update any NULL or invalid conduct scores to 40
UPDATE global_student_sheets 
SET conduct_score = 40 
WHERE conduct_score IS NULL OR conduct_score > 40;

-- 3. Ensure student_conduct_records table exists with proper structure
CREATE TABLE IF NOT EXISTS student_conduct_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  severity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
  description TEXT,
  action_taken TEXT,
  incident_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  points_deducted INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_incident_date (incident_date),
  INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Ensure parent_connections table for SMS notifications
CREATE TABLE IF NOT EXISTS parent_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  parent_phone VARCHAR(20),
  parent_name VARCHAR(100),
  relationship VARCHAR(50) DEFAULT 'parent',
  status VARCHAR(20) DEFAULT 'active',
  can_receive_notifications BOOLEAN DEFAULT TRUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_parent_phone (parent_phone),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create SMS queue table for parent notifications
CREATE TABLE IF NOT EXISTS sms_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_phone (phone_number),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create parent_messages table for message history
CREATE TABLE IF NOT EXISTS parent_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  send_via ENUM('sms', 'whatsapp', 'both') DEFAULT 'sms',
  sent_by_name VARCHAR(100),
  delivery_status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_parent_phone (parent_phone),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create student_leaves table for leave tracking
CREATE TABLE IF NOT EXISTS student_leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  student_code VARCHAR(50),
  trade VARCHAR(50),
  class_level VARCHAR(10),
  leave_type VARCHAR(100) NOT NULL,
  reason TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  approved_by_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  parent_notified BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Add conduct_grade column if not exists
ALTER TABLE global_student_sheets 
ADD COLUMN IF NOT EXISTS conduct_grade VARCHAR(2) 
GENERATED ALWAYS AS (
  CASE 
    WHEN conduct_score >= 36 THEN 'A'
    WHEN conduct_score >= 32 THEN 'B'
    WHEN conduct_score >= 28 THEN 'C'
    WHEN conduct_score >= 24 THEN 'D'
    ELSE 'F'
  END
) STORED;

-- 9. Create trigger to auto-notify parents when conduct is removed
DELIMITER //

DROP TRIGGER IF EXISTS after_conduct_insert//

CREATE TRIGGER after_conduct_insert
AFTER INSERT ON student_conduct_records
FOR EACH ROW
BEGIN
  DECLARE student_name VARCHAR(200);
  DECLARE current_score INT;
  DECLARE parent_phone_num VARCHAR(20);
  DECLARE done INT DEFAULT FALSE;
  DECLARE cur CURSOR FOR 
    SELECT DISTINCT parent_phone 
    FROM parent_connections 
    WHERE student_id = NEW.student_id 
      AND status = 'active' 
      AND can_receive_notifications = TRUE 
      AND parent_phone IS NOT NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  -- Get student info
  SELECT CONCAT(first_name, ' ', last_name), conduct_score 
  INTO student_name, current_score
  FROM global_student_sheets 
  WHERE id = NEW.student_id;
  
  -- Queue SMS to all linked parents
  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO parent_phone_num;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    INSERT INTO sms_queue (phone_number, message, status, priority, created_at)
    VALUES (
      parent_phone_num,
      CONCAT('Garden TVET: Umwana ', student_name, ' yakiriye igihano. Impamvu: ', 
             NEW.incident_type, '. Amanota ashya: ', current_score, '/40. Tubifuriza ko azahindura imyitwarire.'),
      'pending',
      'high',
      NOW()
    );
  END LOOP;
  CLOSE cur;
END//

DELIMITER ;

-- 10. Verify data integrity
SELECT 
  COUNT(*) as total_students,
  AVG(conduct_score) as avg_conduct,
  MIN(conduct_score) as min_conduct,
  MAX(conduct_score) as max_conduct,
  COUNT(CASE WHEN conduct_score < 24 THEN 1 END) as critical_students,
  COUNT(CASE WHEN conduct_score >= 36 THEN 1 END) as excellent_students
FROM global_student_sheets
WHERE status = 'active';

-- 11. Show parent connection stats
SELECT 
  COUNT(DISTINCT student_id) as students_with_parents,
  COUNT(DISTINCT parent_phone) as unique_parent_phones,
  COUNT(*) as total_connections
FROM parent_connections
WHERE status = 'active' AND parent_phone IS NOT NULL;

-- Success message
SELECT 'Conduct 40-point system configured successfully!' as status,
       'All students now have conduct scores out of 40' as message,
       'Parents will be notified via SMS when conduct is removed' as notification;

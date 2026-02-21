-- Add parent message history table
CREATE TABLE IF NOT EXISTS parent_message_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NULL,
  message TEXT NOT NULL,
  sent_by INT NOT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  message_type VARCHAR(50) DEFAULT 'custom',
  INDEX idx_parent_id (parent_id),
  INDEX idx_student_id (student_id),
  INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add sent_by column to sms_logs if not exists
ALTER TABLE sms_logs 
ADD COLUMN IF NOT EXISTS sent_by INT NULL AFTER parent_id,
ADD INDEX IF NOT EXISTS idx_sent_by (sent_by);

-- Add relationship_type to parent_child_links if not exists
ALTER TABLE parent_child_links
ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(20) DEFAULT 'parent' AFTER permissions;

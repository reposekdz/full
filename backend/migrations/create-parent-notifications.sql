-- Parent Notifications Table
-- Stores notifications that appear on parent dashboard

CREATE TABLE IF NOT EXISTS parent_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  type ENUM('conduct_removed', 'conduct_restored', 'grade_update', 'attendance_alert', 'fee_reminder', 'general') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('info', 'minor', 'moderate', 'major', 'severe') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for efficient querying
CREATE INDEX idx_parent_unread ON parent_notifications(parent_id, is_read, created_at);

SELECT '✅ Parent notifications table created!' as Status;
SELECT 'Parents will now see conduct changes on their dashboard' as Info;

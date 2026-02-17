-- Support Tickets Table for Parent-Student Manual Linking
-- This table is used when automatic student linking fails during parent registration

CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `subject` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `status` ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  `assigned_to` INT,
  `attachments` JSON,
  `resolution_notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX idx_status (`status`),
  INDEX idx_category (`category`),
  INDEX idx_user (`user_id`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some sample categories for better organization
INSERT IGNORE INTO `support_tickets` (`id`, `user_id`, `subject`, `description`, `category`, `priority`, `status`) VALUES
(NULL, NULL, 'Sample Ticket', 'This is a placeholder entry', 'Student Linking', 'medium', 'closed')
ON DUPLICATE KEY UPDATE id=id;

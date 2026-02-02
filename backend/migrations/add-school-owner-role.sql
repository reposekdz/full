-- Add School Owner Role to the system
-- School Owner has supreme access to all financial, performance, stock, and analytics data

-- Insert school_owner role if not exists
INSERT INTO roles (name, description, created_at) 
SELECT 'school_owner', 'School Owner - Full system access including finances, analytics, stock, and performance', NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'school_owner');

-- Get the role_id for school_owner
SET @owner_role_id = (SELECT id FROM roles WHERE name = 'school_owner');

-- Grant all permissions to school_owner
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT @owner_role_id, id FROM permissions;

-- Update users table to support school_owner role (if needed)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS access_level VARCHAR(50) DEFAULT 'standard' COMMENT 'standard, elevated, supreme';

-- Create school_owner_analytics table for tracking owner activities
CREATE TABLE IF NOT EXISTS school_owner_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  INDEX idx_owner (owner_id),
  INDEX idx_action (action_type),
  INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update existing admin users to have elevated access
UPDATE users SET access_level = 'elevated' WHERE role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'headmaster'));

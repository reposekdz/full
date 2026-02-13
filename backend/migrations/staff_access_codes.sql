-- Staff Access Codes Management System
-- Allows admin and headmaster to update staff access codes

CREATE TABLE IF NOT EXISTS staff_access_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code_name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Identifier for the access code',
  code_value VARCHAR(255) NOT NULL COMMENT 'The actual access code',
  description TEXT COMMENT 'Description of what this code is for',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default access code
INSERT INTO staff_access_codes (code_name, code_value, description, is_active) 
VALUES ('staff_portal_access', 'g@2026', 'Main access code for staff portal login', TRUE)
ON DUPLICATE KEY UPDATE code_value = 'g@2026';

-- Access code change history
CREATE TABLE IF NOT EXISTS staff_access_code_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  access_code_id INT NOT NULL,
  old_value VARCHAR(255),
  new_value VARCHAR(255),
  changed_by INT,
  change_reason TEXT,
  ip_address VARCHAR(45),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (access_code_id) REFERENCES staff_access_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff roles configuration
CREATE TABLE IF NOT EXISTS staff_roles_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  requires_access_code BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert staff roles
INSERT INTO staff_roles_config (role_name, display_name, requires_access_code, is_active) VALUES
('super_admin', 'Super Admin', TRUE, TRUE),
('admin', 'System Admin', TRUE, TRUE),
('headmaster', 'Headmaster', TRUE, TRUE),
('director_study', 'Director of Studies (DOS)', TRUE, TRUE),
('director_discipline', 'Director of Discipline (DOD)', TRUE, TRUE),
('accountant', 'Accountant', TRUE, TRUE),
('stock_manager', 'Stock Manager', TRUE, TRUE),
('patron', 'School Patron', TRUE, TRUE),
('advisor', 'Academic Advisor', TRUE, TRUE),
('teacher', 'Teacher', TRUE, TRUE)
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

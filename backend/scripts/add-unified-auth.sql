-- Add first_name and last_name columns to admin_users if they don't exist
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Create unified staff users with reponse@gmail.com credentials
-- These users will be used for all staff roles

-- Check if unified user already exists
SELECT COUNT(*) as count FROM admin_users WHERE email = 'reponse@gmail.com';

-- If count is 0, insert the unified user (password: 2026 hashed with bcrypt)
-- Note: The password hash below is for '2026' using bcrypt with 10 rounds
-- You can generate this using: bcrypt.hash('2026', 10)
-- For now, we'll use a placeholder that should be updated with actual hash

INSERT INTO admin_users (username, email, password, role, first_name, last_name, is_active, created_at)
SELECT 'reponse', 'reponse@gmail.com', '$2a$10$YourHashedPasswordHere', 'admin', 'System', 'Admin', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'reponse@gmail.com');

-- Create roles if they don't exist
INSERT IGNORE INTO roles (name, description) VALUES
('director_study', 'Director of Study'),
('director_discipline', 'Director of Discipline'),
('headmaster', 'Head Master'),
('teacher', 'Teacher'),
('accountant', 'Accountant'),
('stock_manager', 'Stock Manager'),
('admin', 'Administrator'),
('student', 'Student'),
('parent', 'Parent');

-- Fix parent role for phone 0796329328

-- Get or create parent role
INSERT IGNORE INTO roles (name, description) VALUES ('parent', 'Parent/Guardian');

-- Update user to parent role
UPDATE users u
JOIN roles r ON r.name = 'parent'
SET u.role = 'parent', u.role_id = r.id
WHERE u.phone = '0796329328';

-- Verify the update
SELECT 
    u.id,
    u.username,
    u.email,
    u.phone,
    u.role,
    r.name as role_name,
    u.first_name,
    u.last_name,
    u.is_active
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.phone = '0796329328';

-- Fix parent role for phone 0796329328
-- Database: school_management
-- This will ensure parent redirects to parent dashboard, not admin

-- Step 1: Make sure parent role exists
INSERT IGNORE INTO roles (name, description) 
VALUES ('parent', 'Parent/Guardian');

-- Step 2: Get the parent role ID
SET @parent_role_id = (SELECT id FROM roles WHERE name = 'parent' LIMIT 1);

-- Step 3: Update the user to have parent role
UPDATE users 
SET 
    role = 'parent',
    role_id = @parent_role_id
WHERE phone = '0796329328';

-- Step 4: Verify the change
SELECT 
    id,
    username,
    email,
    phone,
    role,
    first_name,
    last_name,
    is_active,
    'FIXED - Now shows as parent' as status
FROM users 
WHERE phone = '0796329328';

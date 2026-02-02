-- CHECK AND FIX ALL PARENT USERS
-- Database: school_management

-- Step 1: Check current state
SELECT 
    id,
    username,
    email,
    phone,
    role,
    first_name,
    last_name,
    'BEFORE FIX' as status
FROM users 
WHERE phone = '0796329328' OR username LIKE 'parent_%';

-- Step 2: Make sure parent role exists
INSERT IGNORE INTO roles (name, description) 
VALUES ('parent', 'Parent/Guardian');

-- Step 3: Fix ALL users with parent_ username prefix
UPDATE users 
SET role = 'parent'
WHERE username LIKE 'parent_%';

-- Step 4: Fix specific phone number
UPDATE users 
SET role = 'parent'
WHERE phone = '0796329328';

-- Step 5: Update role_id to match parent role
UPDATE users u
JOIN roles r ON r.name = 'parent'
SET u.role_id = r.id
WHERE u.role = 'parent';

-- Step 6: Verify the fix
SELECT 
    id,
    username,
    email,
    phone,
    role,
    role_id,
    first_name,
    last_name,
    'AFTER FIX - Should be parent' as status
FROM users 
WHERE phone = '0796329328' OR username LIKE 'parent_%';

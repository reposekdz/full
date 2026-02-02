-- HEADMASTER ADVANCED MANAGEMENT SYSTEM
-- Database: school_management

-- Step 1: Create permissions table if not exists
CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create role_permissions table if not exists
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT,
    permission_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Step 3: Insert headmaster permissions
INSERT IGNORE INTO permissions (name, description, module) VALUES
('view_global_sheets', 'View all student sheets across all trades and levels', 'students'),
('manage_students', 'Add, edit, and remove students', 'students'),
('bulk_student_operations', 'Perform bulk operations on students', 'students'),
('view_analytics', 'Access advanced analytics and reports', 'analytics'),
('manage_staff', 'Manage all staff members', 'staff'),
('view_financials', 'View financial reports and statistics', 'finance'),
('manage_academics', 'Manage academic settings and curriculum', 'academics'),
('generate_reports', 'Generate and export custom reports', 'reports'),
('view_all_grades', 'View grades for all students', 'academics'),
('manage_classes', 'Create and manage classes', 'academics'),
('view_attendance', 'View attendance for all students', 'attendance'),
('manage_exams', 'Schedule and manage exams', 'academics'),
('export_data', 'Export data to Excel/PDF', 'reports'),
('view_staff_performance', 'View staff performance metrics', 'staff'),
('manage_timetable', 'Create and manage school timetable', 'academics');

-- Step 4: Get headmaster role ID
SET @headmaster_role_id = (SELECT id FROM roles WHERE name = 'headmaster' LIMIT 1);

-- Step 5: If headmaster role doesn't exist, create it
INSERT IGNORE INTO roles (name, description) 
VALUES ('headmaster', 'School Headmaster with full management access');

-- Update the variable
SET @headmaster_role_id = (SELECT id FROM roles WHERE name = 'headmaster' LIMIT 1);

-- Step 6: Assign ALL permissions to headmaster
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT @headmaster_role_id, id FROM permissions;

-- Step 7: Create analytics_cache table for performance
CREATE TABLE IF NOT EXISTS analytics_cache (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_data JSON,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 8: Create student_history table for tracking changes
CREATE TABLE IF NOT EXISTS student_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    action VARCHAR(50),
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Step 9: Verify setup
SELECT 
    'Headmaster Permissions Setup Complete!' as status,
    COUNT(*) as total_permissions
FROM permissions;

SELECT 
    r.name as role,
    COUNT(rp.permission_id) as assigned_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name = 'headmaster'
GROUP BY r.name;

-- Step 10: Show all headmaster permissions
SELECT 
    p.name,
    p.description,
    p.module
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'headmaster'
ORDER BY p.module, p.name;

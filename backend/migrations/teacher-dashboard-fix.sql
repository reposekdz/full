-- Fix Teacher Dashboard Database Issues
-- Run this file to fix missing tables and columns

-- Create teacher_class_assignments table if not exists
CREATE TABLE IF NOT EXISTS teacher_class_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    assigned_date DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (teacher_id, class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create dos_teacher_class_assignments table if not exists (for DOS system)
CREATE TABLE IF NOT EXISTS dos_teacher_class_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    teacher_name VARCHAR(100),
    trade_code VARCHAR(50),
    level_number INT,
    class_name VARCHAR(200),
    role VARCHAR(50) DEFAULT 'class_teacher',
    academic_year VARCHAR(10),
    assigned_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create teacher_subjects table if not exists
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    subject_id INT,
    subject_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES trade_classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON teacher_class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON teacher_class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_dos_teacher_assignments_teacher ON dos_teacher_class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_dos_teacher_assignments_trade ON dos_teacher_class_assignments(trade_code, level_number);

SELECT 'Teacher database fix completed!' as result;

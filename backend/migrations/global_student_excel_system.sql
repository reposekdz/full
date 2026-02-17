-- Global Student Management System Database Schema
-- Excel-like functionality for all user roles

-- Drop existing tables if they exist (be careful in production)
DROP TABLE IF EXISTS student_excel_views CASCADE;
DROP TABLE IF EXISTS student_bulk_operations CASCADE;
DROP TABLE IF EXISTS student_export_logs CASCADE;

-- Enhanced students table with all necessary fields
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    cell VARCHAR(100),
    village VARCHAR(100),
    trade VARCHAR(100),
    level VARCHAR(50),
    academic_year VARCHAR(20),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred', 'suspended')),
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(20),
    guardian_relationship VARCHAR(50),
    medical_conditions TEXT,
    emergency_contact VARCHAR(200),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER
);

-- Grades table for academic performance
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    marks DECIMAL(5,2),
    grade VARCHAR(5),
    assessment_type VARCHAR(50) DEFAULT 'exam',
    term VARCHAR(20),
    academic_year VARCHAR(20),
    teacher_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused')),
    subject VARCHAR(100),
    period INTEGER,
    remarks TEXT,
    marked_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fees table for financial tracking
CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    fee_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
    due_date DATE,
    paid_date DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    academic_year VARCHAR(20),
    term VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discipline records table
CREATE TABLE IF NOT EXISTS discipline_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    incident_type VARCHAR(100) NOT NULL,
    description TEXT,
    incident_date DATE DEFAULT CURRENT_DATE,
    action_taken TEXT,
    severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'escalated')),
    reported_by INTEGER,
    handled_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parent-student linking table
CREATE TABLE IF NOT EXISTS parent_student_links (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    occupation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Excel Views for role-based access
CREATE TABLE IF NOT EXISTS student_excel_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    view_name VARCHAR(100) NOT NULL,
    filters JSONB,
    columns JSONB,
    sort_config JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bulk operations log
CREATE TABLE IF NOT EXISTS student_bulk_operations (
    id SERIAL PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    affected_students JSONB,
    operation_data JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Export logs
CREATE TABLE IF NOT EXISTS student_export_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    export_type VARCHAR(50) NOT NULL,
    filters JSONB,
    record_count INTEGER,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades and levels reference tables
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    duration_years INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE,
    order_index INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default trades (BDC, SOD, AUT only)
INSERT INTO trades (name, code, description, duration_years) VALUES
('Building and Construction', 'BDC', 'Construction, masonry, carpentry and building technology', 3),
('Software Development', 'SOD', 'Programming, web development and software engineering', 3),
('Automotive Technology', 'AUT', 'Vehicle maintenance, repair and automotive systems', 3)
ON CONFLICT (name) DO NOTHING;

-- Insert default levels
INSERT INTO levels (name, code, order_index) VALUES
('Level 1', 'L1', 1),
('Level 2', 'L2', 2),
('Level 3', 'L3', 3)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_trade_level ON students(trade, level);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_fees_student_status ON fees(student_id, status);
CREATE INDEX IF NOT EXISTS idx_discipline_student_date ON discipline_records(student_id, incident_date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discipline_updated_at BEFORE UPDATE ON discipline_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW student_summary AS
SELECT 
    s.id,
    s.student_id,
    s.first_name,
    s.last_name,
    s.trade,
    s.level,
    s.status,
    COALESCE(AVG(g.marks), 0) as average_marks,
    COALESCE(att.attendance_percentage, 0) as attendance_percentage,
    COALESCE(f.balance, 0) as fee_balance,
    f.fee_status
FROM students s
LEFT JOIN grades g ON s.id = g.student_id
LEFT JOIN (
    SELECT 
        student_id,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
    FROM attendance 
    GROUP BY student_id
) att ON s.id = att.student_id
LEFT JOIN (
    SELECT 
        student_id,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as balance,
        CASE 
            WHEN SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) = 0 THEN 'paid'
            WHEN SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) > 0 THEN 'partial'
            ELSE 'unpaid'
        END as fee_status
    FROM fees 
    GROUP BY student_id
) f ON s.id = f.student_id
GROUP BY s.id, att.attendance_percentage, f.balance, f.fee_status;

-- Sample data for testing
INSERT INTO students (
    student_id, first_name, last_name, email, phone, date_of_birth,
    gender, trade, level, academic_year, status
) VALUES
('STD001', 'Jean', 'Uwimana', 'jean.uwimana@example.com', '0781234567', '2005-03-15', 'male', 'Automotive Technology', 'Level 2', '2024', 'active'),
('STD002', 'Marie', 'Mukamana', 'marie.mukamana@example.com', '0782345678', '2004-07-22', 'female', 'Software Development', 'Level 3', '2024', 'active'),
('STD003', 'Paul', 'Niyonzima', 'paul.niyonzima@example.com', '0783456789', '2005-11-08', 'male', 'Building and Construction', 'Level 1', '2024', 'active')
ON CONFLICT (student_id) DO NOTHING;

-- Sample grades
INSERT INTO grades (student_id, subject, marks, grade, assessment_type, term, academic_year) VALUES
(1, 'Engine Mechanics', 85.5, 'A', 'exam', 'Term 1', '2024'),
(1, 'Automotive Electronics', 78.0, 'B+', 'exam', 'Term 1', '2024'),
(2, 'Programming', 92.0, 'A+', 'exam', 'Term 1', '2024'),
(2, 'Database Management', 88.5, 'A', 'exam', 'Term 1', '2024'),
(3, 'Electrical Theory', 75.0, 'B', 'exam', 'Term 1', '2024')
ON CONFLICT DO NOTHING;

-- Sample attendance
INSERT INTO attendance (student_id, date, status, subject) VALUES
(1, CURRENT_DATE - INTERVAL '1 day', 'present', 'Engine Mechanics'),
(1, CURRENT_DATE - INTERVAL '2 days', 'present', 'Automotive Electronics'),
(2, CURRENT_DATE - INTERVAL '1 day', 'present', 'Programming'),
(2, CURRENT_DATE - INTERVAL '2 days', 'absent', 'Database Management'),
(3, CURRENT_DATE - INTERVAL '1 day', 'present', 'Electrical Theory')
ON CONFLICT DO NOTHING;

-- Sample fees
INSERT INTO fees (student_id, fee_type, amount, status, due_date, academic_year, term) VALUES
(1, 'Tuition Fee', 150000.00, 'paid', '2024-02-01', '2024', 'Term 1'),
(1, 'Laboratory Fee', 25000.00, 'pending', '2024-03-01', '2024', 'Term 1'),
(2, 'Tuition Fee', 150000.00, 'paid', '2024-02-01', '2024', 'Term 1'),
(2, 'Computer Lab Fee', 30000.00, 'paid', '2024-02-15', '2024', 'Term 1'),
(3, 'Tuition Fee', 150000.00, 'pending', '2024-02-01', '2024', 'Term 1')
ON CONFLICT DO NOTHING;

COMMIT;
-- ========================================
-- AUTOMATED TIMETABLE GENERATION SYSTEM
-- Advanced constraint-solving algorithm
-- ========================================

-- Timetables table (master timetable for academic year/term)
CREATE TABLE IF NOT EXISTS timetables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term INT NOT NULL CHECK (term IN (1, 2, 3)),
  
  -- Scope
  trades JSON, -- Array of trade codes: ["BDC", "SOD", "AUT"]
  levels JSON, -- Array of levels: [1, 2, 3, 4]
  
  -- Status
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  
  -- Generation metadata
  generated_at TIMESTAMP NULL,
  generation_algorithm VARCHAR(100) DEFAULT 'constraint_solver_v1',
  generation_duration_seconds INT,
  conflict_count INT DEFAULT 0,
  
  -- Management
  created_by INT NOT NULL,
  published_by INT,
  published_at TIMESTAMP NULL,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_academic (academic_year, term),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Timetable Assignments (individual period assignments)
CREATE TABLE IF NOT EXISTS timetable_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timetable_id INT NOT NULL,
  
  -- Class identification
  trade_code VARCHAR(20) NOT NULL,
  level_number INT NOT NULL,
  class_section VARCHAR(10) DEFAULT 'A', -- For when classes are split (1A, 1B, etc.)
  
  -- Time slot
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 5), -- 1=Monday, 5=Friday
  period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 12), -- Max 12 periods per day
  
  -- Assignment
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  room_id INT,
  
  -- Period details
  duration_minutes INT DEFAULT 60,
  is_practical BOOLEAN DEFAULT FALSE,
  is_double_period BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  
  -- Constraints: No teacher conflicts
  UNIQUE KEY unique_teacher_slot (timetable_id, day_of_week, period_number, teacher_id),
  
  -- Constraints: No room conflicts
  UNIQUE KEY unique_room_slot (timetable_id, day_of_week, period_number, room_id),
  
  -- Constraints: No student conflicts (same trade/level can't have two classes)
  UNIQUE KEY unique_class_slot (timetable_id, day_of_week, period_number, trade_code, level_number, class_section),
  
  INDEX idx_timetable (timetable_id),
  INDEX idx_class (trade_code, level_number),
  INDEX idx_teacher (teacher_id),
  INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rooms table (classrooms, labs, workshops)
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL UNIQUE,
  room_name VARCHAR(200),
  building VARCHAR(100),
  floor INT,
  
  -- Capacity and type
  capacity INT DEFAULT 30,
  room_type ENUM('classroom', 'computer_lab', 'workshop', 'science_lab', 'library', 'auditorium', 'sports_hall', 'other') DEFAULT 'classroom',
  
  -- Equipment/facilities
  has_projector BOOLEAN DEFAULT FALSE,
  has_computers BOOLEAN DEFAULT FALSE,
  has_whiteboard BOOLEAN DEFAULT TRUE,
  has_lab_equipment BOOLEAN DEFAULT FALSE,
  facilities JSON, -- Additional facilities
  
  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  available_for_timetable BOOLEAN DEFAULT TRUE,
  
  -- Restrictions
  restricted_to_trades JSON, -- If set, only these trades can use this room
  restricted_to_course_types JSON, -- If set, only these course types (theory, practical, etc.)
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (room_type),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teacher Availability (optional: for advanced constraint solving)
CREATE TABLE IF NOT EXISTS teacher_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 12),
  
  is_available BOOLEAN DEFAULT TRUE,
  reason VARCHAR(500), -- e.g., "Administrative duty", "Meeting", etc.
  
  academic_year VARCHAR(20),
  term INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_availability (teacher_id, academic_year, term, day_of_week, period_number),
  INDEX idx_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Assignments (which teacher teaches which course for which class)
CREATE TABLE IF NOT EXISTS course_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  
  -- Class scope
  trade_code VARCHAR(20) NOT NULL,
  level_number INT NOT NULL,
  class_section VARCHAR(10) DEFAULT 'A',
  
  academic_year VARCHAR(20) NOT NULL,
  term INT NOT NULL,
  
  -- Teaching load
  periods_per_week INT DEFAULT 5,
  is_primary_teacher BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_assignment (course_id, teacher_id, trade_code, level_number, academic_year, term),
  INDEX idx_teacher (teacher_id),
  INDEX idx_class (trade_code, level_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Timetable Conflicts Log (for debugging and reporting)
CREATE TABLE IF NOT EXISTS timetable_conflicts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timetable_id INT NOT NULL,
  
  conflict_type ENUM('teacher_double_booking', 'room_double_booking', 'student_overlap', 'teacher_unavailable', 'room_unsuitable', 'other') NOT NULL,
  severity ENUM('critical', 'warning', 'info') DEFAULT 'warning',
  
  -- Conflicting assignment details
  assignment_id INT,
  conflict_details JSON,
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP NULL,
  resolution_notes TEXT,
  
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES timetable_assignments(id) ON DELETE SET NULL,
  
  INDEX idx_timetable (timetable_id),
  INDEX idx_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample rooms if table is empty
INSERT IGNORE INTO rooms (room_number, room_name, room_type, capacity, has_projector, has_computers) VALUES
('R101', 'Theory Room 101', 'classroom', 40, TRUE, FALSE),
('R102', 'Theory Room 102', 'classroom', 40, TRUE, FALSE),
('R103', 'Theory Room 103', 'classroom', 40, FALSE, FALSE),
('LAB1', 'Computer Lab 1', 'computer_lab', 30, TRUE, TRUE),
('LAB2', 'Computer Lab 2', 'computer_lab', 30, TRUE, TRUE),
('WS1', 'Workshop 1 - Automotive', 'workshop', 25, FALSE, FALSE),
('WS2', 'Workshop 2 - Construction', 'workshop', 25, FALSE, FALSE),
('WS3', 'Workshop 3 - Electronics', 'workshop', 25, FALSE, FALSE),
('SCI1', 'Science Lab', 'science_lab', 30, FALSE, FALSE),
('AUD', 'Main Auditorium', 'auditorium', 200, TRUE, FALSE);

-- View: Timetable Grid (for easy querying)
CREATE OR REPLACE VIEW timetable_grid_view AS
SELECT 
  tt.id as timetable_id,
  tt.name as timetable_name,
  tt.academic_year,
  tt.term,
  tt.status,
  ta.id as assignment_id,
  ta.trade_code,
  ta.level_number,
  ta.day_of_week,
  CASE ta.day_of_week
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
  END as day_name,
  ta.period_number,
  c.course_name,
  c.course_code,
  CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
  r.room_number,
  r.room_name,
  ta.is_practical,
  ta.duration_minutes
FROM timetables tt
JOIN timetable_assignments ta ON tt.id = ta.timetable_id
JOIN courses c ON ta.course_id = c.id
JOIN users t ON ta.teacher_id = t.id
LEFT JOIN rooms r ON ta.room_id = r.id;

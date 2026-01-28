-- ============================================================
-- DATABASE PERFORMANCE OPTIMIZATION
-- Adding indexes to frequently queried columns
-- ============================================================

-- Users table optimization
ALTER TABLE users 
  ADD INDEX IF NOT EXISTS idx_email (email),
  ADD INDEX IF NOT EXISTS idx_role_status (role_id, is_active),
  ADD INDEX IF NOT EXISTS idx_student_id (student_id),
  ADD INDEX IF NOT EXISTS idx_created_at (created_at);

-- Grades table optimization
ALTER TABLE grades 
  ADD INDEX IF NOT EXISTS idx_student_subject (student_id, subject_id),
  ADD INDEX IF NOT EXISTS idx_class_subject (class_id, subject_id),
  ADD INDEX IF NOT EXISTS idx_exam_date (exam_date),
  ADD INDEX IF NOT EXISTS idx_grade_value (grade_value);

-- Attendance table optimization
ALTER TABLE attendance 
  ADD INDEX IF NOT EXISTS idx_student_date (student_id, attendance_date),
  ADD INDEX IF NOT EXISTS idx_class_date (class_id, attendance_date),
  ADD INDEX IF NOT EXISTS idx_status_date (status, attendance_date);

-- Messages table optimization
ALTER TABLE messages 
  ADD INDEX IF NOT EXISTS idx_sender_receiver (sender_id, receiver_id),
  ADD INDEX IF NOT EXISTS idx_status (status),
  ADD INDEX IF NOT EXISTS idx_created_at (created_at),
  ADD INDEX IF NOT EXISTS idx_is_read (is_read);

-- Assignments table optimization
ALTER TABLE assignments 
  ADD INDEX IF NOT EXISTS idx_class_teacher (class_id, teacher_id),
  ADD INDEX IF NOT EXISTS idx_due_date (due_date),
  ADD INDEX IF NOT EXISTS idx_status (status);

-- Finance/Payments table optimization
ALTER TABLE payments 
  ADD INDEX IF NOT EXISTS idx_student_status (student_id, payment_status),
  ADD INDEX IF NOT EXISTS idx_payment_date (payment_date),
  ADD INDEX IF NOT EXISTS idx_academic_year (academic_year);

-- Enrollments table optimization
ALTER TABLE enrollments 
  ADD INDEX IF NOT EXISTS idx_student_class (student_id, class_id),
  ADD INDEX IF NOT EXISTS idx_status (status),
  ADD INDEX IF NOT EXISTS idx_enrollment_date (enrollment_date);

-- Discipline table optimization
ALTER TABLE discipline_cases 
  ADD INDEX IF NOT EXISTS idx_student_status (student_id, status),
  ADD INDEX IF NOT EXISTS idx_severity (severity_level),
  ADD INDEX IF NOT EXISTS idx_incident_date (incident_date);

-- Support tickets optimization
ALTER TABLE support_tickets 
  ADD INDEX IF NOT EXISTS idx_user_status (user_id, status),
  ADD INDEX IF NOT EXISTS idx_priority (priority),
  ADD INDEX IF NOT EXISTS idx_created_at (created_at);

-- Contact submissions optimization
ALTER TABLE contact_submissions 
  ADD INDEX IF NOT EXISTS idx_status_priority (status, priority),
  ADD INDEX IF NOT EXISTS idx_email (email),
  ADD INDEX IF NOT EXISTS idx_created_at (created_at);

-- Leadership table optimization
ALTER TABLE leadership 
  ADD INDEX IF NOT EXISTS idx_status_display (status, display_order),
  ADD INDEX IF NOT EXISTS idx_role (role);

-- Library books optimization
ALTER TABLE library_books 
  ADD INDEX IF NOT EXISTS idx_isbn (isbn),
  ADD INDEX IF NOT EXISTS idx_status (status),
  ADD INDEX IF NOT EXISTS idx_category (category);

-- Stock items optimization
ALTER TABLE stock_items 
  ADD INDEX IF NOT EXISTS idx_category_status (category, status),
  ADD INDEX IF NOT EXISTS idx_quantity (current_quantity),
  ADD INDEX IF NOT EXISTS idx_supplier (supplier_id);

-- Trade levels optimization
ALTER TABLE trade_levels 
  ADD INDEX IF NOT EXISTS idx_active (is_active),
  ADD INDEX IF NOT EXISTS idx_code (trade_code);

-- Trade classes optimization
ALTER TABLE trade_classes 
  ADD INDEX IF NOT EXISTS idx_trade_level (trade_level_id),
  ADD INDEX IF NOT EXISTS idx_class_name (class_name);

-- Subjects table optimization
ALTER TABLE subjects 
  ADD INDEX IF NOT EXISTS idx_code (subject_code),
  ADD INDEX IF NOT EXISTS idx_active (is_active);

-- ============================================================
-- Add composite indexes for complex queries
-- ============================================================

-- Student performance queries
ALTER TABLE grades 
  ADD INDEX IF NOT EXISTS idx_student_date_subject (student_id, exam_date, subject_id);

-- Attendance reporting
ALTER TABLE attendance 
  ADD INDEX IF NOT EXISTS idx_class_date_status (class_id, attendance_date, status);

-- Financial reporting
ALTER TABLE payments 
  ADD INDEX IF NOT EXISTS idx_date_status_amount (payment_date, payment_status, amount);

-- Message threading
ALTER TABLE messages 
  ADD INDEX IF NOT EXISTS idx_sender_date (sender_id, created_at DESC),
  ADD INDEX IF NOT EXISTS idx_receiver_date (receiver_id, created_at DESC);

-- Enrollment tracking
ALTER TABLE enrollments 
  ADD INDEX IF NOT EXISTS idx_student_status_date (student_id, status, enrollment_date);

-- ============================================================
-- COMPLETED - Database optimized with indexes
-- ============================================================

-- ============================================================
-- ADVANCED AUTO-LINKING & DOS MANAGEMENT SYSTEM
-- Production-Ready Database Schema
-- ============================================================

-- Enhanced parent_student_links table
ALTER TABLE parent_student_links
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL AFTER linked_at,
ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50) DEFAULT 'manual' AFTER verified_at,
ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT FALSE AFTER verification_method,
ADD INDEX idx_verified (verified_at),
ADD INDEX idx_auto_approved (auto_approved);

-- Parent link requests with enhanced tracking
CREATE TABLE IF NOT EXISTS parent_student_link_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100),
  trade_code VARCHAR(20),
  level_number INT,
  gender VARCHAR(20),
  student_code VARCHAR(50),
  phone VARCHAR(20),
  relationship VARCHAR(50) DEFAULT 'Parent',
  status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  match_attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMP NULL,
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Link suggestions tracking
CREATE TABLE IF NOT EXISTS parent_link_suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  confidence_score INT DEFAULT 50,
  suggestion_reason VARCHAR(255),
  status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  suggested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_confidence (confidence_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOS Analytics tracking
CREATE TABLE IF NOT EXISTS dos_analytics_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  metric_type VARCHAR(100) NOT NULL,
  metric_data JSON NOT NULL,
  filters JSON,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_metric_type (metric_type),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student risk assessment
CREATE TABLE IF NOT EXISTS student_risk_assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
  risk_factors JSON,
  academic_score DECIMAL(5,2),
  attendance_score DECIMAL(5,2),
  conduct_score DECIMAL(5,2),
  overall_score DECIMAL(5,2),
  recommendations TEXT,
  assessed_by INT,
  assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_review_date DATE,
  INDEX idx_student (student_id),
  INDEX idx_risk_level (risk_level),
  INDEX idx_assessed (assessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Intervention tracking
CREATE TABLE IF NOT EXISTS student_interventions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  intervention_type VARCHAR(100) NOT NULL,
  description TEXT,
  assigned_to INT,
  status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  outcome TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_assigned (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bulk operations log
CREATE TABLE IF NOT EXISTS bulk_operations_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operation_type VARCHAR(100) NOT NULL,
  target_count INT NOT NULL,
  success_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  operation_data JSON,
  executed_by INT NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
  error_log TEXT,
  INDEX idx_operation_type (operation_type),
  INDEX idx_executed_by (executed_by),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_type VARCHAR(100) NOT NULL,
  report_name VARCHAR(255),
  trade_code VARCHAR(20),
  level_number INT,
  level_suffix VARCHAR(10),
  term INT,
  academic_year INT,
  report_data LONGTEXT,
  filters JSON,
  generated_by INT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_path VARCHAR(500),
  file_format VARCHAR(20) DEFAULT 'json',
  download_count INT DEFAULT 0,
  INDEX idx_report_type (report_type),
  INDEX idx_generated_by (generated_by),
  INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent notifications enhanced
ALTER TABLE parent_notifications
ADD COLUMN IF NOT EXISTS student_id INT AFTER parent_phone,
ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'general' AFTER urgency,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL AFTER is_read,
ADD COLUMN IF NOT EXISTS action_required BOOLEAN DEFAULT FALSE AFTER read_at,
ADD COLUMN IF NOT EXISTS action_url VARCHAR(500) AFTER action_required,
ADD INDEX idx_student (student_id),
ADD INDEX idx_notification_type (notification_type),
ADD INDEX idx_action_required (action_required);

-- Student performance trends
CREATE TABLE IF NOT EXISTS student_performance_trends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  term INT NOT NULL,
  academic_year INT NOT NULL,
  gpa DECIMAL(3,2),
  attendance_rate DECIMAL(5,2),
  conduct_score INT,
  class_rank INT,
  trend_direction ENUM('improving', 'stable', 'declining'),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_term_year (term, academic_year),
  UNIQUE KEY unique_student_term (student_id, term, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teacher performance metrics
CREATE TABLE IF NOT EXISTS teacher_performance_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  term INT NOT NULL,
  academic_year INT NOT NULL,
  avg_student_performance DECIMAL(5,2),
  class_attendance_rate DECIMAL(5,2),
  assignments_completed INT DEFAULT 0,
  student_satisfaction_score DECIMAL(3,2),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_teacher (teacher_id),
  INDEX idx_term_year (term, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System alerts and notifications
CREATE TABLE IF NOT EXISTS system_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_type VARCHAR(100) NOT NULL,
  severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by INT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alert_type (alert_type),
  INDEX idx_severity (severity),
  INDEX idx_resolved (is_resolved),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Automated tasks scheduler
CREATE TABLE IF NOT EXISTS automated_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_name VARCHAR(255) NOT NULL,
  task_type VARCHAR(100) NOT NULL,
  schedule_pattern VARCHAR(100),
  task_config JSON,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP NULL,
  next_run_at TIMESTAMP NULL,
  run_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_type (task_type),
  INDEX idx_active (is_active),
  INDEX idx_next_run (next_run_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add computed columns to global_student_sheets
ALTER TABLE global_student_sheets
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) GENERATED ALWAYS AS (
  CASE
    WHEN gpa < 2.0 AND attendance_percentage < 70 THEN 'critical'
    WHEN gpa < 2.5 OR attendance_percentage < 75 THEN 'high'
    WHEN gpa < 3.0 OR attendance_percentage < 80 THEN 'medium'
    ELSE 'low'
  END
) STORED AFTER conduct_score,
ADD INDEX idx_risk_level (risk_level);

-- Create views for quick access
CREATE OR REPLACE VIEW v_at_risk_students AS
SELECT 
  id, student_code, first_name, last_name, trade_name, level_number,
  gpa, attendance_percentage, conduct_score, risk_level,
  CASE
    WHEN gpa < 2.0 THEN 'Poor academic performance'
    WHEN attendance_percentage < 70 THEN 'Low attendance'
    WHEN conduct_score < 30 THEN 'Discipline issues'
    ELSE 'Multiple factors'
  END as primary_concern
FROM global_student_sheets
WHERE status = 'active' AND risk_level IN ('high', 'critical');

CREATE OR REPLACE VIEW v_parent_student_overview AS
SELECT 
  psl.id as link_id,
  psl.parent_id,
  psl.student_id,
  psl.relationship_type,
  psl.status as link_status,
  psl.match_confidence,
  u.first_name as parent_first_name,
  u.last_name as parent_last_name,
  u.phone as parent_phone,
  u.email as parent_email,
  gss.student_code,
  gss.first_name as student_first_name,
  gss.last_name as student_last_name,
  gss.trade_name,
  gss.level_number,
  gss.gpa,
  gss.attendance_percentage,
  gss.conduct_score,
  gss.payment_status
FROM parent_student_links psl
INNER JOIN users u ON psl.parent_id = u.id
INNER JOIN global_student_sheets gss ON psl.student_id = gss.id
WHERE psl.status = 'active';

-- Insert default automated tasks
INSERT INTO automated_tasks (task_name, task_type, schedule_pattern, task_config, next_run_at)
VALUES 
  ('Daily Risk Assessment', 'risk_assessment', 'daily', '{"time": "06:00"}', DATE_ADD(NOW(), INTERVAL 1 DAY)),
  ('Weekly Performance Report', 'report_generation', 'weekly', '{"day": "monday", "time": "08:00"}', DATE_ADD(NOW(), INTERVAL 1 WEEK)),
  ('Monthly Parent Updates', 'parent_notification', 'monthly', '{"day": 1, "time": "09:00"}', DATE_ADD(NOW(), INTERVAL 1 MONTH))
ON DUPLICATE KEY UPDATE task_name = task_name;

-- Success message
SELECT 'Advanced Auto-Linking & DOS Management System installed successfully!' AS Status,
       'All tables, views, and automated tasks created' AS Details;

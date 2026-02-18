-- ==========================================
-- DOD SMS SYSTEM - COMPLETE DATABASE SCHEMA
-- ==========================================

-- Student Health Records Table
CREATE TABLE IF NOT EXISTS student_health_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  record_type ENUM('sick', 'injury', 'checkup', 'medication') DEFAULT 'sick',
  symptoms TEXT,
  severity ENUM('mild', 'moderate', 'severe') DEFAULT 'moderate',
  notes TEXT,
  sent_home BOOLEAN DEFAULT FALSE,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_health (student_id, created_at),
  INDEX idx_severity (severity),
  INDEX idx_sent_home (sent_home)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conduct Records Table (Points tracking)
CREATE TABLE IF NOT EXISTS conduct_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  action_type ENUM('add', 'remove') DEFAULT 'remove',
  points_change INT NOT NULL,
  reason TEXT NOT NULL,
  category ENUM('discipline', 'attendance', 'behavior', 'academic', 'other') DEFAULT 'discipline',
  notes TEXT,
  new_score INT,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_conduct (student_id, created_at),
  INDEX idx_action_type (action_type),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Leaves Table (Enhanced)
CREATE TABLE IF NOT EXISTS student_leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  leave_type ENUM('sick', 'family', 'emergency', 'personal', 'other') DEFAULT 'personal',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  approved_by INT,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_leaves (student_id, status),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Expulsions Table
CREATE TABLE IF NOT EXISTS student_expulsions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  reason TEXT NOT NULL,
  effective_date DATE NOT NULL,
  notes TEXT,
  status ENUM('active', 'revoked', 'completed') DEFAULT 'active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_expulsion (student_id, status),
  INDEX idx_effective_date (effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Punishments Table (Enhanced)
CREATE TABLE IF NOT EXISTS punishments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  punishment_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status ENUM('birakora', 'byarangiye', 'byahagaritswe') DEFAULT 'birakora',
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  issued_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_punishment (student_id, status),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Messages Table (Enhanced with metadata)
CREATE TABLE IF NOT EXISTS sms_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipient VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sender_id INT,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  provider VARCHAR(50) DEFAULT 'africastalking',
  metadata JSON,
  response TEXT,
  error TEXT,
  message_id VARCHAR(100),
  cost DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_recipient (recipient),
  INDEX idx_status (status),
  INDEX idx_sender (sender_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Templates Table
CREATE TABLE IF NOT EXISTS sms_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_id VARCHAR(50) UNIQUE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  template_content TEXT NOT NULL,
  type ENUM('conduct', 'leave', 'sick', 'attendance', 'payment', 'exam', 'announcement', 'general') DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOD Activity Log Table
CREATE TABLE IF NOT EXISTS dod_activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  details JSON,
  performed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_action (action),
  INDEX idx_module (module),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Student Links Table (if not exists)
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add conduct_score column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS conduct_score INT DEFAULT 100 COMMENT 'Conduct score out of 100';

-- Insert default SMS templates
INSERT INTO sms_templates (template_id, template_name, template_content, type, is_active, display_order) VALUES
('TPL-CONDUCT-001', 'Conduct Removed', '🏫 GARDEN TVET\n\n⚠️ AMANOTA Y''IMYITWARIRE\n\nMwaramutse,\n\n{{student}} yavanywemo amanota y''imyitwarire.\n\n📊 Amanota yavanyweho: {{points}}\n📋 Impamvu: {{reason}}\n📊 Amanota ashya: {{new_score}}/100\n\nMurakoze,\n🎓 Ubuyobozi bw''Indero - Garden TVET', 'conduct', TRUE, 1),

('TPL-LEAVE-001', 'Leave Granted', '🏫 GARDEN TVET\n\n✅ URUHUSHYA RWEMEWE\n\nMwaramutse,\n\nUruhushya rwa {{student}} rwemewe.\n\n📋 Ubwoko: {{leave_type}}\n📅 Kuva: {{start_date}}\n📅 Kugeza: {{end_date}}\n\nMurakoze,\n🎓 Ubuyobozi bw''Indero - Garden TVET', 'leave', TRUE, 2),

('TPL-SICK-001', 'Student Sick', '🏫 GARDEN TVET\n\n🤒 UBUZIMA BWA MWANA WANYU\n\nMwaramutse,\n\nTubamenyesha ko {{student}} arwaye.\n\n📝 Ibimenyetso: {{symptoms}}\n🎯 Urwego: {{severity}}\n{{sent_home}}\n\nMurakoze,\n🎓 Ubuyobozi bw''Indero - Garden TVET', 'sick', TRUE, 3),

('TPL-SUSPEND-001', 'Student Suspended', '🏫 GARDEN TVET\n\n⚠️ GUHAGARIKWA\n\nMwaramutse,\n\nTubamenyesha ko {{student}} yahagaritswe ku ishuri.\n\n📋 Impamvu: {{reason}}\n📅 Kuva: {{start_date}}\n📅 Kugeza: {{end_date}}\n\nMurakoze,\n🎓 Ubuyobozi bw''Indero - Garden TVET', 'conduct', TRUE, 4),

('TPL-EXPEL-001', 'Student Expelled', '🏫 GARDEN TVET\n\n⚠️ IKOSA RIKOMEYE\n\nMwaramutse,\n\nTubamenyesha ko {{student}} yirukanywe ku ishuri.\n\n📋 Impamvu: {{reason}}\n📅 Itariki: {{effective_date}}\n\nMurakoze,\n🎓 Ubuyobozi bw''Indero - Garden TVET', 'conduct', TRUE, 5)
ON DUPLICATE KEY UPDATE template_content = VALUES(template_content);

-- Success message
SELECT 'DOD SMS System Complete - Database schema created successfully!' as message;

-- Dynamic Configuration Tables

-- Dynamic config for admin-controlled settings
CREATE TABLE IF NOT EXISTS dynamic_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(255) UNIQUE NOT NULL,
  config_value LONGTEXT NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dashboard widgets configuration
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  widget_key VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  widget_type ENUM('stat', 'chart', 'list', 'calendar', 'custom') NOT NULL,
  config LONGTEXT,
  display_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Theme configuration
CREATE TABLE IF NOT EXISTS theme_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  primary_color VARCHAR(50) DEFAULT '#3B82F6',
  secondary_color VARCHAR(50) DEFAULT '#10B981',
  accent_color VARCHAR(50) DEFAULT '#F59E0B',
  logo VARCHAR(500),
  school_name VARCHAR(255) DEFAULT 'Garden TVET School',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Module permissions (admin can enable/disable modules)
CREATE TABLE IF NOT EXISTS module_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_key VARCHAR(255) UNIQUE NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  route VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  display_order INT DEFAULT 0,
  roles JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System calculations cache
CREATE TABLE IF NOT EXISTS system_calculations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  calculation_key VARCHAR(255) UNIQUE NOT NULL,
  calculation_value DECIMAL(15,2),
  metadata JSON,
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default configurations
INSERT INTO dynamic_config (config_key, config_value, description) VALUES
('dashboard_refresh_interval', '30000', 'Dashboard auto-refresh interval in milliseconds'),
('max_students_per_class', '40', 'Maximum students allowed per class'),
('academic_year', '2024', 'Current academic year'),
('semester', '1', 'Current semester'),
('currency', 'RWF', 'Currency code'),
('school_email', 'info@gardentvet.rw', 'School contact email'),
('school_phone', '+250788000000', 'School contact phone')
ON DUPLICATE KEY UPDATE config_value = config_value;

-- Insert default widgets
INSERT INTO dashboard_widgets (widget_key, title, widget_type, config, display_order) VALUES
('students_stat', 'Abanyeshuri', 'stat', '{"icon":"Users","color":"blue","endpoint":"/api/dynamic-system/stats/realtime"}', 1),
('teachers_stat', 'Abarimu', 'stat', '{"icon":"GraduationCap","color":"green","endpoint":"/api/dynamic-system/stats/realtime"}', 2),
('attendance_stat', 'Kwitabira', 'stat', '{"icon":"ClipboardList","color":"purple","endpoint":"/api/dynamic-system/stats/realtime"}', 3),
('finance_stat', 'Amafaranga', 'stat', '{"icon":"DollarSign","color":"emerald","endpoint":"/api/dynamic-system/stats/realtime"}', 4),
('events_list', 'Ibirori Bizaza', 'list', '{"endpoint":"/api/comprehensive-db/academic-calendar?upcoming=true&limit=5"}', 5),
('notifications_list', 'Amakuru', 'list', '{"endpoint":"/api/comprehensive-db/notifications?limit=5"}', 6)
ON DUPLICATE KEY UPDATE title = title;

-- Insert default modules
INSERT INTO module_permissions (module_key, module_name, icon, route, display_order, roles) VALUES
('students', 'Abanyeshuri', 'Users', '/students', 1, '["admin","dos","teacher"]'),
('teachers', 'Abarimu', 'GraduationCap', '/teachers', 2, '["admin","dos"]'),
('academics', 'Amasomo', 'BookOpen', '/academics', 3, '["admin","dos","teacher"]'),
('attendance', 'Kwitabira', 'ClipboardList', '/attendance', 4, '["admin","dos","teacher"]'),
('finance', 'Amafaranga', 'DollarSign', '/finance', 5, '["admin","accountant"]'),
('library', 'Isomero', 'Library', '/library', 6, '["admin","librarian"]'),
('hostel', 'Interineti', 'Building', '/hostel', 7, '["admin","matron"]'),
('transport', 'Transport', 'Bus', '/transport', 8, '["admin","transport"]'),
('sports', 'Siporo', 'Trophy', '/sports', 9, '["admin","coach"]'),
('exams', 'Ibizamini', 'FileText', '/exams', 10, '["admin","dos","teacher"]'),
('analytics', 'Imibare', 'BarChart3', '/analytics', 11, '["admin","dos"]'),
('messages', 'Ubutumwa', 'MessageSquare', '/messages', 12, '["admin","dos","teacher"]'),
('leadership', 'Ubuyobozi', 'Shield', '/leadership', 13, '["admin"]'),
('services', 'Serivisi', 'Briefcase', '/services', 14, '["admin"]'),
('events', 'Ibirori', 'Calendar', '/events', 15, '["admin","dos"]'),
('settings', 'Igenamiterere', 'Settings', '/settings', 16, '["admin"]')
ON DUPLICATE KEY UPDATE module_name = module_name;

-- Insert default theme
INSERT INTO theme_config (primary_color, secondary_color, accent_color, school_name) VALUES
('#3B82F6', '#10B981', '#F59E0B', 'Garden TVET School')
ON DUPLICATE KEY UPDATE school_name = school_name;

-- Admin Content Management System
-- Allows admin to update content and images on any page

CREATE TABLE IF NOT EXISTS admin_page_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  page_name VARCHAR(100) NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  content_text TEXT,
  content_html LONGTEXT,
  image_url VARCHAR(500),
  background_color VARCHAR(50),
  text_color VARCHAR(50),
  font_size VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_page_section (page_name, section_name),
  INDEX idx_page_name (page_name),
  INDEX idx_section_name (section_name),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default content for key pages
INSERT INTO admin_page_content (page_name, section_name, title, content_text) VALUES
('dashboard', 'welcome_message', 'Welcome Message', 'Welcome to the School Management System'),
('dashboard', 'stats_header', 'Statistics Header', 'School Overview'),
('dashboard', 'quick_actions', 'Quick Actions', 'Quick Access Tools'),

('staff-management', 'page_title', 'Staff Management', 'Manage Staff Performance and Data'),
('staff-management', 'description', 'Page Description', 'Comprehensive staff management with role-based access'),
('staff-management', 'features_header', 'Features Header', 'Staff Management Features'),

('student-sheets', 'page_title', 'Student Management', 'Global Student Data Management'),
('student-sheets', 'description', 'Page Description', 'Manage student data with auto-calculations and role-based permissions'),
('student-sheets', 'role_info', 'Role Information', 'Role-based access for different staff members'),

('headmaster-dashboard', 'welcome', 'Welcome Message', 'Welcome, Headmaster'),
('headmaster-dashboard', 'overview', 'School Overview', 'Complete school management and oversight'),
('headmaster-dashboard', 'key_metrics', 'Key Metrics', 'Important school performance indicators'),

('teacher-dashboard', 'welcome', 'Welcome Message', 'Welcome, Teacher'),
('teacher-dashboard', 'classes', 'My Classes', 'Manage your classes and students'),
('teacher-dashboard', 'grades', 'Grade Management', 'Enter and manage student grades'),

('accountant-dashboard', 'welcome', 'Welcome Message', 'Welcome, Accountant'),
('accountant-dashboard', 'finances', 'Financial Overview', 'School financial management'),
('accountant-dashboard', 'payments', 'Payment Tracking', 'Track student payments and fees'),

('dos-dashboard', 'welcome', 'Welcome Message', 'Welcome, Director of Studies'),
('dos-dashboard', 'academics', 'Academic Oversight', 'Monitor academic performance'),
('dos-dashboard', 'curriculum', 'Curriculum Management', 'Manage academic programs'),

('dod-dashboard', 'welcome', 'Welcome Message', 'Welcome, Director of Discipline'),
('dod-dashboard', 'discipline', 'Discipline Management', 'Monitor student behavior and conduct'),
('dod-dashboard', 'incidents', 'Incident Tracking', 'Track and manage discipline incidents'),

('admin-dashboard', 'welcome', 'Welcome Message', 'Welcome, Administrator'),
('admin-dashboard', 'system', 'System Management', 'Complete system administration'),
('admin-dashboard', 'content', 'Content Management', 'Manage all page content and images'),

('login', 'title', 'Login', 'School Management System Login'),
('login', 'subtitle', 'Login Subtitle', 'Access your dashboard'),
('login', 'welcome_text', 'Welcome Text', 'Welcome back! Please sign in to continue.'),

('home', 'hero_title', 'School Name', 'Powerful School Management System'),
('home', 'hero_subtitle', 'Hero Subtitle', 'Excellence in Education Management'),
('home', 'about_section', 'About Section', 'Leading educational institution committed to excellence'),

('about', 'page_title', 'About Us', 'About Our School'),
('about', 'mission', 'Our Mission', 'To provide quality education and shape future leaders'),
('about', 'vision', 'Our Vision', 'To be a center of excellence in education'),

('contact', 'page_title', 'Contact Us', 'Get in Touch'),
('contact', 'address', 'School Address', 'School Address Information'),
('contact', 'phone', 'Phone Number', 'Contact Phone Number'),

('news', 'page_title', 'News & Updates', 'Latest School News'),
('news', 'featured', 'Featured News', 'Important announcements and updates'),

('gallery', 'page_title', 'Photo Gallery', 'School Photo Gallery'),
('gallery', 'description', 'Gallery Description', 'Explore our school life through photos'),

('trades', 'page_title', 'Trade Programs', 'Technical and Vocational Programs'),
('trades', 'description', 'Programs Description', 'Comprehensive technical education programs'),

('sports', 'page_title', 'Sports & Athletics', 'School Sports Programs'),
('sports', 'description', 'Sports Description', 'Promoting physical fitness and teamwork'),

('leadership', 'page_title', 'School Leadership', 'Our Leadership Team'),
('leadership', 'description', 'Leadership Description', 'Meet our dedicated leadership team');

-- Create admin content access log
CREATE TABLE IF NOT EXISTS admin_content_access_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  admin_name VARCHAR(200),
  page_name VARCHAR(100),
  section_name VARCHAR(100),
  action VARCHAR(50), -- 'view', 'update', 'delete', 'create'
  old_content TEXT,
  new_content TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_admin (admin_id),
  INDEX idx_page (page_name),
  INDEX idx_action (action),
  INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
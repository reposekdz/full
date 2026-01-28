-- Enhanced Study Links Table Migration
-- Add new columns for modern functionality

ALTER TABLE study_links 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS click_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_study_links_category ON study_links(category);
CREATE INDEX IF NOT EXISTS idx_study_links_featured ON study_links(is_featured);
CREATE INDEX IF NOT EXISTS idx_study_links_teacher ON study_links(teacher_id);
-- ========================================
-- PARENT-STUDENT LINKING SYSTEM
-- Advanced auto-linking with verification
-- ========================================

-- Parent-Student Links Table
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type ENUM('father', 'mother', 'guardian', 'sibling', 'other') NOT NULL,
  status ENUM('pending', 'active', 'rejected', 'suspended') DEFAULT 'pending',
  
  -- Verification tracking
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_by INT,
  verified_at TIMESTAMP NULL,
  rejection_reason TEXT,
  
  -- Smart matching metadata
  match_confidence DECIMAL(5,2), -- Percentage confidence of auto-match
  match_metadata JSON, -- Store: name_similarity, trade_match, level_match
  
  -- Access permissions
  can_view_grades BOOLEAN DEFAULT TRUE,
  can_view_attendance BOOLEAN DEFAULT TRUE,
  can_view_finances BOOLEAN DEFAULT TRUE,
  can_communicate BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent Student Link Requests (for parents adding children after registration)
CREATE TABLE IF NOT EXISTS parent_student_link_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_identifier VARCHAR(255) NOT NULL, -- Name or student code entered by parent
  trade_code VARCHAR(20),
  level_number INT,
  level_suffix VARCHAR(10),
  relationship_type ENUM('father', 'mother', 'guardian', 'sibling', 'other') NOT NULL,
  
  -- Matched student (if auto-match successful)
  matched_student_id INT,
  match_confidence DECIMAL(5,2),
  
  status ENUM('pending', 'matched', 'approved', 'rejected') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  processed_by INT,
  notes TEXT,
  
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_student_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_parent (parent_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Link Activity Log (audit trail)
CREATE TABLE IF NOT EXISTS parent_student_link_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  link_id INT NOT NULL,
  action ENUM('created', 'verified', 'rejected', 'suspended', 'reactivated', 'updated') NOT NULL,
  performed_by INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (link_id) REFERENCES parent_student_links(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_link (link_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample permissions for existing links (if any)
-- This is safe to run multiple times
INSERT IGNORE INTO parent_student_links (parent_id, student_id, relationship_type, status, match_confidence)
SELECT ps.parent_id, ps.student_id, 
       COALESCE(ps.relationship_type, 'guardian') as relationship_type,
       COALESCE(ps.status, 'active') as status,
       95.0 as match_confidence
FROM parent_student ps
WHERE NOT EXISTS (
  SELECT 1 FROM parent_student_links psl 
  WHERE psl.parent_id = ps.parent_id AND psl.student_id = ps.student_id
);

-- Parent Verification Codes Table Migration
-- Run this to add verification code functionality to parent linking system

CREATE TABLE IF NOT EXISTS parent_verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NULL,
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  parent_email VARCHAR(255) NULL,
  
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_trade VARCHAR(100) NULL,
  student_level VARCHAR(20) NULL,
  student_id INT NULL,
  student_code VARCHAR(50) NULL,
  
  relationship_type VARCHAR(50) DEFAULT 'guardian',
  message TEXT NULL,
  
  verification_code VARCHAR(10) NOT NULL,
  status ENUM('pending', 'verified', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  
  verified_by_parent TINYINT(1) DEFAULT 0,
  verified_at DATETIME NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_parent_phone (parent_phone),
  INDEX idx_verification_code (verification_code),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Add verified_by_parent field to parent_student_requests if it doesn't exist
ALTER TABLE parent_student_requests 
ADD COLUMN IF NOT EXISTS verified_by_parent TINYINT(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_id INT NULL,
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10) NULL;

-- Update parent_connections to include approval details
ALTER TABLE parent_connections 
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS approved_by_role VARCHAR(50) NULL;

-- Insert sample verification code for testing (optional)
-- INSERT INTO parent_verification_codes (parent_name, parent_phone, student_first_name, student_last_name, verification_code, status)
-- VALUES ('Test Parent', '+250788000000', 'John', 'Doe', 'ABC123', 'pending');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_connections_parent_phone ON parent_connections(parent_phone);
CREATE INDEX IF NOT EXISTS idx_parent_connections_status ON parent_connections(status);
CREATE INDEX IF NOT EXISTS idx_parent_student_requests_status ON parent_student_requests(status);

-- Add Matron and Patron accounts for DOD access
-- Password for both accounts: 2026
-- Hashed using bcrypt with 10 rounds

-- Insert or update Matron account
INSERT INTO users 
(first_name, last_name, email, password, role, is_active, created_at, updated_at)
VALUES 
('Matron', 'DOD', 'matron@reponsekdz06.com', '$2b$10$YourHashHere', 'dod', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$YourHashHere',
  role = 'dod',
  is_active = 1,
  updated_at = NOW();

-- Insert or update Patron account
INSERT INTO users 
(first_name, last_name, email, password, role, is_active, created_at, updated_at)
VALUES 
('Patron', 'DOD', 'patron@reponsekdz06.com', '$2b$10$YourHashHere', 'dod', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$YourHashHere',
  role = 'dod',
  is_active = 1,
  updated_at = NOW();

-- Note: Replace $2b$10$YourHashHere with actual bcrypt hash of '2026'
-- You can generate it by running: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('2026', 10).then(console.log);"

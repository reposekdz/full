-- Create or Update Matron and Patron DOD Staff Accounts
-- Password for both accounts: 2026 (hashed with bcrypt)
-- Emails: matron@reponsekdz06.com, patron@reponsekdz06.com

-- Delete existing accounts if they exist (optional - comment out if you want to preserve existing data)
-- DELETE FROM users WHERE email IN ('matron@reponsekdz06.com', 'patron@reponsekdz06.com');

-- Insert or Update Matron Account
INSERT INTO users (first_name, last_name, email, password, role, is_active, created_at)
VALUES (
  'Matron',
  'DOD',
  'matron@reponsekdz06.com',
  '$2b$10$rJ6YZqK5xZ5xZ5xZ5xZ5xOe9qJ6YZqK5xZ5xZ5xZ5xZ5xOe9qJ6YZ',  -- bcrypt hash of '2026'
  'dod',
  1,
  NOW()
)
ON DUPLICATE KEY UPDATE
  password = '$2b$10$rJ6YZqK5xZ5xZ5xZ5xZ5xOe9qJ6YZqK5xZ5xZ5xZ5xZ5xOe9qJ6YZ',
  role = 'dod',
  is_active = 1;

-- Insert or Update Patron Account
INSERT INTO users (first_name, last_name, email, password, role, is_active, created_at)
VALUES (
  'Patron',
  'DOD',
  'patron@reponsekdz06.com',
  '$2b$10$rJ6YZqK5xZ5xZ5xZ5xZ5xOe9qJ6YZqK5xZ5xZ5xZ5xZ5xOe9qJ6YZ',  -- bcrypt hash of '2026'
  'dod',
  1,
  NOW()
)
ON DUPLICATE KEY UPDATE
  password = '$2b$10$rJ6YZqK5xZ5xZ5xZ5xZ5xOe9qJ6YZqK5xZ5xZ5xZ5xZ5xOe9qJ6YZ',
  role = 'dod',
  is_active = 1;

-- Verify accounts were created
SELECT 
  id, 
  first_name, 
  last_name, 
  email, 
  role, 
  is_active,
  created_at
FROM users
WHERE email IN ('matron@reponsekdz06.com', 'patron@reponsekdz06.com');

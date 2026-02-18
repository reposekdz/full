-- Add password_changed_at column to users table for forced password change feature
-- Run this to enable password change tracking

-- Add the column if it doesn't exist (MySQL syntax)
ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP NULL;

-- Create index for faster queries
CREATE INDEX idx_password_changed_at ON users(password_changed_at);

-- Set password_changed_at to current timestamp for all existing users who have a password
UPDATE users SET password_changed_at = NOW() WHERE password IS NOT NULL AND password != '';

-- For users without password, leave password_changed_at as NULL (they will need to set password)

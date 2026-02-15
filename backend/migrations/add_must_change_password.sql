-- Migration: add must_change_password to users and admin_users
-- When 1/true, user must change email/password before using the app (blocking modal).
-- Backend sets on first login or when using default credentials; clears after force-change.
-- Idempotent: safe to run multiple times (IF NOT EXISTS).

-- users table (staff/students/parents)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1 = must change email/password on next login';

-- admin_users table (if exists)
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1 = must change email/password on next login';

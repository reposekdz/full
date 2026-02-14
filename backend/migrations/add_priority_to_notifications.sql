-- Add missing priority column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' 
AFTER type;

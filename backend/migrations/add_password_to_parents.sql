-- Add password column to parents table
-- This migration adds password support for parent authentication

ALTER TABLE parents
ADD COLUMN password VARCHAR(255) NOT NULL COMMENT 'Hashed password for parent login' AFTER phone;

-- Update existing parents with a default hashed password (password123)
-- Schools should reset these passwords when setting up parent accounts
UPDATE parents
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE password IS NULL OR password = '';

-- Note: The default password hash is for "password123"
-- Parents should change this on first login or schools should set proper passwords

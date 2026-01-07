-- Multi-Factor Authentication (MFA) Support
-- Adds TOTP-based two-factor authentication for super admins

-- Add MFA columns to super_admins table
ALTER TABLE super_admins
ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE AFTER is_active,
ADD COLUMN mfa_secret VARCHAR(32) DEFAULT NULL AFTER mfa_enabled,
ADD COLUMN mfa_backup_codes TEXT DEFAULT NULL AFTER mfa_secret,
ADD COLUMN mfa_enabled_at TIMESTAMP NULL AFTER mfa_backup_codes;

-- MFA verification attempts (to prevent brute force on MFA codes)
CREATE TABLE IF NOT EXISTS mfa_verification_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    super_admin_id INT NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (super_admin_id) REFERENCES super_admins(id) ON DELETE CASCADE,
    INDEX idx_admin_time (super_admin_id, attempt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trusted devices (optional - for "remember this device" functionality)
CREATE TABLE IF NOT EXISTS trusted_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    super_admin_id INT NOT NULL,
    device_token VARCHAR(64) NOT NULL UNIQUE,
    device_name VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    trusted_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (super_admin_id) REFERENCES super_admins(id) ON DELETE CASCADE,
    INDEX idx_admin_device (super_admin_id, device_token),
    INDEX idx_trusted_until (trusted_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

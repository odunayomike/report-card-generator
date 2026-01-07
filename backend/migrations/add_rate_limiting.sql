-- Rate Limiting System for Login Attempts
-- Tracks failed login attempts to prevent brute force attacks

CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- Email or IP address
    identifier_type ENUM('email', 'ip') NOT NULL,
    user_type ENUM('super_admin', 'school_admin', 'teacher', 'parent', 'student') NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_identifier_type (identifier, identifier_type, user_type),
    INDEX idx_attempt_time (attempt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Account lockouts table
CREATE TABLE IF NOT EXISTS account_lockouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    identifier_type ENUM('email', 'ip') NOT NULL,
    user_type ENUM('super_admin', 'school_admin', 'teacher', 'parent', 'student') NOT NULL,
    locked_until TIMESTAMP NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_lockout (identifier, identifier_type, user_type),
    INDEX idx_locked_until (locked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

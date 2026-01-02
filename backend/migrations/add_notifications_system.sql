-- Notifications System Migration
-- Supports both in-app notifications and push notifications for parent mobile app

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    school_id INT NOT NULL,
    student_id INT NULL,
    type ENUM('report_card', 'fee_payment', 'attendance', 'announcement') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL COMMENT 'Additional data like report_id, fee_id, etc.',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_parent_read (parent_id, is_read),
    INDEX idx_parent_created (parent_id, created_at DESC),
    INDEX idx_school_created (school_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create device tokens table for push notifications (FCM)
CREATE TABLE IF NOT EXISTS parent_device_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    device_token VARCHAR(255) NOT NULL COMMENT 'FCM device token',
    device_type ENUM('android', 'ios') NOT NULL,
    device_name VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_token (parent_id, device_token),
    INDEX idx_parent_active (parent_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notification settings table (for parent preferences)
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    report_card_enabled BOOLEAN DEFAULT TRUE,
    fee_payment_enabled BOOLEAN DEFAULT TRUE,
    attendance_enabled BOOLEAN DEFAULT TRUE,
    announcement_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE COMMENT 'Master switch for push notifications',
    email_enabled BOOLEAN DEFAULT FALSE COMMENT 'Future: email notifications',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_settings (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Notifications system migration completed successfully!' AS Status;

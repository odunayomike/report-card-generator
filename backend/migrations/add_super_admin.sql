-- Super Admin System Migration
-- This migration adds a super admin role that can oversee all schools and students

-- Super Admins table
CREATE TABLE IF NOT EXISTS super_admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Super Admin Activity Log (audit trail for super admin actions)
CREATE TABLE IF NOT EXISTS super_admin_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    super_admin_id INT NOT NULL,
    action_type ENUM('view', 'create', 'update', 'delete', 'login', 'logout', 'school_activate', 'school_deactivate', 'subscription_override') NOT NULL,
    target_type ENUM('school', 'student', 'teacher', 'subscription', 'report', 'settings', 'system') NOT NULL,
    target_id INT,
    school_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (super_admin_id) REFERENCES super_admins(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX idx_super_admin_email ON super_admins(email);
CREATE INDEX idx_activity_log_super_admin ON super_admin_activity_log(super_admin_id);
CREATE INDEX idx_activity_log_school ON super_admin_activity_log(school_id);
CREATE INDEX idx_activity_log_created ON super_admin_activity_log(created_at);
CREATE INDEX idx_activity_log_action ON super_admin_activity_log(action_type);

-- Insert default super admin
-- Email: superadmin@schoolhub.tech
-- Password: SuperAdmin123!
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO super_admins (name, email, password, phone, is_active)
VALUES (
    'System Administrator',
    'superadmin@schoolhub.tech',
    '$2y$10$FpKeDGzcyQOreZo904VGvO2/aqYN/b4NDT9QAWAocQKyJ/1pc3pSC',
    NULL,
    TRUE
)
ON DUPLICATE KEY UPDATE email = email;

-- Default Credentials:
-- Email: superadmin@schoolhub.tech
-- Password: SuperAdmin123!
--
-- For security, you should:
-- 1. Change this password immediately after first login
-- 2. Or create a new super admin using: php scripts/create-super-admin.php

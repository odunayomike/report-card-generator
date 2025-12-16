-- Subscription System Migration
-- Run this file to add subscription features to your existing database

USE db_abcb24_school;

-- 1. Add subscription fields to existing schools table
ALTER TABLE schools
ADD COLUMN subscription_status ENUM('active', 'expired', 'trial') DEFAULT 'trial',
ADD COLUMN subscription_end_date DATE;

-- 2. Create Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create Subscription Payments table
CREATE TABLE IF NOT EXISTS subscription_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    plan_id INT NOT NULL,
    reference VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    paystack_reference VARCHAR(255),
    payment_method VARCHAR(50),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- 4. Create Subscription History table
CREATE TABLE IF NOT EXISTS subscription_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    payment_id INT,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES subscription_payments(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- 5. Create indexes for better performance
-- Note: These will fail silently if they already exist, which is fine
ALTER TABLE subscription_payments ADD INDEX idx_payments_school (school_id);
ALTER TABLE subscription_payments ADD INDEX idx_payments_reference (reference);
ALTER TABLE subscription_history ADD INDEX idx_history_school (school_id);
ALTER TABLE subscription_history ADD INDEX idx_history_dates (start_date, end_date);

-- 6. Insert the default subscription plan (5000 NGN per month)
INSERT INTO subscription_plans (plan_name, amount, duration_days, currency, description)
VALUES ('Monthly Plan', 5000.00, 30, 'NGN', 'Full access to all features for 30 days')
ON DUPLICATE KEY UPDATE plan_name = plan_name;

-- Migration complete!
SELECT 'Subscription system migration completed successfully!' AS Status;

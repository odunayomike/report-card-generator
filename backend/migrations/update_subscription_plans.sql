-- Update Subscription Plans
-- This migration updates the subscription plans to include:
-- 1. Monthly Plan - ₦15,000 for 30 days
-- 2. Per Term Plan - ₦40,000 for 90 days (3 months)
-- 3. Yearly Plan - ₦150,000 for 365 days

USE report_card_db;

-- First, ensure the subscription_plans table exists
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

-- Clear existing plans and insert new ones
TRUNCATE TABLE subscription_plans;

-- Insert the new subscription plans
INSERT INTO subscription_plans (plan_name, amount, duration_days, currency, description, is_active)
VALUES
    (
        'Monthly Plan',
        15000.00,
        30,
        'NGN',
        'Full access to all features for 30 days. Perfect for schools that want monthly flexibility.',
        TRUE
    ),
    (
        'Per Term Plan',
        40000.00,
        90,
        'NGN',
        'Full access to all features for 3 months (one term). Save ₦5,000 compared to monthly! Best for managing one academic term.',
        TRUE
    ),
    (
        'Yearly Plan',
        150000.00,
        365,
        'NGN',
        'Full access to all features for 365 days (full academic year). Save ₦30,000 compared to monthly! Best value for complete academic year management.',
        TRUE
    );

-- Migration complete!
SELECT 'Subscription plans updated successfully!' AS Status,
       'Monthly: ₦15,000 | Per Term: ₦40,000 | Yearly: ₦150,000' AS New_Pricing;

-- Display the new plans
SELECT
    id,
    plan_name,
    CONCAT('₦', FORMAT(amount, 0)) AS price,
    CONCAT(duration_days, ' days') AS duration,
    description
FROM subscription_plans
WHERE is_active = TRUE
ORDER BY amount ASC;

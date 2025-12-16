-- Add Yearly Plan to subscription_plans table
-- Run this file to add the yearly plan option

USE db_abcb24_school;

-- Insert the Yearly Plan if it doesn't exist
INSERT INTO subscription_plans (plan_name, amount, duration_days, currency, description, is_active)
VALUES ('Yearly Plan', 50000.00, 365, 'NGN', 'Full access to all features for 365 days - Save ₦10,000!', TRUE)
ON DUPLICATE KEY UPDATE
    amount = 50000.00,
    duration_days = 365,
    description = 'Full access to all features for 365 days - Save ₦10,000!',
    is_active = TRUE;

-- Verify the plans exist
SELECT * FROM subscription_plans WHERE is_active = TRUE;

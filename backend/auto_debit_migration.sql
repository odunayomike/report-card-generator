-- Auto-Debit Migration for Paystack Recurring Payments
-- Add authorization code and auto-debit fields to schools table

-- NOTE: If you get errors about duplicate columns, it means they already exist.
-- You can safely ignore those errors or comment out those lines.

-- Add auto-debit columns to schools table
ALTER TABLE schools
ADD COLUMN authorization_code VARCHAR(255) DEFAULT NULL COMMENT 'Paystack authorization code for recurring payments',
ADD COLUMN customer_code VARCHAR(255) DEFAULT NULL COMMENT 'Paystack customer code',
ADD COLUMN auto_debit_enabled TINYINT(1) DEFAULT 0 COMMENT 'Whether auto-debit is enabled',
ADD COLUMN card_last4 VARCHAR(4) DEFAULT NULL COMMENT 'Last 4 digits of card',
ADD COLUMN card_brand VARCHAR(50) DEFAULT NULL COMMENT 'Card brand (Visa, Mastercard, etc)',
ADD COLUMN next_billing_date DATE DEFAULT NULL COMMENT 'Next auto-debit date';

-- Create auto_debit_history table to track all auto-debit attempts
CREATE TABLE IF NOT EXISTS auto_debit_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    reference VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    authorization_code VARCHAR(255) NOT NULL,
    paystack_response TEXT,
    attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    INDEX idx_school_id (school_id),
    INDEX idx_status (status),
    INDEX idx_attempt_date (attempt_date),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add authorization_code column to subscription_payments
ALTER TABLE subscription_payments
ADD COLUMN authorization_code VARCHAR(255) DEFAULT NULL COMMENT 'Authorization code from successful payment';

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL UNIQUE,
    email_before_debit TINYINT(1) DEFAULT 1 COMMENT 'Send email before auto-debit',
    days_before_notification INT DEFAULT 3 COMMENT 'Days before billing to send notification',
    email_after_debit TINYINT(1) DEFAULT 1 COMMENT 'Send email after auto-debit',
    email_on_failure TINYINT(1) DEFAULT 1 COMMENT 'Send email on debit failure',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

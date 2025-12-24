-- Add Paystack Subaccount fields to schools table
-- This allows each school to receive direct settlements from Paystack

ALTER TABLE schools
ADD COLUMN paystack_subaccount_code VARCHAR(100) NULL AFTER phone,
ADD COLUMN bank_name VARCHAR(100) NULL AFTER paystack_subaccount_code,
ADD COLUMN bank_account_number VARCHAR(20) NULL AFTER bank_name,
ADD COLUMN bank_account_name VARCHAR(255) NULL AFTER bank_account_number,
ADD COLUMN settlement_bank_verified TINYINT(1) DEFAULT 0 AFTER bank_account_name,
ADD COLUMN platform_fee_flat_charge INT DEFAULT 20000 AFTER settlement_bank_verified,
ADD INDEX idx_paystack_subaccount (paystack_subaccount_code);

-- Add comment to explain the columns
ALTER TABLE schools
MODIFY COLUMN paystack_subaccount_code VARCHAR(100) NULL COMMENT 'Paystack subaccount code for direct settlements',
MODIFY COLUMN bank_name VARCHAR(100) NULL COMMENT 'School bank name for Paystack settlement',
MODIFY COLUMN bank_account_number VARCHAR(20) NULL COMMENT 'School bank account number',
MODIFY COLUMN bank_account_name VARCHAR(255) NULL COMMENT 'School bank account name',
MODIFY COLUMN settlement_bank_verified TINYINT(1) DEFAULT 0 COMMENT 'Whether bank account is verified with Paystack',
MODIFY COLUMN platform_fee_flat_charge INT DEFAULT 20000 COMMENT 'Platform fee in kobo (200 NGN = 20000 kobo)';

-- Add trial_end_date to schools table
-- This tracks when the 7-day free trial expires

USE db_abcb24_school;

-- Add trial_end_date column if it doesn't exist
ALTER TABLE schools
ADD COLUMN IF NOT EXISTS trial_end_date DATE AFTER subscription_end_date;

-- For existing schools in trial mode, set trial_end_date to 7 days from created_at
UPDATE schools
SET trial_end_date = DATE_ADD(DATE(created_at), INTERVAL 7 DAY)
WHERE subscription_status = 'trial' AND trial_end_date IS NULL;

SELECT 'Trial date migration completed successfully!' AS Status;

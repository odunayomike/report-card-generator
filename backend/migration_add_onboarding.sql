-- Add onboarding_completed field to schools table
-- This tracks whether a school has completed the onboarding tour

-- Add onboarding_completed column (ignore error if exists)
ALTER TABLE schools
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE AFTER trial_end_date;

-- Add onboarding_completed_at timestamp (ignore error if exists)
ALTER TABLE schools
ADD COLUMN onboarding_completed_at TIMESTAMP NULL AFTER onboarding_completed;

SELECT 'Onboarding migration completed successfully!' AS Status;

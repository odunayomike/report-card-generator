-- Add guardian_email column to students table
-- This column stores parent/guardian email(s) for easy access
-- Nullable to support existing students without guardian data

ALTER TABLE students
ADD COLUMN guardian_email VARCHAR(500) NULL AFTER parent_email,
ADD INDEX idx_student_guardian_email (guardian_email);

-- Update comment
ALTER TABLE students
MODIFY COLUMN guardian_email VARCHAR(500) NULL
COMMENT 'Guardian email address(es) - can be single email or comma-separated multiple emails';

-- Optional: Migrate existing parent_email data to guardian_email
UPDATE students
SET guardian_email = parent_email
WHERE parent_email IS NOT NULL AND guardian_email IS NULL;

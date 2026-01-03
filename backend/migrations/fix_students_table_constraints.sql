-- Fix Students Table Constraints
-- Remove old composite unique key and add proper unique constraint
-- Remove old columns that belong in report_cards table

-- 1. Drop the old composite unique key that includes term
ALTER TABLE students DROP INDEX unique_student_report;

-- 2. Add proper unique constraint on school_id + admission_no
ALTER TABLE students ADD UNIQUE KEY unique_student_per_school (school_id, admission_no);

-- 3. Remove old columns that should only be in report_cards
-- Note: Commenting these out as they might be referenced elsewhere
-- Only uncomment after verifying no code references these columns
-- ALTER TABLE students DROP COLUMN class;
-- ALTER TABLE students DROP COLUMN term;
-- ALTER TABLE students DROP COLUMN photo;
-- ALTER TABLE students DROP COLUMN parent_email;

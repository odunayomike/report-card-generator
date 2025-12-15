-- Migration to allow multiple report cards per student (one per term/session)
-- This preserves all existing data

USE db_abcb24_school;

-- Step 1: Drop the old unique constraint on admission_no
ALTER TABLE students
DROP INDEX unique_admission_per_school;

-- Step 2: Add a new composite unique constraint that includes term and session
-- This ensures a student can have multiple reports, but only ONE report per term/session
ALTER TABLE students
ADD UNIQUE KEY unique_report_per_term_session (school_id, admission_no, session, term);

-- Step 3: Update the save-report.php logic to:
-- - Check if a report exists for the same admission_no, session, and term
-- - If exists, UPDATE the existing record
-- - If not exists, INSERT a new record

-- All existing data remains intact!
-- Students can now have multiple report cards for different terms/sessions

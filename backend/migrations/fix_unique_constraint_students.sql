-- Fix Unique Constraint on Students Table
-- Allow same student to have multiple reports across different sessions and terms
-- This migration removes the old constraint and adds a new one that includes session and term

-- Drop the old unique constraint
ALTER TABLE students DROP INDEX unique_admission_per_school;

-- Add new unique constraint that includes session and term
-- This allows the same student to have reports for different sessions and terms
ALTER TABLE students
ADD UNIQUE KEY unique_student_report (school_id, admission_no, session, term);

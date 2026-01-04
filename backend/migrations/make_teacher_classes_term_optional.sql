-- Migration: Make term field optional in teacher_classes table
-- Date: 2026-01-04
-- Description: Allow teachers to be assigned to classes/subjects across all terms by making the term field nullable

-- Step 1: Modify the term column to allow NULL values
ALTER TABLE teacher_classes
MODIFY COLUMN term VARCHAR(50) NULL;

-- Step 2: Drop the existing unique constraint
ALTER TABLE teacher_classes
DROP INDEX unique_teacher_class_assignment;

-- Step 3: Recreate the unique constraint including the subject column
-- Note: The constraint includes subject column which was added by add_subject_enrollment_system.sql migration
-- MySQL treats NULL values as distinct in UNIQUE constraints, allowing multiple NULL terms/subjects
ALTER TABLE teacher_classes
ADD UNIQUE KEY unique_teacher_class_assignment (teacher_id, class_name, session, term, subject);

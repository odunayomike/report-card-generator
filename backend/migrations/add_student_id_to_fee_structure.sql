-- Add student_id column to fee_structure table
-- This allows creating fee structures for individual students

ALTER TABLE fee_structure
ADD COLUMN student_id INT NULL AFTER class,
ADD FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
ADD INDEX idx_student_id (student_id);

-- Update the class column comment to clarify the logic
-- Logic: If student_id is set, fee applies to that specific student
--        If student_id is NULL and class is set, fee applies to all students in that class
--        If both are NULL, fee applies to all students

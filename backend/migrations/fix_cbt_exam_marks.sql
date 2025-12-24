-- Fix CBT Exam Marks to Support Decimal Values
-- This allows questions to have fractional marks when total_score is distributed

-- Change marks column in cbt_exam_questions from INT to DECIMAL
ALTER TABLE cbt_exam_questions
MODIFY COLUMN marks DECIMAL(10, 2) NOT NULL DEFAULT 1.00;

-- Update all existing exams to distribute total_score across questions
-- This fixes the issue where total_marks doesn't match total_score

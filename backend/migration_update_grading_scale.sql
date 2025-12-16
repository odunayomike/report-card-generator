-- Migration: Update Grading Scale to New Default
-- Created: 2025-12-16
-- Purpose: Update all schools to use the new grading scale where A starts at 75

-- Update ALL schools to have the new grading scale
UPDATE schools
SET grading_scale = '{"A": [75, 100], "B": [65, 74], "C": [55, 64], "D": [45, 54], "F": [0, 44]}';

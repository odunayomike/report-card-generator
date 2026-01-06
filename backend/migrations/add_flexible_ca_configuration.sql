-- Migration: Add Flexible CA Configuration
-- Date: 2026-01-04
-- Description: Allow schools to configure any number of CA components dynamically
--              Stores CA breakdown as JSON for maximum flexibility

-- Add JSON column to store CA components configuration
-- Example: [{"name": "CA1", "max_marks": 10}, {"name": "CA2", "max_marks": 10}, {"name": "Assignment", "max_marks": 5}]
ALTER TABLE schools
ADD COLUMN ca_components JSON DEFAULT NULL COMMENT 'Array of CA components with name and max_marks. If NULL, use single CA field.';

-- Add flag to enable/disable CA breakdown
ALTER TABLE schools
ADD COLUMN use_ca_breakdown BOOLEAN DEFAULT FALSE COMMENT 'Whether to use multiple CA components or single CA field';

-- Note: When use_ca_breakdown = FALSE, the system uses the existing ca_max_marks field and subjects.ca column
-- Note: When use_ca_breakdown = TRUE, the system uses ca_components JSON to define multiple CAs
-- The actual student scores will be stored in student_assessments table or subjects table as needed

-- Migration: Add School Profile and Settings Fields
-- Created: 2025-12-15
-- Purpose: Add fields for school branding, grading system, calendar, and report customization

-- Add new fields to schools table (without defaults for JSON columns)
ALTER TABLE schools
ADD COLUMN motto TEXT AFTER address,
ADD COLUMN primary_color VARCHAR(7) DEFAULT '#4F46E5' AFTER motto,
ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#9333EA' AFTER primary_color,
ADD COLUMN grading_scale JSON AFTER secondary_color,
ADD COLUMN academic_year_start DATE AFTER grading_scale,
ADD COLUMN academic_year_end DATE AFTER academic_year_start,
ADD COLUMN term_structure JSON AFTER academic_year_end,
ADD COLUMN available_subjects JSON AFTER term_structure,
ADD COLUMN report_template VARCHAR(50) DEFAULT 'standard' AFTER available_subjects,
ADD COLUMN show_logo_on_report BOOLEAN DEFAULT TRUE AFTER report_template,
ADD COLUMN show_motto_on_report BOOLEAN DEFAULT TRUE AFTER show_logo_on_report,
ADD COLUMN header_text TEXT AFTER show_motto_on_report,
ADD COLUMN footer_text TEXT AFTER header_text;

-- Update existing schools to have default JSON values
UPDATE schools
SET
  grading_scale = '{"A": [90, 100], "B": [80, 89], "C": [70, 79], "D": [60, 69], "F": [0, 59]}',
  available_subjects = '["Mathematics", "English Language", "Science", "Social Studies", "Religious Studies", "Computer Studies", "Physical Education"]'
WHERE grading_scale IS NULL OR available_subjects IS NULL;

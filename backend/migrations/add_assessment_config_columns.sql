-- Migration: Add Assessment Configuration columns to schools table
-- Date: 2024-12-21
-- Description: Adds ca_max_marks and exam_max_marks columns for assessment configuration

-- Add ca_max_marks column (default 40) - ignore error if exists
ALTER TABLE schools ADD COLUMN ca_max_marks INT DEFAULT 40 COMMENT 'Maximum marks for CA assessments';

-- Add exam_max_marks column (default 60) - ignore error if exists
ALTER TABLE schools ADD COLUMN exam_max_marks INT DEFAULT 60 COMMENT 'Maximum marks for Exam assessments';

-- Migration: Add current_session to schools table
-- This allows schools to set their current academic session/year

ALTER TABLE schools
ADD COLUMN current_session VARCHAR(20) DEFAULT NULL COMMENT 'Current academic session (e.g., 2024/2025)',
ADD COLUMN current_term VARCHAR(20) DEFAULT NULL COMMENT 'Current term (First Term, Second Term, Third Term)';

-- Add index for quick lookups
CREATE INDEX idx_schools_session ON schools(current_session, current_term);

-- Note: Schools can update this whenever the session/term changes
-- This will be used as the default session throughout the application

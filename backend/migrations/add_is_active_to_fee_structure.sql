-- Add is_active column to fee_structure table
-- This allows archiving fee structures instead of deleting them

ALTER TABLE fee_structure
ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL COMMENT 'Whether the fee structure is active or archived';

-- Create an index for better query performance
CREATE INDEX idx_fee_structure_is_active ON fee_structure(is_active);

-- All existing fee structures should be active by default
UPDATE fee_structure SET is_active = TRUE WHERE is_active IS NULL;

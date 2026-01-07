-- Add custom registration slug to schools table
-- This allows schools to have branded/custom registration URLs

ALTER TABLE schools
ADD COLUMN registration_slug VARCHAR(100) NULL UNIQUE AFTER school_name;

-- Add index for faster lookups
CREATE INDEX idx_registration_slug ON schools(registration_slug);

-- Optional: Set default slug for existing schools (based on school name)
-- Schools can customize this later
UPDATE schools
SET registration_slug = CONCAT(
    'school-',
    id,
    '-',
    LOWER(REPLACE(REPLACE(REPLACE(school_name, ' ', '-'), '.', ''), ',', ''))
)
WHERE registration_slug IS NULL
LIMIT 1000;

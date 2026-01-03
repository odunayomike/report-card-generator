-- Step 1: Migrate all existing student records to report_cards (if not already there)
-- Check if session column exists in students table, if so include it
SET @session_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'session');

SET @sql1 = IF(@session_col > 0,
    'INSERT INTO report_cards (school_id, student_admission_no, student_name, student_gender, class, session, term, height, weight, club_society, fav_col, student_photo, created_at, updated_at)
    SELECT school_id, admission_no, name, gender, class, session, term, COALESCE(height, \'\'), COALESCE(weight, \'\'), COALESCE(club_society, \'\'), COALESCE(fav_col, \'\'), photo, created_at, created_at
    FROM students
    WHERE NOT EXISTS (
        SELECT 1 FROM report_cards rc
        WHERE rc.school_id = students.school_id
        AND rc.student_admission_no = students.admission_no
        AND rc.session = students.session
        AND rc.term = students.term
    )',
    'INSERT INTO report_cards (school_id, student_admission_no, student_name, student_gender, class, session, term, student_photo, created_at, updated_at)
    SELECT school_id, admission_no, name, gender, class, \'2024/2025\', term, photo, created_at, created_at
    FROM students
    WHERE NOT EXISTS (
        SELECT 1 FROM report_cards rc
        WHERE rc.school_id = students.school_id
        AND rc.student_admission_no = students.admission_no
        AND rc.term = students.term
    )'
);

PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Step 2: Keep only ONE student record per admission_no (the most recent one)
DELETE s1 FROM students s1
INNER JOIN students s2 ON s1.school_id = s2.school_id AND s1.admission_no = s2.admission_no
WHERE s1.created_at < s2.created_at;

-- Step 3: Remove report-specific columns from students table
ALTER TABLE students DROP COLUMN class;
ALTER TABLE students DROP COLUMN term;

-- Step 4: Add current_class column
ALTER TABLE students ADD COLUMN current_class VARCHAR(100) AFTER guardian_email;

-- Step 5: Update current_class with latest class from report_cards
UPDATE students s
SET current_class = (
    SELECT class FROM report_cards
    WHERE student_admission_no = s.admission_no
    AND school_id = s.school_id
    ORDER BY created_at DESC
    LIMIT 1
);

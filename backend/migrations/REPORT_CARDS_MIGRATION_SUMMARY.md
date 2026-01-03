# Report Cards Table Migration Summary

## Overview
Migrated from storing report cards as duplicate student records to a dedicated `report_cards` table.

## Database Changes

### New Table: `report_cards`
- `id` - Primary key
- `school_id` - Foreign key to schools
- `student_admission_no` - Student identifier
- `student_name` - Student name snapshot
- `student_gender` - Gender snapshot
- `class` - Class for this report
- `session` - Academic session
- `term` - Term/semester
- `height`, `weight`, `club_society`, `fav_col`, `student_photo` - Snapshot data
- `created_at`, `updated_at` - Timestamps
- **Unique constraint**: (school_id, student_admission_no, class, session, term)

### Updated Tables
- `subjects` - Added `report_card_id` column (nullable)
- `attendance` - Added `report_card_id` column (nullable)
- `remarks` - Added `report_card_id` column (nullable)

## Code Changes

### Updated File: `backend/routes/save-report.php`

**Changed from:**
- Inserting into `students` table
- Using `student_id` for relationships

**Changed to:**
- Inserting into `report_cards` table
- Using `report_card_id` for relationships with subjects, attendance, remarks

**Key Changes:**
1. Check query now uses `report_cards` table
2. INSERT/UPDATE operations use `report_cards` table
3. All foreign key relationships updated to use `report_card_id`
4. Response returns `report_card_id` instead of `student_id`

## Benefits

1. **No data duplication** - Student info stored once per report instead of duplicated
2. **Clear separation** - Report cards are distinct entities from student records
3. **Historical accuracy** - Captures snapshot of student data at report creation time
4. **Better performance** - Simpler queries, less data redundancy
5. **Scalability** - Easier to count and manage reports per student

## Backward Compatibility

- Old data in `students` table remains untouched
- New reports go to `report_cards` table
- Both `student_id` and `report_card_id` columns exist in related tables
- Can gradually migrate old data if needed

## Migration Files

1. `create_report_cards_table.sql` - SQL migration
2. `run_report_cards_migration.php` - Migration runner script
3. `save-report.php` - Updated report creation endpoint

## Next Steps

1. Update report viewing endpoints to use `report_cards` table
2. Update report listing to query `report_cards`
3. Update PDF generation to use `report_cards`
4. Consider migrating old `students` table data to `report_cards`

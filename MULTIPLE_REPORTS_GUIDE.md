# Multiple Report Cards Per Student - Implementation Guide

## Overview
This system now supports **multiple report cards per student** for different terms and sessions, while preserving all existing data.

## How It Works

### Database Structure
The current database allows students to have multiple report cards by using a composite unique key:
- **Unique Key**: `(school_id, admission_no, session, term)`
- This means one student (identified by `admission_no`) can have multiple reports for different term/session combinations

### Migration Steps (Required)

Run the SQL migration to update your database:

```sql
-- Run this SQL on your database
USE db_abcb24_school;

-- Drop old unique constraint
ALTER TABLE students DROP INDEX unique_admission_per_school;

-- Add new composite unique constraint
ALTER TABLE students
ADD UNIQUE KEY unique_report_per_term_session (school_id, admission_no, session, term);
```

Or run the migration file:
```bash
mysql -u your_user -p db_abcb24_school < backend/migration_multiple_reports.sql
```

## Application Behavior

### Creating Reports
1. When creating a new report, the system checks if a report already exists for:
   - Same `school_id`
   - Same `admission_no`
   - Same `session`
   - Same `term`

2. **If report exists**: Updates the existing report
3. **If report doesn't exist**: Creates a new report

### Example Scenarios

**Scenario 1**: Creating First Term Report
- Admission No: 2024001
- Session: 2024/2025
- Term: First Term
- **Result**: New report created ✓

**Scenario 2**: Creating Second Term Report (Same Student)
- Admission No: 2024001
- Session: 2024/2025
- Term: Second Term
- **Result**: New report created ✓ (Different term)

**Scenario 3**: Editing First Term Report
- Admission No: 2024001
- Session: 2024/2025
- Term: First Term
- **Result**: Existing report updated ✓

## Viewing Reports

### Dashboard Display
All reports are displayed in the "All Students" table showing:
- Student Name
- Class
- Term
- Session
- Date Created

### Filtering by Student
To see all reports for a specific student, look for entries with the same `admission_no` but different `term` or `session` combinations.

## Benefits

1. **✓ No Data Loss**: All existing reports are preserved
2. **✓ Progress Tracking**: Track student performance across multiple terms
3. **✓ Historical Records**: Maintain complete academic history
4. **✓ Easy Updates**: Edit any term's report independently
5. **✓ Simple Logic**: Same admission number + different term/session = new report

## Important Notes

- **Admission Number is Key**: The admission number identifies the student across all their reports
- **Term + Session Uniqueness**: One student can only have ONE report per term/session combination
- **Editing Behavior**: When editing, the system automatically detects if it's an update or new creation
- **Data Integrity**: All related data (subjects, attendance, domains, remarks) are properly linked to each report

## Backend Changes Made

### save-report.php
- Added logic to check for existing reports
- Implements UPDATE or INSERT based on existence check
- Deletes and re-inserts related data when updating

### No Frontend Changes Required
The frontend works seamlessly with this implementation. The edit functionality automatically handles updates.

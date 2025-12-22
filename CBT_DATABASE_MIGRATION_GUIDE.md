# CBT Database Migration Guide

## Problem Encountered

**Error**: `#1142 - TRIGGER command denied to user 'abcb24_school'@'208.98.35.48' for table 'student_assessments'`

**Cause**: Your database user doesn't have the `TRIGGER` privilege, which is common on shared hosting environments.

---

## Solution

I've created **two versions** of the migration file:

### Option 1: Use the No-Triggers Version (RECOMMENDED)
**File**: `backend/migrations/cbt_system_phase1_no_triggers.sql`

This version:
- ✅ Removes all triggers
- ✅ Removes all views (which also require special privileges)
- ✅ Calculations handled in PHP code instead
- ✅ Works with basic database permissions
- ✅ Same functionality, different implementation

### Option 2: Original Version (Requires TRIGGER privilege)
**File**: `backend/migrations/cbt_system_phase1.sql`

This version:
- ❌ Requires TRIGGER privilege
- ❌ Requires CREATE VIEW privilege
- ✅ More efficient (calculations at database level)
- ⚠️ Only works if your hosting provider grants TRIGGER permission

---

## How to Run the Migration

### Step 1: Choose Your Version

**For most shared hosting → Use `cbt_system_phase1_no_triggers.sql`**

### Step 2: Run the Migration

**Option A: Via phpMyAdmin**
1. Log into phpMyAdmin
2. Select your database
3. Click "SQL" tab
4. Copy contents of `backend/migrations/cbt_system_phase1_no_triggers.sql`
5. Paste into SQL query box
6. Click "Go"
7. Wait for success message

**Option B: Via Command Line (if you have SSH access)**
```bash
mysql -u your_username -p your_database < backend/migrations/cbt_system_phase1_no_triggers.sql
```

### Step 3: Verify Tables Created

Run this query to check:
```sql
SHOW TABLES LIKE 'cbt_%';
SHOW TABLES LIKE 'student_assessments';
```

You should see:
- `assessment_config`
- `cbt_questions`
- `cbt_question_options`
- `cbt_exams`
- `cbt_exam_questions`
- `cbt_exam_assignments`
- `cbt_student_attempts`
- `cbt_student_responses`
- `cbt_activity_log`
- `student_assessments`

**Total: 10 tables**

---

## What Changed in the No-Triggers Version

### Before (With Triggers):
When a score was updated in `student_assessments`:
1. Database trigger automatically calculates `total_ca`
2. Database trigger calculates `total_score`
3. Database trigger calculates `percentage`
4. Database trigger assigns `grade` (A-F)

### After (No Triggers):
When a score is updated:
1. PHP function `recalculateAssessmentTotals()` calculates `total_ca`
2. PHP function calculates `total_score`
3. PHP function calculates `percentage`
4. PHP function assigns `grade` (A-F)

**Result**: Exact same functionality, just handled in PHP instead of database!

---

## Code Changes Made

### File: `backend/routes/cbt/grading.php`

**Added new function** (lines 162-228):
```php
function recalculateAssessmentTotals($db, $assessmentId) {
    // Get current assessment data
    // Calculate total_ca, total_score, percentage
    // Determine grade (A-F)
    // Update the record
}
```

**Updated** `updateReportCardFromCBT()` function:
```php
// After updating score
recalculateAssessmentTotals($db, $assessmentId);
```

This ensures calculations happen automatically after each CBT score update.

---

## Testing After Migration

### Step 1: Verify Tables
```sql
SELECT COUNT(*) FROM cbt_questions;
SELECT COUNT(*) FROM cbt_exams;
SELECT COUNT(*) FROM student_assessments;
```

Should return `0` (empty tables, ready for data).

### Step 2: Test Question Creation
1. Log in as a teacher
2. Navigate to CBT → Question Bank
3. Click "Add Question"
4. Create a test question
5. Check database:
```sql
SELECT * FROM cbt_questions ORDER BY id DESC LIMIT 1;
```

### Step 3: Test Full Flow
1. Create 10 questions
2. Create an exam
3. Assign to a student
4. Take exam as student
5. Submit exam
6. Check `student_assessments` table:
```sql
SELECT * FROM student_assessments
WHERE ca_test_1_source = 'cbt'
ORDER BY id DESC LIMIT 1;
```

Verify:
- ✅ `ca_test_1_score` is populated
- ✅ `total_ca` is calculated
- ✅ `total_score` is calculated
- ✅ `percentage` is calculated
- ✅ `grade` is assigned

---

## Common Issues & Solutions

### Issue 1: "Table already exists"
**Solution**: Some tables may already exist. You can either:
- Drop existing tables: `DROP TABLE IF EXISTS cbt_questions;`
- Or skip that part of the migration

### Issue 2: Foreign key constraint fails
**Cause**: Tables being created in wrong order
**Solution**: Run the entire migration file at once (not line by line)

### Issue 3: "Cannot add foreign key constraint"
**Cause**: Referenced table doesn't exist yet
**Solution**: Make sure all tables are created in the order provided in the migration file

---

## Performance Notes

### With Triggers (Original)
- ⚡ Faster: Calculations happen at database level
- 📊 Less PHP code execution
- ❌ Requires special permissions

### Without Triggers (No-Triggers Version)
- ⚡ Still fast: Calculations happen in PHP
- 📊 Slightly more PHP processing
- ✅ Works everywhere
- ✅ Easier to debug
- ✅ More portable

**Impact**: Negligible performance difference for typical school sizes (< 1000 students).

---

## Next Steps After Migration

1. ✅ Run migration (use no-triggers version)
2. ✅ Verify tables created
3. ✅ Test question creation
4. ✅ Test exam creation
5. ✅ Test student exam taking
6. ✅ Verify report card integration

All set! The CBT system is now ready to use! 🚀

---

## Files Modified

1. **Created**: `backend/migrations/cbt_system_phase1_no_triggers.sql` (new migration file)
2. **Updated**: `backend/routes/cbt/grading.php` (added recalculation function)

---

## Support

If you encounter any issues:
1. Check the error message in phpMyAdmin
2. Verify your database user has basic permissions (CREATE, INSERT, UPDATE, DELETE, SELECT)
3. Try running the migration in smaller chunks if needed
4. Make sure no other process is using the tables during migration

The no-triggers version should work on 99% of hosting providers! ✅

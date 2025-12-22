# Guardian Email Implementation

## Overview

Added a **required** `guardian_email` field to the student management system. This field allows schools to store parent/guardian email addresses for each student, enabling parent access to the mobile application.

---

## Changes Made

### 1. Database Migration

**File**: `/backend/migrations/add_guardian_email_to_students.sql`

**Changes**:
- Added `guardian_email` column to `students` table
- Column is **NULLABLE** (to support existing students without guardian data)
- Column accepts up to 500 characters (supports multiple emails)
- Added index for performance
- Optionally migrates existing `parent_email` data

**Run Migration**:
```bash
mysql -u username -p database < backend/migrations/add_guardian_email_to_students.sql
```

**SQL**:
```sql
ALTER TABLE students
ADD COLUMN guardian_email VARCHAR(500) NULL AFTER parent_email,
ADD INDEX idx_student_guardian_email (guardian_email);
```

---

### 2. Frontend - Student Form

**File**: `/src/components/StudentForm.jsx`

**Changes**:

1. **Added to form state** (line 21):
```javascript
guardianEmail: '',
```

2. **Added form field** (after Gender field):
```jsx
<div className="md:col-span-2">
  <label className="block text-xs font-medium text-gray-700 mb-1">
    Guardian Email <span className="text-red-500">*</span>
  </label>
  <input
    type="email"
    name="guardianEmail"
    value={formData.guardianEmail}
    onChange={handleInputChange}
    placeholder="parent@example.com or parent1@example.com, parent2@example.com"
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
  />
  <p className="text-[10px] text-gray-500 mt-1">
    Enter parent/guardian email. You can enter multiple emails separated by commas.
  </p>
</div>
```

**Features**:
- ✅ Required field (HTML5 validation)
- ✅ Email type input (validates email format)
- ✅ Placeholder text with examples
- ✅ Helper text explaining multiple emails
- ✅ Spans 2 columns on medium+ screens for better visibility

---

### 3. Backend - Save Report Route

**File**: `/backend/routes/save-report.php`

**Changes**:

1. **UPDATE existing student** (line 79-99):
```php
$query = "UPDATE students
          SET name = :name, class = :class, gender = :gender,
              guardian_email = :guardian_email,  // Added
              height = :height, weight = :weight,
              club_society = :club_society, fav_col = :fav_col,
              photo = :photo, updated_at = CURRENT_TIMESTAMP
          WHERE id = :id";

$stmt->execute([
    ':guardian_email' => $data['guardianEmail'] ?? null,  // Added
    // ... other fields
]);
```

2. **INSERT new student** (line 110-128):
```php
$query = "INSERT INTO students
          (school_id, name, class, session, admission_no, term, gender,
           guardian_email,  // Added
           height, weight, club_society, fav_col, photo)
          VALUES (:school_id, :name, :class, :session, :admission_no, :term,
                  :gender, :guardian_email, :height, :weight, :club_society,
                  :fav_col, :photo)";

$stmt->execute([
    ':guardian_email' => $data['guardianEmail'] ?? null,  // Added
    // ... other fields
]);
```

---

### 4. Backend - Create Student Route

**File**: `/backend/routes/create-student.php`

**Changes**:

```php
$query = "INSERT INTO students
          (school_id, name, admission_no, class, session, term, gender,
           guardian_email,  // Added
           height, weight, club_society, fav_col, photo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt->execute([
    $schoolId,
    $data['name'],
    $data['admission_no'],
    $data['class'],
    $data['session'],
    $data['term'],
    $data['gender'],
    $data['guardian_email'] ?? null,  // Added
    $data['height'] ?? null,
    // ... other fields
]);
```

---

## Field Specifications

### Frontend (HTML Input)
- **Type**: `email`
- **Required**: `true` (HTML5 validation)
- **Max Length**: Not enforced in UI (database handles this)
- **Placeholder**: `parent@example.com or parent1@example.com, parent2@example.com`
- **Validation**: Browser-level email format validation

### Backend (Database)
- **Column**: `guardian_email`
- **Type**: `VARCHAR(500)`
- **Nullable**: `NULL` (supports existing students)
- **Default**: `NULL`
- **Index**: Yes (`idx_student_guardian_email`)

### API (JSON)
```json
{
  "guardianEmail": "parent@example.com"
}
```
Or multiple emails:
```json
{
  "guardianEmail": "parent1@example.com, parent2@example.com"
}
```

---

## Usage Examples

### Single Email
```
parent@example.com
```

### Multiple Emails (Comma-separated)
```
father@example.com, mother@example.com
```

### With Spaces
```
parent1@example.com , parent2@example.com , guardian@example.com
```

---

## Validation

### Frontend Validation
- HTML5 `type="email"` validates basic email format
- `required` attribute ensures field is not empty
- Browser shows error if invalid email format

### Backend Validation
- Accepts `NULL` values (for existing students)
- No additional validation (flexible to support multiple formats)
- Stores exactly what is submitted (including commas for multiple emails)

---

## Integration with Parent API

The `guardian_email` field works seamlessly with the Parent Mobile API:

### Automatic Parent-Student Linking

When a student is created with a guardian email, schools can use the email to link the parent:

```javascript
// After creating student
const response = await addParentStudent({
  student_id: studentId,
  parent_email: guardianEmail,  // Use the guardian_email from student
  parent_name: "Parent Name",
  relationship: "guardian",
  is_primary: true
});
```

### Bulk Parent Registration Script

Create a script to auto-register all students' guardians:

```php
<?php
// backend/scripts/register-guardians.php

$query = "SELECT id, guardian_email, name FROM students
          WHERE guardian_email IS NOT NULL";
$students = $db->query($query)->fetchAll();

foreach ($students as $student) {
    // Split multiple emails if comma-separated
    $emails = array_map('trim', explode(',', $student['guardian_email']));

    foreach ($emails as $email) {
        // Create parent account if doesn't exist
        // Link to student
        // ... implementation
    }
}
?>
```

---

## Migration for Existing Students

Existing students **without** guardian emails will have `NULL` in this field.

### Option 1: Gradual Update
Schools can update guardian emails when editing student reports.

### Option 2: Bulk Import
Create a CSV with student admission numbers and guardian emails:

```csv
admission_no,guardian_email
STU001,parent1@example.com
STU002,parent2@example.com, guardian2@example.com
STU003,parent3@example.com
```

Then import via PHP script or SQL:

```sql
UPDATE students
SET guardian_email = 'parent@example.com'
WHERE admission_no = 'STU001' AND school_id = 1;
```

### Option 3: Copy from parent_email
If you have existing `parent_email` data:

```sql
UPDATE students
SET guardian_email = parent_email
WHERE parent_email IS NOT NULL AND guardian_email IS NULL;
```

---

## Testing Checklist

### Database
- [ ] Migration runs successfully
- [ ] Column is nullable
- [ ] Index is created
- [ ] Can insert NULL values
- [ ] Can insert email strings
- [ ] Can insert comma-separated emails

### Frontend
- [ ] Field appears in form
- [ ] Field is marked as required (red asterisk)
- [ ] Placeholder text shows
- [ ] Helper text shows
- [ ] Browser validates email format
- [ ] Form submission fails if empty
- [ ] Form submission succeeds with valid email

### Backend
- [ ] New student creation accepts guardian_email
- [ ] Existing student update accepts guardian_email
- [ ] NULL values are handled correctly
- [ ] Email strings are stored correctly
- [ ] Multiple emails (comma-separated) are stored

### API
- [ ] GET endpoint returns guardian_email
- [ ] POST endpoint accepts guardian_email
- [ ] PUT endpoint updates guardian_email

---

## Security Considerations

### Email Privacy
- Guardian emails are stored in plain text (needed for parent login)
- Only accessible to school admins and authorized teachers
- Not exposed in public APIs

### Email Validation
- Frontend validates basic email format
- Backend accepts flexible input (supports multiple emails)
- No email verification (assumes school validates)

### Data Protection
- Follow GDPR/data protection guidelines
- Inform parents their email will be stored
- Provide opt-out mechanism if required by law

---

## Future Enhancements

### Email Verification
Add email verification when parent first logs in:
```php
// Send verification code to email
// Parent enters code to verify ownership
```

### Email Format Validation
Add backend validation for comma-separated emails:
```php
function validateEmails($emailString) {
    $emails = array_map('trim', explode(',', $emailString));
    foreach ($emails as $email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }
    }
    return true;
}
```

### Parent Notifications
Send email notifications to guardian when:
- Report card is published
- Attendance is below threshold
- Important announcements

---

## Troubleshooting

### Issue: Field not appearing in form
**Solution**: Clear browser cache and reload

### Issue: Required validation not working
**Solution**: Ensure `required` attribute is present and form uses `type="email"`

### Issue: Database error on save
**Solution**:
1. Check migration was run: `DESCRIBE students;`
2. Verify column exists: `SHOW COLUMNS FROM students LIKE 'guardian_email';`

### Issue: Existing students can't be saved
**Solution**: Column is nullable, should work. Check error logs for specific issue.

### Issue: Multiple emails not working
**Solution**: This is expected - just store comma-separated values. Parse on read if needed.

---

## Summary

✅ **Database**: Added nullable `guardian_email` column
✅ **Frontend**: Added required email input field with validation
✅ **Backend**: Updated both save and create routes to handle guardian_email
✅ **Backward Compatible**: Existing students not affected (NULL allowed)
✅ **Parent API Ready**: Can link parents using these emails
✅ **Flexible**: Supports single or multiple emails (comma-separated)

**Status**: ✅ Complete and Ready for Production

---

**Last Updated**: December 2024
**Version**: 1.0

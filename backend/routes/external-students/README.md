# External Students System - Setup Guide

## Overview
The External Students System enables schools to:
- Quickly enroll prospective students for entrance examinations
- Assign CBT (Computer-Based Test) exams to external students
- Track exam performance and results
- Convert successful candidates to regular students

---

## Installation

### Step 1: Run Database Migration

Execute the SQL migration file to create necessary tables:

```bash
mysql -u your_username -p your_database < /backend/migrations/external_students_system.sql
```

Or manually run the SQL in your database management tool (phpMyAdmin, MySQL Workbench, etc.).

### Step 2: Verify Tables Created

The migration creates these tables:
- `external_students` - Stores prospective student data
- `external_student_activity_log` - Activity tracking
- `entrance_exam_config` - Optional entrance exam configuration

It also modifies existing tables:
- `cbt_exam_assignments` - Adds `external_student_id` column
- `cbt_student_attempts` - Adds `external_student_id` column

### Step 3: Verify Routes

Routes are automatically registered in `/backend/index.php`. Verify these endpoints are accessible:

```
POST   /api/external-students/enroll
POST   /api/external-students/login
POST   /api/external-students/logout
GET    /api/external-students/check-session
GET    /api/external-students/list
POST   /api/external-students/assign-exam
POST   /api/external-students/convert
GET    /api/external-students/results
```

### Step 4: Test the System

1. **Login as School Admin**
   ```bash
   curl -X POST https://api.schoolhub.tech/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@school.com","password":"yourpassword"}' \
     -c cookies.txt
   ```

2. **Enroll an External Student**
   ```bash
   curl -X POST https://api.schoolhub.tech/external-students/enroll \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{
       "name": "Test Student",
       "applying_for_class": "JSS 1",
       "parent_name": "Test Parent",
       "parent_phone": "08012345678"
     }'
   ```

3. **Login as External Student** (using returned credentials)
   ```bash
   curl -X POST https://api.schoolhub.tech/external-students/login \
     -H "Content-Type: application/json" \
     -d '{
       "exam_code": "EXT-2024-1-0001",
       "password": "EXT5678"
     }'
   ```

---

## Features

### For School Administrators

1. **Quick Enrollment**
   - Collect full student and parent information
   - Auto-generate unique exam codes and passwords
   - Support bulk enrollment

2. **Exam Assignment**
   - Assign multiple exams to external students
   - Track exam status (pending, in-progress, completed)
   - View detailed results and analytics

3. **Result Management**
   - View individual exam scores
   - Calculate overall performance percentage
   - Export results for decision making

4. **Student Conversion**
   - Convert successful candidates to regular students
   - Automatically create parent accounts
   - Link parent-student relationships
   - Preserve exam history

### For External Students

1. **Secure Authentication**
   - Unique exam code for each student
   - Password-protected access
   - Separate from regular student login

2. **Exam Taking**
   - View assigned exams
   - Take CBT exams online
   - Auto-save answers
   - View results (if enabled by school)

3. **Dashboard**
   - See exam schedule
   - Track completion status
   - View overall performance

---

## Configuration

### Default Password Format

External students receive auto-generated passwords in format:
```
EXT + last 4 digits of parent phone number
```

Example: Parent phone `08012345678` → Password: `EXT5678`

### Exam Code Format

Auto-generated exam codes follow this pattern:
```
EXT-{YEAR}-{SCHOOL_ID}-{RANDOM_4_DIGITS}
```

Example: `EXT-2024-5-0012`

### Status Progression

```
pending → exam_assigned → exam_completed → passed/failed → converted
```

---

## Security Considerations

1. **Authentication**
   - External students have separate session type: `external_student`
   - Cannot access regular student resources
   - Sessions expire on browser close

2. **Data Privacy**
   - Password hashes are never returned in API responses
   - Parent information only accessible to school admin
   - Activity logging for audit trail

3. **Authorization**
   - External students can only:
     - View their assigned exams
     - Take exams assigned to them
     - View their own results (if allowed)
   - School admin required for all management operations

---

## Common Use Cases

### Use Case 1: Entrance Examination

1. School admin enrolls prospective students
2. Creates entrance exam(s) using CBT system
3. Assigns exam(s) to all external students
4. External students take exams remotely
5. School reviews results
6. Converts successful students to regular students

### Use Case 2: Placement Test

1. Enroll students applying for mid-year transfer
2. Assign subject-specific placement tests
3. Students take tests to determine appropriate class level
4. Convert with appropriate class assignment

### Use Case 3: Scholarship Examination

1. Enroll scholarship applicants
2. Assign scholarship qualifying exams
3. Track performance across multiple subjects
4. Convert top performers with scholarship notes

---

## Troubleshooting

### External Student Cannot Login

**Check:**
1. Exam code is correct (case-sensitive)
2. Password matches the generated password
3. Student hasn't been converted already
4. Session cookies are enabled

### Exam Not Showing for External Student

**Check:**
1. Exam has been assigned via `/assign-exam` endpoint
2. Exam is published (`is_published = 1`)
3. Exam window is active (check start/end datetime)
4. External student session is valid

### Conversion Fails

**Check:**
1. Admission number is unique
2. External student hasn't been converted already
3. School ID matches
4. All required fields are provided

---

## API Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting for:
- Login attempts
- Enrollment endpoint (to prevent spam)
- Exam submission

---

## Future Enhancements

Potential features for future versions:

1. **Bulk Operations**
   - Bulk import external students from CSV
   - Bulk assignment of exams
   - Batch conversion

2. **Email/SMS Notifications**
   - Send credentials to parents via email/SMS
   - Exam reminders
   - Result notifications

3. **Payment Integration**
   - Application fee payment
   - Payment verification before exam access

4. **Enhanced Analytics**
   - Class-wise performance comparison
   - Subject-wise analysis
   - Pass/fail prediction

5. **Document Upload**
   - Birth certificate
   - Previous school report cards
   - Passport photos

---

## Support

For issues or questions:
1. Check the API documentation
2. Review error messages in responses
3. Check application logs
4. Contact development team

---

## File Structure

```
backend/
├── routes/
│   └── external-students/
│       ├── enroll.php              # Enrollment endpoint
│       ├── login.php               # Authentication
│       ├── logout.php              # Session termination
│       ├── check-session.php       # Session validation
│       ├── list.php                # List external students
│       ├── assign-exam.php         # Assign exams
│       ├── convert.php             # Convert to regular student
│       ├── results.php             # View results
│       ├── API_DOCUMENTATION.md    # API docs
│       └── README.md               # This file
├── utils/
│   └── StudentTypeHelper.php       # Helper for student type logic
└── migrations/
    └── external_students_system.sql # Database migration
```

---

## License

Part of the School Hub Report Card Generator System
© 2024 All Rights Reserved

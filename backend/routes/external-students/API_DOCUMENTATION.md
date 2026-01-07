# External Students API Documentation

## Overview
The External Students system allows schools to quickly enroll prospective students for entrance examinations, assign CBT exams to them, and convert successful candidates to regular students.

## Base URL
```
https://api.schoolhub.tech
```

---

## Authentication

### External Student Login
**POST** `/external-students/login`

Login for prospective students taking entrance exams.

**Request Body:**
```json
{
  "exam_code": "EXT-2024-1-0012",
  "password": "EXT1234"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "external_student": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "08012345678",
      "exam_code": "EXT-2024-1-0012",
      "applying_for_class": "JSS 1",
      "status": "exam_assigned",
      "application_date": "2024-01-07 10:30:00"
    },
    "school": {
      "id": 1,
      "name": "Example High School",
      "logo": "..."
    },
    "exam_stats": {
      "total_assigned": 3,
      "total_completed": 1,
      "pending": 2
    },
    "session_token": "abc123..."
  }
}
```

---

### Check Session
**GET** `/external-students/check-session`

Validate external student session.

**Success Response (200):**
```json
{
  "success": true,
  "authenticated": true,
  "data": {
    "external_student": { ... },
    "school": { ... },
    "exam_stats": { ... }
  }
}
```

---

### Logout
**POST** `/external-students/logout`

Log out external student.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## School Admin Operations

### Quick Enrollment
**POST** `/external-students/enroll`

**Authentication:** School Admin required

Quickly enroll a prospective student for entrance examination.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "date_of_birth": "2010-05-15",
  "gender": "MALE",
  "address": "123 Main St",
  "applying_for_class": "JSS 1",
  "previous_school": "ABC Primary School",
  "parent_name": "Jane Doe",
  "parent_email": "jane@example.com",
  "parent_phone": "08098765432",
  "parent_relationship": "mother",
  "notes": "Applied for scholarship"
}
```

**Required Fields:**
- `name`
- `applying_for_class`
- `parent_name`
- `parent_phone`

**Success Response (201):**
```json
{
  "success": true,
  "message": "External student enrolled successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "exam_code": "EXT-2024-1-0012",
    "default_password": "EXT5432",
    "applying_for_class": "JSS 1",
    "parent_name": "Jane Doe",
    "parent_phone": "08098765432"
  },
  "credentials": {
    "exam_code": "EXT-2024-1-0012",
    "password": "EXT5432",
    "login_url": "https://api.schoolhub.tech/external-students/login"
  }
}
```

---

### List External Students
**GET** `/external-students/list`

**Authentication:** School Admin required

Get list of all external students for the school.

**Query Parameters:**
- `status` (optional): Filter by status (pending, exam_assigned, exam_completed, passed, failed, converted)
- `class` (optional): Filter by applying class
- `search` (optional): Search by name, exam code, or parent name
- `limit` (optional, default: 50): Number of results
- `offset` (optional, default: 0): Pagination offset

**Example:**
```
GET /external-students/list?status=exam_assigned&class=JSS%201&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "exam_code": "EXT-2024-1-0012",
      "email": "john@example.com",
      "phone": "08012345678",
      "applying_for_class": "JSS 1",
      "status": "exam_assigned",
      "parent_name": "Jane Doe",
      "parent_phone": "08098765432",
      "assigned_exams": 3,
      "completed_exams": 1,
      "average_score": 75.5,
      "application_date": "2024-01-07 10:30:00"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

### Assign Exam to External Students
**POST** `/external-students/assign-exam`

**Authentication:** School Admin required

Assign a CBT exam to one or more external students.

**Request Body:**
```json
{
  "exam_id": 5,
  "external_student_ids": [1, 2, 3, 4]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully assigned exam to 4 external student(s)",
  "data": {
    "exam": {
      "id": 5,
      "title": "Mathematics Entrance Test",
      "class": "JSS 1"
    },
    "assigned_count": 4,
    "skipped_count": 0,
    "total_processed": 4
  },
  "errors": []
}
```

---

### View External Student Results
**GET** `/external-students/results`

**Authentication:** School Admin required

View exam results for an external student.

**Query Parameters:**
- `external_student_id` (required): External student ID

**Example:**
```
GET /external-students/results?external_student_id=1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 1,
      "name": "John Doe",
      "exam_code": "EXT-2024-1-0012",
      "applying_for_class": "JSS 1",
      "status": "exam_completed"
    },
    "statistics": {
      "total_exams_assigned": 3,
      "total_exams_completed": 3,
      "pending_exams": 0,
      "total_score": 225.5,
      "total_possible_marks": 300,
      "overall_percentage": 75.17
    },
    "exam_results": [
      {
        "id": 1,
        "exam_title": "Mathematics Entrance Test",
        "subject": "Mathematics",
        "total_score": 45.5,
        "total_marks": 50,
        "percentage": 91.0,
        "correct_answers": 45,
        "wrong_answers": 5,
        "time_taken_minutes": 58,
        "started_at": "2024-01-07 09:00:00",
        "submitted_at": "2024-01-07 09:58:00"
      }
    ]
  }
}
```

---

### Convert to Regular Student
**POST** `/external-students/convert`

**Authentication:** School Admin required

Convert an external student to a regular enrolled student.

**Request Body:**
```json
{
  "external_student_id": 1,
  "admission_no": "SCH2024001",
  "current_class": "JSS 1",
  "session": "2023/2024",
  "term": "First Term"
}
```

**Required Fields:**
- `external_student_id`
- `admission_no`

**Success Response (201):**
```json
{
  "success": true,
  "message": "External student successfully converted to regular student",
  "data": {
    "student_id": 123,
    "admission_no": "SCH2024001",
    "name": "John Doe",
    "class": "JSS 1",
    "session": "2023/2024",
    "term": "First Term",
    "parent_created": true
  }
}
```

---

## Taking Exams (External Students)

External students use the same CBT exam endpoints as regular students:

### List Assigned Exams
**GET** `/cbt/student-exams?action=list`

**Authentication:** External Student session required

Returns all exams assigned to the external student.

### Start Exam
**GET** `/cbt/student-exams?action=start&exam_id={id}`

### Submit Answer
**POST** `/cbt/student-exams`
```json
{
  "action": "save_answer",
  "attempt_id": 1,
  "question_id": 5,
  "selected_option_id": 3
}
```

### Submit Exam
**POST** `/cbt/student-exams`
```json
{
  "action": "submit",
  "attempt_id": 1
}
```

### View Results
**GET** `/cbt/student-exams?action=results&exam_id={id}`

---

## Status Flow

External students progress through these statuses:

1. **pending** - Just enrolled, no exams assigned yet
2. **exam_assigned** - At least one exam has been assigned
3. **exam_completed** - All assigned exams have been submitted
4. **passed** - (Optional) Manually marked as passed
5. **failed** - (Optional) Manually marked as failed
6. **converted** - Successfully converted to regular student

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - School admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "External student not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Database error: ..."
}
```

---

## Workflow Example

### School Admin Workflow:
1. **Enroll external student** → POST `/external-students/enroll`
2. **Create entrance exam** → POST `/cbt/exams` (existing endpoint)
3. **Assign exam to student** → POST `/external-students/assign-exam`
4. *Student takes exam using mobile/web app*
5. **View results** → GET `/external-students/results?external_student_id=1`
6. **Convert to regular student** → POST `/external-students/convert` (if passed)

### External Student Workflow:
1. **Login** → POST `/external-students/login` (using provided credentials)
2. **List exams** → GET `/cbt/student-exams?action=list`
3. **Take exam** → GET `/cbt/student-exams?action=start&exam_id=1`
4. **Submit answers** → POST `/cbt/student-exams` (action: save_answer)
5. **Submit exam** → POST `/cbt/student-exams` (action: submit)
6. **View results** → GET `/cbt/student-exams?action=results&exam_id=1`

---

## Database Tables

### external_students
Stores prospective student information

### cbt_exam_assignments
Extended with `external_student_id` column to support external students

### cbt_student_attempts
Extended with `external_student_id` column to track external student exam attempts

### external_student_activity_log
Tracks all activities for external students (enrollment, login, exam assignment, conversion, etc.)

---

## Notes

- External students and regular students use separate authentication systems
- External students can only access CBT exams assigned to them
- After conversion, the external student account is marked as "converted" and cannot be used for login
- Parent accounts are automatically created during conversion if they don't exist
- Default passwords are generated in format: `EXT` + last 4 digits of parent phone
- Exam codes are unique and auto-generated in format: `EXT-{YEAR}-{SCHOOL_ID}-{RANDOM}`

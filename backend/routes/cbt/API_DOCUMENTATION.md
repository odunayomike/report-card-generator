# CBT System API Documentation - Phase 1

## Overview
This document describes all the API endpoints for the CBT (Computer-Based Testing) system Phase 1 implementation.

**Base URL**: `/api/cbt`

## Authentication
All endpoints require authentication via session. The user type (teacher/student) determines access:
- **Teacher endpoints**: Require `user_type=teacher` and valid `teacher_id` in session
- **Student endpoints**: Require `user_type=student` and valid `student_id` in session

---

## 1. Questions Management (`/cbt/questions`)
**Access**: Teachers only

### GET - List Questions
Retrieve questions from the question bank.

**Query Parameters**:
- `exam_id` (optional): Get questions for a specific exam
- `subject` (optional): Filter by subject
- `question_type` (optional): Filter by type (multiple_choice, true_false)

**Response**:
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question_text": "What is 2 + 2?",
      "question_type": "multiple_choice",
      "subject": "Mathematics",
      "topic": "Addition",
      "difficulty": "easy",
      "marks": 1,
      "options": [
        {"id": 1, "text": "3", "is_correct": false},
        {"id": 2, "text": "4", "is_correct": true}
      ]
    }
  ],
  "total": 1
}
```

### POST - Create Question
Create a new question in the question bank.

**Request Body**:
```json
{
  "question_text": "What is the capital of Nigeria?",
  "question_type": "multiple_choice",
  "subject": "Social Studies",
  "topic": "Geography",
  "difficulty": "easy",
  "marks": 1,
  "options": [
    {"text": "Lagos", "is_correct": false},
    {"text": "Abuja", "is_correct": true},
    {"text": "Kano", "is_correct": false},
    {"text": "Port Harcourt", "is_correct": false}
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Question created successfully",
  "question_id": 1
}
```

### PUT - Update Question
Update an existing question.

**Request Body**:
```json
{
  "id": 1,
  "question_text": "Updated question text",
  "topic": "Updated topic",
  "difficulty": "medium",
  "marks": 2,
  "options": [...]
}
```

### DELETE - Delete Question
Delete a question from the bank.

**Query Parameters**:
- `id` (required): Question ID to delete

**Note**: Cannot delete questions used in published exams.

---

## 2. Exam Management (`/cbt/exams`)
**Access**: Teachers only

### GET - List Exams
Retrieve exams created by the teacher.

**Query Parameters**:
- `id` (optional): Get specific exam with full details
- `status` (optional): Filter by status (draft, published)

**Response** (list):
```json
{
  "success": true,
  "exams": [
    {
      "id": 1,
      "exam_title": "Mathematics CA Test 1",
      "subject": "Mathematics",
      "class_name": "JSS 1",
      "session": "2023/2024",
      "term": "First Term",
      "assessment_type": "ca_test_1",
      "total_marks": 10,
      "duration_minutes": 30,
      "is_published": 0,
      "question_count": 10,
      "assigned_students": 25,
      "completed_count": 0
    }
  ],
  "total": 1
}
```

### POST - Create Exam
Create a new exam.

**Request Body**:
```json
{
  "exam_title": "Mathematics CA Test 1",
  "subject": "Mathematics",
  "class_name": "JSS 1",
  "session": "2023/2024",
  "term": "First Term",
  "assessment_type": "ca_test_1",
  "duration_minutes": 30,
  "instructions": "Answer all questions",
  "shuffle_questions": 1,
  "shuffle_options": 1,
  "show_results": 0,
  "start_datetime": "2024-01-15 08:00:00",
  "end_datetime": "2024-01-15 17:00:00",
  "questions": [1, 2, 3, 4, 5]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Exam created successfully",
  "exam_id": 1
}
```

### PUT - Update Exam
Update exam details, add questions, assign students, or publish.

**Request Body** (action: update):
```json
{
  "id": 1,
  "action": "update",
  "exam_title": "Updated title",
  "instructions": "Updated instructions",
  "duration_minutes": 45
}
```

**Request Body** (action: add_questions):
```json
{
  "id": 1,
  "action": "add_questions",
  "questions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

**Request Body** (action: assign_students):
```json
{
  "id": 1,
  "action": "assign_students",
  "student_ids": [1, 2, 3, 4, 5]
}
```

**Request Body** (action: publish):
```json
{
  "id": 1,
  "action": "publish"
}
```

### DELETE - Delete Exam
Delete an unpublished exam.

**Query Parameters**:
- `id` (required): Exam ID to delete

**Note**: Cannot delete published exams.

---

## 3. Student Exams (`/cbt/student-exams`)
**Access**: Students only

### GET - List/Start/Results

**Query Parameters**:
- `action` (required): list, start, or results

#### Action: list
Get all exams assigned to the student.

**Response**:
```json
{
  "success": true,
  "exams": [
    {
      "id": 1,
      "exam_title": "Mathematics CA Test 1",
      "subject": "Mathematics",
      "total_marks": 10,
      "duration_minutes": 30,
      "start_datetime": "2024-01-15 08:00:00",
      "end_datetime": "2024-01-15 17:00:00",
      "status": "available",
      "has_started": 0,
      "has_submitted": 0
    }
  ],
  "total": 1
}
```

Status values:
- `upcoming`: Exam hasn't started yet
- `available`: Exam is ready to start
- `in_progress`: Student has started
- `expired`: Time has run out
- `completed`: Student has submitted

#### Action: start
Start taking an exam.

**Query Parameters**:
- `exam_id` (required): Exam ID to start

**Response**:
```json
{
  "success": true,
  "exam": {
    "id": 1,
    "title": "Mathematics CA Test 1",
    "subject": "Mathematics",
    "instructions": "Answer all questions",
    "total_marks": 10,
    "duration_minutes": 30,
    "started_at": "2024-01-15 09:00:00"
  },
  "attempt_id": 1,
  "questions": [
    {
      "id": 1,
      "question_text": "What is 2 + 2?",
      "question_type": "multiple_choice",
      "marks": 1,
      "options": [
        {"id": 1, "text": "3"},
        {"id": 2, "text": "4"},
        {"id": 3, "text": "5"}
      ]
    }
  ],
  "saved_responses": {
    "1": 2
  }
}
```

**Note**: Does NOT include `is_correct` in options. Questions/options may be shuffled.

#### Action: results
Get exam results.

**Query Parameters**:
- `exam_id` (required): Exam ID

**Response**:
```json
{
  "success": true,
  "exam_title": "Mathematics CA Test 1",
  "subject": "Mathematics",
  "total_score": 8,
  "total_marks": 10,
  "percentage": 80,
  "correct_answers": 8,
  "wrong_answers": 2,
  "submitted_at": "2024-01-15 09:25:00",
  "time_taken_minutes": 25.5
}
```

**Note**: If `show_results_immediately` is enabled, includes `question_details` array.

### POST - Save Response / Submit

**Request Body** (action: save_response):
```json
{
  "action": "save_response",
  "attempt_id": 1,
  "question_id": 1,
  "selected_option_id": 2
}
```

**Response**:
```json
{
  "success": true,
  "message": "Response saved"
}
```

**Request Body** (action: submit):
```json
{
  "action": "submit",
  "attempt_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Exam submitted successfully",
  "score": 8,
  "total_marks": 10,
  "percentage": 80
}
```

**Note**: Auto-grading happens on submit. Report card is automatically updated if enabled.

---

## 4. Get Students (`/cbt/get-students`)
**Access**: Teachers only

### GET - Get Students for Assignment
Get list of students in a class for exam assignment.

**Query Parameters**:
- `class_name` (required)
- `session` (required)
- `term` (required)

**Response**:
```json
{
  "success": true,
  "students": [
    {
      "id": 1,
      "name": "John Doe",
      "admission_number": "SCH001",
      "class_name": "JSS 1"
    }
  ],
  "total": 25
}
```

---

## 5. Grading (`/cbt/grading`)
**Access**: Internal use / Teachers for manual updates

### POST - Manual Report Card Update
Manually update report card from CBT score (if auto-update was disabled).

**Request Body**:
```json
{
  "action": "update_report_card",
  "attempt_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Report card updated successfully",
  "assessment_id": 1,
  "field_updated": "ca_test_1_score",
  "score": 8
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad request (validation errors)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (access denied)
- `404`: Not found
- `405`: Method not allowed
- `409`: Conflict (duplicate entry)
- `500`: Server error

---

## Report Card Integration

When an exam is submitted:
1. Auto-grading calculates the score
2. If `auto_update_report_card = 1`, the score is automatically written to `student_assessments` table
3. The appropriate field is updated based on `assessment_type`:
   - `ca_test_1` → `ca_test_1_score`
   - `ca_test_2` → `ca_test_2_score`
   - `ca_test_3` → `ca_test_3_score`
   - `exam` → `exam_score`
4. Database triggers automatically recalculate:
   - `total_ca` (sum of all CA tests + participation)
   - `total_score` (total_ca + exam_score)
   - `percentage`
   - `grade` (A-F based on percentage)
5. Source is marked as `'cbt'` and attempt ID is linked

This ensures zero manual score entry for CBT exams!

---

## Database Tables Used

1. **cbt_questions** - Question bank
2. **cbt_question_options** - Multiple choice options
3. **cbt_exams** - Exam definitions
4. **cbt_exam_questions** - Questions in each exam
5. **cbt_exam_assignments** - Students assigned to exams
6. **cbt_student_attempts** - Student exam attempts and scores
7. **cbt_student_responses** - Individual question answers
8. **student_assessments** - Report card integration table
9. **cbt_activity_log** - Audit trail
10. **assessment_config** - Score configuration per subject/class

---

## Next Steps - Frontend Implementation

The backend API is complete for Phase 1. Next tasks:
1. Create teacher question creation interface
2. Build exam creation wizard
3. Create student exam-taking interface
4. Test end-to-end flow

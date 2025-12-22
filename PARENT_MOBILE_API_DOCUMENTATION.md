# Parent/Guardian Mobile API Documentation

## Overview

This API provides parents and guardians access to view their children's academic analytics through a mobile application. Authentication is simplified using **email-only login** (no password required).

**Base URL**: `https://your-domain.com/backend/routes/parent/`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Children Management](#children-management)
3. [Analytics & Performance](#analytics--performance)
4. [Admin Endpoints](#admin-endpoints-school-use)
5. [Error Handling](#error-handling)
6. [Response Formats](#response-formats)

---

## Authentication

### 1. Parent Login (Email Only)

**Endpoint**: `POST /parent/login.php`

**Description**: Authenticates parent using email address only. Returns parent profile and list of children.

**Request Body**:
```json
{
  "email": "parent@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "parent": {
      "id": 1,
      "name": "John Doe",
      "email": "parent@example.com",
      "phone": "+234812345678",
      "children_count": 2
    },
    "children": [
      {
        "id": 10,
        "name": "Jane Doe",
        "class": "JSS 1",
        "admission_no": "SCH/2024/001",
        "gender": "FEMALE",
        "photo": "base64_encoded_photo_or_url",
        "school_name": "ABC High School",
        "school_id": 5,
        "relationship": "father",
        "is_primary": true
      }
    ],
    "session_token": "abc123xyz..."
  }
}
```

**Error Responses**:
- `400 Bad Request`: Email missing or invalid format
- `401 Unauthorized`: No account found with this email

**Example (cURL)**:
```bash
curl -X POST https://your-domain.com/backend/routes/parent/login.php \
  -H "Content-Type: application/json" \
  -d '{"email": "parent@example.com"}'
```

**Example (JavaScript/React Native)**:
```javascript
const login = async (email) => {
  const response = await fetch('https://your-domain.com/backend/routes/parent/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Important for session cookies
    body: JSON.stringify({ email })
  });

  const data = await response.json();
  return data;
};
```

---

### 2. Check Session Status

**Endpoint**: `GET /parent/check-session.php`

**Description**: Verifies if parent is still logged in and returns current session data.

**Success Response** (200 OK):
```json
{
  "success": true,
  "authenticated": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "parent@example.com",
    "phone": "+234812345678",
    "children_count": 2
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "authenticated": false,
  "message": "Not authenticated"
}
```

---

### 3. Logout

**Endpoint**: `POST /parent/logout.php`

**Description**: Logs out parent and destroys session.

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Children Management

### 1. Get All Children

**Endpoint**: `GET /parent/get-children.php`

**Description**: Returns detailed list of all children linked to logged-in parent.

**Authentication**: Required (session-based)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "Jane Doe",
      "class": "JSS 1",
      "session": "2024/2025",
      "term": "First Term",
      "admission_no": "SCH/2024/001",
      "gender": "FEMALE",
      "photo": "base64_or_url",
      "height": "140cm",
      "weight": "45kg",
      "relationship": "father",
      "is_primary": true,
      "school": {
        "id": 5,
        "name": "ABC High School",
        "address": "123 Education Street, Lagos",
        "phone": "+234901234567",
        "email": "info@abcschool.com",
        "logo": "base64_or_url"
      }
    }
  ],
  "count": 2
}
```

---

## Analytics & Performance

### 1. Get Child Analytics (Current Term)

**Endpoint**: `GET /parent/get-child-analytics.php?student_id={id}`

**Description**: Returns comprehensive analytics for a specific child including academic performance, attendance, behavior, and remarks.

**Authentication**: Required

**Query Parameters**:
- `student_id` (required): Student ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 10,
      "name": "Jane Doe",
      "class": "JSS 1",
      "session": "2024/2025",
      "term": "First Term",
      "admission_no": "SCH/2024/001",
      "gender": "FEMALE",
      "photo": "base64_or_url",
      "age": 12,
      "school_name": "ABC High School",
      "school_logo": "base64_or_url"
    },
    "academic_performance": {
      "overall": {
        "total_obtained": 720,
        "total_obtainable": 900,
        "average": 80.00,
        "percentage": 80.00,
        "grade": "A",
        "remark": "EXCELLENT"
      },
      "subjects": [
        {
          "name": "Mathematics",
          "ca": 35.00,
          "exam": 55.00,
          "total": 90.00,
          "grade": "A",
          "remark": "EXCELLENT"
        },
        {
          "name": "English Language",
          "ca": 32.00,
          "exam": 50.00,
          "total": 82.00,
          "grade": "A",
          "remark": "EXCELLENT"
        }
      ],
      "subjects_count": 9,
      "grade_distribution": {
        "A": 7,
        "B": 2,
        "C": 0,
        "D": 0,
        "F": 0
      },
      "strongest_subject": {
        "name": "Mathematics",
        "score": 90.00
      },
      "weakest_subject": {
        "name": "Physical Education",
        "score": 65.00
      }
    },
    "attendance": {
      "school_opened": 90,
      "present": 87,
      "absent": 3,
      "attendance_rate": 96.67
    },
    "behavior": {
      "traits": [
        {
          "trait": "Punctuality",
          "rating": 5
        },
        {
          "trait": "Honesty",
          "rating": 5
        },
        {
          "trait": "Neatness",
          "rating": 4
        }
      ],
      "average_rating": 4.7
    },
    "skills": {
      "psychomotor": [
        {
          "skill": "Handwriting",
          "rating": 4
        },
        {
          "skill": "Sports",
          "rating": 5
        }
      ]
    },
    "remarks": {
      "teacher": {
        "name": "Mrs. Smith",
        "remark": "Jane is an excellent student who shows great potential."
      },
      "principal": {
        "name": "Dr. Johnson",
        "remark": "Keep up the good work!"
      },
      "next_term_begins": "2025-01-15"
    },
    "grading_scale": {
      "A": [75, 100],
      "B": [65, 74],
      "C": [55, 64],
      "D": [45, 54],
      "F": [0, 44]
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Student ID missing
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Student doesn't belong to this parent
- `404 Not Found`: Student not found

**Example Usage**:
```javascript
const getChildAnalytics = async (studentId) => {
  const response = await fetch(
    `https://your-domain.com/backend/routes/parent/get-child-analytics.php?student_id=${studentId}`,
    {
      method: 'GET',
      credentials: 'include'
    }
  );
  return await response.json();
};
```

---

### 2. Get Child Performance History

**Endpoint**: `GET /parent/get-child-history.php?admission_no={number}`

**Description**: Returns performance history across multiple terms and sessions, showing trends and progress.

**Authentication**: Required

**Query Parameters**:
- `admission_no` (required): Student admission number

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "student": {
      "name": "Jane Doe",
      "admission_no": "SCH/2024/001",
      "current_class": "JSS 1",
      "school_name": "ABC High School"
    },
    "history": [
      {
        "report_id": 15,
        "session": "2024/2025",
        "term": "First Term",
        "class": "JSS 1",
        "average_score": 80.00,
        "grade": "A",
        "total_obtained": 720,
        "subjects_count": 9,
        "attendance_rate": 96.67,
        "date": "2024-12-20 10:30:00"
      },
      {
        "report_id": 10,
        "session": "2023/2024",
        "term": "Third Term",
        "class": "Primary 6",
        "average_score": 75.50,
        "grade": "A",
        "total_obtained": 679,
        "subjects_count": 9,
        "attendance_rate": 95.00,
        "date": "2024-07-20 10:30:00"
      }
    ],
    "trends": {
      "improving": true,
      "declining": false,
      "stable": false,
      "message": "Performance improved by 4.5 points"
    },
    "total_reports": 5
  }
}
```

**Example Usage**:
```javascript
const getChildHistory = async (admissionNo) => {
  const response = await fetch(
    `https://your-domain.com/backend/routes/parent/get-child-history.php?admission_no=${admissionNo}`,
    {
      method: 'GET',
      credentials: 'include'
    }
  );
  return await response.json();
};
```

---

## Admin Endpoints (School Use)

### Add Parent-Student Relationship

**Endpoint**: `POST /parent/add-parent-student.php`

**Description**: Schools use this to link parents to students. Creates parent account if doesn't exist.

**Authentication**: School admin session required

**Request Body**:
```json
{
  "student_id": 10,
  "parent_email": "parent@example.com",
  "parent_name": "John Doe",
  "parent_phone": "+234812345678",
  "relationship": "father",
  "is_primary": true
}
```

**Fields**:
- `student_id` (required): Student ID
- `parent_email` (required): Parent email address
- `parent_name` (required): Parent full name
- `parent_phone` (optional): Phone number
- `relationship` (optional): One of: `father`, `mother`, `guardian`, `other` (default: `guardian`)
- `is_primary` (optional): Boolean, marks as primary contact (default: `false`)

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Parent linked to student successfully",
  "data": {
    "parent_id": 1,
    "student_id": 10,
    "student_name": "Jane Doe",
    "parent_email": "parent@example.com",
    "relationship": "father",
    "is_primary": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: Not logged in as school admin
- `404 Not Found`: Student not found
- `409 Conflict`: Parent already linked to this student

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details (only in development)"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal server error |

---

## Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical details (optional)"
}
```

---

## Session Management

### Cookie-Based Sessions

This API uses PHP session cookies for authentication. Important notes:

1. **Include Credentials**: Always set `credentials: 'include'` in fetch requests
2. **CORS**: Backend already configured with proper CORS headers
3. **Session Duration**: Sessions expire after 24 hours of inactivity
4. **Security**: Sessions are server-side, only session ID stored in cookie

### Example Session Setup (React Native)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://your-domain.com/backend/routes/parent';

// Login and store session
const login = async (email) => {
  const response = await fetch(`${API_BASE_URL}/login.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  const data = await response.json();

  if (data.success) {
    // Store user data locally
    await AsyncStorage.setItem('parent_data', JSON.stringify(data.data.parent));
    await AsyncStorage.setItem('session_token', data.data.session_token);
  }

  return data;
};

// Check session on app start
const checkSession = async () => {
  const response = await fetch(`${API_BASE_URL}/check-session.php`, {
    method: 'GET',
    credentials: 'include'
  });

  return await response.json();
};
```

---

## Mobile App Integration Guide

### 1. Login Flow

```
1. User enters email
2. Call /login.php
3. If successful:
   - Store parent data locally
   - Store session token
   - Navigate to home screen
4. If failed:
   - Show error message
   - Suggest contacting school
```

### 2. App Startup

```
1. Check if session token exists locally
2. Call /check-session.php
3. If valid:
   - Navigate to home screen
4. If invalid:
   - Clear local storage
   - Navigate to login screen
```

### 3. Main Dashboard

```
1. Call /get-children.php
2. Display list of children with:
   - Name, photo, class
   - School name
   - Quick action buttons
3. On child selection:
   - Call /get-child-analytics.php
   - Display comprehensive analytics
```

### 4. Performance History

```
1. User selects "View History"
2. Call /get-child-history.php
3. Display:
   - Timeline of reports
   - Performance trend graph
   - Improvement/decline indicators
```

---

## Testing the API

### Using Postman

1. **Login**:
   - Method: POST
   - URL: `https://your-domain.com/backend/routes/parent/login.php`
   - Body (JSON): `{"email": "parent@example.com"}`
   - Enable "Send cookies" in settings

2. **Get Children**:
   - Method: GET
   - URL: `https://your-domain.com/backend/routes/parent/get-children.php`
   - Use same session (cookies automatically sent)

3. **Get Analytics**:
   - Method: GET
   - URL: `https://your-domain.com/backend/routes/parent/get-child-analytics.php?student_id=10`

### Using cURL

```bash
# Login and save cookies
curl -X POST https://your-domain.com/backend/routes/parent/login.php \
  -H "Content-Type: application/json" \
  -d '{"email": "parent@example.com"}' \
  -c cookies.txt

# Use session to get children
curl -X GET https://your-domain.com/backend/routes/parent/get-children.php \
  -b cookies.txt

# Get child analytics
curl -X GET "https://your-domain.com/backend/routes/parent/get-child-analytics.php?student_id=10" \
  -b cookies.txt
```

---

## Security Considerations

### 1. Email-Only Authentication

- **Pros**: Simple, user-friendly, no password to forget
- **Cons**: Email access = full access to child data
- **Mitigation**: Parents must secure their email accounts

### 2. Session Security

- Sessions expire after inactivity
- HTTPS required in production
- Session IDs are randomly generated
- Server-side session storage

### 3. Authorization

- Parents can only access their own children's data
- All endpoints verify parent-student relationship
- School admins control parent-student links

### 4. Data Protection

- No sensitive financial or health data exposed
- Read-only access for parents (no modifications)
- Audit trail in database (added_by_school_id)

---

## Deployment Checklist

- [ ] Run database migration: `/backend/migrations/add_parents_guardians.sql`
- [ ] Ensure PHP sessions are enabled
- [ ] Configure CORS for your mobile app domain
- [ ] Enable HTTPS (required for production)
- [ ] Test all endpoints with real data
- [ ] Set up error logging
- [ ] Configure session timeout (default: 24 hours)
- [ ] Test session persistence across requests
- [ ] Verify email validation works
- [ ] Test with multiple children per parent
- [ ] Test with multiple parents per student

---

## Support & Resources

- **Database Schema**: See `/backend/migrations/add_parents_guardians.sql`
- **Backend Config**: `/backend/config/database.php`
- **Error Logs**: Check server PHP error logs
- **Session Issues**: Verify cookies are enabled and CORS is configured

---

## Changelog

### Version 1.0 (December 2024)
- Initial release
- Email-only authentication
- Child analytics endpoint
- Performance history tracking
- School admin parent linking

---

**API Version**: 1.0
**Last Updated**: December 2024
**Status**: ✅ Production Ready

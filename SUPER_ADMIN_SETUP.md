# Super Admin System - Setup Guide

## Overview

The Super Admin system provides comprehensive oversight over all schools and their students in the report card generator platform. Super admins have full control capabilities including:

- **Full CRUD access** to all schools, students, teachers, and reports
- **School account management** - activate/deactivate schools, manage subscriptions
- **System-wide analytics** - aggregated statistics, revenue tracking, growth metrics
- **Activity logging** - complete audit trail of all super admin actions

## Installation

### 1. Run Database Migration

Execute the SQL migration to create super admin tables:

```bash
mysql -u your_username -p db_abcb24_school < backend/migrations/add_super_admin.sql
```

Or manually run the migration in your database:

```sql
source backend/migrations/add_super_admin.sql;
```

This creates:
- `super_admins` table - stores super admin accounts
- `super_admin_activity_log` table - audit trail for all super admin actions

### 2. Create Your First Super Admin Account

Use the provided script to create a super admin account:

```bash
cd backend
php scripts/create-super-admin.php
```

The script will prompt you for:
- Name
- Email
- Password
- Phone (optional)

**Example:**
```
=== Create Super Admin Account ===

Enter super admin name: System Administrator
Enter super admin email: admin@yourplatform.com
Enter super admin password: YourSecurePassword123!
Enter super admin phone (optional): +234-xxx-xxx-xxxx

✓ Super admin account created successfully!
ID: 1
Name: System Administrator
Email: admin@yourplatform.com

You can now log in at: /super-admin/login
```

## API Endpoints

All super admin endpoints are prefixed with `/super-admin/`

### Authentication

#### Login
```http
POST /super-admin/login
Content-Type: application/json

{
  "email": "admin@yourplatform.com",
  "password": "YourPassword123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@yourplatform.com",
    "phone": "+234-xxx-xxx-xxxx",
    "user_type": "super_admin"
  }
}
```

#### Check Session
```http
GET /super-admin/check-session
```

#### Logout
```http
POST /super-admin/logout
```

### School Management

#### Get All Schools
```http
GET /super-admin/get-all-schools?page=1&limit=20&status=active&search=school+name
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `status` (optional) - Filter by subscription status: active, expired, trial
- `search` (optional) - Search by school name, email, or phone

**Response:**
```json
{
  "schools": [
    {
      "id": 1,
      "school_name": "ABC Secondary School",
      "email": "abc@school.com",
      "phone": "xxx-xxx-xxxx",
      "is_active": true,
      "subscription_status": "active",
      "subscription_end_date": "2025-12-31",
      "total_students": 150,
      "total_teachers": 12,
      "total_classes": 8
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_items": 45,
    "total_pages": 3
  }
}
```

#### Get School Details
```http
GET /super-admin/get-school-details?school_id=1
```

**Response:**
```json
{
  "school": { /* full school details */ },
  "subscription_history": [ /* payment history */ ],
  "recent_students": [ /* last 10 students */ ],
  "recent_teachers": [ /* last 10 teachers */ ]
}
```

#### Toggle School Status
```http
POST /super-admin/toggle-school-status
Content-Type: application/json

{
  "school_id": 1,
  "is_active": false
}
```

#### Update School Subscription (Override)
```http
POST /super-admin/update-school-subscription
Content-Type: application/json

{
  "school_id": 1,
  "subscription_status": "active",
  "subscription_end_date": "2026-12-31"
}
```

### Student Oversight

#### Get All Students (Across All Schools)
```http
GET /super-admin/get-all-students?page=1&limit=50&school_id=1&class=JSS1&search=student+name
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)
- `school_id` (optional) - Filter by specific school
- `class` (optional) - Filter by class
- `session` (optional) - Filter by session
- `term` (optional) - Filter by term
- `search` (optional) - Search by student name, admission number, or school name

**Response:**
```json
{
  "students": [
    {
      "id": 1,
      "name": "John Doe",
      "class": "JSS1",
      "session": "2023/2024",
      "term": "First Term",
      "admission_no": "ABC001",
      "school_id": 1,
      "school_name": "ABC Secondary School",
      "school_email": "abc@school.com",
      "subscription_status": "active",
      "total_subjects": 10
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Analytics Dashboard

#### Get Super Admin Analytics
```http
GET /super-admin/get-analytics
```

**Response:**
```json
{
  "school_statistics": {
    "total_schools": 45,
    "active_schools": 38,
    "subscribed_schools": 35,
    "trial_schools": 7,
    "expired_schools": 3
  },
  "student_statistics": {
    "total_students": 6750
  },
  "teacher_statistics": {
    "total_teachers": 540
  },
  "revenue_statistics": {
    "total_revenue": 1750000.00,
    "monthly_revenue": 175000.00,
    "successful_payments": 350,
    "failed_payments": 12
  },
  "recent_schools_30_days": {
    "count": 8
  },
  "subscription_breakdown": [
    {"subscription_status": "active", "count": 35},
    {"subscription_status": "trial", "count": 7},
    {"subscription_status": "expired", "count": 3}
  ],
  "top_schools": [
    {
      "id": 1,
      "school_name": "ABC Secondary School",
      "student_count": 250,
      "teacher_count": 20
    }
  ],
  "growth_statistics": [
    {"month": "2025-12", "schools_registered": 5},
    {"month": "2025-11", "schools_registered": 8}
  ],
  "schools_expiring_soon": [
    {
      "id": 5,
      "school_name": "XYZ School",
      "subscription_end_date": "2025-12-25",
      "days_remaining": 4
    }
  ]
}
```

## Security Features

### Activity Logging

All super admin actions are automatically logged in the `super_admin_activity_log` table with:
- Super admin ID
- Action type (view, create, update, delete, login, logout, school_activate, etc.)
- Target type (school, student, teacher, subscription, etc.)
- Target ID and school ID (when applicable)
- Description
- IP address and user agent
- Timestamp

### Authorization Middleware

All super admin routes are protected by the `requireSuperAdmin()` middleware which:
1. Checks if user is logged in as super_admin
2. Verifies the super admin account is still active
3. Auto-destroys session if account is deactivated

## User Type Hierarchy

The system now has 3 user types:

1. **super_admin** - Oversees all schools and students (highest privilege)
2. **school** - Manages their own school's students and teachers
3. **teacher** - Views and manages students in assigned classes only

Session variable: `$_SESSION['user_type']` contains one of these values.

## Frontend Integration

To integrate with your React frontend:

### Login Component Example

```javascript
const superAdminLogin = async (email, password) => {
  const response = await fetch('/backend/super-admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    // Store user type in state/context
    setUser(data.user);
    // Redirect to super admin dashboard
    navigate('/super-admin/dashboard');
  }
};
```

### Protected Routes

```javascript
// Add super admin route protection
if (user?.user_type === 'super_admin') {
  // Show super admin UI
} else if (user?.user_type === 'school') {
  // Show school admin UI
} else if (user?.user_type === 'teacher') {
  // Show teacher UI
}
```

## Next Steps

1. **Run the migration** to create database tables
2. **Create your first super admin** using the script
3. **Test the login** endpoint
4. **Build the frontend UI** for super admin dashboard
5. **Implement additional routes** as needed (edit school details, delete schools, etc.)

## Additional Routes to Consider

You may want to add these routes later:

- `/super-admin/create-school` - Create schools directly
- `/super-admin/update-school` - Edit school details
- `/super-admin/delete-school` - Remove schools
- `/super-admin/get-activity-log` - View audit trail
- `/super-admin/create-super-admin` - Create additional super admins
- `/super-admin/get-revenue-report` - Detailed revenue analytics
- `/super-admin/export-data` - Export system data (CSV/Excel)

## Support

For issues or questions about the super admin system, please check the activity logs in the database or review the session management in `backend/middleware/super-admin-check.php`.

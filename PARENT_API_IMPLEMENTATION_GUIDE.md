# Parent/Guardian API Implementation Guide

## Quick Start

This guide will help you implement the parent mobile API in your SchoolHub application.

---

## 1. Database Setup

### Step 1: Run the Migration

Execute the SQL migration to create the necessary tables:

```bash
mysql -u your_username -p your_database < backend/migrations/add_parents_guardians.sql
```

Or manually run the SQL in your database management tool (phpMyAdmin, MySQL Workbench, etc.)

**Tables Created**:
- `parents` - Stores parent/guardian accounts
- `parent_students` - Links parents to students (many-to-many)
- Adds `parent_email` column to `students` table for quick reference

### Step 2: Verify Tables

```sql
SHOW TABLES LIKE 'parent%';
DESCRIBE parents;
DESCRIBE parent_students;
```

---

## 2. Backend API Endpoints

All parent API files are already created in `/backend/routes/parent/`:

```
backend/routes/parent/
├── login.php                    # Email-only login
├── check-session.php            # Verify session
├── logout.php                   # Logout
├── get-children.php             # Get all children
├── get-child-analytics.php      # Get child performance data
├── get-child-history.php        # Get historical performance
└── add-parent-student.php       # Link parent to student (admin)
```

### Verify Endpoints are Accessible

Test the endpoints using cURL or browser:

```bash
# Test login endpoint
curl -X POST https://your-domain.com/backend/routes/parent/login.php \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected response (before data setup):
```json
{
  "success": false,
  "message": "No account found with this email address..."
}
```

This confirms the endpoint is working.

---

## 3. Adding Parents to the System

### Option A: Via School Admin Dashboard (Recommended)

Create a form in the school dashboard to add parents:

```javascript
import { addParentStudent } from '../services/api';

const addParentToStudent = async () => {
  const data = {
    student_id: 10,
    parent_email: "parent@example.com",
    parent_name: "John Doe",
    parent_phone: "+234812345678",
    relationship: "father",
    is_primary: true
  };

  const response = await addParentStudent(data);

  if (response.success) {
    alert('Parent added successfully!');
  }
};
```

### Option B: Direct Database Insert (For Testing)

```sql
-- Insert a test parent
INSERT INTO parents (email, name, phone)
VALUES ('test@example.com', 'Test Parent', '+234801234567');

-- Link parent to student
INSERT INTO parent_students (parent_id, student_id, relationship, is_primary, added_by_school_id)
VALUES (1, 10, 'father', TRUE, 1);
-- Replace IDs with actual values from your database
```

### Option C: Bulk Import (CSV)

Create a PHP script to bulk import parents from CSV:

```php
// backend/routes/parent/bulk-import.php
<?php
require_once __DIR__ . '/../../config/database.php';

$csv = fopen($_FILES['csv']['tmp_name'], 'r');
while (($row = fgetcsv($csv)) !== false) {
    // $row[0] = student_admission_no
    // $row[1] = parent_email
    // $row[2] = parent_name
    // $row[3] = parent_phone

    // Insert parent and link to student
    // ... implementation
}
?>
```

---

## 4. Mobile App Integration

### React Native Example

```javascript
// services/parentApi.js
const API_BASE_URL = 'https://your-domain.com/backend/routes/parent';

// Login
export const login = async (email) => {
  const response = await fetch(`${API_BASE_URL}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });
  return await response.json();
};

// Get Children
export const getChildren = async () => {
  const response = await fetch(`${API_BASE_URL}/get-children.php`, {
    credentials: 'include'
  });
  return await response.json();
};

// Get Child Analytics
export const getChildAnalytics = async (studentId) => {
  const response = await fetch(
    `${API_BASE_URL}/get-child-analytics.php?student_id=${studentId}`,
    { credentials: 'include' }
  );
  return await response.json();
};
```

### Flutter Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ParentApi {
  static const String baseUrl = 'https://your-domain.com/backend/routes/parent';

  static Future<Map<String, dynamic>> login(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login.php'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> getChildren() async {
    final response = await http.get(
      Uri.parse('$baseUrl/get-children.php'),
    );
    return jsonDecode(response.body);
  }
}
```

---

## 5. Frontend Integration (Web Dashboard)

### Add Parent Management to School Dashboard

Create a new component: `/src/pages/ParentManagement.jsx`

```javascript
import { useState, useEffect } from 'react';
import { getAllStudents, addParentStudent } from '../services/api';
import { useToastContext } from '../context/ToastContext';

export default function ParentManagement() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentData, setParentData] = useState({
    parent_email: '',
    parent_name: '',
    parent_phone: '',
    relationship: 'guardian',
    is_primary: true
  });
  const { toast } = useToastContext();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const response = await getAllStudents();
    if (response.success) {
      setStudents(response.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await addParentStudent({
      student_id: selectedStudent,
      ...parentData
    });

    if (response.success) {
      toast.success('Parent added successfully!');
      // Reset form
      setParentData({
        parent_email: '',
        parent_name: '',
        parent_phone: '',
        relationship: 'guardian',
        is_primary: true
      });
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Parent Management</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Student</label>
          <select
            value={selectedStudent || ''}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">-- Choose Student --</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.class} ({student.admission_no})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Parent Email</label>
          <input
            type="email"
            value={parentData.parent_email}
            onChange={(e) => setParentData({...parentData, parent_email: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Parent Name</label>
          <input
            type="text"
            value={parentData.parent_name}
            onChange={(e) => setParentData({...parentData, parent_name: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            value={parentData.parent_phone}
            onChange={(e) => setParentData({...parentData, parent_phone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Relationship</label>
          <select
            value={parentData.relationship}
            onChange={(e) => setParentData({...parentData, relationship: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="father">Father</option>
            <option value="mother">Mother</option>
            <option value="guardian">Guardian</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={parentData.is_primary}
            onChange={(e) => setParentData({...parentData, is_primary: e.target.checked})}
            className="w-4 h-4"
          />
          <label className="text-sm font-medium">Primary Contact</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Add Parent
        </button>
      </form>
    </div>
  );
}
```

---

## 6. Testing the Implementation

### Step 1: Add Test Data

```sql
-- Add a test parent
INSERT INTO parents (email, name, phone)
VALUES ('parent@test.com', 'Test Parent', '+234801234567');

-- Get the parent ID
SELECT id FROM parents WHERE email = 'parent@test.com';
-- Let's say it returns ID = 1

-- Link to a student (use real student ID from your database)
INSERT INTO parent_students (parent_id, student_id, relationship, is_primary, added_by_school_id)
VALUES (1, 10, 'father', TRUE, 1);
```

### Step 2: Test Login

```bash
curl -X POST https://your-domain.com/backend/routes/parent/login.php \
  -H "Content-Type: application/json" \
  -d '{"email": "parent@test.com"}' \
  -c cookies.txt
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "parent": {...},
    "children": [...]
  }
}
```

### Step 3: Test Get Children

```bash
curl -X GET https://your-domain.com/backend/routes/parent/get-children.php \
  -b cookies.txt
```

### Step 4: Test Analytics

```bash
curl -X GET "https://your-domain.com/backend/routes/parent/get-child-analytics.php?student_id=10" \
  -b cookies.txt
```

---

## 7. Security Checklist

- [ ] HTTPS enabled in production
- [ ] CORS configured for mobile app domain
- [ ] Session timeout configured (default: 24 hours)
- [ ] Email validation working
- [ ] Authorization checks in place (parent can only access own children)
- [ ] SQL injection prevention (using prepared statements)
- [ ] Session hijacking prevention (secure cookies)
- [ ] Rate limiting on login endpoint (recommended)

---

## 8. Common Issues & Solutions

### Issue 1: "No account found" on login

**Cause**: Parent not in database or not linked to any student

**Solution**:
```sql
-- Check if parent exists
SELECT * FROM parents WHERE email = 'parent@example.com';

-- Check if linked to student
SELECT * FROM parent_students WHERE parent_id = X;
```

### Issue 2: Session not persisting

**Cause**: Cookies not being sent/received

**Solution**:
- Ensure `credentials: 'include'` in all fetch requests
- Check CORS headers allow credentials
- Verify cookies are enabled in mobile app

### Issue 3: Empty children array

**Cause**: No parent-student relationship exists

**Solution**:
```sql
INSERT INTO parent_students (parent_id, student_id, relationship, is_primary, added_by_school_id)
VALUES (1, 10, 'guardian', TRUE, 1);
```

### Issue 4: 403 Forbidden on analytics

**Cause**: Parent trying to access another parent's child

**Solution**: Verify the student belongs to the logged-in parent

---

## 9. Production Deployment

### Step 1: Database Migration

```bash
# Backup database first
mysqldump -u username -p database_name > backup.sql

# Run migration
mysql -u username -p database_name < backend/migrations/add_parents_guardians.sql
```

### Step 2: Upload Backend Files

```
backend/routes/parent/
├── login.php
├── check-session.php
├── logout.php
├── get-children.php
├── get-child-analytics.php
├── get-child-history.php
└── add-parent-student.php
```

### Step 3: Configure CORS

Edit `/backend/routes/parent/*.php` if needed:

```php
header('Access-Control-Allow-Origin: https://your-mobile-app-domain.com');
// Or keep '*' for development
```

### Step 4: Test in Production

Use the testing steps from section 6 with production URLs.

---

## 10. Monitoring & Maintenance

### Log Parent Logins

Add logging to `login.php`:

```php
// After successful login
error_log("Parent login: {$parent['email']} at " . date('Y-m-d H:i:s'));
```

### Monitor API Usage

```sql
-- Check total parents
SELECT COUNT(*) as total_parents FROM parents;

-- Check parent-student links
SELECT COUNT(*) as total_links FROM parent_students;

-- Check parents with no children
SELECT p.* FROM parents p
LEFT JOIN parent_students ps ON p.id = ps.parent_id
WHERE ps.id IS NULL;
```

### Database Maintenance

```sql
-- Remove inactive parents (optional)
DELETE FROM parents WHERE is_active = FALSE AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Update primary contacts
UPDATE parent_students SET is_primary = FALSE WHERE student_id = X;
UPDATE parent_students SET is_primary = TRUE WHERE id = Y;
```

---

## 11. Next Steps

1. ✅ Database migration completed
2. ✅ API endpoints created
3. ✅ Frontend API functions added
4. 📝 Add parent management UI to school dashboard
5. 📝 Develop mobile application
6. 📝 Test with real users
7. 📝 Gather feedback and iterate

---

## Resources

- **Full API Documentation**: `/PARENT_MOBILE_API_DOCUMENTATION.md`
- **Database Schema**: `/backend/migrations/add_parents_guardians.sql`
- **API Functions**: `/src/services/api.js` (lines 812-948)
- **Testing Guide**: See section 6 above

---

**Version**: 1.0
**Status**: ✅ Ready for Implementation
**Last Updated**: December 2024

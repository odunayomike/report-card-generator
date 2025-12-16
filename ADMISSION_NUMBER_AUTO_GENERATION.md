# Admission Number Auto-Generation

The system now automatically generates unique admission numbers for new students.

## How It Works

### Format
Admission numbers follow this pattern (6 characters total):
```
PREFIX(2) + NUMBER(4)
```

**Examples:**
- `ST0001` - First student (default prefix)
- `AB0042` - 42nd student at ABC School
- `JH0123` - 123rd student at John High School

### Prefix Generation (2 letters)
The prefix is automatically generated from the school name:
- **Multiple words**: Uses first letter of first 2 words (e.g., "John High School" → "JH")
- **Single word**: Uses first 2 letters (e.g., "Academy" → "AC")
- **Default**: "ST" if school name not available

### Number Increment (4 digits)
- Numbers start from 0001
- Automatically increments based on the last student created
- Supports up to 9999 students per school
- Ensures uniqueness by checking existing admission numbers

## Features

### 1. **Backend API** (`/api/generate-admission-number`)
- Generates unique admission numbers
- Based on school name and existing students
- Thread-safe (checks for duplicates)

### 2. **Frontend Implementation**
- **Auto-generation**: Number generated when form loads
- **Read-only field**: Prevents manual editing
- **Regenerate button**: Click refresh icon to generate new number
- **Visual feedback**: Shows "Generating..." while loading

### 3. **Smart Algorithm**
```php
// Example: School "ABC Academy" with 41 students
Prefix: "AB" (first 2 letters)
Next Number: "0042" (padded to 4 digits)
Result: "AB0042" (6 characters total)
```

## Usage

### For Schools/Teachers:
1. Navigate to "Add Student" page
2. Admission number is automatically generated
3. If needed, click refresh button to generate a new number
4. Fill in other student details
5. Submit the form

### API Endpoint:
```bash
GET /api/generate-admission-number

Response:
{
  "success": true,
  "admission_number": "ST0001"
}
```

## Benefits

✅ **No Duplicates**: Guarantees unique admission numbers
✅ **Automatic**: No manual entry required
✅ **Consistent Format**: All numbers are exactly 6 characters
✅ **School-Specific**: Prefix based on school name
✅ **Compact**: Short and easy to remember
✅ **Sequential**: Numbers increment logically (0001-9999)

## Technical Details

### Backend Logic:
1. Get 2-letter school prefix from name
2. Query last student's admission number
3. Extract and increment the number
4. Format: PREFIX(2) + PADDED_NUMBER(4) = 6 characters
5. Verify uniqueness
6. Return generated number

### Files Modified:
- `backend/routes/generate-admission-number.php` - Generation logic
- `backend/index.php` - Added route
- `src/services/api.js` - API function
- `src/pages/AddStudent.jsx` - Auto-generation UI

## Examples by School Type

| School Name | Prefix | Example Numbers |
|------------|--------|----------------|
| John High School | JH | JH0001, JH0002, JH0123 |
| ABC Academy | AB | AB0001, AB0042, AB1234 |
| St. Mary's | SM | SM0001, SM0099, SM5678 |
| Academy | AC | AC0001, AC0010, AC9999 |
| Default | ST | ST0001, ST0002, ST0003 |

The system ensures that every student gets a unique, professional-looking **6-character** admission number automatically!

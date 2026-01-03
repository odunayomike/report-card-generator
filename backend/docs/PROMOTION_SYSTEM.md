# Automatic Student Promotion System

## Overview
The automatic promotion system evaluates students at the end of Third Term and automatically promotes them to the next class based on their performance.

## How It Works

### 1. **Trigger**
- Automatic promotion is triggered when a **Third Term** report card is saved
- Only Third Term reports trigger promotion checks (First and Second Term reports are ignored)

### 2. **Promotion Criteria**
- Student's **average score** across all subjects must meet or exceed the school's **promotion threshold**
- Default threshold: **45%** (configurable by school)
- Calculation: `AVG(all subject totals) >= promotion_threshold`

### 3. **Promotion Logic**

```
IF term == "Third Term":
    Calculate student average score

    IF average_score < promotion_threshold:
        → RETAIN student in current class

    ELSE IF current_class is terminal (e.g., SSS 3):
        → Mark as COMPLETED/GRADUATED

    ELSE:
        → PROMOTE to next class in hierarchy
```

### 4. **Class Hierarchy**

The system follows this progression:

**Primary School:**
- Primary 1 → Primary 2 → Primary 3 → Primary 4 → Primary 5 → JSS 1

**Junior Secondary (JSS):**
- JSS 1 → JSS 2 → JSS 3 → SSS 1

**Senior Secondary (SSS):**
- SSS 1 → SSS 2 → SSS 3 (Terminal/Final Class)

### 5. **Outcomes**

**Promoted:**
- Student's `current_class` is updated to the next class
- Promotion status set to 'promoted'
- Record created in `student_promotions` table

**Retained:**
- Student stays in same class
- Promotion status set to 'retained'
- Record created in `student_promotions` table

**Completed:**
- Student has finished SSS 3 (terminal class)
- Promotion status set to 'graduated'
- No further promotion possible

## Database Schema

### Tables Created

**1. schools (columns added):**
```sql
promotion_threshold DECIMAL(5,2) DEFAULT 45.00
auto_promotion_enabled TINYINT(1) DEFAULT 1
```

**2. class_hierarchy:**
```sql
- class_name (e.g., "JSS 1")
- class_level (1-11)
- next_class (e.g., "JSS 2")
- class_category (Primary/Junior Secondary/Senior Secondary)
- is_terminal (0 or 1)
```

**3. student_promotions:**
```sql
- student_id
- from_class
- to_class
- session
- term
- average_score
- promotion_status (promoted/retained/completed)
- promotion_reason
- report_card_id
- promoted_at
```

**4. students (columns added):**
```sql
last_promotion_date TIMESTAMP
promotion_status ENUM('active', 'promoted', 'retained', 'graduated', 'left')
```

## API Endpoints

### 1. Get Promotion Settings
**GET** `/api/school/get-promotion-settings`

Response:
```json
{
  "success": true,
  "settings": {
    "promotion_threshold": 45.00,
    "auto_promotion_enabled": true
  },
  "class_hierarchy": [...]
}
```

### 2. Update Promotion Settings
**POST** `/api/school/update-promotion-settings`

Request Body:
```json
{
  "promotion_threshold": 50.0,
  "auto_promotion_enabled": true
}
```

### 3. Get Promotion History
**GET** `/api/school/get-promotion-history?admission_no=12345`

Response:
```json
{
  "success": true,
  "promotions": [
    {
      "from_class": "JSS 1",
      "to_class": "JSS 2",
      "session": "2024/2025",
      "term": "Third Term",
      "average_score": 67.5,
      "promotion_status": "promoted",
      "promoted_at": "2025-06-15 10:30:00"
    }
  ],
  "stats": {
    "total_promotions": 150,
    "promoted_count": 135,
    "retained_count": 12,
    "completed_count": 3
  }
}
```

### 4. Save Report (Modified)
**POST** `/api/save-report`

Response now includes promotion information:
```json
{
  "success": true,
  "message": "Report card saved and student promoted to JSS 2",
  "report_card_id": 123,
  "promotion": {
    "promoted": true,
    "from_class": "JSS 1",
    "to_class": "JSS 2",
    "average_score": 67.5,
    "reason": "Promoted with 67.5% average (threshold: 45%)",
    "action": "promoted"
  }
}
```

## Usage Examples

### Example 1: Successful Promotion
```
Student: John Doe (JSS 1)
Term: Third Term
Average Score: 65%
Threshold: 45%

Result: ✓ PROMOTED to JSS 2
Message: "Promoted with 65% average (threshold: 45%)"
```

### Example 2: Student Retained
```
Student: Jane Smith (Primary 3)
Term: Third Term
Average Score: 38%
Threshold: 45%

Result: ✗ RETAINED in Primary 3
Message: "Average score (38%) below promotion threshold (45%)"
```

### Example 3: Terminal Class
```
Student: Mike Johnson (SSS 3)
Term: Third Term
Average Score: 72%
Threshold: 45%

Result: ★ COMPLETED/GRADUATED
Message: "Completed terminal class with 72% average"
```

### Example 4: Not Third Term
```
Student: Sarah Lee (JSS 2)
Term: First Term
Average Score: 80%

Result: − NO ACTION
Reason: "Not a Third Term report"
```

## Configuration

Schools can customize:

1. **Promotion Threshold**: Set minimum pass percentage (0-100%)
2. **Auto-Promotion**: Enable/disable automatic promotions

Access via: School Settings → Promotion Settings

## Files Modified/Created

**Migration:**
- `backend/migrations/add_promotion_system.sql`
- `backend/migrations/run_promotion_system.php`

**Core Logic:**
- `backend/utils/PromotionHelper.php` (NEW)
- `backend/routes/save-report.php` (MODIFIED)

**API Endpoints:**
- `backend/routes/school/get-promotion-settings.php` (NEW)
- `backend/routes/school/update-promotion-settings.php` (NEW)
- `backend/routes/school/get-promotion-history.php` (NEW)

**Routes:**
- `backend/index.php` (MODIFIED - added 3 new routes)

## Testing

To test the promotion system:

1. Set school promotion threshold (e.g., 45%)
2. Create a Third Term report card with subjects
3. Ensure average score is calculated correctly
4. Check response for promotion information
5. Verify student's `current_class` was updated
6. Check `student_promotions` table for history record

## Notes

- Promotion only happens on **Third Term** reports
- First and Second Term reports do NOT trigger promotion
- Promotion threshold is **per school** (each school can set their own)
- Terminal classes: SSS 3 (no further promotion)
- Class transitions: Primary 5 → JSS 1, JSS 3 → SSS 1
- Promotion is **automatic** but can be disabled per school
- Promotion history is **permanent** and tracked in `student_promotions` table

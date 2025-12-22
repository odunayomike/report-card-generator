# SchoolHub CBT System - Complete Implementation Plan
## Internal School Exams with Auto Report Card Integration

---

## Executive Summary

### The Vision
A complete Computer-Based Testing (CBT) system where:
- Teachers create **Continuous Assessment (CA)** tests and **End-of-Term Exams** digitally
- Students take exams on computers
- System **auto-grades** objective questions instantly
- Scores **automatically populate** the report card
- Teachers **never manually enter scores** for CBT-based subjects
- Complete audit trail of all assessments

### Key Difference from Standard CBT
This is not just exam practice - this is the **ACTUAL** assessment system that:
- Replaces paper-based CA tests
- Replaces paper-based term exams
- Directly generates report card grades
- Maintains official academic records

---

## Understanding the Current Report Card System

### Current Flow (Manual):
1. Teacher creates paper test
2. Students write on paper
3. Teacher grades manually (hours of work)
4. Teacher calculates scores
5. Teacher enters scores into system
6. System generates report card

### Problems:
- Time-consuming grading
- Manual data entry errors
- No analytics on question performance
- No historical data on student weaknesses
- Delayed results
- Lost exam papers

### New Flow (CBT Integrated):
1. Teacher creates CBT exam
2. Students take exam on computer
3. System auto-grades instantly
4. **Scores auto-save to student assessment record**
5. **Report card auto-populated**
6. Teacher reviews (essays only if included)
7. Report card ready!

### Benefits:
- Zero manual score entry
- Instant results
- Zero calculation errors
- Rich analytics
- Complete audit trail
- Time saved: 90%+

---

## Nigerian School Assessment Structure

### Typical Score Distribution (Per Subject, Per Term):

**Total: 100 marks**

1. **Continuous Assessment (CA): 40 marks**
   - CA Test 1: 10 marks
   - CA Test 2: 10 marks
   - CA Test 3: 10 marks (or Assignment)
   - Classwork/Participation: 10 marks

2. **End of Term Exam: 60 marks**

### How CBT Fits:

**CBT Replaces:**
- ✅ CA Test 1 (10 marks) - CBT
- ✅ CA Test 2 (10 marks) - CBT
- ✅ CA Test 3 (10 marks) - CBT
- ✅ End of Term Exam (60 marks) - CBT

**Manual Entry Still Needed:**
- Classwork/Participation (10 marks) - Teacher discretion
- Projects/Assignments - If not CBT-based

**Result:**
- 90% automated (90 marks via CBT)
- 10% manual (10 marks participation)
- Or 100% automated if participation is also systematized

---

## Database Schema Design

### 1. Assessment Configuration Table

```sql
-- Define assessment types and weights for each subject
CREATE TABLE assessment_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    subject_id INT NOT NULL,
    class VARCHAR(50) NOT NULL,
    session VARCHAR(20) NOT NULL, -- "2023/2024"
    term VARCHAR(20) NOT NULL, -- "First Term"

    -- Assessment breakdown
    ca_test_1_marks INT DEFAULT 10,
    ca_test_2_marks INT DEFAULT 10,
    ca_test_3_marks INT DEFAULT 10,
    participation_marks INT DEFAULT 10,
    exam_marks INT DEFAULT 60,
    total_marks INT DEFAULT 100,

    -- Flags
    use_cbt_for_ca1 TINYINT(1) DEFAULT 1,
    use_cbt_for_ca2 TINYINT(1) DEFAULT 1,
    use_cbt_for_ca3 TINYINT(1) DEFAULT 1,
    use_cbt_for_exam TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assessment_config (school_id, subject_id, class, session, term),
    INDEX idx_config (school_id, class, session, term)
);
```

### 2. CBT Questions Table

```sql
CREATE TABLE cbt_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    subject_id INT NOT NULL,
    class VARCHAR(50) NOT NULL,

    -- Question content
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank', 'essay') DEFAULT 'multiple_choice',

    -- Organization
    topic VARCHAR(200), -- e.g., "Algebra", "Photosynthesis"
    subtopic VARCHAR(200), -- e.g., "Quadratic Equations"
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',

    -- Scoring
    marks INT DEFAULT 1,

    -- Media
    question_image VARCHAR(500), -- Optional image URL

    -- Explanation
    explanation TEXT, -- Why the answer is correct

    -- Metadata
    created_by INT NOT NULL, -- teacher_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,

    -- Usage tracking
    times_used INT DEFAULT 0,
    avg_score DECIMAL(5,2), -- Average performance on this question

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES teachers(id) ON DELETE CASCADE,

    INDEX idx_subject_class (subject_id, class),
    INDEX idx_topic (topic, subtopic),
    INDEX idx_difficulty (difficulty)
);

-- Multiple choice options
CREATE TABLE cbt_question_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    option_label CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,
    INDEX idx_question (question_id)
);

-- Answers for other question types
CREATE TABLE cbt_question_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    correct_answer TEXT NOT NULL,
    alternative_answers TEXT, -- JSON array of acceptable variations

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE
);
```

### 3. CBT Exams/Tests Table

```sql
CREATE TABLE cbt_exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    subject_id INT NOT NULL,
    class VARCHAR(50) NOT NULL,
    session VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,

    -- Exam identification
    exam_title VARCHAR(200) NOT NULL,
    exam_code VARCHAR(50) UNIQUE, -- "MATH-JSS1-2024-CA1"

    -- Assessment type - THIS IS CRITICAL
    assessment_type ENUM('ca_test_1', 'ca_test_2', 'ca_test_3', 'exam') NOT NULL,

    -- Exam details
    total_questions INT NOT NULL,
    total_marks INT NOT NULL, -- Must match assessment_config
    duration_minutes INT NOT NULL,
    pass_mark INT DEFAULT 50, -- Percentage

    -- Instructions
    instructions TEXT,

    -- Timing
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,

    -- Settings
    shuffle_questions TINYINT(1) DEFAULT 1,
    shuffle_options TINYINT(1) DEFAULT 1,
    show_results_immediately TINYINT(1) DEFAULT 0, -- Usually no for official exams
    allow_review_before_submit TINYINT(1) DEFAULT 1,
    attempts_allowed INT DEFAULT 1, -- Usually 1 for official exams

    -- Publishing
    is_published TINYINT(1) DEFAULT 0,
    published_at TIMESTAMP NULL,
    published_by INT, -- teacher_id

    -- Auto report card integration - KEY FEATURE
    auto_update_report_card TINYINT(1) DEFAULT 1, -- Automatically update when submitted
    report_card_updated TINYINT(1) DEFAULT 0, -- Track if scores pushed to report

    -- Metadata
    created_by INT NOT NULL, -- teacher_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES teachers(id) ON DELETE CASCADE,

    INDEX idx_assessment (school_id, class, session, term, assessment_type),
    INDEX idx_dates (start_datetime, end_datetime),
    INDEX idx_published (is_published, is_active)
);

-- Questions in exam
CREATE TABLE cbt_exam_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    question_order INT NOT NULL, -- Order in which question appears
    marks INT NOT NULL, -- Can override default question marks

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,

    UNIQUE KEY unique_exam_question (exam_id, question_id),
    INDEX idx_exam_order (exam_id, question_order)
);

-- Student assignment to exam
CREATE TABLE cbt_exam_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT NOT NULL, -- teacher_id

    -- Status tracking
    has_started TINYINT(1) DEFAULT 0,
    has_submitted TINYINT(1) DEFAULT 0,
    is_graded TINYINT(1) DEFAULT 0, -- For essays
    score_pushed_to_report TINYINT(1) DEFAULT 0, -- Confirmation flag

    FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,

    UNIQUE KEY unique_exam_student (exam_id, student_id),
    INDEX idx_student (student_id),
    INDEX idx_status (has_submitted, is_graded, score_pushed_to_report)
);
```

### 4. Student Attempts & Responses

```sql
CREATE TABLE cbt_student_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    attempt_number INT DEFAULT 1,

    -- Timing
    started_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NULL,
    time_taken_seconds INT,

    -- Status
    status ENUM('in_progress', 'submitted', 'graded', 'abandoned') DEFAULT 'in_progress',

    -- Scoring
    auto_graded_score DECIMAL(5,2) DEFAULT 0, -- MCQ/True-False auto-graded
    manual_graded_score DECIMAL(5,2) DEFAULT 0, -- Essay questions
    total_score DECIMAL(5,2) DEFAULT 0, -- auto + manual
    percentage DECIMAL(5,2) DEFAULT 0,

    -- Grading status
    needs_manual_grading TINYINT(1) DEFAULT 0, -- Has essay questions
    manually_graded_by INT, -- teacher_id
    manually_graded_at TIMESTAMP NULL,

    -- Integration status
    pushed_to_report_card TINYINT(1) DEFAULT 0,
    pushed_at TIMESTAMP NULL,

    -- Security/Tracking
    ip_address VARCHAR(45),
    user_agent TEXT,
    browser_type VARCHAR(50),
    device_type VARCHAR(50),

    -- Anomaly detection
    tab_switches INT DEFAULT 0,
    focus_lost_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,

    INDEX idx_student_exam (student_id, exam_id),
    INDEX idx_status (status, needs_manual_grading),
    INDEX idx_grading (needs_manual_grading, manually_graded_at)
);

CREATE TABLE cbt_student_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,

    -- Responses
    selected_option_id INT, -- For MCQ
    text_answer TEXT, -- For fill-blank, essay

    -- Grading
    is_correct TINYINT(1), -- NULL for essay/pending
    marks_awarded DECIMAL(5,2) DEFAULT 0,
    max_marks DECIMAL(5,2) NOT NULL, -- From question

    -- Manual grading (for essays)
    teacher_feedback TEXT,
    graded_by INT, -- teacher_id for manual grading
    graded_at TIMESTAMP NULL,

    -- Timing
    time_spent_seconds INT DEFAULT 0,
    answered_at TIMESTAMP NULL,

    -- Flags
    is_flagged TINYINT(1) DEFAULT 0, -- Student marked for review
    is_skipped TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES cbt_question_options(id) ON DELETE SET NULL,

    INDEX idx_attempt (attempt_id),
    INDEX idx_grading (is_correct, graded_at)
);
```

### 5. **CRITICAL: Report Card Integration Table**

```sql
-- This is the bridge between CBT and Report Cards
CREATE TABLE student_assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    class VARCHAR(50) NOT NULL,
    session VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,

    -- Assessment scores
    ca_test_1_score DECIMAL(5,2) DEFAULT 0,
    ca_test_1_max DECIMAL(5,2) DEFAULT 10,
    ca_test_1_source ENUM('manual', 'cbt') DEFAULT 'manual',
    ca_test_1_cbt_attempt_id INT, -- Link to CBT attempt

    ca_test_2_score DECIMAL(5,2) DEFAULT 0,
    ca_test_2_max DECIMAL(5,2) DEFAULT 10,
    ca_test_2_source ENUM('manual', 'cbt') DEFAULT 'manual',
    ca_test_2_cbt_attempt_id INT,

    ca_test_3_score DECIMAL(5,2) DEFAULT 0,
    ca_test_3_max DECIMAL(5,2) DEFAULT 10,
    ca_test_3_source ENUM('manual', 'cbt') DEFAULT 'manual',
    ca_test_3_cbt_attempt_id INT,

    participation_score DECIMAL(5,2) DEFAULT 0,
    participation_max DECIMAL(5,2) DEFAULT 10,
    participation_source ENUM('manual', 'cbt') DEFAULT 'manual',

    exam_score DECIMAL(5,2) DEFAULT 0,
    exam_max DECIMAL(5,2) DEFAULT 60,
    exam_source ENUM('manual', 'cbt') DEFAULT 'manual',
    exam_cbt_attempt_id INT,

    -- Calculated totals
    total_ca DECIMAL(5,2) GENERATED ALWAYS AS (
        ca_test_1_score + ca_test_2_score + ca_test_3_score + participation_score
    ) STORED,

    total_score DECIMAL(5,2) GENERATED ALWAYS AS (
        ca_test_1_score + ca_test_2_score + ca_test_3_score + participation_score + exam_score
    ) STORED,

    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        (total_score / 100) * 100
    ) STORED,

    -- Grade calculation (A, B, C, D, F)
    grade VARCHAR(2),

    -- Position in class
    position INT,
    class_size INT,

    -- Status
    is_complete TINYINT(1) DEFAULT 0, -- All assessments filled
    locked TINYINT(1) DEFAULT 0, -- Cannot edit after report generated

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (ca_test_1_cbt_attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE SET NULL,
    FOREIGN KEY (ca_test_2_cbt_attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE SET NULL,
    FOREIGN KEY (ca_test_3_cbt_attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE SET NULL,
    FOREIGN KEY (exam_cbt_attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE SET NULL,

    UNIQUE KEY unique_student_subject_term (student_id, subject_id, session, term),
    INDEX idx_student_term (student_id, session, term),
    INDEX idx_class_term (class, session, term),
    INDEX idx_completion (is_complete, locked)
);
```

### 6. CBT Analytics Tables

```sql
-- Student performance by topic
CREATE TABLE cbt_student_topic_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    topic VARCHAR(200) NOT NULL,

    -- Aggregated performance
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    total_marks_obtained DECIMAL(7,2) DEFAULT 0,
    total_marks_possible DECIMAL(7,2) DEFAULT 0,

    -- Calculated
    success_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN questions_attempted > 0
        THEN (questions_correct / questions_attempted) * 100
        ELSE 0 END
    ) STORED,

    avg_score_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_marks_possible > 0
        THEN (total_marks_obtained / total_marks_possible) * 100
        ELSE 0 END
    ) STORED,

    -- Classification
    mastery_level ENUM('weak', 'developing', 'proficient', 'excellent') DEFAULT 'developing',

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,

    UNIQUE KEY unique_student_topic (student_id, subject_id, topic),
    INDEX idx_mastery (mastery_level)
);

-- Question performance analytics
CREATE TABLE cbt_question_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,

    -- Usage stats
    times_used INT DEFAULT 0,
    times_attempted INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    times_incorrect INT DEFAULT 0,
    times_skipped INT DEFAULT 0,

    -- Calculated difficulty
    actual_difficulty DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN times_attempted > 0
        THEN ((times_incorrect / times_attempted) * 100)
        ELSE 0 END
    ) STORED, -- Higher = harder

    -- Average time
    total_time_spent_seconds BIGINT DEFAULT 0,
    avg_time_seconds DECIMAL(7,2) GENERATED ALWAYS AS (
        CASE WHEN times_attempted > 0
        THEN (total_time_spent_seconds / times_attempted)
        ELSE 0 END
    ) STORED,

    -- Quality metric
    discrimination_index DECIMAL(5,2), -- Separate calculation

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,

    INDEX idx_difficulty (actual_difficulty),
    INDEX idx_quality (discrimination_index)
);
```

---

## Complete User Flow

### 1. Teacher Creates CA Test 1

**Steps:**
1. Navigate to CBT → Create Exam
2. Fill in details:
   - Subject: Mathematics
   - Class: JSS 2
   - Assessment Type: **CA Test 1** (dropdown)
   - Session: 2023/2024
   - Term: First Term
   - Total Marks: 10 (auto-filled from config)
3. Select questions from question bank OR create new
4. Set duration: 20 minutes
5. Set date/time
6. Assign to all JSS 2 students
7. Publish

**Backend automatically:**
- Creates `cbt_exams` record with `assessment_type='ca_test_1'`
- Creates `cbt_exam_assignments` for each student
- Sets `auto_update_report_card=1`

---

### 2. Student Takes CA Test 1

**Steps:**
1. Student logs in
2. Sees "Mathematics CA Test 1" on dashboard
3. Clicks "Start Test"
4. Reads instructions
5. Begins test (timer starts)
6. Answers 10 questions
7. Reviews answers
8. Submits

**Backend automatically:**
1. Creates `cbt_student_attempts` record
2. Saves responses in `cbt_student_responses`
3. **Auto-grades MCQ/True-False instantly**
4. Calculates total score
5. **Triggers report card update function**

---

### 3. **AUTOMATIC Report Card Update (The Magic!)**

**When student submits exam:**

```php
// This happens automatically after grading
function updateReportCardFromCBT($attempt_id) {
    // 1. Get attempt details
    $attempt = getAttemptDetails($attempt_id);

    // 2. Get exam details
    $exam = getExamDetails($attempt['exam_id']);

    // 3. Find or create student_assessments record
    $assessment = findOrCreateAssessment(
        $attempt['student_id'],
        $exam['subject_id'],
        $exam['class'],
        $exam['session'],
        $exam['term']
    );

    // 4. Update correct field based on assessment_type
    switch($exam['assessment_type']) {
        case 'ca_test_1':
            updateField($assessment['id'], 'ca_test_1_score', $attempt['total_score']);
            updateField($assessment['id'], 'ca_test_1_source', 'cbt');
            updateField($assessment['id'], 'ca_test_1_cbt_attempt_id', $attempt_id);
            break;

        case 'ca_test_2':
            updateField($assessment['id'], 'ca_test_2_score', $attempt['total_score']);
            updateField($assessment['id'], 'ca_test_2_source', 'cbt');
            updateField($assessment['id'], 'ca_test_2_cbt_attempt_id', $attempt_id);
            break;

        case 'ca_test_3':
            updateField($assessment['id'], 'ca_test_3_score', $attempt['total_score']);
            updateField($assessment['id'], 'ca_test_3_source', 'cbt');
            updateField($assessment['id'], 'ca_test_3_cbt_attempt_id', $attempt_id);
            break;

        case 'exam':
            updateField($assessment['id'], 'exam_score', $attempt['total_score']);
            updateField($assessment['id'], 'exam_source', 'cbt');
            updateField($assessment['id'], 'exam_cbt_attempt_id', $attempt_id);
            break;
    }

    // 5. Mark as pushed
    updateAttempt($attempt_id, 'pushed_to_report_card', 1);

    // 6. Calculate grade and position
    recalculateGradeAndPosition($assessment['id']);

    // 7. Log the update
    logReportCardUpdate($attempt['student_id'], $exam['subject_id'], 'CBT Auto-Update');

    return true;
}
```

**Result:**
- Student's score is now in `student_assessments` table
- Report card shows the score
- Teacher sees it marked as "CBT" source
- Complete audit trail maintained

---

### 4. Teacher Reviews Report Card

**Teacher sees:**
```
Student: John Doe
Subject: Mathematics
Term: First Term 2023/2024

CA Test 1: 8/10 (CBT ✓) - Taken on 2024-02-01
CA Test 2: 9/10 (CBT ✓) - Taken on 2024-02-15
CA Test 3: - (Not yet taken)
Participation: 7/10 (Manual entry)
Exam: - (Not yet taken)

Total CA: 24/40
Total Score: -/100
```

**Teacher can:**
- View CBT attempt details (click on score)
- See individual question responses
- Override score if necessary (with reason)
- Enter participation score manually

---

### 5. End of Term: Generate Report Cards

**When all assessments complete:**

```
Student: John Doe
Subject: Mathematics

CA Test 1: 8/10 (CBT)
CA Test 2: 9/10 (CBT)
CA Test 3: 8/10 (CBT)
Participation: 7/10 (Manual)
Exam: 52/60 (CBT)

Total CA: 32/40
Total Score: 84/100
Percentage: 84%
Grade: B+
Position: 3rd out of 45 students
```

**All scores auto-calculated!**
**No manual entry required!**
**Zero errors!**

---

## API Implementation

### Backend Routes

```
/backend/routes/cbt/

├── questions.php
│   POST /cbt/questions/create
│   GET /cbt/questions/list
│   PUT /cbt/questions/{id}
│   DELETE /cbt/questions/{id}
│   POST /cbt/questions/bulk-import
│   GET /cbt/questions/by-topic
│
├── exams.php
│   POST /cbt/exams/create
│   GET /cbt/exams/list
│   GET /cbt/exams/{id}
│   PUT /cbt/exams/{id}
│   DELETE /cbt/exams/{id}
│   POST /cbt/exams/{id}/publish
│   POST /cbt/exams/{id}/assign-students
│   POST /cbt/exams/{id}/questions/add
│   DELETE /cbt/exams/{id}/questions/{question_id}
│
├── student-exams.php
│   GET /cbt/student/exams/assigned
│   GET /cbt/student/exams/completed
│   GET /cbt/student/exam/{exam_id}
│   POST /cbt/student/exam/{exam_id}/start
│   POST /cbt/student/exam/response/save
│   POST /cbt/student/exam/submit
│   GET /cbt/student/exam/{exam_id}/result
│
├── grading.php
│   POST /cbt/grade/auto/{attempt_id}
│   GET /cbt/grade/pending-manual
│   POST /cbt/grade/manual/{response_id}
│   POST /cbt/grade/push-to-report/{attempt_id}
│
├── report-integration.php
│   POST /cbt/report/update-from-attempt
│   GET /cbt/report/student-assessments/{student_id}
│   PUT /cbt/report/manual-override
│   GET /cbt/report/status/{class}/{session}/{term}
│
└── analytics.php
    GET /cbt/analytics/student/{student_id}
    GET /cbt/analytics/exam/{exam_id}
    GET /cbt/analytics/question/{question_id}
    GET /cbt/analytics/class-performance
    GET /cbt/analytics/topic-performance
```

### Key Backend Functions

```php
// Auto-grading function
function autoGradeAttempt($attempt_id) {
    $db = getConnection();

    // Get all responses for this attempt
    $responses = $db->query("
        SELECT sr.*, q.question_type, qo.is_correct, q.marks
        FROM cbt_student_responses sr
        JOIN cbt_questions q ON sr.question_id = q.id
        LEFT JOIN cbt_question_options qo ON sr.selected_option_id = qo.id
        WHERE sr.attempt_id = ?
    ", [$attempt_id]);

    $total_score = 0;
    $needs_manual_grading = false;

    foreach($responses as $response) {
        if($response['question_type'] == 'multiple_choice' ||
           $response['question_type'] == 'true_false') {

            // Auto-grade
            if($response['is_correct'] == 1) {
                $marks = $response['marks'];
                $is_correct = 1;
            } else {
                $marks = 0;
                $is_correct = 0;
            }

            // Update response
            $db->query("
                UPDATE cbt_student_responses
                SET is_correct = ?, marks_awarded = ?
                WHERE id = ?
            ", [$is_correct, $marks, $response['id']]);

            $total_score += $marks;

        } else if($response['question_type'] == 'essay' ||
                  $response['question_type'] == 'fill_blank') {

            // Mark for manual grading
            $needs_manual_grading = true;
        }
    }

    // Update attempt
    $db->query("
        UPDATE cbt_student_attempts
        SET auto_graded_score = ?,
            needs_manual_grading = ?,
            status = ?
        WHERE id = ?
    ", [
        $total_score,
        $needs_manual_grading ? 1 : 0,
        $needs_manual_grading ? 'submitted' : 'graded',
        $attempt_id
    ]);

    // If fully auto-graded, push to report card immediately
    if(!$needs_manual_grading) {
        pushScoreToReportCard($attempt_id);
    }

    return [
        'score' => $total_score,
        'needs_manual_grading' => $needs_manual_grading
    ];
}

// Push score to report card
function pushScoreToReportCard($attempt_id) {
    $db = getConnection();

    // Get attempt and exam details
    $data = $db->query("
        SELECT
            a.student_id,
            a.total_score,
            e.subject_id,
            e.class,
            e.session,
            e.term,
            e.assessment_type,
            e.school_id
        FROM cbt_student_attempts a
        JOIN cbt_exams e ON a.exam_id = e.id
        WHERE a.id = ?
    ", [$attempt_id])->fetch();

    if(!$data) {
        return false;
    }

    // Find or create student_assessments record
    $assessment = $db->query("
        SELECT * FROM student_assessments
        WHERE student_id = ?
        AND subject_id = ?
        AND class = ?
        AND session = ?
        AND term = ?
    ", [
        $data['student_id'],
        $data['subject_id'],
        $data['class'],
        $data['session'],
        $data['term']
    ])->fetch();

    if(!$assessment) {
        // Create new record
        $db->query("
            INSERT INTO student_assessments
            (school_id, student_id, subject_id, class, session, term)
            VALUES (?, ?, ?, ?, ?, ?)
        ", [
            $data['school_id'],
            $data['student_id'],
            $data['subject_id'],
            $data['class'],
            $data['session'],
            $data['term']
        ]);
        $assessment_id = $db->lastInsertId();
    } else {
        $assessment_id = $assessment['id'];
    }

    // Update appropriate field based on assessment type
    $field_map = [
        'ca_test_1' => ['ca_test_1_score', 'ca_test_1_source', 'ca_test_1_cbt_attempt_id'],
        'ca_test_2' => ['ca_test_2_score', 'ca_test_2_source', 'ca_test_2_cbt_attempt_id'],
        'ca_test_3' => ['ca_test_3_score', 'ca_test_3_source', 'ca_test_3_cbt_attempt_id'],
        'exam' => ['exam_score', 'exam_source', 'exam_cbt_attempt_id']
    ];

    $fields = $field_map[$data['assessment_type']];

    $db->query("
        UPDATE student_assessments
        SET {$fields[0]} = ?,
            {$fields[1]} = 'cbt',
            {$fields[2]} = ?
        WHERE id = ?
    ", [$data['total_score'], $attempt_id, $assessment_id]);

    // Mark attempt as pushed
    $db->query("
        UPDATE cbt_student_attempts
        SET pushed_to_report_card = 1,
            pushed_at = NOW()
        WHERE id = ?
    ", [$attempt_id]);

    // Calculate grade
    calculateGradeAndPosition($assessment_id);

    return true;
}

// Calculate grade and class position
function calculateGradeAndPosition($assessment_id) {
    $db = getConnection();

    // Get assessment
    $assessment = $db->query("
        SELECT * FROM student_assessments WHERE id = ?
    ", [$assessment_id])->fetch();

    // Calculate grade based on percentage
    $percentage = $assessment['percentage'];
    $grade = 'F';

    if($percentage >= 80) $grade = 'A';
    else if($percentage >= 70) $grade = 'B';
    else if($percentage >= 60) $grade = 'C';
    else if($percentage >= 50) $grade = 'D';
    else if($percentage >= 40) $grade = 'E';

    // Calculate position
    $position_data = $db->query("
        SELECT COUNT(*) + 1 as position
        FROM student_assessments
        WHERE class = ?
        AND subject_id = ?
        AND session = ?
        AND term = ?
        AND total_score > ?
    ", [
        $assessment['class'],
        $assessment['subject_id'],
        $assessment['session'],
        $assessment['term'],
        $assessment['total_score']
    ])->fetch();

    $class_size = $db->query("
        SELECT COUNT(*) as total
        FROM student_assessments
        WHERE class = ?
        AND subject_id = ?
        AND session = ?
        AND term = ?
    ", [
        $assessment['class'],
        $assessment['subject_id'],
        $assessment['session'],
        $assessment['term']
    ])->fetch()['total'];

    // Update
    $db->query("
        UPDATE student_assessments
        SET grade = ?,
            position = ?,
            class_size = ?
        WHERE id = ?
    ", [$grade, $position_data['position'], $class_size, $assessment_id]);
}
```

---

## Frontend Implementation

### Key React Components

```
/src/pages/CBT/

├── Teacher/
│   ├── QuestionBank/
│   │   ├── QuestionList.jsx         // Browse all questions
│   │   ├── CreateQuestion.jsx       // Create new question
│   │   ├── EditQuestion.jsx         // Edit existing
│   │   ├── QuestionPreview.jsx      // Preview question
│   │   ├── BulkImport.jsx           // Import from Excel
│   │   └── TopicOrganizer.jsx       // Organize by topics
│   │
│   ├── ExamManagement/
│   │   ├── ExamDashboard.jsx        // All exams overview
│   │   ├── CreateExam.jsx           // Multi-step exam creation
│   │   ├── ExamWizard/
│   │   │   ├── Step1Basic.jsx       // Basic info + assessment type
│   │   │   ├── Step2Questions.jsx   // Select questions
│   │   │   ├── Step3Settings.jsx    // Duration, shuffle, etc
│   │   │   ├── Step4Students.jsx    // Assign students
│   │   │   └── Step5Review.jsx      // Preview & publish
│   │   ├── ExamDetails.jsx          // View exam details
│   │   ├── EditExam.jsx             // Edit draft exam
│   │   └── ExamResults.jsx          // View all student results
│   │
│   ├── Grading/
│   │   ├── PendingGrading.jsx       // Essays needing grading
│   │   ├── GradeEssay.jsx           // Grade individual essay
│   │   └── BulkGrading.jsx          // Grade multiple at once
│   │
│   └── Reports/
│       ├── CBTReportCard.jsx        // Report card with CBT scores
│       ├── StudentProgress.jsx      // Individual student analytics
│       ├── ClassPerformance.jsx     // Class-level analytics
│       └── TopicAnalysis.jsx        // Topic mastery report
│
├── Student/
│   ├── ExamDashboard.jsx            // View assigned exams
│   ├── ExamCard.jsx                 // Single exam card component
│   ├── TakeExam/
│   │   ├── ExamInterface.jsx        // Main exam interface
│   │   ├── ExamInstructions.jsx     // Read before start
│   │   ├── QuestionDisplay.jsx      // Display question
│   │   ├── QuestionNavigator.jsx    // Navigate between questions
│   │   ├── ExamTimer.jsx            // Countdown timer
│   │   ├── ProgressBar.jsx          // Visual progress
│   │   └── SubmitDialog.jsx         // Confirm submission
│   │
│   ├── Results/
│   │   ├── ExamResult.jsx           // Individual result
│   │   ├── DetailedBreakdown.jsx    // Question-by-question review
│   │   └── PerformanceChart.jsx     // Visual performance
│   │
│   └── Analytics/
│       ├── MyPerformance.jsx        // Overall analytics
│       ├── SubjectAnalysis.jsx      // Per-subject breakdown
│       └── TopicStrengths.jsx       // Strong/weak topics
│
└── Shared/
    ├── QuestionCard.jsx             // Reusable question display
    ├── OptionButton.jsx             // MCQ option button
    ├── Timer.jsx                    // Reusable timer
    └── ScoreDisplay.jsx             // Score visualization
```

---

## Implementation Phases

### **Phase 1: MVP (Months 1-2) - CA Tests Only**

**Goal:** Get CA Test 1 & 2 working with auto report card integration

**Database:**
- ✅ Create all tables
- ✅ Seed assessment_config for all subjects

**Backend:**
- ✅ Question CRUD APIs
- ✅ Exam creation API
- ✅ Student exam taking API
- ✅ Auto-grading function
- ✅ Report card integration function

**Frontend - Teacher:**
- ✅ Create question (MCQ only)
- ✅ Question list/search
- ✅ Create CA exam (simple wizard)
- ✅ Assign to students
- ✅ View report card with CBT scores

**Frontend - Student:**
- ✅ View assigned exams
- ✅ Take exam (clean interface)
- ✅ Timer
- ✅ Submit exam
- ✅ View results (if allowed)

**Success Criteria:**
- Teacher creates CA Test 1 in 10 minutes
- 30 students take exam simultaneously
- Scores auto-populate report card
- Zero manual score entry needed

---

### **Phase 2: Complete Assessment System (Month 3)**

**Add:**
- ✅ CA Test 3
- ✅ End of Term Exam (60 marks)
- ✅ True/False questions
- ✅ Question bank organization (topics)
- ✅ Bulk question import
- ✅ Advanced exam settings

**Success Criteria:**
- Complete assessment cycle for one subject
- Full term report card generated
- 90% scores from CBT, 10% manual

---

### **Phase 3: Advanced Features (Month 4)**

**Add:**
- ✅ Fill-in-blank questions
- ✅ Essay questions (manual grading)
- ✅ Question images
- ✅ Detailed analytics
- ✅ Topic performance tracking
- ✅ Export reports

**Success Criteria:**
- All question types supported
- Rich analytics available
- Teacher insights actionable

---

### **Phase 4: Polish & Scale (Month 5)**

**Add:**
- ✅ Practice mode (non-graded)
- ✅ Question shuffling
- ✅ Option shuffling
- ✅ Mobile optimization
- ✅ Performance optimization
- ✅ Security hardening

**Success Criteria:**
- 500+ students can take exam simultaneously
- Mobile-friendly interface
- Anti-cheating measures active

---

### **Phase 5: Advanced Analytics (Month 6)**

**Add:**
- ✅ Predictive analytics
- ✅ Question quality metrics
- ✅ Student progress tracking
- ✅ Comparative analysis
- ✅ Data export tools

**Success Criteria:**
- Teachers make data-driven decisions
- Students see personalized insights
- School admin sees school-wide trends

---

## Key Features Breakdown

### 1. Question Bank Management

**Teacher Interface:**
```
CREATE QUESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject: [Mathematics ▼]
Class: [JSS 2 ▼]
Topic: [Algebra ▼] Subtopic: [Linear Equations]
Difficulty: ○ Easy ● Medium ○ Hard

Question Text:
┌─────────────────────────────────────────┐
│ Solve for x: 2x + 5 = 15                │
│                                          │
│ [B] Add image                            │
└─────────────────────────────────────────┘

Question Type: ● Multiple Choice ○ True/False ○ Fill Blank ○ Essay

Options:
○ A) x = 5  [✓ Correct Answer]
○ B) x = 10
○ C) x = 7
○ D) x = 3

Explanation (optional):
┌─────────────────────────────────────────┐
│ Subtract 5 from both sides: 2x = 10     │
│ Divide by 2: x = 5                      │
└─────────────────────────────────────────┘

Marks: [1]

[Cancel] [Save] [Save & Add Another]
```

**Question List:**
```
QUESTION BANK - Mathematics JSS 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Search: [               ] 🔍  Filter: [All Topics ▼] [All Difficulty ▼]

[+ Create Question] [📥 Import Excel] [Export Selected]

┌─────────────────────────────────────────────────────────────────┐
│ ✓ Algebra - Linear Equations                          Medium    │
│   Solve for x: 2x + 5 = 15                                      │
│   Used: 5 times | Avg Score: 75% | Last used: 2 days ago       │
│   [👁 Preview] [✏ Edit] [🗑 Delete] [📋 Duplicate]              │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Geometry - Angles                                   Easy      │
│   What is the sum of angles in a triangle?                      │
│   Used: 12 times | Avg Score: 92% | Last used: 1 week ago      │
│   [👁 Preview] [✏ Edit] [🗑 Delete] [📋 Duplicate]              │
└─────────────────────────────────────────────────────────────────┘

Showing 15 of 127 questions
```

---

### 2. Exam Creation Wizard

**Step 1: Basic Information**
```
CREATE CBT EXAM - Step 1 of 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Exam Title: [Mathematics CA Test 1              ]

Subject: [Mathematics ▼]
Class: [JSS 2 ▼]
Session: [2023/2024 ▼]
Term: [First Term ▼]

Assessment Type: ● CA Test 1 (10 marks)
                 ○ CA Test 2 (10 marks)
                 ○ CA Test 3 (10 marks)
                 ○ End of Term Exam (60 marks)

ℹ This exam score will automatically update the report card

Duration: [20] minutes
Pass Mark: [50] %

[Cancel]                            [Next: Select Questions →]
```

**Step 2: Select Questions**
```
CREATE CBT EXAM - Step 2 of 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVAILABLE QUESTIONS                 SELECTED QUESTIONS
┌─────────────────────────┐        ┌──────────────────────┐
│ [✓] Solve: 2x+5=15      │   ──>  │ 1. What is 5×6?     │
│     Topic: Algebra      │        │ 2. Solve: 2x+5=15   │
│     Marks: 1            │        │ 3. Find area...     │
│ [ ] What is 5×6?        │        │                     │
│     Topic: Arithmetic   │        │ Total: 3 questions  │
│     Marks: 1            │        │ Total Marks: 3      │
│ [✓] Find area of...     │        │                     │
│     Topic: Geometry     │        │ Need: 10 marks      │
│     Marks: 2            │        │ (7 marks short)     │
└─────────────────────────┘        └──────────────────────┘

Filter: [All Topics ▼] [All Difficulty ▼]
Search: [               ] 🔍

[+ Create New Question]  [Random Select: 10 questions]

[← Back]  [Cancel]                 [Next: Settings →]
```

**Step 3: Settings**
```
CREATE CBT EXAM - Step 3 of 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXAM SCHEDULE
Start Date: [2024-02-15] Time: [08:00]
End Date:   [2024-02-15] Time: [17:00]

EXAM BEHAVIOR
[✓] Shuffle question order for each student
[✓] Shuffle option order (A, B, C, D)
[ ] Allow multiple attempts (Leave unchecked for official exams)
[✓] Allow review before submit
[ ] Show results immediately after submit
[ ] Show correct answers after submit

INSTRUCTIONS FOR STUDENTS
┌─────────────────────────────────────────┐
│ 1. You have 20 minutes                  │
│ 2. Answer all questions                 │
│ 3. Click Submit when done               │
└─────────────────────────────────────────┘

[← Back]  [Cancel]                 [Next: Assign Students →]
```

**Step 4: Assign Students**
```
CREATE CBT EXAM - Step 4 of 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STUDENT SELECTION

[Assign All JSS 2 Students] [Assign by Performance]

STUDENTS IN JSS 2
┌─────────────────────────────────────────┐
│ [✓] Select All (45 students)            │
├─────────────────────────────────────────┤
│ [✓] Adebayo John     ADM001             │
│ [✓] Chukwu Mary      ADM002             │
│ [✓] Okonkwo Peter    ADM003             │
│ [✓] Ibrahim Fatima   ADM004             │
│ ...                                     │
└─────────────────────────────────────────┘

Selected: 45 students

[← Back]  [Cancel]                 [Next: Review & Publish →]
```

**Step 5: Review & Publish**
```
CREATE CBT EXAM - Step 5 of 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXAM SUMMARY

Title: Mathematics CA Test 1
Subject: Mathematics | Class: JSS 2
Assessment Type: CA Test 1 (10 marks)
Session: 2023/2024 | Term: First Term

Questions: 10 questions, 10 marks total
Duration: 20 minutes
Schedule: Feb 15, 2024 08:00 - 17:00
Students: 45 assigned

Settings:
✓ Questions shuffled
✓ Options shuffled
✓ Review allowed
✗ Show results immediately

⚠️ IMPORTANT:
Scores will automatically update report cards when students submit.
You can still manually override if needed.

[← Back]  [Save as Draft]  [Publish Exam]
```

---

### 3. Student Exam Interface

**Exam Dashboard:**
```
MY EXAMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UPCOMING EXAMS
┌─────────────────────────────────────────┐
│ 📝 Mathematics CA Test 1                │
│ Due: Tomorrow, 5:00 PM                  │
│ Duration: 20 minutes | 10 marks         │
│ Status: Not Started                     │
│ [Start Exam]                            │
├─────────────────────────────────────────┤
│ 📝 English CA Test 1                    │
│ Due: In 3 days                          │
│ Duration: 30 minutes | 10 marks         │
│ Status: Not Started                     │
│ [View Details]                          │
└─────────────────────────────────────────┘

COMPLETED EXAMS
┌─────────────────────────────────────────┐
│ ✅ Biology CA Test 1                    │
│ Completed: 2 days ago                   │
│ Score: 8/10 (80%)                       │
│ [View Result]                           │
└─────────────────────────────────────────┘
```

**Exam Interface:**
```
MATHEMATICS CA TEST 1                           ⏱ 18:45
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Progress: [███████░░░] 7/10 answered

Question 3 of 10                               [🚩 Flag]

Solve for x: 2x + 5 = 15

○ A) x = 3
○ B) x = 5
● C) x = 10
○ D) x = 7

[← Previous]  [Save & Next →]

NAVIGATOR
[1✓][2✓][3●][4][5][6][7][8][9][10]

✓ Answered  ● Current  ☐ Not Answered  🚩 Flagged

[Submit Exam]
```

**Submit Confirmation:**
```
┌─────────────────────────────────────────┐
│ CONFIRM SUBMISSION                      │
├─────────────────────────────────────────┤
│ Are you sure you want to submit?       │
│                                         │
│ Answered: 9/10 questions                │
│ Unanswered: 1 question                  │
│ Flagged: 2 questions                    │
│                                         │
│ ⚠️ You cannot change answers after     │
│ submitting!                             │
│                                         │
│ [Go Back] [Submit Exam]                 │
└─────────────────────────────────────────┘
```

**Instant Result (if allowed):**
```
EXAM COMPLETED! ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mathematics CA Test 1

Your Score: 8/10 (80%)
Pass Mark: 50%
Result: PASSED ✓

Time Taken: 16 minutes 32 seconds

BREAKDOWN
Correct: 8
Incorrect: 2
Unanswered: 0

This score has been automatically added to your report card.

[View Detailed Results] [Back to Dashboard]
```

---

### 4. Report Card Integration View

**Teacher View:**
```
STUDENT ASSESSMENT - John Doe
Mathematics | JSS 2 | First Term 2023/2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTINUOUS ASSESSMENT (40 marks)

CA Test 1: [8/10] (CBT ✓)
           Taken: Feb 15, 2024 10:23 AM
           [View CBT Attempt] [Override Score]

CA Test 2: [9/10] (CBT ✓)
           Taken: Feb 28, 2024 2:15 PM
           [View CBT Attempt] [Override Score]

CA Test 3: [7/10] (CBT ✓)
           Taken: Mar 12, 2024 11:30 AM
           [View CBT Attempt] [Override Score]

Participation: [8/10] (Manual ✏️)
               Last updated: Mar 15, 2024
               [Edit Score]

Total CA: 32/40 (80%)

END OF TERM EXAM (60 marks)

Exam: [52/60] (CBT ✓)
      Taken: Mar 20, 2024 9:00 AM
      [View CBT Attempt] [Override Score]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL SCORE: 84/100 (84%)
GRADE: B+
POSITION: 3rd out of 45 students
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All assessments complete
🔒 Ready for report card generation

[Generate Report Card] [View Analytics]
```

---

## Security & Anti-Cheating Measures

### 1. During Exam

```javascript
// Browser security
const ExamInterface = () => {
    const [tabSwitches, setTabSwitches] = useState(0);

    useEffect(() => {
        // Detect tab switching
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => prev + 1);
                logSecurityEvent('tab_switch');

                // Warning after 3 switches
                if (tabSwitches >= 3) {
                    alert('Warning: Excessive tab switching detected. This exam may be flagged.');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Prevent right-click
        const preventRightClick = (e) => e.preventDefault();
        document.addEventListener('contextmenu', preventRightClick);

        // Prevent copy-paste
        const preventCopy = (e) => e.preventDefault();
        document.addEventListener('copy', preventCopy);
        document.addEventListener('paste', preventCopy);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', preventRightClick);
            document.removeEventListener('copy', preventCopy);
            document.removeEventListener('paste', preventCopy);
        };
    }, [tabSwitches]);

    // Auto-submit on time expiry
    useEffect(() => {
        if (timeRemaining <= 0) {
            autoSubmitExam();
        }
    }, [timeRemaining]);

    // Auto-save every 30 seconds
    useInterval(() => {
        saveProgress();
    }, 30000);
};
```

### 2. Question Randomization

```php
// Backend: Generate unique question order per student
function getStudentExamQuestions($exam_id, $student_id) {
    // Use student_id as seed for consistent randomization
    $seed = $exam_id . $student_id;
    mt_srand(crc32($seed));

    $questions = getExamQuestions($exam_id);

    if($exam['shuffle_questions']) {
        shuffle($questions);
    }

    // Shuffle options for each question
    if($exam['shuffle_options']) {
        foreach($questions as &$q) {
            if($q['question_type'] == 'multiple_choice') {
                shuffle($q['options']);
            }
        }
    }

    return $questions;
}
```

### 3. Integrity Checks

```php
// Verify submission hasn't been tampered with
function validateSubmission($attempt_id, $responses) {
    // Check time validity
    $attempt = getAttempt($attempt_id);
    $time_taken = time() - strtotime($attempt['started_at']);

    if($time_taken < 60) {
        // Suspiciously fast
        flagForReview($attempt_id, 'too_fast');
    }

    // Check response count matches question count
    $expected_count = getExamQuestionCount($attempt['exam_id']);
    if(count($responses) != $expected_count) {
        return ['error' => 'Invalid response count'];
    }

    // Verify all question IDs belong to this exam
    foreach($responses as $response) {
        if(!questionBelongsToExam($response['question_id'], $attempt['exam_id'])) {
            logSecurityEvent('invalid_question_id', $attempt_id);
            return ['error' => 'Invalid question'];
        }
    }

    return ['valid' => true];
}
```

---

## Analytics & Insights

### Student Analytics

```sql
-- Get student's strengths and weaknesses
SELECT
    topic,
    COUNT(*) as questions_attempted,
    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
    ROUND(AVG(CASE WHEN is_correct = 1 THEN 100 ELSE 0 END), 2) as success_rate,
    CASE
        WHEN AVG(CASE WHEN is_correct = 1 THEN 100 ELSE 0 END) >= 80 THEN 'Excellent'
        WHEN AVG(CASE WHEN is_correct = 1 THEN 100 ELSE 0 END) >= 60 THEN 'Proficient'
        WHEN AVG(CASE WHEN is_correct = 1 THEN 100 ELSE 0 END) >= 40 THEN 'Developing'
        ELSE 'Weak'
    END as mastery_level
FROM cbt_student_responses sr
JOIN cbt_student_attempts sa ON sr.attempt_id = sa.id
JOIN cbt_questions q ON sr.question_id = q.id
WHERE sa.student_id = ?
AND q.subject_id = ?
GROUP BY topic
ORDER BY success_rate ASC;
```

**Display:**
```
STUDENT PERFORMANCE ANALYTICS
John Doe - Mathematics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOPIC MASTERY

Strong Topics (80%+):
✅ Arithmetic       92% (23/25 correct)
✅ Geometry         85% (17/20 correct)

Developing (60-79%):
⚠️ Algebra          68% (34/50 correct)

Weak Topics (<60%):
❌ Statistics       45% (9/20 correct)
❌ Probability      38% (8/21 correct)

RECOMMENDATIONS:
📚 Focus revision on Statistics and Probability
📊 Practice more word problems in Algebra
🎯 Maintain strong performance in Arithmetic

[View Detailed Analysis] [Practice Weak Topics]
```

---

## Migration Plan

### From Manual to CBT

**Week 1: Setup**
- Install CBT system
- Create assessment_config for all subjects
- Train teachers on question creation

**Week 2: Question Bank**
- Teachers create 50 questions per subject
- Review and approve questions
- Organize by topics

**Week 3: Pilot (One Subject)**
- Select one subject (e.g., Mathematics)
- Create CA Test 1 as CBT
- Pilot with one class
- Gather feedback

**Week 4: Expand**
- Roll out to 3 more subjects
- All CA Test 1 exams via CBT
- Monitor report card integration

**Week 5-8: Full Adoption**
- All CA tests via CBT
- End of term exams via CBT
- 90%+ scores automated

---

## Success Metrics

### Technical Metrics
- Page load time < 2 seconds
- Exam submission success rate > 99.5%
- Zero data loss incidents
- Auto-save every 30 seconds
- Support 500+ concurrent exam takers

### User Adoption
- 80%+ of teachers using CBT by Month 3
- 100% of students familiar with interface
- 50%+ of assessments via CBT by Month 2
- 90%+ via CBT by Month 4

### Educational Impact
- Teacher time saved: 80%+ (grading time)
- Score entry errors: Reduced to 0%
- Results delivery: Same day vs 2 weeks
- Student performance tracking: Real-time
- Analytics utilization: 70%+ of teachers

### Business Impact
- Premium feature for higher-tier plans
- Increase in subscription upgrades
- Reduction in support tickets
- Improved customer satisfaction
- Competitive advantage

---

## Questions for You

1. **Timeline:** When do you want to launch Phase 1 MVP?

2. **Participation Score:** Should we also create a digital system for the 10 marks participation/classwork, or keep it manual?

3. **Essay Questions:** Include in Phase 1 or wait for Phase 2?

4. **Mobile Access:** Must students be able to take exams on phones, or desktop only?

5. **Offline Capability:** Important for Phase 1?

6. **Multiple Schools:** Should question banks be shareable across schools (for school chains)?

7. **Existing Data:** Do you have question banks to import?

8. **Pricing:** Should CBT be:
   - Included in all plans
   - Premium feature (higher tier)
   - Add-on module

9. **Priority:** Which phase features are most critical for launch?

10. **Pilot Schools:** How many schools for initial testing?

---

## Next Steps

Once you answer the questions, I'll:

1. ✅ Create complete database migration scripts
2. ✅ Build all backend API endpoints
3. ✅ Create React components (teacher & student interfaces)
4. ✅ Implement auto-grading engine
5. ✅ Build report card integration
6. ✅ Create analytics dashboard
7. ✅ Write comprehensive tests
8. ✅ Deploy to staging environment
9. ✅ Prepare training materials
10. ✅ Plan rollout strategy

**Ready to transform how Nigerian schools conduct assessments! 🚀**

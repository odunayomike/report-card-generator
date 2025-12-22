-- ============================================
-- CBT SYSTEM PHASE 1 - DATABASE MIGRATION
-- FIXED VERSION (Compatible with existing database structure)
-- ============================================
-- No triggers, no views, works with basic permissions
-- Compatible with existing subject structure
-- ============================================

-- ============================================
-- TABLE 1: Assessment Configuration
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    session VARCHAR(20) NOT NULL,
    term VARCHAR(50) NOT NULL,

    -- Score configuration
    ca_test_1_marks INT DEFAULT 10,
    ca_test_2_marks INT DEFAULT 10,
    ca_test_3_marks INT DEFAULT 10,
    participation_marks INT DEFAULT 10,
    exam_marks INT DEFAULT 60,

    -- CBT enablement flags
    use_cbt_for_ca1 TINYINT(1) DEFAULT 1,
    use_cbt_for_ca2 TINYINT(1) DEFAULT 1,
    use_cbt_for_ca3 TINYINT(1) DEFAULT 0,
    use_cbt_for_exam TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_assessment_config (school_id, subject_name, class_name, session, term),
    INDEX idx_school_class (school_id, class_name, session, term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 2: CBT Questions (Question Bank)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false') NOT NULL,
    topic VARCHAR(200),
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    marks INT DEFAULT 1,

    -- Metadata
    created_by INT NOT NULL COMMENT 'Teacher ID who created this question',
    times_used INT DEFAULT 0 COMMENT 'How many exams use this question',
    avg_score DECIMAL(5,2) DEFAULT NULL COMMENT 'Average score on this question',

    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_school_subject (school_id, subject),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 3: Question Options (for MCQ)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    option_order INT DEFAULT 1,

    FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,
    INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 4: CBT Exams
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    session VARCHAR(20) NOT NULL,
    term VARCHAR(50) NOT NULL,
    exam_title VARCHAR(200) NOT NULL,

    -- Assessment mapping
    assessment_type ENUM('ca_test_1', 'ca_test_2', 'ca_test_3', 'exam') NOT NULL,
    total_marks INT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    instructions TEXT,

    -- Exam settings
    shuffle_questions TINYINT(1) DEFAULT 1,
    shuffle_options TINYINT(1) DEFAULT 1,
    show_results_immediately TINYINT(1) DEFAULT 0,
    auto_update_report_card TINYINT(1) DEFAULT 1,

    -- Scheduling
    start_datetime DATETIME NULL,
    end_datetime DATETIME NULL,

    -- Status
    is_published TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,

    -- Metadata
    created_by INT NOT NULL COMMENT 'Teacher ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,

    INDEX idx_school_class (school_id, class_name, session, term),
    INDEX idx_assessment_type (assessment_type),
    INDEX idx_published (is_published, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 5: Exam Questions (Questions in Each Exam)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_exam_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    order_number INT NOT NULL DEFAULT 1,

    FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,
    INDEX idx_exam (exam_id),
    UNIQUE KEY unique_exam_question (exam_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 6: Exam Assignments (Students assigned to exams)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_exam_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    school_id INT NOT NULL,

    -- Tracking
    has_started TINYINT(1) DEFAULT 0,
    has_submitted TINYINT(1) DEFAULT 0,
    started_at TIMESTAMP NULL,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_exam_student (exam_id, student_id),
    UNIQUE KEY unique_assignment (exam_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 7: Student Attempts (Student takes exam)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_student_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    school_id INT NOT NULL,

    -- Results
    total_score DECIMAL(5,2) DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    correct_answers INT DEFAULT 0,
    wrong_answers INT DEFAULT 0,

    -- Timing
    started_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NULL,
    time_taken_minutes DECIMAL(5,2) DEFAULT 0,

    -- Status
    is_submitted TINYINT(1) DEFAULT 0,

    FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_exam (exam_id),
    UNIQUE KEY unique_student_exam (exam_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 8: Student Responses (Individual answers)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_student_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option_id INT NULL,

    -- Grading
    is_correct TINYINT(1) DEFAULT 0,
    marks_awarded DECIMAL(5,2) DEFAULT 0,

    answered_at TIMESTAMP NULL,

    FOREIGN KEY (attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES cbt_question_options(id) ON DELETE SET NULL,
    INDEX idx_attempt (attempt_id),
    UNIQUE KEY unique_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 9: Student Assessments (Report Card Integration)
-- ============================================
-- NOTE: This table integrates with your existing report card system
-- It stores detailed assessment scores that feed into the subjects table
-- ============================================
CREATE TABLE IF NOT EXISTS student_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL COMMENT 'Subject name to match with subjects table',
    class_name VARCHAR(50) NOT NULL,
    session VARCHAR(20) NOT NULL,
    term VARCHAR(50) NOT NULL,
    school_id INT NOT NULL,

    -- CA Test scores (each out of 10 by default)
    ca_test_1_score DECIMAL(5,2) DEFAULT 0,
    ca_test_1_source ENUM('manual', 'cbt') DEFAULT 'manual',
    ca_test_1_cbt_attempt_id INT NULL,

    ca_test_2_score DECIMAL(5,2) DEFAULT 0,
    ca_test_2_source ENUM('manual', 'cbt') DEFAULT 'manual',
    ca_test_2_cbt_attempt_id INT NULL,

    ca_test_3_score DECIMAL(5,2) DEFAULT 0,
    ca_test_3_source ENUM('manual', 'cbt') DEFAULT 'manual',
    ca_test_3_cbt_attempt_id INT NULL,

    -- Participation (10 marks - always manual)
    participation_score DECIMAL(5,2) DEFAULT 0,

    -- Exam score (60 marks by default)
    exam_score DECIMAL(5,2) DEFAULT 0,
    exam_source ENUM('manual', 'cbt') DEFAULT 'manual',
    exam_cbt_attempt_id INT NULL,

    -- Calculated fields (calculated in application code via grading.php)
    total_ca DECIMAL(5,2) DEFAULT 0,
    total_score DECIMAL(5,2) DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    grade VARCHAR(2) DEFAULT NULL,
    position INT DEFAULT NULL,
    is_complete TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (ca_test_1_cbt_attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE SET NULL,
    FOREIGN KEY (ca_test_2_cbt_attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE SET NULL,
    FOREIGN KEY (ca_test_3_cbt_attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE SET NULL,
    FOREIGN KEY (exam_cbt_attempt_id) REFERENCES cbt_student_attempts(id) ON DELETE SET NULL,

    INDEX idx_student (student_id),
    INDEX idx_session_term (session, term),
    INDEX idx_subject (subject),
    UNIQUE KEY unique_student_assessment (student_id, subject, class_name, session, term, school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 10: Activity Log (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    teacher_id INT NULL,
    exam_id INT NULL,
    activity_type VARCHAR(50) NOT NULL,
    details TEXT NULL,
    school_id INT NOT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_student (student_id),
    INDEX idx_exam (exam_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================
-- Note: Main indexes are already created in table definitions
-- These are additional composite indexes for complex queries
-- Wrapped in error handling to avoid duplication errors
-- ============================================

-- Additional index for question searches (if not already exists)
-- MySQL doesn't support IF NOT EXISTS for indexes, so we'll skip duplicates


-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Version: Phase 1 Fixed (Compatible with existing database)
-- All calculations handled in application code (grading.php)
-- Subject column naming matches existing structure
-- ============================================

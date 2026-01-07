-- External Students System Migration
-- For handling prospective students taking entrance examinations
-- Created: 2026-01-07

-- Table for external/prospective students
CREATE TABLE IF NOT EXISTS external_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,

    -- Student Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE'),
    address TEXT,
    applying_for_class VARCHAR(100) NOT NULL,
    previous_school VARCHAR(255),

    -- Parent/Guardian Information
    parent_name VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20) NOT NULL,
    parent_relationship ENUM('father', 'mother', 'guardian') DEFAULT 'father',

    -- Authentication Credentials
    exam_code VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Status Tracking
    status ENUM('pending', 'exam_assigned', 'exam_completed', 'passed', 'failed', 'converted') DEFAULT 'pending',
    converted_to_student_id INT NULL,

    -- Exam Results Summary (cached for quick access)
    total_exams_assigned INT DEFAULT 0,
    total_exams_completed INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,

    -- Metadata
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_school (school_id),
    INDEX idx_exam_code (exam_code),
    INDEX idx_status (status),
    INDEX idx_applying_class (applying_for_class),
    INDEX idx_created_by (created_by),

    -- Foreign Keys
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (converted_to_student_id) REFERENCES students(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Extend cbt_exam_assignments to support external students
ALTER TABLE cbt_exam_assignments
ADD COLUMN IF NOT EXISTS external_student_id INT NULL AFTER student_id,
ADD INDEX IF NOT EXISTS idx_external_student (external_student_id),
ADD FOREIGN KEY IF NOT EXISTS fk_external_student (external_student_id)
    REFERENCES external_students(id) ON DELETE CASCADE;

-- Modify unique constraint to allow either student_id or external_student_id
ALTER TABLE cbt_exam_assignments
DROP INDEX IF EXISTS unique_assignment;

-- Add new constraint that ensures one of student_id or external_student_id is set
ALTER TABLE cbt_exam_assignments
ADD CONSTRAINT chk_student_type CHECK (
    (student_id IS NOT NULL AND external_student_id IS NULL) OR
    (student_id IS NULL AND external_student_id IS NOT NULL)
);

-- Extend cbt_student_attempts to support external students
ALTER TABLE cbt_student_attempts
ADD COLUMN IF NOT EXISTS external_student_id INT NULL AFTER student_id,
ADD INDEX IF NOT EXISTS idx_external_student (external_student_id),
ADD FOREIGN KEY IF NOT EXISTS fk_external_student_attempt (external_student_id)
    REFERENCES external_students(id) ON DELETE CASCADE;

-- Modify unique constraint for attempts
ALTER TABLE cbt_student_attempts
DROP INDEX IF EXISTS unique_student_exam;

-- Add new constraint for attempts
ALTER TABLE cbt_student_attempts
ADD CONSTRAINT chk_attempt_student_type CHECK (
    (student_id IS NOT NULL AND external_student_id IS NULL) OR
    (student_id IS NULL AND external_student_id IS NOT NULL)
);

-- Activity log for external students
CREATE TABLE IF NOT EXISTS external_student_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_student_id INT NOT NULL,
    school_id INT NOT NULL,
    activity_type ENUM('enrollment', 'login', 'exam_assigned', 'exam_started', 'exam_submitted', 'converted', 'deleted') NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_external_student (external_student_id),
    INDEX idx_school (school_id),
    INDEX idx_activity_type (activity_type),

    FOREIGN KEY (external_student_id) REFERENCES external_students(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Entrance exam specific configuration (optional - for future use)
CREATE TABLE IF NOT EXISTS entrance_exam_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    session VARCHAR(50) NOT NULL,

    -- Exam Window
    enrollment_start_date DATE NOT NULL,
    enrollment_end_date DATE NOT NULL,
    exam_start_date DATE NOT NULL,
    exam_end_date DATE NOT NULL,

    -- Pass/Fail Criteria
    minimum_pass_percentage DECIMAL(5,2) DEFAULT 50.00,
    required_subjects TEXT, -- JSON array of required subjects

    -- Configuration
    is_active BOOLEAN DEFAULT TRUE,
    max_applicants INT DEFAULT NULL,
    application_fee DECIMAL(10,2) DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_school (school_id),
    INDEX idx_class (class_name),
    INDEX idx_session (session),

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_entrance_config (school_id, class_name, session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

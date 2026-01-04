-- Migration: Add Subject Enrollment System
-- This enables class-level default subjects and individual student subject enrollment

-- Table 1: Class Subjects (Default/Template subjects for each class)
CREATE TABLE IF NOT EXISTS class_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    is_core BOOLEAN DEFAULT TRUE COMMENT 'Core subjects are mandatory, electives are optional',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_subject (school_id, class_name, subject_name),
    INDEX idx_school_class (school_id, class_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: Student Subject Enrollment (Actual subjects each student is taking)
CREATE TABLE IF NOT EXISTS student_subject_enrollment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    school_id INT NOT NULL,
    session VARCHAR(20) NOT NULL COMMENT 'Academic session (e.g., 2024/2025)',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_subject_session (student_id, subject_name, session),
    INDEX idx_student_session (student_id, session),
    INDEX idx_school_session (school_id, session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modify teacher_classes table to include subject
ALTER TABLE teacher_classes
ADD COLUMN subject VARCHAR(100) DEFAULT NULL COMMENT 'Specific subject teacher teaches in this class',
ADD INDEX idx_class_subject (class_name, subject);

-- Note: subject can be NULL for teachers assigned to entire class (backward compatibility)
-- When subject is specified, teacher only sees students enrolled in that subject

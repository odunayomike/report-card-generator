-- Parents/Guardians Migration
-- This migration adds support for parents/guardians to view their children's analytics

-- Parents/Guardians table
CREATE TABLE IF NOT EXISTS parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent-Student Relationship table (Many-to-Many)
-- A parent can have multiple children, a student can have multiple parents/guardians
CREATE TABLE IF NOT EXISTS parent_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Primary contact for this student',
    added_by_school_id INT NOT NULL COMMENT 'School that created this relationship',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by_school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_student (parent_id, student_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_student_id (student_id),
    INDEX idx_school_id (added_by_school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add parent_email column to students table for easy reference (optional)
ALTER TABLE students
ADD COLUMN parent_email VARCHAR(255) AFTER photo COMMENT 'Quick reference to primary parent email - denormalized for performance',
ADD INDEX idx_student_parent_email (parent_email);

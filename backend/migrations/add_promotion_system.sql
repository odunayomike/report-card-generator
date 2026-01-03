-- Promotion System Migration
-- Adds automatic promotion functionality based on term results

-- 1. Add promotion settings to schools table
ALTER TABLE schools ADD COLUMN promotion_threshold DECIMAL(5,2) DEFAULT 45.00 COMMENT 'Minimum average percentage for promotion';
ALTER TABLE schools ADD COLUMN auto_promotion_enabled TINYINT(1) DEFAULT 1 COMMENT 'Enable automatic promotion';

-- 2. Create class hierarchy table
CREATE TABLE IF NOT EXISTS class_hierarchy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    class_level INT NOT NULL COMMENT 'Numeric level for ordering (1-11)',
    next_class VARCHAR(100) NULL COMMENT 'Next class in progression, NULL for terminal classes',
    class_category ENUM('Primary', 'Junior Secondary', 'Senior Secondary') NOT NULL,
    is_terminal TINYINT(1) DEFAULT 0 COMMENT 'Is this a terminal/final class',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_class (class_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Insert class hierarchy data
INSERT INTO class_hierarchy (class_name, class_level, next_class, class_category, is_terminal) VALUES ('Primary 1', 1, 'Primary 2', 'Primary', 0), ('Primary 2', 2, 'Primary 3', 'Primary', 0), ('Primary 3', 3, 'Primary 4', 'Primary', 0), ('Primary 4', 4, 'Primary 5', 'Primary', 0), ('Primary 5', 5, 'JSS 1', 'Primary', 0), ('JSS 1', 6, 'JSS 2', 'Junior Secondary', 0), ('JSS 2', 7, 'JSS 3', 'Junior Secondary', 0), ('JSS 3', 8, 'SSS 1', 'Junior Secondary', 0), ('SSS 1', 9, 'SSS 2', 'Senior Secondary', 0), ('SSS 2', 10, 'SSS 3', 'Senior Secondary', 0), ('SSS 3', 11, NULL, 'Senior Secondary', 1) ON DUPLICATE KEY UPDATE class_level = VALUES(class_level), next_class = VALUES(next_class), class_category = VALUES(class_category), is_terminal = VALUES(is_terminal);

-- 4. Create student promotion history table
CREATE TABLE IF NOT EXISTS student_promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    student_id INT NOT NULL,
    student_admission_no VARCHAR(50) NOT NULL,
    from_class VARCHAR(100) NOT NULL,
    to_class VARCHAR(100) NULL,
    session VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    average_score DECIMAL(5,2) NULL,
    promotion_status ENUM('promoted', 'retained', 'completed') NOT NULL,
    promotion_reason TEXT NULL,
    report_card_id INT NULL COMMENT 'Report card that triggered promotion',
    promoted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student (student_id),
    INDEX idx_admission (student_admission_no, school_id),
    INDEX idx_session_term (session, term),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (report_card_id) REFERENCES report_cards(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Add promotion status to students table
ALTER TABLE students ADD COLUMN last_promotion_date TIMESTAMP NULL;
ALTER TABLE students ADD COLUMN promotion_status ENUM('active', 'promoted', 'retained', 'graduated', 'left') DEFAULT 'active';

-- 6. Create index for faster class lookups (skip if exists)
-- These will error if they exist, but we'll handle that in the migration script

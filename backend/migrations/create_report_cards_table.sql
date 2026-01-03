CREATE TABLE IF NOT EXISTS report_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    student_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_gender ENUM('Male', 'Female') NOT NULL,
    class VARCHAR(100) NOT NULL,
    session VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    height VARCHAR(50),
    weight VARCHAR(50),
    club_society VARCHAR(255),
    fav_col VARCHAR(100),
    student_photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_school_id (school_id),
    INDEX idx_admission_no (student_admission_no),
    INDEX idx_school_admission (school_id, student_admission_no),
    INDEX idx_session_term (session, term),
    UNIQUE KEY unique_report (school_id, student_admission_no, class, session, term),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE subjects ADD COLUMN report_card_id INT NULL AFTER student_id;
ALTER TABLE subjects ADD INDEX idx_report_card_id (report_card_id);
ALTER TABLE subjects ADD FOREIGN KEY (report_card_id) REFERENCES report_cards(id) ON DELETE CASCADE;

ALTER TABLE attendance ADD COLUMN report_card_id INT NULL AFTER student_id;
ALTER TABLE attendance ADD INDEX idx_report_card_id (report_card_id);
ALTER TABLE attendance ADD FOREIGN KEY (report_card_id) REFERENCES report_cards(id) ON DELETE CASCADE;

ALTER TABLE remarks ADD COLUMN report_card_id INT NULL AFTER student_id;
ALTER TABLE remarks ADD INDEX idx_report_card_id (report_card_id);
ALTER TABLE remarks ADD FOREIGN KEY (report_card_id) REFERENCES report_cards(id) ON DELETE CASCADE;
